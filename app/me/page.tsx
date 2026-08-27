"use client";

import React, { useState, useEffect } from 'react';
import AdminDashboard from '@/app/components/AdminDashboard'
import DesktopNav from '@/app/components/DesktopNav'
import IconPack from '@/app/components/Iconpack'
import ChatWidgett from '@/app/components/ChatWidgett'
import AutoBalanceAdmin from '@/app/components/AutoBalanceAdmin'
import Tracker from '@/app/components/Tracker'
import { useSessionTracker } from '@/hooks/useSessionTracker'
import Activator from '@/app/components/Activator'
// import AdminUserManager from '@/app/components/AdminUserManager';

// ✅ ADDED: AdminDashboardSkeleton
function AdminDashboardSkeleton() {
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

export default function Page() {
  useSessionTracker(); // 🚀 Track the Admin's time here

  // ✅ Adding a simple loading state (since we have the Skeleton)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // ✅ Show Skeleton while loading
  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div> 
      <AdminDashboard/>
      {/* <AdminUserManager/> */}
      <ChatWidgett
        supportName="Admin"
        message="  ?"
        defaultOpen={false}
        supportHours="clients may be waiting"
        responseTime="i will respond any time i like "/>
      <div className="">
        <AutoBalanceAdmin/>
        <Activator/>
        <Tracker />
        
      </div>
    </div>
  )
}
// // // app/me/page.tsx

// // "use client";

// // import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
// // import { motion, AnimatePresence } from "framer-motion";
// // import {
// //   Save,
// //   Plus,
// //   Trash2,
// //   CheckCircle,
// //   AlertCircle,
// //   Loader2,
// //   Wallet,
// //   Calendar,
// //   Users,
// //   Bell,
// //   Lock,
// //   Wifi,
// //   WifiOff,
// // } from "lucide-react";
// // import { auth, db } from 'firebase/auth';
// // import {
// //   doc,
// //   getDoc,
// //   setDoc,
// //   serverTimestamp,
// //   collection,
// //   getDocs,
// //   onSnapshot,
// //   query,
// //   orderBy,
// //   Timestamp,
// //   enableNetwork,
// //   where,
// // } from "firebase/firestore";


// // // ============================================================================
// // // TYPES
// // // ============================================================================

// // interface QuickContact {
// //   id: string;
// //   name: string;
// //   avatar: string;
// //   initials: string;
// // }

// // interface Transaction {
// //   id: string;
// //   merchant: string;
// //   type: string;
// //   category: string;
// //   date: string;
// //   status: "completed" | "pending" | "failed";
// //   amount: string;
// //   isNegative: boolean;
// //   icon: string;
// // }

// // interface UpcomingBill {
// //   id: string;
// //   name: string;
// //   dueIn: string;
// //   amount: string;
// //   category: string;
// // }

// // interface SpendingCategory {
// //   id?: string;
// //   name: string;
// //   percentage: number;
// //   color: string;
// // }

// // interface DashboardContent {
// //   title: string;
// //   subtitle: string;
// //   portfolioValue: string;
// //   portfolioChange: string;
// //   quickTransferTitle: string;
// //   cardsTitle: string;
// //   spendingTitle: string;
// //   billsTitle: string;
// //   transactionsTitle: string;
// //   quickContacts: QuickContact[];
// //   transactions: Transaction[];
// //   upcomingBills: UpcomingBill[];
// //   spendingCategories: SpendingCategory[];
// // }

// // interface BillsCard {
// //   id: string;
// //   variant: "purple" | "green" | "gold" | "lime";
// //   title: string;
// //   description: string;
// //   features: string[];
// //   ctaText: string;
// //   ctaLink: string;
// // }

// // interface BillsContent {
// //   title: string;
// //   subtitle: string;
// //   cards: BillsCard[];
// //   footerText: string;
// // }

// // interface UserData {
// //   uid: string;
// //   email: string;
// //   firstName: string;
// //   lastName: string;
// //   phone: string;
// //   photoURL: string | null;
// //   transactionPin: string;
// //   createdAt: Timestamp | null;
// //   isActive: boolean;
// //   dashboardContent?: DashboardContent;
// //   billsContent?: BillsContent;
// // }

// // interface Notification {
// //   id: string;
// //   message: string;
// //   userId: string;
// //   timestamp: Timestamp | null;
// //   read: boolean;
// // }

// // // ============================================================================
// // // DEFAULT CONTENT
// // // ============================================================================

// // const getDefaultDashboardContent = (userName: string = "User"): DashboardContent => ({
// //   title: "Dashboard",
// //   subtitle: `Welcome back, ${userName}! Here's your financial overview.`,
// //   portfolioValue: "$0.00",
// //   portfolioChange: "0.0%",
// //   quickTransferTitle: "Quick Transfer",
// //   cardsTitle: "Your Cards",
// //   spendingTitle: "Spending Analysis",
// //   billsTitle: "Upcoming Bills",
// //   transactionsTitle: "Recent Transactions",
// //   quickContacts: [
// //     { id: "1", name: "James", avatar: "", initials: "JD" },
// //     { id: "2", name: "Libs", avatar: "", initials: "LM" },
// //     { id: "3", name: "Sarah", avatar: "", initials: "SK" },
// //     { id: "4", name: "Mike", avatar: "", initials: "MR" },
// //   ],
// //   transactions: [
// //     {
// //       id: "1",
// //       merchant: "Apple Store",
// //       type: "Subscription Services",
// //       category: "Tech",
// //       date: new Date().toLocaleDateString(),
// //       status: "completed",
// //       amount: "$19.99",
// //       isNegative: true,
// //       icon: "Smartphone",
// //     },
// //     {
// //       id: "2",
// //       merchant: "Emirates Airlines",
// //       type: "Travel Booking",
// //       category: "Travel",
// //       date: new Date().toLocaleDateString(),
// //       status: "pending",
// //       amount: "$2,450.00",
// //       isNegative: true,
// //       icon: "Car",
// //     },
// //     {
// //       id: "3",
// //       merchant: "Dividend Income",
// //       type: "Investment Yield",
// //       category: "Income",
// //       date: new Date().toLocaleDateString(),
// //       status: "completed",
// //       amount: "$450.00",
// //       isNegative: false,
// //       icon: "TrendingUp",
// //     },
// //   ],
// //   upcomingBills: [
// //     { id: "1", name: "Utility Bill", dueIn: "2 days", amount: "$142.00", category: "Utilities" },
// //     { id: "2", name: "AWS Cloud", dueIn: "5 days", amount: "$840.50", category: "Cloud Services" },
// //   ],
// //   spendingCategories: [
// //     { id: "1", name: "Entertainment", percentage: 45, color: "from-purple-400 to-pink-500" },
// //     { id: "2", name: "Investments", percentage: 35, color: "from-cyan-400 to-blue-500" },
// //     { id: "3", name: "Others", percentage: 20, color: "from-emerald-400 to-teal-500" },
// //   ],
// // });

// // const defaultBillsContent: BillsContent = {
// //   title: "Upcoming Bills",
// //   subtitle: "View and manage your upcoming bills",
// //   cards: [
// //     {
// //       id: "1",
// //       variant: "purple",
// //       title: "iCloud Support",
// //       description: "The best place to store all your photos, files, notes, emails, and more.",
// //       features: [
// //         "Easily access your iPhone apps and data on the web",
// //         "More storage, privacy features, and ways to connect with friends",
// //       ],
// //       ctaText: "Learn More",
// //       ctaLink: "https://www.apple.com/icloud",
// //     },
// //     {
// //       id: "2",
// //       variant: "green",
// //       title: "iCloud+ Features",
// //       description: "Upgrade to iCloud+ for more features",
// //       features: ["More storage", "Apple Event Invitations", "iCloud Private Relay", "Hide My Email"],
// //       ctaText: "Upgrade Now",
// //       ctaLink: "https://www.apple.com/icloud",
// //     },
// //     {
// //       id: "3",
// //       variant: "gold",
// //       title: "Privacy & Security",
// //       description: "Peace of mind with privacy features that keep you safe",
// //       features: ["Apple Event Invitations", "iCloud Private Relay", "Hide My Email", "HomeKit Secure Video"],
// //       ctaText: "Learn More",
// //       ctaLink: "https://www.apple.com/icloud",
// //     },
// //     {
// //       id: "4",
// //       variant: "lime",
// //       title: "Share with Family",
// //       description: "Share your iCloud+ subscription with your family",
// //       features: [
// //         "Share with up to 5 family members",
// //         "Everyone gets their own private space",
// //         "Shared storage and features",
// //       ],
// //       ctaText: "Manage Family Sharing",
// //       ctaLink: "https://www.me.com/support",
// //     },
// //   ],
// //   footerText: "Admin Portal: https://www.me.com/support",
// // };

// // // ============================================================================
// // // ANIMATION VARIANTS
// // // ============================================================================

// // const containerVariants = {
// //   hidden: { opacity: 0 },
// //   visible: {
// //     opacity: 1,
// //     transition: { staggerChildren: 0.05, delayChildren: 0.05 },
// //   },
// // };

// // const cardVariants = {
// //   hidden: { opacity: 0, y: 20 },
// //   visible: (delay: number = 0) => ({
// //     opacity: 1,
// //     y: 0,
// //     transition: { delay: delay * 0.06, duration: 0.4, ease: "easeOut" as const },
// //   }),
// // };

// // // ============================================================================
// // // MAIN COMPONENT
// // // ============================================================================

// // export default function ContentManager() {
// //   const [activeTab, setActiveTab] = useState<"dashboard" | "bills" | "users">("dashboard");
// //   const [dashboardContent, setDashboardContent] = useState<DashboardContent>(() => getDefaultDashboardContent());
// //   const [billsContent, setBillsContent] = useState<BillsContent>(defaultBillsContent);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [isSaving, setIsSaving] = useState(false);
// //   const [successMessage, setSuccessMessage] = useState("");
// //   const [errorMessage, setErrorMessage] = useState("");
// //   const [isOnline, setIsOnline] = useState(true);
// //   const [currentUser, setCurrentUser] = useState<any>(null);
// //   const [userName, setUserName] = useState("User");

// //   // User Management States
// //   const [users, setUsers] = useState<UserData[]>([]);
// //   const [notifications, setNotifications] = useState<Notification[]>([]);
// //   const [showNotifications, setShowNotifications] = useState(false);
// //   const [userStats, setUserStats] = useState({
// //     total: 0,
// //     active: 0,
// //     inactive: 0,
// //     withPin: 0,
// //   });
// //   const [newUserAlert, setNewUserAlert] = useState(false);
// //   const unsubscribeRef = useRef<(() => void) | null>(null);
// //   const isMounted = useRef(true);
// //   const isInitialLoad = useRef(true);
// //   const processingRef = useRef(false);
// //   const currentUserRef = useRef<any>(null);

// //   // ============================================================================
// //   // NETWORK AND FIREBASE CHECKS
// //   // ============================================================================

// //   const checkNetwork = useCallback(() => {
// //     const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
// //     setIsOnline(online);
// //     return online;
// //   }, []);

// //   const isFirebaseReady = useCallback(() => {
// //     try {
// //       return !!(db && auth);
// //     } catch {
// //       return false;
// //     }
// //   }, []);

// //   // ============================================================================
// //   // LOAD USER-SPECIFIC CONTENT
// //   // ============================================================================

// //   const loadUserContent = useCallback(async (userId: string, retryCount = 0) => {
// //     if (!isMounted.current) return;

// //     if (!checkNetwork()) {
// //       setIsLoading(false);
// //       setErrorMessage("No internet connection. Using cached data.");
// //       return;
// //     }

// //     if (!isFirebaseReady()) {
// //       setIsLoading(false);
// //       setErrorMessage("Firebase not initialized. Please check your configuration.");
// //       return;
// //     }

