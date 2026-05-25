// Adaptive Testing Logic

export interface AdaptiveState {
  questionsAnswered: number;
  correctCount: number;
  currentDifficulty: 'A1' | 'A2' | 'B1' | 'B2';
  sectionQuestionCounts: Record<string, number>;
}

export function getNextDifficulty(state: AdaptiveState): string {
  const { questionsAnswered, correctCount } = state;
  
  if (questionsAnswered < 8) {
    // Warm-up: mix A1/A2
    return Math.random() > 0.5 ? 'A1' : 'A2';
  }

  const accuracy = correctCount / questionsAnswered;

  if (accuracy >= 0.7) {
    // High accuracy → harder questions
    if (state.currentDifficulty === 'A1') return 'A2';
    if (state.currentDifficulty === 'A2') return 'B1';
    return 'B2';
  } else if (accuracy < 0.4) {
    // Low accuracy → easier questions
    if (state.currentDifficulty === 'B2') return 'B1';
    if (state.currentDifficulty === 'B1') return 'A2';
    return 'A1';
  } else {
    // Medium accuracy → same or mix
    if (state.currentDifficulty === 'A1') return 'A2';
    if (state.currentDifficulty === 'A2') return Math.random() > 0.5 ? 'A2' : 'B1';
    if (state.currentDifficulty === 'B1') return Math.random() > 0.5 ? 'B1' : 'B2';
    return 'B1';
  }
}

export function selectQuestionsForTest(
  allQuestions: any[],
  testMode: {
    questionsPerSection: Record<string, number>;
    adaptiveEnabled: boolean;
  },
  goal?: string
): any[] {
  const selected: any[] = [];
  const categories = Object.keys(testMode.questionsPerSection);

  for (const category of categories) {
    const count = testMode.questionsPerSection[category];
    let categoryQuestions = allQuestions.filter(q => q.category === category && q.isActive);

    // For real_life_communication, prioritize goal-based questions
    if (category === 'real_life_communication' && goal) {
      const goalTagMap: Record<string, string> = {
        'Freelancing / Client Communication': 'client_response_weak',
        'IELTS Speaking': 'ielts_response_weak',
        'Job Interview': 'interview_response_weak',
      };
      const priorityTag = goalTagMap[goal];
      if (priorityTag) {
        const priorityQuestions = categoryQuestions.filter(q => {
          const tags = JSON.parse(q.mistakeTagsJson || '[]');
          return tags.includes(priorityTag);
        });
        if (priorityQuestions.length >= count) {
          categoryQuestions = priorityQuestions;
        }
      }
    }

    // Mix difficulty levels
    const a1 = categoryQuestions.filter(q => q.cefrLevel === 'A1');
    const a2 = categoryQuestions.filter(q => q.cefrLevel === 'A2');
    const b1 = categoryQuestions.filter(q => q.cefrLevel === 'B1');
    const b2 = categoryQuestions.filter(q => q.cefrLevel === 'B2');

    // Start with easier, include harder
    const distribution = [
      ...shuffle(a1).slice(0, Math.ceil(count * 0.2)),
      ...shuffle(a2).slice(0, Math.ceil(count * 0.3)),
      ...shuffle(b1).slice(0, Math.ceil(count * 0.3)),
      ...shuffle(b2).slice(0, Math.ceil(count * 0.2)),
    ];

    // Take required count, fill from remaining if needed
    let sectionSelected = distribution.slice(0, count);
    if (sectionSelected.length < count) {
      const remaining = categoryQuestions.filter(q => !sectionSelected.includes(q));
      sectionSelected = [...sectionSelected, ...shuffle(remaining).slice(0, count - sectionSelected.length)];
    }

    selected.push(...sectionSelected);
  }

  return selected;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
