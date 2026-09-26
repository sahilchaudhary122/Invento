
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Package, ClipboardList, Truck, ArrowLeftRight,
  SlidersHorizontal, History, Settings, User, LogOut, ChevronDown,
  Warehouse as WarehouseIcon, Building2,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [opsOpen, setOpsOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">Invento</h1>
            <p className="text-xs text-muted">Inventory MS</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" active={isActive("/dashboard")} />
        <NavItem href="/products" icon={Package} label="Products" active={isActive("/products")} />

        {/* Operations Group */}
        <button
          onClick={() => setOpsOpen(!opsOpen)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-muted hover:bg-background transition mt-1"
        >
          <span className="flex items-center gap-3">
            <ClipboardList className="w-4 h-4" />
            Operations
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${opsOpen ? "" : "-rotate-90"}`} />
        </button>

        {opsOpen && (
          <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-border pl-3">
            <NavItem href="/operations/receipts" icon={Truck} label="Receipts" active={isActive("/operations/receipts")} small />
            <NavItem href="/operations/deliveries" icon={Truck} label="Deliveries" active={isActive("/operations/deliveries")} small />
            <NavItem href="/operations/transfers" icon={ArrowLeftRight} label="Transfers" active={isActive("/operations/transfers")} small />
            <NavItem href="/operations/adjustments" icon={SlidersHorizontal} label="Adjustments" active={isActive("/operations/adjustments")} small />
          </div>
        )}

        <NavItem href="/history" icon={History} label="Move History" active={isActive("/history")} />

        {/* Settings Group */}
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-muted hover:bg-background transition mt-1"
        >
          <span className="flex items-center gap-3">
            <Settings className="w-4 h-4" />
            Settings
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${settingsOpen ? "" : "-rotate-90"}`} />
        </button>

        {settingsOpen && (
          <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-border pl-3">
            <NavItem href="/settings/warehouses" icon={WarehouseIcon} label="Warehouses" active={isActive("/settings/warehouses")} small />
            <NavItem href="/settings/locations" icon={Building2} label="Locations" active={isActive("/settings/locations")} small />
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-border">
          <NavItem href="/profile" icon={User} label="My Profile" active={isActive("/profile")} />
          <button
            onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-danger hover:bg-red-50 transition mt-1"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-border text-xs text-muted">
        Odoo Hackathon 2026
      </div>
    </aside>
  );
}

function NavItem({
  href, icon: Icon, label, active, small,
}: {
  href: string; icon: any; label: string; active: boolean; small?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition mt-0.5 ${
        active
          ? "bg-primary text-white"
          : "text-muted hover:bg-background hover:text-text"
      } ${small ? "text-[13px]" : ""}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}