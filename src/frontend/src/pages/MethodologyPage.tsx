import { motion } from "motion/react";

const METHODOLOGY_BOOKS = [
  {
    title: "How to Read Literature Like a Professor",
    author: "Thomas C. Foster",
    icon: "🔍",
    color: "#C8A24A",
    system: "Pattern Recognition",
    description:
      "Teaches you to identify recurring symbols, archetypes, seasons, geography, and quests in literature. Applied in our pattern recognition prompts for every chapter — training you to read with a professor's eye, not a casual reader's.",
    applied: [
      "Symbol and motif tracking prompts per chapter",
      "Archetype identification in character development",
      "Contextual reading within literary tradition",
    ],
  },
  {
    title: "How to Read and Why",
    author: "Harold Bloom",
    icon: "🎯",
    color: "#4A9EFF",
    system: "Purpose Reading",
    description:
      "Bloom argues that reading shapes identity — it is how we encounter the best that has been thought and said. Every chapter's 'Purpose Question' is drawn from his framework: reading must serve your self-development, not mere information gathering.",
    applied: [
      "Pre-reading intention setting",
      "Identity-level purpose questions per chapter",
      "Selection of canonical connections",
    ],
  },
  {
    title: "The Intellectual Life",
    author: "A.G. Sertillanges",
    icon: "📚",
    color: "#4AD891",
    system: "Deep Reflection",
    description:
      "Sertillanges' masterpiece on how to develop the intellectual life — through solitude, silence, and sustained contemplation. Our weekly reflection system and deep thinking questions draw directly from his framework for the scholarly life.",
    applied: [
      "Weekly deep thinking reflection prompts",
      "The 'one idea that changes your thinking' framework",
      "Solitude-based recall sessions",
    ],
  },
  {
    title: "How to Take Smart Notes",
    author: "Sönke Ahrens",
    icon: "📝",
    color: "#C8A24A",
    system: "Smart Notes",
    description:
      "Ahrens systematizes Niklas Luhmann's Zettelkasten method. Our note-taking system is built entirely on this framework: atomic notes, literature vs. permanent notes, and the slip-box linking strategy that generates original thinking.",
    applied: [
      "Fleeting → Literature → Permanent note progression",
      "Atomic note structure (one idea per note)",
      "Zettelkasten linking between chapters",
    ],
  },
  {
    title: "Make It Stick",
    author: "Peter Brown, Henry Roediger, Mark McDaniel",
    icon: "🧠",
    color: "#4A9EFF",
    system: "Memory Consolidation",
    description:
      "The most evidence-based book on learning science. Retrieval practice, spaced repetition, and interleaving are the three most powerful learning techniques discovered by cognitive science. Every review day and recall schedule in EliteRead is directly derived from this research.",
    applied: [
      "Spaced repetition schedule (Day 1, 2, 5, 14, 30)",
      "Retrieval practice after every chapter",
      "Interleaved review protocol",
    ],
  },
  {
    title: "A Mind for Numbers",
    author: "Barbara Oakley",
    icon: "⚡",
    color: "#4AD891",
    system: "Focused/Diffuse Thinking",
    description:
      "Oakley explains the two modes of brain activity: focused mode (active concentration) and diffuse mode (relaxed background processing). Hard ideas need diffuse processing to settle. Every chapter's 'Focus/Diffuse' prompt is based on her breakthrough research.",
    applied: [
      "Focused reading sessions (25 min maximum)",
      "Mandatory diffuse breaks after difficult concepts",
      "Procrastination-as-processing reframe",
    ],
  },
  {
    title: "Writing to Learn",
    author: "William Zinsser",
    icon: "✍️",
    color: "#C8A24A",
    system: "Writing to Learn",
    description:
      "Zinsser's insight: you don't write because you understand — you write in order to understand. The act of putting ideas into sentences forces clarity. Every chapter ends with a 'Write to Learn' prompt designed to expose your actual level of comprehension.",
    applied: [
      "Post-chapter 'explain it like I'm 12' summaries",
      "Disagreement notes to deepen understanding",
      "Sentence rewriting in your own words",
    ],
  },
  {
    title: "The Sense of Style",
    author: "Steven Pinker",
    icon: "🎭",
    color: "#4A9EFF",
    system: "Clarity Analysis",
    description:
      "Pinker deconstructs what makes writing clear, compelling, and memorable. In EliteRead, this is applied to analyzing the author's own craft — training you to notice how ideas are sequenced, how evidence is deployed, and how structure creates meaning.",
    applied: [
      "Author's writing technique observation per chapter",
      "Sentence-worth-studying identification",
      "Structural choice analysis",
    ],
  },
  {
    title: "Proust and the Squid",
    author: "Maryanne Wolf",
    icon: "🧬",
    color: "#4AD891",
    system: "Brain Processing",
    description:
      "Wolf's neurological study of reading explains how the reading brain works — and how deep reading creates the conditions for genuine empathy and insight. Our pre-reading activation protocol is based on her research on how the brain prepares to receive complex text.",
    applied: [
      "Pre-reading brain activation protocol",
      "Prior knowledge activation before each chapter",
      "Deep reading vs. skimming differentiation",
    ],
  },
];

export default function MethodologyPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 pb-16">
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
          The 9 Core Methodologies
        </h1>
        <p className="text-base max-w-2xl" style={{ color: "#B7B7B7" }}>
          EliteRead integrates nine foundational books on reading, cognition,
          and learning into every plan it generates. These are not generic tips
          — each system is explicitly applied at the chapter level.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {METHODOLOGY_BOOKS.map((book, i) => (
          <motion.div
            key={book.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            className="rounded-xl p-5 flex flex-col"
            style={{ backgroundColor: "#1A1A1A", border: "1px solid #343434" }}
            data-ocid={`methodology.item.${i + 1}`}
          >
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                style={{
                  backgroundColor: "rgba(200,162,74,0.1)",
                  border: `1px solid ${book.color}33`,
                }}
              >
                {book.icon}
              </div>
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-0.5"
                  style={{ color: book.color }}
                >
                  {book.system}
                </p>
                <h3
                  className="text-sm font-bold leading-snug"
                  style={{ color: "#EAEAEA" }}
                >
                  {book.title}
                </h3>
                <p className="text-xs" style={{ color: "#888" }}>
                  {book.author}
                </p>
              </div>
            </div>

            <p
              className="text-xs leading-relaxed mb-4 flex-1"
              style={{ color: "#B7B7B7" }}
            >
              {book.description}
            </p>

            <div
              className="rounded-lg p-3"
              style={{
                backgroundColor: "#242424",
                border: "1px solid #343434",
              }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: book.color }}
              >
                Applied In EliteRead:
              </p>
              <ul className="space-y-1">
                {book.applied.map((point) => (
                  <li
                    key={point}
                    className="text-xs flex gap-2"
                    style={{ color: "#888" }}
                  >
                    <span style={{ color: book.color }}>›</span> {point}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
