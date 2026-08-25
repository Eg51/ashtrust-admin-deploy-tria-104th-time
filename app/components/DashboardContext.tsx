// // @/app/context/DashboardContext.tsx
// "use client";

// import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
// import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
// import { onAuthStateChanged } from "firebase/auth";
// import { useRouter } from "next/navigation";

// // --- Types ---
// interface Transaction {
//   id: string; merchant: string; type: string; category: string;
//   date: string; status: "completed" | "pending" | "failed";
//   amount: string; isNegative: boolean; icon: React.ReactNode;
// }
// interface UpcomingBill { id: string; name: string; dueIn: string; amount: string; category: string; }
// interface Asset {
//   id: string; name: string; symbol: string; type: "crypto" | "stock" | "etf" | "commodity";
//   price: number; change: number; changePercent: number; volume: string; marketCap?: string;
//   description: string; icon: React.ReactNode; color: string; bgGradient: string;
//   isGold?: boolean; isTrending?: boolean; isNew?: boolean; historicalData?: number[];
//   sector?: string; dividend?: string; peRatio?: number; yearHigh?: number; yearLow?: number;
// }
// interface UserDashboardData {
//   portfolioValue: string; portfolioChange: string; transactions: Transaction[];
//   upcomingBills: UpcomingBill[]; quickContacts: { id: string; name: string; avatar: string; initials: string }[];
//   spendingCategories: { name: string; percentage: number; color: string }[];
//   watchlist: string[]; investments: { assetId: string; amount: number; purchasePrice: number; date: string }[];
//   recentBills: UpcomingBill[];
// }

// // --- Default Data & Assets ---
// const defaultTransactions = [ /* ... copy your defaultTransactions from page.tsx here ... */ ]; 
// const defaultUpcomingBills = [ /* ... copy your defaultUpcomingBills ... */ ];
// const defaultRecentBills = [ /* ... copy your defaultRecentBills ... */ ];
// const defaultQuickContacts = [ /* ... copy your defaultQuickContacts ... */ ];
// const defaultSpendingCategories = [ /* ... copy your defaultSpendingCategories ... */ ];
// const getFixedHistoricalData = (basePrice: number, points: number = 20): number[] => {
//   const data: number[] = []; let price = basePrice;
//   for (let i = 0; i < points; i++) {
//     const variation = Math.sin(i * 0.5 + basePrice) * basePrice * 0.02;
//     price = Math.max(price + variation, basePrice * 0.7); data.push(price);
//   }
//   return data;
// };
// export const availableAssets: Asset[] = [
//   /* ... copy your entire availableAssets array from page.tsx here ... */
// ];

// // --- Context Definition ---
// interface DashboardContextType {
//   user: any;
//   userName: string;
//   greeting: React.ReactNode;
//   dashboardData: UserDashboardData;
//   loading: boolean;
//   handlePortfolioUpdate: (newValue: string, newChange: string) => void;
//   handleAddInvestment: (assetId: string, amount: number) => void;
//   handleRecentBillsUpdate: (newBills: UpcomingBill[]) => void;
//   handleUpcomingBillsUpdate: (newBills: UpcomingBill[]) => void;
// }

// const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// export function DashboardProvider({ children }: { children: React.ReactNode }) {
//   const router = useRouter();
//   const [user, setUser] = useState<any>(null);
//   const [userName, setUserName] = useState("User");
//   const [loading, setLoading] = useState(true);
//   const [greeting, setGreeting] = useState<React.ReactNode>("Hello");
//   const [firebaseModules, setFirebaseModules] = useState<{ auth: any; db: any } | null>(null);
//   const [dashboardData, setDashboardData] = useState<UserDashboardData>({
//     portfolioValue: "$0.00", portfolioChange: "0.0%", transactions: defaultTransactions,
//     upcomingBills: defaultUpcomingBills, quickContacts: defaultQuickContacts,
//     spendingCategories: defaultSpendingCategories, watchlist: [], investments: [], recentBills: defaultRecentBills,
//   });
//   const isMounted = useRef(true);
//   const dataLoaded = useRef(false);

//   // --- 1. Init Firebase & Auth ---
//   useEffect(() => {
//     isMounted.current = true;
//     const loadFirebase = async () => {
//       try {
//         const { auth, db } = await import("@/lib/firebase");
//         if (isMounted.current) setFirebaseModules({ auth, db });
//       } catch (error) { console.error("Failed to load Firebase modules:", error); }
//     };
//     loadFirebase();
//     return () => { isMounted.current = false; };
//   }, []);

//   useEffect(() => {
//     if (!firebaseModules) return;
//     const { auth, db } = firebaseModules;
//     let unsubscribeAuth: (() => void) | undefined;

//     const initAuth = async () => {
//       unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
//         if (!isMounted.current) return;
//         if (authUser) {
//           setUser(authUser);
//           const name = authUser.displayName || (authUser.email ? authUser.email.split('@')[0] : 'User');
//           setUserName(name);
//           setGreeting(getTimeBasedGreeting(name));

