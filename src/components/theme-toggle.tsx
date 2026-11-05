"use client";

import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY, type ThemeChoice } from "@/lib/theme";

const OPTIONS: ThemeChoice[] = ["system", "light", "dark"];

function applyTheme(choice: ThemeChoice): void {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  if (choice !== "system") root.classList.add(choice);
  try {
    if (choice === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    // storage unavailable: the choice still applies for this page view
  }
}

export default function ThemeToggle() {
  const [choice, setChoice] = useState<ThemeChoice>("system");

  useEffect(() => {
    const root = document.documentElement;
    setChoice(
      root.classList.contains("dark")
        ? "dark"
        : root.classList.contains("light")
          ? "light"
          : "system",
    );
  }, []);

  const next = OPTIONS[(OPTIONS.indexOf(choice) + 1) % OPTIONS.length];

  const choose = (option: ThemeChoice) => {
    setChoice(option);
    applyTheme(option);
  };

  return (
    <>
      <button
        type="button"
        aria-label={`Color theme: ${choice}. Switch to ${next}`}
        onClick={() => choose(next)}
        className="inline-flex h-11 w-11 items-center justify-center rounded border border-bp-line text-bp-muted transition-colors duration-150 hover:border-bp-accent hover:text-bp-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bp-accent motion-reduce:transition-none sm:hidden"
      >
        <svg
          aria-hidden="true"
          focusable="false"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {choice === "system" && (
            <>
              <rect x="3" y="4" width="18" height="12" rx="1" />
              <path d="M8 20h8M12 16v4" />
            </>
          )}
          {choice === "light" && (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </>
          )}
          {choice === "dark" && (
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          )}
        </svg>
      </button>
      <div
        role="group"
        aria-label="Color theme"
        className="hidden rounded border border-bp-line font-mono text-xs sm:inline-flex"
      >
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={choice === option}
            onClick={() => choose(option)}
            className="px-2.5 py-1 uppercase tracking-wide text-bp-muted transition-colors duration-150 aria-pressed:bg-bp-accent aria-pressed:text-bp-bg hover:text-bp-ink"
          >
            {option}
          </button>
        ))}
      </div>
    </>
  );
}
