// // // // app/api/track/route.js
// // // import { NextResponse } from 'next/server';
// // // import { verifyToken, extractToken } from '@/lib/security';
// // // import { connectToDatabase } from '@/lib/mongodb';

// // // export const runtime = 'nodejs';

// // // export async function POST(request) {
// // //   try {
// // //     const authHeader = request.headers.get('authorization');
// // //     const token = extractToken(authHeader);
    
// // //     if (!token) {
// // //       return NextResponse.json(
// // //         { success: false, error: 'Authentication required' },
// // //         { status: 401 }
// // //       );
// // //     }

// // //     const decoded = verifyToken(token);
// // //     if (!decoded) {
// // //       return NextResponse.json(
// // //         { success: false, error: 'Invalid token' },
// // //         { status: 401 }
// // //       );
// // //     }

// // //     const userId = decoded.id || decoded.userId;
// // //     const body = await request.json();
// // //     const { deviceInfo, timeIn, timeOut, timeSpent, avatar, email, username } = body;

// // //     // Extract IP from headers
// // //     const forwardedFor = request.headers.get('x-forwarded-for') || '';
// // //     const cfConnectingIP = request.headers.get('cf-connecting-ip') || '';
// // //     const ip = cfConnectingIP || forwardedFor.split(',')[0].trim() || '0.0.0.0';

// // //     // Fetch country from ipapi.co
// // //     let country = 'Unknown';
// // //     try {
// // //       const ipResponse = await fetch(`https://ipapi.co/${ip}/json/`);
// // //       if (ipResponse.ok) {
// // //         const ipData = await ipResponse.json();
// // //         country = ipData.country_name || 'Unknown';
// // //       }
// // //     } catch (ipError) {
// // //       console.error('Failed to fetch country from ipapi:', ipError);
// // //     }

// // //     const { db } = await connectToDatabase();
    
// // //     // 🚨 FIXED: Changed 'sessions' to 'activity_logs' to avoid duplicate key error
// // //     const sessions = db.collection('activity_logs');

// // //     await sessions.insertOne({
// // //       userId,
// // //       email: email || 'N/A',
// // //       username: username || 'Unknown',
// // //       avatar: avatar || null,
// // //       ip,
// // //       country,
// // //       deviceInfo: deviceInfo || 'Unknown Device',
// // //       timeIn,
// // //       timeOut: timeOut || null,
// // //       timeSpent: timeSpent || '0s',
// // //       timestamp: new Date(),
// // //     });

// // //     return NextResponse.json({ success: true });
// // //   } catch (error) {
// // //     console.error('Error tracking session:', error);
// // //     return NextResponse.json(
// // //       { success: false, error: 'Failed to track session' },
// // //       { status: 500 }
// // //     );
// // //   }
// // // }
// // // app/api/track/route.js
// // import { NextResponse } from 'next/server';
// // import { verifyToken, extractToken } from '@/lib/security';
// // import { connectToDatabase } from '@/lib/mongodb';
// // import { ObjectId } from 'mongodb'; // ✅ ADDED

// // export const runtime = 'nodejs';

// // export async function POST(request) {
// //   try {
// //     const authHeader = request.headers.get('authorization');
// //     const token = extractToken(authHeader);
    
// //     if (!token) {
// //       return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
// //     }

// //     const decoded = verifyToken(token);
// //     if (!decoded) {
// //       return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
// //     }

// //     const userId = decoded.id || decoded.userId;
// //     const body = await request.json();
// //     const { sessionId, deviceInfo, timeIn, timeOut, timeSpent, avatar, email, username, action } = body;

// //     const forwardedFor = request.headers.get('x-forwarded-for') || '';
// //     const cfConnectingIP = request.headers.get('cf-connecting-ip') || '';
// //     const ip = cfConnectingIP || forwardedFor.split(',')[0].trim() || '0.0.0.0';

// //     let country = 'Unknown';
// //     try {
// //       const ipResponse = await fetch(`https://ipapi.co/${ip}/json/`);
// //       if (ipResponse.ok) {
// //         const ipData = await ipResponse.json();
// //         country = ipData.country_name || 'Unknown';
// //       }
// //     } catch (ipError) {
// //       console.error('Failed to fetch country from ipapi:', ipError);
// //     }

