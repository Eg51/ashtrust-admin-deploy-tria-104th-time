// app/components/admin/AdminWithdrawalReceipt.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Printer,
  CheckCircle,
  Clock,
  Copy,
  Check,
  Search,
  Users,
  Wallet,
  Eye,
  FileText,
  Loader2
} from "lucide-react";

interface WithdrawalRecord {
  id: string;
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
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  userId: string;
  userEmail: string;
  userName: string;
}

interface AdminWithdrawalReceiptProps {
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
    userId?: string;
  };
  onStatusUpdate?: (reference: string, status: string) => void;
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

export default function AdminWithdrawalReceipt({
  isOpen,
  onClose,
  withdrawalData,
  userData,
  onStatusUpdate
}: AdminWithdrawalReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [status, setStatus] = useState(withdrawalData.status || 'pending');
  const [isUpdating, setIsUpdating] = useState(false);

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

  // ✅ Update withdrawal status
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      
      const response = await fetch('/api/admin/withdrawal/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          reference: withdrawalData.reference,
          status: newStatus
        })
      });

      if (response.ok) {
        setStatus(newStatus);
        if (onStatusUpdate) {
          onStatusUpdate(withdrawalData.reference, newStatus);
        }
        alert(`Withdrawal status updated to: ${newStatus}`);
      } else {
        const error = await response.json();
        alert(`Failed to update status: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // ✅ Download as Image
  const handleDownloadImage = async () => {
    try {
      setIsDownloading(true);

      const receiptHTML = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: white; border-radius: 16px; border: 1px solid #e5e7eb;">
          <!-- Header -->
          <div style="text-align: center; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: center; margin-bottom: 12px;">
              <div style="width: 60px; height: 60px; border-radius: 50%; background: #d1fae5; display: flex; align-items: center; justify-content: center;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
            </div>
            <h2 style="font-size: 24px; font-weight: bold; color: #065f46; margin: 0;">Withdrawal Request</h2>
            <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">Admin Receipt</p>
          </div>

          <!-- Status -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 16px; background: ${status === 'pending' ? '#fffbeb' : status === 'approved' ? '#ecfdf5' : status === 'rejected' ? '#fef2f2' : '#f3f4f6'}; border-radius: 8px; padding: 8px; border: 1px solid ${status === 'pending' ? '#fde68a' : status === 'approved' ? '#a7f3d0' : status === 'rejected' ? '#fca5a5' : '#d1d5db'};">
            <span style="font-size: 14px; font-weight: 500; color: ${status === 'pending' ? '#d97706' : status === 'approved' ? '#065f46' : status === 'rejected' ? '#dc2626' : '#6b7280'};">
              Status: ${status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>

          <!-- Admin Badge -->
          <div style="background: #eff6ff; border-radius: 8px; padding: 8px; margin-bottom: 16px; text-align: center; border: 1px solid #93c5fd;">
            <span style="font-size: 12px; font-weight: 600; color: #1d4ed8;">🔒 Admin Generated Receipt</span>
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
            ${userData.userId ? `
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 4px; border-top: 1px solid #e5e7eb; padding-top: 4px;">
                <span style="color: #6b7280;">User ID:</span>
                <span style="font-weight: 400; color: #6b7280; font-size: 11px;">${userData.userId}</span>
              </div>
            ` : ''}
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
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">This is an admin-generated receipt. Please keep for your records.</p>
            <p style="font-size: 12px; color: #9ca3af; margin: 4px 0 0 0;">Transaction ID: ${withdrawalData.reference}</p>
          </div>
        </div>
      `;

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
        link.download = `Withdrawal_Receipt_${withdrawalData.reference.replace(/\s/g, '_')}_Admin.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

      } finally {
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
        <head><title>Admin Withdrawal Receipt</title>${styles}</head>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-[95%] sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border-none mx-2 sm:mx-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Admin Badge */}
            <div className="bg-blue-50 p-2 sm:p-3 border-b border-blue-200 flex items-center justify-center gap-2 sticky top-0 z-10">
              <span className="text-[10px] sm:text-xs font-semibold text-blue-700">🔒 Admin View</span>
            </div>

            {/* Receipt Content */}
            <div ref={receiptRef} className="p-4 sm:p-6" id="receipt-content">
              {/* Header */}
              <div className="text-center border-b border-gray-200 pb-3 sm:pb-4 mb-3 sm:mb-4">
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
                  </div>
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-emerald-700">Withdrawal Request</h2>
                <p className="text-xs sm:text-sm text-gray-500">Admin Receipt</p>
              </div>

              {/* Status */}
              <div className={`flex items-center justify-center gap-2 mb-3 sm:mb-4 rounded-lg p-1.5 sm:p-2 border text-xs sm:text-sm ${
                status === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                status === 'approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                status === 'rejected' ? 'bg-red-50 border-red-200 text-red-700' :
                'bg-gray-50 border-gray-200 text-gray-700'
              }`}>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-medium">Status: {status.charAt(0).toUpperCase() + status.slice(1)}</span>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm gap-1 sm:gap-0">
                  <span className="text-gray-500">User:</span>
                  <span className="font-medium text-gray-800 truncate max-w-[150px] sm:max-w-none">{userData.displayName || userData.username}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm gap-1 sm:gap-0">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium text-gray-800 truncate max-w-[150px] sm:max-w-none">{userData.email}</span>
                </div>
                {userData.userId && (
                  <div className="flex flex-col sm:flex-row justify-between text-[10px] sm:text-xs mt-1 pt-1 border-t border-gray-200 gap-1 sm:gap-0">
                    <span className="text-gray-400">User ID:</span>
                    <span className="font-mono text-gray-500 truncate max-w-[120px] sm:max-w-none">{userData.userId}</span>
                  </div>
                )}
              </div>

              {/* Reference */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm text-gray-500">Reference:</span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="font-mono text-xs sm:text-sm font-bold text-cyan-700 break-all">{withdrawalData.reference}</span>
                  <button
                    onClick={handleCopyReference}
                    className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-normal text-base sm:text-lg text-amber-600">${formatCurrency(withdrawalData.amount)}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm">
                  <span className="text-gray-500">Method:</span>
                  <span className="font-medium capitalize text-gray-800">{withdrawalData.method}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium text-gray-800">{formatDate(withdrawalData.createdAt)}</span>
                </div>
              </div>

              {/* Bank/Crypto Details */}
              {withdrawalData.method === 'bank' ? (
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase">Bank Details</p>
                  <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm gap-0.5 sm:gap-0">
                    <span className="text-gray-500">Bank:</span>
                    <span className="font-medium text-gray-800 truncate max-w-[150px] sm:max-w-none">{withdrawalData.bankName || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm gap-0.5 sm:gap-0">
                    <span className="text-gray-500">Account:</span>
                    <span className="font-medium text-gray-800 truncate max-w-[150px] sm:max-w-none">{withdrawalData.accountName || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm gap-0.5 sm:gap-0">
                    <span className="text-gray-500">Number:</span>
                    <span className="font-medium text-gray-800">{withdrawalData.accountNumber || 'N/A'}</span>
                  </div>
                  {withdrawalData.swiftCode && (
                    <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm gap-0.5 sm:gap-0">
                      <span className="text-gray-500">SWIFT:</span>
                      <span className="font-medium text-gray-800">{withdrawalData.swiftCode}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase">Crypto Details</p>
                  <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm gap-0.5 sm:gap-0">
                    <span className="text-gray-500">Address:</span>
                    <span className="font-medium text-gray-800 text-xs break-all max-w-[130px] sm:max-w-[200px] text-right sm:text-left">
                      {withdrawalData.walletAddress || 'N/A'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm gap-0.5 sm:gap-0">
                    <span className="text-gray-500">Network:</span>
                    <span className="font-medium text-gray-800">{withdrawalData.network || 'N/A'}</span>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="text-center border-t border-gray-200 pt-3 sm:pt-4 mt-3 sm:mt-4">
                <p className="text-[10px] sm:text-xs text-gray-400">
                  This is an admin-generated receipt. Please keep for your records.
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
                  Transaction ID: {withdrawalData.reference}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50 rounded-b-2xl flex flex-col gap-2">
              {/* Status Update Buttons */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <button
                  onClick={() => handleStatusUpdate('approved')}
                  disabled={isUpdating || status === 'approved'}
                  className="flex items-center justify-center gap-0.5 sm:gap-1 rounded-lg bg-emerald-500 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Approve</span>
                  <span className="xs:hidden">✓</span>
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={isUpdating || status === 'rejected'}
                  className="flex items-center justify-center gap-0.5 sm:gap-1 rounded-lg bg-red-500 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Reject</span>
                  <span className="xs:hidden">✕</span>
                </button>
                <button
                  onClick={() => handleStatusUpdate('pending')}
                  disabled={isUpdating || status === 'pending'}
                  className="flex items-center justify-center gap-0.5 sm:gap-1 rounded-lg bg-amber-500 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
                >
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Pending</span>
                  <span className="xs:hidden">⌛</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-0.5 sm:gap-1 rounded-lg bg-gray-200 px-2 sm:px-4 py-1.5 sm:py-2.5 text-[10px] sm:text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Print</span>
                  <span className="xs:hidden">🖨️</span>
                </button>
                <button
                  onClick={handleDownloadImage}
                  disabled={isDownloading}
                  className="flex items-center justify-center gap-0.5 sm:gap-1 rounded-lg bg-cyan-600 px-2 sm:px-4 py-1.5 sm:py-2.5 text-[10px] sm:text-sm font-medium text-white hover:bg-cyan-700 transition-colors disabled:opacity-50"
                >
                  {isDownloading ? (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                  <span className="hidden xs:inline">{isDownloading ? 'Downloading...' : 'Download'}</span>
                  <span className="xs:hidden">{isDownloading ? '⏳' : '📥'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center gap-0.5 sm:gap-1 rounded-lg bg-gray-100 px-2 sm:px-4 py-1.5 sm:py-2.5 text-[10px] sm:text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Close</span>
                  <span className="xs:hidden">✕</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}