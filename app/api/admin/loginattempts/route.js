import { NextResponse } from 'next/server';
import { getLoginAttemptsCollection, getUsersCollection } from '@/lib/mongodb';

export async function GET(request) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const loginCollection = await getLoginAttemptsCollection();
    const usersCollection = await getUsersCollection();

    // 1. Fetch existing login attempts
    const attempts = await loginCollection.find({}).sort({ lastAttempt: -1 }).toArray();

    // 2. Fetch users with an active lockout (from the Users collection)
    const lockedUsers = await usersCollection.find({
      lockUntil: { $gt: new Date() }
    }).toArray();

    // 3. Merge both arrays, prioritizing the login_attempts data if it exists
    const mergedData = [
      ...attempts,
      ...lockedUsers.map(user => ({
        _id: user._id.toString(),
        email: user.email,
        attempts: user.loginAttempts || 0,
        lastAttempt: user.updatedAt || user.createdAt || new Date().toISOString(),
        lockedUntil: user.lockUntil,
        source: 'users'
      }))
    ];

    return NextResponse.json({ data: mergedData });
  } catch (error) {
    console.error('LoginAttempts Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}