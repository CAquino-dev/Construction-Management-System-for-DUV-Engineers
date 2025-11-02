import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";

const ProjectInventory = ({ selectedProject }) => {
  const userId = localStorage.getItem("userId");
  const [inventory, setInventory] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [open, setOpen] = useState(false);
  const [expandedPO, setExpandedPO] = useState(null);
  const [deliveryInputs, setDeliveryInputs] = useState({});

  const [transaction, setTransaction] = useState({
    project_id: selectedProject.id,
    material_id: "",
    transaction_type: "OUT",
    quantity: "",
    unit: "",
    created_by: userId,
  });

  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Fetch data functions
  const fetchInventory = async () => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/inventory/getProjectInventory/${selectedProject.id}`
      );
      setInventory(res.data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  };

  const fetchExpectedDeliveries = async () => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/inventory/getPendingDeliveries/${selectedProject.id}`
      );
      setDeliveries(res.data);
    } catch (err) {
      console.error("Error fetching deliveries:", err);
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/inventory/getTransactionHistory/${selectedProject.id}`
      );
      console.log('history', res.data);
      setTransactions(res.data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const handleDeliveryInput = (poId, itemIndex, value) => {
    // Prevent negative numbers
    const numericValue = Math.max(0, Number(value));
    setDeliveryInputs((prev) => ({
      ...prev,
      [poId]: {
        ...(prev[poId] || {}),
        [itemIndex]: numericValue,
      },
    }));
  };

  const handleSubmitDelivery = async (poId, item, itemIndex) => {
    const deliveredQty = Number(deliveryInputs[poId]?.[itemIndex] || 0);
    if (deliveredQty <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/inventory/updateDeliveredQuantity`,
        {
          po_id: poId,
          item_id: item.id,
          delivered_quantity: deliveredQty,
          updated_by: userId,
        }
      );
      toast.success(`${item.material_name} updated successfully!`);
      fetchExpectedDeliveries();
    } catch (err) {
      console.error("Error updating delivered quantity:", err);
      toast.error("Failed to update delivered quantity");
    }
  };

  const markAsDelivered = async (poId) => {
    try {
      const po = deliveries.find((p) => p.po_id === poId);
      const notFullyDelivered = po.materials.some(
        (item) => (item.delivered_quantity || 0) < item.quantity
      );
      if (notFullyDelivered) {
        toast.error("Cannot mark as delivered. Some items are still missing.");
        return;
      }

      const res = await axios.put(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/inventory/purchaseOrders/markDelivered/${poId}`,
        { received_by: userId, project_id: selectedProject.id }
      );
      toast.success(res.data.message || "Marked as delivered!");
      fetchExpectedDeliveries();
      fetchInventory();
      fetchTransactionHistory();
    } catch (err) {
      console.error("Error marking delivery:", err);
      toast.error("Failed to mark as delivered");
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchExpectedDeliveries();
    fetchTransactionHistory();
  }, []);

  const handleMaterialSelect = (value) => {
    const selected = inventory.find((item) => item.id === parseInt(value));
    setSelectedMaterial(selected);
    setTransaction({
      ...transaction,
      material_id: value,
      unit: selected?.unit || "",
      quantity: "" // Reset quantity when material changes
    });
  };

  const handleQuantityChange = (value) => {
    const numericValue = Number(value);
    
    // Prevent negative numbers
    if (numericValue < 0) {
      toast.error("Quantity cannot be negative");
      return;
    }

    // Check if quantity exceeds available inventory
    if (selectedMaterial && numericValue > selectedMaterial.quantity) {
      toast.error(`Quantity cannot exceed available stock (${selectedMaterial.quantity} ${selectedMaterial.unit})`);
      return;
    }

    setTransaction({
      ...transaction,
      quantity: numericValue
    });
  };

  const handleTransaction = async () => {
    if (!transaction.material_id || !transaction.quantity) {
      toast.error("Please fill all fields");
      return;
    }

    // Final validation before submission
    if (transaction.quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (selectedMaterial && transaction.quantity > selectedMaterial.quantity) {
      toast.error(`Quantity cannot exceed available stock (${selectedMaterial.quantity} ${selectedMaterial.unit})`);
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/inventory/transaction`,
        transaction
      );
      toast.success("Transaction saved!");
      setOpen(false);
      setTransaction({
        project_id: selectedProject.id,
        material_id: "",
        transaction_type: "OUT",
        quantity: "",
        unit: "",
        created_by: userId,
      });
      setSelectedMaterial(null);
      fetchInventory();
      fetchTransactionHistory();
    } catch (err) {
      console.error("Error saving transaction:", err);
      toast.error("Failed to save transaction");
    }
  };

  const togglePOItems = (po_id) => {
    setExpandedPO(expandedPO === po_id ? null : po_id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4">
      <Tabs defaultValue="inventory">
        <TabsList className="mb-4 grid grid-cols-3 w-full">
          <TabsTrigger value="inventory">Project Inventory</TabsTrigger>
          <TabsTrigger value="deliveries">Expected Deliveries</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        {/* 📦 Project Inventory */}
        <TabsContent value="inventory">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="text-xl font-bold">Project Inventory</h2>
            <Button
              className="bg-[#4c735c] hover:bg-[#4c735c]/90 text-white w-full sm:w-auto cursor-pointer"
              onClick={() => setOpen(true)}
            >
              Add Outgoing Transaction
            </Button>
          </div>

          <Card>
            <CardContent className="p-0 sm:p-4">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-3 font-semibold text-sm">Material</th>
                      <th className="p-3 font-semibold text-sm">Quantity</th>
                      <th className="p-3 font-semibold text-sm">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{item.material_name}</td>
                        <td className="p-3 font-medium">{item.quantity}</td>
                        <td className="p-3 text-gray-600">{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3 p-4">
                {inventory.length > 0 ? (
                  inventory.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 bg-white shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {item.material_name}
                        </h3>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {item.unit}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Quantity:{" "}
                        <span className="font-semibold">{item.quantity}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No inventory items found
                  </div>
                )}
              </div>

              {inventory.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No inventory items found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 🚚 Expected Deliveries */}
        <TabsContent value="deliveries">
          <h2 className="text-xl font-bold mb-4">Expected Deliveries</h2>
          <Card>
            <CardContent className="p-0 sm:p-4">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-3 font-semibold text-sm">PO Number</th>
                      <th className="p-3 font-semibold text-sm">Supplier</th>
                      <th className="p-3 font-semibold text-sm">
                        Total Amount
                      </th>
                      <th className="p-3 font-semibold text-sm">Status</th>
                      <th className="p-3 font-semibold text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.length > 0 ? (
                      deliveries.map((po) => (
                        <React.Fragment key={po.po_id}>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{po.po_number}</td>
                            <td className="p-3">{po.supplier_name}</td>
                            <td className="p-3">
                              ₱{Number(po.total_amount).toLocaleString()}
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  po.status === "delivered"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {po.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => togglePOItems(po.po_id)}
                                >
                                  {expandedPO === po.po_id ? "Hide" : "View"}
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-[#4c735c] text-white hover:bg-[#4c735c]/80"
                                  onClick={() => markAsDelivered(po.po_id)}
                                >
                                  Mark Delivered
                                </Button>
                              </div>
                            </td>
                          </tr>

                          {expandedPO === po.po_id && (
                            <tr>
                              <td colSpan="5" className="bg-gray-50 p-4">
                                <div className="overflow-x-auto">
                                  <table className="w-full border text-sm">
                                    <thead>
                                      <tr className="bg-gray-100">
                                        <th className="border p-2 text-left">
                                          Material
                                        </th>
                                        <th className="border p-2 text-center">
                                          Ordered
                                        </th>
                                        <th className="border p-2 text-center">
                                          Delivered
                                        </th>
                                        <th className="border p-2 text-center">
                                          Add Delivery
                                        </th>
                                        <th className="border p-2 text-center">
                                          Missing
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {po.materials?.map((item, idx) => {
                                        const delivered =
                                          item.delivered_quantity || 0;
                                        const missing =
                                          item.quantity - delivered;
                                        return (
                                          <tr key={idx}>
                                            <td className="border p-2 font-medium">
                                              {item.material_name}
                                            </td>
                                            <td className="border p-2 text-center">
                                              {item.quantity}
                                            </td>
                                            <td className="border p-2 text-center">
                                              {delivered}
                                            </td>
                                            <td className="border p-2">
                                              <div className="flex items-center justify-center gap-2">
                                                <Input
                                                  type="number"
                                                  min="0"
                                                  max={missing}
                                                  placeholder="Qty"
                                                  className="w-20 text-sm"
                                                  value={
                                                    deliveryInputs[po.po_id]?.[
                                                      idx
                                                    ] || ""
                                                  }
                                                  onChange={(e) =>
                                                    handleDeliveryInput(
                                                      po.po_id,
                                                      idx,
                                                      e.target.value
                                                    )
                                                  }
                                                />
                                                <Button
                                                  size="sm"
                                                  className="bg-[#4c735c] text-white hover:bg-[#4c735c]/70"
                                                  onClick={() =>
                                                    handleSubmitDelivery(
                                                      po.po_id,
                                                      item,
                                                      idx
                                                    )
                                                  }
                                                >
                                                  Save
                                                </Button>
                                              </div>
                                            </td>
                                            <td
                                              className={`border p-2 text-center font-medium ${
                                                missing > 0
                                                  ? "text-red-500"
                                                  : "text-green-600"
                                              }`}
                                            >
                                              {missing > 0 ? missing : "—"}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center p-8 text-gray-500"
                        >
                          No pending deliveries found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4 p-4">
                {deliveries.length > 0 ? (
                  deliveries.map((po) => (
                    <div
                      key={po.po_id}
                      className="border rounded-lg p-4 bg-white shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {po.po_number}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {po.supplier_name}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              po.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {po.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Total Amount:</span>
                            <p className="font-semibold">
                              ₱{Number(po.total_amount).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => togglePOItems(po.po_id)}
                          >
                            {expandedPO === po.po_id
                              ? "Hide Items"
                              : "View Items"}
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-[#4c735c] text-white hover:bg-[#4c735c]/80"
                            onClick={() => markAsDelivered(po.po_id)}
                          >
                            Mark Delivered
                          </Button>
                        </div>

                        {expandedPO === po.po_id && (
                          <div className="border-t pt-3 mt-3">
                            <h4 className="font-semibold mb-3">PO Items</h4>
                            <div className="space-y-3">
                              {po.materials?.map((item, idx) => {
                                const delivered = item.delivered_quantity || 0;
                                const missing = item.quantity - delivered;
                                return (
                                  <div
                                    key={idx}
                                    className="border rounded-lg p-3 bg-gray-50"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <h5 className="font-medium">
                                        {item.material_name}
                                      </h5>
                                      <span
                                        className={`text-xs px-2 py-1 rounded-full ${
                                          missing > 0
                                            ? "bg-red-100 text-red-800"
                                            : "bg-green-100 text-green-800"
                                        }`}
                                      >
                                        Missing: {missing > 0 ? missing : 0}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                      <div>
                                        <span className="text-gray-500">
                                          Ordered:
                                        </span>
                                        <p className="font-medium">
                                          {item.quantity}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">
                                          Delivered:
                                        </span>
                                        <p className="font-medium">
                                          {delivered}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Input
                                        type="number"
                                        min="0"
                                        max={missing}
                                        placeholder="Add quantity"
                                        className="flex-1 text-sm"
                                        value={
                                          deliveryInputs[po.po_id]?.[idx] || ""
                                        }
                                        onChange={(e) =>
                                          handleDeliveryInput(
                                            po.po_id,
                                            idx,
                                            e.target.value
                                          )
                                        }
                                      />
                                      <Button
                                        size="sm"
                                        className="bg-[#4c735c] text-white hover:bg-[#4c735c]/70"
                                        onClick={() =>
                                          handleSubmitDelivery(
                                            po.po_id,
                                            item,
                                            idx
                                          )
                                        }
                                      >
                                        Save
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No pending deliveries found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 📊 Transaction History */}
        <TabsContent value="history">
          <h2 className="text-xl font-bold mb-4">Transaction History</h2>
          <Card>
            <CardContent className="p-0 sm:p-4">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-3 font-semibold text-sm">Date</th>
                      <th className="p-3 font-semibold text-sm">Material</th>
                      <th className="p-3 font-semibold text-sm">Type</th>
                      <th className="p-3 font-semibold text-sm">Quantity</th>
                      <th className="p-3 font-semibold text-sm">Unit</th>
                      <th className="p-3 font-semibold text-sm">Created By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length > 0 ? (
                      transactions.map((transaction) => (
                        <tr key={transaction.transaction_id} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-sm text-gray-600">
                            {formatDate(transaction.created_at)}
                          </td>
                          <td className="p-3 font-medium">
                            {transaction.material_name}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                transaction.transaction_type === "IN"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {transaction.transaction_type || "OUT"}
                            </span>
                          </td>
                          <td className="p-3 font-medium">
                            {transaction.quantity}
                          </td>
                          <td className="p-3 text-gray-600">
                            {transaction.unit}
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {transaction.full_name || "System"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center p-8 text-gray-500"
                        >
                          No transaction history found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3 p-4">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <div
                      key={transaction.transaction_id}
                      className="border rounded-lg p-4 bg-white shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {transaction.material_name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.transaction_type === "IN"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.transaction_type || "OUT"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                        <div>
                          <span className="text-gray-500">Quantity:</span>
                          <p className="font-semibold">
                            {transaction.quantity} {transaction.unit}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <p className="font-semibold text-xs">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        By: {transaction.full_name || "System"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No transaction history found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ➕ Add Transaction Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              Add Outgoing Transaction
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* Material Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Select Material *
              </label>
              <Select
                onValueChange={handleMaterialSelect}
                value={transaction.material_id}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose from inventory" />
                </SelectTrigger>
                <SelectContent>
                  {inventory.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      <div className="flex justify-between w-full">
                        <span>{item.material_name}</span>
                        <span className="text-gray-500 ml-2">
                          ({item.quantity} {item.unit})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Quantity *
              </label>
              <Input
                type="number"
                placeholder="Enter quantity"
                value={transaction.quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                min="0"
                max={selectedMaterial?.quantity || undefined}
                className="w-full"
              />
              {selectedMaterial && (
                <p className="text-xs text-gray-500">
                  Available: {selectedMaterial.quantity} {selectedMaterial.unit}
                </p>
              )}
            </div>

            {/* Unit Display */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Unit
              </label>
              <Input
                placeholder="Unit will auto-fill"
                value={transaction.unit}
                onChange={(e) =>
                  setTransaction({ ...transaction, unit: e.target.value })
                }
                className="w-full bg-gray-50"
                disabled
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#4c735c] text-white hover:bg-[#4c735c]/90 cursor-pointer"
                onClick={handleTransaction}
                disabled={!transaction.material_id || !transaction.quantity || transaction.quantity <= 0}
              >
                Save OUT Transaction
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectInventory;