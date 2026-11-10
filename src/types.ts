export type MarungkoGroupId = 1 | 2 | 3 | 4;

export interface MarungkoGroup {
  id: MarungkoGroupId;
  title: string;
  letters: string[];
  description: string;
  themeColor: string;
}

export type ExerciseCategory =
  | 'two_letters'
  | 'three_letters'
  | 'four_letters'
  | 'sentence'
  | 'cvc_words'
  | 'sight_words'
  | 'blends_digraphs';

export type ReadingLanguage = 'filipino' | 'english';

export interface ReadingItem {
  id: string;
  groupId: MarungkoGroupId;
  category: ExerciseCategory;
  text: string;
  phoneticGuide: string;
  tagalogGuide: string;
  sampleWord?: string;
  sampleSentence?: string;
  imageUrl?: string;
  language?: ReadingLanguage;
  unitId?: number;
  unitTitle?: string;
  emoji?: string;
}

export interface WritingItem {
  id: string;
  groupId: MarungkoGroupId;
  targetText: string;
  guideType: 'two_letters' | 'three_letters' | 'four_letters';
  instruction: string;
  strokeTips: string[];
}

export type MathOperation = '+' | '-' | '×' | '÷';

export interface MathItem {
  id: string;
  num1: number;
  num2: number;
  operation: MathOperation;
  expectedAnswer: number;
  itemType: string; // e.g. 'mangga', 'bibe', 'bota', 'tasa'
  itemEmoji: string;
  gradeLevel?: number;
  explanationTagalog?: string;
}

export interface Badge {
  id: string;
  title: string;
  titleTagalog: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt?: string;
}

export type PetTier = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type PetStage = 'Baby' | 'Teen' | 'Adult';

export interface PetDefinition {
  id: string;
  name: string;
  nameTagalog: string;
  emoji: string;
  tier: PetTier;
  price: number; // in stars (scaled for high challenge)
  description: string;
  favoriteFood: string;
  sound: string;
  element: 'Lupa' | 'Tubig' | 'Hangin' | 'Apoy' | 'Liwanag' | 'Mahika';
  // Combat Base Attributes
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpd: number;
  specialSkill: string;
  specialSkillTagalog: string;
  specialSkillDescription: string;
}

export interface BattleEnemy {
  id: string;
  name: string;
  nameTagalog: string;
  emoji: string;
  element: 'Lupa' | 'Tubig' | 'Hangin' | 'Apoy' | 'Liwanag' | 'Mahika';
  level: number;
  stage: PetStage;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  specialSkill: string;
  specialSkillTagalog: string;
  description: string;
}

export interface BattleArena {
  id: string;
  title: string;
  titleTagalog: string;
  description: string;
  recommendedLevel: number;
  rewardStars: number;
  rewardExp: number;
  environmentEmoji: string;
  bgGradient: string;
  enemies: BattleEnemy[];
}

export interface CombatQuizItem {
  id: string;
  questionTagalog: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  type: 'phonics' | 'reading' | 'math';
}

export interface OwnedPet {
  petId: string;
  nickname?: string;
  level: number; // 1 to 100
  stage: PetStage;
  currentExp: number;
  maxExp: number; // calculated dynamically by level
  hunger: number; // 0 to 100 (busog meter)
  timesFed: number;
  adoptedAt: string;
}

export interface PetFood {
  id: string;
  name: string;
  nameTagalog: string;
  emoji: string;
  cost: number; // stars
  expGain: number;
  hungerGain: number;
  description: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  avatar: string;
  gradeLevel: string;
  stars: number;
  activeGroup: MarungkoGroupId;
  unlockedBadges: string[];
  history: {
    id: string;
    type: 'reading' | 'writing' | 'math';
    target: string;
    score: number; // 0-100 or stars
    timestamp: string;
    feedback: string;
  }[];
  readingAccuracy: number; // percentage
  writingScore: number; // percentage
  mathSolvedCount: number;
  ownedPets?: OwnedPet[];
  activePetId?: string;
  foodInventory?: Record<string, number>;
}

