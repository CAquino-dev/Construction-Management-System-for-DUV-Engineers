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
  const [open, setOpen] = useState(false);
  const [expandedPO, setExpandedPO] = useState(null);
  const [materialCatalog, setMaterialCatalog] = useState([]);
  const [deliveryInputs, setDeliveryInputs] = useState({}); // ✅ Stores input per item

  const [transaction, setTransaction] = useState({
    project_id: selectedProject.id,
    material_id: "",
    transaction_type: "IN",
    quantity: "",
    unit: "",
    created_by: userId,
  });

  // ✅ Fetch project inventory
  const fetchInventory = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/inventory/getProjectInventory/${selectedProject.id}`
      );
      setInventory(res.data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  };

  // ✅ Fetch material catalog
  const fetchMaterialCatalog = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/inventory/getMaterialCatalog`
      );
      setMaterialCatalog(res.data);
    } catch (error) {
      console.error("Failed to fetch material catalog", error);
    }
  };

  // ✅ Fetch expected deliveries (pending purchase orders)
  const fetchExpectedDeliveries = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/inventory/getPendingDeliveries/${selectedProject.id}`
      );
      setDeliveries(res.data);
    } catch (err) {
      console.error("Error fetching deliveries:", err);
    }
  };

  // ✅ Update delivery input for an item
  const handleDeliveryInput = (poId, itemIndex, value) => {
    setDeliveryInputs((prev) => ({
      ...prev,
      [poId]: {
        ...(prev[poId] || {}),
        [itemIndex]: value,
      },
    }));
  };

  // ✅ Submit delivery quantity per PO
  const handleSubmitDelivery = async (poId, item, itemIndex) => {
    const deliveredQty = Number(deliveryInputs[poId]?.[itemIndex] || 0);
    if (deliveredQty <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/inventory/updateDeliveredQuantity`,
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

  // ✅ Mark PO as delivered
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
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/inventory/purchaseOrders/markDelivered/${poId}`,
        { received_by: userId,
          project_id: selectedProject.id
        }
      );
      toast.success(res.data.message || "Marked as delivered!");
      fetchExpectedDeliveries();
      fetchInventory();
    } catch (err) {
      console.error("Error marking delivery:", err);
      toast.error("Failed to mark as delivered");
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchMaterialCatalog();
    fetchExpectedDeliveries();
  }, []);

  // ✅ Save IN/OUT Transaction
  const handleTransaction = async () => {
    if (!transaction.material_id || !transaction.quantity) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/inventory/transaction`,
        transaction
      );
      toast.success("Transaction saved!");
      setOpen(false);
      fetchInventory();
    } catch (err) {
      console.error("Error saving transaction:", err);
      toast.error("Failed to save transaction");
    }
  };

  const togglePOItems = (po_id) => {
    setExpandedPO(expandedPO === po_id ? null : po_id);
  };

  return (
    <div className="p-4">
      <Tabs defaultValue="inventory">
        <TabsList className="mb-4 grid grid-cols-2 w-full">
          <TabsTrigger value="inventory">Project Inventory</TabsTrigger>
          <TabsTrigger value="deliveries">Expected Deliveries</TabsTrigger>
        </TabsList>

        {/* 📦 Project Inventory */}
        <TabsContent value="inventory">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">Project Inventory</h2>
            <Button
              className="bg-[#4c735c] hover:bg-[#4c735c]/50 cursor-pointer text-white"
              onClick={() => setOpen(true)}
            >
              Add Transaction
            </Button>
          </div>
          <Card>
            <CardContent className="p-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">Material</th>
                    <th className="p-2">Quantity</th>
                    <th className="p-2">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">{item.material_name}</td>
                      <td className="p-2">{item.quantity}</td>
                      <td className="p-2">{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 🚚 Expected Deliveries */}
        <TabsContent value="deliveries">
          <h2 className="text-xl font-bold mb-4">Expected Deliveries</h2>
          <Card>
            <CardContent className="p-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">PO Number</th>
                    <th className="p-2">Supplier</th>
                    <th className="p-2">Total Amount</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.length > 0 ? (
                    deliveries.map((po) => (
                      <React.Fragment key={po.po_id}>
                        <tr className="border-b">
                          <td className="p-2">{po.po_number}</td>
                          <td className="p-2">{po.supplier_name}</td>
                          <td className="p-2">
                            ₱{Number(po.total_amount).toLocaleString()}
                          </td>
                          <td className="p-2">{po.status}</td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => togglePOItems(po.po_id)}
                              >
                                {expandedPO === po.po_id
                                  ? "Hide Items"
                                  : "View Items"}
                              </Button>
                              <Button
                                className="bg-[#4c735c] text-white hover:bg-[#4c735c]/80"
                                onClick={() => markAsDelivered(po.po_id)}
                              >
                                Mark as Delivered
                              </Button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Items */}
                        {expandedPO === po.po_id && (
                          <tr>
                            <td colSpan="5" className="bg-gray-50 p-3">
                              <table className="w-full border text-sm">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="border px-2 py-1 text-left">
                                      Material
                                    </th>
                                    <th className="border px-2 py-1 text-center">
                                      Ordered Qty
                                    </th>
                                    <th className="border px-2 py-1 text-center">
                                      Delivered
                                    </th>
                                    <th className="border px-2 py-1 text-center">
                                      Add Delivered Qty
                                    </th>
                                    <th className="border px-2 py-1 text-center">
                                      Missing
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {po.materials?.length > 0 ? (
                                    po.materials.map((item, idx) => {
                                      const delivered =
                                        item.delivered_quantity || 0;
                                      const missing =
                                        item.quantity - delivered;
                                      return (
                                        <tr key={idx}>
                                          <td className="border px-2 py-1">
                                            {item.material_name}
                                          </td>
                                          <td className="border px-2 py-1 text-center">
                                            {item.quantity}
                                          </td>
                                          <td className="border px-2 py-1 text-center">
                                            {delivered}
                                          </td>
                                          <td className="border px-2 py-1 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                              <Input
                                                type="number"
                                                min="0"
                                                placeholder="Qty"
                                                className="w-20"
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
                                            className={`border px-2 py-1 text-center ${
                                              missing > 0
                                                ? "text-red-500 font-semibold"
                                                : "text-green-600"
                                            }`}
                                          >
                                            {missing > 0 ? missing : "—"}
                                          </td>
                                        </tr>
                                      );
                                    })
                                  ) : (
                                    <tr>
                                      <td
                                        colSpan="5"
                                        className="text-center py-2 text-gray-500"
                                      >
                                        No items found
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center p-4 text-gray-500"
                      >
                        No pending deliveries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ➕ Add Transaction Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <Tabs
            defaultValue="IN"
            onValueChange={(value) =>
              setTransaction({ ...transaction, transaction_type: value })
            }
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="IN">IN</TabsTrigger>
              <TabsTrigger value="OUT">OUT</TabsTrigger>
            </TabsList>
            {["IN", "OUT"].map((type) => (
              <TabsContent key={type} value={type}>
                <Select
                  onValueChange={(value) => {
                    const selected = materialCatalog.find(
                      (mat) => mat.id === parseInt(value)
                    );
                    setTransaction({
                      ...transaction,
                      material_id: value,
                      unit: selected?.unit || "",
                    });
                  }}
                >
                  <SelectTrigger className="mb-2">
                    <SelectValue placeholder="Select Material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materialCatalog.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Quantity"
                  className="mb-2"
                  value={transaction.quantity}
                  onChange={(e) =>
                    setTransaction({
                      ...transaction,
                      quantity: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Unit"
                  value={transaction.unit}
                  onChange={(e) =>
                    setTransaction({ ...transaction, unit: e.target.value })
                  }
                />
                <Button
                  className="mt-4 w-full bg-[#4c735c] text-white hover:bg-[#4c735c]/90 cursor-pointer"
                  onClick={handleTransaction}
                >
                  Save {type} Transaction
                </Button>
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectInventory;
