// app/components/WithdrawalReceiptModal.tsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Printer,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  Check
} from "lucide-react";

interface WithdrawalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawalData: {
    reference: string;
    amount: number;
    method: 'bank' | 'crypto';
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    swiftCode?: string;
    iban?: string;
    walletAddress?: string;
    network?: string;
    status: string;
    createdAt: string;
  };
  userData: {
    username: string;
    email: string;
    displayName?: string;
  };
}

// ✅ Helper: Format currency with commas and dots
const formatCurrency = (value: number): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// ✅ Helper: Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export default function WithdrawalReceiptModal({
  isOpen,
  onClose,
  withdrawalData,
  userData
}: WithdrawalReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(withdrawalData.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // ✅ SIMPLIFIED FIXED VERSION - Generates receipt from scratch
  const handleDownloadImage = async () => {
    try {
      setIsDownloading(true);

      // ✅ Create a clean receipt HTML from scratch (no lab() colors)
      const receiptHTML = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: white; border-radius: 16px; border: 1px solid #e5e7eb;">
          <!-- Header -->
          <div style="text-align: center; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: center; margin-bottom: 12px;">
              <div style="width: 60px; height: 60px; border-radius: 50%; background: #d1fae5; display: flex; align-items: center; justify-content: center;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
            </div>
            <h2 style="font-size: 24px; font-weight: bold; color: #065f46; margin: 0;">Withdrawal Request Successful</h2>
          </div>

          <!-- Status -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 16px; background: #fffbeb; border-radius: 8px; padding: 8px; border: 1px solid #fde68a;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style="font-size: 14px; font-weight: 500; color: #d97706;">Status: Pending</span>
          </div>

          <!-- User Info -->
          <div style="background: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; font-size: 14px;">
              <span style="color: #6b7280;">User:</span>
              <span style="font-weight: 500; color: #1f2937;">${userData.displayName || userData.username}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 14px;">
              <span style="color: #6b7280;">Email:</span>
              <span style="font-weight: 500; color: #1f2937;">${userData.email}</span>
            </div>
          </div>

          <!-- Reference -->
          <div style="display: flex; align-items: center; justify-content: space-between; background: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
            <span style="font-size: 14px; color: #6b7280;">Reference:</span>
            <span style="font-family: monospace; font-size: 14px; font-weight: bold; color: #0e7490;">${withdrawalData.reference}</span>
          </div>

          <!-- Details -->
          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0; border-bottom: 1px solid #f9fafb;">
              <span style="color: #6b7280;">Amount:</span>
              <span style="font-size: 20px; font-weight: normal; color: #d97706;">$${formatCurrency(withdrawalData.amount)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0; border-bottom: 1px solid #f9fafb;">
              <span style="color: #6b7280;">Method:</span>
              <span style="font-weight: 500; text-transform: capitalize; color: #1f2937;">${withdrawalData.method}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0;">
              <span style="color: #6b7280;">Date:</span>
              <span style="font-weight: 500; color: #1f2937;">${formatDate(withdrawalData.createdAt)}</span>
            </div>
          </div>

          <!-- Bank/Crypto Details -->
          ${withdrawalData.method === 'bank' ? `
            <div style="background: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
              <p style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #6b7280; margin: 0 0 4px 0;">Bank Details</p>
              <div style="display: flex; justify-content: space-between; font-size: 14px; padding: 2px 0;">
                <span style="color: #6b7280;">Bank:</span>
                <span style="font-weight: 500; color: #1f2937;">${withdrawalData.bankName || 'N/A'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 14px; padding: 2px 0;">
                <span style="color: #6b7280;">Account:</span>
                <span style="font-weight: 500; color: #1f2937;">${withdrawalData.accountName || 'N/A'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 14px; padding: 2px 0;">
                <span style="color: #6b7280;">Number:</span>
                <span style="font-weight: 500; color: #1f2937;">${withdrawalData.accountNumber || 'N/A'}</span>
              </div>
              ${withdrawalData.swiftCode ? `
                <div style="display: flex; justify-content: space-between; font-size: 14px; padding: 2px 0;">
                  <span style="color: #6b7280;">SWIFT:</span>
                  <span style="font-weight: 500; color: #1f2937;">${withdrawalData.swiftCode}</span>
                </div>
              ` : ''}
            </div>
          ` : `
            <div style="background: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
              <p style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #6b7280; margin: 0 0 4px 0;">Crypto Details</p>
              <div style="display: flex; justify-content: space-between; font-size: 14px; padding: 2px 0;">
                <span style="color: #6b7280;">Address:</span>
                <span style="font-weight: 500; color: #1f2937; word-break: break-all;">${withdrawalData.walletAddress || 'N/A'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 14px; padding: 2px 0;">
                <span style="color: #6b7280;">Network:</span>
                <span style="font-weight: 500; color: #1f2937;">${withdrawalData.network || 'N/A'}</span>
              </div>
            </div>
          `}

          <!-- Footer -->
          <div style="text-align: center; border-top: 2px solid #f3f4f6; padding-top: 16px; margin-top: 16px;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">This is a system-generated receipt. Please keep for your records.</p>
            <p style="font-size: 12px; color: #9ca3af; margin: 4px 0 0 0;">Transaction ID: ${withdrawalData.reference}</p>
          </div>
        </div>
      `;

      // ✅ Create a temporary container
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = receiptHTML;
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '500px';
      tempContainer.style.zIndex = '-1';
      document.body.appendChild(tempContainer);

      try {
        const html2canvas = (await import('html2canvas')).default;
        
        const canvas = await html2canvas(tempContainer, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false,
          allowTaint: true,
          width: 500,
          height: tempContainer.scrollHeight + 20,
        });

        const link = document.createElement('a');
        link.download = `Withdrawal_Receipt_${withdrawalData.reference.replace(/\s/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

      } finally {
        // ✅ Clean up
        document.body.removeChild(tempContainer);
      }

    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Could not download receipt. Please take a screenshot instead.');
    } finally {
      setIsDownloading(false);
    }
  };

  // ✅ Print Receipt
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the receipt.');
      return;
    }

    const content = receiptRef.current?.innerHTML || '';
    const styles = `
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 600px; margin: auto; }
        .receipt { border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; background: white; }
        .header { text-align: center; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; margin-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; color: #065f46; }
        .subtitle { color: #6b7280; font-size: 14px; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f9fafb; }
        .label { color: #6b7280; font-weight: 500; }
        .value { font-weight: 600; color: #111827; }
        .status-pending { color: #d97706; font-weight: 600; }
        .footer { margin-top: 24px; text-align: center; color: #6b7280; font-size: 12px; border-top: 2px solid #f3f4f6; padding-top: 20px; }
        .ref { font-family: monospace; background: #f3f4f6; padding: 2px 8px; border-radius: 4px; }
      </style>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>Withdrawal Receipt</title>${styles}</head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Receipt Content */}
            <div ref={receiptRef} className="p-6" id="receipt-content">
              {/* Header */}
              <div className="text-center border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-center mb-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-emerald-700">Withdrawal Request Successful</h2>
              </div>

              {/* Status */}
              <div className="flex items-center justify-center gap-2 mb-4 bg-amber-50 rounded-lg p-2 border border-amber-200">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">Status: Pending</span>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">User:</span>
                  <span className="font-medium text-gray-800">{userData.displayName || userData.username}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium text-gray-800">{userData.email}</span>
                </div>
              </div>

              {/* Reference */}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mb-4">
                <span className="text-sm text-gray-500">Reference:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-cyan-700">{withdrawalData.reference}</span>
                  <button
                    onClick={handleCopyReference}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-normal text-lg text-amber-600">${formatCurrency(withdrawalData.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Method:</span>
                  <span className="font-medium capitalize text-gray-800">{withdrawalData.method}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium text-gray-800">{formatDate(withdrawalData.createdAt)}</span>
                </div>
              </div>

              {/* Bank/Crypto Details */}
              {withdrawalData.method === 'bank' ? (
                <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Bank Details</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Bank:</span>
                    <span className="font-medium text-gray-800">{withdrawalData.bankName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Account:</span>
                    <span className="font-medium text-gray-800">{withdrawalData.accountName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Number:</span>
                    <span className="font-medium text-gray-800">{withdrawalData.accountNumber || 'N/A'}</span>
                  </div>
                  {withdrawalData.swiftCode && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">SWIFT:</span>
                      <span className="font-medium text-gray-800">{withdrawalData.swiftCode}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Crypto Details</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Address:</span>
                    <span className="font-medium text-gray-800 text-xs break-all max-w-[200px] text-right">
                      {withdrawalData.walletAddress || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Network:</span>
                    <span className="font-medium text-gray-800">{withdrawalData.network || 'N/A'}</span>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="text-center border-t border-gray-200 pt-4 mt-4">
                <p className="text-xs text-gray-400">
                  This is a system-generated receipt. Please keep for your records.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Transaction ID: {withdrawalData.reference}
                </p>
              </div>
            </div>

            {/* Buttons */}
            {/* <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl flex flex-col sm:flex-row gap-2">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
              >
                <Printer size={18} />
                Print
              </button>
              <button
                onClick={handleDownloadImage}
                disabled={isDownloading}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-700 transition-colors disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Download Receipt
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
                Close
              </button>
            </div> */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}