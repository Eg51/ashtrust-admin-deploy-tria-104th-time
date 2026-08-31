// app/api/user/request-account-details/route.js
import { NextResponse } from 'next/server';
import { getDashDataCollection } from '@/lib/mongodb';
import { verifyToken, extractToken } from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, userEmail, userName, timestamp } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const dashCollection = await getDashDataCollection();
    
    // Save the request to the user's dashboard
    const result = await dashCollection.updateOne(
      { userId },
      {
        $set: {
          'accountGenerationRequest': {
            requestedAt: timestamp || new Date().toISOString(),
            status: 'pending',
            userEmail: userEmail || 'Unknown',
            userName: userName || 'Unknown'
          },
          updatedAt: new Date()
        },
        $push: {
          'accountGenerationHistory': {
            requestedAt: timestamp || new Date().toISOString(),
            status: 'pending',
            userEmail: userEmail || 'Unknown',
            userName: userName || 'Unknown'
          }
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Account generation request sent to admin',
      data: {
        userId,
        status: 'pending',
        timestamp: timestamp || new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error sending account generation request:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}