"use client";

import { useState } from "react";
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  Package,
  ArrowRight,
  ArrowLeftRight,
  Truck,
  SlidersHorizontal,
  X,
  Eye,
} from "lucide-react";

interface LedgerItem {
  id: number;
  date: string;
  product: string;
  sku: string;
  operation: "receipt" | "delivery" | "transfer" | "adjustment";
  ref: string;
  from: string;
  to: string;
  qty: number;
  prev: number;
  new: number;
  user: string;
  status: "done" | "canceled" | "pending";
}

const MOCK_LEDGER: LedgerItem[] = [
  { id: 1, date: "2026-09-25 10:23", product: "Office Chair", sku: "CHAIR-001", operation: "receipt", ref: "REC-0042", from: "Supplier", to: "Main Warehouse", qty: 50, prev: 100, new: 150, user: "Taniya R.", status: "done" },
  { id: 2, date: "2026-09-25 09:15", product: "Steel Rod", sku: "STEEL-001", operation: "transfer", ref: "TRF-0018", from: "Main Warehouse", to: "Production Floor", qty: -30, prev: 77, new: 47, user: "Taniya R.", status: "done" },
  { id: 3, date: "2026-09-25 09:15", product: "Steel Rod", sku: "STEEL-001", operation: "transfer", ref: "TRF-0018", from: "Main Warehouse", to: "Production Floor", qty: 30, prev: 0, new: 30, user: "Taniya R.", status: "done" },
  { id: 4, date: "2026-09-24 16:40", product: "Office Chair", sku: "CHAIR-001", operation: "delivery", ref: "DEL-0031", from: "Main Warehouse", to: "Acme Corp", qty: -20, prev: 150, new: 130, user: "Taniya R.", status: "done" },
  { id: 5, date: "2026-09-24 15:20", product: "Steel Rod", sku: "STEEL-001", operation: "adjustment", ref: "ADJ-0007", from: "Main Warehouse", to: "-", qty: -3, prev: 50, new: 47, user: "Taniya R.", status: "done" },
  { id: 6, date: "2026-09-24 12:00", product: "Laptop", sku: "LAPTOP-001", operation: "receipt", ref: "REC-0041", from: "Tech Vendors Co", to: "Main Warehouse", qty: 25, prev: 0, new: 25, user: "Taniya R.", status: "done" },
  { id: 7, date: "2026-09-23 18:30", product: "Monitor", sku: "MON-001", operation: "delivery", ref: "DEL-0030", from: "Main Warehouse", to: "Beta Industries", qty: -15, prev: 83, new: 68, user: "Taniya R.", status: "done" },
  { id: 8, date: "2026-09-23 14:15", product: "Wooden Table", sku: "TABLE-001", operation: "receipt", ref: "REC-0040", from: "Furniture Plus", to: "Main Warehouse", qty: 30, prev: 0, new: 30, user: "Taniya R.", status: "done" },
  { id: 9, date: "2026-09-23 10:00", product: "Keyboard", sku: "KB-001", operation: "adjustment", ref: "ADJ-0004", from: "Main Warehouse", to: "-", qty: -3, prev: 25, new: 22, user: "Taniya R.", status: "done" },
  { id: 10, date: "2026-09-22 17:30", product: "Steel Rod", sku: "STEEL-001", operation: "receipt", ref: "REC-0038", from: "Raw Materials Ltd", to: "Main Warehouse", qty: 100, prev: 0, new: 100, user: "Taniya R.", status: "done" },
  { id: 11, date: "2026-09-22 15:20", product: "Office Chair", sku: "CHAIR-001", operation: "transfer", ref: "TRF-0017", from: "Secondary Warehouse", to: "Main Warehouse", qty: 25, prev: 25, new: 50, user: "Taniya R.", status: "done" },
  { id: 12, date: "2026-09-22 11:00", product: "Monitor", sku: "MON-001", operation: "adjustment", ref: "ADJ-0003", from: "Production Floor", to: "-", qty: 2, prev: 66, new: 68, user: "Taniya R.", status: "done" },
];

