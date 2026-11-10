/**
 * Strict Tagalog Pronunciation and Phonics Validator for Grade 1 Marungko Reading
 * Calibrated with Filipino Vowel Sensitivity (E/I and O/U Allophonic Equivalence)
 * and Speech-to-Text Homophone Resolution.
 */

export interface PronunciationResult {
  isCorrect: boolean;
  score: number; // 1 to 5
  feedbackTagalog: string;
  correctionTips: string[];
  mismatchReason?: string;
  normalizedSpoken?: string;
}

/**
 * Common Web Speech / Google Speech Recognition homophones where Filipino syllables
 * or words are transcribed as English words or alternate spellings.
 */
export const STT_TAGALOG_HOMOPHONES: Record<string, string> = {
  // E and I homophones & short syllables (STT English translations of Filipino syllables)
  'me': 'mi',
  'mee': 'mi',
  'see': 'si',
  'sea': 'si',
  'c': 'si',
  'tea': 'ti',
  'tee': 'ti',
  't': 'ti',
  'bee': 'bi',
  'be': 'bi',
  'b': 'bi',
  'key': 'ki',
  'k': 'ki',
  'knee': 'ni',
  'ne': 'ni',
  'pea': 'pi',
  'pee': 'pi',
  'p': 'pi',
  'we': 'wi',
  'wee': 'wi',
  'he': 'hi',
  'hee': 'hi',
  'dee': 'di',
  'd': 'di',
  'gee': 'gi',
  'g': 'gi',
  'lee': 'li',
  'ri': 'ri',
  'ree': 'ri',
  're': 'ri',
  'ye': 'yi',
  'yee': 'yi',
  'may': 'me',
  'bay': 'be',
  'day': 'de',
  'hay': 'he',
  'kay': 'ke',
  'lay': 'le',
  'pay': 'pe',
  'ray': 're',
  'say': 'se',
  'way': 'we',

  // O and U homophones & short syllables
  'to': 'tu',
  'too': 'tu',
  'two': 'tu',
  'you': 'yu',
  'u': 'yu',
  'who': 'hu',
  'do': 'du',
  'due': 'du',
  'so': 'so',
  'sew': 'so',
  'saw': 'so',
  'sow': 'so',
  'sue': 'su',
  'low': 'lo',
  'law': 'lo',
  'row': 'ro',
  'raw': 'ro',
  'bow': 'bo',
  'beau': 'bo',
  'know': 'no',
  'no': 'no',
  'go': 'go',
  'co': 'ko',
  'paw': 'po',
  'poe': 'po',
  'moe': 'mo',
  'toe': 'to',
  'blue': 'bu',
  'clue': 'ku',
  'flew': 'pu',
  'flu': 'pu',

  // Common colloquial / family words & phrases
  'mom': 'mama',
  'mum': 'mama',
  'ma': 'ma',
  'pa': 'pa',
};

/**
 * Normalizes speech recognition output to match proper Filipino orthography,
 * resolving STT English translations/homophones (like 'me' -> 'MI', 'see' -> 'SI', 'to' -> 'TU')
 * and calibrating Filipino E/I and O/U vowel sensitivity.
 * If targetText is supplied and the spoken sound is phonetically equivalent,
 * it returns the canonical targetText.
 */
export function normalizeFilipinoTranscript(spoken: string, targetText?: string): string {
  if (!spoken) return '';
  const trimmed = spoken.trim();
  if (!trimmed) return '';

  // 1. If targetText is supplied and matches phonetically with E/I and O/U sensitivity:
  if (targetText && areFilipinoPhoneticallyEquivalent(targetText, trimmed)) {
    return targetText;
  }

  // 2. Otherwise, check and map words using STT_TAGALOG_HOMOPHONES
  const words = cleanTagalogText(trimmed).split(' ').filter(Boolean);
  const normalizedWords = words.map((w) => {
    if (STT_TAGALOG_HOMOPHONES[w]) {
      return STT_TAGALOG_HOMOPHONES[w];
    }
    return w;
  });

  return normalizedWords.join(' ');
}

/**
 * Clean and normalize Tagalog text for phonetic comparison:
 * - Lowercase
 * - Strip punctuation, special characters, quotes
 * - Collapse whitespace
 */
