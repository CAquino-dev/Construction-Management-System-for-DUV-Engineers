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
import ConfirmationModal from "../../components/adminComponents/ConfirmationModal";

const ProcurementPage = () => {
  const [milestones, setMilestones] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState({});
  const [loading, setLoading] = useState(true);
  const [isRFQModalOpen, setIsRFQModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

  // Fetch milestones ready for procurement
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/projectManager/getForProcurement`
        );
        setMilestones(res.data.milestones);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load procurement data.");
      }

      // Fetch suppliers (active)
      try {
        const supplierRes = await axios.get(
          `${API_URL}/api/procurement/getSuppliers`
        );
        setSuppliers(supplierRes.data);
      } catch (err) {
        console.error("failed to get suppliers", err);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSupplierSelect = (milestoneId, supplierId) => {
    setSelectedSuppliers((prev) => {
      const current = prev[milestoneId] || [];
      if (current.includes(supplierId)) {
        return {
          ...prev,
          [milestoneId]: current.filter((id) => id !== supplierId),
        };
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
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/procurement/sendQuotationRequests`,
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

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4c735c] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading procurement data...</p>
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
            Procurement Creation
          </h1>
          <p className="text-gray-600 mt-2">
            Select suppliers and send Request for Quotation (RFQ) for approved
            milestones.
          </p>
        </div>

        {milestones.length === 0 ? (
          <Card className="rounded-2xl shadow-sm border-0">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4 text-gray-300">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Milestones Available
              </h3>
              <p className="text-gray-600">
                No milestones are currently ready for procurement.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {milestones.map((m) => (
              <Card key={m.id} className="rounded-2xl shadow-sm border-0">
                <CardContent className="p-6 space-y-6">
                  {/* Header */}
                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                          {m.title}
                        </h2>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <span className="mr-1">📊</span>
                            Status: {m.status}
                          </span>
                          {m.details && (
                            <span className="flex items-center">
                              <span className="mr-1">📝</span>
                              {m.details}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {m.boq_items.flatMap((boq) => boq.mto_items).length}{" "}
                          Items
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* MTO Table */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">📋</span>
                      Material Take-Off (MTO)
                    </h3>

                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold">
                              Description
                            </TableHead>
                            <TableHead className="font-semibold text-center">
                              Quantity
                            </TableHead>
                            <TableHead className="font-semibold text-center">
                              Unit
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {m.boq_items.flatMap((boq) =>
                            boq.mto_items.map((item) => (
                              <TableRow
                                key={item.mto_id}
                                className="hover:bg-gray-50"
                              >
                                <TableCell className="font-medium">
                                  {item.description}
                                </TableCell>
                                <TableCell className="text-center">
                                  {item.quantity}
                                </TableCell>
                                <TableCell className="text-center">
                                  {item.unit}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-3">
                      {m.boq_items.flatMap((boq) =>
                        boq.mto_items.map((item) => (
                          <div
                            key={item.mto_id}
                            className="border border-gray-200 rounded-lg p-4 bg-white"
                          >
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="col-span-2">
                                <span className="font-semibold text-gray-900">
                                  {item.description}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Quantity:</span>
                                <p className="font-medium">{item.quantity}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Unit:</span>
                                <p className="font-medium">{item.unit}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Supplier Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">🏢</span>
                      Select Suppliers for RFQ
                    </h3>

                    <div className="border border-gray-200 rounded-xl p-4 max-h-60 overflow-y-auto bg-gray-50">
                      {suppliers.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          No suppliers available
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {suppliers.map((s) => (
                            <div
                              key={s.id}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {s.supplier_name}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  {s.email}
                                </p>
                              </div>
                              <Checkbox
                                checked={
                                  selectedSuppliers[m.id]?.includes(s.id) ||
                                  false
                                }
                                onCheckedChange={() =>
                                  handleSupplierSelect(m.id, s.id)
                                }
                                className="ml-3"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-600">
                        {selectedSuppliers[m.id]?.length || 0} of{" "}
                        {suppliers.length} suppliers selected
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedMilestone(m);
                          setIsRFQModalOpen(true);
                        }}
                        className="bg-[#4c735c] hover:bg-[#3a5a4a] text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Send RFQ
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={isRFQModalOpen}
        onClose={() => setIsRFQModalOpen(false)}
        onConfirm={() => {
          if (selectedMilestone) {
            handleSendRFQ(selectedMilestone);
            setIsRFQModalOpen(false);
          }
        }}
        actionType="Send RFQ"
      />
    </div>
  );
};

export default ProcurementPage;
