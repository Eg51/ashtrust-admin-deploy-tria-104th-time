// app/api/user/dashboard/invest/route.js
import { NextResponse } from 'next/server';
import { getDashDataCollection } from '@/lib/mongodb';
import { verifyToken, extractToken } from '@/lib/security';

export async function POST(request) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    const userId = decoded.id || decoded.userId;

    const { assetId, amount } = await request.json();
    if (!assetId || !amount) {
      return NextResponse.json({ error: 'Asset ID and amount required' }, { status: 400 });
    }

    const dashCollection = await getDashDataCollection();
    const dashData = await dashCollection.findOne({ userId });

    if (!dashData) {
      return NextResponse.json({ error: 'Nothing here' }, { status: 404 });
    }

    // 💰 Deduct from total balance
    const currentBalance = parseFloat(dashData.totalBalance?.amount) || 0;
    const newBalance = currentBalance - parseFloat(amount);
    
    // 🟢 Add to the investments array
    const newInvestment = {
      id: Date.now().toString(),
      assetId,
      amount: parseFloat(amount),
      purchasePrice: 0, // Add logic to fetch asset price if you have it
      date: new Date().toISOString(),
    };

    // Update the dashdata collection
    await dashCollection.updateOne(
      { userId },
      { 
        $set: { 
          'totalBalance.amount': newBalance.toFixed(2),
          investments: [...(dashData.investments || []), newInvestment], // Saves the card!
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({ success: true, data: { newBalance, newInvestment } });

  } catch (error) {
    console.error('error:', error);
    return NextResponse.json({ error: 'asset not purchesed' }, { status: 500 });
  }
}