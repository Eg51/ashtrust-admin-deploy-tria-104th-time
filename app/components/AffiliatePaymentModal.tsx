"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Bitcoin, Landmark, Building2, ArrowLeftRight } from "lucide-react";

interface PaymentDetailsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AffiliatePaymentModal({ isOpen, onClose }: PaymentDetailsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"domestic" | "international" | "crypto">("domestic"); // Default tab

  const [details, setDetails] = useState({
    // Domestic
    domesticBankName: "Not Set",
    domesticAccountName: "Not Set",
    domesticAccountNumber: "Not Set",
    domesticRoutingNumber: "Not Set",
    
    // International
    bankName: "Not Set",
    accountName: "Not Set",
    accountNumber: "Not Set",
    swiftCode: "Not Set",
    iban: "Not Set",
    
    // Crypto
    cryptoName: "Bitcoin",           
    cryptoNetwork: "Bitcoin Network", 
    cryptoAddress: "Not Set",
  });

  // ✅ Fetch from the Database API
  useEffect(() => {
    if (isOpen) {
      const fetchPaymentDetails = async () => {
        try {
          const token = localStorage.getItem('auth_token');
          const userId = JSON.parse(localStorage.getItem('user') || '{}')._id;

          const response = await fetch(`/api/user/dashboard?userId=${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const result = await response.json();
            const prefs = result.data?.preferences || {};

            setDetails({
              // Domestic
              domesticBankName: prefs.domesticBankName || "Not Set",
              domesticAccountName: prefs.domesticAccountName || "Not Set",
              domesticAccountNumber: prefs.domesticAccountNumber || "Not Set",
              domesticRoutingNumber: prefs.domesticRoutingNumber || "Not Set",
              
              // International
              bankName: prefs.bankName || "Not Set",
              accountName: prefs.accountName || "Not Set",
              accountNumber: prefs.accountNumber || "Not Set",
              swiftCode: prefs.swiftCode || "Not Set",
              iban: prefs.iban || "Not Set",
              
              // Crypto
              cryptoName: prefs.cryptoName || "Not Set",
              cryptoNetwork: prefs.cryptoNetwork || "Not Set",
              cryptoAddress: prefs.cryptoAddress || "Not Set",
            });
          }
        } catch (e) {
          console.error("Error fetching payment details:", e);
        }
      };

      fetchPaymentDetails();
    }
  }, [isOpen]);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-md rounded-2xl bg-[#C4F8FD] shadow-2xl border-none overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20 bg-white/20">
            <h2 className="text-lg font-bold text-cyan-900 flex items-center gap-2">
              <Landmark size={20} className="text-cyan-600" />
              Payment Details
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-cyan-700 hover:bg-white/30 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/20 bg-white/10">
            <button
              onClick={() => setActiveTab("domestic")}
              className={`flex-1 py-3 text-xs font-bold transition-colors ${
                activeTab === "domestic" ? "bg-white/30 text-cyan-900 border-b-2 border-cyan-600" : "text-cyan-700 hover:bg-white/10"
              }`}
            >
              Domestic
            </button>
            <button
              onClick={() => setActiveTab("international")}
              className={`flex-1 py-3 text-xs font-bold transition-colors ${
                activeTab === "international" ? "bg-white/30 text-cyan-900 border-b-2 border-cyan-600" : "text-cyan-700 hover:bg-white/10"
              }`}
            >
              International
            </button>
            <button
              onClick={() => setActiveTab("crypto")}
              className={`flex-1 py-3 text-xs font-bold transition-colors ${
                activeTab === "crypto" ? "bg-white/30 text-cyan-900 border-b-2 border-cyan-600" : "text-cyan-700 hover:bg-white/10"
              }`}
            >
              Crypto
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Domestic Bank Transfer */}
            <AnimatePresence mode="wait">
              {activeTab === "domestic" && (
                <motion.div
                  key="domestic"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <Building2 size={18} className="text-cyan-600" />
                    <h3 className="text-md font-bold text-cyan-900">Domestic Bank Transfer</h3>
                  </div>

                  <div className="rounded-xl bg-white/50 p-4 border border-white/40 shadow-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-cyan-700">Bank Name</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-cyan-900">{details.domesticBankName}</span>
                        <button onClick={() => handleCopy(details.domesticBankName, 'domBank')} className="text-cyan-600 hover:text-cyan-800">
                          {copiedField === 'domBank' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-cyan-700">Account Name</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-cyan-900">{details.domesticAccountName}</span>
                        <button onClick={() => handleCopy(details.domesticAccountName, 'domAccName')} className="text-cyan-600 hover:text-cyan-800">
                          {copiedField === 'domAccName' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-cyan-700">Account Number</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-cyan-900">{details.domesticAccountNumber}</span>
                        <button onClick={() => handleCopy(details.domesticAccountNumber, 'domAccNum')} className="text-cyan-600 hover:text-cyan-800">
                          {copiedField === 'domAccNum' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-cyan-700">Routing Number</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-cyan-900">{details.domesticRoutingNumber}</span>
                        <button onClick={() => handleCopy(details.domesticRoutingNumber, 'domRouting')} className="text-cyan-600 hover:text-cyan-800">
                          {copiedField === 'domRouting' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* International Bank Transfer */}
              {activeTab === "international" && (
                <motion.div
                  key="international"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <Landmark size={18} className="text-cyan-600" />
                    <h3 className="text-md font-bold text-cyan-900">International Bank Transfer</h3>
                  </div>

                  <div className="rounded-xl bg-white/50 p-4 border border-white/40 shadow-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-cyan-700">Bank Name</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-cyan-900">{details.bankName}</span>
                        <button onClick={() => handleCopy(details.bankName, 'bank')} className="text-cyan-600 hover:text-cyan-800">
                          {copiedField === 'bank' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-cyan-700">Account Name</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-cyan-900">{details.accountName}</span>
                        <button onClick={() => handleCopy(details.accountName, 'accountName')} className="text-cyan-600 hover:text-cyan-800">
                          {copiedField === 'accountName' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-cyan-700">Account Number</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-cyan-900">{details.accountNumber}</span>
                        <button onClick={() => handleCopy(details.accountNumber, 'accountNumber')} className="text-cyan-600 hover:text-cyan-800">
                          {copiedField === 'accountNumber' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-cyan-700">SWIFT Code</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-cyan-900">{details.swiftCode}</span>
                        <button onClick={() => handleCopy(details.swiftCode, 'swift')} className="text-cyan-600 hover:text-cyan-800">
                          {copiedField === 'swift' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-cyan-700">IBAN</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-cyan-900 text-right">{details.iban}</span>
                        <button onClick={() => handleCopy(details.iban, 'iban')} className="text-cyan-600 hover:text-cyan-800">
                          {copiedField === 'iban' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Crypto Payment */}
              {activeTab === "crypto" && (
                <motion.div
                  key="crypto"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <Bitcoin size={18} className="text-orange-500" />
                    <h3 className="text-md font-bold text-cyan-900">
                      Crypto Payment ({details.cryptoName})
                    </h3>
                  </div>

                  <div className="rounded-xl bg-white/50 p-4 border border-white/40 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-700">Wallet Address</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-cyan-900 break-all">{details.cryptoAddress}</span>
                        <button onClick={() => handleCopy(details.cryptoAddress, 'crypto')} className="text-cyan-600 hover:text-cyan-800">
                          {copiedField === 'crypto' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-cyan-600 mt-2">
                      ⚠️ Only send {details.cryptoName} on the {details.cryptoNetwork}. Do not use other networks.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Instructions (Show for all tabs) */}
            <div className="rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/20">
              <h4 className="text-sm font-bold text-emerald-700 mb-2">How to Pay</h4>
              <ol className="list-decimal list-inside text-xs text-emerald-800 space-y-1">
                <li>Select the payment method above.</li>
                <li>Copy the relevant details.</li>
                <li>Send your receipt or transaction ID to our support team for fast verification.</li>
              </ol>
            </div>

            <p className="text-center text-[10px] text-cyan-600/70">
              All payments are verified within 24 hours. If you have any issues, please contact support.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}