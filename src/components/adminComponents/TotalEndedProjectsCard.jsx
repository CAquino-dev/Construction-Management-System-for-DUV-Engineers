import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { UsersThree } from "@phosphor-icons/react";

export const TotalEndedProjectsCard = ({ TotalEndedProjects }) => {
  return (
    <Card className="w-63 h-28 shadow-sm bg-[#3b5d47]/90 flex flex-col justify-center">
      <CardHeader className="flex items-center gap-2">
        {/* Icon */}
        <div className="bg-white p-1 rounded-full">
          <UsersThree size={25} className="text-[#3b5d47]" />
        </div>
        <CardTitle className="text-xl font-bold text-white">Ended Projects</CardTitle>
      </CardHeader>

      <CardContent className="text-center">
        <h2 className="text-2xl font-bold text-white">{TotalEndedProjects || 0}</h2>
      </CardContent>
    </Card>
  )
}
