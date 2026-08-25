// // app/components/BuyAssetModal.tsx
// "use client";

// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   X, 
//   Send, 
//   ArrowUpRight, 
//   ArrowDownRight, 
//   Loader2, 
//   Landmark, 
//   Wallet, 
//   CheckCircle 
// } from "lucide-react";
// import { useRouter } from "next/navigation";

// // ---- Types ----------------------------------------------------------------
// interface Asset {
//   id: string;
//   name: string;
//   symbol: string;
//   price: number;
//   changePercent: number;
//   icon?: React.ReactNode;
//   type?: string;
// }

// interface PaymentMethod {
//   id: string;
//   type: string;
//   last4: string;
//   brand: string;
//   isDefault: boolean;
//   // New fields set by Admin
//   bankName?: string;
//   accountNumber?: string;
//   walletId?: string;
// }

// interface UserPaymentData {
//   paymentMethods: PaymentMethod[];
// }

// // ---- Component Props -------------------------------------------------------
// interface BuyAssetModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   asset: Asset | null;
//   userId: string; // Needed to fetch this specific user's payment data
// }

// // ---- Main Component --------------------------------------------------------
// export default function BuyAssetModal({ isOpen, onClose, asset, userId }: BuyAssetModalProps) {
//   const router = useRouter();
//   const [amount, setAmount] = useState<string>("");
//   const [isProcessing, setIsProcessing] = useState<boolean>(false);
//   const [paymentData, setPaymentData] = useState<UserPaymentData | null>(null);
//   const [loadingPaymentData, setLoadingPaymentData] = useState<boolean>(false);
//   const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

//   // ---- Fetch User's Payment Methods from DB when Modal Opens ----
//   useEffect(() => {
//     if (isOpen && userId) {
//       fetchPaymentData();
//     }
//   }, [isOpen, userId]);

//   const fetchPaymentData = async () => {
//     setLoadingPaymentData(true);
//     try {
//       // Directly fetch dashdata from your existing server action
//       const { getUserDashData } = await import("@/app/actions/admin");
//       const result = await getUserDashData(userId);
      
//       if (result.success && result.data) {
//         const methods = result.data.paymentMethods || [];
//         setPaymentData({ paymentMethods: methods });
        
//         // Auto-select the first/default method
//         const defaultMethod = methods.find((m: PaymentMethod) => m.isDefault);
//         setSelectedMethod(defaultMethod || methods[0] || null);
//       }
//     } catch (error) {
//       console.error("Failed to load payment details:", error);
//     } finally {
//       setLoadingPaymentData(false);
//     }
//   };

//   // ---- Handlers ------------------------------------------------------------
//   const handleInvest = async () => {
//     if (!asset || !amount || parseFloat(amount) <= 0) return;
    
//     setIsProcessing(true);
    
//     // Simulate investment processing
//     await new Promise(resolve => setTimeout(resolve, 1500));
    
//     setIsProcessing(false);
//     alert(`Successfully invested $${amount} into ${asset.name}!`);
//     onClose();
//     setAmount("");
//   };

//   const isPositive = asset ? asset.changePercent >= 0 : true;

//   // ---- Render ----
//   return (
//     <AnimatePresence>
//       {isOpen && asset && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
//           onClick={onClose}
//         >
//           <motion.div
//             initial={{ scale: 0.9, y: 20 }}
//             animate={{ scale: 1, y: 0 }}
//             exit={{ scale: 0.9, y: 20 }}
//             className="w-full max-w-md rounded-2xl bg-[#C4F8FD] p-6 shadow-2xl"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Header */}
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold text-cyan-900">
//                 Invest in {asset.name}
//               </h2>
//               <button onClick={onClose} className="text-cyan-700 hover:text-cyan-900 transition-colors">
//                 <X size={24} />
//               </button>
//             </div>

//             {/* Asset Preview Box */}
//             <div className={`rounded-xl p-4 mb-4 bg-gradient-to-br from-cyan-100 to-blue-100 border border-cyan-200/30 shadow-lg`}>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs font-bold text-cyan-700">{asset.symbol}</p>
//                   <p className="text-2xl font-bold text-cyan-900">${asset.price.toFixed(2)}</p>
//                 </div>
//                 <div className={`flex items-center gap-1 font-bold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
//                   {isPositive ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
//                   <span>{Math.abs(asset.changePercent).toFixed(2)}%</span>
//                 </div>
//               </div>
//             </div>

//             {/* Payment Methods Data Loading */}
//             {loadingPaymentData ? (
//               <div className="py-4 flex justify-center text-cyan-700">
//                 <Loader2 className="h-6 w-6 animate-spin" />
//               </div>
//             ) : paymentData && paymentData.paymentMethods.length > 0 ? (
//               <div className="space-y-4">
                
