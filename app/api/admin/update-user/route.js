// app/api/admin/update-user/route.js
import { NextResponse } from 'next/server';
import { updateUser, getUserById } from '@/lib/db/users';
import { verifyToken, extractToken } from '@/lib/security';

export const runtime = 'nodejs';

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

    // Check if user is admin
    if (!decoded.isAdmin && decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json(); // ✅ Merged: Moved back inside
    const { targetUserId, isVerified, isActive, role, passwordResetEnabled } = body; // ✅ Merged

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'Target user ID required' },
        { status: 400 }
      );
    }

    const updateData = {}; // ✅ Merged: Moved back inside
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (role !== undefined) updateData.role = role;
    if (passwordResetEnabled !== undefined) updateData.passwordResetEnabled = passwordResetEnabled; // ✅ Added

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update the user in the database
    const result = await updateUser(targetUserId, updateData);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'User not found or failed to update' },
        { status: 404 }
      );
    }

    // Fetch the updated user and format it exactly like the GET route
    const updatedUser = await getUserById(targetUserId);
    
    return NextResponse.json({
      success: true,
      data: {
        ...updatedUser,
        id: updatedUser._id.toString(),
        _id: undefined,
        password: undefined,
      },
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}