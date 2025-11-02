// EditEmployeeModal.jsx
import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { X } from "lucide-react";

export const EditEmployeeModal = ({ employee, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    full_name: employee.full_name || "",
    email: employee.email || "",
    job_title: employee.job_title || "",
    hourly_rate: employee.hourly_rate || "",
    emergency_name: employee.emergency_name || "",
    emergency_relationship: employee.emergency_relationship || "",
    emergency_contact: employee.emergency_contact || "",
  });

  console.log('employee id:', employee.user_id);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.job_title.trim()) {
      newErrors.job_title = "Job title is required";
    }

    if (!formData.hourly_rate || parseFloat(formData.hourly_rate) <= 0) {
      newErrors.hourly_rate = "Hourly rate must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-8 duration-300 flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-[#4c735c] to-[#5A8366] shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Edit Employee</h2>
            <p className="text-white/80 text-sm mt-1">
              Update employee information
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-white hover:bg-white/20 rounded-lg"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Information Card */}
            <Card className="border-0 shadow-sm bg-gray-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#4c735c] rounded-full"></div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                      Full Name *
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className={`w-full transition-colors ${
                        errors.full_name ? "border-red-500 focus:border-red-500" : "focus:border-[#4c735c]"
                      }`}
                      placeholder="Enter full name"
                    />
                    {errors.full_name && (
                      <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full transition-colors ${
                        errors.email ? "border-red-500 focus:border-red-500" : "focus:border-[#4c735c]"
                      }`}
                      placeholder="employee@company.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job_title" className="text-sm font-medium text-gray-700">
                      Job Title *
                    </Label>
                    <Input
                      id="job_title"
                      name="job_title"
                      value={formData.job_title}
                      onChange={handleChange}
                      className={`w-full transition-colors ${
                        errors.job_title ? "border-red-500 focus:border-red-500" : "focus:border-[#4c735c]"
                      }`}
                      placeholder="e.g., Software Engineer, Marketing Manager"
                    />
                    {errors.job_title && (
                      <p className="text-red-500 text-xs mt-1">{errors.job_title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourly_rate" className="text-sm font-medium text-gray-700">
                      Hourly Rate (₱) *
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ₱
                      </span>
                      <Input
                        id="hourly_rate"
                        name="hourly_rate"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.hourly_rate}
                        onChange={handleChange}
                        className={`w-full pl-8 transition-colors ${
                          errors.hourly_rate ? "border-red-500 focus:border-red-500" : "focus:border-[#4c735c]"
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.hourly_rate && (
                      <p className="text-red-500 text-xs mt-1">{errors.hourly_rate}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact Card */}
            <Card className="border-0 shadow-sm bg-gray-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_name" className="text-sm font-medium text-gray-700">
                      Contact Name
                    </Label>
                    <Input
                      id="emergency_name"
                      name="emergency_name"
                      value={formData.emergency_name}
                      onChange={handleChange}
                      className="w-full focus:border-[#4c735c] transition-colors"
                      placeholder="Enter contact name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency_relationship" className="text-sm font-medium text-gray-700">
                      Relationship
                    </Label>
                    <Input
                      id="emergency_relationship"
                      name="emergency_relationship"
                      value={formData.emergency_relationship}
                      onChange={handleChange}
                      className="w-full focus:border-[#4c735c] transition-colors"
                      placeholder="e.g., Spouse, Parent"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact" className="text-sm font-medium text-gray-700">
                      Contact Number
                    </Label>
                    <Input
                      id="emergency_contact"
                      name="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={handleChange}
                      className="w-full focus:border-[#4c735c] transition-colors"
                      placeholder="+63 XXX XXX XXXX"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Fixed Footer with Action Buttons */}
        <div className="border-t border-gray-100 bg-white p-6 shrink-0">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="px-6 py-2 bg-[#4c735c] text-white hover:bg-[#5A8366] transition-colors shadow-sm"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};