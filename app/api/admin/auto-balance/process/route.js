// app/api/admin/auto-balance/process/route.js
import { NextResponse } from 'next/server';
import { getAutoBalanceUsers, addToUserBalance, updateAutoBalanceSettings } from '@/lib/db/dashdata';
import { verifyToken, extractToken } from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// This endpoint is called by a cron job every hour
// It checks which users need balance added and processes them
export async function POST(request) {
  try {
    // Optional: Use a secret key for cron job security
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    
    // Allow cron job with a special token
    const cronSecret = request.headers.get('x-cron-secret');
    const isValidCron = cronSecret === process.env.CRON_SECRET;

    
    if (!isValidCron && !token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // If token is provided, verify it's admin
    if (token && !isValidCron) {
      const decoded = verifyToken(token);
      if (!decoded || (decoded.role !== 'admin' && !decoded.isAdmin)) {
        return NextResponse.json(
          { success: false, error: 'Admin access required' },
          { status: 403 }
        );
      }
    }

    const interval = parseInt(process.env.AUTO_BALANCE_INTERVAL) || 1800000; // 2 hours default
    const amount = parseFloat(process.env.AUTO_BALANCE_AMOUNT) || 0.01;
    
    const users = await getAutoBalanceUsers();
    const now = Date.now();
    
    const results = {
      processed: 0,
      skipped: 0,
      failed: 0,
      details: [],
    };

    for (const user of users) {
      const lastAdded = user.lastAdded ? new Date(user.lastAdded).getTime() : 0;
      const timeSince = now - lastAdded;
      
      // Check if enough time has passed
      if (timeSince >= interval) {
        // Add balance
        const result = await addToUserBalance(user.userId, amount, 'Auto-add');
        
        if (result.success) {
          // Update lastAdded timestamp
          await updateAutoBalanceSettings(user.userId, { 
            enabled: true, 
            lastAdded: new Date() 
          });
          
          results.processed++;
          results.details.push({
            userId: user.userId,
            status: 'success',
            newBalance: result.newBalance,
          });
        } else {
          results.failed++;
          results.details.push({
            userId: user.userId,
            status: 'failed',
            error: result.error,
          });
        }
      } else {
        results.skipped++;
        const remaining = Math.ceil((interval - timeSince) / 60000); // minutes remaining
        results.details.push({
          userId: user.userId,
          status: 'skipped',
          remainingMinutes: remaining,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} users, skipped ${results.skipped}, failed ${results.failed}`,
      data: results,
    });

  } catch (error) {
    console.error('Error processing auto-balance:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}