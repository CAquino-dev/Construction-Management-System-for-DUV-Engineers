import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { toast } from "sonner";
import { Edit2, Trash2, Plus } from "lucide-react";
import ConfirmationModal from "../../components/adminComponents/ConfirmationModal";

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    supplier_name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    specialization: "",
    status: "Active",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [remark, setRemark] = useState(""); // For future use if needed

  // Fetch suppliers
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/procurement/getSuppliers`
      );
      setSuppliers(res.data);
    } catch (err) {
      console.error("failed to get suppliers", err);
      toast.error("Failed to load suppliers");
    }
  };

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle add or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/procurement/updateSupplier/${editingId}`,
          form
        );
        toast.success("Supplier updated successfully!");
      } else {
        await axios.post(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/procurement/addSupplier`,
          form
        );
        toast.success("Supplier added successfully!");
      }
      fetchSuppliers();
      setIsOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    }
  };

  const resetForm = () => {
    setForm({
      supplier_name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      specialization: "",
      status: "Active",
    });
    setEditingId(null);
  };

  const handleEdit = (supplier) => {
    setForm(supplier);
    setEditingId(supplier.id);
    setIsOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (id) => {
    setSupplierToDelete(id);
    setDeleteModalOpen(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSupplierToDelete(null);
    setRemark(""); // Reset remark
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!supplierToDelete) return;

    try {
      await axios.delete(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/procurement/deleteSupplier/${supplierToDelete}`
      );
      toast.success("Supplier deleted!");
      fetchSuppliers();
      closeDeleteModal();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed!");
      closeDeleteModal();
    }
  };

  const getStatusColor = (status) => {
    return status === "Active"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">🏢</span>
                Supplier Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your supplier database and contact information
              </p>
            </div>
            <Dialog
              open={isOpen}
              onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-[#4c735c] hover:bg-[#3a5a4a] text-white px-6 py-2 rounded-lg font-semibold transition-colors mt-4 sm:mt-0 flex items-center space-x-2">
                  <Plus size={20} />
                  <span>Add Supplier</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    {editingId ? "Edit Supplier" : "Add New Supplier"}
                  </DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      name="supplier_name"
                      placeholder="Supplier Name"
                      value={form.supplier_name}
                      onChange={handleChange}
                      required
                      className="w-full"
                    />
                    <Input
                      name="contact_person"
                      placeholder="Contact Person"
                      value={form.contact_person}
                      onChange={handleChange}
                      className="w-full"
                    />
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full"
                    />
                    <Input
                      name="phone"
                      placeholder="Phone Number"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full"
                    />
                    <Input
                      name="address"
                      placeholder="Full Address"
                      value={form.address}
                      onChange={handleChange}
                      className="w-full"
                    />
                    <Input
                      name="specialization"
                      placeholder="Specialization"
                      value={form.specialization}
                      onChange={handleChange}
                      className="w-full"
                    />
                    <select
                      name="status"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4c735c] focus:border-transparent transition-colors"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="w-full sm:w-auto bg-[#4c735c] hover:bg-[#3a5a4a]"
                    >
                      {editingId ? "Update Supplier" : "Add Supplier"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="rounded-2xl shadow-sm border-0">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {suppliers.length}
              </div>
              <div className="text-sm text-gray-600">Total Suppliers</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border-0">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {suppliers.filter((s) => s.status === "Active").length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border-0">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {suppliers.filter((s) => s.status === "Inactive").length}
              </div>
              <div className="text-sm text-gray-600">Inactive</div>
            </CardContent>
          </Card>
        </div>

        {/* Suppliers List */}
        <Card className="rounded-2xl shadow-sm border-0">
          <CardContent className="p-0">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Supplier</TableHead>
                    <TableHead className="font-semibold">
                      Contact Person
                    </TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="font-semibold">
                      Specialization
                    </TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((s) => (
                    <TableRow key={s.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {s.supplier_name}
                      </TableCell>
                      <TableCell>{s.contact_person || "-"}</TableCell>
                      <TableCell>{s.email || "-"}</TableCell>
                      <TableCell>{s.phone || "-"}</TableCell>
                      <TableCell>{s.specialization || "-"}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            s.status
                          )}`}
                        >
                          {s.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(s)}
                            className="flex items-center space-x-1"
                          >
                            <Edit2 size={14} />
                            <span>Edit</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden p-4 space-y-4">
              {suppliers.map((s) => (
                <Card key={s.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {s.supplier_name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            s.status
                          )}`}
                        >
                          {s.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {s.contact_person && (
                          <div>
                            <span className="text-gray-500">Contact:</span>
                            <p className="font-medium">{s.contact_person}</p>
                          </div>
                        )}
                        {s.email && (
                          <div>
                            <span className="text-gray-500">Email:</span>
                            <p className="font-medium truncate">{s.email}</p>
                          </div>
                        )}
                        {s.phone && (
                          <div>
                            <span className="text-gray-500">Phone:</span>
                            <p className="font-medium">{s.phone}</p>
                          </div>
                        )}
                        {s.specialization && (
                          <div>
                            <span className="text-gray-500">
                              Specialization:
                            </span>
                            <p className="font-medium">{s.specialization}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2 pt-2 border-t border-gray-200">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(s)}
                          className="flex-1 flex items-center justify-center space-x-1"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {suppliers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 text-gray-300">🏢</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Suppliers
                </h3>
                <p className="text-gray-600 mb-4">
                  Get started by adding your first supplier
                </p>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#4c735c] hover:bg-[#3a5a4a] text-white">
                      <Plus size={20} className="mr-2" />
                      Add First Supplier
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirmation Modal for Delete */}
        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          actionType="delete this supplier"
          setRemark={setRemark} // Even though not used for delete, keeping for consistency
        />
      </div>
    </div>
  );
};

export default SupplierManagement;
