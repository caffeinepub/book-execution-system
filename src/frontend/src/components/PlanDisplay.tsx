import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Brain,
  Calendar,
  FileText,
  Layers,
  RotateCcw,
} from "lucide-react";
import type { ChapterSystem, GeneratedPlan } from "../utils/planGenerator";

interface PlanDisplayProps {
  plan: GeneratedPlan;
}

function SectionCard({
  title,
  children,
  gold,
}: {
  title: string;
  children: React.ReactNode;
  gold?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-5 mb-4"
      style={{
        backgroundColor: "#242424",
        border: gold ? "1px solid rgba(200,162,74,0.35)" : "1px solid #343434",
      }}
    >
      <h3
        className="text-xs font-bold uppercase tracking-widest mb-3"
        style={{ color: gold ? "#C8A24A" : "#888888" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function ChapterCard({
  chapter,
  index,
}: { chapter: ChapterSystem; index: number }) {
  return (
    <div
      className="rounded-xl p-4 mb-3"
      data-ocid={`chapters.item.${index + 1}`}
      style={{ backgroundColor: "#242424", border: "1px solid #343434" }}
    >
      <div className="flex items-start gap-3 mb-3">
        <span
          className="text-xs font-bold rounded px-2 py-0.5 shrink-0 mt-0.5"
          style={{ backgroundColor: "#C8A24A", color: "#151515" }}
        >
          Ch {index + 1}
        </span>
        <h4
          className="text-sm font-semibold leading-snug"
          style={{ color: "#EAEAEA" }}
        >
          {chapter.title}
        </h4>
      </div>

      <p className="text-xs mb-3 leading-relaxed" style={{ color: "#B7B7B7" }}>
        {chapter.purpose}
      </p>

      <div className="grid grid-cols-1 gap-2 text-xs">
        {[
          { icon: "🔍", label: "Pattern", value: chapter.patternRecognition },
          { icon: "🎯", label: "Purpose Q", value: chapter.purposeReading },
          { icon: "🧠", label: "Memory", value: chapter.memoryEncoding },
          { icon: "✍️", label: "Write", value: chapter.writingToLearn },
        ].map((item) => (
          <div key={item.label} className="flex gap-2">
            <span>{item.icon}</span>
            <div>
              <span className="font-semibold" style={{ color: "#EAEAEA" }}>
                {item.label}:{" "}
              </span>
              <span style={{ color: "#B7B7B7" }}>{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3" style={{ borderTop: "1px solid #343434" }}>
        <p
          className="text-xs font-semibold mb-1.5"
          style={{ color: "#C8A24A" }}
        >
          Key Takeaways
        </p>
        <ul className="space-y-1">
          {chapter.keyTakeaways.map((t) => (
            <li
              key={t}
              className="text-xs flex gap-2"
              style={{ color: "#B7B7B7" }}
            >
              <span style={{ color: "#C8A24A" }}>›</span> {t}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 pt-3" style={{ borderTop: "1px solid #343434" }}>
        <p
          className="text-xs font-semibold mb-1.5"
          style={{ color: "#C8A24A" }}
        >
          Recall Questions
        </p>
        <ol className="space-y-1">
          {chapter.activeRecallQuestions.map((q, qi) => (
            <li
              key={q}
              className="text-xs flex gap-2"
              style={{ color: "#B7B7B7" }}
            >
              <span className="shrink-0" style={{ color: "#C8A24A" }}>
                {qi + 1}.
              </span>{" "}
              {q}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default function PlanDisplay({ plan }: PlanDisplayProps) {
  return (
    <div
      className="rounded-xl flex flex-col"
      style={{ backgroundColor: "#1A1A1A", border: "1px solid #343434" }}
    >
      {/* Header */}
      <div className="p-5 border-b" style={{ borderColor: "#343434" }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold" style={{ color: "#EAEAEA" }}>
              {plan.bookName}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#888" }}>
              {plan.bookType}
            </p>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap justify-end">
            <Badge
              className="text-xs"
              style={{
                backgroundColor: "#C8A24A",
                color: "#151515",
                border: "none",
              }}
            >
              {plan.totalDays} days
            </Badge>
            <Badge
              className="text-xs"
              style={{
                backgroundColor: "transparent",
                color: "#888",
                border: "1px solid #343434",
              }}
            >
              {plan.totalChapters} chapters
            </Badge>
            <Badge
              className="text-xs"
              style={{
                backgroundColor: "transparent",
                color: "#888",
                border: "1px solid #343434",
              }}
            >
              {plan.dailyHours}h/day
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="flex flex-col flex-1">
        <div className="px-5 pt-4">
          <TabsList
            className="w-full justify-start gap-1 h-auto p-1"
            style={{ backgroundColor: "#242424", border: "1px solid #343434" }}
          >
            {[
              {
                value: "overview",
                label: "Overview",
                icon: <Layers className="w-3 h-3" />,
              },
              {
                value: "chapters",
                label: "Chapters",
                icon: <BookOpen className="w-3 h-3" />,
              },
              {
                value: "memory",
                label: "Memory",
                icon: <Brain className="w-3 h-3" />,
              },
              {
                value: "notes",
                label: "Notes",
                icon: <FileText className="w-3 h-3" />,
              },
              {
                value: "schedule",
                label: "Schedule",
                icon: <Calendar className="w-3 h-3" />,
              },
              {
                value: "integration",
                label: "Integration",
                icon: <RotateCcw className="w-3 h-3" />,
              },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                data-ocid={`plan_display.${tab.value}.tab`}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors"
                style={{ color: "#888" }}
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <ScrollArea className="flex-1 px-5 pb-5 pt-4">
          {/* OVERVIEW */}
          <TabsContent value="overview" className="mt-0">
            <SectionCard title="📘 Book DNA" gold>
              <p
                className="text-xs leading-relaxed mb-3"
                style={{ color: "#EAEAEA" }}
              >
                {plan.bookDna.corePurpose}
              </p>
              <p
                className="text-xs leading-relaxed mb-3"
                style={{ color: "#B7B7B7" }}
              >
                <span style={{ color: "#C8A24A" }}>Thinking Mode:</span>{" "}
                {plan.bookDna.thinkingMode}
              </p>
              <p
                className="text-xs mb-2 font-semibold"
                style={{ color: "#C8A24A" }}
              >
                Dominant Systems:
              </p>
              <ul className="space-y-1">
                {plan.bookDna.dominantSystems.map((s) => (
                  <li
                    key={s}
                    className="text-xs flex gap-2"
                    style={{ color: "#B7B7B7" }}
                  >
                    <span style={{ color: "#C8A24A" }}>›</span> {s}
                  </li>
                ))}
              </ul>
              <p
                className="text-xs mt-3 leading-relaxed"
                style={{ color: "#B7B7B7" }}
              >
                {plan.bookDna.cognitiveProfile}
              </p>
            </SectionCard>

            <SectionCard title="🗂️ Structure Mapping">
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Foundations",
                    items: plan.structureMapping.foundations,
                    color: "#4A9EFF",
                  },
                  {
                    label: "Core Ideas",
                    items: plan.structureMapping.coreIdeas,
                    color: "#C8A24A",
                  },
                  {
                    label: "Application",
                    items: plan.structureMapping.application,
                    color: "#4AD891",
                  },
                ].map((section) => (
                  <div key={section.label}>
                    <p
                      className="text-xs font-bold mb-2 uppercase tracking-wider"
                      style={{ color: section.color }}
                    >
                      {section.label}
                    </p>
                    <ul className="space-y-1">
                      {section.items.map((item) => (
                        <li
                          key={item}
                          className="text-xs"
                          style={{ color: "#B7B7B7" }}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="⏱️ Daily Execution">
              <ul className="space-y-2">
                {plan.dailyExecution.breakdown.map((b) => (
                  <li
                    key={b}
                    className="text-xs leading-relaxed"
                    style={{ color: "#EAEAEA" }}
                  >
                    {b}
                  </li>
                ))}
              </ul>
            </SectionCard>
          </TabsContent>

          {/* CHAPTERS */}
          <TabsContent value="chapters" className="mt-0">
            {plan.chapterSystems.map((ch, i) => (
              <ChapterCard key={ch.title} chapter={ch} index={i} />
            ))}
          </TabsContent>

          {/* MEMORY */}
          <TabsContent value="memory" className="mt-0">
            <SectionCard title="🧠 Active Recall Schedule" gold>
              <ul className="space-y-2">
                {plan.memorySystem.recallSchedule.map((item) => (
                  <li
                    key={item}
                    className="text-xs flex gap-2"
                    style={{ color: "#EAEAEA" }}
                  >
                    <span style={{ color: "#C8A24A" }}>›</span> {item}
                  </li>
                ))}
              </ul>
            </SectionCard>
            <SectionCard title="🔄 Interleaving Strategy">
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#B7B7B7" }}
              >
                {plan.memorySystem.interleavingStrategy}
              </p>
            </SectionCard>
            <SectionCard title="🎯 Active Recall Techniques">
              <ul className="space-y-3">
                {plan.memorySystem.activeRecallTechniques.map((t, ti) => (
                  <li
                    key={t}
                    className="text-xs leading-relaxed"
                    style={{ color: "#EAEAEA" }}
                  >
                    <span style={{ color: "#C8A24A" }}>{ti + 1}. </span>
                    {t}
                  </li>
                ))}
              </ul>
            </SectionCard>
            <SectionCard title="📅 Spaced Repetition Days">
              <div className="flex gap-2 flex-wrap">
                {plan.memorySystem.spacedRepetitionDays.map((d) => (
                  <div
                    key={d}
                    className="text-xs rounded px-3 py-1 font-mono"
                    style={{
                      backgroundColor: "#1A1A1A",
                      color: "#C8A24A",
                      border: "1px solid #343434",
                    }}
                  >
                    Day {d}
                  </div>
                ))}
              </div>
            </SectionCard>
          </TabsContent>

          {/* NOTES */}
          <TabsContent value="notes" className="mt-0">
            <SectionCard title="📝 Atomic Notes Approach" gold>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#EAEAEA" }}
              >
                {plan.noteTakingSystem.atomicNotesApproach}
              </p>
            </SectionCard>
            <SectionCard title="🔗 Linking Strategy">
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#B7B7B7" }}
              >
                {plan.noteTakingSystem.linkingStrategy}
              </p>
            </SectionCard>
            <SectionCard title="🕸️ Zettelkasten Setup">
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#B7B7B7" }}
              >
                {plan.noteTakingSystem.zettlekastenSetup}
              </p>
            </SectionCard>
            <SectionCard title="💡 Knowledge Network Tips">
              <ul className="space-y-2">
                {plan.noteTakingSystem.knowledgeNetworkTips.map((tip) => (
                  <li
                    key={tip}
                    className="text-xs flex gap-2"
                    style={{ color: "#EAEAEA" }}
                  >
                    <span style={{ color: "#C8A24A" }}>›</span> {tip}
                  </li>
                ))}
              </ul>
            </SectionCard>
            <SectionCard title="🧠 Reflection Prompts">
              <p
                className="text-xs font-semibold mb-2"
                style={{ color: "#C8A24A" }}
              >
                Weekly Prompts
              </p>
              <ul className="space-y-2 mb-4">
                {plan.reflectionSystem.weeklyPrompts.map((p, pi) => (
                  <li
                    key={p}
                    className="text-xs flex gap-2"
                    style={{ color: "#EAEAEA" }}
                  >
                    <span style={{ color: "#C8A24A" }}>{pi + 1}.</span> {p}
                  </li>
                ))}
              </ul>
              <p
                className="text-xs font-semibold mb-2"
                style={{ color: "#C8A24A" }}
              >
                Deep Questions
              </p>
              <ul className="space-y-2">
                {plan.reflectionSystem.deepThinkingQuestions.map((q) => (
                  <li
                    key={q}
                    className="text-xs flex gap-2"
                    style={{ color: "#B7B7B7" }}
                  >
                    <span style={{ color: "#C8A24A" }}>›</span> {q}
                  </li>
                ))}
              </ul>
            </SectionCard>
          </TabsContent>

          {/* SCHEDULE */}
          <TabsContent value="schedule" className="mt-0">
            <SectionCard title="📅 Day-by-Day Plan" gold>
              <div className="space-y-2">
                {plan.dayWisePlan.map((day) => (
                  <div
                    key={day.day}
                    data-ocid={`schedule.item.${day.day}`}
                    className="flex gap-3 items-start rounded p-2"
                    style={{
                      backgroundColor:
                        day.type === "review"
                          ? "rgba(74,158,255,0.05)"
                          : day.type === "reflection"
                            ? "rgba(74,216,145,0.05)"
                            : "transparent",
                      border:
                        day.type === "review"
                          ? "1px solid rgba(74,158,255,0.2)"
                          : day.type === "reflection"
                            ? "1px solid rgba(74,216,145,0.2)"
                            : "1px solid transparent",
                    }}
                  >
                    <div
                      className="shrink-0 text-xs font-bold font-mono w-12 text-right"
                      style={{ color: "#C8A24A" }}
                    >
                      Day {day.day}
                    </div>
                    <div className="flex-1">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded uppercase font-bold tracking-wider inline-block mb-0.5"
                        style={{
                          backgroundColor:
                            day.type === "review"
                              ? "rgba(74,158,255,0.2)"
                              : day.type === "reflection"
                                ? "rgba(74,216,145,0.2)"
                                : "rgba(200,162,74,0.15)",
                          color:
                            day.type === "review"
                              ? "#4A9EFF"
                              : day.type === "reflection"
                                ? "#4AD891"
                                : "#C8A24A",
                        }}
                      >
                        {day.type}
                      </span>
                      <p className="text-xs" style={{ color: "#B7B7B7" }}>
                        {day.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </TabsContent>

          {/* INTEGRATION */}
          <TabsContent value="integration" className="mt-0">
            <SectionCard title="🔄 Revision Strategy" gold>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#EAEAEA" }}
              >
                {plan.finalIntegration.revisionStrategy}
              </p>
            </SectionCard>
            <SectionCard title="📈 Mastery Milestones">
              <ul className="space-y-2">
                {plan.finalIntegration.masteryMilestones.map((m) => (
                  <li
                    key={m}
                    className="text-xs flex gap-2"
                    style={{ color: "#EAEAEA" }}
                  >
                    <span style={{ color: "#C8A24A" }}>›</span> {m}
                  </li>
                ))}
              </ul>
            </SectionCard>
            <SectionCard title="🕒 Long-Term Retention">
              <ul className="space-y-2">
                {plan.finalIntegration.longTermRetention.map((r) => (
                  <li
                    key={r}
                    className="text-xs flex gap-2"
                    style={{ color: "#B7B7B7" }}
                  >
                    <span style={{ color: "#C8A24A" }}>›</span> {r}
                  </li>
                ))}
              </ul>
            </SectionCard>
            <SectionCard title="🚀 Real-Life Application">
              <ul className="space-y-2">
                {plan.finalIntegration.realLifeApplication.map((a, ai) => (
                  <li
                    key={a}
                    className="text-xs flex gap-2"
                    style={{ color: "#EAEAEA" }}
                  >
                    <span style={{ color: "#C8A24A" }}>{ai + 1}.</span> {a}
                  </li>
                ))}
              </ul>
            </SectionCard>
            <SectionCard title="✅ Self-Assessment Criteria">
              <ul className="space-y-2">
                {plan.reflectionSystem.selfAssessmentCriteria.map((c) => (
                  <li
                    key={c}
                    className="text-xs flex gap-2"
                    style={{ color: "#B7B7B7" }}
                  >
                    <span style={{ color: "#C8A24A" }}>›</span> {c}
                  </li>
                ))}
              </ul>
            </SectionCard>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
