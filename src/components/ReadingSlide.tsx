import React, { useState, useEffect, useRef } from 'react';
import { MARUNGKO_GROUPS, READING_ITEMS } from '../data/marungkoData';
import { ENGLISH_READING_UNITS, ENGLISH_READING_ITEMS } from '../data/englishReadingData';
import {
  MarungkoGroupId,
  ExerciseCategory,
  ReadingItem,
  ReadingLanguage,
  AIEvaluationResponse,
} from '../types';
import {
  speakTagalog,
  speakEnglish,
  speakReadingItem,
  speakMarungkoReadingItem,
  TagalogSpeechRecognizer,
} from '../services/speechService';
import { evaluateReadingWithAI } from '../services/aiService';
import {
  areFilipinoPhoneticallyEquivalent,
  normalizeFilipinoTranscript,
} from '../utils/pronunciationValidator';
import { playStarSound, playSuccessFanfare, playTryAgainSound } from '../services/soundEffects';
import confetti from 'canvas-confetti';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Globe,
  BookOpen,
} from 'lucide-react';

interface ReadingSlideProps {
  voiceEnabled: boolean;
  onAwardStars: (count: number) => void;
  onLogHistory: (type: 'reading' | 'writing' | 'math', target: string, score: number, feedback: string) => void;
}

