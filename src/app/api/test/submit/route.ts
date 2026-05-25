import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  calculateWeightedScore,
  calculateSectionPercentages,
  determineLevel,
  applyGateRules,
  calculateTestConfidence,
  detectRepeatedPattern,
  identifyWeaknesses,
  getPersonalizedMessage,
  getRecommendedCourse,
  getRecommendedRoadmap,
  SectionScores,
  SectionMaxScores,
  DEFAULT_WEIGHTS,
} from '@/lib/scoring';

interface SubmittedAnswer {
  questionId: string;
  selectedAnswer: string | null;
  timeSpentSeconds: number;
  skipped: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { attemptId, answers, totalTimeSeconds } = body as {
      attemptId: string;
      answers: SubmittedAnswer[];
      totalTimeSeconds: number;
    };

    if (!attemptId || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get attempt
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: { lead: true },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    // Get questions for this attempt
    const questionIds = answers.map((a) => a.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
    });

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    // Score each answer
    const sectionScores: SectionScores = {
      grammar: 0,
      vocabulary: 0,
      sentenceMaking: 0,
      listening: 0,
      speakingReadiness: 0,
      realLifeCommunication: 0,
      learningBehavior: 0,
    };

    const sectionMaxScores: SectionMaxScores = {
      grammar: 0,
      vocabulary: 0,
      sentenceMaking: 0,
      listening: 0,
      speakingReadiness: 0,
      realLifeCommunication: 0,
      learningBehavior: 0,
    };

    const categoryToSection: Record<string, keyof SectionScores> = {
      grammar: 'grammar',
      vocabulary: 'vocabulary',
      sentence_making: 'sentenceMaking',
      listening: 'listening',
      speaking_readiness: 'speakingReadiness',
      real_life_communication: 'realLifeCommunication',
      learning_behavior: 'learningBehavior',
    };

    const allMistakeTags: string[] = [];
    const answerRecords: any[] = [];
    const selectedOptions: string[] = [];
    let tooFastCount = 0;
    let skippedCount = 0;
    let attentionCheckPassed = true;

    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) continue;

      const section = categoryToSection[question.category];
      if (!section) continue;

      const marks = question.marks;
      sectionMaxScores[section] += marks;

      let isCorrect = false;
      let score = 0;

      if (answer.skipped) {
        skippedCount++;
      } else if (answer.selectedAnswer !== null) {
        selectedOptions.push(answer.selectedAnswer);

        // Check attention check questions
        if (question.questionType === 'attention_check') {
          if (answer.selectedAnswer !== question.correctAnswer) {
            attentionCheckPassed = false;
          }
          isCorrect = answer.selectedAnswer === question.correctAnswer;
          score = isCorrect ? marks : 0;
        } else if (question.questionType === 'self_assessment' || question.questionType === 'habit') {
          // For self-assessment, scoring is based on option index
          const options = JSON.parse(question.optionsJson);
          const selectedIndex = options.indexOf(answer.selectedAnswer);
          // Higher index = better score (scaled)
          score = (selectedIndex / Math.max(options.length - 1, 1)) * marks;
          isCorrect = score > marks * 0.5;
        } else {
          // Standard MCQ/fill/word_order/etc
          isCorrect = answer.selectedAnswer === question.correctAnswer;
          score = isCorrect ? marks : 0;

          // Apply negative marking if configured
          if (!isCorrect && question.negativeMarking > 0) {
            score = -question.negativeMarking;
          }
        }

        // Track too-fast answers (< 3 seconds)
        if (answer.timeSpentSeconds < 3) tooFastCount++;

        // Collect mistake tags for wrong answers
        if (!isCorrect && question.mistakeTagsJson) {
          const tags = JSON.parse(question.mistakeTagsJson);
          allMistakeTags.push(...tags);
        }
      }

      sectionScores[section] += Math.max(0, score);

      answerRecords.push({
        attemptId,
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        score: Math.max(0, score),
        timeSpentSeconds: answer.timeSpentSeconds,
        skipped: answer.skipped,
        mistakeTagsJson: !isCorrect && question.mistakeTagsJson ? question.mistakeTagsJson : null,
      });
    }

    // Save all answers
    await prisma.answer.createMany({ data: answerRecords });

    // Calculate weighted score
    const weightedScore = calculateWeightedScore(sectionScores, sectionMaxScores, DEFAULT_WEIGHTS);
    const sectionPercentages = calculateSectionPercentages(sectionScores, sectionMaxScores);

    // Determine level
    let { level, cefrLevel } = determineLevel(weightedScore);

    // Apply gate rules
    ({ level, cefrLevel } = applyGateRules(level, cefrLevel, sectionPercentages));

    // Calculate test confidence
    const repeatedPattern = detectRepeatedPattern(selectedOptions);
    const testConfidence = calculateTestConfidence(
      answers.length,
      answers.length - skippedCount,
      skippedCount,
      totalTimeSeconds,
      tooFastCount,
      attentionCheckPassed,
      repeatedPattern
    );

    // Identify weaknesses
    const weaknesses = identifyWeaknesses(sectionPercentages, allMistakeTags);

    // Get personalized message
    const personalizedMessage = getPersonalizedMessage(level);

    // Get recommended course
    const recommendedCourse = getRecommendedCourse(level, attempt.lead.goal);

    // Get roadmap
    const roadmap = getRecommendedRoadmap(level);

    // Calculate total raw score
    const totalRaw = Object.values(sectionScores).reduce((a, b) => a + b, 0);
    const totalMax = Object.values(sectionMaxScores).reduce((a, b) => a + b, 0);
    const totalScore = totalMax > 0 ? Math.round((totalRaw / totalMax) * 100) : 0;

    // Update attempt
    await prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        totalScore,
        weightedScore,
        level,
        cefrLevel,
        testConfidence,
        grammarScore: sectionPercentages.grammar,
        vocabularyScore: sectionPercentages.vocabulary,
        sentenceMakingScore: sectionPercentages.sentenceMaking,
        listeningScore: sectionPercentages.listening,
        speakingReadinessScore: sectionPercentages.speakingReadiness,
        realLifeScore: sectionPercentages.realLifeCommunication,
        learningBehaviorScore: sectionPercentages.learningBehavior,
        weaknessesJson: JSON.stringify(weaknesses),
        recommendedCourse,
        recommendedRoadmapJson: JSON.stringify(roadmap),
        completedAt: new Date(),
        timeSpentSeconds: totalTimeSeconds,
        status: 'completed',
      },
    });

    // Log action
    await prisma.leadAction.create({
      data: {
        leadId: attempt.leadId,
        attemptId,
        actionType: 'test_completed',
      },
    });

    return NextResponse.json({
      success: true,
      result: {
        attemptId,
        totalScore,
        weightedScore,
        level,
        cefrLevel,
        testConfidence,
        sectionPercentages,
        weaknesses,
        personalizedMessage,
        recommendedCourse,
        roadmap,
      },
    });
  } catch (error) {
    console.error('Test submit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
