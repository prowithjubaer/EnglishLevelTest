import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, whatsapp, email, goal } = body;

    if (!name || !whatsapp || !goal) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        whatsapp: whatsapp.replace(/[\s\-]/g, ''),
        email: email || null,
        goal,
      },
    });

    return NextResponse.json({ leadId: lead.id, success: true });
  } catch (error) {
    console.error('Lead creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const goal = searchParams.get('goal') || '';
    const level = searchParams.get('level') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { whatsapp: { contains: search } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        attempts: {
          orderBy: { startedAt: 'desc' },
          take: 1,
        },
        actions: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.lead.count({ where });

    return NextResponse.json({ leads, total, page, limit });
  } catch (error) {
    console.error('Lead fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
