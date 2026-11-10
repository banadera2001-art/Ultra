import { AIEvaluationResponse } from '../types';
import {
  evaluatePronunciationStrict,
  evaluateEnglishPronunciationStrict,
} from '../utils/pronunciationValidator';

export async function evaluateReadingWithAI(
  targetText: string,
  spokenTranscript: string,
  category: string,
  _groupId: number,
  language: 'filipino' | 'english' = 'filipino'
): Promise<AIEvaluationResponse> {
  // If English reading mode:
  if (language === 'english') {
    const englishResult = evaluateEnglishPronunciationStrict(
      targetText,
      spokenTranscript,
      category
    );
    return {
      isCorrect: englishResult.isCorrect,
      score: englishResult.score,
      transcription: spokenTranscript || '(no speech detected)',
      normalizedSpoken: englishResult.normalizedSpoken || targetText,
      feedbackTagalog: englishResult.feedbackTagalog,
      correctionTips: englishResult.correctionTips,
    };
  }

  // Instant, sub-millisecond evaluation for BOTH correct and wrong answers!
  // Uses deterministic Filipino phonetics and vowel allophonic sensitivity (E/I, O/U)
  // Ensures 2-letter syllables (e.g. "Ma", "Ba", "Si") give pantig-sound feedback, never spelling out letters.
  const strictResult = evaluatePronunciationStrict(
    targetText,
    spokenTranscript,
    category
  );

  return {
    isCorrect: strictResult.isCorrect,
    score: strictResult.score,
    transcription: spokenTranscript || '(walang narinig)',
    normalizedSpoken: strictResult.normalizedSpoken || targetText,
    feedbackTagalog: strictResult.feedbackTagalog,
    correctionTips: strictResult.correctionTips,
  };
}

export async function evaluateWritingWithAI(
  imageBase64: string,
  targetText: string,
  guideType: string,
  strokeData?: { strokeCount?: number; pixelCount?: number }
): Promise<AIEvaluationResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch('/api/ai/evaluate-writing', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64,
        targetText,
        guideType,
        strokeData,
      }),
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data: AIEvaluationResponse = await res.json();
    return data;
  } catch (err) {
    console.warn('AI Writing evaluation fallback:', err);
    return {
      isCorrect: false,
      score: 2,
      feedbackTagalog: `Hindi mabasa nang malinaw ang iyong isinulat na "${targetText}". Pakisulat muli nang mas malinaw sa loob ng mga linya bago pindutin ang Isubmit.`,
      correctionTips: ['Gamitin ang mouse upang sundan ang hugis ng letra sa pagitan ng mga linya.'],
      detailedAnalysis: {
        alignmentScore: 2,
        sizingScore: 2,
        legibilityScore: 2,
      },
    };
  }
}

export async function evaluateMathWithAI(
  imageBase64: string,
  num1: number,
  num2: number,
  operation: string,
  expectedAnswer: number,
  strokeData?: { strokeCount?: number; pixelCount?: number }
): Promise<AIEvaluationResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8500);

    const res = await fetch('/api/ai/evaluate-math', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64,
        num1,
        num2,
        operation,
        expectedAnswer,
        strokeData,
      }),
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data: AIEvaluationResponse = await res.json();
    return data;
  } catch (err) {
    console.warn('AI Math evaluation fallback:', err);
    return {
      isCorrect: false,
      score: 2,
      recognizedText: 'hindi matukoy',
      feedbackTagalog: `Hindi mabasa nang malinaw ang isinulat mong numero para sa ${num1} ${operation} ${num2}. Ang tamang sagot ay ${expectedAnswer}. Pakisulat muli nang malinaw gamit ang mouse.`,
      correctionTips: ['Subukang isulat muli ang tamang numero gamit ang mouse.'],
    };
  }
}

