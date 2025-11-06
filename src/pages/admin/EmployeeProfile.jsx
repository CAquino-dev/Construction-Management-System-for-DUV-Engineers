import React, { useEffect, useState } from "react";
import axios from "axios";
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
import PaginationComponent from "../../components/adminComponents/Pagination";

const EmployeeProfile = () => {
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendancePage, setAttendancePage] = useState(1);
  const [salaryPage, setSalaryPage] = useState(1);

  const rowsPerPage = 10;

  const attendanceStart = (attendancePage - 1) * rowsPerPage;
  const attendanceEnd = attendanceStart + rowsPerPage;
  const paginatedAttendance = attendance.slice(attendanceStart, attendanceEnd);

  const salaryStart = (salaryPage - 1) * rowsPerPage;
  const salaryEnd = salaryStart + rowsPerPage;
  const paginatedSalaries = salaries.slice(salaryStart, salaryEnd);

  const userId = localStorage.getItem("userId");
  const API = import.meta.env.VITE_REACT_APP_API_URL;

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

  const totalPresent = attendance.filter((a) => a.status === "Present").length;
  const totalAbsent = attendance.filter((a) => a.status === "Absent").length;
  const totalSalary = salaries
    .filter((s) => s.status === "Approved")
    .reduce((sum, s) => sum + s.final_salary, 0);

  const getStatusBadge = (status) => {
    let color = "bg-gray-300 text-gray-800";
    if (status === "Present") color = "bg-green-200 text-green-800";
    if (status === "Late") color = "bg-yellow-200 text-yellow-800";
    if (status === "Absent") color = "bg-red-200 text-red-800";

    return (
      <span className={`px-2 py-1 rounded-full text-sm font-medium ${color}`}>
        {status}
      </span>
    );
  };

  // Function to get salary status display
  const getSalaryStatus = (salary) => {
    if (salary.hr_status === "Rejected by HR") {
      return <span className="text-red-600 font-medium">Rejected</span>;
    }
    return salary.status;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Profile Header */}
      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <img
            src={employee.avatar}
            alt={employee.full_name}
            className="w-24 h-24 rounded-full shadow-md"
          />
          <div className="flex-1 space-y-1">
            <h2 className="text-2xl font-bold">{employee.full_name}</h2>
            <p className="text-gray-600">
              {employee.position} • {employee.name}
            </p>
            <p className="text-gray-500">{employee.email}</p>
            <p className="text-gray-400 text-sm">
              Hire Date: {new Date(employee.hire_date).toLocaleDateString()}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center mt-4 md:mt-0">
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
                paginatedAttendance.map((a, idx) => (
                  <TableRow
                    key={idx}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell>
                      {new Date(a.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(a.rawStatus)}</TableCell>
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

          {/* Pagination below table */}
          <div className="flex justify-center mt-4">
            <PaginationComponent
              currentPage={attendancePage}
              totalPages={Math.ceil(attendance.length / rowsPerPage)}
              setCurrentPage={setAttendancePage}
            />
          </div>
        </CardContent>
      </Card>

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
                paginatedSalaries.map((sal, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {new Date(sal.period_start).toLocaleDateString()} -{" "}
                      {new Date(sal.period_end).toLocaleDateString()}
                    </TableCell>
                    <TableCell>₱{sal.final_salary.toLocaleString()}</TableCell>
                    <TableCell>{getSalaryStatus(sal)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => setSelectedSalary(sal)}
                        className="bg-[#4c735c] hover:bg-[#4c735c]/90 cursor-pointer"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="4" className="text-center">
                    No salary records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination below table */}
          <div className="flex justify-center mt-4">
            <PaginationComponent
              currentPage={salaryPage}
              totalPages={Math.ceil(salaries.length / rowsPerPage)}
              setCurrentPage={setSalaryPage}
            />
          </div>
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
            <div className="space-y-3">
              <p>
                <strong>Period:</strong>{" "}
                {new Date(selectedSalary.period_start).toLocaleDateString()} -{" "}
                {new Date(selectedSalary.period_end).toLocaleDateString()}
              </p>
              <p>
                <strong>Status:</strong> {getSalaryStatus(selectedSalary)}
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

              {/* Conditionally render remarks if not null */}
              {selectedSalary.remarks && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <strong className="text-yellow-800">Remarks:</strong>
                  <p className="text-yellow-700 mt-1">{selectedSalary.remarks}</p>
                </div>
              )}

              {selectedSalary.signature_url ? (
                <div className="mt-4">
                  <strong>Employee Signature:</strong>
                  <div className="border rounded-md mt-2 p-2 bg-gray-50">
                    <img
                      src={`${API}${selectedSalary.signature_url}`}
                      alt="Employee Signature"
                      className="max-h-32 object-contain"
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-gray-500 italic">
                  No signature recorded for this salary release.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeProfile;