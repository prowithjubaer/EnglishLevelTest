'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import QuestionCard from './QuestionCard';
import { Clock } from 'lucide-react';

interface Question {
  id: string;
  questionText: string;
  instructionText: string | null;
  questionType: string;
  category: string;
  cefrLevel: string;
  options: string[];
  audioUrl: string | null;
  marks: number;
}

interface TestData {
  attemptId: string;
  questions: Question[];
  testMode: { name: string; durationMinutes: number };
}

interface AnswerRecord {
  questionId: string;
  selectedAnswer: string | null;
  timeSpentSeconds: number;
  skipped: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  grammar: 'Grammar in Use',
  vocabulary: 'Vocabulary in Context',
  sentence_making: 'Sentence Making',
  listening: 'Listening',
  speaking_readiness: 'Speaking Readiness',
  real_life_communication: 'Real-life Communication',
  learning_behavior: 'Learning Behavior / Habit',
};

const SECTION_MESSAGES: Record<string, string> = {
  grammar: '🧠 এখন আপনার grammar in use check করা হবে।',
  vocabulary: '📚 এখন vocabulary check করা হবে—শুধু meaning না, use করতে পারেন কিনা।',
  sentence_making: '✍️ এখন দেখবো আপনি sentence বানাতে পারেন কিনা।',
  listening: '🎧 এখন listening skill check করা হবে। মনোযোগ দিয়ে শুনুন।',
  speaking_readiness: '🗣️ এখন speaking readiness check করা হবে। সত্যি answer দিন।',
  real_life_communication: '💬 এখন real-life communication check করা হবে।',
  learning_behavior: '📋 শেষ section—আপনার learning habit সম্পর্কে জানতে চাই।',
};

const PROGRESS_MESSAGES = [
  { at: 5, msg: 'Great! আপনার basic understanding check হচ্ছে। 👍' },
  { at: 15, msg: 'চমৎকার! আপনি ভালো করছেন। Keep going! 🌟' },
  { at: 25, msg: 'প্রায় অর্ধেক হয়ে গেছে! You\'re doing great! 💪' },
  { at: 35, msg: 'শেষের দিকে! আর কিছুক্ষণ... ⭐' },
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function TestEngine({ testData }: { testData: TestData }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [testStartTime] = useState(Date.now());
  const [showSectionIntro, setShowSectionIntro] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [currentSection, setCurrentSection] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { questions, attemptId } = testData;
  const totalQuestions = questions.length;
  const progress = ((currentIndex) / totalQuestions) * 100;

  // Timer - cannot be paused
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - testStartTime) / 1000));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testStartTime]);

  useEffect(() => {
    if (currentIndex < totalQuestions) {
      const newSection = questions[currentIndex].category;
      if (newSection !== currentSection) {
        setCurrentSection(newSection);
        setShowSectionIntro(true);
      }
      setQuestionStartTime(Date.now());

      const msg = PROGRESS_MESSAGES.find(m => m.at === currentIndex);
      if (msg) {
        setProgressMessage(msg.msg);
        setTimeout(() => setProgressMessage(''), 3000);
      }
    }
  }, [currentIndex]);

  const handleAnswer = useCallback((selectedAnswer: string | null, skipped: boolean) => {
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

    const record: AnswerRecord = {
      questionId: questions[currentIndex].id,
      selectedAnswer,
      timeSpentSeconds: timeSpent,
      skipped,
    };

    const newAnswers = [...answers, record];
    setAnswers(newAnswers);

    if (currentIndex + 1 >= totalQuestions) {
      submitTest(newAnswers);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, questionStartTime, answers, questions, totalQuestions]);

  const submitTest = async (finalAnswers: AnswerRecord[]) => {
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    const totalTimeSeconds = Math.round((Date.now() - testStartTime) / 1000);

    try {
      const res = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          answers: finalAnswers,
          totalTimeSeconds,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Store questions + answers for review page
        const reviewData = questions.map((q, i) => ({
          question: q,
          selectedAnswer: finalAnswers[i]?.selectedAnswer || null,
          skipped: finalAnswers[i]?.skipped || false,
        }));
        sessionStorage.setItem('testReview', JSON.stringify(reviewData));
        sessionStorage.setItem('testResult', JSON.stringify(data.result));
        sessionStorage.setItem('attemptId', attemptId);
        sessionStorage.setItem('testTimeSeconds', totalTimeSeconds.toString());
        router.push('/result');
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center animate-fadeInUp">
          <div className="w-20 h-20 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-brand-navy mb-2">আপনার Result তৈরি হচ্ছে...</h2>
          <p className="text-gray-500 font-bangla">Score, weakness এবং ৭৫ দিনের roadmap প্রস্তুত করা হচ্ছে</p>
        </div>
      </div>
    );
  }

  if (showSectionIntro && currentSection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="card max-w-lg w-full text-center animate-fadeInUp">
          <div className="text-4xl mb-4">
            {currentSection === 'grammar' && '🧠'}
            {currentSection === 'vocabulary' && '📚'}
            {currentSection === 'sentence_making' && '✍️'}
            {currentSection === 'listening' && '🎧'}
            {currentSection === 'speaking_readiness' && '🗣️'}
            {currentSection === 'real_life_communication' && '💬'}
            {currentSection === 'learning_behavior' && '📋'}
          </div>
          <h2 className="text-xl font-bold text-brand-navy mb-2">
            {CATEGORY_LABELS[currentSection]}
          </h2>
          <p className="text-gray-600 font-bangla mb-6">
            {SECTION_MESSAGES[currentSection]}
          </p>
          <button
            onClick={() => setShowSectionIntro(false)}
            className="btn-primary"
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  if (currentIndex >= totalQuestions) return null;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header with Timer */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-medium">
              {CATEGORY_LABELS[currentQuestion.category]}
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-brand-navy text-white px-3 py-1 rounded-full text-xs font-mono">
                <Clock className="w-3 h-3" />
                {formatTime(elapsedSeconds)}
              </div>
              <span className="text-xs text-gray-500">
                {currentIndex + 1} / {totalQuestions}
              </span>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Progress message */}
      {progressMessage && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center text-sm text-green-700 font-bangla animate-fadeInUp">
            {progressMessage}
          </div>
        </div>
      )}

      {/* Question - wider on desktop */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          onAnswer={handleAnswer}
        />
      </div>
    </div>
  );
}
