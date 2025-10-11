import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const LeadModal = ({ lead, onClose }) => {
  if (!lead) return null;
  const position =
    lead.latitude && lead.longitude
      ? [lead.latitude, lead.longitude]
      : [14.5995, 120.9842];

  return (
    <div className="fixed inset-0 bg-gray-900/70 bg-opacity-40 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl shadow-lg w-[95%] max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-3">{lead.client_name}</h2>
        <p><span className="font-semibold">Email:</span> {lead.email}</p>
        <p><span className="font-semibold">Phone:</span> {lead.phone_number}</p>
        <p><span className="font-semibold">Interest:</span> {lead.project_interest}</p>
        <p><span className="font-semibold">Budget:</span> {lead.budget || "—"}</p>
        <p><span className="font-semibold">Timeline:</span> {lead.timeline || "—"}</p>

        {lead.site_visit_date && (
          <div className="mt-3 border-t pt-3">
            <h3 className="text-lg font-semibold mb-1">📅 Site Visit Details</h3>
            <p>Date: {new Date(lead.site_visit_date).toLocaleDateString()}</p>
            <p>Time: {lead.site_visit_time}</p>
            {lead.site_visit_notes && <p>Notes: {lead.site_visit_notes}</p>}
            {lead.site_location && <p>Location: {lead.site_location}</p>}
          </div>
        )}

        {lead.latitude && lead.longitude && (
          <div className="h-64 w-full mt-4 rounded-lg overflow-hidden">
            <MapContainer
              center={position}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position}></Marker>
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadModal;
