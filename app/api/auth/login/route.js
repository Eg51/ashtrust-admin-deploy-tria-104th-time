// // // app/api/auth/login/route.js
// // import { NextResponse } from 'next/server';
// // import { getUserByEmail, getUserByUsername, updateUser } from '@/lib/db/users';
// // import { comparePassword, generateToken } from '@/lib/security';
// // import { saveSession } from '@/lib/session';

// // export async function POST(request) {
// //   try {
// //     const body = await request.json();
// //     const { identifier, password } = body;

// //     if (!identifier || !password) {
// //       return NextResponse.json(
// //         { error: 'Missing credentials' },
// //         { status: 400 }
// //       );
// //     }

// //     // ✅ FIX: Parallel database queries
// //     const [userByEmail, userByUsername] = await Promise.all([
// //       getUserByEmail(identifier),
// //       getUserByUsername(identifier),
// //     ]);
// //     let user = userByEmail || userByUsername;

// //     if (!user) {
// //       return NextResponse.json(
// //         { error: 'Account not found, please create an account' },
// //         { status: 401 }
// //       );
// //     }

// //     // Check lockout
// //     const now = new Date();
// //     if (user.lockUntil && new Date(user.lockUntil) > now) {
// //       return NextResponse.json(
// //         { error: 'Account locked. Contact an administrator to unlock.', remainingAttempts: 0 },
// //         { status: 429 }
// //       );
// //     }

// //     // Verify password
// //     const isValid = await comparePassword(password, user.password);
    
// //     if (!isValid) {
// //       let attempts = (user.loginAttempts || 0) + 1;
// //       let lockUntil = null;
// //       let remaining = 1 - attempts;

// //       if (attempts >= 2) {
// //         lockUntil = new Date('9999-12-31T23:59:59.999Z');
// //         remaining = '';
// //       }

// //       await updateUser(user._id, { loginAttempts: attempts, lockUntil });

// //       return NextResponse.json(
// //         { 
// //           error: 'Invalid credentials', 
// //           remainingAttempts: remaining,
// //           lockedUntil: lockUntil 
// //         },
// //         { status: 401 }
// //       );
// //     }

// //     // Reset attempts
// //     await updateUser(user._id, { loginAttempts: 0, lockUntil: null });

// //     // Generate token
// //     const token = generateToken({
// //       id: user._id,
// //       email: user.email,
// //       username: user.username,
// //       firstName: user.firstName,
// //       lastName: user.lastName,
// //       role: user.role,
// //     });

// //     // Save session (optional - don't wait)
// //     let sessionId = null;
// //     try {
// //         sessionId = await saveSession({
// //         userId: user._id.toString(),
// //         username: user.username,
// //         email: user.email, // ✅ THIS LINE WAS MISSING
// //         firstName: user.firstName,
// //         lastName: user.lastName,
// //         displayName: user.displayName || user.username,
// //         userAgent: request.headers.get('user-agent') || '',
// //         ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
// //       });
// //     } catch (sessionError) {
// //       console.warn('Session creation failed (non-critical):', sessionError.message);
// //     }

// //     const { password: _, ...userWithoutPassword } = user;
// //     const userResponse = {
// //       ...userWithoutPassword,
// //       id: user._id.toString(),
// //       _id: user._id.toString(),
// //       isAdmin: user.role === 'admin'
// //     };

// //     const response = NextResponse.json({
// //       success: true,
// //       token,
// //       sessionId,
// //       user: userResponse,
// //       remainingAttempts: 2,
// //     });

// //     if (sessionId) {
// //       const isSecure = process.env.NODE_ENV === 'production';
// //       response.cookies.set('sessionId', sessionId, {
// //         httpOnly: true,
// //         secure: isSecure,
// //         sameSite: 'lax',
// //         path: '/',
// //         maxAge: 1800,
// //       });
// //     }

// //     return response;

// //   } catch (error) {
// //     console.error('Login error:', error);
// //     return NextResponse.json(
// //       { error: 'Server error' },
// //       { status: 500 }
// //     );
// //   }
// // }

// // app/api/auth/login/route.js
// import { NextResponse } from 'next/server';
// import { getUserByEmail, getUserByUsername, updateUser } from '@/lib/db/users';
// import { comparePassword, generateToken } from '@/lib/security';
// import { saveSession } from '@/lib/session';

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { identifier, password } = body;

//     if (!identifier || !password) {
//       return NextResponse.json(
//         { error: 'Missing credentials' },
//         { status: 400 }
//       );
//     }

//     // ✅ FIX: Parallel database queries
//     const [userByEmail, userByUsername] = await Promise.all([
//       getUserByEmail(identifier),
//       getUserByUsername(identifier),
//     ]);
//     let user = userByEmail || userByUsername;

//     if (!user) {
//       return NextResponse.json(
//         { error: 'Account not found, please create an account' },
//         { status: 401 }
//       );
//     }

//     // ── GATE 1: Account locked (checked before password for efficiency) ──────
//     const now = new Date();
//     if (user.lockUntil && new Date(user.lockUntil) > now) {
//       return NextResponse.json(
//         {
//           success: false,
//           reason: 'locked',
//           error: 'Account locked. Contact an administrator to unlock.',
//           remainingAttempts: 0,
//           lockedUntil: user.lockUntil,
//           blockMessage: user.loginBlockMessage || null,
//           contactEmail: user.loginBlockContactEmail || null,
//         },
//         { status: 423 } // 423 Locked
//       );
//     }

//     // Verify password
//     const isValid = await comparePassword(password, user.password);

//     if (!isValid) {
//       let attempts = (user.loginAttempts || 0) + 1;
//       let lockUntil = null;
//       let remaining = 1 - attempts;

//       if (attempts >= 2) {
//         lockUntil = new Date('9999-12-31T23:59:59.999Z');
//         remaining = '';
//       }

//       await updateUser(user._id, { loginAttempts: attempts, lockUntil });

//       return NextResponse.json(
//         {
//           error: 'Invalid credentials',
//           remainingAttempts: remaining,
//           lockedUntil: lockUntil,
//         },
//         { status: 401 }
//       );
//     }

//     // ── GATE 2: Account inactive (checked AFTER password verification) ──────
//     // Only someone with the correct password learns the account is inactive.
//     if (user.isActive === false) {
//       return NextResponse.json(
//         {
//           success: false,
//           reason: 'inactive',
//           error: 'Account is deactivated',
//           blockMessage: user.loginBlockMessage || null,
//           contactEmail: user.loginBlockContactEmail || null,
//         },
//         { status: 403 }
//       );
//     }

//     // Reset attempts
//     await updateUser(user._id, { loginAttempts: 0, lockUntil: null });

//     // Generate token
//     const token = generateToken({
//       id: user._id,
//       email: user.email,
//       username: user.username,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       role: user.role,
//     });

//     // Save session (optional - don't wait)
//     let sessionId = null;
//     try {
//       sessionId = await saveSession({
//         userId: user._id.toString(),
//         username: user.username,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         displayName: user.displayName || user.username,
//         userAgent: request.headers.get('user-agent') || '',
//         ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
//       });
//     } catch (sessionError) {
//       console.warn('Session creation failed (non-critical):', sessionError.message);
//     }

//     const { password: _, ...userWithoutPassword } = user;
//     const userResponse = {
//       ...userWithoutPassword,
//       id: user._id.toString(),
//       _id: user._id.toString(),
//       isAdmin: user.role === 'admin',
//     };

//     const response = NextResponse.json({
//       success: true,
//       token,
//       sessionId,
//       user: userResponse,
//       remainingAttempts: 2,
//     });

//     if (sessionId) {
//       const isSecure = process.env.NODE_ENV === 'production';
//       response.cookies.set('sessionId', sessionId, {
//         httpOnly: true,
//         secure: isSecure,
//         sameSite: 'lax',
//         path: '/',
//         maxAge: 1800,
//       });
//     }

