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
import WithdrawalReceiptModal from '@/app/components/WithdrawalReceiptModal';
import WithdrawBlockedModal, { type BlockType } from '@/app/components/WithdrawBlockedModal';
import TransactionPinModal, { type PinMode } from '@/app/components/TransactionPinModal';
import { setTransactionPin, getPinStatus } from '@/app/actions/pin';
import { formatCurrency, formatDueIn } from '@/lib/format';
import { filterBlockingBills } from '@/lib/bills';

// ============================================================================
// SAFE RANDOM GENERATORS
// ============================================================================

const generateSecureRandom = (length: number = 8): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

const generateUniqueId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36);
  const random = generateSecureRandom(6);
  return `${prefix}${timestamp}_${random}`;
};

const generateWithdrawalReference = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = generateSecureRandom(4);
  return `AshTrust REF:${timestamp}${random.toUpperCase()}`;
};

const generateRandomCardNumber = (): string => {
  let num = '';
  for (let i = 0; i < 16; i++) {
    const randomDigit = crypto.getRandomValues(new Uint8Array(1))[0] % 10;
    num += randomDigit.toString();
  }
  return num;
};

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
  status?: "pending" | "paid" | "unpaid" | "overdue";
}

// ============================================================================
// DATA
// ============================================================================

const cards: CardData[] = [
  {
    id: "1",
    type: "virtual",
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
    username: "....",
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
// CARD DISPLAY
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
              aria-label={isNumberVisible ? "Hide card number" : "Show card number"}
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
                <p className="text-xs font-medium text-white">PREMIUM</p>
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
  userWithdrawalDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    swiftCode?: string;
    iban?: string;
    walletAddress?: string;
    network?: string;
    accounts?: any[];
  } | null;
  withdrawalAmount?: string;
}

