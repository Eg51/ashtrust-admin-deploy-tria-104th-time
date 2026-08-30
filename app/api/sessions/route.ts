// // app/api/sessions/route.ts
// import { NextResponse } from 'next/server';
// import { getUserFromRequest } from '@/lib/auth';
// import { connectToDatabase } from '@/lib/mongodb';

// export const runtime = 'nodejs';

// export async function GET(request: Request) {
//   try {
//     const user = getUserFromRequest(request);
//     if (!user?.id) {
//       return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
//     }

//     if (user.role !== 'admin' && user.role !== 'Administrator') {
//       return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
//     }

//     const { db } = await connectToDatabase();
//     const sessionsCollection = db.collection('sessions');

//     // ✅ Get all sessions, grouped by userId (latest first)
//     const pipeline = [
//       {
//         $sort: { timestamp: -1 }
//       },
//       {
//         $group: {
//           _id: '$userId',
//           latestSession: { $first: '$$ROOT' }
//         }
//       },
//       {
//         $replaceRoot: { newRoot: '$latestSession' }
//       },
//       {
//         $sort: { timestamp: -1 }
//       },
//       {
//         $limit: 50
//       }
//     ];

//     const sessions = await sessionsCollection.aggregate(pipeline).toArray();

//     if (!sessions || sessions.length === 0) {
//       return NextResponse.json({ 
//         success: true, 
//         data: [],
//         message: 'No sessions found'
//       });
//     }

//     // ✅ Format sessions for display with proper date handling
//     const formattedSessions = sessions.map((session: any) => {
//       // ✅ Safely parse timeIn
//       let timeIn = 'N/A';
//       let timeInDate = null;
      
//       if (session.timeIn) {
//         try {
//           timeInDate = new Date(session.timeIn);
//           if (!isNaN(timeInDate.getTime())) {
//             timeIn = timeInDate.toLocaleString();
//           }
//         } catch (e) {
//           // If parsing fails, keep 'N/A'
//         }
//       }

//       // ✅ Safely parse timeOut
//       let timeOut = 'Active';
//       let timeOutDate = null;
      
//       if (session.timeOut) {
//         try {
//           timeOutDate = new Date(session.timeOut);
//           if (!isNaN(timeOutDate.getTime())) {
//             timeOut = timeOutDate.toLocaleString();
//           }
//         } catch (e) {
//           // If parsing fails, keep 'Active'
//         }
//       }

//       // ✅ Safely calculate timeSpent
//       let timeSpent = '0s';
//       if (timeInDate && timeOutDate && !isNaN(timeInDate.getTime()) && !isNaN(timeOutDate.getTime())) {
//         const diffSeconds = Math.floor((timeOutDate.getTime() - timeInDate.getTime()) / 1000);
//         if (diffSeconds > 0) {
//           timeSpent = formatTimeSpent(diffSeconds);
//         }
//       } else if (session.timeSpent) {
//         // Try to parse existing timeSpent if it's a number
//         const parsed = parseInt(session.timeSpent);
//         if (!isNaN(parsed) && parsed > 0) {
//           timeSpent = formatTimeSpent(parsed);
//         }
//       }

//       // ✅ Determine if session is active
//       const isActive = !session.timeOut || new Date(session.timeOut).getTime() > Date.now();

//       return {
//         _id: session._id,
//         userId: session.userId,
//         username: session.username || session.displayName || 'Unknown',
//         email: session.email || 'No email',
//         avatar: session.avatar || null,
//         ip: session.ipAddress || session.ip || 'Unknown',
//         country: session.country || session.location || 'Unknown',
//         deviceInfo: session.deviceInfo || session.userAgent || 'Unknown Device',
//         timeIn: timeIn,
//         timeOut: timeOut,
//         timeSpent: timeSpent,
//         visitCount: session.visitCount || 1,
//         isActive: isActive,
//         lastUpdated: session.lastUpdated || session.updatedAt
//       };
//     });

