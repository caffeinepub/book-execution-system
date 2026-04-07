import { Bell, Crown } from "lucide-react";
import type { Page } from "../App";

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NAV_LINKS: { id: Page; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "plans", label: "My Plans" },
  { id: "methodology", label: "Methodology" },
  { id: "books", label: "Books" },
  { id: "premium", label: "Premium" },
];

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6 border-b"
      style={{
        height: "72px",
        backgroundColor: "#141414",
        borderColor: "#2a2a2a",
        boxShadow: "0 1px 0 rgba(200,162,74,0.08)",
      }}
    >
      {/* Brand */}
      <button
        type="button"
        onClick={() => onNavigate("dashboard")}
        className="flex items-center gap-2.5 shrink-0"
        data-ocid="header.logo.link"
        aria-label="Go to Dashboard"
      >
        <div
          className="w-8 h-8 rounded flex items-center justify-center"
          style={{
            backgroundColor: "#C8A24A",
            boxShadow: "0 0 12px rgba(200,162,74,0.3)",
          }}
        >
          <Crown size={16} style={{ color: "#151515" }} />
        </div>
        <span
          className="text-base font-bold tracking-wide"
          style={{
            fontFamily: "Bricolage Grotesque, sans-serif",
            color: "#C8A24A",
          }}
        >
          EliteRead
        </span>
      </button>

      {/* Center nav */}
      <nav
        className="hidden md:flex items-center gap-1"
        aria-label="Main navigation"
      >
        {NAV_LINKS.map((link) => {
          const isActive = currentPage === link.id;
          const isPremium = link.id === "premium";
          return (
            <button
              key={link.id}
              type="button"
              data-ocid={`nav.${link.id}.link`}
              onClick={() => onNavigate(link.id)}
              className="relative px-4 py-2 text-sm font-medium transition-all rounded"
              style={{
                color: isActive ? "#C8A24A" : isPremium ? "#C8A24A" : "#B7B7B7",
                backgroundColor: isActive
                  ? "rgba(200,162,74,0.08)"
                  : "transparent",
              }}
            >
              {isPremium && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "#C8A24A" }}
                />
              )}
              {link.label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full"
                  style={{ backgroundColor: "#C8A24A" }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Bell */}
        <button
          type="button"
          className="relative w-9 h-9 flex items-center justify-center rounded-full transition-colors"
          style={{
            color: "#B7B7B7",
            backgroundColor: "#1A1A1A",
            border: "1px solid #343434",
          }}
          aria-label="Notifications"
          data-ocid="header.notifications.button"
        >
          <Bell size={16} />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: "#e84545" }}
          />
        </button>

        {/* Profile pill */}
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors"
          style={{
            backgroundColor: "#1A1A1A",
            border: "1px solid #343434",
            color: "#EAEAEA",
          }}
          aria-label="My profile"
          data-ocid="header.profile.button"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: "#C8A24A", color: "#151515" }}
          >
            AP
          </div>
          <span
            className="text-sm font-medium hidden sm:block"
            style={{ color: "#EAEAEA" }}
          >
            My Profile
          </span>
        </button>
      </div>
    </header>
  );
}
