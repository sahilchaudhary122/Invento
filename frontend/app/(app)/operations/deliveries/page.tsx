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
  AlertTriangle,
  SlidersHorizontal,
} from "lucide-react";

interface DeliveryItem {
  product: string;
  qty: number;
}

interface Delivery {
  id: number;
  ref: string;
  customer: string;
  date: string;
  source: string;
  items: number;
  qty: number;
  status: "draft" | "waiting" | "ready" | "done" | "canceled";
  lineItems?: DeliveryItem[];
}

const MOCK_DELIVERIES: Delivery[] = [
  { id: 1, ref: "DEL-0031", customer: "Acme Corp", date: "2026-09-25", source: "Main Warehouse", items: 2, qty: 20, status: "done" },
  { id: 2, ref: "DEL-0030", customer: "Beta Industries", date: "2026-09-24", source: "Main Warehouse", items: 3, qty: 35, status: "done" },
  { id: 3, ref: "DEL-0029", customer: "Gamma Retail", date: "2026-09-24", source: "Secondary Warehouse", items: 1, qty: 10, status: "ready" },
  { id: 4, ref: "DEL-0028", customer: "Delta Traders", date: "2026-09-23", source: "Main Warehouse", items: 4, qty: 48, status: "waiting" },
  { id: 5, ref: "DEL-0027", customer: "Epsilon Ltd", date: "2026-09-22", source: "Production Floor", items: 2, qty: 15, status: "draft" },
];

const MOCK_CUSTOMERS = ["Acme Corp", "Beta Industries", "Gamma Retail", "Delta Traders", "Epsilon Ltd"];
const MOCK_WAREHOUSES = ["Main Warehouse", "Secondary Warehouse", "Production Floor"];
const MOCK_PRODUCTS = [
  { name: "Office Chair", available: 150 },
  { name: "Steel Rod", available: 47 },
  { name: "Laptop", available: 12 },
  { name: "Wooden Table", available: 30 },
  { name: "Keyboard", available: 0 },
  { name: "Monitor", available: 68 }
];

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>(MOCK_DELIVERIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // New Delivery Form State
  const [formCustomer, setFormCustomer] = useState(MOCK_CUSTOMERS[0]);
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formWarehouse, setFormWarehouse] = useState(MOCK_WAREHOUSES[0]);
  const [formLines, setFormLines] = useState<Array<{ product: string; qty: string }>>([
    { product: MOCK_PRODUCTS[0].name, qty: "5" },
    { product: MOCK_PRODUCTS[1].name, qty: "10" },
  ]);

  const getProductAvailable = (productName: string) => {
    const prod = MOCK_PRODUCTS.find(p => p.name === productName);
    return prod ? prod.available : 0;
  };

  const handleAddLine = () => {
    setFormLines([...formLines, { product: MOCK_PRODUCTS[0].name, qty: "5" }]);
  };

  const handleRemoveLine = (index: number) => {
    if (formLines.length === 1) return;
    setFormLines(formLines.filter((_, i) => i !== index));
  };

  const hasExceededStock = formLines.some(line => {
    const available = getProductAvailable(line.product);
    const qty = parseInt(line.qty) || 0;
    return qty > available;
  });

  const handleCreateDelivery = (status: "draft" | "done") => {
    const totalQty = formLines.reduce((acc, curr) => acc + (parseInt(curr.qty) || 0), 0);
    const newRef = `DEL-${String(deliveries.length + 32).padStart(4, "0")}`;
    const newDelivery: Delivery = {
      id: Date.now(),
      ref: newRef,
      customer: formCustomer,
      date: formDate,
      source: formWarehouse,
      items: formLines.length,
      qty: totalQty,
      status: status,
      lineItems: formLines.map(l => ({ product: l.product, qty: parseInt(l.qty) || 0 })),
    };

    setDeliveries([newDelivery, ...deliveries]);
    setIsDrawerOpen(false);
  };

  const handleDeleteDelivery = (id: number) => {
    setDeliveries(deliveries.filter(d => d.id !== id));
  };

  // Filter deliveries
  const filteredDeliveries = deliveries.filter(d => {
    const matchesSearch = d.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "All" || d.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Stats calculations
  const totalDeliveriesCount = deliveries.length;
  const pendingCount = deliveries.filter(d => d.status === "draft" || d.status === "waiting" || d.status === "ready").length;
  const completedCount = deliveries.filter(d => d.status === "done").length;
  const totalItemsCount = deliveries.reduce((acc, d) => acc + d.qty, 0);

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
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Delivery Orders</h1>
            <span className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {deliveries.length} deliveries
            </span>
          </div>
          <p className="text-sm text-muted mt-1">Outgoing stock to customers</p>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg shadow-primary/30 hover:scale-105 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          New Delivery
        </button>
      </div>

      {/* STATS ROW (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Deliveries */}
        <div className="rounded-2xl border border-border p-5 bg-white hover:-translate-y-1 transition-all duration-200 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-foreground">{totalDeliveriesCount}</div>
            <div className="text-xs text-muted uppercase font-semibold mt-0.5 tracking-wider">Total Deliveries</div>
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
            placeholder="Search by ref, customer, or source warehouse..."
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
                <th className="py-3.5 px-6 font-semibold">Delivery #</th>
                <th className="py-3.5 px-6 font-semibold">Customer</th>
                <th className="py-3.5 px-6 font-semibold">Date</th>
                <th className="py-3.5 px-6 font-semibold">Source</th>
                <th className="py-3.5 px-6 font-semibold">Items</th>
                <th className="py-3.5 px-6 font-semibold">Status</th>
                <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted">
                    No delivery orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((delivery) => {
                  const statusStyles: Record<string, string> = {
                    draft: "bg-gray-100 text-gray-700",
                    waiting: "bg-amber-100 text-amber-700",
                    ready: "bg-orange-100 text-orange-700",
                    done: "bg-emerald-100 text-emerald-700",
                    canceled: "bg-rose-100 text-rose-700",
                  };

                  return (
                    <tr key={delivery.id} className="hover:bg-background/60 transition-colors">
                      <td className="py-4 px-6 font-mono text-sm text-primary font-semibold">
                        {delivery.ref}
                      </td>
                      <td className="py-4 px-6 font-medium text-foreground">
                        {delivery.customer}
                      </td>
                      <td className="py-4 px-6 text-muted">
                        {delivery.date}
                      </td>
                      <td className="py-4 px-6 text-muted">
                        {delivery.source}
                      </td>
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5 text-muted">
                          <Package className="w-3.5 h-3.5 text-primary" />
                          <span>{delivery.items} items ({delivery.qty} qty)</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold inline-flex items-center gap-1.5 capitalize ${statusStyles[delivery.status] || "bg-gray-100 text-gray-700"}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {delivery.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteDelivery(delivery.id)}
                            className="p-1.5 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Delivery"
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
                <h2 className="text-lg font-bold text-foreground">New Delivery</h2>
                <p className="text-sm text-muted">Fill in delivery order details below</p>
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
              {/* 1. CUSTOMER INFORMATION */}
              <div>
                <label className="block text-xs uppercase text-muted font-bold mb-2 tracking-wider">
                  Customer Information
                </label>
                <select
                  value={formCustomer}
                  onChange={(e) => setFormCustomer(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {MOCK_CUSTOMERS.map((cust) => (
                    <option key={cust} value={cust}>{cust}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase text-muted font-bold mb-2 tracking-wider">
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* 2. SOURCE LOCATION */}
              <div>
                <label className="block text-xs uppercase text-muted font-bold mb-2 tracking-wider">
                  Source Location
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

              {/* 3. PRODUCTS */}
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
                    const available = getProductAvailable(line.product);
                    const qtyNum = parseInt(line.qty) || 0;
                    const isExceeded = qtyNum > available;

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
                            Available: {available}
                          </span>
                          {isExceeded && (
                            <span className="text-rose-600 font-medium inline-flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Only {available} available
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                onClick={() => handleCreateDelivery("draft")}
                className="flex-1 py-3 px-4 rounded-xl border border-purple-300 text-sm font-medium text-primary hover:bg-purple-50 transition text-center"
              >
                Save Draft
              </button>
              <button
                type="button"
                disabled={hasExceededStock}
                onClick={() => handleCreateDelivery("done")}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-primary/30 hover:opacity-95 transition text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Validate Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
