// app/cards/page.tsx
"use client";

import React, { useState, useCallback, useMemo, memo, useEffect, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Eye,
  EyeOff,
  CheckCircle,
  Banknote,
  Wallet,
  ArrowRight,
  AlertTriangle,
  X,
  Calendar,
  Loader2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

// ============================================================================
// TYPES
// ============================================================================

interface CardData {
  id: string;
  type: "physical" | "virtual";
  number: string;
  expires: string;
  username?: string;
  brand: "visa" | "mastercard" | "amex";
  isActive: boolean;
  lastUsed?: string;
  limit?: string;
  spent?: string;
}

interface Bill {
  id: string;
  name: string;
  title?: string;
  amount: number | string;
  dueDate?: string;
  category: string;
  status?: "pending" | "paid" | "overdue";
}

// ============================================================================
// DATA
// ============================================================================

const cards: CardData[] = [
  {
    id: "1",
    type: "physical",
    number: "4532 7891 2345 6789",
    expires: "12/28",
    brand: "visa",
    isActive: true,
  },
  {
    id: "2",
    type: "virtual",
    number: "9876 5432 1098 7654",
    expires: "09/25",
    username: "JOHN.DOE",
    brand: "visa",
    isActive: true,
  },
];

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: delay * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { delay: delay * 0.06, duration: 0.3, ease: "easeOut" as const },
  }),
};

// ============================================================================
// CARD DISPLAY WITH EYE TOGGLE AND AUTO‑ROTATING NUMBER
// ============================================================================

interface CardDisplayProps {
  card: CardData;
  displayNumber: string;
  isNumberVisible: boolean;
  onToggleVisibility: () => void;
  index?: number;
}