//     return NextResponse.json({ 
//       success: true, 
//       data: formattedSessions,
//       count: formattedSessions.length
//     });
//   } catch (error) {
//     console.error('Error fetching sessions:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to fetch sessions' },
//       { status: 500 }
//     );
//   }
// }

// // ✅ Helper function to format time spent
// function formatTimeSpent(seconds: number): string {
//   if (!seconds || seconds <= 0) return '0s';
  
//   if (seconds < 60) {
//     return `${seconds}s`;
//   } else if (seconds < 3600) {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
//   } else {
//     const hours = Math.floor(seconds / 3600);
//     const mins = Math.floor((seconds % 3600) / 60);
//     return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
//   }
// }

// // app/api/sessions/route.ts
// import { NextResponse } from 'next/server';
// import { getUserFromRequest } from '@/lib/auth';
// import { connectToDatabase } from '@/lib/mongodb';

// export const runtime = 'nodejs';

// export async function GET(request: Request) {
//   try {
//     const user = getUserFromRequest(request);
//     if (!user?.id) {
//       return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
//     }

//     if (user.role !== 'admin' && user.role !== 'Administrator') {
//       return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
//     }

//     const { db } = await connectToDatabase();
//     const sessionsCollection = db.collection('sessions');
//     const usersCollection = db.collection('users'); // ✅ Get the users collection

//     // ✅ Get all sessions, grouped by userId (latest first)
//     const pipeline = [
//       { $sort: { timestamp: -1 } },
//       { $group: { _id: '$userId', latestSession: { $first: '$$ROOT' } } },
//       { $replaceRoot: { newRoot: '$latestSession' } },
//       { $sort: { timestamp: -1 } },
//       { $limit: 50 }
//     ];

//     const sessions = await sessionsCollection.aggregate(pipeline).toArray();

//     if (!sessions || sessions.length === 0) {
//       return NextResponse.json({ success: true, data: [], message: 'No sessions found' });
//     }

//     // ✅ FETCH REAL USERS based on session userIds
//     const userIds = sessions.map((s: any) => s.userId).filter(Boolean);
//     let usersMap: Record<string, any> = {};
//     if (userIds.length > 0) {
//       const realUsers = await usersCollection.find({ _id: { $in: userIds } }).toArray();
//       usersMap = realUsers.reduce((acc: any, u: any) => {
//         acc[u._id.toString()] = u;
//         return acc;
//       }, {});
//     }

//     // ✅ Format sessions for display
//     const formattedSessions = sessions.map((session: any) => {
//       const realUser = usersMap[session.userId];

//       // Parse timeIn
//       let timeIn = 'N/A';
//       let timeInDate = null;
//       if (session.timeIn) {
//         try {
//           timeInDate = new Date(session.timeIn);
//           if (!isNaN(timeInDate.getTime())) timeIn = timeInDate.toLocaleString();
//         } catch (e) {}
//       }

//       // Parse timeOut
//       let timeOut = 'Active';
//       let timeOutDate = null;
//       if (session.timeOut) {
//         try {
//           timeOutDate = new Date(session.timeOut);
//           if (!isNaN(timeOutDate.getTime())) timeOut = timeOutDate.toLocaleString();
//         } catch (e) {}
//       }

//       // Calculate timeSpent
//       let timeSpent = '0s';
//       if (timeInDate && timeOutDate && !isNaN(timeInDate.getTime()) && !isNaN(timeOutDate.getTime())) {
//         const diffSeconds = Math.floor((timeOutDate.getTime() - timeInDate.getTime()) / 1000);
//         if (diffSeconds > 0) timeSpent = formatTimeSpent(diffSeconds);
//       } else if (session.timeSpent) {
//         const parsed = parseInt(session.timeSpent);
//         if (!isNaN(parsed) && parsed > 0) timeSpent = formatTimeSpent(parsed);
//       }

//       const isActive = !session.timeOut || new Date(session.timeOut).getTime() > Date.now();