const WithdrawalModal = ({
  isOpen,
  onClose,
  onWithdraw,
  pendingBills,
  userWithdrawalDetails,
  withdrawalAmount = "0.00"
}: WithdrawalModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "crypto">("bank");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  useEffect(() => {
    if (isOpen && userWithdrawalDetails?.accounts && userWithdrawalDetails.accounts.length > 0) {
      const defaultAcc = userWithdrawalDetails.accounts.find((a: any) => a.isDefault) || userWithdrawalDetails.accounts[0];
      setSelectedAccountId(defaultAcc.id);
    }
  }, [isOpen, userWithdrawalDetails?.accounts]);

  if (!isOpen) return null;

  const allPaid = pendingBills.length === 0;

  const bankDetails = userWithdrawalDetails || {
    bankName: "Not Set",
    accountName: "Not Set",
    accountNumber: "Not Set",
    swiftCode: "Not Set",
    iban: "Not Set",
    walletAddress: "Not Set",
    network: "Not Set",
    accounts: [],
  };

  const selectedAccount = userWithdrawalDetails?.accounts?.find(
    (acc: any) => acc.id === selectedAccountId
  ) || userWithdrawalDetails?.accounts?.[0] || {
    bankName: bankDetails.bankName,
    accountName: bankDetails.accountName,
    accountNumber: bankDetails.accountNumber,
    swiftCode: bankDetails.swiftCode,
  };

  const formattedAmount = formatCurrency(withdrawalAmount);

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
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#C4F8FD] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-cyan-900 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-600" />
            {allPaid ? "Withdrawal Details" : "Unpaid Bills"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-cyan-700 hover:bg-white/40 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {!allPaid ? (
          <>
            <div className="rounded-xl bg-amber-500/20 p-4 mb-4 border border-amber-500/40">
              <p className="text-sm text-amber-900 flex items-start gap-2">
                <span className="text-amber-700 mt-0.5">⚠️</span>
                <span>You have <strong className="text-cyan-900">{pendingBills.length}</strong> unpaid bill(s). Please clear these bills before requesting for a withdrawal</span>
              </p>
            </div>

            <div className="space-y-3 mb-4">
              {pendingBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between rounded-lg bg-white/50 p-3 border border-cyan-200/40">
                  <div>
                    <p className="text-sm font-medium text-cyan-900">{bill.name || bill.title || "Unnamed Bill"}</p>
                    <div className="flex items-center gap-2 text-xs text-cyan-700">
                      <Calendar size={12} />
                      <span>Due: {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "N/A"}</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-amber-700">
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
            <div className="rounded-xl bg-amber-500/20 p-4 mb-4 border border-amber-500/40">
              <p className="text-sm text-center text-amber-900">
                Enter your withdrawal details and click withdraw to confirm
              </p>
            </div>

            <div className="space-y-4">
              {/* Amount (read-only display) */}
              <div>
                <label className="text-sm font-medium text-cyan-700 block mb-1">Amount</label>
                <div className="rounded-lg border border-cyan-200/50 bg-white/50 px-4 py-3 text-cyan-900 select-none">
                  <span className="text-lg font-bold text-amber-600">${formattedAmount}</span>
                </div>
              </div>

              {/* Payment method */}
              <div>
                <label className="text-sm font-medium text-cyan-700 block mb-1">Payment Method</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank")}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      paymentMethod === "bank"
                        ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                        : "bg-white/50 text-cyan-700 hover:bg-white/70"
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
                        : "bg-white/50 text-cyan-700 hover:bg-white/70"
                    }`}
                  >
                    <Wallet size={16} className="inline mr-2" /> Crypto
                  </button>
                </div>
              </div>

              {paymentMethod === "bank" ? (
                <>
                  {userWithdrawalDetails?.accounts && userWithdrawalDetails.accounts.length > 0 ? (
                    <div>
                      <label className="text-sm font-medium text-cyan-700 block mb-1">Select Account</label>
                      <select
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        className="w-full rounded-lg border border-cyan-200/50 bg-white/50 px-4 py-3 text-cyan-900 focus:border-cyan-500 focus:outline-none"
                      >
                        {userWithdrawalDetails.accounts.map((acc: any) => (
                          <option key={acc.id} value={acc.id} className="bg-white text-cyan-900">
                            {acc.bankName} - {acc.accountNumber} {acc.isDefault ? '(Default)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-amber-500/20 p-3 border border-amber-500/40">
                      <p className="text-sm text-amber-900">No bank accounts set up. Please go to Settings to add your bank details.</p>
                    </div>
                  )}

                  {selectedAccount && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-cyan-700 block mb-1">Bank Name</label>
                        <div className="rounded-lg border border-cyan-200/50 bg-white/50 px-4 py-3 text-cyan-900 select-none">
                          {selectedAccount.bankName || bankDetails.bankName}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-cyan-700 block mb-1">Account Name</label>
                        <div className="rounded-lg border border-cyan-200/50 bg-white/50 px-4 py-3 text-cyan-900 select-none">
                          {selectedAccount.accountName || bankDetails.accountName}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-cyan-700 block mb-1">Account Number</label>
                        <div className="rounded-lg border border-cyan-200/50 bg-white/50 px-4 py-3 text-cyan-900 select-none">
                          {selectedAccount.accountNumber || bankDetails.accountNumber}
                        </div>
                      </div>
                      {selectedAccount.swiftCode && selectedAccount.swiftCode !== "Not Set" && (
                        <div>
                          <label className="text-sm font-medium text-cyan-700 block mb-1">SWIFT Code</label>
                          <div className="rounded-lg border border-cyan-200/50 bg-white/50 px-4 py-3 text-cyan-900 select-none">
                            {selectedAccount.swiftCode}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-cyan-700 block mb-1">Wallet Address</label>
                    <div className="rounded-lg border border-cyan-200/50 bg-white/50 px-4 py-3 text-cyan-900 select-none break-all">
                      {bankDetails.walletAddress}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-cyan-700 block mb-1">Network</label>
                    <div className="rounded-lg border border-cyan-200/50 bg-white/50 px-4 py-3 text-cyan-900 select-none">
                      {bankDetails.network}
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
// LOADING SKELETON
// ============================================================================

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="h-20 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /></div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /></div>
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

export default function CardsPage() {
  const primaryCard = cards[0];

  const [isMounted, setIsMounted] = useState(false);
  const [isNumberVisible, setIsNumberVisible] = useState(true);
  const [displayNumber, setDisplayNumber] = useState("");

  const [withdrawalMethod, setWithdrawalMethod] = useState<"bank" | "crypto">("bank");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [network, setNetwork] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [displayAmount, setDisplayAmount] = useState("");

  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [pendingBills, setPendingBills] = useState<Bill[]>([]);
  const [loadingBills, setLoadingBills] = useState(true);

  const [blockedInfo, setBlockedInfo] = useState<{
    type: BlockType;
    title?: string;
    message: string;
    bills?: Bill[];
    currentBalance?: number;
    requestedAmount?: number;
    actionLabel?: string;
    actionHref?: string;
  } | null>(null);

  // ── Phase J: PIN modal state ────────────────────────────────────────
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinMode, setPinMode] = useState<PinMode>('enter');
  const [pinAttemptsLeft, setPinAttemptsLeft] = useState<number | null>(null);

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [userData, setUserData] = useState<{
    username: string;
    email: string;
    displayName?: string
  }>({
    username: '',
    email: ''
  });
  const [isSavingWithdrawal, setIsSavingWithdrawal] = useState(false);
  const [userWithdrawalDetails, setUserWithdrawalDetails] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    setDisplayNumber(generateRandomCardNumber());
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const interval = setInterval(() => {
      setDisplayNumber(generateRandomCardNumber());
    }, 20000);
    return () => clearInterval(interval);
  }, [isMounted]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUserData({
          username: parsed.username || parsed.displayName || 'User',
          email: parsed.email || '',
          displayName: parsed.displayName || parsed.username
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const fetchWithdrawalDetails = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/user/withdrawal', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.details) {
          setUserWithdrawalDetails(result.data.details);
        } else {
          setUserWithdrawalDetails(null);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching withdrawal details:', error);
    }
  };

  useEffect(() => {
    fetchWithdrawalDetails();
  }, []);

  useEffect(() => {
    if (userWithdrawalDetails) {
      if (userWithdrawalDetails.bankName && userWithdrawalDetails.bankName !== "Not Set") {
        setBankName(userWithdrawalDetails.bankName);
      }
      if (userWithdrawalDetails.accountName && userWithdrawalDetails.accountName !== "Not Set") {
        setAccountName(userWithdrawalDetails.accountName);
      }
      if (userWithdrawalDetails.accounts && userWithdrawalDetails.accounts.length > 0) {
        const defaultAcc = userWithdrawalDetails.accounts.find((a: any) => a.isDefault) || userWithdrawalDetails.accounts[0];
        if (defaultAcc) {
          setAccountNumber(defaultAcc.accountNumber);
        }
      } else if (userWithdrawalDetails.accountNumber && userWithdrawalDetails.accountNumber !== "Not Set") {
        setAccountNumber(userWithdrawalDetails.accountNumber);
      }
      if (userWithdrawalDetails.walletAddress && userWithdrawalDetails.walletAddress !== "Not Set") {
        setWalletAddress(userWithdrawalDetails.walletAddress);
      }
      if (userWithdrawalDetails.network && userWithdrawalDetails.network !== "Not Set") {
        setNetwork(userWithdrawalDetails.network);
      }
    }
  }, [userWithdrawalDetails]);

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
          // Uses the shared lib/bills filter — single source of truth.
          setPendingBills(filterBlockingBills(data.bills || []));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingBills(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '');
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      setWithdrawalAmount(raw);
      setDisplayAmount(formatCurrency(raw));
    } else if (raw === '' || raw === '-') {
      setWithdrawalAmount('');
      setDisplayAmount('');
    }
  };

  const handleAmountBlur = () => {
    if (withdrawalAmount) {
      setDisplayAmount(formatCurrency(withdrawalAmount));
    }
  };

  const handleAmountFocus = () => {
    setDisplayAmount(withdrawalAmount);
  };

  // ── Step 1: Form submitted → check PIN status → open PIN modal ───────
  const handleFormWithdraw = useCallback(async () => {
    try {
      const userDataRaw = localStorage.getItem('user');
      if (!userDataRaw) {
        setBlockedInfo({
          type: 'general',
          title: 'Session Error',
          message: 'Could not read your user info. Please log in again.',
        });
        return;
      }
      const user = JSON.parse(userDataRaw);
      const userId = user._id || user.id;

      const status = await getPinStatus(userId);

      if (!status.success) {
        setBlockedInfo({
          type: 'general',
          title: 'PIN Check Failed',
          message: 'Could not check your PIN status. Please try again.',
        });
        return;
      }

      if (status.locked) {
        setPinMode('locked');
        setPinAttemptsLeft(null);
        setPinModalOpen(true);
        return;
      }

      if (!status.hasPin) {
        setPinMode('set');
        setPinAttemptsLeft(null);
        setPinModalOpen(true);
        return;
      }

      setPinMode('enter');
      setPinAttemptsLeft(null);
      setPinModalOpen(true);
    } catch (err) {
      console.error('[withdraw] PIN status check failed:', err);
      setBlockedInfo({
        type: 'general',
        title: 'Error',
        message: 'Something went wrong. Please try again.',
      });
    }
  }, []);

  // ── Step 2: PIN completed → set (if needed) → POST withdrawal ────────
  const handlePinComplete = useCallback(async (pin: string) => {
    try {
      setIsSavingWithdrawal(true);

      const token = localStorage.getItem('auth_token');
      const userDataRaw = localStorage.getItem('user');
      const user = userDataRaw ? JSON.parse(userDataRaw) : {};
      const userId = user._id || user.id;

      // If we're in "set" mode, save the PIN first
      if (pinMode === 'set') {
        const setResult = await setTransactionPin(userId, pin);
        if (!setResult.success) {
          return { success: false, error: setResult.error || 'Failed to save PIN' };
        }
      }

      const withdrawalPayload = {
        method: withdrawalMethod,
        amount: parseFloat(withdrawalAmount),
        bankName: bankName,
        accountName: accountName,
        accountNumber: accountNumber,
        walletAddress: walletAddress,
        network: network,
        pin,
      };

      const response = await fetch('/api/user/withdrawal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(withdrawalPayload)
      });

      const result = await response.json();

      if (!response.ok) {
        const reason = result?.reason;

        // ── PIN errors: keep the PIN modal open, show inline error ──
        if (reason === 'pin_wrong') {
          if (result.locked) {
            setPinMode('locked');
            setPinAttemptsLeft(null);
            return { success: false, error: 'PIN locked. Contact support for a reset code.' };
          }
          setPinAttemptsLeft(typeof result.remaining === 'number' ? result.remaining : null);
          return {
            success: false,
            error: result.error || 'Incorrect PIN',
            remaining: result.remaining,
          };
        }
        if (reason === 'pin_locked') {
          setPinMode('locked');
          return { success: false, error: 'PIN locked. Contact support for a reset code.' };
        }
        if (reason === 'pin_not_set') {
          setPinMode('set');
          return { success: false, error: 'Please set a PIN first.' };
        }
        if (reason === 'pin_invalid_format') {
          return { success: false, error: 'PIN must be exactly 4 digits.' };
        }

        // ── Other errors: close PIN modal + form, show blocked modal ──
        setPinModalOpen(false);
        setShowWithdrawalModal(false);

        if (reason === 'unpaid_bills') {
          try {
            const billsRes = await fetch(`/api/user/dashboard?userId=${userId}`, {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            const billsJson = await billsRes.json();
            if (billsJson.success && billsJson.data) {
              // Uses shared filter
              const pending = filterBlockingBills(billsJson.data.bills || []);
              setPendingBills(pending);
              const n = pending.length || result.unpaidCount || 1;
              setBlockedInfo({
                type: 'unpaid_bills',
                title: 'Unpaid Bills',
                message: `You have ${n} unpaid bill${n === 1 ? '' : 's'}. Please clear ${n === 1 ? 'it' : 'them'} before requesting a withdrawal.`,
                bills: pending,
                actionLabel: 'Go to Bills',
                actionHref: '/Bills',
              });
              return;
            }
          } catch (refreshErr) {
            console.warn('[withdraw] pendingBills refresh failed:', refreshErr);
          }
          setBlockedInfo({
            type: 'unpaid_bills',
            title: 'Unpaid Bills',
            message: result.error || 'Please clear your unpaid bills before requesting a withdrawal.',
            actionLabel: 'Go to Bills',
            actionHref: '/Bills',
          });
          return;
        }

        if (/insufficient/i.test(result.error || '')) {
          setBlockedInfo({
            type: 'insufficient_funds',
            title: 'Insufficient Funds',
            message: result.error || 'You do not have enough balance to complete this withdrawal.',
            requestedAmount: parseFloat(withdrawalAmount),
          });
          return;
        }

        setBlockedInfo({
          type: 'general',
          title: 'Withdrawal Failed',
          message: result.error || 'Failed to process withdrawal. Please try again.',
        });
        return;
      }

      // ── Success ──
      setReceiptData({
        reference: result.data.history.reference,
        amount: parseFloat(withdrawalAmount),
        method: withdrawalMethod,
        bankName: bankName,
        accountName: accountName,
        accountNumber: accountNumber,
        walletAddress: walletAddress,
        network: network,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      setPinModalOpen(false);
      setShowWithdrawalModal(false);
      setShowReceiptModal(true);
      setWithdrawalAmount('');
      setDisplayAmount('');

      await fetchWithdrawalDetails();
      return { success: true };
    } catch (error) {
      console.error('❌ Withdrawal error:', error);
      setPinModalOpen(false);
      setShowWithdrawalModal(false);
      setBlockedInfo({
        type: 'general',
        title: 'Withdrawal Failed',
        message: 'An error occurred. Please try again.',
      });
    } finally {
      setIsSavingWithdrawal(false);
    }
  }, [
    pinMode,
    withdrawalMethod,
    withdrawalAmount,
    bankName,
    accountName,
    accountNumber,
    walletAddress,
    network,
  ]);

  const isWithdrawDisabled = () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) return true;
    if (withdrawalMethod === 'bank') {
      return !bankName || !accountName || !accountNumber;
    } else {
      return !walletAddress || !network;
    }
  };

  const openWithdrawalModal = () => {
    // Pre-check: unpaid/overdue bills block the user before the form even opens
    if (pendingBills.length > 0) {
      const n = pendingBills.length;
      setBlockedInfo({
        type: 'unpaid_bills',
        title: 'Unpaid Bills',
        message: `You have ${n} unpaid bill${n === 1 ? '' : 's'}. Please clear ${n === 1 ? 'it' : 'them'} before requesting a withdrawal.`,
        bills: pendingBills,
        actionLabel: 'Go to Bills',
        actionHref: '/Bills',
      });
      return;
    }
    setShowWithdrawalModal(true);
  };

  const closeWithdrawalModal = () => {
    setShowWithdrawalModal(false);
  };

  const closePinModal = () => {
    setPinModalOpen(false);
    setPinAttemptsLeft(null);
  };

  return (
    <div className="min-h-screen bg-[#C4F8FD] p-4 sm:p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-6xl"
      >
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <CardDisplay
              card={primaryCard}
              displayNumber={isMounted ? displayNumber : "•••• •••• •••• ••••"}
              isNumberVisible={isNumberVisible}
              onToggleVisibility={() => setIsNumberVisible(!isNumberVisible)}
              index={1}
            />

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
                              formatDueIn(bill.dueDate) === "Overdue" ? "text-red-600" : "text-amber-600"
                            }`}>
                              {formatDueIn(bill.dueDate)}
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

          <div className="space-y-6">
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
                      type="text"
                      value={displayAmount || withdrawalAmount}
                      onChange={handleAmountChange}
                      onBlur={handleAmountBlur}
                      onFocus={handleAmountFocus}
                      placeholder="0.00"
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
                      <label className="block text-xs font-medium text-cyan-900 mb-1">Network</label>
                      <select
                        value={network}
                        onChange={(e) => setNetwork(e.target.value)}
                        className="w-full rounded-xl border border-none  shadow-xl bg-none px-3 py-2 text-sm
                        text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      >
                        <option value="" className="text-cyan-900">Select Network</option>
                        <option value="ethereum" className="text-cyan-900">Ethereum (ERC-20)</option>
                        <option value="bsc" className="text-cyan-900">Binance Smart Chain (BEP-20)</option>
                        <option value="solana" className="text-cyan-900">Solana</option>
                        <option value="bitcoin" className="text-cyan-900">Bitcoin</option>
                        <option value="polygon" className="text-cyan-900">Polygon</option>
                      </select>
                    </div>
                  </>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openWithdrawalModal}
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
                  <CheckCircle size={14} className="font-light text-emerald-600" />
                </div>
                <span className="text-sm text-cyan-800">this card is active</span>
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
            onClose={closeWithdrawalModal}
            onWithdraw={handleFormWithdraw}
            pendingBills={pendingBills}
            userWithdrawalDetails={userWithdrawalDetails}
            withdrawalAmount={withdrawalAmount}
          />
        )}

        {pinModalOpen && (
          <TransactionPinModal
            isOpen={pinModalOpen}
            mode={pinMode}
            onClose={closePinModal}
            onComplete={handlePinComplete}
            attemptsRemaining={pinAttemptsLeft}
          />
        )}

        {showReceiptModal && receiptData && (
          <WithdrawalReceiptModal
            isOpen={showReceiptModal}
            onClose={() => setShowReceiptModal(false)}
            withdrawalData={receiptData}
            userData={userData}
          />
        )}

        {blockedInfo && (
          <WithdrawBlockedModal
            isOpen={true}
            onClose={() => setBlockedInfo(null)}
            type={blockedInfo.type}
            title={blockedInfo.title}
            message={blockedInfo.message}
            bills={blockedInfo.bills}
            currentBalance={blockedInfo.currentBalance}
            requestedAmount={blockedInfo.requestedAmount}
            actionLabel={blockedInfo.actionLabel}
            actionHref={blockedInfo.actionHref}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// // app/cards/page.tsx
// "use client";

// import React, { useState, useCallback, useMemo, memo, useEffect, Suspense, lazy } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   CreditCard,
//   Eye,
//   EyeOff,
//   CheckCircle,
//   Banknote,
//   Wallet,
//   ArrowRight,
//   AlertTriangle,
//   X,
//   Calendar,
//   Loader2,
//   ChevronRight,
// } from "lucide-react";
// import Link from "next/link";
// import WithdrawalReceiptModal from '@/app/components/WithdrawalReceiptModal';
// import WithdrawBlockedModal, { type BlockType } from '@/app/components/WithdrawBlockedModal';
// import TransactionPinModal, { type PinMode } from '@/app/components/TransactionPinModal';
// import { setTransactionPin, getPinStatus } from '@/app/actions/pin';

// // ============================================================================
// // CURRENCY FORMATTING HELPER
// // ============================================================================

// const formatCurrency = (value: string | number): string => {
//   if (!value) return '0.00';
//   const num = typeof value === 'string' ? parseFloat(value) : value;
//   if (isNaN(num)) return '0.00';
//   return num.toLocaleString('en-US', {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2
//   });
// };

// // ============================================================================
// // SAFE RANDOM GENERATORS
// // ============================================================================

// const generateSecureRandom = (length: number = 8): string => {
//   const array = new Uint8Array(length);
//   crypto.getRandomValues(array);
//   return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
// };

// const generateUniqueId = (prefix: string = ''): string => {
//   const timestamp = Date.now().toString(36);
//   const random = generateSecureRandom(6);
//   return `${prefix}${timestamp}_${random}`;
// };

// const generateWithdrawalReference = (): string => {
//   const timestamp = Date.now().toString().slice(-6);
//   const random = generateSecureRandom(4);
//   return `AshTrust REF:${timestamp}${random.toUpperCase()}`;
// };

// const generateRandomCardNumber = (): string => {
//   let num = '';
//   for (let i = 0; i < 16; i++) {
//     const randomDigit = crypto.getRandomValues(new Uint8Array(1))[0] % 10;
//     num += randomDigit.toString();
//   }
//   return num;
// };

// // ============================================================================
// // TYPES
// // ============================================================================

// interface CardData {
//   id: string;
//   type: "physical" | "virtual";
//   number: string;
//   expires: string;
//   username?: string;
//   brand: "visa" | "mastercard" | "amex";
//   isActive: boolean;
//   lastUsed?: string;
//   limit?: string;
//   spent?: string;
// }

// interface Bill {
//   id: string;
//   name: string;
//   title?: string;
//   amount: number | string;
//   dueDate?: string;
//   category: string;
//   status?: "pending" | "paid" | "overdue";
// }

// // ============================================================================
// // DATA
// // ============================================================================

// const cards: CardData[] = [
//   {
//     id: "1",
//     type: "virtual",
//     number: "4532 7891 2345 6789",
//     expires: "12/28",
//     brand: "visa",
//     isActive: true,
//   },
//   {
//     id: "2",
//     type: "virtual",
//     number: "9876 5432 1098 7654",
//     expires: "09/25",
//     username: "....",
//     brand: "visa",
//     isActive: true,
//   },
// ];

// // ============================================================================
// // ANIMATION VARIANTS
// // ============================================================================

// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: { staggerChildren: 0.05, delayChildren: 0.05 },
//   },
// };

// const cardVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: (delay: number = 0) => ({
//     opacity: 1,
//     y: 0,
//     transition: { delay: delay * 0.08, duration: 0.4, ease: "easeOut" as const },
//   }),
// };

// const itemVariants = {
//   hidden: { opacity: 0, x: -10 },
//   visible: (delay: number = 0) => ({
//     opacity: 1,
//     x: 0,
//     transition: { delay: delay * 0.06, duration: 0.3, ease: "easeOut" as const },
//   }),
// };

// // ============================================================================
// // CARD DISPLAY
// // ============================================================================

// interface CardDisplayProps {
//   card: CardData;
//   displayNumber: string;
//   isNumberVisible: boolean;
//   onToggleVisibility: () => void;
//   index?: number;
// }

// const CardDisplay = memo(({
//   card,
//   displayNumber,
//   isNumberVisible,
//   onToggleVisibility,
//   index = 0,
// }: CardDisplayProps) => {
//   const brandColors = {
//     visa: "from-blue-600 to-blue-800",
//     mastercard: "from-red-500 to-orange-500",
//     amex: "from-blue-400 to-cyan-500",
//   };

//   const formattedNumber = displayNumber.replace(/(.{4})/g, '$1 ').trim();
//   const maskedNumber = "•••• •••• •••• ••••";

//   return (
//     <motion.div
//       custom={index}
//       variants={cardVariants}
//       initial="hidden"
//       animate="visible"
//       className="relative"
//       whileHover={{ y: -4 }}
//       transition={{ duration: 0.2 }}
//     >
//       <div className="relative h-[200px] w-full rounded-2xl sm:h-[220px]">
//         <div
//           className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${brandColors[card.brand]} p-5 shadow-xl shadow-${card.brand}-500/20`}
//         >
//           <div className="flex items-start justify-between">
//             <div className="rounded-lg bg-gradient-to-br from-yellow-300 to-yellow-500 p-1.5 shadow-lg">
//               <div className="h-8 w-12 rounded border border-yellow-400/30" />
//             </div>
//             <div className="flex items-center gap-1">
//               <span className="text-xs font-medium text-white/60">
//                 {card.type.toUpperCase()}
//               </span>
//               <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white">
//                 {card.brand.toUpperCase()}
//               </span>
//             </div>
//           </div>

//           <div className="mt-4 flex items-center justify-between">
//             <p className="font-mono text-lg font-semibold tracking-wider text-white sm:text-xl">
//               {isNumberVisible ? formattedNumber : maskedNumber}
//             </p>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onToggleVisibility();
//               }}
//               className="rounded-full bg-white/20 p-1.5 text-white transition-colors hover:bg-white/30"
//             >
//               {isNumberVisible ? <EyeOff size={18} /> : <Eye size={18} />}
//             </button>
//           </div>

//           <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
//             <div>
//               <p className="text-[10px] font-medium uppercase tracking-wider text-white/60">
//                 Expires
//               </p>
//               <p className="font-mono text-sm font-semibold text-white">
//                 {card.expires}
//               </p>
//             </div>
//             {card.type === "physical" && (
//               <div className="rounded-lg bg-white/20 px-3 py-1">
//                 <p className="text-xs font-medium text-white">PREMIUM</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// });
// CardDisplay.displayName = 'CardDisplay';

// // ============================================================================
// // WITHDRAWAL MODAL
// // ============================================================================

// interface WithdrawalModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onWithdraw: (data: any) => void;
//   pendingBills: Bill[];
//   userWithdrawalDetails?: {
//     bankName: string;
//     accountName: string;
//     accountNumber: string;
//     swiftCode?: string;
//     iban?: string;
//     walletAddress?: string;
//     network?: string;
//     accounts?: any[];
//   } | null;
//   withdrawalAmount?: string;
// }

// const WithdrawalModal = ({
//   isOpen,
//   onClose,
//   onWithdraw,
//   pendingBills,
//   userWithdrawalDetails,
//   withdrawalAmount = "0.00"
// }: WithdrawalModalProps) => {
//   const [paymentMethod, setPaymentMethod] = useState<"bank" | "crypto">("bank");
//   const [selectedAccountId, setSelectedAccountId] = useState<string>("");

//   useEffect(() => {
//     if (isOpen && userWithdrawalDetails?.accounts && userWithdrawalDetails.accounts.length > 0) {
//       const defaultAcc = userWithdrawalDetails.accounts.find((a: any) => a.isDefault) || userWithdrawalDetails.accounts[0];
//       setSelectedAccountId(defaultAcc.id);
//     }
//   }, [isOpen, userWithdrawalDetails?.accounts]);

//   if (!isOpen) return null;

//   const allPaid = pendingBills.length === 0;

//   const bankDetails = userWithdrawalDetails || {
//     bankName: "Not Set",
//     accountName: "Not Set",
//     accountNumber: "Not Set",
//     swiftCode: "Not Set",
//     iban: "Not Set",
//     walletAddress: "Not Set",
//     network: "Not Set",
//     accounts: [],
//   };

//   const selectedAccount = userWithdrawalDetails?.accounts?.find(
//     (acc: any) => acc.id === selectedAccountId
//   ) || userWithdrawalDetails?.accounts?.[0] || {
//     bankName: bankDetails.bankName,
//     accountName: bankDetails.accountName,
//     accountNumber: bankDetails.accountNumber,
//     swiftCode: bankDetails.swiftCode,
//   };

//   const formattedAmount = formatCurrency(withdrawalAmount);

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ scale: 0.9, y: 20 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.9, y: 20 }}
//         className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#C4F8FD] p-6 shadow-2xl"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-xl font-bold text-cyan-900 flex items-center gap-2">
//             <AlertTriangle size={20} className="text-amber-600" />
//             {allPaid ? "Withdrawal Details" : "Unpaid Bills"}
//           </h2>
//           <button
//             onClick={onClose}
//             className="rounded-lg p-1 text-cyan-700 hover:bg-white/40 transition-colors"
//             aria-label="Close"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         {!allPaid ? (
//           <>
//             <div className="rounded-xl bg-amber-500/20 p-4 mb-4 border border-amber-500/40">
//               <p className="text-sm text-amber-900 flex items-start gap-2">
//                 <span className="text-amber-700 mt-0.5">⚠️</span>
//                 <span>You have <strong className="text-cyan-900">{pendingBills.length}</strong> unpaid bill(s). Please clear these bills before requesting for a withdrawal</span>
//               </p>
//             </div>

