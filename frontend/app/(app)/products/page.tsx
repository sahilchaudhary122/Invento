"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  X,
  Package,
  AlertTriangle,
  CheckCircle2,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Info,
  Loader2,
  WifiOff,
} from "lucide-react";
import { productsApi } from "@/lib/api/products.api";
import { categoriesApi } from "@/lib/api/categories.api";
import { Product, Category } from "@/types/operations";
import { ApiResponseError } from "@/lib/api/client";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form state for new product
  const [formName, setFormName] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formUom, setFormUom] = useState("unit");
  const [formReorder, setFormReorder] = useState("10");

  const loadData = useCallback(async () => {
    try {
      const [prodsData, catsData] = await Promise.all([
        productsApi.list(),
        categoriesApi.list(),
      ]);
      setProducts(prodsData);
      setCategories(catsData);
      if (catsData.length > 0) {
        setFormCategory((prev) => (prev ? prev : catsData[0].id));
      }
      setIsError(false);
      setErrorMessage(null);
    } catch (err: unknown) {
      setIsError(true);
      if (err instanceof ApiResponseError) {
        setErrorMessage(err.detail);
      } else {
        setErrorMessage("Failed to load products or categories from the server.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const [prodsData, catsData] = await Promise.all([
          productsApi.list(),
          categoriesApi.list(),
        ]);
        if (isMounted) {
          setProducts(prodsData);
          setCategories(catsData);
          if (catsData.length > 0) {
            setFormCategory((prev) => (prev ? prev : catsData[0].id));
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
            setErrorMessage("Failed to load products or categories from the server.");
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

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "Uncategorized";
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "Uncategorized";
  };

  const categoryNames = ["All", ...categories.map((c) => c.name)];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const catName = getCategoryName(p.category_id);
    const matchesCat =
      selectedCategory === "All" || catName === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => {
    const stock = p.stock_on_hand ?? 0;
    const reorder = p.reorder_threshold ?? 0;
    return stock === 0 || stock <= reorder;
  }).length;
  const healthyCount = totalProducts - lowStockCount;

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formSku || !formCategory) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await productsApi.create({
        name: formName.trim(),
        sku: formSku.trim().toUpperCase(),
        category_id: formCategory,
        unit_of_measure: formUom,
        reorder_threshold: parseInt(formReorder) || 0,
        is_active: true,
      });

      setIsDrawerOpen(false);
      // Reset form
      setFormName("");
      setFormSku("");
      setFormReorder("10");
      if (categories.length > 0) {
        setFormCategory(categories[0].id);
      }
      // Refresh products list
      await loadData();
    } catch (err: unknown) {
      if (err instanceof ApiResponseError) {
        setSubmitError(err.detail);
      } else {
        setSubmitError("Failed to create product.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted">Loading products inventory...</p>
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="uppercase tracking-wider text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full inline-block mb-3">
            Catalog
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Products
            </h1>
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {filteredProducts.length} items
            </span>
          </div>
          <p className="text-sm text-muted mt-1">
            Manage inventory items, stock levels, and reorder points
          </p>
        </div>
        <button
          onClick={() => {
            setSubmitError(null);
            setIsDrawerOpen(true);
          }}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-border p-5 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{totalProducts}</p>
            <p className="text-xs text-muted uppercase tracking-wider font-semibold mt-0.5">Total Products</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{lowStockCount}</p>
            <p className="text-xs text-muted uppercase tracking-wider font-semibold mt-0.5">Low Stock / Out</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{healthyCount}</p>
            <p className="text-xs text-muted uppercase tracking-wider font-semibold mt-0.5">Healthy Stock</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-border p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search products or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categoryNames.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-sm"
                    : "bg-background text-muted hover:bg-border/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button className="btn-secondary flex items-center gap-2 py-2 px-3 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>

          <div className="flex items-center bg-background border border-border rounded-xl p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "table" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-gray-900"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-gray-900"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Table / Grid Container */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-16 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
            <Package className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
          <p className="text-sm text-muted mb-6">
            Try a different search or add a new product
          </p>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="btn-primary inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-muted text-xs uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-6">SKU</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6 text-right">Stock</th>
                  <th className="py-3.5 px-6 text-right">Reorder</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filteredProducts.map((product) => {
                  const stock = product.stock_on_hand ?? 0;
                  const reorder = product.reorder_threshold ?? 0;
                  const isOut = stock === 0;
                  const isLow = stock <= reorder && !isOut;
                  const progressPct = Math.min(
                    (stock / (Math.max(reorder, 1) * 3)) * 100,
                    100
                  );
                  const catName = getCategoryName(product.category_id);
                  const uom = product.unit_of_measure || "unit";

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-background/80 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="font-semibold text-base text-gray-900">
                          {product.name}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-muted">
                        {product.sku}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/5 text-primary border border-primary/20">
                          {catName}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {stock}{" "}
                          <span className="text-xs text-muted font-normal">
                            {uom}
                          </span>
                        </div>
                        <div className="w-24 ml-auto mt-1.5 h-1.5 rounded-full bg-border overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isOut
                                ? "bg-rose-500"
                                : isLow
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.max(progressPct, 5)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right text-muted font-medium">
                        {reorder} {uom}
                      </td>
                      <td className="py-4 px-6">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Healthy
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button className="p-2 rounded-lg hover:bg-border transition-colors text-muted hover:text-gray-900 cursor-pointer">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const stock = product.stock_on_hand ?? 0;
            const reorder = product.reorder_threshold ?? 0;
            const isOut = stock === 0;
            const isLow = stock <= reorder && !isOut;
            const progressPct = Math.min(
              (stock / (Math.max(reorder, 1) * 3)) * 100,
              100
            );
            const catName = getCategoryName(product.category_id);
            const uom = product.unit_of_measure || "unit";

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/5 text-primary border border-primary/20">
                      {catName}
                    </span>
                    <button className="p-1.5 rounded-lg hover:bg-border transition-colors text-muted hover:text-gray-900 cursor-pointer">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-0.5">
                    {product.name}
                  </h3>
                  <p className="font-mono text-xs text-muted mb-4">{product.sku}</p>

                  <div className="bg-background rounded-xl p-4 mb-4 border border-border/60">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted font-medium uppercase tracking-wider">
                        Current Stock
                      </span>
                      <span className="text-xl font-extrabold text-gray-900">
                        {stock} <span className="text-xs text-muted font-normal">{uom}</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isOut
                            ? "bg-rose-500"
                            : isLow
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.max(progressPct, 5)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted">
                    Reorder at: <strong className="text-gray-800">{reorder} {uom}</strong>
                  </span>
                  {isOut ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      Out
                    </span>
                  ) : isLow ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Low
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Healthy
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Panel */}
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-out z-10">
            {/* Header */}
            <div className="p-6 border-b border-border flex justify-between items-center bg-background/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add Product</h2>
                <p className="text-xs text-muted mt-0.5">
                  Create a new inventory item
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-lg hover:bg-border text-muted hover:text-gray-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleAddProduct} className="flex-1 overflow-y-auto p-6 space-y-6">
              {submitError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block text-xs uppercase text-muted font-semibold mb-2 tracking-wider">
                  Basic Info
                </label>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-600 font-medium mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ergonomic Standing Desk"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-4 py-3 bg-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 font-medium mb-1">
                      SKU Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DESK-001"
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      className="w-full px-4 py-3 bg-background rounded-xl border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-muted font-semibold mb-2 tracking-wider">
                  Classification
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 font-medium mb-1">
                      Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      required
                      className="w-full px-3 py-3 bg-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 font-medium mb-1">
                      Unit of Measure
                    </label>
                    <select
                      value={formUom}
                      onChange={(e) => setFormUom(e.target.value)}
                      className="w-full px-3 py-3 bg-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="unit">unit</option>
                      <option value="units">units</option>
                      <option value="kg">kg</option>
                      <option value="pcs">pcs</option>
                      <option value="boxes">boxes</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-muted font-semibold mb-2 tracking-wider">
                  Stock Settings
                </label>
                <div>
                  <label className="block text-xs text-gray-600 font-medium mb-1">
                    Reorder Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formReorder}
                    onChange={(e) => setFormReorder(e.target.value)}
                    className="w-full px-4 py-3 bg-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-3 items-start">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted leading-relaxed">
                  Reorder level is the minimum stock before a low-stock alert is triggered across warehouses.
                </p>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-border flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="btn-secondary flex-1 justify-center py-3 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium flex-1 justify-center py-3 rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Save Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
