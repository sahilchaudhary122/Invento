"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  Package,
  Clock,
  CheckCircle2,
  X,
  MoreVertical,
  FileText,
  Trash2,
  AlertTriangle,
  Calculator,
  TrendingDown,
  TrendingUp,
  ChevronDown,
} from "lucide-react";

interface Adjustment {
  id: number;
  ref: string;
  product: string;
  location: string;
  date: string;
  system_qty: number;
  counted_qty: number;
  diff: number;
  reason: string;
  status: "draft" | "waiting" | "ready" | "done" | "canceled";
}

const MOCK_ADJUSTMENTS: Adjustment[] = [
  { id: 1, ref: "ADJ-0007", product: "Steel Rod", location: "Main Warehouse", date: "2026-09-25", system_qty: 47, counted_qty: 44, diff: -3, reason: "Damaged stock", status: "done" },
  { id: 2, ref: "ADJ-0006", product: "Office Chair", location: "Main Warehouse", date: "2026-09-24", system_qty: 150, counted_qty: 152, diff: 2, reason: "Found extra units", status: "done" },
  { id: 3, ref: "ADJ-0005", product: "Laptop", location: "Secondary Warehouse", date: "2026-09-24", system_qty: 12, counted_qty: 10, diff: -2, reason: "Theft", status: "ready" },
  { id: 4, ref: "ADJ-0004", product: "Keyboard", location: "Main Warehouse", date: "2026-09-23", system_qty: 25, counted_qty: 22, diff: -3, reason: "Damaged in storage", status: "waiting" },
  { id: 5, ref: "ADJ-0003", product: "Monitor", location: "Production Floor", date: "2026-09-22", system_qty: 68, counted_qty: 70, diff: 2, reason: "Recount correction", status: "draft" },
];

const MOCK_PRODUCTS = [
  { name: "Office Chair", location: "Main Warehouse", system_qty: 150 },
  { name: "Steel Rod", location: "Main Warehouse", system_qty: 47 },
  { name: "Laptop", location: "Secondary Warehouse", system_qty: 12 },
  { name: "Wooden Table", location: "Main Warehouse", system_qty: 30 },
  { name: "Keyboard", location: "Main Warehouse", system_qty: 25 },
  { name: "Monitor", location: "Production Floor", system_qty: 68 },
];