export function cleanTagalogText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strips polite particles and standard Filipino articles for word-level matching:
 * e.g., "ang aso" -> "aso", "si mama" -> "mama", "aso po" -> "aso"
 */
export function stripArticlesAndPolite(text: string): string {
  let cleaned = cleanTagalogText(text);
  // Strip trailing polite particles
  cleaned = cleaned.replace(/\bpo\b/g, '').replace(/\bopo\b/g, '').trim();
  // Strip leading Filipino articles, demonstratives, and learning prefixes
  cleaned = cleaned
    .replace(/^(ang\s+mga|ang\s+|si\s+|mga\s+|pantig\s+|salitang\s+|salita\s+|letrang\s+|letra\s+|may\s+|ito\s+ay\s+|ito\s+)/g, '')
    .trim();
  return cleaned;
}

/**
 * Map transcript words using known STT homophones
 */
export function mapSTTHomophones(text: string): string {
  const cleaned = cleanTagalogText(text);
  const words = cleaned.split(' ').filter(Boolean);
  const mapped = words.map((w) => STT_TAGALOG_HOMOPHONES[w] || w);
  return mapped.join(' ');
}

/**
 * Generates the canonical Filipino phonetic sound signature.
 * Incorporates Filipino Vowel Sensitivity:
 * - Vowel group E/I: 'e' and 'i' are allophonic front vowels in Filipino phonology. Both normalize to 'i'.
 * - Vowel group O/U: 'o' and 'u' are allophonic back vowels in Filipino phonology. Both normalize to 'u'.
 * - Consonants: 'c' -> 'k', 'f' -> 'p', 'v' -> 'b', 'z' -> 's', 'j' -> 'dy'.
 * - Collapses repeated letters (e.g. 'mii' -> 'mi', 'see' -> 'si', 'kobo' -> 'kubu').
 */
export function toFilipinoSoundSignature(text: string): string {
  if (!text) return '';
  let s = cleanTagalogText(text).replace(/\s+/g, '');

  // Check direct homophone mapping first
  if (STT_TAGALOG_HOMOPHONES[s]) {
    s = STT_TAGALOG_HOMOPHONES[s];
  }

  // 1. Filipino Vowel Sensitivity: E <-> I
  s = s.replace(/e/g, 'i');

  // 2. Filipino Vowel Sensitivity: O <-> U
  s = s.replace(/o/g, 'u');

  // 3. Consonant Normalization for Philippine Orthography
  s = s.replace(/c(?=[ie])/g, 's'); // soft c -> s
  s = s.replace(/c/g, 'k');        // hard c -> k
  s = s.replace(/f/g, 'p');
  s = s.replace(/v/g, 'b');
  s = s.replace(/z/g, 's');
  s = s.replace(/j/g, 'dy');

  // 4. Collapse consecutive duplicate letters (e.g. 'ii' -> 'i', 'uu' -> 'u', 'mm' -> 'm')
  s = s.replace(/(.)\1+/g, '$1');

  return s;
}

/**
 * Checks if two Tagalog words or phrases are phonetically equivalent,
 * taking into account E/I and O/U sensitivity as well as STT homophones.
 */
export function areFilipinoPhoneticallyEquivalent(target: string, spoken: string): boolean {
  const cleanTarget = cleanTagalogText(target);
  const cleanSpoken = cleanTagalogText(spoken);

  if (!cleanTarget || !cleanSpoken) return false;

  // 1. Direct exact match
  if (cleanTarget === cleanSpoken) return true;

  // 2. Stripped particles match
  const strippedTarget = stripArticlesAndPolite(target);
  const strippedSpoken = stripArticlesAndPolite(spoken);
  if (strippedTarget === strippedSpoken) return true;

  // 3. Homophone mapped match
  const homophoneTarget = mapSTTHomophones(strippedTarget);
  const homophoneSpoken = mapSTTHomophones(strippedSpoken);
  if (homophoneTarget === homophoneSpoken) return true;
  if (cleanTarget === homophoneSpoken) return true;
  if (strippedTarget === homophoneSpoken) return true;

  // 4. Sound signature match (calibrated E/I and O/U vowel sensitivity)
  const sigTarget = toFilipinoSoundSignature(strippedTarget);
  const sigSpoken = toFilipinoSoundSignature(strippedSpoken);
  if (sigTarget.length > 0 && sigTarget === sigSpoken) return true;

  // Also check sound signature on mapped homophone
  const sigHomophoneSpoken = toFilipinoSoundSignature(homophoneSpoken);
  if (sigTarget.length > 0 && sigTarget === sigHomophoneSpoken) return true;

  // 5. Syllable-by-syllable match (e.g. KU-BO vs ko-bo, BO-TE vs bo-ti)
  const targetTokens = cleanTarget.split(/[\s-]+/).filter(Boolean);
  const spokenTokens = cleanSpoken.split(/[\s-]+/).filter(Boolean);
  if (targetTokens.length > 1 && targetTokens.length === spokenTokens.length) {
    const allMatch = targetTokens.every((tt, idx) => {
      const st = spokenTokens[idx];
      return (
        tt === st ||
        toFilipinoSoundSignature(tt) === toFilipinoSoundSignature(st) ||
        STT_TAGALOG_HOMOPHONES[st] === tt
      );
    });
    if (allMatch) return true;
  }

  return false;
}

