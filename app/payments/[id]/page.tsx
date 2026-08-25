// app/payments/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Send,
  Loader2,
} from "lucide-react";

// ---- TYPES ----
interface Bill {
  id: string;
  name: string;
  title?: string;
  dueIn: string;
  dueDate?: string;
  amount: string;
  category: string;
  status?: "pending" | "paid" | "overdue";
}

export default function BillPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const billId = params.id as string;

  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // ---- Fetch Real Bill Data from API ----
  useEffect(() => {
    const fetchBill = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/user/bills`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();

        if (result.success && result.data) {
          // Find the specific bill from the user's fetched bills array
          const foundBill = result.data.bills.find((b: any) => b.id === billId);
          
          if (foundBill) {
            // Calculate dueIn text to display on the page
            let dueInText = "Unknown";
            if (foundBill.dueDate) {
              const daysLeft = Math.ceil((new Date(foundBill.dueDate).getTime() - Date.now()) / (1000 * 3600 * 24));
              dueInText = daysLeft <= 0 ? "Overdue" : `${daysLeft} days`;
            }

            setBill({
              id: foundBill.id,
              name: foundBill.name || foundBill.title || "Unnamed Bill",
              dueIn: foundBill.status === 'paid' ? 'Paid' : dueInText,
              dueDate: foundBill.dueDate,
              amount: typeof foundBill.amount === 'number' ? `$${foundBill.amount.toFixed(2)}` : foundBill.amount || "$0.00",
              category: foundBill.category || "General",
              status: foundBill.status || "pending",
            });
            setAmount(typeof foundBill.amount === 'number' ? foundBill.amount.toFixed(2) : foundBill.amount?.replace('$', '') || "0.00");
          }
        }
      } catch (error) {
        console.error("Error fetching bill details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (billId) {
      fetchBill();
    }
  }, [billId]);

  // ---- Payment Handler ----
  const handlePayment = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    alert(`Payment of $${amount} successful!`);
    router.push('/Bills');
  };

  // ---- Loading State ----
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center text-cyan-700">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="font-bold text-lg">Loading bill details...</p>
        </div>
      </div>
    );
  }

  // ---- Bill Not Found State ----
  if (!bill) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center bg-white/40 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-cyan-200/30">
          <AlertCircle size={56} className="text-cyan-600/60 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-cyan-800 mb-2">Bill Not Found</h2>
          <p className="text-cyan-600 font-medium mb-6">We couldn't find the bill you are looking for.</p>
          <button
            onClick={() => router.back()}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-xl hover:shadow-2xl transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ---- Render ----
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl w-full">
        
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-cyan-700 hover:text-cyan-900 font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
          Back to Bills
        </motion.button>

        {/* Bill Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-br from-[#C4F8FD] via-[#B0F0F8] to-[#9AE8F2] p-6 md:p-8 shadow-2xl border-none"
        >
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-700">{bill.name}</h1>
              <p className="text-sm text-cyan-700/80 font-medium">{bill.category}</p>
            </div>
            
            {/* Status Badge */}
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-md ${
              bill.status === 'paid' 
                ? 'bg-emerald-500/30 text-emerald-700 border border-emerald-400/50' 
                : bill.status === 'overdue'
                ? 'bg-red-500/30 text-red-700 border border-red-400/50'
                : 'bg-amber-500/30 text-amber-700 border border-amber-400/50'
            }`}>
              {bill.status === 'paid' ? 'Paid' : bill.status === 'overdue' ? 'Overdue' : 'Pending'}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-cyan-200/30">
              <div className="flex items-center gap-2 text-cyan-700/70 mb-1">
                <DollarSign size={18} />
                <span className="text-xs font-bold">Amount</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-slate-700">{bill.amount}</p>
            </div>
            
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-cyan-200/30">
              <div className="flex items-center gap-2 text-cyan-700/70 mb-1">
                <Clock size={18} />
                <span className="text-xs font-bold">Due</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-slate-700">
                {bill.status === 'paid' ? 'Paid' : bill.dueIn}
              </p>
            </div>
          </div>

          {/* Payment Action Section */}
          {bill.status !== 'paid' ? (
            <div className="border-t border-cyan-200/30 pt-6">
              <h2 className="text-sm font-bold text-slate-600 mb-4">Make a Payment</h2>
              
              <div className="space-y-4">
                {/* Amount Input */}
                <div>
                  <label className="text-xs font-bold text-cyan-700/80 block mb-1">
                    Amount (USD)
                  </label>
                  <div className="relative shadow-inner">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-lg">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full rounded-xl border border-cyan-300/50 bg-white/60 px-4 py-3 pl-8 text-slate-700 font-bold placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-sm transition-all"
                    />
                  </div>
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap gap-2">
                  {[10, 25, 50, 100].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset.toFixed(2))}
                      className="flex-1 min-w-[60px] rounded-lg bg-white/40 backdrop-blur-sm px-3 py-2 text-xs font-bold text-cyan-700 hover:bg-white/70 transition-all shadow-sm border border-cyan-200/30"
                    >
                      ${preset}
                    </button>
                  ))}
                </div>

                {/* Pay Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 font-extrabold text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-2 text-lg">
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Pay Now
                      </>
                    )}
                  </span>
                </motion.button>
              </div>
            </div>
          ) : (
            /* Paid Status Footer */
            <div className="border-t border-cyan-200/30 pt-6">
              <div className="flex items-center justify-center gap-3 text-emerald-600 bg-emerald-500/10 rounded-xl py-4 px-4 shadow-inner">
                <CheckCircle size={28} className="text-emerald-500" />
                <span className="text-base font-bold">This bill has been paid</span>
              </div>
            </div>
          )}
        </motion.div>
      </div> 
    </div>
  );
}