import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";
import { 
  User, 
  Calendar, 
  CoinVertical, 
  CheckCircle, 
  Clock, 
  X,
  Eye,
  Receipt,
  Signature,
  ClockCounterClockwise,
  FileText
} from "@phosphor-icons/react";

const SalaryReleaseInPerson = () => {
  const [releasedPayslips, setReleasedPayslips] = useState([]);
  const [paidPayslips, setPaidPayslips] = useState([]);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Released");
  const sigPad = useRef(null);
  const [message, setMessage] = useState("");

  const userId = localStorage.getItem('userId');

  const fetchReleasedPayslips = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/getReleasedPayslips`
      );
      if (res.data.success) {
        // Transform the data for released payslips
        const transformedData = res.data.data.flatMap((payslip) =>
          payslip.items.map((item) => ({
            id: item.payslip_item_id,
            employee_name: item.employee_name,
            period_start: payslip.period_start,
            period_end: payslip.period_end,
            amount: item.final_salary,
            payment_status: item.payment_status,
            signature: null,
            payslip_id: payslip.payslip_id,
            title: payslip.title,
            payslip_created_at: payslip.payslip_created_at,
            created_by_name: payslip.created_by_name,
            paid_by_name: payslip.paid_by_name,
            payroll_id: item.payroll_id,
            total_hours_worked: item.total_hours_worked,
            calculated_salary: item.calculated_salary,
            overtime_pay: item.overtime_pay,
            philhealth_deduction: item.philhealth_deduction,
            sss_deduction: item.sss_deduction,
            pagibig_deduction: item.pagibig_deduction,
            total_deductions: item.total_deductions,
            hr_status: item.hr_status,
            finance_status: item.finance_status,
          }))
        );
        setReleasedPayslips(transformedData);
      }
    } catch (err) {
      console.error("Error fetching released payslips:", err);
    }
  };

  const fetchPaidPayslips = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/getPaidPayslips`
      );
      if (res.data.success) {
        // Transform the data for paid payslips (already in flat structure)
        const transformedData = res.data.data.map((item) => ({
          id: item.payslip_item_id,
          employee_name: item.employee_name,
          period_start: item.period_start,
          period_end: item.period_end,
          amount: item.final_salary,
          payment_status: item.payment_status,
          signature: item.signature_url,
          payslip_id: item.payslip_id,
          title: item.title,
          payslip_created_at: item.payslip_created_at,
          created_by_name: item.created_by_name,
          paid_by_name: item.paid_by_name,
          payroll_id: item.payroll_id,
          total_hours_worked: item.total_hours_worked,
          calculated_salary: item.calculated_salary,
          overtime_pay: item.overtime_pay,
          philhealth_deduction: item.philhealth_deduction,
          sss_deduction: item.sss_deduction,
          pagibig_deduction: item.pagibig_deduction,
          total_deductions: item.total_deductions,
          hr_status: item.hr_status,
          finance_status: item.finance_status,
          signature_url: item.signature_url,
          paid_by: item.paid_by,
        }));
        setPaidPayslips(transformedData);
      }
    } catch (err) {
      console.error("Error fetching paid payslips:", err);
    }
  };

  const fetchAllPayslips = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchReleasedPayslips(), fetchPaidPayslips()]);
    } catch (err) {
      console.error("Error fetching payslips:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPayslips();
  }, []);

  const handleOpenModal = (payslip) => {
    setSelectedPayslip(payslip);
    setMessage("");
  };

  const handleCloseModal = () => {
    setSelectedPayslip(null);
    setMessage("");
  };

  const clearSignature = () => sigPad.current && sigPad.current.clear();

  const handleSubmitSignature = async () => {
    if (sigPad.current.isEmpty()) {
      setMessage("Please provide a signature before submitting.");
      return;
    }

    const canvas = sigPad.current.getCanvas();
    const dataURL = canvas.toDataURL("image/png");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/salary/paySalary`,
        {
          payslipItemId: selectedPayslip.id,
          base64Signature: dataURL,
          userId
        }
      );

      if (res.status === 200) {
        await fetchAllPayslips();
        setMessage("✅ Salary paid and signature recorded successfully!");
        setTimeout(() => {
          handleCloseModal();
        }, 2000);
      } else {
        setMessage("❌ Failed to record salary payment.");
      }
    } catch (err) {
      console.error("Error submitting salary:", err);
      setMessage("❌ Error processing salary payment.");
    }
  };

  const getStatusIcon = (status) => {
    return status === "Paid" ? 
      <CheckCircle size={16} weight="fill" /> : 
      <Clock size={16} weight="fill" />;
  };

  const getStatusColor = (status) => {
    return status === "Paid" ? 
      "bg-green-100 text-green-800 border-green-200" : 
      "bg-amber-100 text-amber-800 border-amber-200";
  };

  // Get payslips based on active tab
  const filteredPayslips = activeTab === "Released" ? releasedPayslips : paidPayslips;

  // Count statistics
  const releasedCount = releasedPayslips.length;
  const paidCount = paidPayslips.length;
  const pendingCount = releasedPayslips.length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Receipt size={32} className="text-[#4c735c]" weight="duotone" />
          <h1 className="text-3xl font-bold text-gray-900">Salary Management</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Manage salary distribution and track payment history
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("Released")}
              className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                activeTab === "Released"
                  ? "border-[#4c735c] text-[#4c735c]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText size={20} />
                <span>Ready for Release ({releasedCount})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("Paid")}
              className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                activeTab === "Paid"
                  ? "border-[#4c735c] text-[#4c735c]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ClockCounterClockwise size={20} />
                <span>Payment History ({paidCount})</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ready for Release</p>
              <p className="text-2xl font-bold text-gray-900">{releasedCount}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payment</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Clock size={24} className="text-amber-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-gray-900">{paidCount}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {activeTab === "Released" ? "Payslips Ready for Release" : "Payment History"}
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4c735c] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payslips...</p>
          </div>
        ) : filteredPayslips.length === 0 ? (
          <div className="p-12 text-center">
            {activeTab === "Released" ? (
              <>
                <FileText size={64} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No payslips ready for release</p>
                <p className="text-gray-400">Payslips awaiting release will appear here</p>
              </>
            ) : (
              <>
                <ClockCounterClockwise size={64} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No payment history found</p>
                <p className="text-gray-400">Completed payments will appear here</p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  {activeTab === "Paid" && (
                    <>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paid By
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created By
                      </th>
                    </>
                  )}
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayslips.map((payslip) => (
                  <tr key={payslip.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-[#4c735c] rounded-full flex items-center justify-center">
                          <User size={20} className="text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {payslip.employee_name}
                          </div>
                          {activeTab === "Paid" && (
                            <div className="text-xs text-gray-500">
                              Payroll ID: {payslip.payroll_id}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        {new Date(payslip.period_start).toLocaleDateString()} - {" "}
                        {new Date(payslip.period_end).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-semibold text-gray-900">
                        <CoinVertical size={16} className="mr-1 text-gray-400" />
                        ₱{parseFloat(payslip.amount).toLocaleString()}
                      </div>
                    </td>
                    {activeTab === "Paid" && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payslip.paid_by_name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payslip.created_by_name}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(payslip.payment_status)}`}>
                        {getStatusIcon(payslip.payment_status)}
                        <span className="ml-1.5">{payslip.payment_status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(payslip)}
                        className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                          payslip.payment_status === "Paid"
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : "bg-[#4c735c] text-white hover:bg-[#3a5a47]"
                        }`}
                      >
                        <Eye size={16} className="mr-2" />
                        {payslip.payment_status === "Paid" ? "View Details" : "Process Payment"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#4c735c] rounded-lg">
                  <Receipt size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedPayslip.payment_status === "Paid" ? "Payment Details - " : "Salary Payment - "}
                    {selectedPayslip.employee_name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {selectedPayslip.payment_status === "Paid" ? "View payment history" : "Process salary distribution"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Payslip Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={16} className="mr-2" />
                    <span>Pay Period</span>
                  </div>
                  <p className="font-medium">
                    {new Date(selectedPayslip.period_start).toLocaleDateString()} - {" "}
                    {new Date(selectedPayslip.period_end).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CoinVertical size={16} className="mr-2" />
                    <span>Amount</span>
                  </div>
                  <p className="text-lg font-bold text-[#4c735c]">
                    ₱{parseFloat(selectedPayslip.amount).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Additional details for Paid tab */}
              {selectedPayslip.payment_status === "Paid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Created By</div>
                    <p className="font-medium">{selectedPayslip.created_by_name}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Paid By</div>
                    <p className="font-medium">{selectedPayslip.paid_by_name || "N/A"}</p>
                  </div>
                  {selectedPayslip.signature_url && (
                    <div className="md:col-span-2 space-y-2">
                      <div className="text-sm text-gray-600">Signature</div>
                      <div className="p-2 bg-white rounded border">
                        <img 
                          src={`${import.meta.env.VITE_REACT_APP_API_URL}${selectedPayslip.signature_url}`} 
                          alt="Employee Signature" 
                          className="max-w-full h-20 object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Payment Status:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPayslip.payment_status)}`}>
                  {getStatusIcon(selectedPayslip.payment_status)}
                  <span className="ml-2">{selectedPayslip.payment_status}</span>
                </span>
              </div>

              {/* Signature Section - Only show for Released payslips */}
              {selectedPayslip.payment_status !== "Paid" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Signature size={20} className="text-[#4c735c]" />
                    <h3 className="text-lg font-semibold text-gray-900">Employee Signature</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Please have the employee sign below to confirm receipt of salary
                  </p>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-white">
                    <SignatureCanvas
                      penColor="#1f2937"
                      ref={sigPad}
                      canvasProps={{
                        width: 550,
                        height: 200,
                        className: "w-full h-50 border border-gray-200 rounded-lg bg-white signature-canvas",
                      }}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={clearSignature}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      Clear Signature
                    </button>
                    <button
                      onClick={handleSubmitSignature}
                      className="flex-1 px-4 py-3 bg-[#4c735c] text-white rounded-xl hover:bg-[#3a5a47] transition-colors font-medium"
                    >
                      Confirm Payment
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 bg-green-50 rounded-xl">
                  <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Payment Completed</h3>
                  <p className="text-green-600">Salary has been successfully paid and documented</p>
                </div>
              )}

              {/* Message */}
              {message && (
                <div className={`p-4 rounded-xl ${
                  message.includes("✅") || message.includes("successfully") 
                    ? "bg-green-50 text-green-800 border border-green-200" 
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryReleaseInPerson;