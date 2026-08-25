// "use client";

// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import ChatWidgett from '@/app/components/ChatWidgett';
// import {
//   User,
//   Lock,
//   Eye,
//   EyeOff,
//   ArrowRight,
//   Shield,
//   CheckCircle,
//   AlertCircle,
//   Loader2,
//   CreditCard,
//   TrendingUp,
//   Globe,
//   Gem,
//   Bitcoin,
// } from "lucide-react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// // ---- Types ----------------------------------------------------------------

// interface FormData {
//   username: string;
//   password: string;
// }

// interface UserProfile {
//   _id: string;
//   firstName: string;
//   lastName: string;
//   username: string;
//   displayName: string;
//   email: string;
//   phone: string;
//   accountType: string;
//   isActive: boolean;
//   isVerified: boolean;
//   role: string;
//   isAdmin: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// interface MarketStatus {
//   label: string;
//   value: string;
//   status: "active" | "inactive" | "up" | "down" | "neutral";
//   marketStatus: "open" | "closed" | "unknown";
// }

// interface LoginResponse {
//   success: boolean;
//   message?: string;
//   error?: string;
//   user?: UserProfile;
//   token?: string;
//   refreshedToken?: string;
//   remainingAttempts?: number;
//   lockedUntil?: string;
// }

// // ============================================================================
// // ANIMATION VARIANTS
// // ============================================================================

// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: { staggerChildren: 0.08, delayChildren: 0.1 },
//   },
// };

// const itemVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.4, ease: "easeOut" as const },
//   },
// };

// const cardVariants = {
//   hidden: { opacity: 0, scale: 0.95 },
//   visible: {
//     opacity: 1,
//     scale: 1,
//     transition: { duration: 0.5, ease: "easeOut" as const },
//   },
// };

// // ============================================================================
// // LOADING SKELETON
// // ============================================================================

// const LoadingSkeleton = () => (
//   <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
//     <div className="mx-auto max-w-6xl space-y-4">
//       <div className="h-12 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//       <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//         <div className="h-96 animate-pulse rounded-2xl shadow-xl bg-[#C4F8FD]" />
//         <div className="space-y-4">
//           <div className="h-48 animate-pulse rounded-2xl shadow-xl bg-[#C4F8FD]" />
//           <div className="h-48 animate-pulse rounded-2xl shadow-xl bg-[#C4F8FD]" />
//         </div>
//         <div className="space-y-4">
//           <div className="h-48 animate-pulse rounded-2xl shadow-xl bg-[#C4F8FD]" />
//           <div className="h-48 animate-pulse rounded-2xl shadow-xl bg-[#C4F8FD]" />
//         </div>
//       </div>
//     </div>
//   </div>
// );

// // ============================================================================
// // MAIN COMPONENT
// // ============================================================================

// export default function LoginPage() {
//   const router = useRouter();
//   const [formData, setFormData] = useState<FormData>({
//     username: "",
//     password: "",
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [mounted, setMounted] = useState(false);
//   const [isLoadingMarket, setIsLoadingMarket] = useState(true);
//   const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
//   const [isLocked, setIsLocked] = useState(false);

//   const [marketData, setMarketData] = useState<MarketStatus[]>([
//     { label: "MARKET STATUS", value: "LOADING", status: "neutral", marketStatus: "unknown" },
//     { label: "GOLD", value: "---", status: "neutral", marketStatus: "unknown" },
//     { label: "SILVER", value: "---", status: "neutral", marketStatus: "unknown" },
//     { label: "BTC", value: "---", status: "neutral", marketStatus: "unknown" },
//     { label: "ETH", value: "---", status: "neutral", marketStatus: "unknown" },
//   ]);
//   const [marketError, setMarketError] = useState(false);

//   // ---- Effects --------------------------------------------------------------

//   useEffect(() => {
//     setMounted(true);
//     fetchMarketData();
//     const interval = setInterval(fetchMarketData, 20000);

//     return () => {
//       clearInterval(interval);
//     };
//   }, []);

//   // ---- Market Data Functions ------------------------------------------------

//   const fetchMarketData = async () => {
//     setIsLoadingMarket(true);
//     setMarketError(false);

//     try {
//       const response = await fetch(
//         `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,gold,silver&vs_currencies=usd&include_24hr_change=true`
//       );

//       if (!response.ok) {
//         throw new Error(`API error: ${response.status}`);
//       }

//       const data = await response.json();
//       const isMarketOpen = checkMarketHours();

//       const getAssetMarketStatus = (change: number): "open" | "closed" => {
//         if (!isMarketOpen) return "closed";
//         if (Math.abs(change) > 0.01) return "open";
//         return "open";
//       };

