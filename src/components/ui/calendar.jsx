import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function DateRangePicker({ onDateRangeChange }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Handle date range selection
  const handleDateRangeSelect = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    onDateRangeChange?.({ from: start, to: end }); // Notify parent of date selection
  };

  return (
    <div>
      <div className="flex gap-2 items-center mb-4 text-xl font-semibold">
        {startDate
          ? endDate
            ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
            : startDate.toLocaleDateString()
          : "Select a date range"}
      </div>

      <DatePicker
        selected={startDate}
        onChange={(dates) => handleDateRangeSelect(dates[0], dates[1])}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        inline
        className="react-datepicker"
      />
    </div>
  );
}
