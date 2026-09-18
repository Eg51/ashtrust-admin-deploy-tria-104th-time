// // app/me/users/[userId]/page.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import ChatWidgett from '@/app/components/ChatWidgett'
// import { motion } from "framer-motion";
// import { getUserDashData, updateUserDashData } from "@/app/actions/admin";
// import { 
//   ArrowLeft, 
//   Save, 
//   Plus, 
//   Trash2, 
//   Calendar, 
//   Loader2,
//   CreditCard,
//   Activity,
//   Settings,
//   X,
//   Wallet,
//   CheckCircle,
//   Landmark,
//   Bitcoin
// } from "lucide-react";
// import DesktopNav from '@/app/components/DesktopNav';

// export default function AdminUserDashboardEditor() {
//   const params = useParams();
//   const router = useRouter();
//   const userId = params.userId as string;

//   const [dashData, setDashData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [saved, setSaved] = useState(false);

//   useEffect(() => {
//     const loadData = async () => {
//       const result = await getUserDashData(userId);
//       if (result.success) setDashData(result.data);
//       setLoading(false);
//     };
//     loadData();
//   }, [userId]);

//   const handleSave = async () => {
//     setSaving(true);
//     setSaved(false);
//     try {
//       // ✅ MAP THE NEW FIELDS TO HOW THE USER DASHBOARD READS THEM
//       const finalData = {
//         ...dashData,
//         // This is what the Dash.tsx reads
//         portfolioValue: dashData?.totalBalance?.amount || "0.00",
//         portfolioChange: dashData?.totalBalance?.change || "0.0%",
//         assetTotal: dashData?.analysisNote ?? 0,
//         spendingCategories: [
//           { name: "Stocks", percentage: parseInt(dashData?.spendingCategories?.[0]?.percentage || "45"), color: "from-blue-400 to-cyan-500" },
//           { name: "Crypto", percentage: parseInt(dashData?.spendingCategories?.[1]?.percentage || "35"), color: "from-purple-400 to-pink-500" },
//           { name: "ETFs", percentage: parseInt(dashData?.spendingCategories?.[2]?.percentage || "20"), color: "from-emerald-400 to-teal-500" },
//         ],
//         // Keep existing
//         totalBalance: dashData?.totalBalance || { amount: "0.00", change: "0.0%" },
//         analysisNote: dashData?.analysisNote || 0,
//         analysisSummary: dashData?.analysisSummary || "",
//         bills: dashData?.bills || [],
//         recentTransactions: dashData?.recentTransactions || [],
//         paymentMethods: dashData?.paymentMethods || [],
//         // ✅ NEW: Payment Preferences for Affiliate Modal
//         preferences: {
//           ...(dashData?.preferences || {}),
//           domesticBankName: dashData?.preferences?.domesticBankName || "",
//           domesticAccountName: dashData?.preferences?.domesticAccountName || "",
//           domesticAccountNumber: dashData?.preferences?.domesticAccountNumber || "",
//           domesticRoutingNumber: dashData?.preferences?.domesticRoutingNumber || "",
//           bankName: dashData?.preferences?.bankName || "",
//           accountName: dashData?.preferences?.accountName || "",
//           accountNumber: dashData?.preferences?.accountNumber || "",
//           swiftCode: dashData?.preferences?.swiftCode || "",
//           iban: dashData?.preferences?.iban || "",
//           cryptoName: dashData?.preferences?.cryptoName || "",
//           cryptoNetwork: dashData?.preferences?.cryptoNetwork || "",
//           cryptoAddress: dashData?.preferences?.cryptoAddress || "",
//         }
//       };
//       await updateUserDashData(userId, finalData);
//       setSaved(true);
//       setTimeout(() => setSaved(false), 3000);
//     } catch (error) {
//       console.error("Failed to save dashboard data:", error);
//     } finally {
//       setSaving(false);
//     }
//   };

//   // BALANCE / ANALYSIS HELPERS
//   const updateTotalBalance = (field: string, value: string) => {
//     setDashData((prev: any) => ({ ...prev, totalBalance: { ...(prev?.totalBalance || { amount: "0.00", change: "0.0%" }), [field]: value } }));
//   };
//   const updateAnalysisNote = (value: string) => {
//     const num = parseFloat(value);
//     setDashData((prev: any) => ({ ...prev, analysisNote: isNaN(num) ? 0 : num }));
//   };

//   // 1. BILLS CRUD
//   const addBill = () => {
//     const newBill = { id: Date.now().toString(), name: "New Bill", amount: "0.00", dueDate: new Date().toISOString().split('T')[0], status: "pending" };
//     setDashData((prev: any) => ({ ...prev, bills: [...(prev?.bills || []), newBill] }));
//   };
//   const updateBill = (index: number, field: string, value: string) => {
//     const updatedBills = [...(dashData?.bills || [])]; updatedBills[index][field] = value;
//     setDashData((prev: any) => ({ ...prev, bills: updatedBills }));
//   };
//   const deleteBill = (index: number) => {
//     const updatedBills = (dashData?.bills || []).filter((_: any, i: number) => i !== index);
//     setDashData((prev: any) => ({ ...prev, bills: updatedBills }));
//   };

//   // 2. RECENT TRANSACTIONS CRUD
//   const addTransaction = () => {
//     const newTxn = { id: Date.now().toString(), merchant: "New Merchant", type: "Purchase", category: "General", date: new Date().toISOString().split('T')[0], status: "completed", amount: "0.00", isNegative: true };
//     setDashData((prev: any) => ({ ...prev, recentTransactions: [...(prev?.recentTransactions || []), newTxn] }));
//   };
//   const updateTransaction = (index: number, field: string, value: string | boolean) => {
//     const updatedTxns = [...(dashData?.recentTransactions || [])]; updatedTxns[index][field] = value;
//     setDashData((prev: any) => ({ ...prev, recentTransactions: updatedTxns }));
//   };
//   const deleteTransaction = (index: number) => {
//     const updatedTxns = (dashData?.recentTransactions || []).filter((_: any, i: number) => i !== index);
//     setDashData((prev: any) => ({ ...prev, recentTransactions: updatedTxns }));
//   };

//   // 3. PAYMENT METHODS CRUD
//   const addPaymentMethod = () => {
//     const newMethod = { id: Date.now().toString(), type: "Credit Card", last4: "0000", brand: "Visa", isDefault: false };
//     setDashData((prev: any) => ({ ...prev, paymentMethods: [...(prev?.paymentMethods || []), newMethod] }));
//   };
//   const updatePaymentMethod = (index: number, field: string, value: string | boolean) => {
//     const updatedMethods = [...(dashData?.paymentMethods || [])]; updatedMethods[index][field] = value;
//     setDashData((prev: any) => ({ ...prev, paymentMethods: updatedMethods }));
//   };
//   const deletePaymentMethod = (index: number) => {
//     const updatedMethods = (dashData?.paymentMethods || []).filter((_: any, i: number) => i !== index);
//     setDashData((prev: any) => ({ ...prev, paymentMethods: updatedMethods }));
//   };

