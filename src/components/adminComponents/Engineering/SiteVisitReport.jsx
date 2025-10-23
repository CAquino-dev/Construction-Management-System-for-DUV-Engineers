import React, { useEffect, useState } from "react";
import axios from "axios";
import { X, MapPin, Calendar, User, Note, Ruler, Tree, Car, Drop, Lightning, Globe, File, Image, Download } from "@phosphor-icons/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icon for site visit location
const siteVisitIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const SiteVisitReport = ({ isOpen, onClose, leadId }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details"); // "details" or "map"

  useEffect(() => {
    if (!isOpen || !leadId) return;

    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/sales/getSiteVisitReport/${leadId}`
        );
        setReport(res.data?.[0] || null);
      } catch (err) {
        console.error("Error fetching site visit report:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [isOpen, leadId]);

  // Check if file is an image
  const isImageFile = (filename) => {
    if (!filename) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  // Check if file is a PDF
  const isPdfFile = (filename) => {
    return filename?.toLowerCase().endsWith('.pdf');
  };

  // Get file type display
  const getFileTypeDisplay = (filename) => {
    if (isImageFile(filename)) return { type: 'image', icon: Image, label: 'Image' };
    if (isPdfFile(filename)) return { type: 'pdf', icon: File, label: 'PDF Document' };
    return { type: 'file', icon: File, label: 'Document' };
  };

  // Get full file URL
  const getFileUrl = (filename) => {
    if (!filename) return null;
    return `${import.meta.env.VITE_REACT_APP_API_URL}/uploads/sitevisits/${filename}`;
  };

  // Handle file download
  const handleDownload = (filename) => {
    const fileUrl = getFileUrl(filename);
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isOpen) return null;

  const hasCoordinates = report?.latitude && report?.longitude;
  const position = hasCoordinates ? [parseFloat(report.latitude), parseFloat(report.longitude)] : [14.5995, 120.9842];
  const fileInfo = report?.report_file_url ? getFileTypeDisplay(report.report_file_url) : null;
  const fileUrl = report?.report_file_url ? getFileUrl(report.report_file_url) : null;

  return (
    <div className="fixed inset-0 bg-gray-900/70 bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl p-6 relative max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-1 shadow-md"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MapPin size={28} className="text-[#4c735c]" />
            Site Visit Report
          </h2>
          {report && (
            <p className="text-gray-600 mt-1 flex items-center gap-1">
              <User size={16} />
              {report.client_name} • 
              <Calendar size={16} className="ml-2" />
              {new Date(report.date_visited).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4c735c] mx-auto mb-4"></div>
              <p className="text-gray-500">Loading site visit report...</p>
            </div>
          </div>
        ) : !report ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center text-gray-500">
              <MapPin size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg">No site visit report found</p>
              <p className="text-sm">This lead doesn't have a site visit report yet.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(90vh-180px)]">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("details")}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === "details"
                    ? "border-[#4c735c] text-[#4c735c]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Report Details
              </button>
              <button
                onClick={() => setActiveTab("map")}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === "map"
                    ? "border-[#4c735c] text-[#4c735c]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Location Map
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === "details" ? (
                <div className="space-y-6">
                  {/* File/Image Section */}
                  {report.report_file_url && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Note size={20} />
                        Attached File
                      </h3>
                      <div className="flex flex-col gap-4">
                        {fileInfo?.type === 'image' ? (
                          // Image Display
                          <div className="space-y-3">
                            <img
                              src={`${import.meta.env.VITE_REACT_APP_API_URL}${report.report_file_url}`}
                              alt="Site Visit"
                              className="rounded-lg w-full max-w-md h-48 object-cover shadow-md mx-auto"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <div className="flex justify-center gap-3">
                              <button
                                onClick={() => handleDownload(report.report_file_url)}
                                className="flex items-center gap-2 bg-[#4c735c] text-white px-4 py-2 rounded-lg hover:bg-[#3b5d49] transition-colors text-sm"
                              >
                                <Download size={16} />
                                Download Image
                              </button>
                              <a
                                href={`${import.meta.env.VITE_REACT_APP_API_URL}${report.report_file_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 border border-[#4c735c] text-[#4c735c] px-4 py-2 rounded-lg hover:bg-[#4c735c] hover:text-white transition-colors text-sm"
                              >
                                <Image size={16} />
                                Open in New Tab
                              </a>
                            </div>
                          </div>
                        ) : (
                          // Document/PDF Display
                          <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-md mx-auto">
                            <div className="text-center">
                              <File size={48} className="mx-auto mb-3 text-gray-400" />
                              <p className="font-semibold text-gray-800 mb-1">
                                {fileInfo?.label || 'Document'}
                              </p>
                              <p className="text-sm text-gray-500 mb-4">
                                {report.report_file_url}
                              </p>
                              <div className="flex justify-center gap-3">
                                <button
                                  onClick={() => handleDownload(report.report_file_url)}
                                  className="flex items-center gap-2 bg-[#4c735c] text-white px-4 py-2 rounded-lg hover:bg-[#3b5d49] transition-colors text-sm"
                                >
                                  <Download size={16} />
                                  Download File
                                </button>
                                {fileInfo?.type === 'pdf' && (
                                  <a
                                    href={`${import.meta.env.VITE_REACT_APP_API_URL}${report.report_file_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 border border-[#4c735c] text-[#4c735c] px-4 py-2 rounded-lg hover:bg-[#4c735c] hover:text-white transition-colors text-sm"
                                  >
                                    <File size={16} />
                                    Open PDF
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Site Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <User size={20} />
                          Client Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="font-medium text-gray-600">Client Name:</span>
                            <span className="text-gray-800">{report.client_name}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="font-medium text-gray-600">Visited By:</span>
                            <span className="text-gray-800">{report.created_by}</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="font-medium text-gray-600">Report Created:</span>
                            <span className="text-gray-800">
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Ruler size={20} />
                          Site Measurements
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="font-medium text-gray-600">Area:</span>
                            <span className="text-gray-800">{report.area_measurement} sqm</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="font-medium text-gray-600">Terrain Type:</span>
                            <span className="text-gray-800 capitalize">{report.terrain_type}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Car size={20} />
                          Site Conditions
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-3 py-2 border-b border-gray-200">
                            <Car size={16} className="text-gray-500" />
                            <span className="font-medium text-gray-600 flex-1">Accessibility:</span>
                            <span className="text-gray-800 capitalize">{report.accessibility}</span>
                          </div>
                          <div className="flex items-center gap-3 py-2 border-b border-gray-200">
                            <Drop size={16} className="text-blue-500" />
                            <span className="font-medium text-gray-600 flex-1">Water Source:</span>
                            <span className="text-gray-800 capitalize">{report.water_source}</span>
                          </div>
                          <div className="flex items-center gap-3 py-2">
                            <Lightning size={16} className="text-yellow-500" />
                            <span className="font-medium text-gray-600 flex-1">Power Source:</span>
                            <span className="text-gray-800 capitalize">{report.power_source}</span>
                          </div>
                        </div>
                      </div>

                      {hasCoordinates && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Globe size={20} />
                            Coordinates
                          </h3>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">Latitude:</span>
                              <span className="text-gray-800 font-mono">{report.latitude}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">Longitude:</span>
                              <span className="text-gray-800 font-mono">{report.longitude}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes Section */}
                  {report.notes && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Note size={20} />
                        Additional Notes
                      </h3>
                      <p className="text-gray-700 bg-white rounded-lg p-4 border border-gray-200">
                        {report.notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Map Tab */
                <div className="h-96 rounded-xl overflow-hidden border border-gray-200">
                  <MapContainer
                    center={position}
                    zoom={hasCoordinates ? 15 : 12}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {hasCoordinates && (
                      <Marker position={position} icon={siteVisitIcon}>
                        <Popup>
                          <div className="text-center">
                            <strong>Site Visit Location</strong>
                            <br />
                            {report.location || "No specific location provided"}
                            <br />
                            <small className="text-gray-500">
                              {report.latitude}, {report.longitude}
                            </small>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                  {!hasCoordinates && (
                    <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                      <div className="bg-white rounded-lg p-4 text-center">
                        <MapPin size={32} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-600">No coordinates available for this site visit</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-4 mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Report ID: {report.id} • Visited on {new Date(report.date_visited).toLocaleDateString()}
              </div>
              <button
                onClick={onClose}
                className="bg-[#4c735c] text-white px-6 py-2 rounded-lg hover:bg-[#3b5d49] transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteVisitReport;