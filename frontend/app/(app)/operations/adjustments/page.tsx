"use client";

import { useState, useEffect, useCallback } from "react";
import {
  SlidersHorizontal,
  Plus,
  RefreshCw,
  CheckCircle2,
  Package,
  X,
  Loader2,
  WifiOff,
} from "lucide-react";
import { adjustmentsApi } from "@/lib/api/adjustments.api";
import { productsApi } from "@/lib/api/products.api";
import { InventoryAdjustment, Product } from "@/types/operations";
import { ApiResponseError } from "@/lib/api/client";

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // New adjustment form state with lazy initialization
  const [formRef, setFormRef] = useState(() => `ADJ-${Math.floor(100 + Math.random() * 900)}`);
  const [formLocationId, setFormLocationId] = useState("00000000-0000-0000-0000-000000000001");
  const [formReason, setFormReason] = useState("Annual Inventory Count");
  const [formProductId, setFormProductId] = useState("");
  const [formQty, setFormQty] = useState("10");

  const loadData = useCallback(async () => {
    try {
      const [adjRes, prodRes] = await Promise.all([
        adjustmentsApi.list(),
        productsApi.list(),
      ]);
      setAdjustments(adjRes.items ?? []);
      setProducts(prodRes);
      if (prodRes.length > 0 && !formProductId) {
        setFormProductId(prodRes[0].id);
      }
      setIsError(false);
      setErrorMessage(null);
    } catch (err: unknown) {
      setIsError(true);
      if (err instanceof ApiResponseError) {
        setErrorMessage(err.detail);
      } else {
        setErrorMessage("Failed to load inventory adjustments.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [formProductId]);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const [adjRes, prodRes] = await Promise.all([
          adjustmentsApi.list(),
          productsApi.list(),
        ]);
        if (isMounted) {
          setAdjustments(adjRes.items ?? []);
          setProducts(prodRes);
          if (prodRes.length > 0) {
            setFormProductId(prodRes[0].id);
          }
          setIsError(false);
          setErrorMessage(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setIsError(true);
          if (err instanceof ApiResponseError) {
            setErrorMessage(err.detail);
          } else {
            setErrorMessage("Failed to load inventory adjustments.");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProductId || !formRef || !formLocationId) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const newAdj = await adjustmentsApi.create({
        reference: formRef.trim(),
        location_id: formLocationId.trim(),
        reason: formReason.trim(),
        items: [
          {
            product_id: formProductId,
            physical_quantity: parseInt(formQty) || 0,
          },
        ],
      });
      setIsModalOpen(false);
      setFormRef(`ADJ-${Math.floor(100 + Math.random() * 900)}`);
      setAdjustments((prev) => [newAdj, ...prev]);
    } catch (err: unknown) {
      if (err instanceof ApiResponseError) {
        setSubmitError(err.detail);
      } else {
        setSubmitError("Failed to create adjustment.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidate = async (id: number | string) => {
    try {
      const updated = await adjustmentsApi.validate(Number(id));
      setAdjustments((prev) =>
        prev.map((a) => (String(a.id) === String(id) ? updated : a))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to validate adjustment";
      alert(msg);
    }
  };

  const draftCount = adjustments.filter((a) => a.status === "draft").length;
  const validatedCount = adjustments.filter((a) => a.status === "validated").length;
  const cancelledCount = adjustments.filter((a) => a.status === "cancelled").length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted">Loading inventory adjustments...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-2xl border border-border p-16 text-center shadow-sm max-w-lg mx-auto mt-12">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4 text-rose-600">
          <WifiOff className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Could not connect to backend</h3>
        <p className="text-sm text-muted mb-6">{errorMessage || "Ensure backend server is running."}</p>
        <button onClick={loadData} className="btn-primary inline-flex items-center gap-2 cursor-pointer">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="uppercase tracking-wider text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full inline-block mb-3">
            Operations
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Inventory Adjustments
            </h1>
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {adjustments.length} total
            </span>
          </div>
          <p className="text-sm text-muted mt-1">
            Correct physical stock counts. Validate to apply quantity deltas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="btn-secondary flex items-center gap-2 py-2.5 px-4 text-xs cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => {
              setSubmitError(null);
              setIsModalOpen(true);
            }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-primary/35 hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Adjustment
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{draftCount}</p>
            <p className="text-xs text-muted uppercase tracking-wider font-semibold mt-0.5">Draft / Pending</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{validatedCount}</p>
            <p className="text-xs text-muted uppercase tracking-wider font-semibold mt-0.5">Validated</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-gray-500 to-slate-600 shadow-md">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{cancelledCount}</p>
            <p className="text-xs text-muted uppercase tracking-wider font-semibold mt-0.5">Cancelled</p>
          </div>
        </div>
      </div>

      {/* Adjustments Table */}
      {adjustments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-16 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
            <SlidersHorizontal className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No adjustments yet</h3>
          <p className="text-sm text-muted mb-6">
            Create your first inventory adjustment to correct stock counts.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Adjustment
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-muted text-xs uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-6">Reference</th>
                  <th className="py-3.5 px-6">Reason</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Lines</th>
                  <th className="py-3.5 px-6">Created</th>
                  <th className="py-3.5 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {adjustments.map((adj) => {
                  const isDraft = adj.status === "draft";
                  return (
                    <tr key={adj.id} className="hover:bg-background/80 transition-colors">
                      <td className="py-4 px-6 font-mono font-semibold text-gray-900">
                        {adj.reference}
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {adj.reason || "—"}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            isDraft
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isDraft ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                          />
                          {adj.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-800">
                        {adj.items?.length ?? adj.lines?.length ?? 0} items
                      </td>
                      <td className="py-4 px-6 text-muted text-xs">
                        {new Date(adj.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {isDraft ? (
                          <button
                            onClick={() => handleValidate(Number(adj.id))}
                            className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-700 transition shadow-sm cursor-pointer"
                          >
                            Validate
                          </button>
                        ) : (
                          <span className="text-xs text-muted font-medium">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Adjustment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-out z-10">
            <div className="p-6 border-b border-border flex justify-between items-center bg-background/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">New Inventory Adjustment</h2>
                <p className="text-xs text-muted mt-0.5">Correct physical stock levels</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-border text-muted hover:text-gray-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-6 space-y-6">
              {submitError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block text-xs uppercase text-muted font-semibold mb-2 tracking-wider">
                  Adjustment Details
                </label>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-600 font-medium mb-1">
                      Reference *
                    </label>
                    <input
                      type="text"
                      required
                      value={formRef}
                      onChange={(e) => setFormRef(e.target.value)}
                      className="w-full px-4 py-3 bg-background rounded-xl border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 font-medium mb-1">
                      Location UUID *
                    </label>
                    <input
                      type="text"
                      required
                      value={formLocationId}
                      onChange={(e) => setFormLocationId(e.target.value)}
                      className="w-full px-4 py-3 bg-background rounded-xl border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <p className="text-[11px] text-muted mt-1">
                      Warehouse location UUID where stock adjustment takes place.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 font-medium mb-1">
                      Reason
                    </label>
                    <input
                      type="text"
                      value={formReason}
                      onChange={(e) => setFormReason(e.target.value)}
                      className="w-full px-4 py-3 bg-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-muted font-semibold mb-2 tracking-wider">
                  Item Line
                </label>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-600 font-medium mb-1">
                      Product *
                    </label>
                    <select
                      value={formProductId}
                      onChange={(e) => setFormProductId(e.target.value)}
                      required
                      className="w-full px-3 py-3 bg-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 font-medium mb-1">
                      Physical Count (Real Quantity) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formQty}
                      onChange={(e) => setFormQty(e.target.value)}
                      className="w-full px-4 py-3 bg-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary flex-1 justify-center py-3 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium flex-1 justify-center py-3 rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
