// // app/api/track/route.js
// import { NextResponse } from 'next/server';
// import { verifyToken, extractToken } from '@/lib/security';
// import { connectToDatabase } from '@/lib/mongodb';

// export const runtime = 'nodejs';

// export async function POST(request) {
//   try {
//     const authHeader = request.headers.get('authorization');
//     const token = extractToken(authHeader);
    
//     if (!token) {
//       return NextResponse.json(
//         { success: false, error: 'Authentication required' },
//         { status: 401 }
//       );
//     }

//     const decoded = verifyToken(token);
//     if (!decoded) {
//       return NextResponse.json(
//         { success: false, error: 'Invalid token' },
//         { status: 401 }
//       );
//     }

//     const userId = decoded.id || decoded.userId;
//     const body = await request.json();
//     const { deviceInfo, timeIn, timeOut, timeSpent, avatar, email, username } = body;

//     // Extract IP from headers
//     const forwardedFor = request.headers.get('x-forwarded-for') || '';
//     const cfConnectingIP = request.headers.get('cf-connecting-ip') || '';
//     const ip = cfConnectingIP || forwardedFor.split(',')[0].trim() || '0.0.0.0';

//     // Fetch country from ipapi.co
//     let country = 'Unknown';
//     try {
//       const ipResponse = await fetch(`https://ipapi.co/${ip}/json/`);
//       if (ipResponse.ok) {
//         const ipData = await ipResponse.json();
//         country = ipData.country_name || 'Unknown';
//       }
//     } catch (ipError) {
//       console.error('Failed to fetch country from ipapi:', ipError);
//     }

//     const { db } = await connectToDatabase();
    
//     // 🚨 FIXED: Changed 'sessions' to 'activity_logs' to avoid duplicate key error
//     const sessions = db.collection('activity_logs');

//     await sessions.insertOne({
//       userId,
//       email: email || 'N/A',
//       username: username || 'Unknown',
//       avatar: avatar || null,
//       ip,
//       country,
//       deviceInfo: deviceInfo || 'Unknown Device',
//       timeIn,
//       timeOut: timeOut || null,
//       timeSpent: timeSpent || '0s',
//       timestamp: new Date(),
//     });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Error tracking session:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to track session' },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/security';
import { connectToDatabase } from '@/lib/mongodb';

export const runtime = 'nodejs';

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
    const body = await request.json();
    const { sessionId, deviceInfo, timeIn, timeOut, timeSpent, avatar, email, username, action } = body;

    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    const cfConnectingIP = request.headers.get('cf-connecting-ip') || '';
    const ip = cfConnectingIP || forwardedFor.split(',')[0].trim() || '0.0.0.0';

    let country = 'Unknown';
    try {
      const ipResponse = await fetch(`https://ipapi.co/${ip}/json/`);
      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        country = ipData.country_name || 'Unknown';
      }
    } catch (ipError) {
      console.error('Failed to fetch country from ipapi:', ipError);
    }

    const { db } = await connectToDatabase();
    const sessions = db.collection('activity_logs');

    // 🚨 NEW LOGIC: Find existing active session by userId and sessionId
    const existingSession = await sessions.findOne({ userId, sessionId, timeOut: null });

    if (existingSession) {
      // If session exists, just update the timeOut and timeSpent
      await sessions.updateOne(
        { _id: existingSession._id },
        { $set: { timeOut: timeOut || null, timeSpent: timeSpent || '0s', updatedAt: new Date() } }
      );
    } else {
      // If no active session, insert a new one
      await sessions.insertOne({
        userId,
        sessionId,
        email: email || 'N/A',
        username: username || 'Unknown',
        avatar: avatar || null,
        ip,
        country,
        deviceInfo: deviceInfo || 'Unknown Device',
        timeIn,
        timeOut: timeOut || null,
        timeSpent: timeSpent || '0s',
        timestamp: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track session' },
      { status: 500 }
    );
  }
}