export default function HistoryPage() {
  const [ledger, setLedger] = useState<LedgerItem[]>(MOCK_LEDGER);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOperation, setSelectedOperation] = useState<string>("All");
  const [selectedItem, setSelectedItem] = useState<LedgerItem | null>(null);

  // Filter ledger
  const filteredLedger = ledger.filter((item) => {
    const matchesSearch =
      item.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.to.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOp =
      selectedOperation === "All" ||
      item.operation.toLowerCase() === selectedOperation.toLowerCase().replace(/s$/, ""); // e.g. Receipts -> receipt

    return matchesSearch && matchesOp;
  });

  // Stats calculations
  const totalMoves = ledger.length;
  const receiptsCount = ledger.filter((i) => i.operation === "receipt").length;
  const transfersCount = ledger.filter((i) => i.operation === "transfer").length;
  const adjustmentsCount = ledger.filter((i) => i.operation === "adjustment").length;

  const getOperationBadge = (op: LedgerItem["operation"]) => {
    switch (op) {
      case "receipt":
        return (
          <span className="rounded-lg px-2.5 py-1 text-xs font-semibold inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <Truck className="w-3.5 h-3.5" />
            Receipt
          </span>
        );
      case "delivery":
        return (
          <span className="rounded-lg px-2.5 py-1 text-xs font-semibold inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <Truck className="w-3.5 h-3.5" />
            Delivery
          </span>
        );
      case "transfer":
        return (
          <span className="rounded-lg px-2.5 py-1 text-xs font-semibold inline-flex items-center gap-1.5 bg-purple-500/10 text-purple-600 border border-purple-500/20">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Transfer
          </span>
        );
      case "adjustment":
        return (
          <span className="rounded-lg px-2.5 py-1 text-xs font-semibold inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Adjustment
          </span>
        );
    }
  };

  const getOperationIconLarge = (op: LedgerItem["operation"]) => {
    switch (op) {
      case "receipt":
        return <Truck className="w-8 h-8 text-emerald-600" />;
      case "delivery":
        return <Truck className="w-8 h-8 text-blue-600" />;
      case "transfer":
        return <ArrowLeftRight className="w-8 h-8 text-purple-600" />;
      case "adjustment":
        return <SlidersHorizontal className="w-8 h-8 text-amber-600" />;
    }
  };

  const getOperationColorBg = (op: LedgerItem["operation"]) => {
    switch (op) {
      case "receipt":
        return "bg-emerald-500/10 border-emerald-500/20";
      case "delivery":
        return "bg-blue-500/10 border-blue-500/20";
      case "transfer":
        return "bg-purple-500/10 border-purple-500/20";
      case "adjustment":
        return "bg-amber-500/10 border-amber-500/20";
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 border border-purple-500/20">
              <History className="w-3.5 h-3.5" />
              AUDIT
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Move History</h1>
            <span className="px-3 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
              12 entries
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Complete audit trail of all stock movements
          </p>
        </div>

        <button
          onClick={() => alert("Exporting CSV audit log...")}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-card border border-border/80 hover:bg-muted text-foreground shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-muted-foreground" />
          Export CSV
        </button>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Moves */}
        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="space-y-1 z-10">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Moves</p>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{totalMoves}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 z-10">
            <History className="w-6 h-6" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all" />
        </div>

        {/* Receipts */}
        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="space-y-1 z-10">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Receipts</p>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{receiptsCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 z-10">
            <Truck className="w-6 h-6" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
        </div>

        {/* Transfers */}
        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="space-y-1 z-10">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Transfers</p>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{transfersCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 z-10">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all" />
        </div>

        {/* Adjustments */}
        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="space-y-1 z-10">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Adjustments</p>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{adjustmentsCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 z-10">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all" />
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-card p-4 rounded-2xl border border-border/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search moves, products, SKUs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {["All", "Receipts", "Deliveries", "Transfers", "Adjustments"].map((op) => (
            <button
              key={op}
              onClick={() => setSelectedOperation(op)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedOperation === op
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {op}
            </button>
          ))}
          <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-all ml-auto">
            <Calendar className="w-3.5 h-3.5" />
            Date Range
          </button>
          <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
            <Filter className="w-3.5 h-3.5" />
            More Filters
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-background text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Operation</th>
                <th className="py-4 px-6 text-right">Quantity</th>
                <th className="py-4 px-6">From → To</th>
                <th className="py-4 px-6">Prev → New</th>
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-sm">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No ledger entries found matching your search.
                  </td>
                </tr>
              ) : (
                filteredLedger.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-foreground">{item.product}</div>
                      <div className="font-mono text-xs text-muted-foreground">{item.sku}</div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {getOperationBadge(item.operation)}
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{item.ref}</div>
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold whitespace-nowrap">
                      {item.qty > 0 ? (
                        <span className="text-emerald-600">+{item.qty}</span>
                      ) : (
                        <span className="text-rose-600">{item.qty}</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-muted-foreground truncate max-w-[100px]">{item.from}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="font-medium text-foreground truncate max-w-[100px]">{item.to}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs whitespace-nowrap">
                      <span className="text-muted-foreground">{item.prev}</span>
                      <span className="mx-1.5 text-muted-foreground">→</span>
                      <span className="font-bold text-foreground">{item.new}</span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-full text-xs font-medium text-foreground">
                        <span className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-600 font-bold flex items-center justify-center text-[10px]">
                          TR
                        </span>
                        {item.user}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="View Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW DETAIL DRAWER */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex overflow-hidden">
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedItem(null)}
          />
          <div className="w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 z-10">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-purple-600">{selectedItem.ref}</span>
                <span className="text-xs text-muted-foreground">Movement Detail</span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Big Icon & Title */}
              <div className="flex flex-col items-center text-center pb-6 border-b border-border/60">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border shadow-inner mb-4 ${getOperationColorBg(selectedItem.operation)}`}>
                  {getOperationIconLarge(selectedItem.operation)}
                </div>
                <h3 className="text-xl font-bold text-foreground capitalize">{selectedItem.operation} Operation</h3>
                <p className="text-xs font-mono text-purple-600 mt-1 font-semibold">{selectedItem.ref}</p>
                <div className="mt-3">
                  {getOperationBadge(selectedItem.operation)}
                </div>
              </div>

              {/* Details Grid */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transaction Info</h4>
                
                <div className="bg-muted/30 rounded-2xl p-4 border border-border/60 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Product</span>
                    <span className="font-semibold text-foreground">{selectedItem.product}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">SKU</span>
                    <span className="font-mono text-xs text-foreground">{selectedItem.sku}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Timestamp</span>
                    <span className="font-mono text-xs text-foreground">{selectedItem.date}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Quantity Change</span>
                    <span className={`font-mono font-bold text-base ${selectedItem.qty > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {selectedItem.qty > 0 ? `+${selectedItem.qty}` : selectedItem.qty}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Route</span>
                    <span className="font-medium text-foreground flex items-center gap-1.5 text-xs">
                      {selectedItem.from} <ArrowRight className="w-3 h-3 text-muted-foreground" /> {selectedItem.to}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Performed By</span>
                    <span className="font-medium text-foreground">{selectedItem.user}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium text-emerald-600 capitalize">{selectedItem.status}</span>
                  </div>
                </div>
              </div>

              {/* Visual Flow Before -> After */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock Level Impact</h4>
                
                <div className="bg-card rounded-2xl p-5 border border-border/60 flex items-center justify-between relative">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Before</span>
                    <div className="font-mono text-2xl font-bold text-muted-foreground">{selectedItem.prev}</div>
                  </div>

                  <div className="flex-1 flex items-center justify-center px-4">
                    <div className="h-0.5 w-full bg-border relative flex items-center justify-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono z-10 ${selectedItem.qty > 0 ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border border-rose-500/20"}`}>
                        {selectedItem.qty > 0 ? `+${selectedItem.qty}` : selectedItem.qty}
                      </span>
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">After</span>
                    <div className="font-mono text-2xl font-bold text-foreground">{selectedItem.new}</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border/60 bg-muted/20 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="w-full py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted text-foreground transition-colors"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
