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
import { toast } from "sonner";

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

  // --- fetch suppliers ---
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/procurement/getSuppliers`);
      setSuppliers(res.data);
    } catch (err) {
        console.error('failed to get suppliers', err);
    }
  };

  // --- handle form input ---
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- handle add or update ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/procurement/updateSupplier/${editingId}`,
          form
        );
        toast.success("Supplier updated successfully!");
      } else {
        await axios.post(`${import.meta.env.VITE_REACT_APP_API_URL}/api/procurement/addSupplier`, form);
        toast.success("Supplier added successfully!");
      }
      fetchSuppliers();
      setIsOpen(false);
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
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    }
  };

  const handleEdit = (supplier) => {
    setForm(supplier);
    setEditingId(supplier.id);
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?"))
      return;
    try {
      await axios.delete(`${import.meta.env.VITE_REACT_APP_API_URL}/api/procurement/deleteSupplier/${id}`);
      toast.success("Supplier deleted!");
      fetchSuppliers();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed!");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Supplier Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm({ status: "Active" })}>
              + Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Supplier" : "Add New Supplier"}
              </DialogTitle>
            </DialogHeader>

            <form className="space-y-3" onSubmit={handleSubmit}>
              <Input
                name="supplier_name"
                placeholder="Supplier Name"
                value={form.supplier_name}
                onChange={handleChange}
                required
              />
              <Input
                name="contact_person"
                placeholder="Contact Person"
                value={form.contact_person}
                onChange={handleChange}
              />
              <Input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
              />
              <Input
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
              />
              <Input
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
              />
              <Input
                name="specialization"
                placeholder="Specialization"
                value={form.specialization}
                onChange={handleChange}
              />
              <select
                name="status"
                className="w-full border rounded p-2"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingId ? "Update" : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="border rounded-md shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.supplier_name}</TableCell>
                <TableCell>{s.contact_person}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>{s.phone}</TableCell>
                <TableCell>{s.specialization}</TableCell>
                <TableCell>{s.status}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(s)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(s.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SupplierManagement;
