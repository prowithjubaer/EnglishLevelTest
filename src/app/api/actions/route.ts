import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, attemptId, actionType, metadata } = body;

    if (!leadId || !actionType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.leadAction.create({
      data: {
        leadId,
        attemptId: attemptId || null,
        actionType,
        metadataJson: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Action log error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
