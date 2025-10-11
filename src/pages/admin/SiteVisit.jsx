import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";
import "sonner";

const SiteVisit = () => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState("");
  const [leadDetails, setLeadDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
    dateVisited: "",
    terrainType: "",
    accessibility: "",
    waterSource: "",
    powerSource: "",
    areaMeasurement: "",
    notes: "",
    report_file: null,
  });

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/projectManager/getSiteVisits`
        );
        setLeads(res.data);
      } catch (err) {
        console.error("Error fetching leads:", err);
        toast.error("Failed to fetch leads.");
      }
    };
    fetchLeads();
  }, []);

  // When a lead is selected, autofill its data
  useEffect(() => {
    if (!selectedLead) return;

    const selected = leads.find((l) => l.id.toString() === selectedLead);
    if (selected) {
      setLeadDetails(selected);

      // Autofill relevant fields (but still editable)
      setFormData((prev) => ({
        ...prev,
        location: selected.site_location || "",
        notes: selected.site_visit_notes || "",
      }));
    }
  }, [selectedLead, leads]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLead) {
      toast.warning("⚠️ Please select a lead first.");
      return;
    }

    if (!formData.location || !formData.dateVisited) {
      toast.warning("⚠️ Location and Date are required.");
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("lead_id", selectedLead);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("dateVisited", formData.dateVisited);
      formDataToSend.append("terrainType", formData.terrainType);
      formDataToSend.append("accessibility", formData.accessibility);
      formDataToSend.append("waterSource", formData.waterSource);
      formDataToSend.append("powerSource", formData.powerSource);
      formDataToSend.append("areaMeasurement", formData.areaMeasurement);
      formDataToSend.append("notes", formData.notes);

      if (formData.report_file) {
        formDataToSend.append("report_file", formData.report_file);
      }

      formDataToSend.forEach((data) => {
        console.log(data);
      });

      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/projectManager/createSiteVisit`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("✅ Site visit report saved successfully!");

      setFormData({
        location: "",
        dateVisited: "",
        terrainType: "",
        accessibility: "",
        waterSource: "",
        powerSource: "",
        areaMeasurement: "",
        notes: "",
        report_file: null,
      });
      setSelectedLead("");
      setLeadDetails(null);
    } catch (err) {
      console.error("Error saving site visit:", err);
      toast.error("❌ Failed to save site visit report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Step 1: Select Lead */}
      <Card className="shadow-md">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">1. Select Lead</h2>
          <Label htmlFor="lead">Choose a Lead</Label>
          <Select
            value={selectedLead}
            onValueChange={setSelectedLead}
            disabled={loading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a lead..." />
            </SelectTrigger>
            <SelectContent>
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id.toString()}>
                    {lead.client_name} — {lead.project_interest}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-gray-500">
                  No leads available
                </div>
              )}
            </SelectContent>
          </Select>

          {/* Detailed Lead Info */}
          {leadDetails && (
            <div className="mt-4 bg-gray-50 border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-gray-700">Lead Details</h3>
              <p>
                <span className="font-medium">Client:</span>{" "}
                {leadDetails.client_name}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {leadDetails.email || "N/A"}
              </p>
              <p>
                <span className="font-medium">Contact:</span>{" "}
                {leadDetails.contact_number || "N/A"}
              </p>
              <p>
                <span className="font-medium">Project Interest:</span>{" "}
                {leadDetails.project_interest}
              </p>
              <p>
                <span className="font-medium">Preferred Site Location:</span>{" "}
                {leadDetails.site_location || "Not specified"}
              </p>
              <p>
                <span className="font-medium">Visit Notes:</span>{" "}
                {leadDetails.site_visit_notes || "None yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Site Visit Report */}
      <Card className="shadow-md">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">2. Site Visit Report</h2>
          {!selectedLead ? (
            <p className="text-gray-500 italic">
              Select a lead to enable the form.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Location</Label>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter location"
                    required
                  />
                </div>
                <div>
                  <Label>Date Visited</Label>
                  <Input
                    type="date"
                    name="dateVisited"
                    value={formData.dateVisited}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label>Terrain Type</Label>
                  <Input
                    name="terrainType"
                    value={formData.terrainType}
                    onChange={handleChange}
                    placeholder="e.g., flat, hilly, rocky"
                  />
                </div>
                <div>
                  <Label>Accessibility</Label>
                  <Input
                    name="accessibility"
                    value={formData.accessibility}
                    onChange={handleChange}
                    placeholder="e.g., by road, footpath only"
                  />
                </div>
                <div>
                  <Label>Water Source</Label>
                  <Input
                    name="waterSource"
                    value={formData.waterSource}
                    onChange={handleChange}
                    placeholder="e.g., nearby well, water line"
                  />
                </div>
                <div>
                  <Label>Power Source</Label>
                  <Input
                    name="powerSource"
                    value={formData.powerSource}
                    onChange={handleChange}
                    placeholder="e.g., electric line, solar"
                  />
                </div>
                <div>
                  <Label>Area Measurement (sqm)</Label>
                  <Input
                    name="areaMeasurement"
                    value={formData.areaMeasurement}
                    onChange={handleChange}
                    placeholder="e.g., 150 sqm"
                  />
                </div>
              </div>

              <div>
                <Label>Additional Notes</Label>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Observations, issues, or recommendations..."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label>Upload Site Report or Photo</Label>
                <Input
                  type="file"
                  name="report_file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      report_file: e.target.files[0],
                    }))
                  }
                  className="cursor-pointer"
                />
                {formData.report_file && (
                  <p className="text-sm text-gray-500 mt-1">
                    Selected: {formData.report_file.name}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full font-semibold"
                disabled={loading}
              >
                {loading ? "Saving..." : "Submit Site Visit Report"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteVisit;