//       const formattedData: MarketStatus[] = [
//         {
//           label: "MARKET STATUS",
//           value: isMarketOpen ? "● OPEN" : "● CLOSED",
//           status: isMarketOpen ? "active" : "inactive",
//           marketStatus: isMarketOpen ? "open" : "closed",
//         },
//         {
//           label: "GOLD",
//           value: formatPriceChange(data.gold?.usd_1h_change || 0),
//           status: getStatus(data.gold?.usd_1h_change || 0),
//           marketStatus: getAssetMarketStatus(data.gold?.usd_1h_change || 0),
//         },
//         {
//           label: "SILVER",
//           value: formatPriceChange(data.silver?.usd_1h_change || 0),
//           status: getStatus(data.silver?.usd_1h_change || 0),
//           marketStatus: getAssetMarketStatus(data.silver?.usd_1h_change || 0),
//         },
//         {
//           label: "BTC",
//           value: formatPriceChange(data.bitcoin?.usd_1h_change || 0),
//           status: getStatus(data.bitcoin?.usd_1h_change || 0),
//           marketStatus: getAssetMarketStatus(data.bitcoin?.usd_1h_change || 0),
//         },
//         {
//           label: "ETH",
//           value: formatPriceChange(data.ethereum?.usd_1h_change || 0),
//           status: getStatus(data.ethereum?.usd_1h_change || 0),
//           marketStatus: getAssetMarketStatus(data.ethereum?.usd_1h_change || 0),
//         },
//       ];

//       setMarketData(formattedData);
//     } catch {
//       setMarketError(true);

//       const isMarketOpen = checkMarketHours();
//       setMarketData([
//         {
//           label: "MARKET STATUS",
//           value: isMarketOpen ? "● OPEN" : "● CLOSED",
//           status: isMarketOpen ? "active" : "inactive",
//           marketStatus: isMarketOpen ? "open" : "closed",
//         },
//         {
//           label: "GOLD",
//           value: formatPriceChange(1.24),
//           status: "up",
//           marketStatus: isMarketOpen ? "open" : "closed",
//         },
//         {
//           label: "SILVER",
//           value: formatPriceChange(0.82),
//           status: "up",
//           marketStatus: isMarketOpen ? "open" : "closed",
//         },
//         {
//           label: "BTC",
//           value: formatPriceChange(1.24),
//           status: "up",
//           marketStatus: isMarketOpen ? "open" : "closed",
//         },
//         {
//           label: "ETH",
//           value: formatPriceChange(0.82),
//           status: "up",
//           marketStatus: isMarketOpen ? "open" : "closed",
//         },
//       ]);
//     } finally {
//       setIsLoadingMarket(false);
//     }
//   };

//   const checkMarketHours = (): boolean => {
//     const now = new Date();
//     const day = now.getDay();
//     const hours = now.getHours();
//     const minutes = now.getMinutes();

//     if (day === 0 || day === 6) return false;

//     const estHours = (hours - 5 + 24) % 24;
//     const estMinutes = minutes;

//     if (estHours > 9 || (estHours === 9 && estMinutes >= 30)) {
//       if (estHours < 16 || (estHours === 16 && estMinutes === 0)) {
//         return true;
//       }
//     }

//     return false;
//   };

//   const getStatus = (change: number): "up" | "down" | "neutral" => {
//     if (change > 0.1) return "up";
//     if (change < -0.1) return "down";
//     return "neutral";
//   };

//   const formatPriceChange = (change: number): string => {
//     const sign = change > 0 ? "+" : "";
//     return `${sign}${change.toFixed(2)}%`;
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "active":
//         return "text-emerald-600";
//       case "inactive":
//         return "text-red-600";
//       case "up":
//         return "text-emerald-600";
//       case "down":
//         return "text-red-600";
//       default:
//         return "text-slate-600";
//     }
//   };

//   const getStatusDot = (status: string) => {
//     switch (status) {
//       case "active":
//         return "bg-emerald-500";
//       case "inactive":
//         return "bg-red-500";
//       case "up":
//         return "bg-emerald-500";
//       case "down":
//         return "bg-red-500";
//       default:
//         return "bg-gray-500";
//     }
//   };

//   const getMarketStatusBadge = (marketStatus: string) => {
//     if (marketStatus === "open") {
//       return (
//         <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/20 px-2 py-0.5 rounded-full">
//           ● Open
//         </span>
//       );
//     } else if (marketStatus === "closed") {
//       return (
//         <span className="text-[10px] font-bold text-red-600 bg-red-500/20 px-2 py-0.5 rounded-full">
//           ● Closed
//         </span>
//       );
//     } else {
//       return (
//         <span className="text-[10px] font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-full">
//           Unknown
//         </span>
//       );
//     }
//   };

