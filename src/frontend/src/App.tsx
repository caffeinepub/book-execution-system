import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Header from "./components/Header";
import BooksPage from "./pages/BooksPage";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import MethodologyPage from "./pages/MethodologyPage";
import type { GeneratedPlan } from "./utils/planGenerator";

export type Page = "dashboard" | "plans" | "methodology" | "books" | "premium";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [viewPlan, setViewPlan] = useState<GeneratedPlan | null>(null);

  const handleNavigate = (p: Page) => {
    if (p !== "dashboard") setViewPlan(null);
    setPage(p);
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#0F0F10", color: "#EAEAEA" }}
    >
      <Header currentPage={page} onNavigate={handleNavigate} />

      <main>
        {page === "dashboard" && (
          <Dashboard
            initialPlan={viewPlan}
            onNavigateToPlans={() => handleNavigate("plans")}
          />
        )}
        {page === "plans" && (
          <Library
            onViewPlan={(plan) => {
              setViewPlan(plan);
              setPage("dashboard");
            }}
          />
        )}
        {page === "methodology" && <MethodologyPage />}
        {page === "books" && <BooksPage />}
        {page === "premium" && (
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
              style={{
                backgroundColor: "rgba(200,162,74,0.15)",
                color: "#C8A24A",
                border: "1px solid rgba(200,162,74,0.3)",
              }}
            >
              Coming Soon
            </div>
            <h1
              className="text-4xl font-bold mb-4"
              style={{
                fontFamily: "Bricolage Grotesque, sans-serif",
                color: "#EAEAEA",
              }}
            >
              EliteRead Premium
            </h1>
            <p className="text-lg" style={{ color: "#B7B7B7" }}>
              Advanced AI-powered reading plans, PDF export, progress tracking,
              and a dedicated notes workspace — coming soon.
            </p>
          </div>
        )}
      </main>

      <footer
        className="border-t text-center py-5 text-xs"
        style={{
          borderColor: "#343434",
          backgroundColor: "#141414",
          color: "#888888",
        }}
      >
        <div className="flex items-center justify-center gap-6 mb-2">
          {(["dashboard", "plans", "methodology", "books"] as Page[]).map(
            (p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleNavigate(p)}
                className="capitalize hover:text-gold transition-colors"
                style={{ color: "#888888" }}
              >
                {p === "plans"
                  ? "My Plans"
                  : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ),
          )}
        </div>
        <p style={{ color: "#666" }}>
          © {new Date().getFullYear()} EliteRead. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#C8A24A" }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      <Toaster />
    </div>
  );
}