//       // ✅ MERGE DATA: Pull real user info if it exists, otherwise fallback to session data
//       return {
//         _id: session._id,
//         userId: session.userId,
//         username: realUser?.username || realUser?.displayName || session.username || session.displayName || 'Unknown',
//         email: realUser?.email || session.email || 'No email', // ✅ Uses the real user's email
//         avatar: realUser?.avatar || session.avatar || null,
//         ip: session.ipAddress || session.ip || 'Unknown',
//         country: session.country || session.location || 'Unknown',
//         deviceInfo: session.deviceInfo || session.userAgent || 'Unknown Device',
//         timeIn: timeIn,
//         timeOut: timeOut,
//         timeSpent: timeSpent,
//         visitCount: session.visitCount || 1,
//         isActive: isActive,
//         lastUpdated: session.lastUpdated || session.updatedAt
//       };
//     });

//     return NextResponse.json({ success: true, data: formattedSessions, count: formattedSessions.length });
//   } catch (error) {
//     console.error('Error fetching sessions:', error);
//     return NextResponse.json({ success: false, error: 'Failed to fetch sessions' }, { status: 500 });
//   }
// }

// function formatTimeSpent(seconds: number): string {
//   if (!seconds || seconds <= 0) return '0s';
//   if (seconds < 60) return `${seconds}s`;
//   if (seconds < 3600) {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
//   }
//   const hours = Math.floor(seconds / 3600);
//   const mins = Math.floor((seconds % 3600) / 60);
//   return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
// }


// // app/api/sessions/route.ts
// import { NextResponse } from 'next/server';
// import { getUserFromRequest } from '@/lib/auth';
// import { connectToDatabase } from '@/lib/mongodb';
// import { ObjectId } from 'mongodb'; // ✅ ADD THIS IMPORT

// export const runtime = 'nodejs';

// export async function GET(request: Request) {
//   try {
//     const user = getUserFromRequest(request);
//     if (!user?.id) {
//       return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
//     }

//     if (user.role !== 'admin' && user.role !== 'Administrator') {
//       return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
//     }

//     const { db } = await connectToDatabase();
//     const sessionsCollection = db.collection('sessions');
//     const usersCollection = db.collection('users'); 

//     // ✅ Get all sessions, grouped by userId (latest first)
//     const pipeline = [
//       { $sort: { timestamp: -1 } },
//       { $group: { _id: '$userId', latestSession: { $first: '$$ROOT' } } },
//       { $replaceRoot: { newRoot: '$latestSession' } },
//       { $sort: { timestamp: -1 } },
//       { $limit: 50 }
//     ];

//     const sessions = await sessionsCollection.aggregate(pipeline).toArray();

//     if (!sessions || sessions.length === 0) {
//       return NextResponse.json({ success: true, data: [], message: 'No sessions found' });
//     }

//     // ✅ FETCH REAL USERS based on session userIds
//     const userIds = sessions.map((s: any) => s.userId).filter(Boolean);

//     // ✅ Convert strings to ObjectIds so MongoDB can find the users
//     const validObjectIds = userIds
//       .filter((id: string) => ObjectId.isValid(id))
//       .map((id: string) => new ObjectId(id));

//     let usersMap: Record<string, any> = {};
//     if (validObjectIds.length > 0) {
//       const realUsers = await usersCollection.find({ _id: { $in: validObjectIds } }).toArray();
//       usersMap = realUsers.reduce((acc: any, u: any) => {
//         acc[u._id.toString()] = u; // Convert ObjectId back to string for lookup
//         return acc;
//       }, {});
//     }

//     // ✅ Format sessions for display
//     const formattedSessions = sessions.map((session: any) => {
//       const realUser = usersMap[session.userId];

//       // Parse timeIn
//       let timeIn = 'N/A';
//       let timeInDate = null;
//       if (session.timeIn) {
//         try {
//           timeInDate = new Date(session.timeIn);
//           if (!isNaN(timeInDate.getTime())) timeIn = timeInDate.toLocaleString();
//         } catch (e) {}
//       }

