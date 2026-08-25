// // // app/admin/components/UserAvatar.tsx (update existing)
// // "use client";

// // import { useEffect, useState } from "react";
// // import Image from "next/image";
// // import { Download, Loader2 } from "lucide-react";

// // interface UserAvatarProps {
// //   userId: string;
// //   name: string;
// //   size?: number;
// //   className?: string;
// //   showDownload?: boolean;
// // }

// // const getImageFromIndexedDB = async (userId: string): Promise<string | null> => {
// //   return new Promise((resolve) => {
// //     const request = indexedDB.open('UserImagesDB', 1);
    
// //     request.onsuccess = (event) => {
// //       const db = (event.target as IDBOpenDBRequest).result;
// //       const transaction = db.transaction(['images'], 'readonly');
// //       const store = transaction.objectStore('images');
// //       const getRequest = store.get(userId);
      
// //       getRequest.onsuccess = () => resolve(getRequest.result?.imageData || null);
// //       getRequest.onerror = () => resolve(null);
// //     };
// //     request.onerror = () => resolve(null);
// //   });
// // };

// // export default function UserAvatar({ 
// //   userId, 
// //   name, 
// //   size = 40,
// //   className = "",
// //   showDownload = false,
// // }: UserAvatarProps) {
// //   const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [downloading, setDownloading] = useState(false);

// //   useEffect(() => {
// //     const loadAvatar = async () => {
// //       if (!userId) {
// //         setLoading(false);
// //         return;
// //       }
// //       const url = await getImageFromIndexedDB(userId);
// //       setAvatarUrl(url);
// //       setLoading(false);
// //     };
// //     loadAvatar();
// //   }, [userId]);

// //   const handleDownload = async () => {
// //     if (!avatarUrl) return;
    
// //     setDownloading(true);
// //     try {
// //       const link = document.createElement('a');
// //       link.href = avatarUrl;
// //       link.download = `${name}_avatar.png`;
// //       document.body.appendChild(link);
// //       link.click();
// //       document.body.removeChild(link);
// //     } catch (error) {
// //       console.error("Error downloading:", error);
// //     } finally {
// //       setDownloading(false);
// //     }
// //   };

// //   const initials = name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";

// //   if (loading) {
// //     return (
// //       <div 
// //         className={`animate-pulse rounded-full bg-gray-200 ${className}`}
// //         style={{ width: size, height: size }}
// //       />
// //     );
// //   }

// //   return (
// //     <div className="flex items-center gap-2">
// //       {avatarUrl ? (
// //         <>
// //           <Image
// //             src={avatarUrl}
// //             alt={name}
// //             width={size}
// //             height={size}
// //             className={`rounded-full object-cover ${className}`}
// //           />
// //           {showDownload && (
// //             <button
// //               onClick={handleDownload}
// //               disabled={downloading}
// //               className="rounded-full bg-cyan-500 p-1 text-white hover:bg-cyan-600 transition-colors disabled:opacity-50"
// //               title="Download avatar"
// //             >
// //               {downloading ? (
// //                 <Loader2 size={14} className="animate-spin" />
// //               ) : (
// //                 <Download size={14} />
// //               )}
// //             </button>
// //           )}
// //         </>
// //       ) : (
// //         <div 
// //           className={`flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-semibold ${className}`}
// //           style={{ width: size, height: size, fontSize: size * 0.4 }}
// //         >
// //           {initials}
// //         </div>
// //       )}
// //     </div>
// //   );
// // }































// "use client";

// import { useEffect, useState } from "react";
// import UserAvatar from "./UserAvatar";
// import { Download, ImageIcon, Loader2 } from "lucide-react";

// interface User {
//   _id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   address?: string;
//   hasAvatar?: boolean;
//   createdAt: string;
// }

// export default function UserList() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [downloadingAll, setDownloadingAll] = useState(false);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const response = await fetch('/api/admin/users', {
//           credentials: 'include', // Send session cookie
//         });
//         if (response.ok) {
//           const data = await response.json();
//           setUsers(data.data || data);
//         } else {
//           console.error("Failed to fetch users");
//         }
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchUsers();
//   }, []);

