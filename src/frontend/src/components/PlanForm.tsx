import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { lookupBookChapters } from "../utils/bookKnowledgeBase";
import {
  type GeneratedPlan,
  generateBookPlan,
  parseOpenLibraryResponse,
} from "../utils/planGenerator";

const BOOK_TYPES = [
  "Self-Help/Personal Development",
  "Business & Finance",
  "Science & Technology",
  "Philosophy & Psychology",
  "History & Biography",
  "Literature & Fiction",
  "Health & Wellness",
  "Academic/Textbook",
];

interface PlanFormProps {
  onPlanGenerated: (plan: GeneratedPlan) => void;
}

type SubmitPhase = "idle" | "lookup" | "generating";

// The generated backend.ts omits fetchBookChapters from its interface type;
// we extend it locally to retain type safety without modifying read-only files.
interface ActorWithChapters {
  fetchBookChapters(bookName: string): Promise<string>;
  createBookPlan(
    bookName: string,
    bookType: string,
    dailyReadingHours: bigint,
    generatedPlan: string,
  ): Promise<bigint>;
}

export default function PlanForm({ onPlanGenerated }: PlanFormProps) {
  const { actor } = useActor();
  const [bookName, setBookName] = useState("");
  const [bookType, setBookType] = useState("");
  const [dailyHours, setDailyHours] = useState("");
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>("idle");

  const isGenerating = submitPhase !== "idle";

  const buttonLabel = () => {
    if (submitPhase === "lookup") {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Looking up chapters...
        </>
      );
    }
    if (submitPhase === "generating") {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      );
    }
    return "Execute Learning Plan";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookName.trim()) {
      toast.error("Please enter a book name");
      return;
    }
    if (!bookType) {
      toast.error("Please select a book type");
      return;
    }
    const hours = Number.parseFloat(dailyHours);
    if (Number.isNaN(hours) || hours <= 0) {
      toast.error("Please enter valid daily reading hours");
      return;
    }

    setSubmitPhase("generating");
    let resolvedChapters: string[] | undefined;

    // Step 1: Try knowledge base (instant, no network)
    const kbChapters = lookupBookChapters(bookName.trim());
    if (kbChapters && kbChapters.length > 0) {
      resolvedChapters = kbChapters;
    } else {
      // Step 2: Try backend / Open Library API
      setSubmitPhase("lookup");
      try {
        if (actor) {
          const extActor = actor as unknown as ActorWithChapters;
          const apiResponse = await extActor.fetchBookChapters(bookName.trim());
          const apiChapters = parseOpenLibraryResponse(apiResponse);
          if (apiChapters.length > 0) {
            resolvedChapters = apiChapters;
          }
        }
      } catch (err) {
        console.warn("API chapter lookup failed, using generic template", err);
      }
      setSubmitPhase("generating");
    }

    try {
      const plan = generateBookPlan(
        bookName.trim(),
        bookType,
        hours,
        resolvedChapters,
      );

      if (actor) {
        const planJson = JSON.stringify(plan);
        const hoursAsBigint = BigInt(Math.round(hours * 10));
        await actor.createBookPlan(
          bookName.trim(),
          bookType,
          hoursAsBigint,
          planJson,
        );
      }

      onPlanGenerated(plan);

      const sourceLabel = resolvedChapters
        ? `${resolvedChapters.length} chapters found`
        : "generic template";
      toast.success(`Learning plan generated! (${sourceLabel})`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save plan. The plan is still shown.");
      const plan = generateBookPlan(
        bookName.trim(),
        bookType,
        hours,
        resolvedChapters,
      );
      onPlanGenerated(plan);
    } finally {
      setSubmitPhase("idle");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="bookName"
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "#A6B0BC" }}
        >
          Book Name
        </Label>
        <Input
          id="bookName"
          data-ocid="plan_form.input"
          placeholder="e.g. The Gulag Archipelago"
          value={bookName}
          onChange={(e) => setBookName(e.target.value)}
          disabled={isGenerating}
          className="text-sm"
          style={{
            backgroundColor: "#0F1B2A",
            borderColor: "#2A3644",
            color: "#E7EDF5",
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="bookType"
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "#A6B0BC" }}
        >
          Book Type
        </Label>
        <Select
          value={bookType}
          onValueChange={setBookType}
          disabled={isGenerating}
        >
          <SelectTrigger
            id="bookType"
            data-ocid="plan_form.select"
            className="text-sm"
            style={{
              backgroundColor: "#0F1B2A",
              borderColor: "#2A3644",
              color: bookType ? "#E7EDF5" : "#A6B0BC",
            }}
          >
            <SelectValue placeholder="Select category..." />
          </SelectTrigger>
          <SelectContent
            style={{ backgroundColor: "#1B2531", borderColor: "#2A3644" }}
          >
            {BOOK_TYPES.map((type) => (
              <SelectItem
                key={type}
                value={type}
                className="text-sm cursor-pointer"
                style={{ color: "#E7EDF5" }}
              >
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="dailyHours"
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "#A6B0BC" }}
        >
          Daily Reading Hours
        </Label>
        <Input
          id="dailyHours"
          data-ocid="plan_form.hours_input"
          type="number"
          placeholder="e.g. 1.5"
          min="0.25"
          max="12"
          step="0.25"
          value={dailyHours}
          onChange={(e) => setDailyHours(e.target.value)}
          disabled={isGenerating}
          className="text-sm"
          style={{
            backgroundColor: "#0F1B2A",
            borderColor: "#2A3644",
            color: "#E7EDF5",
          }}
        />
      </div>

      <Button
        type="submit"
        data-ocid="plan_form.submit_button"
        disabled={isGenerating}
        className="w-full font-bold text-sm tracking-widest uppercase mt-2 transition-opacity"
        style={{
          backgroundColor: "#D3B166",
          color: "#0A111A",
        }}
      >
        {buttonLabel()}
      </Button>
    </form>
  );
}
