import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "../../components/ui/table";
import { toast } from "sonner";

const ProcurementPage = () => {
  const [milestones, setMilestones] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState({});
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

  // Fetch milestones ready for procurement
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/projectManager/getForProcurement`);
        setMilestones(res.data.milestones);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load procurement data. Using dummy data.");
      }

      // Fetch suppliers (active)
      try {
        const supplierRes = await axios.get(`${API_URL}/api/procurement/getSuppliers`);
        setSuppliers(supplierRes.data);
      } catch (err) {
        console.error('failed to get suppliers', err)
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSupplierSelect = (milestoneId, supplierId) => {
    setSelectedSuppliers((prev) => {
      const current = prev[milestoneId] || [];
      if (current.includes(supplierId)) {
        return { ...prev, [milestoneId]: current.filter((id) => id !== supplierId) };
      } else {
        return { ...prev, [milestoneId]: [...current, supplierId] };
      }
    });
  };

const handleSendRFQ = async (milestone) => {
  const selected = selectedSuppliers[milestone.id] || [];
  if (selected.length === 0) {
    toast.error("Please select at least one supplier!");
    return;
  }

  const chosenSuppliers = suppliers.filter((s) => selected.includes(s.id));

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_REACT_APP_API_URL}/api/procurement/sendQuotationRequests`,
      {
        milestoneId: milestone.id,
        suppliers: chosenSuppliers,
      }
    );

    toast.success(res.data.message);
  } catch (err) {
    console.error(err);
    toast.error("Failed to send quotation requests.");
  }
};


  if (loading) return <p className="p-6">Loading procurement data...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Procurement Creation</h1>
      <p className="text-gray-600 mb-4">
        Select suppliers and send Request for Quotation (RFQ) for approved milestones.
      </p>

      {milestones.map((m) => (
        <Card key={m.id} className="shadow-md border">
          <CardContent className="p-4 space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-xl font-semibold">{m.title}</h2>
              <p className="text-gray-600 text-sm">Status: {m.status}</p>
              <p className="text-gray-600 text-sm">Details: {m.details}</p>
            </div>

            {/* MTO Table */}
            <div>
              <h3 className="font-semibold mb-2">Material Take-Off (MTO)</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {m.boq_items.flatMap((boq) =>
                    boq.mto_items.map((item) => (
                      <TableRow key={item.mto_id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Supplier Selection */}
            <div>
              <h3 className="font-semibold mb-2">Select Suppliers for RFQ</h3>
              <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                {suppliers.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{s.supplier_name}</p>
                      <p className="text-sm text-gray-500">{s.email}</p>
                    </div>
                    <Checkbox
                      checked={selectedSuppliers[m.id]?.includes(s.id) || false}
                      onCheckedChange={() => handleSupplierSelect(m.id, s.id)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => handleSendRFQ(m)} className="bg-blue-600 text-white">
                Send Request for Quotation
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProcurementPage;
