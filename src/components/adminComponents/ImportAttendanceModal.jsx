import React, { useState, useRef } from "react";

export const ImportAttendanceModal = ({ onClose }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null); // Reference for hidden file input

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const openFileExplorer = () => {
    fileInputRef.current.click(); // Trigger the hidden file input
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-96">
        <h2 className="text-lg font-bold ">Import Attendance Data</h2>
        <p className="text-gray-500 mb-6">Upload a CSV file to import attendance records.</p>

        {/* Drag & Drop File Upload Area */}
        <div
          className="border-2 border-dashed border-[#4c735c] rounded-lg p-6 text-center cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={openFileExplorer} // Opens file explorer on click
        >
          {selectedFiles.length > 0 ? (
            selectedFiles.map((file, index) => (
              <div key={index} className="flex justify-between items-center border p-2 rounded-md mb-2 bg-gray-100">
                <span className="text-gray-700">{file.name}</span>
                <span className="text-green-600">✅ Uploaded</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Drag and drop a file here or click to browse</p>
          )}
        </div>

        {/* File Input (Hidden but Triggered on Click) */}
        <input type="file" className="hidden" multiple onChange={handleFileUpload} ref={fileInputRef} />

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <button className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600" onClick={onClose}>
            Cancel
          </button>
          <button className="bg-[#4c735c] text-white px-4 py-2 rounded-md hover:bg-[#5A8366]">
            Import Attendance
          </button>
        </div>
      </div>
    </div>
  );
};