export const ReadingSlide: React.FC<ReadingSlideProps> = ({
  voiceEnabled,
  onAwardStars,
  onLogHistory,
}) => {
  // Language Selector: Filipino (Marungko) or English
  const [language, setLanguage] = useState<ReadingLanguage>('filipino');

  // Filipino Marungko State
  const [selectedGroup, setSelectedGroup] = useState<MarungkoGroupId>(1);
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all');

  // English State
  const [selectedEnglishUnit, setSelectedEnglishUnit] = useState<number>(1);
  const [selectedEnglishCategory, setSelectedEnglishCategory] = useState<string>('all');

  const [currentIndex, setCurrentIndex] = useState(0);

  // STT State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [sttError, setSttError] = useState<string | null>(null);

  // Evaluation State
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<AIEvaluationResponse | null>(null);

  const recognizerRef = useRef<TagalogSpeechRecognizer | null>(null);

  useEffect(() => {
    recognizerRef.current = new TagalogSpeechRecognizer(language === 'english' ? 'en-US' : 'tl-PH');
  }, []);

  // Update STT language whenever reading language changes
  useEffect(() => {
    if (recognizerRef.current) {
      recognizerRef.current.setLanguage(language === 'english' ? 'en-US' : 'tl-PH');
    }
    setCurrentIndex(0);
    setTranscript('');
    setEvaluation(null);
    setSttError(null);
  }, [language]);

  // Filter items based on active language, group/unit, and category
  const filteredItems: ReadingItem[] =
    language === 'filipino'
      ? READING_ITEMS.filter((item) => {
          const matchGroup = item.groupId === selectedGroup;
          const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
          return matchGroup && matchCategory;
        })
      : ENGLISH_READING_ITEMS.filter((item) => {
          const matchUnit = (item.unitId || 1) === selectedEnglishUnit;
          const matchCategory =
            selectedEnglishCategory === 'all' || item.category === selectedEnglishCategory;
          return matchUnit && matchCategory;
        });

  const activeItem: ReadingItem | undefined = filteredItems[currentIndex] || filteredItems[0];

  // Reset evaluation state when changing item or group
  useEffect(() => {
    setTranscript('');
    setEvaluation(null);
    setSttError(null);
  }, [selectedGroup, selectedCategory, selectedEnglishUnit, selectedEnglishCategory, currentIndex]);

  // Audio helper
  const handleListenTarget = () => {
    if (!activeItem) return;
    speakReadingItem(activeItem);
  };

  // Start Speech Recognition
  const handleStartMic = () => {
    if (!recognizerRef.current) return;
    setSttError(null);
    setTranscript('');
    setEvaluation(null);

    // Ensure correct STT locale before starting
    recognizerRef.current.setLanguage(language === 'english' ? 'en-US' : 'tl-PH');

    const started = recognizerRef.current.startListening(
      (text, isFinal) => {
        if (language === 'filipino') {
          const normalized = normalizeFilipinoTranscript(text, activeItem?.text);
          setTranscript(normalized || text);
          if (isFinal && text.trim().length > 0) {
            handleEvaluateReading(normalized || text.trim());
          }
        } else {
          setTranscript(text);
          if (isFinal && text.trim().length > 0) {
            handleEvaluateReading(text.trim());
          }
        }
      },
      () => setIsListening(true),
      () => setIsListening(false),
      (err) => {
        setIsListening(false);
        setSttError(err);
      }
    );

    if (!started) {
      setSttError('Hindi masimulan ang mikropono. Siguraduhing pinahintulutan sa browser.');
    }
  };

  // Stop Mic
  const handleStopMic = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stopListening();
    }
    setIsListening(false);
  };

  // Submit transcript for AI Evaluation
  const handleEvaluateReading = async (textToEvaluate: string) => {
    if (!activeItem) return;
    setIsEvaluating(true);

    try {
      const result = await evaluateReadingWithAI(
        activeItem.text,
        textToEvaluate,
        activeItem.category,
        activeItem.groupId,
        language
      );

      setEvaluation(result);

      if (result.isCorrect) {
        playStarSound();
        playSuccessFanfare();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        onAwardStars(10);
        onLogHistory('reading', activeItem.text, 100, result.feedbackTagalog);

        if (voiceEnabled) {
          if (language === 'english') {
            speakEnglish(result.feedbackTagalog);
          } else {
            speakTagalog(result.feedbackTagalog);
          }
        }
      } else {
        playTryAgainSound();
        onLogHistory('reading', activeItem.text, 40, result.feedbackTagalog);

        if (voiceEnabled) {
          if (language === 'english') {
            speakEnglish(`Let's listen to the word: ${activeItem.text}.`);
          } else {
            if (activeItem.category === 'two_letters' || activeItem.text.trim().length === 2) {
              speakTagalog(
                `${result.feedbackTagalog} Pakinggan natin ang wastong pagbasa ng pantig na ${activeItem.text.toLowerCase()}.`
              );
            } else if (activeItem.category === 'sentence') {
              speakTagalog(`${result.feedbackTagalog} Pakinggan natin ang wastong pagbasa ng pangungusap.`);
            } else {
              speakTagalog(
                `${result.feedbackTagalog} Pakinggan natin ang wastong pagbasa ng salitang ${activeItem.text}.`
              );
            }
          }
        }
      }
    } catch (err) {
      console.error('Reading eval error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(filteredItems.length - 1);
    }
  };

  return (
    <div id="reading-slide-container" className="h-full flex flex-col justify-between overflow-hidden p-2 sm:p-3 max-w-4xl mx-auto w-full">
      
      {/* Top Banner: Language Switcher & Curriculum Selectors */}
      <div className="bg-white rounded-2xl p-2 sm:p-2.5 border-2 sm:border-3 border-[#FF8400] shadow-xs shrink-0 space-y-1.5">
        
        {/* Language Mode Toggle & Item Counter */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-amber-50 p-1 rounded-xl border border-[#FF8400]/40">
            <button
              onClick={() => setLanguage('filipino')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer touch-manipulation ${
                language === 'filipino'
                  ? 'bg-[#FF8400] text-white shadow-xs'
                  : 'text-[#4B2C20] hover:bg-white/80'
              }`}
            >
              <span>🇵🇭</span>
              <span>Filipino (Marungko)</span>
            </button>

            <button
              onClick={() => setLanguage('english')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer touch-manipulation ${
                language === 'english'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'text-[#4B2C20] hover:bg-white/80'
              }`}
            >
              <span>🇬🇧</span>
              <span>English Reading</span>
              <span className="bg-amber-400 text-[#4B2C20] text-[8px] font-black px-1 rounded-full uppercase">
                Bago
              </span>
            </button>
          </div>

          <div className="text-[10px] sm:text-xs font-black text-[#8B4513] bg-amber-50 px-2.5 py-0.5 rounded-full border border-[#FF8400]/40 shrink-0 ml-auto">
            {currentIndex + 1} / {filteredItems.length}
          </div>
        </div>

        {/* Row 1: Groups (for Filipino) OR Units (for English) */}
        {language === 'filipino' ? (
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            {MARUNGKO_GROUPS.map((group) => {
              const isSelected = selectedGroup === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => {
                    setSelectedGroup(group.id);
                    setCurrentIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-xl border text-xs font-black whitespace-nowrap transition-all cursor-pointer touch-manipulation shrink-0 ${
                    isSelected
                      ? 'bg-[#FF8400] border-[#FF8400] text-white shadow-xs scale-102'
                      : 'bg-[#FFFBEB] border-[#FF8400]/30 text-[#4B2C20] hover:bg-[#FFD93D]/30'
                  }`}
                >
                  <span>Pangkat {group.id} ({group.letters.join(' ')})</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            {ENGLISH_READING_UNITS.map((unit) => {
              const isSelected = selectedEnglishUnit === unit.id;
              return (
                <button
                  key={unit.id}
                  onClick={() => {
                    setSelectedEnglishUnit(unit.id);
                    setCurrentIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-xl border text-xs font-black whitespace-nowrap transition-all cursor-pointer touch-manipulation flex items-center gap-1 shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs scale-102'
                      : 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100'
                  }`}
                  title={unit.description}
                >
                  <span>{unit.icon}</span>
                  <span>{unit.title}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Row 2: Categories Row */}
        {language === 'filipino' ? (
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {(['all', 'two_letters', 'three_letters', 'four_letters', 'sentence'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentIndex(0);
                }}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase transition-all whitespace-nowrap cursor-pointer touch-manipulation ${
                  selectedCategory === cat
                    ? 'bg-[#FF8400] text-white shadow-xs'
                    : 'text-[#4B2C20] bg-amber-100/50 hover:bg-amber-100'
                }`}
              >
                {cat === 'all'
                  ? 'Lahat'
                  : cat === 'two_letters'
                  ? '2 Letra'
                  : cat === 'three_letters'
                  ? '3 Letra'
                  : cat === 'four_letters'
                  ? '4 Letra'
                  : 'Pangungusap'}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: 'All Words' },
              { id: 'cvc_words', label: 'CVC (3-Letter)' },
              { id: 'sight_words', label: 'Sight Words' },
              { id: 'blends_digraphs', label: 'Blends & Digraphs' },
              { id: 'sentence', label: 'Sentences' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedEnglishCategory(cat.id);
                  setCurrentIndex(0);
                }}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase transition-all whitespace-nowrap cursor-pointer touch-manipulation ${
                  selectedEnglishCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-900 bg-blue-100/60 hover:bg-blue-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Main Reading Card */}
      {activeItem ? (
        <div className="flex-1 min-h-0 bg-white rounded-3xl shadow-md border-4 border-[#FF8400] p-3 sm:p-4 my-1.5 flex flex-col justify-between overflow-hidden relative">
          
          {/* Card Category Badge & Audio Button */}
          <div className="flex items-center justify-between shrink-0">
            <span
              className={`text-white text-[10px] sm:text-xs font-black uppercase px-3 py-1 rounded-full shadow-xs tracking-wider ${
                language === 'english' ? 'bg-blue-600' : 'bg-[#FF8400]'
              }`}
            >
              {language === 'english'
                ? activeItem.unitTitle || 'English Reading'
                : activeItem.category === 'two_letters'
                ? '2 Letra (Pantig)'
                : activeItem.category === 'three_letters'
                ? '3 Letra'
                : activeItem.category === 'four_letters'
                ? '4 Letra'
                : 'Pangungusap'}
            </span>

            <button
              onClick={handleListenTarget}
              className="flex items-center gap-1.5 bg-[#FFD93D] hover:bg-[#FFC800] active:scale-95 text-[#4B2C20] border-2 border-[#FF8400] px-3.5 py-1 rounded-full font-black text-xs shadow-xs transition-all cursor-pointer touch-manipulation"
            >
              <Volume2 className="w-4 h-4 text-[#FF8400]" />
              <span>
                {language === 'english' ? 'Listen to English Voice' : 'Pakinggan ang Boses'}
              </span>
            </button>
          </div>

          {/* Big Reading Display Text Box */}
          <div className="my-auto text-center bg-[#FFFBEB] py-3 sm:py-5 px-3 rounded-2xl border-2 sm:border-3 border-[#FFD93D] shadow-inner flex flex-col items-center justify-center">
            
            {activeItem.emoji && (
              <span className="text-3xl sm:text-4xl mb-1 animate-bounce">
                {activeItem.emoji}
              </span>
            )}

            <div className="text-3xl sm:text-5xl md:text-6xl font-black text-[#4B2C20] tracking-wider font-mono select-none px-2 text-center">
              {activeItem.text}
            </div>
            
            <div className="mt-1 text-sm sm:text-base font-black text-[#FF8400]">
              {activeItem.phoneticGuide}
            </div>

            <p className="mt-1 text-[11px] sm:text-xs text-[#8B4513] bg-white/90 px-3 py-0.5 rounded-full border border-[#FF8400]/30 font-bold max-w-lg truncate">
              💡 {activeItem.tagalogGuide}
            </p>
          </div>

          {/* Action & Feedback Center */}
          <div className="flex flex-col items-center justify-center shrink-0 space-y-1.5 my-1">
            {!isListening ? (
              <button
                onClick={handleStartMic}
                disabled={isEvaluating}
                className="flex items-center gap-2 bg-gradient-to-r from-[#F87171] to-[#EF4444] hover:scale-105 active:scale-95 text-white px-6 py-2.5 rounded-full font-black text-sm sm:text-base shadow-md border-2 border-white transition-all disabled:opacity-50 cursor-pointer touch-manipulation"
              >
                <Mic className="w-5 h-5" />
                <span>
                  {language === 'english'
                    ? 'Press to Read Aloud (Speak English)'
                    : 'Pindutin para Magsalita (Record)'}
                </span>
              </button>
            ) : (
              <button
                onClick={handleStopMic}
                className="flex items-center gap-2 bg-[#4B2C20] text-white px-6 py-2.5 rounded-full font-black text-sm sm:text-base shadow-md border-2 border-[#F87171] animate-pulse transition-all cursor-pointer touch-manipulation"
              >
                <MicOff className="w-5 h-5 text-[#F87171]" />
                <span>
                  {language === 'english'
                    ? 'Listening... (Press to Stop)'
                    : 'Nakikinig... (Pindutin para Huminto)'}
                </span>
              </button>
            )}

            {sttError && (
              <p className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-300 px-3 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {sttError}
              </p>
            )}

            {/* Live Transcript Display */}
            {transcript && (
              <div className="bg-[#FFFBEB] px-3 py-1 rounded-xl border border-[#FF8400] shadow-xs text-center flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#8B4513]">
                  {language === 'english' ? 'Heard:' : 'Sinabi:'}
                </span>
                <span className="text-xs font-black text-[#4B2C20]">"{transcript}"</span>
                {activeItem &&
                  (language === 'english'
                    ? transcript.trim().toLowerCase() === activeItem.text.trim().toLowerCase()
                    : areFilipinoPhoneticallyEquivalent(activeItem.text, transcript)) && (
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded-full">
                      {language === 'english' ? 'Match ✓' : 'Tugma ✓'}
                    </span>
                  )}
              </div>
            )}

            {/* AI Evaluation Loading */}
            {isEvaluating && (
              <div className="bg-[#FFFBEB] rounded-xl px-3 py-1 text-center border border-[#FF8400] shadow-xs animate-pulse flex items-center justify-center gap-1.5 text-xs text-[#4B2C20] font-black">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF8400]" />
                <span>
                  {language === 'english'
                    ? 'AI Tutor is analyzing your pronunciation...'
                    : 'Sinusuri ng AI Tutor ang iyong pagbasa...'}
                </span>
              </div>
            )}

            {/* Evaluation Results Card */}
            {evaluation && !isEvaluating && (
              <div
                className={`rounded-2xl p-2 sm:p-2.5 border-2 shadow-xs transition-all w-full max-w-lg ${
                  evaluation.isCorrect
                    ? 'bg-[#F0FDF4] border-[#4ADE80] text-[#166534]'
                    : 'bg-[#FEF2F2] border-[#F87171] text-[#991B1B]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {evaluation.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0" />
                    )}
                    <h4 className="font-black text-xs sm:text-sm truncate">
                      {evaluation.isCorrect
                        ? language === 'english'
                          ? 'Excellent Reading! ⭐ +10 Stars'
                          : 'Napakagaling! ⭐ +10 Bituin'
                        : language === 'english'
                        ? 'Practice Needed'
                        : 'Kailangan ng Pagsasanay'}
                    </h4>
                  </div>
                  <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded-full border border-current">
                    {language === 'english' ? 'Score' : 'Marka'}: {evaluation.score} / 5
                  </span>
                </div>
                <p className="text-xs font-bold mt-0.5">{evaluation.feedbackTagalog}</p>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-1.5 border-t border-[#FF8400]/20 shrink-0">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1 bg-[#FFD93D] hover:bg-[#FFC800] text-[#4B2C20] border-2 border-[#FF8400] px-4 py-1.5 rounded-full text-xs font-black transition-all hover:scale-105 active:scale-95 cursor-pointer touch-manipulation"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'english' ? 'Previous' : 'Nakataraan'}</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 bg-[#FF8400] hover:bg-orange-600 text-white px-5 py-1.5 rounded-full text-xs font-black shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer touch-manipulation"
            >
              <span>{language === 'english' ? 'Next' : 'Susunod'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      ) : (
        <div className="bg-white p-6 rounded-3xl border-4 border-[#FF8400] text-center text-[#8B4513] font-black">
          Walang nahanap na gawain para sa kategoryang ito.
        </div>
      )}

    </div>
  );
};
