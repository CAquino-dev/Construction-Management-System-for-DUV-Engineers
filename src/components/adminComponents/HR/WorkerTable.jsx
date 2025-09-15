// components/adminComponents/HR/WorkerTable.jsx
import React from "react";

export const WorkerTable = ({ workers, setSelectedWorker }) => {
  return (
    <table className="min-w-full border border-gray-200 rounded-lg">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">ID</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">Team</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">Name</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">Contact</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">Skill Type</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">Status</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">Created At</th>
        </tr>
      </thead>
      <tbody>
        {workers.length > 0 ? (
          workers.map((worker) => (
            <tr
              key={worker.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedWorker && setSelectedWorker(worker)}
            >
              <td className="px-4 py-2 border-b text-sm">{worker.id}</td>
              <td className="px-4 py-2 border-b text-sm">{worker.team_name}</td>
              <td className="px-4 py-2 border-b text-sm font-medium text-gray-700">{worker.name}</td>
              <td className="px-4 py-2 border-b text-sm">{worker.contact}</td>
              <td className="px-4 py-2 border-b text-sm">{worker.skill_type}</td>
              <td className="px-4 py-2 border-b text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    worker.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {worker.status}
                </span>
              </td>
              <td className="px-4 py-2 border-b text-sm">
                {new Date(worker.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="7" className="text-center text-gray-500 py-4">
              No workers found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
