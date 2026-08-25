// app/api/admin/loginattempts/unlock/route.js
import { NextResponse } from 'next/server';
import { getLoginAttemptsCollection, getUsersCollection } from '@/lib/mongodb';

export async function POST(request) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Reset the login_attempts collection (if it exists)
    const loginCollection = await getLoginAttemptsCollection();
    await loginCollection.updateOne(
      { email },
      { $set: { attempts: 0, lockedUntil: null } }
    );

    // 2. CRITICAL: Reset the users collection (this is what actually unlocks!)
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.updateOne(
      { email }, 
      { 
        $set: { 
          loginAttempts: 0, 
          lockUntil: null, // 🟢 Cancels the 9999 year lock
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      console.warn(`Warning: No user found with email ${email} to unlock.`);
    }

    return NextResponse.json({ success: true, message: `User ${email} unlocked successfully.` });

  } catch (error) {
    console.error('Failed to unlock user:', error);
    return NextResponse.json({ error: 'Failed to unlock' }, { status: 500 });
  }
}