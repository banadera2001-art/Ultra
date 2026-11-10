import React, { useRef, useState, useEffect, useMemo } from 'react';
import { MATH_CURRICULUM_ITEMS, generateMathProblem, getDistractorChoices, getMathQuestionSpeech } from '../data/mathData';
import { MathItem, MathOperation, AIEvaluationResponse } from '../types';
import { speakTagalog } from '../services/speechService';
import { evaluateMathWithAI } from '../services/aiService';
import { playStarSound, playSuccessFanfare, playTryAgainSound } from '../services/soundEffects';
import confetti from 'canvas-confetti';
import {
  Calculator,
  RotateCcw,
  Trash2,
  Volume2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Dices,
  Hash,
  Layers,
  GraduationCap
} from 'lucide-react';

interface MathSlideProps {
  voiceEnabled: boolean;
  onAwardStars: (count: number) => void;
  onLogHistory: (type: 'reading' | 'writing' | 'math', target: string, score: number, feedback: string) => void;
}

const GRADE_LEVELS = [
  { level: 1, label: 'Baitang 1', icon: '🏫', desc: 'Dagdagan at Bawasan hanggang 20' },
  { level: 2, label: 'Baitang 2', icon: '🎒', desc: 'Dagdagan/Bawasan hanggang 100, Pagpaparami' },
  { level: 3, label: 'Baitang 3', icon: '📘', desc: 'Hanggang 1,000, Multiplication & Division' },
  { level: 4, label: 'Baitang 4', icon: '📐', desc: 'Multi-digit Operations & Problem Solving' },
  { level: 5, label: 'Baitang 5', icon: '🔬', desc: 'Libo-libong Bilang, 2-digit Multi & Div' },
  { level: 6, label: 'Baitang 6', icon: '🏆', desc: 'Advance Math Mastery & Decimals/Fractions' },
];

const OPERATION_FILTERS: { id: 'all' | MathOperation; label: string; symbol: string }[] = [
  { id: 'all', label: 'Lahat', symbol: '⭐' },
  { id: '+', label: 'Dagdag', symbol: '+' },
  { id: '-', label: 'Bawas', symbol: '-' },
  { id: '×', label: 'Dami', symbol: '×' },
  { id: '÷', label: 'Hati', symbol: '÷' },
];

