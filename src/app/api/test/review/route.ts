import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const attemptId = searchParams.get('attemptId');

    if (!attemptId) {
      return NextResponse.json({ error: 'Attempt ID required' }, { status: 400 });
    }

    const answers = await prisma.answer.findMany({
      where: { attemptId },
      include: { question: true },
      orderBy: { createdAt: 'asc' },
    });

    const reviewItems = answers.map(a => ({
      question: {
        id: a.question.id,
        questionText: a.question.questionText,
        questionType: a.question.questionType,
        category: a.question.category,
        cefrLevel: a.question.cefrLevel,
        options: JSON.parse(a.question.optionsJson),
        audioUrl: a.question.audioUrl,
      },
      selectedAnswer: a.selectedAnswer,
      skipped: a.skipped,
      correctAnswer: a.question.correctAnswer,
      banglaExplanation: a.question.banglaExplanation,
    }));

    return NextResponse.json({ reviewItems });
  } catch (error) {
    console.error('Review fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
