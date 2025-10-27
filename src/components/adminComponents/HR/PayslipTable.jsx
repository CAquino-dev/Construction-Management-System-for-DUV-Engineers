import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/table";
import {
  Eye,
  MagnifyingGlass,
  FileText,
  Calendar,
  User,
} from "@phosphor-icons/react";
import { PayslipModal } from "./PayslipModal";
import PaginationComponent from "../Pagination";

export const PayslipTable = () => {
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [payslips, setPayslips] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPayslips, setFilteredPayslips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const openModal = (record) => {
    setSelectedPayslip(record);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPayslip(null);
    setIsModalOpen(false);
  };

  // Fetch payslips from API
  useEffect(() => {
    const getPayslips = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/hr/getPayslips`
        );
        const data = await response.json();
        if (response.ok) {
          const filtered = data.map((record) => ({
            id: record.id,
            title: record.title,
            remarks: record.remarks,
            start: record.period_start
              ? new Date(record.period_start).toLocaleDateString("en-CA")
              : "-",
            end: record.period_end
              ? new Date(record.period_end).toLocaleDateString("en-CA")
              : "-",
            created_at: record.created_at
              ? new Date(record.created_at).toLocaleDateString("en-CA")
              : "-",
            created_by: record.created_by_name,
          }));
          setPayslips(filtered);
          setFilteredPayslips(filtered);
        }
      } catch (error) {
        console.error("Error fetching payslips:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getPayslips();
  }, []);

  // Pagination Logic
  const itemsPerPage = 8;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayslips.length / itemsPerPage)
  );
  const currentData = filteredPayslips.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const filtered = payslips.filter(
      (payslip) =>
        payslip.title.toLowerCase().includes(e.target.value.toLowerCase()) ||
        payslip.created_by.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredPayslips(filtered);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (dateString === "-") return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/30 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Payslip Management
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            View and manage employee payslip records
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 sm:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlass size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by title or creator..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4c735c] focus:border-transparent bg-gray-50/50"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
              <FileText size={18} className="text-blue-600" />
              <span>{filteredPayslips.length} payslips found</span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4c735c]"></div>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden">
                {currentData.length > 0 ? (
                  currentData.map((record, index) => (
                    <div
                      key={record.id}
                      className="border-b border-gray-100 p-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="flex-shrink-0 w-8 h-8 bg-[#4c735c]/10 rounded-lg flex items-center justify-center">
                            <FileText size={16} className="text-[#4c735c]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">
                              {record.title}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">
                              {formatDate(record.start)} -{" "}
                              {formatDate(record.end)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => openModal(record)}
                          className="flex items-center gap-1 bg-[#4c735c] text-white px-3 py-1.5 rounded-lg hover:bg-[#5A8366] transition-colors text-xs ml-2 flex-shrink-0"
                        >
                          <Eye size={12} />
                          View
                        </button>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User size={14} />
                          <span className="truncate">
                            By: {record.created_by}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={14} />
                          <span>Created: {formatDate(record.created_at)}</span>
                        </div>

                        {record.remarks && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                            <span className="font-medium">Remarks: </span>
                            {record.remarks}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                    <FileText size={48} className="text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No Payslips Found
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {searchTerm
                        ? "No matching payslips found for your search."
                        : "No payslips available yet."}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="mt-3 text-[#4c735c] text-sm font-medium hover:text-[#5A8366]"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-[#4c735c] to-[#5A8366] hover:from-[#4c735c] hover:to-[#5A8366]">
                      <TableHead className="p-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <FileText size={16} />
                          Title
                        </div>
                      </TableHead>
                      <TableHead className="p-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          Period
                        </div>
                      </TableHead>
                      <TableHead className="p-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                        Created Date
                      </TableHead>
                      <TableHead className="p-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          Created By
                        </div>
                      </TableHead>
                      <TableHead className="p-4 text-center text-white font-semibold text-sm uppercase tracking-wider">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.length > 0 ? (
                      currentData.map((record, index) => (
                        <TableRow
                          key={record.id}
                          className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150"
                        >
                          <TableCell className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-[#4c735c]/10 rounded-lg flex items-center justify-center">
                                <FileText
                                  size={16}
                                  className="text-[#4c735c]"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-gray-900 truncate max-w-xs">
                                  {record.title}
                                </div>
                                {record.remarks && (
                                  <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                                    {record.remarks}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="p-4">
                            <div className="text-sm text-gray-700">
                              <div>{formatDate(record.start)}</div>
                              <div className="text-gray-400 text-xs">to</div>
                              <div>{formatDate(record.end)}</div>
                            </div>
                          </TableCell>
                          <TableCell className="p-4">
                            <div className="text-sm text-gray-700">
                              {formatDate(record.created_at)}
                            </div>
                          </TableCell>
                          <TableCell className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-[#4c735c] rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                                {record.created_by?.charAt(0) || "U"}
                              </div>
                              <span className="text-gray-700 truncate max-w-32">
                                {record.created_by}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="p-4 text-center">
                            <button
                              onClick={() => openModal(record)}
                              className="inline-flex items-center gap-2 bg-[#4c735c] text-white px-4 py-2 rounded-xl hover:bg-[#5A8366] transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                            >
                              <Eye size={16} />
                              View Details
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="p-8 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <FileText
                              size={48}
                              className="text-gray-400 mb-4"
                            />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                              No Payslips Found
                            </h3>
                            <p className="text-gray-500 max-w-md text-sm">
                              {searchTerm
                                ? "No matching payslips found for your search."
                                : "No payslips available yet."}
                            </p>
                            {searchTerm && (
                              <button
                                onClick={() => setSearchTerm("")}
                                className="mt-3 text-[#4c735c] font-medium hover:text-[#5A8366] text-sm"
                              >
                                Clear search
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {filteredPayslips.length > 0 && totalPages > 1 && (
          <div className="mt-6">
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}

        {/* Payslip Modal */}
        {isModalOpen && (
          <PayslipModal payslip={selectedPayslip} closeModal={closeModal} />
        )}
      </div>
    </div>
  );
};
