import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";
import axios from "axios";

export const RequestForm = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    item_id: "",
    quantity: "",
    notes: "",
  });

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/inventory/getInventoryItems`
        );
        setItems(res.data);
      } catch (err) {
        console.error("Error fetching items:", err);
        toast.error("⚠️ Failed to load inventory items");
      }
    };
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.item_id || !form.quantity) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/inventory/request/${userId}`,
        form
      );
      toast.success("Request submitted successfully");
      setForm({ item_id: "", quantity: "", notes: "" });
    } catch (err) {
      console.error("Error submitting request:", err);
      toast.error("❌ Failed to submit request");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📝 Request Office Supplies</h1>

      <Card className="shadow-lg">
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {/* Item Dropdown */}
            <div>
              <label className="block text-sm font-medium mb-1">Item</label>
              <select
                className="w-full border rounded-lg p-2"
                value={form.item_id}
                onChange={(e) => setForm({ ...form, item_id: e.target.value })}
                required
              >
                <option value="">Select an item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <Input
                type="number"
                min="1"
                placeholder="Enter quantity"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Input
                placeholder="Optional notes..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full">
              Submit Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestForm;
