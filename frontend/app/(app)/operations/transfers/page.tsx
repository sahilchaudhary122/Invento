"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  ArrowLeftRight,
  Package,
  Clock,
  CheckCircle2,
  X,
  MoreVertical,
  FileText,
  Trash2,
  ArrowRight,
  MapPin,
  SlidersHorizontal,
  Check,
} from "lucide-react";

interface TransferItem {
  product: string;
  qty: number;
}

interface Transfer {
  id: number;
  ref: string;
  product: string;
  from: string;
  to: string;
  date: string;
  qty: number;
  status: "draft" | "waiting" | "ready" | "done" | "canceled";
  lineItems?: TransferItem[];
}

const MOCK_TRANSFERS: Transfer[] = [
  { id: 1, ref: "TRF-0018", product: "Steel Rod", from: "Main Warehouse", to: "Production Floor", date: "2026-09-25", qty: 30, status: "done" },
  { id: 2, ref: "TRF-0017", product: "Office Chair", from: "Secondary Warehouse", to: "Main Warehouse", date: "2026-09-24", qty: 25, status: "done" },
  { id: 3, ref: "TRF-0016", product: "Laptop", from: "Main Warehouse", to: "Secondary Warehouse", date: "2026-09-24", qty: 10, status: "ready" },
  { id: 4, ref: "TRF-0015", product: "Keyboard", from: "Main Warehouse", to: "Production Floor", date: "2026-09-23", qty: 15, status: "waiting" },
  { id: 5, ref: "TRF-0014", product: "Monitor", from: "Main Warehouse", to: "Secondary Warehouse", date: "2026-09-22", qty: 8, status: "draft" },
];

