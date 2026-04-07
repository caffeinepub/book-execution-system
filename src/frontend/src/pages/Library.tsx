import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Calendar, Clock, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { BookPlan } from "../backend.d";
import { useActor } from "../hooks/useActor";
import type { GeneratedPlan } from "../utils/planGenerator";

interface LibraryProps {
  onViewPlan: (plan: GeneratedPlan) => void;
}

export default function Library({ onViewPlan }: LibraryProps) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const { data: plans = [], isLoading } = useQuery<BookPlan[]>({
    queryKey: ["plans"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPlans();
    },
    enabled: !!actor && !isFetching,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deletePlan(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plan deleted");
    },
    onError: () => toast.error("Failed to delete plan"),
    onSettled: () => setDeletingId(null),
  });

  const handleDelete = (id: bigint) => {
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  const handleView = (plan: BookPlan) => {
    try {
      const parsed = JSON.parse(plan.generatedPlan) as GeneratedPlan;
      onViewPlan(parsed);
    } catch {
      toast.error("Could not load plan data");
    }
  };

  const formatDate = (timestamp: bigint): string => {
    const ms = Number(timestamp) / 1_000_000;
    return new Date(ms).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pt-10 pb-8"
      >
        <h1
          className="text-4xl font-bold mb-3 tracking-tight"
          style={{
            fontFamily: "Bricolage Grotesque, sans-serif",
            color: "#EAEAEA",
          }}
        >
          My Reading Plans
        </h1>
        <p className="text-base" style={{ color: "#B7B7B7" }}>
          All your saved book execution plans, ready to resume.
        </p>
      </motion.div>

      {isLoading ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          data-ocid="library.loading_state"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-xl p-5"
              style={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #343434",
              }}
            >
              <Skeleton
                className="h-5 w-3/4 mb-2"
                style={{ backgroundColor: "#242424" }}
              />
              <Skeleton
                className="h-3 w-1/2 mb-4"
                style={{ backgroundColor: "#242424" }}
              />
              <div className="flex justify-between">
                <Skeleton
                  className="h-3 w-1/4"
                  style={{ backgroundColor: "#242424" }}
                />
                <Skeleton
                  className="h-3 w-1/4"
                  style={{ backgroundColor: "#242424" }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 rounded-xl"
          style={{ backgroundColor: "#1A1A1A", border: "1px dashed #343434" }}
          data-ocid="library.empty_state"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-5 text-3xl"
            style={{ backgroundColor: "#242424", border: "1px solid #343434" }}
          >
            📚
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: "#EAEAEA" }}>
            No Plans Yet
          </h3>
          <p className="text-sm" style={{ color: "#888" }}>
            Head to the Dashboard to generate your first elite reading plan.
          </p>
        </motion.div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          data-ocid="library.list"
        >
          {plans.map((plan, idx) => (
            <motion.article
              key={plan.id.toString()}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.35 }}
              data-ocid={`library.item.${idx + 1}`}
              className="rounded-xl p-5 flex flex-col justify-between"
              style={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #343434",
              }}
            >
              <div>
                <h3
                  className="text-sm font-bold mb-1"
                  style={{ color: "#EAEAEA" }}
                >
                  {plan.bookName}
                </h3>
                <p className="text-xs mb-4" style={{ color: "#888" }}>
                  {plan.bookType}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <div
                    className="flex items-center gap-1 text-xs rounded-full px-2.5 py-1"
                    style={{
                      backgroundColor: "#242424",
                      color: "#B7B7B7",
                      border: "1px solid #343434",
                    }}
                  >
                    <Clock className="w-3 h-3" style={{ color: "#C8A24A" }} />
                    {Number(plan.dailyReadingHours) / 10}h/day
                  </div>
                  <div
                    className="flex items-center gap-1 text-xs rounded-full px-2.5 py-1"
                    style={{
                      backgroundColor: "#242424",
                      color: "#B7B7B7",
                      border: "1px solid #343434",
                    }}
                  >
                    <Calendar
                      className="w-3 h-3"
                      style={{ color: "#C8A24A" }}
                    />
                    {formatDate(plan.timestamp)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 h-9 text-xs font-bold"
                  data-ocid={`library.item.${idx + 1}`}
                  style={{
                    backgroundColor: "#C8A24A",
                    color: "#151515",
                    border: "none",
                  }}
                  onClick={() => handleView(plan)}
                >
                  <BookOpen className="w-3 h-3 mr-1.5" />
                  View Plan
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 w-9 p-0 shrink-0"
                  data-ocid={`library.delete_button.${idx + 1}`}
                  disabled={deletingId === plan.id}
                  style={{
                    backgroundColor: "transparent",
                    borderColor: "#343434",
                    color: "#888",
                  }}
                  onClick={() => handleDelete(plan.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