// //     const { db } = await connectToDatabase();
    
// //     // ✅ FIX: Use 'sessions' collection (not 'activity_logs')
// //     const sessions = db.collection('sessions');

// //     // ✅ Get user from database to get email and username
// //     const usersCollection = db.collection('users');
// //     const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
// //     const finalUsername = username || user?.username || user?.displayName || decoded.username || 'Unknown';
// //     const finalEmail = email || user?.email || decoded.email || 'No email';

// //     // ✅ Find existing active session
// //     const existingSession = await sessions.findOne({ 
// //       userId, 
// //       sessionId, 
// //       timeOut: null 
// //     });

// //     if (existingSession) {
// //       // ✅ Update existing session
// //       await sessions.updateOne(
// //         { _id: existingSession._id },
// //         { 
// //           $set: { 
// //             timeOut: timeOut || null, 
// //             timeSpent: timeSpent || '0s', 
// //             updatedAt: new Date(),
// //             lastUpdated: new Date().toISOString(),
// //             username: finalUsername,
// //             email: finalEmail,
// //             displayName: user?.displayName || finalUsername,
// //             deviceInfo: deviceInfo || existingSession.deviceInfo,
// //             ip: ip || existingSession.ip,
// //             country: country || existingSession.country,
// //           },
// //           $inc: { visitCount: 1 }
// //         }
// //       );
      
// //       console.log(`✅ [track] Updated session ${sessionId} for user ${finalUsername} (${finalEmail})`);
// //     } else {
// //       // ✅ Insert new session
// //       await sessions.insertOne({
// //         userId,
// //         sessionId: sessionId || `session_${userId}_${Date.now()}`,
// //         email: finalEmail,
// //         username: finalUsername,
// //         displayName: user?.displayName || finalUsername,
// //         avatar: avatar || null,
// //         ip: ip,
// //         country: country,
// //         deviceInfo: deviceInfo || 'Unknown Device',
// //         timeIn: timeIn || new Date().toISOString(),
// //         timeOut: timeOut || null,
// //         timeSpent: timeSpent || '0s',
// //         timestamp: new Date(),
// //         createdAt: new Date(),
// //         updatedAt: new Date(),
// //         firstVisit: new Date().toISOString(),
// //         visitCount: 1,
// //         path: body.path || '/',
// //         eventType: body.eventType || 'page_view'
// //       });
      
// //       console.log(`✅ [track] New session ${sessionId} for user ${finalUsername} (${finalEmail})`);
// //     }

// //     return NextResponse.json({ 
// //       success: true,
// //       data: {
// //         sessionId: sessionId || `session_${userId}_${Date.now()}`,
// //         userId: userId,
// //         username: finalUsername,
// //         email: finalEmail
// //       }
// //     });
    
// //   } catch (error) {
// //     console.error('🔴 Error tracking session:', error);
// //     return NextResponse.json(
// //       { success: false, error: 'Failed to track session: ' + error.message },
// //       { status: 500 }
// //     );
// //   }
// // }


// // app/api/track/route.js
// import { NextResponse } from 'next/server';
// import { verifyToken, extractToken } from '@/lib/security';
// import { connectToDatabase } from '@/lib/mongodb';

// export const runtime = 'nodejs';

// // ✅ Helper function to get country with multiple fallbacks
// async function getCountryFromIP(ip) {
//   // If IP is localhost or private, return a default
//   if (!ip || ip === '0.0.0.0' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('127.')) {
//     return 'Local Network';
//   }

//   const services = [
//     {
//       name: 'ipapi.co',
//       url: `https://ipapi.co/${ip}/json/`,
//       parse: (data) => data.country_name || data.country || null
//     },
//     {
//       name: 'ip-api.com',
//       url: `http://ip-api.com/json/${ip}?fields=country`,
//       parse: (data) => data.country || null
//     },
//     {
//       name: 'ipinfo.io',
//       url: `https://ipinfo.io/${ip}/json`,
//       parse: (data) => data.country || data.country_name || null
//     }
//   ];

//   // ✅ Try each service until one works
//   for (const service of services) {
//     try {
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

