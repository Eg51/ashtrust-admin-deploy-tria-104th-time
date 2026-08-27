import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const { db } = await connectToDatabase();
    const sessions = db.collection('activity_logs');

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

    // 1. Delete sessions that have a timeout older than 1 hour
    const deleteTimedOut = await sessions.deleteMany({
      timeOut: { $ne: null },
      updatedAt: { $lt: oneHourAgo }
    });

    // 2. Delete "Active" sessions that have not been updated in 1 hour (stale sessions)
    const deleteStaleActive = await sessions.deleteMany({
      timeOut: null,
      updatedAt: { $lt: oneHourAgo }
    });

    console.log(`🧹 Cleaned up ${deleteTimedOut.deletedCount} timed-out sessions and ${deleteStaleActive.deletedCount} stale active sessions.`);

    return NextResponse.json({ 
      success: true, 
      deleted: deleteTimedOut.deletedCount + deleteStaleActive.deletedCount 
    });
  } catch (error) {
    console.error('Error cleaning sessions:', error);
    return NextResponse.json({ success: false, error: 'Failed to clean sessions' }, { status: 500 });
  }
}