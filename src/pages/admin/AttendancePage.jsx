import React, { useState } from "react";
import { WorkerQRScanner } from "../../components/adminComponents/Foreman/WorkerQRScanner";

export const AttendancePage = () => {
  const [attendanceList, setAttendanceList] = useState([]);

  const handleWorkerScanned = async (workerId) => {


    // try {
    //   // Fetch worker details
    //   const res = await fetch(
    //     `${import.meta.env.VITE_REACT_APP_API_URL}/api/workers/${workerId}`
    //   );
    //   if (!res.ok) throw new Error("Worker not found");
    //   const worker = await res.json();

    //   // Save attendance in backend
    //   await fetch(
    //     `${import.meta.env.VITE_REACT_APP_API_URL}/api/attendance/check-in`,
    //     {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify({
    //         worker_id: worker.id,
    //         date: new Date().toISOString().split("T")[0], // today's date
    //       }),
    //     }
    //   );

    //   // Update local list
    //   setAttendanceList((prev) => {
    //     // Prevent duplicate check-in
    //     if (prev.some((w) => w.id === worker.id)) return prev;
    //     return [...prev, worker];
    //   });
    // } catch (err) {
    //   console.error(err);
    //   alert(err.message);
    // }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Worker Attendance</h1>

      {/* QR Scanner */}
      <div className="mb-6">
        <WorkerQRScanner onScan={handleWorkerScanned} />
      </div>

      {/* Attendance List */}
      <h2 className="text-lg font-semibold mb-2">Today’s Attendance</h2>
      {attendanceList.length === 0 ? (
        <p className="text-gray-500">No workers have checked in yet.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-3 py-2">#</th>
              <th className="border border-gray-300 px-3 py-2">Name</th>
              <th className="border border-gray-300 px-3 py-2">Role</th>
              <th className="border border-gray-300 px-3 py-2">Project</th>
              <th className="border border-gray-300 px-3 py-2">Check-in Time</th>
            </tr>
          </thead>
          <tbody>
            {attendanceList.map((w, i) => (
              <tr key={w.id}>
                <td className="border border-gray-300 px-3 py-2">{i + 1}</td>
                <td className="border border-gray-300 px-3 py-2">{w.name}</td>
                <td className="border border-gray-300 px-3 py-2">{w.role}</td>
                <td className="border border-gray-300 px-3 py-2">{w.project}</td>
                <td className="border border-gray-300 px-3 py-2">
                  {new Date().toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
