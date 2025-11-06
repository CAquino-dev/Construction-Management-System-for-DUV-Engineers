import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import ConfirmationModal from "../../components/adminComponents/ConfirmationModal";

const SupplierQuotePage = () => {
  const { token } = useParams();
  const [quoteData, setQuoteData] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/procurement/getQuoteByToken/${token}`
        );
        setQuoteData(res.data.quote);
      } catch (err) {
        console.error(err);
        toast.error("Invalid or expired quotation link.");
      }
    };
    fetchQuote();
  }, [token]);

  const handlePriceChange = (itemId, value) => {
    setFormData((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleSubmit = async () => {
    if (!quoteData) return;
    setSubmitting(true);

    const formattedData = Object.entries(formData).map(([id, unit_price]) => ({
      mto_id: id,
      id,
      unit_price: parseFloat(unit_price),
    }));

    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/procurement/submitSupplierQuote/${token}`,
        {
          items: formattedData,
        }
      );
      toast.success("Quotation submitted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit quotation.");
    } finally {
      setSubmitting(false);
    }
  };

  // Compute total per item and grand total
  const totals = useMemo(() => {
    if (!quoteData?.items) return { itemTotals: {}, grandTotal: 0 };
    const itemTotals = {};
    let grandTotal = 0;

    quoteData.items.forEach((item) => {
      const unitPrice = parseFloat(formData[item.id] || 0);
      const total = item.quantity * unitPrice;
      itemTotals[item.id] = total;
      grandTotal += total;
    });

    return { itemTotals, grandTotal };
  }, [quoteData, formData]);

  if (!quoteData)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading quotation details...</p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 mt-20">
      <Card className="shadow-md border">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">
            Quotation Submission – {quoteData.supplier_name}
          </h1>
          <p className="text-center text-gray-500">
            Please input your offered unit prices. Totals will be calculated
            automatically.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold capitalize">
              {quoteData.milestone_title}
            </h2>
            <p className="text-sm text-gray-600">
              {quoteData.milestone_details}
            </p>
          </div>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Item</th>
                <th className="border p-2 text-center">Quantity</th>
                <th className="border p-2 text-center">Unit</th>
                <th className="border p-2 text-center">Unit Price (₱)</th>
                <th className="border p-2 text-center">Total (₱)</th>
              </tr>
            </thead>
            <tbody>
              {quoteData.items.map((item) => (
                <tr key={item.id}>
                  <td className="border p-2">{item.material_name}</td>
                  <td className="border p-2 text-center">{item.quantity}</td>
                  <td className="border p-2 text-center">{item.unit}</td>
                  <td className="border p-2 text-center">
                    <input
                      type="number"
                      step="0.01"
                      className="border rounded px-2 py-1 w-28 text-right"
                      value={formData[item.id] || ""}
                      onChange={(e) =>
                        handlePriceChange(item.id, e.target.value)
                      }
                    />
                  </td>
                  <td className="border p-2 text-right">
                    {totals.itemTotals[item.id]?.toLocaleString("en-PH", {
                      style: "currency",
                      currency: "PHP",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold bg-gray-50">
                <td colSpan="4" className="border p-2 text-right">
                  Grand Total:
                </td>
                <td className="border p-2 text-right text-blue-700">
                  {totals.grandTotal.toLocaleString("en-PH", {
                    style: "currency",
                    currency: "PHP",
                  })}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="flex justify-end pt-4">
            <Button
              disabled={submitting}
              onClick={() => setIsSubmitModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? "Submitting..." : "Submit Quotation"}
            </Button>
          </div>
        </CardContent>
        <ConfirmationModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          onConfirm={() => {
            handleSubmit();
            setIsSubmitModalOpen(false);
          }}
          actionType="Submit Quotation"
        />
      </Card>
    </div>
  );
};

export default SupplierQuotePage;
