import React from 'react';
import { PetColorPalette } from '../PetArchetypes';

interface BirdAndAmphibianProps {
  race: string;
  palette: PetColorPalette;
  stage: 'Baby' | 'Teen' | 'Adult';
  eyeR: number;
}

export const BirdAndAmphibianSvg: React.FC<BirdAndAmphibianProps> = ({
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
    // BABY CHICK / MUNTING SISIW (Distinct round fluffy chick, NOT a rat!)
    // =========================================================================
    case 'bird-chick':
      return (
        <g id="race-bird-chick">
          {/* Fluffy Chick Downy Body */}
          <ellipse
            cx="100"
            cy="125"
            rx={isBaby ? 38 : 42}
            ry={isBaby ? 34 : 38}
            fill="#FDE047"
            stroke="#B45309"
            strokeWidth="3"
          />

          {/* Baby Belly Highlights */}
          <ellipse cx="102" cy="130" rx="22" ry="18" fill="#FEF9C3" opacity="0.9" />

          {/* Little Chick Three-Toed Orange Feet */}
          <g>
            <path
              d="M85,158 L85,168 M85,168 L77,172 M85,168 L85,174 M85,168 L92,172"
              stroke="#EA580C"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M115,158 L115,168 M115,168 L107,172 M115,168 L115,174 M115,168 L122,172"
              stroke="#EA580C"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Flapping Baby Wings */}
          <g className="pet-wing-anim origin-[70px_120px]">
            <path
              d="M72,120 Q50,110 54,128 Q62,142 80,132 Z"
              fill="#FACC15"
              stroke="#B45309"
              strokeWidth="2.5"
            />
            {/* Feather details */}
            <path d="M60,122 Q68,130 76,128" stroke="#CA8A04" strokeWidth="1.5" fill="none" />
          </g>

          {/* Big Round Baby Chick Head */}
          <circle cx="108" cy="84" r="32" fill="#FDE047" stroke="#B45309" strokeWidth="3" />

          {/* Cute Sprouted Chick Feather Crest on Head */}
          <path
            d="M108,52 C102,40 106,32 112,35 C116,37 114,48 108,52 Z"
            fill="#FACC15"
            stroke="#B45309"
            strokeWidth="2"
          />
          <path
            d="M112,52 C118,42 124,36 126,42 C126,46 120,50 112,52 Z"
            fill="#EAB308"
            stroke="#B45309"
            strokeWidth="2"
          />

          {/* Rosy Cheeks */}
          <circle cx="88" cy="94" r="7" fill="#FCA5A5" opacity="0.65" />
          <circle cx="128" cy="94" r="7" fill="#FCA5A5" opacity="0.65" />

          {/* Big Adorable Baby Chick Eyes */}
          <circle cx="94" cy="80" r={eyeR + 1.5} fill="#1E293B" />
          <circle cx="97" cy="77" r={(eyeR + 1.5) * 0.4} fill="#FFFFFF" />
          <circle cx="92" cy="83" r={(eyeR + 1.5) * 0.2} fill="#FFFFFF" />

          <circle cx="122" cy="80" r={eyeR + 1.5} fill="#1E293B" />
          <circle cx="125" cy="77" r={(eyeR + 1.5) * 0.4} fill="#FFFFFF" />
          <circle cx="120" cy="83" r={(eyeR + 1.5) * 0.2} fill="#FFFFFF" />

          {/* Cute Triangular Orange Chick Beak */}
          <polygon
            points="104,86 114,86 109,96"
            fill="#F97316"
            stroke="#C2410C"
            strokeWidth="2"
          />
          <line x1="106" y1="89" x2="112" y2="89" stroke="#EA580C" strokeWidth="1.5" />
        </g>
      );

    // =========================================================================
    // DUCKLING / PATO / BIBE / GANSA (Flat wide duck bill, webbed feet, NOT a rat!)
    // =========================================================================
    case 'bird-duck':
      return (
        <g id="race-bird-duck">
          {/* Water ripples under duck */}
          <ellipse cx="100" cy="165" rx="46" ry="10" fill="#0284C7" opacity="0.25" />
          <ellipse cx="100" cy="165" rx="32" ry="6" fill="#38BDF8" opacity="0.35" />

          {/* Duckling Curved Body */}
          <path
            d="M58,135 C58,110 82,105 110,110 C140,115 152,130 148,145 C144,160 115,162 90,160 C65,158 58,148 58,135 Z"
            fill={palette.primary || '#FBBF24'}
            stroke={palette.dark || '#451A03'}
            strokeWidth="3"
          />

          {/* Curved Duck Tail Up-Feathers */}
          <path
            d="M58,132 C45,124 40,114 48,112 C55,110 58,122 62,128 Z"
            fill={palette.secondary || '#F59E0B'}
            stroke={palette.dark || '#451A03'}
            strokeWidth="2"
          />

          {/* Breast and Belly Highlight */}
          <path
            d="M95,122 C115,124 135,134 132,148 C128,158 105,158 92,154 Z"
            fill={palette.belly || '#FEF08A'}
            opacity="0.85"
          />

          {/* Webbed Orange Duck Paddle Feet */}
          <path
            d="M82,158 L72,168 C76,170 82,170 86,168 C90,170 96,170 100,166 L92,158 Z"
            fill="#EA580C"
            stroke="#9A3412"
            strokeWidth="2"
          />
          <path
            d="M112,158 L104,166 C108,168 114,168 118,166 C122,168 128,168 132,164 L122,158 Z"
            fill="#EA580C"
            stroke="#9A3412"
            strokeWidth="2"
          />

          {/* Duck Wing */}
          <g className="pet-wing-anim origin-[90px_130px]">
            <path
              d="M85,125 C70,120 72,142 92,144 C110,146 122,138 114,128 C105,120 95,122 85,125 Z"
              fill={palette.secondary || '#F59E0B'}
              stroke={palette.dark || '#451A03'}
              strokeWidth="2.5"
            />
          </g>

          {/* Graceful Curved Duck Neck & Head */}
          <path
            d="M105,115 C108,98 114,88 120,78 C126,68 140,70 144,82 C146,95 135,114 125,122 Z"
            fill={palette.primary || '#FBBF24'}
            stroke={palette.dark || '#451A03'}
            strokeWidth="3"
          />
          <circle
            cx="132"
            cy="78"
            r="22"
            fill={palette.primary || '#FBBF24'}
            stroke={palette.dark || '#451A03'}
            strokeWidth="3"
          />

          {/* Cute Duck Cheeks */}
          <circle cx="125" cy="86" r="6" fill="#FCA5A5" opacity="0.6" />

          {/* Duck Eye with Bright Glint */}
          <circle cx="128" cy="74" r={eyeR} fill="#1E293B" />
          <circle cx="130" cy="72" r={eyeR * 0.4} fill="#FFFFFF" />

          {/* Characteristic Flat Wide Orange Duck Bill */}
          <path
            d="M142,76 C155,74 172,76 170,84 C168,90 152,90 142,86 Z"
            fill="#F97316"
            stroke="#C2410C"
            strokeWidth="2.5"
          />
          {/* Duck Bill Twin Nostrils */}
          <circle cx="150" cy="78" r="1.5" fill="#7C2D12" />
        </g>
      );

    // =========================================================================
    // TREE FROG / PALAKA / SALAMANDER (Bulging eyes, wide frog smile, NOT a rat!)
    // =========================================================================
    case 'frog':
      return (
        <g id="race-frog">
          {/* Folded Frog Leaping Hind Legs with Suction Toes */}
          <g>
            {/* Left Hind Leg */}
            <path
              d="M75,135 C52,125 45,145 60,158 C72,168 85,160 85,150 Z"
              fill={palette.secondary || '#16A34A'}
              stroke={palette.dark || '#14532D'}
              strokeWidth="2.5"
            />
            {/* Left Suction-pad Toes */}
            <circle cx="56" cy="162" r="5" fill="#22C55E" stroke="#14532D" strokeWidth="1.5" />
            <circle cx="66" cy="167" r="5" fill="#22C55E" stroke="#14532D" strokeWidth="1.5" />
            <circle cx="76" cy="166" r="5" fill="#22C55E" stroke="#14532D" strokeWidth="1.5" />

            {/* Right Hind Leg */}
            <path
              d="M125,135 C148,125 155,145 140,158 C128,168 115,160 115,150 Z"
              fill={palette.secondary || '#16A34A'}
              stroke={palette.dark || '#14532D'}
              strokeWidth="2.5"
            />
            {/* Right Suction-pad Toes */}
            <circle cx="144" cy="162" r="5" fill="#22C55E" stroke="#14532D" strokeWidth="1.5" />
            <circle cx="134" cy="167" r="5" fill="#22C55E" stroke="#14532D" strokeWidth="1.5" />
            <circle cx="124" cy="166" r="5" fill="#22C55E" stroke="#14532D" strokeWidth="1.5" />
          </g>

          {/* Plump Frog Body */}
          <ellipse
            cx="100"
            cy="128"
            rx="38"
            ry="32"
            fill={palette.primary || '#22C55E'}
            stroke={palette.dark || '#14532D'}
            strokeWidth="3"
          />

          {/* Inflatable Throat Vocal Sac & Cream Belly */}
          <ellipse
            cx="100"
            cy="134"
            rx="24"
            ry="20"
            fill={palette.belly || '#DCFCE7'}
            stroke={palette.secondary || '#16A34A'}
            strokeWidth="1.5"
          />

          {/* Front Webbed Feet */}
          <rect
            x="84"
            y="148"
            width="10"
            height="14"
            rx="5"
            fill={palette.primary || '#22C55E'}
            stroke={palette.dark || '#14532D'}
            strokeWidth="2"
          />
          <rect
            x="106"
            y="148"
            width="10"
            height="14"
            rx="5"
            fill={palette.primary || '#22C55E'}
            stroke={palette.dark || '#14532D'}
            strokeWidth="2"
          />

          {/* Broad Frog Head */}
          <ellipse
            cx="100"
            cy="90"
            rx="42"
            ry="28"
            fill={palette.primary || '#22C55E'}
            stroke={palette.dark || '#14532D'}
            strokeWidth="3"
          />

          {/* Amphibian Spots on Forehead */}
          <circle cx="92" cy="80" r="3.5" fill={palette.secondary || '#15803D'} opacity="0.6" />
          <circle cx="108" cy="78" r="4.5" fill={palette.secondary || '#15803D'} opacity="0.6" />
          <circle cx="100" cy="84" r="3" fill={palette.secondary || '#15803D'} opacity="0.6" />

          {/* Big Bulging Frog Eyes Mounted on Top of Head */}
          <g>
            {/* Left Eye Bulge */}
            <circle
              cx="78"
              cy="68"
              r="17"
              fill={palette.primary || '#22C55E'}
              stroke={palette.dark || '#14532D'}
              strokeWidth="3"
            />
            <circle cx="78" cy="68" r="12" fill="#FEF08A" />
            {/* Horizontal Amphibian Pupil */}
            <ellipse cx="78" cy="68" rx="7" ry="4" fill="#0F172A" />
            <circle cx="75" cy="65" r="3.5" fill="#FFFFFF" />

            {/* Right Eye Bulge */}
            <circle
              cx="122"
              cy="68"
              r="17"
              fill={palette.primary || '#22C55E'}
              stroke={palette.dark || '#14532D'}
              strokeWidth="3"
            />
            <circle cx="122" cy="68" r="12" fill="#FEF08A" />
            {/* Horizontal Amphibian Pupil */}
            <ellipse cx="122" cy="68" rx="7" ry="4" fill="#0F172A" />
            <circle cx="119" cy="65" r="3.5" fill="#FFFFFF" />
          </g>

          {/* Iconic Wide Smiling Frog Mouth */}
          <path
            d="M72,96 Q100,114 128,96"
            stroke={palette.dark || '#14532D'}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          {/* Tongue Peak */}
          <ellipse cx="100" cy="103" rx="7" ry="4" fill="#F43F5E" />

          {/* Nostril dots */}
          <circle cx="95" cy="88" r="1.5" fill="#14532D" />
          <circle cx="105" cy="88" r="1.5" fill="#14532D" />
        </g>
      );

    // =========================================================================
    // ROYAL PEACOCK / MARILAG NA PABOREAL (Glorious 5-eyed iridescent tail fan!)
    // =========================================================================
    case 'peacock':
      return (
        <g id="race-peacock">
          {/* Magnificent 5-Eyed Peacock Tail Fan */}
          <g className="pet-wing-anim origin-[100px_130px]">
            {/* Fan Plumes */}
            <path
              d="M50,75 Q90,110 100,130 M70,50 Q95,100 100,130 M100,40 Q100,95 100,130 M130,50 Q105,100 100,130 M150,75 Q110,110 100,130"
              stroke="#047857"
              strokeWidth="4"
              fill="none"
            />

            {/* Peacock Eye Feathers (Ocelli) */}
            {[
              { cx: 50, cy: 75, r: 14 },
              { cx: 70, cy: 50, r: 15 },
              { cx: 100, cy: 40, r: 16 },
              { cx: 130, cy: 50, r: 15 },
              { cx: 150, cy: 75, r: 14 },
            ].map((eye, i) => (
              <g key={i}>
                <ellipse
                  cx={eye.cx}
                  cy={eye.cy}
                  rx={eye.r}
                  ry={eye.r * 1.2}
                  fill="#059669"
                  stroke="#FBBF24"
                  strokeWidth="2"
                />
                <circle cx={eye.cx} cy={eye.cy} r={eye.r * 0.65} fill="#0284C7" />
                <circle cx={eye.cx} cy={eye.cy} r={eye.r * 0.35} fill="#312E81" />
                <circle cx={eye.cx - 2} cy={eye.cy - 2} r="2" fill="#FFFFFF" />
              </g>
            ))}
          </g>

          {/* Peacock Body */}
          <ellipse cx="100" cy="135" rx="28" ry="24" fill="#0284C7" stroke="#1E1B4B" strokeWidth="2.5" />
          <path d="M92,125 C92,105 96,90 102,78 C108,68 116,68 120,78 C124,90 120,115 116,132 Z" fill="#0284C7" stroke="#1E1B4B" strokeWidth="2.5" />

          {/* Head & Regal Crown Crest */}
          <circle cx="112" cy="74" r="16" fill="#0369A1" stroke="#1E1B4B" strokeWidth="2" />
          {/* Fan crest on head */}
          <path d="M106,62 L100,50 M110,60 L110,48 M116,62 L120,50" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
          <circle cx="100" cy="50" r="3" fill="#06B6D4" />
          <circle cx="110" cy="48" r="3" fill="#06B6D4" />
          <circle cx="120" cy="50" r="3" fill="#06B6D4" />

          {/* Beak & Eye */}
          <polygon points="124,72 136,75 124,78" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
          <circle cx="116" cy="72" r={eyeR} fill="#FFFFFF" />
          <circle cx="117" cy="72" r={eyeR * 0.6} fill="#0F172A" />
        </g>
      );

    // =========================================================================
    // ETERNAL PHOENIX / PHOENIX NG APOY (Flaming crest, blazing tail plumes)
    // =========================================================================
    case 'bird-phoenix':
      return (
        <g id="race-bird-phoenix">
          {/* Blazing Flame Tail Plumes */}
          <g className="pet-wing-anim origin-[100px_140px]">
            <path
              d="M95,140 C75,170 50,185 30,175 C45,160 65,150 90,135 Z"
              fill="#EA580C"
              stroke="#B45309"
              strokeWidth="2"
            />
            <path
              d="M100,142 C90,175 80,195 65,190 C75,170 85,155 98,138 Z"
              fill="#F97316"
            />
            <path
              d="M105,140 C125,170 150,185 170,175 C155,160 135,150 110,135 Z"
              fill="#EA580C"
              stroke="#B45309"
              strokeWidth="2"
            />
          </g>

          {/* Fiery Wing Flares */}
          <g className="pet-wing-anim origin-[80px_110px]">
            <path
              d="M75,115 C45,85 30,55 50,45 C68,36 82,65 80,95 Z"
              fill="#F97316"
              stroke="#DC2626"
              strokeWidth="2.5"
            />
            <path
              d="M52,50 Q70,75 75,100"
              stroke="#FEF08A"
              strokeWidth="2.5"
              fill="none"
            />
          </g>

          {/* Phoenix Body */}
          <ellipse cx="102" cy="120" rx="34" ry="28" fill="#DC2626" stroke="#991B1B" strokeWidth="3" />
          <ellipse cx="106" cy="124" rx="20" ry="16" fill="#FDE047" />

          {/* Head & Flame Crown */}
          <circle cx="118" cy="78" r="24" fill="#DC2626" stroke="#991B1B" strokeWidth="2.5" />
          {/* Multi-tier Fire Crest */}
          <path
            d="M115,56 C110,38 120,28 126,35 C130,40 125,50 120,56 Z"
            fill="#FACC15"
            stroke="#EA580C"
            strokeWidth="1.5"
          />
          <path
            d="M122,56 C124,42 136,34 140,44 C140,50 132,54 126,56 Z"
            fill="#EA580C"
            stroke="#991B1B"
            strokeWidth="1.5"
          />

          {/* Sharp Raptor Beak */}
          <path d="M136,74 Q154,77 146,86 Q138,82 136,78 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
          <circle cx="126" cy="74" r={eyeR} fill="#FEF08A" stroke="#991B1B" strokeWidth="1.5" />
          <circle cx="127" cy="74" r={eyeR * 0.6} fill="#7F1D1D" />
        </g>
      );

    // =========================================================================
    // GENERAL CUTE BIRD (Kalapati, Flamingo, Katala, Tipol)
    // =========================================================================
    default:
      return (
        <g id="race-bird-cute">
          {/* Bird Body */}
          <ellipse
            cx="100"
            cy="125"
            rx="36"
            ry="30"
            fill={palette.primary}
            stroke={palette.dark || '#3A1E14'}
            strokeWidth="3"
          />
          <ellipse cx="106" cy="128" rx="20" ry="16" fill={palette.belly} />

          {/* Soft Avian Wings */}
          <g className="pet-wing-anim origin-[75px_120px]">
            <path
              d="M75,120 Q50,105 60,135 Q75,145 88,130 Z"
              fill={palette.secondary}
              stroke={palette.dark || '#3A1E14'}
              strokeWidth="2.5"
            />
          </g>

          {/* Head */}
          <circle
            cx="115"
            cy="82"
            r="26"
            fill={palette.primary}
            stroke={palette.dark || '#3A1E14'}
            strokeWidth="3"
          />

          {/* Avian Beak */}
          <polygon
            points="136,80 152,84 136,89"
            fill="#F59E0B"
            stroke="#B45309"
            strokeWidth="2"
          />

          {/* Eyes */}
          <circle cx="122" cy="78" r={eyeR} fill="#FFFFFF" stroke={palette.dark || '#3A1E14'} strokeWidth="1.5" />
          <circle cx="124" cy="78" r={eyeR * 0.65} fill={palette.iris} />
          <circle cx="125" cy="76" r={eyeR * 0.28} fill="#FFFFFF" />

          {/* Delicate Bird Legs */}
          <line x1="90" y1="155" x2="86" y2="168" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="110" y1="155" x2="114" y2="168" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
  }
};
