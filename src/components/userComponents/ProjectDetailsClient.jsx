import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPin, Folder, User, Calendar, AlertCircle, Navigation } from 'lucide-react';

// Map components
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export const ProjectDetailsClient = ({ selectedProject }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [projectDetails, setProjectDetails] = useState({
    project_name: "",
    engineer_name: "",
    date_started: "",
    date_end: "",
    location: "",
    status: "",
    scope_of_work: "[]",
    site_location: "",
    latitude: null,
    longitude: null,
    site_visit_notes: "",
    proposal_description: ""
  });

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!selectedProject?.id) return;
      
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/project/getProjectDetails/${selectedProject.id}`
        );
        if (res.data.project) {
          const project = res.data.project;
          setProjectDetails({
            project_name: project.project_name || "",
            engineer_name: project.engineer_name || "",
            date_started: project.date_started || "",
            date_end: project.date_end || "",
            location: project.location || "",
            status: project.status || "",
            scope_of_work: project.scope_of_work || "[]",
            site_location: project.site_location || "",
            latitude: project.latitude,
            longitude: project.longitude,
            site_visit_notes: project.site_visit_notes || "",
            proposal_description: project.proposal_description || ""
          });
        }
      } catch (error) {
        console.error('Error fetching project details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [selectedProject]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const parseScopeOfWork = (scope) => {
    try {
      if (typeof scope === 'string') {
        return JSON.parse(scope);
      }
      return scope || [];
    } catch {
      return [];
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if project has valid coordinates
  const hasValidCoordinates = () => {
    return (
      projectDetails.latitude &&
      projectDetails.longitude &&
      !isNaN(parseFloat(projectDetails.latitude)) &&
      !isNaN(parseFloat(projectDetails.longitude))
    );
  };

  // Get map center coordinates
  const getMapCenter = () => {
    if (hasValidCoordinates()) {
      return [
        parseFloat(projectDetails.latitude),
        parseFloat(projectDetails.longitude),
      ];
    }
    return [14.5995, 120.9842]; // Default center (Manila area)
  };

  const openInGoogleMaps = () => {
    if (hasValidCoordinates()) {
      const url = `https://www.google.com/maps?q=${projectDetails.latitude},${projectDetails.longitude}`;
      window.open(url, '_blank');
    }
  };

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Select a project to view details</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4c735c]"></div>
      </div>
    );
  }

  const scopeItems = parseScopeOfWork(projectDetails.scope_of_work);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Folder className="w-6 h-6 text-[#4c735c]" />
            Project Details
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Complete information about your project
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(projectDetails.status)}`}>
          <AlertCircle className="w-4 h-4 mr-1" />
          {projectDetails.status || 'Unknown Status'}
        </span>
      </div>

      {/* Project Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h5 className="font-semibold text-gray-900 flex items-center gap-2">
            <Folder className="w-4 h-4 text-[#4c735c]" />
            Basic Information
          </h5>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                {projectDetails.project_name}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                {projectDetails.location}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Information */}
        <div className="space-y-4">
          <h5 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#4c735c]" />
            Timeline
          </h5>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                {formatDate(projectDetails.date_started)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                {formatDate(projectDetails.date_end)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      {hasValidCoordinates() && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-semibold text-gray-900 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#4c735c]" />
              Project Location
            </h5>
            <button
              onClick={openInGoogleMaps}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-[#4c735c] text-white rounded-lg hover:bg-[#3a5a4a] transition-colors"
            >
              <Navigation className="w-3 h-3" />
              Open in Maps
            </button>
          </div>
          
          <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300">
            <MapContainer
              center={getMapCenter()}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
              zoomControl={true}
              dragging={true}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={getMapCenter()}>
                <Popup>
                  <div className="text-center">
                    <strong>{projectDetails.project_name}</strong>
                    <br />
                    {projectDetails.site_location || projectDetails.location}
                    <br />
                    <small>
                      Engineer: {projectDetails.engineer_name}
                    </small>
                    <br />
                    <small className="text-gray-500">
                      {parseFloat(projectDetails.latitude).toFixed(6)}, {parseFloat(projectDetails.longitude).toFixed(6)}
                    </small>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
          
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Site Location:</span> {projectDetails.site_location}
            </p>
            {projectDetails.site_visit_notes && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Location Notes:</span> {projectDetails.site_visit_notes}
              </p>
            )}
            <p className="text-sm text-gray-500">
              <span className="font-medium">Coordinates:</span> {parseFloat(projectDetails.latitude).toFixed(6)}, {parseFloat(projectDetails.longitude).toFixed(6)}
            </p>
          </div>
        </div>
      )}

      {!hasValidCoordinates() && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-yellow-800 font-medium">Location Map Unavailable</p>
              <p className="text-yellow-700 text-sm">
                No coordinates available for this project. The location map cannot be displayed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Scope of Work */}
      <div className="mt-6">
        <h5 className="font-semibold text-gray-900 mb-3">Scope of Work</h5>
        {scopeItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {scopeItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-2 h-2 bg-[#4c735c] rounded-full flex-shrink-0"></div>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-gray-200">
            No scope of work defined
          </p>
        )}
      </div>

      {/* Additional Information */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h5 className="font-semibold text-gray-900 mb-3">Project Description</h5>
        <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
          {projectDetails.proposal_description || "This project includes comprehensive planning, execution, and monitoring phases. Regular updates and progress reports are maintained to ensure timely completion."}
        </p>
      </div>
    </div>
  );
};