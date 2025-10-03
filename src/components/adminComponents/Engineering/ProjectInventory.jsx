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
  const [open, setOpen] = useState(false);
  const [transaction, setTransaction] = useState({
    project_id: selectedProject.id,
    material_id: "",
    transaction_type: "IN",
    quantity: "",
    unit: "",
    created_by: userId,
  });
  const [materialCatalog, setMaterialCatalog] = useState([]);

  // Fetch project inventory
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

  const fetchMaterialCatalog = async () => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/inventory/getMaterialCatalog`
      );
      if (res.data) {
        setMaterialCatalog(res.data);
        console.log(res.data);
      }
    } catch (error) {
      console.error("failed to fetch material catalog", error);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchMaterialCatalog();
  }, []);

  // Handle transaction submit
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

  return (
    <div className="p-4">
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

      {/* Add Transaction Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>

          {/* Tabs for IN / OUT */}
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

            {/* IN Transaction Tab */}
            <TabsContent value="IN">
              <div>
                {/* Select Material */}
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

                {/* Quantity */}
                <Input
                  type="number"
                  placeholder="Quantity"
                  className="mb-2"
                  value={transaction.quantity}
                  onChange={(e) =>
                    setTransaction({ ...transaction, quantity: e.target.value })
                  }
                />

                {/* Unit */}
                <Input
                  placeholder="Unit (e.g., bags, pcs)"
                  value={transaction.unit}
                  onChange={(e) =>
                    setTransaction({ ...transaction, unit: e.target.value })
                  }
                />

                <Button
                  className="mt-4 w-full mt-4 w-full bg-[#4c735c] text-white hover:bg-[#4c735c]/90 cursor-pointer"
                  onClick={handleTransaction}
                >
                  Save IN Transaction
                </Button>
              </div>
            </TabsContent>

            {/* OUT Transaction Tab */}
            <TabsContent value="OUT">
              <div>
                {/* Select Material */}
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

                {/* Quantity */}
                <Input
                  type="number"
                  placeholder="Quantity"
                  className="mb-2"
                  value={transaction.quantity}
                  onChange={(e) =>
                    setTransaction({ ...transaction, quantity: e.target.value })
                  }
                />

                {/* Unit */}
                <Input
                  placeholder="Unit (e.g., bags, pcs)"
                  value={transaction.unit}
                  onChange={(e) =>
                    setTransaction({ ...transaction, unit: e.target.value })
                  }
                />

                <Button
                  className="mt-4 w-full bg-[#4c735c] text-white hover:bg-[#4c735c]/90 cursor-pointer"
                  onClick={handleTransaction}
                >
                  Save OUT Transaction
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectInventory;