const MOCK_LOCATIONS = ["Main Warehouse", "Secondary Warehouse", "Production Floor", "Rack A", "Rack B"];
const MOCK_REASONS = ["Damaged stock", "Theft", "Found extra units", "Recount correction", "Quality issue", "Other"];

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>(MOCK_ADJUSTMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // New Adjustment Form State
  const [selectedProduct, setSelectedProduct] = useState(MOCK_PRODUCTS[0].name);
  const [formLocation, setFormLocation] = useState(MOCK_PRODUCTS[0].location);
  const [systemQty, setSystemQty] = useState(MOCK_PRODUCTS[0].system_qty);
  const [countedQty, setCountedQty] = useState<string>("");
  const [formReason, setFormReason] = useState(MOCK_REASONS[0]);
  const [formNotes, setFormNotes] = useState("");

  // Update location and system qty when product changes
  useEffect(() => {
    const prod = MOCK_PRODUCTS.find((p) => p.name === selectedProduct);
    if (prod) {
      setFormLocation(prod.location);
      setSystemQty(prod.system_qty);
    }
  }, [selectedProduct]);

  const parsedCounted = parseInt(countedQty);
  const hasCounted = !isNaN(parsedCounted) && countedQty.trim() !== "";
  const diff = hasCounted ? parsedCounted - systemQty : 0;

  const handleCreateAdjustment = (status: "draft" | "done") => {
    if (!hasCounted) return;
    const newRef = `ADJ-${String(adjustments.length + 8).padStart(4, "0")}`;
    const newAdj: Adjustment = {
      id: Date.now(),
      ref: newRef,
      product: selectedProduct,
      location: formLocation,
      date: new Date().toISOString().split("T")[0],
      system_qty: systemQty,
      counted_qty: parsedCounted,
      diff: diff,
      reason: formReason,
      status: status,
    };

    setAdjustments([newAdj, ...adjustments]);
    setIsDrawerOpen(false);
    // Reset form
    setCountedQty("");
    setFormNotes("");
  };

  const handleDeleteAdjustment = (id: number) => {
    setAdjustments(adjustments.filter((a) => a.id !== id));
  };

  // Filtered adjustments
  const filteredAdjustments = adjustments.filter((a) => {
    const matchesSearch =
      a.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "All" || a.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Stats calculations
  const totalAdjustments = adjustments.length;
  const pendingCount = adjustments.filter((a) => a.status === "draft" || a.status === "waiting" || a.status === "ready").length;
  const doneCount = adjustments.filter((a) => a.status === "done").length;
  const totalCorrectedAbsolute = adjustments.reduce((acc, curr) => acc + Math.abs(curr.diff), 0);

  const getStatusBadge = (status: Adjustment["status"]) => {
    switch (status) {
      case "done":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            Done
          </span>
        );
      case "ready":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20">
            Ready
          </span>
        );
      case "waiting":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
            Waiting
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-600 border border-zinc-500/20">
            Draft
          </span>
        );
      case "canceled":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 border border-rose-500/20">
            Canceled
          </span>
        );
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 border border-purple-500/20">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              OPERATIONS
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Inventory Adjustments</h1>
            <span className="px-3 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
              {totalAdjustments} adjustments
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Correct stock mismatches between system and physical count
          </p>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 transition-all transform active:scale-95"
        >
          <Plus className="w-5 h-5" />
          New Adjustment
        </button>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Adjustments */}
        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="space-y-1 z-10">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Adjustments</p>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{totalAdjustments}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 z-10">
            <FileText className="w-6 h-6" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all" />
        </div>

        {/* Pending */}
        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="space-y-1 z-10">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending</p>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{pendingCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 z-10">
            <Clock className="w-6 h-6" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all" />
        </div>

        {/* Completed */}
        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="space-y-1 z-10">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Completed</p>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{doneCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 z-10">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
        </div>

        {/* Total Corrected */}
        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="space-y-1 z-10">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Corrected</p>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{totalCorrectedAbsolute} <span className="text-xs font-normal text-muted-foreground">units</span></h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 z-10">
            <Calculator className="w-6 h-6" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all" />
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border/60 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search adjustments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {["All", "Draft", "Waiting", "Ready", "Done", "Canceled"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedStatus === status
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {status}
            </button>
          ))}
          <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all ml-auto">
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-4 px-6">Adjustment #</th>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6 text-right">System</th>
                <th className="py-4 px-6 text-right">Counted</th>
                <th className="py-4 px-6 text-right">Diff</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-sm">
              {filteredAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    No adjustments found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map((adj) => (
                  <tr key={adj.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="py-4 px-6 font-mono text-purple-600 dark:text-purple-400 font-semibold">
                      {adj.ref}
                    </td>
                    <td className="py-4 px-6 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        {adj.product}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">{adj.location}</td>
                    <td className="py-4 px-6 text-muted-foreground">{adj.date}</td>
                    <td className="py-4 px-6 text-right font-mono text-muted-foreground">{adj.system_qty}</td>
                    <td className="py-4 px-6 text-right font-mono font-medium text-foreground">{adj.counted_qty}</td>
                    <td className="py-4 px-6 text-right font-mono">
                      {adj.diff > 0 ? (
                        <span className="inline-flex items-center justify-end gap-1 text-emerald-600 font-bold">
                          <TrendingUp className="w-3.5 h-3.5" />
                          +{adj.diff}
                        </span>
                      ) : adj.diff < 0 ? (
                        <span className="inline-flex items-center justify-end gap-1 text-rose-600 font-bold">
                          <TrendingDown className="w-3.5 h-3.5" />
                          {adj.diff}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(adj.status)}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDeleteAdjustment(adj.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">New Adjustment</h2>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 1. SELECT ITEM */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">1. Select Item</h3>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Product</label>
                    <div className="relative">
                      <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all pr-10"
                      >
                        {MOCK_PRODUCTS.map((p) => (
                          <option key={p.name} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Location</label>
                    <div className="relative">
                      <select
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all pr-10"
                      >
                        {MOCK_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* 2. PHYSICAL COUNT */}
                <div className="space-y-4 bg-primary/5 rounded-2xl p-4 border border-primary/20">
                  <h3 className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">2. Physical Count</h3>

                  <div className="flex items-center justify-between bg-background/60 p-3 rounded-xl border border-border/40">
                    <span className="text-xs font-medium text-muted-foreground">System Quantity</span>
                    <span className="font-mono text-2xl font-bold text-foreground">{systemQty}</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Physical Count</label>
                    <input
                      type="number"
                      placeholder="Enter counted quantity..."
                      value={countedQty}
                      onChange={(e) => setCountedQty(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-base font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    />
                  </div>

                  {/* Difference box */}
                  <div className="p-3.5 rounded-xl bg-background border border-border/60 space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Difference</span>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {diff > 0 ? (
                          <span className="text-2xl font-bold font-mono text-emerald-600 flex items-center gap-1">
                            <TrendingUp className="w-5 h-5" />
                            +{diff}
                          </span>
                        ) : diff < 0 ? (
                          <span className="text-2xl font-bold font-mono text-rose-600 flex items-center gap-1">
                            <TrendingDown className="w-5 h-5" />
                            {diff}
                          </span>
                        ) : (
                          <span className="text-2xl font-bold font-mono text-muted-foreground">0</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {diff > 0 ? "Surplus" : diff < 0 ? "Shortage" : "Balanced"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground pt-1 border-t border-border/40 mt-2">
                      Stock will be{" "}
                      <span className="font-semibold text-foreground">
                        {diff > 0 ? "increased" : diff < 0 ? "decreased" : "set"}
                      </span>{" "}
                      by {Math.abs(diff)} units
                    </p>
                  </div>
                </div>

                {/* 3. REASON */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">3. Reason & Notes</h3>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Adjustment Reason</label>
                    <div className="relative">
                      <select
                        value={formReason}
                        onChange={(e) => setFormReason(e.target.value)}
                        className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all pr-10"
                      >
                        {MOCK_REASONS.map((reason) => (
                          <option key={reason} value={reason}>
                            {reason}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Additional Notes (Optional)</label>
                    <textarea
                      rows={3}
                      placeholder="Additional details..."
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* 4. INFO BOX */}
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    Adjustments are permanent. They will be logged in Move History for audit.
                  </p>
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-border/60 bg-muted/20 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCreateAdjustment("draft")}
                  disabled={!hasCounted}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => handleCreateAdjustment("done")}
                  disabled={!hasCounted}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Validate Adjustment
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
