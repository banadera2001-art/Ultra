import React from 'react';
import { PetColorPalette } from '../PetArchetypes';

interface MammalAndWildProps {
  race: string;
  palette: PetColorPalette;
  stage: 'Baby' | 'Teen' | 'Adult';
  eyeR: number;
}

export const MammalAndWildSvg: React.FC<MammalAndWildProps> = ({
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
    // PIG / BIIK / BABOY-RAMO / TANDAYAG (Prominent oval snout disc, curled tail)
    // =========================================================================
    case 'pig':
      return (
        <g id="race-pig">
          {/* Curly Corkscrew Pig Tail */}
          <g className="pet-tail-anim origin-[55px_130px]">
            <path
              d="M56,132 C42,126 38,114 46,110 C54,106 58,118 48,124"
              stroke={palette.secondary || '#EC4899'}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </g>

          {/* Plump Round Pig Body */}
          <ellipse
            cx="98"
            cy="135"
            rx="46"
            ry="36"
            fill={palette.primary || '#F472B6'}
            stroke={palette.dark || '#4A1D24'}
            strokeWidth="3"
          />
          <ellipse cx="104" cy="140" rx="26" ry="20" fill={palette.belly || '#FCE7F3'} />

          {/* Cloven Hooves / Short Legs */}
          <g>
            <rect x="74" y="158" width="16" height="18" rx="6" fill={palette.primary || '#F472B6'} stroke={palette.dark || '#4A1D24'} strokeWidth="2.5" />
            <line x1="82" y1="168" x2="82" y2="176" stroke={palette.dark || '#4A1D24'} strokeWidth="2" />

            <rect x="112" y="158" width="16" height="18" rx="6" fill={palette.primary || '#F472B6'} stroke={palette.dark || '#4A1D24'} strokeWidth="2.5" />
            <line x1="120" y1="168" x2="120" y2="176" stroke={palette.dark || '#4A1D24'} strokeWidth="2" />
          </g>

          {/* Big Round Pig Head */}
          <circle
            cx="116"
            cy="90"
            r="34"
            fill={palette.primary || '#F472B6'}
            stroke={palette.dark || '#4A1D24'}
            strokeWidth="3"
          />

          {/* Floppy Triangular Pig Ears */}
          <path
            d="M92,68 C80,50 96,44 104,60 Z"
            fill={palette.secondary || '#DB2777'}
            stroke={palette.dark || '#4A1D24'}
            strokeWidth="2.5"
          />
          <path
            d="M136,68 C148,50 132,44 124,60 Z"
            fill={palette.secondary || '#DB2777'}
            stroke={palette.dark || '#4A1D24'}
            strokeWidth="2.5"
          />

          {/* Cheerful Cheeks */}
          <circle cx="94" cy="98" r="7" fill="#F43F5E" opacity="0.4" />
          <circle cx="138" cy="98" r="7" fill="#F43F5E" opacity="0.4" />

          {/* Pig Eyes */}
          <circle cx="104" cy="82" r={eyeR} fill="#1E1B4B" />
          <circle cx="106" cy="80" r={eyeR * 0.35} fill="#FFFFFF" />

          <circle cx="128" cy="82" r={eyeR} fill="#1E1B4B" />
          <circle cx="130" cy="80" r={eyeR * 0.35} fill="#FFFFFF" />

          {/* Iconic Oval Pig Snout Disc with Twin Nostrils */}
          <ellipse
            cx="116"
            cy="100"
            rx="18"
            ry="13"
            fill={palette.belly || '#FCE7F3'}
            stroke={palette.dark || '#4A1D24'}
            strokeWidth="2.5"
          />
          <ellipse cx="111" cy="100" rx="3.5" ry="5" fill="#831843" />
          <ellipse cx="121" cy="100" rx="3.5" ry="5" fill="#831843" />

          {/* Boar Tusks for Wild Boar / Tandayag */}
          {isAdult && (
            <g>
              <path d="M96,104 Q90,92 98,90" stroke="#FEF08A" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M136,104 Q142,92 134,90" stroke="#FEF08A" strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>
          )}
        </g>
      );

    // =========================================================================
    // HAMSTER / BUBWIT (Chubby cheeks, holding sunflower seed, NOT a rat!)
    // =========================================================================
    case 'hamster':
      return (
        <g id="race-hamster">
          {/* Chubby Round Hamster Body */}
          <ellipse
            cx="100"
            cy="132"
            rx="42"
            ry="36"
            fill={palette.primary || '#F59E0B'}
            stroke={palette.dark || '#451A03'}
            strokeWidth="3"
          />
          <ellipse cx="100" cy="136" rx="26" ry="22" fill={palette.belly || '#FEF3C7'} />

          {/* Stubby Little Paws */}
          <ellipse cx="78" cy="164" rx="9" ry="6" fill="#FDE68A" stroke="#451A03" strokeWidth="2" />
          <ellipse cx="122" cy="164" rx="9" ry="6" fill="#FDE68A" stroke="#451A03" strokeWidth="2" />

          {/* Tiny Round Hamster Ears with Pink Folds */}
          <circle cx="74" cy="62" r="14" fill={palette.primary || '#F59E0B'} stroke="#451A03" strokeWidth="2.5" />
          <circle cx="74" cy="62" r="8" fill="#FBCFE8" />

          <circle cx="126" cy="62" r="14" fill={palette.primary || '#F59E0B'} stroke="#451A03" strokeWidth="2.5" />
          <circle cx="126" cy="62" r="8" fill="#FBCFE8" />

          {/* Round Hamster Head with Gigantic Chubby Cheeks */}
          <circle cx="100" cy="88" r="32" fill={palette.primary || '#F59E0B'} stroke="#451A03" strokeWidth="3" />

          {/* Puffed Out Cheek Pouches */}
          <ellipse cx="78" cy="98" rx="16" ry="12" fill={palette.belly || '#FEF3C7'} stroke="#451A03" strokeWidth="1.5" />
          <ellipse cx="122" cy="98" rx="16" ry="12" fill={palette.belly || '#FEF3C7'} stroke="#451A03" strokeWidth="1.5" />

          {/* Rosy Blush on Cheek Pouches */}
          <circle cx="76" cy="98" r="6" fill="#F87171" opacity="0.6" />
          <circle cx="124" cy="98" r="6" fill="#F87171" opacity="0.6" />

          {/* Big Glinting Hamster Eyes */}
          <circle cx="88" cy="80" r={eyeR + 1} fill="#1E1B4B" />
          <circle cx="90" cy="78" r={(eyeR + 1) * 0.4} fill="#FFFFFF" />
          <circle cx="86" cy="82" r={(eyeR + 1) * 0.2} fill="#FFFFFF" />

          <circle cx="112" cy="80" r={eyeR + 1} fill="#1E1B4B" />
          <circle cx="114" cy="78" r={(eyeR + 1) * 0.4} fill="#FFFFFF" />
          <circle cx="110" cy="82" r={(eyeR + 1) * 0.2} fill="#FFFFFF" />

          {/* Tiny Pink Nose & Whiskers */}
          <ellipse cx="100" cy="88" rx="3.5" ry="2.5" fill="#F43F5E" />
          <path d="M96,92 Q100,96 104,92" stroke="#451A03" strokeWidth="1.5" fill="none" />

          <line x1="68" y1="94" x2="52" y2="92" stroke="#451A03" strokeWidth="1.5" />
          <line x1="68" y1="98" x2="52" y2="100" stroke="#451A03" strokeWidth="1.5" />
          <line x1="132" y1="94" x2="148" y2="92" stroke="#451A03" strokeWidth="1.5" />
          <line x1="132" y1="98" x2="148" y2="100" stroke="#451A03" strokeWidth="1.5" />

          {/* Hands holding a golden sunflower seed */}
          <g>
            <ellipse cx="100" cy="120" rx="9" ry="14" fill="#EAB308" stroke="#713F12" strokeWidth="2" transform="rotate(15 100 120)" />
            <line x1="100" y1="108" x2="100" y2="132" stroke="#FEF08A" strokeWidth="1.5" />
            <circle cx="92" cy="124" r="5" fill="#FDE68A" stroke="#451A03" strokeWidth="1.5" />
            <circle cx="108" cy="124" r="5" fill="#FDE68A" stroke="#451A03" strokeWidth="1.5" />
          </g>
        </g>
      );

    // =========================================================================
    // GOAT / SHEEP / DEER / PILANDOK (Wool puffs / horns / velvet antlers)
    // =========================================================================
    case 'goat-sheep':
      return (
        <g id="race-goat-sheep">
          {/* Fluffy Wool Puffs or Slender Body */}
          <ellipse cx="98" cy="134" rx="42" ry="32" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />
          {/* Wool Clouds */}
          <circle cx="70" cy="125" r="14" fill={palette.secondary} opacity="0.7" />
          <circle cx="95" cy="115" r="16" fill={palette.secondary} opacity="0.7" />
          <circle cx="120" cy="125" r="14" fill={palette.secondary} opacity="0.7" />

          {/* Legs with delicate hooves */}
          <rect x="76" y="156" width="12" height="20" rx="4" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <rect x="110" y="156" width="12" height="20" rx="4" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />

          {/* Head */}
          <circle cx="116" cy="85" r="28" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />

          {/* Branching Antlers or Curved Horns */}
          <g>
            {/* Left Horn/Antler */}
            <path
              d="M102,62 C95,40 80,35 75,25 M85,38 C75,36 70,42 66,40"
              stroke="#B45309"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right Horn/Antler */}
            <path
              d="M125,62 C132,40 148,35 155,25 M140,38 C150,36 155,42 160,40"
              stroke="#B45309"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Floppy Gentle Ears */}
          <ellipse cx="88" cy="74" rx="14" ry="7" fill={palette.secondary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" transform="rotate(-20 88 74)" />
          <ellipse cx="142" cy="74" rx="14" ry="7" fill={palette.secondary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" transform="rotate(20 142 74)" />

          {/* Snout & Chin Tuft */}
          <ellipse cx="122" cy="94" rx="12" ry="9" fill={palette.belly} stroke={palette.dark || '#3A1E14'} strokeWidth="1.5" />
          <ellipse cx="123" cy="90" rx="3.5" ry="2.5" fill="#4B2C20" />
          <path d="M122,103 L122,112" stroke="#FEF08A" strokeWidth="2.5" strokeLinecap="round" />

          {/* Eyes */}
          <circle cx="108" cy="80" r={eyeR} fill="#FFFFFF" stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <circle cx="110" cy="80" r={eyeR * 0.6} fill="#78350F" />
          <circle cx="130" cy="80" r={eyeR} fill="#FFFFFF" stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <circle cx="132" cy="80" r={eyeR * 0.6} fill="#78350F" />
        </g>
      );

    // =========================================================================
    // TIGER / CHEETAH / LION / SPHINX (Majestic mane, tiger stripes, feline build)
    // =========================================================================
    case 'tiger-cheetah':
      return (
        <g id="race-tiger-cheetah">
          {/* Long Feline Tail */}
          <g className="pet-tail-anim origin-[50px_130px]">
            <path
              d="M52,130 C30,110 35,80 50,70"
              stroke={palette.primary}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
            {/* Tail Tip */}
            <circle cx="50" cy="70" r="5" fill={palette.dark || '#1C1917'} />
          </g>

          {/* Lion Mane or Athletic Body */}
          {/* Golden Lion Sunburst Mane */}
          <circle cx="118" cy="86" r="44" fill="#F59E0B" opacity="0.85" />
          <circle cx="118" cy="86" r="38" fill="#D97706" />

          {/* Body */}
          <ellipse cx="98" cy="136" rx="44" ry="34" fill={palette.primary} stroke={palette.dark || '#1C1917'} strokeWidth="3" />
          <ellipse cx="106" cy="140" rx="24" ry="18" fill={palette.belly} />

          {/* Tiger Stripes along flank */}
          <path d="M85,120 L92,130 M95,118 L102,128 M105,120 L112,130" stroke="#1C1917" strokeWidth="3" strokeLinecap="round" />

          {/* Powerful Paws */}
          <rect x="76" y="158" width="16" height="18" rx="8" fill={palette.primary} stroke={palette.dark || '#1C1917'} strokeWidth="2" />
          <rect x="110" y="158" width="16" height="18" rx="8" fill={palette.primary} stroke={palette.dark || '#1C1917'} strokeWidth="2" />

          {/* Feline Head */}
          <circle cx="118" cy="86" r="30" fill={palette.primary} stroke={palette.dark || '#1C1917'} strokeWidth="3" />

          {/* Rounded Feline Ears */}
          <circle cx="94" cy="62" r="11" fill={palette.primary} stroke={palette.dark || '#1C1917'} strokeWidth="2.5" />
          <circle cx="94" cy="62" r="6" fill="#FBCFE8" />

          <circle cx="140" cy="62" r="11" fill={palette.primary} stroke={palette.dark || '#1C1917'} strokeWidth="2.5" />
          <circle cx="140" cy="62" r="6" fill="#FBCFE8" />

          {/* Forehead Tiger Stripes */}
          <path d="M112,64 L118,72 L124,64" stroke="#1C1917" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Muzzle & Nose */}
          <ellipse cx="118" cy="95" rx="14" ry="9" fill={palette.belly} stroke={palette.dark || '#1C1917'} strokeWidth="1.5" />
          <polygon points="115,90 121,90 118,94" fill="#F43F5E" />

          {/* Fierce Eyes */}
          <circle cx="106" cy="80" r={eyeR} fill="#FEF08A" stroke="#1C1917" strokeWidth="2" />
          <ellipse cx="107" cy="80" rx="3" ry={eyeR * 0.7} fill="#1C1917" />
          <circle cx="128" cy="80" r={eyeR} fill="#FEF08A" stroke="#1C1917" strokeWidth="2" />
          <ellipse cx="129" cy="80" rx="3" ry={eyeR * 0.7} fill="#1C1917" />

          {/* Whiskers */}
          <line x1="102" y1="94" x2="84" y2="92" stroke="#1C1917" strokeWidth="1.5" />
          <line x1="102" y1="97" x2="86" y2="100" stroke="#1C1917" strokeWidth="1.5" />
          <line x1="134" y1="94" x2="152" y2="92" stroke="#1C1917" strokeWidth="1.5" />
          <line x1="134" y1="97" x2="150" y2="100" stroke="#1C1917" strokeWidth="1.5" />
        </g>
      );

    // =========================================================================
    // WOLF / FENRIR (Sharp ears, thick chest ruff, bushy frost tail)
    // =========================================================================
    case 'wolf':
      return (
        <g id="race-wolf">
          {/* Bushy Wolf Tail */}
          <g className="pet-tail-anim origin-[50px_130px]">
            <path
              d="M52,132 C30,120 20,95 35,75 C45,65 52,90 56,115 Z"
              fill={palette.secondary || '#475569'}
              stroke={palette.dark || '#0F172A'}
              strokeWidth="2.5"
            />
          </g>

          {/* Body with Neck Ruff */}
          <ellipse cx="98" cy="136" rx="44" ry="34" fill={palette.primary || '#64748B'} stroke={palette.dark || '#0F172A'} strokeWidth="3" />
          {/* Jagged Fur Ruff on Chest */}
          <path
            d="M85,120 L75,130 L88,136 L78,146 L95,148 L90,160 L115,148 Z"
            fill={palette.belly || '#E2E8F0'}
          />

          {/* Muscular Paws */}
          <rect x="76" y="158" width="16" height="20" rx="6" fill={palette.primary || '#64748B'} stroke={palette.dark || '#0F172A'} strokeWidth="2.5" />
          <rect x="110" y="158" width="16" height="20" rx="6" fill={palette.primary || '#64748B'} stroke={palette.dark || '#0F172A'} strokeWidth="2.5" />

          {/* Wolf Head with Sharp Muzzle */}
          <circle cx="118" cy="86" r="30" fill={palette.primary || '#64748B'} stroke={palette.dark || '#0F172A'} strokeWidth="3" />

          {/* Sharp Pointed Predatory Wolf Ears */}
          <polygon points="90,68 82,36 104,56" fill={palette.secondary || '#334155'} stroke={palette.dark || '#0F172A'} strokeWidth="2.5" />
          <polygon points="135,68 148,36 126,56" fill={palette.secondary || '#334155'} stroke={palette.dark || '#0F172A'} strokeWidth="2.5" />

          {/* Wolf Snout */}
          <polygon points="112,88 136,88 128,102 118,102" fill={palette.belly || '#E2E8F0'} stroke={palette.dark || '#0F172A'} strokeWidth="2" />
          <polygon points="120,98 126,98 123,102" fill="#0F172A" />

          {/* Intense Predator Eyes */}
          <circle cx="108" cy="78" r={eyeR} fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
          <circle cx="109" cy="78" r={eyeR * 0.5} fill="#0F172A" />
          <circle cx="128" cy="78" r={eyeR} fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
          <circle cx="129" cy="78" r={eyeR * 0.5} fill="#0F172A" />
        </g>
      );

    // =========================================================================
    // BEAR / PANDA / KOALA / MUSANG (Round ears, stout body, eye patches)
    // =========================================================================
    case 'bear-panda':
      return (
        <g id="race-bear-panda">
          {/* Short Stubby Tail */}
          <circle cx="56" cy="132" r="9" fill={palette.secondary || '#1E293B'} stroke={palette.dark || '#0F172A'} strokeWidth="2" />

          {/* Stout Bear Body */}
          <ellipse cx="98" cy="135" rx="46" ry="36" fill={palette.primary || '#F8FAFC'} stroke={palette.dark || '#0F172A'} strokeWidth="3" />
          <ellipse cx="104" cy="140" rx="26" ry="20" fill={palette.belly || '#E2E8F0'} />

          {/* Heavy Bear Paws */}
          <rect x="74" y="158" width="18" height="18" rx="9" fill={palette.secondary || '#0F172A'} stroke={palette.dark || '#0F172A'} strokeWidth="2.5" />
          <rect x="112" y="158" width="18" height="18" rx="9" fill={palette.secondary || '#0F172A'} stroke={palette.dark || '#0F172A'} strokeWidth="2.5" />

          {/* Large Round Bear Head */}
          <circle cx="116" cy="86" r="34" fill={palette.primary || '#F8FAFC'} stroke={palette.dark || '#0F172A'} strokeWidth="3" />

          {/* Round Teddy-Bear Ears */}
          <circle cx="90" cy="58" r="14" fill={palette.secondary || '#0F172A'} stroke={palette.dark || '#0F172A'} strokeWidth="2.5" />
          <circle cx="90" cy="58" r="7" fill="#FBCFE8" />

          <circle cx="142" cy="58" r="14" fill={palette.secondary || '#0F172A'} stroke={palette.dark || '#0F172A'} strokeWidth="2.5" />
          <circle cx="142" cy="58" r="7" fill="#FBCFE8" />

          {/* Iconic Panda Dark Eye Patches */}
          <ellipse cx="104" cy="82" rx="10" ry="13" fill={palette.secondary || '#0F172A'} transform="rotate(-15 104 82)" />
          <ellipse cx="128" cy="82" rx="10" ry="13" fill={palette.secondary || '#0F172A'} transform="rotate(15 128 82)" />

          {/* Bear Eyes inside patches */}
          <circle cx="104" cy="82" r={eyeR * 0.75} fill="#FFFFFF" />
          <circle cx="105" cy="82" r={eyeR * 0.45} fill="#0F172A" />

          <circle cx="128" cy="82" r={eyeR * 0.75} fill="#FFFFFF" />
          <circle cx="129" cy="82" r={eyeR * 0.45} fill="#0F172A" />

          {/* Bear Snout & Nose */}
          <ellipse cx="116" cy="98" rx="14" ry="10" fill="#E2E8F0" stroke="#0F172A" strokeWidth="2" />
          <ellipse cx="116" cy="94" rx="5" ry="3.5" fill="#0F172A" />
        </g>
      );

    // =========================================================================
    // BAT / KAGWANG (Leathery wing membranes, pointed bat ears)
    // =========================================================================
    case 'bat':
      return (
        <g id="race-bat">
          {/* Spread Leathery Wing Membranes */}
          <g className="pet-wing-anim origin-[100px_110px]">
            {/* Left Wing */}
            <path
              d="M80,105 C50,75 25,60 15,80 C28,100 45,115 55,130 C65,115 75,110 80,105 Z"
              fill={palette.secondary || '#312E81'}
              stroke="#1E1B4B"
              strokeWidth="2.5"
            />
            {/* Wing Struts */}
            <path d="M15,80 Q50,95 78,110" stroke="#818CF8" strokeWidth="1.5" fill="none" />

            {/* Right Wing */}
            <path
              d="M120,105 C150,75 175,60 185,80 C172,100 155,115 145,130 C135,115 125,110 120,105 Z"
              fill={palette.secondary || '#312E81'}
              stroke="#1E1B4B"
              strokeWidth="2.5"
            />
            {/* Wing Struts */}
            <path d="M185,80 Q150,95 122,110" stroke="#818CF8" strokeWidth="1.5" fill="none" />
          </g>

          {/* Bat Body */}
          <ellipse cx="100" cy="120" rx="24" ry="28" fill={palette.primary || '#4338CA'} stroke="#1E1B4B" strokeWidth="3" />

          {/* Bat Head */}
          <circle cx="100" cy="85" r="22" fill={palette.primary || '#4338CA'} stroke="#1E1B4B" strokeWidth="2.5" />

          {/* Tall Pointed Bat Ears */}
          <polygon points="85,75 75,40 95,65" fill={palette.secondary || '#312E81'} stroke="#1E1B4B" strokeWidth="2" />
          <polygon points="115,75 125,40 105,65" fill={palette.secondary || '#312E81'} stroke="#1E1B4B" strokeWidth="2" />

          {/* Big Night-Vision Eyes */}
          <circle cx="92" cy="82" r={eyeR + 1} fill="#FEF08A" stroke="#1E1B4B" strokeWidth="1.5" />
          <circle cx="92" cy="82" r={(eyeR + 1) * 0.6} fill="#0F172A" />

          <circle cx="108" cy="82" r={eyeR + 1} fill="#FEF08A" stroke="#1E1B4B" strokeWidth="1.5" />
          <circle cx="108" cy="82" r={(eyeR + 1) * 0.6} fill="#0F172A" />

          {/* Cute Fangs */}
          <polygon points="96,94 98,99 100,94" fill="#FFFFFF" />
          <polygon points="100,94 102,99 104,94" fill="#FFFFFF" />
        </g>
      );

    // =========================================================================
    // BEAST-TITAN / RHINO / MAMMOTH / KANGAROO (Heavy horns, tusks, jumping paws)
    // =========================================================================
    default:
      return (
        <g id="race-beast-titan">
          {/* Sturdy Body */}
          <ellipse cx="98" cy="136" rx="48" ry="36" fill={palette.primary} stroke={palette.dark || '#1C1917'} strokeWidth="3" />
          <ellipse cx="104" cy="140" rx="26" ry="22" fill={palette.belly} />

          {/* Armored Heavy Feet */}
          <rect x="72" y="158" width="18" height="20" rx="6" fill={palette.secondary} stroke={palette.dark || '#1C1917'} strokeWidth="2.5" />
          <rect x="112" y="158" width="18" height="20" rx="6" fill={palette.secondary} stroke={palette.dark || '#1C1917'} strokeWidth="2.5" />

          {/* Titan Head */}
          <circle cx="118" cy="86" r="32" fill={palette.primary} stroke={palette.dark || '#1C1917'} strokeWidth="3" />

          {/* Giant Curved Ivory Tusks / Sturdy Horn */}
          <path
            d="M135,96 Q165,100 160,70"
            stroke="#FEF08A"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M125,102 Q150,110 152,85"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />

          {/* Eyes */}
          <circle cx="112" cy="80" r={eyeR} fill="#FEF08A" stroke={palette.dark || '#1C1917'} strokeWidth="2" />
          <circle cx="113" cy="80" r={eyeR * 0.55} fill="#1C1917" />
        </g>
      );
  }
};
