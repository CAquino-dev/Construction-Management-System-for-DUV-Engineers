import React from "react";
import { UsersThree } from "@phosphor-icons/react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"; // Adjust import path if needed

export const TotalUserCard = ({ totalUsers }) => {
  return (
    <Card className="w-48 h-28 shadow-sm bg-[#3b5d47]/90 p-2 flex flex-col justify-center">
      <CardHeader className="flex items-center gap-2 ">
        {/* Icon */}
        <div className="bg-white p-1 rounded-full">
          <UsersThree size={25} className="text-[#3b5d47]" />
        </div>
        <CardTitle className="text-xl font-semibold text-white">Users</CardTitle>
      </CardHeader>

      <CardContent className="text-center">
        <h2 className="text-2xl font-bold text-white">{totalUsers || 0}</h2>
      </CardContent>
    </Card>
  );
};
