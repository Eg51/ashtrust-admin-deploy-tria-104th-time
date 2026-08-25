// // app/api/user/profile/route.js
// import { NextResponse } from 'next/server';
// import { getUserById, updateUser } from '@/lib/db/users';
// import { verifyToken, extractToken, sanitizeInput } from '@/lib/security';

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

//     const userId = decoded.id || decoded.userId;
//     const user = await getUserById(userId);

//     if (!user) {
//       return NextResponse.json(
//         { success: false, error: 'User not found' },
//         { status: 404 }
//       );
//     }

//     const { password, ...userWithoutPassword } = user;

//     return NextResponse.json({
//       success: true,
//       data: {
//         ...userWithoutPassword,
//         id: userWithoutPassword._id.toString(),
//         _id: undefined,
//       },
//     });

//   } catch (error) {
//     console.error('Error fetching profile:', error);
//     return NextResponse.json(
//       { success: false, error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(request) {
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

//     const userId = decoded.id || decoded.userId;
//     const body = await request.json();
//     const { name, phone, address } = body;

//     const updateData = {};
//     if (name) updateData.name = sanitizeInput(name);
//     if (phone) updateData.phone = sanitizeInput(phone);
//     if (address) updateData.address = sanitizeInput(address);

//     if (Object.keys(updateData).length === 0) {
//       return NextResponse.json(
//         { success: false, error: 'No fields to update' },
//         { status: 400 }
//       );
//     }

//     const result = await updateUser(userId, updateData);

//     if (!result) {
//       return NextResponse.json(
//         { success: false, error: 'User not found' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message: 'Profile updated successfully',
//     });

//   } catch (error) {
//     console.error('Error updating profile:', error);
//     return NextResponse.json(
//       { success: false, error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }







// // app/api/user/profile/route.js
// import { NextResponse } from 'next/server';
// import { getUserById, updateUser } from '@/lib/db/users';
// import { sanitizeInput } from '@/lib/security';

// export const runtime = 'nodejs';

// export async function GET(request) {
//   try {
//     const userId = request.headers.get('x-user-id');
//     if (!userId) {
//       return NextResponse.json(
//         { success: false, error: 'Authentication required' },
//         { status: 401 }
//       );
//     }

//     const user = await getUserById(userId);
//     if (!user) {
//       return NextResponse.json(
//         { success: false, error: 'User not found' },
//         { status: 404 }
//       );
//     }

//     const { password, ...userWithoutPassword } = user;
//     return NextResponse.json({
//       success: true,
//       data: {
//         id: userWithoutPassword._id.toString(),
//         firstName: userWithoutPassword.firstName || '',
//         lastName: userWithoutPassword.lastName || '',
//         username: userWithoutPassword.username || '',
//         email: userWithoutPassword.email || '',
//         phone: userWithoutPassword.phone || '',
//         address: userWithoutPassword.address || '',
//         hasAvatar: userWithoutPassword.hasAvatar || false,
//       },
//     });
//   } catch (error) {
//     console.error('Error fetching profile:', error);
//     return NextResponse.json(
//       { success: false, error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(request) {
//   try {
//     const userId = request.headers.get('x-user-id');
//     if (!userId) {
//       return NextResponse.json(
//         { success: false, error: 'Authentication required' },
//         { status: 401 }
//       );
//     }

//     const body = await request.json();
//     const { username, email, phone, address, hasAvatar, avatar } = body;

//     // ... validation (same as before) ...

//     const updateData = {
//       username: sanitizeInput(username.trim()),
//       email: sanitizeInput(email.trim()),
//     };
//     if (phone !== undefined) updateData.phone = sanitizeInput(phone.trim());
//     if (address !== undefined) updateData.address = sanitizeInput(address.trim());
//     if (hasAvatar !== undefined) updateData.hasAvatar = hasAvatar;
//     if (avatar !== undefined) {
//       // validate size, etc.
//       updateData.avatar = avatar;
//     }

//     const result = await updateUser(userId, updateData);
//     if (!result) {
//       return NextResponse.json(
//         { success: false, error: 'User not found' },
//         { status: 404 }
//       );
//     }
//     return NextResponse.json({
//       success: true,
//       message: 'Profile updated successfully',
//     });
//   } catch (error) {
//     console.error('Error updating profile:', error);
//     return NextResponse.json(
//       { success: false, error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }


// app/api/user/profile/route.js
import { NextResponse } from 'next/server';
import { getUserById, updateUser } from '@/lib/db/users';
import { sanitizeInput } from '@/lib/security';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({
      success: true,
      data: {
        id: userWithoutPassword._id.toString(),
        firstName: userWithoutPassword.firstName || '',
        lastName: userWithoutPassword.lastName || '',
        username: userWithoutPassword.username || '',
        email: userWithoutPassword.email || '',
        phone: userWithoutPassword.phone || '',
        address: userWithoutPassword.address || '',
        displayName: userWithoutPassword.displayName || '', // ✅ return displayName
        hasAvatar: userWithoutPassword.hasAvatar || false,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { username, email, phone, address, displayName, hasAvatar, avatar } = body;

    // Validation
    if (!username?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 }
      );
    }
    if (!email?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const updateData = {
      username: sanitizeInput(username.trim()),
      email: sanitizeInput(email.trim()),
    };
    if (displayName !== undefined) updateData.displayName = sanitizeInput(displayName.trim());
    if (phone !== undefined) updateData.phone = sanitizeInput(phone.trim());
    if (address !== undefined) updateData.address = sanitizeInput(address.trim());
    if (hasAvatar !== undefined) updateData.hasAvatar = hasAvatar;
    if (avatar !== undefined) {
      const avatarSizeKB = Math.round((avatar.length * 3) / 4 / 1024);
      if (avatarSizeKB > 120) {
        return NextResponse.json(
          { success: false, error: 'Avatar must be under 100KB' },
          { status: 400 }
        );
      }
      updateData.avatar = avatar;
    }

    const result = await updateUser(userId, updateData);
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}