//       const response = await fetch(service.url, {
//         signal: controller.signal,
//         headers: {
//           'Accept': 'application/json',
//           'User-Agent': 'Mozilla/5.0 (compatible; YourApp/1.0)'
//         }
//       });

//       clearTimeout(timeoutId);

//       if (response.ok) {
//         const data = await response.json();
//         const country = service.parse(data);
//         if (country) {
//           console.log(`✅ [track] Country found via ${service.name}: ${country}`);
//           return country;
//         }
//       } else {
//         console.warn(`⚠️ [track] ${service.name} returned ${response.status}`);
//       }
//     } catch (error) {
//       if (error.name === 'AbortError') {
//         console.warn(`⚠️ [track] ${service.name} timeout`);
//       } else {
//         console.warn(`⚠️ [track] ${service.name} error:`, error.message);
//       }
//       // Continue to next service
//     }
//   }

//   console.warn('⚠️ [track] All geolocation services failed');
//   return 'Unknown Location';
// }

// export async function POST(request) {
//   try {
//     const authHeader = request.headers.get('authorization');
//     const token = extractToken(authHeader);
    
//     if (!token) {
//       return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
//     }

//     const decoded = verifyToken(token);
//     if (!decoded) {
//       return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
//     }

//     const userId = decoded.id || decoded.userId;
//     const body = await request.json();
//     const { sessionId, deviceInfo, timeIn, timeOut, timeSpent, avatar, email, username, action } = body;

//     // ✅ Get IP from headers
//     const forwardedFor = request.headers.get('x-forwarded-for') || '';
//     const cfConnectingIP = request.headers.get('cf-connecting-ip') || '';
//     const ip = cfConnectingIP || forwardedFor.split(',')[0].trim() || '0.0.0.0';

//     // ✅ Get country with fallbacks
//     const country = await getCountryFromIP(ip);

//     const { db } = await connectToDatabase();
//     const sessions = db.collection('sessions');

//     // ✅ Get user from database
//     const usersCollection = db.collection('users');
//     const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
//     const finalUsername = username || user?.username || user?.displayName || decoded.username || 'Unknown';
//     const finalEmail = email || user?.email || decoded.email || 'No email';

//     // ✅ Find existing active session
//     const existingSession = await sessions.findOne({ 
//       userId, 
//       sessionId, 
//       timeOut: null 
//     });

//     if (existingSession) {
//       // ✅ Update existing session
//       await sessions.updateOne(
//         { _id: existingSession._id },
//         { 
//           $set: { 
//             timeOut: timeOut || null, 
//             timeSpent: timeSpent || '0s', 
//             updatedAt: new Date(),
//             lastUpdated: new Date().toISOString(),
//             username: finalUsername,
//             email: finalEmail,
//             displayName: user?.displayName || finalUsername,
//             deviceInfo: deviceInfo || existingSession.deviceInfo,
//             ip: ip || existingSession.ip,
//             country: country || existingSession.country,
//           },
//           $inc: { visitCount: 1 }
//         }
//       );
      
//       console.log(`✅ [track] Updated session ${sessionId} for user ${finalUsername} (${finalEmail}) from ${country}`);
//     } else {
//       // ✅ Insert new session
//       await sessions.insertOne({
//         userId,
//         sessionId: sessionId || `session_${userId}_${Date.now()}`,
//         email: finalEmail,
//         username: finalUsername,
//         displayName: user?.displayName || finalUsername,
//         avatar: avatar || null,
//         ip: ip,
//         country: country,
//         deviceInfo: deviceInfo || 'Unknown Device',
//         timeIn: timeIn || new Date().toISOString(),
//         timeOut: timeOut || null,
//         timeSpent: timeSpent || '0s',
//         timestamp: new Date(),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         firstVisit: new Date().toISOString(),
//         visitCount: 1,
//         path: body.path || '/',
//         eventType: body.eventType || 'page_view'
//       });
      
//       console.log(`✅ [track] New session ${sessionId} for user ${finalUsername} (${finalEmail}) from ${country}`);
//     }

//     return NextResponse.json({ 
//       success: true,
//       data: {
//         sessionId: sessionId || `session_${userId}_${Date.now()}`,
//         userId: userId,
//         username: finalUsername,
//         email: finalEmail,
//         country: country
//       }
//     });
    
