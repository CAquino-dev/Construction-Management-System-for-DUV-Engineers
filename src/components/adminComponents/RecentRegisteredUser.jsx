import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"; // Adjust import path if needed

const recentUsers = [
  { id: 1, name: "John Doe", joined: "April 10, 2025" },
  { id: 2, name: "Jane Smith", joined: "April 9, 2025" },
  { id: 3, name: "Michael Johnson", joined: "April 8, 2025" },
];

export const RecentRegisteredUser = () => {
  return (
    <div className="">
      {recentUsers.map(({ id, name, joined }) => (
        <Card key={id} className="shadow-md bg-[#3b5d47]/95 p-4 rounded-lg mb-4">
          <CardContent>
            <p className="text-white text-md font-semibold">{name}</p>
            <p className="text-xs text-white">Joined on: {joined}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
