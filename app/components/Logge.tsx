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
//       setError('Please fill in all fields');
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
//           setError(result.error || 'Account locked. Please contact support.');
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
//       <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
//         <div className="mx-auto max-w-6xl">
//           <div className="h-12 animate-pulse rounded-xl bg-[#C4F8FD]" />
//         </div>
//       </div>
//     );
//   }

//   // ---- Render ----------------------------------------------------------------

//   return (
//     <div className="min-h-screen w-full bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 px-4 py-6 sm:px-6 md:px-8">
//       <motion.div
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//         className="mx-auto max-w-6xl"
//       >
//         <motion.div variants={itemVariants} className="mb-8">
//           <h1 className="text-2xl font-bold text-slate-700"><Greet/></h1>
//           <p className="text-bold text-cyan-600/80">login to your account</p>
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
//                   Sign in to your account
//                 </p>
//               </div>
//               <div className="rounded-lg bg-cyan-600/20 px-3 py-1 text-xs font-medium text-cyan-700">
//                 Secure
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
//                     : 'bg-[#C4F8FD] text-slate-800 hover:bg-[#b0ecf5]'
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
//                     Contact support to unlock.
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
// import LoginPasswordReset from '@/app/components/LoginPasswordReset'; // ✅ NEW

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

//   // ✅ NEW: Password Reset State
//   const [showResetForm, setShowResetForm] = useState(false);
//   const [isCheckingReset, setIsCheckingReset] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // ---- Form Handlers --------------------------------------------------------

//   const handleChange = (field: keyof FormData, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//     setError('');
//     setIsLocked(false);
//     setShowResetForm(false); // ✅ Reset form hides when editing
//   };

//   // ✅ NEW: Check if admin enabled password reset
//   const handleEmailBlur = async () => {
//     if (!formData.email) return;

//     setIsCheckingReset(true);
//     try {
//       const response = await fetch('/api/check-password-reset', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: formData.email })
//       });
//       const data = await response.json();

//       if (data.success && data.data.passwordResetEnabled) {
//         setShowResetForm(true);
//       } else {
//         setShowResetForm(false);
//       }
//     } catch (error) {
//       console.error('Failed to check reset status:', error);
//     } finally {
//       setIsCheckingReset(false);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!formData.email || !formData.password) {
//       setError('Please fill in all fields');
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
//           setError(result.error || 'Account locked. Please contact support.');
//           setRemainingAttempts(0);
//           return;
//         }

//         if (result.remainingAttempts !== undefined) {
//           setError(`Invalid credentials try again)`);
//           setRemainingAttempts(result.remainingAttempts);
//         } else {
//           setError(result.error || 'log in failed');
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
//       <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
//         <div className="mx-auto max-w-6xl space-y-4">
//           <div className="h-20 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//           <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /></div>
//           <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /></div>
//         </div>
//       </div>
//     )
//   }

//   // ---- Render ----------------------------------------------------------------

//   return (
//     <div className="min-h-screen w-full bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 px-4 py-6 sm:px-6 md:px-8">
//       <motion.div
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//         className="mx-auto max-w-6xl"
//       >
//         <motion.div variants={itemVariants} className="mb-8">
//           <h1 className="text-2xl font-bold text-slate-700"><Greet/></h1>
//           <p className="text-bold text-cyan-600/80">login to your account</p>
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
//                   Sign in to your account
//                 </p>
//               </div>
//               <div className="rounded-lg bg-cyan-600/20 px-3 py-1 text-xs font-medium text-cyan-700">
//                 Secure
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

