export interface ChapterSystem {
  title: string;
  purpose: string;
  patternRecognition: string;
  purposeReading: string;
  memoryEncoding: string;
  smartNotes: string;
  focusDiffuse: string;
  writingToLearn: string;
  coreIdeas: string[];
  keyTakeaways: string[];
  activeRecallQuestions: string[];
}

export interface DayPlan {
  day: number;
  chapters: string[];
  type: "reading" | "review" | "reflection";
  description: string;
}

export interface GeneratedPlan {
  bookName: string;
  bookType: string;
  dailyHours: number;
  totalDays: number;
  totalChapters: number;
  bookDna: {
    corePurpose: string;
    thinkingMode: string;
    dominantSystems: string[];
    cognitiveProfile: string;
  };
  structureMapping: {
    foundations: string[];
    coreIdeas: string[];
    application: string[];
    highCognitiveLoad: string[];
    easyChapters: string[];
    difficultChapters: string[];
  };
  dayWisePlan: DayPlan[];
  chapterSystems: ChapterSystem[];
  memorySystem: {
    recallSchedule: string[];
    spacedRepetitionDays: number[];
    interleavingStrategy: string;
    activeRecallTechniques: string[];
  };
  noteTakingSystem: {
    atomicNotesApproach: string;
    linkingStrategy: string;
    knowledgeNetworkTips: string[];
    zettlekastenSetup: string;
  };
  reflectionSystem: {
    weeklyPrompts: string[];
    deepThinkingQuestions: string[];
    selfAssessmentCriteria: string[];
  };
  dailyExecution: {
    readingMinutes: number;
    thinkingMinutes: number;
    recallMinutes: number;
    writingMinutes: number;
    breakdown: string[];
  };
  finalIntegration: {
    revisionStrategy: string;
    longTermRetention: string[];
    realLifeApplication: string[];
    masteryMilestones: string[];
  };
}

/**
 * Parse a raw chapter list pasted by the user.
 * Handles:
 *   PART I Title\n1. Chapter Name 12\n2. Chapter Name 34
 *   plain numbered lists: 1. Chapter Name\n2. Chapter Name
 * Returns flat array of fully-qualified chapter titles.
 */
export function parseChapterList(raw: string): string[] {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const chapters: string[] = [];
  let currentPart = "";

  for (const line of lines) {
    // Detect PART headers: "PART I ...", "PART 1 ...", "Part I ..."
    const partMatch = line.match(/^PART\s+([IVXLCDM\d]+)[.:)\s]+(.*)/i);
    if (partMatch) {
      const partLabel = partMatch[1].toUpperCase();
      const partTitle = partMatch[2].trim();
      currentPart = `Part ${partLabel}: ${partTitle}`;
      continue;
    }

    // Detect numbered chapter: "1. Title 123" or "1. Title" or "1) Title"
    const chapterMatch = line.match(/^(\d+)[.)\s]+(.+?)(?:\s+\d+)?$/);
    if (chapterMatch) {
      const num = chapterMatch[1];
      // Strip trailing page number (pure digits at end)
      const rawTitle = chapterMatch[2].replace(/\s+\d+$/, "").trim();
      const title = currentPart
        ? `${currentPart} — Ch.${num}: ${rawTitle}`
        : `Chapter ${num}: ${rawTitle}`;
      chapters.push(title);
      continue;
    }

    // Roman-numeral chapter lines: "i. ETC", "vii. ..."
    const romanMatch = line.match(/^([ivxlcdmIVXLCDM]+)[.)\s]+(.+)$/i);
    if (romanMatch) {
      const rawTitle = romanMatch[2].replace(/\s+\d+$/, "").trim();
      if (
        rawTitle.toLowerCase() === "etc" ||
        rawTitle.toLowerCase() === "..."
      ) {
        // skip continuation marker
        continue;
      }
      const title = currentPart
        ? `${currentPart} — ${romanMatch[1].toUpperCase()}. ${rawTitle}`
        : `${romanMatch[1].toUpperCase()}. ${rawTitle}`;
      chapters.push(title);
    }
  }

  return chapters;
}

