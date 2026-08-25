import { NextResponse } from 'next/server';
import { getDashDataCollection } from '@/lib/mongodb';

export async function GET(request) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const collection = await getDashDataCollection();
    const data = await collection.find({}).sort({ updatedAt: -1 }).toArray();

    return NextResponse.json({ data });
  } catch (error) {
    console.error('DashData Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}