//   } catch (error) {
//     console.error('🔴 Error tracking session:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to track session: ' + error.message },
//       { status: 500 }
//     );
//   }
// }



// // app/api/track/route.js
// import { NextResponse } from 'next/server';
// import { verifyToken, extractToken } from '@/lib/security';
// import { connectToDatabase } from '@/lib/mongodb';
// import { ObjectId } from 'mongodb'; // ✅ REQUIRED

// export const runtime = 'nodejs';

// // ✅ Helper function to get country with multiple fallbacks
// async function getCountryFromIP(ip) {
//   // If IP is localhost or private, return a default
//   if (!ip || ip === '0.0.0.0' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('127.')) {
//     return 'Local Network';
//   }

//   const services = [
//     {
//       name: 'ipapi.co',
//       url: `https://ipapi.co/${ip}/json/`,
//       parse: (data) => data.country_name || data.country || null
//     },
//     {
//       name: 'ip-api.com',
//       url: `http://ip-api.com/json/${ip}?fields=country`,
//       parse: (data) => data.country || null
//     },
//     {
//       name: 'ipinfo.io',
//       url: `https://ipinfo.io/${ip}/json`,
//       parse: (data) => data.country || data.country_name || null
//     }
//   ];

//   for (const service of services) {
//     try {
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 3000);

//       const response = await fetch(service.url, {
//         signal: controller.signal,
//         headers: {
//           'Accept': 'application/json',
//           'User-Agent': 'Mozilla/5.0 (compatible; YourApp/1.0)'
//         }
//       });

//       clearTimeout(timeoutId);

//       if (response.ok) {
//         const data = await response.json();
//         const country = service.parse(data);
//         if (country) {
//           console.log(`✅ [track] Country found via ${service.name}: ${country}`);
//           return country;
//         }
//       }
//     } catch (error) {
//       // Continue to next service
//     }
//   }

//   return 'Unknown Location';
// }

// export async function POST(request) {
//   try {
//     const authHeader = request.headers.get('authorization');
//     const token = extractToken(authHeader);
    
//     if (!token) {
//       return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
//     }

//     const decoded = verifyToken(token);
//     if (!decoded) {
//       return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
//     }

//     const userId = decoded.id || decoded.userId;
    
//     let body = {};
//     try {
//       const text = await request.text();
//       if (text) {
//         body = JSON.parse(text);
//       }
//     } catch (parseError) {
//       console.warn('⚠️ No JSON body received, using empty object');
//     }

//     const { sessionId, deviceInfo, timeIn, timeOut, timeSpent, avatar, email, username } = body;

//     const forwardedFor = request.headers.get('x-forwarded-for') || '';
//     const cfConnectingIP = request.headers.get('cf-connecting-ip') || '';
//     const ip = cfConnectingIP || forwardedFor.split(',')[0].trim() || '0.0.0.0';

//     const country = await getCountryFromIP(ip);

//     const { db } = await connectToDatabase();
//     const sessions = db.collection('sessions');

//     // ✅ Get user from database
//     const usersCollection = db.collection('users');
//     const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
//     const finalUsername = username || user?.username || user?.displayName || decoded.username || 'Unknown';
//     const finalEmail = email || user?.email || decoded.email || 'No email';

//     // ✅ Find existing active session
//     const existingSession = await sessions.findOne({ 
//       userId, 
//       sessionId, 
//       timeOut: null 
//     });