//                 {/* Input Amount */}
//                 <div>
//                   <label className="text-xs font-bold text-cyan-700 block mb-1">
//                     Amount to Invest (USD)
//                   </label>
//                   <input
//                     type="number"
//                     placeholder="0.00"
//                     value={amount}
//                     onChange={(e) => setAmount(e.target.value)}
//                     className="w-full rounded-xl border border-cyan-200/50 bg-white/50 px-4 py-3 text-cyan-900 font-bold placeholder:text-cyan-600/50 focus:border-cyan-500 focus:outline-none shadow-lg transition-colors"
//                   />
//                 </div>

//                 {/* Preset Buttons */}
//                 <div className="flex gap-2">
//                   {[100, 500, 1000, 5000].map((preset) => (
//                     <button
//                       key={preset}
//                       onClick={() => setAmount(preset.toString())}
//                       className="flex-1 rounded-lg bg-white/40 px-3 py-1.5 text-xs font-bold text-cyan-800 hover:bg-white/70 transition-colors shadow-md border border-cyan-200/30"
//                     >
//                       ${preset}
//                     </button>
//                   ))}
//                 </div>

//                 {/* Select Payment Method */}
//                 <div className="border-t border-cyan-200/30 pt-4 mt-2">
//                   <label className="text-xs font-bold text-cyan-700 block mb-2">
//                     Select Payment Method
//                   </label>
//                   <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
//                     {paymentData.paymentMethods.map((method) => (
//                       <button
//                         key={method.id}
//                         onClick={() => setSelectedMethod(method)}
//                         className={`w-full flex items-center justify-between rounded-lg p-3 border transition-all ${
//                           selectedMethod?.id === method.id
//                             ? "bg-cyan-500/20 border-cyan-500 shadow-md"
//                             : "bg-white/30 border-cyan-200/30 hover:bg-white/50"
//                         }`}
//                       >
//                         <div className="flex items-center gap-3">
//                           {method.type === "Bank Transfer" ? (
//                             <Landmark size={18} className="text-cyan-700" />
//                           ) : (
//                             <Wallet size={18} className="text-cyan-700" />
//                           )}
//                           <div className="text-left">
//                             <p className="text-sm font-bold text-cyan-900">{method.brand}</p>
//                             <p className="text-xs text-cyan-600">{method.type}</p>
//                           </div>
//                         </div>
//                         {method.isDefault && (
//                           <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/20 px-2 py-0.5 rounded-full">
//                             Default
//                           </span>
//                         )}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* ⭐ PAYMENT DETAILS (Admin Configured Data) ⭐ */}
//                 {selectedMethod && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="rounded-lg bg-white/40 p-4 border border-cyan-200/30 shadow-lg mt-2"
//                   >
//                     <p className="text-xs font-bold text-cyan-600/80 mb-2 uppercase tracking-wider">
//                       Payment Details
//                     </p>
                    
//                     {/* Bank Transfer Details */}
//                     {selectedMethod.type === "Bank Transfer" && (
//                       <div className="space-y-1">
//                         <p className="text-sm text-cyan-900">
//                           <span className="font-bold text-cyan-700">Bank:</span> {selectedMethod.bankName || "Not Set"}
//                         </p>
//                         <p className="text-sm text-cyan-900">
//                           <span className="font-bold text-cyan-700">Account:</span> {selectedMethod.accountNumber || "Not Set"}
//                         </p>
//                       </div>
//                     )}

//                     {/* Crypto Wallet Details */}
//                     {selectedMethod.type !== "Bank Transfer" && (
//                       <div className="space-y-1">
//                         <p className="text-sm text-cyan-900">
//                           <span className="font-bold text-cyan-700">Wallet ID:</span> 
//                           <span className="font-mono ml-1 bg-cyan-100 px-2 py-0.5 rounded">
//                             {selectedMethod.walletId || "Not Set"}
//                           </span>
//                         </p>
//                       </div>
//                     )}
//                   </motion.div>
//                 )}

//                 {/* Confirm Button */}
//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={handleInvest}
//                   disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
//                   className={`w-full rounded-xl py-3.5 font-extrabold shadow-lg transition-all ${
//                     isProcessing || !amount || parseFloat(amount) <= 0
//                       ? "bg-gray-400 text-white cursor-not-allowed shadow-gray-400/30"
//                       : "bg-gradient-to-r from-amber-400 to-yellow-500 text-cyan-900 shadow-amber-500/30 hover:shadow-amber-500/50"
//                   }`}
//                 >
//                   <span className="flex items-center justify-center gap-2">
//                     {isProcessing ? (
//                       <Loader2 className="h-5 w-5 animate-spin" />
//                     ) : (
//                       <Send size={18} />
//                     )}
//                     {isProcessing ? "Processing..." : `Confirm Investment`}
//                   </span>
//                 </motion.button>

//               </div>
//             ) : (
//               <div className="py-8 text-center text-cyan-700">
//                 <p className="font-bold">No payment methods set</p>
//                 <p className="text-sm">Please contact support.</p>
//               </div>
//             )}
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }