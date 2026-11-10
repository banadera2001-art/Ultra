import React from 'react';
import { PetColorPalette } from '../PetArchetypes';

interface PetUniqueFeaturesProps {
  petId?: string;
  nameTagalog?: string;
  palette: PetColorPalette;
  stage: 'Baby' | 'Teen' | 'Adult';
}

/**
 * Renders a handcrafted, pet-unique signature accessory, marking, or gear
 * for each of the 100 pets (pet-001 to pet-100).
 * Ensures every single pet has distinct, prominent, and delightful visual features!
 */
export const PetUniqueFeatures: React.FC<PetUniqueFeaturesProps> = ({
  petId = '',
  palette,
  stage,
}) => {
  const isAdult = stage === 'Adult';
  const isTeen = stage === 'Teen';
  const scaleMod = isAdult ? 1.15 : isTeen ? 1.0 : 0.88;

  switch (petId) {
    // -------------------------------------------------------------
    // COMMON PETS (pet-001 to pet-030)
    // -------------------------------------------------------------
    case 'pet-001': // Puppy - Red Superhero Cape & Gold Star Bandana
      return (
        <g id="unique-pet-001">
          <path d="M78,110 Q60,135 68,160 Q82,145 92,125 Z" fill="#DC2626" opacity="0.85" />
          <path d="M96,116 L124,116 L110,132 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
          <polygon points="110,120 112,124 116,124 113,127 114,131 110,129 106,131 107,127 104,124 108,124" fill="#FDE047" />
        </g>
      );

    case 'pet-002': // Kitten - Pink Bell Bow Collar & Fish Charm
      return (
        <g id="unique-pet-002">
          <ellipse cx="110" cy="116" rx="14" ry="4" fill="#F472B6" />
          <circle cx="110" cy="120" r="4.5" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
          <ellipse cx="117" cy="122" rx="4" ry="2" fill="#38BDF8" />
          <line x1="88" y1="94" x2="72" y2="92" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="88" y1="98" x2="74" y2="100" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      );

    case 'pet-003': // Bunny - Four-Leaf Clover in Ear & Gold Carrot Medal
      return (
        <g id="unique-pet-003">
          <circle cx="94" cy="40" r="4" fill="#22C55E" />
          <circle cx="98" cy="38" r="4" fill="#22C55E" />
          <circle cx="98" cy="43" r="4" fill="#22C55E" />
          <circle cx="94" cy="43" r="4" fill="#22C55E" />
          <path d="M102,120 L112,126 L108,134 Z" fill="#F97316" stroke="#C2410C" strokeWidth="1" />
          <path d="M100,118 L104,116" stroke="#22C55E" strokeWidth="1.5" />
        </g>
      );

    case 'pet-004': // Duckling - White Sailor Captain Hat & Lifebuoy
      return (
        <g id="unique-pet-004">
          <ellipse cx="132" cy="56" rx="14" ry="5" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
          <rect x="125" y="48" width="14" height="8" rx="2" fill="#0284C7" />
          <circle cx="132" cy="45" r="2.5" fill="#EF4444" />
          <ellipse cx="106" cy="142" rx="22" ry="7" fill="none" stroke="#EF4444" strokeWidth="4" />
          <line x1="90" y1="142" x2="94" y2="142" stroke="#FFFFFF" strokeWidth="4" />
          <line x1="118" y1="142" x2="122" y2="142" stroke="#FFFFFF" strokeWidth="4" />
        </g>
      );

    case 'pet-005': // Chick - Cracked Golden Eggshell Crown & Green Sprout
      return (
        <g id="unique-pet-005">
          <path d="M92,60 Q108,42 124,60 L120,66 L114,60 L108,66 L102,60 L96,66 Z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" />
          <path d="M108,46 Q102,34 96,38 M108,46 Q114,34 120,38" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>
      );

    case 'pet-006': // Tree Frog - Emerald Lily-Pad Beret & Dewdrop
      return (
        <g id="unique-pet-006">
          <ellipse cx="100" cy="54" rx="24" ry="9" fill="#15803D" stroke="#14532D" strokeWidth="1.5" />
          <polygon points="100,54 108,46 100,46" fill="#166534" />
          <circle cx="110" cy="52" r="3.5" fill="#67E8F9" opacity="0.9" />
          <circle cx="109" cy="51" r="1.5" fill="#FFFFFF" />
        </g>
      );

    case 'pet-007': // Turtle - Blooming Lotus on Carapace & Golden Stamen
      return (
        <g id="unique-pet-007">
          <path d="M88,102 Q100,80 112,102" fill="#F472B6" stroke="#DB2777" strokeWidth="1.5" />
          <path d="M94,102 Q100,86 106,102" fill="#FB7185" />
          <circle cx="100" cy="98" r="4" fill="#FDE047" />
        </g>
      );

    case 'pet-008': // Hamster - Aviator Goggles & Big Striped Sunflower Seed
      return (
        <g id="unique-pet-008">
          <rect x="84" y="66" width="36" height="5" rx="2" fill="#78350F" />
          <circle cx="94" cy="68" r="7" fill="#67E8F9" stroke="#92400E" strokeWidth="2" opacity="0.85" />
          <circle cx="110" cy="68" r="7" fill="#67E8F9" stroke="#92400E" strokeWidth="2" opacity="0.85" />
          <ellipse cx="100" cy="118" rx="8" ry="12" fill="#EAB308" stroke="#854D0E" strokeWidth="1.5" />
          <line x1="100" y1="108" x2="100" y2="128" stroke="#FEF08A" strokeWidth="1.5" />
        </g>
      );

    case 'pet-009': // White Dove - Golden Olive Branch Laurel Wreath & Halo
      return (
        <g id="unique-pet-009">
          <ellipse cx="120" cy="46" rx="18" ry="6" stroke="#FDE047" strokeWidth="2" fill="none" opacity="0.85" />
          <path d="M148,84 Q162,75 168,78" stroke="#15803D" strokeWidth="2.5" fill="none" />
          <circle cx="156" cy="77" r="3" fill="#22C55E" />
          <circle cx="164" cy="76" r="3" fill="#22C55E" />
        </g>
      );

    case 'pet-010': // Piglet - Red Polka-Dot Scarf & Golden Mud Crown
      return (
        <g id="unique-pet-010">
          <ellipse cx="116" cy="120" rx="18" ry="6" fill="#EF4444" />
          <circle cx="108" cy="120" r="2" fill="#FFFFFF" />
          <circle cx="116" cy="120" r="2" fill="#FFFFFF" />
          <circle cx="124" cy="120" r="2" fill="#FFFFFF" />
          <polygon points="106,62 112,52 118,62 124,52 130,62" fill="#FACC15" stroke="#B45309" strokeWidth="1" />
        </g>
      );

    case 'pet-011': // Fluffy Lamb - Knitted Rainbow Scarf & Shepherd Bell
      return (
        <g id="unique-pet-011">
          <rect x="94" y="112" width="30" height="7" rx="3" fill="#0284C7" />
          <line x1="94" y1="114" x2="124" y2="114" stroke="#F43F5E" strokeWidth="2" />
          <line x1="94" y1="117" x2="124" y2="117" stroke="#FACC15" strokeWidth="2" />
          <circle cx="109" cy="124" r="5" fill="#EAB308" stroke="#B45309" strokeWidth="1" />
        </g>
      );

    case 'pet-012': // Baby Goat - Curved Horns with Bronze Bell & Satchel
      return (
        <g id="unique-pet-012">
          <path d="M96,56 Q86,40 76,46 M124,56 Q134,40 144,46" stroke="#D97706" strokeWidth="3" strokeLinecap="round" fill="none" />
          <rect x="108" y="114" width="16" height="4" rx="2" fill="#16A34A" />
          <ellipse cx="116" cy="122" rx="6" ry="7" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
        </g>
      );

    case 'pet-013': // Little Pony - Star Mane Clips & Braided Ribbons
      return (
        <g id="unique-pet-013">
          <polygon points="115,48 117,53 122,53 118,56 120,61 115,58 110,61 112,56 108,53 113,53" fill="#FDE047" stroke="#CA8A04" strokeWidth="1" />
          <path d="M124,65 Q136,80 130,95" stroke="#38BDF8" strokeWidth="3" fill="none" />
        </g>
      );

    case 'pet-014': // Calf - Golden Cowbell & Daisy Flower Garland
      return (
        <g id="unique-pet-014">
          <circle cx="100" cy="62" r="3.5" fill="#FFFFFF" /><circle cx="106" cy="58" r="3.5" fill="#FFFFFF" /><circle cx="112" cy="62" r="3.5" fill="#FFFFFF" />
          <circle cx="106" cy="58" r="2" fill="#FACC15" />
          <rect x="104" y="114" width="16" height="5" rx="2" fill="#78350F" />
          <path d="M108,119 L116,119 L118,129 L106,129 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
        </g>
      );

    case 'pet-015': // Goldfish - Pearl Crown & Aquamarine Floating Bubbles
      return (
        <g id="unique-pet-015">
          <polygon points="120,60 124,52 128,60 132,52 136,60" fill="#FDE047" stroke="#B45309" strokeWidth="1" />
          <circle cx="140" cy="75" r="5" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.5" opacity="0.8" />
          <circle cx="148" cy="65" r="3.5" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.5" opacity="0.8" />
        </g>
      );

    case 'pet-016': // Crab - Pirate Bicorne Hat & Treasure Doubloon
      return (
        <g id="unique-pet-016">
          <path d="M82,85 Q100,68 118,85 L100,74 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="100" cy="78" r="3.5" fill="#FDE047" />
          <circle cx="68" cy="116" r="6" fill="#FACC15" stroke="#B45309" strokeWidth="1.5" />
        </g>
      );

    case 'pet-017': // Honeybee - Royal Honey Dipper Scepter & Amber Drop
      return (
        <g id="unique-pet-017">
          <line x1="125" y1="90" x2="140" y2="75" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="142" cy="73" rx="5" ry="6" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          <path d="M100,105 C96,114 104,114 100,105 Z" fill="#F59E0B" />
        </g>
      );

    case 'pet-018': // Butterfly - Starlight Wing Jewels & Nectar Locket
      return (
        <g id="unique-pet-018">
          <circle cx="62" cy="58" r="4" fill="#FDF4FF" stroke="#C084FC" strokeWidth="1.5" />
          <circle cx="138" cy="58" r="4" fill="#FDF4FF" stroke="#C084FC" strokeWidth="1.5" />
          <circle cx="100" cy="115" r="5" fill="#F43F5E" stroke="#E11D48" strokeWidth="1" />
        </g>
      );

    case 'pet-019': // Snail - Rainbow Spiral Crystal Shell Rim & Leaf Umbrella
      return (
        <g id="unique-pet-019">
          <circle cx="100" cy="120" r="15" stroke="#F43F5E" strokeWidth="2.5" fill="none" opacity="0.75" />
          <path d="M125,95 Q145,80 155,85" stroke="#16A34A" strokeWidth="2" fill="none" />
          <ellipse cx="155" cy="83" rx="7" ry="4" fill="#22C55E" />
        </g>
      );

    case 'pet-020': // Shrimp - Chef's Toque Hat & Coral Trident
      return (
        <g id="unique-pet-020">
          <path d="M85,55 C82,45 92,42 98,46 C104,40 114,42 116,48 C120,44 128,48 126,55 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          <line x1="72" y1="120" x2="60" y2="95" stroke="#F59E0B" strokeWidth="2.5" />
          <line x1="56" y1="95" x2="64" y2="95" stroke="#F59E0B" strokeWidth="2.5" />
        </g>
      );

    case 'pet-021': // Little Owl - Graduate Mortarboard Cap & Glowing Monocle
      return (
        <g id="unique-pet-021">
          <polygon points="108,44 132,48 108,52 84,48" fill="#1E293B" />
          <rect x="98" y="52" width="20" height="7" fill="#0F172A" />
          <line x1="125" y1="50" x2="132" y2="62" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="118" cy="80" r="9" fill="none" stroke="#F59E0B" strokeWidth="2" />
        </g>
      );

    case 'pet-022': // Bear Cub - Honey Jar Backpack & Yellow Bandana
      return (
        <g id="unique-pet-022">
          <path d="M68,110 Q58,118 64,136 Q74,138 76,120 Z" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
          <ellipse cx="64" cy="116" rx="5" ry="2.5" fill="#FEF08A" />
          <path d="M96,112 L120,112 L108,124 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
        </g>
      );

    case 'pet-023': // Red Panda - Forest Ranger Beret & Bamboo Flute
      return (
        <g id="unique-pet-023">
          <ellipse cx="106" cy="54" rx="16" ry="6" fill="#15803D" stroke="#166534" strokeWidth="1.5" />
          <circle cx="116" cy="50" r="2.5" fill="#F59E0B" />
          <line x1="85" y1="122" x2="115" y2="122" stroke="#84CC16" strokeWidth="3" strokeLinecap="round" />
        </g>
      );

    case 'pet-024': // Aspin Bantay - PH Flag Tri-Color Collar & Golden Guard Star
      return (
        <g id="unique-pet-024">
          <rect x="92" y="112" width="32" height="6" rx="2" fill="#2563EB" />
          <rect x="92" y="115" width="16" height="3" fill="#DC2626" />
          <polygon points="108,118 111,124 118,124 113,128 115,134 108,130 102,134 104,128 99,124 106,124" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
        </g>
      );

    case 'pet-025': // Muning Cat - Lucky Red Collar with Gold Koban Coin
      return (
        <g id="unique-pet-025">
          <ellipse cx="110" cy="116" rx="16" ry="4" fill="#DC2626" />
          <ellipse cx="110" cy="124" rx="5" ry="7" fill="#FACC15" stroke="#B45309" strokeWidth="1.5" />
          <line x1="110" y1="120" x2="110" y2="128" stroke="#CA8A04" strokeWidth="1" />
        </g>
      );

    case 'pet-026': // Playful Monkey - Banana Leaf Crown & Rattan Sash
      return (
        <g id="unique-pet-026">
          <path d="M88,58 Q100,48 112,58 Q124,48 136,58" stroke="#FACC15" strokeWidth="4" strokeLinecap="round" fill="none" />
          <line x1="90" y1="105" x2="125" y2="140" stroke="#B45309" strokeWidth="4" strokeDasharray="3,2" />
        </g>
      );

    case 'pet-027': // Palm Civet - Bandit Eye Mask & Coffee Berry Necklace
      return (
        <g id="unique-pet-027">
          <path d="M86,76 Q108,72 130,76 Q108,82 86,76 Z" fill="#0F172A" opacity="0.8" />
          <circle cx="98" cy="116" r="3.5" fill="#DC2626" />
          <circle cx="106" cy="118" r="3.5" fill="#DC2626" />
          <circle cx="114" cy="116" r="3.5" fill="#DC2626" />
        </g>
      );

    case 'pet-028': // Fruit Bat - Steampunk Aviator Goggles & Golden Mango
      return (
        <g id="unique-pet-028">
          <circle cx="94" cy="70" r="8" fill="#FDE047" stroke="#B45309" strokeWidth="2" opacity="0.8" />
          <circle cx="112" cy="70" r="8" fill="#FDE047" stroke="#B45309" strokeWidth="2" opacity="0.8" />
          <line x1="102" y1="70" x2="104" y2="70" stroke="#78350F" strokeWidth="2" />
          <ellipse cx="103" cy="120" rx="6" ry="8" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
        </g>
      );

    case 'pet-029': // Friendly Goose - Gentleman's Crimson Bowtie & Golden Bell
      return (
        <g id="unique-pet-029">
          <polygon points="120,114 130,108 130,120 Z" fill="#DC2626" />
          <polygon points="120,114 110,108 110,120 Z" fill="#DC2626" />
          <circle cx="120" cy="114" r="3" fill="#FBBF24" />
        </g>
      );

    case 'pet-030': // House Gecko - Ninja Headband & Neon Tail Bands
      return (
        <g id="unique-pet-030">
          <rect x="88" y="70" width="36" height="5" rx="1" fill="#DC2626" />
          <rect x="100" y="69" width="12" height="7" rx="1" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
          <circle cx="55" cy="140" r="3" fill="#FACC15" />
          <circle cx="65" cy="138" r="3" fill="#FACC15" />
        </g>
      );

    // -------------------------------------------------------------
    // RARE PETS (pet-031 to pet-055)
    // -------------------------------------------------------------
    case 'pet-031': // Bohol Tarsier - Giant Night Vision Starlight Rings & Suction Pads
      return (
        <g id="unique-pet-031">
          <circle cx="92" cy="80" r="14" stroke="#FDE047" strokeWidth="2" fill="none" opacity="0.85" />
          <circle cx="118" cy="80" r="14" stroke="#FDE047" strokeWidth="2" fill="none" opacity="0.85" />
          <circle cx="80" cy="145" r="4" fill="#FDE047" />
          <circle cx="128" cy="145" r="4" fill="#FDE047" />
        </g>
      );

    case 'pet-032': // Mindoro Tamaraw - White Chevron Crest & Brass Warrior Torque
      return (
        <g id="unique-pet-032">
          <path d="M100,68 L110,80 L120,68" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <ellipse cx="110" cy="116" rx="20" ry="6" fill="none" stroke="#F59E0B" strokeWidth="3" />
        </g>
      );

    case 'pet-033': // Pilandok - Trickster Feathered Cap & Riddle Satchel
      return (
        <g id="unique-pet-033">
          <ellipse cx="106" cy="56" rx="14" ry="5" fill="#15803D" />
          <path d="M116,56 Q130,40 125,30" stroke="#DC2626" strokeWidth="2.5" fill="none" />
          <rect x="100" y="118" width="14" height="12" rx="2" fill="#78350F" stroke="#451A03" strokeWidth="1" />
        </g>
      );

    case 'pet-034': // Philippine Eagle - Haribon Shaggy Feather Crown & Sun Medallion
      return (
        <g id="unique-pet-034">
          <path d="M96,48 L86,28 M106,44 L104,22 M116,46 L124,26" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
          <circle cx="106" cy="116" r="8" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="106" cy="116" r="4" fill="#DC2626" />
        </g>
      );

    case 'pet-035': // Pawikan - Baybayin Shell Rune & Pacific Coral Garland
      return (
        <g id="unique-pet-035">
          <circle cx="100" cy="125" r="14" stroke="#FEF08A" strokeWidth="2" strokeDasharray="3,3" fill="none" />
          <path d="M96,120 Q100,116 104,120 L100,128 Z" fill="#FEF08A" />
          <circle cx="85" cy="110" r="3" fill="#FB7185" />
          <circle cx="115" cy="110" r="3" fill="#FB7185" />
        </g>
      );

    case 'pet-036': // Gentle Dugong - Tropical Seagrass Lei & Giant Pearl
      return (
        <g id="unique-pet-036">
          <ellipse cx="110" cy="115" rx="18" ry="6" fill="none" stroke="#10B981" strokeWidth="3" />
          <circle cx="110" cy="122" r="5.5" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" />
        </g>
      );

    case 'pet-037': // Visayan Warty Pig - Crimson Mohican Mane & Battle Warpaint
      return (
        <g id="unique-pet-037">
          <path d="M106,55 L106,32 L112,50 L118,36 L118,55" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" fill="none" />
          <line x1="88" y1="88" x2="98" y2="88" stroke="#DC2626" strokeWidth="2.5" />
          <line x1="122" y1="88" x2="132" y2="88" stroke="#DC2626" strokeWidth="2.5" />
        </g>
      );

    case 'pet-038': // Mindoro Croc - Bone Armor Spikes & River Reed Wrap
      return (
        <g id="unique-pet-038">
          <polygon points="85,82 89,72 93,82" fill="#FEF08A" />
          <polygon points="100,80 104,68 108,80" fill="#FEF08A" />
          <polygon points="115,82 119,72 123,82" fill="#FEF08A" />
        </g>
      );

    case 'pet-039': // Hawk Owl - Feather Raptor Crest & Moonstone Talisman
      return (
        <g id="unique-pet-039">
          <path d="M88,54 L80,36 M120,54 L128,36" stroke="#A16207" strokeWidth="3" strokeLinecap="round" />
          <circle cx="105" cy="118" r="6" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
        </g>
      );

    case 'pet-040': // Palawan Cockatoo - Electric Yellow Crest & Coconut Shaker
      return (
        <g id="unique-pet-040">
          <path d="M105,50 Q92,25 78,35 M108,46 Q108,18 102,20 M112,48 Q122,25 130,35" stroke="#FACC15" strokeWidth="4" strokeLinecap="round" fill="none" />
          <ellipse cx="70" cy="120" rx="6" ry="8" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
        </g>
      );

    case 'pet-041': // Colugo - Glider Flight Harness & Canopy Goggles
      return (
        <g id="unique-pet-041">
          <line x1="75" y1="90" x2="135" y2="90" stroke="#78350F" strokeWidth="3" />
          <circle cx="95" cy="74" r="6" fill="#67E8F9" stroke="#78350F" strokeWidth="2" opacity="0.8" />
          <circle cx="115" cy="74" r="6" fill="#67E8F9" stroke="#78350F" strokeWidth="2" opacity="0.8" />
        </g>
      );

    case 'pet-042': // Spotted Deer - Golden Antler Velvet & Forest Blossom
      return (
        <g id="unique-pet-042">
          <path d="M92,55 Q80,35 68,40 M82,42 L80,30 M120,55 Q132,35 144,40 M130,42 L132,30" stroke="#D97706" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="96" cy="55" r="4" fill="#F472B6" />
        </g>
      );

    case 'pet-043': // Irrawaddy Dolphin - Splash Water Crown & Floral Lei
      return (
        <g id="unique-pet-043">
          <path d="M110,65 Q115,50 120,62 Q125,52 130,65" stroke="#38BDF8" strokeWidth="3" fill="none" />
          <circle cx="110" cy="115" r="3" fill="#FB7185" />
          <circle cx="118" cy="118" r="3" fill="#FACC15" />
          <circle cx="126" cy="115" r="3" fill="#FB7185" />
        </g>
      );

    case 'pet-044': // Whale Shark Butanding - Donsol Starlight Constellation Grid
      return (
        <g id="unique-pet-044">
          {[
            [75, 115], [85, 120], [95, 115], [105, 120], [115, 115],
            [80, 128], [90, 132], [100, 128], [110, 132], [120, 128],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.5" fill="#FFFFFF" opacity="0.95" />
          ))}
          <ellipse cx="100" cy="100" rx="35" ry="12" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3,3" fill="none" opacity="0.7" />
        </g>
      );

    case 'pet-045': // Peacock Mantis Shrimp - Championship Golden Boxing Gloves
      return (
        <g id="unique-pet-045">
          <circle cx="70" cy="105" r="9" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
          <circle cx="130" cy="105" r="9" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
        </g>
      );

    case 'pet-046': // Nurse Shark - Red Rescue Buoy & Fin Rings
      return (
        <g id="unique-pet-046">
          <ellipse cx="105" cy="120" rx="20" ry="8" fill="none" stroke="#EF4444" strokeWidth="4" />
          <line x1="90" y1="120" x2="95" y2="120" stroke="#FFFFFF" strokeWidth="4" />
          <line x1="115" y1="120" x2="120" y2="120" stroke="#FFFFFF" strokeWidth="4" />
        </g>
      );

    case 'pet-047': // Snow Wolf - Arctic Fur Mantle & Icy Moon Talisman
      return (
        <g id="unique-pet-047">
          <path d="M85,110 Q105,124 125,110 L130,125 Q105,135 80,125 Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1" />
          <path d="M105,125 C108,120 115,122 113,130 C109,132 106,128 105,125 Z" fill="#06B6D4" />
        </g>
      );

    case 'pet-048': // White Tiger - Silver Battle Pauldron & Tiger Eye Jewel
      return (
        <g id="unique-pet-048">
          <path d="M72,100 L90,105 L82,125 Z" fill="#94A3B8" stroke="#475569" strokeWidth="1.5" />
          <circle cx="80" cy="110" r="3.5" fill="#38BDF8" />
        </g>
      );

    case 'pet-049': // Bamboo Panda - Kung-Fu Conical Hat & Green Bamboo Staff
      return (
        <g id="unique-pet-049">
          <polygon points="105,42 65,65 145,65" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
          <line x1="60" y1="90" x2="60" y2="155" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" />
        </g>
      );

    case 'pet-050': // Forest Koala - Eucalyptus Wreath & Knitted Wool Vest
      return (
        <g id="unique-pet-050">
          <circle cx="95" cy="54" r="3.5" fill="#22C55E" />
          <circle cx="105" cy="52" r="3.5" fill="#22C55E" />
          <circle cx="115" cy="54" r="3.5" fill="#22C55E" />
          <rect x="94" y="112" width="24" height="18" rx="4" fill="#0D9488" />
        </g>
      );

    case 'pet-051': // River Otter - Juggling River Pearls & Water Pendant
      return (
        <g id="unique-pet-051">
          <circle cx="75" cy="85" r="4" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
          <circle cx="105" cy="70" r="4" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
          <circle cx="135" cy="85" r="4" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
        </g>
      );

    case 'pet-052': // Jumping Kangaroo - Boxing Champion Belt & Red Gloves
      return (
        <g id="unique-pet-052">
          <rect x="90" y="125" width="30" height="7" rx="2" fill="#FACC15" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="105" cy="128" r="4.5" fill="#DC2626" />
          <circle cx="75" cy="105" r="7" fill="#DC2626" />
        </g>
      );

    case 'pet-053': // Pink Flamingo - Royal Feather Tiara & Crystal Teardrop
      return (
        <g id="unique-pet-053">
          <polygon points="120,52 125,44 130,52 135,44 140,52" fill="#FDE047" stroke="#B45309" strokeWidth="1" />
          <circle cx="125" cy="115" r="4" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
        </g>
      );

    case 'pet-054': // Sarus Crane Tipol - Crimson Crown & Dancing Ribbons
      return (
        <g id="unique-pet-054">
          <ellipse cx="125" cy="54" rx="8" ry="4" fill="#DC2626" />
          <path d="M120,110 Q145,120 160,105" stroke="#F43F5E" strokeWidth="3" fill="none" />
        </g>
      );

    case 'pet-055': // Royal Peacock - Five-Jeweled Imperial Crown & Eye Plumes
      return (
        <g id="unique-pet-055">
          <path d="M100,52 L94,36 M105,50 L105,32 M110,52 L116,36" stroke="#FACC15" strokeWidth="2.5" />
          <circle cx="94" cy="36" r="3.5" fill="#06B6D4" />
          <circle cx="105" cy="32" r="3.5" fill="#06B6D4" />
          <circle cx="116" cy="36" r="3.5" fill="#06B6D4" />
        </g>
      );

    // -------------------------------------------------------------
    // EPIC PETS (pet-056 to pet-075)
    // -------------------------------------------------------------
    case 'pet-056': // Armored Carabao - Brass Horn Plating & Golden Plow
      return (
        <g id="unique-pet-056">
          <path d="M72,72 L82,60 M148,72 L138,60" stroke="#FACC15" strokeWidth="5" strokeLinecap="round" />
          <rect x="94" y="105" width="32" height="12" rx="3" fill="#B45309" stroke="#FDE047" strokeWidth="1.5" />
        </g>
      );

    case 'pet-057': // Sun Harrier Eagle - Solar Corona Feather Helm & Sun Disk
      return (
        <g id="unique-pet-057">
          <circle cx="110" cy="55" r="18" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4,3" fill="none" />
          <circle cx="110" cy="120" r="9" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
        </g>
      );

    case 'pet-058': // Golden Lion - Fiery Sun Mane Tiara & Jeweled Paws
      return (
        <g id="unique-pet-058">
          <polygon points="95,50 102,38 110,50 118,38 125,50" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="110" cy="46" r="3" fill="#DC2626" />
        </g>
      );

    case 'pet-059': // Thunder Tiger - Lightning Whiskers & Thunderbolt Pauldron
      return (
        <g id="unique-pet-059">
          <path d="M80,95 L68,90 L76,85 M130,95 L142,90 L134,85" stroke="#FACC15" strokeWidth="3" strokeLinecap="round" fill="none" />
          <polygon points="75,115 85,115 80,125 90,125 78,140 82,128 72,128" fill="#FACC15" />
        </g>
      );

    case 'pet-060': // Lunar Shadow Wolf - Silver Crescent Forehead Diadem & Midnight Cape
      return (
        <g id="unique-pet-060">
          <path d="M105,68 C110,60 120,62 118,72 C112,74 108,70 105,68 Z" fill="#38BDF8" />
          <path d="M80,110 Q60,135 68,160" stroke="#818CF8" strokeWidth="4" fill="none" />
        </g>
      );

    case 'pet-061': // Sapphire Leviathan - Ocean Trident Crest & Whirlpool Rings
      return (
        <g id="unique-pet-061">
          <polygon points="100,60 105,45 110,60 115,48 105,40 95,48" fill="#06B6D4" stroke="#082F49" strokeWidth="1.5" />
          <ellipse cx="105" cy="130" rx="30" ry="8" stroke="#38BDF8" strokeWidth="2" strokeDasharray="5,3" fill="none" />
        </g>
      );

    case 'pet-062': // Ironhide Rhino - Triple Iron Horn Spikes & Studded Armor
      return (
        <g id="unique-pet-062">
          <polygon points="120,75 138,70 124,85" fill="#94A3B8" stroke="#334155" strokeWidth="1.5" />
          <polygon points="112,82 125,78 116,90" fill="#94A3B8" stroke="#334155" strokeWidth="1.5" />
          <rect x="85" y="110" width="30" height="15" rx="3" fill="#475569" stroke="#94A3B8" strokeWidth="1.5" />
        </g>
      );

    case 'pet-063': // Frost Mammoth - Glacial Ice Tusk Bands & Polar Hood
      return (
        <g id="unique-pet-063">
          <ellipse cx="78" cy="95" rx="5" ry="3" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
          <ellipse cx="132" cy="95" rx="5" ry="3" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
          <path d="M82,58 Q105,46 128,58" stroke="#E0F2FE" strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>
      );

    case 'pet-064': // Sunlight Cheetah - Aerodynamic Golden Goggles & Speed Wraps
      return (
        <g id="unique-pet-064">
          <rect x="86" y="70" width="38" height="5" rx="2" fill="#B45309" />
          <ellipse cx="96" cy="72" rx="7" ry="5" fill="#FDE047" stroke="#EA580C" strokeWidth="1.5" />
          <ellipse cx="114" cy="72" rx="7" ry="5" fill="#FDE047" stroke="#EA580C" strokeWidth="1.5" />
        </g>
      );

    case 'pet-065': // Winged Pegasus - Celestial Gold Wing Tips & Starry Bridle
      return (
        <g id="unique-pet-065">
          <path d="M50,75 Q40,60 48,50" stroke="#FACC15" strokeWidth="4" strokeLinecap="round" />
          <polygon points="105,62 108,68 114,68 110,72 112,77 105,74 98,77 100,72 96,68 102,68" fill="#FDE047" />
        </g>
      );

    case 'pet-066': // Thunderbird Hawk - Storm Cloud Collar & Lightning Talons
      return (
        <g id="unique-pet-066">
          <ellipse cx="110" cy="115" rx="24" ry="7" fill="#1E293B" opacity="0.8" />
          <path d="M100,115 L108,125 L104,125 L112,135" stroke="#FDE047" strokeWidth="2.5" fill="none" />
        </g>
      );

    case 'pet-067': // Emerald King Cobra - Pharaoh Golden Uraeus Crown & Eye Gem
      return (
        <g id="unique-pet-067">
          <path d="M96,62 Q105,45 114,62" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="105" cy="55" r="3" fill="#DC2626" />
        </g>
      );

    case 'pet-068': // Frost Serpent - Diamond Ice Horn & Freezing Mist Rings
      return (
        <g id="unique-pet-068">
          <polygon points="105,52 110,38 115,52 110,58" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.5" />
          <ellipse cx="105" cy="110" rx="25" ry="6" stroke="#67E8F9" strokeWidth="2" strokeDasharray="4,3" fill="none" />
        </g>
      );

    case 'pet-069': // Sun Bear Guardian - Blazing Solar Crescent & Honey Shield
      return (
        <g id="unique-pet-069">
          <path d="M95,115 Q105,128 115,115" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="70" cy="115" r="8" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
        </g>
      );

    case 'pet-070': // Mystic Mountain Ape - Monk Prayer Beads & Carved Stone Bracers
      return (
        <g id="unique-pet-070">
          <circle cx="95" cy="115" r="4.5" fill="#78350F" /><circle cx="105" cy="120" r="4.5" fill="#78350F" /><circle cx="115" cy="115" r="4.5" fill="#78350F" />
          <rect x="68" y="125" width="10" height="12" rx="2" fill="#64748B" stroke="#334155" strokeWidth="1" />
        </g>
      );

    case 'pet-071': // Deep Sea Kraken Pup - Captain Pirate Tricorn & Pearl Rings
      return (
        <g id="unique-pet-071">
          <polygon points="80,72 105,56 130,72 105,68" fill="#1E1B4B" stroke="#38BDF8" strokeWidth="1.5" />
          <circle cx="105" cy="65" r="3" fill="#FDE047" />
          <circle cx="75" cy="130" r="3.5" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1" />
        </g>
      );

    case 'pet-072': // Hammerhead Shark - Titanium Hydro Visor & Jet Fin Armor
      return (
        <g id="unique-pet-072">
          <rect x="70" y="75" width="70" height="6" rx="2" fill="#FDE047" stroke="#B45309" strokeWidth="1" />
        </g>
      );

    case 'pet-073': // Magma Salamander - Burning Lava Veins & Obsidian Spikes
      return (
        <g id="unique-pet-073">
          <polygon points="90,80 95,68 100,80" fill="#1C1917" stroke="#EA580C" strokeWidth="1.5" />
          <polygon points="105,78 110,65 115,78" fill="#1C1917" stroke="#EA580C" strokeWidth="1.5" />
          <path d="M85,110 Q105,120 125,110" stroke="#FACC15" strokeWidth="2.5" fill="none" />
        </g>
      );

    case 'pet-074': // Prismatic Falcon - 7-Color Rainbow Feather Tips & Prism Gem
      return (
        <g id="unique-pet-074">
          <polygon points="105,110 112,118 105,126 98,118" fill="#F43F5E" stroke="#FDE047" strokeWidth="1.5" />
        </g>
      );

    case 'pet-075': // Storm Vulture - Hurricane Cloud Mantle & Lightning Talons
      return (
        <g id="unique-pet-075">
          <ellipse cx="108" cy="115" rx="22" ry="7" fill="#334155" opacity="0.85" />
          <path d="M98,135 L102,145 L100,145 L104,152" stroke="#C084FC" strokeWidth="2" fill="none" />
        </g>
      );

    // -------------------------------------------------------------
    // LEGENDARY PETS (pet-076 to pet-090)
    // -------------------------------------------------------------
    case 'pet-076': // Sarimanok - Traditional Okir Gold Crest & Fish in Beak
      return (
        <g id="unique-pet-076">
          <path d="M102,48 Q108,22 120,32 Q112,38 114,48" fill="#FACC15" stroke="#B45309" strokeWidth="1.5" />
          <ellipse cx="145" cy="85" rx="7" ry="3.5" fill="#F59E0B" stroke="#CA8A04" strokeWidth="1" />
        </g>
      );

    case 'pet-077': // Ibong Adarna - Seven-Jeweled Celestial Crown & Symphony Notes
      return (
        <g id="unique-pet-077">
          <polygon points="105,48 110,36 115,48 120,38 125,48" fill="#FDE047" stroke="#7C3AED" strokeWidth="1.5" />
          <circle cx="110" cy="42" r="2" fill="#EC4899" /><circle cx="120" cy="42" r="2" fill="#06B6D4" />
          <text x="145" y="70" fill="#FACC15" fontSize="14" fontWeight="bold">♪</text>
        </g>
      );

    case 'pet-078': // Tikbalang - Amber Agimat Amulet & Abaca Warrior Harness
      return (
        <g id="unique-pet-078">
          <line x1="90" y1="105" x2="130" y2="135" stroke="#78350F" strokeWidth="3.5" />
          <line x1="130" y1="105" x2="90" y2="135" stroke="#78350F" strokeWidth="3.5" />
          <circle cx="110" cy="120" r="7" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
        </g>
      );

    case 'pet-079': // Boar Titan Tandayag - Massive Gold-Capped Carved Tusks
      return (
        <g id="unique-pet-079">
          <path d="M80,105 Q70,90 68,75" stroke="#FDE047" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M140,105 Q150,90 152,75" stroke="#FDE047" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        </g>
      );

    case 'pet-080': // Giant Minokawa - Moon-Swallowing Cosmic Eclipse Crown
      return (
        <g id="unique-pet-080">
          <circle cx="108" cy="42" r="16" fill="#1E1B4B" stroke="#FDE047" strokeWidth="2" />
          <path d="M100,34 C106,30 114,32 112,42 C106,44 102,38 100,34 Z" fill="#FDE047" />
        </g>
      );

    case 'pet-081': // Titan Tamaraw - Halcon Mountain Jade Horn Rings & Chieftain Cape
      return (
        <g id="unique-pet-081">
          <circle cx="78" cy="65" r="4.5" fill="#10B981" stroke="#064E3B" strokeWidth="1" />
          <circle cx="142" cy="65" r="4.5" fill="#10B981" stroke="#064E3B" strokeWidth="1" />
          <path d="M88,115 Q110,135 132,115" stroke="#10B981" strokeWidth="4" fill="none" />
        </g>
      );

    case 'pet-082': // Titan Whale Shark - Living Coral Reef City & Deep Lantern
      return (
        <g id="unique-pet-082">
          <path d="M75,100 Q80,85 85,100 Q90,82 95,100" stroke="#FB7185" strokeWidth="3" fill="none" />
          <circle cx="140" cy="90" r="5" fill="#67E8F9" stroke="#0284C7" strokeWidth="1.5" />
        </g>
      );

    case 'pet-083': // Sacred Golden Stag - Luminous Living Antler Tree & Star Orbs
      return (
        <g id="unique-pet-083">
          <path d="M88,50 Q75,25 65,30 M80,35 Q70,20 60,25 M122,50 Q135,25 145,30 M130,35 Q140,20 150,25" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <circle cx="65" cy="30" r="3.5" fill="#22C55E" /><circle cx="145" cy="30" r="3.5" fill="#22C55E" />
        </g>
      );

    case 'pet-084': // Eternal Phoenix - Rebirth Solar Halo & Blazing Crown
      return (
        <g id="unique-pet-084">
          <circle cx="110" cy="50" r="22" stroke="#DC2626" strokeWidth="3" strokeDasharray="5,4" fill="none" />
          <polygon points="105,42 110,28 115,42 120,32 125,42" fill="#FACC15" />
        </g>
      );

    case 'pet-085': // Celestial Unicorn - Starlight Spiral Horn & Galaxy Ring Halo
      return (
        <g id="unique-pet-085">
          <polygon points="107,52 110,22 113,52" fill="#FDE047" stroke="#E879F9" strokeWidth="1.5" />
          <ellipse cx="110" cy="40" rx="20" ry="6" stroke="#E879F9" strokeWidth="2" strokeDasharray="4,3" fill="none" />
        </g>
      );

    case 'pet-086': // Golden Mountain Griffin - Imperial Eagle Crown & Lion Pauldron
      return (
        <g id="unique-pet-086">
          <polygon points="98,46 105,34 112,46 119,34 126,46" fill="#FACC15" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="82" cy="115" r="7" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
        </g>
      );

    case 'pet-087': // Abyssal Sea Leviathan - Spined Dorsal Fins & Tidal Water Orb
      return (
        <g id="unique-pet-087">
          <polygon points="90,62 95,45 100,62" fill="#06B6D4" />
          <polygon points="105,58 110,40 115,58" fill="#06B6D4" />
          <circle cx="108" cy="125" r="8" fill="#22D3EE" stroke="#0891B2" strokeWidth="2" opacity="0.85" />
        </g>
      );

    case 'pet-088': // Cerberus Guard Pup - Triple Magma Collars & Underworld Chains
      return (
        <g id="unique-pet-088">
          <rect x="80" y="112" width="18" height="5" rx="1" fill="#EF4444" />
          <rect x="100" y="115" width="20" height="5" rx="1" fill="#EF4444" />
          <rect x="120" y="112" width="18" height="5" rx="1" fill="#EF4444" />
        </g>
      );

    case 'pet-089': // Moonlit Sphinx - Pharaonic Nemes Headdress & Gold Uraeus
      return (
        <g id="unique-pet-089">
          <path d="M85,62 L108,46 L131,62 L125,82 L91,82 Z" fill="#1D4ED8" stroke="#FDE047" strokeWidth="2" />
          <circle cx="108" cy="52" r="3.5" fill="#FDE047" />
        </g>
      );

    case 'pet-090': // Fenrir Blizzard Wolf - Broken Gleipnir Chains & Frostbite Fangs
      return (
        <g id="unique-pet-090">
          <line x1="85" y1="115" x2="72" y2="125" stroke="#E2E8F0" strokeWidth="3" strokeDasharray="3,3" />
          <line x1="125" y1="115" x2="138" y2="125" stroke="#E2E8F0" strokeWidth="3" strokeDasharray="3,3" />
          <circle cx="105" cy="120" r="5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
        </g>
      );

    // -------------------------------------------------------------
    // MYTHIC PETS (pet-091 to pet-100)
    // -------------------------------------------------------------
    case 'pet-091': // Bakunawa Moon Dragon - Crescent Moon in Jaw & Cosmic Scale Stars
      return (
        <g id="unique-pet-091">
          <path d="M142,92 C148,82 162,88 158,102 C152,105 146,98 142,92 Z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" />
          <circle cx="95" cy="115" r="3" fill="#38BDF8" />
          <circle cx="115" cy="125" r="3" fill="#38BDF8" />
        </g>
      );

    case 'pet-092': // Bathala Sky Dragon - Divine Golden Sun Halo & Jade Clouds
      return (
        <g id="unique-pet-092">
          <circle cx="105" cy="80" r="55" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="6,4" fill="none" opacity="0.85" />
          <circle cx="105" cy="80" r="62" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="3,5" fill="none" opacity="0.6" />
          <ellipse cx="65" cy="135" rx="14" ry="6" fill="#10B981" opacity="0.7" />
          <ellipse cx="145" cy="135" rx="14" ry="6" fill="#10B981" opacity="0.7" />
        </g>
      );

    case 'pet-093': // Primordial Manaul Bird - Sacred Bamboo Stalk & Creation Halo
      return (
        <g id="unique-pet-093">
          <line x1="80" y1="135" x2="135" y2="135" stroke="#22C55E" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="95" y1="132" x2="95" y2="138" stroke="#15803D" strokeWidth="2" />
          <line x1="120" y1="132" x2="120" y2="138" stroke="#15803D" strokeWidth="2" />
          <circle cx="108" cy="50" r="20" stroke="#F59E0B" strokeWidth="2" strokeDasharray="5,3" fill="none" opacity="0.75" />
        </g>
      );

    case 'pet-094': // Titan Kraken Kurita - Volcanic Obsidian Bracelets & Magma Aura
      return (
        <g id="unique-pet-094">
          <ellipse cx="105" cy="130" rx="35" ry="10" stroke="#EF4444" strokeWidth="3" strokeDasharray="5,3" fill="none" />
          <circle cx="75" cy="125" r="5" fill="#EF4444" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="135" cy="125" r="5" fill="#EF4444" stroke="#F59E0B" strokeWidth="1.5" />
        </g>
      );

    case 'pet-095': // Beast Titan Tarabusaw - Monster Skull Pauldron & Iron Knuckles
      return (
        <g id="unique-pet-095">
          <polygon points="75,95 90,105 80,120" fill="#E2E8F0" stroke="#475569" strokeWidth="2" />
          <circle cx="82" cy="104" r="2.5" fill="#0F172A" />
          <rect x="65" y="125" width="12" height="6" rx="2" fill="#64748B" />
        </g>
      );

    case 'pet-096': // Pah Cosmic Bird - Supernova Solar Core & Blinding Wing Flares
      return (
        <g id="unique-pet-096">
          <circle cx="108" cy="115" r="11" fill="#FFFFFF" stroke="#FDE047" strokeWidth="3" />
          <circle cx="108" cy="115" r="16" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3,3" fill="none" />
        </g>
      );

    case 'pet-097': // Celestial Kirin - Azure Lightning Dragon Horns & Cloud Hooves
      return (
        <g id="unique-pet-097">
          <path d="M96,52 Q82,25 72,32 M124,52 Q138,25 148,32" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" fill="none" />
          <ellipse cx="110" cy="40" rx="16" ry="5" stroke="#38BDF8" strokeWidth="2" strokeDasharray="3,2" fill="none" />
        </g>
      );

    case 'pet-098': // Nine-Headed Hydra - Miniature Glowing Serpent Heads
      return (
        <g id="unique-pet-098">
          <path d="M70,110 Q55,80 65,70 M85,100 Q75,65 85,55 M135,100 Q145,65 135,55 M145,110 Q160,80 150,70" stroke={palette.secondary} strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="65" cy="70" r="4.5" fill="#10B981" stroke="#047857" strokeWidth="1" />
          <circle cx="85" cy="55" r="4.5" fill="#10B981" stroke="#047857" strokeWidth="1" />
          <circle cx="135" cy="55" r="4.5" fill="#10B981" stroke="#047857" strokeWidth="1" />
          <circle cx="150" cy="70" r="4.5" fill="#10B981" stroke="#047857" strokeWidth="1" />
        </g>
      );

    case 'pet-099': // Bulalakaw Dragon - Shooting Star Comet Trail & Star-Shard Horn
      return (
        <g id="unique-pet-099">
          <polygon points="108,48 112,25 116,48" fill="#FDE047" stroke="#EA580C" strokeWidth="2" />
          <path d="M50,140 Q40,110 55,90" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
      );

    case 'pet-100': // Titan Emperor Scorpion - Golden Emperor Crown & Dual Stinger Gems
      return (
        <g id="unique-pet-100">
          <polygon points="98,56 105,42 112,56 118,44 124,56" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="50" cy="65" r="7" fill="#FDE047" stroke="#B45309" strokeWidth="2" />
          <circle cx="48" cy="63" r="2.5" fill="#FFFFFF" />
        </g>
      );

    default:
      return null;
  }
};
