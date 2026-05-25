import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalLeads,
      todayLeads,
      totalAttempts,
      completedAttempts,
      incompleteAttempts,
      whatsappClicks,
      courseClicks,
      pdfDownloads,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: today } } }),
      prisma.testAttempt.count(),
      prisma.testAttempt.count({ where: { status: 'completed' } }),
      prisma.testAttempt.count({ where: { status: { not: 'completed' } } }),
      prisma.leadAction.count({ where: { actionType: 'whatsapp_clicked' } }),
      prisma.leadAction.count({ where: { actionType: 'course_link_clicked' } }),
      prisma.leadAction.count({ where: { actionType: 'pdf_downloaded' } }),
    ]);

    // Level distribution
    const levelDist = await prisma.testAttempt.groupBy({
      by: ['level'],
      _count: true,
      where: { status: 'completed', level: { not: null } },
    });

    // Average score
    const avgScore = await prisma.testAttempt.aggregate({
      _avg: { weightedScore: true },
      where: { status: 'completed' },
    });

    // Goal distribution
    const goalDist = await prisma.lead.groupBy({
      by: ['goal'],
      _count: true,
    });

    // Hot leads (whatsapp clicked or course clicked)
    const hotLeadIds = await prisma.leadAction.findMany({
      where: { actionType: { in: ['whatsapp_clicked', 'course_link_clicked'] } },
      select: { leadId: true },
      distinct: ['leadId'],
    });

    return NextResponse.json({
      totalLeads,
      todayLeads,
      totalAttempts,
      completedAttempts,
      incompleteAttempts,
      whatsappClicks,
      courseClicks,
      pdfDownloads,
      hotLeads: hotLeadIds.length,
      averageScore: Math.round(avgScore._avg.weightedScore || 0),
      levelDistribution: levelDist.map((l) => ({ level: l.level, count: l._count })),
      goalDistribution: goalDist.map((g) => ({ goal: g.goal, count: g._count })),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