//             <div className="space-y-3 mb-4">
//               {pendingBills.map((bill) => (
//                 <div key={bill.id} className="flex items-center justify-between rounded-lg bg-white/50 p-3 border border-cyan-200/40">
//                   <div>
//                     <p className="text-sm font-medium text-cyan-900">{bill.name || bill.title || "Unnamed Bill"}</p>
//                     <div className="flex items-center gap-2 text-xs text-cyan-700">
//                       <Calendar size={12} />
//                       <span>Due: {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "N/A"}</span>
//                     </div>
//                   </div>
//                   <span className="text-sm font-semibold text-amber-700">
//                     ${typeof bill.amount === 'number' ? bill.amount.toFixed(2) : bill.amount || "0.00"}
//                   </span>
//                 </div>
//               ))}
//             </div>

//             <Link href="/Bills">
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-bold text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500 transition-all"
//               >
//                 <span className="flex items-center justify-center gap-2">
//                   Go to Bills <ArrowRight size={18} />
//                 </span>
//               </motion.button>
//             </Link>
//           </>
//         ) : (
//           <>
//             <div className="rounded-xl bg-amber-500/20 p-4 mb-4 border border-amber-500/40">
//               <p className="text-sm text-center text-amber-900">
//                 Enter your withdrawal details and click withdraw to confirm
//               </p>
//             </div>

