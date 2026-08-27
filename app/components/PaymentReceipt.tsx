"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  CheckCircle, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  CalendarDays, 
  Hash, 
  CreditCard, 
  Bitcoin, 
  Landmark, 
  ArrowLeft 
} from "lucide-react";

interface PaymentReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: {
    id: string;
    date: string;
    status: "Success" | "Pending" | "Failed";
    method: "Bank Transfer" | "Crypto" | "Card";
    paymentDetails: string;
    amount: string;
    fee: string;
    total: string;
    reference?: string;
  };
}

export default function PaymentReceipt({ isOpen, onClose, receipt }: PaymentReceiptProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    
    // Create a plain text version of the receipt
    const receiptText = `
      ==============================
          PAYMENT RECEIPT
      ==============================
      Status: ${receipt.status}
      Date: ${receipt.date}
      Transaction ID: ${receipt.id}
      Method: ${receipt.method}
      Payment Details: ${receipt.paymentDetails}
      Amount: ${receipt.amount}
      Fee: ${receipt.fee}
      Total: ${receipt.total}
      Reference: ${receipt.reference}
    `;
  
    // Create a Blob (file-like object)
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
  
    // Create an invisible link to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payment_Receipt_${receipt.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  
    // Clean up
    window.URL.revokeObjectURL(url);
  
    setTimeout(() => setIsDownloading(false), 1000);
  };

  const getMethodIcon = () => {
    switch (receipt.method) {
      case "Card":
        return <CreditCard className="h-4 w-4 text-cyan-600" />;
      case "Crypto":
        return <Bitcoin className="h-4 w-4 text-orange-500" />;
      default:
        return <Landmark className="h-4 w-4 text-cyan-600" />;
    }
  };

  const statusColor = {
    Success: "bg-emerald-500/20 text-emerald-700",
    Pending: "bg-amber-500/20 text-amber-700",
    Failed: "bg-red-500/20 text-red-700",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Gradient */}
            <div className="relative bg-[#C4F8FD] px-6 py-6 text-cyan-900">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-cyan-100">Payment Receipt</p>
                  <h2 className="text-2xl font-bold mt-1">
                    {receipt.status === "Success" ? "Payment Successful" : receipt.status}
                  </h2>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  {receipt.status === "Success" ? (
                    <CheckCircle size={26} />
                  ) : (
                    <CalendarDays size={26} />
                  )}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 bg-[#C4F8FD]">
              {/* Status Badge */}
              <div className="flex justify-center">
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold ${statusColor[receipt.status]}`}>
                  <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                  {receipt.status}
                </span>
              </div>

              {/* Amount */}
              <div className="text-center">
                <p className="text-xs text-slate-500 font-medium">Total Paid</p>
                <p className="text-4xl font-extrabold text-slate-900 mt-1">{receipt.total}</p>
                <p className="text-xs text-slate-400 mt-1">Including {receipt.fee} processing fee</p>
              </div>

              {/* Details */}
              <div className="rounded-xl border-none bg-[#C4F8FD] shadow-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <Hash size={14} className="text-slate-400" /> Transaction ID
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-slate-900 truncate max-w-[150px]">{receipt.id}</span>
                    <button onClick={() => handleCopy(receipt.id)} className="text-slate-400 hover:text-slate-700">
                      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Date</span>
                  <span className="font-semibold text-sm text-slate-900">{receipt.date}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Method</span>
                  <span className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                    {getMethodIcon()}
                    {receipt.method}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Payment Details</span>
                  <span className="font-mono text-xs text-slate-900 truncate max-w-[180px]">{receipt.paymentDetails}</span>
                </div>

                {receipt.reference && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Reference</span>
                    <span className="font-mono text-xs text-slate-900">{receipt.reference}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  {isDownloading ? (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  {isDownloading ? "Downloading..." : "Receipt"}
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 rounded-xl bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700 border border-cyan-200 hover:bg-cyan-100 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Close
                </button>
              </div>

              <p className="text-center text-[10px] text-slate-400 pt-2">
                This is a system-generated receipt and does not require a signature.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}