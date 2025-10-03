import axios from "axios";
import React, { useEffect, useState } from "react";

const RequestStatus = () => {
  const [requests, setRequests] = useState([]);
  const [selectedStub, setSelectedStub] = useState(null);
  const userId = localStorage.getItem("userId");

  const getUserRequests = async () => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/inventory/getUserRequests/${userId}`
      );
      if (res.data) {
        setRequests(res.data);
      }
    } catch (error) {
      console.error("failed to fetch requests", error);
    }
  };

  useEffect(() => {
    getUserRequests();
  }, []);

  const printStub = () => {
    const printContent = document.getElementById("claim-stub");
    const printWindow = window.open("", "_blank", "width=400,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Claim Stub</title>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">My Requests</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-3 py-2 text-left">Item</th>
            <th className="border border-gray-300 px-3 py-2 text-left">
              Quantity
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left">
              Request Date
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left">
              Rejection Note
            </th>
            <th className="border border-gray-300 px-3 py-2 text-left">
              Status
            </th>
            <th className="border border-gray-300 px-3 py-2 text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id}>
              <td className="border border-gray-300 px-3 py-2">{req.name}</td>
              <td className="border border-gray-300 px-3 py-2">
                {req.quantity}
              </td>
              <td className="border border-gray-300 px-3 py-2">
                {new Date(req.request_date).toLocaleDateString()}
              </td>
              <td className="border border-gray-300 px-3 py-2">
                {req.status === "Rejected"
                  ? req.rejection_note || "No reason provided"
                  : "—"}
              </td>
              <td
                className={`border border-gray-300 px-3 py-2 font-medium ${
                  req.status === "Approved"
                    ? "text-green-600"
                    : req.status === "Rejected"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {req.status}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center">
                {req.status === "Approved" && (
                  <button
                    onClick={() => setSelectedStub(req)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View Claim Stub
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {selectedStub && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900/70 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 relative">
            <h2 className="text-xl font-bold text-center mb-4">
              📦 Claim Stub
            </h2>
            <div
              id="claim-stub"
              className="border border-dashed border-gray-400 p-4"
            >
              <p>
                <strong>Request ID:</strong> {selectedStub.id}
              </p>
              <p>
                <strong>Item:</strong> {selectedStub.name}
              </p>
              <p>
                <strong>Quantity:</strong> {selectedStub.quantity}
              </p>
              <p>
                <strong>Requester:</strong>{" "}
                {selectedStub.requester_name || "You"}
              </p>
              <p>
                <strong>Approved Date:</strong>{" "}
                {new Date().toLocaleDateString()}
              </p>
              <p>
                <strong>Status:</strong> Approved ✅
              </p>
              <div className="text-xs text-gray-500 text-center mt-3">
                Please present this stub to the Inventory Manager to claim your
                item.
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              <button
                onClick={printStub}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Print
              </button>
              <button
                onClick={() => setSelectedStub(null)}
                className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestStatus;
