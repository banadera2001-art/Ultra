import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playPetInteractSound, playAttackSound } from '../services/soundEffects';
import { speakTagalog } from '../services/speechService';
import { classifyPetRace, PetRaceSvg, PetColorPalette } from './PetArchetypes';
import { PET_UNIQUE_PALETTES } from '../data/petPalettes';

export interface DragonCityPetProps {
  petId?: string;
  emoji: string;
  name?: string;
  nameTagalog?: string;
  element?: 'Lupa' | 'Tubig' | 'Hangin' | 'Apoy' | 'Liwanag' | 'Mahika';
  stage?: 'Baby' | 'Teen' | 'Adult';
  level?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showShadow?: boolean;
  showAura?: boolean;
  showCrown?: boolean;
  interactive?: boolean;
  sound?: string;
  speechText?: string;
  animationState?: 'idle' | 'attack' | 'hit' | 'defend' | 'victory';
  facing?: 'right' | 'left';
  onClick?: () => void;
  className?: string;
  isStatic?: boolean;
}

const ELEMENT_PALETTES: Record<string, PetColorPalette & { particle: string; rune: string }> = {
  Apoy: {
    primary: '#EA580C',
    secondary: '#C2410C',
    accent: '#F97316',
    belly: '#FED7AA',
    iris: '#F59E0B',
    glow: 'rgba(234, 88, 12, 0.45)',
    dark: '#431407',
    particle: '🔥',
    rune: '⚡',
  },
  Tubig: {
    primary: '#0284C7',
    secondary: '#0369A1',
    accent: '#06B6D4',
    belly: '#BAE6FD',
    iris: '#0284C7',
    glow: 'rgba(6, 182, 212, 0.45)',
    dark: '#082F49',
    particle: '🫧',
    rune: '💧',
  },
  Hangin: {
    primary: '#0D9488',
    secondary: '#0F766E',
    accent: '#14B8A6',
    belly: '#CCFBF1',
    iris: '#059669',
    glow: 'rgba(20, 184, 166, 0.45)',
    dark: '#134E4A',
    particle: '🍃',
    rune: '🌪️',
  },
  Lupa: {
    primary: '#16A34A',
    secondary: '#15803D',
    accent: '#84CC16',
    belly: '#DCFCE7',
    iris: '#65A30D',
    glow: 'rgba(22, 163, 74, 0.45)',
    dark: '#14532D',
    particle: '🌿',
    rune: '🌱',
  },
  Liwanag: {
    primary: '#D97706',
    secondary: '#B45309',
    accent: '#F59E0B',
    belly: '#FEF3C7',
    iris: '#EAB308',
    glow: 'rgba(234, 179, 8, 0.55)',
    dark: '#451A03',
    particle: '✨',
    rune: '☀️',
  },
  Mahika: {
    primary: '#9333EA',
    secondary: '#7E22CE',
    accent: '#C084FC',
    belly: '#F3E8FF',
    iris: '#A855F7',
    glow: 'rgba(168, 85, 247, 0.55)',
    dark: '#3B0764',
    particle: '🔮',
    rune: '⭐',
  },
};

const SIZE_CONFIG = {
  sm: {
    width: 68,
    height: 68,
    containerClass: 'w-[68px] h-[68px]',
    shadowWidth: 'w-12 h-2.5',
    badgeClass: 'text-[9px]',
    speechOffset: '-top-9',
  },
  md: {
    width: 104,
    height: 104,
    containerClass: 'w-[104px] h-[104px]',
    shadowWidth: 'w-20 h-3.5',
    badgeClass: 'text-[10px]',
    speechOffset: '-top-10',
  },
  lg: {
    width: 148,
    height: 148,
    containerClass: 'w-[148px] h-[148px]',
    shadowWidth: 'w-28 h-4.5',
    badgeClass: 'text-xs',
    speechOffset: '-top-11',
  },
  xl: {
    width: 196,
    height: 196,
    containerClass: 'w-[196px] h-[196px]',
    shadowWidth: 'w-36 h-5.5',
    badgeClass: 'text-xs',
    speechOffset: '-top-12',
  },
  '2xl': {
    width: 240,
    height: 240,
    containerClass: 'w-[240px] h-[240px]',
    shadowWidth: 'w-44 h-6.5',
    badgeClass: 'text-sm',
    speechOffset: '-top-14',
  },
};