//   // 4. PREFERENCES CRUD
//   const updatePreference = (key: string, value: any) => {
//     setDashData((prev: any) => ({ ...prev, preferences: { ...(prev?.preferences || {}), [key]: value } }));
//   };
//   const deletePreference = (key: string) => {
//     const updatedPrefs = { ...(dashData?.preferences || {}) };
//     delete updatedPrefs[key];
//     setDashData((prev: any) => ({ ...prev, preferences: updatedPrefs }));
//   };
//   const addPreference = () => {
//     const key = prompt("Enter preference key (e.g., bankName, sortCode):");
//     if (key) {
//       const value = prompt(`Enter value for ${key}:`);
//       if (value !== null) updatePreference(key, value);
//     }
//   };

//   // ✅ NEW: Spending Categories CRUD
//   const updateSpendingCategory = (index: number, value: number) => {
//     const updatedCats = [...(dashData?.spendingCategories || [])];
//     if (!updatedCats[index]) updatedCats[index] = { name: "Category", percentage: 0, color: "from-blue-400 to-cyan-500" };
//     updatedCats[index].percentage = value;
//     setDashData((prev: any) => ({ ...prev, spendingCategories: updatedCats }));
//   };
//     // 5. INVESTMENTS CRUD
//   const addInvestment = () => {
//     const newInv = {
//       id: `inv_${Date.now()}`,
//       assetId: "btc",
//       amount: 0,
//       purchasePrice: 0,
//       date: new Date().toISOString().split('T')[0],
//     };
//     setDashData((prev: any) => ({
//       ...prev,
//       investments: [...(prev?.investments || []), newInv],
//     }));
//   };

//   const updateInvestment = (
//     index: number,
//     field: "assetId" | "amount" | "purchasePrice" | "date",
//     value: string | number
//   ) => {
//     const updated = [...(dashData?.investments || [])];
//     updated[index] = { ...updated[index], [field]: value };
//     setDashData((prev: any) => ({ ...prev, investments: updated }));
//   };

//   const deleteInvestment = (index: number) => {
//     const updated = (dashData?.investments || []).filter(
//       (_: any, i: number) => i !== index
//     );
//     setDashData((prev: any) => ({ ...prev, investments: updated }));
//   };

//   // Live total of all investments
//   const investmentsTotal = (dashData?.investments || []).reduce(
//     (sum: number, inv: any) => sum + (Number(inv?.amount) || 0),
//     0
//   );


















//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
//       <div className="mx-auto max-w-6xl space-y-4">
//         <div className="h-20 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /></div>
//         <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /></div>
//       </div>
//     </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#C4F8FD] pb-5 px-4 pt-4 sm:p-6 lg:p-8 overflow-x-hidden">
//       <div className="mx-auto max-w-6xl w-full min-w-0">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
//           <div onClick={() => router.back()} className="flex items-center gap-2 text-cyan-700 hover:text-cyan-900 font-bold transition-colors">
//             <DesktopNav/>
//           </div>
//           <h1 className="text-2xl font-bold text-cyan-900">Change User contents</h1>
//           {saved && (
//             <span className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
//               <CheckCircle size={18} /> Saved!
//             </span>
//           )}
//         </div>

//         {/* Balance & Asset Analysis */}
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#C4F8FD] rounded-2xl p-6 shadow-xl mb-6 min-w-0">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-bold text-cyan-800 flex items-center gap-2"><Wallet size={20} /> Balance & Asset Analysis</h2>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
//             <div className="bg-[#C4F8FD] shadow-xl p-4 rounded-xl backdrop-blur-sm border border-cyan-200/30 min-w-0">
//               <p className="text-sm font-bold text-cyan-700 mb-2">Total Balance</p>
//               <div className="flex flex-col gap-2">
//                 <div className="flex items-center gap-2">
//                   <label className="text-xs text-cyan-600 w-16">Amount ($):</label>
//                   <input type="text" value={dashData?.totalBalance?.amount || "0.00"} onChange={(e) => updateTotalBalance("amount", e.target.value)} className="flex-1 min-w-0 bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <label className="text-xs text-cyan-600 w-16">Change (%):</label>
//                   <input type="text" value={dashData?.totalBalance?.change || "0.0%"} onChange={(e) => updateTotalBalance("change", e.target.value)} className="flex-1 min-w-0 bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
//                 </div>
//               </div>
//             </div>
//             <div className="bg-[#C4F8FD] shadow-xl p-4 rounded-xl backdrop-blur-sm border border-cyan-200/30 min-w-0">
//               <p className="text-sm font-bold text-cyan-700 mb-2">Asset Analysis</p>
//               <div className="grid grid-cols-3 gap-2">
//                 <div><label className="text-xs text-cyan-600 block">Stocks (%)</label><input type="number" value={dashData?.spendingCategories?.[0]?.percentage ?? 45} onChange={(e) => updateSpendingCategory(0, parseInt(e.target.value))} className="w-full min-w-0 bg-white/50 px-2 py-1 rounded-lg text-xs font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
//                 <div><label className="text-xs text-cyan-600 block">Crypto (%)</label><input type="number" value={dashData?.spendingCategories?.[1]?.percentage ?? 35} onChange={(e) => updateSpendingCategory(1, parseInt(e.target.value))} className="w-full min-w-0 bg-white/50 px-2 py-1 rounded-lg text-xs font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
//                 <div><label className="text-xs text-cyan-600 block">ETFs (%)</label><input type="number" value={dashData?.spendingCategories?.[2]?.percentage ?? 20} onChange={(e) => updateSpendingCategory(2, parseInt(e.target.value))} className="w-full min-w-0 bg-white/50 px-2 py-1 rounded-lg text-xs font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
//               </div>
//             </div>
//           </div>
//           <div className="mt-4">
//             <label className="block text-xs font-medium text-cyan-700 mb-1">Analysis Note (for Assets card)</label>
//             <input type="number" value={dashData?.analysisNote ?? 0} onChange={(e) => updateAnalysisNote(e.target.value)} className="w-full bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="0.00" step="0.01" />
//           </div>
//           <div className="mt-2">
//             <label className="block text-xs font-medium text-cyan-700 mb-1">Analysis Summary</label>
//             <input type="text" value={dashData?.analysisSummary || ""} onChange={(e) => setDashData((prev: any) => ({ ...prev, analysisSummary: e.target.value }))} className="w-full bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="e.g. Stocks: 45% | Crypto: 32% | ETFs: 23%" />
//           </div>
//         </motion.div>

