// app/api/admin/auto-balance/route.js
import { NextResponse } from 'next/server';
import { 
  getAutoBalanceUsers, 
  updateAutoBalanceSettings,
  addToUserBalance 
} from '@/lib/db/dashdata';
import { getAllUsers } from '@/lib/db/users';
import { verifyToken, extractToken } from '@/lib/security';

export const runtime = 'nodejs';

// GET: Get all users with auto-balance status
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
    if (!decoded || (decoded.role !== 'admin' && !decoded.isAdmin)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get all users
    const users = await getAllUsers();
    
    // Get auto-balance users
    const autoUsers = await getAutoBalanceUsers();
    const autoUserIds = new Set(autoUsers.map(u => u.userId));
    
    // Build response
    const userStatuses = users.map(user => ({
      userId: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      autoBalanceEnabled: autoUserIds.has(user._id.toString()),
      lastAdded: autoUsers.find(u => u.userId === user._id.toString())?.lastAdded || null,
    }));

    return NextResponse.json({
      success: true,
      data: userStatuses,
      totalUsers: userStatuses.length,
      enabledCount: autoUserIds.size,
    });

  } catch (error) {
    console.error('Error fetching auto-balance users:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Enable/Disable auto-balance for a user
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
    if (!decoded || (decoded.role !== 'admin' && !decoded.isAdmin)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, enabled } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const result = await updateAutoBalanceSettings(userId, { enabled });

    return NextResponse.json({
      success: result,
      message: result ? 'Auto-balance settings updated' : 'Failed to update settings',
      data: { userId, enabled },
    });

  } catch (error) {
    console.error('Error updating auto-balance:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Manual trigger to add balance
export async function PUT(request) {
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
    if (!decoded || (decoded.role !== 'admin' && !decoded.isAdmin)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, amount = 0.01 } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    // Check if auto-balance is enabled for this user
    const autoUsers = await getAutoBalanceUsers();
    const isEnabled = autoUsers.some(u => u.userId === userId);
    
    if (!isEnabled) {
      return NextResponse.json(
        { success: false, error: 'Auto-balance is not enabled for this user' },
        { status: 400 }
      );
    }

    // Add the balance
    const result = await addToUserBalance(userId, amount, 'Manual auto-add');

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to add balance' },
        { status: 500 }
      );
    }

    // Update lastAdded timestamp
    await updateAutoBalanceSettings(userId, { 
      enabled: true, 
      lastAdded: new Date() 
    });

    return NextResponse.json({
      success: true,
      message: `$${amount.toFixed(2)} added to user balance`,
      data: result,
    });

  } catch (error) {
    console.error('Error manual auto-add:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}