//       // Parse timeOut
//       let timeOut = 'Active';
//       let timeOutDate = null;
//       if (session.timeOut) {
//         try {
//           timeOutDate = new Date(session.timeOut);
//           if (!isNaN(timeOutDate.getTime())) timeOut = timeOutDate.toLocaleString();
//         } catch (e) {}
//       }

//       // Calculate timeSpent
//       let timeSpent = '0s';
//       if (timeInDate && timeOutDate && !isNaN(timeInDate.getTime()) && !isNaN(timeOutDate.getTime())) {
//         const diffSeconds = Math.floor((timeOutDate.getTime() - timeInDate.getTime()) / 1000);
//         if (diffSeconds > 0) timeSpent = formatTimeSpent(diffSeconds);
//       } else if (session.timeSpent) {
//         const parsed = parseInt(session.timeSpent);
//         if (!isNaN(parsed) && parsed > 0) timeSpent = formatTimeSpent(parsed);
//       }

//       const isActive = !session.timeOut || new Date(session.timeOut).getTime() > Date.now();

//       // ✅ MERGE DATA: Pull real user info if it exists, otherwise fallback to session data
//       return {
//         _id: session._id,
//         userId: session.userId,
//         username: realUser?.username || realUser?.displayName || session.username || session.displayName || 'Unknown',
//         email: realUser?.email || session.email || 'No email', // ✅ Uses the real user's email
//         avatar: realUser?.avatar || session.avatar || null,
//         ip: session.ipAddress || session.ip || 'Unknown',
//         country: session.country || session.location || 'Unknown',
//         deviceInfo: session.deviceInfo || session.userAgent || 'Unknown Device',
//         timeIn: timeIn,
//         timeOut: timeOut,
//         timeSpent: timeSpent,
//         visitCount: session.visitCount || 1,
//         isActive: isActive,
//         lastUpdated: session.lastUpdated || session.updatedAt
//       };
//     });

//     return NextResponse.json({ success: true, data: formattedSessions, count: formattedSessions.length });
//   } catch (error) {
//     console.error('Error fetching sessions:', error);
//     return NextResponse.json({ success: false, error: 'Failed to fetch sessions' }, { status: 500 });
//   }
// }

// function formatTimeSpent(seconds: number): string {
//   if (!seconds || seconds <= 0) return '0s';
//   if (seconds < 60) return `${seconds}s`;
//   if (seconds < 3600) {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
//   }
//   const hours = Math.floor(seconds / 3600);
//   const mins = Math.floor((seconds % 3600) / 60);
//   return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
// }

// // app/api/sessions/route.ts
// import { NextResponse } from 'next/server';
// import { getUserFromRequest } from '@/lib/auth';
// import { connectToDatabase } from '@/lib/mongodb';

// export const runtime = 'nodejs';

// export async function GET(request: Request) {
//   try {
//     const user = getUserFromRequest(request);
//     if (!user?.id) {
//       return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
//     }

//     if (user.role !== 'admin' && user.role !== 'Administrator') {
//       return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
//     }

//     const { db } = await connectToDatabase();
//     const sessionsCollection = db.collection('sessions');

//     // ✅ Get all sessions, grouped by userId (latest first), 
//     // AND use $lookup to automatically fetch the real user data
//     const pipeline = [
//       { $sort: { timestamp: -1 } },
//       { $group: { _id: '$userId', latestSession: { $first: '$$ROOT' } } },
//       { $replaceRoot: { newRoot: '$latestSession' } },
//       { $sort: { timestamp: -1 } },
//       { $limit: 50 },
//       // ✅ THE FIX: Use $lookup to join with the users collection
//       {
//         $lookup: {
//           from: 'users',              // The name of your users collection
//           localField: 'userId',       // The string ID in the session
//           foreignField: '_id',        // The ObjectId in the users collection
//           as: 'userData'
//         }
//       },
//       // ✅ Unwind the array so we can access it easily
//       { $unwind: { path: '$userData', preserveNullAndEmptyArrays: true } }
//     ];