// //     setIsLoading(true);
// //     try {
// //       // Get user's dashboard content
// //       const userDocRef = doc(db, "users", userId);
// //       const userDoc = await getDoc(userDocRef);

// //       if (userDoc.exists()) {
// //         const userData = userDoc.data();

// //         // Load dashboard content
// //         if (userData.dashboardContent) {
// //           setDashboardContent(userData.dashboardContent);
// //         } else {
// //           // Initialize with default and save
// //           const defaultContent = getDefaultDashboardContent(userName);
// //           await setDoc(userDocRef, { 
// //             dashboardContent: defaultContent,
// //             billsContent: defaultBillsContent,
// //           }, { merge: true });
// //           setDashboardContent(defaultContent);
// //         }

// //         // Load bills content
// //         if (userData.billsContent) {
// //           setBillsContent(userData.billsContent);
// //         } else {
// //           await setDoc(userDocRef, { 
// //             billsContent: defaultBillsContent,
// //           }, { merge: true });
// //           setBillsContent(defaultBillsContent);
// //         }
// //       } else {
// //         // Create new user document with default content
// //         const defaultContent = getDefaultDashboardContent(userName);
// //         await setDoc(userDocRef, {
// //           dashboardContent: defaultContent,
// //           billsContent: defaultBillsContent,
// //           createdAt: serverTimestamp(),
// //           isActive: true,
// //         }, { merge: true });
// //         setDashboardContent(defaultContent);
// //         setBillsContent(defaultBillsContent);
// //       }
// //     } catch (error) {
// //       console.error("Error loading user content:", error);
// //       if (retryCount < 3) {
// //         setTimeout(() => {
// //           if (isMounted.current) {
// //             loadUserContent(userId, retryCount + 1);
// //           }
// //         }, 2000 * (retryCount + 1));
// //         return;
// //       }
// //       if (isMounted.current) {
// //         setErrorMessage("Failed to load content. Using default values.");
// //         setDashboardContent(getDefaultDashboardContent(userName));
// //         setBillsContent(defaultBillsContent);
// //       }
// //     } finally {
// //       if (isMounted.current) {
// //         setIsLoading(false);
// //       }
// //     }
// //   }, [isFirebaseReady, checkNetwork, userName]);

// //   // ============================================================================
// //   // SAVE USER-SPECIFIC CONTENT
// //   // ============================================================================

// //   const saveUserContent = useCallback(async (retryCount = 0) => {
// //     if (!isFirebaseReady() || !isMounted.current) {
// //       setErrorMessage("Firebase not initialized. Cannot save changes.");
// //       return;
// //     }

// //     const userId = currentUserRef.current?.uid;
// //     if (!userId) {
// //       setErrorMessage("No user logged in.");
// //       return;
// //     }

// //     setIsSaving(true);
// //     setErrorMessage("");
// //     setSuccessMessage("");

// //     try {
// //       const content = activeTab === "dashboard" ? dashboardContent : billsContent;
// //       const fieldName = activeTab === "dashboard" ? "dashboardContent" : "billsContent";
// //       const userDocRef = doc(db, "users", userId);

// //       await setDoc(userDocRef, {
// //         [fieldName]: content,
// //         updatedAt: serverTimestamp(),
// //       }, { merge: true });

// //       if (isMounted.current) {
// //         setSuccessMessage(`${activeTab === "dashboard" ? "Dashboard" : "Bills"} content saved successfully!`);
// //         setTimeout(() => {
// //           if (isMounted.current) setSuccessMessage("");
// //         }, 3000);
// //       }
// //     } catch (error) {
// //       console.error("Error saving content:", error);
// //       if (retryCount < 3) {
// //         setTimeout(() => {
// //           if (isMounted.current) {
// //             saveUserContent(retryCount + 1);
// //           }
// //         }, 2000 * (retryCount + 1));
// //         setIsSaving(false);
// //         return;
// //       }
// //       if (isMounted.current) {
// //         setErrorMessage("Failed to save content");
// //         setTimeout(() => {
// //           if (isMounted.current) setErrorMessage("");
// //         }, 3000);
// //       }
// //     } finally {
// //       if (isMounted.current) {
// //         setIsSaving(false);
// //       }
// //     }
// //   }, [isFirebaseReady, activeTab, dashboardContent, billsContent]);

// //   // ============================================================================
// //   // PORTFOLIO UPDATE HANDLER
// //   // ============================================================================

// //   const handlePortfolioUpdate = useCallback((newValue: string, newChange: string) => {
// //     setDashboardContent(prev => ({
// //       ...prev,
// //       portfolioValue: newValue,
// //       portfolioChange: newChange,
// //     }));
// //   }, []);

// //   // ============================================================================
// //   // USER MANAGEMENT FUNCTIONS
// //   // ============================================================================

// //   const updateUserStats = useCallback((userList: UserData[]) => {
// //     const total = userList.length;
// //     const active = userList.filter((u) => u.isActive !== false).length;
// //     const inactive = total - active;
// //     const withPin = userList.filter((u) => u.transactionPin && u.transactionPin.length > 0).length;

// //     setUserStats({ total, active, inactive, withPin });
// //   }, []);

// //   const setupUserListener = useCallback(() => {
// //     if (!isFirebaseReady() || !isMounted.current) return;

// //     try {
// //       const usersRef = collection(db, "users");
// //       const q = query(usersRef, orderBy("createdAt", "desc"));

// //       if (unsubscribeRef.current) {
// //         unsubscribeRef.current();
// //         unsubscribeRef.current = null;
// //       }

// //       const unsubscribe = onSnapshot(q, 
// //         (snapshot) => {
// //           if (!isMounted.current || processingRef.current) return;
// //           processingRef.current = true;

// //           try {
// //             const userList: UserData[] = [];
// //             const newNotifications: Notification[] = [];

// //             snapshot.docChanges().forEach((change) => {
// //               const data = change.doc.data() as Omit<UserData, 'uid'>;
// //               const user: UserData = { 
// //                 ...data, 
// //                 uid: change.doc.id,
// //                 createdAt: data.createdAt || null,
// //                 transactionPin: data.transactionPin || '',
// //                 photoURL: data.photoURL || null,
// //                 phone: data.phone || '',
// //                 isActive: data.isActive !== undefined ? data.isActive : true,
// //                 dashboardContent: data.dashboardContent,
// //                 billsContent: data.billsContent,
// //               };

// //               if (change.type === "added" && !isInitialLoad.current) {
// //                 const notification: Notification = {
// //                   id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
// //                   message: `New user registered: ${user.firstName} ${user.lastName}`,
// //                   userId: user.uid,
// //                   timestamp: serverTimestamp() as Timestamp,
// //                   read: false,
// //                 };
// //                 newNotifications.push(notification);
// //                 setNewUserAlert(true);
// //                 setTimeout(() => {
// //                   if (isMounted.current) setNewUserAlert(false);
// //                 }, 5000);
// //               }

// //               userList.push(user);
// //             });

// //             if (isMounted.current) {
// //               if (userList.length > 0) {
// //                 setUsers(userList);
// //                 updateUserStats(userList);
// //               }
// //               if (newNotifications.length > 0) {
// //                 setNotifications((prev) => [...newNotifications, ...prev]);
// //               }
// //             }

// //             if (isInitialLoad.current) {
// //               isInitialLoad.current = false;
// //             }
// //           } catch (err) {
// //             console.error("Error processing user snapshot:", err);
// //           } finally {
// //             processingRef.current = false;
// //           }
// //         },
// //         (error: any) => {
// //           console.error("Error in user listener:", error);
// //           processingRef.current = false;
// //           if (error.message?.includes('offline') || error.message?.includes('unavailable')) {
// //             setTimeout(() => {
// //               if (isMounted.current && isFirebaseReady()) {
// //                 setupUserListener();
// //               }
// //             }, 3000);
// //           }
// //           if (isMounted.current) {
// //             setErrorMessage("Failed to load users in real-time.");
// //           }
// //         }
// //       );

// //       unsubscribeRef.current = unsubscribe;
// //     } catch (error) {
// //       console.error("Error setting up user listener:", error);
// //       processingRef.current = false;
// //       if (isMounted.current) {
// //         setErrorMessage("Failed to setup user listener.");
// //       }
// //     }
// //   }, [isFirebaseReady, updateUserStats]);

// //   const loadUsers = useCallback(async (retryCount = 0) => {
// //     if (!isFirebaseReady() || !isMounted.current) return;

// //     try {
// //       const usersRef = collection( db, "users");
// //       const snapshot = await getDocs(usersRef);
// //       const userList: UserData[] = [];
// //       snapshot.forEach((doc) => {
// //         const data = doc.data() as Omit<UserData, 'uid'>;
// //         userList.push({ 
// //           ...data, 
// //           uid: doc.id,
// //           createdAt: data.createdAt || null,
// //           transactionPin: data.transactionPin || '',
// //           photoURL: data.photoURL || null,
// //           phone: data.phone || '',
// //           isActive: data.isActive !== undefined ? data.isActive : true,
// //           dashboardContent: data.dashboardContent,
// //           billsContent: data.billsContent,
// //         });
// //       });
// //       if (isMounted.current) {
// //         setUsers(userList);
// //         updateUserStats(userList);
// //         isInitialLoad.current = false;
// //       }
// //     } catch (error) {
// //       console.error("Error loading users:", error);
// //       if (retryCount < 3) {
// //         setTimeout(() => {
// //           if (isMounted.current) {
// //             loadUsers(retryCount + 1);
// //           }
// //         }, 2000 * (retryCount + 1));
// //       }
// //     }
// //   }, [isFirebaseReady, updateUserStats]);

// //   // ============================================================================
// //   // NETWORK EFFECTS
// //   // ============================================================================

// //   useEffect(() => {
// //     const handleOnline = () => {
// //       setIsOnline(true);
// //       setErrorMessage("");
// //       if (isMounted.current && currentUserRef.current) {
// //         enableNetwork(db).catch(() => {});
// //         loadUserContent(currentUserRef.current.uid);
// //         loadUsers();
// //         setTimeout(() => {
// //           if (isMounted.current) {
// //             setupUserListener();
// //           }
// //         }, 500);
// //       }
// //     };

// //     const handleOffline = () => {
// //       setIsOnline(false);
// //       setErrorMessage("You are offline. Some data may be unavailable.");
// //     };

// //     window.addEventListener('online', handleOnline);
// //     window.addEventListener('offline', handleOffline);

// //     return () => {
// //       window.removeEventListener('online', handleOnline);
// //       window.removeEventListener('offline', handleOffline);
// //     };
// //   }, [loadUserContent, loadUsers, setupUserListener]);

// //   // ============================================================================
// //   // INITIALIZATION
// //   // ============================================================================

// //   useEffect(() => {
// //     isMounted.current = true;

// //     const init = async () => {
// //       if (!isMounted.current) return;

// //       checkNetwork();

// //       if (isFirebaseReady()) {
// //         // Get current user
// //         const user = auth.currentUser;
// //         if (user) {
// //           setCurrentUser(user);
// //           currentUserRef.current = user;
// //           const name = user.displayName || 
// //                        (user.email ? user.email.split('@')[0] : 'User');
// //           setUserName(name);
// //           await loadUserContent(user.uid);
// //         } else {
// //           // Wait for auth state change
// //           const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
// //             if (authUser && isMounted.current) {
// //               setCurrentUser(authUser);
// //               currentUserRef.current = authUser;
// //               const name = authUser.displayName || 
// //                            (authUser.email ? authUser.email.split('@')[0] : 'User');
// //               setUserName(name);
// //               await loadUserContent(authUser.uid);
// //             }
// //             unsubscribe();
// //           });
// //         }

