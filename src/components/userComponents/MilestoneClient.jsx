import React, { useState } from 'react';

const milestones = [
  {
    timestamp: "2 Mar 12:36",
    status: "Nakapag Lagay na kami ng semento boss",
    details: "Lagay semento sabay kain ng buhangin",
  },
  {
    timestamp: "2 Mar 09:04",
    status: "Tanim ng Omad para hindi mahuli ng silup",
    details: "Nagtanim kami ng omad para pag lagay ng tiles nakatago",
  },
  {
    timestamp: "2 Mar 09:03",
    status: "Lagay ng tiles",
    details: "Safe ng yung tanim natakpan na ng tiles",
  },
  {
    timestamp: "2 Mar 06:07",
    status: "Lagay ng Bubong ng salamin para mainitan omad",
    details: "Safe na yung tanim",
  },
  {
    timestamp: "2 Mar 03:52",
    status: "Lagay ng pinto",
    details: "Lagay pinto baka magalit si boss",
  },
  {
    timestamp: "2 Mar 02:32",
    status: "Lagay lock ng pinto",
    details: " Lagay lock ng pinto para hindi magalit si boss",
  },
];

export const MilestoneClient = () => {
  return (
    <div className="">
      <div className="relative">
        <div className="border-l-2 border-gray-300 pl-6">
          {milestones.map((milestone, index) => (
            <div key={index} className="mb-6">
              <div className="flex flex-col">
                
                {/* Milestone Dot and Timestamp */}
                <div className="flex items-center mb-2 sm:mb-0 sm:mr-4">
                  <div className="w-3 h-3 bg-[#4c735c]/70 rounded-full mr-2" />
                  <p className="text-sm text-gray-600">{milestone.timestamp}</p>
                </div>
                
                {/* Milestone Status and Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1 sm:mb-0">{milestone.status}</h3>
                  <p className="text-sm text-gray-600">{milestone.details}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