/**
 * Helper to produce friendly educational clarification when speech recognition
 * outputs an English homophone or allophonic vowel (e.g. heard 'me' for 'MI').
 */
export function getFilipinoPhoneticClarification(spoken: string, target: string): string | null {
  const cleanSpoken = cleanTagalogText(spoken);
  const cleanTarget = cleanTagalogText(target);
  if (!cleanSpoken || !cleanTarget || cleanSpoken === cleanTarget) return null;

  if (areFilipinoPhoneticallyEquivalent(target, spoken)) {
    return `Tumpak! Ang tunog na "${spoken}" ay katumbas ng pagbasa sa "${target}".`;
  }
  return null;
}

/**
 * Deterministic pronunciation evaluator for Grade 1 Marungko Reading.
 * Calibrated with:
 * - E/I sensitivity: "MI" matched with "me", "SI" matched with "see", "BOTE" with "boti", etc.
 * - O/U sensitivity: "KUBO" matched with "kobo", "PUSA" with "posa", "KU" with "ko", etc.
 * - Strictness: NEVER marks completely different consonants or distinct words (like "MA" for "MI" or "baso" for "aso") as correct.
 */
export function evaluatePronunciationStrict(
  targetText: string,
  spokenTranscript: string,
  category: string = 'two_letters'
): PronunciationResult {
  const cleanTarget = cleanTagalogText(targetText);
  const cleanSpoken = cleanTagalogText(spokenTranscript);
  const strippedTarget = stripArticlesAndPolite(targetText);
  const strippedSpoken = stripArticlesAndPolite(spokenTranscript);

  // 1. Silence or empty speech
  if (!cleanSpoken || cleanSpoken.length === 0) {
    return {
      isCorrect: false,
      score: 1,
      feedbackTagalog: 'Walang narinig na boses. Pakilakasan ang boses at basahin muli.',
      correctionTips: [
        'Lumapit sa mikropono.',
        `Basahin nang malinaw ang "${targetText}".`,
      ],
      mismatchReason: 'Walang boses na naitala (Empty transcript)',
    };
  }

  // 2. Direct exact match (fast path)
  if (cleanTarget === cleanSpoken || strippedTarget === strippedSpoken) {
    return {
      isCorrect: true,
      score: 5,
      feedbackTagalog: `Napakagaling! Tumpak at napakalinaw ng iyong pagbasa sa "${targetText}"!`,
      correctionTips: ['Ipagpatuloy ang magandang pagbasa!'],
      normalizedSpoken: targetText,
    };
  }

  // 3. Category: Two Letters (2 Letra / Pantig - e.g. MI, MA, SI, SA, KU, KO, BO, TU, etc.)
  if (category === 'two_letters' || category === 'syllable') {
    const pantigLower = targetText.trim().toLowerCase();
    // Check phonetic equivalence with E/I and O/U sensitivity & STT homophones
    if (areFilipinoPhoneticallyEquivalent(targetText, spokenTranscript)) {
      return {
        isCorrect: true,
        score: 5,
        feedbackTagalog: `Napakagaling! Tumpak ang pagbasa mo sa pantig na "${pantigLower}"!`,
        correctionTips: ['Magaling na pagbigkas sa buong pantig!'],
        normalizedSpoken: targetText,
      };
    }

    // Check if user added polite prefixes/suffixes like "pantig mi", "letrang mi", "ang mi"
    const validVariants = [
      strippedTarget,
      `pantig ${strippedTarget}`,
      `letrang ${strippedTarget}`,
      `ang ${strippedTarget}`,
    ];

    if (validVariants.some((v) => areFilipinoPhoneticallyEquivalent(v, strippedSpoken))) {
      return {
        isCorrect: true,
        score: 5,
        feedbackTagalog: `Napakagaling! Tumpak ang pagbasa mo sa pantig na "${pantigLower}"!`,
        correctionTips: ['Magaling na pagbigkas sa buong pantig!'],
        normalizedSpoken: targetText,
      };
    }

    return {
      isCorrect: false,
      score: 2,
      feedbackTagalog: `Muntik na! Binigkas mo ang "${spokenTranscript}", ngunit ang binabasang pantig ay "${pantigLower}".`,
      correctionTips: [
        `Pakinggan ang buong tunog ng pantig na "${pantigLower}".`,
        'Pindutin ang speaker icon upang pakinggan ang wastong pagbasa ng pantig.',
      ],
      mismatchReason: `Ibang pantig ang binasa ("${spokenTranscript}" sa halip na "${pantigLower}")`,
    };
  }

  // 4. Category: Three Letters (3 Letra - e.g. ASO, ISA, AMO, BUS, ANG, etc.)
  if (category === 'three_letters') {
    if (areFilipinoPhoneticallyEquivalent(targetText, spokenTranscript)) {
      return {
        isCorrect: true,
        score: 5,
        feedbackTagalog: `Napakagaling! Tumpak ang pagbasa mo sa 3 letrang salitang "${targetText}"!`,
        correctionTips: ['Napakagandang pagbasa!'],
        normalizedSpoken: targetText,
      };
    }

    const validVariants = [
      strippedTarget,
      `ang ${strippedTarget}`,
      `si ${strippedTarget}`,
      `may ${strippedTarget}`,
    ];

    if (validVariants.some((v) => areFilipinoPhoneticallyEquivalent(v, strippedSpoken))) {
      return {
        isCorrect: true,
        score: 5,
        feedbackTagalog: `Napakagaling! Tumpak ang pagbasa mo sa 3 letrang salitang "${targetText}"!`,
        correctionTips: ['Napakagandang pagbasa!'],
        normalizedSpoken: targetText,
      };
    }

    // Rhyming substitution check (e.g. student said "baso" when reading "aso")
    if (strippedTarget === 'aso' && strippedSpoken.includes('baso')) {
      return {
        isCorrect: false,
        score: 2,
        feedbackTagalog: `Muntik na! Ang iyong binigkas ay "baso", ngunit ang salita rito ay "aso" (walang letrang B sa unahan).`,
        correctionTips: [
          'Simulan ang pagbasa sa tunog ng letrang "A".',
          'Basahin muli: A-SO -> ASO.',
        ],
        mismatchReason: `Maling salita ("baso" sa halip na "aso")`,
      };
    }

    // Incomplete reading (e.g. only 1 or 2 letters read)
    if (strippedSpoken.length <= 2 && strippedTarget.startsWith(strippedSpoken)) {
      return {
        isCorrect: false,
        score: 3,
        feedbackTagalog: `Kulang pa ang nabasa ("${spokenTranscript}"). Buuin natin ang 3 letrang salita: "${targetText}"!`,
        correctionTips: [
          `Basahin nang buo ang 3 letra: "${targetText}".`,
          'Pindutin ang speaker para pakinggan.',
        ],
        mismatchReason: `Kulang ang nabasa: "${spokenTranscript}" sa "${targetText}"`,
      };
    }

    return {
      isCorrect: false,
      score: 2,
      feedbackTagalog: `Muntik na! Narinig ko ang "${spokenTranscript}", ngunit ang salita ay "${targetText}". Subukan nating muli!`,
      correctionTips: [
        `Tingnan nang mabuti ang bawat letra sa "${targetText}".`,
        'Pakinggan ang tamang bigkas sa speaker.',
      ],
      mismatchReason: `Maling 3 letrang salita ang binasa ("${spokenTranscript}" vs "${targetText}")`,
    };
  }

  // 5. Category: Four Letters (4 na Letra / Dalawang Pantig - e.g. MAMA, SAMA, KUBO, BOTE, etc.)
  if (category === 'four_letters' || category === 'word' || category === 'words') {
    if (areFilipinoPhoneticallyEquivalent(targetText, spokenTranscript)) {
      return {
        isCorrect: true,
        score: 5,
        feedbackTagalog: `Napakagaling! Tumpak ang pagbasa mo sa salitang "${targetText}"!`,
        correctionTips: ['Napakagandang pagbasa!'],
        normalizedSpoken: targetText,
      };
    }

    const validVariants = [
      strippedTarget,
      `ang ${strippedTarget}`,
      `si ${strippedTarget}`,
      `mga ${strippedTarget}`,
    ];

    if (validVariants.some((v) => areFilipinoPhoneticallyEquivalent(v, strippedSpoken))) {
      return {
        isCorrect: true,
        score: 5,
        feedbackTagalog: `Napakagaling! Tumpak ang pagbasa mo sa salitang "${targetText}"!`,
        correctionTips: ['Napakagandang pagbasa!'],
        normalizedSpoken: targetText,
      };
    }

    // Check if only 1 syllable was read (e.g. student said "ma" for "mama", or "bo" for "bote")
    if (strippedTarget.length >= 4 && strippedSpoken.length <= 2 && strippedTarget.startsWith(strippedSpoken)) {
      return {
        isCorrect: false,
        score: 3,
        feedbackTagalog: `Kalahati pa lamang ang iyong nabasa ("${spokenTranscript}"). Dugtungan natin upang mabuo ang salitang "${targetText}"!`,
        correctionTips: [
          `Basahin nang tuloy-tuloy ang dalawang pantig: "${targetText}".`,
        ],
        mismatchReason: `Kulang ang pantig: "${spokenTranscript}" lamang ang nabasa sa "${targetText}"`,
      };
    }

    return {
      isCorrect: false,
      score: 2,
      feedbackTagalog: `Muntik na! Binigkas mo ang "${spokenTranscript}", ngunit ang salita ay "${targetText}". Subukan nating muli!`,
      correctionTips: [
        `Pagsamahin ang dalawang pantig ng "${targetText}".`,
        'Pindutin ang speaker upang pakinggan ang wastong pagbasa.',
      ],
      mismatchReason: `Maling salita ang binigkas ("${spokenTranscript}" vs "${targetText}")`,
    };
  }

  // 6. Category: Sentence (Pangungusap)
  if (category === 'sentence') {
    const targetWords = cleanTarget.split(' ').filter(Boolean);
    const spokenWords = cleanSpoken.split(' ').filter(Boolean);

    let matchCount = 0;
    for (const tw of targetWords) {
      // Use Filipino phonetic equivalence for each word in sentence
      const matched = spokenWords.some((sw) => areFilipinoPhoneticallyEquivalent(tw, sw));
      if (matched) {
        matchCount++;
      }
    }

    const accuracy = targetWords.length > 0 ? matchCount / targetWords.length : 0;

    if (accuracy >= 0.75 && spokenWords.length >= Math.max(1, targetWords.length - 2)) {
      return {
        isCorrect: true,
        score: 5,
        feedbackTagalog: `Mahusay! Nabasa mo nang buo at wasto ang pangungusap: "${targetText}"!`,
        correctionTips: ['Ipagpatuloy ang magandang pagbasa!'],
        normalizedSpoken: targetText,
      };
    } else {
      return {
        isCorrect: false,
        score: 2,
        feedbackTagalog: `Muntik na! Narinig ko ang "${spokenTranscript}". Ang buong pangungusap ay "${targetText}".`,
        correctionTips: [
          'Basahin nang dahan-dahan ang bawat salita mula kaliwa pakanan.',
          'Pakinggan ang buong pangungusap sa pamamagitan ng speaker icon.',
        ],
        mismatchReason: `Kulang o may maling salita sa pangungusap (${Math.round(accuracy * 100)}% tumpak)`,
      };
    }
  }

  // Default fallback check
  if (areFilipinoPhoneticallyEquivalent(targetText, spokenTranscript)) {
    return {
      isCorrect: true,
      score: 5,
      feedbackTagalog: `Napakagaling! Tumpak ang iyong pagbasa sa "${targetText}"!`,
      correctionTips: ['Ipagpatuloy ang magandang pagbasa!'],
      normalizedSpoken: targetText,
    };
  }

  return {
    isCorrect: false,
    score: 2,
    feedbackTagalog: `Binigkas mo ang "${spokenTranscript}". Ang binabasang aralin ay "${targetText}".`,
    correctionTips: ['Subukang basahin muli nang malinaw.'],
    mismatchReason: 'Hindi tugma ang binasa',
  };
}

