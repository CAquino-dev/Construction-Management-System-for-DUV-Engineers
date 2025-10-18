import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const CeoDashboard = () => {
  const [projectionData, setProjectionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectionData = async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/ceo/getFinanceProjection`
        );
        if (res.data) {
          const formattedData = res.data.map((item) => ({
            month: item.month,
            expected: Number(item.expected),
            paid: Number(item.paid),
            pending: Number(item.pending),
            overdue: Number(item.overdue),
          }));
          setProjectionData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching projection data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectionData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4c735c] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Totals
  const totals = projectionData.reduce(
    (acc, item) => {
      acc.expected += item.expected || 0;
      acc.paid += item.paid || 0;
      acc.pending += item.pending || 0;
      acc.overdue += item.overdue || 0;
      return acc;
    },
    { expected: 0, paid: 0, pending: 0, overdue: 0 }
  );

  // Key Insights
  const largestExpected = projectionData.reduce(
    (max, item) => ((item.expected || 0) > (max.expected || 0) ? item : max),
    { expected: 0 }
  );
  const highestOverdue = projectionData.reduce(
    (max, item) => ((item.overdue || 0) > (max.overdue || 0) ? item : max),
    { overdue: 0 }
  );
  const efficiency =
    totals.expected > 0
      ? ((totals.paid / totals.expected) * 100).toFixed(1)
      : 0;

  // Forecast Next 6 Months
  const lastMonth =
    projectionData.length > 0
      ? projectionData[projectionData.length - 1]
      : { expected: 0 };
  const avgIncrease =
    projectionData.length > 1
      ? Math.round(
          ((lastMonth.expected || 0) - (projectionData[0].expected || 0)) /
            (projectionData.length - 1)
        )
      : 0;

  const forecastMonths = [
    "Mar 2026",
    "Apr 2026",
    "May 2026",
    "Jun 2026",
    "Jul 2026",
    "Aug 2026",
  ];
  const forecastData = forecastMonths.map((month, index) => {
    const expected = (lastMonth.expected || 0) + avgIncrease * (index + 1);
    return { month, expected, paid: 0, pending: expected, overdue: 0 };
  });

  // Combined historical + forecast for charts
  const combinedData = [...projectionData, ...forecastData];

  // Cumulative historical + forecast
  let cumulativeSumExpected = 0;
  let cumulativeSumPaid = 0;
  const cumulativeCombinedData = combinedData.map((item) => {
    cumulativeSumExpected += item.expected || 0;
    cumulativeSumPaid += item.paid || 0;
    return {
      month: item.month,
      cumulativeExpected: cumulativeSumExpected,
      cumulativePaid: cumulativeSumPaid,
    };
  });

  // Pie chart data
  const pieData = [
    { name: "Paid", value: totals.paid },
    { name: "Pending", value: totals.pending },
    { name: "Overdue", value: totals.overdue },
  ];
  const COLORS = ["#4CAF50", "#FFC107", "#F44336"];

  // Target Forecast
  const totalTarget =
    cumulativeCombinedData.length > 0
      ? cumulativeCombinedData[cumulativeCombinedData.length - 1]
          .cumulativeExpected
      : 0;
  const remainingTarget = totalTarget - totals.paid;
  const remainingMonths = forecastData.length;
  const requiredPerMonth =
    remainingMonths > 0 ? Math.round(remainingTarget / remainingMonths) : 0;

  // Format currency function
  const formatCurrency = (amount) => {
    return `₱${amount?.toLocaleString() || "0"}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">📊</span>
                Finance Projection Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive overview of financial projections and performance
              </p>
            </div>
            <div className="mt-4 sm:mt-0 bg-green-50 px-4 py-2 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                Collection Efficiency:{" "}
                <span className="font-bold">{efficiency}%</span>
              </p>
            </div>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <span className="text-green-600 text-xl">💰</span>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">
                  Total Expected
                </h3>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(totals.expected)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <span className="text-blue-600 text-xl">✅</span>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Collected</h3>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(totals.paid)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <span className="text-yellow-600 text-xl">⏳</span>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Pending</h3>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(totals.pending)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Overdue</h3>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(totals.overdue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expected vs Paid Trend */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📈</span>
              Expected vs Paid Trend
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={combinedData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), ""]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="expected"
                    stroke="#2196F3"
                    name="Expected"
                    strokeWidth={2}
                    dot={{ fill: "#2196F3", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="paid"
                    stroke="#4CAF50"
                    name="Paid"
                    strokeWidth={2}
                    dot={{ fill: "#4CAF50", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Collection Breakdown Pie */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🥧</span>
              Collection Breakdown
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Amount"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Cumulative Collection Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Cumulative Collection Trend
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={cumulativeCombinedData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), ""]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cumulativeExpected"
                  stroke="#2196F3"
                  name="Cumulative Expected"
                  strokeWidth={2}
                  dot={{ fill: "#2196F3", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativePaid"
                  stroke="#4CAF50"
                  name="Cumulative Paid"
                  strokeWidth={2}
                  dot={{ fill: "#4CAF50", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Forecast Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Forecast Next 6 Months */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🔮</span>
              6-Month Forecast
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {forecastData.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-900">
                      {item.month}
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      {formatCurrency(item.expected)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>Paid: {formatCurrency(item.paid)}</div>
                    <div>Pending: {formatCurrency(item.pending)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Target Information */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              Target Analysis
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                  Total 12-Month Target
                </h3>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(totalTarget)}
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-900 mb-2">
                  Monthly Collection Required
                </h3>
                <p className="text-xl font-bold text-yellow-900">
                  {formatCurrency(requiredPerMonth)}
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  For the next {remainingMonths} months to meet target
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800">
                    Peak Expected
                  </h4>
                  <p className="font-bold text-green-900">
                    {largestExpected.month}
                  </p>
                  <p className="text-sm text-green-700">
                    {formatCurrency(largestExpected.expected)}
                  </p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-red-800">
                    Highest Overdue
                  </h4>
                  <p className="font-bold text-red-900">
                    {highestOverdue.month}
                  </p>
                  <p className="text-sm text-red-700">
                    {formatCurrency(highestOverdue.overdue)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
