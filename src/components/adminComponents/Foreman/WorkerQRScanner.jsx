import React, { useState, useEffect } from "react";
import { Scanner, useDevices } from "@yudiel/react-qr-scanner";
import { toast } from "sonner";

export const WorkerQRScanner = () => {
  const devices = useDevices();
  const [selectedDeviceId, setSelectedDeviceId] = useState(undefined);
  const [scannedId, setScannedId] = useState(null);
  const [worker, setWorker] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleScan = async (detectedCodes) => {
    const code = detectedCodes[0]?.rawValue;
    if (code && code !== scannedId) {
      setScannedId(code);

      try {
        const res = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/foreman/scanWorker`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          }
        );

        if (!res.ok) throw new Error("Worker not found");
        const data = await res.json();

        setWorker({ ...data.worker, statusMessage: data.message });
        setError(null);
        setShowModal(true);
        toast.success(data.message || "Worker attendance updated!");

        // 👇 Reset scannedId after a short delay so same QR can be scanned again
        setTimeout(() => setScannedId(null), 2000);
      } catch (err) {
        setWorker(null);
        setError(err.message);
        toast.error(err.message || "Scan failed!");
      }
    }
  };

  // 👇 Auto-close modal after 3 seconds
  useEffect(() => {
    let timer;
    if (showModal) {
      timer = setTimeout(() => {
        setShowModal(false);
      }, 4000); // close after 3 seconds
    }
    return () => clearTimeout(timer);
  }, [showModal]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4 text-center">Scan Worker QR</h2>

      <div className="mb-2 text-center">
        <select
          value={selectedDeviceId}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
          className="border p-2 rounded-lg"
        >
          <option value="">Select camera</option>
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || d.deviceId}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full max-w-sm mx-auto rounded-lg overflow-hidden shadow-lg">
        <Scanner
          constraints={{ deviceId: selectedDeviceId }}
          onScan={handleScan}
          onError={(err) => setError(err?.toString())}
          scanDelay={1000}
          allowMultiple={false}
          formats={["qr_code"]}
        />
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {/* ✅ Modal */}
      {showModal && worker && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-4 relative animate-fadeIn">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            {/* ✅ Worker ID Card Front Preview */}
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
          </div>
        </div>
      )}
    </div>
  );
};
