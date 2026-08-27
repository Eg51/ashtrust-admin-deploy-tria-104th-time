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

    // Fetch the latest 50 sessions, sorted by when they were created
    const sessions = await sessionsCollection
      .find({})
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch sessions' }, { status: 500 });
  }
}