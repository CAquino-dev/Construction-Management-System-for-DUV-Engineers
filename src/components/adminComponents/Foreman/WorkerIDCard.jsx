import React, { useEffect, useState } from "react";

export const WorkerIDCard = ({ workerId }) => {
  const [worker, setWorker] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchWorker = async () => {
      const res = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/foreman/getWorker/${workerId}`
      );
      const data = await res.json();
      setWorker(data);
      setPreview(data.photo || "/placeholder.png");
    };
    fetchWorker();
  }, [workerId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (!worker) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* ID CARDS (Front + Back) */}
      <div className="print-container flex flex-col md:flex-row items-center justify-center gap-10 p-6 print:flex-row print:gap-10">
        {/* FRONT SIDE */}
        <div className="border rounded-xl shadow-lg w-72 h-[420px] flex flex-col items-center justify-between p-4 bg-[#4c735c]">
          {/* Company Logo */}
          <div className="flex justify-between w-full items-center">
            <img src="/public/favicon.jpg" alt="Logo" className="h-10" />
            <h2 className="text-sm font-bold text-white">WORKER ID</h2>
          </div>

          {/* Worker Photo */}
          <img
            src={`${import.meta.env.VITE_REACT_APP_API_URL}${worker.photo}`}
            alt="Worker"
            className="w-28 h-28 rounded-md object-cover border"
          />

          {/* Worker Details */}
          <div className="text-center text-white">
            <p className="text-xl font-bold">{worker.name}</p>
            <p>{worker.skill_type}</p>
            <p>Team: {worker.team_id}</p>
          </div>

          {/* Company Footer */}
          <div className="text-xs text-white w-full text-center border-t pt-2">
            DUV engineers. • Official ID
          </div>
        </div>

        {/* BACK SIDE */}
        <div className="border rounded-xl shadow-lg bg-white w-72 h-[420px] flex flex-col justify-between p-4">
          <h2 className="text-sm font-bold text-gray-600 text-center mb-2">
            Identification Details
          </h2>

          {/* QR Code */}
          <div className="flex justify-center">
            <img
              src={worker.qr_image}
              alt="Worker QR"
              className="w-32 h-32 border"
            />
          </div>

          {/* Contact Info */}
          <div className="mt-4 text-sm text-gray-700 text-center">
            <p>
              <span className="font-semibold">Contact:</span> {worker.contact}
            </p>
            <p>
              <span className="font-semibold">Valid Until:</span>{" "}
              {worker.valid_until || "Dec 2025"}
            </p>
          </div>

          {/* Emergency Info */}
          <div className="mt-4 text-xs text-gray-500 border-t pt-2">
            <p>
              If found, please return to DUV engineers. HQ, or contact
              +63-900-000-0000
            </p>
          </div>
        </div>
      </div>

      {/* Controls (Only for Screen, hidden in Print) */}
      <div className="flex flex-col gap-3 items-center mt-4 print:hidden">
        {/* Print Button */}
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-[#4c735c] text-white rounded-lg hover:bg-green-700 shadow"
        >
          Print ID
        </button>
      </div>
    </div>
  );
};
