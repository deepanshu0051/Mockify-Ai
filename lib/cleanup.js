export function clearUserSession() {
  if (typeof window === 'undefined') return;

  const keysToRemove = [
    'mockify_resume_id',
    'mockify_file_url',
    'mockify_file_name',
    'mockify_candidate_name',
    'mockify_candidate_skills',
    'mockify_suggested_role',
    'mockify_rules_accepted',
    'mockify_role',
    'mockify_difficulty',
    'mockify_mode',
    'mockify_questions',
    'mockify_answers',
    'mockify_last_ids',
    'mockify_score'
  ];

  keysToRemove.forEach(key => localStorage.removeItem(key));

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/session/end');
    } else {
      fetch('/api/session/end', { method: 'POST', keepalive: true });
    }
  } catch (error) {
    console.warn('Session cleanup call failed:', error);
  }
}
