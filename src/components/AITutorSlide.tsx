import React, { useState } from 'react';
import { ExternalLink, RotateCcw, Sparkles } from 'lucide-react';

export const AITutorSlide: React.FC = () => {
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const tutorUrl = 'https://cutesy-vr-buddy.lovable.app';

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenExternal = () => {
    window.open(tutorUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full h-full flex-1 flex flex-col min-h-0 overflow-hidden p-1.5 sm:p-2 bg-[#FFFBEB]">
      
      {/* Sleek, Single-Row Top Control Bar */}
      <div className="bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 rounded-xl px-2.5 sm:px-3 py-1.5 text-white shadow-xs border border-cyan-400 mb-1.5 shrink-0 flex items-center justify-between gap-2">
        
        {/* Title & Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-base sm:text-lg shadow-inner shrink-0">
            🤖
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <h2 className="text-xs sm:text-sm font-black tracking-wide truncate">
              Cutesy VR Buddy • AI Tutor
            </h2>
            <span className="bg-pink-500 text-white text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full border border-pink-300 shadow-xs flex items-center gap-0.5 shrink-0">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Interaktibo</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded-lg text-[10px] sm:text-xs font-black backdrop-blur-xs transition-all border border-white/30 active:scale-95 cursor-pointer touch-manipulation shadow-xs"
            title="I-reload ang AI Tutor"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">I-refresh</span>
          </button>

          <button
            onClick={handleOpenExternal}
            className="flex items-center gap-1 bg-white text-indigo-700 hover:bg-cyan-50 px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-black transition-all shadow-xs active:scale-95 cursor-pointer touch-manipulation hover:shadow-sm"
            title="Buksan ang Cutesy VR Buddy sa bagong tab"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Bukas sa Bagong Tab</span>
          </button>
        </div>

      </div>

      {/* Main Interactive Iframe Container (Fits 100% remaining viewport height without scrolling) */}
      <div className="flex-1 min-h-0 w-full bg-white rounded-xl sm:rounded-2xl border-2 sm:border-3 border-cyan-400 shadow-inner overflow-hidden relative flex flex-col">
        
        {/* Loading Spinner Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-cyan-50/90 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center">
            <div className="w-9 h-9 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="font-black text-[#164e63] text-xs sm:text-sm animate-pulse">
              Ikinakarga ang Cutesy VR Buddy AI Tutor...
            </p>
            <p className="text-[10px] text-cyan-700 font-bold mt-0.5">
              Kung matagal magkarga, maaari mong gamitin ang "Bukas sa Bagong Tab".
            </p>
          </div>
        )}

        {/* Embedded Application Frame */}
        <iframe
          key={iframeKey}
          src={tutorUrl}
          title="Cutesy VR Buddy AI Tutor"
          allow="microphone; camera; display-capture; autoplay; clipboard-write; fullscreen"
          onLoad={() => setIsLoading(false)}
          className="w-full h-full flex-1 border-0 rounded-xl sm:rounded-2xl block"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-modals"
        />

      </div>

    </div>
  );
};
