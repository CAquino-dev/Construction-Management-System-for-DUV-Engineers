// Finance.js
import React, { useState } from "react";
import { FinanceTable } from "../../components/adminComponents/Finance/FinanceTable";
import SalaryReleaseInPerson from "../admin/SalaryReleaseInPerson";

export const Finance = () => {
  const [activeTab, setActiveTab] = useState("review"); // "review" or "release"

  return (
    <div className="container mx-auto bg-white shadow-md rounded-lg overflow-visible relative">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("review")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "review"
                ? "border-[#4c735c] text-[#4c735c]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Salary Review & Release
          </button>
          <button
            onClick={() => setActiveTab("release")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "release"
                ? "border-[#4c735c] text-[#4c735c]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            In-Person Salary Release
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === "review" && <FinanceTable />}
        {activeTab === "release" && <SalaryReleaseInPerson />}
      </div>
    </div>
  );
};