//     const sessions = await sessionsCollection.aggregate(pipeline).toArray();

//     if (!sessions || sessions.length === 0) {
//       return NextResponse.json({ success: true, data: [], message: 'No sessions found' });
//     }

//     // ✅ Format sessions for display
//     const formattedSessions = sessions.map((session: any) => {
//       // Now, session.userData contains the real user if they exist, or null if they don't
//       const realUser = session.userData;

//       // Parse timeIn
//       let timeIn = 'N/A';
//       let timeInDate = null;
//       if (session.timeIn) {
//         try {
//           timeInDate = new Date(session.timeIn);
//           if (!isNaN(timeInDate.getTime())) timeIn = timeInDate.toLocaleString();
//         } catch (e) {}
//       }

//       // Parse timeOut
//       let timeOut = 'Active';
//       let timeOutDate = null;
//       if (session.timeOut) {
//         try {
//           timeOutDate = new Date(session.timeOut);
//           if (!isNaN(timeOutDate.getTime())) timeOut = timeOutDate.toLocaleString();
//         } catch (e) {}
//       }

//       // Calculate timeSpent
//       let timeSpent = '0s';
//       if (timeInDate && timeOutDate && !isNaN(timeInDate.getTime()) && !isNaN(timeOutDate.getTime())) {
//         const diffSeconds = Math.floor((timeOutDate.getTime() - timeInDate.getTime()) / 1000);
//         if (diffSeconds > 0) timeSpent = formatTimeSpent(diffSeconds);
//       } else if (session.timeSpent) {
//         const parsed = parseInt(session.timeSpent);
//         if (!isNaN(parsed) && parsed > 0) timeSpent = formatTimeSpent(parsed);
//       }

//       const isActive = !session.timeOut || new Date(session.timeOut).getTime() > Date.now();

//       // ✅ MERGE DATA: Pull real user info, otherwise fallback to session data
//       return {
//         _id: session._id,
//         userId: session.userId,
//         // ✅ Now it pulls directly from realUser (which is session.userData)
//         username: realUser?.username || realUser?.displayName || session.username || session.displayName || 'Unknown',
//         email: realUser?.email || session.email || 'No email', 
//         avatar: realUser?.avatar || session.avatar || null,
//         ip: session.ipAddress || session.ip || 'Unknown',
//         country: session.country || session.location || 'Unknown',
//         deviceInfo: session.deviceInfo || session.userAgent || 'Unknown Device',
//         timeIn: timeIn,
//         timeOut: timeOut,
//         timeSpent: timeSpent,
//         visitCount: session.visitCount || 1,
//         isActive: isActive,
//         lastUpdated: session.lastUpdated || session.updatedAt
//       };
//     });

//     return NextResponse.json({ success: true, data: formattedSessions, count: formattedSessions.length });
//   } catch (error) {
//     console.error('Error fetching sessions:', error);
//     return NextResponse.json({ success: false, error: 'Failed to fetch sessions' }, { status: 500 });
//   }
// }

// function formatTimeSpent(seconds: number): string {
//   if (!seconds || seconds <= 0) return '0s';
//   if (seconds < 60) return `${seconds}s`;
//   if (seconds < 3600) {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
//   }
//   const hours = Math.floor(seconds / 3600);
//   const mins = Math.floor((seconds % 3600) / 60);
//   return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
// }




// // app/api/sessions/route.ts
// import { NextResponse } from 'next/server';
// import { getUserFromRequest } from '@/lib/auth';
// import { connectToDatabase } from '@/lib/mongodb';

// export const runtime = 'nodejs';

// export async function GET(request: Request) {
//   try {
//     const user = getUserFromRequest(request);
//     if (!user?.id) {
//       return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
//     }

//     if (user.role !== 'admin' && user.role !== 'Administrator') {
//       return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
//     }

