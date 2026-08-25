// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { getUserByEmail, getUserByUsername, updateUser } from '@/lib/db/users';
import { comparePassword, generateToken } from '@/lib/security';
import { saveSession } from '@/lib/session';

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

    // Try to find by email first, then by username
    let user = await getUserByEmail(identifier);
    if (!user) {
      user = await getUserByUsername(identifier);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Account not found, please create an account' },
        { status: 401 }
      );
    }

    // 🔒 CHECK ACCOUNT LOCKOUT
    const now = new Date();
    if (user.lockUntil && new Date(user.lockUntil) > now) {
      return NextResponse.json(
        { error: 'Account locked. Contact an administrator to unlock.', remainingAttempts: 0 },
        { status: 429 }
      );
    }

    // Verify password
    const isValid = await comparePassword(password, user.password);
    
    if (!isValid) {
      // ❌ Handle failed attempt
      let attempts = (user.loginAttempts || 0) + 1;
      let lockUntil = null;
      
      // 🟢 Attempts reduced to 2
      let remaining = 1 - attempts;

      if (attempts >= 2) {
        // 🔒 LOCK INDEFINITELY (Year 9999) until the Admin manually unlocks!
        lockUntil = new Date('9999-12-31T23:59:59.999Z'); 
        remaining = '';
      }

      // Update DB with new attempts and lockUntil
      await updateUser(user._id, { loginAttempts: attempts, lockUntil });

      return NextResponse.json(
        { 
          error: 'Invalid credentials', 
          remainingAttempts: remaining,
          lockedUntil: lockUntil 
        },
        { status: 401 }
      );
    }

    // ✅ SUCCESS - Reset attempts
    await updateUser(user._id, { loginAttempts: 0, lockUntil: null });

    // ✅ Generate JWT token
    const token = generateToken({
      id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
 
    const refreshedToken = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    }, { expiresIn: '1h' });

    const sessionId = await saveSession({
      userId: user._id.toString(),
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName || user.username,
      userAgent: request.headers.get('user-agent') || '',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    });

    const { password: _, ...userWithoutPassword } = user;
    const userResponse = {
      ...userWithoutPassword,
      id: user._id.toString(),
      _id: user._id.toString(),
      isAdmin: user.role === 'admin'
    };

    const response = NextResponse.json({
      success: true,
      token,
      refreshedToken,
      sessionId,
      user: userResponse,
      remainingAttempts: 2, // reset to max attempts
    });

    const isSecure = process.env.NODE_ENV === 'production';
    response.cookies.set('sessionId', sessionId, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 3600, 
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}