//     return response;
//   } catch (error) {
//     console.error('Login error:', error);
//     return NextResponse.json(
//       { error: 'Server error' },
//       { status: 500 }
//     );
//   }
// }
// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { getUserByEmail, getUserByUsername, updateUser } from '@/lib/db/users';
import { comparePassword, generateToken } from '@/lib/security';
import { saveSession } from '@/lib/session';
import { createOrBumpNotification } from '@/lib/db/notifications';

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Missing credentials' },
        { status: 400 }
      );
    }

    // ✅ Parallel database queries
    const [userByEmail, userByUsername] = await Promise.all([
      getUserByEmail(identifier),
      getUserByUsername(identifier),
    ]);
    let user = userByEmail || userByUsername;

    if (!user) {
      return NextResponse.json(
        { error: 'Account not found, please create an account' },
        { status: 401 }
      );
    }

    // Shared notify payload — every branch reuses this shape
    const notifyBase = {
      userId: user._id.toString(),
      username: user.displayName || user.username || 'Unknown',
      email: user.email || '',
      avatar: user.avatar || null,
      metadata: {
        ip:
          request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
          'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        at: new Date().toISOString(),
      },
    };

    // ── GATE 1: Account locked ─────────────────────────────────────────────
    const now = new Date();
    if (user.lockUntil && new Date(user.lockUntil) > now) {
      try {
        await createOrBumpNotification({
          ...notifyBase,
          type: 'login_blocked',
          detail: 'Tried to sign in while account is locked',
          metadata: { ...notifyBase.metadata, lockUntil: user.lockUntil },
        });
      } catch (notifErr) {
        console.warn('[login] notification failed (non-critical):', notifErr?.message);
      }

      return NextResponse.json(
        {
          success: false,
          reason: 'locked',
          error: 'Account locked. Contact an administrator to unlock.',
          remainingAttempts: 0,
          lockedUntil: user.lockUntil,
          blockMessage: user.loginBlockMessage || null,
          contactEmail: user.loginBlockContactEmail || null,
        },
        { status: 423 }
      );
    }

    // Verify password
    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      let attempts = (user.loginAttempts || 0) + 1;
      let lockUntil = null;
      let remaining = 1 - attempts;

      if (attempts >= 2) {
        lockUntil = new Date('9999-12-31T23:59:59.999Z');
        remaining = '';
      }

      await updateUser(user._id, { loginAttempts: attempts, lockUntil });

      try {
        await createOrBumpNotification({
          ...notifyBase,
          type: 'login_failed',
          detail: `Wrong password (attempt ${attempts})`,
          metadata: { ...notifyBase.metadata, attempts, justLocked: !!lockUntil },
        });
      } catch (notifErr) {
        console.warn('[login] notification failed (non-critical):', notifErr?.message);
      }

      return NextResponse.json(
        {
          error: 'Invalid credentials',
          remainingAttempts: remaining,
          lockedUntil: lockUntil,
        },
        { status: 401 }
      );
    }

    // ── GATE 2: Account inactive ───────────────────────────────────────────
    if (user.isActive === false) {
      try {
        await createOrBumpNotification({
          ...notifyBase,
          type: 'login_inactive',
          detail: 'Tried to sign in to a deactivated account',
        });
      } catch (notifErr) {
        console.warn('[login] notification failed (non-critical):', notifErr?.message);
      }

      return NextResponse.json(
        {
          success: false,
          reason: 'inactive',
          error: 'Account is deactivated',
          blockMessage: user.loginBlockMessage || null,
          contactEmail: user.loginBlockContactEmail || null,
        },
        { status: 403 }
      );
    }

    // Reset attempts
    await updateUser(user._id, { loginAttempts: 0, lockUntil: null });

    // ✅ Fire admin notification — non-blocking, login must succeed regardless
    try {
      await createOrBumpNotification({
        ...notifyBase,
        type: 'login',
        detail: `Signed in from ${(request.headers.get('user-agent') || 'unknown device').slice(0, 60)}`,
      });
    } catch (notifErr) {
      console.warn('[login] notification failed (non-critical):', notifErr?.message);
    }

    // Generate token
    const token = generateToken({
      id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });

    // Save session
    let sessionId = null;
    try {
      sessionId = await saveSession({
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName || user.username,
        userAgent: request.headers.get('user-agent') || '',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      });
    } catch (sessionError) {
      console.warn('Session creation failed (non-critical):', sessionError.message);
    }

    const { password: _, ...userWithoutPassword } = user;
    const userResponse = {
      ...userWithoutPassword,
      id: user._id.toString(),
      _id: user._id.toString(),
      isAdmin: user.role === 'admin',
    };

    const response = NextResponse.json({
      success: true,
      token,
      sessionId,
      user: userResponse,
      remainingAttempts: 2,
    });

    if (sessionId) {
      const isSecure = process.env.NODE_ENV === 'production';
      response.cookies.set('sessionId', sessionId, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        path: '/',
        maxAge: 1800,
      });
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}