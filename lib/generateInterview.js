import { questionBank } from './questionBank';

/**
 * Generates 10 unique questions based on difficulty distribution.
 * Distribution:
 * - easy: 7 easy + 3 medium
 * - medium: 3 easy + 5 medium + 2 hard
 * - hard: 2 medium + 8 hard
 * - mix: 3 easy + 4 medium + 3 hard
 */
export function generateInterview(difficulty = 'easy', lastIds = []) {
  const distribution = {
    easy: { easy: 7, medium: 3, hard: 0 },
    medium: { easy: 3, medium: 5, hard: 2 },
    hard: { easy: 0, medium: 2, hard: 8 },
    mix: { easy: 3, medium: 4, hard: 3 },
  };

  const selectedDist = distribution[difficulty.toLowerCase()] || distribution.easy;
  const result = [];

  // Filter pool and exclude last IDs if possible
  const getPool = (diff) => {
    let pool = questionBank.filter(q => q.difficulty === diff);
    let freshPool = pool.filter(q => !lastIds.includes(q.id));
    // If not enough fresh questions, use the whole pool
    return freshPool.length >= selectedDist[diff] ? freshPool : pool;
  };

  ['easy', 'medium', 'hard'].forEach(diff => {
    const count = selectedDist[diff];
    if (count === 0) return;

    let pool = getPool(diff);
    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    // Pick required number
    result.push(...shuffled.slice(0, count));
  });

  // Final shuffle of the 10 questions
  return result.sort(() => 0.5 - Math.random());
}