/**
 * Strict and supportive English Phonics and Reading Evaluator
 * Supports CVC words, Sight Words, Blends/Digraphs, and Sentences
 */
export function evaluateEnglishPronunciationStrict(
  targetText: string,
  spokenTranscript: string,
  category: string
): PronunciationResult {
  const normTarget = (targetText || '').trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const normSpoken = (spokenTranscript || '').trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');

  if (!normSpoken) {
    return {
      isCorrect: false,
      score: 1,
      feedbackTagalog: `No voice detected. Please read "${targetText}" clearly into the microphone.`,
      correctionTips: ['Make sure your microphone is unmuted and speak clearly.'],
      mismatchReason: 'Walang narinig na boses',
    };
  }

  // Exact word match
  if (normTarget === normSpoken) {
    return {
      isCorrect: true,
      score: 5,
      feedbackTagalog: `Excellent! You pronounced "${targetText}" clearly and correctly! ⭐ +10 Stars`,
      correctionTips: ['Great pronunciation! Keep practicing your English words.'],
      normalizedSpoken: targetText,
    };
  }

  // Sentence evaluation
  if (category === 'sentence') {
    const targetWords = normTarget.split(/\s+/).filter(Boolean);
    const spokenWords = normSpoken.split(/\s+/).filter(Boolean);

    let matchCount = 0;
    targetWords.forEach((word) => {
      if (spokenWords.includes(word)) {
        matchCount++;
      }
    });

    const accuracy = targetWords.length > 0 ? matchCount / targetWords.length : 0;
    if (accuracy >= 0.70) {
      return {
        isCorrect: true,
        score: 5,
        feedbackTagalog: `Fantastic reading! You read the full sentence: "${targetText}"! ⭐ +10 Stars`,
        correctionTips: ['Wonderful English sentence reading!'],
        normalizedSpoken: targetText,
      };
    } else {
      return {
        isCorrect: false,
        score: 2,
        feedbackTagalog: `Good try! Heard "${spokenTranscript}". The complete sentence is "${targetText}".`,
        correctionTips: [
          'Listen to the sentence audio by clicking the speaker button.',
          'Read each word one by one from left to right.',
        ],
        mismatchReason: `Partial match (${Math.round(accuracy * 100)}% accuracy)`,
      };
    }
  }

  // Single word checks (CVC, Sight Words, Blends)
  // Check if spoken contains the target word (e.g. said "the cat" when word is "cat")
  const spokenTokens = normSpoken.split(/\s+/);
  if (spokenTokens.includes(normTarget)) {
    return {
      isCorrect: true,
      score: 5,
      feedbackTagalog: `Great job! You pronounced "${targetText}" correctly! ⭐ +10 Stars`,
      correctionTips: ['Keep reading more English words!'],
      normalizedSpoken: targetText,
    };
  }

  // Check slight plural/singular or trailing sound leniency
  if (normSpoken === normTarget + 's' || normTarget === normSpoken + 's') {
    return {
      isCorrect: true,
      score: 4,
      feedbackTagalog: `Very good! Close pronunciation for "${targetText}".`,
      correctionTips: [`Listen to "${targetText}" and practice the ending sound.`],
      normalizedSpoken: targetText,
    };
  }

  return {
    isCorrect: false,
    score: 2,
    feedbackTagalog: `Heard "${spokenTranscript}", but the target word is "${targetText}". Let's try again!`,
    correctionTips: [
      `Sound out the letters: ${targetText}.`,
      'Click the speaker button to hear the correct pronunciation.',
    ],
    mismatchReason: 'Word mismatch',
  };
}