//             <div className="space-y-4">
//               {/* Amount (read-only display) */}
//               <div>
//                 <label className="text-sm font-medium text-cyan-700 block mb-1">Amount</label>
//                 <div className="rounded-lg border border-cyan-200/50 bg-white/50 px-4 py-3 text-cyan-900 select-none">
//                   <span className="text-lg font-bold text-amber-600">${formattedAmount}</span>
//                 </div>
//               </div>

//               {/* Payment method */}
//               <div>
//                 <label className="text-sm font-medium text-cyan-700 block mb-1">Payment Method</label>
//                 <div className="flex gap-2">
//                   <button
//                     type="button"
//                     onClick={() => setPaymentMethod("bank")}
//                     className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
//                       paymentMethod === "bank"
//                         ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
//                         : "bg-white/50 text-cyan-700 hover:bg-white/70"
//                     }`}
//                   >
//                     <Banknote size={16} className="inline mr-2" /> Bank
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setPaymentMethod("crypto")}
//                     className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
//                       paymentMethod === "crypto"
//                         ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
//                         : "bg-white/50 text-cyan-700 hover:bg-white/70"
//                     }`}
//                   >
//                     <Wallet size={16} className="inline mr-2" /> Crypto
//                   </button>
//                 </div>
//               </div>

//               {paymentMethod === "bank" ? (
//                 <>
//                   {userWithdrawalDetails?.accounts && userWithdrawalDetails.accounts.length > 0 ? (
//                     <div>
//                       <label className="text-sm font-medium text-cyan-700 block mb-1">Select Account</label>
//                       <select
//                         value={selectedAccountId}
//                         onChange={(e) => setSelectedAccountId(e.target.value)}
//                         className="w-full rounded-lg border border-cyan-200/50 bg-white/50 px-4 py-3 text-cyan-900 focus:border-cyan-500 focus:outline-none"
//                       >
//                         {userWithdrawalDetails.accounts.map((acc: any) => (
//                           <option key={acc.id} value={acc.id} className="bg-white text-cyan-900">
//                             {acc.bankName} - {acc.accountNumber} {acc.isDefault ? '(Default)' : ''}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   ) : (
//                     <div className="rounded-lg bg-amber-500/20 p-3 border border-amber-500/40">
//                       <p className="text-sm text-amber-900">No bank accounts set up. Please go to Settings to add your bank details.</p>
//                     </div>
//                   )}

