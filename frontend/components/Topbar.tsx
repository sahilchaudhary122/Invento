"use client";

import { Search, Bell, Sun, Moon, Menu } from "lucide-react";
import { useEffect, useState } from "react";

export default function Topbar() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as "light" | "dark") || "light";
    }
    return "light";
  });
  const [mounted] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const toggleSidebar = () => {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    sidebar.classList.toggle("-translate-x-full");
  };

  return (
    <header className="h-16 bg-surface border-b border-border sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 transition-colors">
      {/* Left: Hamburger + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={toggleSidebar}
          className="lg:hidden w-10 h-10 rounded-lg hover:bg-background flex items-center justify-center transition-colors flex-shrink-0"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-muted" />
        </button>

        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search products..."
            className="input pl-9"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-3">
        {mounted && (
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-lg hover:bg-background flex items-center justify-center transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-muted" />
            ) : (
              <Sun className="w-5 h-5 text-warning" />
            )}
          </button>
        )}

        <button className="relative w-10 h-10 rounded-lg hover:bg-background flex items-center justify-center transition-colors">
          <Bell className="w-5 h-5 text-muted" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger" />
        </button>

        <div className="flex items-center gap-3 pl-2 md:pl-3 border-l border-border">
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
            TR
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold leading-tight text-text">Taniya Rajak</p>
            <p className="text-xs text-muted">Inventory Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
}
