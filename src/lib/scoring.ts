// Scoring Engine for Pro English BD English Level Test

export interface SectionScores {
  grammar: number;
  vocabulary: number;
  sentenceMaking: number;
  listening: number;
  speakingReadiness: number;
  realLifeCommunication: number;
  learningBehavior: number;
}

export interface SectionMaxScores {
  grammar: number;
  vocabulary: number;
  sentenceMaking: number;
  listening: number;
  speakingReadiness: number;
  realLifeCommunication: number;
  learningBehavior: number;
}

export interface WeightedConfig {
  grammar: number;
  vocabulary: number;
  sentenceMaking: number;
  listening: number;
  speakingReadiness: number;
  realLifeCommunication: number;
  learningBehavior: number;
}

export const DEFAULT_WEIGHTS: WeightedConfig = {
  grammar: 0.14,
  vocabulary: 0.16,
  sentenceMaking: 0.22,
  listening: 0.16,
  speakingReadiness: 0.14,
  realLifeCommunication: 0.10,
  learningBehavior: 0.08,
};

export interface LevelResult {
  level: string;
  cefrLevel: string;
  score: number;
  weightedScore: number;
  sectionScores: SectionScores;
  sectionPercentages: SectionScores;
  weaknesses: string[];
  weaknessMessages: Record<string, string>;
  testConfidence: 'high' | 'medium' | 'low';
  recommendedCourse: string;
  personalizedMessage: string;
  roadmap: RoadmapItem[];
}

export interface RoadmapItem {
  days: string;
  title: string;
  description: string;
}

export function calculateWeightedScore(
  sectionScores: SectionScores,
  sectionMaxScores: SectionMaxScores,
  weights: WeightedConfig = DEFAULT_WEIGHTS
): number {
  let totalWeighted = 0;

  const sections = Object.keys(weights) as (keyof WeightedConfig)[];
  for (const section of sections) {
    const maxScore = sectionMaxScores[section] || 1;
    const percentage = (sectionScores[section] / maxScore) * 100;
    totalWeighted += percentage * weights[section];
  }

  return Math.round(totalWeighted);
}

export function calculateSectionPercentages(
  sectionScores: SectionScores,
  sectionMaxScores: SectionMaxScores
): SectionScores {
  return {
    grammar: sectionMaxScores.grammar > 0 ? Math.round((sectionScores.grammar / sectionMaxScores.grammar) * 100) : 0,
    vocabulary: sectionMaxScores.vocabulary > 0 ? Math.round((sectionScores.vocabulary / sectionMaxScores.vocabulary) * 100) : 0,
    sentenceMaking: sectionMaxScores.sentenceMaking > 0 ? Math.round((sectionScores.sentenceMaking / sectionMaxScores.sentenceMaking) * 100) : 0,
    listening: sectionMaxScores.listening > 0 ? Math.round((sectionScores.listening / sectionMaxScores.listening) * 100) : 0,
    speakingReadiness: sectionMaxScores.speakingReadiness > 0 ? Math.round((sectionScores.speakingReadiness / sectionMaxScores.speakingReadiness) * 100) : 0,
    realLifeCommunication: sectionMaxScores.realLifeCommunication > 0 ? Math.round((sectionScores.realLifeCommunication / sectionMaxScores.realLifeCommunication) * 100) : 0,
    learningBehavior: sectionMaxScores.learningBehavior > 0 ? Math.round((sectionScores.learningBehavior / sectionMaxScores.learningBehavior) * 100) : 0,
  };
}

export function determineLevel(weightedScore: number): { level: string; cefrLevel: string } {
  if (weightedScore <= 25) return { level: 'Beginner', cefrLevel: 'A1' };
  if (weightedScore <= 45) return { level: 'Basic', cefrLevel: 'A2' };
  if (weightedScore <= 65) return { level: 'Intermediate', cefrLevel: 'B1' };
  if (weightedScore <= 80) return { level: 'Upper Intermediate', cefrLevel: 'B2' };
  return { level: 'Advanced', cefrLevel: 'B2+ Ready' };
}

