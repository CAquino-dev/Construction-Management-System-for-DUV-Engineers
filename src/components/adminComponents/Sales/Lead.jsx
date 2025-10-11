import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import LeadModal from "./LeadModal";

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

// 📍 Handles clicking on the map
const LocationPicker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position ? <Marker position={position}></Marker> : null;
};

// 🔍 Location Search Component — must be inside <MapContainer>
const LocationSearchControl = ({ setPosition, setAddress }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const map = useMap();

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length < 3) return setResults([]);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${value}`
      );
      const data = await res.json();
      setResults(data);
    } catch {
      toast.error("Failed to search location");
    }
  };

  const handleSelect = (place) => {
    const { lat, lon, display_name } = place;
    const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
    map.setView(newPos, 15);
    setPosition(newPos);
    setAddress(display_name);
    setResults([]);
    setQuery(display_name);
  };

  return (
    <div className="absolute top-2 left-2 right-2 z-[1000]">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="🔍 Search for location..."
        className="border rounded-lg p-3 w-full bg-white shadow"
      />
      {results.length > 0 && (
        <ul className="absolute bg-white border w-full rounded-lg mt-1 max-h-40 overflow-y-auto z-[2000] shadow-lg">
          {results.map((place, idx) => (
            <li
              key={idx}
              className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => handleSelect(place)}
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Lead = () => {
  const [formData, setFormData] = useState({
    client_name: "",
    email: "",
    phone_number: "",
    project_interest: "",
    budget: "",
    timeline: "",
    site_visit_date: "",
    site_visit_time: "",
    site_visit_notes: "",
    site_location: "",
    latitude: null,
    longitude: null,
  });

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  // 🧾 Fetch all leads
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/sales/getLeads`
        );
        const data = await response.json();
        setLeads(data);
      } catch (err) {
        toast.error("❌ Failed to fetch leads.");
      }
    };
    fetchLeads();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      latitude: position?.lat || null,
      longitude: position?.lng || null,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/sales/createLead`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        toast.success("✅ Lead & Site Visit Scheduled Successfully!");
        setFormData({
          client_name: "",
          email: "",
          phone_number: "",
          project_interest: "",
          budget: "",
          timeline: "",
          site_visit_date: "",
          site_visit_time: "",
          site_visit_notes: "",
          site_location: "",
        });
        setPosition(null);

        const res = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/sales/getLeads`
        );
        const leadsData = await res.json();
        setLeads(leadsData);
      } else {
        toast.error("❌ Failed to create lead.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("❌ Server error while creating lead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="flex flex-col sm:flex-row gap-6 max-w-6xl mx-auto">
        {/* Left Panel */}
        <div className="w-full sm:w-6/12 p-6 rounded-lg shadow bg-white">
          <h2 className="text-2xl font-bold mb-4">
            Capture Lead & Schedule Site Visit
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="client_name"
              placeholder="Client Name"
              value={formData.client_name}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full bg-gray-100"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full bg-gray-100"
              required
            />
            <input
              type="text"
              name="phone_number"
              placeholder="Phone Number (optional)"
              value={formData.phone_number}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full bg-gray-100"
            />
            <textarea
              name="project_interest"
              placeholder="Project Interest"
              value={formData.project_interest}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full max-h-32 overflow-y-auto bg-gray-100"
              required
            />
            <input
              type="number"
              name="budget"
              placeholder="Budget (optional)"
              value={formData.budget}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full bg-gray-100"
            />
            <input
              type="text"
              name="timeline"
              placeholder="Timeline (optional)"
              value={formData.timeline}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full bg-gray-100"
            />

            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">
                📅 Schedule Site Visit
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  name="site_visit_date"
                  value={formData.site_visit_date}
                  onChange={handleChange}
                  className="border rounded-lg p-3 w-full bg-gray-100"
                  required
                />
                <input
                  type="time"
                  name="site_visit_time"
                  value={formData.site_visit_time}
                  onChange={handleChange}
                  className="border rounded-lg p-3 w-full bg-gray-100"
                  required
                />
              </div>
              <textarea
                name="site_visit_notes"
                placeholder="Notes or meeting details (optional)"
                value={formData.site_visit_notes}
                onChange={handleChange}
                className="border rounded-lg p-3 w-full mt-3 bg-gray-100"
              />

              <h3 className="text-lg font-semibold mt-4 mb-2">
                📍 Site Location
              </h3>

              <div className="h-64 w-full rounded-lg overflow-hidden relative">
                <MapContainer
                  center={[14.5995, 120.9842]}
                  zoom={12}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationSearchControl
                    setPosition={setPosition}
                    setAddress={(addr) =>
                      setFormData((prev) => ({
                        ...prev,
                        site_location: addr,
                      }))
                    }
                  />
                  <LocationPicker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>

              {position && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[#4c735c] shadow-md text-white px-5 py-2 rounded-lg hover:bg-[#3b5d49] transition"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Lead & Schedule"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel - Lead List */}
        <div className="w-full sm:w-5/12 bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Lead List</h3>
          <div className="overflow-y-auto max-h-[70vh] space-y-3">
            {leads.length > 0 ? (
              leads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm cursor-pointer hover:bg-gray-100 transition"
                >
                  <p className="font-semibold text-lg">{lead.client_name}</p>
                  <p className="text-sm text-gray-600">{lead.email}</p>
                  <p className="text-sm text-gray-600">
                    {lead.site_visit_date
                      ? `📅 Visit: ${lead.site_visit_date}`
                      : "No site visit yet"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No leads available</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedLead && (
        <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
};

export default Lead;
