import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Send, Package } from "lucide-react";
import ConfirmationModal from "../../components/adminComponents/ConfirmationModal";

const PurchaseOrderList = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPO, setExpandedPO] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);

  const userId = localStorage.getItem("userId");

  // ✅ Fetch all Purchase Orders (with items)
  const fetchPurchaseOrders = async () => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/procurement/purchaseOrders`
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
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/procurement/purchaseOrders/send/${po_id}`,
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

  // 🎨 Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case "Draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Sent to Supplier":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pending Delivery":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Partially Delivered":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "Closed":
        return "bg-gray-200 text-gray-700 border-gray-300";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4c735c] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading purchase orders...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <span className="mr-3">📦</span>
            Purchase Orders
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and track all purchase orders with suppliers
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="rounded-2xl shadow-sm border-0">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {purchaseOrders.length}
              </div>
              <div className="text-sm text-gray-600">Total POs</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border-0">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {purchaseOrders.filter((po) => po.status === "Draft").length}
              </div>
              <div className="text-sm text-gray-600">Draft</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border-0">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {
                  purchaseOrders.filter(
                    (po) => po.status === "Sent to Supplier"
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">Sent</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border-0">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {
                  purchaseOrders.filter((po) => po.status === "Delivered")
                    .length
                }
              </div>
              <div className="text-sm text-gray-600">Delivered</div>
            </CardContent>
          </Card>
        </div>

        {purchaseOrders.length === 0 ? (
          <Card className="rounded-2xl shadow-sm border-0">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4 text-gray-300">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Purchase Orders
              </h3>
              <p className="text-gray-600">
                No purchase orders have been created yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {purchaseOrders.map((po) => (
              <Card
                key={po.po_id}
                className="rounded-2xl shadow-sm border-0 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* PO Information */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {po.po_number || `PO-${po.po_id}`}
                          </h3>
                          <div className="flex items-center mt-1">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                                po.status
                              )}`}
                            >
                              {po.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 sm:mt-0 text-right">
                          <p className="text-lg font-bold text-blue-700">
                            ₱{Number(po.total_amount || 0).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">Total Amount</p>
                        </div>
                      </div>

                      {/* Supplier and Project Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">🏢</span>
                          <div>
                            <p className="text-gray-500">Supplier</p>
                            <p className="font-semibold text-gray-800">
                              {po.supplier_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">📁</span>
                          <div>
                            <p className="text-gray-500">Project</p>
                            <p className="font-semibold text-gray-800">
                              #{po.project_id}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">🎯</span>
                          <div>
                            <p className="text-gray-500">Milestone</p>
                            <p className="font-semibold text-gray-800">
                              #{po.milestone_id}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 items-start lg:items-end">
                      <Button
                        variant="outline"
                        className="flex items-center space-x-2 w-full sm:w-auto lg:w-full"
                        onClick={() => toggleViewItems(po.po_id)}
                      >
                        {expandedPO === po.po_id ? (
                          <>
                            <ChevronUp size={16} />
                            <span>Hide Items</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown size={16} />
                            <span>View Items</span>
                          </>
                        )}
                      </Button>

                      {po.status === "Draft" ? (
                        <Button
                          className="bg-[#4c735c] hover:bg-[#3a5a4a] text-white w-full sm:w-auto lg:w-full flex items-center space-x-2"
                          onClick={() => {
                            setSelectedPO(po.po_id);
                            setIsModalOpen(true);
                          }}
                        >
                          <Send size={16} />
                          <span>Send to Supplier</span>
                        </Button>
                      ) : (
                        <Button
                          disabled
                          className="w-full sm:w-auto lg:w-full flex items-center space-x-2"
                          variant="secondary"
                        >
                          <Package size={16} />
                          <span>{po.status}</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Item Table */}
                  {expandedPO === po.po_id && (
                    <div className="mt-6 border-t pt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">🧾</span>
                        Purchase Order Items
                      </h4>

                      {po.items && po.items.length > 0 ? (
                        <>
                          {/* Desktop Table */}
                          <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="border p-3 text-left font-semibold">
                                    Material
                                  </th>
                                  <th className="border p-3 text-center font-semibold">
                                    Unit
                                  </th>
                                  <th className="border p-3 text-center font-semibold">
                                    Qty
                                  </th>
                                  <th className="border p-3 text-right font-semibold">
                                    Unit Price
                                  </th>
                                  <th className="border p-3 text-right font-semibold">
                                    Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {po.items.map((item) => (
                                  <tr
                                    key={item.item_id}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="border p-3 font-medium">
                                      {item.material_name}
                                    </td>
                                    <td className="border p-3 text-center">
                                      {item.unit}
                                    </td>
                                    <td className="border p-3 text-center">
                                      {item.quantity}
                                    </td>
                                    <td className="border p-3 text-right">
                                      ₱
                                      {Number(item.unit_price).toLocaleString()}
                                    </td>
                                    <td className="border p-3 text-right font-bold text-blue-700">
                                      ₱
                                      {Number(item.total_cost).toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile Cards */}
                          <div className="lg:hidden space-y-3">
                            {po.items.map((item) => (
                              <Card
                                key={item.item_id}
                                className="border border-gray-200"
                              >
                                <CardContent className="p-4">
                                  <div className="space-y-2">
                                    <h5 className="font-semibold text-gray-900">
                                      {item.material_name}
                                    </h5>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div>
                                        <span className="text-gray-500">
                                          Unit:
                                        </span>
                                        <p className="font-medium">
                                          {item.unit}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">
                                          Quantity:
                                        </span>
                                        <p className="font-medium">
                                          {item.quantity}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">
                                          Unit Price:
                                        </span>
                                        <p className="font-medium">
                                          ₱
                                          {Number(
                                            item.unit_price
                                          ).toLocaleString()}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">
                                          Total:
                                        </span>
                                        <p className="font-bold text-blue-700">
                                          ₱
                                          {Number(
                                            item.total_cost
                                          ).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Package
                            size={48}
                            className="mx-auto mb-3 text-gray-300"
                          />
                          <p>No items found for this purchase order.</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          handleSendToSupplier(selectedPO);
          setIsModalOpen(false);
        }}
        actionType="Send to Supplier"
      />
    </div>
  );
};

export default PurchaseOrderList;