// //         await loadUsers();
// //         setTimeout(() => {
// //           if (isMounted.current) {
// //             setupUserListener();
// //           }
// //         }, 1000);
// //       } else {
// //         if (isMounted.current) {
// //           setIsLoading(false);
// //           setErrorMessage("Firebase not initialized. Please check your configuration.");
// //         }
// //       }
// //     };

// //     init();

// //     return () => {
// //       isMounted.current = false;
// //       if (unsubscribeRef.current) {
// //         unsubscribeRef.current();
// //         unsubscribeRef.current = null;
// //       }
// //     };
// //   }, [isFirebaseReady, loadUserContent, loadUsers, setupUserListener, checkNetwork]);

// //   // ============================================================================
// //   // DASHBOARD EDITING FUNCTIONS
// //   // ============================================================================

// //   const updateDashboardField = (field: keyof DashboardContent, value: unknown) => {
// //     setDashboardContent((prev) => ({ ...prev, [field]: value }));
// //   };

// //   const addQuickContact = () => {
// //     const newContact: QuickContact = {
// //       id: Date.now().toString(),
// //       name: "New Contact",
// //       avatar: "",
// //       initials: "NC",
// //     };
// //     setDashboardContent((prev) => ({
// //       ...prev,
// //       quickContacts: [...prev.quickContacts, newContact],
// //     }));
// //   };

// //   const removeQuickContact = (index: number) => {
// //     setDashboardContent((prev) => ({
// //       ...prev,
// //       quickContacts: prev.quickContacts.filter((_, i) => i !== index),
// //     }));
// //   };

// //   const updateQuickContact = (index: number, field: keyof QuickContact, value: string) => {
// //     setDashboardContent((prev) => ({
// //       ...prev,
// //       quickContacts: prev.quickContacts.map((contact, i) =>
// //         i === index ? { ...contact, [field]: value } : contact
// //       ),
// //     }));
// //   };

// //   const addTransaction = () => {
// //     const newTransaction: Transaction = {
// //       id: Date.now().toString(),
// //       merchant: "New Merchant",
// //       type: "New Type",
// //       category: "New Category",
// //       date: new Date().toLocaleDateString(),
// //       status: "completed",
// //       amount: "$0.00",
// //       isNegative: true,
// //       icon: "ShoppingBag",
// //     };
// //     setDashboardContent((prev) => ({
// //       ...prev,
// //       transactions: [...prev.transactions, newTransaction],
// //     }));
// //   };

// //   const removeTransaction = (index: number) => {
// //     setDashboardContent((prev) => ({
// //       ...prev,
// //       transactions: prev.transactions.filter((_, i) => i !== index),
// //     }));
// //   };

// //   const updateTransaction = (index: number, field: keyof Transaction, value: unknown) => {
// //     setDashboardContent((prev) => ({
// //       ...prev,
// //       transactions: prev.transactions.map((tx, i) =>
// //         i === index ? { ...tx, [field]: value } : tx
// //       ),
// //     }));
// //   };

// //   const addUpcomingBill = () => {
// //     const newBill: UpcomingBill = {
// //       id: Date.now().toString(),
// //       name: "New Bill",
// //       dueIn: "30 days",
// //       amount: "$0.00",
// //       category: "New Category",
// //     };
// //     setDashboardContent((prev) => ({
// //       ...prev,
// //       upcomingBills: [...prev.upcomingBills, newBill],
// //     }));
// //   };

// //   const removeUpcomingBill = (index: number) => {
// //     setDashboardContent((prev) => ({
// //       ...prev,
// //       upcomingBills: prev.upcomingBills.filter((_, i) => i !== index),
// //     }));
// //   };

// //   const updateUpcomingBill = (index: number, field: keyof UpcomingBill, value: string) => {
// //     setDashboardContent((prev) => ({
// //       ...prev,
// //       upcomingBills: prev.upcomingBills.map((bill, i) =>
// //         i === index ? { ...bill, [field]: value } : bill
// //       ),
// //     }));
// //   };

// //   const addSpendingCategory = () => {
// //     const newCategory: SpendingCategory = {
// //       id: Date.now().toString(),
// //       name: "New Category",
// //       percentage: 10,
// //       color: "from-cyan-400 to-blue-500",
// //     };
// //     setDashboardContent((prev) => ({
// //       ...prev,
// //       spendingCategories: [...prev.spendingCategories, newCategory],
// //     }));
// //   };

// //   const removeSpendingCategory = (index: number) => {
// //     setDashboardContent((prev) => ({
// //       ...prev,
// //       spendingCategories: prev.spendingCategories.filter((_, i) => i !== index),
// //     }));
// //   };

// //   const updateSpendingCategory = (index: number, field: keyof SpendingCategory, value: unknown) => {
// //     setDashboardContent((prev) => ({
// //       ...prev,
// //       spendingCategories: prev.spendingCategories.map((cat, i) =>
// //         i === index ? { ...cat, [field]: value } : cat
// //       ),
// //     }));
// //   };

// //   // ============================================================================
// //   // BILLS EDITING FUNCTIONS
// //   // ============================================================================

// //   const updateBillsField = (field: keyof BillsContent, value: unknown) => {
// //     setBillsContent((prev) => ({ ...prev, [field]: value }));
// //   };

// //   const updateBillsCard = (index: number, field: keyof BillsCard, value: unknown) => {
// //     setBillsContent((prev) => ({
// //       ...prev,
// //       cards: prev.cards.map((card, i) =>
// //         i === index ? { ...card, [field]: value } : card
// //       ),
// //     }));
// //   };

// //   const addBillsCard = () => {
// //     const newCard: BillsCard = {
// //       id: Date.now().toString(),
// //       variant: "purple",
// //       title: "New Card",
// //       description: "Card description",
// //       features: ["Feature 1", "Feature 2"],
// //       ctaText: "Learn More",
// //       ctaLink: "https://example.com",
// //     };
// //     setBillsContent((prev) => ({
// //       ...prev,
// //       cards: [...prev.cards, newCard],
// //     }));
// //   };

// //   const removeBillsCard = (index: number) => {
// //     setBillsContent((prev) => ({
// //       ...prev,
// //       cards: prev.cards.filter((_, i) => i !== index),
// //     }));
// //   };

// //   const updateBillsCardFeature = (cardIndex: number, featureIndex: number, value: string) => {
// //     setBillsContent((prev) => ({
// //       ...prev,
// //       cards: prev.cards.map((card, i) =>
// //         i === cardIndex
// //           ? {
// //               ...card,
// //               features: card.features.map((f, j) => (j === featureIndex ? value : f)),
// //             }
// //           : card
// //       ),
// //     }));
// //   };

// //   const addBillsCardFeature = (cardIndex: number) => {
// //     setBillsContent((prev) => ({
// //       ...prev,
// //       cards: prev.cards.map((card, i) =>
// //         i === cardIndex ? { ...card, features: [...card.features, "New Feature"] } : card
// //       ),
// //     }));
// //   };

// //   const removeBillsCardFeature = (cardIndex: number, featureIndex: number) => {
// //     setBillsContent((prev) => ({
// //       ...prev,
// //       cards: prev.cards.map((card, i) =>
// //         i === cardIndex
// //           ? {
// //               ...card,
// //               features: card.features.filter((_, j) => j !== featureIndex),
// //             }
// //           : card
// //       ),
// //     }));
// //   };

// //   // ============================================================================
// //   // RENDER
// //   // ============================================================================

// //   const renderContent = useMemo(() => {
// //     if (activeTab === "dashboard") {
// //       return (
// //         <DashboardContentEditor
// //           content={dashboardContent}
// //           updateField={updateDashboardField}
// //           addQuickContact={addQuickContact}
// //           removeQuickContact={removeQuickContact}
// //           updateQuickContact={updateQuickContact}
// //           addTransaction={addTransaction}
// //           removeTransaction={removeTransaction}
// //           updateTransaction={updateTransaction}
// //           addUpcomingBill={addUpcomingBill}
// //           removeUpcomingBill={removeUpcomingBill}
// //           updateUpcomingBill={updateUpcomingBill}
// //           addSpendingCategory={addSpendingCategory}
// //           removeSpendingCategory={removeSpendingCategory}
// //           updateSpendingCategory={updateSpendingCategory}
// //         />
// //       );
// //     }
// //     if (activeTab === "bills") {
// //       return (
// //         <BillsContentEditor
// //           content={billsContent}
// //           updateField={updateBillsField}
// //           updateCard={updateBillsCard}
// //           addCard={addBillsCard}
// //           removeCard={removeBillsCard}
// //           updateFeature={updateBillsCardFeature}
// //           addFeature={addBillsCardFeature}
// //           removeFeature={removeBillsCardFeature}
// //         />
// //       );
// //     }
// //     if (activeTab === "users") {
// //       return <UsersContentEditor users={users} userStats={userStats} notifications={notifications} />;
// //     }
// //     return null;
// //   }, [activeTab, dashboardContent, billsContent, users, userStats, notifications]);

// //   // ============================================================================
// //   // OFFLINE STATE
// //   // ============================================================================

// //   if (!isOnline) {
// //     return (
// //       <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4">
// //         <div className="rounded-full bg-red-500/20 p-4">
// //           <WifiOff className="h-12 w-12 text-red-600" />
// //         </div>
// //         <h2 className="mt-4 text-xl font-bold text-cyan-900">You are offline</h2>
// //         <p className="mt-2 max-w-sm text-center text-cyan-700">
// //           Please check your internet connection and try again.
// //         </p>
// //         <button
// //           onClick={() => {
// //             if (navigator.onLine) {
// //               setIsOnline(true);
// //               setErrorMessage("");
// //               enableNetwork(db).catch(() => {});
// //               if (currentUserRef.current) {
// //                 loadUserContent(currentUserRef.current.uid);
// //               }
// //               loadUsers();
// //             } else {
// //               window.location.reload();
// //             }
// //           }}
// //           className="mt-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:from-cyan-400 hover:to-blue-500"
// //         >
// //           Retry Connection
// //         </button>
// //       </div>
// //     );
// //   }

// //   // ============================================================================
// //   // LOADING STATE
// //   // ============================================================================

// //   if (isLoading && users.length === 0) {
// //     return (
// //       <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4">
// //         <div className="flex flex-col items-center gap-3">
// //           <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
// //           <p className="text-sm text-cyan-700">Loading content...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // ============================================================================
// //   // MAIN RENDER
// //   // ============================================================================

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
// //       <motion.div
// //         variants={containerVariants}
// //         initial="hidden"
// //         animate="visible"
// //         className="mx-auto max-w-6xl"
// //       >
// //         {/* Header */}
// //         <motion.div
// //           custom={0}
// //           variants={cardVariants}
// //           className="mb-6 flex flex-wrap items-center justify-between gap-4"
// //         >
// //           <div>
// //             <h1 className="text-2xl font-bold text-cyan-900 sm:text-3xl">
// //               Content Manager
// //             </h1>
// //             <p className="text-sm text-cyan-700">
// //               Manage content, users, and analytics
// //             </p>
// //           </div>
// //           <div className="flex flex-wrap items-center gap-3">
// //             {/* QChat Component */}
// //             {currentUser && (
// //               <QChat
// //                 portfolioValue={dashboardContent.portfolioValue}
// //                 portfolioChange={dashboardContent.portfolioChange}
// //                 onPortfolioUpdate={handlePortfolioUpdate}
// //                 requireAdmin={true}
// //                 userId={currentUser.uid}
// //                 buttonLabel="Update Portfolio"
// //               />
// //             )}

// //             {/* Online Status Indicator */}
// //             <div className="flex items-center gap-1.5 rounded-full bg-white/30 px-3 py-1">
// //               <Wifi className="h-4 w-4 text-emerald-600" />
// //               <span className="text-xs font-medium text-emerald-700">Online</span>
// //             </div>

