import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, X, Zap } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import {
  BOOK_KNOWLEDGE_BASE,
  lookupBookChapters,
  parseBookFileContent,
} from "../utils/bookKnowledgeBase";
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

const DAILY_TIMES = [
  { label: "15 minutes", value: "0.25" },
  { label: "30 minutes", value: "0.5" },
  { label: "45 minutes", value: "0.75" },
  { label: "1 hour", value: "1" },
  { label: "1.5 hours", value: "1.5" },
  { label: "2 hours", value: "2" },
  { label: "3 hours", value: "3" },
];

interface ActorWithChapters {
  fetchBookChapters(bookName: string): Promise<string>;
  createBookPlan(
    bookName: string,
    bookType: string,
    dailyReadingHours: bigint,
    generatedPlan: string,
  ): Promise<bigint>;
}

interface PlanFormEliteProps {
  onPlanGenerated: (plan: GeneratedPlan) => void;
}

type SubmitPhase = "idle" | "lookup" | "generating";

export default function PlanFormElite({ onPlanGenerated }: PlanFormEliteProps) {
  const { actor } = useActor();
  const [bookName, setBookName] = useState("");
  const [bookType, setBookType] = useState("");
  const [dailyTime, setDailyTime] = useState("");
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>("idle");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileContent, setUploadedFileContent] = useState<string | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allBookTitles = useMemo(
    () =>
      Object.keys(BOOK_KNOWLEDGE_BASE).map(
        (key) => key.charAt(0).toUpperCase() + key.slice(1),
      ),
    [],
  );

  const suggestions = useMemo(() => {
    if (bookName.length < 2) return [];
    const q = bookName.toLowerCase();
    return allBookTitles.filter((t) => t.toLowerCase().includes(q)).slice(0, 8);
  }, [bookName, allBookTitles]);

  const handleSuggestionClick = (title: string) => {
    setBookName(title);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && activeSuggestion >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[activeSuggestion]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Try reading as text first; works for .txt, .md, .epub (partial), .pdf (partial)
    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = ev.target?.result;
      let content: string | null = null;

      if (typeof raw === "string") {
        content = raw;
      } else if (raw instanceof ArrayBuffer) {
        // Decode binary as UTF-8 — works for most text-based formats
        try {
          content = new TextDecoder("utf-8", { fatal: false }).decode(raw);
        } catch {
          content = null;
        }
      }

      if (content && content.trim().length > 0) {
        setUploadedFile(file);
        setUploadedFileContent(content);
        toast.success(
          `File "${file.name}" loaded — will extract chapters automatically`,
        );
      } else {
        toast.error(
          `Could not read "${file.name}" — try saving it as a .txt file`,
        );
      }
    };
    reader.onerror = () => {
      toast.error(
        `Failed to read "${file.name}" — try saving it as a .txt file`,
      );
    };
    // Read as ArrayBuffer so we can handle any file type
    reader.readAsArrayBuffer(file);
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setUploadedFileContent(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isGenerating = submitPhase !== "idle";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);

    if (!bookName.trim()) {
      toast.error("Please enter a book name");
      return;
    }
    if (!bookType) {
      toast.error("Please select a book type");
      return;
    }
    if (!dailyTime) {
      toast.error("Please select your daily reading time");
      return;
    }

    const hours = Number.parseFloat(dailyTime);
    setSubmitPhase("generating");
    let resolvedChapters: string[] | undefined;
    let chapterSource = "genre template";

    // Step 1: Knowledge base lookup
    const kbChapters = lookupBookChapters(bookName.trim());
    if (kbChapters && kbChapters.length > 0) {
      resolvedChapters = kbChapters;
      chapterSource = `${kbChapters.length} chapters from knowledge base`;
    } else {
      // Step 2: Open Library API
      setSubmitPhase("lookup");
      try {
        if (actor) {
          const extActor = actor as unknown as ActorWithChapters;
          const apiResponse = await extActor.fetchBookChapters(bookName.trim());
          const apiChapters = parseOpenLibraryResponse(apiResponse);
          if (apiChapters.length > 0) {
            resolvedChapters = apiChapters;
            chapterSource = `${apiChapters.length} chapters from Open Library`;
          }
        }
      } catch (err) {
        console.warn("API chapter lookup failed", err);
      }
      setSubmitPhase("generating");

      // Step 3: Uploaded file parsing
      if (!resolvedChapters && uploadedFileContent) {
        const fileChapters = parseBookFileContent(uploadedFileContent);
        if (fileChapters.length >= 3) {
          resolvedChapters = fileChapters;
          chapterSource = `${fileChapters.length} chapters extracted from uploaded file`;
        } else if (fileChapters.length > 0) {
          // Partial extraction — use what we have with a note
          resolvedChapters = fileChapters;
          chapterSource = `${fileChapters.length} chapters from uploaded file (partial)`;
        } else {
          toast.warning(
            "Could not extract chapters from the uploaded file — using genre template",
          );
        }
      }
      // Step 4: Genre template (resolvedChapters stays undefined → generateBookPlan uses template)
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
        await (actor as unknown as ActorWithChapters).createBookPlan(
          bookName.trim(),
          bookType,
          hoursAsBigint,
          planJson,
        );
      }

      onPlanGenerated(plan);
      toast.success(`Elite plan generated! (${chapterSource})`);
    } catch (err) {
      console.error(err);
      const plan = generateBookPlan(
        bookName.trim(),
        bookType,
        hours,
        resolvedChapters,
      );
      onPlanGenerated(plan);
      toast.success("Plan generated!");
    } finally {
      setSubmitPhase("idle");
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Book Name */}
        <div className="md:col-span-1 relative">
          <Label
            htmlFor="eliteBookName"
            className="text-xs font-semibold uppercase tracking-wider block mb-2"
            style={{ color: "#888888" }}
          >
            Select Book
          </Label>
          <div className="relative">
            <input
              ref={inputRef}
              id="eliteBookName"
              data-ocid="plan_form.input"
              type="text"
              autoComplete="off"
              placeholder="Book title..."
              value={bookName}
              onChange={(e) => {
                setBookName(e.target.value);
                setShowSuggestions(true);
                setActiveSuggestion(-1);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              className="w-full h-10 px-3 text-sm rounded-lg"
              style={{
                backgroundColor: "#242424",
                border: "1px solid #343434",
                color: "#EAEAEA",
                outline: "none",
              }}
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul
                className="absolute z-50 w-full mt-1 rounded-lg overflow-hidden"
                style={{
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #343434",
                  maxHeight: "220px",
                  overflowY: "auto",
                }}
              >
                {suggestions.map((s, i) => (
                  <li
                    key={s}
                    onMouseDown={() => handleSuggestionClick(s)}
                    className="px-3 py-2 text-sm cursor-pointer"
                    style={{
                      color: "#EAEAEA",
                      backgroundColor:
                        i === activeSuggestion ? "#2A2A2A" : "transparent",
                    }}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Book Type */}
        <div className="md:col-span-1">
          <Label
            htmlFor="eliteBookType"
            className="text-xs font-semibold uppercase tracking-wider block mb-2"
            style={{ color: "#888888" }}
          >
            Book Type
          </Label>
          <Select
            value={bookType}
            onValueChange={setBookType}
            disabled={isGenerating}
          >
            <SelectTrigger
              id="eliteBookType"
              data-ocid="plan_form.select"
              className="h-10 text-sm rounded-lg w-full"
              style={{
                backgroundColor: "#242424",
                border: "1px solid #343434",
                color: bookType ? "#EAEAEA" : "#888888",
              }}
            >
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent
              style={{ backgroundColor: "#1A1A1A", borderColor: "#343434" }}
            >
              {BOOK_TYPES.map((type) => (
                <SelectItem
                  key={type}
                  value={type}
                  className="text-sm cursor-pointer"
                  style={{ color: "#EAEAEA" }}
                >
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Daily Reading Time */}
        <div className="md:col-span-1">
          <Label
            htmlFor="eliteDailyTime"
            className="text-xs font-semibold uppercase tracking-wider block mb-2"
            style={{ color: "#888888" }}
          >
            Daily Reading Time
          </Label>
          <Select
            value={dailyTime}
            onValueChange={setDailyTime}
            disabled={isGenerating}
          >
            <SelectTrigger
              id="eliteDailyTime"
              data-ocid="plan_form.hours_input"
              className="h-10 text-sm rounded-lg w-full"
              style={{
                backgroundColor: "#242424",
                border: "1px solid #343434",
                color: dailyTime ? "#EAEAEA" : "#888888",
              }}
            >
              <SelectValue placeholder="Select time..." />
            </SelectTrigger>
            <SelectContent
              style={{ backgroundColor: "#1A1A1A", borderColor: "#343434" }}
            >
              {DAILY_TIMES.map((t) => (
                <SelectItem
                  key={t.value}
                  value={t.value}
                  className="text-sm cursor-pointer"
                  style={{ color: "#EAEAEA" }}
                >
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Submit */}
        <div className="md:col-span-1">
          <button
            type="submit"
            data-ocid="plan_form.submit_button"
            disabled={isGenerating}
            className="btn-gold w-full h-10 rounded-lg text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {submitPhase === "lookup" ? "Looking up..." : "Generating..."}
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate Elite Plan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Book File Upload — fallback for books not in knowledge base */}
      <div className="mt-4">
        <div
          className="rounded-lg px-4 py-3 flex items-center gap-3"
          style={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A" }}
        >
          <Upload
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "#888888" }}
          />
          <div className="flex-1 min-w-0">
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "#888888" }}
            >
              Book File (Optional)
            </span>
            <p className="text-xs mt-0.5" style={{ color: "#555555" }}>
              Upload any file of the book or its table of contents — used to
              extract chapters when the book isn't in the knowledge base.
            </p>
          </div>
          {uploadedFile ? (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className="text-xs truncate max-w-32"
                style={{ color: "#C9A227" }}
              >
                {uploadedFile.name}
              </span>
              <button
                type="button"
                onClick={handleClearFile}
                className="p-1 rounded hover:bg-white/10 transition"
                title="Remove file"
              >
                <X className="w-3.5 h-3.5" style={{ color: "#888888" }} />
              </button>
            </div>
          ) : (
            <label
              htmlFor="bookFileUpload"
              className="flex-shrink-0 cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-md transition"
              style={{
                backgroundColor: "#242424",
                border: "1px solid #343434",
                color: "#EAEAEA",
              }}
            >
              Browse
              <input
                ref={fileInputRef}
                id="bookFileUpload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={isGenerating}
              />
            </label>
          )}
        </div>
      </div>
    </form>
  );
}
