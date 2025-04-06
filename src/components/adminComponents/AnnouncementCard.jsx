import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"; // Adjust import path if needed

export const AnnouncementCard = ({ title, message, date }) => {
  return (
    <Card className="w-full max-w-md shadow-md p-4 mt-2 bg-[#3b5d47]/95">
      <CardHeader className="border-b-1 border-white mb-2">
        <CardTitle className="text-lg font-bold text-white">{title || "Announcement"}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-white">{message || "No announcement details available."}</p>
        <p className="text-xs text-white mt-2">{date || "MM/DD/YYYY"}</p>
      </CardContent>
    </Card>
  );
};
