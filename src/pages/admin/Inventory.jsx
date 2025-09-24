import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Pencil, Trash2 } from "lucide-react";
import axios from "axios";

export const Inventory = () => {
  const [tab, setTab] = useState("inventory"); // 🔹 NEW: active tab
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

  // 🔹 Sample item requests
  const [requests, setRequests] = useState([
    {
      id: 1,
      requester: "John Doe",
      item: "Bond Paper A4",
      quantity: 5,
      status: "Pending",
      date: "2025-09-20",
    },
    {
      id: 2,
      requester: "Jane Smith",
      item: "Printer Ink (Black)",
      quantity: 2,
      status: "Approved",
      date: "2025-09-19",
    },
    {
      id: 3,
      requester: "Mike Johnson",
      item: "Staplers",
      quantity: 10,
      status: "Rejected",
      date: "2025-09-18",
    },
    {
      id: 4,
      requester: "Emily Davis",
      item: "Whiteboard Markers",
      quantity: 12,
      status: "Pending",
      date: "2025-09-21",
    },
  ]);


  const fetchInventoryItems = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/inventory/getInventoryItems`
      );
      if (res.data) {
        setItems(res.data);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.quantity || !form.unit) return;

    if (editingId !== null) {
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/inventory/updateInventoryItem/${editingId}`,
        form
      );
      fetchInventoryItems();
      setEditingId(null);
    } else {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/inventory/addInventoryItem`,
        form
      );

      fetchInventoryItems();
    }
    setForm({ name: "", category: "", quantity: "", unit: "", description: "" });
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

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📦 Inventory Management</h1>

      {/* 🔹 Tabs */}
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

      {/* 🔹 Inventory Items Tab */}
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

      {/* 🔹 Item Requests Tab */}
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
                  <th className="border p-2 text-left">Status</th>
                  <th className="border p-2 text-left">Date</th>
                  <th className="border p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td className="border p-2">{req.id}</td>
                    <td className="border p-2">{req.requester}</td>
                    <td className="border p-2">{req.item}</td>
                    <td className="border p-2">{req.quantity}</td>
                    <td
                      className={`border p-2 font-semibold ${
                        req.status === "Approved"
                          ? "text-green-600"
                          : req.status === "Rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {req.status}
                    </td>
                    <td className="border p-2">{req.date}</td>
                    <td className="border p-2 flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setRequests((prev) =>
                            prev.map((r) =>
                              r.id === req.id ? { ...r, status: "Approved" } : r
                            )
                          )
                        }
                        disabled={req.status === "Approved"}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          setRequests((prev) =>
                            prev.map((r) =>
                              r.id === req.id ? { ...r, status: "Rejected" } : r
                            )
                          )
                        }
                        disabled={req.status === "Rejected"}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Inventory;