// //             {/* Notification Bell */}
// //             <div className="relative">
// //               <button
// //                 onClick={() => setShowNotifications(!showNotifications)}
// //                 className="relative rounded-lg bg-white/30 p-2 text-cyan-700 transition hover:bg-white/50"
// //                 aria-label="Notifications"
// //               >
// //                 <Bell size={20} />
// //                 {notifications.filter((n) => !n.read).length > 0 && (
// //                   <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
// //                     {notifications.filter((n) => !n.read).length}
// //                   </span>
// //                 )}
// //                 {newUserAlert && (
// //                   <motion.span
// //                     initial={{ scale: 0 }}
// //                     animate={{ scale: 1 }}
// //                     className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-red-500"
// //                   />
// //                 )}
// //               </button>

// //               {/* Notification Dropdown */}
// //               <AnimatePresence>
// //                 {showNotifications && (
// //                   <motion.div
// //                     initial={{ opacity: 0, y: -10 }}
// //                     animate={{ opacity: 1, y: 0 }}
// //                     exit={{ opacity: 0, y: -10 }}
// //                     className="absolute right-0 mt-2 w-80 rounded-xl border border-cyan-200/30 bg-white/95 p-3 shadow-xl backdrop-blur-sm"
// //                   >
// //                     <div className="mb-2 flex items-center justify-between">
// //                       <h3 className="text-sm font-bold text-cyan-900">Notifications</h3>
// //                       <button
// //                         onClick={() => {
// //                           setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
// //                         }}
// //                         className="text-xs text-cyan-600 hover:underline"
// //                       >
// //                         Mark all as read
// //                       </button>
// //                     </div>
// //                     <div className="max-h-60 overflow-y-auto">
// //                       {notifications.length === 0 ? (
// //                         <p className="text-center text-sm text-slate-500">No notifications</p>
// //                       ) : (
// //                         notifications.map((notif) => (
// //                           <div
// //                             key={notif.id}
// //                             className={`border-b border-cyan-100/50 px-2 py-2 text-sm ${
// //                               notif.read ? "opacity-60" : "bg-cyan-50/50"
// //                             }`}
// //                           >
// //                             <p className="text-slate-700">{notif.message}</p>
// //                             <p className="text-xs text-slate-400">
// //                               User ID: {notif.userId.slice(0, 8)}...
// //                             </p>
// //                           </div>
// //                         ))
// //                       )}
// //                     </div>
// //                   </motion.div>
// //                 )}
// //               </AnimatePresence>
// //             </div>

// //             <motion.button
// //               whileHover={{ scale: 1.02 }}
// //               whileTap={{ scale: 0.98 }}
// //               onClick={saveUserContent}
// //               disabled={isSaving}
// //               className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50"
// //             >
// //               {isSaving ? (
// //                 <Loader2 className="h-4 w-4 animate-spin" />
// //               ) : (
// //                 <Save size={18} />
// //               )}
// //               Save All Changes
// //             </motion.button>
// //           </div>
// //         </motion.div>

// //         {/* Success/Error Messages */}
// //         <AnimatePresence mode="wait">
// //           {successMessage && (
// //             <motion.div
// //               key="success"
// //               initial={{ opacity: 0, y: -10 }}
// //               animate={{ opacity: 1, y: 0 }}
// //               exit={{ opacity: 0, y: -10 }}
// //               className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-4 py-3 backdrop-blur-sm"
// //             >
// //               <CheckCircle size={16} className="text-emerald-600" />
// //               <span className="text-sm font-bold text-cyan-900">{successMessage}</span>
// //             </motion.div>
// //           )}
// //           {errorMessage && (
// //             <motion.div
// //               key="error"
// //               initial={{ opacity: 0, y: -10 }}
// //               animate={{ opacity: 1, y: 0 }}
// //               exit={{ opacity: 0, y: -10 }}
// //               className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/20 px-4 py-3 backdrop-blur-sm"
// //             >
// //               <AlertCircle size={16} className="text-red-600" />
// //               <span className="text-sm font-bold text-cyan-900">{errorMessage}</span>
// //             </motion.div>
// //           )}
// //         </AnimatePresence>

// //         {/* Tabs */}
// //         <div className="mb-6 flex gap-2 rounded-xl bg-white/30 p-1">
// //           <button
// //             onClick={() => setActiveTab("dashboard")}
// //             className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition ${
// //               activeTab === "dashboard"
// //                 ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
// //                 : "text-cyan-700 hover:bg-white/20"
// //             }`}
// //           >
// //             <Wallet size={16} className="mr-2 inline" />
// //             Dashboard
// //           </button>
// //           <button
// //             onClick={() => setActiveTab("bills")}
// //             className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition ${
// //               activeTab === "bills"
// //                 ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
// //                 : "text-cyan-700 hover:bg-white/20"
// //             }`}
// //           >
// //             <Calendar size={16} className="mr-2 inline" />
// //             Bills
// //           </button>
// //           <button
// //             onClick={() => setActiveTab("users")}
// //             className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition ${
// //               activeTab === "users"
// //                 ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
// //                 : "text-cyan-700 hover:bg-white/20"
// //             }`}
// //           >
// //             <Users size={16} className="mr-2 inline" />
// //             Users
// //           </button>
// //         </div>

// //         {/* Content */}
// //         {renderContent}
// //       </motion.div>
// //     </div>
// //   );
// // }

// // // ============================================================================
// // // DASHBOARD CONTENT EDITOR
// // // ============================================================================

// // interface DashboardContentEditorProps {
// //   content: DashboardContent;
// //   updateField: (field: keyof DashboardContent, value: unknown) => void;
// //   addQuickContact: () => void;
// //   removeQuickContact: (index: number) => void;
// //   updateQuickContact: (index: number, field: keyof QuickContact, value: string) => void;
// //   addTransaction: () => void;
// //   removeTransaction: (index: number) => void;
// //   updateTransaction: (index: number, field: keyof Transaction, value: unknown) => void;
// //   addUpcomingBill: () => void;
// //   removeUpcomingBill: (index: number) => void;
// //   updateUpcomingBill: (index: number, field: keyof UpcomingBill, value: string) => void;
// //   addSpendingCategory: () => void;
// //   removeSpendingCategory: (index: number) => void;
// //   updateSpendingCategory: (index: number, field: keyof SpendingCategory, value: unknown) => void;
// // }

// // function DashboardContentEditor({
// //   content,
// //   updateField,
// //   addQuickContact,
// //   removeQuickContact,
// //   updateQuickContact,
// //   addTransaction,
// //   removeTransaction,
// //   updateTransaction,
// //   addUpcomingBill,
// //   removeUpcomingBill,
// //   updateUpcomingBill,
// //   addSpendingCategory,
// //   removeSpendingCategory,
// //   updateSpendingCategory,
// // }: DashboardContentEditorProps) {
// //   return (
// //     <div className="space-y-6">
// //       {/* Basic Info */}
// //       <div className="rounded-xl border border-cyan-200/30 bg-white/50 p-4 shadow-lg backdrop-blur-sm sm:p-6">
// //         <h2 className="mb-4 text-lg font-bold text-cyan-900">Basic Information</h2>
// //         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
// //           <div>
// //             <label className="block text-xs font-bold text-cyan-700">Title</label>
// //             <input
// //               type="text"
// //               value={content.title}
// //               onChange={(e) => updateField("title", e.target.value)}
// //               className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //             />
// //           </div>
// //           <div>
// //             <label className="block text-xs font-bold text-cyan-700">Subtitle</label>
// //             <input
// //               type="text"
// //               value={content.subtitle}
// //               onChange={(e) => updateField("subtitle", e.target.value)}
// //               className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //             />
// //           </div>
// //           <div>
// //             <label className="block text-xs font-bold text-cyan-700">Portfolio Value</label>
// //             <input
// //               type="text"
// //               value={content.portfolioValue}
// //               onChange={(e) => updateField("portfolioValue", e.target.value)}
// //               className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //             />
// //           </div>
// //           <div>
// //             <label className="block text-xs font-bold text-cyan-700">Portfolio Change</label>
// //             <input
// //               type="text"
// //               value={content.portfolioChange}
// //               onChange={(e) => updateField("portfolioChange", e.target.value)}
// //               className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //             />
// //           </div>
// //         </div>
// //       </div>

// //       {/* Section Titles */}
// //       <div className="rounded-xl border border-cyan-200/30 bg-white/50 p-4 shadow-lg backdrop-blur-sm sm:p-6">
// //         <h2 className="mb-4 text-lg font-bold text-cyan-900">Section Titles</h2>
// //         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
// //           <div>
// //             <label className="block text-xs font-bold text-cyan-700">Quick Transfer</label>
// //             <input
// //               type="text"
// //               value={content.quickTransferTitle}
// //               onChange={(e) => updateField("quickTransferTitle", e.target.value)}
// //               className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //             />
// //           </div>
// //           <div>
// //             <label className="block text-xs font-bold text-cyan-700">Your Cards</label>
// //             <input
// //               type="text"
// //               value={content.cardsTitle}
// //               onChange={(e) => updateField("cardsTitle", e.target.value)}
// //               className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //             />
// //           </div>
// //           <div>
// //             <label className="block text-xs font-bold text-cyan-700">Spending Analysis</label>
// //             <input
// //               type="text"
// //               value={content.spendingTitle}
// //               onChange={(e) => updateField("spendingTitle", e.target.value)}
// //               className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //             />
// //           </div>
// //           <div>
// //             <label className="block text-xs font-bold text-cyan-700">Upcoming Bills</label>
// //             <input
// //               type="text"
// //               value={content.billsTitle}
// //               onChange={(e) => updateField("billsTitle", e.target.value)}
// //               className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //             />
// //           </div>
// //           <div className="sm:col-span-2">
// //             <label className="block text-xs font-bold text-cyan-700">Recent Transactions</label>
// //             <input
// //               type="text"
// //               value={content.transactionsTitle}
// //               onChange={(e) => updateField("transactionsTitle", e.target.value)}
// //               className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //             />
// //           </div>
// //         </div>
// //       </div>

// //       {/* Quick Contacts */}
// //       <div className="rounded-xl border border-cyan-200/30 bg-white/50 p-4 shadow-lg backdrop-blur-sm sm:p-6">
// //         <div className="mb-4 flex items-center justify-between">
// //           <h2 className="text-lg font-bold text-cyan-900">Quick Contacts</h2>
// //           <button
// //             onClick={addQuickContact}
// //             className="flex items-center gap-1 rounded-lg bg-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-700 hover:bg-cyan-500/30"
// //           >
// //             <Plus size={14} /> Add Contact
// //           </button>
// //         </div>
// //         <div className="space-y-2">
// //           {content.quickContacts.map((contact, index) => (
// //             <div key={contact.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-white/30 p-2">
// //               <input
// //                 type="text"
// //                 value={contact.name}
// //                 onChange={(e) => updateQuickContact(index, "name", e.target.value)}
// //                 placeholder="Name"
// //                 className="flex-1 rounded-lg border border-cyan-200/50 bg-white/50 px-2 py-1.5 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //               />
// //               <input
// //                 type="text"
// //                 value={contact.initials}
// //                 onChange={(e) => updateQuickContact(index, "initials", e.target.value.slice(0, 2).toUpperCase())}
// //                 placeholder="Initials"
// //                 maxLength={2}
// //                 className="w-16 rounded-lg border border-cyan-200/50 bg-white/50 px-2 py-1.5 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //               />
// //               <button
// //                 onClick={() => removeQuickContact(index)}
// //                 className="rounded-lg bg-red-500/20 p-1.5 text-red-600 hover:bg-red-500/30"
// //               >
// //                 <Trash2 size={14} />
// //               </button>
// //             </div>
// //           ))}
// //         </div>
// //       </div>

