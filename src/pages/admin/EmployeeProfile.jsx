import React from "react";
import { EmployeeCalendar } from "../../components/ui/EmployeeCalendar";

const EmployeeProfile = () => {
  const employee = {
    name: "Juan Dela Cruz",
    position: "Engineer",
    department: "Engineer Department",
    email: "juan.delacruz@example.com",
    phone: "+63 912 345 6789",
    hireDate: "2022-03-01",
    avatar: "https://via.placeholder.com/150",
  };

  const payslips = [
    { id: 1, month: "August 2025", amount: "₱50,000", url: "#" },
    { id: 2, month: "July 2025", amount: "₱50,000", url: "#" },
    { id: 3, month: "June 2025", amount: "₱48,000", url: "#" },
  ];

  return (
    <div className="mx-auto p-4 sm:p-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section */}
        <div className="lg:col-span-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col items-center border-b border-gray-200 pb-4">
            <img
              src={employee.avatar}
              alt={employee.name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mb-4"
            />
            <h3 className="text-lg sm:text-xl font-semibold">
              {employee.name}
            </h3>
            <p className="text-gray-600">{employee.position}</p>
            <p className="text-sm text-gray-500">{employee.department}</p>
          </div>

          <div className="mt-4 sm:mt-6 space-y-2 text-sm">
            <p>
              <strong>Email:</strong> {employee.email}
            </p>
            <p>
              <strong>Phone:</strong> {employee.phone}
            </p>
            <p>
              <strong>Hire Date:</strong>{" "}
              {new Date(employee.hireDate).toLocaleDateString()}
            </p>
          </div>

          {/* Calendar here */}
          <p className="text-lg font-semibold mb-3 border-t border-gray-200 pb-2 text-center mt-6">
            Attendace
          </p>
          <EmployeeCalendar />
        </div>

        {/* Right Section */}
        <div className="lg:col-span-8 space-y-6">
          {/* Profile Info */}
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3 border-b border-gray-200 pb-2">
              Basic Information
            </h3>
            <div className="space-y-2 text-sm sm:text-base">
              <p>
                <strong>Full Name:</strong> {employee.name}
              </p>
              <p>
                <strong>Position:</strong> {employee.position}
              </p>
              <p>
                <strong>Department:</strong> {employee.department}
              </p>
              <p>
                <strong>Email:</strong> {employee.email}
              </p>
              <p>
                <strong>Phone:</strong> {employee.phone}
              </p>
              <p>
                <strong>Hire Date:</strong>{" "}
                {new Date(employee.hireDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Payslips */}
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3 border-b border-gray-200 pb-2">
              Payslips
            </h3>
            {payslips.length === 0 ? (
              <p className="text-gray-500">No payslips available.</p>
            ) : (
              <ul className="space-y-2">
                {payslips.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 border rounded-md bg-gray-50"
                  >
                    <span className="mb-2 sm:mb-0">
                      <strong>{p.month}</strong> – {p.amount}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
