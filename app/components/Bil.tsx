"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Router
} from "lucide-react";

// ---- TYPES ----
interface Bill {
  id: string;
  name: string;
  title?: string;
  amount: string;
  dueDate?: string;
  category: string;
  status?: "pending" | "paid" | "overdue";
}

export default function Bil() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // ---- Fetch Bills from API ----
  useEffect(() => {
    const fetchBills = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/user/bills`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await response.json();

        if (result.success && result.data) {
          setBills(result.data.bills || []);
        }
      } catch (error) {
        console.error("Error fetching bills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  // ---- Helper to format 'dueIn' text ----
  const getDueInText = (dueDate?: string, status?: string) => {
    if (status === 'paid') return "Paid";
    if (!dueDate) return "Unknown";
    const daysLeft = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 3600 * 24));
    return daysLeft <= 0 ? "Overdue" : `${daysLeft} days`;
  };

  // ---- Loading State ----
  if (loading) {
    return (
      <div className="min-h-screen bg-[#C4F8FD] from-blue-200 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center text-cyan-700">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="font-bold text-lg">Loading bills...</p>
        </div>
      </div>
    );
  }

  // ---- Empty State ----
  if (bills.length === 0) {
    return (
      <div className="min-h-screen bg-[#C4F8FD] from-blue-200 via-cyan-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center bg-white/40 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-cyan-200/30 max-w-md">
          <Calendar size={48} className="text-cyan-600/60 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-cyan-800 mb-2">No Bills Found</h2>
          <p className="text-cyan-600 font-medium mb-4">You currently have no upcoming or past bills.</p>
        </div>
      </div>
    );
  }

  // ---- Render Bill Grid ----
  return (
    <div className="min-h-screen bg-[#C4F8FD] p-4 sm:p-6 lg:p-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-700">My Bills</h1>
          <span className="text-sm text-cyan-700 bg-white/40 px-3 py-1 rounded-full backdrop-blur-sm shadow-xl">
            {bills.length} {bills.length === 1 ? 'Bill' : 'Bills'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.map((bill, index) => {
            const dueInText = getDueInText(bill.dueDate, bill.status);
            const isPaid = bill.status === 'paid';
            
            // Dynamic gradient based on status
            let cardGradient = "from-amber-400/20 via-yellow-400/10 to-orange-400/20";
            let iconColor = "text-amber-600";
            if (isPaid) {
              cardGradient = "from-emerald-400/20 via-green-400/10 to-teal-400/20";
              iconColor = "text-emerald-600";
            } else if (dueInText === "Overdue") {
              cardGradient = "from-red-400/20 via-rose-400/10 to-pink-400/20";
              iconColor = "text-red-600";
            }

            return (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                className={`rounded-2xl bg-none ${cardGradient} p-5 backdrop-blur-sm border-none
                 cursor-pointer hover:shadow-2xl transition-all duration-300 relative overflow-hidden group`}
                // onClick={() => {
                //   // Handle payment action here (you can route to a payment page or open a modal)
                //   if (!isPaid) {
                //     alert(`generating payment details for: ${bill.name}`);
                //   }
                // }}
              >
                {/* Decorative Circle */}
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2 shadow-xl bg-white/40 ${iconColor}`}>
                      {isPaid ? <CheckCircle size={20} /> : <Calendar size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-700 truncate max-w-[140px]">
                        {bill.name || bill.title || "Unnamed Bill"}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{bill.category || "General"}</p>
                    </div>
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 rounded-full bg-white/30 backdrop-blur-sm ${
                    isPaid ? 'text-emerald-700' : dueInText === 'Overdue' ? 'text-red-700' : 'text-amber-700'
                  }`}>
                    {dueInText}
                  </div>
                </div>

                <div className="flex items-end justify-between mt-4 pt-3 border-t border-white/20">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Amount</p>
                    <p className="text-xl font-bold text-slate-700">
                    ${typeof bill.amount === 'number' ? `${(bill.amount as number).toFixed(2)}` : bill.amount || "0.00"}
                      {/* ${typeof bill.amount === 'number' ? `$${bill.amount.toFixed(2)}` : bill.amount || "$0.00"} */}
                    </p>
                  </div>
                  {!isPaid && (
                    <motion.div
                      whileHover={{ x: 4 }}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the parent card's onClick from also firing
                        router.push('/Dashboard?openFunds=true');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          router.push('/Dashboard?openFunds=true');
                        }
                      }}
                      className="flex cursor-pointer items-center gap-1 text-cyan-600 font-bold text-sm group-hover:text-cyan-700 transition-colors"
                    >
                      Pay Now
                      <ArrowRight size={16} />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}