// //       {/* Transactions */}
// //       <div className="rounded-xl border border-cyan-200/30 bg-white/50 p-4 shadow-lg backdrop-blur-sm sm:p-6">
// //         <div className="mb-4 flex items-center justify-between">
// //           <h2 className="text-lg font-bold text-cyan-900">Transactions</h2>
// //           <button
// //             onClick={addTransaction}
// //             className="flex items-center gap-1 rounded-lg bg-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-700 hover:bg-cyan-500/30"
// //           >
// //             <Plus size={14} /> Add Transaction
// //           </button>
// //         </div>
// //         <div className="space-y-2">
// //           {content.transactions.map((tx, index) => (
// //             <div key={tx.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-white/30 p-2">
// //               <input
// //                 type="text"
// //                 value={tx.merchant}
// //                 onChange={(e) => updateTransaction(index, "merchant", e.target.value)}
// //                 placeholder="Merchant"
// //                 className="flex-1 min-w-[100px] rounded-lg border border-cyan-200/50 bg-white/50 px-2 py-1.5 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //               />
// //               <input
// //                 type="text"
// //                 value={tx.type}
// //                 onChange={(e) => updateTransaction(index, "type", e.target.value)}
// //                 placeholder="Type"
// //                 className="w-28 rounded-lg border border-cyan-200/50 bg-white/50 px-2 py-1.5 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //               />
// //               <input
// //                 type="text"
// //                 value={tx.amount}
// //                 onChange={(e) => updateTransaction(index, "amount", e.target.value)}
// //                 placeholder="Amount"
// //                 className="w-24 rounded-lg border border-cyan-200/50 bg-white/50 px-2 py-1.5 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //               />
// //               <select
// //                 value={tx.status}
// //                 onChange={(e) => updateTransaction(index, "status", e.target.value as Transaction["status"])}
// //                 className="rounded-lg border border-cyan-200/50 bg-white/50 px-2 py-1.5 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //               >
// //                 <option value="completed">Completed</option>
// //                 <option value="pending">Pending</option>
// //                 <option value="failed">Failed</option>
// //               </select>
// //               <button
// //                 onClick={() => removeTransaction(index)}
// //                 className="rounded-lg bg-red-500/20 p-1.5 text-red-600 hover:bg-red-500/30"
// //               >
// //                 <Trash2 size={14} />
// //               </button>
// //             </div>
// //           ))}
// //         </div>
// //       </div>

// //       {/* Upcoming Bills */}
// //       <div className="rounded-xl border border-cyan-200/30 bg-white/50 p-4 shadow-lg backdrop-blur-sm sm:p-6">
// //         <div className="mb-4 flex items-center justify-between">
// //           <h2 className="text-lg font-bold text-cyan-900">Upcoming Bills</h2>
// //           <button
// //             onClick={addUpcomingBill}
// //             className="flex items-center gap-1 rounded-lg bg-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-700 hover:bg-cyan-500/30"
// //           >
// //             <Plus size={14} /> Add Bill
// //           </button>
// //         </div>
// //         <div className="space-y-2">
// //           {content.upcomingBills.map((bill, index) => (
// //             <div key={bill.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-white/30 p-2">
// //               <input
// //                 type="text"
// //                 value={bill.name}
// //                 onChange={(e) => updateUpcomingBill(index, "name", e.target.value)}
// //                 placeholder="Bill Name"
// //                 className="flex-1 min-w-[100px] rounded-lg border border-cyan-200/50 bg-white/50 px-2 py-1.5 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //               />
// //               <input
// //                 type="text"
// //                 value={bill.dueIn}
// //                 onChange={(e) => updateUpcomingBill(index, "dueIn", e.target.value)}
// //                 placeholder="Due In"
// //                 className="w-28 rounded-lg border border-cyan-200/50 bg-white/50 px-2 py-1.5 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //               />
// //               <input
// //                 type="text"
// //                 value={bill.amount}
// //                 onChange={(e) => updateUpcomingBill(index, "amount", e.target.value)}
// //                 placeholder="Amount"
// //                 className="w-24 rounded-lg border border-cyan-200/50 bg-white/50 px-2 py-1.5 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //               />
// //               <button
// //                 onClick={() => removeUpcomingBill(index)}
// //                 className="rounded-lg bg-red-500/20 p-1.5 text-red-600 hover:bg-red-500/30"
// //               >
// //                 <Trash2 size={14} />
// //               </button>
// //             </div>
// //           ))}
// //         </div>
// //       </div>

// //       {/* Spending Categories */}
// //       <div className="rounded-xl border border-cyan-200/30 bg-white/50 p-4 shadow-lg backdrop-blur-sm sm:p-6">
// //         <div className="mb-4 flex items-center justify-between">
// //           <h2 className="text-lg font-bold text-cyan-900">Spending Categories</h2>
// //           <button
// //             onClick={addSpendingCategory}
// //             className="flex items-center gap-1 rounded-lg bg-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-700 hover:bg-cyan-500/30"
// //           >
// //             <Plus size={14} /> Add Category
// //           </button>
// //         </div>
// //         <div className="space-y-2">
// //           {content.spendingCategories.map((cat, index) => (
// //             <div key={cat.id || index} className="flex flex-wrap items-center gap-2 rounded-lg bg-white/30 p-2">
// //               <input
// //                 type="text"
// //                 value={cat.name}
// //                 onChange={(e) => updateSpendingCategory(index, "name", e.target.value)}
// //                 placeholder="Category Name"
// //                 className="flex-1 min-w-[100px] rounded-lg border border-cyan-200/50 bg-white/50 px-2 py-1.5 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //               />
// //               <input
// //                 type="number"
// //                 value={cat.percentage}
// //                 onChange={(e) => updateSpendingCategory(index, "percentage", Number(e.target.value))}
// //                 placeholder="%"
// //                 className="w-20 rounded-lg border border-cyan-200/50 bg-white/50 px-2 py-1.5 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //               />
// //               <select
// //                 value={cat.color}
// //                 onChange={(e) => updateSpendingCategory(index, "color", e.target.value)}
// //                 className="rounded-lg border border-cyan-200/50 bg-white/50 px-2 py-1.5 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //               >
// //                 <option value="from-purple-400 to-pink-500">Purple-Pink</option>
// //                 <option value="from-cyan-400 to-blue-500">Cyan-Blue</option>
// //                 <option value="from-emerald-400 to-teal-500">Emerald-Teal</option>
// //                 <option value="from-amber-400 to-orange-500">Amber-Orange</option>
// //                 <option value="from-rose-400 to-red-500">Rose-Red</option>
// //               </select>
// //               <button
// //                 onClick={() => removeSpendingCategory(index)}
// //                 className="rounded-lg bg-red-500/20 p-1.5 text-red-600 hover:bg-red-500/30"
// //               >
// //                 <Trash2 size={14} />
// //               </button>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ============================================================================
// // // BILLS CONTENT EDITOR
// // // ============================================================================

// // interface BillsContentEditorProps {
// //   content: BillsContent;
// //   updateField: (field: keyof BillsContent, value: unknown) => void;
// //   updateCard: (index: number, field: keyof BillsCard, value: unknown) => void;
// //   addCard: () => void;
// //   removeCard: (index: number) => void;
// //   updateFeature: (cardIndex: number, featureIndex: number, value: string) => void;
// //   addFeature: (cardIndex: number) => void;
// //   removeFeature: (cardIndex: number, featureIndex: number) => void;
// // }

// // function BillsContentEditor({
// //   content,
// //   updateField,
// //   updateCard,
// //   addCard,
// //   removeCard,
// //   updateFeature,
// //   addFeature,
// //   removeFeature,
// // }: BillsContentEditorProps) {
// //   return (
// //     <div className="space-y-6">
// //       <div className="rounded-xl border border-cyan-200/30 bg-white/50 p-4 shadow-lg backdrop-blur-sm sm:p-6">
// //         <h2 className="mb-4 text-lg font-bold text-cyan-900">Page Settings</h2>
// //         <div className="grid grid-cols-1 gap-4">
// //           <div>
// //             <label className="block text-xs font-bold text-cyan-700">Title</label>
// //             <input
// //               type="text"
// //               value={content.title}
// //               onChange={(e) => updateField("title", e.target.value)}
// //               className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //             />
// //           </div>
// //           <div>
// //             <label className="block text-xs font-bold text-cyan-700">Subtitle</label>
// //             <input
// //               type="text"
// //               value={content.subtitle}
// //               onChange={(e) => updateField("subtitle", e.target.value)}
// //               className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //             />
// //           </div>
// //           <div>
// //             <label className="block text-xs font-bold text-cyan-700">Footer Text</label>
// //             <input
// //               type="text"
// //               value={content.footerText}
// //               onChange={(e) => updateField("footerText", e.target.value)}
// //               className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-3 py-2 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //             />
// //           </div>
// //         </div>
// //       </div>

// //       <div className="rounded-xl border border-cyan-200/30 bg-white/50 p-4 shadow-lg backdrop-blur-sm sm:p-6">
// //         <div className="mb-4 flex items-center justify-between">
// //           <h2 className="text-lg font-bold text-cyan-900">Cards</h2>
// //           <button
// //             onClick={addCard}
// //             className="flex items-center gap-1 rounded-lg bg-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-700 hover:bg-cyan-500/30"
// //           >
// //             <Plus size={14} /> Add Card
// //           </button>
// //         </div>
// //         <div className="space-y-4">
// //           {content.cards.map((card, cardIndex) => (
// //             <div key={card.id} className="rounded-lg border border-cyan-200/30 bg-white/30 p-4">
// //               <div className="mb-3 flex items-center justify-between">
// //                 <h3 className="font-bold text-cyan-900">Card {cardIndex + 1}</h3>
// //                 <button
// //                   onClick={() => removeCard(cardIndex)}
// //                   className="rounded-lg bg-red-500/20 p-1.5 text-red-600 hover:bg-red-500/30"
// //                 >
// //                   <Trash2 size={14} />
// //                 </button>
// //               </div>
// //               <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
// //                 <div>
// //                   <label className="block text-xs font-bold text-cyan-700">Variant</label>
// //                   <select
// //                     value={card.variant}
// //                     onChange={(e) => updateCard(cardIndex, "variant", e.target.value as BillsCard["variant"])}
// //                     className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-2 py-1.5 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //                   >
// //                     <option value="purple">Purple</option>
// //                     <option value="green">Green</option>
// //                     <option value="gold">Gold</option>
// //                     <option value="lime">Lime</option>
// //                   </select>
// //                 </div>
// //                 <div>
// //                   <label className="block text-xs font-bold text-cyan-700">Title</label>
// //                   <input
// //                     type="text"
// //                     value={card.title}
// //                     onChange={(e) => updateCard(cardIndex, "title", e.target.value)}
// //                     className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-2 py-1.5 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //                   />
// //                 </div>
// //                 <div className="sm:col-span-2">
// //                   <label className="block text-xs font-bold text-cyan-700">Description</label>
// //                   <input
// //                     type="text"
// //                     value={card.description}
// //                     onChange={(e) => updateCard(cardIndex, "description", e.target.value)}
// //                     className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-2 py-1.5 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //                   />
// //                 </div>
// //                 <div>
// //                   <label className="block text-xs font-bold text-cyan-700">CTA Text</label>
// //                   <input
// //                     type="text"
// //                     value={card.ctaText}
// //                     onChange={(e) => updateCard(cardIndex, "ctaText", e.target.value)}
// //                     className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-2 py-1.5 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //                   />
// //                 </div>
// //                 <div>
// //                   <label className="block text-xs font-bold text-cyan-700">CTA Link</label>
// //                   <input
// //                     type="text"
// //                     value={card.ctaLink}
// //                     onChange={(e) => updateCard(cardIndex, "ctaLink", e.target.value)}
// //                     className="mt-1 w-full rounded-lg border border-cyan-200/50 bg-white/50 px-2 py-1.5 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //                   />
// //                 </div>
// //               </div>

// //               <div className="mt-3">
// //                 <div className="mb-2 flex items-center justify-between">
// //                   <label className="text-xs font-bold text-cyan-700">Features</label>
// //                   <button
// //                     onClick={() => addFeature(cardIndex)}
// //                     className="text-xs font-bold text-cyan-600 hover:text-cyan-700"
// //                   >
// //                     <Plus size={12} className="inline" /> Add Feature
// //                   </button>
// //                 </div>
// //                 <div className="space-y-1">
// //                   {card.features.map((feature, featureIndex) => (
// //                     <div key={featureIndex} className="flex items-center gap-2">
// //                       <input
// //                         type="text"
// //                         value={feature}
// //                         onChange={(e) => updateFeature(cardIndex, featureIndex, e.target.value)}
// //                         className="flex-1 rounded-lg border border-cyan-200/50 bg-white/50 px-2 py-1 text-sm font-bold text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
// //                       />
// //                       <button
// //                         onClick={() => removeFeature(cardIndex, featureIndex)}
// //                         className="rounded-lg bg-red-500/20 p-1 text-red-600 hover:bg-red-500/30"
// //                       >
// //                         <Trash2 size={12} />
// //                       </button>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ============================================================================
// // // USERS CONTENT EDITOR
// // // ============================================================================

// // interface UsersContentEditorProps {
// //   users: UserData[];
// //   userStats: {
// //     total: number;
// //     active: number;
// //     inactive: number;
// //     withPin: number;
// //   };
// //   notifications: Notification[];
// // }

// // function UsersContentEditor({ users, userStats }: UsersContentEditorProps) {
// //   const totalUsers = userStats.total || 1;
// //   const activePercentage = (userStats.active / totalUsers) * 100;
// //   const inactivePercentage = (userStats.inactive / totalUsers) * 100;
// //   const pinPercentage = (userStats.withPin / totalUsers) * 100;

// //   return (
// //     <div className="space-y-6">
// //       {/* Stats Cards */}
// //       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           className="rounded-xl border border-cyan-200/30 bg-white/50 p-4 shadow-lg backdrop-blur-sm"
// //         >
// //           <div className="flex items-center gap-3">
// //             <div className="rounded-lg bg-cyan-500/20 p-2">
// //               <Users size={20} className="text-cyan-700" />
// //             </div>
// //             <div>
// //               <p className="text-xs font-bold text-cyan-700">Total Users</p>
// //               <p className="text-2xl font-bold text-cyan-900">{userStats.total}</p>
// //             </div>
// //           </div>
// //         </motion.div>

// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ delay: 0.1 }}
// //           className="rounded-xl border border-emerald-200/30 bg-white/50 p-4 shadow-lg backdrop-blur-sm"
// //         >
// //           <div className="flex items-center gap-3">
// //             <div className="rounded-lg bg-emerald-500/20 p-2">
// //               <CheckCircle size={20} className="text-emerald-700" />
// //             </div>
// //             <div>
// //               <p className="text-xs font-bold text-emerald-700">Active Users</p>
// //               <p className="text-2xl font-bold text-emerald-900">{userStats.active}</p>
// //             </div>
// //           </div>
// //         </motion.div>

// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ delay: 0.2 }}
// //           className="rounded-xl border border-red-200/30 bg-white/50 p-4 shadow-lg backdrop-blur-sm"
// //         >
// //           <div className="flex items-center gap-3">
// //             <div className="rounded-lg bg-red-500/20 p-2">
// //               <AlertCircle size={20} className="text-red-700" />
// //             </div>
// //             <div>
// //               <p className="text-xs font-bold text-red-700">Inactive Users</p>
// //               <p className="text-2xl font-bold text-red-900">{userStats.inactive}</p>
// //             </div>
// //           </div>
// //         </motion.div>

// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ delay: 0.3 }}
// //           className="rounded-xl border border-purple-200/30 bg-white/50 p-4 shadow-lg backdrop-blur-sm"
// //         >
// //           <div className="flex items-center gap-3">
// //             <div className="rounded-lg bg-purple-500/20 p-2">
// //               <Lock size={20} className="text-purple-700" />
// //             </div>
// //             <div>
// //               <p className="text-xs font-bold text-purple-700">PIN Enabled</p>
// //               <p className="text-2xl font-bold text-purple-900">{userStats.withPin}</p>
// //             </div>
// //           </div>
// //         </motion.div>
// //       </div>

// //       {/* Pie Chart */}
// //       <motion.div
// //         initial={{ opacity: 0, scale: 0.95 }}
// //         animate={{ opacity: 1, scale: 1 }}
// //         className="rounded-xl border border-cyan-200/30 bg-white/50 p-6 shadow-lg backdrop-blur-sm"
// //       >
// //         <h2 className="mb-4 text-lg font-bold text-cyan-900">User Analytics</h2>
// //         <div className="flex flex-col items-center gap-6 sm:flex-row">
// //           <div className="relative h-48 w-48 sm:h-56 sm:w-56">
// //             <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
// //               <circle
// //                 cx="60"
// //                 cy="60"
// //                 r="48"
// //                 fill="none"
// //                 stroke="#f3f4f6"
// //                 strokeWidth="16"
// //               />
// //               <motion.circle
// //                 cx="60"
// //                 cy="60"
// //                 r="48"
// //                 fill="none"
// //                 stroke="#10b981"
// //                 strokeWidth="16"
// //                 strokeDasharray={`${activePercentage * 3.016} 301.6`}
// //                 strokeLinecap="round"
// //                 initial={{ strokeDashoffset: 301.6 }}
// //                 animate={{ strokeDashoffset: 0 }}
// //                 transition={{ duration: 1.5, ease: "easeOut" }}
// //               />
// //               <motion.circle
// //                 cx="60"
// //                 cy="60"
// //                 r="48"
// //                 fill="none"
// //                 stroke="#ef4444"
// //                 strokeWidth="16"
// //                 strokeDasharray={`${inactivePercentage * 3.016} 301.6`}
// //                 strokeDashoffset={`-${activePercentage * 3.016}`}
// //                 strokeLinecap="round"
// //                 initial={{ strokeDashoffset: 301.6 }}
// //                 animate={{ strokeDashoffset: -activePercentage * 3.016 }}
// //                 transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
// //               />
// //               <motion.circle
// //                 cx="60"
// //                 cy="60"
// //                 r="48"
// //                 fill="none"
// //                 stroke="#8b5cf6"
// //                 strokeWidth="16"
// //                 strokeDasharray={`${pinPercentage * 3.016} 301.6`}
// //                 strokeDashoffset={`-${(activePercentage + inactivePercentage) * 3.016}`}
// //                 strokeLinecap="round"
// //                 initial={{ strokeDashoffset: 301.6 }}
// //                 animate={{ strokeDashoffset: -(activePercentage + inactivePercentage) * 3.016 }}
// //                 transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
// //               />
// //             </svg>
// //             <div className="absolute inset-0 flex items-center justify-center">
// //               <div className="text-center">
// //                 <p className="text-lg font-bold text-cyan-900">{userStats.total}</p>
// //                 <p className="text-xs text-cyan-600">Total Users</p>
// //               </div>
// //             </div>
// //           </div>

// //           <div className="space-y-2">
// //             <div className="flex items-center gap-2">
// //               <span className="h-3 w-3 rounded-full bg-emerald-500" />
// //               <span className="text-sm text-slate-700">
// //                 Active: {userStats.active} ({Math.round(activePercentage)}%)
// //               </span>
// //             </div>
// //             <div className="flex items-center gap-2">
// //               <span className="h-3 w-3 rounded-full bg-red-500" />
// //               <span className="text-sm text-slate-700">
// //                 Inactive: {userStats.inactive} ({Math.round(inactivePercentage)}%)
// //               </span>
// //             </div>
// //             <div className="flex items-center gap-2">
// //               <span className="h-3 w-3 rounded-full bg-purple-500" />
// //               <span className="text-sm text-slate-700">
// //                 PIN Enabled: {userStats.withPin} ({Math.round(pinPercentage)}%)
// //               </span>
// //             </div>
// //           </div>
// //         </div>
// //       </motion.div>

// //       {/* User Table */}
// //       <motion.div
// //         initial={{ opacity: 0 }}
// //         animate={{ opacity: 1 }}
// //         className="rounded-xl border border-cyan-200/30 bg-white/50 p-4 shadow-lg backdrop-blur-sm sm:p-6"
// //       >
// //         <div className="mb-4 flex items-center justify-between">
// //           <h2 className="text-lg font-bold text-cyan-900">All Users</h2>
// //           <div className="flex items-center gap-2">
// //             <span className="text-xs text-slate-500">Total: {users.length}</span>
// //           </div>
// //         </div>

// //         <div className="overflow-x-auto">
// //           <table className="w-full text-sm">
// //             <thead>
// //               <tr className="border-b border-cyan-200/30 text-left text-xs font-bold uppercase text-cyan-700">
// //                 <th className="px-3 py-2">User ID</th>
// //                 <th className="px-3 py-2">Name</th>
// //                 <th className="px-3 py-2">Email</th>
// //                 <th className="px-3 py-2">Phone</th>
// //                 <th className="px-3 py-2">Status</th>
// //                 <th className="px-3 py-2">PIN</th>
// //                 <th className="px-3 py-2">Joined</th>
// //                 <th className="px-3 py-2">Portfolio</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {users.map((user, index) => (
// //                 <motion.tr
// //                   key={user.uid}
// //                   initial={{ opacity: 0, x: -10 }}
// //                   animate={{ opacity: 1, x: 0 }}
// //                   transition={{ delay: index * 0.03 }}
// //                   className="border-b border-cyan-200/20 hover:bg-cyan-50/30"
// //                 >
// //                   <td className="px-3 py-2 font-mono text-xs text-cyan-900">
// //                     {user.uid.slice(0, 8)}...
// //                   </td>
// //                   <td className="px-3 py-2 font-medium text-cyan-900">
// //                     {user.firstName} {user.lastName}
// //                   </td>
// //                   <td className="px-3 py-2 text-cyan-800">{user.email}</td>
// //                   <td className="px-3 py-2 text-cyan-800">{user.phone || "—"}</td>
// //                   <td className="px-3 py-2">
// //                     <span
// //                       className={`rounded-full px-2 py-0.5 text-xs font-bold ${
// //                         user.isActive !== false
// //                           ? "bg-emerald-500/20 text-emerald-700"
// //                           : "bg-red-500/20 text-red-700"
// //                       }`}
// //                     >
// //                       {user.isActive !== false ? "Active" : "Inactive"}
// //                     </span>
// //                   </td>
// //                   <td className="px-3 py-2">
// //                     <span
// //                       className={`rounded-full px-2 py-0.5 text-xs font-bold ${
// //                         user.transactionPin && user.transactionPin.length > 0
// //                           ? "bg-purple-500/20 text-purple-700"
// //                           : "bg-slate-500/20 text-slate-600"
// //                       }`}
// //                     >
// //                       {user.transactionPin && user.transactionPin.length > 0 ? "Set" : "Not Set"}
// //                     </span>
// //                   </td>
// //                   <td className="px-3 py-2 text-xs text-cyan-600">
// //                     {user.createdAt instanceof Timestamp
// //                       ? user.createdAt.toDate().toLocaleDateString()
// //                       : "—"}
// //                   </td>
// //                   <td className="px-3 py-2 text-xs text-cyan-600">
// //                     {user.dashboardContent?.portfolioValue || "$0.00"}
// //                   </td>
// //                 </motion.tr>
// //               ))}
// //               {users.length === 0 && (
// //                 <tr>
// //                   <td colSpan={8} className="py-8 text-center text-slate-500">
// //                     No users registered yet
// //                   </td>
// //                 </tr>
// //               )}
// //             </tbody>
// //           </table>
// //         </div>
// //       </motion.div>
// //     </div>
// //   );
// // }
// // app/me/page.tsx
// "use client";

// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRouter } from "next/navigation";
// import Iconpack from '@/app/components/Iconpack';
// import ChatWidgett from '@/app/components/ChatWidgett';
// import QChat from '@/app/components/QChat';
// import { auth, db } from "@/app/components/firebase";
// import {
//   doc,
//   getDoc,
//   setDoc,
//   updateDoc,
//   serverTimestamp,
// } from "firebase/firestore";
// import {
//   onAuthStateChanged,
//   type User as FirebaseUser,
//   signOut,
// } from "firebase/auth";
// import {
//   User,
//   Mail,
//   Calendar,
//   Settings,
//   LogOut,
//   Shield,
//   Wallet,
//   TrendingUp,
//   ArrowUpRight,
//   ArrowDownRight,
//   CreditCard,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   Edit2,
//   Save,
//   X,
//   Camera,
//   Users,
//   PieChart,
//   BarChart3,
//   Star,
//   Zap,
//   Globe,
//   Smartphone,
//   Briefcase,
//   Gift,
//   Home,
//   ShoppingBag,
//   Coffee,
//   Car,
//   Lock,
//   ChevronRight,
//   Activity,
//   DollarSign,
// } from "lucide-react";

// // ============================================================================
// // TYPES
// // ============================================================================

// interface UpcomingBill {
//   id: string;
//   name: string;
//   dueIn: string;
//   amount: string;
//   category: string;
// }

// interface UserProfile {
//   displayName: string;
//   email: string;
//   photoURL: string;
//   createdAt: string;
//   lastLogin: string;
//   role: "user" | "admin";
//   phoneNumber?: string;
//   bio?: string;
//   location?: string;
//   website?: string;
//   stats: {
//     totalInvestments: number;
//     totalBills: number;
//     totalTransactions: number;
//     portfolioValue: string;
//     portfolioChange: string;
//   };
//   preferences: {
//     theme: "light" | "dark" | "system";
//     notifications: boolean;
//     emailUpdates: boolean;
//   };
// }

// // ============================================================================
// // LOADING SKELETON
// // ============================================================================

// const LoadingSkeleton = () => (
//   <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
//     <div className="mx-auto max-w-4xl space-y-4">
//       <div className="h-32 animate-pulse rounded-2xl shadow-xl bg-[#C4F8FD]" />
//       <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//         <div className="h-24 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//         <div className="h-24 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//         <div className="h-24 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//       </div>
//       <div className="h-64 animate-pulse rounded-2xl shadow-xl bg-[#C4F8FD]" />
//     </div>
//   </div>
// );

// // ============================================================================
// // STAT CARD COMPONENT
// // ============================================================================

// interface StatCardProps {
//   label: string;
//   value: string | number;
//   icon: React.ReactNode;
//   change?: string;
//   positive?: boolean;
//   delay?: number;
// }

// function StatCard({ label, value, icon, change, positive, delay = 0 }: StatCardProps) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: delay * 0.1 }}
//       whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
//       className="rounded-xl bg-[#C4F8FD] p-4 shadow-xl border-none hover:shadow-2xl transition-all duration-300"
//     >
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</p>
//           <p className="text-xl font-bold text-cyan-900 mt-1">{value}</p>
//           {change && (
//             <p className={`text-xs font-bold ${positive ? 'text-emerald-600' : 'text-red-600'}`}>
//               {change}
//             </p>
//           )}
//         </div>
//         <div className="rounded-lg bg-white/30 p-2 shadow-sm">
//           {icon}
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// // ============================================================================
// // MAIN PROFILE PAGE
// // ============================================================================

// export default function ProfilePage() {
//   const router = useRouter();
//   const [user, setUser] = useState<FirebaseUser | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [isEditing, setIsEditing] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [profile, setProfile] = useState<UserProfile>({
//     displayName: "",
//     email: "",
//     photoURL: "",
//     createdAt: "",
//     lastLogin: "",
//     role: "user",
//     phoneNumber: "",
//     bio: "",
//     location: "",
//     website: "",
//     stats: {
//       totalInvestments: 0,
//       totalBills: 0,
//       totalTransactions: 0,
//       portfolioValue: "$0.00",
//       portfolioChange: "0.0%",
//     },
//     preferences: {
//       theme: "system",
//       notifications: true,
//       emailUpdates: true,
//     },
//   });

//   const [editForm, setEditForm] = useState({
//     displayName: "",
//     phoneNumber: "",
//     bio: "",
//     location: "",
//     website: "",
//   });

//   const [dashboardData, setDashboardData] = useState({
//     portfolioValue: "$0.00",
//     portfolioChange: "0.0%",
//     recentBills: [] as UpcomingBill[],
//     upcomingBills: [] as UpcomingBill[],
//   });

//   const isMounted = useRef(true);
//   const dataLoaded = useRef(false);

//   // ============================================================================
//   // EFFECTS
//   // ============================================================================

//   useEffect(() => {
//     isMounted.current = true;

//     const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
//       if (!isMounted.current) return;

//       if (authUser) {
//         setUser(authUser);
//         await loadUserData(authUser);
//         await loadDashboardData(authUser.uid);
//       } else {
//         router.push("/log-in");
//       }
//       setLoading(false);
//     });

//     return () => {
//       isMounted.current = false;
//       unsubscribe();
//     };
//   }, [router]);

//   // ============================================================================
//   // DATA LOADING
//   // ============================================================================

//   const loadUserData = async (authUser: FirebaseUser) => {
//     try {
//       const userDocRef = doc(db, "users", authUser.uid);
//       const userDoc = await getDoc(userDocRef);

//       if (!isMounted.current) return;

//       if (userDoc.exists()) {
//         const data = userDoc.data();
//         const userData = data.userData || {};

//         setProfile({
//           displayName: userData.displayName || authUser.displayName || "User",
//           email: userData.email || authUser.email || "",
//           photoURL: userData.photoURL || authUser.photoURL || "",
//           createdAt: userData.createdAt || new Date().toISOString(),
//           lastLogin: new Date().toISOString(),
//           role: userData.role || "user",
//           phoneNumber: userData.phoneNumber || "",
//           bio: userData.bio || "",
//           location: userData.location || "",
//           website: userData.website || "",
//           stats: {
//             totalInvestments: userData.stats?.totalInvestments || 0,
//             totalBills: userData.stats?.totalBills || 0,
//             totalTransactions: userData.stats?.totalTransactions || 0,
//             portfolioValue: userData.stats?.portfolioValue || "$0.00",
//             portfolioChange: userData.stats?.portfolioChange || "0.0%",
//           },
//           preferences: {
//             theme: userData.preferences?.theme || "system",
//             notifications: userData.preferences?.notifications !== false,
//             emailUpdates: userData.preferences?.emailUpdates !== false,
//           },
//         });

//         setEditForm({
//           displayName: userData.displayName || authUser.displayName || "User",
//           phoneNumber: userData.phoneNumber || "",
//           bio: userData.bio || "",
//           location: userData.location || "",
//           website: userData.website || "",
//         });
//       } else {
//         // Create default user profile
//         const defaultProfile = {
//           displayName: authUser.displayName || "User",
//           email: authUser.email || "",
//           photoURL: authUser.photoURL || "",
//           createdAt: new Date().toISOString(),
//           lastLogin: new Date().toISOString(),
//           role: "user" as const,
//           phoneNumber: "",
//           bio: "",
//           location: "",
//           website: "",
//           stats: {
//             totalInvestments: 0,
//             totalBills: 0,
//             totalTransactions: 0,
//             portfolioValue: "$0.00",
//             portfolioChange: "0.0%",
//           },
//           preferences: {
//             theme: "system" as const,
//             notifications: true,
//             emailUpdates: true,
//           },
//         };

//         await setDoc(userDocRef, {
//           userData: defaultProfile,
//           updatedAt: serverTimestamp(),
//         }, { merge: true });

//         setProfile(defaultProfile);
//         setEditForm({
//           displayName: defaultProfile.displayName,
//           phoneNumber: defaultProfile.phoneNumber,
//           bio: defaultProfile.bio,
//           location: defaultProfile.location,
//           website: defaultProfile.website,
//         });
//       }
//     } catch (error) {
//       console.error("Error loading user data:", error);
//     }
//   };

//   const loadDashboardData = async (userId: string) => {
//     try {
//       const userDocRef = doc(db, "users", userId);
//       const userDoc = await getDoc(userDocRef);

//       if (!isMounted.current) return;

//       if (userDoc.exists()) {
//         const data = userDoc.data();
//         const dashboard = data.dashboardData || {};

//         setDashboardData({
//           portfolioValue: dashboard.portfolioValue || "$0.00",
//           portfolioChange: dashboard.portfolioChange || "0.0%",
//           recentBills: dashboard.recentBills || [],
//           upcomingBills: dashboard.upcomingBills || [],
//         });
//       }
//     } catch (error) {
//       console.error("Error loading dashboard data:", error);
//     }
//   };

//   // ============================================================================
//   // HANDLERS
//   // ============================================================================

//   const handlePortfolioUpdate = useCallback((newValue: string, newChange: string) => {
//     setDashboardData(prev => ({
//       ...prev,
//       portfolioValue: newValue,
//       portfolioChange: newChange,
//     }));

//     setProfile(prev => ({
//       ...prev,
//       stats: {
//         ...prev.stats,
//         portfolioValue: newValue,
//         portfolioChange: newChange,
//       },
//     }));

//     if (user && isMounted.current) {
//       const userDocRef = doc(db, "users", user.uid);
//       updateDoc(userDocRef, {
//         "dashboardData.portfolioValue": newValue,
//         "dashboardData.portfolioChange": newChange,
//         "userData.stats.portfolioValue": newValue,
//         "userData.stats.portfolioChange": newChange,
//         updatedAt: serverTimestamp(),
//       }).catch(console.error);
//     }
//   }, [user]);

//   const handleRecentBillsUpdate = useCallback((newBills: UpcomingBill[]) => {
//     setDashboardData(prev => ({
//       ...prev,
//       recentBills: newBills,
//     }));

//     if (user && isMounted.current) {
//       const userDocRef = doc(db, "users", user.uid);
//       updateDoc(userDocRef, {
//         "dashboardData.recentBills": newBills,
//         updatedAt: serverTimestamp(),
//       }).catch(console.error);
//     }
//   }, [user]);

//   const handleUpcomingBillsUpdate = useCallback((newBills: UpcomingBill[]) => {
//     setDashboardData(prev => ({
//       ...prev,
//       upcomingBills: newBills,
//     }));

//     setProfile(prev => ({
//       ...prev,
//       stats: {
//         ...prev.stats,
//         totalBills: newBills.length + dashboardData.recentBills.length,
//       },
//     }));

//     if (user && isMounted.current) {
//       const userDocRef = doc(db, "users", user.uid);
//       updateDoc(userDocRef, {
//         "dashboardData.upcomingBills": newBills,
//         "userData.stats.totalBills": newBills.length + dashboardData.recentBills.length,
//         updatedAt: serverTimestamp(),
//       }).catch(console.error);
//     }
//   }, [user, dashboardData.recentBills.length]);

