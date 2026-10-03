"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, X, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";

export type BlockType =
  | "unpaid_bills"
  | "insufficient_funds"
  | "account_inactive"
  | "general";

export interface BlockBill {
  id: string;
  name?: string;
  title?: string;
  amount: number | string;
  dueDate?: string;
}

interface WithdrawBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: BlockType;
  title?: string;
  message: string;
  bills?: BlockBill[];
  currentBalance?: number;
  requestedAmount?: number;
  actionLabel?: string;
  actionHref?: string;
}

const formatCurrency = (v: string | number | undefined): string => {
  if (v === undefined || v === null || v === "") return "0.00";
  const n = typeof v === "number" ? v : parseFloat(v);
  if (isNaN(n)) return "0.00";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function WithdrawBlockedModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  bills = [],
  currentBalance,
  requestedAmount,
  actionLabel = "Go to Bills",
  actionHref = "/Bills",
}: WithdrawBlockedModalProps) {
  if (!isOpen) return null;

  const defaultTitle =
    type === "unpaid_bills"
      ? "Unpaid Bills"
      : type === "insufficient_funds"
      ? "Insufficient Funds"
      : type === "account_inactive"
      ? "Account Inactive"
      : "Cannot Withdraw";

  const showBills = type === "unpaid_bills" && bills.length > 0;
  const showBalanceBreakdown =
    type === "insufficient_funds" &&
    typeof currentBalance === "number" &&
    typeof requestedAmount === "number";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 300 }}
        className="w-full max-w-md rounded-2xl bg-[#C4F8FD] p-6 shadow-2xl border-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-cyan-900">
              {title || defaultTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-cyan-700 hover:bg-white/40 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Message */}
        <p className="text-sm text-cyan-800 leading-relaxed mb-4">
          {message}
        </p>

        {/* Insufficient funds breakdown */}
        {showBalanceBreakdown && (
          <div className="mb-4 space-y-2 rounded-xl bg-white/40 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-cyan-700 flex items-center gap-1">
                <DollarSign size={12} /> Available
              </span>
              <span className="font-semibold text-cyan-900">
                ${formatCurrency(currentBalance)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-cyan-700 flex items-center gap-1">
                <DollarSign size={12} /> Requested
              </span>
              <span className="font-semibold text-red-600">
                ${formatCurrency(requestedAmount)}
              </span>
            </div>
            <div className="border-t border-cyan-200/40 pt-2 flex items-center justify-between text-xs">
              <span className="text-cyan-700">Short by</span>
              <span className="font-bold text-red-600">
                ${formatCurrency((requestedAmount ?? 0) - (currentBalance ?? 0))}
              </span>
            </div>
          </div>
        )}

        {/* Bills list */}
        {showBills && (
          <div className="mb-4 space-y-2 max-h-[240px] overflow-y-auto pr-1">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between rounded-lg bg-white/50 p-3"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Calendar size={14} className="text-amber-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-cyan-900 truncate">
                      {bill.name || bill.title || "Unnamed Bill"}
                    </p>
                    {bill.dueDate && (
                      <p className="text-[11px] text-cyan-700/70">
                        Due: {new Date(bill.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-sm font-semibold text-amber-700 flex-shrink-0 ml-2">
                  ${formatCurrency(bill.amount)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col gap-2">
          {showBills ? (
            <Link href={actionHref} className="w-full">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-bold text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500 transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  {actionLabel} <ArrowRight size={18} />
                </span>
              </motion.button>
            </Link>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-bold text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              Close
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}