//                   {selectedAccount && (
//                     <>
//                       <div>
//                         <label className="text-sm font-medium text-cyan-700 block mb-1">Bank Name</label>
//                         <div className="rounded-lg border border-cyan-200/50 bg-white/50 px-4 py-3 text-cyan-900 select-none">
//                           {selectedAccount.bankName || bankDetails.bankName}
//                         </div>
//                       </div>
//                       <div>
//                         <label className="text-sm font-medium text-cyan-700 block mb-1">Account Name</label>
//                         <div className="rounded-lg border border-cyan-200/50 bg-white/50 px-4 py-3 text-cyan-900 select-none">
//                           {selectedAccount.accountName || bankDetails.accountName}
//                         </div>
//                       </div>
//                       <div>
//                         <label className="text-sm font-medium text-cyan-700 block mb-1">Account Number</label>
//                         <div className="rounded-lg border border-cyan-200/50 bg-white/50 px-4 py-3 text-cyan-900 select-none">
//                           {selectedAccount.accountNumber || bankDetails.accountNumber}
//                         </div>
//                       </div>
//                       {selectedAccount.swiftCode && selectedAccount.swiftCode !== "Not Set" && (
//                         <div>
//                           <label className="text-sm font-medium text-cyan-700 block mb-1">SWIFT Code</label>
//                           <div className="rounded-lg border border-cyan-200/50 bg-white/50 px-4 py-3 text-cyan-900 select-none">
//                             {selectedAccount.swiftCode}
//                           </div>
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </>
//               ) : (
//                 <>
//                   <div>
//                     <label className="text-sm font-medium text-cyan-700 block mb-1">Wallet Address</label>
//                     <div className="rounded-lg border border-cyan-200/50 bg-white/50 px-4 py-3 text-cyan-900 select-none break-all">
//                       {bankDetails.walletAddress}
//                     </div>
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium text-cyan-700 block mb-1">Network</label>
//                     <div className="rounded-lg border border-cyan-200/50 bg-white/50 px-4 py-3 text-cyan-900 select-none">
//                       {bankDetails.network}
//                     </div>
//                   </div>
//                 </>
//               )}

//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={() => onWithdraw({ method: paymentMethod })}
//                 className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3.5 font-bold text-white shadow-xl shadow-amber-500/30 hover:from-amber-400 hover:to-orange-500 transition-all"
//               >
//                 <span className="flex items-center justify-center gap-2">
//                   <ArrowRight size={18} /> Withdraw
//                 </span>
//               </motion.button>
//             </div>
//           </>
//         )}
//       </motion.div>
//     </motion.div>
//   );
// };
// // ============================================================================
// // LOADING SKELETON
// // ============================================================================

// const LoadingSkeleton = () => (
//   <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
//     <div className="mx-auto max-w-6xl space-y-4">
//       <div className="h-20 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//       <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /></div>
//       <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /></div>
//     </div>
//   </div>
// );

// // ============================================================================
// // LAZY LOAD THE DASHBOARD COMPONENT
// // ============================================================================

// const Dash = lazy(() => import("@/app/components/Dash"));

// // ============================================================================
// // MAIN CARDS PAGE
// // ============================================================================

// export default function CardsPage() {
//   const primaryCard = cards[0];

//   const [isMounted, setIsMounted] = useState(false);
//   const [isNumberVisible, setIsNumberVisible] = useState(true);
//   const [displayNumber, setDisplayNumber] = useState("");

//   const [withdrawalMethod, setWithdrawalMethod] = useState<"bank" | "crypto">("bank");
//   const [bankName, setBankName] = useState("");
//   const [accountName, setAccountName] = useState("");
//   const [accountNumber, setAccountNumber] = useState("");
//   const [walletAddress, setWalletAddress] = useState("");
//   const [network, setNetwork] = useState("");
//   const [withdrawalAmount, setWithdrawalAmount] = useState("");
//   const [displayAmount, setDisplayAmount] = useState("");

//   const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
//   const [pendingBills, setPendingBills] = useState<Bill[]>([]);
//   const [loadingBills, setLoadingBills] = useState(true);

//   const [blockedInfo, setBlockedInfo] = useState<{
//     type: BlockType;
//     title?: string;
//     message: string;
//     bills?: Bill[];
//     currentBalance?: number;
//     requestedAmount?: number;
//     actionLabel?: string;
//     actionHref?: string;
//   } | null>(null);

//   // ── Phase J: PIN modal state ────────────────────────────────────────
//   const [pinModalOpen, setPinModalOpen] = useState(false);
//   const [pinMode, setPinMode] = useState<PinMode>('enter');
//   const [pinAttemptsLeft, setPinAttemptsLeft] = useState<number | null>(null);