const CardDisplay = memo(({
  card,
  displayNumber,
  isNumberVisible,
  onToggleVisibility,
  index = 0,
}: CardDisplayProps) => {
  const brandColors = {
    visa: "from-blue-600 to-blue-800",
    mastercard: "from-red-500 to-orange-500",
    amex: "from-blue-400 to-cyan-500",
  };

  const formattedNumber = displayNumber.replace(/(.{4})/g, '$1 ').trim();
  const maskedNumber = "•••• •••• •••• ••••";

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="relative"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative h-[200px] w-full rounded-2xl sm:h-[220px]">
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${brandColors[card.brand]} p-5 shadow-xl shadow-${card.brand}-500/20`}
        >
          <div className="flex items-start justify-between">
            <div className="rounded-lg bg-gradient-to-br from-yellow-300 to-yellow-500 p-1.5 shadow-lg">
              <div className="h-8 w-12 rounded border border-yellow-400/30" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-white/60">
                {card.type.toUpperCase()}
              </span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white">
                {card.brand.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="font-mono text-lg font-semibold tracking-wider text-white sm:text-xl">
              {isNumberVisible ? formattedNumber : maskedNumber}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility();
              }}
              className="rounded-full bg-white/20 p-1.5 text-white transition-colors hover:bg-white/30"
              aria-label="Toggle card number visibility"
            >
              {isNumberVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/60">
                Expires
              </p>
              <p className="font-mono text-sm font-semibold text-white">
                {card.expires}
              </p>
            </div>
            {card.type === "physical" && (
              <div className="rounded-lg bg-white/20 px-3 py-1">
                <p className="text-xs font-medium text-white">VISA</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});
CardDisplay.displayName = 'CardDisplay';

// ============================================================================
// WITHDRAWAL MODAL
// ============================================================================

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (data: any) => void;
  pendingBills: Bill[];
}

const adminWithdrawalDetails = {
  bank: { bankName: "First Bank", accountName: "Lumina Finance", accountNumber: "0123456789" },
  crypto: { walletAddress: "0x742d35Cc6634C0532925a3b844Bc9...", network: "Ethereum (ERC-20)" },
};

const WithdrawalModal = ({ isOpen, onClose, onWithdraw, pendingBills }: WithdrawalModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "crypto">("bank");

  if (!isOpen) return null;

  const allPaid = pendingBills.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-400" />
            {allPaid ? "Withdrawal Details" : "Unpaid Bills"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-white/10 transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {!allPaid ? (
          <>
            <div className="rounded-xl bg-amber-500/20 p-4 mb-4 border border-amber-500/30">
              <p className="text-sm text-amber-300 flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">⚠️</span>
                <span>You have <strong className="text-white">{pendingBills.length}</strong> unpaid bill(s). Please pay them before requesting a withdrawal.</span>
              </p>
            </div>

            <div className="space-y-3 mb-4">
              {pendingBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3 border border-slate-700">
                  <div>
                    <p className="text-sm font-medium text-white">{bill.name || bill.title || "Unnamed Bill"}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar size={12} />
                      <span>Due: {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "N/A"}</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-amber-400">
                    ${typeof bill.amount === 'number' ? bill.amount.toFixed(2) : bill.amount || "0.00"}
                  </span>
                </div>
              ))}
            </div>

            <Link href="/Bills">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-bold text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500 transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  Go to Bills <ArrowRight size={18} />
                </span>
              </motion.button>
            </Link>
          </>
        ) : (
          <>
            <div className="rounded-xl bg-emerald-500/20 p-4 mb-4 border border-emerald-500/30">
              <p className="text-sm text-emerald-300 flex items-start gap-2">
                <CheckCircle size={18} className="text-emerald-400" />
                <span>All bills are paid! You can now proceed with your withdrawal.</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Payment Method</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank")}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      paymentMethod === "bank"
                        ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    <Banknote size={16} className="inline mr-2" /> Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("crypto")}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      paymentMethod === "crypto"
                        ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    <Wallet size={16} className="inline mr-2" /> Crypto
                  </button>
                </div>
              </div>

              {paymentMethod === "bank" ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-1">Bank Name</label>
                    <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-white select-none">
                      {adminWithdrawalDetails.bank.bankName}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-1">Account Name</label>
                    <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-white select-none">
                      {adminWithdrawalDetails.bank.accountName}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-1">Account Number</label>
                    <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-white select-none">
                      {adminWithdrawalDetails.bank.accountNumber}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-1">Wallet Address</label>
                    <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-white select-none break-all">
                      {adminWithdrawalDetails.crypto.walletAddress}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-1">Network</label>
                    <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-white select-none">
                      {adminWithdrawalDetails.crypto.network}
                    </div>
                  </div>
                </>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onWithdraw({ method: paymentMethod })}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3.5 font-bold text-white shadow-xl shadow-amber-500/30 hover:from-amber-400 hover:to-orange-500 transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <ArrowRight size={18} /> Withdraw
                </span>
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// LOADING SKELETON (your custom skeleton)
// ============================================================================

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="h-20 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-32 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
        <div className="h-32 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
        <div className="h-32 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
        <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
        <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
        <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
      </div>
    </div>
  </div>
);

// ============================================================================
// LAZY LOAD THE DASHBOARD COMPONENT
// ============================================================================

const Dash = lazy(() => import("@/app/components/Dash"));

// ============================================================================
// MAIN CARDS PAGE
// ============================================================================

const generateRandomCardNumber = (): string => {
  let num = '';
  for (let i = 0; i < 16; i++) {
    num += Math.floor(Math.random() * 10).toString();
  }
  return num;
};

export default function CardsPage() {
  const primaryCard = cards[0];

  const [isNumberVisible, setIsNumberVisible] = useState(true);
  const [displayNumber, setDisplayNumber] = useState(generateRandomCardNumber());

  const [withdrawalMethod, setWithdrawalMethod] = useState<"bank" | "crypto">("bank");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [network, setNetwork] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");

  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [pendingBills, setPendingBills] = useState<Bill[]>([]);
  const [loadingBills, setLoadingBills] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayNumber(generateRandomCardNumber());
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          setLoadingBills(false);
          return;
        }
        const user = JSON.parse(userData);
        const userId = user._id || user.id;
        const token = localStorage.getItem('auth_token');

        const response = await fetch(`/api/user/dashboard?userId=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const result = await response.json();
        if (result.success && result.data) {
          const data = result.data;
          const rawBills = data.bills || [];
          const pending = rawBills.filter((b: any) => {
            const status = (b.status || '').trim().toLowerCase();
            return status === 'pending' || status === 'unpaid';
          });
          setPendingBills(pending);
        }
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoadingBills(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleWithdraw = (data: any) => {
    const withdrawalData = {
      ...data,
      amount: withdrawalAmount,
      bankName,
      accountName,
      accountNumber,
      walletAddress,
      network,
    };
    console.log("Withdrawal request:", withdrawalData);
    setShowWithdrawalModal(false);
    alert("Withdrawal request submitted! Check your email for confirmation.");
  };

  const isWithdrawDisabled = () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) return true;
    if (withdrawalMethod === 'bank') {
      return !bankName || !accountName || !accountNumber;
    } else {
      return !walletAddress || !network;
    }
  };

  const getDueInText = (dueDate?: string) => {
    if (!dueDate) return "No due date";
    const daysLeft = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 3600 * 24));
    return daysLeft <= 0 ? "Overdue" : `${daysLeft} days`;
  };

  return (
    <div className="min-h-screen bg-[#C4F8FD] p-4 sm:p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-6xl"
      >
        {/* Header */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="mb-6 flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-cyan-900 sm:text-3xl"></h1>
            <h2 className="mt-1 text-md font-bold text-cyan-700/70"></h2>
          </div>
        </motion.div>

        {/* Main Grid – Responsive */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column – Card Display + Pending Bills */}
          <div className="space-y-6">
            <CardDisplay
              card={primaryCard}
              displayNumber={displayNumber}
              isNumberVisible={isNumberVisible}
              onToggleVisibility={() => setIsNumberVisible(!isNumberVisible)}
              index={1}
            />

            {/* Pending Bills */}
            <motion.div
              custom={4}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="rounded-2xl border-none bg-[#C4F8FD] p-5 backdrop-blur-sm shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-cyan-900">Pending Bills</h2>
                <Link href="/Bills">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-xs font-medium text-cyan-600 hover:text-cyan-800"
                  >
                    {/* View All */}
                  </motion.button>
                </Link>
              </div>

              {loadingBills ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
                </div>
              ) : pendingBills.length === 0 ? (
                <div className="text-center py-4 text-cyan-700/60 text-sm">
                  No pending bills – you're all clear!
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingBills.slice(0, 5).map((bill, index) => (
                    <motion.div
                      key={bill.id}
                      custom={index}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between rounded-lg bg-[#C4F8FD] shadow-xl p-3 backdrop-blur-sm transition-all hover:bg-white/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-white/30 p-1.5">
                          <Calendar size={14} className="text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-cyan-900">
                            {bill.name || bill.title || "Unnamed Bill"}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-cyan-700/60">
                              Due: {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "N/A"}
                            </span>
                            <span className="text-cyan-700/40">•</span>
                            <span className={`font-medium ${
                              getDueInText(bill.dueDate) === "..Overdue" ? "text-red-600" : "text-amber-600"
                            }`}>
                              {getDueInText(bill.dueDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-cyan-900">
                          ${typeof bill.amount === 'number' ? bill.amount.toFixed(2) : bill.amount || "0.00"}
                        </span>
                        <Link href={`/Bills?pay=${bill.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="rounded-lg bg-cyan-500/20 px-2.5 py-1 text-xs font-medium text-cyan-700 hover:bg-cyan-500/30 transition-colors"
                          >
                            Pay
                          </motion.button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column – Withdrawal + Quick Stats */}
          <div className="space-y-6">
            {/* Withdrawal Section */}
            <motion.div
              custom={9}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02, boxShadow: "0 20px 50px rgba(0,0,0,0.08)" }}
              className="rounded-2xl border-none bg-[#C4F8FD] shadow-xl p-6 backdrop-blur-sm shadow-xl"
            >
              <h2 className="text-sm font-semibold text-cyan-900 mb-4">Withdrawal</h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-cyan-700/70 mb-1">Payment Method</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setWithdrawalMethod("bank")}
                      className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        withdrawalMethod === "bank"
                          ? "bg-none text-cyan-900 ring-1 ring-cyan-500/50 shadow-xl"
                          : "bg-none text-cyan-700 hover:bg-none"
                      }`}
                    >
                      <Banknote size={14} className="inline mr-1" /> Bank
                    </button>
                    <button
                      onClick={() => setWithdrawalMethod("crypto")}
                      className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        withdrawalMethod === "crypto"
                          ? "bg-none text-cyan-900 ring-1 ring-cyan-500/50 shadow-xl"
                          : "bg-none text-cyan-700 hover:bg-none"
                      }`}
                    >
                      <Wallet size={14} className="inline mr-1" /> Crypto
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-cyan-700/70 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-700/60">$</span>
                    <input
                      type="number"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      className="w-full rounded-lg border border-cyan-200/50 shadow-xl bg-none pl-8 pr-3 py-2 text-sm text-cyan-900
                       placeholder:text-cyan-700/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {withdrawalMethod === "bank" ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-cyan-700/70 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Enter bank name"
                        className="w-full rounded-lg border border-cyan-200/50  shadow-xl bg-none px-3 py-2 text-sm 
                        text-cyan-900 placeholder:text-cyan-700/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cyan-700/70 mb-1">Account Name</label>
                      <input
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Enter account name"
                        className="w-full rounded-lg border border-cyan-200/50  shadow-xl bg-none px-3 py-2 text-sm text-cyan-900
                         placeholder:text-cyan-700/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cyan-700/70 mb-1">Account Number</label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Enter account number"
                        className="w-full rounded-lg border border-cyan-200/50  shadow-xl bg-none px-3 py-2 text-sm 
                        text-cyan-900 placeholder:text-cyan-700/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-cyan-700/70 mb-1">Wallet Address</label>
                      <input
                        type="text"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder="Enter wallet address"
                        className="w-full rounded-lg border border-cyan-200/50  shadow-xl bg-none px-3 py-2 text-sm 
                        text-cyan-900 placeholder:text-cyan-700/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cyan-700/70 mb-1">Network</label>
                      <select
                        value={network}
                        onChange={(e) => setNetwork(e.target.value)}
                        className="w-full rounded-lg border border-cyan-200/50  shadow-xl bg-none px-3 py-2 text-sm 
                        text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      >
                        <option value="">Select Network</option>
                        <option value="ethereum">Ethereum (ERC-20)</option>
                        <option value="bsc">Binance Smart Chain (BEP-20)</option>
                        <option value="solana">Solana</option>
                        <option value="bitcoin">Bitcoin</option>
                        <option value="polygon">Polygon</option>
                      </select>
                    </div>
                  </>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowWithdrawalModal(true)}
                  disabled={isWithdrawDisabled()}
                  className={`w-full rounded-xl py-2.5 font-bold text-white shadow-xl transition-all text-sm ${
                    isWithdrawDisabled()
                      ? "bg-gray-400 cursor-not-allowed shadow-none"
                      : "bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/30 hover:from-amber-400 hover:to-orange-500"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <ArrowRight size={16} /> Withdraw
                  </span>
                </motion.button>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              custom={11}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02, boxShadow: "0 20px 50px rgba(0,0,0,0.06)" }}
              className="flex items-center justify-between rounded-xl bg-white/40 px-4 py-3 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-500/20 p-1.5">
                  <CheckCircle size={14} className="text-emerald-600" />
                </div>
                <span className="text-sm text-cyan-800">All cards are active</span>
              </div>
              <ChevronRight size={18} className="text-cyan-700/40" />
            </motion.div>
          </div>
        </div>

      </motion.div>

      <AnimatePresence>
        {showWithdrawalModal && (
          <WithdrawalModal
            isOpen={showWithdrawalModal}
            onClose={() => setShowWithdrawalModal(false)}
            onWithdraw={handleWithdraw}
            pendingBills={pendingBills}
          />
        )}
      </AnimatePresence>
    </div>
  );
}