//   // Download single avatar (uses the avatar URL from the component, but we'll use the image data URL)
//   const handleDownloadAvatar = async (userId: string, name: string) => {
//     // Since UserAvatar now fetches from the API, we need to fetch the avatar directly
//     try {
//       const response = await fetch(`/api/user/avatar?userId=${userId}`, {
//         credentials: 'include',
//       });
//       if (!response.ok) throw new Error('Avatar not found');
//       const result = await response.json();
//       const imageData = result.data?.avatar;
//       if (imageData) {
//         const link = document.createElement('a');
//         link.href = imageData;
//         link.download = `${name.replace(/\s+/g, '_')}_avatar.png`;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//       } else {
//         alert(`${name} does not have an avatar`);
//       }
//     } catch (error) {
//       console.error("Error downloading avatar:", error);
//       alert("Failed to download avatar");
//     }
//   };

//   const handleDownloadAllAvatars = async () => {
//     const usersWithAvatars = users.filter(u => u.hasAvatar);
//     if (usersWithAvatars.length === 0) {
//       alert("No users have avatars to download");
//       return;
//     }

//     setDownloadingAll(true);
//     try {
//       for (let i = 0; i < usersWithAvatars.length; i++) {
//         const user = usersWithAvatars[i];
//         const name = `${user.firstName} ${user.lastName}`;
//         await handleDownloadAvatar(user._id, name);
//         await new Promise(resolve => setTimeout(resolve, 500));
//       }
//     } catch (error) {
//       console.error("Error downloading all avatars:", error);
//     } finally {
//       setDownloadingAll(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center p-8">
//         <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
//       </div>
//     );
//   }

//   const avatarCount = users.filter(u => u.hasAvatar).length;

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-col gap-3 rounded-xl bg-white/80 p-4 shadow-lg backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h2 className="text-lg font-bold text-gray-900">Users</h2>
//           <p className="text-sm text-gray-500">
//             {users.length} total users · {avatarCount} have avatars
//           </p>
//         </div>
//         {avatarCount > 0 && (
//           <button
//             onClick={handleDownloadAllAvatars}
//             disabled={downloadingAll}
//             className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-600 transition-colors disabled:opacity-50"
//           >
//             {downloadingAll ? (
//               <Loader2 size={16} className="animate-spin" />
//             ) : (
//               <Download size={16} />
//             )}
//             Download All Avatars ({avatarCount})
//           </button>
//         )}
//       </div>

//       <div className="overflow-x-auto rounded-xl bg-white/80 shadow-lg backdrop-blur-sm">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50/80">
//             <tr>
//               <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">User</th>
//               <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell sm:px-6">Email</th>
//               <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell sm:px-6">Phone</th>
//               <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell sm:px-6">Joined</th>
//               <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">Avatar</th>
//               <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">Action</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200 bg-white">
//             {users.map((user) => {
//               const fullName = `${user.firstName} ${user.lastName}`;
//               return (
//                 <tr key={user._id} className="hover:bg-gray-50/50">
//                   <td className="whitespace-nowrap px-4 py-4 sm:px-6">
//                     <div className="flex items-center gap-3">
//                       <UserAvatar
//                         userId={user._id}
//                         name={fullName}
//                         size={40}
//                         showDownload={false}
//                       />
//                       <div>
//                         <div className="text-sm font-medium text-gray-900">{fullName}</div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-gray-500 sm:table-cell sm:px-6">
//                     {user.email}
//                   </td>
//                   <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-gray-500 sm:table-cell sm:px-6">
//                     {user.phone || "—"}
//                   </td>
//                   <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-gray-500 md:table-cell sm:px-6">
//                     {new Date(user.createdAt).toLocaleDateString()}
//                   </td>
//                   <td className="whitespace-nowrap px-4 py-4 sm:px-6">
//                     {user.hasAvatar ? (
//                       <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
//                         <ImageIcon size={12} className="mr-1" />
//                         Uploaded
//                       </span>
//                     ) : (
//                       <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
//                         None
//                       </span>
//                     )}
//                   </td>
//                   <td className="whitespace-nowrap px-4 py-4 sm:px-6">
//                     {user.hasAvatar && (
//                       <button
//                         onClick={() => handleDownloadAvatar(user._id, fullName)}
//                         className="flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-800 transition-colors"
//                       >
//                         <Download size={14} />
//                         Download
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {users.length === 0 && (
//         <div className="rounded-xl bg-white/80 p-8 text-center shadow-lg backdrop-blur-sm">
//           <p className="text-gray-500">No users found</p>
//         </div>
//       )}
//     </div>
//   );
// }