"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Truck,
  Package,
  Clock,
  CheckCircle2,
  X,
  MoreVertical,
  FileText,
  Trash2,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";

interface ReceiptItem {
  product: string;
  qty: number;
}

interface Receipt {
  id: number;
  ref: string;
  supplier: string;
  date: string;
  warehouse: string;
  items: number;
  qty: number;
  status: "draft" | "waiting" | "ready" | "done" | "canceled";
  lineItems?: ReceiptItem[];
}

const MOCK_RECEIPTS: Receipt[] = [
  { id: 1, ref: "REC-0042", supplier: "Steel Corp Ltd", date: "2026-09-25", warehouse: "Main Warehouse", items: 3, qty: 150, status: "done" },
  { id: 2, ref: "REC-0041", supplier: "Office Supplies Inc", date: "2026-09-24", warehouse: "Main Warehouse", items: 5, qty: 250, status: "done" },
  { id: 3, ref: "REC-0040", supplier: "Tech Vendors Co", date: "2026-09-24", warehouse: "Secondary Warehouse", items: 2, qty: 80, status: "ready" },
  { id: 4, ref: "REC-0039", supplier: "Furniture Plus", date: "2026-09-23", warehouse: "Main Warehouse", items: 4, qty: 120, status: "waiting" },
  { id: 5, ref: "REC-0038", supplier: "Raw Materials Ltd", date: "2026-09-22", warehouse: "Production Floor", items: 6, qty: 300, status: "draft" },
];