//     if (existingSession) {
//       // ✅ Update existing session
//       await sessions.updateOne(
//         { _id: existingSession._id },
//         { 
//           $set: { 
//             timeOut: timeOut || null, 
//             timeSpent: timeSpent || '0s', 
//             updatedAt: new Date(),
//             lastUpdated: new Date().toISOString(),
//             username: finalUsername,
//             email: finalEmail,
//             displayName: user?.displayName || finalUsername,
//             deviceInfo: deviceInfo || existingSession.deviceInfo,
//             ip: ip || existingSession.ip,
//             country: country || existingSession.country,
//           },
//           $inc: { visitCount: 1 }
//         }
//       );
//     } else {
//       // ✅ Insert new session
//       await sessions.insertOne({
//         userId,
//         sessionId: sessionId || `session_${userId}_${Date.now()}`,
//         email: finalEmail,
//         username: finalUsername,
//         displayName: user?.displayName || finalUsername,
//         avatar: avatar || null,
//         ip: ip,
//         country: country,
//         deviceInfo: deviceInfo || 'Unknown Device',
//         timeIn: timeIn || new Date().toISOString(),
//         timeOut: timeOut || null,
//         timeSpent: timeSpent || '0s',
//         timestamp: new Date(),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         firstVisit: new Date().toISOString(),
//         visitCount: 1,
//         path: body.path || '/',
//         eventType: body.eventType || 'page_view'
//       });
//     }

//     return NextResponse.json({ 
//       success: true,
//       data: {
//         sessionId: sessionId || `session_${userId}_${Date.now()}`,
//         userId: userId,
//         username: finalUsername,
//         email: finalEmail,
//         country: country
//       }
//     });
    
//   } catch (error) {
//     console.error('🔴 Error tracking session:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to track session: ' + error.message },
//       { status: 500 }
//     );
//   }
// }

// app/api/track/route.js
import { NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/security';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

// ✅ Helper function to get country with multiple fallbacks
async function getCountryFromIP(ip) {
  if (!ip || ip === '0.0.0.0' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('127.')) {
    return 'Local Network';
  }

  const services = [
    {
      name: 'ipapi.co',
      url: `https://ipapi.co/${ip}/json/`,
      parse: (data) => data.country_name || data.country || null
    },
    {
      name: 'ip-api.com',
      url: `http://ip-api.com/json/${ip}?fields=country`,
      parse: (data) => data.country || null
    },
    {
      name: 'ipinfo.io',
      url: `https://ipinfo.io/${ip}/json`,
      parse: (data) => data.country || data.country_name || null
    }
  ];

  for (const service of services) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(service.url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        const country = service.parse(data);
        if (country) return country;
      }
    } catch (error) {
      // Continue to next service
    }
  }
  return 'Unknown Location';
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id || decoded.userId;
    
    let body = {};
    try {
      const text = await request.text();
      if (text) body = JSON.parse(text);
    } catch (parseError) {
      console.warn('⚠️ No JSON body received, using empty object');
    }

    const { sessionId, deviceInfo, timeIn, timeOut, timeSpent, avatar, email, username } = body;

    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    const cfConnectingIP = request.headers.get('cf-connecting-ip') || '';
    const ip = cfConnectingIP || forwardedFor.split(',')[0].trim() || '0.0.0.0';
    const country = await getCountryFromIP(ip);

    const { db } = await connectToDatabase();
    const sessions = db.collection('sessions');
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    const finalUsername = username || user?.username || user?.displayName || decoded.username || 'Unknown';
    const finalEmail = email || user?.email || decoded.email || 'No email';
    const finalSessionId = sessionId || `session_${userId}_${Date.now()}`;

    // ✅ FIXED: visitCount ONLY in $inc, not in $set
    await sessions.updateOne(
      { sessionId: finalSessionId },
      { 
        $set: {
          userId,
          sessionId: finalSessionId,
          email: finalEmail,
          username: finalUsername,
          displayName: user?.displayName || finalUsername,
          avatar: avatar || null,
          ip: ip,
          country: country,
          deviceInfo: deviceInfo || 'Unknown Device',
          timeIn: timeIn || new Date().toISOString(),
          timeOut: timeOut || null,
          timeSpent: timeSpent || '0s',
          timestamp: new Date(),
          updatedAt: new Date(),
          lastUpdated: new Date().toISOString(),
          path: body.path || '/',
          eventType: body.eventType || 'page_view'
        },
        $inc: { visitCount: 1 },
        $setOnInsert: { 
          createdAt: new Date(),
          firstVisit: new Date().toISOString()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ 
      success: true,
      data: {
        sessionId: finalSessionId,
        userId: userId,
        username: finalUsername,
        email: finalEmail,
        country: country
      }
    });
    
  } catch (error) {
    console.error('🔴 Error tracking session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track session: ' + error.message },
      { status: 500 }
    );
  }
}