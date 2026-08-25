// "use client";

// import { useEffect, useState } from "react";
// import UserAvatar from "./UserAvatar";
// import { Loader2 } from "lucide-react";

// interface UserCurrentAvatarProps {
//   size?: number;
//   className?: string;
//   showDownload?: boolean;
//   onDownload?: (userId: string, name: string) => void;
// }

// const fetchCurrentUserProfile = async () => {
//   const response = await fetch('/api/user/profile', {
//     credentials: 'include',
//   });
//   if (!response.ok) {
//     throw new Error('Failed to fetch profile');
//   }
//   const result = await response.json();
//   return result.data;
// };

// export default function CurrentUserAvatar({
//   size = 40,
//   className = "",
//   showDownload = false,
//   onDownload,
// }: UserCurrentAvatarProps) {
//   const [user, setUser] = useState<{ id: string; name: string } | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const profile = await fetchCurrentUserProfile();
//         // Build display name: displayName → first+last → username → fallback
//         const displayName =
//           profile.displayName ||
//           `${profile.firstName} ${profile.lastName}`.trim() ||
//           profile.username ||
//           "User";
//         setUser({ id: profile.id, name: displayName });
//       } catch (error) {
//         console.error('Failed to load current user:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadUser();
//   }, []);

//   if (loading) {
//     return (
//       <div
//         className={`rounded-full bg-gray-200 flex items-center justify-center ${className}`}
//         style={{ width: size, height: size }}
//       >
//         <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
//       </div>
//     );
//   }

//   if (!user) {
//     // If loading fails, show a fallback (e.g., an empty circle or a default icon)
//     return (
//       <div
//         className={`rounded-full bg-gray-300 flex items-center justify-center ${className}`}
//         style={{ width: size, height: size }}
//       >
//         <span className="text-gray-500 text-xs">?</span>
//       </div>
//     );
//   }

//   return (
//     <UserAvatar
//       userId={user.id}
//       name={user.name}
//       size={size}
//       className={className}
//       showDownload={showDownload}
//       onDownload={onDownload}
//     />
//   );
// }