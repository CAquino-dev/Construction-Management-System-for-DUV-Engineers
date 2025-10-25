import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Card, CardHeader, CardContent } from "../../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tabs";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/table";
import { EditEmployeeModal } from "./EditEmployeeModal";
import { toast } from "sonner";

export const EmployeeDetails = ({ selectedUser, onBack }) => {
  const [activeTab, setActiveTab] = useState("Information");
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const userId = localStorage.getItem('userId');

      const fetchEmployeeDetails = async () => {
      if (!selectedUser?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/hr/getUserById/${selectedUser.id}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch employee details');
        }
        
        const result = await response.json();
        
        if (result.success) {
          setEmployeeData(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch employee details');
        }
      } catch (err) {
        console.error('Error fetching employee details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (selectedUser?.id) {
      fetchEmployeeDetails();
    }
  }, [selectedUser?.id]);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleSave = async (updatedData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/hr/updateEmployee/${selectedUser.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...updatedData, edited_by: userId }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || "Failed to update employee.");
        return;
      }

      if (result.success) {
        await fetchEmployeeDetails(); // ✅ reuse function here
        setIsEditModalOpen(false);
        toast.success("Employee updated successfully!");
      } else {
        toast.error(result.message || "Failed to update employee.");
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Something went wrong while updating employee.");
    }
  };


  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time helper
  const formatTime = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusColors = {
      Present: "bg-green-100 text-green-700",
      Late: "bg-yellow-100 text-yellow-700",
      Absent: "bg-red-100 text-red-700",
      Holiday: "bg-blue-100 text-blue-700"
    };
    return statusColors[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="px-4 py-6 max-w-5xl w-full mx-auto">
        <Button variant="link" onClick={onBack} className="mb-4">
          ← Back
        </Button>
        <div className="text-center p-8">Loading employee details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 max-w-5xl w-full mx-auto">
        <Button variant="link" onClick={onBack} className="mb-4">
          ← Back
        </Button>
        <div className="text-center p-8 text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!employeeData || employeeData.length === 0) {
    return (
      <div className="px-4 py-6 max-w-5xl w-full mx-auto">
        <Button variant="link" onClick={onBack} className="mb-4">
          ← Back
        </Button>
        <div className="text-center p-6 text-gray-700">No employee data found.</div>
      </div>
    );
  }

  // Get basic employee info from first record (all records have same user info)
  const employeeInfo = employeeData[0];

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
              {employeeInfo.full_name?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <h3 className="mt-4 text-xl font-bold text-gray-800">
            {employeeInfo.full_name || "Employee Name"}
          </h3>
          <p className="text-gray-600 text-sm">
            {employeeInfo.role_name} • {employeeInfo.department_name}
          </p>
          <p className="text-gray-500 text-sm">
            {employeeInfo.email}
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
              <TabsTrigger value="Performance" className="flex-shrink-0 px-4 py-2 text-sm sm:text-base">
                Performance
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Information Tab */}
          <TabsContent value="Information">
            <CardContent className="space-y-6">
              {/* Personal Details */}
              <section className="border-b pb-4 mb-4">
                <h4 className="text-lg font-semibold mb-3 text-gray-800">Personal Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-gray-700">Full Name:</strong>
                    <p className="mt-1">{employeeInfo.full_name || "--"}</p>
                  </div>
                  <div>
                    <strong className="text-gray-700">Email:</strong>
                    <p className="mt-1">{employeeInfo.email || "--"}</p>
                  </div>
                  <div>
                    <strong className="text-gray-700">User Id:</strong>
                    <p className="mt-1">{employeeInfo.employee_id || "--"}</p>
                  </div>
                  <div>
                    <strong className="text-gray-700">Hourly Rate:</strong>
                    <p className="mt-1">₱{employeeInfo.hourly_rate || "0.00"}</p>
                  </div>
                </div>
              </section>

              {/* Employment Details */}
              <section className="border-b pb-4 mb-4">
                <h4 className="text-lg font-semibold mb-3 text-gray-800">Employment Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-gray-700">Department:</strong>
                    <p className="mt-1">{employeeInfo.department_name || "--"}</p>
                  </div>
                  <div>
                    <strong className="text-gray-700">Job Title:</strong>
                    <p className="mt-1">{employeeInfo.job_title || "--"}</p>
                  </div>
                  <div>
                    <strong className="text-gray-700">Role:</strong>
                    <p className="mt-1">{employeeInfo.role_name || "--"}</p>
                  </div>
                  <div>
                    <strong className="text-gray-700">Department Description:</strong>
                    <p className="mt-1">{employeeInfo.department_description || "--"}</p>
                  </div>
                </div>
              </section>

              {/* Emergency Contact */}
              <section className="border-b pb-4 mb-4">
                <h4 className="text-lg font-semibold mb-3 text-gray-800">Emergency Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-gray-700">Contact Name:</strong>
                    <p className="mt-1">{employeeInfo.emergency_name || "Not provided"}</p>
                  </div>
                  <div>
                    <strong className="text-gray-700">Relationship:</strong>
                    <p className="mt-1">{employeeInfo.emergency_relationship || "Not provided"}</p>
                  </div>
                  <div>
                    <strong className="text-gray-700">Contact Number:</strong>
                    <p className="mt-1">{employeeInfo.emergency_contact || "Not provided"}</p>
                  </div>
                </div>
              </section>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleEdit}>
                  Edit Information
                </Button>
                <Button variant="destructive">Deactivate</Button>
              </div>
            </CardContent>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="Attendance">
            <CardContent>
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Attendance History</h4>
                <p className="text-sm text-gray-600">Recent attendance records for {employeeInfo.full_name}</p>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#4c735c] text-white">
                      <TableHead className="p-2 text-left text-white">Work Date</TableHead>
                      <TableHead className="p-2 text-center text-white">Time In</TableHead>
                      <TableHead className="p-2 text-center text-white">Time Out</TableHead>
                      <TableHead className="p-2 text-center text-white">Status</TableHead>
                      <TableHead className="p-2 text-center text-white">Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeData.map((record, index) => {
                      const checkIn = record.check_in ? new Date(record.check_in) : null;
                      const checkOut = record.check_out ? new Date(record.check_out) : null;
                      let hoursWorked = "-";
                      
                      if (checkIn && checkOut) {
                        const diffMs = checkOut - checkIn;
                        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                        hoursWorked = `${diffHrs}h ${diffMins}m`;
                      }
                      
                      return (
                        <TableRow key={record.attendance_id} className={index % 2 === 0 ? "bg-[#f4f6f5]" : "bg-white"}>
                          <TableCell className="p-2">
                            {formatDate(record.work_date)}
                          </TableCell>
                          <TableCell className="p-2 text-center">
                            {formatTime(record.check_in)}
                          </TableCell>
                          <TableCell className="p-2 text-center">
                            {formatTime(record.check_out)}
                          </TableCell>
                          <TableCell className="p-2 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(record.attendance_status)}`}>
                              {record.attendance_status}
                            </span>
                          </TableCell>
                          <TableCell className="p-2 text-center">
                            {hoursWorked}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {employeeData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No attendance records found.
                </div>
              )}
            </CardContent>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="Performance">
            <CardContent>
              {/* Key Metrics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4 text-center">
                  <h5 className="font-semibold text-gray-700 text-sm">Total Present</h5>
                  <p className="text-2xl font-bold text-green-600">
                    {employeeData.filter(record => record.attendance_status === 'Present').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {((employeeData.filter(record => record.attendance_status === 'Present').length / employeeData.length) * 100).toFixed(1)}% of days
                  </p>
                </Card>
                <Card className="p-4 text-center">
                  <h5 className="font-semibold text-gray-700 text-sm">Total Late</h5>
                  <p className="text-2xl font-bold text-yellow-600">
                    {employeeData.filter(record => record.attendance_status === 'Late').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {((employeeData.filter(record => record.attendance_status === 'Late').length / employeeData.length) * 100).toFixed(1)}% of days
                  </p>
                </Card>
                <Card className="p-4 text-center">
                  <h5 className="font-semibold text-gray-700 text-sm">Total Absent</h5>
                  <p className="text-2xl font-bold text-red-600">
                    {employeeData.filter(record => record.attendance_status === 'Absent').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {((employeeData.filter(record => record.attendance_status === 'Absent').length / employeeData.length) * 100).toFixed(1)}% of days
                  </p>
                </Card>
                <Card className="p-4 text-center">
                  <h5 className="font-semibold text-gray-700 text-sm">Attendance Rate</h5>
                  <p className="text-2xl font-bold text-blue-600">
                    {((employeeData.filter(record => record.attendance_status === 'Present' || record.attendance_status === 'Late').length / employeeData.length) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Overall attendance</p>
                </Card>
              </div>

              {/* Working Hours Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="p-4">
                  <h5 className="font-semibold text-gray-700 mb-3">Working Hours Analysis</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Hours/Day:</span>
                      <span className="font-semibold">
                        {(() => {
                          const workedRecords = employeeData.filter(record => record.check_in && record.check_out);
                          if (workedRecords.length === 0) return "0h 0m";
                          
                          const totalMs = workedRecords.reduce((sum, record) => {
                            return sum + (new Date(record.check_out) - new Date(record.check_in));
                          }, 0);
                          
                          const avgMs = totalMs / workedRecords.length;
                          const avgHrs = Math.floor(avgMs / (1000 * 60 * 60));
                          const avgMins = Math.floor((avgMs % (1000 * 60 * 60)) / (1000 * 60));
                          return `${avgHrs}h ${avgMins}m`;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Hours Worked:</span>
                      <span className="font-semibold">
                        {(() => {
                          const workedRecords = employeeData.filter(record => record.check_in && record.check_out);
                          const totalMs = workedRecords.reduce((sum, record) => {
                            return sum + (new Date(record.check_out) - new Date(record.check_in));
                          }, 0);
                          
                          const totalHrs = Math.floor(totalMs / (1000 * 60 * 60));
                          const totalMins = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
                          return `${totalHrs}h ${totalMins}m`;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Estimated Earnings:</span>
                      <span className="font-semibold text-green-600">
                        {(() => {
                          const workedRecords = employeeData.filter(record => record.check_in && record.check_out);
                          const totalMs = workedRecords.reduce((sum, record) => {
                            return sum + (new Date(record.check_out) - new Date(record.check_in));
                          }, 0);
                          
                          const totalHrs = totalMs / (1000 * 60 * 60);
                          const hourlyRate = parseFloat(employeeInfo.hourly_rate) || 0;
                          return `₱${(totalHrs * hourlyRate).toFixed(2)}`;
                        })()}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Performance Trends */}
                <Card className="p-4">
                  <h5 className="font-semibold text-gray-700 mb-3">Performance Trends</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Streak:</span>
                      <span className="font-semibold">
                        {(() => {
                          const sortedRecords = [...employeeData].sort((a, b) => new Date(b.work_date) - new Date(a.work_date));
                          let streak = 0;
                          for (let record of sortedRecords) {
                            if (record.attendance_status === 'Present') {
                              streak++;
                            } else if (record.attendance_status === 'Late') {
                              streak++;
                            } else {
                              break;
                            }
                          }
                          return `${streak} days`;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Best Streak:</span>
                      <span className="font-semibold">
                        {(() => {
                          let bestStreak = 0;
                          let currentStreak = 0;
                          
                          employeeData.forEach(record => {
                            if (record.attendance_status === 'Present' || record.attendance_status === 'Late') {
                              currentStreak++;
                              bestStreak = Math.max(bestStreak, currentStreak);
                            } else {
                              currentStreak = 0;
                            }
                          });
                          
                          return `${bestStreak} days`;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Punctuality Score:</span>
                      <span className="font-semibold">
                        {(() => {
                          const presentCount = employeeData.filter(record => record.attendance_status === 'Present').length;
                          const lateCount = employeeData.filter(record => record.attendance_status === 'Late').length;
                          const totalCount = presentCount + lateCount;
                          
                          return totalCount > 0 ? `${((presentCount / totalCount) * 100).toFixed(1)}%` : "N/A";
                        })()}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Monthly Breakdown */}
              <Card className="p-4 mb-6">
                <h5 className="font-semibold text-gray-700 mb-3">Monthly Attendance Summary</h5>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#4c735c] text-white">
                        <TableHead className="p-2 text-left text-white">Month</TableHead>
                        <TableHead className="p-2 text-center text-white">Present</TableHead>
                        <TableHead className="p-2 text-center text-white">Late</TableHead>
                        <TableHead className="p-2 text-center text-white">Absent</TableHead>
                        <TableHead className="p-2 text-center text-white">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const monthlyData = {};
                        
                        employeeData.forEach(record => {
                          const month = new Date(record.work_date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long' 
                          });
                          
                          if (!monthlyData[month]) {
                            monthlyData[month] = { present: 0, late: 0, absent: 0, total: 0 };
                          }
                          
                          monthlyData[month].total++;
                          if (record.attendance_status === 'Present') monthlyData[month].present++;
                          if (record.attendance_status === 'Late') monthlyData[month].late++;
                          if (record.attendance_status === 'Absent') monthlyData[month].absent++;
                        });
                        
                        return Object.entries(monthlyData)
                          .sort(([a], [b]) => new Date(b) - new Date(a))
                          .map(([month, data], index) => (
                            <TableRow key={month} className={index % 2 === 0 ? "bg-[#f4f6f5]" : "bg-white"}>
                              <TableCell className="p-2 font-medium">{month}</TableCell>
                              <TableCell className="p-2 text-center text-green-600">{data.present}</TableCell>
                              <TableCell className="p-2 text-center text-yellow-600">{data.late}</TableCell>
                              <TableCell className="p-2 text-center text-red-600">{data.absent}</TableCell>
                              <TableCell className="p-2 text-center">
                                {((data.present / data.total) * 100).toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          ));
                      })()}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              {/* Performance Insights */}
              <Card className="p-4">
                <h5 className="font-semibold text-gray-700 mb-3">Performance Insights</h5>
                <div className="space-y-2">
                  {(() => {
                    const presentCount = employeeData.filter(record => record.attendance_status === 'Present').length;
                    const lateCount = employeeData.filter(record => record.attendance_status === 'Late').length;
                    const absentCount = employeeData.filter(record => record.attendance_status === 'Absent').length;
                    const totalCount = employeeData.length;
                    const attendanceRate = ((presentCount + lateCount) / totalCount) * 100;
                    
                    const insights = [];
                    
                    if (attendanceRate >= 95) {
                      insights.push("🎯 Excellent attendance record - consistently present");
                    } else if (attendanceRate >= 85) {
                      insights.push("✅ Good attendance - minor improvements possible");
                    } else if (attendanceRate >= 75) {
                      insights.push("⚠️  Average attendance - consider improvement plan");
                    } else {
                      insights.push("❌ Poor attendance - needs immediate attention");
                    }
                    
                    if (lateCount > presentCount * 0.3) {
                      insights.push("⏰ High frequency of late arrivals - punctuality needs improvement");
                    }
                    
                    if (absentCount > totalCount * 0.2) {
                      insights.push("🏥 Significant number of absences - review may be needed");
                    }
                    
                    const recentRecords = employeeData.slice(0, 7);
                    const recentPresent = recentRecords.filter(record => 
                      record.attendance_status === 'Present' || record.attendance_status === 'Late'
                    ).length;
                    
                    if (recentPresent === 7) {
                      insights.push("🔥 Perfect attendance this week!");
                    } else if (recentPresent >= 5) {
                      insights.push("📈 Strong performance this week");
                    }
                    
                    return insights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                        <span className="text-sm">{insight}</span>
                      </div>
                    ));
                  })()}
                </div>
              </Card>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Edit Employee Modal */}
      {isEditModalOpen && (
        <EditEmployeeModal
          employee={employeeInfo}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};