/**
 * Parse a JSON response from the Open Library API (via backend fetchBookChapters).
 * Extracts table_of_contents entries if available.
 * Returns flat array of chapter title strings, or empty array if none found.
 */
export function parseOpenLibraryResponse(json: string): string[] {
  try {
    const data = JSON.parse(json);

    // Helper to extract chapters from a table_of_contents array
    const extractFromToc = (toc: Array<Record<string, unknown>>): string[] => {
      const chapters: string[] = [];
      let currentSection = "";
      for (const entry of toc) {
        const rawTitle: string = (
          (entry.title as string) ??
          (entry.label as string) ??
          ""
        ).trim();
        if (!rawTitle) continue;
        // Detect section headers (level 0 = part/section, not a chapter)
        if (
          entry.level === 0 ||
          entry.type === "part" ||
          entry.type === "section"
        ) {
          currentSection = rawTitle;
          continue;
        }
        const chTitle = currentSection
          ? `${currentSection} — ${rawTitle}`
          : rawTitle;
        chapters.push(chTitle);
      }
      // If filtering removed everything, return all raw titles
      if (chapters.length === 0) {
        return toc
          .map((e) => ((e.title as string) ?? (e.label as string) ?? "").trim())
          .filter(Boolean);
      }
      return chapters;
    };

    // Case 1: Direct works API response — data.table_of_contents exists
    if (
      Array.isArray(data.table_of_contents) &&
      data.table_of_contents.length > 0
    ) {
      const result = extractFromToc(
        data.table_of_contents as Array<Record<string, unknown>>,
      );
      if (result.length > 0) return result;
    }

    // Case 2: Search API response — data.docs[0].table_of_contents exists
    if (
      Array.isArray(data.docs) &&
      data.docs.length > 0 &&
      Array.isArray(data.docs[0].table_of_contents) &&
      data.docs[0].table_of_contents.length > 0
    ) {
      const result = extractFromToc(
        data.docs[0].table_of_contents as Array<Record<string, unknown>>,
      );
      if (result.length > 0) return result;
    }
  } catch {
    // JSON parse failure — not an error, just no chapters available
  }
  return [];
}

function getChapterCount(bookType: string): number {
  const counts: Record<string, number> = {
    "Self-Help/Personal Development": 12,
    "Business & Finance": 14,
    "Science & Technology": 15,
    "Philosophy & Psychology": 13,
    "History & Biography": 16,
    "Literature & Fiction": 10,
    "Health & Wellness": 11,
    "Academic/Textbook": 18,
  };
  return counts[bookType] ?? 12;
}

function generateChapterTitles(
  bookName: string,
  bookType: string,
  count: number,
): string[] {
  const templates: Record<string, string[]> = {
    "Self-Help/Personal Development": [
      "Introduction: The Journey Begins",
      "The Core Problem: Why You're Stuck",
      "Core Principle 1: Foundations of Change",
      "Core Principle 2: Building Momentum",
      "Core Principle 3: Sustaining Progress",
      "Practice 1: Daily Rituals and Habits",
      "Practice 2: Overcoming Resistance",
      "Practice 3: The Power of Consistency",
      "Integration: Putting It All Together",
      "Navigating Obstacles and Setbacks",
      "Advanced Mastery: The Next Level",
      "Conclusion: Your Transformed Life",
    ],
    "Business & Finance": [
      "Introduction: The Business Landscape",
      "Foundation 1: Core Economic Principles",
      "Foundation 2: Market Dynamics",
      "Strategy 1: Competitive Advantage",
      "Strategy 2: Value Creation",
      "Strategy 3: Execution and Operations",
      "Financial Fundamentals",
      "Risk Management and Decision-Making",
      "Leadership and Organizational Culture",
      "Innovation and Disruption",
      "Scaling and Growth",
      "The Digital Transformation",
      "Building Sustainable Systems",
      "Conclusion: The Future of Business",
    ],
    "Science & Technology": [
      "Introduction: The Scientific Foundation",
      "Historical Context and Discovery",
      "Core Theory 1: First Principles",
      "Core Theory 2: Advanced Mechanisms",
      "Core Theory 3: Emergent Properties",
      "Experimental Evidence and Data",
      "Mathematical Frameworks",
      "Applications in the Real World",
      "Edge Cases and Anomalies",
      "Current Research Frontiers",
      "Technology Integration",
      "Ethical and Social Implications",
      "Future Directions",
      "Synthesis and Unifying Theories",
      "Conclusion: What Comes Next",
    ],
    "Philosophy & Psychology": [
      "Introduction: The Central Question",
      "Historical Foundations",
      "The Nature of Mind and Consciousness",
      "Core Philosophical Framework",
      "Psychological Mechanisms at Play",
      "The Role of Perception and Bias",
      "Emotion, Reason, and Will",
      "Social and Cultural Dimensions",
      "Ethics and Moral Philosophy",
      "Applied Psychology in Daily Life",
      "Integration: Mind, Body, Society",
      "Critiques and Counter-Arguments",
      "Conclusion: Living Philosophically",
    ],
    "History & Biography": [
      "Introduction: Setting the Stage",
      "Early Life and Formative Years",
      "The World Before: Historical Context",
      "The Turning Point",
      "Rise to Power or Prominence",
      "Key Alliances and Conflicts",
      "Major Decisions and Their Consequences",
      "Setbacks and Recoveries",
      "The Peak: Greatest Achievements",
      "Behind the Scenes: Private Life",
      "Philosophical Worldview and Beliefs",
      "Legacy in Formation",
      "Decline, End, or Transformation",
      "Historical Reassessment",
      "Lessons for Our Time",
      "Conclusion: Enduring Significance",
    ],
    "Literature & Fiction": [
      "Opening: World and Character Establishment",
      "Rising Action: Conflict Emerges",
      "Character Development and Backstory",
      "Thematic Threads: Symbols and Motifs",
      "The Midpoint: Stakes Escalate",
      "Subplots and Secondary Characters",
      "The Dark Night: Crisis Point",
      "Climax: Confrontation and Resolution",
      "Falling Action: Aftermath",
      "Denouement: Meaning Revealed",
    ],
    "Health & Wellness": [
      "Introduction: The Wellness Paradigm",
      "The Science of the Body",
      "Nutrition Foundations",
      "Movement and Exercise Science",
      "Sleep and Recovery",
      "Mental Health and Stress",
      "The Mind-Body Connection",
      "Building Sustainable Habits",
      "Common Pitfalls and How to Avoid Them",
      "Personalized Health Protocols",
      "Conclusion: Lifelong Vitality",
    ],
    "Academic/Textbook": [
      "Chapter 1: Foundational Concepts",
      "Chapter 2: Theoretical Framework",
      "Chapter 3: Methodology and Approach",
      "Chapter 4: Core Domain Principles",
      "Chapter 5: Advanced Theory I",
      "Chapter 6: Advanced Theory II",
      "Chapter 7: Quantitative Methods",
      "Chapter 8: Qualitative Methods",
      "Chapter 9: Case Studies and Examples",
      "Chapter 10: Research Design",
      "Chapter 11: Data Analysis Techniques",
      "Chapter 12: Interpretation Frameworks",
      "Chapter 13: Interdisciplinary Connections",
      "Chapter 14: Current Debates in the Field",
      "Chapter 15: Applied Practice",
      "Chapter 16: Ethical Considerations",
      "Chapter 17: Future Research Directions",
      "Chapter 18: Synthesis and Review",
    ],
  };

  const list =
    templates[bookType] ?? templates["Self-Help/Personal Development"];
  return list.slice(0, count).map((t) => t.replace(/\[BookName\]/g, bookName));
}

