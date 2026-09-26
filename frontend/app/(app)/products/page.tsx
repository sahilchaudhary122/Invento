"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  X,
  Package,
  AlertTriangle,
  CheckCircle2,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Info,
} from "lucide-react";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  uom: string;
  reorder_point: number;
  low_stock: boolean;
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "1",
    sku: "CHAIR-001",
    name: "Office Chair",
    category: "Furniture",
    stock: 150,
    uom: "units",
    reorder_point: 20,
    low_stock: false,
  },
  {
    id: "2",
    sku: "STEEL-001",
    name: "Steel Rod",
    category: "Raw Materials",
    stock: 47,
    uom: "kg",
    reorder_point: 50,
    low_stock: true,
  },
  {
    id: "3",
    sku: "LAPTOP-001",
    name: "Laptop",
    category: "Electronics",
    stock: 12,
    uom: "units",
    reorder_point: 15,
    low_stock: true,
  },
  {
    id: "4",
    sku: "TABLE-001",
    name: "Wooden Table",
    category: "Furniture",
    stock: 30,
    uom: "units",
    reorder_point: 10,
    low_stock: false,
  },
  {
    id: "5",
    sku: "KB-001",
    name: "Keyboard",
    category: "Electronics",
    stock: 0,
    uom: "units",
    reorder_point: 25,
    low_stock: true,
  },
  {
    id: "6",
    sku: "MON-001",
    name: "Monitor",
    category: "Electronics",
    stock: 68,
    uom: "units",
    reorder_point: 20,
    low_stock: false,
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form state for new product
  const [formName, setFormName] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formCategory, setFormCategory] = useState("Furniture");
  const [formUom, setFormUom] = useState("units");
  const [formStock, setFormStock] = useState("10");
  const [formReorder, setFormReorder] = useState("15");

  const categories = ["All", "Furniture", "Raw Materials", "Electronics"];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => p.stock === 0 || p.low_stock).length;
  const healthyCount = totalProducts - lowStockCount;

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formSku) return;

    const stockNum = parseInt(formStock) || 0;
    const reorderNum = parseInt(formReorder) || 10;
    const isLow = stockNum === 0 || stockNum <= reorderNum;

    const newProduct: Product = {
      id: Date.now().toString(),
      sku: formSku.toUpperCase(),
      name: formName,
      category: formCategory,
      stock: stockNum,
      uom: formUom,
      reorder_point: reorderNum,
      low_stock: isLow,
    };

    setProducts([newProduct, ...products]);
    setIsDrawerOpen(false);
    // Reset form
    setFormName("");
    setFormSku("");
    setFormStock("10");
    setFormReorder("15");
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="uppercase tracking-wider text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full inline-block mb-3">
            Catalog
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text">
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
          onClick={() => setIsDrawerOpen(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Stats Row (3 mini cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-surface rounded-2xl border border-border p-5 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl md:text-2xl font-bold text-text tracking-tight">{totalProducts}</p>
            <p className="text-xs text-muted uppercase tracking-wider font-semibold mt-0.5">Total Products</p>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-5 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-amber-500 to-orange-600 shadow-md shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl md:text-2xl font-bold text-text tracking-tight">{lowStockCount}</p>
            <p className="text-xs text-muted uppercase tracking-wider font-semibold mt-0.5">Low Stock / Out</p>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-5 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 shadow-sm col-span-2 md:col-span-1">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl md:text-2xl font-bold text-text tracking-tight">{healthyCount}</p>
            <p className="text-xs text-muted uppercase tracking-wider font-semibold mt-0.5">Healthy Stock</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
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
            {categories.map((cat) => (
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

          <button className="btn-secondary flex items-center gap-2 py-2 px-3 text-xs w-full sm:w-auto justify-center">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>

          <div className="flex items-center bg-background border border-border rounded-xl p-1 shrink-0">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "table" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-text"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-text"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Table / Grid Container */}
      {filteredProducts.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border p-16 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
            <Package className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-text mb-1">No products found</h3>
          <p className="text-sm text-muted mb-6">
            Try a different search or add a new product
          </p>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="btn-primary inline-flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-muted text-xs uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4 md:px-6 whitespace-nowrap">Product</th>
                  <th className="py-3.5 px-4 md:px-6 whitespace-nowrap">SKU</th>
                  <th className="py-3.5 px-4 md:px-6 whitespace-nowrap">Category</th>
                  <th className="py-3.5 px-4 md:px-6 text-right whitespace-nowrap">Stock</th>
                  <th className="py-3.5 px-4 md:px-6 text-right whitespace-nowrap">Reorder</th>
                  <th className="py-3.5 px-4 md:px-6 whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 md:px-6 text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filteredProducts.map((product) => {
                  const isOut = product.stock === 0;
                  const isLow = product.low_stock && !isOut;
                  const progressPct = Math.min(
                    (product.stock / (product.reorder_point * 3)) * 100,
                    100
                  );

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-background/80 transition-colors group"
                    >
                      <td className="py-4 px-4 md:px-6">
                        <div className="font-semibold text-base text-text whitespace-nowrap">
                          {product.name}
                        </div>
                      </td>
                      <td className="py-4 px-4 md:px-6 font-mono text-xs text-muted whitespace-nowrap">
                        {product.sku}
                      </td>
                      <td className="py-4 px-4 md:px-6 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/5 text-primary border border-primary/20">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 md:px-6 text-right whitespace-nowrap">
                        <div className="text-lg font-bold text-text">
                          {product.stock}{" "}
                          <span className="text-xs text-muted font-normal">
                            {product.uom}
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
                      <td className="py-4 px-4 md:px-6 text-right text-muted font-medium whitespace-nowrap">
                        {product.reorder_point} {product.uom}
                      </td>
                      <td className="py-4 px-4 md:px-6 whitespace-nowrap">
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
                      <td className="py-4 px-4 md:px-6 text-center whitespace-nowrap">
                        <button className="p-2 rounded-lg hover:bg-border transition-colors text-muted hover:text-text cursor-pointer">
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
            const isOut = product.stock === 0;
            const isLow = product.low_stock && !isOut;
            const progressPct = Math.min(
              (product.stock / (product.reorder_point * 3)) * 100,
              100
            );

            return (
              <div
                key={product.id}
                className="bg-surface rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/5 text-primary border border-primary/20">
                      {product.category}
                    </span>
                    <button className="p-1.5 rounded-lg hover:bg-border transition-colors text-muted hover:text-text cursor-pointer">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-text mb-0.5">
                    {product.name}
                  </h3>
                  <p className="font-mono text-xs text-muted mb-4">{product.sku}</p>

                  <div className="bg-background rounded-xl p-4 mb-4 border border-border/60">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted font-medium uppercase tracking-wider">
                        Current Stock
                      </span>
                      <span className="text-xl font-extrabold text-text">
                        {product.stock} <span className="text-xs text-muted font-normal">{product.uom}</span>
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
                    Reorder at: <strong className="text-text">{product.reorder_point} {product.uom}</strong>
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
        <div className="fixed inset-0 z-50 overflow-hidden bg-background/80 backdrop-blur-sm flex justify-end">
          {/* Backdrop */}
          <div
            className="flex-1"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Panel */}
          <div className="w-full sm:max-w-md bg-surface shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-out z-10 border-l border-border">
            {/* Header */}
            <div className="p-6 border-b border-border flex justify-between items-center bg-background/50">
              <div>
                <h2 className="text-lg font-bold text-text">Add Product</h2>
                <p className="text-xs text-muted mt-0.5">
                  Create a new inventory item
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-lg hover:bg-border text-muted hover:text-text transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleAddProduct} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <label className="block text-xs uppercase text-muted font-semibold mb-2 tracking-wider">
                  Basic Info
                </label>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-muted font-medium mb-1">
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
                    <label className="block text-xs text-muted font-medium mb-1">
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
                    <label className="block text-xs text-muted font-medium mb-1">
                      Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-3 bg-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="Furniture">Furniture</option>
                      <option value="Raw Materials">Raw Materials</option>
                      <option value="Electronics">Electronics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-muted font-medium mb-1">
                      Unit of Measure
                    </label>
                    <select
                      value={formUom}
                      onChange={(e) => setFormUom(e.target.value)}
                      className="w-full px-3 py-3 bg-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted font-medium mb-1">
                      Initial Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      className="w-full px-4 py-3 bg-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-muted font-medium mb-1">
                      Reorder Level
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formReorder}
                      onChange={(e) => setFormReorder(e.target.value)}
                      className="w-full px-4 py-3 bg-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-3 items-start">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted leading-relaxed">
                  Reorder level is the minimum stock before a low-stock alert is triggered across warehouses.
                </p>
              </div>

              {/* Footer inside form so submit works */}
              <div className="pt-6 border-t border-border flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="btn-secondary flex-1 justify-center py-3 cursor-pointer w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium flex-1 justify-center py-3 rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
