import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  DollarSign,
  FileText,
  Clock,
  Building,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  MessageSquare,
} from "lucide-react";
import AddTeamModal from "./AddTeamModal";
import AddWorkerModal from "./AddWorkerModal";
import Gantt from "frappe-gantt";
import { useRef } from "react";
import { WorkerIDCard } from "./WorkerIDCard";
import axios from "axios";
import { Toaster } from "sonner";
import { toast } from "sonner";
import ConfirmationModal from "../../adminComponents/ConfirmationModal";

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

// Custom icon for construction site
const constructionIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2173/2173475.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Main Component
export const ViewForemanProject = ({ selectedProject, onBack }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [milestones, setMilestones] = useState([]);
  const [projectDetails, setProjectDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // modal states
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [reportTab, setReportTab] = useState("create");
  const [myReports, setMyReports] = useState([]);
  const [taskReport, setTaskReport] = useState([]);

  const ganttRef = useRef(null);
  const userId = localStorage.getItem("userId");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState("");

  // ⬇️ holds unsaved team selections per taskId
  const [draftTeamByTask, setDraftTeamByTask] = useState({});

  const [report, setReport] = useState({
    title: "",
    summary: "",
    task_id: "",
    report_type: "",
    file: null,
  });

  const handleOpenConfirm = (e) => {
    e.preventDefault();
    setActionType("Submit Report");
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    await handleSubmitReport(); // actually send to backend
    setShowConfirmModal(false);
  };

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!selectedProject?.id) return;

      setIsLoading(true);
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/project/getProjectDetails/${selectedProject.id}`
        );
        if (res.data.project) {
          const project = res.data.project;
          setProjectDetails({
            project_name: project.project_name || "",
            client_name: project.client_name || "",
            start_date: project.start_date || "",
            end_date: project.end_date || "",
            location: project.location || "",
            status: project.status || "",
            scope_of_work: project.scope_of_work || "[]",
            site_location: project.site_location || "",
            latitude: project.latitude,
            longitude: project.longitude,
            site_visit_notes: project.site_visit_notes || "",
            budget: project.budget || selectedProject?.budget,
          });
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [selectedProject]);

  useEffect(() => {
    if (activeTab === "timeline" && ganttRef.current && milestones.length > 0) {
      const ganttTasks = milestones.flatMap((ms) =>
        ms.tasks.map((task) => ({
          id: task.task_id,
          name: task.title,
          start: task.start_date,
          end: task.due_date,
          progress: task.status === "Completed" ? 100 : 50,
        }))
      );

      new Gantt(ganttRef.current, ganttTasks, {
        view_mode: "Day",
        date_format: "YYYY-MM-DD",
      });
    }
  }, [activeTab, milestones]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/foreman/getTasks/${
            selectedProject.id
          }`
        );
        if (res.ok) {
          const data = await res.json();
          setMilestones(data);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    const fetchTeams = async () => {
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/foreman/getTeams/${userId}`
        );
        if (res.ok) {
          const data = await res.json();
          setTeams(data.teams);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    const fetchReports = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/foreman/getReports/${
            selectedProject.id
          }`
        );
        if (res.ok) {
          const data = await res.json();
          setMyReports(data.reports || []);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    const fetchTaskForReports = async () => {
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/foreman/getTasksForReport/${selectedProject.id}`
        );
        if (res.ok) {
          const data = await res.json();
          setTaskReport(data || []);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
    fetchTeams();
    fetchTasks();
    fetchTaskForReports();
  }, [selectedProject.id, userId]);

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "delayed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Helper function to get review status color and icon
  const getReviewStatusInfo = (reviewStatus) => {
    switch (reviewStatus?.toLowerCase()) {
      case "accepted":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle size={16} />,
          label: "Accepted",
        };
      case "rejected":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: <XCircle size={16} />,
          label: "Rejected",
        };
      case "pending":
      default:
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <ClockIcon size={16} />,
          label: "Pending Review",
        };
    }
  };

  const handleAssignTeam = (taskId, teamId) => {
    setDraftTeamByTask((prev) => ({ ...prev, [taskId]: teamId }));
  };

  const handleSaveAssignment = async (taskId, teamId) => {
    const toSave = parseInt(teamId, 10);
    if (!toSave) {
      console.warn("No team selected to assign.");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/foreman/assignTeam`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId: taskId, teamId: toSave }),
        }
      );

      if (res.ok) {
        setMilestones((prevMilestones) =>
          prevMilestones.map((ms) => ({
            ...ms,
            tasks: ms.tasks.map((t) =>
              t.task_id === taskId
                ? {
                    ...t,
                    assigned_teams: [
                      {
                        team_id: toSave,
                        team_name:
                          teams.find((team) => team.id === toSave)?.team_name ||
                          "Unknown Team",
                      },
                    ],
                  }
                : t
            ),
          }))
        );
        setDraftTeamByTask((prev) => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
      } else {
        console.error("Failed to assign team");
      }
    } catch (err) {
      console.error("Error assigning team:", err);
    }
  };

  const handleSubmitReport = async () => {
    try {
      const formData = new FormData();
      formData.append("title", report.title);
      formData.append("summary", report.summary);
      formData.append("taskId", report.task_id);
      formData.append("report_type", report.report_type);
      formData.append("created_by", userId);
      formData.append("project_id", selectedProject.id);
      if (report.file) {
        formData.append("report_file", report.file);
      }

      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/foreman/foremanReport`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        const createdReport = await res.json();
        setReport({ title: "", summary: "", task_id: "", file: null });
        // Refresh reports list
        const reportsRes = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/foreman/getReports/${
            selectedProject.id
          }`
        );
        if (reportsRes.ok) {
          const data = await reportsRes.json();
          setMyReports(data.reports || []);
          toast.success("Report submitted successfully!");
        }
      } else {
        console.error("Failed to submit report");
        toast.error("Failed to submit report. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  // Helper function to get assigned team name
  const getAssignedTeamName = (task) => {
    if (task.assigned_teams && task.assigned_teams.length > 0) {
      return task.assigned_teams[0].team_name;
    }
    return null;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#4c735c] hover:text-[#3a5a4a] mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Projects</span>
      </button>

      {/* Project Header */}
      <header className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {projectDetails?.project_name || selectedProject?.name}
          </h1>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={18} />
              <span>
                {projectDetails?.location || selectedProject?.location}
              </span>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                projectDetails?.status
              )}`}
            >
              {projectDetails?.status || selectedProject?.status}
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row gap-2 mb-8">
        <div className="flex gap-2 overflow-x-auto py-2 hide-scrollbar sm:overflow-visible">
          {["overview", "tasks", "workers", "timeline", "reports"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 rounded-xl font-medium transition whitespace-nowrap flex-shrink-0 flex-1 sm:flex-none text-sm sm:text-base ${
                  activeTab === tab
                    ? "bg-[#4c735c] text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Project Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">
                      Start Date
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(
                        projectDetails?.start_date ||
                          selectedProject?.start_date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">
                      Deadline
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(
                        projectDetails?.end_date || selectedProject?.end_date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 font-medium">
                      Budget
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {projectDetails?.budget
                        ? `₱${projectDetails.budget.toLocaleString()}`
                        : "Not Set"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Building className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-orange-600 font-medium">
                      Client
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {projectDetails?.client_name ||
                        selectedProject?.client ||
                        "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map and Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Project Location Map */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="text-[#4c735c]" size={24} />
                  Project Location
                </h3>
                {projectDetails?.latitude && projectDetails?.longitude ? (
                  <div className="h-80 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <MapContainer
                      center={[
                        projectDetails.latitude,
                        projectDetails.longitude,
                      ]}
                      zoom={15}
                      style={{ height: "100%", width: "100%" }}
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker
                        position={[
                          projectDetails.latitude,
                          projectDetails.longitude,
                        ]}
                        icon={constructionIcon}
                      >
                        <Popup>
                          <div className="text-center">
                            <strong className="text-[#4c735c]">
                              {projectDetails.project_name}
                            </strong>
                            <br />
                            <span className="text-sm text-gray-600">
                              {projectDetails.site_location}
                            </span>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                ) : (
                  <div className="h-80 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin
                        className="text-gray-400 mx-auto mb-2"
                        size={48}
                      />
                      <p className="text-gray-500">
                        No location data available
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Project Details */}
              <div className="space-y-6">
                {/* Scope of Work */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <FileText className="text-[#4c735c]" size={24} />
                    Scope of Work
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700">
                      {projectDetails?.scope_of_work &&
                      projectDetails.scope_of_work !== "[]"
                        ? projectDetails.scope_of_work
                        : "No scope of work defined for this project."}
                    </p>
                  </div>
                </div>

                {/* Site Notes & Safety */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Site Notes & Safety
                  </h3>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-gray-700">
                      {projectDetails?.site_visit_notes ||
                        selectedProject?.notes ||
                        "No specific safety notes or instructions provided for this project."}
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                    <Users className="text-[#4c735c] mx-auto mb-2" size={24} />
                    <p className="text-2xl font-bold text-gray-900">
                      {teams.length}
                    </p>
                    <p className="text-sm text-gray-600">Teams</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                    <FileText
                      className="text-[#4c735c] mx-auto mb-2"
                      size={24}
                    />
                    <p className="text-2xl font-bold text-gray-900">
                      {myReports.length}
                    </p>
                    <p className="text-sm text-gray-600">Reports</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Tasks Preview */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Upcoming Tasks
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {milestones.slice(0, 4).flatMap((ms) =>
                  ms.tasks.slice(0, 2).map((task) => (
                    <div
                      key={task.task_id}
                      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {task.title}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.priority === "High"
                              ? "bg-red-100 text-red-600"
                              : task.priority === "Medium"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {task.details}
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full ${
                            task.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : task.status === "For Review"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                {milestones.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    No tasks assigned yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Assigned Tasks</h2>

            {milestones.map((ms) => (
              <div key={ms.milestone_id} className="mb-8">
                {/* Milestone Title */}
                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  {ms.milestone_title}
                </h3>

                {/* Tasks inside milestone */}
                <div className="space-y-4">
                  {ms.tasks.map((task) => {
                    const assignedTeam = getAssignedTeamName(task);
                    const assigned = !!assignedTeam;
                    const draftVal = draftTeamByTask[task.task_id] ?? "";
                    const selectValue = assigned
                      ? String(task.assigned_teams[0].team_id)
                      : String(draftVal);

                    return (
                      <div
                        key={task.task_id}
                        className="p-4 bg-white border rounded-2xl shadow-sm hover:shadow-md transition flex flex-col gap-3"
                      >
                        {/* Top Row: Title + Priority */}
                        <div className="flex justify-between items-center">
                          <h4 className="text-lg font-semibold text-gray-800">
                            {task.title}
                          </h4>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              task.priority === "High"
                                ? "bg-red-100 text-red-600"
                                : task.priority === "Medium"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-green-100 text-green-600"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {/* Details */}
                        <p className="text-gray-600 text-sm">{task.details}</p>

                        {/* Dates + Status */}
                        <div className="flex flex-wrap justify-between text-sm text-gray-500">
                          <span>
                            <strong className="font-medium text-gray-700">
                              Start:
                            </strong>{" "}
                            {new Date(task.start_date).toLocaleDateString()}
                          </span>
                          <span>
                            <strong className="font-medium text-gray-700">
                              Due:
                            </strong>{" "}
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              task.status === "Completed"
                                ? "bg-green-100 text-green-700"
                                : task.status === "For Review"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>

                        {/* Assigned Team Display */}
                        {assignedTeam && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm font-medium text-gray-700">
                              Assigned Team:
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {assignedTeam}
                            </span>
                          </div>
                        )}

                        {/* Assign Team */}
                        <div className="flex items-center gap-2 mt-3">
                          <select
                            className="border rounded-lg px-2 py-1 text-sm"
                            value={selectValue}
                            onChange={(e) =>
                              handleAssignTeam(task.task_id, e.target.value)
                            }
                            disabled={assigned}
                          >
                            <option value="">-- Assign Team --</option>
                            {teams.map((team) => (
                              <option key={team.id} value={team.id}>
                                {team.team_name}
                              </option>
                            ))}
                          </select>

                          <button
                            className={`px-3 py-1 rounded-lg text-sm ${
                              assigned
                                ? "bg-gray-400 text-white cursor-not-allowed"
                                : draftVal
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-300 text-gray-700 cursor-not-allowed"
                            }`}
                            onClick={() => {
                              if (!assigned && draftVal) {
                                handleSaveAssignment(task.task_id, draftVal);
                              }
                            }}
                            disabled={assigned || !draftVal}
                          >
                            {assigned ? "Assigned" : "Save"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "workers" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Worker Management</h2>
              <button
                onClick={() => setShowAddTeamModal(true)}
                className="px-4 py-2 bg-[#4c735c] text-white rounded-lg hover:bg-blue-700 transition"
              >
                + Add Team
              </button>
            </div>

            {/* Teams List */}
            <div className="space-y-6">
              {(teams || []).map((team) => (
                <div
                  key={team.id}
                  className="p-4 border rounded-xl bg-gray-50 shadow-sm"
                >
                  {/* Team Header */}
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {team.team_name}
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedTeam(team);
                        setShowAddWorkerModal(true);
                      }}
                      className="px-3 py-1 bg-[#4c735c] text-white text-sm rounded-md hover:bg-green-700 transition"
                    >
                      + Add Worker
                    </button>
                  </div>

                  {/* Workers inside team */}
                  {team.workers && team.workers.length > 0 ? (
                    <ul className="space-y-2">
                      {team.workers.map((worker) => (
                        <li
                          key={worker.id}
                          className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {worker.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {worker.skill_type}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 text-xs rounded-full ${
                              worker.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {worker.status}
                          </span>
                          {/* View ID button */}
                          <button
                            onClick={() => setSelectedWorker(worker.id)}
                            className="px-3 py-1 bg-[#4c735c] text-white text-xs rounded-md hover:bg-blue-700 transition"
                          >
                            View ID
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">
                      No workers in this team yet.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Project Timeline
            </h2>
            <div
              ref={ganttRef}
              className="w-full h-[80vh] gantt-container"
            ></div>
          </div>
        )}

        {activeTab === "reports" && (
          <div>
            {/* Reports Sub-Tab Navigation */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setReportTab("create")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  reportTab === "create"
                    ? "bg-[#4c735c] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Create Report
              </button>
              <button
                onClick={() => setReportTab("sent")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  reportTab === "sent"
                    ? "bg-[#4c735c] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                My Reports
              </button>
            </div>

            {/* Create Report Form */}
            {reportTab === "create" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Submit Report</h2>
                <form onSubmit={handleSubmitReport} className="space-y-4">
                  {/* Task */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Task
                    </label>
                    <select
                      className="w-full border rounded-lg px-3 py-2"
                      value={report.task_id}
                      onChange={(e) =>
                        setReport({ ...report, task_id: e.target.value })
                      }
                    >
                      <option value="">-- Select Task --</option>
                      {taskReport.map((task) => (
                        <option key={task.task_id} value={task.task_id}>
                          {task.milestone_title} - {task.task_title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Report Type */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Report Type
                    </label>
                    <select
                      required
                      className="w-full border rounded-lg px-3 py-2"
                      value={report.report_type}
                      onChange={(e) =>
                        setReport({ ...report, report_type: e.target.value })
                      }
                    >
                      <option value="">-- Select Report Type --</option>
                      <option value="Update">Update</option>
                      <option value="Final">Final</option>
                    </select>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2"
                      value={report.title}
                      onChange={(e) =>
                        setReport({ ...report, title: e.target.value })
                      }
                    />
                  </div>

                  {/* Summary */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Details / Summary
                    </label>
                    <textarea
                      className="w-full border rounded-lg px-3 py-2"
                      rows="4"
                      value={report.summary}
                      onChange={(e) =>
                        setReport({ ...report, summary: e.target.value })
                      }
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      File Upload
                    </label>
                    <input
                      name="report_file"
                      type="file"
                      className="w-full"
                      onChange={(e) =>
                        setReport({ ...report, file: e.target.files[0] })
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    onClick={handleOpenConfirm}
                    className="bg-[#4c735c] text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Submit Report
                  </button>
                </form>
              </div>
            )}

            {/* My Reports List */}
            {reportTab === "sent" && (
              <div className="w-full">
                <h2 className="text-2xl font-bold mb-6">My Reports</h2>
                {myReports.length > 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Title
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Report Type
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Task
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Review Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Submitted At
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              File
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {myReports.map((r) => {
                            const reviewStatusInfo = getReviewStatusInfo(
                              r.review_status
                            );
                            return (
                              <tr
                                key={r.id}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  <div className="font-medium">{r.title}</div>
                                  {r.review_comment && (
                                    <div
                                      className={`mt-2 p-3 rounded-lg border ${
                                        r.review_status === "Rejected"
                                          ? "bg-red-50 border-red-200"
                                          : r.review_status === "Accepted"
                                          ? "bg-green-50 border-green-200"
                                          : "bg-blue-50 border-blue-200"
                                      }`}
                                    >
                                      <div className="flex items-start gap-2">
                                        <MessageSquare
                                          className={`mt-0.5 flex-shrink-0 ${
                                            r.review_status === "Rejected"
                                              ? "text-red-500"
                                              : r.review_status === "Accepted"
                                              ? "text-green-500"
                                              : "text-blue-500"
                                          }`}
                                          size={16}
                                        />
                                        <div>
                                          <p
                                            className={`text-sm font-medium ${
                                              r.review_status === "Rejected"
                                                ? "text-red-800"
                                                : r.review_status === "Accepted"
                                                ? "text-green-800"
                                                : "text-blue-800"
                                            }`}
                                          >
                                            {r.review_status === "Rejected"
                                              ? "Review Comment:"
                                              : r.review_status === "Accepted"
                                              ? "Feedback:"
                                              : "Comment:"}
                                          </p>
                                          <p
                                            className={`text-sm mt-1 ${
                                              r.review_status === "Rejected"
                                                ? "text-red-700"
                                                : r.review_status === "Accepted"
                                                ? "text-green-700"
                                                : "text-blue-700"
                                            }`}
                                          >
                                            {r.review_comment}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {r.report_type}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  <div>
                                    <div className="font-medium">
                                      {r.task_title}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {r.milestone_title}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    {reviewStatusInfo.icon}
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reviewStatusInfo.color}`}
                                    >
                                      {reviewStatusInfo.label}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                  {new Date(r.created_at).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {r.file_url ? (
                                    <a
                                      href={`${
                                        import.meta.env.VITE_REACT_APP_API_URL
                                      }${r.file_url}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                    >
                                      <svg
                                        className="w-4 h-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                      </svg>
                                      View File
                                    </a>
                                  ) : (
                                    <span className="text-gray-400 italic">
                                      No File
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4 p-4">
                      {myReports.map((r) => {
                        const reviewStatusInfo = getReviewStatusInfo(
                          r.review_status
                        );
                        return (
                          <div
                            key={r.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-gray-900 text-lg">
                                  {r.title}
                                </h3>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {r.report_type}
                                </span>
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <p className="text-sm text-gray-500">Task</p>
                                  <p className="text-sm font-medium text-gray-900">
                                    {r.task_title}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {r.milestone_title}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Review Status
                                  </p>
                                  <div className="flex items-center gap-2">
                                    {reviewStatusInfo.icon}
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${reviewStatusInfo.color}`}
                                    >
                                      {reviewStatusInfo.label}
                                    </span>
                                  </div>
                                  {r.review_comment && (
                                    <div
                                      className={`mt-2 p-3 rounded-lg border ${
                                        r.review_status === "Rejected"
                                          ? "bg-red-50 border-red-200"
                                          : r.review_status === "Accepted"
                                          ? "bg-green-50 border-green-200"
                                          : "bg-blue-50 border-blue-200"
                                      }`}
                                    >
                                      <div className="flex items-start gap-2">
                                        <MessageSquare
                                          className={`mt-0.5 flex-shrink-0 ${
                                            r.review_status === "Rejected"
                                              ? "text-red-500"
                                              : r.review_status === "Accepted"
                                              ? "text-green-500"
                                              : "text-blue-500"
                                          }`}
                                          size={16}
                                        />
                                        <div>
                                          <p
                                            className={`text-sm font-medium ${
                                              r.review_status === "Rejected"
                                                ? "text-red-800"
                                                : r.review_status === "Accepted"
                                                ? "text-green-800"
                                                : "text-blue-800"
                                            }`}
                                          >
                                            {r.review_status === "Rejected"
                                              ? "Review Comment:"
                                              : r.review_status === "Accepted"
                                              ? "Feedback:"
                                              : "Comment:"}
                                          </p>
                                          <p
                                            className={`text-sm mt-1 ${
                                              r.review_status === "Rejected"
                                                ? "text-red-700"
                                                : r.review_status === "Accepted"
                                                ? "text-green-700"
                                                : "text-blue-700"
                                            }`}
                                          >
                                            {r.review_comment}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Submitted
                                  </p>
                                  <p className="text-sm text-gray-900">
                                    {new Date(r.created_at).toLocaleString()}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-sm text-gray-500">File</p>
                                  {r.file_url ? (
                                    <a
                                      href={r.file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                                    >
                                      <svg
                                        className="w-4 h-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                      </svg>
                                      View File
                                    </a>
                                  ) : (
                                    <span className="text-gray-400 italic text-sm">
                                      No File
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No reports
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You haven't submitted any reports yet.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Team Modal */}
      {showAddTeamModal && (
        <AddTeamModal
          onClose={() => setShowAddTeamModal(false)}
          onSave={(team) => {
            console.log("New team saved:", team);
            setShowAddTeamModal(false);
          }}
        />
      )}

      {/* Add Worker Modal */}
      {showAddWorkerModal && selectedTeam && (
        <AddWorkerModal
          team={selectedTeam}
          onClose={() => {
            setShowAddWorkerModal(false);
            setSelectedTeam(null);
          }}
          onSave={(worker) => {
            console.log("New worker saved:", worker);
            setShowAddWorkerModal(false);
            setSelectedTeam(null);
          }}
        />
      )}

      {/* Worker ID Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-10000">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-5xl w-full relative">
            {/* Close button */}
            <button
              onClick={() => setSelectedWorker(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>

            {/* ID Card Component */}
            <WorkerIDCard
              workerId={selectedWorker}
              onBack={() => setSelectedWorker(null)}
            />
          </div>
        </div>
      )}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        actionType={actionType}
      />
    </div>
  );
};
