import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPersonalizedMessage, getRecommendedRoadmap, WEAKNESS_MESSAGES } from '@/lib/scoring';

export async function GET(
  request: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  try {
    const { attemptId } = params;

    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: { lead: true },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 });
    }

    if (attempt.status !== 'completed') {
      return NextResponse.json({ error: 'Test not completed' }, { status: 400 });
    }

    const weaknesses = JSON.parse(attempt.weaknessesJson || '[]');
    const roadmap = attempt.recommendedRoadmapJson 
      ? JSON.parse(attempt.recommendedRoadmapJson)
      : getRecommendedRoadmap(attempt.level || 'Basic');

    const weaknessMessages: Record<string, string> = {};
    for (const w of weaknesses) {
      weaknessMessages[w] = WEAKNESS_MESSAGES[w] || w;
    }

    return NextResponse.json({
      attemptId: attempt.id,
      name: attempt.lead.name,
      whatsapp: attempt.lead.whatsapp,
      goal: attempt.lead.goal,
      totalScore: attempt.totalScore,
      weightedScore: attempt.weightedScore,
      level: attempt.level,
      cefrLevel: attempt.cefrLevel,
      testConfidence: attempt.testConfidence,
      sectionScores: {
        grammar: attempt.grammarScore,
        vocabulary: attempt.vocabularyScore,
        sentenceMaking: attempt.sentenceMakingScore,
        listening: attempt.listeningScore,
        speakingReadiness: attempt.speakingReadinessScore,
        realLifeCommunication: attempt.realLifeScore,
        learningBehavior: attempt.learningBehaviorScore,
      },
      weaknesses,
      weaknessMessages,
      personalizedMessage: getPersonalizedMessage(attempt.level || 'Basic'),
      recommendedCourse: attempt.recommendedCourse,
      roadmap,
      completedAt: attempt.completedAt,
      timeSpentSeconds: attempt.timeSpentSeconds,
    });
  } catch (error) {
    console.error('Result fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
