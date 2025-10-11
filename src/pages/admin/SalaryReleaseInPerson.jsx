import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";

const SalaryReleaseInPerson = () => {
  const [payslips, setPayslips] = useState([]);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const sigPad = useRef(null);
  const [message, setMessage] = useState("");

  const userId = localStorage.getItem('userId');

        const fetchPayslips = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/finance/getReleasedPayslips`
        );
        if (res.data.success) {
          const items = res.data.data.flatMap((ps) =>
            ps.items.map((item) => ({
              id: item.payslip_item_id,
              employee_name: item.employee_name,
              period_start: ps.period_start,
              period_end: ps.period_end,
              amount: item.final_salary,
              payment_status: item.payment_status,
              signature: null,
            }))
          );
          setPayslips(items);
        }
      } catch (err) {
        console.error("Error fetching payslips:", err);
      }
    };

  // Fetch released payslips from backend
  useEffect(() => {
    fetchPayslips();
  }, []);

  const handleOpenModal = (payslip) => {
    setSelectedPayslip(payslip);
    setMessage("");
  };

  const handleCloseModal = () => {
    setSelectedPayslip(null);
    setMessage("");
  };

  const clearSignature = () => sigPad.current.clear();

  const handleSubmitSignature = async () => {
    if (sigPad.current.isEmpty()) {
      alert("Please sign before submitting.");
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
        await fetchPayslips();
        setMessage("✅ Salary paid and signature recorded.");
        } else {
        setMessage("❌ Failed to record salary payment.");
        }
    } catch (err) {
      console.error("Error submitting salary:", err);
      setMessage("❌ Error submitting salary.");
    }
  };

  return (
    <div className="mt-20 p-6 max-w-5xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Released Payslips</h1>

      {/* Table of Released Payslips */}
      <table className="w-full border-collapse border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Employee</th>
            <th className="border px-4 py-2">Period</th>
            <th className="border px-4 py-2">Amount</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {payslips.map((p) => (
            <tr key={p.id}>
              <td className="border px-4 py-2">{p.employee_name}</td>
              <td className="border px-4 py-2">
                {new Date(p.period_start).toLocaleDateString()} -{" "}
                {new Date(p.period_end).toLocaleDateString()}
              </td>
              <td className="border px-4 py-2">₱{p.amount.toLocaleString()}</td>
              <td className="border px-4 py-2">
                <span
                  className={`px-2 py-1 rounded text-white ${
                    p.payment_status === "Paid"
                      ? "bg-green-600"
                      : "bg-yellow-500"
                  }`}
                >
                  {p.payment_status}
                </span>
              </td>
              <td className="border px-4 py-2">
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => handleOpenModal(p)}
                >
                  View / Pay
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-[600px] relative">
            <h2 className="text-xl font-bold mb-4">
              Payslip for {selectedPayslip.employee_name}
            </h2>

            <p>
              <strong>Period:</strong>{" "}
              {new Date(selectedPayslip.period_start).toLocaleDateString()} -{" "}
              {new Date(selectedPayslip.period_end).toLocaleDateString()}
            </p>
            <p>
              <strong>Amount:</strong> ₱
              {selectedPayslip.amount.toLocaleString()}
            </p>
            <p className="mb-4">
              <strong>Status:</strong>{" "}
              <span
                className={`px-2 py-1 rounded text-white ${
                  selectedPayslip.payment_status === "Paid"
                    ? "bg-green-600"
                    : "bg-yellow-500"
                }`}
              >
                {selectedPayslip.payment_status}
              </span>
            </p>

            {/* Signature */}
            {selectedPayslip.payment_status !== "Paid" ? (
              <div className="border p-4 bg-gray-50 rounded">
                <p className="mb-2 font-medium">
                  Employee Signature (salary received)
                </p>
                <SignatureCanvas
                  penColor="black"
                  ref={sigPad}
                  canvasProps={{
                    width: 500,
                    height: 200,
                    className: "border border-black",
                  }}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    className="bg-gray-300 px-3 py-1 rounded"
                    onClick={clearSignature}
                  >
                    Clear
                  </button>
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={handleSubmitSignature}
                  >
                    Submit Signature
                  </button>
                </div>
              </div>
            ) : (
              selectedPayslip.signature && (
                <div className="mt-4">
                  <p className="font-medium mb-2">Employee Signature:</p>
                  <img
                    src={selectedPayslip.signature}
                    alt="Signature"
                    className="border w-[300px]"
                  />
                </div>
              )
            )}

            {message && (
              <p className="text-green-600 font-medium mt-4">{message}</p>
            )}

            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryReleaseInPerson;