function generateChapterSystem(
  title: string,
  index: number,
  bookName: string,
  _bookType: string,
): ChapterSystem {
  const purposes = [
    `Establishes the conceptual scaffolding needed to understand ${bookName}'s deeper arguments`,
    "Transforms abstract principles into concrete mental models you can apply immediately",
    "Builds procedural fluency — turning insight into automatic competence",
    "Challenges your existing assumptions and creates productive cognitive dissonance",
    "Synthesizes prior chapters into an integrated framework for action",
  ];

  const patternRecognitions = [
    "Look for recurring metaphors, contrasting pairs, and callback references to earlier chapters — the author is building a symbolic vocabulary",
    "Notice structural patterns: problem → principle → example → application. These signal the author's argument arc",
    "Track character or concept evolution. What changes from chapter start to end reveals the core transformation the author intends",
    "Identify the tension the author sets up — every chapter has a thesis and its shadow. Find both",
    "Detect layered meaning: surface argument, deeper implication, and the unstated assumption beneath both",
  ];

  const purposeReadings = [
    "What single insight from this chapter would change how I act tomorrow?",
    "What problem is this chapter solving, and do I actually have that problem?",
    "What evidence would convince me this chapter's claim is wrong?",
    "How does this connect to the central argument of the entire book?",
    "What would the author say I'm missing if I skip this chapter?",
  ];

  const memoryEncodings = [
    "Pause after every major section (2-3 pages). Close the book. Recall the main claim in one sentence. Only then continue",
    "After finishing, wait 10 minutes doing something unrelated. Then write 5 bullet points from memory without looking",
    "At natural breaks, mentally teach the concept to an imaginary student. Where you stumble reveals where memory is weak",
    "Create a retrieval cue before reading each section — one question you want answered. Check it after",
    "Use spaced retrieval: recall this chapter tomorrow, in 3 days, in a week, and in a month",
  ];

  const smartNotes = [
    "Write one atomic note per idea (not per page). Each note should make sense standalone. Link to previous chapter concepts using [[brackets]]",
    "Ask: what existing note does this new idea modify or challenge? Create a connection note explaining the relationship",
    "Build a concept map: this chapter's core idea as a node, draw edges to every related idea from previous chapters",
    "Write a literature note (what the author says) + a permanent note (what YOU think). They are different things",
    "Create a question note: what does this idea make you curious about? These become your research threads",
  ];

  const focusDiffuses = [
    "Read for 25 minutes (focused mode). Take a 5-minute walk (diffuse mode). The subconscious will consolidate what you absorbed",
    "After encountering a difficult concept, stop trying to force understanding. Sleep on it. Diffuse processing often yields breakthrough",
    "Alternate: read one section focused, then doodle or sketch what you understood (diffuse). The diagram reveals gaps",
    "If stuck after 10 minutes, switch to diffuse — shower, walk, music. Return with fresh eyes. Don't power through confusion",
    "Schedule your reading 30 minutes before a break you already have (lunch, end of workday). The transition forces diffuse processing",
  ];

  const writingToLearns = [
    "Write a one-paragraph summary AS IF explaining to a smart 15-year-old who has never read this book",
    "Write a disagreement note: what do you push back on? Articulating resistance deepens understanding",
    "Rewrite the chapter's core argument in your own words, using examples from YOUR life, not the book's",
    "Write the chapter's 3 most important sentences, then write why each one matters in your own words",
    "Write a brief story or scenario where the chapter's main idea is the lesson learned",
  ];

  const allCoreIdeas = [
    [
      "The foundation principle that makes all other ideas in this book coherent",
      "Why conventional approaches fail and what the author proposes instead",
      "The mechanism by which change actually occurs at the neurological and behavioral level",
    ],
    [
      "The specific technique or framework that transforms intention into action",
      "How context, environment, and identity interact to produce outcomes",
      "The critical distinction between knowing a principle and embodying it",
    ],
    [
      "The system for maintaining gains and preventing regression",
      "How this principle applies across different domains and life areas",
      "The most common misapplication of this chapter's core idea",
    ],
    [
      "The unexpected implication that most readers miss",
      "How this chapter's insight connects to the book's overarching thesis",
      "The actionable protocol that emerges from the theoretical framework",
    ],
  ];

  const allKeyTakeaways = [
    [
      "The single most important sentence in this chapter (write it in your own words)",
      "The one action you should take within 24 hours of reading this",
      "The mindset shift required before the techniques in this chapter will work",
    ],
    [
      "What you would lose by not reading this chapter — the cost of ignorance",
      "The simplest version of the chapter's main idea that still captures the essence",
      "The long-term consequence of applying vs. ignoring this chapter's central principle",
    ],
  ];

  const allRecallQuestions = [
    [
      "Without looking: what is the chapter's central claim in one sentence?",
      "What specific example or case did the author use to prove the main point? What made it compelling?",
      "What assumption does this chapter challenge that you previously held?",
      "How would you apply the core principle of this chapter to a specific current challenge in your life?",
      "What would the author say to someone who read this chapter but still didn't change their behavior?",
    ],
    [
      "If this chapter were wrong, what would the counter-evidence look like?",
      "How does this chapter's idea conflict with, complement, or extend something from a previous chapter?",
      "What question does this chapter raise that it doesn't fully answer?",
      "Describe the transformation arc: what does a person look like BEFORE and AFTER internalizing this chapter?",
      "What's the minimum viable action that captures 80% of this chapter's value?",
    ],
  ];

  const i = index % 5;
  const j = index % 4;
  const k = index % 2;

  return {
    title,
    purpose: purposes[i],
    patternRecognition: patternRecognitions[i],
    purposeReading: purposeReadings[i],
    memoryEncoding: memoryEncodings[i],
    smartNotes: smartNotes[i],
    focusDiffuse: focusDiffuses[i],
    writingToLearn: writingToLearns[i],
    coreIdeas: allCoreIdeas[j],
    keyTakeaways: allKeyTakeaways[k],
    activeRecallQuestions: allRecallQuestions[k],
  };
}