//         {/* Bills Section */}
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#C4F8FD] rounded-2xl p-6 shadow-xl mb-6 min-w-0">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-bold text-cyan-800 flex items-center gap-2"><Calendar size={20} /> Manage User Bills</h2>
//             <button onClick={addBill} className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-lg"><Plus size={16} /> Add Bill</button>
//           </div>
//           <div className="space-y-3">
//             {(dashData?.bills || []).map((bill: any, index: number) => (
//               <div key={bill.id || index} className="flex flex-wrap items-center gap-2 sm:gap-4 bg-white/40 p-3 rounded-xl backdrop-blur-sm border border-cyan-200/30 min-w-0">
//                 <input type="text" value={bill.name} onChange={(e) => updateBill(index, "name", e.target.value)} className="flex-1 min-w-[120px] bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="Bill Name" />
//                 <input type="text" value={bill.amount} onChange={(e) => updateBill(index, "amount", e.target.value)} className="w-24 bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="$0.00" />
//                 <input type="date" value={bill.dueDate} onChange={(e) => updateBill(index, "dueDate", e.target.value)} className="w-32 bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
//                 <select value={bill.status} onChange={(e) => updateBill(index, "status", e.target.value)} className="w-24 bg-white/50 px-2 py-1.5 rounded-lg text-sm font-bold border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500"><option value="pending">Pending</option><option value="paid">Paid</option><option value="overdue">Overdue</option></select>
//                 <button onClick={() => deleteBill(index)} className="p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-600 transition-colors"><Trash2 size={16} /></button>
//               </div>
//             ))}
//             {(!dashData?.bills || dashData.bills.length === 0) && (<p className="text-center text-cyan-600/50 font-bold py-4">No bills for this user yet.</p>)}
//           </div>
//         </motion.div>

//         {/* Transactions Section */}
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#C4F8FD] rounded-2xl p-6 shadow-xl mb-6 min-w-0">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-bold text-cyan-800 flex items-center gap-2"><Activity size={20} /> Manage Recent Transactions</h2>
//             <button onClick={addTransaction} className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-lg"><Plus size={16} /> Add Transaction</button>
//           </div>
//           <div className="space-y-3">
//             {(dashData?.recentTransactions || []).map((txn: any, index: number) => (
//               <div key={txn.id || index} className="flex flex-wrap items-center gap-2 sm:gap-4 bg-white/40 p-3 rounded-xl backdrop-blur-sm border border-cyan-200/30 min-w-0">
//                 <input type="text" value={txn.merchant} onChange={(e) => updateTransaction(index, "merchant", e.target.value)} className="flex-1 min-w-[120px] bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="Merchant" />
//                 <input type="text" value={txn.type} onChange={(e) => updateTransaction(index, "type", e.target.value)} className="w-32 bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="Type" />
//                 <input type="text" value={txn.category} onChange={(e) => updateTransaction(index, "category", e.target.value)} className="w-32 bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="Category" />
//                 <input type="text" value={txn.amount} onChange={(e) => updateTransaction(index, "amount", e.target.value)} className="w-24 bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="$0.00" />
//                 <select value={txn.status} onChange={(e) => updateTransaction(index, "status", e.target.value)} className="w-32 bg-white/50 px-2 py-1.5 rounded-lg text-sm font-bold border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500"><option value="completed">Completed</option><option value="pending">Pending</option><option value="failed">Failed</option></select>
//                 <select value={txn.isNegative ? "expense" : "income"} onChange={(e) => updateTransaction(index, "isNegative", e.target.value === "expense")} className="w-32 bg-white/50 px-2 py-1.5 rounded-lg text-sm font-bold border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500"><option value="expense">Expense (-)</option><option value="income">Income (+)</option></select>
//                 <button onClick={() => deleteTransaction(index)} className="p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-600 transition-colors"><Trash2 size={16} /></button>
//               </div>
//             ))}
//             {(!dashData?.recentTransactions || dashData.recentTransactions.length === 0) && (<p className="text-center text-cyan-600/50 font-bold py-4">No transactions for this user yet.</p>)}
//           </div>
//         </motion.div>

//         {/* Payment Methods Section */}
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#C4F8FD] rounded-2xl p-6 shadow-xl mb-6 min-w-0">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-bold text-cyan-800 flex items-center gap-2"><CreditCard size={20} /> Manage Payment Methods</h2>
//             <button onClick={addPaymentMethod} className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-lg"><Plus size={16} /> Add Payment Method</button>
//           </div>
//           <div className="space-y-3">
//             {(dashData?.paymentMethods || []).map((method: any, index: number) => (
//               <div key={method.id || index} className="flex flex-wrap items-center gap-2 sm:gap-4 bg-white/40 p-3 rounded-xl backdrop-blur-sm border border-cyan-200/30 min-w-0">
//                 <input type="text" value={method.brand} onChange={(e) => updatePaymentMethod(index, "brand", e.target.value)} className="w-32 bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="Brand" />
//                 <input type="text" value={method.last4} onChange={(e) => updatePaymentMethod(index, "last4", e.target.value)} className="w-24 bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="Last 4" />
//                 <select value={method.type} onChange={(e) => updatePaymentMethod(index, "type", e.target.value)} className="w-32 bg-white/50 px-2 py-1.5 rounded-lg text-sm font-bold border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500"><option value="Credit Card">Credit Card</option><option value="Debit Card">Debit Card</option><option value="PayPal">PayPal</option><option value="Bank Transfer">Bank Transfer</option></select>
//                 <div className="flex items-center gap-2">
//                   <input type="checkbox" checked={method.isDefault} onChange={(e) => updatePaymentMethod(index, "isDefault", e.target.checked)} className="h-4 w-4 rounded border-cyan-300 text-cyan-600 focus:ring-cyan-500" />
//                   <label className="text-xs font-bold text-cyan-700">Default</label>
//                 </div>
//                 <button onClick={() => deletePaymentMethod(index)} className="p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-600 transition-colors"><Trash2 size={16} /></button>
//               </div>
//             ))}
//             {(!dashData?.paymentMethods || dashData.paymentMethods.length === 0) && (<p className="text-center text-cyan-600/50 font-bold py-4">No payment methods for this user yet.</p>)}
//           </div>
//         </motion.div>

