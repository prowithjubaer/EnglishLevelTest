import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { selectQuestionsForTest } from '@/lib/adaptive';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, testModeSlug } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
    }

    // Get test mode (default to standard)
    const testMode = await prisma.testMode.findFirst({
      where: { 
        slug: testModeSlug || 'standard',
        isActive: true 
      },
    });

    if (!testMode) {
      return NextResponse.json({ error: 'Test mode not found' }, { status: 404 });
    }

    // Get lead info for goal-based questions
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });

    // Get all active questions
    const allQuestions = await prisma.question.findMany({
      where: { isActive: true },
    });

    const questionsPerSection = JSON.parse(testMode.questionsPerSectionJson);

    // Select questions using adaptive logic
    const selectedQuestions = selectQuestionsForTest(
      allQuestions,
      { questionsPerSection, adaptiveEnabled: testMode.adaptiveEnabled },
      lead?.goal
    );

    // Create test attempt
    const attempt = await prisma.testAttempt.create({
      data: {
        leadId,
        testModeId: testMode.id,
        status: 'in_progress',
      },
    });

    // Log action
    await prisma.leadAction.create({
      data: {
        leadId,
        attemptId: attempt.id,
        actionType: 'test_started',
      },
    });

    // Return questions (without correct answers)
    const questionsForClient = selectedQuestions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      instructionText: q.instructionText,
      questionType: q.questionType,
      category: q.category,
      cefrLevel: q.cefrLevel,
      options: JSON.parse(q.optionsJson),
      audioUrl: q.audioUrl,
      marks: q.marks,
    }));

    return NextResponse.json({
      attemptId: attempt.id,
      questions: questionsForClient,
      testMode: {
        name: testMode.name,
        durationMinutes: testMode.durationMinutes,
      },
    });
  } catch (error) {
    console.error('Test start error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
