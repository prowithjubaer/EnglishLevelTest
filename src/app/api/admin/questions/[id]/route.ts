import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

    const updateData: any = {};
    if (body.questionText !== undefined) updateData.questionText = body.questionText;
    if (body.instructionText !== undefined) updateData.instructionText = body.instructionText;
    if (body.questionType !== undefined) updateData.questionType = body.questionType;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.cefrLevel !== undefined) updateData.cefrLevel = body.cefrLevel;
    if (body.difficulty !== undefined) updateData.difficulty = body.difficulty;
    if (body.options !== undefined) updateData.optionsJson = JSON.stringify(body.options);
    if (body.correctAnswer !== undefined) updateData.correctAnswer = body.correctAnswer;
    if (body.explanation !== undefined) updateData.explanation = body.explanation;
    if (body.banglaExplanation !== undefined) updateData.banglaExplanation = body.banglaExplanation;
    if (body.audioUrl !== undefined) updateData.audioUrl = body.audioUrl;
    if (body.marks !== undefined) updateData.marks = body.marks;
    if (body.negativeMarking !== undefined) updateData.negativeMarking = body.negativeMarking;
    if (body.mistakeTags !== undefined) updateData.mistakeTagsJson = JSON.stringify(body.mistakeTags);
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const question = await prisma.question.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, question });
  } catch (error) {
    console.error('Question update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.question.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Question delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
