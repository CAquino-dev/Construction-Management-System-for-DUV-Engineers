import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Card, CardContent } from "../../components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

const EmployeeProfile = () => {
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");
  const API = import.meta.env.VITE_REACT_APP_API_URL;

  // Normalize to YYYY-MM-DD string
  const normalizeDate = (d) => new Date(d).toISOString().split("T")[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [infoRes, attendanceRes, salaryRes] = await Promise.all([
          axios.get(`${API}/api/employees/getEmployeeInformation/${userId}`),
          axios.get(`${API}/api/employees/getEmployeeAttendance/${userId}`),
          axios.get(`${API}/api/employees/getEmployeeSalary/${userId}`),
        ]);

        setEmployee({
          ...infoRes.data,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            infoRes.data.full_name
          )}&background=0D8ABC&color=fff`,
        });

        setAttendance(
          attendanceRes.data.map((a) => ({
            date: normalizeDate(a.date || a.work_date),
            status: a.status === "Late" ? "Present" : a.status,
            rawStatus: a.status,
            check_in: a.check_in,
            check_out: a.check_out,
            hours_worked: a.hours_worked,
          }))
        );

        setSalaries(salaryRes.data);
      } catch (err) {
        console.error("Error loading employee data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) return <p className="p-4">Loading employee profile...</p>;
  if (!employee) return <p className="p-4">No employee found.</p>;

  // Quick Stats
  const totalPresent = attendance.filter((a) => a.status === "Present").length;
  const totalAbsent = attendance.filter((a) => a.status === "Absent").length;
  const totalSalary = salaries
    .filter((s) => s.status === "Approved")
    .reduce((sum, s) => sum + s.final_salary, 0);

  // Calendar highlight logic
  const tileClassName = ({ date }) => {
    const record = attendance.find((a) => {
      const d = new Date(a.date);
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    });

    if (record) {
      if (record.rawStatus === "Present") return "bg-green-300 rounded-full";
      if (record.rawStatus === "Late") return "bg-yellow-300 rounded-full";
      if (record.rawStatus === "Absent") return "bg-red-300 rounded-full";
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Profile Header */}
      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-6 flex items-center gap-6">
          <img
            src={employee.avatar}
            alt={employee.full_name}
            className="w-24 h-24 rounded-full shadow-md"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{employee.full_name}</h2>
            <p className="text-gray-600">
              {employee.position} • {employee.name}
            </p>
            <p className="text-gray-500">{employee.email}</p>
            <p className="text-gray-400 text-sm">
              Hire Date: {new Date(employee.hire_date).toLocaleDateString()}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-lg font-bold">{totalPresent}</p>
              <p className="text-gray-500 text-sm">Days Present</p>
            </div>
            <div>
              <p className="text-lg font-bold">{totalAbsent}</p>
              <p className="text-gray-500 text-sm">Days Absent</p>
            </div>
            <div>
              <p className="text-lg font-bold">
                ₱{totalSalary.toLocaleString()}
              </p>
              <p className="text-gray-500 text-sm">Total Salary Paid</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Calendar + Table side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card className="shadow-md rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Attendance Calendar</h2>
            <Calendar
              tileClassName={tileClassName}
              className="mx-auto rounded-xl shadow-md"
            />
            <div className="flex justify-center gap-4 mt-4 text-sm">
              <span className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-300 rounded-full"></div>{" "}
                Present
              </span>
              <span className="flex items-center gap-1">
                <div className="w-4 h-4 bg-yellow-300 rounded-full"></div> Late
              </span>
              <span className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-300 rounded-full"></div> Absent
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card className="shadow-md rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Attendance Records</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.length > 0 ? (
                  attendance.map((a, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        {new Date(a.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{a.rawStatus}</TableCell>
                      <TableCell>
                        {a.check_in
                          ? new Date(a.check_in).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {a.check_out
                          ? new Date(a.check_out).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </TableCell>
                      <TableCell>{a.hours_worked || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="5" className="text-center">
                      No records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Salary Table */}
      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Salary History</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaries.length > 0 ? (
                salaries.map((sal, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {new Date(sal.period_start).toLocaleDateString()} -{" "}
                      {new Date(sal.period_end).toLocaleDateString()}
                    </TableCell>
                    <TableCell>₱{sal.final_salary.toLocaleString()}</TableCell>
                    <TableCell>{sal.status}</TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => setSelectedSalary(sal)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="4">No salary records found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Salary Details Modal */}
      <Dialog
        open={!!selectedSalary}
        onOpenChange={() => setSelectedSalary(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salary Details</DialogTitle>
          </DialogHeader>
          {selectedSalary && (
            <div className="space-y-2">
              <p>
                <strong>Period:</strong>{" "}
                {new Date(selectedSalary.period_start).toLocaleDateString()} -{" "}
                {new Date(selectedSalary.period_end).toLocaleDateString()}
              </p>
              <p>
                <strong>Status:</strong> {selectedSalary.status}
              </p>
              <p>
                <strong>Total Hours Worked:</strong>{" "}
                {selectedSalary.total_hours_worked}
              </p>
              <p>
                <strong>Overtime Pay:</strong> ₱{selectedSalary.overtime_pay}
              </p>
              <p>
                <strong>PhilHealth:</strong> ₱
                {selectedSalary.philhealth_deduction}
              </p>
              <p>
                <strong>SSS:</strong> ₱{selectedSalary.sss_deduction}
              </p>
              <p>
                <strong>Pag-IBIG:</strong> ₱{selectedSalary.pagibig_deduction}
              </p>
              <p>
                <strong>Total Deductions:</strong> ₱
                {selectedSalary.total_deductions}
              </p>
              <p className="font-bold text-lg">
                Final Salary: ₱{selectedSalary.final_salary.toLocaleString()}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeProfile;
