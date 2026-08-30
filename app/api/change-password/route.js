// // app/api/change-password/route.js
// import { NextResponse } from 'next/server';
// import { getUserById, getUserByEmail, updateUser } from '@/lib/db/users';
// import { verifyToken, extractToken, comparePassword, hashPassword } from '@/lib/security';

// export const runtime = 'nodejs';

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { email, currentPassword, newPassword } = body;

//     if (!newPassword) {
//       return NextResponse.json(
//         { success: false, error: 'New password is required' },
//         { status: 400 }
//       );
//     }

//     // 1. Try to get the user from the Token (if logged in)
//     let user = null;
//     let isLoggedIn = false;

//     const authHeader = request.headers.get('authorization');
//     const token = extractToken(authHeader);

//     if (token) {
//       const decoded = verifyToken(token);
//       if (decoded) {
//         user = await getUserById(decoded.id || decoded.userId);
//         isLoggedIn = true;
//       }
//     }

//     // 2. If not logged in, try to find user by email (Login Page reset)
//     if (!user && email) {
//       user = await getUserByEmail(email);
//     }

//     if (!user) {
//       return NextResponse.json(
//         { success: false, error: 'User not found' },
//         { status: 404 }
//       );
//     }

//     // 3. Security Check:
//     if (isLoggedIn) {
//       // Scenario A: User is logged in, verify current password
//       if (!currentPassword) {
//         return NextResponse.json(
//           { success: false, error: 'Current password is required' },
//           { status: 400 }
//         );
//       }

//       const isPasswordValid = await comparePassword(currentPassword, user.password);
//       if (!isPasswordValid) {
//         return NextResponse.json(
//           { success: false, error: 'Current password is incorrect' },
//           { status: 401 }
//         );
//       }
//     } else {
//       // Scenario B: User is on Login Page, check if admin enabled reset
//       if (!user.passwordResetEnabled) {
//         return NextResponse.json(
//           { success: false, error: 'Password reset is not enabled. Contact admin.' },
//           { status: 403 }
//         );
//       }
//     }

//     // 4. Hash the new password and update the database
//     const hashedNewPassword = await hashPassword(newPassword);
//     const result = await updateUser(user._id.toString(), { password: hashedNewPassword });

//     if (!result) {
//       return NextResponse.json(
//         { success: false, error: 'Failed to update password' },
//         { status: 500 }
//       );
//     }

//     // 5. If it was a Login Page reset, disable the toggle so it can't be reused
//     if (!isLoggedIn) {
//       await updateUser(user._id.toString(), { passwordResetEnabled: false });
//     }

//     return NextResponse.json({ success: true, message: 'Password updated successfully' });

//   } catch (error) {
//     console.error('Error changing password:', error);
//     return NextResponse.json(
//       { success: false, error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }// app/api/change-password/route.js
import { NextResponse } from 'next/server';
import { getUserById, getUserByEmail, getUserByUsername, updateUser } from '@/lib/db/users';
import { verifyToken, extractToken, comparePassword, hashPassword } from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, currentPassword, newPassword, identifier } = body;

    if (!newPassword) {
      return NextResponse.json(
        { success: false, error: 'New password is required' },
        { status: 400 }
      );
    }

    // 1. Try to get the user from the Token (if logged in)
    let user = null;
    let isLoggedIn = false;

    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        user = await getUserById(decoded.id || decoded.userId);
        isLoggedIn = true;
      }
    }

    // 2. If not logged in, try to find user by email or username
    const searchIdentifier = identifier || email;
    
    if (!user && searchIdentifier) {
      // First try by email
      user = await getUserByEmail(searchIdentifier);
      
      // If not found, try by username
      if (!user) {
        user = await getUserByUsername(searchIdentifier);
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // 3. Security Check:
    if (isLoggedIn) {
      // Scenario A: User is logged in, verify current password
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password is required' },
          { status: 400 }
        );
      }

      const isPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 401 }
        );
      }
    } else {
      // Scenario B: User is on Login Page, check if admin enabled reset
      if (!user.passwordResetEnabled) {
        return NextResponse.json(
          { success: false, error: 'Password reset is not enabled. Contact admin.' },
          { status: 403 }
        );
      }
    }

    // 4. Hash the new password and update the database
    const hashedNewPassword = await hashPassword(newPassword);
    const result = await updateUser(user._id.toString(), { password: hashedNewPassword });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to update password' },
        { status: 500 }
      );
    }

    // 5. If it was a Login Page reset, disable the toggle so it can't be reused
    if (!isLoggedIn) {
      await updateUser(user._id.toString(), { passwordResetEnabled: false });
    }

    return NextResponse.json({ success: true, message: 'Password updated successfully' });

  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}