export function applyGateRules(
  level: string,
  cefrLevel: string,
  sectionPercentages: SectionScores
): { level: string; cefrLevel: string } {
  let finalLevel = level;
  let finalCefr = cefrLevel;

  // Gate 1: Sentence Making < 35% → cap at B1
  if (sectionPercentages.sentenceMaking < 35) {
    if (['Upper Intermediate', 'Advanced'].includes(finalLevel)) {
      finalLevel = 'Intermediate';
      finalCefr = 'B1';
    }
  }

  // Gate 2: Listening < 35% → cap at B1
  if (sectionPercentages.listening < 35) {
    if (['Upper Intermediate', 'Advanced'].includes(finalLevel)) {
      finalLevel = 'Intermediate';
      finalCefr = 'B1';
    }
  }

  // Gate 3: Grammar AND Sentence Making both < 40% → cap at A2
  if (sectionPercentages.grammar < 40 && sectionPercentages.sentenceMaking < 40) {
    if (['Intermediate', 'Upper Intermediate', 'Advanced'].includes(finalLevel)) {
      finalLevel = 'Basic';
      finalCefr = 'A2';
    }
  }

  return { level: finalLevel, cefrLevel: finalCefr };
}

export function calculateTestConfidence(
  totalQuestions: number,
  answeredQuestions: number,
  skippedQuestions: number,
  totalTimeSeconds: number,
  tooFastAnswers: number,
  attentionCheckPassed: boolean,
  repeatedPatternDetected: boolean
): 'high' | 'medium' | 'low' {
  const completionRate = answeredQuestions / totalQuestions;
  const skipRate = skippedQuestions / totalQuestions;
  const avgTimePerQuestion = totalTimeSeconds / Math.max(answeredQuestions, 1);
  const tooFastRate = tooFastAnswers / Math.max(answeredQuestions, 1);

  let confidenceScore = 100;

  // Completion rate
  if (completionRate < 0.5) confidenceScore -= 40;
  else if (completionRate < 0.7) confidenceScore -= 20;
  else if (completionRate < 0.9) confidenceScore -= 10;

  // Skip rate
  if (skipRate > 0.3) confidenceScore -= 25;
  else if (skipRate > 0.15) confidenceScore -= 15;

  // Too fast answers
  if (tooFastRate > 0.4) confidenceScore -= 30;
  else if (tooFastRate > 0.2) confidenceScore -= 15;

  // Attention check
  if (!attentionCheckPassed) confidenceScore -= 20;

  // Repeated pattern
  if (repeatedPatternDetected) confidenceScore -= 15;

  // Average time too low
  if (avgTimePerQuestion < 3) confidenceScore -= 20;

  if (confidenceScore >= 70) return 'high';
  if (confidenceScore >= 40) return 'medium';
  return 'low';
}

export function detectRepeatedPattern(answers: string[]): boolean {
  if (answers.length < 8) return false;
  
  // Check if same option selected more than 60% of time
  const counts: Record<string, number> = {};
  for (const a of answers) {
    counts[a] = (counts[a] || 0) + 1;
  }
  const maxCount = Math.max(...Object.values(counts));
  if (maxCount / answers.length > 0.6) return true;

  // Check alternating pattern
  let alternating = 0;
  for (let i = 2; i < answers.length; i++) {
    if (answers[i] === answers[i - 2] && answers[i] !== answers[i - 1]) {
      alternating++;
    }
  }
  if (alternating / (answers.length - 2) > 0.7) return true;

  return false;
}

