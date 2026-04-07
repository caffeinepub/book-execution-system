import { motion } from "motion/react";
import { useState } from "react";
import { BOOK_KNOWLEDGE_BASE } from "../utils/bookKnowledgeBase";

const GENRE_FILTERS = [
  "All",
  "Fiction",
  "Business",
  "Psychology",
  "History",
  "Philosophy",
  "Science",
  "Biography",
];

const GENRE_MAP: Record<string, string[]> = {
  Fiction: [
    "great gatsby",
    "to kill a mockingbird",
    "1984",
    "animal farm",
    "brave new world",
    "fahrenheit 451",
    "of mice and men",
    "old man and the sea",
    "moby dick",
    "don quixote",
    "odyssey",
    "iliad",
    "hamlet",
    "crime and punishment",
    "brothers karamazov",
    "war and peace",
    "anna karenina",
    "dune",
    "harry potter",
    "the hobbit",
    "pride and prejudice",
    "the alchemist",
    "kite runner",
    "educated",
  ],
  Business: [
    "zero to one",
    "lean startup",
    "good to great",
    "hard thing about hard things",
    "shoe dog",
    "innovators dilemma",
    "how to invest",
    "atomic habits",
    "deep work",
    "so good they cant ignore you",
    "digital minimalism",
    "the checklist manifesto",
    "thinking in bets",
    "influence",
    "rich dad poor dad",
    "7 habits",
    "how to win friends",
  ],
  Psychology: [
    "thinking fast and slow",
    "mans search for meaning",
    "power of habit",
    "power of now",
    "12 rules for life",
    "the body keeps the score",
    "why we sleep",
    "the brain",
    "behave",
    "thinking in bets",
    "influence",
  ],
  History: [
    "sapiens",
    "homo deus",
    "21 lessons",
    "guns germs and steel",
    "silk roads",
    "spqr",
    "gulag archipelago",
    "war and peace",
  ],
  Philosophy: [
    "meditations",
    "republic",
    "nicomachean ethics",
    "thus spoke zarathustra",
    "beyond good and evil",
    "prince",
    "art of war",
    "mans search for meaning",
    "power of now",
  ],
  Science: [
    "selfish gene",
    "brief history of time",
    "structure of scientific revolutions",
    "origin of species",
    "the gene",
    "godel escher bach",
    "thinking in systems",
    "black swan",
    "antifragile",
    "a mind for numbers",
    "why we sleep",
    "the brain",
    "behave",
    "range",
  ],
  Biography: [
    "educated",
    "shoe dog",
    "gulag archipelago",
    "mans search for meaning",
    "kite runner",
  ],
};

function matchesGenre(key: string, genre: string): boolean {
  if (genre === "All") return true;
  const list = GENRE_MAP[genre] ?? [];
  return list.some((g) => key.includes(g));
}

function formatTitle(key: string): string {
  return key
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function BooksPage() {
  const [activeGenre, setActiveGenre] = useState("All");
  const [search, setSearch] = useState("");

  const bookEntries = Object.entries(BOOK_KNOWLEDGE_BASE);

  const filtered = bookEntries.filter(([key]) => {
    const matchesSearch =
      search.length === 0 || key.includes(search.toLowerCase());
    return matchesGenre(key, activeGenre) && matchesSearch;
  });

  return (
    <div className="max-w-[1200px] mx-auto px-6 pb-16">
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
          Knowledge Base
        </h1>
        <p className="text-base" style={{ color: "#B7B7B7" }}>
          {bookEntries.length} books with accurate chapter/part data built in.
        </p>
      </motion.div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search books..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-ocid="books.search_input"
          className="h-10 px-4 rounded-lg text-sm flex-1 outline-none"
          style={{
            backgroundColor: "#1A1A1A",
            border: "1px solid #343434",
            color: "#EAEAEA",
          }}
        />
        <div className="flex gap-2 flex-wrap">
          {GENRE_FILTERS.map((genre) => (
            <button
              key={genre}
              type="button"
              data-ocid={`books.${genre.toLowerCase()}.tab`}
              onClick={() => setActiveGenre(genre)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                backgroundColor: activeGenre === genre ? "#C8A24A" : "#1A1A1A",
                color: activeGenre === genre ? "#151515" : "#B7B7B7",
                border:
                  activeGenre === genre
                    ? "1px solid #C8A24A"
                    : "1px solid #343434",
              }}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Book Grid */}
      <motion.div
        key={activeGenre + search}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {filtered.map(([key, chapters], i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.02, 0.3), duration: 0.3 }}
            className="rounded-xl p-4"
            style={{ backgroundColor: "#1A1A1A", border: "1px solid #343434" }}
            data-ocid={`books.item.${i + 1}`}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base mb-3"
              style={{
                backgroundColor: "rgba(200,162,74,0.12)",
                border: "1px solid rgba(200,162,74,0.2)",
              }}
            >
              📖
            </div>
            <h3
              className="text-sm font-bold mb-1 leading-snug"
              style={{ color: "#EAEAEA" }}
            >
              {formatTitle(key)}
            </h3>
            <div className="flex items-center gap-2">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{
                  backgroundColor: "rgba(200,162,74,0.12)",
                  color: "#C8A24A",
                  border: "1px solid rgba(200,162,74,0.25)",
                }}
              >
                {chapters.length} chapters
              </span>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div
            className="col-span-4 py-16 text-center rounded-xl"
            style={{ backgroundColor: "#1A1A1A", border: "1px dashed #343434" }}
            data-ocid="books.empty_state"
          >
            <p
              className="text-base font-semibold mb-2"
              style={{ color: "#EAEAEA" }}
            >
              No books found
            </p>
            <p className="text-sm" style={{ color: "#888" }}>
              Try a different search or genre filter.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
