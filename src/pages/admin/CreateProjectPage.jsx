import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const CreateProjectPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_REACT_APP_API_URL;

  const [contract, setContract] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    engineer_id: "",
    supervisor_id: "",
    project_name: "",
    start_date: "",
    end_date: "",
    location: "",
  });
  const [loading, setLoading] = useState(true);

  // Fetch contract & user list
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contractRes, usersRes] = await Promise.all([
          fetch(`${BASE_URL}/api/project/${contractId}`),
          fetch(`${BASE_URL}/api/users/all`),
        ]);

        const contractData = await contractRes.json();
        const usersData = await usersRes.json();

        setContract(contractData);
        setUsers(usersData);

        // Auto-fill fields using contract data
        setForm((prev) => ({
          ...prev,
          project_name: contractData.proposal_title || "",
          location: contractData.client_address || "",
        }));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contractId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (
      !form.engineer_id ||
      !form.foreman_id ||
      !form.project_name ||
      !form.start_date ||
      !form.end_date
    ) {
      alert("Please complete all required fields.");
      return;
    }
        const body = {
        client_name: contract.client_name,
        client_email: contract.client_email,
        client_phone: contract.client_phone,
        client_address: contract.client_address || "",

        project_name: form.project_name,
        start_date: form.start_date,
        end_date: form.end_date,
        description: contract.proposal_title,
        budget: contract.budget_estimate,
        cost_breakdown: contract.cost_breakdown || "",
        location: form.location,
        payment_schedule: contract.payment_schedule || "",
        project_type: contract.project_type || "General",

        assigned_users: [
            { user_id: form.engineer_id, role_in_project: "engineer" },
            { user_id: form.foreman_id, role_in_project: "foreman" },
        ],
        };

        console.log("Submitting project:", body);

    try {
      const res = await fetch(`${BASE_URL}/api/project/createProject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Failed to create project");
      } else {
        alert("Project created successfully!");
        navigate("/project");
      }
    } catch (err) {
      console.error("Error submitting project:", err);
      alert("Something went wrong.");
    }
  };

  if (loading || !contract) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Create Engineer Project</h2>

      {/* Contract Overview */}
      <div className="border p-4 rounded bg-gray-50 mb-6">
        <h3 className="text-lg font-semibold mb-2">Contract Details</h3>
        <p><strong>Proposal Title:</strong> {contract.proposal_title}</p>
        <p><strong>Client Name:</strong> {contract.client_name}</p>
        <p><strong>Budget:</strong> ₱{parseFloat(contract.budget_estimate).toLocaleString()}</p>
        <p><strong>Timeline:</strong> {contract.timeline_estimate}</p>
        <p><strong>Status:</strong> <span className="capitalize">{contract.status}</span></p>
        <p><strong>Signed At:</strong> {new Date(contract.contract_signed_at).toLocaleString()}</p>
        {contract.contract_file_url && (
          <p>
            <a
              href={contract.contract_file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Signed Contract PDF
            </a>
          </p>
        )}
      </div>

      {/* Project Form */}
      <div className="space-y-4">
        <div>
          <label className="block font-medium">Project Name</label>
          <input
            type="text"
            name="project_name"
            value={form.project_name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block font-medium">End Date</label>
            <input
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium">Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Assign Engineer</label>
          <select
            name="engineer_id"
            value={form.engineer_id}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select Engineer</option>
            {users
              .filter((u) => u.role === "Engineer")
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block font-medium">Assign Foreman</label>
          <select
            name="foreman_id"
            value={form.foreman_id}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select Foreman</option>
            {users
              .filter((u) => u.role === "Foreman")
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                </option>
              ))}
          </select>
        </div>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Project
        </button>
      </div>
    </div>
  );
};

export default CreateProjectPage;
