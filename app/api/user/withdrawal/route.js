// app/api/user/withdrawal/route.js
import { NextResponse } from 'next/server';
import { getDashDataCollection } from '@/lib/mongodb';
import { verifyToken, extractToken } from '@/lib/security';

export const runtime = 'nodejs';

// ✅ GET: Fetch user's withdrawal details - UPDATED with accountDetails fallback
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
    console.log(`🔵 [GET] Fetching withdrawal details for user: ${userId}`);

    const dashCollection = await getDashDataCollection();
    const dashData = await dashCollection.findOne({ userId });

    console.log(`🔵 [GET] Dashboard data found:`, dashData ? 'YES' : 'NO');

    if (!dashData) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No withdrawal details found'
      });
    }

    // ✅ FIRST: Try to get withdrawalDetails
    let withdrawalDetails = dashData.withdrawalDetails || null;

    // ✅ SECOND: If withdrawalDetails is empty, check accountDetails
    if (!withdrawalDetails && dashData.accountDetails) {
      console.log('🔵 [GET] No withdrawalDetails, using accountDetails as fallback');
      const accountDetails = dashData.accountDetails;
      const accounts = accountDetails.accounts || [];

      // ✅ FIXED: Removed TypeScript syntax (: any)
      const defaultAccount = accounts.find(function(a) { return a.isDefault; }) || accounts[0] || null;

      if (defaultAccount) {
        // ✅ Build withdrawalDetails from accountDetails
        withdrawalDetails = {
          bankName: defaultAccount.bankName || '',
          accountName: defaultAccount.accountName || '',
          accountNumber: defaultAccount.accountNumber || '',
          accounts: accounts,
          swiftCode: accountDetails.swiftCode || '',
          iban: accountDetails.iban || '',
          walletAddress: accountDetails.walletAddress || '',
          network: accountDetails.network || '',
        };
        console.log('🔵 [GET] Built withdrawalDetails from accountDetails:', withdrawalDetails);
      } else if (accounts.length > 0) {
        // Fallback: use first account even if no default
        withdrawalDetails = {
          bankName: accounts[0].bankName || '',
          accountName: accounts[0].accountName || '',
          accountNumber: accounts[0].accountNumber || '',
          accounts: accounts,
        };
        console.log('🔵 [GET] Built withdrawalDetails from first account:', withdrawalDetails);
      }
    }

    const withdrawalHistory = dashData.withdrawalHistory || [];

    console.log(`🔵 [GET] Final withdrawalDetails:`, withdrawalDetails);

    return NextResponse.json({
      success: true,
      data: {
        details: withdrawalDetails,
        history: withdrawalHistory
      }
    });

  } catch (error) {
    console.error('🔴 Error fetching withdrawal details:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

// ✅ POST: Save/Update user's withdrawal details (OVERWRITES previous)
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
    console.log(`🔵 [POST] Saving withdrawal for user: ${userId}`);

    // ✅ Get the request body
    const body = await request.json();
    console.log(`🔵 [POST] Request body:`, body);

    const {
      method,
      amount,
      bankName,
      accountName,
      accountNumber,
      swiftCode,
      iban,
      walletAddress,
      network
    } = body;

    // ✅ Validate required fields
    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    if (!method) {
      return NextResponse.json(
        { success: false, error: 'Payment method is required' },
        { status: 400 }
      );
    }

    const dashCollection = await getDashDataCollection();

    // ✅ Get or create dashboard data
    let dashData = await dashCollection.findOne({ userId });

    if (!dashData) {
      console.log(`🔵 [POST] Creating new dashboard for user: ${userId}`);

      const defaultData = {
        userId,
        totalBalance: { amount: "0.00", change: "0.0%" },
        analysisBalance: { total: "0.00", stocks: "45%", crypto: "35%", etfs: "20%" },
        analysisSummary: "",
        analysisNote: 0,
        bills: [],
        recentTransactions: [],
        paymentMethods: [],
        withdrawalDetails: null,
        withdrawalHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await dashCollection.insertOne(defaultData);
      dashData = { ...defaultData, _id: result.insertedId };
    }

    const withdrawalDetails = {
      method: method || 'bank',
      bankName: bankName || '',
      accountName: accountName || '',
      accountNumber: accountNumber || '',
      swiftCode: swiftCode || '',
      iban: iban || '',
      walletAddress: walletAddress || '',
      network: network || '',
      updatedAt: new Date().toISOString()
    };

    // console.log(`🔵 [POST] Withdrawal details to save:`, withdrawalDetails);

    // ✅ Generate unique transaction reference
    const generateReference = function() {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      return 'ASH REF:' + timestamp + random;
    };

    // ✅ Create withdrawal history entry
    const historyEntry = {
      id: 'wdr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      reference: generateReference(),
      amount: parseFloat(amount),
      method: method || 'bank',
      status: 'pending',
      createdAt: new Date().toISOString(),
      details: withdrawalDetails
    };

    console.log(`🔵 [POST] History entry:`, historyEntry);

    // ✅ Update dashboard: OVERWRITE withdrawalDetails, ADD to history
    const updateResult = await dashCollection.updateOne(
      { userId },
      {
        $set: {
          'withdrawalDetails': withdrawalDetails,
          updatedAt: new Date()
        },
        $push: {
          withdrawalHistory: {
            $each: [historyEntry],
            $position: 0,
            $slice: 50
          }
        }
      }
    );

    // console.log(`🔵 [POST] Update result:`, updateResult);

    if (updateResult.modifiedCount === 0 && updateResult.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to save withdrawal details' },
        { status: 500 }
      );
    }

    // ✅ Fetch the updated data to return
    const updatedDashData = await dashCollection.findOne({ userId });

    return NextResponse.json({
      success: true,
      message: 'Withdrawal details saved successfully',
      data: {
        details: withdrawalDetails,
        history: historyEntry,
        dashboard: updatedDashData
      }
    });

  } catch (error) {
    console.error('🔴 Error saving withdrawal details:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

// ✅ DELETE: Clear user's withdrawal details
export async function DELETE(request) {
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

    const result = await dashCollection.updateOne(
      { userId },
      {
        $set: {
          'withdrawalDetails': null,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Withdrawal details cleared successfully'
    });

  } catch (error) {
    console.error('🔴 Error clearing withdrawal details:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}