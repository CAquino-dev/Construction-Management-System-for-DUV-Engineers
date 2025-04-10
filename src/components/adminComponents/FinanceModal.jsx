import React from "react";
import { X } from "@phosphor-icons/react";

export const FinanceModal = ({ closeModal, record }) => {
  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[600px]">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center w-full mb-4">
          <h2 className="text-xl font-bold text-gray-800">Finance Record</h2>
          <button onClick={closeModal} className="text-gray-600 hover:text-red-500 cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* Finance Details */}
        <div className="grid grid-cols-2 gap-4 text-gray-800">
          <p><strong>Employee ID:</strong></p>
          <p className="text-right">{record?.employee_id || "N/A"}</p>

          <p><strong>Employee Name:</strong></p>
          <p className="text-right">{record?.fullname || "N/A"}</p>

          <p><strong>Period Start:</strong></p>
          <p className="text-right">{record?.period_start || "N/A"}</p>

          <p><strong>Period End:</strong></p>
          <p className="text-right">{record?.period_end || "N/A"}</p>

          <p><strong>Hours Worked:</strong></p>
          <p className="text-right">{record?.hours_worked || "0"} hrs</p>

          <p><strong>Salary:</strong></p>
          <p className="text-right">₱{record?.salary || "0.00"}</p>

          <p><strong>Status:</strong></p>
          <p className={`text-right font-semibold ${record?.status === "Pending" ? "text-yellow-500" : "text-green-500"}`}>
            {record?.status || "N/A"}
          </p>

          <p><strong>Approved By (HR):</strong></p>
          <p className="text-right">{record?.approved_by || "N/A"}</p>

          <p><strong>Approved At:</strong></p>
          <p className="text-right">{record?.approved_at || "N/A"}</p>

          <p><strong>Remarks:</strong></p>
          <p className="text-right">{record?.remarks || "No remarks"}</p>
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-6">
          <button className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600" onClick={closeModal}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