export interface AIEvaluationResponse {
  isCorrect: boolean;
  score: number; // 1 to 5 stars or 0-100
  transcription?: string;
  normalizedSpoken?: string;
  recognizedText?: string;
  feedbackTagalog: string;
  correctionTips?: string[];
  detailedAnalysis?: {
    alignmentScore?: number;
    sizingScore?: number;
    legibilityScore?: number;
    mispronouncedParts?: string[];
  };
}

// ==========================================
// BLOX FRUITS RPG TYPES
// ==========================================
export type BloxFruitRarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythical';
export type BloxFruitType = 'natural' | 'elemental' | 'beast';

export interface FruitSkill {
  key: 'Z' | 'X' | 'C' | 'V';
  name: string;
  nameTagalog: string;
  energyCost: number;
  damageMultiplier: number;
  cooldown: number; // in seconds
  description: string;
  effectType: 'fire' | 'ice' | 'light' | 'explosion' | 'slash' | 'dark' | 'impact';
  icon: string;
  // Deep Combat Mechanics & Variety Details
  mechanicType?: string; // e.g. "Rapid 3-Burst", "Instant Piercing Laser", "Flash-Step Teleport Kick", "Black Hole Gravitational Suction"
  mechanicDetail?: string; // In-depth mechanical explanation
  range?: string; // Range tag
  specialTrait?: string; // Ken Haki break, Stun, Knockback, Suction, Burn
  hits?: string; // e.g. "3x Burst", "14x Rapid Machine-Gun", "Single Heavy Impact"
  masteryReq?: number; // Mastery level unlock
}

export interface BloxFruit {
  id: string;
  name: string;
  nameTagalog: string;
  emoji: string;
  rarity: BloxFruitRarity;
  type: BloxFruitType;
  priceStars: number;
  prizeStars?: number;
  description: string;
  color: string;
  glowColor: string;
  skills: FruitSkill[];
  passiveDesc: string;
}

export interface BloxSword {
  id: string;
  name: string;
  nameTagalog: string;
  rarity: BloxFruitRarity;
  priceStars: number;
  baseDamage: number;
  emoji: string;
  description: string;
  specialSkill: string;
}

export interface BloxAccessory {
  id: string;
  name: string;
  nameTagalog: string;
  priceStars: number;
  hpBonus: number;
  energyBonus: number;
  speedBonus: number;
  damageBonusPercent: number;
  emoji: string;
  description: string;
}

export type IslandDifficultyTier = 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Nightmare';

export interface BloxIsland {
  id: string;
  name: string;
  nameTagalog: string;
  reqLevel: number;
  difficultyTier: IslandDifficultyTier;
  minionLevel: number;
  bossLevel: number;
  bgGradient: string;
  enemyName: string;
  enemyEmoji: string;
  enemyHp: number;
  enemyAtk: number;
  bossName?: string;
  bossEmoji?: string;
  bossHp?: number;
  bossAtk?: number;
  rewardExp: number;
  rewardStars: number;
  description: string;
}

export interface BloxQuest {
  id: string;
  title: string;
  titleTagalog: string;
  targetType: 'bandit' | 'boss' | 'chest' | 'baboon' | 'marine' | 'desert' | 'sky' | 'coin';
  targetName: string;
  requiredCount: number;
  rewardStars: number;
  rewardExp: number;
  rewardBounty: number;
  minLevel: number;
  description: string;
}

export interface ActiveQuestState {
  questId: string;
  currentCount: number;
  requiredCount: number;
  isCompleted: boolean;
}

export interface BloxFruitsPlayerData {
  level: number;
  exp: number;
  maxExp: number;
  bounty: number;
  statPoints: number;
  stats: {
    melee: number;
    defense: number;
    sword: number;
    bloxFruit: number;
  };
  equippedFruitId: string;
  equippedSwordId: string;
  equippedAccessoryId: string;
  ownedFruits: string[];
  ownedSwords: string[];
  ownedAccessories: string[];
  activeQuest?: ActiveQuestState | null;
  gender?: 'boy' | 'girl';
  selectedGrade?: 1 | 2 | 3 | 4 | 5 | 6 | 'all';
}