//   const [showReceiptModal, setShowReceiptModal] = useState(false);
//   const [receiptData, setReceiptData] = useState<any>(null);
//   const [userData, setUserData] = useState<{
//     username: string;
//     email: string;
//     displayName?: string
//   }>({
//     username: '',
//     email: ''
//   });
//   const [isSavingWithdrawal, setIsSavingWithdrawal] = useState(false);
//   const [userWithdrawalDetails, setUserWithdrawalDetails] = useState<any>(null);

//   useEffect(() => {
//     setIsMounted(true);
//     setDisplayNumber(generateRandomCardNumber());
//   }, []);

//   useEffect(() => {
//     if (!isMounted) return;
//     const interval = setInterval(() => {
//       setDisplayNumber(generateRandomCardNumber());
//     }, 20000);
//     return () => clearInterval(interval);
//   }, [isMounted]);

//   useEffect(() => {
//     const userData = localStorage.getItem('user');
//     if (userData) {
//       try {
//         const parsed = JSON.parse(userData);
//         setUserData({
//           username: parsed.username || parsed.displayName || 'User',
//           email: parsed.email || '',
//           displayName: parsed.displayName || parsed.username
//         });
//       } catch (e) {
//         console.error('Error parsing user data:', e);
//       }
//     }
//   }, []);

//   const fetchWithdrawalDetails = async () => {
//     try {
//       const token = localStorage.getItem('auth_token');
//       const response = await fetch('/api/user/withdrawal', {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (response.ok) {
//         const result = await response.json();
//         if (result.success && result.data?.details) {
//           setUserWithdrawalDetails(result.data.details);
//         } else {
//           setUserWithdrawalDetails(null);
//         }
//       }
//     } catch (error) {
//       console.error('❌ Error fetching withdrawal details:', error);
//     }
//   };

//   useEffect(() => {
//     fetchWithdrawalDetails();
//   }, []);

//   useEffect(() => {
//     if (userWithdrawalDetails) {
//       if (userWithdrawalDetails.bankName && userWithdrawalDetails.bankName !== "Not Set") {
//         setBankName(userWithdrawalDetails.bankName);
//       }
//       if (userWithdrawalDetails.accountName && userWithdrawalDetails.accountName !== "Not Set") {
//         setAccountName(userWithdrawalDetails.accountName);
//       }
//       if (userWithdrawalDetails.accounts && userWithdrawalDetails.accounts.length > 0) {
//         const defaultAcc = userWithdrawalDetails.accounts.find((a: any) => a.isDefault) || userWithdrawalDetails.accounts[0];
//         if (defaultAcc) {
//           setAccountNumber(defaultAcc.accountNumber);
//         }
//       } else if (userWithdrawalDetails.accountNumber && userWithdrawalDetails.accountNumber !== "Not Set") {
//         setAccountNumber(userWithdrawalDetails.accountNumber);
//       }
//       if (userWithdrawalDetails.walletAddress && userWithdrawalDetails.walletAddress !== "Not Set") {
//         setWalletAddress(userWithdrawalDetails.walletAddress);
//       }
//       if (userWithdrawalDetails.network && userWithdrawalDetails.network !== "Not Set") {
//         setNetwork(userWithdrawalDetails.network);
//       }
//     }
//   }, [userWithdrawalDetails]);

//   useEffect(() => {
//     const fetchDashboard = async () => {
//       try {
//         const userData = localStorage.getItem('user');
//         if (!userData) {
//           setLoadingBills(false);
//           return;
//         }
//         const user = JSON.parse(userData);
//         const userId = user._id || user.id;
//         const token = localStorage.getItem('auth_token');

//         const response = await fetch(`/api/user/dashboard?userId=${userId}`, {
//           headers: { 'Authorization': `Bearer ${token}` },
//         });