//   // ---- Form Handlers --------------------------------------------------------

//   const handleChange = (field: keyof FormData, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//     setError("");
//     setIsLocked(false);
//   };

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.username || !formData.password) {
//       setError("Please fill in all fields");
//       return;
//     }

//     setIsLoading(true);
//     setError("");
//     setSuccess("");
//     setIsLocked(false);

//     try {
//       const response = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: formData.username,
//           password: formData.password,
//         }),
//       });

//       const result: LoginResponse = await response.json();

//       if (!response.ok) {
//         if (response.status === 429) {
//           setIsLocked(true);
//           setError(result.error || "Account locked. Please try again later.");
//           setRemainingAttempts(0);
//           return;
//         }

//         if (result.remainingAttempts !== undefined) {
//           setError(`${result.error || "Invalid credentials"} (${result.remainingAttempts} attempts remaining)`);
//           setRemainingAttempts(result.remainingAttempts);
//         } else {
//           setError(result.error || "Login failed");
//         }
//         return;
//       }

//       // ✅ Login successful - store token and user data
//       if (result.token && result.user) {
//         // Store token
//         localStorage.setItem("auth_token", result.token);
//         localStorage.setItem("user", JSON.stringify(result.user));
        
//         // ✅ If token was refreshed, store the new token too
//         if (result.refreshedToken) {
//           localStorage.setItem("auth_token", result.refreshedToken);
//           console.log('🔄 Token refreshed to new secret');
//         }
        
//         // Set cookie for middleware
//         document.cookie = `auth_token=${result.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        
//         // ✅ If token was refreshed, also update the cookie with refreshed token
//         if (result.refreshedToken) {
//           document.cookie = `auth_token=${result.refreshedToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
//         }
//       }

//       setSuccess("Login successful! Redirecting...");
//       setRemainingAttempts(null);
//       setIsLocked(false);

//       // ✅ Check user role and redirect accordingly
//       setTimeout(() => {
//         const isAdmin = result.user?.role === "admin" || result.user?.isAdmin === true;
//         if (isAdmin) {
//           router.push("/me");
//         } else {
//           router.push("/Dashboard");
//         }
//       }, 1000);

//     } catch (err: unknown) {
//       const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again.";
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ---- Render ----------------------------------------------------------------

//   if (!mounted) {
//     return <LoadingSkeleton />;
//   }

//   return (
//     <div className="min-h-screen w-full bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 px-4 py-6 sm:px-6 md:px-8">
//       <motion.div
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//         className="mx-auto max-w-6xl"
//       >
//         <motion.div variants={itemVariants} className="mb-8 flex items-center gap-3">
//           <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600/20">
//             {/* Logo placeholder */}
//           </div>
//         </motion.div>

//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
//           {/* Login Form Card */}
//           <motion.div
//             variants={cardVariants}
//             className="rounded-2xl bg-[#C4F8FD] p-6 shadow-xl backdrop-blur-sm border-none sm:p-8"
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <h2 className="text-lg font-bold text-slate-600 sm:text-xl">
//                   Welcome
//                 </h2>
//                 <p className="text-xs text-cyan-600/80 sm:text-sm">
//                   Sign in to your account
//                 </p>
//               </div>
//               <div className="rounded-lg bg-cyan-600/20 px-3 py-1 text-xs font-medium text-cyan-700">
//                 Secure
//               </div>
//             </div>

//             <motion.div
//               variants={itemVariants}
//               className="mt-4 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-700 p-4 text-white shadow-xl border-none"
//             >
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs text-white/70">•••• ••43• ••230</p>
//                   <p className="mt-1 font-mono text-sm tracking-widest sm:text-base">
//                     •••• •••• •••
//                   </p>
//                 </div>
//                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
//                   <CreditCard className="h-5 w-5" />
//                 </div>
//               </div>
//             </motion.div>

//             <AnimatePresence>
//               {error && (
//                 <motion.div
//                   initial={{ opacity: 0, y: -10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -10 }}
//                   className={`mt-4 flex items-center gap-2 rounded-lg border px-4 py-2.5 ${
//                     isLocked 
//                       ? 'border-orange-500/20 bg-orange-500/10' 
//                       : 'border-red-500/20 bg-red-500/10'
//                   }`}
//                 >
//                   {isLocked ? (
//                     <AlertCircle className="h-4 w-4 text-orange-500" />
//                   ) : (
//                     <AlertCircle className="h-4 w-4 text-red-500" />
//                   )}
//                   <span className={`text-sm ${isLocked ? 'text-orange-500' : 'text-red-500'}`}>
//                     {error}
//                   </span>
//                 </motion.div>
//               )}
//               {success && (
//                 <motion.div
//                   initial={{ opacity: 0, y: -10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -10 }}
//                   className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5"
//                 >
//                   <CheckCircle className="h-4 w-4 text-emerald-500" />
//                   <span className="text-sm text-emerald-500">{success}</span>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             <form onSubmit={handleLogin} className="mt-6 space-y-4">
//               <div>
//                 <label className="block text-xs font-medium text-slate-600">
//                   Username or Account ID
//                 </label>
//                 <div className="relative mt-1">
//                   <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600/60">
//                     <User className="h-4 w-4" />
//                   </div>
//                   <input
//                     type="text"
//                     value={formData.username}
//                     onChange={(e) => handleChange("username", e.target.value)}
//                     className="w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2.5 pl-9 text-sm text-cyan-900 placeholder:text-cyan-600/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
//                     placeholder="Enter your email or account ID"
//                     disabled={isLocked}
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-xs font-medium text-slate-600">
//                   Passcode
//                 </label>
//                 <div className="relative mt-1">
//                   <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600/60">
//                     <Lock className="h-4 w-4" />
//                   </div>
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={formData.password}
//                     onChange={(e) => handleChange("password", e.target.value)}
//                     className="w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2.5 pl-9 pr-10 text-sm text-cyan-900
//                      placeholder:text-cyan-600/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
//                     placeholder="Enter your passcode"
//                     disabled={isLocked}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-600/60 hover:text-cyan-800"
//                     disabled={isLocked}
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-4 w-4" />
//                     ) : (
//                       <Eye className="h-4 w-4" />
//                     )}
//                   </button>
//                 </div>
//               </div>

//               {remainingAttempts !== null && remainingAttempts > 0 && (
//                 <p className="text-xs text-amber-600">
//                   ⚠️ {remainingAttempts} attempts remaining before account lockout
//                 </p>
//               )}

//               <motion.button
//                 whileHover={{ scale: isLocked ? 1 : 1.02 }}
//                 whileTap={{ scale: isLocked ? 1 : 0.98 }}
//                 type="submit"
//                 disabled={isLoading || isLocked}
//                 className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition ${
//                   isLocked 
//                     ? 'bg-gray-400 cursor-not-allowed'
//                     : 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500'
//                 } disabled:opacity-50`}
//               >
//                 {isLoading ? (
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                 ) : isLocked ? (
//                   'Account Locked'
//                 ) : (
//                   <>
//                     Sign In
//                     <ArrowRight className="h-4 w-4" />
//                   </>
//                 )}
//               </motion.button>

//               <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
//                 <span>
//                   New here?{" "}
//                   <Link
//                     href="/sign-up"
//                     className="font-medium text-cyan-700 hover:underline"
//                   >
//                     Create Account
//                   </Link>
//                 </span>
//                 {isLocked && (
//                   <span className="text-orange-600">
//                     Try again in 15 minutes
//                   </span>
//                 )}
//               </div>
//             </form>
//           </motion.div>

//           {/* Right Side - Market Info */}
//           <motion.div
//             variants={cardVariants}
//             className="space-y-4"
//           >
//             {/* Market Status Card */}
//             <div className="rounded-2xl bg-[#C4F8FD] p-6 shadow-xl backdrop-blur-sm border-none">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-sm font-semibold text-slate-600">
//                   Real-Time Market
//                 </h3>
//                 {isLoadingMarket ? (
//                   <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
//                 ) : marketError ? (
//                   <button
//                     onClick={fetchMarketData}
//                     className="text-xs text-cyan-600 hover:underline"
//                   >
//                     Retry
//                   </button>
//                 ) : (
//                   <span className="text-xs text-cyan-600/60">Live</span>
//                 )}
//               </div>
//               <div className="mt-3 space-y-2">
//                 {marketData.map((item, index) => (
//                   <motion.div
//                     key={item.label}
//                     variants={itemVariants}
//                     custom={index}
//                     className="flex items-center justify-between rounded-lg bg-white/50 px-4 py-2.5 border-none shadow-sm"
//                   >
//                     <div className="flex items-center gap-2">
//                       {item.label === "GOLD" && <Gem className="h-3.5 w-3.5 text-amber-500" />}
//                       {item.label === "SILVER" && <Gem className="h-3.5 w-3.5 text-slate-400" />}
//                       {item.label === "BTC" && <Bitcoin className="h-3.5 w-3.5 text-orange-500" />}
//                       {item.label === "ETH" && <Bitcoin className="h-3.5 w-3.5 text-purple-500" />}
//                       <span className="text-xs font-medium text-slate-600">
//                         {item.label}
//                       </span>
//                       {item.label !== "MARKET STATUS" && (
//                         <span className="ml-1">
//                           {getMarketStatusBadge(item.marketStatus)}
//                         </span>
//                       )}
//                     </div>
//                     <div className="flex items-center gap-2">
//                       {item.status === "active" && (
//                         <motion.span
//                           animate={{ opacity: [1, 0.4, 1] }}
//                           transition={{ duration: 2, repeat: Infinity }}
//                           className={`h-1.5 w-1.5 rounded-full ${getStatusDot(item.status)}`}
//                         />
//                       )}
//                       {item.status === "inactive" && (
//                         <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(item.status)}`} />
//                       )}
//                       <span
//                         className={`text-sm font-semibold ${getStatusColor(item.status)}`}
//                       >
//                         {item.value}
//                       </span>
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
//             </div>

//             {/* Elite Benefits Card */}
//             <div className="rounded-2xl bg-[#C4F8FD] p-6 shadow-xl backdrop-blur-sm border-none">
//               <h3 className="text-sm font-bold text-cyan-600">
//                 Benefits
//               </h3>
//               <div className="mt-3 space-y-2">
//                 {[
//                   { icon: Shield, text: "End-to-end 256-bit encryption" },
//                   { icon: TrendingUp, text: "Real-time market insights" },
//                   { icon: Globe, text: "Global multi-currency support" },
//                 ].map((feature, index) => (
//                   <motion.div
//                     key={index}
//                     variants={itemVariants}
//                     custom={index + 3}
//                     className="flex items-center gap-3 rounded-lg bg-[#C4F8FD] px-4 py-2.5 border-none shadow-xl"
//                   >
//                     <div className="rounded-full bg-cyan-500/20 p-1.5">
//                       <feature.icon className="h-3.5 w-3.5 text-cyan-700" />
//                     </div>
//                     <span className="text-xs text-cyan-900">
//                       {feature.text}
//                     </span>
//                   </motion.div>
//                 ))}
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </motion.div>
//       <ChatWidgett />
//     </div>
//   );
// }

































// app/log-in/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Greet from '@/app/components/Greet';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2 
} from 'lucide-react';
import ChatWidgett from '@/app/components/ChatWidgett';
import MarketStatus from '@/app/components/MarketStatus';

// ---- Types ----------------------------------------------------------------

interface FormData {
  email: string;
  password: string;
}

// ---- Animation Variants ----------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 } as const,
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" } as const,
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 } as const,
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" } as const,
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ---- Form Handlers --------------------------------------------------------

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
    setIsLocked(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    setIsLocked(false);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setIsLocked(true);
          setError(result.error || 'Account locked. Please contact support.');
          setRemainingAttempts(0);
          return;
        }

        if (result.remainingAttempts !== undefined) {
          setError(`Invalid credentials (${result.remainingAttempts} attempts remaining)`);
          setRemainingAttempts(result.remainingAttempts);
        } else {
          setError(result.error || 'Login failed');
        }
        return;
      }

      // ✅ FIX 1: Use 'auth_token' to match your Middleware
      if (result.token && result.user) {
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
      }

      setSuccess('Login successful!');
      setRemainingAttempts(null);
      setIsLocked(false);

      // ✅ FIX 2: Handle Redirect after state is completely synced
      setTimeout(() => {
        const isAdmin = result.user?.role === 'admin' || result.user?.isAdmin === true;
        if (isAdmin) {
          router.push('/me');
        } else {
          router.push('/Dashboard');
        }
      }, 1000);

    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Loading State --------------------------------------------------------

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
        </div>
      </div>
    );
  }

  // ---- Render ----------------------------------------------------------------

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 px-4 py-6 sm:px-6 md:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-6xl"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-2xl font-bold text-slate-700"><Greet/></h1>
          <p className="text-bold text-cyan-600/80">login to your account</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Login Form */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl bg-[#C4F8FD] p-6 shadow-xl sm:p-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-600/80 font-bold sm:text-sm">
                  Sign in to your account
                </p>
              </div>
              <div className="rounded-lg bg-cyan-600/20 px-3 py-1 text-xs font-medium text-cyan-700">
                Secure
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className={`mt-4 flex items-center gap-2 rounded-lg border px-4 py-2.5 ${
                isLocked 
                  ? 'border-orange-500/20 bg-orange-500/10 text-orange-500' 
                  : 'border-red-500/20 bg-red-500/10 text-red-500'
              }`}>
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-emerald-500">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {remainingAttempts !== null && remainingAttempts > 0 && (
              <p className="mt-2 text-xs text-amber-600">
                ⚠️ {remainingAttempts} attempts remaining
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-cyan-600">
                  Email or Username
                </label>
                <div className="relative mt-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600/60">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full rounded-lg border-none bg-[#C4F8FD] px-3 py-2.5 pl-9 text-sm text-cyan-900 shadow-xl
                     placeholder:text-cyan-600/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="Enter your email or username"
                    disabled={isLocked}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-cyan-600">
                  Password
                </label>
                <div className="relative mt-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600/60">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="w-full rounded-lg border-none bg-[#C4F8FD] 0 px-3 py-2.5 pl-9 pr-10 text-sm text-cyan-900
                     placeholder:text-cyan-600/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="Enter your password"
                    disabled={isLocked}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-600/60 hover:text-cyan-800"
                    disabled={isLocked}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isLocked}
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-xl transition ${
                  isLocked 
                    ? 'cursor-not-allowed bg-gray-400 text-white'
                    : 'bg-[#C4F8FD] text-slate-800 hover:bg-[#b0ecf5]'
                } disabled:opacity-50`}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isLocked ? (
                  'Account Locked'
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>
                  New here?{' '}
                  <Link
                    href="/sign-up"
                    className="font-medium text-cyan-700 hover:underline"
                  >
                    Create Account
                  </Link>
                </span>
                {isLocked && (
                  <span className="text-orange-600">
                    Contact support to unlock.
                  </span>
                )}
              </div>
            </form>
          </motion.div>

          {/* Right Side - Market Status & Security */}
          <motion.div variants={cardVariants} className="space-y-4">
            <div className="rounded-lg overflow-hidden">
              <MarketStatus />
            </div>
            
            <div className="rounded-lg bg-[#C4F8FD] p-6 shadow-xl">
              <h3 className="text-sm font-bold text-cyan-600">Security Features</h3>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-3 rounded-lg bg-[#C4F8FD] px-4 py-2.5 shadow-sm">
                  <div className="rounded-full bg-cyan-500/20 p-1.5">
                    <Lock className="h-3.5 w-3.5 text-cyan-700" />
                  </div>
                  <span className="text-xs text-cyan-900">
                    End-to-end 256-bit encryption
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-[#C4F8FD] px-4 py-2.5 shadow-sm">
                  <div className="rounded-full bg-cyan-500/20 p-1.5">
                    <User className="h-3.5 w-3.5 text-cyan-700" />
                  </div>
                  <span className="text-xs text-cyan-900">
                    Multi-factor authentication
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      <ChatWidgett />
    </div>
  );
}


























// // app/log-in/page.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { motion } from 'framer-motion';
// import Greet from '@/app/components/Greet';
// import { 
//   User, 
//   Lock, 
//   Eye, 
//   EyeOff, 
//   ArrowRight,
//   AlertCircle,
//   CheckCircle,
//   Loader2 
// } from 'lucide-react';
// import ChatWidgett from '@/app/components/ChatWidgett';
// import MarketStatus from '@/app/components/MarketStatus';

// // ---- Types ----------------------------------------------------------------

// interface FormData {
//   email: string;
//   password: string;
// }

// // ---- Animation Variants ----------------------------------------------------

// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: { staggerChildren: 0.08, delayChildren: 0.1 } as const,
//   },
// };

// const itemVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.4, ease: "easeOut" } as const,
//   },
// };

// const cardVariants = {
//   hidden: { opacity: 0, scale: 0.95 } as const,
//   visible: {
//     opacity: 1,
//     scale: 1,
//     transition: { duration: 0.5, ease: "easeOut" } as const,
//   },
// };

// // ============================================================================
// // MAIN COMPONENT
// // ============================================================================

// export default function LoginPage() {
//   const router = useRouter();
//   const [formData, setFormData] = useState<FormData>({
//     email: '',
//     password: '',
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
//   const [isLocked, setIsLocked] = useState(false);
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // ---- Form Handlers --------------------------------------------------------

//   const handleChange = (field: keyof FormData, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//     setError('');
//     setIsLocked(false);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!formData.email || !formData.password) {
//       setError('Please enter a username or email and password');
//       return;
//     }

//     setIsLoading(true);
//     setError('');
//     setSuccess('');
//     setIsLocked(false);

//     try {
//       const response = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           identifier: formData.email,
//           password: formData.password,
//         }),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         if (response.status === 429) {
//           setIsLocked(true);
//           setError(result.error || 'Account locked. contact support.');
//           setRemainingAttempts(0);
//           return;
//         }

//         if (result.remainingAttempts !== undefined) {
//           setError(`Invalid credentials (${result.remainingAttempts} attempts remaining)`);
//           setRemainingAttempts(result.remainingAttempts);
//         } else {
//           setError(result.error || 'Login failed');
//         }
//         return;
//       }

//       // ✅ FIX 1: Use 'auth_token' to match your Middleware
//       if (result.token && result.user) {
//         localStorage.setItem('auth_token', result.token);
//         localStorage.setItem('user', JSON.stringify(result.user));
//       }

//       setSuccess('Login successful!');
//       setRemainingAttempts(null);
//       setIsLocked(false);

//       // ✅ FIX 2: Handle Redirect after state is completely synced
//       setTimeout(() => {
//         // Double check the user object to prevent hydration mismatches
//         const isAdmin = result.user?.role === 'admin' || result.user?.isAdmin === true;
//         if (isAdmin) {
//           router.push('/me');
//         } else {
//           router.push('/Dashboard');
//         }
//       }, 1000);

//     } catch (err) {
//       setError('Login failed. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ---- Loading State --------------------------------------------------------

//   if (!mounted) {
//     return (
//       <>
//       <div className="min-h-screen bg-[#C4F8FD] p-4 sm:p-6 lg:p-8">
//         <div className="mx-auto max-w-6xl">
//           <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//           <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//           <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//           <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//           <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//           <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//         </div>
//         <div className="mx-auto max-w-6xl">
//           <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//           <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//           <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//           <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//         </div>
//         <div className="mx-auto max-w-6xl">
//           <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//           <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//           <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//           <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//           <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//           <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//         </div>
//         <div className="mx-auto shadow-xl max-w-6xl">
//           <div className="h-12 shadow-xl animate-pulse rounded-xl bg-[#C4F8FD]" />
//           <div className="h-12 shadow-xl animate-pulse rounded-xl bg-[#C4F8FD]" />
//           <div className="h-12 shadow-xl animate-pulse rounded-xl bg-[#C4F8FD]" />
//           <div className="h-12 shadow-xl animate-pulse rounded-xl bg-[#C4F8FD]" />
//         </div>
//       </div>
//       <div className="min-h-screen bg-[#C4F8FD] p-4 sm:p-6 lg:p-8">
//       <div className="mx-auto max-w-6xl">
//         <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//         <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//         <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//         <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//         <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//         <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//       </div>
//       <div className="mx-auto max-w-6xl">
//         <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//         <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//         <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//         <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//       </div>
//       <div className="mx-auto max-w-6xl">
//         <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//         <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//         <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//         <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//         <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//         <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//       </div>
//       <div className="mx-auto shadow-xl max-w-6xl">
//         <div className="h-12 shadow-xl animate-pulse rounded-xl bg-[#C4F8FD]" />
//         <div className="h-12 shadow-xl animate-pulse rounded-xl bg-[#C4F8FD]" />
//         <div className="h-12 shadow-xl animate-pulse rounded-xl bg-[#C4F8FD]" />
//         <div className="h-12 shadow-xl animate-pulse rounded-xl bg-[#C4F8FD]" />
//       </div>
//     </div>
//     </>
//     );
//   }

//   // ---- Render ----------------------------------------------------------------

//   return (
//     <div className="min-h-screen w-full bg-[#C4F8FD] px-4 py-6 sm:px-6 md:px-8">
//       <motion.div
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//         className="mx-auto max-w-6xl"
//       >
//         <motion.div variants={itemVariants} className="mb-8">
//           <h1 className="text-2xl font-bold text-slate-700"><Greet/></h1>
//           <p className="text-bold text-cyan-600/80"></p>
//         </motion.div>

//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
//           {/* Login Form */}
//           <motion.div
//             variants={cardVariants}
//             className="rounded-2xl bg-[#C4F8FD] p-6 shadow-xl sm:p-8"
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs text-cyan-600/80 font-bold sm:text-sm">
//                   Sign in
//                 </p>
//               </div>
//               <div className="rounded-lg bg-cyan-600/20 px-3 py-1 text-xs font-medium text-cyan-700">
                
//               </div>
//             </div>

//             {/* Error/Success Messages */}
//             {error && (
//               <div className={`mt-4 flex items-center gap-2 rounded-lg border px-4 py-2.5 ${
//                 isLocked 
//                   ? 'border-orange-500/20 bg-orange-500/10 text-orange-500' 
//                   : 'border-red-500/20 bg-red-500/10 text-red-500'
//               }`}>
//                 <AlertCircle className="h-4 w-4 flex-shrink-0" />
//                 <span className="text-sm">{error}</span>
//               </div>
//             )}

//             {success && (
//               <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-emerald-500">
//                 <CheckCircle className="h-4 w-4 flex-shrink-0" />
//                 <span className="text-sm">{success}</span>
//               </div>
//             )}

//             {remainingAttempts !== null && remainingAttempts > 0 && (
//               <p className="mt-2 text-xs text-amber-600">
//                 ⚠️ {remainingAttempts} attempts remaining
//               </p>
//             )}

//             <form onSubmit={handleSubmit} className="mt-6 space-y-4">
//               <div>
//                 <label className="block text-xs font-medium text-cyan-600">
//                   Email or Username
//                 </label>
//                 <div className="relative mt-1">
//                   <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600/60">
//                     <User className="h-4 w-4" />
//                   </div>
//                   <input
//                     type="text"
//                     value={formData.email}
//                     onChange={(e) => handleChange('email', e.target.value)}
//                     className="w-full rounded-lg border-none bg-[#C4F8FD] px-3 py-2.5 pl-9 text-sm text-cyan-900 shadow-xl
//                      placeholder:text-cyan-600/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
//                     placeholder="Enter your email or username"
//                     disabled={isLocked}
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-xs font-medium text-cyan-600">
//                   Password
//                 </label>
//                 <div className="relative mt-1">
//                   <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600/60">
//                     <Lock className="h-4 w-4" />
//                   </div>
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     value={formData.password}
//                     onChange={(e) => handleChange('password', e.target.value)}
//                     className="w-full rounded-lg border-none bg-[#C4F8FD] 0 px-3 py-2.5 pl-9 pr-10 text-sm text-cyan-900
//                      placeholder:text-cyan-600/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
//                     placeholder="Enter your password"
//                     disabled={isLocked}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-600/60 hover:text-cyan-800"
//                     disabled={isLocked}
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-4 w-4" />
//                     ) : (
//                       <Eye className="h-4 w-4" />
//                     )}
//                   </button>
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={isLoading || isLocked}
//                 className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-xl transition ${
//                   isLocked 
//                     ? 'cursor-not-allowed bg-gray-400 text-white'
//                     : 'bg-[#C4F8FD] text-cyan-600 hover:bg-[#b0ecf5]'
//                 } disabled:opacity-50`}
//               >
//                 {isLoading ? (
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                 ) : isLocked ? (
//                   'Account Locked'
//                 ) : (
//                   <>
//                     log in
//                     {/* <ArrowRight className="h-4 w-4" /> */}
//                   </>
//                 )}
//               </button>

//               <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
//                 <span>
//                   New here?{' '}
//                   <Link
//                     href="/sign-up"
//                     className="font-medium text-cyan-700 hover:underline"
//                   >
//                     Create Account
//                   </Link>
//                 </span>
//                 {isLocked && (
//                   <span className="text-orange-600">
//                     Contact support
//                   </span>
//                 )}
//               </div>
//             </form>
//           </motion.div>

//           {/* Right Side - Market Status & Security */}
//           <motion.div variants={cardVariants} className="space-y-4">
//             <div className="rounded-lg overflow-hidden">
//               <MarketStatus />
//             </div>
            
//             <div className="rounded-lg bg-[#C4F8FD] p-6 shadow-xl">
//               <h3 className="text-sm font-bold text-cyan-600">Security Features</h3>
//               <div className="mt-3 space-y-2">
//                 <div className="flex items-center gap-3 rounded-lg bg-[#C4F8FD] px-4 py-2.5 shadow-sm">
//                   <div className="rounded-full bg-cyan-500/20 p-1.5">
//                     <Lock className="h-3.5 w-3.5 text-cyan-700" />
//                   </div>
//                   <span className="text-xs text-cyan-900">
//                     End-to-end 256-bit encryption
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-3 rounded-lg bg-[#C4F8FD] px-4 py-2.5 shadow-sm">
//                   <div className="rounded-full bg-cyan-500/20 p-1.5">
//                     <User className="h-3.5 w-3.5 text-cyan-700" />
//                   </div>
//                   <span className="text-xs text-cyan-900">
//                     Multi-factor authentication
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </motion.div>
      
//       <ChatWidgett />
//     </div>
//   );
// }