//   const handleEditToggle = () => {
//     if (isEditing) {
//       setEditForm({
//         displayName: profile.displayName,
//         phoneNumber: profile.phoneNumber || "",
//         bio: profile.bio || "",
//         location: profile.location || "",
//         website: profile.website || "",
//       });
//     }
//     setIsEditing(!isEditing);
//   };

//   const handleSaveProfile = async () => {
//     setIsSaving(true);
//     try {
//       const updatedProfile = {
//         ...profile,
//         displayName: editForm.displayName,
//         phoneNumber: editForm.phoneNumber,
//         bio: editForm.bio,
//         location: editForm.location,
//         website: editForm.website,
//       };

//       setProfile(updatedProfile);

//       if (user && isMounted.current) {
//         const userDocRef = doc(db, "users", user.uid);
//         await updateDoc(userDocRef, {
//           "userData.displayName": editForm.displayName,
//           "userData.phoneNumber": editForm.phoneNumber,
//           "userData.bio": editForm.bio,
//           "userData.location": editForm.location,
//           "userData.website": editForm.website,
//           updatedAt: serverTimestamp(),
//         });
//       }

//       setIsEditing(false);
//     } catch (error) {
//       console.error("Error saving profile:", error);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleSignOut = async () => {
//     try {
//       await signOut(auth);
//       router.push("/log-in");
//     } catch (error) {
//       console.error("Error signing out:", error);
//     }
//   };

//   // ============================================================================
//   // RENDER
//   // ============================================================================

//   if (loading) {
//     return <LoadingSkeleton />;
//   }

//   if (!user) {
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
//       <div className="mx-auto max-w-4xl">
//         {/* Header with QChat */}
//         <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
//           <h1 className="text-2xl font-bold text-cyan-900 sm:text-3xl flex items-center gap-2">
//             <User size={28} className="text-cyan-700" />
//             My Profile
//           </h1>
//           <QChat
//             portfolioValue={dashboardData.portfolioValue}
//             portfolioChange={dashboardData.portfolioChange}
//             onPortfolioUpdate={handlePortfolioUpdate}
//             onRecentBillsUpdate={handleRecentBillsUpdate}
//             // onUpcomingBillsUpdate={handleUpcomingBillsUpdate}
//             recentBills={dashboardData.recentBills}
//             // upcomingBills={dashboardData.upcomingBills}
//             requireAdmin={true}
//             userId={user.uid}
//             buttonLabel="💬 Admin"
//           />
//         </div>

//         {/* Profile Card */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="rounded-2xl bg-[#C4F8FD] p-6 shadow-xl border-none"
//         >
//           <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
//             {/* Avatar */}
//             <div className="relative">
//               <div className="h-24 w-24 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
//                 {profile.photoURL ? (
//                   <img src={profile.photoURL} alt={profile.displayName} className="h-full w-full rounded-full object-cover" />
//                 ) : (
//                   profile.displayName.charAt(0).toUpperCase()
//                 )}
//               </div>
//               <button className="absolute bottom-0 right-0 rounded-full bg-cyan-600 p-1.5 text-white shadow-lg hover:bg-cyan-700 transition-colors">
//                 <Camera size={14} />
//               </button>
//             </div>

//             {/* User Info */}
//             <div className="flex-1">
//               <div className="flex items-center gap-3 flex-wrap">
//                 <h2 className="text-2xl font-bold text-cyan-900">{profile.displayName}</h2>
//                 {profile.role === "admin" && (
//                   <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 text-xs font-bold flex items-center gap-1">
//                     <Shield size={12} />
//                     Admin
//                   </span>
//                 )}
//                 <button
//                   onClick={handleEditToggle}
//                   className="rounded-lg bg-white/30 px-3 py-1 text-xs font-bold text-cyan-700 hover:bg-white/50 transition-colors shadow-sm"
//                 >
//                   {isEditing ? "Cancel" : "Edit Profile"}
//                 </button>
//               </div>
//               <div className="flex items-center gap-2 text-sm text-cyan-700/70 mt-1">
//                 <Mail size={14} />
//                 <span>{profile.email}</span>
//               </div>
//               {profile.location && (
//                 <div className="flex items-center gap-2 text-sm text-cyan-700/60 mt-1">
//                   <Globe size={14} />
//                   <span>{profile.location}</span>
//                 </div>
//               )}
//               {profile.bio && (
//                 <p className="text-sm text-cyan-700/80 mt-2">{profile.bio}</p>
//               )}
//             </div>
//           </div>

//           {/* Edit Form */}
//           <AnimatePresence>
//             {isEditing && (
//               <motion.div
//                 initial={{ opacity: 0, height: 0 }}
//                 animate={{ opacity: 1, height: "auto" }}
//                 exit={{ opacity: 0, height: 0 }}
//                 className="mt-4 pt-4 border-t border-cyan-200/30 space-y-3"
//               >
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                   <div>
//                     <label className="text-xs font-bold text-cyan-700/70 block mb-1">Display Name</label>
//                     <input
//                       type="text"
//                       value={editForm.displayName}
//                       onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
//                       className="w-full rounded-lg bg-white/50 px-3 py-2 text-sm text-cyan-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 border-none shadow-inner"
//                     />
//                   </div>
//                   <div>
//                     <label className="text-xs font-bold text-cyan-700/70 block mb-1">Phone Number</label>
//                     <input
//                       type="text"
//                       value={editForm.phoneNumber}
//                       onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
//                       className="w-full rounded-lg bg-white/50 px-3 py-2 text-sm text-cyan-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 border-none shadow-inner"
//                     />
//                   </div>
//                   <div>
//                     <label className="text-xs font-bold text-cyan-700/70 block mb-1">Location</label>
//                     <input
//                       type="text"
//                       value={editForm.location}
//                       onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
//                       className="w-full rounded-lg bg-white/50 px-3 py-2 text-sm text-cyan-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 border-none shadow-inner"
//                     />
//                   </div>
//                   <div>
//                     <label className="text-xs font-bold text-cyan-700/70 block mb-1">Website</label>
//                     <input
//                       type="text"
//                       value={editForm.website}
//                       onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
//                       className="w-full rounded-lg bg-white/50 px-3 py-2 text-sm text-cyan-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 border-none shadow-inner"
//                     />
//                   </div>
//                   <div className="md:col-span-2">
//                     <label className="text-xs font-bold text-cyan-700/70 block mb-1">Bio</label>
//                     <textarea
//                       value={editForm.bio}
//                       onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
//                       rows={2}
//                       className="w-full rounded-lg bg-white/50 px-3 py-2 text-sm text-cyan-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 border-none shadow-inner"
//                     />
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={handleSaveProfile}
//                     disabled={isSaving}
//                     className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
//                   >
//                     {isSaving ? (
//                       <>
//                         <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
//                         Saving...
//                       </>
//                     ) : (
//                       <>
//                         <Save size={16} />
//                         Save Changes
//                       </>
//                     )}
//                   </button>
//                   <button
//                     onClick={handleEditToggle}
//                     className="px-4 py-2 rounded-lg bg-white/30 text-cyan-700 font-bold text-sm hover:bg-white/50 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </motion.div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-2 gap-3 mt-6 md:grid-cols-4">
//           <StatCard
//             label="Portfolio Value"
//             value={profile.stats.portfolioValue}
//             icon={<DollarSign size={20} className="text-cyan-900" />}
//             change={profile.stats.portfolioChange}
//             positive={profile.stats.portfolioChange.startsWith('+')}
//             delay={0}
//           />
//           <StatCard
//             label="Total Bills"
//             value={profile.stats.totalBills}
//             icon={<CreditCard size={20} className="text-cyan-900" />}
//             delay={1}
//           />
//           <StatCard
//             label="Transactions"
//             value={profile.stats.totalTransactions}
//             icon={<Activity size={20} className="text-cyan-900" />}
//             delay={2}
//           />
//           <StatCard
//             label="Role"
//             value={profile.role === "admin" ? "👑 Admin" : "👤 User"}
//             icon={<Shield size={20} className="text-cyan-900" />}
//             delay={3}
//           />
//         </div>

//         {/* Preferences & Actions */}
//         <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-2">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="rounded-2xl bg-[#C4F8FD] p-5 shadow-xl border-none"
//           >
//             <h3 className="text-sm font-semibold text-slate-600 mb-3">Preferences</h3>
//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-cyan-900">Theme</span>
//                 <span className="text-sm font-bold text-cyan-700 capitalize">{profile.preferences.theme}</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-cyan-900">Notifications</span>
//                 <span className={`text-sm font-bold ${profile.preferences.notifications ? 'text-emerald-600' : 'text-red-600'}`}>
//                   {profile.preferences.notifications ? 'Enabled' : 'Disabled'}
//                 </span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-cyan-900">Email Updates</span>
//                 <span className={`text-sm font-bold ${profile.preferences.emailUpdates ? 'text-emerald-600' : 'text-red-600'}`}>
//                   {profile.preferences.emailUpdates ? 'Enabled' : 'Disabled'}
//                 </span>
//               </div>
//             </div>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3 }}
//             className="rounded-2xl bg-[#C4F8FD] p-5 shadow-xl border-none"
//           >
//             <h3 className="text-sm font-semibold text-slate-600 mb-3">Account Actions</h3>
//             <div className="space-y-2">
//               <button className="w-full flex items-center justify-between rounded-lg bg-white/30 px-4 py-2.5 text-sm font-bold text-cyan-900 hover:bg-white/50 transition-colors">
//                 <span className="flex items-center gap-2">
//                   <Settings size={16} />
//                   Settings
//                 </span>
//                 <ChevronRight size={16} />
//               </button>
//               <button className="w-full flex items-center justify-between rounded-lg bg-white/30 px-4 py-2.5 text-sm font-bold text-cyan-900 hover:bg-white/50 transition-colors">
//                 <span className="flex items-center gap-2">
//                   <Shield size={16} />
//                   Privacy & Security
//                 </span>
//                 <ChevronRight size={16} />
//               </button>
//               <button
//                 onClick={handleSignOut}
//                 className="w-full flex items-center justify-between rounded-lg bg-red-500/20 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-500/30 transition-colors"
//               >
//                 <span className="flex items-center gap-2">
//                   <LogOut size={16} />
//                   Sign Out
//                 </span>
//                 <ChevronRight size={16} />
//               </button>
//             </div>
//           </motion.div>
//         </div>

//         {/* Account Info */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.4 }}
//           className="mt-4 rounded-2xl bg-[#C4F8FD] p-5 shadow-xl border-none"
//         >
//           <h3 className="text-sm font-semibold text-slate-600 mb-3">Account Information</h3>
//           <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
//             <div>
//               <p className="text-xs text-cyan-700/60">User ID</p>
//               <p className="text-sm font-bold text-cyan-900 truncate">{user.uid}</p>
//             </div>
//             <div>
//               <p className="text-xs text-cyan-700/60">Email</p>
//               <p className="text-sm font-bold text-cyan-900">{profile.email}</p>
//             </div>
//             <div>
//               <p className="text-xs text-cyan-700/60">Member Since</p>
//               <p className="text-sm font-bold text-cyan-900">
//                 {new Date(profile.createdAt).toLocaleDateString('en-US', {
//                   year: 'numeric',
//                   month: 'long',
//                   day: 'numeric',
//                 })}
//               </p>
//             </div>
//             <div>
//               <p className="text-xs text-cyan-700/60">Last Login</p>
//               <p className="text-sm font-bold text-cyan-900">
//                 {new Date(profile.lastLogin).toLocaleDateString('en-US', {
//                   year: 'numeric',
//                   month: 'long',
//                   day: 'numeric',
//                   hour: '2-digit',
//                   minute: '2-digit',
//                 })}
//               </p>
//             </div>
//           </div>
//         </motion.div>
//       </div>

//       <ChatWidgett />
//       <Iconpack />
//     </div>
//   );
// }