export function identifyWeaknesses(sectionPercentages: SectionScores, mistakeTags: string[]): string[] {
  const weaknesses: string[] = [];

  if (sectionPercentages.sentenceMaking < 50) weaknesses.push('sentence_making_weak');
  if (sectionPercentages.grammar < 50) weaknesses.push('grammar_foundation_weak');
  if (sectionPercentages.vocabulary < 50) weaknesses.push('vocabulary_weak');
  if (sectionPercentages.listening < 50) weaknesses.push('listening_weak');
  if (sectionPercentages.speakingReadiness < 50) weaknesses.push('confidence_low');
  if (sectionPercentages.realLifeCommunication < 50) weaknesses.push('real_life_communication_weak');
  if (sectionPercentages.learningBehavior < 50) weaknesses.push('practice_habit_weak');

  // Add from mistake tags - top frequency tags
  const tagCounts: Record<string, number> = {};
  for (const tag of mistakeTags) {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  }
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  for (const [tag] of sortedTags.slice(0, 3)) {
    if (!weaknesses.includes(tag)) weaknesses.push(tag);
  }

  return weaknesses.slice(0, 5);
}

export const WEAKNESS_MESSAGES: Record<string, string> = {
  grammar_foundation_weak: "আপনার grammar foundation weak. আপনি sentence বানানোর সময় tense, verb form, preposition বা structure নিয়ে confuse হন।",
  vocabulary_weak: "আপনার vocabulary কম। তাই কথা বলতে গেলে শব্দ মনে আসে না।",
  active_vocabulary_weak: "আপনার passive vocabulary আছে, কিন্তু active vocabulary weak. আপনি word চিনেন, কিন্তু speaking-এ use করতে পারেন না।",
  sentence_making_weak: "আপনার সবচেয়ে বড় সমস্যা sentence বানানো। আপনি হয়তো meaning বুঝেন, কিন্তু নিজের চিন্তা English sentence-এ convert করতে পারেন না।",
  listening_weak: "আপনি English শুনে বুঝতে struggle করেন। Fast speech, accent এবং connected speech আপনার জন্য challenging।",
  confidence_low: "আপনার confidence কম। ভুল হওয়ার ভয়, লজ্জা বা practice না থাকার কারণে আপনি English জানলেও বলতে পারছেন না।",
  real_life_communication_weak: "আপনি general English কিছু জানেন, কিন্তু real-life situation-এ professional response দিতে practice দরকার।",
  practice_habit_weak: "আপনার problem শুধু English না—regular practice system নেই। তাই daily habit, guided task, teacher feedback এবং practice tools দরকার।",
  tense_error: "আপনি tense ব্যবহারে ভুল করেন—present, past, future নিয়ে confusion আছে।",
  verb_form_error: "Verb-এর correct form use করতে সমস্যা হচ্ছে।",
  word_order_error: "Sentence-এর word order ঠিক করতে সমস্যা হচ্ছে।",
  connected_speech_weak: "Connected speech বুঝতে সমস্যা—native speaker দ্রুত বললে ধরতে পারেন না।",
  bangla_to_english_conversion_weak: "বাংলা থেকে English-এ চিন্তা convert করতে সময় লাগে এবং ভুল হয়।",
  fear_of_mistake: "ভুল হওয়ার ভয়ে বলতে পারেন না।",
  client_response_weak: "Client-দের সাথে professional English-এ respond করতে সমস্যা।",
  interview_response_weak: "Job interview-এ structured, confident answer দিতে সমস্যা।",
  consistency_weak: "Regular practice-এ consistent নন—তাই improvement slow।",
  collocation_weak: "Natural word combinations (collocations) ঠিকমতো use করতে পারেন না।",
};

