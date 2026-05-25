'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, MinusCircle, ArrowLeft, Volume2 } from 'lucide-react';

interface ReviewItem {
  question: {
    id: string;
    questionText: string;
    questionType: string;
    category: string;
    cefrLevel: string;
    options: string[];
    audioUrl: string | null;
  };
  selectedAnswer: string | null;
  skipped: boolean;
  correctAnswer?: string;
  banglaExplanation?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  grammar: 'Grammar in Use',
  vocabulary: 'Vocabulary in Context',
  sentence_making: 'Sentence Making',
  listening: 'Listening',
  speaking_readiness: 'Speaking Readiness',
  real_life_communication: 'Real-life Communication',
  learning_behavior: 'Learning Behavior',
};

export default function ReviewPage() {
  const router = useRouter();
  const [reviewData, setReviewData] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('testReview');
    const attemptId = sessionStorage.getItem('attemptId');
    if (!stored || !attemptId) {
      router.push('/');
      return;
    }
    // Fetch correct answers from API
    fetchReviewWithAnswers(attemptId, JSON.parse(stored));
  }, []);

  const fetchReviewWithAnswers = async (attemptId: string, localData: ReviewItem[]) => {
    try {
      const res = await fetch(`/api/results/${attemptId}`);
      const result = await res.json();
      // We'll also fetch questions with correct answers for review
      const qRes = await fetch(`/api/test/review?attemptId=${attemptId}`);
      if (qRes.ok) {
        const qData = await qRes.json();
        setReviewData(qData.reviewItems || localData);
      } else {
        setReviewData(localData);
      }
    } catch {
      setReviewData(localData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.push('/result')} className="flex items-center gap-2 text-brand-navy hover:text-brand-red transition text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Result
          </button>
          <h1 className="text-lg font-bold text-brand-navy">Answer Review</h1>
          <span className="text-xs text-gray-500">{reviewData.length} questions</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-4">
        {reviewData.map((item, index) => {
          const isCorrect = item.selectedAnswer === item.correctAnswer;
          const isSkipped = item.skipped;
          const isTTS = item.question.audioUrl?.startsWith('tts:');
          const ttsText = isTTS ? item.question.audioUrl!.slice(4) : null;

          return (
            <div key={index} className={`bg-white rounded-xl border-2 p-5 ${
              isSkipped ? 'border-gray-300' : isCorrect ? 'border-green-200' : 'border-red-200'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                    Q{index + 1}
                  </span>
                  <span className="text-xs text-gray-500">{CATEGORY_LABELS[item.question.category]}</span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">{item.question.cefrLevel}</span>
                </div>
                <div>
                  {isSkipped ? (
                    <span className="flex items-center gap-1 text-xs text-gray-500"><MinusCircle className="w-4 h-4" /> Skipped</span>
                  ) : isCorrect ? (
                    <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="w-4 h-4" /> Correct</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-red-600"><XCircle className="w-4 h-4" /> Wrong</span>
                  )}
                </div>
              </div>

              {/* Question */}
              <p className="text-sm font-medium text-brand-navy mb-3 font-bangla whitespace-pre-line">
                {item.question.questionText}
              </p>

              {/* TTS replay for listening */}
              {ttsText && (
                <div className="mb-3 bg-blue-50 rounded-lg p-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      const utterance = new SpeechSynthesisUtterance(ttsText);
                      utterance.lang = 'en-GB';
                      utterance.rate = 0.9;
                      const voices = window.speechSynthesis.getVoices();
                      const britishVoice = voices.find(v => v.lang === 'en-GB') || voices.find(v => v.lang.startsWith('en'));
                      if (britishVoice) utterance.voice = britishVoice;
                      window.speechSynthesis.speak(utterance);
                    }}
                    className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900"
                  >
                    <Volume2 className="w-3 h-3" /> Replay Audio
                  </button>
                  <span className="text-xs text-blue-600 italic">"{ttsText}"</span>
                </div>
              )}

              {/* Options */}
              <div className="space-y-2 mb-3">
                {item.question.options.map((opt, oi) => {
                  const isSelected = item.selectedAnswer === opt;
                  const isCorrectOpt = item.correctAnswer === opt;
                  let bgClass = 'bg-gray-50 border-gray-200';
                  if (isCorrectOpt) bgClass = 'bg-green-50 border-green-400';
                  if (isSelected && !isCorrectOpt) bgClass = 'bg-red-50 border-red-400';

                  return (
                    <div key={oi} className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-2 ${bgClass}`}>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCorrectOpt ? 'bg-green-500 text-white' : isSelected ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="font-bangla">{opt}</span>
                      {isCorrectOpt && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                      {isSelected && !isCorrectOpt && <XCircle className="w-4 h-4 text-red-500 ml-auto" />}
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {item.banglaExplanation && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800 font-bangla whitespace-pre-line">
                    💡 {item.banglaExplanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
