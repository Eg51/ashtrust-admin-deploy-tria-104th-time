// app/api/auth/check-user/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getUserByEmail, getUserByUsername } from '@/lib/db/users';
import { isValidEmail, sanitizeInput, isAccountLocked, isValidUsername } from '@/lib/security';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const username = searchParams.get('username');

    // Validate that at least one parameter is provided
    if (!email && !username) {
      return NextResponse.json(
        { success: false, error: 'Email or username parameter required' },
        { status: 400 }
      );
    }

    let user = null;
    let identifier = '';

    // Check by email if provided
    if (email) {
      const sanitizedEmail = sanitizeInput(email);
      
      if (!isValidEmail(sanitizedEmail)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400 }
        );
      }
      
      user = await getUserByEmail(sanitizedEmail);
      identifier = sanitizedEmail;
    }

    // Check by username if provided (and no user found by email yet)
    if (username && !user) {
      const sanitizedUsername = sanitizeInput(username);
      
      // Validate username format (3-20 chars, letters/numbers/underscores)
      if (sanitizedUsername && !isValidUsername(sanitizedUsername)) {
        return NextResponse.json(
          { success: false, error: 'Invalid username format. Use 3-20 characters (letters, numbers, underscores).' },
          { status: 400 }
        );
      }
      
      user = await getUserByUsername(sanitizedUsername);
      identifier = sanitizedUsername;
    }

    // Check if account is locked (only if user exists)
    let isLocked = false;
    if (user) {
      isLocked = await isAccountLocked(user.email);
    }

    // Return response with user data (without password)
    return NextResponse.json({
      success: true,
      exists: !!user,
      user: user ? {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        displayName: user.displayName || user.username,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        accountType: user.accountType || 'personal',
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        loginCount: user.loginCount || 0,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      } : null,
      isLocked,
    });

  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}