//           // ADMIN CHECK
//           try {
//             const userDocRef = doc(db, "users", authUser.uid);
//             const userDoc = await getDoc(userDocRef);
//             if (userDoc.exists() && userDoc.data().role === "admin") {
//               router.replace("/me"); return;
//             }
//             if (!dataLoaded.current) {
//               await loadUserDashboard(authUser.uid, db);
//               dataLoaded.current = true;
//             }
//           } catch (error) { console.error("Error checking user role:", error); }
//         } else {
//           if (typeof window !== 'undefined') router.replace("/log-in");
//         }
//         setLoading(false);
//       });
//     };
//     initAuth();
//     return () => { if (unsubscribeAuth) unsubscribeAuth(); };
//   }, [firebaseModules, router]);

//   const loadUserDashboard = async (userId: string, db: any) => {
//     try {
//       const userDocRef = doc(db, "users", userId);
//       const userDoc = await getDoc(userDocRef);
//       if (!isMounted.current) return;

//       if (userDoc.exists()) {
//         const data = userDoc.data();
//         if (data.dashboardData) {
//           setDashboardData(data.dashboardData);
//         } else {
//           const defaultData = { /* ... same defaultData structure ... */ };
//           await setDoc(userDocRef, { dashboardData: defaultData, updatedAt: serverTimestamp() }, { merge: true });
//           setDashboardData(defaultData as any);
//         }
//       }
//     } catch (error) { console.error("Error loading dashboard:", error); }
//   };

//   // --- 2. Handlers ---
//   const handlePortfolioUpdate = useCallback((newValue: string, newChange: string) => {
//     setDashboardData((prev) => ({ ...prev, portfolioValue: newValue, portfolioChange: newChange }));
//     if (user && isMounted.current && firebaseModules) {
//       updateDoc(doc(firebaseModules.db, "users", user.uid), {
//         "dashboardData.portfolioValue": newValue, "dashboardData.portfolioChange": newChange, updatedAt: serverTimestamp()
//       }).catch(console.error);
//     }
//   }, [user, firebaseModules]);

//   const handleAddInvestment = useCallback((assetId: string, amount: number) => {
//     const asset = availableAssets.find(a => a.id === assetId);
//     if (!asset || !isMounted.current) return;
//     const newInvestment = { assetId, amount, purchasePrice: asset.price, date: new Date().toISOString() };
//     setDashboardData((prev) => {
//       const currentValue = parseFloat(prev.portfolioValue.replace(/[^0-9.]/g, ""));
//       const newValue = currentValue + amount;
//       const formattedValue = `$${newValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
//       const change = ((newValue - currentValue) / (currentValue || 1)) * 100;
//       const changeFormatted = change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
//       return { ...prev, investments: [...(prev.investments || []), newInvestment], portfolioValue: formattedValue, portfolioChange: changeFormatted };
//     });
//     if (user && isMounted.current && firebaseModules) {
//       updateDoc(doc(firebaseModules.db, "users", user.uid), {
//         "dashboardData.investments": [...(dashboardData.investments || []), newInvestment],
//         "dashboardData.portfolioValue": dashboardData.portfolioValue,
//         "dashboardData.portfolioChange": dashboardData.portfolioChange,
//         updatedAt: serverTimestamp()
//       }).catch(console.error);
//     }
//   }, [user, firebaseModules, dashboardData.portfolioValue, dashboardData.portfolioChange, dashboardData.investments]);

//   const handleRecentBillsUpdate = useCallback((newBills: UpcomingBill[]) => {
//     setDashboardData((prev) => ({ ...prev, recentBills: newBills }));
//     if (user && isMounted.current && firebaseModules) {
//       updateDoc(doc(firebaseModules.db, "users", user.uid), {
//         "dashboardData.recentBills": newBills, updatedAt: serverTimestamp()
//       }).catch(console.error);
//     }
//   }, [user, firebaseModules]);

//   const handleUpcomingBillsUpdate = useCallback((newBills: UpcomingBill[]) => {
//     setDashboardData((prev) => ({ ...prev, upcomingBills: newBills }));
//     if (user && isMounted.current && firebaseModules) {
//       updateDoc(doc(firebaseModules.db, "users", user.uid), {
//         "dashboardData.upcomingBills": newBills, updatedAt: serverTimestamp()
//       }).catch(console.error);
//     }
//   }, [user, firebaseModules]);

//   // --- 3. Time Greeting Helper ---
//   const getTimeBasedGreeting = (userName: string): React.ReactNode => {
//     const hour = new Date().getHours();
//     let greeting = "Hello"; let icon: React.ReactNode = null; 
//     // ... copy your existing getTimeBasedGreeting logic here ...
//     return <span>{greeting} {userName}</span>;
//   };

//   // --- Context Value ---
//   const contextValue: DashboardContextType = {
//     user, userName, greeting, dashboardData, loading,
//     handlePortfolioUpdate, handleAddInvestment, handleRecentBillsUpdate, handleUpcomingBillsUpdate
//   };

//   return (
//     <DashboardContext.Provider value={contextValue}>
//       {children}
//     </DashboardContext.Provider>
//   );
// }

// export const useDashboard = () => {
//   const context = useContext(DashboardContext);
//   if (!context) throw new Error("useDashboard must be used within a DashboardProvider");
//   return context;
// };