function generateDayWisePlan(
  chapters: string[],
  dailyHours: number,
): DayPlan[] {
  const minutesPerChapter = 45;
  const dailyMinutes = dailyHours * 60;
  const chaptersPerDay = Math.max(
    1,
    Math.floor(dailyMinutes / minutesPerChapter),
  );

  const days: DayPlan[] = [];
  let dayNum = 1;
  let chapterIndex = 0;

  while (chapterIndex < chapters.length) {
    const batch = chapters.slice(chapterIndex, chapterIndex + chaptersPerDay);
    days.push({
      day: dayNum,
      chapters: batch,
      type: "reading",
      description: `Read ${batch.join(" + ")}`,
    });
    chapterIndex += chaptersPerDay;
    dayNum++;

    // Add review day every 4 reading days
    if (days.filter((d) => d.type === "reading").length % 4 === 0) {
      days.push({
        day: dayNum,
        chapters: days
          .filter((d) => d.type === "reading")
          .slice(-4)
          .flatMap((d) => d.chapters)
          .slice(0, 3),
        type: "review",
        description:
          "Spaced repetition review of last 4 reading days — active recall, no re-reading",
      });
      dayNum++;
    }
  }

  // Add final reflection days
  days.push({
    day: dayNum,
    chapters: [],
    type: "reflection",
    description:
      "Full book reflection — write your personal synthesis and identify 3 life changes",
  });
  days.push({
    day: dayNum + 1,
    chapters: [],
    type: "reflection",
    description:
      "Final integration — create your action plan and long-term retention schedule",
  });

  return days;
}

function cognitiveLoadLabel(chapterCount: number): string {
  if (chapterCount > 14) return "high";
  if (chapterCount > 10) return "moderate";
  return "moderate-to-low";
}

