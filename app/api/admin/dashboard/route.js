import { NextResponse } from 'next/server';
import { getUsersCollection, getLoginAttemptsCollection } from '@/lib/mongodb';

export async function GET(request) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const usersCollection = await getUsersCollection();
    const loginCollection = await getLoginAttemptsCollection();

    const totalUsers = await usersCollection.countDocuments();
    const activeUsers = await usersCollection.countDocuments({ isActive: true });
    
    // ✅ Count locked users from BOTH the users collection and login attempts
    const lockedFromUsers = await usersCollection.countDocuments({
      lockUntil: { $gt: new Date() }
    });
    const lockedFromLogs = await loginCollection.countDocuments({
      lockedUntil: { $gt: new Date() }
    });
    
    const lockedUsers = lockedFromUsers + lockedFromLogs;

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
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}