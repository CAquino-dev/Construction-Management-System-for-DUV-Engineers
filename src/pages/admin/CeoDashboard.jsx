import React, { useState } from "react";
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
  const [projectionData] = useState([
    { month: "Sept 2025", expected: 2100000, paid: 1400000, pending: 500000, overdue: 200000 },
    { month: "Oct 2025", expected: 1800000, paid: 800000, pending: 1000000, overdue: 0 },
    { month: "Nov 2025", expected: 3000000, paid: 0, pending: 3000000, overdue: 0 },
    { month: "Dec 2025", expected: 1500000, paid: 500000, pending: 1000000, overdue: 0 },
    { month: "Jan 2026", expected: 2000000, paid: 0, pending: 2000000, overdue: 0 },
    { month: "Feb 2026", expected: 2500000, paid: 0, pending: 2500000, overdue: 0 },
  ]);

  // Totals
  const totals = projectionData.reduce(
    (acc, item) => {
      acc.expected += item.expected;
      acc.paid += item.paid;
      acc.pending += item.pending;
      acc.overdue += item.overdue;
      return acc;
    },
    { expected: 0, paid: 0, pending: 0, overdue: 0 }
  );

  // Key Insights
  const largestExpected = projectionData.reduce((max, item) =>
    item.expected > max.expected ? item : max
  );
  const highestOverdue = projectionData.reduce((max, item) =>
    item.overdue > max.overdue ? item : max
  );
  const efficiency = ((totals.paid / totals.expected) * 100).toFixed(1);

  // Forecast Next 6 Months
  const lastMonth = projectionData[projectionData.length - 1];
  const avgIncrease = Math.round(
    (projectionData[projectionData.length - 1].expected - projectionData[0].expected) /
      (projectionData.length - 1)
  );
  const forecastMonths = ["Mar 2026", "Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026"];
  const forecastData = forecastMonths.map((month, index) => {
    const expected = lastMonth.expected + avgIncrease * (index + 1);
    return { month, expected, paid: 0, pending: expected, overdue: 0 };
  });

  // Combined historical + forecast for charts
  const combinedData = [...projectionData, ...forecastData];

  // Cumulative historical + forecast
  let cumulativeSumExpected = 0;
  let cumulativeSumPaid = 0;
  const cumulativeCombinedData = combinedData.map((item) => {
    cumulativeSumExpected += item.expected;
    cumulativeSumPaid += item.paid;
    return { month: item.month, cumulativeExpected: cumulativeSumExpected, cumulativePaid: cumulativeSumPaid };
  });

  // Pie chart data
  const pieData = [
    { name: "Paid", value: totals.paid },
    { name: "Pending", value: totals.pending },
    { name: "Overdue", value: totals.overdue },
  ];
  const COLORS = ["#4CAF50", "#FFC107", "#F44336"];

  // Target Forecast
  const totalTarget = cumulativeCombinedData[cumulativeCombinedData.length - 1].cumulativeExpected;
  const remainingTarget = totalTarget - totals.paid;
  const remainingMonths = forecastData.length;
  const requiredPerMonth = remainingMonths > 0 ? Math.round(remainingTarget / remainingMonths) : 0;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">📊 Finance Projection Dashboard</h1>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-100 p-4 rounded-xl text-center">
          <h3 className="font-semibold">Total Expected</h3>
          <p className="text-lg font-bold">₱{totals.expected.toLocaleString()}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-xl text-center">
          <h3 className="font-semibold">Collected</h3>
          <p className="text-lg font-bold">₱{totals.paid.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-xl text-center">
          <h3 className="font-semibold">Pending</h3>
          <p className="text-lg font-bold">₱{totals.pending.toLocaleString()}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-xl text-center">
          <h3 className="font-semibold">Overdue</h3>
          <p className="text-lg font-bold">₱{totals.overdue.toLocaleString()}</p>
        </div>
      </div>

      {/* Combined Expected vs Paid Trend + Forecast */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Expected vs Paid Trend (Including Forecast)</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="expected" stroke="#2196F3" name="Expected" />
              <Line type="monotone" dataKey="paid" stroke="#4CAF50" name="Paid" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cumulative Collection Trend (with forecast) */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Cumulative Collection Trend (Including Forecast)</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cumulativeCombinedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="cumulativeExpected" stroke="#2196F3" name="Cumulative Expected" />
              <Line type="monotone" dataKey="cumulativePaid" stroke="#4CAF50" name="Cumulative Paid" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Collection Breakdown Pie */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Collection Breakdown</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast Next 6 Months */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Forecast Next 6 Months</h2>
        <ul className="space-y-2">
          {forecastData.map((item, index) => (
            <li key={index}>
              <span className="font-bold">{item.month}:</span> Expected ₱{item.expected.toLocaleString()} | Paid ₱{item.paid.toLocaleString()} | Pending ₱{item.pending.toLocaleString()} | Overdue ₱{item.overdue.toLocaleString()}
            </li>
          ))}
        </ul>
        <p className="mt-4 font-semibold text-red-600">
          To meet the total 12-month target of ₱{totalTarget.toLocaleString()}, we need to collect at least ₱{requiredPerMonth.toLocaleString()} per forecasted month.
        </p>
      </div>
    </div>
  );
};
