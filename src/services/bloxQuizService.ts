import {
  ChestQuestion,
  GradeLevel,
  QuizSubject,
  CHEST_QUIZ_QUESTIONS,
  GRADE_CATEGORIES,
  QUIZ_SUBJECTS,
  getRandomChestQuestion,
} from '../data/chestQuizData';

/**
 * Session history of asked questions and topics to ensure ZERO repetition
 * and completely DIVERSE subject matter across gameplay.
 */
const askedQuestionSignatures = new Set<string>();
const askedTopicCategories = new Set<string>();
const askedQuestionFullTexts = new Set<string>();
const recentSubjectsHistory: QuizSubject[] = [];
const recentTopicKeywords: string[] = [];

// Initialize session persistence so questions never repeat across deaths/chests
function initAskedStorage() {
  if (typeof window === 'undefined') return;
  try {
    const rawSig = window.sessionStorage?.getItem('blox_fruits_asked_signatures');
    if (rawSig) {
      JSON.parse(rawSig).forEach((s: string) => askedQuestionSignatures.add(s));
    }
    const rawTxt = window.sessionStorage?.getItem('blox_fruits_asked_texts');
    if (rawTxt) {
      JSON.parse(rawTxt).forEach((t: string) => askedQuestionFullTexts.add(t));
    }
    const rawTop = window.sessionStorage?.getItem('blox_fruits_asked_topics');
    if (rawTop) {
      JSON.parse(rawTop).forEach((t: string) => askedTopicCategories.add(t));
    }
  } catch {
    // ignore
  }
}
initAskedStorage();

function saveAskedStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage?.setItem(
      'blox_fruits_asked_signatures',
      JSON.stringify(Array.from(askedQuestionSignatures).slice(-250))
    );
    window.sessionStorage?.setItem(
      'blox_fruits_asked_texts',
      JSON.stringify(Array.from(askedQuestionFullTexts).slice(-250))
    );
    window.sessionStorage?.setItem(
      'blox_fruits_asked_topics',
      JSON.stringify(Array.from(askedTopicCategories).slice(-80))
    );
  } catch {
    // ignore
  }
}

/**
 * Pre-fetched queue of AI generated questions for zero-latency retrieval.
 */
const questionQueue: ChestQuestion[] = [];
let isPrefetching = false;

const cachedRespawnBatch: ChestQuestion[] = [];
let isPrefetchingRespawn = false;

const ALL_CORE_SUBJECTS: QuizSubject[] = [
  'science',
  'ap',
  'math',
  'filipino',
  'mapeh',
  'english',
  'esp',
  'epp',
];

function getQuestionSignature(q: { id?: string; question: string }): string {
  if (!q) return '';
  const textClean = q.question
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 60);
  return `${q.id || ''}:${textClean}`;
}

/**
 * Extract meaningful semantic keywords to detect paraphrased or similar subject matter.
 */
export function extractQuestionKeywords(text: string): string[] {
  if (!text) return [];
  const stopWords = new Set([
    'alin', 'mga', 'sumusunod', 'tungkol', 'bawat', 'lahat', 'kung', 'saan', 'kailan',
    'paano', 'bakit', 'isang', 'upang', 'dahil', 'nang', 'para', 'natin', 'inyong',
    'which', 'following', 'about', 'these', 'those', 'where', 'when', 'what', 'with',
    'from', 'that', 'this', 'have', 'been', 'there', 'their', 'your', 'would', 'could',
    'correct', 'answer', 'tamang', 'sagot', 'tawag', 'tinatawag', 'ginagamit', 'halimbawa'
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !stopWords.has(w));

  return Array.from(new Set(words));
}

export function markQuestionAsAsked(q: ChestQuestion): void {
  if (!q || !q.question) return;
  askedQuestionSignatures.add(getQuestionSignature(q));
  if (q.id) askedQuestionSignatures.add(q.id);

  const textClean = q.question.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
  askedQuestionSignatures.add(textClean);
  askedQuestionFullTexts.add(q.question.trim());

  if (q.topicCategory) {
    askedTopicCategories.add(q.topicCategory.toLowerCase().trim());
  }

  if (q.subject) {
    recentSubjectsHistory.push(q.subject);
    if (recentSubjectsHistory.length > 8) {
      recentSubjectsHistory.shift();
    }
  }

  const kws = extractQuestionKeywords(q.question);
  for (const kw of kws) {
    if (!recentTopicKeywords.includes(kw)) {
      recentTopicKeywords.push(kw);
    }
  }
  if (recentTopicKeywords.length > 50) {
    recentTopicKeywords.splice(0, recentTopicKeywords.length - 50);
  }

  saveAskedStorage();
}

export function isQuestionAlreadyAsked(q: ChestQuestion): boolean {
  if (!q) return false;
  if (q.id && askedQuestionSignatures.has(q.id)) return true;
  const sig = getQuestionSignature(q);
  if (askedQuestionSignatures.has(sig)) return true;
  const textClean = q.question.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50);
  return askedQuestionSignatures.has(textClean);
}

