import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export const Inventory = () => {
  const [tab, setTab] = useState("inventory");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState("");
  const [reportId, setReportId] = useState("");
  const [comment, setComment] = useState("");
  const userId = localStorage.getItem("userId");

  const openPopup = (action, reportId) => {
    setIsOpen(true);
    setAction(action);
    setReportId(reportId);
    setComment("");
  };

  const fetchInventoryItems = async () => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/inventory/getInventoryItems`
      );
      if (res.data) setItems(res.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const fetchItemRequests = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/inventory/getRequests`
      );
      if (res.data) setRequests(res.data);
    } catch (error) {
      console.error("Error fetching requests", error);
    }
  };

  const handleClaim = async (requestId) => {
    try {
      await axios.put(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/inventory/claimItem/${requestId}`,
        { userId }
      );
      toast.success("Item claimed successfully");
      fetchItemRequests();
    } catch (error) {
      toast.error("Error claiming item");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchInventoryItems();
    fetchItemRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.quantity || !form.unit) return;

    try {
      if (editingId !== null) {
        await axios.put(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/inventory/updateInventoryItem/${editingId}`,
          form
        );
        toast.success("Item updated successfully");
        setEditingId(null);
      } else {
        await axios.post(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/inventory/addInventoryItem`,
          form
        );
        toast.success("Item added successfully");
      }
      fetchInventoryItems();
      setForm({
        name: "",
        category: "",
        quantity: "",
        unit: "",
        description: "",
      });
    } catch (err) {
      toast.error("Error saving item");
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name || "",
      category: item.category || "",
      quantity: item.quantity || "",
      unit: item.unit || "",
      description: item.description || "",
    });
    setEditingId(item.id);
  };

  const handleDelete = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateRequestStatus = async (id, status, rejection_note) => {
    try {
      await axios.put(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/inventory/updateRequest/${id}`,
        { status, rejection_note }
      );
      toast.success(`Request ${status.toLowerCase()} successfully`);
      fetchItemRequests();
    } catch (err) {
      console.error("Error updating request status:", err);
      toast.error("Failed to update request");
    }
  };

  const handleReport = () => {
    if (action === "Approved") {
      updateRequestStatus(reportId, "Approved", null);
    } else if (action === "Rejected") {
      if (!comment.trim()) {
        toast.error("Please provide a rejection note");
        return;
      }
      updateRequestStatus(reportId, "Rejected", comment);
    }
    setIsOpen(false);
    setComment("");
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center sm:text-left">
        Inventory Management
      </h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 justify-center sm:justify-start mb-6">
        <Button
          className={`${
            tab === "inventory"
              ? "bg-[#4c735c] text-white"
              : "bg-gray-200 text-gray-700"
          } px-4 py-2 rounded-lg text-sm sm:text-base`}
          onClick={() => setTab("inventory")}
        >
          Inventory Items
        </Button>
        <Button
          className={`${
            tab === "requests"
              ? "bg-[#4c735c] text-white"
              : "bg-gray-200 text-gray-700"
          } px-4 py-2 rounded-lg text-sm sm:text-base`}
          onClick={() => setTab("requests")}
        >
          Item Requests
        </Button>
      </div>

      {/* Inventory Items */}
      {tab === "inventory" && (
        <>
          <Card className="mb-6">
            <CardContent>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
              >
                <Input
                  placeholder="Item name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Input
                  placeholder="Category"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                />
                <Input
                  placeholder="Unit (pcs, box, ream...)"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                />
                <Input
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />

                <div className="col-span-full flex justify-end gap-2 flex-wrap">
                  {editingId !== null ? (
                    <>
                      <Button
                        type="submit"
                        className="bg-[#4c735c] hover:bg-[#3b5a49] text-white rounded-lg px-4 py-2 text-sm"
                      >
                        Update
                      </Button>
                      <Button
                        type="button"
                        className="bg-gray-400 hover:bg-gray-500 text-white rounded-lg px-4 py-2 text-sm"
                        onClick={() => {
                          setEditingId(null);
                          setForm({
                            name: "",
                            category: "",
                            quantity: "",
                            unit: "",
                            description: "",
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="submit"
                      className="bg-[#4c735c] hover:bg-[#3b5a49] text-white rounded-lg px-4 py-2 text-sm"
                    >
                      + Add Item
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Search */}
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-center bg-white rounded-lg p-3 gap-2">
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:max-w-xs border border-gray-300"
            />
          </div>

          {/* Scrollable Table */}
          <div className="overflow-x-auto">
            <Card>
              <CardContent className="p-2 sm:p-4">
                <table className="w-full text-sm sm:text-base border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">ID</th>
                      <th className="p-2 border">Name</th>
                      <th className="p-2 border">Category</th>
                      <th className="p-2 border">Qty</th>
                      <th className="p-2 border">Unit</th>
                      <th className="p-2 border">Description</th>
                      <th className="p-2 border text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-2 border">{item.id}</td>
                        <td className="p-2 border">{item.name}</td>
                        <td className="p-2 border">{item.category}</td>
                        <td className="p-2 border">{item.quantity}</td>
                        <td className="p-2 border">{item.unit}</td>
                        <td className="p-2 border">{item.description}</td>
                        <td className="p-2 border text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              className="bg-[#4c735c] text-white"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-600 text-white"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredItems.length === 0 && (
                      <tr>
                        <td
                          colSpan="7"
                          className="text-center p-4 text-gray-500"
                        >
                          No items found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Requests */}
      {tab === "requests" && (
        <div className="overflow-x-auto">
          <Card>
            <CardContent className="p-2 sm:p-4">
              <table className="w-full text-sm sm:text-base min-w-[700px] border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">ID</th>
                    <th className="border p-2">Requester</th>
                    <th className="border p-2">Item</th>
                    <th className="border p-2">Qty</th>
                    <th className="border p-2">Notes</th>
                    <th className="border p-2">Status</th>
                    <th className="border p-2">Date</th>
                    <th className="border p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="p-2 border">{req.id}</td>
                      <td className="p-2 border">{req.requester_name}</td>
                      <td className="p-2 border">{req.item_name}</td>
                      <td className="p-2 border">{req.quantity}</td>
                      <td className="p-2 border">{req.notes}</td>
                      <td
                        className={`p-2 border font-semibold ${
                          req.status === "Approved"
                            ? "text-green-600"
                            : req.status === "Rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {req.status}
                      </td>
                      <td className="p-2 border">
                        {new Date(req.request_date).toLocaleDateString()}
                      </td>
                      <td className="p-2 border text-center">
                        <div className="flex flex-wrap justify-center gap-2">
                          <Button
                            size="sm"
                            className="bg-[#4c735c] text-white"
                            onClick={() => openPopup("Approved", req.id)}
                            disabled={req.status !== "Pending"}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-600 text-white"
                            onClick={() => openPopup("Rejected", req.id)}
                            disabled={req.status !== "Pending"}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="bg-[#4c735c] text-white"
                            onClick={() => handleClaim(req.id)}
                            disabled={
                              req.status !== "Approved" ||
                              req.status === "Claimed"
                            }
                          >
                            Claim
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900/70 z-50 px-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-center">
              {action === "Approved" ? "Approve Request" : "Reject Request"}
            </h2>

            {action === "Rejected" && (
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#4c735c] outline-none"
                placeholder="Write your rejection reason..."
                rows={4}
              />
            )}

            <div className="flex justify-end mt-4 gap-2 flex-wrap">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="px-4 py-2 bg-[#4c735c] text-white rounded-lg w-full sm:w-auto"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