const MOCK_WAREHOUSES = ["Main Warehouse", "Secondary Warehouse", "Production Floor", "Rack A", "Rack B"];
const MOCK_PRODUCTS = [
  { name: "Office Chair", stock: 150 },
  { name: "Steel Rod", stock: 47 },
  { name: "Laptop", stock: 12 },
  { name: "Wooden Table", stock: 30 },
  { name: "Keyboard", stock: 0 },
  { name: "Monitor", stock: 68 }
];

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>(MOCK_TRANSFERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // New Transfer Form State
  const [formFrom, setFormFrom] = useState(MOCK_WAREHOUSES[0]);
  const [formTo, setFormTo] = useState(MOCK_WAREHOUSES[1]);
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formLines, setFormLines] = useState<Array<{ product: string; qty: string }>>([
    { product: MOCK_PRODUCTS[0].name, qty: "10" },
    { product: MOCK_PRODUCTS[1].name, qty: "15" },
  ]);

  const getProductStock = (productName: string) => {
    const prod = MOCK_PRODUCTS.find(p => p.name === productName);
    return prod ? prod.stock : 0;
  };

  const handleAddLine = () => {
    setFormLines([...formLines, { product: MOCK_PRODUCTS[0].name, qty: "5" }]);
  };

  const handleRemoveLine = (index: number) => {
    if (formLines.length === 1) return;
    setFormLines(formLines.filter((_, i) => i !== index));
  };

  const isSameLocation = formFrom === formTo;
  const hasExceededStock = formLines.some(line => {
    const stock = getProductStock(line.product);
    const qty = parseInt(line.qty) || 0;
    return qty > stock;
  });

  const isFormInvalid = isSameLocation || hasExceededStock;

  const handleCreateTransfer = (status: "draft" | "done") => {
    const totalQty = formLines.reduce((acc, curr) => acc + (parseInt(curr.qty) || 0), 0);
    const newRef = `TRF-${String(transfers.length + 19).padStart(4, "0")}`;
    const newTransfer: Transfer = {
      id: Date.now(),
      ref: newRef,
      product: formLines[0]?.product || "Various Products",
      from: formFrom,
      to: formTo,
      date: formDate,
      qty: totalQty,
      status: status,
      lineItems: formLines.map(l => ({ product: l.product, qty: parseInt(l.qty) || 0 })),
    };

    setTransfers([newTransfer, ...transfers]);
    setIsDrawerOpen(false);
  };

  const handleDeleteTransfer = (id: number) => {
    setTransfers(transfers.filter(t => t.id !== id));
  };

  // Filter transfers
  const filteredTransfers = transfers.filter(t => {
    const matchesSearch = t.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.to.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "All" || t.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Stats calculations
  const totalTransfersCount = transfers.length;
  const pendingCount = transfers.filter(t => t.status === "draft" || t.status === "waiting" || t.status === "ready").length;
  const completedCount = transfers.filter(t => t.status === "done").length;
  const totalMovedCount = transfers.reduce((acc, t) => acc + t.qty, 0);

  // Preview calculations for first line
  const firstLineProduct = formLines[0]?.product || MOCK_PRODUCTS[0].name;
  const firstLineQty = parseInt(formLines[0]?.qty) || 0;
  const sourceStockBefore = getProductStock(firstLineProduct);
  const sourceStockAfter = Math.max(0, sourceStockBefore - firstLineQty);
  const destStockBefore = 20; // Simulated destination starting stock for preview
  const destStockAfter = destStockBefore + firstLineQty;

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-3 text-xs uppercase tracking-wider font-semibold">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            OPERATIONS
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Internal Transfers</h1>
            <span className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {transfers.length} transfers
            </span>
          </div>
          <p className="text-sm text-muted mt-1">Move stock between warehouses and locations</p>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg shadow-primary/30 hover:scale-105 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          New Transfer
        </button>
      </div>

      {/* STATS ROW (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Transfers */}
        <div className="rounded-2xl border border-border p-5 bg-white hover:-translate-y-1 transition-all duration-200 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-foreground">{totalTransfersCount}</div>
            <div className="text-xs text-muted uppercase font-semibold mt-0.5 tracking-wider">Total Transfers</div>
          </div>
        </div>

        {/* Pending */}
        <div className="rounded-2xl border border-border p-5 bg-white hover:-translate-y-1 transition-all duration-200 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-foreground">{pendingCount}</div>
            <div className="text-xs text-muted uppercase font-semibold mt-0.5 tracking-wider">Pending</div>
          </div>
        </div>

        {/* Completed */}
        <div className="rounded-2xl border border-border p-5 bg-white hover:-translate-y-1 transition-all duration-200 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-foreground">{completedCount}</div>
            <div className="text-xs text-muted uppercase font-semibold mt-0.5 tracking-wider">Completed</div>
          </div>
        </div>

        {/* Total Moved */}
        <div className="rounded-2xl border border-border p-5 bg-white hover:-translate-y-1 transition-all duration-200 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Package className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-foreground">{totalMovedCount}</div>
            <div className="text-xs text-muted uppercase font-semibold mt-0.5 tracking-wider">Total Moved</div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="rounded-2xl border border-border p-4 bg-white flex flex-col md:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by ref, product, source, or destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2.5 pl-10 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {["All", "Draft", "Waiting", "Ready", "Done", "Canceled"].map((status) => {
            const isActive = selectedStatus.toLowerCase() === status.toLowerCase();
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "bg-background text-muted hover:bg-slate-100 hover:text-foreground"
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-background transition">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
        </button>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background border-b border-border text-muted text-xs uppercase tracking-wide">
                <th className="py-3.5 px-6 font-semibold">Transfer #</th>
                <th className="py-3.5 px-6 font-semibold">Product</th>
                <th className="py-3.5 px-6 font-semibold">From → To</th>
                <th className="py-3.5 px-6 font-semibold">Date</th>
                <th className="py-3.5 px-6 font-semibold">Qty</th>
                <th className="py-3.5 px-6 font-semibold">Status</th>
                <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted">
                    No internal transfers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((transfer) => {
                  const statusStyles: Record<string, string> = {
                    draft: "bg-gray-100 text-gray-700",
                    waiting: "bg-amber-100 text-amber-700",
                    ready: "bg-orange-100 text-orange-700",
                    done: "bg-emerald-100 text-emerald-700",
                    canceled: "bg-rose-100 text-rose-700",
                  };

                  return (
                    <tr key={transfer.id} className="hover:bg-background/60 transition-colors">
                      <td className="py-4 px-6 font-mono text-sm text-primary font-semibold">
                        {transfer.ref}
                      </td>
                      <td className="py-4 px-6 font-medium text-foreground">
                        {transfer.product}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted">{transfer.from}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="font-bold text-foreground">{transfer.to}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-muted">
                        {transfer.date}
                      </td>
                      <td className="py-4 px-6 font-medium text-foreground">
                        {transfer.qty} units
                      </td>
                      <td className="py-4 px-6">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold inline-flex items-center gap-1.5 capitalize ${statusStyles[transfer.status] || "bg-gray-100 text-gray-700"}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {transfer.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteTransfer(transfer.id)}
                            className="p-1.5 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Transfer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-slate-100 transition">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Panel */}
          <div className="w-full max-w-lg bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300">
            {/* Header */}
            <div className="p-6 border-b border-border flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-foreground">New Transfer</h2>
                <p className="text-sm text-muted">Configure stock transfer between locations</p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-background transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* 1. SOURCE & DESTINATION */}
              <div>
                <label className="block text-xs uppercase text-muted font-bold mb-2 tracking-wider">
                  Source & Destination
                </label>
                <div className="grid grid-cols-11 gap-2 items-center">
                  <div className="col-span-5">
                    <select
                      value={formFrom}
                      onChange={(e) => setFormFrom(e.target.value)}
                      className="w-full py-3 px-3 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                    >
                      {MOCK_WAREHOUSES.map((wh) => (
                        <option key={wh} value={wh}>{wh}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="col-span-5">
                    <select
                      value={formTo}
                      onChange={(e) => setFormTo(e.target.value)}
                      className="w-full py-3 px-3 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                    >
                      {MOCK_WAREHOUSES.map((wh) => (
                        <option key={wh} value={wh}>{wh}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {isSameLocation && (
                  <p className="text-xs text-rose-600 font-medium mt-2">
                    Source and destination must be different
                  </p>
                )}
              </div>

              {/* 2. PRODUCTS */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs uppercase text-muted font-bold tracking-wider">Products</span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Add Line
                  </button>
                </div>

                <div className="space-y-3">
                  {formLines.map((line, index) => {
                    const stock = getProductStock(line.product);
                    return (
                      <div key={index} className="bg-background rounded-lg p-3 border border-border space-y-2">
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-7">
                            <select
                              value={line.product}
                              onChange={(e) => {
                                const newLines = [...formLines];
                                newLines[index].product = e.target.value;
                                setFormLines(newLines);
                              }}
                              className="w-full py-2 px-3 rounded-lg border border-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                              {MOCK_PRODUCTS.map((prod) => (
                                <option key={prod.name} value={prod.name}>{prod.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-3">
                            <input
                              type="number"
                              min="1"
                              placeholder="Qty"
                              value={line.qty}
                              onChange={(e) => {
                                const newLines = [...formLines];
                                newLines[index].qty = e.target.value;
                                setFormLines(newLines);
                              }}
                              className="w-full py-2 px-3 rounded-lg border border-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                          </div>
                          <div className="col-span-2 flex justify-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(index)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                              disabled={formLines.length === 1}
                              title="Remove Line"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs px-1">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium inline-flex items-center">
                            Available: {stock}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. STOCK PREVIEW */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
                <div className="text-xs font-bold text-primary uppercase tracking-wider">
                  Preview After Transfer
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-border space-y-1">
                    <div className="text-muted font-medium truncate">SOURCE - {formFrom}</div>
                    <div className="text-foreground font-semibold flex items-center gap-1.5">
                      <span>{sourceStockBefore}</span>
                      <ArrowRight className="w-3 h-3 text-primary" />
                      <span className="text-primary font-bold">{sourceStockAfter}</span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-border space-y-1">
                    <div className="text-muted font-medium truncate">DESTINATION - {formTo}</div>
                    <div className="text-foreground font-semibold flex items-center gap-1.5">
                      <span>{destStockBefore}</span>
                      <ArrowRight className="w-3 h-3 text-primary" />
                      <span className="text-primary font-bold">{destStockAfter}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-1 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-700" />
                  </div>
                  <span>Total Company Stock: 120 (Unchanged)</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex gap-3 bg-white">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-background transition text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCreateTransfer("draft")}
                className="flex-1 py-3 px-4 rounded-xl border border-purple-300 text-sm font-medium text-primary hover:bg-purple-50 transition text-center"
              >
                Save Draft
              </button>
              <button
                type="button"
                disabled={isFormInvalid}
                onClick={() => handleCreateTransfer("done")}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-primary/30 hover:opacity-95 transition text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Validate Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
