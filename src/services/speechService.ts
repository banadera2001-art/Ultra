/**
 * Speech Service handling fluent Tagalog TTS (Text-to-Speech) and STT (Speech-to-Text)
 * Uses high-fidelity Gemini AI TTS with client-side Web Speech fallback.
 */

import { ReadingItem } from '../types';

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

// Active speech trackers
let currentAudioElement: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let availableVoices: SpeechSynthesisVoice[] = [];

// Client-side cache of generated audio URLs for instant re-play
const clientAudioCache = new Map<string, string>();

// Initialize voices as soon as browser is ready
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    try {
      availableVoices = window.speechSynthesis.getVoices() || [];
    } catch {
      availableVoices = [];
    }
  };

  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

/**
 * Stop any active TTS audio playback (both HTML5 audio and browser speech synthesis)
 */
export function stopSpeech() {
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch {}
    currentAudioElement = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
  currentUtterance = null;
}

/**
 * Intelligent voice selector for Web Speech API:
 * 1. Native Filipino / Tagalog voices (e.g. fil-PH, tl-PH)
 * 2. Indonesian / Malay voices (identical open 5-vowel phonology and consonant phonetics)
 * 3. Spanish voices (preserves pure vowel sounds /a, e, i, o, u/ instead of English diphthongs)
 * 4. Default system voice
 */
function getBestVoiceForTagalog(): SpeechSynthesisVoice | null {
  if (!availableVoices || availableVoices.length === 0) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      availableVoices = window.speechSynthesis.getVoices() || [];
    }
  }

  // Priority 1: Filipino / Tagalog
  const filipinoVoice = availableVoices.find((v) => {
    const lang = (v.lang || '').toLowerCase();
    const name = (v.name || '').toLowerCase();
    return (
      lang.startsWith('fil') ||
      lang.startsWith('tl') ||
      name.includes('filipino') ||
      name.includes('tagalog')
    );
  });
  if (filipinoVoice) return filipinoVoice;

  // Priority 2: Indonesian / Malay (shares Austronesian phonology with Tagalog)
  const indonesianVoice = availableVoices.find((v) => {
    const lang = (v.lang || '').toLowerCase();
    return lang.startsWith('id') || lang.startsWith('ms');
  });
  if (indonesianVoice) return indonesianVoice;

  // Priority 3: Spanish (pure 5-vowel phonetics, avoids English "ay-so" pronunciation)
  const spanishVoice = availableVoices.find((v) => {
    const lang = (v.lang || '').toLowerCase();
    return lang.startsWith('es');
  });
  if (spanishVoice) return spanishVoice;

  return null;
}

/**
 * Normalize and prepare text for fluent Tagalog text-to-speech.
 * Prevents 2-letter syllables (e.g. MA, BA, SA, TA) from sounding like English/Tagalog acronyms ("M at A" / "Em-Ey"),
 * ensuring they are pronounced with authentic Grade 1 Filipino syllable (pantig) sounds.
 */
export function normalizeTextForTagalogSpeech(rawText: string): string {
  if (!rawText) return '';
  let text = rawText.trim();

  // 1. Isolated 2-letter syllable (e.g. "MA", "Ma", "BA", "Ba", "SA", "Sa", "TA", "Ta"):
  // Convert to lowercase so Google TTS and Web Speech API pronounce the syllable (pantig) sound, NOT the letter names!
  if (/^[A-Za-z]{2}[.!?]?$/.test(text)) {
    return text.toLowerCase();
  }

  // 2. In phrases and sentences:
  // Convert "letrang [2-letter]" to "pantig na [lowercase 2-letter]"
  text = text.replace(/\bletrang\s+([A-Za-z]{2})\b/gi, (_, syl) => `pantig na ${syl.toLowerCase()}`);

  // Convert quoted 2-letter words e.g. "MA" to "ma"
  text = text.replace(/(["'])([A-Za-z]{2})\1/g, (_, quote, syl) => `${quote}${syl.toLowerCase()}${quote}`);

  // Convert standalone uppercase 2-letter words to lowercase
  text = text.replace(/\b([A-Z]{2})\b/g, (match) => match.toLowerCase());

  return text;
}

/**
 * Client-side Web Speech Synthesis fallback
 */
function fallbackClientTTS(
  text: string,
  onEnd?: () => void,
  onError?: (err: unknown) => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.('Speech synthesis not supported');
    return false;
  }

  try {
    window.speechSynthesis.cancel();

    const processedText = normalizeTextForTagalogSpeech(text);
    const utterance = new SpeechSynthesisUtterance(processedText);
    currentUtterance = utterance;

    const bestVoice = getBestVoiceForTagalog();
    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang;
    } else {
      utterance.lang = 'tl-PH';
    }

    utterance.rate = 0.88; // Clear cadence for Grade 1
    utterance.pitch = 1.0; // Natural, warm pitch
    utterance.volume = 1.0;

    utterance.onend = () => {
      currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('Browser SpeechSynthesis error:', e);
      currentUtterance = null;
      onError?.(e);
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Fallback TTS Exception:', err);
    onError?.(err);
    return false;
  }
}

/**
 * Speak text in natural, fluent Tagalog.
 * Free, unlimited, native Tagalog voice via Google Translate Filipino Voice engine with client-side caching.
 * Ensures 2-letter syllables (pantig) are pronounced as whole syllables, never spelled out as separate letters.
 */
export function speakTagalog(
  text: string,
  onEnd?: () => void,
  onError?: (err: unknown) => void
): boolean {
  if (!text || text.trim().length === 0) return false;

  stopSpeech();

  const processedText = normalizeTextForTagalogSpeech(text);
  const cacheKey = processedText.toLowerCase();

  // 1. Instant playback from client-side memory cache
  if (clientAudioCache.has(cacheKey)) {
    const audioUrl = clientAudioCache.get(cacheKey)!;
    playAudioUrl(audioUrl, onEnd, () => fallbackClientTTS(processedText, onEnd, onError));
    return true;
  }

  // 2. Fetch free, unlimited Tagalog neural voice from server
  fetch('/api/ai/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: processedText }),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`TTS server error: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (data?.audioUrl) {
        clientAudioCache.set(cacheKey, data.audioUrl);
        playAudioUrl(data.audioUrl, onEnd, () => fallbackClientTTS(processedText, onEnd, onError));
      } else {
        // Fallback to client speech synthesis
        fallbackClientTTS(processedText, onEnd, onError);
      }
    })
    .catch((err) => {
      console.warn('Server TTS fetch failed, using browser speech:', err);
      fallbackClientTTS(processedText, onEnd, onError);
    });

  return true;
}

