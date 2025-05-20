import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Card, CardHeader, CardContent } from "../../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tabs";
import { Avatar, AvatarFallback } from "../../ui/avatar";

export const EmployeeDetails = ({ selectedUser, onBack }) => {
  const [activeTab, setActiveTab] = useState("Information");

  if (!selectedUser) {
    return <div className="text-center p-6 text-gray-700">No employee found.</div>;
  }

  return (
    <div className="px-4 py-6 max-w-5xl w-full mx-auto">
      {/* Back Button */}
      <Button variant="link" onClick={onBack} className="mb-4">
        ← Back
      </Button>

      <Card className="p-6 w-full">
        {/* Profile Section */}
        <CardHeader className="flex flex-col items-center text-center">
          <Avatar className="w-28 h-28">
            <AvatarFallback>
              {selectedUser.full_name?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <h3 className="mt-4 text-xl font-bold text-gray-800">
            {selectedUser.full_name || "Employee Name"}
          </h3>
          <p className="text-gray-600 text-sm">
            {selectedUser.department_name || "Department"}
          </p>
        </CardHeader>

        {/* Tabs for Navigation */}
        <Tabs defaultValue="Information" onValueChange={setActiveTab} className="mt-6">
          <div className="overflow-x-auto">
            <TabsList className="flex w-max min-w-full justify-start sm:justify-center gap-2 mb-4 px-1">
              <TabsTrigger value="Information" className="flex-shrink-0 px-4 py-2 text-sm sm:text-base">
                Information
              </TabsTrigger>
              <TabsTrigger value="Attendance" className="flex-shrink-0 px-4 py-2 text-sm sm:text-base">
                Attendance
              </TabsTrigger>
              <TabsTrigger value="SystemAccess" className="flex-shrink-0 px-4 py-2 text-sm sm:text-base">
                System Access
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Information Tab */}
          <TabsContent value="Information">
            <CardContent className="space-y-6">
              {/* Personal Details */}
              <section className="border-b pb-4 mb-4">
                <p className="text-lg font-semibold mb-2">Personal Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <p><strong>Name:</strong> {selectedUser.full_name}</p>
                  <p><strong>Age:</strong> {selectedUser.age || "--"}</p>
                  <p><strong>Gender:</strong> {selectedUser.gender || "--"}</p>
                  <p><strong>Birthday:</strong> {selectedUser.birthday || "--"}</p>
                </div>
              </section>

              {/* Employee Info */}
              <section className="border-b pb-4 mb-4">
                <p className="text-lg font-semibold mb-2">Employee Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <p><strong>Employee ID:</strong> {selectedUser.employeeId}</p>
                  <p><strong>Job Title:</strong> {selectedUser.jobTitle}</p>
                  <p><strong>Department:</strong> {selectedUser.department_name}</p>
                  <p><strong>Date Hired:</strong> {selectedUser.dateHired}</p>
                  <p><strong>Employment Status:</strong> {selectedUser.employmentStatus}</p>
                </div>
              </section>

              {/* Work Schedule */}
              <section className="border-b pb-4 mb-4">
                <p className="text-lg font-semibold mb-2">Work Schedule</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <p><strong>Shift Schedule:</strong> {selectedUser.shiftSchedule || "--"}</p>
                  <p><strong>Working Hours:</strong> {selectedUser.workingHours || "--"}</p>
                </div>
              </section>

              {/* Emergency Contact */}
              <section className="border-b pb-4 mb-4">
                <p className="text-lg font-semibold mb-2">Emergency Contact</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <p><strong>Contact Name:</strong> {selectedUser.emergencyName || "--"}</p>
                  <p><strong>Relationship:</strong> {selectedUser.emergencyRelationship || "--"}</p>
                  <p><strong>Contact No:</strong> {selectedUser.emergencyContact || "--"}</p>
                </div>
              </section>

              <div className="flex justify-end">
                <Button variant="destructive">Deactivate</Button>
              </div>
            </CardContent>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="Attendance">
            <CardContent>
              <p className="text-gray-500">Hindi ko alam ilalagay dito.</p>
            </CardContent>
          </TabsContent>
              
            {/* System Access Tab */}
          <TabsContent value="SystemAccess">
            <CardContent>
              <p className="text-gray-500">Hindi ko alam ilalagay dito.</p>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
