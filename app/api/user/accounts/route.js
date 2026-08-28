// app/api/user/accounts/route.js
import { NextResponse } from 'next/server';
import { getDashDataCollection } from '@/lib/mongodb';
import { verifyToken, extractToken } from '@/lib/security';

export const runtime = 'nodejs';

// ✅ GET: Fetch user's own account details
export async function GET(request) {
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

    const userId = decoded.id || decoded.userId;
    const dashCollection = await getDashDataCollection();
    const dashData = await dashCollection.findOne({ userId });

    if (!dashData || !dashData.accountDetails) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No account details found'
      });
    }

    return NextResponse.json({
      success: true,
      data: dashData.accountDetails
    });

  } catch (error) {
    console.error('Error fetching account details:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

// ✅ POST: Save/Update user's own account details (OVERWRITES previous)
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

    const userId = decoded.id || decoded.userId;
    const body = await request.json();
    const { accounts, crypto } = body; // ✅ Added crypto

    if (!accounts || accounts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one account is required' },
        { status: 400 }
      );
    }

    // ✅ Validate Account 1 (required)
    const acc1 = accounts.find(a => a.id === 'acc1');
    if (!acc1 || !acc1.bankName || !acc1.accountName || !acc1.accountNumber) {
      return NextResponse.json(
        { success: false, error: 'Account 1 must have Bank Name, Account Name, and Account Number' },
        { status: 400 }
      );
    }

    const dashCollection = await getDashDataCollection();
    
    // ✅ Prepare account details with crypto
    const accountDetails = {
      accounts: accounts,
      crypto: crypto || { walletAddress: '', network: '' },
      updatedAt: new Date().toISOString()
    };

    // ✅ Update dashboard
    const updateResult = await dashCollection.updateOne(
      { userId },
      {
        $set: {
          'accountDetails': accountDetails,
          // ✅ Also update withdrawalDetails for Cards page
          'withdrawalDetails': {
            bankName: accounts.find(a => a.isDefault)?.bankName || accounts[0]?.bankName || '',
            accountName: accounts.find(a => a.isDefault)?.accountName || accounts[0]?.accountName || '',
            accountNumber: accounts.find(a => a.isDefault)?.accountNumber || accounts[0]?.accountNumber || '',
            accounts: accounts,
            walletAddress: crypto?.walletAddress || '',
            network: crypto?.network || '',
            updatedAt: new Date().toISOString()
          },
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Account details saved successfully',
      data: accountDetails
    });

  } catch (error) {
    console.error('Error saving account details:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}