import React from "react";
import { TotalUserCard } from "../../components/adminComponents/TotalUserCard";
import { TotalEmployeeCard } from "../../components/adminComponents/TotalEmployeeCard";
import { TotalProjectsCard } from "../../components/adminComponents/TotalProjectsCard";
import { TotalEndedProjectsCard } from "../../components/adminComponents/TotalEndedProjectsCard";
import { TotalOngoingProjectsCard } from "../../components/adminComponents/TotalOngoingProjectsCard";
import { SalesGraph } from "../../components/adminComponents/SalesGraph";
import { AnnouncementCard } from "../../components/adminComponents/AnnouncementCard"; 
import { RecentRegisteredUser } from "../../components/adminComponents/RecentRegisteredUser";

export const AdminDashboard = () => {
  return (
    <div className="p-6">
      {/* Flex container for responsive layout */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Section - Sales Graph + Stats */}
        <div className="w-full md:w-2/3">
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            <TotalUserCard totalUsers={150} />
            <TotalEmployeeCard totalEmployee={150} />
            <TotalProjectsCard totalProjects={150} />
            <TotalOngoingProjectsCard totalOngoingProjects={150} />
            <TotalEndedProjectsCard totalEndedProjects={150} />
          </div>
          <SalesGraph />
        </div>

        {/* Right Section - Announcements + Recent Registered Users */}
        <div className="w-full md:w-1/3 space-y-6">
          
          {/* Announcements Section */}
          <div className="h-80 p-4 bg-white shadow-md rounded-lg border border-gray-300 flex flex-col">
            <h2 className="text-lg md:text-xl font-bold mb-4 text-center md:text-left">Announcements</h2>

            {/* Scrollable Announcement List */}
            <div className="h-full overflow-y-auto space-y-4 pr-2">
              <AnnouncementCard 
                title="System Update" 
                message="A scheduled maintenance will occur on April 15th from 2 AM - 4 AM."
                date="April 10, 2025"
              />
              <AnnouncementCard 
                title="New Feature" 
                message="We've added a new analytics dashboard! Check it out now."
                date="April 9, 2025"
              />
            </div>
          </div>

          {/* Recent Registered Users Section */}
          <div className="h-80 p-4 bg-white shadow-md rounded-lg border border-gray-300 flex flex-col">
            <h2 className="text-lg md:text-xl font-bold mb-4 text-center md:text-left">Recent Registered Users</h2>
            <div className="h-full overflow-y-auto space-y-4 pr-2">
              <RecentRegisteredUser />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
