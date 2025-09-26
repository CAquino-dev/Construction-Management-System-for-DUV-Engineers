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
  const userId = localStorage.getItem('userId');

  // 🔹 Popup state
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState("");
  const [reportId, setReportId] = useState("");
  const [comment, setComment] = useState("");

  const openPopup = (action, reportId) => {
    setIsOpen(true);
    setAction(action);
    setReportId(reportId);
    setComment("");
  };

  const fetchInventoryItems = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/inventory/getInventoryItems`
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
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/inventory/claimItem/${requestId}`,
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
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/inventory/updateInventoryItem/${editingId}`,
          form
        );
        toast.success("Item updated successfully");
        setEditingId(null);
      } else {
        await axios.post(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/inventory/addInventoryItem`,
          form
        );
        toast.success("Item added successfully");
      }
      fetchInventoryItems();
      setForm({ name: "", category: "", quantity: "", unit: "", description: "" });
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

  // 🔹 Update request status (Approve / Reject)
  const updateRequestStatus = async (id, status, rejection_note) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/inventory/updateRequest/${id}`,
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📦 Inventory Management</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={tab === "inventory" ? "default" : "outline"}
          onClick={() => setTab("inventory")}
        >
          Inventory Items
        </Button>
        <Button
          variant={tab === "requests" ? "default" : "outline"}
          onClick={() => setTab("requests")}
        >
          Item Requests
        </Button>
      </div>

      {/* Inventory Items */}
      {tab === "inventory" && (
        <>
          {/* Search */}
          <div className="mb-4 flex justify-between">
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {/* Add / Edit Form */}
          <Card className="mb-6">
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-5 gap-2">
                <Input
                  placeholder="Item name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Input
                  placeholder="Category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
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
                <Button type="submit" className="col-span-5">
                  {editingId !== null ? "Update Item" : "Add Item"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Card>
            <CardContent>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">id</th>
                    <th className="border p-2 text-left">Name</th>
                    <th className="border p-2 text-left">Category</th>
                    <th className="border p-2 text-left">Quantity</th>
                    <th className="border p-2 text-left">Unit</th>
                    <th className="border p-2 text-left">Description</th>
                    <th className="border p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td className="border p-2">{item.id}</td>
                      <td className="border p-2">{item.name}</td>
                      <td className="border p-2">{item.category}</td>
                      <td className="border p-2">{item.quantity}</td>
                      <td className="border p-2">{item.unit}</td>
                      <td className="border p-2">{item.description}</td>
                      <td className="border p-2 flex gap-2 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center p-4 text-gray-500">
                        No items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Item Requests */}
      {tab === "requests" && (
        <Card>
          <CardContent>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">ID</th>
                  <th className="border p-2 text-left">Requester</th>
                  <th className="border p-2 text-left">Item</th>
                  <th className="border p-2 text-left">Quantity</th>
                  <th className="border p-2 text-left">Notes</th>
                  <th className="border p-2 text-left">Status</th>
                  <th className="border p-2 text-left">Date</th>
                  <th className="border p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td className="border p-2">{req.id}</td>
                    <td className="border p-2">{req.requester_name}</td>
                    <td className="border p-2">{req.item_name}</td>
                    <td className="border p-2">{req.quantity}</td>
                    <td className="border p-2">{req.notes}</td>
                    <td
                      className={`border p-2 font-semibold ${req.status === "Approved"
                          ? "text-green-600"
                          : req.status === "Rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                    >
                      {req.status}
                    </td>
                    <td className="border p-2">{new Date(req.request_date).toLocaleDateString()}</td>
                    <td className="border p-2 flex gap-2 justify-center">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => openPopup("Approved", req.id)}
                        disabled={req.status !== "Pending"}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openPopup("Rejected", req.id)}
                        disabled={req.status !== "Pending"}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 text-white hover:bg-green-700"
                        onClick={() => handleClaim(req.id)}
                        disabled={req.status !== "Approved" || req.status === "Claimed"}
                      >
                        Mark as Claimed
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* 🔹 Popup Modal for Approve / Reject */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900/70 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              {action === "Approved" ? "Approve Request" : "Reject Request"}
            </h2>

            {action === "Rejected" && (
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Write your rejection reason..."
                rows={4}
              ></textarea>
            )}

            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="px-4 py-2 bg-[#4c735c] text-white rounded-lg"
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
