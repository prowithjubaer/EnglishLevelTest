import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateToken, hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Credentials required' }, { status: 400 });
    }

    // Check if admin exists, if not create default
    let admin = await prisma.adminUser.findUnique({ where: { username } });
    
    if (!admin && username === 'admin') {
      // Create default admin
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
      const hash = await hashPassword(defaultPassword);
      admin = await prisma.adminUser.create({
        data: {
          username: 'admin',
          passwordHash: hash,
          name: 'Admin',
        },
      });
    }

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken({ id: admin.id, username: admin.username });

    const response = NextResponse.json({ success: true, token, name: admin.name });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
