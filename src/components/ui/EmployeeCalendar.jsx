// src/components/EmployeeCalendar.jsx
import React, { useState } from "react";

export const EmployeeCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Example attendance dates (replace with API later)
  const attendance = ["2025-09-02", "2025-09-05", "2025-09-12", "2025-09-14"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const days = [];
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null);
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const formatDate = (date) => date.toISOString().split("T")[0];

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm w-full overflow-x-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <button
          onClick={prevMonth}
          className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
        >
          Prev
        </button>
        <h3 className="text-base sm:text-lg font-semibold text-center flex-1">
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <button
          onClick={nextMonth}
          className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
        >
          Next
        </button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs font-medium text-gray-600">
        {weekDays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1 text-center mt-2 text-sm sm:text-base">
        {days.map((date, i) =>
          date ? (
            <div
              key={i}
              className={`p-2 rounded cursor-pointer transition ${
                attendance.includes(formatDate(date))
                  ? "bg-green-500 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {date.getDate()}
            </div>
          ) : (
            <div key={i}></div>
          )
        )}
      </div>
    </div>
  );
};
