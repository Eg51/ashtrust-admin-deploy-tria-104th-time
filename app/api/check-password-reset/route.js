// // app/api/check-password-reset/route.js
// import { NextResponse } from 'next/server';
// import { getUserByEmail } from '@/lib/db/users';

// export const runtime = 'nodejs';

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { email } = body;

//     if (!email) {
//       return NextResponse.json(
//         { success: false, error: 'Email is required' },
//         { status: 400 }
//       );
//     }

//     const user = await getUserByEmail(email);
//     if (!user) {
//       return NextResponse.json(
//         { success: false, error: 'User not found' },
//         { status: 404 }
//       );
//     }

//     // Return whether or not the admin has enabled the reset
//     return NextResponse.json({
//       success: true,
//       data: {
//         passwordResetEnabled: user.passwordResetEnabled === true,
//       }
//     });

//   } catch (error) {
//     console.error('Error checking reset status:', error);
//     return NextResponse.json(
//       { success: false, error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }// app/api/check-password-reset/route.js
import { NextResponse } from 'next/server';
import { getUserByEmail, getUserByUsername } from '@/lib/db/users';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, identifier } = body;

    // Support both old (email) and new (identifier) parameter names
    const searchIdentifier = identifier || email;

    if (!searchIdentifier) {
      return NextResponse.json(
        { success: false, error: 'Username or email is required' },
        { status: 400 }
      );
    }

    // First try to find user by email (using existing function)
    let user = await getUserByEmail(searchIdentifier);

    // If not found by email, try to find by username
    if (!user) {
      user = await getUserByUsername(searchIdentifier);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found. Please check your username or email.' },
        { status: 404 }
      );
    }

    // Return whether or not the admin has enabled the reset
    return NextResponse.json({
      success: true,
      data: {
        user: {
          email: user.email,
          username: user.username,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
        },
        passwordResetEnabled: user.passwordResetEnabled === true,
      }
    });

  } catch (error) {
    console.error('Error checking reset status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}