"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { statisticsService } from "@/services/statisticsService";

interface RevenueDataPoint {
  month: string;
  revenue: number;
  projected: number;
}

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

interface PieTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
  }>;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<string>("6m");
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [yearlyRevenue, setYearlyRevenue] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalStats, setTotalStats] = useState({
    totalPosts: 0,
    activePosts: 0,
    inactivePosts: 0,
    totalPayments: 0,
  });

  const { isChecking, canAccess } = useAuthGuard("/unauthorized", {
    requireAuth: true,
    requiredRoles: ["admin"],
    message: "You need admin privileges to access analytics.",
  });

  useEffect(() => {
    if (canAccess) {
      fetchAllData();
    }
  }, [timeRange, canAccess]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const currentYear = 2025;
      const currentMonth = new Date().getMonth() + 1;
      const monthsToFetch =
        timeRange === "1m"
          ? 1
          : timeRange === "3m"
            ? 3
            : timeRange === "6m"
              ? 6
              : 12;

      const monthlyData: RevenueDataPoint[] = [];
      for (let i = monthsToFetch - 1; i >= 0; i--) {
        const targetMonth = currentMonth - i;
        const adjustedMonth = targetMonth <= 0 ? targetMonth + 12 : targetMonth;
        const year = targetMonth <= 0 ? currentYear - 1 : currentYear;

        const response = await statisticsService.getRevenueByMonth(
          adjustedMonth,
          year
        );
        if (response.isSuccess) {
          monthlyData.push({
            month: new Date(year, adjustedMonth - 1).toLocaleDateString(
              "en-US",
              { month: "short" }
            ),
            revenue: response.data.totalRevenue,
            projected: response.data.totalRevenue * 1.15,
          });
        }
      }
      setRevenueData(monthlyData);

      const yearResponse =
        await statisticsService.getRevenueByYear(currentYear);
      if (yearResponse.isSuccess) {
        setYearlyRevenue(yearResponse.data.totalRevenue);
      }

      const totalRevenueRes = await statisticsService.getTotalRevenue();
      if (totalRevenueRes.isSuccess) {
        setTotalRevenue(totalRevenueRes.data);
      }

      const [postsRes, activeRes, inactiveRes, paymentsRes] = await Promise.all(
        [
          statisticsService.getTotalPosts(),
          statisticsService.getTotalActivePosts(),
          statisticsService.getTotalInactivePosts(),
          statisticsService.getTotalPayments(),
        ]
      );

      setTotalStats({
        totalPosts: postsRes.isSuccess ? postsRes.data : 0,
        activePosts: activeRes.isSuccess ? activeRes.data : 0,
        inactivePosts: inactiveRes.isSuccess ? inactiveRes.data : 0,
        totalPayments: paymentsRes.isSuccess ? paymentsRes.data : 0,
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isChecking || !canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-sm text-gray-600">
          {isChecking ? "Checking permissions..." : "Access denied"}
        </span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600 font-medium">
            Loading analytics data...
          </p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              style={{ color: entry.color }}
              className="text-sm font-medium"
            >
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const postsDistributionData = [
    { name: "Active Posts", value: totalStats.activePosts, color: "#10B981" },
    {
      name: "Inactive Posts",
      value: totalStats.inactivePosts,
      color: "#EF4444",
    },
  ];

  const PieTooltip: React.FC<PieTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const total = totalStats.activePosts + totalStats.inactivePosts;
      const percentage =
        total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : "0";
      return (
        <div className="bg-white p-3 rounded-lg shadow-xl border border-gray-200">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-sm text-gray-600">{payload[0].value} posts</p>
          <p className="text-xs text-gray-500">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Aidonia Analytics
          </h1>
          <p className="text-slate-700 mt-1 font-semibold">
            Track your platform performance and user insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-primary-300 rounded-lg px-4 py-2 bg-white text-slate-800 font-medium hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>
      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Posts */}
        <div className="relative overflow-hidden bg-gradient-to-br from-sky-50 to-sky-100 p-6 rounded-2xl shadow-lg border border-sky-200 hover:shadow-2xl hover:border-sky-400 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-400/10 to-sky-200/5 opacity-80"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-sky-700">Total Posts</p>
              {loading ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-600"></div>
                  <p className="text-lg font-bold text-slate-800">Loading...</p>
                </div>
              ) : (
                <p className="text-3xl font-extrabold text-slate-900 mt-1">
                  {totalStats.totalPosts.toLocaleString()}
                </p>
              )}
            </div>
            <div className="p-3 bg-white/60 backdrop-blur-md rounded-xl shadow-sm">
              <svg
                className="w-7 h-7 text-sky-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Posts */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-100 p-6 rounded-2xl shadow-lg border border-emerald-200 hover:shadow-2xl hover:border-emerald-400 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-emerald-200/5 opacity-80"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                Active Posts
              </p>
              {loading ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                  <p className="text-lg font-bold text-slate-800">Loading...</p>
                </div>
              ) : (
                <p className="text-3xl font-extrabold text-slate-900 mt-1">
                  {totalStats.activePosts.toLocaleString()}
                </p>
              )}
            </div>
            <div className="p-3 bg-white/60 backdrop-blur-md rounded-xl shadow-sm">
              <svg
                className="w-7 h-7 text-emerald-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Inactive Posts */}
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 to-pink-100 p-6 rounded-2xl shadow-lg border border-rose-200 hover:shadow-2xl hover:border-rose-400 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-400/10 to-pink-200/5 opacity-80"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-rose-700">
                Inactive Posts
              </p>
              {loading ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rose-600"></div>
                  <p className="text-lg font-bold text-slate-800">Loading...</p>
                </div>
              ) : (
                <p className="text-3xl font-extrabold text-slate-900 mt-1">
                  {totalStats.inactivePosts.toLocaleString()}
                </p>
              )}
            </div>
            <div className="p-3 bg-white/60 backdrop-blur-md rounded-xl shadow-sm">
              <svg
                className="w-7 h-7 text-rose-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Payments */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-50 to-indigo-100 p-6 rounded-2xl shadow-lg border border-violet-200 hover:shadow-2xl hover:border-violet-400 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-400/10 to-indigo-200/5 opacity-80"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-violet-700">
                Total Payments
              </p>
              {loading ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-600"></div>
                  <p className="text-lg font-bold text-slate-800">Loading...</p>
                </div>
              ) : (
                <p className="text-3xl font-extrabold text-slate-900 mt-1">
                  {totalStats.totalPayments.toLocaleString()}
                </p>
              )}
            </div>
            <div className="p-3 bg-white/60 backdrop-blur-md rounded-xl shadow-sm">
              <svg
                className="w-7 h-7 text-violet-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path
                  fillRule="evenodd"
                  d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Posts Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              Posts Distribution
            </h3>
            <div className="p-2 bg-accent-100 rounded-lg">
              <svg
                className="w-5 h-5 text-accent-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={postsDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(Number(percent ?? 0) * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {postsDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Active Rate</p>
              <p className="text-xl font-bold text-green-600">
                {totalStats.totalPosts > 0
                  ? (
                      (totalStats.activePosts / totalStats.totalPosts) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Inactive Rate</p>
              <p className="text-xl font-bold text-red-600">
                {totalStats.totalPosts > 0
                  ? (
                      (totalStats.inactivePosts / totalStats.totalPosts) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>

        {/* Total Revenue Summary */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Total Revenue</h3>
            <div className="p-2 bg-warning-100 rounded-lg">
              <svg
                className="w-5 h-5 text-warning-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.562-.649-1.413-1.076-2.354-1.253V5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-warning-500 to-warning-600 rounded-full mb-4 shadow-xl">
              <svg
                className="w-12 h-12 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.562-.649-1.413-1.076-2.354-1.253V5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-2">
              All Time Revenue
            </p>
            <p className="text-4xl font-bold text-warning-600">
              {formatCurrency(totalRevenue)}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4"></div>
          </div>
        </div>
      </div>

      {/* Revenue Overview - Monthly Trend */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Revenue Trend</h3>
            <p className="text-sm text-slate-600 font-medium">
              Monthly revenue with projections
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
              <span className="text-xs text-slate-600 font-medium">
                Actual Revenue
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              <span className="text-xs text-slate-600 font-medium">
                Projected Revenue
              </span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              stroke="#6B7280"
              style={{ fontSize: "12px", fontWeight: "500" }}
            />
            <YAxis
              stroke="#6B7280"
              style={{ fontSize: "12px", fontWeight: "500" }}
              tickFormatter={(value: number) =>
                `$${(value / 1000).toFixed(0)}k`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "14px", fontWeight: "500" }} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#F59E0B"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              strokeWidth={3}
              name="Actual Revenue"
            />
            <Area
              type="monotone"
              dataKey="projected"
              stroke="#3B82F6"
              fillOpacity={1}
              fill="url(#colorProjected)"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Projected Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
