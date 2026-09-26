"use client";

import { useState } from "react";
import {
  Plus,
  Warehouse,
  MapPin,
  Package,
  MoreVertical,
  X,
  Building2,
  ChevronRight,
  Edit2,
  Trash2,
  Info,
} from "lucide-react";

interface LocationItem {
  id: number;
  name: string;
  type: string;
  items: number;
  capacity: "Full" | "Partial" | "Empty";
}

interface WarehouseItem {
  id: number;
  name: string;
  address: string;
  isPrimary: boolean;
  locations: LocationItem[];
}

const MOCK_WAREHOUSES: WarehouseItem[] = [
  {
    id: 1,
    name: "Main Warehouse",
    address: "123 Industrial Ave, Mumbai",
    isPrimary: true,
    locations: [
      { id: 101, name: "Rack A", type: "rack", items: 12, capacity: "Full" },
      { id: 102, name: "Rack B", type: "rack", items: 8, capacity: "Partial" },
      { id: 103, name: "Production Floor", type: "floor", items: 24, capacity: "Full" },
    ],
  },
  {
    id: 2,
    name: "Secondary Warehouse",
    address: "45 Storage Rd, Pune",
    isPrimary: false,
    locations: [
      { id: 201, name: "Rack A", type: "rack", items: 5, capacity: "Partial" },
      { id: 202, name: "Rack B", type: "rack", items: 0, capacity: "Empty" },
    ],
  },
  {
    id: 3,
    name: "Production Floor",
    address: "Building C, Industrial Zone",
    isPrimary: false,
    locations: [
      { id: 301, name: "Assembly Line 1", type: "floor", items: 18, capacity: "Full" },
    ],
  },
];

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>(MOCK_WAREHOUSES);
  const [isWarehouseDrawerOpen, setIsWarehouseDrawerOpen] = useState(false);
  const [isLocationDrawerOpen, setIsLocationDrawerOpen] = useState(false);
  const [activeWarehouseId, setActiveWarehouseId] = useState<number | null>(null);

  // New Warehouse Form State
  const [newWhName, setNewWhName] = useState("");
  const [newWhAddress, setNewWhAddress] = useState("");
  const [newWhIsPrimary, setNewWhIsPrimary] = useState(false);

  // New Location Form State
  const [newLocName, setNewLocName] = useState("");
  const [newLocType, setNewLocType] = useState("rack");

  const handleCreateWarehouse = () => {
    if (!newWhName.trim()) return;
    const updatedWarehouses = warehouses.map((w) =>
      newWhIsPrimary ? { ...w, isPrimary: false } : w
    );
    const newWarehouse: WarehouseItem = {
      id: Date.now(),
      name: newWhName,
      address: newWhAddress || "Address not specified",
      isPrimary: newWhIsPrimary,
      locations: [],
    };

    setWarehouses([...updatedWarehouses, newWarehouse]);
    setIsWarehouseDrawerOpen(false);
    setNewWhName("");
    setNewWhAddress("");
    setNewWhIsPrimary(false);
  };

  const handleCreateLocation = () => {
    if (!activeWarehouseId || !newLocName.trim()) return;
    setWarehouses(
      warehouses.map((w) => {
        if (w.id === activeWarehouseId) {
          return {
            ...w,
            locations: [
              ...w.locations,
              {
                id: Date.now(),
                name: newLocName,
                type: newLocType,
                items: 0,
                capacity: "Empty",
              },
            ],
          };
        }
        return w;
      })
    );
    setIsLocationDrawerOpen(false);
    setNewLocName("");
    setNewLocType("rack");
    setActiveWarehouseId(null);
  };

  const handleDeleteWarehouse = (id: number) => {
    setWarehouses(warehouses.filter((w) => w.id !== id));
  };

  const handleDeleteLocation = (warehouseId: number, locationId: number) => {
    setWarehouses(
      warehouses.map((w) => {
        if (w.id === warehouseId) {
          return {
            ...w,
            locations: w.locations.filter((l) => l.id !== locationId),
          };
        }
        return w;
      })
    );
  };

  // Stats calculations
  const totalWarehouses = warehouses.length;
  const totalLocations = warehouses.reduce((acc, curr) => acc + curr.locations.length, 0);
  const totalItems = warehouses.reduce(
    (acc, curr) => acc + curr.locations.reduce((lAcc, lCurr) => lAcc + lCurr.items, 0),
    0
  );

  const getCapacityBadge = (capacity: LocationItem["capacity"]) => {
    switch (capacity) {
      case "Full":
        return (
          <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            Full
          </span>
        );
      case "Partial":
        return (
          <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            Partial
          </span>
        );
      case "Empty":
        return (
          <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-zinc-500/10 text-zinc-600 border border-zinc-500/20">
            Empty
          </span>
        );
    }
  };

  const activeWarehouseForModal = warehouses.find((w) => w.id === activeWarehouseId);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 border border-purple-500/20">
              <Building2 className="w-3.5 h-3.5" />
              SETTINGS
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Warehouses & Locations</h1>
            <span className="px-3 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
              {totalWarehouses} warehouses
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your physical storage structure
          </p>
        </div>

        <button
          onClick={() => setIsWarehouseDrawerOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 transition-all transform active:scale-95 w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Add Warehouse
        </button>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Total Warehouses */}
        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="space-y-1 z-10">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Warehouses</p>
            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{totalWarehouses}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 z-10">
            <Warehouse className="w-6 h-6" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all" />
        </div>

        {/* Total Locations */}
        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="space-y-1 z-10">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Locations</p>
            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{totalLocations}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 z-10">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all" />
        </div>

        {/* Total Items Stored */}
        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-all col-span-2 md:col-span-1">
          <div className="space-y-1 z-10">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Items Stored</p>
            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{totalItems}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 z-10">
            <Package className="w-6 h-6" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
        </div>
      </div>

      {/* WAREHOUSE CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {warehouses.map((wh) => (
          <div
            key={wh.id}
            className="bg-card rounded-2xl border border-border/60 shadow-sm p-6 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div>
              {/* Header Row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
                    <Warehouse className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold text-foreground">{wh.name}</h3>
                      {wh.isPrimary && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      {wh.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteWarehouse(wh.id)}
                    className="p-2 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                    title="Delete Warehouse"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border/60 my-5" />

              {/* Locations List Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Locations ({wh.locations.length})
                  </span>
                </div>

                <div className="space-y-2.5">
                  {wh.locations.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2 text-center bg-background/50 rounded-xl border border-border/40">
                      No locations added yet.
                    </p>
                  ) : (
                    wh.locations.map((loc) => (
                      <div
                        key={loc.id}
                        className="bg-background rounded-xl p-3 flex items-center justify-between border border-border/40 hover:border-border transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <ChevronRight className="w-4 h-4 text-purple-600 shrink-0" />
                          <span className="font-medium text-sm text-foreground">{loc.name}</span>
                          <span className="text-xs text-muted-foreground capitalize">({loc.type})</span>
                        </div>

                        <div className="flex items-center gap-3">
                          {getCapacityBadge(loc.capacity)}
                          <span className="text-xs text-muted-foreground font-mono">
                            {loc.items} items
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleDeleteLocation(wh.id, loc.id)}
                              className="p-1 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                              title="Delete Location"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer of Card */}
            <div className="mt-6 pt-4 border-t border-border/40 flex justify-between items-center">
              <button
                onClick={() => {
                  setActiveWarehouseId(wh.id);
                  setIsLocationDrawerOpen(true);
                }}
                className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Location
              </button>
              <span className="text-xs text-muted-foreground font-mono">ID: #{wh.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ADD WAREHOUSE DRAWER */}
      {isWarehouseDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-full sm:max-w-md bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <Warehouse className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">Add Warehouse</h2>
                </div>
                <button
                  onClick={() => setIsWarehouseDrawerOpen(false)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Warehouse Details
                  </h3>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Warehouse Name</label>
                    <input
                      type="text"
                      placeholder="e.g. North Distribution Center"
                      value={newWhName}
                      onChange={(e) => setNewWhName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 789 Supply St, Delhi"
                      value={newWhAddress}
                      onChange={(e) => setNewWhAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Primary Warehouse
                  </h3>

                  <label className="flex items-center gap-3 p-3.5 rounded-xl bg-background border border-border/60 cursor-pointer hover:border-border transition-colors">
                    <input
                      type="checkbox"
                      checked={newWhIsPrimary}
                      onChange={(e) => setNewWhIsPrimary(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-border"
                    />
                    <span className="text-sm font-medium text-foreground">Set as primary warehouse</span>
                  </label>

                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3">
                    <Info className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      Primary warehouse is used as the default destination for receipts and default source for deliveries.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  onClick={() => setIsWarehouseDrawerOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted text-foreground transition-colors w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWarehouse}
                  disabled={!newWhName.trim()}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full sm:w-auto"
                >
                  Create Warehouse
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ADD LOCATION DRAWER */}
      {isLocationDrawerOpen && activeWarehouseForModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-full sm:max-w-md bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">Add Location</h2>
                </div>
                <button
                  onClick={() => setIsLocationDrawerOpen(false)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Parent Warehouse</label>
                    <input
                      type="text"
                      disabled
                      value={activeWarehouseForModal.name}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Location Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rack C or Zone 2"
                      value={newLocName}
                      onChange={(e) => setNewLocName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Location Type</label>
                    <select
                      value={newLocType}
                      onChange={(e) => setNewLocType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all capitalize"
                    >
                      <option value="rack">Rack</option>
                      <option value="floor">Floor</option>
                      <option value="bin">Bin</option>
                      <option value="shelf">Shelf</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  onClick={() => setIsLocationDrawerOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted text-foreground transition-colors w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateLocation}
                  disabled={!newLocName.trim()}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full sm:w-auto"
                >
                  Add Location
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
