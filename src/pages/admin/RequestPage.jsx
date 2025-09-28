import React, { useState } from "react";
import RequestForm from "../../components/adminComponents/Inventory/RequestForm";
import RequestStatus from "../../components/adminComponents/Inventory/RequestStatus";

const RequestPage = () => {
  const [activeTab, setActiveTab] = useState("form");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Office Supply Requests</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("form")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "form"
              ? "bg-[#4c735c] text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Make Request
        </button>
        <button
          onClick={() => setActiveTab("status")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "status"
              ? "bg-[#4c735c] text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Request Status
        </button>
      </div>

      {/* Content */}
      {activeTab === "form" ? <RequestForm /> : <RequestStatus />}
    </div>
  );
};

export default RequestPage;
