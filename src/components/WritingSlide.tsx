import React, { useRef, useState, useEffect } from 'react';
import { WRITING_ITEMS } from '../data/marungkoData';
import { WritingItem, AIEvaluationResponse } from '../types';
import { speakTagalog } from '../services/speechService';
import { evaluateWritingWithAI } from '../services/aiService';
import { playStarSound, playSuccessFanfare, playTryAgainSound } from '../services/soundEffects';
import confetti from 'canvas-confetti';
import { PenTool, RotateCcw, Trash2, Eye, EyeOff, Volume2, CheckCircle2, AlertCircle, RefreshCw, Sparkles, HelpCircle } from 'lucide-react';

interface WritingSlideProps {
  voiceEnabled: boolean;
  onAwardStars: (count: number) => void;
  onLogHistory: (type: 'reading' | 'writing' | 'math', target: string, score: number, feedback: string) => void;
}

export const WritingSlide: React.FC<WritingSlideProps> = ({
  voiceEnabled,
  onAwardStars,
  onLogHistory,
}) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const activeItem: WritingItem = WRITING_ITEMS[selectedItemIndex] || WRITING_ITEMS[0];

  // Canvas Drawing State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const guideCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#1e3a8a'); // Dark Blue
  const [lineWidth, setLineWidth] = useState(8);
  const [isEraser, setIsEraser] = useState(false);
  const [showGhostGuide, setShowGhostGuide] = useState(true);

  // Stroke history for Undo functionality
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);

  // AI Evaluation State
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<AIEvaluationResponse | null>(null);

  // Redraw Blue-Red-Blue guidelines and optional visual ghost template
  const drawGuideCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number, withGhost: boolean) => {
    // Clear canvas background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Calculate Y positions for Blue - Red - Blue guidelines
    const topBlueY = height * 0.25;
    const midRedY = height * 0.50;
    const botBlueY = height * 0.75;

    // Draw Top Solid Blue Line
    ctx.beginPath();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.moveTo(30, topBlueY);
    ctx.lineTo(width - 30, topBlueY);
    ctx.stroke();

    // Draw Middle Dashed Red Line
    ctx.beginPath();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.moveTo(30, midRedY);
    ctx.lineTo(width - 30, midRedY);
    ctx.stroke();

    // Draw Bottom Solid Blue Line
    ctx.beginPath();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.moveTo(30, botBlueY);
    ctx.lineTo(width - 30, botBlueY);
    ctx.stroke();

    // Draw Ghost Template if enabled (strictly for visual student guidance, omitted during AI evaluation)
    if (withGhost && activeItem) {
      ctx.save();
      const textLen = activeItem.targetText.length;
      const fontSize = textLen <= 2
        ? height * 0.42
        : textLen <= 3
        ? height * 0.38
        : height * 0.32;
      ctx.font = `900 ${fontSize}px monospace`;
      ctx.fillStyle = 'rgba(203, 213, 225, 0.45)'; // Semi-transparent gray
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(activeItem.targetText, width / 2, botBlueY);
      ctx.restore();
    }
  };

  // Helper to accurately map screen/touch coordinates to canvas coordinate space
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const scaleX = rect.width ? canvas.width / rect.width : 1;
    const scaleY = rect.height ? canvas.height / rect.height : 1;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Initialize Canvas
  useEffect(() => {
    const guideCanvas = guideCanvasRef.current;
    const drawCanvas = canvasRef.current;
    if (!guideCanvas || !drawCanvas) return;

    const updateSize = () => {
      const container = drawCanvas.parentElement;
      if (!container) return;
      const width = Math.max(container.clientWidth || 0, 600);
      const height = Math.max(container.clientHeight || 0, 180);

      guideCanvas.width = width;
      guideCanvas.height = height;
      drawCanvas.width = width;
      drawCanvas.height = height;

      const gCtx = guideCanvas.getContext('2d');
      if (gCtx) {
        drawGuideCanvas(gCtx, width, height, showGhostGuide);
      }
    };

    updateSize();

    setStrokeHistory([]);
    setEvaluation(null);
  }, [selectedItemIndex, showGhostGuide]);

  // Handle Mouse/Touch Drawing Start
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    ctx.strokeStyle = isEraser ? 'rgba(0,0,0,1)' : penColor;
    ctx.lineWidth = isEraser ? lineWidth * 3 : lineWidth;
  };

  // Handle Drawing Motion
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Stop Drawing & Save State for Undo
  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setStrokeHistory((prev) => [...prev, currentState]);
  };

  // Undo Last Stroke
  const handleUndo = () => {
    if (strokeHistory.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...strokeHistory];
    newHistory.pop(); // Remove current state
    if (newHistory.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setStrokeHistory([]);
    } else {
      const previousState = newHistory[newHistory.length - 1];
      ctx.putImageData(previousState, 0, 0);
      setStrokeHistory(newHistory);
    }
  };

  // Clear Canvas
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokeHistory([]);
    setEvaluation(null);
  };

  // Submit Canvas for AI Handwriting Vision Evaluation
  const handleEvaluateWriting = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Count ink pixels to verify student actually drew
    let drawnPixels = 0;
    try {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 3; i < data.length; i += 16) {
          if (data[i] > 20) {
            drawnPixels++;
          }
        }
      }
    } catch {
      drawnPixels = 100;
    }

    // Check if canvas is blank or lacks strokes
    if (strokeHistory.length === 0 || drawnPixels < 15) {
      const emptyResult: AIEvaluationResponse = {
        isCorrect: false,
        score: 1,
        feedbackTagalog: `Wala ka pang naisusulat sa canvas. Gamitin ang mouse upang isulat ang "${activeItem.targetText}".`,
        correctionTips: ['Sundan ang gabay na letra sa loob ng mga linya bago pindutin ang Isubmit.'],
        detailedAnalysis: {
          alignmentScore: 1,
          sizingScore: 1,
          legibilityScore: 1,
        },
      };
      setEvaluation(emptyResult);
      playTryAgainSound();
      if (voiceEnabled) {
        const itemType = activeItem.guideType === 'two_letters' || activeItem.targetText.trim().length === 2 ? 'pantig na' : 'salitang';
        speakTagalog(`Wala ka pang naisusulat sa canvas. Gamitin ang mouse upang isulat ang ${itemType} ${activeItem.targetText.toLowerCase()}.`);
      }
      return;
    }

    // Create Composite Image for AI (Clean guidelines + Student's strokes, WITHOUT any ghost template)
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const expCtx = exportCanvas.getContext('2d');
    if (expCtx) {
      drawGuideCanvas(expCtx, exportCanvas.width, exportCanvas.height, false);
      expCtx.drawImage(canvas, 0, 0);
    }
    const imageBase64 = exportCanvas.toDataURL('image/png');
    setIsEvaluating(true);

    try {
      const result = await evaluateWritingWithAI(
        imageBase64,
        activeItem.targetText,
        activeItem.guideType,
        {
          strokeCount: strokeHistory.length,
          pixelCount: drawnPixels,
        }
      );

      setEvaluation(result);

      if (result.isCorrect) {
        playStarSound();
        playSuccessFanfare();
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
        });
        onAwardStars(10);
        onLogHistory('writing', activeItem.targetText, (result.score || 5) * 20, result.feedbackTagalog);

        if (voiceEnabled) {
          speakTagalog(result.feedbackTagalog);
        }
      } else {
        playTryAgainSound();
        onLogHistory('writing', activeItem.targetText, (result.score || 1) * 20, result.feedbackTagalog);

        if (voiceEnabled) {
          speakTagalog(result.feedbackTagalog);
        }
      }
    } catch (err) {
      console.error('Writing evaluation failed:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div id="writing-slide-container" className="h-full flex flex-col justify-between overflow-hidden p-2 sm:p-3 max-w-5xl mx-auto w-full">

      {/* Item Selector & Header Banner */}
      <div className="bg-white rounded-2xl p-2 sm:p-2.5 border-2 border-[#60A5FA] shadow-xs shrink-0 space-y-1.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {WRITING_ITEMS.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setSelectedItemIndex(idx)}
              className={`px-3 py-1 rounded-xl border text-xs font-black whitespace-nowrap transition-all cursor-pointer touch-manipulation ${
                selectedItemIndex === idx
                  ? 'bg-[#60A5FA] border-[#3B82F6] text-white shadow-xs scale-102'
                  : 'bg-[#EFF6FF] border-[#60A5FA]/30 text-[#1E3A8A] hover:bg-[#60A5FA]/20'
              }`}
            >
              Pangkat {item.groupId}: {item.targetText}
            </button>
          ))}
        </div>

        {/* Target Instruction Bar */}
        <div className="flex items-center justify-between gap-2 bg-[#EFF6FF] px-3 py-1 rounded-xl border border-[#60A5FA]/40">
          <div className="flex items-center gap-2 truncate">
            <span className="bg-[#60A5FA] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shrink-0">
              {activeItem.guideType === 'two_letters'
                ? '2 Letra'
                : activeItem.guideType === 'three_letters'
                ? '3 Letra'
                : '4 Letra'}
            </span>
            <span className="text-xs sm:text-sm font-black text-[#1E3A8A] truncate">
              Isulat ang "{activeItem.targetText}"
            </span>
            <span className="text-[11px] text-[#3B82F6] font-semibold hidden md:inline truncate">
              — {activeItem.instruction}
            </span>
          </div>

          <button
            onClick={() => {
              const isPantig = activeItem.guideType === 'two_letters' || activeItem.targetText.trim().length === 2;
              speakTagalog(isPantig ? activeItem.targetText.trim().toLowerCase() : activeItem.targetText);
            }}
            className="flex items-center gap-1 bg-[#FFD93D] hover:bg-[#FFC800] text-[#4B2C20] border border-[#FF8400] px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-xs shrink-0 cursor-pointer touch-manipulation"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#FF8400]" />
            <span>Pakinggan</span>
          </button>
        </div>
      </div>

      {/* Main Writing Workbench */}
      <div className="flex-1 min-h-0 bg-white border-2 sm:border-3 border-[#60A5FA] rounded-2xl p-2 sm:p-2.5 shadow-sm flex flex-col justify-between overflow-hidden my-1.5">

        {/* Compact Toolbar */}
        <div className="bg-[#FFFBEB] p-2 rounded-xl border border-[#60A5FA]/30 shadow-xs flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Pen Color Picker */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black text-[#1E3A8A] uppercase hidden sm:inline">Kulay:</span>
            {[
              { color: '#1e3a8a', label: 'Dark Blue' },
              { color: '#000000', label: 'Black' },
              { color: '#dc2626', label: 'Red' },
              { color: '#16a34a', label: 'Green' },
              { color: '#9333ea', label: 'Purple' },
            ].map((c) => (
              <button
                key={c.color}
                onClick={() => {
                  setPenColor(c.color);
                  setIsEraser(false);
                }}
                style={{ backgroundColor: c.color }}
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-transform cursor-pointer touch-manipulation ${
                  penColor === c.color && !isEraser
                    ? 'border-[#FFD93D] scale-110 shadow-xs ring-2 ring-[#60A5FA]'
                    : 'border-white hover:scale-105'
                }`}
                title={c.label}
              />
            ))}
          </div>

          {/* Line Thickness */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-black text-[#1E3A8A] uppercase hidden sm:inline">Kapal:</span>
            {[
              { size: 5, label: 'Manipis' },
              { size: 9, label: 'Katamtaman' },
              { size: 14, label: 'Makapal' },
            ].map((s) => (
              <button
                key={s.size}
                onClick={() => setLineWidth(s.size)}
                className={`px-2 py-0.5 rounded-full text-[11px] font-black border transition-all cursor-pointer touch-manipulation ${
                  lineWidth === s.size
                    ? 'bg-[#60A5FA] text-white border-[#3B82F6]'
                    : 'bg-white text-[#1E3A8A] border-[#60A5FA]/30 hover:bg-[#EFF6FF]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Canvas Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEraser(!isEraser)}
              className={`px-2.5 py-0.5 rounded-full border text-[11px] font-black transition-all cursor-pointer touch-manipulation ${
                isEraser
                  ? 'bg-red-500 text-white border-red-600 shadow-xs'
                  : 'bg-white text-[#1E3A8A] border-[#60A5FA]/30 hover:bg-[#EFF6FF]'
              }`}
              title="Pambura (Eraser)"
            >
              Pambura
            </button>

            <button
              onClick={handleUndo}
              disabled={strokeHistory.length <= 1}
              className="p-1 rounded-full bg-white text-[#1E3A8A] border border-[#60A5FA]/30 text-xs font-black hover:bg-[#EFF6FF] disabled:opacity-40 transition-all cursor-pointer touch-manipulation"
              title="Undo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleClear}
              className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[11px] font-black hover:bg-rose-200 transition-all flex items-center gap-1 cursor-pointer touch-manipulation"
              title="Linisin"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Linisin</span>
            </button>

            <button
              onClick={() => setShowGhostGuide(!showGhostGuide)}
              className={`px-2.5 py-0.5 rounded-full border text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer touch-manipulation ${
                showGhostGuide
                  ? 'bg-[#60A5FA] text-white border-[#3B82F6]'
                  : 'bg-white text-[#1E3A8A] border-[#60A5FA]/30'
              }`}
              title="Bakás"
            >
              {showGhostGuide ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Bakás</span>
            </button>
          </div>
        </div>

        {/* Writing Canvas Box with Blue-Red-Blue Guidelines */}
        <div className="flex-1 min-h-[150px] sm:min-h-[190px] relative bg-white rounded-xl border-3 border-[#60A5FA] shadow-inner overflow-hidden cursor-crosshair my-1">
          {/* Background Canvas: Guidelines & Visual Ghost Template */}
          <canvas
            ref={guideCanvasRef}
            className="w-full h-full block absolute inset-0 z-0 pointer-events-none"
          />

          {/* Foreground Canvas: Student's Actual Pen Strokes */}
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full touch-none block absolute inset-0 z-10"
          />

          <div className="absolute bottom-1 right-2 pointer-events-none text-[10px] font-bold text-[#3B82F6] bg-white/90 px-2 py-0.5 rounded-full border border-[#60A5FA]/40 z-20">
            Gamitin ang mouse o daliri
          </div>
        </div>

        {/* Bottom Bar: Evaluation Feedback & Submit Action */}
        <div className="shrink-0 space-y-1">
          {/* AI Evaluation Spinner */}
          {isEvaluating && (
            <div className="bg-[#EFF6FF] rounded-xl p-1.5 text-center border border-[#60A5FA] shadow-xs animate-pulse flex items-center justify-center gap-1.5 text-xs text-[#1E3A8A] font-black">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#60A5FA]" />
              <span>Sinusuri ng AI Tutor ang linya at laki ng iyong sulat...</span>
            </div>
          )}

          {/* Evaluation Output Card */}
          {evaluation && !isEvaluating && (
            <div
              className={`rounded-xl p-1.5 sm:p-2 border-2 shadow-xs transition-all text-xs ${
                evaluation.isCorrect
                  ? 'bg-[#F0FDF4] border-[#4ADE80] text-[#166534]'
                  : 'bg-[#FEF2F2] border-[#F87171] text-[#991B1B]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {evaluation.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
                  )}
                  <span className="font-black truncate">
                    {evaluation.isCorrect ? 'Magandang Sulat! ⭐ +10 Bituin' : 'Maaari pang Pagandahin'}
                  </span>
                </div>
                <div className="text-[10px] font-black bg-white px-2 py-0.5 rounded-full border border-current">
                  {'⭐'.repeat(Math.max(evaluation.score || (evaluation.isCorrect ? 5 : 1), 1))}
                </div>
              </div>
              <p className="font-bold mt-0.5 text-[11px] truncate">{evaluation.feedbackTagalog}</p>
            </div>
          )}

          {/* Submit Handwriting Evaluation Button */}
          <button
            onClick={handleEvaluateWriting}
            disabled={isEvaluating}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] hover:scale-102 active:scale-98 text-white py-2 rounded-xl font-black text-xs sm:text-sm shadow-xs border border-white transition-all disabled:opacity-50 cursor-pointer touch-manipulation"
          >
            <PenTool className="w-4 h-4" />
            <span>Ipasa at Suriin ang Sulat gamit ang AI</span>
          </button>
        </div>

      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-1 border-t border-[#60A5FA]/30 shrink-0">
        <button
          onClick={() => {
            if (selectedItemIndex > 0) {
              setSelectedItemIndex(selectedItemIndex - 1);
            } else {
              setSelectedItemIndex(WRITING_ITEMS.length - 1);
            }
          }}
          className="flex items-center gap-1 bg-[#FFD93D] hover:bg-[#FFC800] text-[#4B2C20] border border-[#FF8400] px-4 py-1.5 rounded-full text-xs font-black transition-all hover:scale-105 active:scale-95 cursor-pointer touch-manipulation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Nakataraan</span>
        </button>

        <button
          onClick={() => {
            if (selectedItemIndex < WRITING_ITEMS.length - 1) {
              setSelectedItemIndex(selectedItemIndex + 1);
            } else {
              setSelectedItemIndex(0);
            }
          }}
          className="flex items-center gap-1 bg-[#60A5FA] hover:bg-blue-600 text-white px-5 py-1.5 rounded-full text-xs font-black shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer touch-manipulation"
        >
          <span>Susunod</span>
          <PenTool className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