export const MathSlide: React.FC<MathSlideProps> = ({
  voiceEnabled,
  onAwardStars,
  onLogHistory,
}) => {
  // Grade and Operation filters
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedOperation, setSelectedOperation] = useState<'all' | MathOperation>('all');

  // Custom generated or extra items
  const [customItems, setCustomItems] = useState<MathItem[]>([]);

  // Filtered math items based on Grade and Operation
  const activeItems = useMemo(() => {
    const curriculum = MATH_CURRICULUM_ITEMS.filter((item) => {
      const matchGrade = (item.gradeLevel || 1) === selectedGrade;
      const matchOp = selectedOperation === 'all' || item.operation === selectedOperation;
      return matchGrade && matchOp;
    });

    const matchingCustom = customItems.filter((item) => {
      const matchGrade = (item.gradeLevel || 1) === selectedGrade;
      const matchOp = selectedOperation === 'all' || item.operation === selectedOperation;
      return matchGrade && matchOp;
    });

    const combined = [...curriculum, ...matchingCustom];
    if (combined.length === 0) {
      // If no pre-set items for this combination, generate one automatically
      return [generateMathProblem(selectedGrade, selectedOperation === 'all' ? undefined : selectedOperation)];
    }
    return combined;
  }, [selectedGrade, selectedOperation, customItems]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const activeMathItem: MathItem = activeItems[currentIndex] || activeItems[0];

  // Keypad / direct typed number state
  const [typedInput, setTypedInput] = useState<string>('');

  // Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penColor] = useState('#0f766e'); // Emerald
  const [isEraser, setIsEraser] = useState(false);

  // AI Evaluation State
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<AIEvaluationResponse | null>(null);

  // Dynamic multiple choice choices for the current question
  const currentChoices = useMemo(() => {
    return getDistractorChoices(activeMathItem.expectedAnswer);
  }, [activeMathItem.id, activeMathItem.expectedAnswer]);

  // Draw Guidelines on Canvas
  const drawMathCanvasBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const topY = height * 0.25;
    const midY = height * 0.50;
    const botY = height * 0.75;

    // Top Blue Line
    ctx.beginPath();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.moveTo(15, topY);
    ctx.lineTo(width - 15, topY);
    ctx.stroke();

    // Middle Red Dashed Line
    ctx.beginPath();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.moveTo(15, midY);
    ctx.lineTo(width - 15, midY);
    ctx.stroke();

    // Bottom Blue Line
    ctx.beginPath();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    ctx.moveTo(15, botY);
    ctx.lineTo(width - 15, botY);
    ctx.stroke();
  };

  // Initialize Canvas on item change or index change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.parentElement?.clientWidth || 450;
    const height = canvas.parentElement?.clientHeight || 200;

    canvas.width = width;
    canvas.height = height;

    drawMathCanvasBackground(ctx, width, height);
    setHasDrawn(false);
    setEvaluation(null);
    setTypedInput('');
  }, [currentIndex, activeMathItem.id]);

  // Handle Canvas Drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    if (!isEraser) setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#ffffff' : penColor;
    ctx.lineWidth = isEraser ? 24 : 10;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!isEraser) setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawMathCanvasBackground(ctx, canvas.width, canvas.height);
    setHasDrawn(false);
    setEvaluation(null);
  };

  // Direct Number Evaluation (Deterministic & Instant)
  const handleVerifyNumber = (userAnswer: number) => {
    const isCorrect = userAnswer === activeMathItem.expectedAnswer;
    const opLabel =
      activeMathItem.operation === '+'
        ? 'dagdagan ng'
        : activeMathItem.operation === '-'
        ? 'bawasan ng'
        : activeMathItem.operation === '×'
        ? 'i-multiply sa'
        : 'hatiin sa';

    const result: AIEvaluationResponse = {
      isCorrect,
      score: isCorrect ? 5 : 2,
      recognizedText: String(userAnswer),
      feedbackTagalog: isCorrect
        ? `Tumpak at napakagaling! Ang sagot sa ${activeMathItem.num1} ${activeMathItem.operation} ${activeMathItem.num2} ay ${activeMathItem.expectedAnswer}!`
        : `Mali ang sagot. Ang iyong sagot ay ${userAnswer}, ngunit ang tamang sagot sa ${activeMathItem.num1} ${activeMathItem.operation} ${activeMathItem.num2} ay ${activeMathItem.expectedAnswer}. Subukan muli!`,
      correctionTips: isCorrect
        ? ['Magaling! Ipagpatuloy ang ganyang galing sa matematika!']
        : [`Suriin muli ang ${activeMathItem.num1} ${opLabel} ${activeMathItem.num2} upang makuha ang ${activeMathItem.expectedAnswer}.`],
    };

    setEvaluation(result);

    if (isCorrect) {
      playStarSound();
      playSuccessFanfare();
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.6 },
      });
      onAwardStars(15);
      onLogHistory(
        'math',
        `${activeMathItem.num1} ${activeMathItem.operation} ${activeMathItem.num2} = ${activeMathItem.expectedAnswer}`,
        100,
        result.feedbackTagalog
      );

      if (voiceEnabled) {
        speakTagalog(result.feedbackTagalog);
      }
    } else {
      playTryAgainSound();
      onLogHistory(
        'math',
        `${activeMathItem.num1} ${activeMathItem.operation} ${activeMathItem.num2}`,
        40,
        result.feedbackTagalog
      );

      if (voiceEnabled) {
        speakTagalog(result.feedbackTagalog);
      }
    }
  };

  // Submit Canvas Handwriting to AI
  const handleEvaluateMathCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!hasDrawn) {
      const emptyEvaluation: AIEvaluationResponse = {
        isCorrect: false,
        score: 1,
        recognizedText: 'Walang sulat',
        feedbackTagalog: 'Wala ka pang naisusulat na numero sa canvas. Gamitin ang mouse upang isulat ang iyong sagot bago pindutin ang Isubmit.',
        correctionTips: [
          'Gamitin ang mouse o daliri upang iguhit ang iyong sagot sa loob ng kahon.',
          'Maaari ka ring pumili sa mga opsyon sa ibaba kung nais mo.',
        ],
      };
      setEvaluation(emptyEvaluation);
      playTryAgainSound();
      if (voiceEnabled) {
        speakTagalog('Wala ka pang naisusulat na numero sa canvas. Gamitin ang mouse upang isulat ang iyong sagot.');
      }
      return;
    }

    const imageBase64 = canvas.toDataURL('image/png');
    setIsEvaluating(true);

    let drawnPixels = 0;
    try {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 16) {
          if (data[i] < 235 || data[i + 1] < 235 || data[i + 2] < 235) {
            drawnPixels++;
          }
        }
      }
    } catch {
      drawnPixels = 200;
    }

    try {
      const result = await evaluateMathWithAI(
        imageBase64,
        activeMathItem.num1,
        activeMathItem.num2,
        activeMathItem.operation,
        activeMathItem.expectedAnswer,
        {
          strokeCount: hasDrawn ? 1 : 0,
          pixelCount: drawnPixels,
        }
      );

      setEvaluation(result);

      if (result.isCorrect) {
        playStarSound();
        playSuccessFanfare();
        confetti({
          particleCount: 85,
          spread: 70,
          origin: { y: 0.6 },
        });
        onAwardStars(15);
        onLogHistory(
          'math',
          `${activeMathItem.num1} ${activeMathItem.operation} ${activeMathItem.num2} = ${activeMathItem.expectedAnswer}`,
          100,
          result.feedbackTagalog
        );

        if (voiceEnabled) {
          speakTagalog(result.feedbackTagalog);
        }
      } else {
        playTryAgainSound();
        onLogHistory(
          'math',
          `${activeMathItem.num1} ${activeMathItem.operation} ${activeMathItem.num2}`,
          40,
          result.feedbackTagalog
        );

        if (voiceEnabled) {
          speakTagalog(result.feedbackTagalog);
        }
      }
    } catch (err) {
      console.error('Math evaluation failed:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Generate New Random Problem for the Current Grade & Operation
  const handleGenerateRandomProblem = () => {
    const newProblem = generateMathProblem(
      selectedGrade,
      selectedOperation === 'all' ? undefined : selectedOperation
    );
    setCustomItems((prev) => [newProblem, ...prev]);
    setCurrentIndex(0);
  };

  const handleNext = () => {
    if (currentIndex < activeItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(activeItems.length - 1);
    }
  };

  // Helper for on-screen number pad
  const handleKeypadPress = (val: string) => {
    if (val === 'DEL') {
      setTypedInput((prev) => prev.slice(0, -1));
    } else if (val === 'ENTER') {
      if (typedInput.trim()) {
        handleVerifyNumber(Number(typedInput.trim()));
      }
    } else {
      if (typedInput.length < 6) {
        setTypedInput((prev) => prev + val);
      }
    }
  };

  return (
    <div id="math-slide-container" className="h-full flex flex-col justify-between overflow-hidden p-2 sm:p-3 max-w-6xl mx-auto w-full">

      {/* Top Banner: Grade Level Selector & Operation Filters */}
      <div className="bg-white rounded-2xl p-2 sm:p-2.5 border-2 border-[#4ADE80] shadow-xs shrink-0 flex flex-col gap-2">
        
        {/* Grade Level Buttons */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[10px] sm:text-xs font-black text-emerald-900 uppercase tracking-wider">
              Baitang:
            </span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5">
            {GRADE_LEVELS.map((g) => {
              const isSelected = selectedGrade === g.level;
              return (
                <button
                  key={g.level}
                  onClick={() => {
                    setSelectedGrade(g.level);
                    setCurrentIndex(0);
                  }}
                  className={`px-2 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center gap-1 shrink-0 cursor-pointer touch-manipulation ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-xs scale-102'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                  title={g.desc}
                >
                  <span>{g.icon}</span>
                  <span>{g.label}</span>
                </button>
              );
            })}
          </div>

          {/* Random Problem Generator Button */}
          <button
            onClick={handleGenerateRandomProblem}
            className="flex items-center gap-1 bg-[#FFD93D] hover:bg-[#FFC800] text-[#4B2C20] border border-[#FF8400] px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-black transition-all shadow-xs active:scale-95 cursor-pointer touch-manipulation ml-auto shrink-0"
            title="Bumuo ng Bagong Random na Tanong para sa Baitang na ito"
          >
            <Dices className="w-3.5 h-3.5 text-[#FF8400]" />
            <span>Bagong Tanong</span>
          </button>
        </div>

        {/* Operation Filter Buttons & Question Counter */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-emerald-100 flex-wrap">
          <div className="flex items-center gap-1 overflow-x-auto">
            <span className="text-[10px] font-black text-emerald-800 uppercase mr-1">
              Operasyon:
            </span>
            {OPERATION_FILTERS.map((op) => {
              const isSelected = selectedOperation === op.id;
              return (
                <button
                  key={op.id}
                  onClick={() => {
                    setSelectedOperation(op.id);
                    setCurrentIndex(0);
                  }}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black transition-all cursor-pointer touch-manipulation shrink-0 ${
                    isSelected
                      ? 'bg-[#166534] text-white shadow-xs'
                      : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-300'
                  }`}
                >
                  <span className="mr-0.5">{op.symbol}</span>
                  <span>{op.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[10px] sm:text-[11px] font-black text-[#166534] bg-[#F0FDF4] px-2.5 py-0.5 rounded-full border border-[#4ADE80] shadow-xs shrink-0 ml-auto">
            Tanong {currentIndex + 1} / {activeItems.length}
          </div>
        </div>

      </div>

      {/* Main 2-Column Responsive Workbench */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 my-1.5 overflow-hidden">

        {/* Left Column: Equation, Visual Counters/Place Values, Audio, and Feedback */}
        <div className="bg-[#F0FDF4] rounded-2xl p-2.5 sm:p-3 border-2 border-[#4ADE80] shadow-inner flex flex-col justify-between overflow-y-auto">
          
          {/* Text Equation Display */}
          <div className="text-center py-1">
            <div className="inline-flex items-center justify-center gap-2 sm:gap-3 text-3xl sm:text-5xl font-black text-[#166534] font-mono tracking-wider bg-white/80 px-4 py-2 rounded-2xl border-2 border-emerald-300 shadow-xs">
              <span>{activeMathItem.num1}</span>
              <span className="text-[#22C55E] px-1">{activeMathItem.operation}</span>
              <span>{activeMathItem.num2}</span>
              <span>=</span>
              <span className="text-[#FF8400] bg-white px-3 py-0.5 rounded-xl border-2 border-dashed border-[#FF8400]">
                ?
              </span>
            </div>
          </div>

          {/* Visual Representation Area */}
          <div className="bg-white p-2.5 rounded-xl border border-[#4ADE80] my-auto flex flex-col items-center justify-center">
            
            {/* If small numbers (e.g. <= 15), show tactile emoji counters */}
            {activeMathItem.num1 <= 15 && activeMathItem.num2 <= 15 ? (
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                {/* Group 1 Visual Items */}
                <div className="flex flex-wrap items-center justify-center gap-1 bg-[#FFFBEB] px-2.5 py-1 rounded-xl border border-[#4ADE80]/60 max-w-[200px]">
                  {Array.from({ length: activeMathItem.num1 }).map((_, i) => (
                    <span key={i} className="text-xl sm:text-2xl hover:scale-110 transition-transform">
                      {activeMathItem.itemEmoji}
                    </span>
                  ))}
                  <span className="text-[11px] font-black text-[#166534] ml-1">
                    ({activeMathItem.num1})
                  </span>
                </div>

                {/* Operator Symbol */}
                <span className="text-2xl font-black text-[#166534] bg-emerald-100 w-8 h-8 rounded-full flex items-center justify-center">
                  {activeMathItem.operation}
                </span>

                {/* Group 2 Visual Items */}
                <div className="flex flex-wrap items-center justify-center gap-1 bg-[#FFFBEB] px-2.5 py-1 rounded-xl border border-[#4ADE80]/60 max-w-[200px]">
                  {Array.from({ length: activeMathItem.num2 }).map((_, i) => (
                    <span key={i} className="text-xl sm:text-2xl hover:scale-110 transition-transform">
                      {activeMathItem.itemEmoji}
                    </span>
                  ))}
                  <span className="text-[11px] font-black text-[#166534] ml-1">
                    ({activeMathItem.num2})
                  </span>
                </div>
              </div>
            ) : (
              /* For Larger Numbers (> 15 in Grades 2 to 6): Show structured calculation helper */
              <div className="w-full flex flex-col items-center justify-center gap-1.5 py-1 text-center">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-900 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>
                    Baitang {activeMathItem.gradeLevel || selectedGrade} • Gabay sa Pagkalkula
                  </span>
                </div>

                {/* Place value breakdown cards */}
                <div className="grid grid-cols-2 gap-2 w-full max-w-sm pt-1">
                  <div className="bg-amber-50 p-2 rounded-xl border border-amber-200 text-center">
                    <span className="text-[10px] font-extrabold text-amber-800 uppercase block">Unang Bilang</span>
                    <span className="text-lg font-black text-amber-950 font-mono">{activeMathItem.num1}</span>
                  </div>
                  <div className="bg-sky-50 p-2 rounded-xl border border-sky-200 text-center">
                    <span className="text-[10px] font-extrabold text-sky-800 uppercase block">Pangalawang Bilang</span>
                    <span className="text-lg font-black text-sky-950 font-mono">{activeMathItem.num2}</span>
                  </div>
                </div>

                {activeMathItem.explanationTagalog && (
                  <p className="text-[11px] font-bold text-emerald-800 mt-1 italic">
                    💡 "{activeMathItem.explanationTagalog}"
                  </p>
                )}
              </div>
            )}

          </div>

          {/* Audio Question Button */}
          <div className="text-center shrink-0 my-1">
            <button
              onClick={() => speakTagalog(getMathQuestionSpeech(activeMathItem))}
              className="inline-flex items-center gap-1.5 bg-[#FFD93D] hover:bg-[#FFC800] text-[#4B2C20] border-2 border-[#FF8400] px-3.5 py-1 rounded-full text-xs font-black shadow-xs transition-all active:scale-95 cursor-pointer touch-manipulation"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#FF8400]" />
              <span>Pakinggan ang Tanong sa Tagalog</span>
            </button>
          </div>

          {/* AI Evaluation Loading & Feedback in Left Column */}
          {isEvaluating && (
            <div className="bg-white rounded-xl p-2 text-center border border-[#4ADE80] shadow-xs animate-pulse flex items-center justify-center gap-1.5 text-xs text-[#166534] font-black shrink-0">
              <RefreshCw className="w-4 h-4 animate-spin text-[#4ADE80]" />
              <span>Binabasa ng AI ang iyong isinulat na sagot...</span>
            </div>
          )}

          {evaluation && !isEvaluating && (
            <div
              className={`rounded-xl p-2.5 border-2 shadow-xs transition-all text-xs shrink-0 ${
                evaluation.isCorrect
                  ? 'bg-emerald-50 border-[#4ADE80] text-[#166534]'
                  : 'bg-red-50 border-[#F87171] text-[#991B1B]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {evaluation.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
                  )}
                  <span className="font-black">
                    {evaluation.isCorrect ? 'Tumpak! ⭐ +15 Bituin' : 'Maling Sagot'}
                  </span>
                </div>
                {evaluation.recognizedText && (
                  <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded-full border border-current">
                    Sagot: {evaluation.recognizedText}
                  </span>
                )}
              </div>
              <p className="font-bold mt-1 text-[11px]">{evaluation.feedbackTagalog}</p>
            </div>
          )}

        </div>

        {/* Right Column: Handwriting Canvas + Multiple Choice + On-Screen Keypad */}
        <div className="bg-[#FFFBEB] rounded-2xl p-2.5 sm:p-3 border-2 border-[#4ADE80] shadow-xs flex flex-col justify-between overflow-hidden">
          
          {/* Canvas Controls Header */}
          <div className="flex items-center justify-between shrink-0 mb-1">
            <h4 className="text-xs font-black text-[#166534] uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-[#4ADE80]" />
              <span>Isulat ang Sagot sa Notebook:</span>
            </h4>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsEraser(!isEraser)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-black border transition-all cursor-pointer touch-manipulation ${
                  isEraser ? 'bg-rose-500 text-white border-rose-600' : 'bg-white text-[#166534] border-[#4ADE80]'
                }`}
              >
                Pambura
              </button>
              <button
                onClick={handleClear}
                className="px-2.5 py-0.5 rounded-full bg-white text-[#166534] border border-[#4ADE80] text-xs font-black hover:bg-emerald-50 transition-all flex items-center gap-1 cursor-pointer touch-manipulation"
                title="Linisin Canvas"
              >
                <Trash2 className="w-3 h-3" />
                <span>Linisin</span>
              </button>
            </div>
          </div>

          {/* Answer Canvas Container */}
          <div className="flex-1 min-h-[130px] sm:min-h-[160px] bg-white rounded-xl border-3 border-[#4ADE80] shadow-inner relative overflow-hidden cursor-crosshair">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full touch-none block"
            />
            <div className="absolute bottom-1 right-2 pointer-events-none text-[10px] font-bold text-[#166534] bg-white/90 px-2 py-0.5 rounded-full border border-[#4ADE80]/40">
              Isulat ang numero
            </div>
          </div>

          {/* Submit Canvas Answer Button */}
          <div className="pt-1.5 shrink-0">
            <button
              onClick={handleEvaluateMathCanvas}
              disabled={isEvaluating}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#4ADE80] to-[#22C55E] hover:scale-101 active:scale-99 text-white py-2 rounded-xl font-black text-xs sm:text-sm shadow-sm border border-white transition-all disabled:opacity-50 cursor-pointer touch-manipulation"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Ipasa at Suriin gamit ang AI Tutor</span>
            </button>
          </div>

          {/* Bottom Dual Input Options: Multiple Choice Chips OR On-Screen Keypad */}
          <div className="pt-2 shrink-0 border-t border-[#4ADE80]/30 space-y-2">
            
            {/* Multiple Choice Chips */}
            <div>
              <div className="text-[10px] font-black text-[#166534] mb-1 flex items-center justify-between">
                <span>Pumili sa mga Opsyon:</span>
                <span className="text-[9px] text-[#166534]/70">(Pindutin ang tamang sagot)</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {currentChoices.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => handleVerifyNumber(choice)}
                    disabled={isEvaluating}
                    className={`py-1.5 rounded-xl font-black text-xs sm:text-sm border-2 transition-all active:scale-95 cursor-pointer touch-manipulation flex items-center justify-center font-mono ${
                      evaluation && evaluation.recognizedText === String(choice)
                        ? evaluation.isCorrect
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                          : 'bg-rose-500 text-white border-rose-600 shadow-xs'
                        : 'bg-white hover:bg-[#F0FDF4] text-[#166534] border-[#4ADE80] shadow-xs'
                    }`}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Number Keypad / Drawer for multi-digit typing */}
            <div className="bg-white/80 p-1.5 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-1.5">
                <div className="flex-1 bg-white border-2 border-emerald-300 rounded-lg px-2 py-1 flex items-center justify-between">
                  <span className="text-[10px] font-black text-emerald-800">I-type:</span>
                  <span className="font-mono font-black text-sm sm:text-base text-emerald-950">
                    {typedInput || <span className="text-slate-300">___</span>}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handleKeypadPress(String(digit))}
                      className="w-5 h-6 sm:w-6 sm:h-7 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded text-xs font-black text-emerald-900 cursor-pointer active:scale-95"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('DEL')}
                    className="px-1.5 h-6 sm:h-7 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded text-[10px] font-black text-rose-700 cursor-pointer active:scale-95"
                    title="Burahin ang huling digit"
                  >
                    ⌫
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('ENTER')}
                    disabled={!typedInput.trim() || isEvaluating}
                    className="px-2 h-6 sm:h-7 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded text-[10px] font-black cursor-pointer active:scale-95"
                  >
                    Isumite
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-1 border-t border-[#4ADE80]/30 shrink-0">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1 bg-[#FFD93D] hover:bg-[#FFC800] text-[#4B2C20] border border-[#FF8400] px-4 py-1.5 rounded-full text-xs font-black transition-all hover:scale-105 active:scale-95 cursor-pointer touch-manipulation"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Nakataraan</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-1 bg-[#4ADE80] hover:bg-emerald-600 text-white px-5 py-1.5 rounded-full text-xs font-black shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer touch-manipulation"
        >
          <span>Susunod</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