/**
 * Checks if a candidate question shares similar subject matter or topic with recently asked questions.
 */
export function hasSimilarSubjectMatter(q: ChestQuestion, checkRecentSubject = false): boolean {
  if (!q) return false;

  // 1. Topic Category check
  if (q.topicCategory) {
    const norm = q.topicCategory.toLowerCase().trim();
    if (askedTopicCategories.has(norm)) return true;
  }

  // 2. Check if immediate last question was the exact same subject (when checking subject alternation)
  if (checkRecentSubject && recentSubjectsHistory.length > 0) {
    const lastSub = recentSubjectsHistory[recentSubjectsHistory.length - 1];
    if (q.subject === lastSub) return true;
  }

  // 3. Keyword overlap check (if 2 or more strong domain keywords match recent questions)
  const kws = extractQuestionKeywords(q.question);
  let overlapCount = 0;
  for (const kw of kws) {
    if (recentTopicKeywords.includes(kw)) {
      overlapCount++;
      if (overlapCount >= 2) return true;
    }
  }

  return false;
}

/**
 * Reset question history (e.g. if student wants a completely fresh start)
 */
export function resetAskedQuestionHistory(): void {
  askedQuestionSignatures.clear();
  askedTopicCategories.clear();
  recentSubjectsHistory.length = 0;
  recentTopicKeywords.length = 0;
  questionQueue.length = 0;
}

/**
 * Get list of recent question texts to pass to the AI generator to prevent repeating.
 */
export function getRecentAskedQuestionTexts(limit = 20): string[] {
  const result: string[] = [];
  const texts = Array.from(askedQuestionFullTexts);
  for (let i = texts.length - 1; i >= 0 && result.length < limit; i--) {
    const txt = texts[i]?.trim();
    if (txt && txt.length > 10) {
      result.push(txt);
    }
  }
  return result;
}

/**
 * Call Server-Side Groq AI to generate DepEd Philippines Budget of Work (BOW) test questions.
 * Passes excluded topics, recent questions, and last subject to prevent repeating or paraphrasing.
 */
