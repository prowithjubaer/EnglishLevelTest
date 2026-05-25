'use client';

import { useState, useCallback } from 'react';

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

interface Props {
  question: Question;
  questionNumber: number;
  onAnswer: (selectedAnswer: string | null, skipped: boolean) => void;
}

const CATEGORY_INSTRUCTIONS: Record<string, string> = {
  grammar: 'অনুমান না করে যেটা আপনি সত্যিই জানেন/বুঝেন, সেটাই select করুন।',
  vocabulary: 'অনুমান না করে যেটা আপনি সত্যিই জানেন/বুঝেন, সেটাই select করুন।',
  sentence_making: 'এখানে সবচেয়ে সুন্দর option দেখে select করবেন না। বাস্তবে আপনি যেভাবে sentence বানাতেন বা বলতেন, সেটার সবচেয়ে কাছাকাছি option select করুন।',
  listening: 'Audio শুনে যা সত্যিই বুঝেছেন, সেটার ভিত্তিতে answer দিন। অনুমান করলে result accurate হবে না।',
  speaking_readiness: 'সত্যি সত্যি আপনার অবস্থার সাথে যেটা মিলে, সেটাই select করুন। কম level দেখানো খারাপ কিছু না—এতেই আপনার জন্য সঠিক roadmap তৈরি হবে।',
  real_life_communication: 'বাস্তবে এই situation-এ আপনি যেটা বলতেন বা respond করতেন, সেটাই select করুন।',
  learning_behavior: 'আপনি বাস্তবে যতটুকু সময় দিতে পারবেন বা যেভাবে practice করেন, সেটাই select করুন। এতে আপনার roadmap accurate হবে।',
};

// TTS function with British accent
function speakText(text: string, rate: number = 0.9): Promise<void> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve();
      return;
    }
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to find a British English voice
    const voices = window.speechSynthesis.getVoices();
    const britishVoice = voices.find(v =>
      v.lang === 'en-GB' || v.lang.startsWith('en-GB')
    ) || voices.find(v =>
      v.name.toLowerCase().includes('british') ||
      v.name.toLowerCase().includes('uk') ||
      v.name.toLowerCase().includes('daniel') ||
      v.name.toLowerCase().includes('kate')
    ) || voices.find(v => v.lang.startsWith('en'));

    if (britishVoice) {
      utterance.voice = britishVoice;
    }
    utterance.lang = 'en-GB';

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

export default function QuestionCard({ question, questionNumber, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [audioPlays, setAudioPlays] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const maxPlays = question.cefrLevel === 'A1' || question.cefrLevel === 'A2' ? 3 : 2;

  const instruction = question.instructionText || CATEGORY_INSTRUCTIONS[question.category] || '';

  // Check if this is a TTS-based listening question
  const isTTSQuestion = question.audioUrl?.startsWith('tts:');
  const ttsText = isTTSQuestion ? question.audioUrl!.slice(4) : null;

  // For listening questions, only show the question part (after the \n)
  const displayQuestionText = (() => {
    if (question.questionType === 'audio_mcq' && question.category === 'listening') {
      // The question text may have format "Audio: \"...\"\nActual question"
      // We only show the actual question part
      const parts = question.questionText.split('\n');
      if (parts.length > 1) {
        return parts.slice(1).join('\n');
      }
    }
    return question.questionText;
  })();

  const handlePlayTTS = useCallback(async () => {
    if (audioPlays >= maxPlays || isPlaying || !ttsText) return;
    setIsPlaying(true);
    setAudioPlays(prev => prev + 1);

    // Load voices if not loaded yet
    if (window.speechSynthesis.getVoices().length === 0) {
      await new Promise<void>(resolve => {
        window.speechSynthesis.onvoiceschanged = () => resolve();
        setTimeout(resolve, 500);
      });
    }

    await speakText(ttsText);
    setIsPlaying(false);
  }, [audioPlays, maxPlays, isPlaying, ttsText]);

  const handleSelect = (option: string) => {
    setSelected(option);
  };

  const handleNext = () => {
    onAnswer(selected, false);
  };

  const handleSkip = () => {
    onAnswer(null, true);
  };

  return (
    <div className="card animate-slideIn max-w-3xl mx-auto">
      {/* Instruction */}
      {instruction && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
          <p className="text-xs text-blue-700 font-bangla">{instruction}</p>
        </div>
      )}

      {/* Question */}
      <div className="mb-6">
        <span className="text-xs text-gray-400 mb-1 block">Question {questionNumber}</span>
        <h3 className="text-lg font-semibold text-brand-navy leading-relaxed font-bangla">
          {displayQuestionText}
        </h3>
      </div>

      {/* TTS Audio Player for listening questions */}
      {isTTSQuestion && (
        <div className="mb-6 bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayTTS}
              disabled={audioPlays >= maxPlays || isPlaying}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                audioPlays >= maxPlays
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isPlaying
                  ? 'bg-green-500 text-white animate-pulse'
                  : 'bg-brand-navy text-white hover:bg-brand-navy-light'
              }`}
            >
              {isPlaying ? '🔊 Playing...' : '🔊 Play Audio'}
            </button>
            <span className="text-xs text-gray-500">
              {maxPlays - audioPlays} plays remaining
            </span>
          </div>
          {audioPlays === 0 && (
            <p className="text-xs text-orange-600 mt-2 font-bangla">
              ⚠️ Audio শুনে answer দিন। মনোযোগ দিয়ে শুনুন।
            </p>
          )}
        </div>
      )}

      {/* File-based Audio Player (fallback for non-TTS) */}
      {question.audioUrl && !isTTSQuestion && (
        <div className="mb-6 bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (audioPlays < maxPlays) {
                  const audio = new Audio(question.audioUrl!);
                  audio.play();
                  setAudioPlays(prev => prev + 1);
                }
              }}
              disabled={audioPlays >= maxPlays}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                audioPlays >= maxPlays
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-brand-navy text-white hover:bg-brand-navy-light'
              }`}
            >
              🔊 Play Audio
            </button>
            <span className="text-xs text-gray-500">
              {maxPlays - audioPlays} plays remaining
            </span>
          </div>
        </div>
      )}

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(option)}
            className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-200 ${
              selected === option
                ? 'border-brand-red bg-red-50 text-brand-navy shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                selected === option
                  ? 'bg-brand-red text-white border-brand-red'
                  : 'border-gray-300 text-gray-500'
              }`}>
                {String.fromCharCode(65 + index)}
              </span>
              <span className="font-bangla text-sm md:text-base">{option}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleSkip}
          className="text-gray-400 text-sm hover:text-gray-600 transition"
        >
          Skip →
        </button>
        <button
          onClick={handleNext}
          disabled={!selected}
          className={`px-8 py-3 rounded-xl font-semibold transition-all ${
            selected
              ? 'btn-primary'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
