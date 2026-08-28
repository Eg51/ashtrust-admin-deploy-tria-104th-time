// app/components/UserAccountManager.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  User,
  CreditCard,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Trash2,
  Wallet,
  Bitcoin,
  Globe,
  Link as LinkIcon,
  Network
} from "lucide-react";

interface AccountData {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  isDefault: boolean;
}

interface CryptoData {
  walletAddress: string;
  network: string;
}

interface UserAccountManagerProps {
  onSave?: () => void;
}

export default function UserAccountManager({ onSave }: UserAccountManagerProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // ✅ Two accounts
  const [account1, setAccount1] = useState<AccountData>({
    id: 'acc1',
    bankName: '',
    accountName: '',
    accountNumber: '',
    isDefault: true
  });
  const [account2, setAccount2] = useState<AccountData>({
    id: 'acc2',
    bankName: '',
    accountName: '',
    accountNumber: '',
    isDefault: false
  });

  // ✅ Crypto details
  const [cryptoData, setCryptoData] = useState<CryptoData>({
    walletAddress: '',
    network: ''
  });

  const [expandedAccount, setExpandedAccount] = useState<'acc1' | 'acc2' | 'crypto' | null>('acc1');

  // ✅ Fetch user's existing account details
  useEffect(() => {
    fetchAccountDetails();
  }, []);

  const fetchAccountDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/user/accounts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const data = result.data;
          
          // ✅ Load up to 2 accounts
          if (data.accounts && data.accounts.length > 0) {
            const acc1 = data.accounts[0];
            setAccount1({
              id: 'acc1',
              bankName: acc1.bankName || '',
              accountName: acc1.accountName || '',
              accountNumber: acc1.accountNumber || '',
              isDefault: acc1.isDefault !== false
            });
            
            if (data.accounts.length > 1) {
              const acc2 = data.accounts[1];
              setAccount2({
                id: 'acc2',
                bankName: acc2.bankName || '',
                accountName: acc2.accountName || '',
                accountNumber: acc2.accountNumber || '',
                isDefault: acc2.isDefault || false
              });
            }
          }

          // ✅ Load crypto details
          if (data.crypto) {
            setCryptoData({
              walletAddress: data.crypto.walletAddress || '',
              network: data.crypto.network || ''
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Save account details to database
  const handleSave = async () => {
    // Validation: At least Account 1 must be filled
    if (!account1.bankName.trim()) {
      showMessage('error', 'Please enter Bank Name for Account 1');
      return;
    }
    if (!account1.accountName.trim()) {
      showMessage('error', 'Please enter Account Name for Account 1');
      return;
    }
    if (!account1.accountNumber.trim()) {
      showMessage('error', 'Please enter Account Number for Account 1');
      return;
    }

    // If Account 2 has any field filled, all fields must be filled
    const hasAccount2Partial = account2.bankName.trim() || account2.accountName.trim() || account2.accountNumber.trim();
    if (hasAccount2Partial) {
      if (!account2.bankName.trim()) {
        showMessage('error', 'Please enter Bank Name for Account 2 or clear all fields');
        return;
      }
      if (!account2.accountName.trim()) {
        showMessage('error', 'Please enter Account Name for Account 2 or clear all fields');
        return;
      }
      if (!account2.accountNumber.trim()) {
        showMessage('error', 'Please enter Account Number for Account 2 or clear all fields');
        return;
      }
    }

    // Build accounts array
    const accounts = [
      {
        id: 'acc1',
        bankName: account1.bankName.trim(),
        accountName: account1.accountName.trim(),
        accountNumber: account1.accountNumber.trim(),
        isDefault: account1.isDefault
      }
    ];

    // Add Account 2 only if fully filled
    if (account2.bankName.trim() && account2.accountName.trim() && account2.accountNumber.trim()) {
      accounts.push({
        id: 'acc2',
        bankName: account2.bankName.trim(),
        accountName: account2.accountName.trim(),
        accountNumber: account2.accountNumber.trim(),
        isDefault: account2.isDefault
      });
    }

    // Ensure at least one is default
    if (!accounts.some(a => a.isDefault) && accounts.length > 0) {
      accounts[0].isDefault = true;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('auth_token');
      
      const payload = { 
        accounts,
        crypto: {
          walletAddress: cryptoData.walletAddress.trim(),
          network: cryptoData.network.trim()
        }
      };

      const response = await fetch('/api/user/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showMessage('success', 'Account details saved successfully!');
        if (onSave) onSave();
      } else {
        const error = await response.json();
        showMessage('error', error.error || 'Failed to save account details');
      }
    } catch (error) {
      console.error('Error saving account details:', error);
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const toggleExpand = (section: 'acc1' | 'acc2' | 'crypto') => {
    setExpandedAccount(expandedAccount === section ? null : section);
  };

  // ✅ Set default account
  const setDefaultAccount = (acc: 'acc1' | 'acc2') => {
    if (acc === 'acc1') {
      setAccount1({ ...account1, isDefault: true });
      setAccount2({ ...account2, isDefault: false });
    } else {
      setAccount1({ ...account1, isDefault: false });
      setAccount2({ ...account2, isDefault: true });
    }
  };

  // ✅ Clear Account 2
  const clearAccount2 = () => {
    setAccount2({
      id: 'acc2',
      bankName: '',
      accountName: '',
      accountNumber: '',
      isDefault: false
    });
    if (!account1.isDefault) {
      setAccount1({ ...account1, isDefault: true });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 flex-col">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" /><span>please wait ....</span>
      </div>
    );
  }

  return (
    <div className="bg-[#C4F8FD] rounded-2xl shadow-xl p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-100 rounded-lg">
            <Wallet className="h-5 w-5 text-cyan-600" />
          </div>
          <h2 className="text-lg font-bold text-cyan-900">My Accounts</h2>
        </div>
        <button
          onClick={fetchAccountDetails}
          className="text-xs  cursor-pointer text-cyan-600 hover:text-cyan-800 flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </div>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 cursor-pointer ${
              message.type === 'success' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
              message.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
              'bg-blue-100 text-blue-700 border border-blue-200'
            }`}
          >
            {message.type === 'success' && <CheckCircle className="h-4 w-4" />}
            {message.type === 'error' && <AlertCircle className="h-4 w-4" />}
            {message.type === 'info' && <AlertCircle className="h-4 w-4" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account 1 */}
      <div className="mb-4 border-none rounded-xl bg-[#C4F8FD] shadow-xl overflow-hidden">
        <div
          onClick={() => toggleExpand('acc1')}
          className="w-full flex items-center justify-between cursor-pointer p-4 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${account1.isDefault ? 'bg-emerald-100' : 'bg-gray-100'}`}>
              <CreditCard className={`h-4 w-4 ${account1.isDefault ? 'text-emerald-600' : 'text-gray-400'}`} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">Account 1 {account1.isDefault && <span className="text-emerald-600 text-xs font-medium ml-2">Default</span>}</p>
              <p className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-[250px]">
                {account1.bankName || 'Not set'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!account1.isDefault && (
              <button
                onClick={(e) => { e.stopPropagation(); setDefaultAccount('acc1'); }}
                className="text-xs text-cyan-600 hover:text-cyan-800"
              >
                Set as Default
              </button>
            )}
            {expandedAccount === 'acc1' ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </div>
        </div>
        
        <AnimatePresence>
          {expandedAccount === 'acc1' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-4 space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-cyan-700 mb-1">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={account1.bankName}
                  onChange={(e) => setAccount1({ ...account1, bankName: e.target.value })}
                  placeholder=".................."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-cyan-700 mb-1">
                  Account Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={account1.accountName}
                  onChange={(e) => setAccount1({ ...account1, accountName: e.target.value })}
                  placeholder="e.g., ..............."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-cyan-700 mb-1">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={account1.accountNumber}
                  onChange={(e) => setAccount1({ ...account1, accountNumber: e.target.value })}
                  placeholder="e.g., 0978 .... ...."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Account 2 */}
      <div className="mb-4 border-none rounded-xl bg-[#C4F8FD] shadow-xl cursor-pointer overflow-hidden">
        <div
          onClick={() => toggleExpand('acc2')}
          className="w-full flex items-center justify-between p-4 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${account2.isDefault ? 'bg-emerald-100' : 'bg-gray-100'}`}>
              <CreditCard className={`h-4 w-4 ${account2.isDefault ? 'text-emerald-600' : 'text-gray-400'}`} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">Account 2 {account2.isDefault && <span className="text-emerald-600 text-xs font-medium ml-2">Default</span>}</p>
              <p className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-[250px]">
                {account2.bankName || 'Not set'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {account2.bankName || account2.accountName || account2.accountNumber ? (
              <button
                onClick={(e) => { e.stopPropagation(); clearAccount2(); }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
            {!account2.isDefault && (account2.bankName || account2.accountName || account2.accountNumber) && (
              <button
                onClick={(e) => { e.stopPropagation(); setDefaultAccount('acc2'); }}
                className="text-xs text-cyan-600 hover:text-cyan-800"
              >
                Set as Default
              </button>
            )}
            {expandedAccount === 'acc2' ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </div>
        </div>
        
        <AnimatePresence>
          {expandedAccount === 'acc2' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-4 space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-cyan-700 mb-1">
                  Bank Name <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={account2.bankName}
                  onChange={(e) => setAccount2({ ...account2, bankName: e.target.value })}
                  placeholder="...................."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-cyan-700 mb-1">
                  Account Name <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={account2.accountName}
                  onChange={(e) => setAccount2({ ...account2, accountName: e.target.value })}
                  placeholder="................"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-cyan-700 mb-1">
                  Account Number <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={account2.accountNumber}
                  onChange={(e) => setAccount2({ ...account2, accountNumber: e.target.value })}
                  placeholder="............."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ✅ CRYPTO SECTION */}
      <div className="mb-4 border-none rounded-xl bg-[#C4F8FD] shadow-xl cursor-pointer overflow-hidden">
        <div
          onClick={() => toggleExpand('crypto')}
          className="w-full flex items-center justify-between p-4 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <Bitcoin className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">Crypto Details</p>
              <p className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-[250px]">
                {cryptoData.walletAddress ? cryptoData.walletAddress.slice(0, 8) + '...' : 'Not set'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {expandedAccount === 'crypto' ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </div>
        </div>
        
        <AnimatePresence>
          {expandedAccount === 'crypto' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-4 space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-cyan-700 mb-1">
                  Wallet Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Bitcoin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={cryptoData.walletAddress}
                    onChange={(e) => setCryptoData({ ...cryptoData, walletAddress: e.target.value })}
                    placeholder="Enter your crypto wallet address..."
                    className="w-full rounded-lg border border-gray-200 pl-10 pr-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 bg-white"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">⚠️ Make sure you enter the correct wallet address</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-cyan-700 mb-1">
                  Network <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Network className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={cryptoData.network}
                    onChange={(e) => setCryptoData({ ...cryptoData, network: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 pl-10 pr-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 bg-white"
                  >
                    <option value="">Select Network</option>
                    <option value="ethereum">Ethereum (ERC-20)</option>
                    <option value="bsc">Binance Smart Chain (BEP-20)</option>
                    <option value="solana">Solana</option>
                    <option value="bitcoin">Bitcoin</option>
                    <option value="polygon">Polygon</option>
                    <option value="arbitrum">Arbitrum</option>
                    <option value="optimism">Optimism</option>
                    <option value="avalanche">Avalanche C-Chain</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info message */}
      <div className="rounded-lg bg-[#C4F8FD]  p-3 border border-amber-700 mb-4">
        <p className="text-xs text-amber-700">
          <strong>Note:</strong> You can set up to 2 bank accounts and your crypto wallet details. 
          When making a withdrawal, you can switch between them. 
          The account marked as <strong>Default</strong> will be pre-selected.
        </p>
      </div>

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-xl bg-[#C4F8FD] py-3 font-bold text-cyan-900 hover:shadow-xl shadow-cyan-500/30 shadow-2xl transition-all flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-5 w-5" />
            Save
          </>
        )}
      </motion.button>
    </div>
  );
}