/**
 * Plays an audio URL via HTML5 Audio
 */
function playAudioUrl(url: string, onEnd?: () => void, onPlaybackError?: () => void) {
  try {
    const audio = new Audio(url);
    currentAudioElement = audio;

    audio.onended = () => {
      currentAudioElement = null;
      onEnd?.();
    };

    audio.onerror = (e) => {
      console.warn('Audio playback error:', e);
      currentAudioElement = null;
      onPlaybackError?.();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Audio play promise rejected:', err);
        currentAudioElement = null;
        onPlaybackError?.();
      });
    }
  } catch (e) {
    console.warn('Error creating Audio element:', e);
    onPlaybackError?.();
  }
}

/**
 * Educational speech helper for Marungko Reading items:
 * Speaks the target syllable, word, or sentence directly and clearly in fluent Tagalog.
 * For 2-letter items (pantig), guarantees the unified syllable sound (e.g. /ma/, /ba/) without spelling letters.
 */
export function speakMarungkoReadingItem(item: ReadingItem, onEnd?: () => void) {
  if (!item) return;
  if (item.category === 'two_letters' || item.text.trim().length === 2) {
    // Speak the pure pantig sound (e.g. "ma", "ba", "sa")
    speakTagalog(item.text.trim().toLowerCase(), onEnd);
  } else {
    speakTagalog(item.text, onEnd);
  }
}

/**
 * Speak text in natural, clear English (US/Global English accent for early phonics learners)
 */
export function speakEnglish(
  text: string,
  onEnd?: () => void,
  onError?: (err: unknown) => void
): boolean {
  if (!text || text.trim().length === 0) return false;
  stopSpeech();

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.05;

    // Pick best English voice if available
    if (availableVoices && availableVoices.length > 0) {
      const enVoice = availableVoices.find((v) => {
        const lang = (v.lang || '').toLowerCase();
        return lang.startsWith('en-us') || lang.startsWith('en');
      });
      if (enVoice) {
        utterance.voice = enVoice;
      }
    }

    utterance.onend = () => {
      currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('English SpeechSynthesis error:', e);
      currentUtterance = null;
      onError?.(e);
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Error speaking English:', err);
    onError?.(err);
    return false;
  }
}

/**
 * Educational speech helper for any Reading item (Filipino or English)
 */
export function speakReadingItem(item: ReadingItem, onEnd?: () => void) {
  if (!item) return;
  if (item.language === 'english') {
    speakEnglish(item.text, onEnd);
  } else {
    speakMarungkoReadingItem(item, onEnd);
  }
}

/**
 * Speech Recognition (STT) Controller for Tagalog / Filipino / English
 */
export class TagalogSpeechRecognizer {
  private recognition: SpeechRecognitionInstance | null = null;
  private isListening = false;

  constructor(lang: string = 'tl-PH') {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
      this.recognition.lang = lang;
    }
  }

  public setLanguage(lang: string) {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: string) => void
  ): boolean {
    if (!this.recognition) {
      onError?.('Hindi suportado ang Speech Recognition sa browser na ito.');
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.recognition.onstart = () => {
      this.isListening = true;
      onStart?.();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      const isFinal = Boolean(finalTranscript);
      onResult(text.trim(), isFinal);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isListening = false;
      let errorMsg = 'Nagkaroon ng error sa mikropono.';
      if (event.error === 'no-speech') {
        errorMsg = 'Walang narinig na boses. Subukang magsalita muli.';
      } else if (event.error === 'not-allowed') {
        errorMsg = 'Pahintulutan ang mikropono sa iyong browser.';
      }
      onError?.(errorMsg);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd?.();
    };

    try {
      this.recognition.start();
      return true;
    } catch (e) {
      console.error('Error starting STT:', e);
      this.isListening = false;
      onError?.('Hindi masimulan ang mikropono.');
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping STT:', e);
      }
      this.isListening = false;
    }
  }
}