//     const { db } = await connectToDatabase();
//     const sessionsCollection = db.collection('sessions');

//     // ✅ Get all sessions, grouped by userId (latest first), 
//     // AND use $lookup to automatically fetch the real user data
//     const pipeline = [
//       { $sort: { timestamp: -1 } },
//       { $group: { _id: '$userId', latestSession: { $first: '$$ROOT' } } },
//       { $replaceRoot: { newRoot: '$latestSession' } },
//       { $sort: { timestamp: -1 } },
//       { $limit: 50 },
//       // ✅ THE FIX: Use $lookup to join with the users collection
//       {
//         $lookup: {
//           from: 'users',              // The name of your users collection
//           localField: 'userId',       // The string ID in the session
//           foreignField: '_id',        // The ObjectId in the users collection
//           as: 'userData'
//         }
//       },
//       // ✅ Unwind the array so we can access it easily
//       { $unwind: { path: '$userData', preserveNullAndEmptyArrays: true } }
//     ];

//     const sessions = await sessionsCollection.aggregate(pipeline).toArray();

//     if (!sessions || sessions.length === 0) {
//       return NextResponse.json({ success: true, data: [], message: 'No sessions found' });
//     }

//     // ✅ Format sessions for display
//     const formattedSessions = sessions.map((session: any) => {
//       // Now, session.userData contains the real user if they exist, or null if they don't
//       const realUser = session.userData;

//       // Parse timeIn
//       let timeIn = 'N/A';
//       let timeInDate = null;
//       if (session.timeIn) {
//         try {
//           timeInDate = new Date(session.timeIn);
//           if (!isNaN(timeInDate.getTime())) timeIn = timeInDate.toLocaleString();
//         } catch (e) {}
//       }

//       // Parse timeOut
//       let timeOut = 'Active';
//       let timeOutDate = null;
//       if (session.timeOut) {
//         try {
//           timeOutDate = new Date(session.timeOut);
//           if (!isNaN(timeOutDate.getTime())) timeOut = timeOutDate.toLocaleString();
//         } catch (e) {}
//       }

//       // Calculate timeSpent
//       let timeSpent = '0s';
//       if (timeInDate && timeOutDate && !isNaN(timeInDate.getTime()) && !isNaN(timeOutDate.getTime())) {
//         const diffSeconds = Math.floor((timeOutDate.getTime() - timeInDate.getTime()) / 1000);
//         if (diffSeconds > 0) timeSpent = formatTimeSpent(diffSeconds);
//       } else if (session.timeSpent) {
//         const parsed = parseInt(session.timeSpent);
//         if (!isNaN(parsed) && parsed > 0) timeSpent = formatTimeSpent(parsed);
//       }

//       const isActive = !session.timeOut || new Date(session.timeOut).getTime() > Date.now();

//       // ✅ MERGE DATA: Pull real user info, otherwise fallback to session data
//       return {
//         _id: session._id,
//         userId: session.userId,
//         // ✅ Now it pulls directly from realUser (which is session.userData)
//         username: realUser?.username || realUser?.displayName || session.username || session.displayName || 'Unknown',
//         email: realUser?.email || session.email || 'No email', 
//         avatar: realUser?.avatar || session.avatar || null,
//         ip: session.ipAddress || session.ip || 'Unknown',
//         country: session.country || session.location || 'Unknown',
//         deviceInfo: session.deviceInfo || session.userAgent || 'Unknown Device',
//         timeIn: timeIn,
//         timeOut: timeOut,
//         timeSpent: timeSpent,
//         visitCount: session.visitCount || 1,
//         isActive: isActive,
//         lastUpdated: session.lastUpdated || session.updatedAt
//       };
//     });

//     return NextResponse.json({ success: true, data: formattedSessions, count: formattedSessions.length });
//   } catch (error) {
//     console.error('Error fetching sessions:', error);
//     return NextResponse.json({ success: false, error: 'Failed to fetch sessions' }, { status: 500 });
//   }
// }

