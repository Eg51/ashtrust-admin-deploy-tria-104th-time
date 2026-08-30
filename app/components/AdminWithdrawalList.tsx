// app/components/admin/AdminWithdrawalList.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Eye,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw
} from "lucide-react";
import AdminWithdrawalReceipt from './AdminWithdrawalReceipt';

// ✅ Helper: Format currency with commas and dots
const formatCurrency = (value: number): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

interface WithdrawalRecord {
  id: string;
  reference: string;
  amount: number;
  method: 'bank' | 'crypto';
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  walletAddress?: string;
  network?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  userId: string;
  userEmail: string;
  userName: string;
}

export default function AdminWithdrawalList() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRecord | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/admin/withdrawals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // ✅ Ensure data.data is always an array
        if (data && data.success && Array.isArray(data.data)) {
          setWithdrawals(data.data);
        } else if (Array.isArray(data)) {
          setWithdrawals(data);
        } else {
          console.warn('Unexpected API response format:', data);
          setWithdrawals([]);
        }
      } else {
        console.error('Failed to fetch withdrawals:', response.status);
        setWithdrawals([]);
        if (response.status === 404) {
          setError('API endpoint not found. Please check your server.');
        } else if (response.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError(`Failed to load withdrawals (${response.status})`);
        }
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      setWithdrawals([]);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Safe filtering - ensures withdrawals is always an array
  const filteredWithdrawals = Array.isArray(withdrawals) ? withdrawals.filter(w => {
    const matchesSearch = 
      w.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || w.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <div className="bg-[#C4F8FD] rounded-2xl shadow-xl p-3 sm:p-4 md:p-6">
   
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-cyan-100 rounded-lg">
            <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-600" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-cyan-900">Requests</h2>
          <span className="text-[10px] sm:text-xs bg-gray-100 text-gray-600 px-1.5 sm:px-2 py-0.5 rounded-full">
            {Array.isArray(withdrawals) ? withdrawals.length : 0} total
          </span>
          <button
          onClick={fetchWithdrawals}
          className="text-[10px] sm:text-xs text-cyan-600 hover:text-cyan-800 flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="h-auto p-9 w-auto sm:h-3.5 sm:w-3.5" />
          <span className="hidden xs:inline">Refresh</span>
        </button>
      </div>
        </div>
        

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          {error}
          <button 
            onClick={fetchWithdrawals}
            className="ml-auto text-xs p-5 underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by reference, user, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border-none pl-8 sm:pl-10 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border-none px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 bg-none"
        >
          <option value="bg-none all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8 sm:py-12">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-cyan-500" />
        </div>
      ) : filteredWithdrawals.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500">
          <Wallet className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-300 mb-2 sm:mb-3" />
          <p className="text-sm sm:text-base">
            {searchTerm || filterStatus !== 'all' 
              ? 'No matching withdrawal requests found' 
              : 'No withdrawal requests found'}
          </p>
          {(searchTerm || filterStatus !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
              className="mt-2 text-xs text-cyan-600 hover:text-cyan-800 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {filteredWithdrawals.map((w, index) => (
            <motion.div
              key={w.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-wrap items-center justify-between p-2.5 sm:p-3 md:p-4 bg-white/50 rounded-lg hover:bg-white/80 transition-colors cursor-pointer gap-2"
              onClick={() => {
                setSelectedWithdrawal(w);
                setShowReceipt(true);
              }}
            >
              {/* Left Section - User Info */}
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                  <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    {w.userName || 'Unknown User'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate flex flex-wrap items-center gap-1">
                    <span className="truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">
                      {w.userEmail || 'No email'}
                    </span>
                    <span className="hidden xs:inline">•</span>
                    <span className="font-mono text-[10px] sm:text-xs truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">
                      {w.reference || 'No reference'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Right Section - Amount, Status, Eye */}
              <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 flex-shrink-0 ml-auto xs:ml-0">
                <span className="text-xs sm:text-sm font-bold text-amber-600">
                  ${formatCurrency(w.amount || 0)}
                </span>
                <span className={`text-[8px] xs:text-[10px] sm:text-xs px-1.5 xs:px-2 py-0.5 rounded-full border ${getStatusColor(w.status)} flex items-center gap-0.5 xs:gap-1`}>
                  {getStatusIcon(w.status)}
                  <span className="hidden xs:inline">{w.status || 'unknown'}</span>
                  <span className="xs:hidden">
                    {w.status === 'pending' ? '⏳' : 
                     w.status === 'approved' ? '✓' : 
                     w.status === 'rejected' ? '✕' : '✔'}
                  </span>
                </span>
                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-600 hover:text-cyan-800 cursor-pointer flex-shrink-0" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ✅ FIXED: Receipt Modal with all required userData fields */}
      {selectedWithdrawal && (
        <AdminWithdrawalReceipt
          isOpen={showReceipt}
          onClose={() => {
            setShowReceipt(false);
            setSelectedWithdrawal(null);
            fetchWithdrawals();
          }}
          withdrawalData={{
            reference: selectedWithdrawal.reference || '',
            amount: selectedWithdrawal.amount || 0,
            method: selectedWithdrawal.method || 'bank',
            bankName: selectedWithdrawal.bankName,
            accountName: selectedWithdrawal.accountName,
            accountNumber: selectedWithdrawal.accountNumber,
            walletAddress: selectedWithdrawal.walletAddress,
            network: selectedWithdrawal.network,
            status: selectedWithdrawal.status || 'pending',
            createdAt: selectedWithdrawal.createdAt || new Date().toISOString()
          }}
          userData={{
            username: selectedWithdrawal.userName || 'Unknown',     // ✅ Added
            email: selectedWithdrawal.userEmail || 'No email',
            displayName: selectedWithdrawal.userName || 'Unknown',
            userId: selectedWithdrawal.userId || ''
          }}
          onStatusUpdate={() => fetchWithdrawals()}
        />
      )}
    </div>
  );
}