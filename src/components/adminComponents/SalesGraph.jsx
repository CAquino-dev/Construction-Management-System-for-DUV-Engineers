import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"; // Adjust path if needed
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const salesData = [
  { month: "Jan", sales: 4000 },
  { month: "Feb", sales: 3000 },
  { month: "Mar", sales: 5000 },
  { month: "Apr", sales: 7000 },
];

export const SalesGraph = () => {
  return (
    <Card className="w-full shadow-md p-4">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-800">Sales Overview</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={salesData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#3b5d47" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
