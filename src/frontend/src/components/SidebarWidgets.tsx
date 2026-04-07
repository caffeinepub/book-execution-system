import type { GeneratedPlan } from "../utils/planGenerator";

interface SidebarWidgetsProps {
  plan: GeneratedPlan | null;
}

function Widget({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg p-4 mb-3"
      style={{ backgroundColor: "#1B2531", border: "1px solid #2A3644" }}
    >
      <h3
        className="text-xs font-bold uppercase tracking-widest mb-3"
        style={{ color: "#D3B166" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

const COGNITIVE_STRATEGIES = [
  {
    icon: "🔍",
    label: "Pattern Recognition",
    desc: "How to Read Literature Like a Professor",
  },
  { icon: "🎯", label: "Purpose Reading", desc: "How to Read and Why" },
  { icon: "🧠", label: "Memory Science", desc: "Make It Stick" },
  { icon: "🔗", label: "Smart Notes", desc: "How to Take Smart Notes" },
  { icon: "⚡", label: "Focus/Diffuse", desc: "A Mind for Numbers" },
  { icon: "✍️", label: "Writing to Learn", desc: "Writing to Learn" },
  { icon: "📚", label: "Deep Reflection", desc: "The Intellectual Life" },
  { icon: "🎭", label: "Clarity", desc: "The Sense of Style" },
  { icon: "🧬", label: "Brain Processing", desc: "Proust and the Squid" },
];

export default function SidebarWidgets({ plan }: SidebarWidgetsProps) {
  const readingDays =
    plan?.dayWisePlan.filter((d) => d.type === "reading").length ?? 0;
  const reviewDays =
    plan?.dayWisePlan.filter((d) => d.type === "review").length ?? 0;
  const reflectionDays =
    plan?.dayWisePlan.filter((d) => d.type === "reflection").length ?? 0;

  return (
    <div className="flex flex-col gap-0">
      {/* Memory System Widget */}
      <Widget title="🧠 Memory System">
        {plan ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span style={{ color: "#A6B0BC" }}>Spaced Repetition Days</span>
              <span className="font-mono" style={{ color: "#D3B166" }}>
                {plan.memorySystem.spacedRepetitionDays.join(", ")}
              </span>
            </div>
            <div
              className="w-full rounded h-1.5"
              style={{ backgroundColor: "#2A3644" }}
            >
              <div
                className="h-1.5 rounded transition-all"
                style={{
                  width: `${Math.min(100, (readingDays / (plan.totalDays || 1)) * 100)}%`,
                  backgroundColor: "#D3B166",
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-1 mt-2">
              {[
                { label: "Reading", value: readingDays, color: "#D3B166" },
                { label: "Review", value: reviewDays, color: "#4A9EFF" },
                { label: "Reflect", value: reflectionDays, color: "#4AD891" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded p-2 text-center"
                  style={{
                    backgroundColor: "#0F1B2A",
                    border: "1px solid #2A3644",
                  }}
                >
                  <div
                    className="text-sm font-bold"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </div>
                  <div className="text-xs" style={{ color: "#A6B0BC" }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
            <p
              className="text-xs mt-2 leading-relaxed"
              style={{ color: "#A6B0BC" }}
            >
              {plan.memorySystem.activeRecallTechniques[0]}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs" style={{ color: "#A6B0BC" }}>
              Generate a plan to see your personalized memory schedule.
            </p>
            <div className="space-y-1.5">
              {["Day 1", "Day 2", "Day 5", "Day 14", "Day 30"].map((d) => (
                <div
                  key={d}
                  className="flex items-center gap-2 text-xs"
                  style={{ color: "#A6B0BC" }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#2A3644" }}
                  />
                  {d} — Recall session
                </div>
              ))}
            </div>
          </div>
        )}
      </Widget>

      {/* Cognitive Strategies Widget */}
      <Widget title="⚡ Cognitive Systems">
        <div className="space-y-2">
          {COGNITIVE_STRATEGIES.map((s) => (
            <div
              key={s.label}
              data-ocid={`cognitive.item.${s.label.toLowerCase().replace(/\s+/g, "-")}`}
              className="flex items-start gap-2"
            >
              <span className="text-sm">{s.icon}</span>
              <div>
                <p
                  className="text-xs font-semibold"
                  style={{ color: "#E7EDF5" }}
                >
                  {s.label}
                </p>
                <p className="text-xs" style={{ color: "#A6B0BC" }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Widget>

      {/* Day-wise Schedule Preview Widget */}
      <Widget title="📅 Schedule Preview">
        {plan ? (
          <div className="space-y-1.5">
            {plan.dayWisePlan.slice(0, 8).map((day) => (
              <div
                key={day.day}
                data-ocid={`schedule_preview.item.${day.day}`}
                className="flex items-center gap-2 text-xs"
              >
                <div
                  className="w-5 h-5 rounded-sm flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    backgroundColor:
                      day.type === "review"
                        ? "rgba(74,158,255,0.2)"
                        : day.type === "reflection"
                          ? "rgba(74,216,145,0.2)"
                          : "rgba(211,177,102,0.15)",
                    color:
                      day.type === "review"
                        ? "#4A9EFF"
                        : day.type === "reflection"
                          ? "#4AD891"
                          : "#D3B166",
                  }}
                >
                  {day.day}
                </div>
                <span
                  className="truncate flex-1"
                  style={{ color: "#A6B0BC" }}
                  title={day.description}
                >
                  {day.type === "reading"
                    ? (day.chapters[0] ?? "Reading")
                    : day.type === "review"
                      ? "Review session"
                      : "Reflection"}
                </span>
              </div>
            ))}
            {plan.dayWisePlan.length > 8 && (
              <p className="text-xs" style={{ color: "#A6B0BC" }}>
                +{plan.dayWisePlan.length - 8} more days in Schedule tab
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs" style={{ color: "#A6B0BC" }}>
            Your day-by-day reading schedule will appear here after generating a
            plan.
          </p>
        )}
      </Widget>
    </div>
  );
}