export function getPersonalizedMessage(level: string): string {
  const messages: Record<string, string> = {
    'Beginner': "আপনি এখন Beginner level-এ আছেন। ভয় পাওয়ার কিছু নেই। আপনার English foundation এখনো strong হয়নি, তাই sentence বানানো, vocabulary মনে রাখা, listening বুঝা—সব জায়গায় সমস্যা হওয়া normal. আপনার জন্য প্রথম কাজ হলো basic grammar, daily vocabulary এবং simple sentence making habit তৈরি করা।",
    'Basic': "আপনার basic knowledge আছে, কিন্তু আপনি fluent না। আপনি কিছু sentence বুঝেন, কিছু বলতে পারেন, কিন্তু real conversation-এ আটকে যান। আপনার সবচেয়ে দরকার sentence making speed, vocabulary activation এবং guided speaking practice।",
    'Intermediate': "আপনার English foundation মোটামুটি ভালো। আপনি বুঝতে পারেন এবং কিছু বলতে পারেন, কিন্তু fluency, confidence, natural expression এবং listening speed-এ সমস্যা আছে। এখন আপনার দরকার advanced practice system।",
    'Upper Intermediate': "আপনার English level ভালো। এখন আপনার দরকার natural fluency, pronunciation polishing, advanced expression এবং real-life speaking performance improve করা।",
    'Advanced': "আপনার English level strong. এখন আপনার দরকার advanced communication polish, IELTS/client/interview performance, natural expression, and high-level speaking confidence।",
  };
  return messages[level] || messages['Basic'];
}

export function getRecommendedCourse(level: string, goal: string): string {
  if (goal === 'Freelancing / Client Communication') {
    return 'Client Communication English for Freelancers';
  }
  if (goal === 'IELTS Speaking') {
    return '75-Day English Fluency System (IELTS Track)';
  }
  if (['Beginner', 'Basic'].includes(level)) {
    return '75-Day English Fluency System (Foundation + Fluency)';
  }
  if (level === 'Intermediate') {
    return '75-Day English Fluency System (Fluency & Confidence)';
  }
  return '75-Day English Fluency System (Advanced Communication)';
}

export function getRecommendedRoadmap(level: string): RoadmapItem[] {
  if (['Beginner', 'Basic'].includes(level)) {
    return [
      { days: 'Day 1–15', title: 'Foundation Fix', description: 'Basic grammar, sentence structure, daily vocabulary' },
      { days: 'Day 16–30', title: 'Sentence Making', description: 'Bangla to English conversion, simple speaking' },
      { days: 'Day 31–45', title: 'Vocabulary Activation', description: 'Active vocabulary, phrases, collocations' },
      { days: 'Day 46–60', title: 'Listening + Shadowing', description: 'Listening practice, pronunciation, connected speech' },
      { days: 'Day 61–75', title: 'Speaking Practice', description: 'Confidence building, real-life scenarios, feedback' },
    ];
  }
  if (level === 'Intermediate') {
    return [
      { days: 'Day 1–15', title: 'Fluency Foundation', description: 'Sentence speed, automatic grammar, thinking in English' },
      { days: 'Day 16–30', title: 'Advanced Vocabulary', description: 'Natural expressions, idioms, professional vocabulary' },
      { days: 'Day 31–45', title: 'Listening Mastery', description: 'Native speed, podcasts, real conversations' },
      { days: 'Day 46–60', title: 'Speaking Confidence', description: 'Extended responses, debates, presentations' },
      { days: 'Day 61–75', title: 'Real-world Practice', description: 'Interviews, client calls, IELTS-style practice' },
    ];
  }
  return [
    { days: 'Day 1–15', title: 'Advanced Polish', description: 'Natural expressions, nuanced grammar, style' },
    { days: 'Day 16–30', title: 'Professional Fluency', description: 'Business English, negotiations, presentations' },
    { days: 'Day 31–45', title: 'Native-like Listening', description: 'Accents, fast speech, cultural context' },
    { days: 'Day 46–60', title: 'Speaking Excellence', description: 'Persuasion, storytelling, complex ideas' },
    { days: 'Day 61–75', title: 'Performance Ready', description: 'IELTS 7+, professional interviews, public speaking' },
  ];
}