export async function requestAiDepEdQuestions(params: {
  gradeLevel?: GradeLevel | 'all';
  subject?: QuizSubject | 'all';
  customTopic?: string;
  language?: 'all' | 'filipino' | 'english';
  count?: number;
}): Promise<ChestQuestion[]> {
  try {
    const { gradeLevel = 'all', subject = 'all', customTopic, language = 'all', count = 1 } = params;
    const excludeQuestions = getRecentAskedQuestionTexts(20);
    const excludeTopics = Array.from(askedTopicCategories).slice(-20);
    const lastSubject = recentSubjectsHistory.length > 0 ? recentSubjectsHistory[recentSubjectsHistory.length - 1] : null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9500);

    const res = await fetch('/api/ai/deped-quiz', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gradeLevel,
        subject,
        customTopic,
        language,
        count,
        excludeQuestions,
        excludeTopics,
        lastSubject,
      }),
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.questions) && data.questions.length > 0) {
        const validQuestions: ChestQuestion[] = [];
        for (const raw of data.questions) {
          if (
            raw.question &&
            Array.isArray(raw.options) &&
            raw.options.length === 4 &&
            typeof raw.correctIndex === 'number'
          ) {
            const subjectMeta =
              QUIZ_SUBJECTS.find((s) => s.subject === raw.subject) || QUIZ_SUBJECTS[0];
            const q: ChestQuestion = {
              id: raw.id || `groq-ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              gradeLevel: (raw.gradeLevel as GradeLevel) || (gradeLevel === 'all' ? 1 : gradeLevel),
              subject: (raw.subject as QuizSubject) || 'science',
              subjectLabel: raw.subjectLabel || subjectMeta.label,
              subjectTagalog: raw.subjectTagalog || subjectMeta.tagalog,
              subjectIcon: raw.subjectIcon || subjectMeta.icon,
              subjectColor: raw.subjectColor || subjectMeta.color,
              topicCategory: raw.topicCategory || 'Pangkalahatang Kaalaman',
              question: String(raw.question).trim(),
              options: raw.options.map((o: any) => String(o).trim()),
              correctIndex: Math.min(3, Math.max(0, raw.correctIndex)),
              explanation: String(raw.explanation || 'Tamang sagot batay sa DepEd Curriculum.').trim(),
              bonusStars: Number(raw.bonusStars) || 50,
              aiSource: (raw.aiSource as any) || (data.source === 'groq' ? 'groq' : 'gemini'),
            };
            validQuestions.push(q);
          }
        }
        return validQuestions;
      }
    }
  } catch (err) {
    console.warn('[DepEd AI Quiz] Groq AI generation fallback:', err);
  }
  return [];
}

/**
 * Pre-fetch questions in the background to ensure instantaneous quiz presentation
 */
export async function prefetchDepEdQuestions(
  grade: GradeLevel | 'all' = 'all',
  subject: QuizSubject | 'all' = 'all',
  customTopic?: string,
  language: 'all' | 'filipino' | 'english' = 'all'
): Promise<void> {
  if (isPrefetching || questionQueue.length >= 4) return;
  isPrefetching = true;
  try {
    const fresh = await requestAiDepEdQuestions({ gradeLevel: grade, subject, customTopic, language, count: 2 });
    for (const q of fresh) {
      if (!isQuestionAlreadyAsked(q) && !hasSimilarSubjectMatter(q, false)) {
        questionQueue.push(q);
      }
    }
  } finally {
    isPrefetching = false;
  }
}

/**
 * Pre-fetch a 5-question multi-subject respawn battery in background using Groq AI
 */
export async function prefetchRespawnBatch(
  grade: GradeLevel | 'all' = 'all',
  language: 'all' | 'filipino' | 'english' = 'all'
): Promise<void> {
  if (isPrefetchingRespawn || cachedRespawnBatch.length >= 5) return;
  isPrefetchingRespawn = true;
  try {
    const batch = await requestAiDepEdQuestions({
      gradeLevel: grade,
      subject: 'all',
      language,
      count: 5,
    });
    for (const q of batch) {
      if (!isQuestionAlreadyAsked(q)) {
        cachedRespawnBatch.push(q);
      }
    }
  } catch {
    // ignore
  } finally {
    isPrefetchingRespawn = false;
  }
}

/**
 * Fetch a single non-repeating, non-paraphrased DepEd BOW question.
 * Strictly guarantees DIFFERENT subject matter and authentic randomization.
 */
export async function getNonRepeatingDepEdQuestion(
  grade: GradeLevel | 'all' = 'all',
  subject: QuizSubject | 'all' = 'all',
  customTopic?: string,
  language: 'all' | 'filipino' | 'english' = 'all'
): Promise<ChestQuestion> {
  // If user selected 'all', ensure we don't pick the immediate last subject
  const lastSub = recentSubjectsHistory.length > 0 ? recentSubjectsHistory[recentSubjectsHistory.length - 1] : null;

  // 1. Check queue for matching question ONLY if no specific customTopic is requested
  if (!customTopic && language === 'all') {
    const queueIdx = questionQueue.findIndex((q) => {
      if (grade !== 'all' && q.gradeLevel !== grade) return false;
      if (subject !== 'all' && q.subject !== subject) return false;
      if (subject === 'all' && lastSub && q.subject === lastSub) return false;
      return !isQuestionAlreadyAsked(q) && !hasSimilarSubjectMatter(q, false);
    });

    if (queueIdx !== -1) {
      const [q] = questionQueue.splice(queueIdx, 1);
      markQuestionAsAsked(q);
      setTimeout(() => prefetchDepEdQuestions(grade, subject, undefined, language), 200);
      return q;
    }
  }

  // 2. Try online AI generation with DepEd BOW (using customTopic or diverse random topic)
  const aiGenerated = await requestAiDepEdQuestions({ gradeLevel: grade, subject, customTopic, language, count: 1 });
  if (aiGenerated.length > 0) {
    const q = aiGenerated[0];
    markQuestionAsAsked(q);
    if (!customTopic) {
      setTimeout(() => prefetchDepEdQuestions(grade, subject, undefined, language), 200);
    }
    return q;
  }

  // 3. Fallback: Filter unasked questions from local database with strict anti-similarity
  let available = CHEST_QUIZ_QUESTIONS.filter((q) => {
    if (grade !== 'all' && q.gradeLevel !== grade) return false;
    if (subject !== 'all' && q.subject !== subject) return false;
    if (subject === 'all' && lastSub && q.subject === lastSub) return false;
    if (language === 'filipino' && !['filipino', 'ap', 'esp', 'epp'].includes(q.subject)) return false;
    if (language === 'english' && !['english', 'science', 'math'].includes(q.subject)) return false;
    if (isQuestionAlreadyAsked(q)) return false;
    if (hasSimilarSubjectMatter(q, false)) return false;
    return true;
  });

  // If strict anti-similarity pool is empty, relax topic check but maintain unasked check & subject differentiation
  if (available.length === 0) {
    available = CHEST_QUIZ_QUESTIONS.filter((q) => {
      if (grade !== 'all' && q.gradeLevel !== grade) return false;
      if (subject !== 'all' && q.subject !== subject) return false;
      if (subject === 'all' && lastSub && q.subject === lastSub) return false;
      if (language === 'filipino' && !['filipino', 'ap', 'esp', 'epp'].includes(q.subject)) return false;
      if (language === 'english' && !['english', 'science', 'math'].includes(q.subject)) return false;
      return !isQuestionAlreadyAsked(q);
    });
  }

  // If still empty, relax subject differentiation
  if (available.length === 0) {
    available = CHEST_QUIZ_QUESTIONS.filter((q) => {
      if (grade !== 'all' && q.gradeLevel !== grade) return false;
      if (subject !== 'all' && q.subject !== subject) return false;
      return !isQuestionAlreadyAsked(q);
    });
  }

  // If all unasked exhausted, reset history for this grade/subject
  if (available.length === 0) {
    available = CHEST_QUIZ_QUESTIONS.filter((q) => {
      if (grade !== 'all' && q.gradeLevel !== grade) return false;
      if (subject !== 'all' && q.subject !== subject) return false;
      return true;
    });
  }

  if (available.length > 0) {
    const chosen = available[Math.floor(Math.random() * available.length)];
    markQuestionAsAsked(chosen);
    return chosen;
  }

  // Absolute fallback
  const fallback = getRandomChestQuestion(
    grade === 'all' ? undefined : (grade as any),
    subject === 'all' ? undefined : subject
  );
  markQuestionAsAsked(fallback);
  return fallback;
}

/**
 * Fetch 5 non-repeating DepEd BOW questions for player respawn quiz.
 * Strictly guarantees that all 5 questions are from 5 DIFFERENT subjects and 5 DIFFERENT topics.
 * Fully supports custom user topic, grade level, and language preference.
 */
export async function getRespawnQuestionsSet(
  grade: GradeLevel | 'all' = 'all',
  count = 5,
  customTopic?: string,
  language: 'all' | 'filipino' | 'english' = 'all'
): Promise<ChestQuestion[]> {
  const result: ChestQuestion[] = [];
  const usedSubjects = new Set<string>();

  // 1. If cached pre-fetched Groq AI questions are available and no custom topic is forced, use them!
  if (!customTopic && cachedRespawnBatch.length >= count) {
    const pulled = cachedRespawnBatch.splice(0, count);
    for (const q of pulled) {
      if (!isQuestionAlreadyAsked(q)) {
        result.push(q);
        usedSubjects.add(q.subject);
        markQuestionAsAsked(q);
      }
    }
    // Background prefetch for next death
    setTimeout(() => prefetchRespawnBatch(grade, language), 500);
    if (result.length >= count) return result;
  }

  // 2. Try to batch generate via Groq AI (Server guarantees multi-subject & multi-domain assignment)
  const aiBatch = await requestAiDepEdQuestions({
    gradeLevel: grade,
    subject: 'all',
    customTopic,
    language,
    count,
  });
  for (const q of aiBatch) {
    if (!isQuestionAlreadyAsked(q) && result.length < count) {
      result.push(q);
      usedSubjects.add(q.subject);
      markQuestionAsAsked(q);
    }
  }

  // Trigger background prefetch for subsequent deaths
  setTimeout(() => prefetchRespawnBatch(grade, language), 800);

  // If AI batch returned fewer than count, request remaining from Groq AI
  if (result.length < count) {
    try {
      const remainingNeeded = count - result.length;
      const extraAi = await requestAiDepEdQuestions({
        gradeLevel: grade,
        subject: 'all',
        customTopic,
        language,
        count: remainingNeeded,
      });
      for (const q of extraAi) {
        if (!isQuestionAlreadyAsked(q) && result.length < count) {
          result.push(q);
          usedSubjects.add(q.subject);
          markQuestionAsAsked(q);
        }
      }
    } catch {
      // ignore
    }
  }

  // If we still need more to reach count (e.g. offline fallback), fill with distinct subjects from local bank
  const desiredSubjects: QuizSubject[] = ['science', 'ap', 'math', 'filipino', 'mapeh', 'english', 'esp', 'epp'];
  for (const sub of desiredSubjects) {
    if (result.length >= count) break;
    if (usedSubjects.has(sub)) continue;

    // Pick from local bank matching this distinct subject
    let candidates = CHEST_QUIZ_QUESTIONS.filter((q) => {
      if (grade !== 'all' && q.gradeLevel !== grade) return false;
      if (q.subject !== sub) return false;
      if (language === 'filipino' && !['filipino', 'ap', 'esp', 'epp'].includes(q.subject)) return false;
      if (language === 'english' && !['english', 'science', 'math'].includes(q.subject)) return false;
      return !isQuestionAlreadyAsked(q) && !hasSimilarSubjectMatter(q, false);
    });

    if (candidates.length === 0) {
      candidates = CHEST_QUIZ_QUESTIONS.filter((q) => {
        if (grade !== 'all' && q.gradeLevel !== grade) return false;
        if (q.subject !== sub) return false;
        return !isQuestionAlreadyAsked(q);
      });
    }

    if (candidates.length === 0) {
      candidates = CHEST_QUIZ_QUESTIONS.filter((q) => {
        if (grade !== 'all' && q.gradeLevel !== grade) return false;
        return q.subject === sub;
      });
    }

    if (candidates.length > 0) {
      const picked = candidates[Math.floor(Math.random() * candidates.length)];
      result.push(picked);
      usedSubjects.add(sub);
      markQuestionAsAsked(picked);
    }
  }

  // Final safety fill if any still missing
  while (result.length < count) {
    const q = await getNonRepeatingDepEdQuestion(grade, 'all', customTopic, language);
    result.push(q);
  }

  return result;
}

// Auto-prefetch initial Groq AI questions in the background for zero-latency gameplay
if (typeof window !== 'undefined') {
  setTimeout(() => {
    prefetchDepEdQuestions();
    prefetchRespawnBatch();
  }, 1000);
}