export const DragonCityPet: React.FC<DragonCityPetProps> = ({
  petId,
  emoji,
  name = 'Munting Alaga',
  nameTagalog,
  element = 'Lupa',
  stage = 'Baby',
  level,
  size = 'md',
  showShadow = true,
  showAura = true,
  showCrown = true,
  interactive = true,
  sound,
  speechText,
  animationState = 'idle',
  facing = 'right',
  onClick,
  className = '',
  isStatic = false,
}) => {
  const [isPoked, setIsPoked] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [floatingHeart, setFloatingHeart] = useState(false);

  // Compute stage from level if provided (Level 1-24: Baby, Level 25-59: Teen, Level 60-100: Adult)
  const activeStage: 'Baby' | 'Teen' | 'Adult' = level
    ? level < 25
      ? 'Baby'
      : level < 60
      ? 'Teen'
      : 'Adult'
    : (stage as 'Baby' | 'Teen' | 'Adult') || 'Baby';

  const isAdult = activeStage === 'Adult';
  const isTeen = activeStage === 'Teen';
  const isBaby = activeStage === 'Baby';

  const uniquePalette = petId ? PET_UNIQUE_PALETTES[petId] : undefined;
  const elementConfig = ELEMENT_PALETTES[element] || ELEMENT_PALETTES['Lupa'];
  const palette = uniquePalette || elementConfig;
  const particle = elementConfig.particle;
  const sizeSpec = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  // Classify authentic animal race based on identity
  const petRace = classifyPetRace({ emoji, name, nameTagalog, id: petId });

  // Play poke interaction
  const handlePetInteraction = () => {
    if (!interactive) return;

    setIsPoked(true);
    setFloatingHeart(true);
    setShowBubble(true);
    playPetInteractSound();

    if (sound) {
      speakTagalog(sound);
    }

    setTimeout(() => {
      setIsPoked(false);
      setFloatingHeart(false);
    }, 900);

    setTimeout(() => {
      setShowBubble(false);
    }, 2800);

    if (onClick) {
      onClick();
    }
  };

  // Determine container animation CSS class (GPU-accelerated, zero lag)
  let animClass = '';
  if (!isStatic) {
    if (animationState === 'attack') {
      animClass = facing === 'right' ? 'pet-attack-right' : 'pet-attack-left';
    } else if (animationState === 'hit') {
      animClass = facing === 'right' ? 'pet-hit-right' : 'pet-hit-left';
    } else {
      animClass = 'pet-idle-bob';
    }
  }

  const activeSpeech = speechText || sound || (isAdult ? 'Rawwwr!' : isTeen ? 'Grrr!' : 'Chirp!');

  return (
    <div
      id={`dragon-city-pet-${emoji}`}
      onClick={handlePetInteraction}
      className={`relative inline-flex flex-col items-center justify-center select-none ${
        interactive ? 'cursor-pointer hover:brightness-105 active:scale-95' : ''
      } transition-transform ${className}`}
    >
      {/* Speech Bubble on Interaction */}
      <AnimatePresence>
        {showBubble && activeSpeech && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            className={`absolute z-30 ${sizeSpec.speechOffset} px-3 py-1.5 rounded-2xl bg-white border-2 border-[#4B2C20] shadow-xl text-center whitespace-nowrap pointer-events-none`}
          >
            <span className="text-xs font-black text-[#4B2C20]">{activeSpeech}</span>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-[#4B2C20] rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Sparkle/Heart Particles on interaction */}
      <AnimatePresence>
        {floatingHeart && (
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 0.6 }}
            animate={{ opacity: 0, y: -50, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85 }}
            className="absolute z-20 pointer-events-none text-2xl flex items-center gap-1.5"
          >
            <span>❤️</span>
            <span>✨</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Articulated Creature Canvas */}
      <div className={`relative flex items-center justify-center ${sizeSpec.containerClass}`}>
        {/* Elemental Radiant Aura Background */}
        {showAura && !isStatic && (
          <div
            style={{
              background: `radial-gradient(circle, ${palette.glow} 0%, rgba(255,255,255,0) 70%)`,
            }}
            className="absolute inset-0 rounded-full blur-md pointer-events-none opacity-60"
          />
        )}

        {/* Stage 3 Adult Dragon/Titan Crown & Celestial Halo */}
        {isAdult && showCrown && (
          <div className="absolute -top-5 z-20 text-2xl filter drop-shadow-[0_4px_8px_rgba(234,179,8,0.7)] pointer-events-none animate-bounce">
            👑
          </div>
        )}

        {/* SVG Container with hardware-accelerated movement */}
        <div
          className={`w-full h-full flex items-center justify-center ${animClass}`}
          style={{
            transform: `${facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)'}`,
            transformOrigin: 'center center',
            willChange: animClass ? 'transform' : 'auto',
          }}
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full overflow-visible"
            style={{
              filter:
                !isStatic && (size === 'xl' || size === 'lg')
                  ? isAdult
                    ? 'drop-shadow(0 6px 8px rgba(0,0,0,0.18))'
                    : 'drop-shadow(0 3px 5px rgba(0,0,0,0.12))'
                  : undefined,
              contain: isStatic ? 'paint' : undefined,
            }}
          >
            {/* Render unique animal race anatomy */}
            <PetRaceSvg
              race={petRace}
              palette={palette}
              stage={activeStage}
              facing={facing}
              isAttacking={animationState === 'attack'}
              petId={petId}
              nameTagalog={nameTagalog}
            />

            {/* ATTACK ANIMATION VISUAL EFFECT (Slash / Elemental Blast) */}
            {animationState === 'attack' && (
              <g className="combat-slash-fx origin-[140px_100px]">
                {/* Slashing Arc Waves */}
                <path
                  d="M130,40 Q180,85 150,145"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                <path
                  d="M140,50 Q190,95 160,155"
                  fill="none"
                  stroke={palette.accent}
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M120,60 Q170,105 140,165"
                  fill="none"
                  stroke="#FBBF24"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Elemental Spark Burst */}
                <circle cx="165" cy="95" r="10" fill="#FFFFFF" opacity="0.8" />
                <circle cx="165" cy="95" r="6" fill={palette.accent} />
                <circle cx="178" cy="80" r="4" fill="#FBBF24" />
                <circle cx="175" cy="115" r="4" fill="#FBBF24" />

                <text x="160" y="70" fontSize="20" className="select-none pointer-events-none">
                  💥
                </text>
              </g>
            )}

            {/* Orbiting Elemental Particle for Teen & Adult */}
            {!isStatic && (isTeen || isAdult) && (
              <g className="pet-wing-anim origin-[140px_45px]">
                <text x="145" y="45" fontSize="14" className="select-none pointer-events-none">
                  {particle}
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Ground Shadow Oval */}
      {showShadow && (
        <div
          className={`${sizeSpec.shadowWidth} bg-black/25 rounded-full blur-[2px] mt-0.5 pointer-events-none`}
        />
      )}

      {/* Optional Tagalog Name Badge */}
      {nameTagalog && (
        <div className="mt-1 flex items-center gap-1">
          <span
            className={`${sizeSpec.badgeClass} font-black text-[#4B2C20] bg-white/95 px-2.5 py-0.5 rounded-full border border-[#4B2C20]/20 shadow-xs flex items-center gap-1`}
          >
            <span>{nameTagalog}</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                isAdult
                  ? 'bg-amber-100 text-amber-800'
                  : isTeen
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {activeStage}
            </span>
          </span>
        </div>
      )}
    </div>
  );
};
