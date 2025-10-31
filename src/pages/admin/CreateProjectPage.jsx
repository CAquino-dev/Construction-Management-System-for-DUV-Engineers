import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import ConfirmationModal from "../../components/adminComponents/ConfirmationModal";

const CreateProjectPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_REACT_APP_API_URL;

  const [contract, setContract] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    engineer_id: "",
    foreman_id: "",
    project_name: "",
    start_date: "",
    end_date: "",
    location: "",
  });
  const [boqItems, setBoqItems] = useState([
    { description: "", unit: "", quantity: "", unit_cost: "" },
  ]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [remark, setRemark] = useState("");

  // Common units for construction BOQ
  const unitOptions = [
    "pc",
    "pcs",
    "set",
    "lot",
    "kg",
    "ton",
    "m",
    "m²",
    "m³",
    "lm",
    "cu.m",
    "sq.m",
    "day",
    "hr",
    "month",
    "lump sum",
    "unit",
    "pair",
    "roll",
    "box",
    "bag",
    "gallon",
    "liter",
  ];

  // Calculate 70% of budget
  const maxBoqBudget = contract ? contract.budget_estimate * 0.7 : 0;

  // Calculate current BOQ total
  const calculateBoqTotal = () => {
    return boqItems.reduce((total, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitCost = parseFloat(item.unit_cost) || 0;
      return total + quantity * unitCost;
    }, 0);
  };

  const currentBoqTotal = calculateBoqTotal();
  const remainingBudget = maxBoqBudget - currentBoqTotal;

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

        // Auto-fill location using contract data
        setForm((prev) => ({
          ...prev,
          location: contractData.site_location || "",
          project_name: contractData.proposal_title || "",
          start_date: contractData.proposal_start_date
            ? contractData.proposal_start_date.split("T")[0]
            : "",
          end_date: contractData.proposal_end_date
            ? contractData.proposal_end_date.split("T")[0]
            : "",
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

  // BOQ handlers with budget validation
  const handleBoqChange = (index, field, value) => {
    // If changing quantity or unit_cost, validate against budget
    if (field === "quantity" || field === "unit_cost") {
      const newBoq = [...boqItems];
      const oldValue = newBoq[index][field];
      newBoq[index][field] = value;

      // Calculate what the new total would be
      const newTotal = newBoq.reduce((total, item, idx) => {
        const quantity =
          parseFloat(
            idx === index && field === "quantity" ? value : item.quantity
          ) || 0;
        const unitCost =
          parseFloat(
            idx === index && field === "unit_cost" ? value : item.unit_cost
          ) || 0;
        return total + quantity * unitCost;
      }, 0);

      // Check if new total exceeds budget
      if (newTotal > maxBoqBudget) {
        toast.error(
          `BOQ total cannot exceed 70% of budget (₱${maxBoqBudget.toLocaleString()})`
        );
        return;
      }
    }

    // If validation passes or it's not a numeric field, update normally
    const newBoq = [...boqItems];
    newBoq[index][field] = value;
    setBoqItems(newBoq);
  };

  const addBoqRow = () => {
    if (currentBoqTotal >= maxBoqBudget) {
      toast.error(`Cannot add more items. BOQ budget limit reached.`);
      return;
    }
    setBoqItems([
      ...boqItems,
      { description: "", unit: "", quantity: "", unit_cost: "" },
    ]);
  };

  const removeBoqRow = (index) => {
    const newBoq = [...boqItems];
    newBoq.splice(index, 1);
    setBoqItems(newBoq);
  };

  const handleSubmit = async () => {
    const userId = localStorage.getItem("userId");
    if (
      !form.engineer_id ||
      !form.foreman_id ||
      !form.project_name ||
      !form.start_date ||
      !form.end_date
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    // Validate BOQ total before submission
    if (currentBoqTotal > maxBoqBudget) {
      toast.error(
        `BOQ total (₱${currentBoqTotal.toLocaleString()}) exceeds 70% of budget (₱${maxBoqBudget.toLocaleString()})`
      );
      return;
    }

    if (currentBoqTotal === 0) {
      toast.error("Please add at least one BOQ item with valid amount");
      return;
    }

    const body = {
      client_name: contract.client_name,
      client_email: contract.client_email,
      client_phone: contract.client_phone,
      client_address: contract.site_location || contract.client_address || "",
      contractId: contractId,
      projectManagerId: userId,
      project_name: form.project_name,
      start_date: form.start_date,
      end_date: form.end_date,
      description: contract.proposal_title,
      budget: contract.budget_estimate,
      cost_breakdown: contract.cost_breakdown || "",
      location: form.location,
      payment_schedule: contract.payment_terms || "",
      project_type: contract.project_type || "General",

      assigned_users: [
        { user_id: form.engineer_id, role_in_project: "engineer" },
        { user_id: form.foreman_id, role_in_project: "foreman" },
      ],

      boq_items: boqItems.map((item, index) => ({
        item_no: index + 1,
        description: item.description,
        unit: item.unit,
        quantity: parseFloat(item.quantity) || 0,
        unit_cost: parseFloat(item.unit_cost) || 0,
      })),
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
        toast.error(result.error || "Failed to create project");
      } else {
        toast.success("Project created successfully!");
        setTimeout(() => navigate(-1), 800); // ✅ ADD THIS
      }
    } catch (err) {
      console.error("Error submitting project:", err);
      toast.error("Something went wrong.");
    }
  };

  if (loading || !contract) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4c735c]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center text-[#4c735c] hover:text-[#3a5a4a] hover:bg-[#4c735c]/10 mb-4 px-3 py-2 rounded-lg transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Create Engineer Project
          </h1>
        </div>

        {/* Contract Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-[#4c735c]"
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
            Contract Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Proposal Title:</span>
              <p className="text-gray-900 mt-1">{contract.proposal_title}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Client Name:</span>
              <p className="text-gray-900 mt-1">{contract.client_name}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Total Budget:</span>
              <p className="text-gray-900 mt-1">
                ₱{parseFloat(contract.budget_estimate).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">
                BOQ Budget (70%):
              </span>
              <p className="text-gray-900 mt-1 font-semibold text-[#4c735c]">
                ₱{maxBoqBudget.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Start Date:</span>
              <p className="text-gray-900 mt-1">
                {new Date(contract.start_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">End Date:</span>
              <p className="text-gray-900 mt-1">
                {new Date(contract.end_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <p className="text-gray-900 mt-1 capitalize">{contract.status}</p>
            </div>
            <div className="sm:col-span-2">
              <span className="font-medium text-gray-700">Signed At:</span>
              <p className="text-gray-900 mt-1">
                {new Date(contract.contract_signed_at).toLocaleString()}
              </p>
            </div>
            {contract.contract_file_url && (
              <div className="sm:col-span-2">
                <a
                  href={`${import.meta.env.VITE_REACT_APP_API_URL}${
                    contract.contract_file_url
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[#4c735c] hover:text-[#3a5a4a] font-medium mt-2"
                >
                  <svg
                    className="w-4 h-4 mr-2"
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
                  View Signed Contract PDF
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Project Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Project Information
          </h2>

          <div className="space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="project_name"
                value={form.project_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent transition-colors"
                placeholder="Enter project name"
              />
            </div>

            {/* Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Location - Auto-filled from contract */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent transition-colors"
                placeholder="Enter project location"
              />
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Engineer <span className="text-red-500">*</span>
                </label>
                <select
                  name="engineer_id"
                  value={form.engineer_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent transition-colors"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Foreman <span className="text-red-500">*</span>
                </label>
                <select
                  name="foreman_id"
                  value={form.foreman_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c735c] focus:border-transparent transition-colors"
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
            </div>

            {/* BOQ Section */}
            <div className="mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">
                    Bill of Quantities (BOQ)
                  </h3>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Budget Limit:</span> ₱
                    {maxBoqBudget.toLocaleString()}
                    <span className="mx-2">•</span>
                    <span className="font-medium">Current Total:</span> ₱
                    {currentBoqTotal.toLocaleString()}
                    <span className="mx-2">•</span>
                    <span
                      className={`font-medium ${
                        remainingBudget < 0 ? "text-red-600" : "text-[#4c735c]"
                      }`}
                    >
                      Remaining: ₱{remainingBudget.toLocaleString()}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={addBoqRow}
                  disabled={remainingBudget <= 0}
                  className="bg-[#4c735c] hover:bg-[#3a5a4a] text-white px-4 py-2 rounded-lg transition-colors flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Row
                </Button>
              </div>

              {/* Budget Warning */}
              {remainingBudget < 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-700 text-sm font-medium">
                    ⚠️ BOQ total exceeds budget limit by ₱
                    {Math.abs(remainingBudget).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Mobile BOQ View */}
              <div className="sm:hidden space-y-4">
                {boqItems.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-medium text-gray-700">
                        Item #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeBoqRow(index)}
                        className="text-red-600 hover:text-red-700 p-1 rounded"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleBoqChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Unit
                          </label>
                          <select
                            value={item.unit}
                            onChange={(e) =>
                              handleBoqChange(index, "unit", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="">Select unit</option>
                            {unitOptions.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleBoqChange(index, "quantity", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Unit Cost
                        </label>
                        <input
                          type="number"
                          value={item.unit_cost}
                          onChange={(e) =>
                            handleBoqChange(index, "unit_cost", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop BOQ View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 w-16">
                        No
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Description
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 w-32">
                        Unit
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 w-32">
                        Quantity
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 w-32">
                        Unit Cost
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 w-32">
                        Total
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 w-20">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {boqItems.map((item, index) => {
                      const quantity = parseFloat(item.quantity) || 0;
                      const unitCost = parseFloat(item.unit_cost) || 0;
                      const total = quantity * unitCost;

                      return (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="border border-gray-300 px-4 py-3 text-center text-gray-600 font-medium">
                            {index + 1}
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) =>
                                handleBoqChange(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-[#4c735c] focus:border-transparent"
                              placeholder="description"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <select
                              value={item.unit}
                              onChange={(e) =>
                                handleBoqChange(index, "unit", e.target.value)
                              }
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-[#4c735c] focus:border-transparent"
                            >
                              <option value="">Select unit</option>
                              {unitOptions.map((unit) => (
                                <option key={unit} value={unit}>
                                  {unit}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleBoqChange(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-[#4c735c] focus:border-transparent"
                              placeholder="0"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <input
                              type="number"
                              value={item.unit_cost}
                              onChange={(e) =>
                                handleBoqChange(
                                  index,
                                  "unit_cost",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-[#4c735c] focus:border-transparent"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                            ₱{total.toLocaleString()}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeBoqRow(index)}
                              className="text-red-600 hover:text-red-700 p-1 rounded transition-colors"
                              title="Remove row"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <Button
                onClick={handleSubmit}
                disabled={
                  currentBoqTotal > maxBoqBudget || currentBoqTotal === 0
                }
                className="bg-[#4c735c] hover:bg-[#3a5a4a] text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Create Project
              </Button>
            </div>
          </div>
        </div>
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={async () => {
            await handleSubmit();
            setIsModalOpen(false);
          }}
          actionType={actionType}
          setRemark={setRemark}
        />
      </div>
    </div>
  );
};

export default CreateProjectPage;