export function generateBookPlan(
  bookName: string,
  bookType: string,
  dailyHours: number,
  customChapters?: string[],
): GeneratedPlan {
  // Use custom chapter list if provided, otherwise fall back to templates
  const chapterTitles =
    customChapters && customChapters.length > 0
      ? customChapters
      : generateChapterTitles(bookName, bookType, getChapterCount(bookType));

  const chapterCount = chapterTitles.length;
  const dayWisePlan = generateDayWisePlan(chapterTitles, dailyHours);
  const totalDays = dayWisePlan[dayWisePlan.length - 1].day;

  const foundationEnd = Math.floor(chapterCount * 0.25);
  const coreEnd = Math.floor(chapterCount * 0.75);

  const foundations = chapterTitles.slice(0, foundationEnd);
  const coreIdeas = chapterTitles.slice(foundationEnd, coreEnd);
  const application = chapterTitles.slice(coreEnd);

  const chapterSystems = chapterTitles.map((title, i) =>
    generateChapterSystem(title, i, bookName, bookType),
  );

  const dailyTotalMins = dailyHours * 60;
  const readingMins = Math.round(dailyTotalMins * 0.5);
  const thinkingMins = Math.round(dailyTotalMins * 0.2);
  const recallMins = Math.round(dailyTotalMins * 0.15);
  const writingMins = Math.round(dailyTotalMins * 0.15);
  const chaptersPerSession = Math.ceil((dailyHours * 60) / 45);

  return {
    bookName,
    bookType,
    dailyHours,
    totalDays,
    totalChapters: chapterCount,
    bookDna: {
      corePurpose: `${bookName} is a ${bookType.toLowerCase()} text designed to fundamentally change how you think and act in its domain. Its core purpose is to move you from intellectual understanding to embodied competence through structured exposure and practice.`,
      thinkingMode:
        bookType.includes("Academic") || bookType.includes("Science")
          ? "Analytical-Systematic: Requires slow, deliberate processing. Use focused mode for concept absorption and diffuse mode for integration. High working memory demand."
          : bookType.includes("Literature")
            ? "Aesthetic-Interpretive: Engage emotionally and analytically. Pattern recognition for symbols and themes is paramount. Non-linear rereading is encouraged."
            : "Conceptual-Applied: Balance between understanding principles (focused mode) and generating personal applications (diffuse mode). Moderate working memory load.",
      dominantSystems: [
        "Make It Stick → Spaced retrieval after every chapter",
        "How to Take Smart Notes → Atomic notes with Zettelkasten links",
        bookType.includes("Literature")
          ? "How to Read Literature Like a Professor → Symbol and pattern tracking"
          : "A Mind for Numbers → Focused/diffuse alternation for difficult concepts",
        "Writing to Learn → Post-chapter articulation exercises",
        "The Intellectual Life → Weekly deep reflection sessions",
      ],
      cognitiveProfile: `This book demands ${cognitiveLoadLabel(chapterCount)} cognitive load. Plan for ${chaptersPerSession} chapters per session maximum. The first 25% of the book (Foundations) requires the most careful reading — rushing this section creates compounding confusion later.`,
    },
    structureMapping: {
      foundations,
      coreIdeas,
      application,
      highCognitiveLoad: chapterTitles
        .filter(
          (_, i) => i >= foundationEnd && i < Math.floor(chapterCount * 0.6),
        )
        .slice(0, 4),
      easyChapters: [...foundations.slice(0, 2), ...application.slice(-2)],
      difficultChapters: coreIdeas.slice(
        Math.floor(coreIdeas.length * 0.3),
        Math.floor(coreIdeas.length * 0.7),
      ),
    },
    dayWisePlan,
    chapterSystems,
    memorySystem: {
      recallSchedule: [
        "Day 1: Read chapter → same-day recall (write 5 key points from memory)",
        "Day 2: Next-day retrieval test (without re-reading — just questions)",
        "Day 5: 5-day spaced recall (use your active recall questions from notes)",
        "Day 14: Two-week review (teach the concept to someone or to yourself out loud)",
        "Day 30: Month-end integration test (connect all chapters into one coherent narrative)",
      ],
      spacedRepetitionDays: [1, 2, 5, 14, 30],
      interleavingStrategy:
        'Interleave: After finishing a new chapter, briefly review 2 older chapters before moving forward. This prevents the "illusion of knowing" that comes from sequential-only reading.',
      activeRecallTechniques: [
        "The Blank Page Method: Close book, write everything you remember. Then check. The gap IS the learning.",
        "The Feynman Technique: Explain the concept to a 12-year-old. Inability to simplify = incomplete understanding.",
        "Question-First Reading: Write 3 questions BEFORE reading. Answer them AFTER. Unresolved questions become your next study session.",
        "The Two-Day Rule: Never let more than 2 days pass without material you want to retain long-term.",
      ],
    },
    noteTakingSystem: {
      atomicNotesApproach:
        "One idea per note. Each note must be self-contained — readable without context from other notes. Notes are not summaries; they are your processed understanding of a single claim, reformulated in your own words.",
      linkingStrategy:
        'After every 3 chapters, review your notes and ask: "What does this new note modify, contradict, or extend from previous notes?" Create explicit links. Your goal is a network, not a linear list.',
      knowledgeNetworkTips: [
        "Use consistent tags: #concept, #method, #example, #question, #connection",
        'Create "hub notes" every 5 chapters that synthesize connections across the section',
        "Index note: maintain a master note listing all key concepts and which chapter introduced them",
        'Connection notes are more valuable than content notes — prioritize "X relates to Y because..." over "X says..."',
      ],
      zettlekastenSetup:
        "Structure: Fleeting notes (raw reading jots) → Literature notes (what the author said, in your words) → Permanent notes (what YOU think, connected to existing notes). Only permanent notes get links. Fleeting and literature notes are staging areas.",
    },
    reflectionSystem: {
      weeklyPrompts: [
        "Week 1: What has this book made me question that I previously assumed was true?",
        "Week 2: Where am I already applying what I've read, even unconsciously?",
        "Week 3: What is the hardest idea in this book to accept? Why does it challenge me?",
        "Week 4: If I had to summarize what I've read into 3 sentences for a mentor, what would I say?",
        "Final week: What specific decision will I make differently because of this book?",
      ],
      deepThinkingQuestions: [
        "What kind of person does this book implicitly assume I want to become?",
        "What does the author believe about human nature that makes their argument coherent?",
        "Where does this book's model of reality conflict with my lived experience?",
        "What is the author NOT saying that might be equally important?",
        "In 5 years, which ideas from this book will I still carry with me? Why?",
        "What would I need to unlearn to fully embody what this book teaches?",
      ],
      selfAssessmentCriteria: [
        "Can I explain the book's central thesis in 60 seconds without notes?",
        "Can I identify 3 concrete behaviors I've changed because of this book?",
        "Can I teach any chapter to someone else without referring to the text?",
        "Do I have unanswered questions that push me toward further reading?",
      ],
    },
    dailyExecution: {
      readingMinutes: readingMins,
      thinkingMinutes: thinkingMins,
      recallMinutes: recallMins,
      writingMinutes: writingMins,
      breakdown: [
        `⏱ ${readingMins} min — FOCUSED READING: Deep, active reading. Pen in hand. No phone. Read slowly enough to think.`,
        `🧠 ${thinkingMins} min — DIFFUSE THINKING: Walk away. Let ideas percolate. No input. Just your mind processing.`,
        `🔁 ${recallMins} min — ACTIVE RECALL: Blank page. Write everything you remember. Then check. Close the gap.`,
        `✍️ ${writingMins} min — WRITING TO LEARN: One atomic note. One synthesis sentence. One question for next session.`,
      ],
    },
    finalIntegration: {
      revisionStrategy: `Use the "3-Pass Revision" method: Pass 1 (Day ${totalDays - 3}) — skim all chapter headings and recall titles. Pass 2 (Day ${totalDays - 2}) — review all permanent notes and rebuild your concept map. Pass 3 (Day ${totalDays - 1}) — test yourself against active recall questions for every chapter without notes.`,
      longTermRetention: [
        "Month 1: Weekly 15-minute review of your concept map and permanent notes",
        "Month 2-3: Monthly review — answer 3 recall questions from random chapters",
        "Month 4-6: Quarterly synthesis — write a 500-word essay on how this book changed your thinking",
        "Year 1+: Annual re-read of Foundation chapters only — they carry the highest leverage",
      ],
      realLifeApplication: [
        "Identify one principle to implement this week — specific, time-bound, measurable",
        "Find an accountability partner to explain the book's core ideas to within 7 days",
        'Create a personal "operating system" document incorporating this book\'s key frameworks',
        "Schedule a 30-day experiment: apply one chapter's main idea deliberately for a full month",
      ],
      masteryMilestones: [
        "Milestone 1 (After Foundations): Can articulate the book's core premise and why it matters",
        "Milestone 2 (After Core Ideas): Can explain any chapter's main idea in 90 seconds",
        "Milestone 3 (After Application): Have identified 5 concrete life changes to make",
        "Milestone 4 (Post-completion): Can teach the book's system to another person from memory",
      ],
    },
  };
}
