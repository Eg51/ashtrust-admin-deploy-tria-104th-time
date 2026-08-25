// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { createUser, getUserByEmail, getUserByUsername } from '@/lib/db/users';
import { hashPassword } from '@/lib/security';

export async function POST(request) {
  try {
    const body = await request.json();
    const { firstName, lastName, username, displayName, email, phone, password, accountType } = body;

    // Basic validation
    if (!firstName || !lastName || !username || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Check if username already exists
    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already in use by another user' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await createUser({
      firstName,
      lastName,
      username,
      displayName: displayName || username,
      email,
      phone: phone || '',
      password: hashedPassword,
      accountType: accountType || 'personal',
      isActive: true,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please log in.',
      user: userWithoutPassword,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}