//         {/* Preferences & Payment Details Section */}
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#C4F8FD] rounded-2xl p-6 shadow-xl mb-6 min-w-0">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-bold text-cyan-800 flex items-center gap-2"><Settings size={20} /> Manage Payment & Preferences</h2>
//             <button onClick={addPreference} className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-lg"><Plus size={16} /> Add Preference</button>
//           </div>

//           {/* New Payment Details from Affiliate Modal */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white/30 p-4 rounded-xl border border-cyan-200/30 min-w-0">
//             <div className="md:col-span-2 flex items-center gap-2">
//               <Landmark size={18} className="text-cyan-700" />
//               <h3 className="text-sm font-bold text-cyan-800">Domestic Bank</h3>
//             </div>
//             <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">Domestic Bank Name</label><input type="text" value={dashData?.preferences?.domesticBankName || ""} onChange={(e) => updatePreference("domesticBankName", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
//             <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">Domestic Account Name</label><input type="text" value={dashData?.preferences?.domesticAccountName || ""} onChange={(e) => updatePreference("domesticAccountName", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
//             <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">Domestic Account Number</label><input type="text" value={dashData?.preferences?.domesticAccountNumber || ""} onChange={(e) => updatePreference("domesticAccountNumber", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
//             <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">Domestic Routing Number</label><input type="text" value={dashData?.preferences?.domesticRoutingNumber || ""} onChange={(e) => updatePreference("domesticRoutingNumber", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>

//             <div className="md:col-span-2 flex items-center gap-2 mt-4">
//               <Landmark size={18} className="text-cyan-700" />
//               <h3 className="text-sm font-bold text-cyan-800">International Bank</h3>
//             </div>
//             <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">Bank Name</label><input type="text" value={dashData?.preferences?.bankName || ""} onChange={(e) => updatePreference("bankName", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
//             <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">Account Name</label><input type="text" value={dashData?.preferences?.accountName || ""} onChange={(e) => updatePreference("accountName", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
//             <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">Account Number</label><input type="text" value={dashData?.preferences?.accountNumber || ""} onChange={(e) => updatePreference("accountNumber", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
//             <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">SWIFT Code</label><input type="text" value={dashData?.preferences?.swiftCode || ""} onChange={(e) => updatePreference("swiftCode", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
//             <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">IBAN</label><input type="text" value={dashData?.preferences?.iban || ""} onChange={(e) => updatePreference("iban", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>

//             <div className="md:col-span-2 flex items-center gap-2 mt-4">
//               <Bitcoin size={18} className="text-orange-500" />
//               <h3 className="text-sm font-bold text-cyan-800">Crypto Payment</h3>
//             </div>
//             <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">Crypto Name (e.g. Bitcoin)</label><input type="text" value={dashData?.preferences?.cryptoName || ""} onChange={(e) => updatePreference("cryptoName", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
//             <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">Crypto Network (e.g. BTC)</label><input type="text" value={dashData?.preferences?.cryptoNetwork || ""} onChange={(e) => updatePreference("cryptoNetwork", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
//             <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">Crypto Address</label><input type="text" value={dashData?.preferences?.cryptoAddress || ""} onChange={(e) => updatePreference("cryptoAddress", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
//           </div>

//           <div className="flex flex-wrap gap-3 min-w-0">
//             {dashData?.preferences && Object.keys(dashData.preferences).length > 0 ? (
//               Object.entries(dashData.preferences).map(([key, value]: [string, any]) => (
//                 <div key={key} className="flex items-center gap-3 bg-white/40 px-4 py-2 rounded-xl backdrop-blur-sm border border-cyan-200/30 min-w-0">
//                   <span className="text-sm font-bold text-cyan-800 break-words">{key}:</span>
//                   <textarea value={value} onChange={(e) => updatePreference(key, e.target.value)} className="w-32 bg-white/50 px-2 py-1 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500 min-h-[2.5rem]" rows={1} />
//                   <button onClick={() => deletePreference(key)} className="p-1 bg-red-500/20 hover:bg-red-500/40 rounded-md text-red-600 transition-colors"><X size={16} /></button>
//                 </div>
//               ))
//             ) : (
//               <p className="text-center text-cyan-600/50 font-bold py-4 w-full">No preferences set for this user yet.</p>
//             )}
//           </div>
//         </motion.div>

//         {/* Save Button */}
//         <motion.button
//         suppressHydrationWarning
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.98 }}
//         onClick={handleSave}
//         disabled={saving}
//         className={`w-full rounded-xl py-3.5 font-extrabold text-cyan-900 shadow-xl
//         transition-all ${saving ? "bg-gray-500 cursor-not-allowed" : "bg-[#C4F8FD] shadow-cyan-500/30 shadow-xl hover:shadow-cyan-500/50"}`}>
//           <span className="flex items-center justify-center gap-2">
//             {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save size={20} />}
//             {saving ? "Saving Changes..." : "Save"}
//           </span>
//         </motion.button>

//       </div>
//       <ChatWidgett/>
//     </div>
//   );
// }
// app/me/users/[userId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ChatWidgett from '@/app/components/ChatWidgett'
import { motion } from "framer-motion";
import { getUserDashData, updateUserDashData, getUserLoginBlock, updateUserLoginBlock } from "@/app/actions/admin";
import {
  Save,
  Plus,
  Trash2,
  Calendar,
  Loader2,
  CreditCard,
  Activity,
  Settings,
  X,
  Wallet,
  CheckCircle,
  Landmark,
  Bitcoin
} from "lucide-react";
import DesktopNav from '@/app/components/DesktopNav';