//         const result = await response.json();
//         if (result.success && result.data) {
//           const data = result.data;
//           const rawBills = data.bills || [];
//           const pending = rawBills.filter((b: any) => {
//             const status = (b.status || '').trim().toLowerCase();
//             return status === 'pending' || status === 'unpaid' || status === 'overdue';
//           });
//           setPendingBills(pending);
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       } finally {
//         setLoadingBills(false);
//       }
//     };
//     fetchDashboard();
//   }, []);

//   const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const raw = e.target.value.replace(/,/g, '');
//     const num = parseFloat(raw);
//     if (!isNaN(num)) {
//       setWithdrawalAmount(raw);
//       setDisplayAmount(formatCurrency(raw));
//     } else if (raw === '' || raw === '-') {
//       setWithdrawalAmount('');
//       setDisplayAmount('');
//     }
//   };

//   const handleAmountBlur = () => {
//     if (withdrawalAmount) {
//       setDisplayAmount(formatCurrency(withdrawalAmount));
//     }
//   };

//   const handleAmountFocus = () => {
//     setDisplayAmount(withdrawalAmount);
//   };

//   // ── Step 1: Form submitted → check PIN status → open PIN modal ───────
//   const handleFormWithdraw = useCallback(async () => {
//     try {
//       const userDataRaw = localStorage.getItem('user');
//       if (!userDataRaw) {
//         setBlockedInfo({
//           type: 'general',
//           title: 'Session Error',
//           message: 'Could not read your user info. Please log in again.',
//         });
//         return;
//       }
//       const user = JSON.parse(userDataRaw);
//       const userId = user._id || user.id;

//       const status = await getPinStatus(userId);

//       if (!status.success) {
//         setBlockedInfo({
//           type: 'general',
//           title: 'PIN Check Failed',
//           message: 'Could not check your PIN status. Please try again.',
//         });
//         return;
//       }

//       if (status.locked) {
//         setPinMode('locked');
//         setPinAttemptsLeft(null);
//         setPinModalOpen(true);
//         return;
//       }

//       if (!status.hasPin) {
//         setPinMode('set');
//         setPinAttemptsLeft(null);
//         setPinModalOpen(true);
//         return;
//       }

//       setPinMode('enter');
//       setPinAttemptsLeft(null);
//       setPinModalOpen(true);
//     } catch (err) {
//       console.error('[withdraw] PIN status check failed:', err);
//       setBlockedInfo({
//         type: 'general',
//         title: 'Error',
//         message: 'Something went wrong. Please try again.',
//       });
//     }
//   }, []);

//   // ── Step 2: PIN completed → set (if needed) → POST withdrawal ────────
//   const handlePinComplete = useCallback(async (pin: string) => {
//     try {
//       setIsSavingWithdrawal(true);

//       const token = localStorage.getItem('auth_token');
//       const userDataRaw = localStorage.getItem('user');
//       const user = userDataRaw ? JSON.parse(userDataRaw) : {};
//       const userId = user._id || user.id;

//       // If we're in "set" mode, save the PIN first
//       if (pinMode === 'set') {
//         const setResult = await setTransactionPin(userId, pin);
//         if (!setResult.success) {
//           return { success: false, error: setResult.error || 'Failed to save PIN' };
//         }
//       }

//       const withdrawalPayload = {
//         method: withdrawalMethod,
//         amount: parseFloat(withdrawalAmount),
//         bankName: bankName,
//         accountName: accountName,
//         accountNumber: accountNumber,
//         walletAddress: walletAddress,
//         network: network,
//         pin,
//       };

//       const response = await fetch('/api/user/withdrawal', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(withdrawalPayload)
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         const reason = result?.reason;

//         // ── PIN errors: keep the PIN modal open, show inline error ──
//         if (reason === 'pin_wrong') {
//           if (result.locked) {
//             setPinMode('locked');
//             setPinAttemptsLeft(null);
//             return { success: false, error: 'PIN locked. Contact support for a reset code.' };
//           }
//           setPinAttemptsLeft(typeof result.remaining === 'number' ? result.remaining : null);
//           return {
//             success: false,
//             error: result.error || 'Incorrect PIN',
//             remaining: result.remaining,
//           };
//         }
//         if (reason === 'pin_locked') {
//           setPinMode('locked');
//           return { success: false, error: 'PIN locked. Contact support for a reset code.' };
//         }
//         if (reason === 'pin_not_set') {
//           setPinMode('set');
//           return { success: false, error: 'Please set a PIN first.' };
//         }
//         if (reason === 'pin_invalid_format') {
//           return { success: false, error: 'PIN must be exactly 4 digits.' };
//         }

//         // ── Other errors: close PIN modal + form, show blocked modal ──
//         setPinModalOpen(false);
//         setShowWithdrawalModal(false);

//         if (reason === 'unpaid_bills') {
//           try {
//             const billsRes = await fetch(`/api/user/dashboard?userId=${userId}`, {
//               headers: { 'Authorization': `Bearer ${token}` },
//             });
//             const billsJson = await billsRes.json();
//             if (billsJson.success && billsJson.data) {
//               const rawBills = billsJson.data.bills || [];
//               const pending = rawBills.filter((b: any) => {
//                 const status = (b.status || '').trim().toLowerCase();
//                 return status === 'pending' || status === 'unpaid' || status === 'overdue';
//               });
//               setPendingBills(pending);
//               const n = pending.length || result.unpaidCount || 1;
//               setBlockedInfo({
//                 type: 'unpaid_bills',
//                 title: 'Unpaid Bills',
//                 message: `You have ${n} unpaid bill${n === 1 ? '' : 's'}. Please clear ${n === 1 ? 'it' : 'them'} before requesting a withdrawal.`,
//                 bills: pending,
//                 actionLabel: 'Go to Bills',
//                 actionHref: '/Bills',
//               });
//               return;
//             }
//           } catch (refreshErr) {
//             console.warn('[withdraw] pendingBills refresh failed:', refreshErr);
//           }
//           setBlockedInfo({
//             type: 'unpaid_bills',
//             title: 'Unpaid Bills',
//             message: result.error || 'Please clear your unpaid bills before requesting a withdrawal.',
//             actionLabel: 'Go to Bills',
//             actionHref: '/Bills',
//           });
//           return;
//         }

//         if (/insufficient/i.test(result.error || '')) {
//           setBlockedInfo({
//             type: 'insufficient_funds',
//             title: 'Insufficient Funds',
//             message: result.error || 'You do not have enough balance to complete this withdrawal.',
//             requestedAmount: parseFloat(withdrawalAmount),
//           });
//           return;
//         }

//         setBlockedInfo({
//           type: 'general',
//           title: 'Withdrawal Failed',
//           message: result.error || 'Failed to process withdrawal. Please try again.',
//         });
//         return;
//       }

//       // ── Success ──
//       setReceiptData({
//         reference: result.data.history.reference,
//         amount: parseFloat(withdrawalAmount),
//         method: withdrawalMethod,
//         bankName: bankName,
//         accountName: accountName,
//         accountNumber: accountNumber,
//         walletAddress: walletAddress,
//         network: network,
//         status: 'pending',
//         createdAt: new Date().toISOString()
//       });

//       setPinModalOpen(false);
//       setShowWithdrawalModal(false);
//       setShowReceiptModal(true);
//       setWithdrawalAmount('');
//       setDisplayAmount('');

//       await fetchWithdrawalDetails();
//       return { success: true };
//     } catch (error) {
//       console.error('❌ Withdrawal error:', error);
//       setPinModalOpen(false);
//       setShowWithdrawalModal(false);
//       setBlockedInfo({
//         type: 'general',
//         title: 'Withdrawal Failed',
//         message: 'An error occurred. Please try again.',
//       });
//     } finally {
//       setIsSavingWithdrawal(false);
//     }
//   }, [
//     pinMode,
//     withdrawalMethod,
//     withdrawalAmount,
//     bankName,
//     accountName,
//     accountNumber,
//     walletAddress,
//     network,
//   ]);

//   const isWithdrawDisabled = () => {
//     if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) return true;
//     if (withdrawalMethod === 'bank') {
//       return !bankName || !accountName || !accountNumber;
//     } else {
//       return !walletAddress || !network;
//     }
//   };

//   const getDueInText = (dueDate?: string) => {
//     if (!dueDate) return "No due date";
//     const daysLeft = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 3600 * 24));
//     return daysLeft <= 0 ? "Overdue" : `${daysLeft} days`;
//   };

//   const openWithdrawalModal = () => {
//     // Pre-check: unpaid/overdue bills block the user before the form even opens
//     if (pendingBills.length > 0) {
//       const n = pendingBills.length;
//       setBlockedInfo({
//         type: 'unpaid_bills',
//         title: 'Unpaid Bills',
//         message: `You have ${n} unpaid bill${n === 1 ? '' : 's'}. Please clear ${n === 1 ? 'it' : 'them'} before requesting a withdrawal.`,
//         bills: pendingBills,
//         actionLabel: 'Go to Bills',
//         actionHref: '/Bills',
//       });
//       return;
//     }
//     setShowWithdrawalModal(true);
//   };

//   const closeWithdrawalModal = () => {
//     setShowWithdrawalModal(false);
//   };

//   const closePinModal = () => {
//     setPinModalOpen(false);
//     setPinAttemptsLeft(null);
//   };

//   return (
//     <div className="min-h-screen bg-[#C4F8FD] p-4 sm:p-6 lg:p-8">
//       <motion.div
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//         className="mx-auto max-w-6xl"
//       >
//         <motion.div
//           custom={0}
//           variants={cardVariants}
//           initial="hidden"
//           animate="visible"
//           className="mb-6 flex flex-wrap items-center justify-between gap-4"
//         >
//           <div>
//             <h1 className="text-2xl font-bold text-cyan-900 sm:text-3xl"></h1>
//             <h2 className="mt-1 text-md font-bold text-cyan-700/70"></h2>
//           </div>
//         </motion.div>

//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//           <div className="space-y-6">
//             <CardDisplay
//               card={primaryCard}
//               displayNumber={isMounted ? displayNumber : "•••• •••• •••• ••••"}
//               isNumberVisible={isNumberVisible}
//               onToggleVisibility={() => setIsNumberVisible(!isNumberVisible)}
//               index={1}
//             />

//             <motion.div
//               custom={4}
//               variants={cardVariants}
//               initial="hidden"
//               animate="visible"
//               className="rounded-2xl border-none bg-[#C4F8FD] p-5 backdrop-blur-sm shadow-xl"
//             >
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-sm font-semibold text-cyan-900">Pending Bills</h2>
//                 <Link href="/Bills">
//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     className="text-xs font-medium text-cyan-600 hover:text-cyan-800"
//                   >
//                   </motion.button>
//                 </Link>
//               </div>

//               {loadingBills ? (
//                 <div className="flex justify-center py-4">
//                   <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
//                 </div>
//               ) : pendingBills.length === 0 ? (
//                 <div className="text-center py-4 text-cyan-700/60 text-sm">
//                   No pending bills – you're all clear!
//                 </div>
//               ) : (
//                 <div className="space-y-2">
//                   {pendingBills.slice(0, 5).map((bill, index) => (
//                     <motion.div
//                       key={bill.id}
//                       custom={index}
//                       variants={itemVariants}
//                       initial="hidden"
//                       animate="visible"
//                       whileHover={{ scale: 1.02 }}
//                       className="flex items-center justify-between rounded-lg bg-[#C4F8FD] shadow-xl p-3 backdrop-blur-sm transition-all hover:bg-white/30"
//                     >
//                       <div className="flex items-center gap-3">
//                         <div className="rounded-lg bg-white/30 p-1.5">
//                           <Calendar size={14} className="text-amber-600" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium text-cyan-900">
//                             {bill.name || bill.title || "Unnamed Bill"}
//                           </p>
//                           <div className="flex items-center gap-2 text-xs">
//                             <span className="text-cyan-700/60">
//                               Due: {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "N/A"}
//                             </span>
//                             <span className="text-cyan-700/40">•</span>
//                             <span className={`font-medium ${
//                               getDueInText(bill.dueDate) === "Overdue" ? "text-red-600" : "text-amber-600"
//                             }`}>
//                               {getDueInText(bill.dueDate)}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-3">
//                         <span className="text-sm font-semibold text-cyan-900">
//                           ${typeof bill.amount === 'number' ? bill.amount.toFixed(2) : bill.amount || "0.00"}
//                         </span>
//                         <Link href={`/Bills?pay=${bill.id}`}>
//                           <motion.button
//                             whileHover={{ scale: 1.05 }}
//                             whileTap={{ scale: 0.95 }}
//                             className="rounded-lg bg-cyan-500/20 px-2.5 py-1 text-xs font-medium text-cyan-700 hover:bg-cyan-500/30 transition-colors"
//                           >
//                             Pay
//                           </motion.button>
//                         </Link>
//                       </div>
//                     </motion.div>
//                   ))}
//                 </div>
//               )}
//             </motion.div>
//           </div>

//           <div className="space-y-6">
//             <motion.div
//               custom={9}
//               variants={cardVariants}
//               initial="hidden"
//               animate="visible"
//               whileHover={{ scale: 1.02, boxShadow: "0 20px 50px rgba(0,0,0,0.08)" }}
//               className="rounded-2xl border-none bg-[#C4F8FD] shadow-xl p-6 backdrop-blur-sm shadow-xl"
//             >
//               <h2 className="text-sm font-semibold text-cyan-900 mb-4">Withdrawal</h2>

//               <div className="space-y-3">
//                 <div>
//                   <label className="block text-xs font-medium text-cyan-700/70 mb-1">Payment Method</label>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => setWithdrawalMethod("bank")}
//                       className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
//                         withdrawalMethod === "bank"
//                           ? "bg-none text-cyan-900 ring-1 ring-cyan-500/50 shadow-xl"
//                           : "bg-none text-cyan-700 hover:bg-none"
//                       }`}
//                     >
//                       <Banknote size={14} className="inline mr-1" /> Bank
//                     </button>
//                     <button
//                       onClick={() => setWithdrawalMethod("crypto")}
//                       className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
//                         withdrawalMethod === "crypto"
//                           ? "bg-none text-cyan-900 ring-1 ring-cyan-500/50 shadow-xl"
//                           : "bg-none text-cyan-700 hover:bg-none"
//                       }`}
//                     >
//                       <Wallet size={14} className="inline mr-1" /> Crypto
//                     </button>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-cyan-700/70 mb-1">
//                     Amount <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-700/60">$</span>
//                     <input
//                       type="text"
//                       value={displayAmount || withdrawalAmount}
//                       onChange={handleAmountChange}
//                       onBlur={handleAmountBlur}
//                       onFocus={handleAmountFocus}
//                       placeholder="0.00"
//                       className="w-full rounded-lg border border-cyan-200/50 shadow-xl bg-none pl-8 pr-3 py-2 text-sm text-cyan-900
//                        placeholder:text-cyan-700/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
//                     />
//                   </div>
//                 </div>

//                 {withdrawalMethod === "bank" ? (
//                   <>
//                     <div>
//                       <label className="block text-xs font-medium text-cyan-700/70 mb-1">Bank Name</label>
//                       <input
//                         type="text"
//                         value={bankName}
//                         onChange={(e) => setBankName(e.target.value)}
//                         placeholder="Enter bank name"
//                         className="w-full rounded-lg border border-cyan-200/50  shadow-xl bg-none px-3 py-2 text-sm
//                         text-cyan-900 placeholder:text-cyan-700/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-medium text-cyan-700/70 mb-1">Account Name</label>
//                       <input
//                         type="text"
//                         value={accountName}
//                         onChange={(e) => setAccountName(e.target.value)}
//                         placeholder="Enter account name"
//                         className="w-full rounded-lg border border-cyan-200/50  shadow-xl bg-none px-3 py-2 text-sm text-cyan-900
//                          placeholder:text-cyan-700/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-medium text-cyan-700/70 mb-1">Account Number</label>
//                       <input
//                         type="text"
//                         value={accountNumber}
//                         onChange={(e) => setAccountNumber(e.target.value)}
//                         placeholder="Enter account number"
//                         className="w-full rounded-lg border border-cyan-200/50  shadow-xl bg-none px-3 py-2 text-sm
//                         text-cyan-900 placeholder:text-cyan-700/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
//                       />
//                     </div>
//                   </>
//                 ) : (
//                   <>
//                     <div>
//                       <label className="block text-xs font-medium text-cyan-700/70 mb-1">Wallet Address</label>
//                       <input
//                         type="text"
//                         value={walletAddress}
//                         onChange={(e) => setWalletAddress(e.target.value)}
//                         placeholder="Enter wallet address"
//                         className="w-full rounded-lg border border-cyan-200/50  shadow-xl bg-none px-3 py-2 text-sm
//                         text-cyan-900 placeholder:text-cyan-700/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-medium text-cyan-900 mb-1">Network</label>
//                       <select
//                         value={network}
//                         onChange={(e) => setNetwork(e.target.value)}
//                         className="w-full rounded-xl border border-none  shadow-xl bg-none px-3 py-2 text-sm
//                         text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
//                       >
//                         <option value="" className="text-cyan-900">Select Network</option>
//                         <option value="ethereum" className="text-cyan-900">Ethereum (ERC-20)</option>
//                         <option value="bsc" className="text-cyan-900">Binance Smart Chain (BEP-20)</option>
//                         <option value="solana" className="text-cyan-900">Solana</option>
//                         <option value="bitcoin" className="text-cyan-900">Bitcoin</option>
//                         <option value="polygon" className="text-cyan-900">Polygon</option>
//                       </select>
//                     </div>
//                   </>
//                 )}

//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={openWithdrawalModal}
//                   disabled={isWithdrawDisabled()}
//                   className={`w-full rounded-xl py-2.5 font-bold text-white shadow-xl transition-all text-sm ${
//                     isWithdrawDisabled()
//                       ? "bg-gray-400 cursor-not-allowed shadow-none"
//                       : "bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/30 hover:from-amber-400 hover:to-orange-500"
//                   }`}
//                 >
//                   <span className="flex items-center justify-center gap-2">
//                     <ArrowRight size={16} /> Withdraw
//                   </span>
//                 </motion.button>
//               </div>
//             </motion.div>

//             <motion.div
//               custom={11}
//               variants={cardVariants}
//               initial="hidden"
//               animate="visible"
//               whileHover={{ scale: 1.02, boxShadow: "0 20px 50px rgba(0,0,0,0.06)" }}
//               className="flex items-center justify-between rounded-xl bg-white/40 px-4 py-3 shadow-lg"
//             >
//               <div className="flex items-center gap-3">
//                 <div className="rounded-full bg-emerald-500/20 p-1.5">
//                   <CheckCircle size={14} className="font-light text-emerald-600" />
//                 </div>
//                 <span className="text-sm text-cyan-800">this card is active</span>
//               </div>
//               <ChevronRight size={18} className="text-cyan-700/40" />
//             </motion.div>
//           </div>
//         </div>

//       </motion.div>

//       <AnimatePresence>
//         {showWithdrawalModal && (
//           <WithdrawalModal
//             isOpen={showWithdrawalModal}
//             onClose={closeWithdrawalModal}
//             onWithdraw={handleFormWithdraw}
//             pendingBills={pendingBills}
//             userWithdrawalDetails={userWithdrawalDetails}
//             withdrawalAmount={withdrawalAmount}
//           />
//         )}

//         {pinModalOpen && (
//           <TransactionPinModal
//             isOpen={pinModalOpen}
//             mode={pinMode}
//             onClose={closePinModal}
//             onComplete={handlePinComplete}
//             attemptsRemaining={pinAttemptsLeft}
//           />
//         )}

//         {showReceiptModal && receiptData && (
//           <WithdrawalReceiptModal
//             isOpen={showReceiptModal}
//             onClose={() => setShowReceiptModal(false)}
//             withdrawalData={receiptData}
//             userData={userData}
//           />
//         )}

//         {blockedInfo && (
//           <WithdrawBlockedModal
//             isOpen={true}
//             onClose={() => setBlockedInfo(null)}
//             type={blockedInfo.type}
//             title={blockedInfo.title}
//             message={blockedInfo.message}
//             bills={blockedInfo.bills}
//             currentBalance={blockedInfo.currentBalance}
//             requestedAmount={blockedInfo.requestedAmount}
//             actionLabel={blockedInfo.actionLabel}
//             actionHref={blockedInfo.actionHref}
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }