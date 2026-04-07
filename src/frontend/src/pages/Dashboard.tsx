import { motion } from "motion/react";
import { useEffect, useState } from "react";
import PlanDisplay from "../components/PlanDisplay";
import PlanFormElite from "../components/PlanFormElite";
import type { GeneratedPlan } from "../utils/planGenerator";

interface DashboardProps {
  initialPlan?: GeneratedPlan | null;
  onNavigateToPlans?: () => void;
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function WeekScheduleCard({
  day,
  plan,
  isToday,
  dayIndex,
}: {
  day: string;
  plan: GeneratedPlan | null;
  isToday: boolean;
  dayIndex: number;
}) {
  const dayPlan = plan?.dayWisePlan[dayIndex];
  const chapter = dayPlan?.chapters[0] ?? null;
  const shortChapter = chapter
    ? (chapter.split("—").pop()?.trim() ?? chapter)
    : null;

  return (
    <div
      className="rounded-lg p-3 flex flex-col gap-2 min-h-[120px] transition-all"
      style={{
        backgroundColor: isToday ? "rgba(200,162,74,0.08)" : "#1A1A1A",
        border: isToday
          ? "1px solid rgba(200,162,74,0.4)"
          : "1px solid #343434",
        boxShadow: isToday ? "0 0 16px rgba(200,162,74,0.1)" : "none",
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: isToday ? "#C8A24A" : "#888888" }}
        >
          {day}
        </span>
        {isToday && (
          <span
            className="text-xs px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
            style={{
              backgroundColor: "rgba(200,162,74,0.2)",
              color: "#C8A24A",
            }}
          >
            Today
          </span>
        )}
      </div>
      {dayPlan ? (
        <>
          <p
            className="text-xs leading-relaxed flex-1"
            style={{ color: "#B7B7B7" }}
          >
            {shortChapter
              ? shortChapter.slice(0, 55) +
                (shortChapter.length > 55 ? "…" : "")
              : "Review Day"}
          </p>
          <div className="flex items-center justify-between">
            <span
              className="text-xs px-1.5 py-0.5 rounded uppercase font-bold tracking-wider"
              style={{
                backgroundColor:
                  dayPlan.type === "review"
                    ? "rgba(74,158,255,0.1)"
                    : dayPlan.type === "reflection"
                      ? "rgba(74,216,145,0.1)"
                      : "rgba(200,162,74,0.1)",
                color:
                  dayPlan.type === "review"
                    ? "#4A9EFF"
                    : dayPlan.type === "reflection"
                      ? "#4AD891"
                      : "#C8A24A",
              }}
            >
              {dayPlan.type}
            </span>
            <input
              type="checkbox"
              className="w-3.5 h-3.5 rounded"
              style={{ accentColor: "#C8A24A" }}
              aria-label={`Mark ${day} as complete`}
            />
          </div>
        </>
      ) : (
        <p className="text-xs" style={{ color: "#555" }}>
          No plan yet
        </p>
      )}
    </div>
  );
}

export default function Dashboard({ initialPlan }: DashboardProps) {
  const [activePlan, setActivePlan] = useState<GeneratedPlan | null>(
    initialPlan ?? null,
  );
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // 0=Mon

  useEffect(() => {
    if (initialPlan) setActivePlan(initialPlan);
  }, [initialPlan]);

  const progressPercent = activePlan
    ? Math.round(
        (activePlan.dayWisePlan.filter((d) => d.type === "reading").length /
          Math.max(1, activePlan.totalDays)) *
          100,
      )
    : 0;

  return (
    <div className="max-w-[1200px] mx-auto px-6 pb-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="text-center pt-10 pb-8"
      >
        <h1
          className="text-4xl font-bold mb-3 tracking-tight"
          style={{
            fontFamily: "Bricolage Grotesque, sans-serif",
            color: "#EAEAEA",
          }}
        >
          Your Elite Reading Dashboard
        </h1>
        <p className="text-base" style={{ color: "#B7B7B7" }}>
          Master Your Books, Optimize Your Learning.
        </p>
      </motion.div>

      {/* Generate Plan Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
        className="rounded-xl p-6 mb-6"
        style={{ backgroundColor: "#1A1A1A", border: "1px solid #343434" }}
      >
        <h2
          className="text-xs font-bold uppercase tracking-widest mb-5"
          style={{ color: "#C8A24A" }}
        >
          Generate Your Reading Plan
        </h2>
        <PlanFormElite onPlanGenerated={setActivePlan} />
      </motion.div>

      {/* Active Plan Section */}
      {activePlan && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rounded-xl p-5 mb-6"
          style={{ backgroundColor: "#1A1A1A", border: "1px solid #343434" }}
          data-ocid="active_plan.card"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color: "#C8A24A" }}
              >
                Active Plan
              </p>
              <h3 className="text-lg font-bold" style={{ color: "#EAEAEA" }}>
                {activePlan.bookName}
              </h3>
              <p className="text-xs" style={{ color: "#B7B7B7" }}>
                {activePlan.bookType} · {activePlan.totalChapters} chapters ·{" "}
                {activePlan.dailyHours}h/day
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: "#C8A24A" }}>
                {activePlan.totalDays}
              </p>
              <p className="text-xs" style={{ color: "#888" }}>
                Total days
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mb-2">
            <div
              className="flex justify-between text-xs mb-1.5"
              style={{ color: "#888" }}
            >
              <span>Reading Progress</span>
              <span style={{ color: "#C8A24A" }}>{progressPercent}%</span>
            </div>
            <div
              className="h-1.5 rounded-full w-full"
              style={{ backgroundColor: "#2a2a2a" }}
            >
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: `${progressPercent}%`,
                  background: "linear-gradient(90deg, #C8A24A, #D9B75A)",
                }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Week Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "#C8A24A" }}
          >
            This Week&apos;s Schedule
          </h2>
          {activePlan && (
            <span className="text-xs" style={{ color: "#888" }}>
              Day 1–7 of {activePlan.totalDays}
            </span>
          )}
        </div>
        <div className="grid grid-cols-7 gap-3">
          {DAYS_OF_WEEK.map((day, i) => (
            <WeekScheduleCard
              key={day}
              day={day}
              plan={activePlan}
              isToday={i === todayIndex}
              dayIndex={i}
            />
          ))}
        </div>
      </motion.div>

      {/* Lower split: Plan details + Sidebar */}
      {activePlan ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="grid grid-cols-3 gap-6"
        >
          {/* Plan Display — 2 columns */}
          <div className="col-span-2" data-ocid="plan_display.panel">
            <PlanDisplay plan={activePlan} />
          </div>

          {/* Sidebar — 1 column */}
          <div className="col-span-1 space-y-4">
            <div
              className="rounded-xl p-5"
              style={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #343434",
              }}
            >
              <h3
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: "#C8A24A" }}
              >
                Methodology
              </h3>
              <div className="space-y-3">
                {[
                  {
                    icon: "🔍",
                    label: "Pattern Reading",
                    src: "How to Read Like a Professor",
                  },
                  { icon: "🧠", label: "Memory Science", src: "Make It Stick" },
                  {
                    icon: "📝",
                    label: "Smart Notes",
                    src: "How to Take Smart Notes",
                  },
                  {
                    icon: "⚡",
                    label: "Focus/Diffuse",
                    src: "A Mind for Numbers",
                  },
                  {
                    icon: "✍️",
                    label: "Writing to Learn",
                    src: "Writing to Learn",
                  },
                ].map((m) => (
                  <div key={m.label} className="flex items-start gap-2.5">
                    <span className="text-base">{m.icon}</span>
                    <div>
                      <p
                        className="text-xs font-semibold"
                        style={{ color: "#EAEAEA" }}
                      >
                        {m.label}
                      </p>
                      <p className="text-xs" style={{ color: "#888" }}>
                        {m.src}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-xl p-5"
              style={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #343434",
              }}
            >
              <h3
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: "#C8A24A" }}
              >
                Plan Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Reading",
                    value: activePlan.dayWisePlan.filter(
                      (d) => d.type === "reading",
                    ).length,
                    color: "#C8A24A",
                  },
                  {
                    label: "Review",
                    value: activePlan.dayWisePlan.filter(
                      (d) => d.type === "review",
                    ).length,
                    color: "#4A9EFF",
                  },
                  {
                    label: "Reflect",
                    value: activePlan.dayWisePlan.filter(
                      (d) => d.type === "reflection",
                    ).length,
                    color: "#4AD891",
                  },
                  {
                    label: "Chapters",
                    value: activePlan.totalChapters,
                    color: "#C8A24A",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg p-3 text-center"
                    style={{
                      backgroundColor: "#242424",
                      border: "1px solid #343434",
                    }}
                  >
                    <p
                      className="text-xl font-bold"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-xs" style={{ color: "#888" }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-xl p-5"
              style={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #343434",
              }}
            >
              <h3
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: "#C8A24A" }}
              >
                Recall Schedule
              </h3>
              <div className="space-y-1.5">
                {activePlan.memorySystem.spacedRepetitionDays.map((d) => (
                  <div key={d} className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: "#C8A24A" }}
                    />
                    <span className="text-xs" style={{ color: "#B7B7B7" }}>
                      Day {d} — Retrieval session
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="grid grid-cols-3 gap-6"
        >
          <div
            className="col-span-2 rounded-xl flex flex-col items-center justify-center py-16"
            style={{ backgroundColor: "#1A1A1A", border: "1px dashed #343434" }}
            data-ocid="plan_display.empty_state"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-2xl"
              style={{
                backgroundColor: "#242424",
                border: "1px solid #343434",
              }}
            >
              📘
            </div>
            <h3
              className="text-base font-semibold mb-2"
              style={{ color: "#EAEAEA" }}
            >
              No Plan Generated Yet
            </h3>
            <p
              className="text-sm text-center max-w-xs"
              style={{ color: "#888" }}
            >
              Fill in the form above to generate your comprehensive elite
              learning system.
            </p>
            <div
              className="mt-6 rounded-lg p-4 max-w-xs w-full"
              style={{
                backgroundColor: "#242424",
                border: "1px solid #343434",
              }}
            >
              <p
                className="text-xs font-semibold mb-3 uppercase tracking-wider"
                style={{ color: "#C8A24A" }}
              >
                What You&apos;ll Get
              </p>
              <ul className="space-y-1.5">
                {[
                  "Book DNA Analysis",
                  "Chapter-by-Chapter System",
                  "Day-wise Execution Plan",
                  "Memory & Spaced Repetition",
                  "Smart Notes Protocol",
                  "Deep Reflection Prompts",
                ].map((f) => (
                  <li
                    key={f}
                    className="text-xs flex gap-2"
                    style={{ color: "#888" }}
                  >
                    <span style={{ color: "#C8A24A" }}>›</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-span-1 space-y-4">
            <div
              className="rounded-xl p-5"
              style={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #343434",
              }}
            >
              <h3
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: "#C8A24A" }}
              >
                9 Core Systems
              </h3>
              <div className="space-y-2.5">
                {[
                  "How to Read Literature Like a Professor",
                  "How to Read and Why",
                  "The Intellectual Life",
                  "How to Take Smart Notes",
                  "Make It Stick",
                  "A Mind for Numbers",
                  "Writing to Learn",
                  "The Sense of Style",
                  "Proust and the Squid",
                ].map((book, i) => (
                  <div key={book} className="flex items-start gap-2">
                    <span
                      className="text-xs font-bold shrink-0"
                      style={{ color: "#C8A24A" }}
                    >
                      {i + 1}.
                    </span>
                    <span className="text-xs" style={{ color: "#B7B7B7" }}>
                      {book}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-xl p-5"
              style={{
                backgroundColor: "rgba(200,162,74,0.05)",
                border: "1px solid rgba(200,162,74,0.25)",
              }}
            >
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: "#C8A24A" }}
              >
                Pro Tip
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#B7B7B7" }}
              >
                Start with a non-fiction book you&apos;ve been meaning to read.
                The system works for any genre but shines with analytical texts.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
