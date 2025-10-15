import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { toast } from "sonner";

const PurchaseOrderList = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPO, setExpandedPO] = useState(null);

  const userId = localStorage.getItem('userId');

  // ✅ Fetch all Purchase Orders (with items)
  const fetchPurchaseOrders = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/procurement/purchaseOrders`
      );
      setPurchaseOrders(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  // 📤 Send PO to Supplier
  const handleSendToSupplier = async (po_id) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/procurement/purchaseOrders/send/${po_id}`,
        { sent_by: userId }
      );
      toast.success(res.data.message);
      fetchPurchaseOrders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to send purchase order");
    }
  };

  // 👁️ Toggle item view
  const toggleViewItems = (po_id) => {
    setExpandedPO(expandedPO === po_id ? null : po_id);
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  // 🎨 Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case "Draft":
        return "text-gray-600";
      case "Sent to Supplier":
        return "text-blue-600";
      case "Pending Delivery":
        return "text-yellow-600";
      case "Partially Delivered":
        return "text-orange-600";
      case "Delivered":
        return "text-green-600";
      case "Closed":
        return "text-gray-500";
      case "Cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">📦 Purchase Orders</h1>

      {purchaseOrders.length === 0 ? (
        <p>No purchase orders found.</p>
      ) : (
        purchaseOrders.map((po) => (
          <Card key={po.po_id} className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-semibold">
                    {po.po_number || `PO-${po.po_id}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    Supplier: <span className="font-medium">{po.supplier_name}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Project ID: <span className="font-medium">{po.project_id}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Milestone ID: <span className="font-medium">{po.milestone_id}</span>
                  </p>
                  <p className={`text-sm mt-1 font-semibold ${getStatusColor(po.status)}`}>
                    Status: {po.status}
                  </p>
                  <p className="text-sm mt-1">
                    Total: ₱{Number(po.total_amount || 0).toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 items-end">
                  <Button
                    variant="outline"
                    className="text-sm"
                    onClick={() => toggleViewItems(po.po_id)}
                  >
                    {expandedPO === po.po_id ? "Hide Items" : "View Items"}
                  </Button>

                  {po.status === "Draft" ? (
                    <Button
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => handleSendToSupplier(po.po_id)}
                    >
                      Send to Supplier
                    </Button>
                  ) : po.status === "Sent to Supplier" ? (
                    <Button disabled className="bg-gray-400 text-white">
                      Sent to Supplier
                    </Button>
                  ) : po.status === "Pending Delivery" ? (
                    <Button disabled className="bg-yellow-500 text-white">
                      Awaiting Delivery
                    </Button>
                  ) : po.status === "Partially Delivered" ? (
                    <Button disabled className="bg-orange-500 text-white">
                      Partial Delivery
                    </Button>
                  ) : po.status === "Delivered" ? (
                    <Button disabled className="bg-green-600 text-white">
                      Delivered
                    </Button>
                  ) : po.status === "Closed" ? (
                    <Button disabled className="bg-gray-600 text-white">
                      Closed
                    </Button>
                  ) : po.status === "Cancelled" ? (
                    <Button disabled className="bg-red-600 text-white">
                      Cancelled
                    </Button>
                  ) : null}
                </div>
              </div>

              {/* Expandable Item Table */}
              {expandedPO === po.po_id && (
                <div className="mt-4 border-t pt-3">
                  <h2 className="text-md font-semibold mb-2">🧾 Purchase Order Items</h2>
                  {po.items && po.items.length > 0 ? (
                    <table className="w-full border-collapse text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border px-3 py-1 text-left">Material</th>
                          <th className="border px-3 py-1 text-center">Unit</th>
                          <th className="border px-3 py-1 text-center">Qty</th>
                          <th className="border px-3 py-1 text-center">Unit Price</th>
                          <th className="border px-3 py-1 text-center">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {po.items.map((item) => (
                          <tr key={item.item_id}>
                            <td className="border px-3 py-1">{item.material_name}</td>
                            <td className="border px-3 py-1 text-center">{item.unit}</td>
                            <td className="border px-3 py-1 text-center">{item.quantity}</td>
                            <td className="border px-3 py-1 text-center">
                              ₱{Number(item.unit_price).toLocaleString()}
                            </td>
                            <td className="border px-3 py-1 text-center font-medium">
                              ₱{Number(item.total_cost).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-sm text-gray-500">No items found for this PO.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default PurchaseOrderList;