//             {/* ✅ NEW: If admin enabled reset, show reset form instead of login form */}
//             {showResetForm ? (
//               <div className="mt-6">
//                 <LoginPasswordReset userEmail={formData.email} />
//               </div>
//             ) : (
//               <form onSubmit={handleSubmit} className="mt-6 space-y-4">
//                 <div>
//                   <label className="block text-xs font-medium text-cyan-600">
//                     Email or Username
//                   </label>
//                   <div className="relative mt-1">
//                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600/60">
//                       <User className="h-4 w-4" />
//                     </div>
//                     <input
//                       type="text"
//                       value={formData.email}
//                       onChange={(e) => handleChange('email', e.target.value)}
//                       onBlur={handleEmailBlur} // ✅ NEW: Check when typing email
//                       className="w-full rounded-lg border-none bg-[#C4F8FD] px-3 py-2.5 pl-9 text-sm text-cyan-900 shadow-xl
//                        placeholder:text-cyan-600/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
//                       placeholder="Enter your email or username"
//                       disabled={isLocked}
//                     />
//                   </div>
//                   {isCheckingReset && (
//                     <p className="mt-1 text-xs text-slate-500">Checking password reset...</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-cyan-600">
//                     Password
//                   </label>
//                   <div className="relative mt-1">
//                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600/60">
//                       <Lock className="h-4 w-4" />
//                     </div>
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       value={formData.password}
//                       onChange={(e) => handleChange('password', e.target.value)}
//                       className="w-full rounded-lg border-none bg-[#C4F8FD] 0 px-3 py-2.5 pl-9 pr-10 text-sm text-cyan-900
//                        placeholder:text-cyan-600/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
//                       placeholder="Enter your password"
//                       disabled={isLocked}
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-600/60 hover:text-cyan-800"
//                       disabled={isLocked}
//                     >
//                       {showPassword ? (
//                         <EyeOff className="h-4 w-4" />
//                       ) : (
//                         <Eye className="h-4 w-4" />
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={isLoading || isLocked}
//                   className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-xl transition ${
//                     isLocked 
//                       ? 'cursor-not-allowed bg-gray-400 text-white'
//                       : 'bg-[#C4F8FD] text-slate-800 hover:bg-[#b0ecf5]'
//                   } disabled:opacity-50`}
//                 >
//                   {isLoading ? (
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                   ) : isLocked ? (
//                     'Account Locked'
//                   ) : (
//                     <>
//                       sign in
//                       <ArrowRight className="h-4 w-4" />
//                     </>
//                   )}
//                 </button>

//                 <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
//                   <span>
//                     New here?{' '}
//                     <Link
//                       href="/sign-up"
//                       className="font-medium text-cyan-700 hover:underline"
//                     >
//                       Create Account
//                     </Link>
//                   </span>
//                   {isLocked && (
//                     <span className="text-orange-600">
//                       Contact support to unlock.
//                     </span>
//                   )}
//                 </div>
//               </form>
//             )}
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
  Loader2,
  KeyRound  // ✅ ADDED: For Forgot Password icon
} from 'lucide-react';
import ChatWidgett from '@/app/components/ChatWidgett';
import MarketStatus from '@/app/components/MarketStatus';
import LoginPasswordReset from '@/app/components/LoginPasswordReset';

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

  // Password Reset State
  const [showResetForm, setShowResetForm] = useState(false);
  const [isCheckingReset, setIsCheckingReset] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ---- Form Handlers --------------------------------------------------------

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
    setIsLocked(false);
    setShowResetForm(false);
  };

  // Check if admin enabled password reset
  const handleEmailBlur = async () => {
    if (!formData.email) return;

    setIsCheckingReset(true);
    try {
      const response = await fetch('/api/check-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await response.json();

      if (data.success && data.data.passwordResetEnabled) {
        setShowResetForm(true);
      } else {
        setShowResetForm(false);
      }
    } catch (error) {
      console.error('Failed to check reset status:', error);
    } finally {
      setIsCheckingReset(false);
    }
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
          setError(`Invalid credentials try again)`);
          setRemainingAttempts(result.remainingAttempts);
        } else {
          setError(result.error || 'log in failed');
        }
        return;
      }

      // Use 'auth_token' to match your Middleware
      if (result.token && result.user) {
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
      }

      setSuccess('Login successful!');
      setRemainingAttempts(null);
      setIsLocked(false);

      // Handle Redirect after state is completely synced
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
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="h-20 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /></div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /></div>
        </div>
      </div>
    )
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

            {/* If admin enabled reset, show reset form instead of login form */}
            {showResetForm ? (
              <div className="mt-6">
                <LoginPasswordReset userEmail={formData.email} />
              </div>
            ) : (
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
                      onBlur={handleEmailBlur}
                      className="w-full rounded-lg border-none bg-[#C4F8FD] px-3 py-2.5 pl-9 text-sm text-cyan-900 shadow-xl
                       placeholder:text-cyan-600/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      placeholder="Enter your email or username"
                      disabled={isLocked}
                    />
                  </div>
                  {isCheckingReset && (
                    <p className="mt-1 text-xs text-slate-500">Checking password reset...</p>
                  )}
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
                      sign in
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                {/* ✅ UPDATED: Added Forgot Password link */}
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
                  
                  {/* ✅ ADDED: Forgot Password Link */}
                  <Link
                    href="/forgot-password"
                    className="font-medium text-cyan-700 hover:underline flex items-center gap-1"
                  >
                    <KeyRound className="h-3 w-3" />
                    Forgot Password?
                  </Link>
                </div>

                {isLocked && (
                  <div className="text-center text-xs text-orange-600">
                    Contact support to unlock your account.
                  </div>
                )}
              </form>
            )}
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