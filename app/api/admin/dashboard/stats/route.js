import { NextResponse } from 'next/server';
import { getUsersCollection, getLoginAttemptsCollection } from '@/lib/mongodb';

export async function GET(request) {
  try {
    // 1. Admin check via middleware headers (Ultra-fast)
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' }, 
        { status: 403 }
      );
    }

    // 2. Connect to the native collections
    const usersCollection = await getUsersCollection();
    const loginCollection = await getLoginAttemptsCollection();

    // 3. Fetch stats
    const totalUsers = await usersCollection.countDocuments();
    const activeUsers = await usersCollection.countDocuments({ isActive: true });
    
    // Locked users (based on your login_attempts schema)
    const lockedUsers = await loginCollection.countDocuments({
      lockedUntil: { $gt: new Date() }
    });

    // 4. Fetch the 5 most recent users
    const recentUsers = await usersCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    return NextResponse.json({
      stats: { totalUsers, activeUsers, lockedUsers },
      recentUsers,
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}