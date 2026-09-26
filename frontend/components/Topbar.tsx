"use client";

import { Search, Bell } from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-16 bg-white border-b border-border sticky top-0 z-20 flex items-center justify-between px-6">
      {/* Left side: Search input */}
      <div className="relative w-80 md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        <input
          type="text"
          placeholder="Search products, SKU, operations..."
          className="input pl-10"
        />
      </div>

      {/* Right side: Bell button & User profile */}
      <div className="flex items-center gap-4">
        {/* Bell button with red dot indicator */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 rounded-lg text-muted hover:text-text hover:bg-gray-100 transition"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User avatar & info */}
        <div className="flex items-center gap-3 pl-2 border-l border-border">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
            TR
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text leading-tight">
              Taniya Rajak
            </span>
            <span className="text-xs text-muted leading-tight">
              Inventory Manager
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
