// // app/api/admin/withdrawals/route.js
// import { NextResponse } from 'next/server';
// import { getDashDataCollection } from '@/lib/mongodb';
// import { verifyToken, extractToken } from '@/lib/security';

// export const runtime = 'nodejs';

// export async function GET(request) {
//   try {
//     const authHeader = request.headers.get('authorization');
//     const token = extractToken(authHeader);
    
//     if (!token) {
//       return NextResponse.json(
//         { success: false, error: 'Authentication required' },
//         { status: 401 }
//       );
//     }

//     const decoded = verifyToken(token);
//     if (!decoded) {
//       return NextResponse.json(
//         { success: false, error: 'Invalid token' },
//         { status: 401 }
//       );
//     }

//     // ✅ Check if user is admin
//     if (decoded.role !== 'admin' && !decoded.isAdmin) {
//       return NextResponse.json(
//         { success: false, error: 'Admin access required' },
//         { status: 403 }
//       );
//     }

//     const dashCollection = await getDashDataCollection();
    
//     // ✅ Get all users' withdrawal history
//     const allDashData = await dashCollection.find({}).toArray();
    
//     const withdrawals = [];
    
//     allDashData.forEach(dash => {
//       if (dash.withdrawalHistory && Array.isArray(dash.withdrawalHistory) && dash.withdrawalHistory.length > 0) {
//         // ✅ Fixed: Removed :any type annotation
//         dash.withdrawalHistory.forEach((w) => {
//           withdrawals.push({
//             id: w.id || `wdr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
//             reference: w.reference || 'N/A',
//             amount: w.amount || 0,
//             method: w.method || 'bank',
//             bankName: w.details?.bankName || '',
//             accountName: w.details?.accountName || '',
//             accountNumber: w.details?.accountNumber || '',
//             swiftCode: w.details?.swiftCode || '',
//             iban: w.details?.iban || '',
//             walletAddress: w.details?.walletAddress || '',
//             network: w.details?.network || '',
//             status: w.status || 'pending',
//             createdAt: w.createdAt || new Date().toISOString(),
//             userId: dash.userId || '',
//             userEmail: dash.userEmail || 'No email',
//             userName: dash.userName || 'Unknown User'
//           });
//         });
//       }
//     });

//     // ✅ Sort by newest first
//     withdrawals.sort((a, b) => 
//       new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//     );

//     return NextResponse.json({
//       success: true,
//       data: withdrawals
//     });

//   } catch (error) {
//     console.error('Error fetching withdrawals:', error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         error: 'Internal server error: ' + error.message,
//         data: []
//       },
//       { status: 500 }
//     );
//   }
// }
// app/api/admin/withdrawals/route.js
import { NextResponse } from 'next/server';
import { getDashDataCollection } from '@/lib/mongodb';
import { getUsersCollection } from '@/lib/mongodb'; // ✅ ADDED THIS
import { verifyToken, extractToken } from '@/lib/security';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

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

    // ✅ Check if user is admin
    if (decoded.role !== 'admin' && !decoded.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const dashCollection = await getDashDataCollection();
    const usersCollection = await getUsersCollection(); // ✅ ADDED THIS
    
    // ✅ Get all users' withdrawal history
    const allDashData = await dashCollection.find({}).toArray();
    
    // ✅ Build a map of real users so we can pull their emails/names
    let usersMap = {};
    if (allDashData.length > 0) {
      const userIds = allDashData.map(d => d.userId).filter(Boolean);
      const validObjectIds = userIds
        .filter(id => ObjectId.isValid(id))
        .map(id => new ObjectId(id));

      if (validObjectIds.length > 0) {
        const realUsers = await usersCollection.find({ _id: { $in: validObjectIds } }).toArray();
        usersMap = realUsers.reduce((acc, user) => {
          acc[user._id.toString()] = user;
          return acc;
        }, {});
      }
    }

    const withdrawals = [];
    
    allDashData.forEach(dash => {
      if (dash.withdrawalHistory && Array.isArray(dash.withdrawalHistory) && dash.withdrawalHistory.length > 0) {
        // ✅ Fetch the real user for this dashData
        const realUser = usersMap[dash.userId?.toString()];

        dash.withdrawalHistory.forEach((w) => {
          withdrawals.push({
            id: w.id || `wdr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            reference: w.reference || 'N/A',
            amount: w.amount || 0,
            method: w.method || 'bank',
            bankName: w.details?.bankName || '',
            accountName: w.details?.accountName || '',
            accountNumber: w.details?.accountNumber || '',
            swiftCode: w.details?.swiftCode || '',
            iban: w.details?.iban || '',
            walletAddress: w.details?.walletAddress || '',
            network: w.details?.network || '',
            status: w.status || 'pending',
            createdAt: w.createdAt || new Date().toISOString(),
            userId: dash.userId || '',
            // ✅ THE FIX: Pull from users collection if available
            userEmail: realUser?.email || dash.userEmail || 'No email',
            userName: realUser?.username || realUser?.displayName || dash.userName || 'Unknown User'
          });
        });
      }
    });

    // ✅ Sort by newest first
    withdrawals.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: withdrawals
    });

  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error: ' + error.message,
        data: []
      },
      { status: 500 }
    );
  }
}