import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Card, CardHeader, CardContent } from "../../ui/card";
import { MyProjectDetails } from "../HR/MyProjectDetails";
import { MyProjectMilestones } from "./MyProjectMilestones";
import { MyprojectLegals } from "./MyprojectLegals";
import duvLogo from "../../../assets/duvLogo.jpg";
import { MyProjectExpenses } from "./MyProjectExpenses";
import { MyprojectSupply } from "./MyprojectSupply";
import { MyProjectChat } from "./MyProjectChat";
import { EngineerReports } from "./EngineerReports";
import ProjectInventory from "./ProjectInventory";

export const ViewMyProject = ({ selectedProject, onBack }) => {
  const [activeTab, setActiveTab] = useState("projectDetails");
  const startDate = new Date(selectedProject.start_date).toLocaleDateString();
  const endDate = new Date(selectedProject.end_date).toLocaleDateString();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const tabs = [
    {
      id: "projectDetails",
      label: "Details",
      icon: "📋",
      fullLabel: "Project Details",
    },
    {
      id: "milestones",
      label: "Milestones",
      icon: "🎯",
      fullLabel: "Milestones",
    },
    { id: "reports", label: "Reports", icon: "📊", fullLabel: "Reports" },
    { id: "legals", label: "Legals", icon: "⚖️", fullLabel: "Legals" },
    { id: "inventory", label: "Inventory", icon: "📦", fullLabel: "Inventory" },
    { id: "chat", label: "Chat", icon: "💬", fullLabel: "Chat" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center space-x-2 text-[#4c735c] hover:text-[#3a5a4a] hover:bg-[#4c735c]/10 px-4 py-2 rounded-lg transition-colors mb-4"
          >
            <span>←</span>
            <span>Back to Projects</span>
          </Button>
        </div>

        {/* Project Header Card */}
        <Card className="rounded-xl shadow-sm border border-gray-200 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
              {/* Project Image */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                  <img
                    src={duvLogo}
                    alt="Project"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Project Details */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedProject.project_name}
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center lg:items-start">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-gray-500">👤</span>
                      <span className="text-sm font-medium text-gray-500">
                        Client
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      {selectedProject.client_name}
                    </p>
                  </div>

                  <div className="flex flex-col items-center lg:items-start">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-gray-500">📅</span>
                      <span className="text-sm font-medium text-gray-500">
                        Start Date
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      {startDate}
                    </p>
                  </div>

                  <div className="flex flex-col items-center lg:items-start">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-gray-500">⏱️</span>
                      <span className="text-sm font-medium text-gray-500">
                        End Date
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      {endDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation - Mobile Friendly Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-[#4c735c] text-white border-[#4c735c] shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <span className="text-lg mb-1">{tab.icon}</span>
                <span className="text-xs font-medium text-center">
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <Card className="rounded-xl shadow-sm border border-gray-200">
          <CardContent className="p-4 sm:p-6">
            {/* Active Tab Header */}
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="mr-2">
                  {tabs.find((tab) => tab.id === activeTab)?.icon}
                </span>
                {tabs.find((tab) => tab.id === activeTab)?.fullLabel}
              </h2>
            </div>

            {/* Tab Content */}
            {activeTab === "projectDetails" && (
              <MyProjectDetails selectedProject={selectedProject} />
            )}

            {activeTab === "milestones" && (
              <MyProjectMilestones selectedProject={selectedProject} />
            )}

            {activeTab === "reports" && (
              <EngineerReports selectedProject={selectedProject} />
            )}

            {activeTab === "legals" && (
              <MyprojectLegals selectedProject={selectedProject} />
            )}

            {activeTab === "inventory" && (
              <ProjectInventory selectedProject={selectedProject} />
            )}

            {activeTab === "chat" && (
              <MyProjectChat selectedProject={selectedProject} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