export default function AdminUserDashboardEditor() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // useEffect(() => {
  //   const loadData = async () => {
  //     const result = await getUserDashData(userId);
  //     if (result.success) setDashData(result.data);
  //     setLoading(false);
  //   };
  //   loadData();
  // }, [userId]);
  useEffect(() => {
    const loadData = async () => {
      const [dashResult, blockResult] = await Promise.all([
        getUserDashData(userId),
        getUserLoginBlock(userId),
      ]);

      if (dashResult.success) {
        setDashData({
          ...(dashResult.data || {}),
          loginBlockMessage: blockResult.success ? (blockResult.data?.loginBlockMessage || "") : "",
          loginBlockContactEmail: blockResult.success ? (blockResult.data?.loginBlockContactEmail || "") : "",
        });
      }
      setLoading(false);
    };
    loadData();
  }, [userId]);


  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      // ✅ MAP THE NEW FIELDS TO HOW THE USER DASHBOARD READS THEM
      const finalData = {
        ...dashData,
        // This is what the Dash.tsx reads
        portfolioValue: dashData?.totalBalance?.amount || "0.00",
        portfolioChange: dashData?.totalBalance?.change || "0.0%",
        assetTotal: dashData?.analysisNote ?? 0,
        spendingCategories: [
          { name: "Stocks", percentage: parseInt(dashData?.spendingCategories?.[0]?.percentage || "45"), color: "from-blue-400 to-cyan-500" },
          { name: "Crypto", percentage: parseInt(dashData?.spendingCategories?.[1]?.percentage || "35"), color: "from-purple-400 to-pink-500" },
          { name: "ETFs", percentage: parseInt(dashData?.spendingCategories?.[2]?.percentage || "20"), color: "from-emerald-400 to-teal-500" },
        ],
        // Keep existing
        totalBalance: dashData?.totalBalance || { amount: "0.00", change: "0.0%" },
        analysisNote: dashData?.analysisNote || 0,
        analysisSummary: dashData?.analysisSummary || "",
        bills: dashData?.bills || [],
        recentTransactions: dashData?.recentTransactions || [],
        paymentMethods: dashData?.paymentMethods || [],
        investments: dashData?.investments || [],   // ✅ NEW: explicit pass-through
        loginBlockMessage: dashData?.loginBlockMessage || "",
        loginBlockContactEmail: dashData?.loginBlockContactEmail || "",
        // ✅ NEW: Payment Preferences for Affiliate Modal
        preferences: {
          ...(dashData?.preferences || {}),
          domesticBankName: dashData?.preferences?.domesticBankName || "",
          domesticAccountName: dashData?.preferences?.domesticAccountName || "",
          domesticAccountNumber: dashData?.preferences?.domesticAccountNumber || "",
          domesticRoutingNumber: dashData?.preferences?.domesticRoutingNumber || "",
          bankName: dashData?.preferences?.bankName || "",
          accountName: dashData?.preferences?.accountName || "",
          accountNumber: dashData?.preferences?.accountNumber || "",
          swiftCode: dashData?.preferences?.swiftCode || "",
          iban: dashData?.preferences?.iban || "",
          cryptoName: dashData?.preferences?.cryptoName || "",
          cryptoNetwork: dashData?.preferences?.cryptoNetwork || "",
          cryptoAddress: dashData?.preferences?.cryptoAddress || "",
        }
      };
      // await updateUserDashData(userId, finalData);
      // setSaved(true);
      // setTimeout(() => setSaved(false), 3000);
      // 1. Save everything else to dashdata (as before)
      await updateUserDashData(userId, finalData);

      // 2. Save the login-block fields to the users collection
      await updateUserLoginBlock(userId, {
        loginBlockMessage: dashData?.loginBlockMessage || "",
        loginBlockContactEmail: dashData?.loginBlockContactEmail || "",
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

    } catch (error) {
      console.error("Failed to save dashboard data:", error);
    } finally {
      setSaving(false);
    }
  };

  // BALANCE / ANALYSIS HELPERS
  const updateTotalBalance = (field: string, value: string) => {
    setDashData((prev: any) => ({ ...prev, totalBalance: { ...(prev?.totalBalance || { amount: "0.00", change: "0.0%" }), [field]: value } }));
  };
  const updateAnalysisNote = (value: string) => {
    const num = parseFloat(value);
    setDashData((prev: any) => ({ ...prev, analysisNote: isNaN(num) ? 0 : num }));
  };
  const updateLoginBlockMessage = (value: string) => {
    setDashData((prev: any) => ({ ...prev, loginBlockMessage: value }));
  };

  const updateLoginBlockContactEmail = (value: string) => {
    setDashData((prev: any) => ({ ...prev, loginBlockContactEmail: value }));
  };

  // 1. BILLS CRUD
  const addBill = () => {
    const newBill = { id: Date.now().toString(), name: "New Bill", amount: "0.00", dueDate: new Date().toISOString().split('T')[0], status: "pending" };
    setDashData((prev: any) => ({ ...prev, bills: [...(prev?.bills || []), newBill] }));
  };
  const updateBill = (index: number, field: string, value: string) => {
    const updatedBills = [...(dashData?.bills || [])]; updatedBills[index][field] = value;
    setDashData((prev: any) => ({ ...prev, bills: updatedBills }));
  };
  const deleteBill = (index: number) => {
    const updatedBills = (dashData?.bills || []).filter((_: any, i: number) => i !== index);
    setDashData((prev: any) => ({ ...prev, bills: updatedBills }));
  };

  // 2. RECENT TRANSACTIONS CRUD
  const addTransaction = () => {
    const newTxn = { id: Date.now().toString(), merchant: "New Merchant", type: "Purchase", category: "General", date: new Date().toISOString().split('T')[0], status: "completed", amount: "0.00", isNegative: true };
    setDashData((prev: any) => ({ ...prev, recentTransactions: [...(prev?.recentTransactions || []), newTxn] }));
  };
  const updateTransaction = (index: number, field: string, value: string | boolean) => {
    const updatedTxns = [...(dashData?.recentTransactions || [])]; updatedTxns[index][field] = value;
    setDashData((prev: any) => ({ ...prev, recentTransactions: updatedTxns }));
  };
  const deleteTransaction = (index: number) => {
    const updatedTxns = (dashData?.recentTransactions || []).filter((_: any, i: number) => i !== index);
    setDashData((prev: any) => ({ ...prev, recentTransactions: updatedTxns }));
  };

  // 3. PAYMENT METHODS CRUD
  const addPaymentMethod = () => {
    const newMethod = { id: Date.now().toString(), type: "Credit Card", last4: "0000", brand: "Visa", isDefault: false };
    setDashData((prev: any) => ({ ...prev, paymentMethods: [...(prev?.paymentMethods || []), newMethod] }));
  };
  const updatePaymentMethod = (index: number, field: string, value: string | boolean) => {
    const updatedMethods = [...(dashData?.paymentMethods || [])]; updatedMethods[index][field] = value;
    setDashData((prev: any) => ({ ...prev, paymentMethods: updatedMethods }));
  };
  const deletePaymentMethod = (index: number) => {
    const updatedMethods = (dashData?.paymentMethods || []).filter((_: any, i: number) => i !== index);
    setDashData((prev: any) => ({ ...prev, paymentMethods: updatedMethods }));
  };

  // 4. PREFERENCES CRUD
  const updatePreference = (key: string, value: any) => {
    setDashData((prev: any) => ({ ...prev, preferences: { ...(prev?.preferences || {}), [key]: value } }));
  };
  const deletePreference = (key: string) => {
    const updatedPrefs = { ...(dashData?.preferences || {}) };
    delete updatedPrefs[key];
    setDashData((prev: any) => ({ ...prev, preferences: updatedPrefs }));
  };
  const addPreference = () => {
    const key = prompt("Enter preference key (e.g., bankName, sortCode):");
    if (key) {
      const value = prompt(`Enter value for ${key}:`);
      if (value !== null) updatePreference(key, value);
    }
  };

  // 5. SPENDING CATEGORIES CRUD
  const updateSpendingCategory = (index: number, value: number) => {
    const updatedCats = [...(dashData?.spendingCategories || [])];
    if (!updatedCats[index]) updatedCats[index] = { name: "Category", percentage: 0, color: "from-blue-400 to-cyan-500" };
    updatedCats[index].percentage = value;
    setDashData((prev: any) => ({ ...prev, spendingCategories: updatedCats }));
  };

  // 6. INVESTMENTS CRUD (NEW)
  const addInvestment = () => {
    const newInv = {
      id: `inv_${Date.now()}`,
      assetId: "btc",
      amount: 0,
      purchasePrice: 0,
      date: new Date().toISOString().split('T')[0],
    };
    setDashData((prev: any) => ({
      ...prev,
      investments: [...(prev?.investments || []), newInv],
    }));
  };

  const updateInvestment = (
    index: number,
    field: "assetId" | "amount" | "purchasePrice" | "date",
    value: string | number
  ) => {
    const updated = [...(dashData?.investments || [])];
    updated[index] = { ...updated[index], [field]: value };
    setDashData((prev: any) => ({ ...prev, investments: updated }));
  };

  const deleteInvestment = (index: number) => {
    const updated = (dashData?.investments || []).filter(
      (_: any, i: number) => i !== index
    );
    setDashData((prev: any) => ({ ...prev, investments: updated }));
  };

  // Live total of all investments — matches how Dash.tsx sums them
  const investmentsTotal = (dashData?.investments || []).reduce(
    (sum: number, inv: any) => sum + (Number(inv?.amount) || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="h-20 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /></div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /></div>
      </div>
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#C4F8FD] pb-5 px-4 pt-4 sm:p-6 lg:p-8 overflow-x-hidden">
      <div className="mx-auto max-w-6xl w-full min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div onClick={() => router.back()} className="flex items-center gap-2 text-cyan-700 hover:text-cyan-900 font-bold transition-colors">
            <DesktopNav/>
          </div>
          <h1 className="text-2xl font-bold text-cyan-900">Change User contents</h1>
          {saved && (
            <span className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
              <CheckCircle size={18} /> Saved!
            </span>
          )}
        </div>

        {/* Balance & Asset Analysis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#C4F8FD] rounded-2xl p-6 shadow-xl mb-6 min-w-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-cyan-800 flex items-center gap-2"><Wallet size={20} /> Balance & Asset Analysis</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
            <div className="bg-[#C4F8FD] shadow-xl p-4 rounded-xl backdrop-blur-sm border border-cyan-200/30 min-w-0">
              <p className="text-sm font-bold text-cyan-700 mb-2">Total Balance</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-cyan-600 w-16">Amount ($):</label>
                  <input type="text" value={dashData?.totalBalance?.amount || "0.00"} onChange={(e) => updateTotalBalance("amount", e.target.value)} className="flex-1 min-w-0 bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-cyan-600 w-16">Change (%):</label>
                  <input type="text" value={dashData?.totalBalance?.change || "0.0%"} onChange={(e) => updateTotalBalance("change", e.target.value)} className="flex-1 min-w-0 bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                </div>
              </div>
            </div>
            <div className="bg-[#C4F8FD] shadow-xl p-4 rounded-xl backdrop-blur-sm border border-cyan-200/30 min-w-0">
              <p className="text-sm font-bold text-cyan-700 mb-2">Asset Analysis</p>
              <div className="grid grid-cols-3 gap-2">
                <div><label className="text-xs text-cyan-600 block">Stocks (%)</label><input type="number" value={dashData?.spendingCategories?.[0]?.percentage ?? 45} onChange={(e) => updateSpendingCategory(0, parseInt(e.target.value))} className="w-full min-w-0 bg-white/50 px-2 py-1 rounded-lg text-xs font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
                <div><label className="text-xs text-cyan-600 block">Crypto (%)</label><input type="number" value={dashData?.spendingCategories?.[1]?.percentage ?? 35} onChange={(e) => updateSpendingCategory(1, parseInt(e.target.value))} className="w-full min-w-0 bg-white/50 px-2 py-1 rounded-lg text-xs font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
                <div><label className="text-xs text-cyan-600 block">ETFs (%)</label><input type="number" value={dashData?.spendingCategories?.[2]?.percentage ?? 20} onChange={(e) => updateSpendingCategory(2, parseInt(e.target.value))} className="w-full min-w-0 bg-white/50 px-2 py-1 rounded-lg text-xs font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-cyan-700 mb-1">
              Analysis Note <span className="text-cyan-500 font-normal">(legacy — the Assets card now reads from Investments below)</span>
            </label>
            <input type="number" value={dashData?.analysisNote ?? 0} onChange={(e) => updateAnalysisNote(e.target.value)} className="w-full bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="0.00" step="0.01" />
          </div>
          <div className="mt-2">
            <label className="block text-xs font-medium text-cyan-700 mb-1">Analysis Summary</label>
            <input type="text" value={dashData?.analysisSummary || ""} onChange={(e) => setDashData((prev: any) => ({ ...prev, analysisSummary: e.target.value }))} className="w-full bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="e.g. Stocks: 45% | Crypto: 32% | ETFs: 23%" />
          </div>
          
          {/* ── Login Block Message (shown to inactive / locked users) ── */}
          <div className="mt-6 rounded-xl border border-amber-200/60 bg-amber-50/40 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm font-bold text-amber-800">Login Block Message</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                Optional
              </span>
            </div>

            <p className="mb-3 text-[11px] leading-relaxed text-amber-700/80">
              If this user's account is <strong>deactivated</strong> or <strong>locked</strong>,
              this message appears on their login screen instead of a plain error.
              Leave blank to show the default "contact support" fallback.
            </p>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-cyan-700">
                  Message
                </label>
                <textarea
                  value={dashData?.loginBlockMessage || ""}
                  onChange={(e) => updateLoginBlockMessage(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="e.g. Your account has been suspended pending review. Please contact our support team to resolve this."
                  className="w-full resize-none rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm text-cyan-900 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <p className="mt-1 text-right text-[10px] text-cyan-500">
                  {(dashData?.loginBlockMessage || "").length}/500
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-cyan-700">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={dashData?.loginBlockContactEmail || ""}
                  onChange={(e) => updateLoginBlockContactEmail(e.target.value)}
                  placeholder="support@ashtrust.com"
                  className="w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm text-cyan-900 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <p className="mt-1 text-[10px] text-cyan-500">
                  Shown only when no message is set above.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Investments Section — NEW */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#C4F8FD] rounded-2xl p-6 shadow-xl mb-6 min-w-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-cyan-800 flex items-center gap-2">
              <Wallet size={20} /> Manage Investments
            </h2>
            <button onClick={addInvestment} className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-lg">
              <Plus size={16} /> Add Investment
            </button>
          </div>

          <div className="mb-4 flex items-center gap-2 text-sm bg-white/40 px-4 py-2 rounded-xl border border-cyan-200/30">
            <span className="text-cyan-700 font-bold">Total invested:</span>
            <span className="text-cyan-900 font-extrabold">${investmentsTotal.toFixed(2)}</span>
            <span className="text-cyan-500 text-xs ml-2">(this is what the user's Assets card shows)</span>
          </div>

          <div className="space-y-3">
            {(dashData?.investments || []).map((inv: any, index: number) => (
              <div key={inv.id || index} className="flex flex-wrap items-center gap-2 sm:gap-4 bg-white/40 p-3 rounded-xl backdrop-blur-sm border border-cyan-200/30 min-w-0">
                <input
                  type="text"
                  value={inv.assetId || ""}
                  onChange={(e) => updateInvestment(index, "assetId", e.target.value)}
                  className="w-24 bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  placeholder="Asset"
                />
                <input
                  type="number"
                  value={inv.amount ?? 0}
                  onChange={(e) => updateInvestment(index, "amount", parseFloat(e.target.value) || 0)}
                  className="w-28 bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  placeholder="Amount"
                  step="0.01"
                />
                <input
                  type="number"
                  value={inv.purchasePrice ?? 0}
                  onChange={(e) => updateInvestment(index, "purchasePrice", parseFloat(e.target.value) || 0)}
                  className="w-32 bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  placeholder="Purchase Price"
                  step="0.01"
                />
                <input
                  type="date"
                  value={inv.date || ""}
                  onChange={(e) => updateInvestment(index, "date", e.target.value)}
                  className="w-36 bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  onClick={() => deleteInvestment(index)}
                  className="p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {(!dashData?.investments || dashData.investments.length === 0) && (
              <p className="text-center text-cyan-600/50 font-bold py-4">
                No investments for this user yet.
              </p>
            )}
          </div>
        </motion.div>

        {/* Bills Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#C4F8FD] rounded-2xl p-6 shadow-xl mb-6 min-w-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-cyan-800 flex items-center gap-2"><Calendar size={20} /> Manage User Bills</h2>
            <button onClick={addBill} className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-lg"><Plus size={16} /> Add Bill</button>
          </div>
          <div className="space-y-3">
            {(dashData?.bills || []).map((bill: any, index: number) => (
              <div key={bill.id || index} className="flex flex-wrap items-center gap-2 sm:gap-4 bg-white/40 p-3 rounded-xl backdrop-blur-sm border border-cyan-200/30 min-w-0">
                <input type="text" value={bill.name} onChange={(e) => updateBill(index, "name", e.target.value)} className="flex-1 min-w-[120px] bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="Bill Name" />
                <input type="text" value={bill.amount} onChange={(e) => updateBill(index, "amount", e.target.value)} className="w-24 bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="$0.00" />
                <input type="date" value={bill.dueDate} onChange={(e) => updateBill(index, "dueDate", e.target.value)} className="w-32 bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                <select value={bill.status} onChange={(e) => updateBill(index, "status", e.target.value)} className="w-24 bg-white/50 px-2 py-1.5 rounded-lg text-sm font-bold border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500"><option value="pending">Pending</option><option value="paid">Paid</option><option value="overdue">Overdue</option></select>
                <button onClick={() => deleteBill(index)} className="p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-600 transition-colors"><Trash2 size={16} /></button>
              </div>
            ))}
            {(!dashData?.bills || dashData.bills.length === 0) && (<p className="text-center text-cyan-600/50 font-bold py-4">No bills for this user yet.</p>)}
          </div>
        </motion.div>

        {/* Transactions Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#C4F8FD] rounded-2xl p-6 shadow-xl mb-6 min-w-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-cyan-800 flex items-center gap-2"><Activity size={20} /> Manage Recent Transactions</h2>
            <button onClick={addTransaction} className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-lg"><Plus size={16} /> Add Transaction</button>
          </div>
          <div className="space-y-3">
            {(dashData?.recentTransactions || []).map((txn: any, index: number) => (
              <div key={txn.id || index} className="flex flex-wrap items-center gap-2 sm:gap-4 bg-white/40 p-3 rounded-xl backdrop-blur-sm border border-cyan-200/30 min-w-0">
                <input type="text" value={txn.merchant} onChange={(e) => updateTransaction(index, "merchant", e.target.value)} className="flex-1 min-w-[120px] bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="Merchant" />
                <input type="text" value={txn.type} onChange={(e) => updateTransaction(index, "type", e.target.value)} className="w-32 bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="Type" />
                <input type="text" value={txn.category} onChange={(e) => updateTransaction(index, "category", e.target.value)} className="w-32 bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="Category" />
                <input type="text" value={txn.amount} onChange={(e) => updateTransaction(index, "amount", e.target.value)} className="w-24 bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="$0.00" />
                <select value={txn.status} onChange={(e) => updateTransaction(index, "status", e.target.value)} className="w-32 bg-white/50 px-2 py-1.5 rounded-lg text-sm font-bold border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500"><option value="completed">Completed</option><option value="pending">Pending</option><option value="failed">Failed</option></select>
                <select value={txn.isNegative ? "expense" : "income"} onChange={(e) => updateTransaction(index, "isNegative", e.target.value === "expense")} className="w-32 bg-white/50 px-2 py-1.5 rounded-lg text-sm font-bold border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500"><option value="expense">Expense (-)</option><option value="income">Income (+)</option></select>
                <button onClick={() => deleteTransaction(index)} className="p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-600 transition-colors"><Trash2 size={16} /></button>
              </div>
            ))}
            {(!dashData?.recentTransactions || dashData.recentTransactions.length === 0) && (<p className="text-center text-cyan-600/50 font-bold py-4">No transactions for this user yet.</p>)}
          </div>
        </motion.div>

        {/* Payment Methods Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#C4F8FD] rounded-2xl p-6 shadow-xl mb-6 min-w-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-cyan-800 flex items-center gap-2"><CreditCard size={20} /> Manage Payment Methods</h2>
            <button onClick={addPaymentMethod} className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-lg"><Plus size={16} /> Add Payment Method</button>
          </div>
          <div className="space-y-3">
            {(dashData?.paymentMethods || []).map((method: any, index: number) => (
              <div key={method.id || index} className="flex flex-wrap items-center gap-2 sm:gap-4 bg-white/40 p-3 rounded-xl backdrop-blur-sm border border-cyan-200/30 min-w-0">
                <input type="text" value={method.brand} onChange={(e) => updatePaymentMethod(index, "brand", e.target.value)} className="w-32 bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="Brand" />
                <input type="text" value={method.last4} onChange={(e) => updatePaymentMethod(index, "last4", e.target.value)} className="w-24 bg-white/50 px-3 py-1.5 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="Last 4" />
                <select value={method.type} onChange={(e) => updatePaymentMethod(index, "type", e.target.value)} className="w-32 bg-white/50 px-2 py-1.5 rounded-lg text-sm font-bold border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500"><option value="Credit Card">Credit Card</option><option value="Debit Card">Debit Card</option><option value="PayPal">PayPal</option><option value="Bank Transfer">Bank Transfer</option></select>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={method.isDefault} onChange={(e) => updatePaymentMethod(index, "isDefault", e.target.checked)} className="h-4 w-4 rounded border-cyan-300 text-cyan-600 focus:ring-cyan-500" />
                  <label className="text-xs font-bold text-cyan-700">Default</label>
                </div>
                <button onClick={() => deletePaymentMethod(index)} className="p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-600 transition-colors"><Trash2 size={16} /></button>
              </div>
            ))}
            {(!dashData?.paymentMethods || dashData.paymentMethods.length === 0) && (<p className="text-center text-cyan-600/50 font-bold py-4">No payment methods for this user yet.</p>)}
          </div>
        </motion.div>

        {/* Preferences & Payment Details Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#C4F8FD] rounded-2xl p-6 shadow-xl mb-6 min-w-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-cyan-800 flex items-center gap-2"><Settings size={20} /> Manage Payment & Preferences</h2>
            <button onClick={addPreference} className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-lg"><Plus size={16} /> Add Preference</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white/30 p-4 rounded-xl border border-cyan-200/30 min-w-0">
            <div className="md:col-span-2 flex items-center gap-2">
              <Landmark size={18} className="text-cyan-700" />
              <h3 className="text-sm font-bold text-cyan-800">Domestic Bank</h3>
            </div>
            <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">Domestic Bank Name</label><input type="text" value={dashData?.preferences?.domesticBankName || ""} onChange={(e) => updatePreference("domesticBankName", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
            <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">Domestic Account Name</label><input type="text" value={dashData?.preferences?.domesticAccountName || ""} onChange={(e) => updatePreference("domesticAccountName", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
            <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">Domestic Account Number</label><input type="text" value={dashData?.preferences?.domesticAccountNumber || ""} onChange={(e) => updatePreference("domesticAccountNumber", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
            <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">Domestic Routing Number</label><input type="text" value={dashData?.preferences?.domesticRoutingNumber || ""} onChange={(e) => updatePreference("domesticRoutingNumber", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>

            <div className="md:col-span-2 flex items-center gap-2 mt-4">
              <Landmark size={18} className="text-cyan-700" />
              <h3 className="text-sm font-bold text-cyan-800">International Bank</h3>
            </div>
            <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">Bank Name</label><input type="text" value={dashData?.preferences?.bankName || ""} onChange={(e) => updatePreference("bankName", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
            <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">Account Name</label><input type="text" value={dashData?.preferences?.accountName || ""} onChange={(e) => updatePreference("accountName", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
            <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">Account Number</label><input type="text" value={dashData?.preferences?.accountNumber || ""} onChange={(e) => updatePreference("accountNumber", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
            <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">SWIFT Code</label><input type="text" value={dashData?.preferences?.swiftCode || ""} onChange={(e) => updatePreference("swiftCode", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
            <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">IBAN</label><input type="text" value={dashData?.preferences?.iban || ""} onChange={(e) => updatePreference("iban", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>

            <div className="md:col-span-2 flex items-center gap-2 mt-4">
              <Bitcoin size={18} className="text-orange-500" />
              <h3 className="text-sm font-bold text-cyan-800">Crypto Payment</h3>
            </div>
            <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">Crypto Name (e.g. Bitcoin)</label><input type="text" value={dashData?.preferences?.cryptoName || ""} onChange={(e) => updatePreference("cryptoName", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
            <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">Crypto Network (e.g. BTC)</label><input type="text" value={dashData?.preferences?.cryptoNetwork || ""} onChange={(e) => updatePreference("cryptoNetwork", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
            <div className="min-w-0"><label className="text-xs font-bold text-cyan-700">Crypto Address</label><input type="text" value={dashData?.preferences?.cryptoAddress || ""} onChange={(e) => updatePreference("cryptoAddress", e.target.value)} className="w-full min-w-0 bg-white/50 px-3 py-2 rounded-lg text-sm text-cyan-900 border border-cyan-200/50 focus:outline-none" /></div>
          </div>

          <div className="flex flex-wrap gap-3 min-w-0">
            {dashData?.preferences && Object.keys(dashData.preferences).length > 0 ? (
              Object.entries(dashData.preferences).map(([key, value]: [string, any]) => (
                <div key={key} className="flex items-center gap-3 bg-white/40 px-4 py-2 rounded-xl backdrop-blur-sm border border-cyan-200/30 min-w-0">
                  <span className="text-sm font-bold text-cyan-800 break-words">{key}:</span>
                  <textarea value={value} onChange={(e) => updatePreference(key, e.target.value)} className="w-32 bg-white/50 px-2 py-1 rounded-lg text-sm font-bold text-cyan-900 border border-cyan-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500 min-h-[2.5rem]" rows={1} />
                  <button onClick={() => deletePreference(key)} className="p-1 bg-red-500/20 hover:bg-red-500/40 rounded-md text-red-600 transition-colors"><X size={16} /></button>
                </div>
              ))
            ) : (
              <p className="text-center text-cyan-600/50 font-bold py-4 w-full">No preferences set for this user yet.</p>
            )}
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.button
        suppressHydrationWarning
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        disabled={saving}
        className={`w-full rounded-xl py-3.5 font-extrabold text-cyan-900 shadow-xl
        transition-all ${saving ? "bg-gray-500 cursor-not-allowed" : "bg-[#C4F8FD] shadow-cyan-500/30 shadow-xl hover:shadow-cyan-500/50"}`}>
          <span className="flex items-center justify-center gap-2">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save size={20} />}
            {saving ? "Saving Changes..." : "Save"}
          </span>
        </motion.button>

      </div>
      <ChatWidgett/>
    </div>
  );
}