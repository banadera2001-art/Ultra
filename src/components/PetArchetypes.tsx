import React from 'react';
import { BirdAndAmphibianSvg } from './petRaces/BirdAndAmphibianSvg';
import { MammalAndWildSvg } from './petRaces/MammalAndWildSvg';
import { AquaticAndInsectSvg } from './petRaces/AquaticAndInsectSvg';
import { PetUniqueFeatures } from './petRaces/PetUniqueFeatures';

export type PetRace =
  | 'winged-horse'
  | 'horse'
  | 'unicorn'
  | 'dog'
  | 'cat'
  | 'tiger-cheetah'
  | 'bunny'
  | 'bird-sarimanok'
  | 'bird-adarna'
  | 'bird-phoenix'
  | 'bird-eagle'
  | 'bird-cute'
  | 'bird-chick'
  | 'bird-duck'
  | 'peacock'
  | 'owl'
  | 'bovine'
  | 'goat-sheep'
  | 'turtle'
  | 'fish'
  | 'shark-whale'
  | 'marine-mammal'
  | 'octopus-kraken'
  | 'crustacean'
  | 'bear-panda'
  | 'monkey-tarsier'
  | 'dragon'
  | 'insect'
  | 'wolf'
  | 'reptile'
  | 'frog'
  | 'pig'
  | 'hamster'
  | 'bat'
  | 'beast-titan';

export interface PetColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  belly: string;
  iris: string;
  glow: string;
  dark?: string;
}

/**
 * Classifies any pet into its authentic animal race based on its emoji,
 * tagalog name, english name, or pet id.
 */
export function classifyPetRace(pet: {
  emoji?: string;
  name?: string;
  nameTagalog?: string;
  id?: string;
}): PetRace {
  const emoji = pet.emoji || '';
  const text = `${pet.nameTagalog || ''} ${pet.name || ''} ${pet.id || ''}`.toLowerCase();

  // 1. Winged Pegasus / Kabayong may pakpak (Explicit user example)
  if (
    text.includes('pakpak') ||
    text.includes('pegasus') ||
    (emoji === '🐴' && (text.includes('winged') || text.includes('lipad')))
  ) {
    return 'winged-horse';
  }

  // 2. Celestial Unicorn / Kirin
  if (emoji === '🦄' || text.includes('unicorn') || text.includes('kirin')) {
    return 'unicorn';
  }

  // 3. Other Horses / Tikbalang
  if (emoji === '🐴' || text.includes('kabayo') || text.includes('tikbalang') || text.includes('pony')) {
    return 'horse';
  }

  // 4. Mythical Birds (Sarimanok, Adarna, Phoenix, Minokawa)
  if (text.includes('sarimanok')) return 'bird-sarimanok';
  if (text.includes('adarna')) return 'bird-adarna';
  if (text.includes('phoenix') || text.includes('bulalakaw') || (emoji === '🦅' && text.includes('apoy'))) {
    return 'bird-phoenix';
  }

  // 5. Baby Chick / Munting Sisiw (Dedicated round chick design, NOT a rat!)
  if (emoji === '🐥' || text.includes('sisiw') || text.includes('chick')) {
    return 'bird-chick';
  }

  // 6. Duckling / Pato / Bibe / Gansa (Dedicated duck with bill & webbed feet)
  if (
    emoji === '🦆' ||
    emoji === '🪿' ||
    text.includes('pato') ||
    text.includes('bibe') ||
    text.includes('duck') ||
    text.includes('gansa')
  ) {
    return 'bird-duck';
  }

  // 7. Tree Frog / Palaka (Dedicated frog with bulging eyes & suction toes)
  if (emoji === '🐸' || text.includes('palaka') || text.includes('frog') || text.includes('salamander')) {
    return 'frog';
  }

  // 8. Peacock / Paboreal (Magnificent 5-eyed iridescent tail fan)
  if (emoji === '🦚' || text.includes('paboreal') || text.includes('peacock')) {
    return 'peacock';
  }

  // 9. Hamster / Bubwit (Puffed rosy cheek pouches & sunflower seed)
  if (emoji === '🐹' || text.includes('hamster') || text.includes('bubwit')) {
    return 'hamster';
  }

  // 10. Bat / Paniki / Kagwang (Wing membranes & pointed ears)
  if (emoji === '🦇' || text.includes('paniki') || text.includes('bat') || text.includes('kagwang')) {
    return 'bat';
  }

  // 11. Owls
  if (emoji === '🦉' || text.includes('kwago') || text.includes('owl')) {
    return 'owl';
  }

  // 12. Eagles & Raptors
  if (
    emoji === '🦅' ||
    text.includes('agila') ||
    text.includes('eagle') ||
    text.includes('haribon') ||
    text.includes('falcon') ||
    text.includes('hawk') ||
    text.includes('buwitre') ||
    text.includes('minokawa') ||
    text.includes('manaul') ||
    text.includes('pah')
  ) {
    return 'bird-eagle';
  }

  // 13. Cute Birds (Dove, Flamingo, Cockatoo, Crane)
  if (
    emoji === '🕊️' ||
    emoji === '🦜' ||
    emoji === '🦩' ||
    emoji === '🦤' ||
    text.includes('kalapati') ||
    text.includes('flamingo') ||
    text.includes('katala') ||
    text.includes('tipol')
  ) {
    return 'bird-cute';
  }

  // 8. Dogs & Hounds
  if (
    emoji === '🐶' ||
    emoji === '🐕' ||
    text.includes('tuta') ||
    text.includes('aspin') ||
    text.includes('puppy') ||
    text.includes('cerberus')
  ) {
    return 'dog';
  }

  // 9. Wolves
  if (emoji === '🐺' || text.includes('lobo') || text.includes('wolf') || text.includes('fenrir')) {
    return 'wolf';
  }

  // 10. Cats
  if (emoji === '🐱' || emoji === '🐈' || text.includes('kuting') || text.includes('muning') || text.includes('cat')) {
    return 'cat';
  }

  // 11. Big Felines (Tiger, Cheetah, Lion)
  if (
    emoji === '🐯' ||
    emoji === '🐅' ||
    emoji === '🐆' ||
    emoji === '🦁' ||
    text.includes('tigre') ||
    text.includes('tiger') ||
    text.includes('cheetah') ||
    text.includes('leon') ||
    text.includes('lion') ||
    text.includes('sphinx')
  ) {
    return 'tiger-cheetah';
  }

  // 12. Bunny / Rabbits
  if (emoji === '🐰' || text.includes('kuneho') || text.includes('bunny') || text.includes('hare')) {
    return 'bunny';
  }

  // 13. Turtles & Sea Turtles
  if (emoji === '🐢' || text.includes('pagong') || text.includes('pawikan') || text.includes('turtle')) {
    return 'turtle';
  }

  // 14. Sharks, Whale Sharks & Whales
  if (
    emoji === '🦈' ||
    emoji === '🐳' ||
    text.includes('butanding') ||
    text.includes('pating') ||
    text.includes('shark') ||
    text.includes('balyena') ||
    text.includes('whale')
  ) {
    return 'shark-whale';
  }

  // 15. Other Aquatic Marine (Dolphin, Dugong, Otter)
  if (
    emoji === '🐬' ||
    emoji === '🐋' ||
    emoji === '🦦' ||
    text.includes('lumba-lumba') ||
    text.includes('dolphin') ||
    text.includes('dugong') ||
    text.includes('otter')
  ) {
    return 'marine-mammal';
  }

  // 16. Fish
  if (emoji === '🐟' || text.includes('isda') || text.includes('goldfish')) {
    return 'fish';
  }

  // 17. Octopus & Kraken
  if (emoji === '🐙' || text.includes('kraken') || text.includes('kurita') || text.includes('pugita')) {
    return 'octopus-kraken';
  }

  // 18. Crustaceans (Crab, Shrimp, Scorpion)
  if (
    emoji === '🦀' ||
    emoji === '🦐' ||
    emoji === '🦂' ||
    text.includes('talangka') ||
    text.includes('crab') ||
    text.includes('hipon') ||
    text.includes('shrimp') ||
    text.includes('mantis') ||
    text.includes('alakdan') ||
    text.includes('scorpion')
  ) {
    return 'crustacean';
  }

  // 19. Bovine (Tamaraw, Carabao, Cow, Calf)
  if (
    emoji === '🐃' ||
    emoji === '🐮' ||
    text.includes('tamaraw') ||
    text.includes('kalabaw') ||
    text.includes('baka') ||
    text.includes('calf')
  ) {
    return 'bovine';
  }

  // 20. Caprine & Ovine (Goat, Lamb, Sheep, Deer)
  if (
    emoji === '🐐' ||
    emoji === '🐑' ||
    emoji === '🦌' ||
    text.includes('kambing') ||
    text.includes('goat') ||
    text.includes('tupa') ||
    text.includes('lamb') ||
    text.includes('usa') ||
    text.includes('deer') ||
    text.includes('pilandok')
  ) {
    return 'goat-sheep';
  }

  // 21. Bears & Pandas
  if (
    emoji === '🐻' ||
    emoji === '🐼' ||
    emoji === '🐨' ||
    text.includes('oso') ||
    text.includes('bear') ||
    text.includes('panda') ||
    text.includes('koala')
  ) {
    return 'bear-panda';
  }

  // 22. Primates & Tarsier
  if (
    emoji === '🐒' ||
    emoji === '🦍' ||
    text.includes('tarsier') ||
    text.includes('matsing') ||
    text.includes('monkey') ||
    text.includes('gorilla') ||
    text.includes('ape')
  ) {
    return 'monkey-tarsier';
  }

  // 23. Dragons & Serpents (Bakunawa, Bathala Sky Dragon)
  if (
    emoji === '🐉' ||
    emoji === '🐲' ||
    text.includes('dragon') ||
    text.includes('bakunawa') ||
    text.includes('bathala') ||
    text.includes('leviathan')
  ) {
    return 'dragon';
  }

  // 24. Insects (Bee, Butterfly)
  if (
    emoji === '🐝' ||
    emoji === '🦋' ||
    text.includes('bubuyog') ||
    text.includes('bee') ||
    text.includes('paruparo') ||
    text.includes('butterfly')
  ) {
    return 'insect';
  }

  // 25. Pigs & Boars
  if (
    emoji === '🐷' ||
    emoji === '🐗' ||
    text.includes('biik') ||
    text.includes('pig') ||
    text.includes('baboy') ||
    text.includes('boar') ||
    text.includes('tandayag')
  ) {
    return 'pig';
  }

  // 26. Titans & Megafauna (Rhino, Mammoth, Kangaroo, Tarabusaw)
  if (
    text.includes('rhino') ||
    text.includes('mammoth') ||
    text.includes('kangaroo') ||
    text.includes('tarabusaw')
  ) {
    return 'beast-titan';
  }

  // 27. Reptiles & Amphibians (Frog, Gecko, Crocodile, Snake, Snail)
  if (
    emoji === '🐸' ||
    emoji === '🦎' ||
    emoji === '🐊' ||
    emoji === '🐍' ||
    emoji === '🐌' ||
    text.includes('palaka') ||
    text.includes('frog') ||
    text.includes('tuko') ||
    text.includes('gecko') ||
    text.includes('buwaya') ||
    text.includes('crocodile') ||
    text.includes('ahas') ||
    text.includes('cobra') ||
    text.includes('serpyente') ||
    text.includes('suso') ||
    text.includes('snail')
  ) {
    return 'reptile';
  }

  return 'dog';
}