const MOCK_SUPPLIERS = ["Steel Corp Ltd", "Office Supplies Inc", "Tech Vendors Co", "Furniture Plus", "Raw Materials Ltd"];
const MOCK_WAREHOUSES = ["Main Warehouse", "Secondary Warehouse", "Production Floor"];
const MOCK_PRODUCTS_LIST = ["Office Chair", "Steel Rod", "Laptop", "Wooden Table", "Keyboard", "Monitor"];

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>(MOCK_RECEIPTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // New Receipt Form State
  const [formSupplier, setFormSupplier] = useState(MOCK_SUPPLIERS[0]);
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formWarehouse, setFormWarehouse] = useState(MOCK_WAREHOUSES[0]);
  const [formLines, setFormLines] = useState<Array<{ product: string; qty: string }>>([
    { product: MOCK_PRODUCTS_LIST[0], qty: "10" },
    { product: MOCK_PRODUCTS_LIST[1], qty: "25" },
  ]);

  const handleAddLine = () => {
    setFormLines([...formLines, { product: MOCK_PRODUCTS_LIST[0], qty: "10" }]);
  };

  const handleRemoveLine = (index: number) => {
    if (formLines.length === 1) return;
    setFormLines(formLines.filter((_, i) => i !== index));
  };

  const handleCreateReceipt = (status: "draft" | "done") => {
    const totalQty = formLines.reduce((acc, curr) => acc + (parseInt(curr.qty) || 0), 0);
    const newRef = `REC-${String(receipts.length + 38).padStart(4, "0")}`;
    const newReceipt: Receipt = {
      id: Date.now(),
      ref: newRef,
      supplier: formSupplier,
      date: formDate,
      warehouse: formWarehouse,
      items: formLines.length,
      qty: totalQty,
      status: status,
      lineItems: formLines.map(l => ({ product: l.product, qty: parseInt(l.qty) || 0 })),
    };

    setReceipts([newReceipt, ...receipts]);
    setIsDrawerOpen(false);
  };

  const handleDeleteReceipt = (id: number) => {
    setReceipts(receipts.filter(r => r.id !== id));
  };

  // Filter receipts
  const filteredReceipts = receipts.filter(r => {
    const matchesSearch = r.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.warehouse.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "All" || r.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Stats calculations
  const totalReceiptsCount = receipts.length;
  const pendingCount = receipts.filter(r => r.status === "draft" || r.status === "waiting" || r.status === "ready").length;
  const completedCount = receipts.filter(r => r.status === "done").length;
  const totalItemsCount = receipts.reduce((acc, r) => acc + r.qty, 0);

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-3 text-xs uppercase tracking-wider font-semibold">
            <Truck className="w-3.5 h-3.5" />
            OPERATIONS
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Receipts</h1>
            <span className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {receipts.length} receipts
            </span>
          </div>
          <p className="text-sm text-muted mt-1">Manage incoming stock from suppliers</p>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg shadow-primary/30 hover:scale-105 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          New Receipt
        </button>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Receipts */}
        <div className="rounded-2xl border border-border p-5 bg-white hover:-translate-y-1 transition-all duration-200 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-foreground">{totalReceiptsCount}</div>
            <div className="text-xs text-muted uppercase font-semibold mt-0.5 tracking-wider">Total Receipts</div>
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

        {/* Total Items */}
        <div className="rounded-2xl border border-border p-5 bg-white hover:-translate-y-1 transition-all duration-200 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Package className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-foreground">{totalItemsCount}</div>
            <div className="text-xs text-muted uppercase font-semibold mt-0.5 tracking-wider">Total Items</div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="rounded-2xl border border-border p-4 bg-white flex flex-col md:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by ref, supplier, or warehouse..."
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
                <th className="py-3.5 px-6 font-semibold">Receipt #</th>
                <th className="py-3.5 px-6 font-semibold">Supplier</th>
                <th className="py-3.5 px-6 font-semibold">Date</th>
                <th className="py-3.5 px-6 font-semibold">Warehouse</th>
                <th className="py-3.5 px-6 font-semibold">Items</th>
                <th className="py-3.5 px-6 font-semibold">Status</th>
                <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted">
                    No receipts found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((receipt) => {
                  const statusStyles: Record<string, string> = {
                    draft: "bg-gray-100 text-gray-700",
                    waiting: "bg-amber-100 text-amber-700",
                    ready: "bg-orange-100 text-orange-700",
                    done: "bg-emerald-100 text-emerald-700",
                    canceled: "bg-rose-100 text-rose-700",
                  };

                  return (
                    <tr key={receipt.id} className="hover:bg-background/60 transition-colors">
                      <td className="py-4 px-6 font-mono text-sm text-primary font-semibold">
                        {receipt.ref}
                      </td>
                      <td className="py-4 px-6 font-medium text-foreground">
                        {receipt.supplier}
                      </td>
                      <td className="py-4 px-6 text-muted">
                        {receipt.date}
                      </td>
                      <td className="py-4 px-6 text-muted">
                        {receipt.warehouse}
                      </td>
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5 text-muted">
                          <Package className="w-3.5 h-3.5 text-primary" />
                          <span>{receipt.items} items ({receipt.qty} qty)</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold inline-flex items-center gap-1.5 capitalize ${statusStyles[receipt.status] || "bg-gray-100 text-gray-700"}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {receipt.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteReceipt(receipt.id)}
                            className="p-1.5 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Receipt"
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
                <h2 className="text-lg font-bold text-foreground">New Receipt</h2>
                <p className="text-sm text-muted">Fill in receipt details below</p>
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
              {/* Supplier Information */}
              <div>
                <label className="block text-xs uppercase text-muted font-bold mb-2 tracking-wider">
                  Supplier Information
                </label>
                <select
                  value={formSupplier}
                  onChange={(e) => setFormSupplier(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {MOCK_SUPPLIERS.map((supp) => (
                    <option key={supp} value={supp}>{supp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase text-muted font-bold mb-2 tracking-wider">
                  Receipt Date
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Destination */}
              <div>
                <label className="block text-xs uppercase text-muted font-bold mb-2 tracking-wider">
                  Destination
                </label>
                <select
                  value={formWarehouse}
                  onChange={(e) => setFormWarehouse(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {MOCK_WAREHOUSES.map((wh) => (
                    <option key={wh} value={wh}>{wh}</option>
                  ))}
                </select>
              </div>

              {/* Products */}
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
                  {formLines.map((line, index) => (
                    <div key={index} className="p-3 rounded-xl border border-border bg-background/50 grid grid-cols-12 gap-2 items-center">
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
                          {MOCK_PRODUCTS_LIST.map((prod) => (
                            <option key={prod} value={prod}>{prod}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
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
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
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
                onClick={() => handleCreateReceipt("draft")}
                className="flex-1 py-3 px-4 rounded-xl border border-purple-300 text-sm font-medium text-primary hover:bg-purple-50 transition text-center"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleCreateReceipt("done")}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-primary/30 hover:opacity-95 transition text-center"
              >
                Validate Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
