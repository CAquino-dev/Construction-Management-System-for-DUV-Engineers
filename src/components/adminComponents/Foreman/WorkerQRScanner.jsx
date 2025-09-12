import React, { useState } from "react";
import { Scanner, useDevices } from "@yudiel/react-qr-scanner";
import { Toaster } from "../../ui/sonner"; // keep your UI wrapper
import { toast } from "sonner"; // ✅ import toast from package

export const WorkerQRScanner = () => {
  const devices = useDevices();
  const [selectedDeviceId, setSelectedDeviceId] = useState(undefined);
  const [scannedId, setScannedId] = useState(null);
  const [worker, setWorker] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async (detectedCodes) => {
    const code = detectedCodes[0]?.rawValue;
    console.log(detectedCodes[0]?.rawValue);
    if (code) {
      setScannedId(code);

      try {
        const res = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/foreman/scanWorker`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: code }),
          }
        );
        if (!res.ok) throw new Error("Worker not found");
        const data = await res.json();
        setWorker({ ...data.worker, statusMessage: data.message });
        setError(null);

        toast.success(data.message || "Worker attendance updated!");
      } catch (err) {
        setWorker(null);
        setError(err.message);

        toast.error(err.message || "Scan failed!");
      }
    }
  };

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

      {scannedId && (
        <p className="mt-2">
          <strong>Scanned ID:</strong> {scannedId}
        </p>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}

      {worker && (
        <div className="mt-4 p-3 border rounded-lg shadow">
          <h3 className="text-md font-bold">{worker.name}</h3>
          <p>
            <strong>Contact:</strong> {worker.contact}
          </p>
          <p>
            <strong>Skill:</strong> {worker.skill_type}
          </p>
          <p className="mt-2 text-blue-600 font-semibold">
            {worker.statusMessage || "Attendance updated"}
          </p>
        </div>
      )}
    </div>
  );
};