interface PetRaceSvgProps {
  race: PetRace;
  palette: PetColorPalette;
  stage: 'Baby' | 'Teen' | 'Adult';
  facing: 'left' | 'right';
  isAttacking?: boolean;
  petId?: string;
  nameTagalog?: string;
}

/**
 * High-performance vector anatomy renderer that creates distinct race designs:
 * - Winged Horse has majestic horse anatomy with large feathered wings!
 * - Dog has floppy/perky ears, snout, wagging tail!
 * - Cat has whiskers, triangular ears!
 * - Birds have distinct beaks, plumage, crests!
 * - Sarimanok has Maranao rainbow crest and fish in beak!
 * - Tamaraw has iconic V-shaped horns!
 * - Tarsier has gigantic curious eyes!
 */
export const PetRaceSvg: React.FC<PetRaceSvgProps> = ({
  race,
  palette,
  stage,
  isAttacking = false,
  petId,
  nameTagalog,
}) => {
  const isAdult = stage === 'Adult';
  const isTeen = stage === 'Teen';
  const isBaby = stage === 'Baby';

  // Base eye positions
  const eyeR = isBaby ? 9.5 : isTeen ? 8 : 7;

  const renderRaceGeometry = () => {
    switch (race) {
      // Specialized Avian and Amphibian Races (Chick, Duck, Frog, Peacock)
      case 'bird-chick':
      case 'bird-duck':
      case 'frog':
      case 'peacock':
        return <BirdAndAmphibianSvg race={race} palette={palette} stage={stage} eyeR={eyeR} />;

      // Specialized Mammals and Titans (Pig, Hamster, Goat/Sheep/Deer, Tiger, Wolf, Bear, Bat, Titan)
      case 'pig':
      case 'hamster':
      case 'goat-sheep':
      case 'tiger-cheetah':
      case 'wolf':
      case 'bear-panda':
      case 'bat':
      case 'beast-titan':
        return <MammalAndWildSvg race={race} palette={palette} stage={stage} eyeR={eyeR} />;

      // Aquatic and Insects (Fish, Marine Mammal, Insect, Reptile)
      case 'fish':
      case 'marine-mammal':
      case 'insect':
      case 'reptile':
        return <AquaticAndInsectSvg race={race} palette={palette} stage={stage} eyeR={eyeR} />;

      // =========================================================================
      // 1. WINGED HORSE / KABAYONG MAY PAKPAK (HORSE WITH WINGS!)
      // =========================================================================
    case 'winged-horse':
      return (
        <g id="race-winged-horse">
          {/* Back Pegasus Wing (Animated) */}
          <g className="pet-wing-anim origin-[80px_100px]">
            <path
              d="M75,95 C45,60 20,25 45,15 C65,7 80,38 75,58 C90,32 110,48 90,80 C108,60 120,78 85,100 Z"
              fill={palette.secondary}
              stroke={palette.dark || '#3A1E14'}
              strokeWidth="2.5"
              opacity="0.9"
            />
            {/* Wing Feather Ribs */}
            <path d="M50,30 Q70,55 78,85" stroke="#FFFFFF" strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M75,45 Q88,68 85,90" stroke="#FFFFFF" strokeWidth="2" fill="none" opacity="0.6" />
          </g>

          {/* Horse Tail */}
          <g className="pet-tail-anim origin-[50px_130px]">
            <path
              d="M50,130 C30,140 20,165 30,185 C40,175 42,155 52,145 C40,160 38,185 48,195 C55,180 58,160 55,135 Z"
              fill={palette.secondary}
              stroke={palette.dark || '#3A1E14'}
              strokeWidth="2"
            />
          </g>

          {/* Horse Body & Stately Chest */}
          <ellipse
            cx="95"
            cy="135"
            rx={isAdult ? '52' : isTeen ? '46' : '40'}
            ry={isAdult ? '38' : isTeen ? '34' : '30'}
            fill={palette.primary}
            stroke={palette.dark || '#3A1E14'}
            strokeWidth="3"
          />

          {/* Horse Legs & Hooves */}
          <rect x="65" y="155" width="14" height="28" rx="6" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2.5" />
          <rect x="65" y="177" width="14" height="8" rx="2" fill="#292524" />

          <rect x="115" y="155" width="14" height="28" rx="6" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2.5" />
          <rect x="115" y="177" width="14" height="8" rx="2" fill="#292524" />

          {/* Horse Neck & Head */}
          <path
            d="M95,115 L125,75 C135,70 148,72 155,85 C162,98 152,118 135,120 L110,135 Z"
            fill={palette.primary}
            stroke={palette.dark || '#3A1E14'}
            strokeWidth="3"
          />

          {/* Horse Snout / Muzzle */}
          <ellipse cx="152" cy="92" rx="18" ry="14" fill={palette.belly} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          {/* Nostril */}
          <circle cx="160" cy="90" r="2.5" fill="#4B2C20" />

          {/* Horse Ears */}
          <g className="pet-ear-anim origin-[125px_65px]">
            <polygon points="120,72 126,45 136,70" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
            <polygon points="123,68 126,50 133,68" fill={palette.belly} />

            <polygon points="134,70 142,42 148,68" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
            <polygon points="137,66 142,48 145,66" fill={palette.belly} />
          </g>

          {/* Horse Mane (Flowing hair) */}
          <path
            d="M118,65 C108,72 105,95 112,115 C105,100 100,82 112,70 C102,78 98,92 105,105"
            stroke={palette.accent}
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Eye */}
          <circle cx="138" cy="80" r={eyeR} fill="#FFFFFF" stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <circle cx="140" cy="80" r={eyeR * 0.65} fill={palette.iris} />
          <circle cx="141" cy="78" r={eyeR * 0.28} fill="#FFFFFF" />

          {/* Front Pegasus Wing (Large & Glorious Feathered Wing) */}
          <g className="pet-wing-anim origin-[95px_115px]">
            <path
              d="M95,115 C60,70 35,30 65,18 C90,8 108,45 100,70 C120,40 145,55 120,95 C142,72 155,95 110,122 Z"
              fill={palette.accent}
              stroke={palette.dark || '#3A1E14'}
              strokeWidth="3"
            />
            {/* Wing Feather Highlights */}
            <path d="M72,32 Q95,65 105,100" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.75" />
            <path d="M102,52 Q120,78 116,108" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.75" />
            <path d="M125,72 Q136,92 122,115" stroke="#FFFFFF" strokeWidth="2" fill="none" opacity="0.75" />
          </g>
        </g>
      );

    // =========================================================================
    // 2. CELESTIAL UNICORN
    // =========================================================================
    case 'unicorn':
      return (
        <g id="race-unicorn">
          {/* Horse Tail */}
          <g className="pet-tail-anim origin-[50px_130px]">
            <path
              d="M50,130 C25,145 15,175 30,195 C42,175 45,155 55,140 Z"
              fill={palette.accent}
              stroke={palette.dark || '#3A1E14'}
              strokeWidth="2"
            />
          </g>

          {/* Body */}
          <ellipse cx="95" cy="135" rx="46" ry="34" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />
          {/* Legs */}
          <rect x="68" y="155" width="13" height="26" rx="5" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <rect x="68" y="175" width="13" height="7" rx="2" fill="#F59E0B" />
          <rect x="112" y="155" width="13" height="26" rx="5" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <rect x="112" y="175" width="13" height="7" rx="2" fill="#F59E0B" />

          {/* Head & Neck */}
          <path d="M95,115 L125,75 C135,70 148,72 155,85 C162,98 152,118 135,120 L110,135 Z" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />
          <ellipse cx="152" cy="92" rx="16" ry="12" fill={palette.belly} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />

          {/* Ears */}
          <polygon points="122,70 128,45 137,68" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />

          {/* MAGICAL SPIRAL HORN (ALICORN) */}
          <polygon points="135,68 152,20 146,65" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
          <line x1="139" y1="58" x2="147" y2="52" stroke="#FEF3C7" strokeWidth="2" />
          <line x1="142" y1="46" x2="149" y2="40" stroke="#FEF3C7" strokeWidth="2" />
          <line x1="146" y1="34" x2="151" y2="28" stroke="#FEF3C7" strokeWidth="2" />

          {/* Eye */}
          <circle cx="138" cy="80" r={eyeR} fill="#FFFFFF" stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <circle cx="140" cy="80" r={eyeR * 0.65} fill="#8B5CF6" />
          <circle cx="141" cy="78" r={eyeR * 0.28} fill="#FFFFFF" />

          {/* Celestial Rainbow/Golden Mane */}
          <path d="M120,65 C108,72 105,95 112,120" stroke="#EC4899" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M116,68 C104,76 101,98 108,125" stroke="#3B82F6" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      );

    // =========================================================================
    // 3. HORSE / PONY / TIKBALANG
    // =========================================================================
    case 'horse':
      return (
        <g id="race-horse">
          {/* Horse Tail */}
          <g className="pet-tail-anim origin-[50px_130px]">
            <path
              d="M50,130 C30,140 20,165 30,185 C40,175 42,155 52,145 C40,160 38,185 48,195 C55,180 58,160 55,135 Z"
              fill={palette.secondary}
              stroke={palette.dark || '#3A1E14'}
              strokeWidth="2"
            />
          </g>

          {/* Horse Body */}
          <ellipse cx="95" cy="135" rx="46" ry="34" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />
          {/* Legs & Hooves */}
          <rect x="68" y="155" width="13" height="26" rx="5" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <rect x="68" y="175" width="13" height="7" rx="2" fill="#292524" />
          <rect x="112" y="155" width="13" height="26" rx="5" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <rect x="112" y="175" width="13" height="7" rx="2" fill="#292524" />

          {/* Horse Head & Neck */}
          <path d="M95,115 L125,75 C135,70 148,72 155,85 C162,98 152,118 135,120 L110,135 Z" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />
          <ellipse cx="152" cy="92" rx="17" ry="13" fill={palette.belly} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <circle cx="160" cy="90" r="2.5" fill="#4B2C20" />

          {/* Horse Ears */}
          <g className="pet-ear-anim origin-[125px_65px]">
            <polygon points="120,72 126,45 136,70" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
            <polygon points="134,70 142,42 148,68" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          </g>

          {/* Mane */}
          <path d="M118,65 C108,72 105,95 112,115 C105,100 100,82 112,70" stroke={palette.secondary} strokeWidth="5" strokeLinecap="round" fill="none" />

          {/* Eye */}
          <circle cx="138" cy="80" r={eyeR} fill="#FFFFFF" stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <circle cx="140" cy="80" r={eyeR * 0.65} fill={palette.iris} />
          <circle cx="141" cy="78" r={eyeR * 0.28} fill="#FFFFFF" />
        </g>
      );

    // =========================================================================
    // 4. DOG / PUPPY / ASPIN
    // =========================================================================
    case 'dog':
      return (
        <g id="race-dog">
          {/* Wagging Dog Tail */}
          <g className="pet-tail-anim origin-[55px_135px]">
            <path d="M55,135 Q30,115 45,95 Q55,105 52,130 Z" fill={palette.secondary} stroke={palette.dark || '#3A1E14'} strokeWidth="2.5" />
          </g>

          {/* Dog Body */}
          <ellipse cx="98" cy="136" rx="44" ry="34" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />
          <ellipse cx="108" cy="140" rx="24" ry="20" fill={palette.belly} />

          {/* Paws */}
          <rect x="75" y="158" width="16" height="18" rx="8" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <rect x="110" y="158" width="16" height="18" rx="8" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />

          {/* Dog Head */}
          <circle cx="118" cy="88" r="34" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />

          {/* Floppy Dog Ears */}
          <path d="M92,72 C80,68 70,85 75,108 C80,120 90,115 94,98 Z" fill={palette.secondary} stroke={palette.dark || '#3A1E14'} strokeWidth="2.5" />
          <path d="M142,72 C154,68 164,85 159,108 C154,120 144,115 140,98 Z" fill={palette.secondary} stroke={palette.dark || '#3A1E14'} strokeWidth="2.5" />

          {/* Dog Snout & Button Nose */}
          <ellipse cx="124" cy="98" rx="16" ry="12" fill={palette.belly} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <ellipse cx="126" cy="92" rx="6" ry="4.5" fill="#1C1917" />
          {/* Cute Tongue */}
          <path d="M124,103 Q124,114 130,112 Q134,103 130,103 Z" fill="#F43F5E" />

          {/* Big Puppy Eyes */}
          <circle cx="108" cy="80" r={eyeR} fill="#FFFFFF" stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <circle cx="110" cy="80" r={eyeR * 0.7} fill={palette.iris} />
          <circle cx="111" cy="78" r={eyeR * 0.3} fill="#FFFFFF" />

          <circle cx="134" cy="80" r={eyeR} fill="#FFFFFF" stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <circle cx="136" cy="80" r={eyeR * 0.7} fill={palette.iris} />
          <circle cx="137" cy="78" r={eyeR * 0.3} fill="#FFFFFF" />
        </g>
      );

    // =========================================================================
    // 5. CAT / KITTEN / MUNING
    // =========================================================================
    case 'cat':
      return (
        <g id="race-cat">
          {/* Swishing Cat Tail */}
          <g className="pet-tail-anim origin-[52px_140px]">
            <path d="M52,140 C30,145 20,115 32,95 C38,85 45,95 40,110 C35,125 45,135 52,140 Z" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2.5" />
          </g>

          {/* Cat Body */}
          <ellipse cx="98" cy="136" rx="42" ry="32" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />
          <ellipse cx="106" cy="138" rx="22" ry="18" fill={palette.belly} />

          {/* Paws */}
          <ellipse cx="82" cy="166" rx="9" ry="7" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <ellipse cx="116" cy="166" rx="9" ry="7" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />

          {/* Triangular Cat Ears */}
          <polygon points="90,75 80,45 106,62" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2.5" />
          <polygon points="90,70 85,52 102,64" fill="#FBCFE8" />

          <polygon points="132,62 152,45 144,75" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2.5" />
          <polygon points="136,64 148,52 142,70" fill="#FBCFE8" />

          {/* Cat Head */}
          <circle cx="118" cy="88" r="32" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />

          {/* Cat Nose & Mouth */}
          <polygon points="118,94 122,94 120,98" fill="#F472B6" />
          <path d="M116,98 Q120,102 124,98" fill="none" stroke="#4B2C20" strokeWidth="1.5" />

          {/* Whiskers */}
          <line x1="98" y1="94" x2="78" y2="90" stroke="#4B2C20" strokeWidth="1.5" />
          <line x1="98" y1="98" x2="76" y2="102" stroke="#4B2C20" strokeWidth="1.5" />
          <line x1="138" y1="94" x2="158" y2="90" stroke="#4B2C20" strokeWidth="1.5" />
          <line x1="138" y1="98" x2="160" y2="102" stroke="#4B2C20" strokeWidth="1.5" />

          {/* Almond Cat Eyes */}
          <ellipse cx="108" cy="82" rx={eyeR} ry={eyeR * 0.8} fill="#FFFFFF" stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <ellipse cx="109" cy="82" rx={eyeR * 0.5} ry={eyeR * 0.75} fill={palette.iris} />
          <circle cx="110" cy="80" r={eyeR * 0.25} fill="#FFFFFF" />

          <ellipse cx="128" cy="82" rx={eyeR} ry={eyeR * 0.8} fill="#FFFFFF" stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <ellipse cx="129" cy="82" rx={eyeR * 0.5} ry={eyeR * 0.75} fill={palette.iris} />
          <circle cx="130" cy="80" r={eyeR * 0.25} fill="#FFFFFF" />
        </g>
      );

    // =========================================================================
    // 6. BUNNY / KUNEHO
    // =========================================================================
    case 'bunny':
      return (
        <g id="race-bunny">
          {/* Fluffy Cotton Tail */}
          <circle cx="52" cy="144" r="14" fill="#FFFFFF" stroke={palette.dark || '#3A1E14'} strokeWidth="2" />

          {/* Long Rabbit Ears */}
          <g className="pet-ear-anim origin-[105px_70px]">
            <ellipse cx="98" cy="38" rx="10" ry="28" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2.5" transform="rotate(-10 98 38)" />
            <ellipse cx="98" cy="38" rx="6" ry="22" fill="#FCE7F3" transform="rotate(-10 98 38)" />

            <ellipse cx="128" cy="38" rx="10" ry="28" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2.5" transform="rotate(10 128 38)" />
            <ellipse cx="128" cy="38" rx="6" ry="22" fill="#FCE7F3" transform="rotate(10 128 38)" />
          </g>

          {/* Bunny Body */}
          <ellipse cx="98" cy="136" rx="42" ry="34" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />
          <ellipse cx="106" cy="138" rx="22" ry="20" fill={palette.belly} />

          {/* Large Back Hop Paws & Front Paws */}
          <ellipse cx="76" cy="166" rx="12" ry="8" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <ellipse cx="120" cy="166" rx="14" ry="9" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />

          {/* Bunny Head */}
          <circle cx="114" cy="88" r="30" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />

          {/* Pink Twitchy Nose & Buck Teeth */}
          <polygon points="112,94 116,94 114,98" fill="#F43F5E" />
          <rect x="112" y="99" width="4" height="4" fill="#FFFFFF" stroke="#4B2C20" strokeWidth="0.8" />

          {/* Whiskers */}
          <line x1="96" y1="94" x2="80" y2="92" stroke="#4B2C20" strokeWidth="1.5" />
          <line x1="96" y1="98" x2="82" y2="102" stroke="#4B2C20" strokeWidth="1.5" />
          <line x1="128" y1="94" x2="144" y2="92" stroke="#4B2C20" strokeWidth="1.5" />
          <line x1="128" y1="98" x2="142" y2="102" stroke="#4B2C20" strokeWidth="1.5" />

          {/* Big Innocent Eyes */}
          <circle cx="104" cy="82" r={eyeR} fill="#FFFFFF" stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <circle cx="106" cy="82" r={eyeR * 0.7} fill={palette.iris} />
          <circle cx="107" cy="80" r={eyeR * 0.3} fill="#FFFFFF" />

          <circle cx="124" cy="82" r={eyeR} fill="#FFFFFF" stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <circle cx="126" cy="82" r={eyeR * 0.7} fill={palette.iris} />
          <circle cx="127" cy="80" r={eyeR * 0.3} fill="#FFFFFF" />
        </g>
      );

    // =========================================================================
    // 7. SARIMANOK (MARANAO RAINBOW CREST & FISH IN BEAK!)
    // =========================================================================
    case 'bird-sarimanok':
      return (
        <g id="race-sarimanok">
          {/* Elaborate Maranao Rainbow Tail Plumes */}
          <g className="pet-tail-anim origin-[50px_130px]">
            <path d="M50,130 C20,110 5,140 25,180 C40,160 35,140 50,130 Z" fill="#E11D48" />
            <path d="M45,135 C15,125 10,165 35,195 C45,175 42,150 45,135 Z" fill="#F59E0B" />
            <path d="M40,140 C10,145 18,185 45,205 C50,185 46,160 40,140 Z" fill="#10B981" />
          </g>

          {/* Avian Body */}
          <ellipse cx="95" cy="130" rx="42" ry="32" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />

          {/* Bird Legs & Talons */}
          <line x1="85" y1="158" x2="82" y2="178" stroke="#F59E0B" strokeWidth="3" />
          <line x1="105" y1="158" x2="108" y2="178" stroke="#F59E0B" strokeWidth="3" />

          {/* Majestic Sarimanok Feathered Wing */}
          <g className="pet-wing-anim origin-[85px_110px]">
            <path d="M85,110 C50,80 35,50 65,35 C85,25 105,60 95,85 C115,65 130,85 105,115 Z" fill="#10B981" stroke="#047857" strokeWidth="2" />
            <path d="M70,55 Q90,80 98,105" stroke="#FBBF24" strokeWidth="2.5" fill="none" />
          </g>

          {/* Sarimanok Head with Golden Beak */}
          <circle cx="120" cy="85" r="26" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />

          {/* MARANAO FLORAL CROWN CREST (OKIR MOTIF) */}
          <path d="M110,62 C105,35 125,25 120,48 C125,28 142,32 132,58 Z" fill="#E11D48" stroke="#9F1239" strokeWidth="1.5" />
          <circle cx="125" cy="30" r="4" fill="#FBBF24" />

          {/* Sharp Golden Beak holding a FISH */}
          <polygon points="135,82 165,90 135,96" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
          {/* THE SARIMANOK FISH IN BEAK */}
          <g transform="translate(150, 88) rotate(15)">
            <ellipse cx="10" cy="0" rx="10" ry="5" fill="#0284C7" stroke="#0369A1" strokeWidth="1" />
            <polygon points="0,0 -6,-4 -6,4" fill="#38BDF8" />
            <circle cx="15" cy="-1" r="1.5" fill="#FFFFFF" />
          </g>

          {/* Eye */}
          <circle cx="125" cy="78" r={eyeR} fill="#FFFFFF" stroke="#4B2C20" strokeWidth="2" />
          <circle cx="127" cy="78" r={eyeR * 0.65} fill="#B45309" />
          <circle cx="128" cy="76" r={eyeR * 0.28} fill="#FFFFFF" />
        </g>
      );

    // =========================================================================
    // 8. IBONG ADARNA (7-COLOR CELESTIAL PLUMAGE)
    // =========================================================================
    case 'bird-adarna':
      return (
        <g id="race-adarna">
          {/* Seven Celestial Streaming Tail Ribbons */}
          <g className="pet-tail-anim origin-[50px_130px]">
            <path d="M50,130 C15,115 5,160 30,205" stroke="#EC4899" strokeWidth="3" fill="none" />
            <path d="M46,132 C12,125 10,175 38,215" stroke="#8B5CF6" strokeWidth="3" fill="none" />
            <path d="M42,135 C10,135 15,190 46,220" stroke="#06B6D4" strokeWidth="3" fill="none" />
            <path d="M38,138 C15,145 25,200 54,222" stroke="#10B981" strokeWidth="3" fill="none" />
            <path d="M34,142 C20,155 35,210 62,224" stroke="#F59E0B" strokeWidth="3" fill="none" />
          </g>

          {/* Body */}
          <ellipse cx="96" cy="128" rx="40" ry="30" fill="#8B5CF6" stroke="#5B21B6" strokeWidth="2.5" />

          {/* Wing */}
          <g className="pet-wing-anim origin-[85px_105px]">
            <path d="M85,105 C50,75 30,45 60,30 C80,20 100,55 90,80 C110,60 130,80 105,110 Z" fill="#06B6D4" stroke="#0891B2" strokeWidth="2" />
          </g>

          {/* Radiant Head & Golden Beak */}
          <circle cx="120" cy="84" r="25" fill="#A855F7" stroke="#6B21A8" strokeWidth="2" />
          {/* Crown */}
          <path d="M112,60 L118,35 L124,55 L132,32 L136,60 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />

          <polygon points="135,80 162,88 135,94" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />

          {/* Sparkle Eyes */}
          <circle cx="124" cy="78" r={eyeR} fill="#FFFFFF" stroke="#4B2C20" strokeWidth="2" />
          <circle cx="126" cy="78" r={eyeR * 0.65} fill="#EC4899" />
          <circle cx="127" cy="76" r={eyeR * 0.28} fill="#FFFFFF" />
        </g>
      );

    // =========================================================================
    // 9. PHILIPPINE EAGLE / RAPTOR (AGILA / HARIBON)
    // =========================================================================
    case 'bird-eagle':
      return (
        <g id="race-eagle">
          {/* Tail */}
          <g className="pet-tail-anim origin-[55px_130px]">
            <polygon points="55,130 20,165 45,175 65,140" fill={palette.secondary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          </g>

          {/* Powerful Body */}
          <ellipse cx="98" cy="132" rx="44" ry="34" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />
          <ellipse cx="108" cy="136" rx="24" ry="22" fill="#FEF3C7" />

          {/* Raptor Wings with Talon Primaries */}
          <g className="pet-wing-anim origin-[90px_110px]">
            <path d="M90,110 C55,65 30,30 65,20 C90,12 110,48 100,75 C122,48 145,65 118,102 C135,85 145,105 105,120 Z" fill={palette.secondary} stroke={palette.dark || '#3A1E14'} strokeWidth="2.5" />
          </g>

          {/* Eagle Head */}
          <circle cx="120" cy="85" r="28" fill="#F5F5F4" stroke={palette.dark || '#3A1E14'} strokeWidth="2.5" />

          {/* ICONIC HARIBON FEATHER CREST (Erect Crown of Feathers) */}
          <path d="M102,68 C90,45 102,32 115,55 C118,30 132,32 128,58 C138,40 148,45 138,65" stroke="#78350F" strokeWidth="4" fill="none" strokeLinecap="round" />

          {/* Fierce Hooked Raptor Beak */}
          <path d="M135,78 Q165,82 155,102 Q145,95 135,92 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />

          {/* Fierce Eye with Brow Ridge */}
          <path d="M115,72 Q125,70 135,75" stroke="#451A03" strokeWidth="3" fill="none" />
          <circle cx="125" cy="78" r={eyeR} fill="#FEF08A" stroke="#451A03" strokeWidth="2" />
          <circle cx="127" cy="78" r={eyeR * 0.6} fill="#000000" />
          <circle cx="128" cy="76" r={eyeR * 0.25} fill="#FFFFFF" />
        </g>
      );

    // =========================================================================
    // 10. OWLS (CONCENTRIC EYES & EAR TUFTS)
    // =========================================================================
    case 'owl':
      return (
        <g id="race-owl">
          {/* Owl Body */}
          <ellipse cx="100" cy="130" rx="44" ry="40" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />
          <ellipse cx="100" cy="136" rx="26" ry="24" fill={palette.belly} />

          {/* Owl Wings Folding on side */}
          <path d="M60,110 Q50,150 75,160 Z" fill={palette.secondary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <path d="M140,110 Q150,150 125,160 Z" fill={palette.secondary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />

          {/* Owl Head with Ear Tufts */}
          <circle cx="100" cy="85" r="32" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />

          {/* Horn / Ear Tufts */}
          <polygon points="76,65 65,38 90,56" fill={palette.secondary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <polygon points="124,65 135,38 110,56" fill={palette.secondary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />

          {/* Large Concentric Nocturnal Owl Eyes */}
          <circle cx="85" cy="82" r="14" fill="#FEF08A" stroke="#451A03" strokeWidth="2" />
          <circle cx="85" cy="82" r="8" fill="#1C1917" />
          <circle cx="87" cy="80" r="3" fill="#FFFFFF" />

          <circle cx="115" cy="82" r="14" fill="#FEF08A" stroke="#451A03" strokeWidth="2" />
          <circle cx="115" cy="82" r="8" fill="#1C1917" />
          <circle cx="117" cy="80" r="3" fill="#FFFFFF" />

          {/* Small Hooked Beak */}
          <polygon points="97,88 103,88 100,98" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
        </g>
      );

    // =========================================================================
    // 11. BOVINE / TAMARAW / CARABAO (V-SHAPED HORNS)
    // =========================================================================
    case 'bovine':
      return (
        <g id="race-bovine">
          {/* Swishing Tail */}
          <g className="pet-tail-anim origin-[50px_130px]">
            <path d="M50,130 Q30,155 45,175" stroke={palette.primary} strokeWidth="4" fill="none" />
            <circle cx="45" cy="177" r="5" fill="#1C1917" />
          </g>

          {/* Heavy Bovine Body */}
          <ellipse cx="96" cy="135" rx="48" ry="36" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />

          {/* Sturdy Hooves */}
          <rect x="68" y="156" width="14" height="24" rx="4" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <rect x="68" y="174" width="14" height="6" rx="2" fill="#1C1917" />
          <rect x="114" y="156" width="14" height="24" rx="4" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <rect x="114" y="174" width="14" height="6" rx="2" fill="#1C1917" />

          {/* Bovine Head */}
          <ellipse cx="120" cy="95" rx="30" ry="26" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />

          {/* ICONIC V-SHAPED TAMARAW HORNS */}
          <path d="M102,76 C95,45 105,25 112,15 C116,35 114,60 110,74 Z" fill="#292524" stroke="#0C0A09" strokeWidth="2" />
          <path d="M130,76 C138,45 130,25 124,15 C120,35 124,60 126,74 Z" fill="#292524" stroke="#0C0A09" strokeWidth="2" />

          {/* Bovine Ears */}
          <ellipse cx="94" cy="85" rx="14" ry="7" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" transform="rotate(-20 94 85)" />
          <ellipse cx="146" cy="85" rx="14" ry="7" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" transform="rotate(20 146 85)" />

          {/* Wide Muzzle with Nostrils */}
          <ellipse cx="125" cy="106" rx="18" ry="12" fill={palette.belly} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <circle cx="120" cy="106" r="3" fill="#1C1917" />
          <circle cx="130" cy="106" r="3" fill="#1C1917" />

          {/* Eyes */}
          <circle cx="110" cy="88" r={eyeR * 0.85} fill="#FFFFFF" stroke="#1C1917" strokeWidth="2" />
          <circle cx="111" cy="88" r={eyeR * 0.55} fill="#3B1F12" />

          <circle cx="132" cy="88" r={eyeR * 0.85} fill="#FFFFFF" stroke="#1C1917" strokeWidth="2" />
          <circle cx="133" cy="88" r={eyeR * 0.55} fill="#3B1F12" />
        </g>
      );

    // =========================================================================
    // 12. BOHOL TARSIER / PRIMATES (GIANT CURIOUS EYES)
    // =========================================================================
    case 'monkey-tarsier':
      return (
        <g id="race-tarsier">
          {/* Slender Long Tail with Bushy Tip */}
          <path d="M60,145 C35,160 25,185 45,210" stroke={palette.primary} strokeWidth="4" fill="none" strokeLinecap="round" />
          <ellipse cx="45" cy="210" rx="8" ry="5" fill={palette.secondary} />

          {/* Compact Body */}
          <ellipse cx="98" cy="138" rx="36" ry="30" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2.5" />
          <ellipse cx="102" cy="140" rx="18" ry="16" fill={palette.belly} />

          {/* Slender Long Grasping Fingers */}
          <circle cx="82" cy="165" r="5" fill={palette.accent} />
          <circle cx="116" cy="165" r="5" fill={palette.accent} />

          {/* Round Primate Head */}
          <circle cx="108" cy="88" r="32" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />

          {/* Thin Round Ears */}
          <circle cx="76" cy="82" r="16" fill={palette.secondary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <circle cx="76" cy="82" r="10" fill="#FBCFE8" />

          <circle cx="140" cy="82" r="16" fill={palette.secondary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <circle cx="140" cy="82" r="10" fill="#FBCFE8" />

          {/* GIGANTIC ICONIC TARSIER EYES (Almost Entire Face!) */}
          <circle cx="94" cy="84" r="17" fill="#FEF08A" stroke="#451A03" strokeWidth="2.5" />
          <circle cx="94" cy="84" r="11" fill="#451A03" />
          <circle cx="97" cy="81" r="4.5" fill="#FFFFFF" />

          <circle cx="124" cy="84" r="17" fill="#FEF08A" stroke="#451A03" strokeWidth="2.5" />
          <circle cx="124" cy="84" r="11" fill="#451A03" />
          <circle cx="127" cy="81" r="4.5" fill="#FFFFFF" />

          {/* Tiny Snout */}
          <circle cx="109" cy="100" r="3" fill="#F43F5E" />
          <path d="M106,104 Q109,107 112,104" stroke="#451A03" strokeWidth="1.5" fill="none" />
        </g>
      );

    // =========================================================================
    // 13. TURTLE & PAWIKAN (HEXAGONAL CARAPACE SHELL)
    // =========================================================================
    case 'turtle':
      return (
        <g id="race-turtle">
          {/* Little Tail */}
          <polygon points="55,135 40,140 55,145" fill={palette.primary} />

          {/* Flippers / Feet */}
          <ellipse cx="70" cy="162" rx="14" ry="9" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <ellipse cx="126" cy="162" rx="16" ry="9" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />

          {/* LARGE DOME TURTLE SHELL (CARAPACE) */}
          <path d="M55,145 C55,90 145,90 145,145 Z" fill={palette.secondary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />
          <rect x="52" y="142" width="96" height="8" rx="4" fill={palette.accent} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />

          {/* Shell Scute Geometric Plates */}
          <polygon points="100,105 115,115 115,135 100,140 85,135 85,115" fill={palette.primary} stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
          <line x1="100" y1="105" x2="100" y2="92" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
          <line x1="115" y1="115" x2="135" y2="110" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
          <line x1="85" y1="115" x2="65" y2="110" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />

          {/* Turtle Head poking forward */}
          <ellipse cx="145" cy="120" rx="20" ry="16" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2.5" />

          {/* Eye */}
          <circle cx="148" cy="116" r={eyeR * 0.85} fill="#FFFFFF" stroke="#4B2C20" strokeWidth="2" />
          <circle cx="150" cy="116" r={eyeR * 0.55} fill={palette.iris} />
          <circle cx="151" cy="114" r={eyeR * 0.25} fill="#FFFFFF" />
        </g>
      );

    // =========================================================================
    // 14. SHARK / BUTANDING (WHALE SHARK DORSAL FIN & SPOTS)
    // =========================================================================
    case 'shark-whale':
      return (
        <g id="race-shark-whale">
          {/* Caudal Tail Fin */}
          <g className="pet-tail-anim origin-[45px_110px]">
            <path d="M45,110 C20,80 15,65 30,65 C40,90 45,105 45,110 C45,115 40,130 30,155 C15,155 20,140 45,110 Z" fill={palette.secondary} stroke={palette.dark || '#3A1E14'} strokeWidth="2.5" />
          </g>

          {/* Torpedo Shark Body */}
          <path d="M45,110 C60,85 110,80 155,95 C175,105 170,125 145,135 C100,145 60,135 45,110 Z" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />
          <path d="M70,125 C100,135 145,135 160,118 C145,132 100,132 70,125 Z" fill={palette.belly} />

          {/* TALL DORSAL FIN */}
          <path d="M95,84 C105,45 125,50 118,84 Z" fill={palette.secondary} stroke={palette.dark || '#3A1E14'} strokeWidth="2.5" />

          {/* Pectoral Fin */}
          <path d="M110,125 C115,155 135,160 130,125 Z" fill={palette.secondary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />

          {/* White Starry Spots for Butanding / Whale Shark */}
          <circle cx="85" cy="98" r="2.5" fill="#FFFFFF" opacity="0.8" />
          <circle cx="95" cy="105" r="2.5" fill="#FFFFFF" opacity="0.8" />
          <circle cx="108" cy="96" r="2.5" fill="#FFFFFF" opacity="0.8" />
          <circle cx="120" cy="104" r="2.5" fill="#FFFFFF" opacity="0.8" />
          <circle cx="132" cy="100" r="2.5" fill="#FFFFFF" opacity="0.8" />

          {/* Eye */}
          <circle cx="152" cy="104" r={eyeR * 0.75} fill="#1C1917" />
          <circle cx="153" cy="102" r={eyeR * 0.3} fill="#FFFFFF" />
        </g>
      );

    // =========================================================================
    // 15. OCTOPUS & KRAKEN (ROUND MANTLE & WRITHING TENTACLES)
    // =========================================================================
    case 'octopus-kraken':
      return (
        <g id="race-kraken">
          {/* Bulbous Cephalopod Head Mantle */}
          <circle cx="100" cy="85" r="38" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />

          {/* Writhing Tentacles */}
          <path d="M70,115 C55,140 40,165 60,185 C70,175 68,150 78,125 Z" fill={palette.secondary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <path d="M85,120 C75,150 70,175 90,195 C98,180 92,155 95,125 Z" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <path d="M105,122 C115,150 110,180 125,195 C132,180 122,155 115,125 Z" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          <path d="M125,115 C140,140 155,165 135,185 C125,175 128,150 118,125 Z" fill={palette.secondary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />

          {/* Suction Cups */}
          <circle cx="56" cy="165" r="3" fill="#FFFFFF" />
          <circle cx="82" cy="170" r="3" fill="#FFFFFF" />
          <circle cx="118" cy="170" r="3" fill="#FFFFFF" />
          <circle cx="140" cy="165" r="3" fill="#FFFFFF" />

          {/* Large Invertebrate Eyes */}
          <circle cx="86" cy="88" r={eyeR * 1.1} fill="#FFFFFF" stroke="#1C1917" strokeWidth="2" />
          <ellipse cx="86" cy="88" rx="4" ry="7" fill="#1C1917" />
          <circle cx="88" cy="85" r="2.5" fill="#FFFFFF" />

          <circle cx="114" cy="88" r={eyeR * 1.1} fill="#FFFFFF" stroke="#1C1917" strokeWidth="2" />
          <ellipse cx="114" cy="88" rx="4" ry="7" fill="#1C1917" />
          <circle cx="116" cy="85" r="2.5" fill="#FFFFFF" />
        </g>
      );

    // =========================================================================
    // 16. CRUSTACEANS (CRAB, TALANGKA, SHRIMP - BIG PINCERS!)
    // =========================================================================
    case 'crustacean':
      return (
        <g id="race-crustacean">
          {/* Walking Legs */}
          <path d="M60,135 L40,145 L35,165" stroke={palette.secondary} strokeWidth="3" fill="none" />
          <path d="M65,145 L45,160 L40,175" stroke={palette.secondary} strokeWidth="3" fill="none" />
          <path d="M135,135 L155,145 L160,165" stroke={palette.secondary} strokeWidth="3" fill="none" />
          <path d="M130,145 L150,160 L155,175" stroke={palette.secondary} strokeWidth="3" fill="none" />

          {/* Wide Carapace Shell */}
          <ellipse cx="100" cy="135" rx="42" ry="28" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />

          {/* BIG ARTICULATED CLAWS / PINCERS */}
          <g className="pet-wing-anim origin-[65px_110px]">
            <path d="M70,120 L55,95 L40,75 C25,75 25,95 45,105 L60,125 Z" fill={palette.accent} stroke={palette.dark || '#3A1E14'} strokeWidth="2.5" />
            <path d="M40,75 C30,60 50,60 55,75 Z" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          </g>

          <g className="pet-wing-anim origin-[135px_110px]">
            <path d="M130,120 L145,95 L160,75 C175,75 175,95 155,105 L140,125 Z" fill={palette.accent} stroke={palette.dark || '#3A1E14'} strokeWidth="2.5" />
            <path d="M160,75 C170,60 150,60 145,75 Z" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="2" />
          </g>

          {/* Eyestalks */}
          <circle cx="88" cy="108" r="8" fill="#FFFFFF" stroke="#4B2C20" strokeWidth="2" />
          <circle cx="89" cy="108" r="4.5" fill="#1C1917" />
          <circle cx="90" cy="106" r="1.5" fill="#FFFFFF" />

          <circle cx="112" cy="108" r="8" fill="#FFFFFF" stroke="#4B2C20" strokeWidth="2" />
          <circle cx="113" cy="108" r="4.5" fill="#1C1917" />
          <circle cx="114" cy="106" r="1.5" fill="#FFFFFF" />
        </g>
      );

    // =========================================================================
    // 17. PHILIPPINE DRAGON (BAKUNAWA / BATHALA)
    // =========================================================================
    case 'dragon':
      return (
        <g id="race-dragon">
          {/* Serpentine Tail */}
          <g className="pet-tail-anim origin-[55px_130px]">
            <path d="M55,130 C20,125 10,165 35,190 C45,175 42,150 55,130 Z" fill={palette.secondary} stroke={palette.dark || '#3A1E14'} strokeWidth="2.5" />
          </g>

          {/* Dragon Body */}
          <ellipse cx="98" cy="132" rx="44" ry="34" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />
          <ellipse cx="106" cy="136" rx="24" ry="20" fill={palette.belly} />

          {/* Dorsal Spine Spikes */}
          <polygon points="75,98 85,85 92,100" fill="#FBBF24" />
          <polygon points="95,98 105,82 112,100" fill="#FBBF24" />
          <polygon points="115,102 125,88 132,105" fill="#FBBF24" />

          {/* Dragon Head */}
          <path d="M100,110 L125,75 C138,68 152,70 165,85 C168,98 158,115 135,118 Z" fill={palette.primary} stroke={palette.dark || '#3A1E14'} strokeWidth="3" />

          {/* Antler Dragon Horns */}
          <path d="M120,70 C110,45 95,35 90,30 C100,42 108,55 116,68" stroke="#F59E0B" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M132,68 C135,42 145,28 152,22 C146,38 140,52 136,68" stroke="#F59E0B" strokeWidth="4" fill="none" strokeLinecap="round" />

          {/* Whiskers (Dragon Barbels) */}
          <path d="M155,95 Q175,105 185,120" stroke="#FBBF24" strokeWidth="2.5" fill="none" />
          <path d="M150,98 Q165,115 175,130" stroke="#FBBF24" strokeWidth="2" fill="none" />

          {/* Dragon Eye */}
          <circle cx="138" cy="80" r={eyeR} fill="#FEF08A" stroke="#4B2C20" strokeWidth="2" />
          <polygon points="140,75 142,85 138,85" fill="#1C1917" />
        </g>
      );

    // =========================================================================
    // 18. FALLBACK ANATOMY (Wrapped with unique features)
    // =========================================================================
    default:
      return (
        <MammalAndWildSvg race={race} palette={palette} stage={stage} eyeR={eyeR} />
      );
    }
  };

  return (
    <g
      id={`pet-race-container-${race}`}
      className={isAttacking ? 'pet-attacking-pose' : ''}
    >
      {renderRaceGeometry()}
      <PetUniqueFeatures
        petId={petId}
        nameTagalog={nameTagalog}
        palette={palette}
        stage={stage}
      />
      {isAttacking && (
        <g className="pet-attack-sparks origin-[130px_90px]">
          {/* Paw / Claw / Beak Strike Flare */}
          <polygon
            points="140,85 155,75 145,90 165,95 145,100 155,115 138,105 130,120 132,100 115,95 132,90 125,75"
            fill="#FEF08A"
            stroke="#F59E0B"
            strokeWidth="1.5"
            opacity="0.9"
          />
          <circle cx="140" cy="95" r="8" fill="#FFFFFF" opacity="0.85" />
          <circle cx="140" cy="95" r="4" fill={palette.accent || '#EF4444'} />
        </g>
      )}
    </g>
  );
};