// function formatTimeSpent(seconds: number): string {
//   if (!seconds || seconds <= 0) return '0s';
//   if (seconds < 60) return `${seconds}s`;
//   if (seconds < 3600) {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
//   }
//   const hours = Math.floor(seconds / 3600);
//   const mins = Math.floor((seconds % 3600) / 60);
//   return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
// }
// app/api/sessions/route.ts
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'admin' && user.role !== 'Administrator') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { db } = await connectToDatabase();
    const sessionsCollection = db.collection('sessions');

    // ✅ Get all sessions, grouped by userId (latest first)
    const pipeline = [
      { $sort: { timestamp: -1 } },
      { $group: { _id: '$userId', latestSession: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$latestSession' } },
      { $sort: { timestamp: -1 } },
      { $limit: 50 },
      
      // ✅ FIX: Convert the string 'userId' from sessions into an ObjectId
      {
        $addFields: {
          convertedUserId: { $toObjectId: '$userId' }
        }
      },
      
      // ✅ FIX: Use $lookup to join with the users collection
      {
        $lookup: {
          from: 'users',              
          localField: 'convertedUserId', // Use the converted ObjectId
          foreignField: '_id',           
          as: 'userData'
        }
      },
      
      // ✅ Unwind the array so we can access it easily
      { $unwind: { path: '$userData', preserveNullAndEmptyArrays: true } }
    ];

    const sessions = await sessionsCollection.aggregate(pipeline).toArray();

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ success: true, data: [], message: 'No sessions found' });
    }

    // ✅ Format sessions for display
    const formattedSessions = sessions.map((session: any) => {
      // Now, session.userData contains the real user if they exist, or null if they don't
      const realUser = session.userData;

      // Parse timeIn
      let timeIn = 'N/A';
      let timeInDate = null;
      if (session.timeIn) {
        try {
          timeInDate = new Date(session.timeIn);
          if (!isNaN(timeInDate.getTime())) timeIn = timeInDate.toLocaleString();
        } catch (e) {}
      }

      // Parse timeOut
      let timeOut = 'Active';
      let timeOutDate = null;
      if (session.timeOut) {
        try {
          timeOutDate = new Date(session.timeOut);
          if (!isNaN(timeOutDate.getTime())) timeOut = timeOutDate.toLocaleString();
        } catch (e) {}
      }

      // Calculate timeSpent
      let timeSpent = '0s';
      if (timeInDate && timeOutDate && !isNaN(timeInDate.getTime()) && !isNaN(timeOutDate.getTime())) {
        const diffSeconds = Math.floor((timeOutDate.getTime() - timeInDate.getTime()) / 1000);
        if (diffSeconds > 0) timeSpent = formatTimeSpent(diffSeconds);
      } else if (session.timeSpent) {
        const parsed = parseInt(session.timeSpent);
        if (!isNaN(parsed) && parsed > 0) timeSpent = formatTimeSpent(parsed);
      }

      const isActive = !session.timeOut || new Date(session.timeOut).getTime() > Date.now();

      // ✅ MERGE DATA: Pull real user info, otherwise fallback to session data
      return {
        _id: session._id,
        userId: session.userId,
        // ✅ Now it pulls directly from realUser (which is session.userData)
        username: realUser?.username || realUser?.displayName || session.username || session.displayName || 'Unknown',
        email: realUser?.email || session.email || 'No email', 
        avatar: realUser?.avatar || session.avatar || null,
        ip: session.ipAddress || session.ip || 'Unknown',
        country: session.country || session.location || 'Unknown',
        deviceInfo: session.deviceInfo || session.userAgent || 'Unknown Device',
        timeIn: timeIn,
        timeOut: timeOut,
        timeSpent: timeSpent,
        visitCount: session.visitCount || 1,
        isActive: isActive,
        lastUpdated: session.lastUpdated || session.updatedAt
      };
    });

    return NextResponse.json({ success: true, data: formattedSessions, count: formattedSessions.length });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

function formatTimeSpent(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}