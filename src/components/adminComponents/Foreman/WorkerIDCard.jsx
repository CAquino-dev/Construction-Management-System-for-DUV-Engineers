import React, { useEffect, useState } from "react";

export const WorkerIDCard = ({ workerId, onBack }) => {
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    const fetchWorker = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/foreman/getWorker/${workerId}`
      );
      const data = await res.json();
      setWorker(data);
    };
    fetchWorker();
  }, [workerId]);

  if (!worker) return <p>Loading...</p>;

  return (
    <div className="print-container flex items-center justify-center">
      <div className="border rounded-xl shadow-lg p-6 text-center bg-white w-80">
        <h2 className="text-xl font-bold mb-4">Worker ID</h2>
        <p className="text-lg font-semibold">{worker.name}</p>
        <p className="text-gray-600">{worker.skill_type}</p>
        <p className="text-gray-600">{worker.contact}</p>
        <p className="text-gray-500 text-sm">Team: {worker.team_id}</p>

        <div className="mt-4">
          <img
            src={worker.qr_image}
            alt="Worker QR"
            className="mx-auto w-32 h-32"
          />
        </div>

        {/* Buttons (hidden in print) */}
        <div className="mt-6 flex justify-center gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Print ID
          </button>
        </div>
      </div>
    </div>
  );
};
