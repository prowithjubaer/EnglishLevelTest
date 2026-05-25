import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const cefrLevel = searchParams.get('cefrLevel') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    if (category) where.category = category;
    if (cefrLevel) where.cefrLevel = cefrLevel;

    const questions = await prisma.question.findMany({
      where,
      orderBy: [{ category: 'asc' }, { cefrLevel: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.question.count({ where });

    return NextResponse.json({ questions, total, page, limit });
  } catch (error) {
    console.error('Questions fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      questionText,
      instructionText,
      questionType,
      category,
      cefrLevel,
      difficulty,
      options,
      correctAnswer,
      explanation,
      banglaExplanation,
      audioUrl,
      marks,
      negativeMarking,
      mistakeTags,
      isActive,
    } = body;

    if (!questionText || !questionType || !category || !cefrLevel || !options || !correctAnswer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        questionText,
        instructionText: instructionText || null,
        questionType,
        category,
        cefrLevel,
        difficulty: difficulty || 'medium',
        optionsJson: JSON.stringify(options),
        correctAnswer,
        explanation: explanation || null,
        banglaExplanation: banglaExplanation || null,
        audioUrl: audioUrl || null,
        marks: marks || 1,
        negativeMarking: negativeMarking || 0,
        mistakeTagsJson: mistakeTags ? JSON.stringify(mistakeTags) : null,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, question });
  } catch (error) {
    console.error('Question create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
