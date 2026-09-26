"use client";

import { useState, useEffect } from "react";
import {
  Package,
  AlertTriangle,
  Truck,
  CheckCircle2,
  ArrowLeftRight,
  Plus,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const MOCK_KPI = {
  total_products: 24,
  low_stock: 5,
  out_of_stock: 2,
  pending_receipts: 3,
  pending_deliveries: 4,
  pending_transfers: 2,
};

const MOCK_CHART = [
  { day: "Mon", value: 45 },
  { day: "Tue", value: 62 },
  { day: "Wed", value: 58 },
  { day: "Thu", value: 89 },
  { day: "Fri", value: 76 },
  { day: "Sat", value: 94 },
  { day: "Sun", value: 88 },
];

const MOCK_ACTIVITY = [
  {
    date: "2026-09-26 14:32",
    product: "Wireless Mouse M350",
    op: "Receipt",
    qty: "+50",
    ref: "REC-001",
    type: "receipt",
  },
  {
    date: "2026-09-26 12:15",
    product: "Mechanical Keyboard Pro",
    op: "Delivery",
    qty: "-12",
    ref: "DEL-004",
    type: "delivery",
  },
  {
    date: "2026-09-26 10:04",
    product: "USB-C Hub 7-in-1",
    op: "Transfer",
    qty: "-5",
    ref: "TR-012",
    type: "transfer",
  },
  {
    date: "2026-09-25 16:45",
    product: 'UltraWide Monitor 27"',
    op: "Receipt",
    qty: "+10",
    ref: "REC-002",
    type: "receipt",
  },
  {
    date: "2026-09-25 09:30",
    product: "Ergonomic Office Chair",
    op: "Adjustment",
    qty: "+2",
    ref: "ADJ-003",
    type: "adjustment",
  },
];

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  gradient: string;
  trend: string;
  trendUp: boolean;
}

function KPICard({ icon, label, value, gradient, trend, trendUp }: KPICardProps) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${gradient} hover:scale-[1.02] transition-transform shadow-md`}
        >
          {icon}
        </div>
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            trendUp
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
              : "bg-rose-50 text-rose-600 border border-rose-200/60"
          }`}
        >
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
        <p className="text-xs text-muted uppercase tracking-wider mt-1 font-medium">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [kpi, setKpi] = useState<typeof MOCK_KPI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setKpi(MOCK_KPI);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const kpiConfigs = [
    {
      label: "Total Products",
      value: kpi?.total_products ?? 0,
      icon: <Package className="w-5 h-5" />,
      gradient: "from-indigo-500 to-purple-600",
      trend: "12%",
      trendUp: true,
    },
    {
      label: "Low Stock",
      value: kpi?.low_stock ?? 0,
      icon: <AlertTriangle className="w-5 h-5" />,
      gradient: "from-amber-500 to-orange-600",
      trend: "4%",
      trendUp: false,
    },
    {
      label: "Out of Stock",
      value: kpi?.out_of_stock ?? 0,
      icon: <AlertTriangle className="w-5 h-5" />,
      gradient: "from-rose-500 to-red-600",
      trend: "2%",
      trendUp: false,
    },
    {
      label: "Pending Receipts",
      value: kpi?.pending_receipts ?? 0,
      icon: <CheckCircle2 className="w-5 h-5" />,
      gradient: "from-emerald-500 to-teal-600",
      trend: "8%",
      trendUp: true,
    },
    {
      label: "Pending Deliveries",
      value: kpi?.pending_deliveries ?? 0,
      icon: <Truck className="w-5 h-5" />,
      gradient: "from-blue-500 to-cyan-600",
      trend: "5%",
      trendUp: true,
    },
    {
      label: "Transfers",
      value: kpi?.pending_transfers ?? 0,
      icon: <ArrowLeftRight className="w-5 h-5" />,
      gradient: "from-violet-500 to-fuchsia-600",
      trend: "3%",
      trendUp: true,
    },
  ];

  const getOpPillStyle = (type: string) => {
    switch (type) {
      case "receipt":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "delivery":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "transfer":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "adjustment":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 uppercase tracking-wider text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Dashboard
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Inventory Manager
            </span>
          </h1>
          <p className="text-sm text-muted mt-1">
            Real-time analytics and inventory status across all warehouses
          </p>
        </div>
        <button className="bg-primary text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:bg-primary/95 transition-all duration-200 flex items-center gap-2 self-start sm:self-auto cursor-pointer">
          <Plus className="w-4 h-4" />
          New Operation
        </button>
      </div>

      {/* KPI Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-border p-5 h-36 animate-pulse flex flex-col justify-between"
            >
              <div className="flex justify-between items-center">
                <div className="w-11 h-11 bg-gray-200 rounded-xl" />
                <div className="w-12 h-5 bg-gray-200 rounded-full" />
              </div>
              <div>
                <div className="w-16 h-8 bg-gray-200 rounded mb-2" />
                <div className="w-24 h-3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpiConfigs.map((item, index) => (
            <KPICard
              key={index}
              icon={item.icon}
              label={item.label}
              value={item.value}
              gradient={item.gradient}
              trend={item.trend}
              trendUp={item.trendUp}
            />
          ))}
        </div>
      )}

      {/* Chart Card */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Stock Activity</h2>
          <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60">
            Last 7 days
          </span>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_CHART} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C2BD9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6C2BD9" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis hide={true} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  padding: "8px 12px",
                }}
                labelStyle={{ fontWeight: "bold", color: "#111827", marginBottom: "4px" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#6C2BD9"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Table Card */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          <a
            href="#view-all"
            className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors"
          >
            View all →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-xs font-bold text-muted uppercase tracking-wider">
                <th className="pb-3 px-4">Date</th>
                <th className="pb-3 px-4">Product</th>
                <th className="pb-3 px-4">Operation</th>
                <th className="pb-3 px-4">Quantity</th>
                <th className="pb-3 px-4">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {MOCK_ACTIVITY.map((item, index) => (
                <tr key={index} className="hover:bg-background transition-colors">
                  <td className="py-3.5 px-4 text-muted text-sm">{item.date}</td>
                  <td className="py-3.5 px-4 font-semibold text-gray-900">{item.product}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getOpPillStyle(
                        item.type
                      )}`}
                    >
                      {item.op}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold">
                    <span
                      className={
                        item.qty.startsWith("+")
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }
                    >
                      {item.qty}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-muted font-mono text-xs">
                    {item.ref}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
