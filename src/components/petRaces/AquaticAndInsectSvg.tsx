import React from 'react';
import { PetColorPalette } from '../PetArchetypes';

interface AquaticAndInsectProps {
  race: string;
  palette: PetColorPalette;
  stage: 'Baby' | 'Teen' | 'Adult';
  eyeR: number;
}

export const AquaticAndInsectSvg: React.FC<AquaticAndInsectProps> = ({
  race,
  palette,
  stage,
  eyeR,
}) => {
  const isAdult = stage === 'Adult';
  const isTeen = stage === 'Teen';
  const isBaby = stage === 'Baby';

  switch (race) {
    // =========================================================================
    // FISH / GINTONG ISDA / BANGUS (Streamlined piscine body, caudal & dorsal fins)
    // =========================================================================
    case 'fish':
      return (
        <g id="race-fish">
          {/* Water Bubbles */}
          <circle cx="155" cy="80" r="5" fill="#38BDF8" opacity="0.6" />
          <circle cx="165" cy="65" r="3.5" fill="#38BDF8" opacity="0.6" />
          <circle cx="172" cy="50" r="2.5" fill="#38BDF8" opacity="0.6" />

          {/* Flowing Dorsal Fin */}
          <path
            d="M80,95 Q105,60 125,85"
            fill={palette.secondary || '#F59E0B'}
            stroke={palette.dark || '#451A03'}
            strokeWidth="2.5"
          />

          {/* Caudal Tail Fin (Animated) */}
          <g className="pet-tail-anim origin-[55px_120px]">
            <path
              d="M55,120 C30,90 15,100 22,120 C15,140 30,150 55,120 Z"
              fill={palette.secondary || '#F59E0B'}
              stroke={palette.dark || '#451A03'}
              strokeWidth="2.5"
            />
            {/* Fin Rays */}
            <path d="M50,120 Q30,105 25,108" stroke="#FEF08A" strokeWidth="1.5" fill="none" />
            <path d="M50,120 Q30,135 25,132" stroke="#FEF08A" strokeWidth="1.5" fill="none" />
          </g>

          {/* Streamlined Fish Body */}
          <ellipse
            cx="100"
            cy="120"
            rx="46"
            ry="30"
            fill={palette.primary || '#FBBF24'}
            stroke={palette.dark || '#451A03'}
            strokeWidth="3"
          />

          {/* Shiny Belly & Scales */}
          <ellipse cx="102" cy="126" rx="26" ry="16" fill={palette.belly || '#FEF08A'} opacity="0.8" />
          <path d="M90,115 Q95,120 90,125 M102,115 Q107,120 102,125" stroke="#D97706" strokeWidth="2" fill="none" />

          {/* Pectoral Fin (Waving) */}
          <path
            d="M100,125 Q82,135 88,145 Q105,140 105,128 Z"
            fill={palette.accent || '#F97316'}
            stroke={palette.dark || '#451A03'}
            strokeWidth="2"
          />

          {/* Gill Arch */}
          <path d="M120,105 Q115,120 120,135" stroke={palette.dark || '#451A03'} strokeWidth="2.5" fill="none" />

          {/* Fish Eye */}
          <circle cx="132" cy="112" r={eyeR} fill="#FFFFFF" stroke={palette.dark || '#451A03'} strokeWidth="2" />
          <circle cx="134" cy="112" r={eyeR * 0.65} fill="#0F172A" />
          <circle cx="135" cy="110" r={eyeR * 0.25} fill="#FFFFFF" />

          {/* Fish Lips */}
          <path d="M145,116 Q150,120 145,124" stroke={palette.dark || '#451A03'} strokeWidth="2.5" fill="none" />
        </g>
      );

    // =========================================================================
    // MARINE MAMMAL / DOLPHIN / DUGONG / OTTER (Rostrum, flippers, water body)
    // =========================================================================
    case 'marine-mammal':
      return (
        <g id="race-marine-mammal">
          {/* Water Splash Arc */}
          <ellipse cx="100" cy="160" rx="42" ry="8" fill="#38BDF8" opacity="0.35" />

          {/* Tail Fluke (Animated) */}
          <g className="pet-tail-anim origin-[55px_130px]">
            <path
              d="M55,130 C30,110 20,130 35,135 C20,140 30,160 55,135 Z"
              fill={palette.secondary || '#0284C7'}
              stroke="#075985"
              strokeWidth="2.5"
            />
          </g>

          {/* Dolphin / Dugong Curved Body */}
          <path
            d="M55,130 C60,105 85,95 115,100 C138,105 152,118 145,135 C138,150 95,155 70,150 C55,145 55,135 55,130 Z"
            fill={palette.primary || '#0EA5E9'}
            stroke="#075985"
            strokeWidth="3"
          />

          {/* Belly */}
          <path
            d="M75,138 C90,145 115,145 130,135 C120,148 95,152 75,138 Z"
            fill={palette.belly || '#E0F2FE'}
          />

          {/* Dorsal Fin */}
          <path d="M92,100 Q105,75 114,98" fill={palette.secondary || '#0284C7'} stroke="#075985" strokeWidth="2" />

          {/* Side Flipper */}
          <path
            d="M102,130 Q118,145 106,152 Q95,142 102,130 Z"
            fill={palette.secondary || '#0284C7'}
            stroke="#075985"
            strokeWidth="2"
          />

          {/* Melon Forehead & Rounded Snout */}
          <circle cx="130" cy="112" r="18" fill={palette.primary || '#0EA5E9'} stroke="#075985" strokeWidth="2.5" />
          <path d="M142,114 Q154,118 145,124" fill={palette.primary || '#0EA5E9'} stroke="#075985" strokeWidth="2" />

          {/* Eye & Friendly Smile */}
          <circle cx="130" cy="110" r={eyeR * 0.85} fill="#0F172A" />
          <circle cx="131" cy="109" r={eyeR * 0.3} fill="#FFFFFF" />
          <path d="M136,120 Q142,125 146,120" stroke="#075985" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );

    // =========================================================================
    // INSECT / HONEYBEE / BUTTERFLY (Translucent wings, antennae, stripes)
    // =========================================================================
    case 'insect':
      return (
        <g id="race-insect">
          {/* Ornate Wing Flutter */}
          <g className="pet-wing-anim origin-[100px_90px]">
            {/* Upper Wing */}
            <ellipse
              cx="75"
              cy="70"
              rx="28"
              ry="18"
              fill="#A5F3FC"
              stroke="#0891B2"
              strokeWidth="2"
              opacity="0.85"
              transform="rotate(-25 75 70)"
            />
            <ellipse
              cx="125"
              cy="70"
              rx="28"
              ry="18"
              fill="#A5F3FC"
              stroke="#0891B2"
              strokeWidth="2"
              opacity="0.85"
              transform="rotate(25 125 70)"
            />

            {/* Lower Wing */}
            <ellipse
              cx="78"
              cy="95"
              rx="20"
              ry="14"
              fill="#CFFAFE"
              stroke="#0891B2"
              strokeWidth="1.5"
              opacity="0.8"
            />
            <ellipse
              cx="122"
              cy="95"
              rx="20"
              ry="14"
              fill="#CFFAFE"
              stroke="#0891B2"
              strokeWidth="1.5"
              opacity="0.8"
            />
          </g>

          {/* Bee / Butterfly Striped Body */}
          <ellipse cx="100" cy="130" rx="30" ry="24" fill="#FBBF24" stroke="#451A03" strokeWidth="3" />

          {/* Black Stripes */}
          <path d="M85,116 Q100,112 115,116" stroke="#1C1917" strokeWidth="5" fill="none" />
          <path d="M80,130 Q100,126 120,130" stroke="#1C1917" strokeWidth="5" fill="none" />
          <path d="M85,144 Q100,140 115,144" stroke="#1C1917" strokeWidth="5" fill="none" />

          {/* Stinger */}
          <polygon points="97,154 103,154 100,165" fill="#1C1917" />

          {/* Round Head */}
          <circle cx="100" cy="90" r="22" fill="#FBBF24" stroke="#451A03" strokeWidth="2.5" />

          {/* Curved Antennae */}
          <path d="M92,72 Q82,50 75,54" stroke="#451A03" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="75" cy="54" r="3.5" fill="#F59E0B" />

          <path d="M108,72 Q118,50 125,54" stroke="#451A03" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="125" cy="54" r="3.5" fill="#F59E0B" />

          {/* Big Compound Eyes */}
          <circle cx="88" cy="88" r={eyeR} fill="#1C1917" />
          <circle cx="90" cy="86" r={eyeR * 0.4} fill="#FFFFFF" />

          <circle cx="112" cy="88" r={eyeR} fill="#1C1917" />
          <circle cx="114" cy="86" r={eyeR * 0.4} fill="#FFFFFF" />

          {/* Friendly Smile */}
          <path d="M95,98 Q100,103 105,98" stroke="#451A03" strokeWidth="2" fill="none" />
        </g>
      );

    // =========================================================================
    // REPTILE / GECKO / CROCODILE / SERPENT (Lizard tail, suction toes, scales)
    // =========================================================================
    default:
      return (
        <g id="race-reptile">
          {/* Long Serpentine / Lizard Tail */}
          <g className="pet-tail-anim origin-[55px_135px]">
            <path
              d="M56,135 C30,125 18,95 32,80 C40,70 48,90 52,110 Z"
              fill={palette.secondary || '#059669'}
              stroke={palette.dark || '#064E3B'}
              strokeWidth="2.5"
            />
          </g>

          {/* Sleek Reptilian Body */}
          <ellipse cx="100" cy="132" rx="44" ry="30" fill={palette.primary || '#10B981'} stroke={palette.dark || '#064E3B'} strokeWidth="3" />
          <ellipse cx="104" cy="136" rx="24" ry="18" fill={palette.belly || '#A7F3D0'} />

          {/* Serrated Back Scales */}
          <g>
            <polygon points="70,106 75,98 80,106" fill={palette.secondary || '#059669'} />
            <polygon points="85,104 90,95 95,104" fill={palette.secondary || '#059669'} />
            <polygon points="100,103 105,93 110,103" fill={palette.secondary || '#059669'} />
            <polygon points="115,104 120,95 125,104" fill={palette.secondary || '#059669'} />
          </g>

          {/* Claws / Suction-Cup Toes */}
          <rect x="74" y="154" width="14" height="16" rx="5" fill={palette.primary || '#10B981'} stroke={palette.dark || '#064E3B'} strokeWidth="2" />
          <rect x="112" y="154" width="14" height="16" rx="5" fill={palette.primary || '#10B981'} stroke={palette.dark || '#064E3B'} strokeWidth="2" />

          {/* Reptilian Head */}
          <ellipse cx="120" cy="88" rx="30" ry="24" fill={palette.primary || '#10B981'} stroke={palette.dark || '#064E3B'} strokeWidth="3" />

          {/* Flickering Forked Snake Tongue */}
          <path d="M148,92 L160,92 M160,92 L166,88 M160,92 L166,96" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Reptile Slit Eyes */}
          <circle cx="112" cy="80" r={eyeR} fill="#FEF08A" stroke={palette.dark || '#064E3B'} strokeWidth="2" />
          <ellipse cx="113" cy="80" rx="2.5" ry={eyeR * 0.75} fill="#0F172A" />

          <circle cx="132" cy="80" r={eyeR} fill="#FEF08A" stroke={palette.dark || '#064E3B'} strokeWidth="2" />
          <ellipse cx="133" cy="80" rx="2.5" ry={eyeR * 0.75} fill="#0F172A" />
        </g>
      );
  }
};
