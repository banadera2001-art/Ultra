import { MathItem, MathOperation } from '../types';

export const MATH_CURRICULUM_ITEMS: MathItem[] = [
  // ==========================================
  // BAITANG 1 (Grade 1): Addition & Subtraction within 20
  // ==========================================
  {
    id: 'g1-add-1',
    gradeLevel: 1,
    num1: 3,
    num2: 2,
    operation: '+',
    expectedAnswer: 5,
    itemType: 'mansanas',
    itemEmoji: '🍎',
    explanationTagalog: '3 mansanas dagdagan ng 2 mansanas ay 5 mansanas.',
  },
  {
    id: 'g1-add-2',
    gradeLevel: 1,
    num1: 4,
    num2: 3,
    operation: '+',
    expectedAnswer: 7,
    itemType: 'aso',
    itemEmoji: '🐶',
    explanationTagalog: '4 na aso dagdagan ng 3 aso ay 7 aso.',
  },
  {
    id: 'g1-add-3',
    gradeLevel: 1,
    num1: 5,
    num2: 5,
    operation: '+',
    expectedAnswer: 10,
    itemType: 'bituin',
    itemEmoji: '⭐',
    explanationTagalog: '5 bituin dagdagan ng 5 bituin ay 10 bituin.',
  },
  {
    id: 'g1-add-4',
    gradeLevel: 1,
    num1: 6,
    num2: 4,
    operation: '+',
    expectedAnswer: 10,
    itemType: 'bola',
    itemEmoji: '⚽',
    explanationTagalog: '6 na bola dagdagan ng 4 na bola ay 10 bola.',
  },
  {
    id: 'g1-add-5',
    gradeLevel: 1,
    num1: 8,
    num2: 4,
    operation: '+',
    expectedAnswer: 12,
    itemType: 'saging',
    itemEmoji: '🍌',
    explanationTagalog: '8 saging dagdagan ng 4 na saging ay 12 saging.',
  },
  {
    id: 'g1-add-6',
    gradeLevel: 1,
    num1: 9,
    num2: 6,
    operation: '+',
    expectedAnswer: 15,
    itemType: 'isda',
    itemEmoji: '🐟',
    explanationTagalog: '9 na isda dagdagan ng 6 na isda ay 15 isda.',
  },
  {
    id: 'g1-sub-1',
    gradeLevel: 1,
    num1: 5,
    num2: 2,
    operation: '-',
    expectedAnswer: 3,
    itemType: 'kendi',
    itemEmoji: '🍬',
    explanationTagalog: '5 kendi bawasan ng 2 kendi ay 3 kendi.',
  },
  {
    id: 'g1-sub-2',
    gradeLevel: 1,
    num1: 6,
    num2: 2,
    operation: '-',
    expectedAnswer: 4,
    itemType: 'bibe',
    itemEmoji: '🦆',
    explanationTagalog: '6 na bibe bawasan ng 2 bibe ay 4 na bibe.',
  },
  {
    id: 'g1-sub-3',
    gradeLevel: 1,
    num1: 7,
    num2: 4,
    operation: '-',
    expectedAnswer: 3,
    itemType: 'bulaklak',
    itemEmoji: '🌸',
    explanationTagalog: '7 bulaklak bawasan ng 4 na bulaklak ay 3 bulaklak.',
  },
  {
    id: 'g1-sub-4',
    gradeLevel: 1,
    num1: 10,
    num2: 3,
    operation: '-',
    expectedAnswer: 7,
    itemType: 'kotse',
    itemEmoji: '🚗',
    explanationTagalog: '10 kotse bawasan ng 3 kotse ay 7 kotse.',
  },
  {
    id: 'g1-sub-5',
    gradeLevel: 1,
    num1: 12,
    num2: 5,
    operation: '-',
    expectedAnswer: 7,
    itemType: 'puso',
    itemEmoji: '❤️',
    explanationTagalog: '12 puso bawasan ng 5 puso ay 7 puso.',
  },
  {
    id: 'g1-sub-6',
    gradeLevel: 1,
    num1: 15,
    num2: 6,
    operation: '-',
    expectedAnswer: 9,
    itemType: 'ibon',
    itemEmoji: '🐦',
    explanationTagalog: '15 ibon bawasan ng 6 na ibon ay 9 na ibon.',
  },

  // ==========================================
  // BAITANG 2 (Grade 2): Addition/Subtraction up to 100, Intro to Multiplication
  // ==========================================
  {
    id: 'g2-add-1',
    gradeLevel: 2,
    num1: 14,
    num2: 8,
    operation: '+',
    expectedAnswer: 22,
    itemType: 'aklat',
    itemEmoji: '📚',
    explanationTagalog: '14 aklat dagdagan ng 8 aklat ay 22 aklat.',
  },
  {
    id: 'g2-add-2',
    gradeLevel: 2,
    num1: 25,
    num2: 13,
    operation: '+',
    expectedAnswer: 38,
    itemType: 'lapis',
    itemEmoji: '✏️',
    explanationTagalog: '25 lapis dagdagan ng 13 lapis ay 38 lapis.',
  },
  {
    id: 'g2-add-3',
    gradeLevel: 2,
    num1: 36,
    num2: 24,
    operation: '+',
    expectedAnswer: 60,
    itemType: 'barya',
    itemEmoji: '🪙',
    explanationTagalog: '36 barya dagdagan ng 24 barya ay 60 barya.',
  },
  {
    id: 'g2-sub-1',
    gradeLevel: 2,
    num1: 24,
    num2: 9,
    operation: '-',
    expectedAnswer: 15,
    itemType: 'dahon',
    itemEmoji: '🍃',
    explanationTagalog: '24 dahon bawasan ng 9 na dahon ay 15 dahon.',
  },
  {
    id: 'g2-sub-2',
    gradeLevel: 2,
    num1: 45,
    num2: 18,
    operation: '-',
    expectedAnswer: 27,
    itemType: 'krayola',
    itemEmoji: '🖍️',
    explanationTagalog: '45 krayola bawasan ng 18 krayola ay 27 krayola.',
  },
  {
    id: 'g2-sub-3',
    gradeLevel: 2,
    num1: 50,
    num2: 25,
    operation: '-',
    expectedAnswer: 25,
    itemType: 'buto',
    itemEmoji: '🌱',
    explanationTagalog: '50 buto bawasan ng 25 buto ay 25 buto.',
  },
  {
    id: 'g2-mul-1',
    gradeLevel: 2,
    num1: 2,
    num2: 4,
    operation: '×',
    expectedAnswer: 8,
    itemType: 'paa ng pusa',
    itemEmoji: '🐾',
    explanationTagalog: '2 pangkat na may 4 na paa: 4 + 4 = 8.',
  },
  {
    id: 'g2-mul-2',
    gradeLevel: 2,
    num1: 3,
    num2: 3,
    operation: '×',
    expectedAnswer: 9,
    itemType: 'tatsulok',
    itemEmoji: '🔺',
    explanationTagalog: '3 pangkat na may 3: 3 + 3 + 3 = 9.',
  },
  {
    id: 'g2-mul-3',
    gradeLevel: 2,
    num1: 4,
    num2: 5,
    operation: '×',
    expectedAnswer: 20,
    itemType: 'daliri',
    itemEmoji: '🖐️',
    explanationTagalog: '4 na kamay na may 5 daliri: 5 + 5 + 5 + 5 = 20.',
  },
  {
    id: 'g2-mul-4',
    gradeLevel: 2,
    num1: 5,
    num2: 6,
    operation: '×',
    expectedAnswer: 30,
    itemType: 'mansanas',
    itemEmoji: '🍎',
    explanationTagalog: '5 supot na may 6 na mansanas: 5 × 6 = 30.',
  },
  {
    id: 'g2-mul-5',
    gradeLevel: 2,
    num1: 10,
    num2: 4,
    operation: '×',
    expectedAnswer: 40,
    itemType: 'barya',
    itemEmoji: '🪙',
    explanationTagalog: '10 barya na may 4 na pangkat: 10 × 4 = 40.',
  },

  // ==========================================
  // BAITANG 3 (Grade 3): Operations up to 1000, Multiplication tables 1-10, Division facts
  // ==========================================
  {
    id: 'g3-add-1',
    gradeLevel: 3,
    num1: 125,
    num2: 84,
    operation: '+',
    expectedAnswer: 209,
    itemType: 'punla',
    itemEmoji: '🌿',
    explanationTagalog: '125 punla dagdagan ng 84 punla ay 209 punla.',
  },
  {
    id: 'g3-add-2',
    gradeLevel: 3,
    num1: 240,
    num2: 175,
    operation: '+',
    expectedAnswer: 415,
    itemType: 'puntos',
    itemEmoji: '🎯',
    explanationTagalog: '240 puntos dagdagan ng 175 puntos ay 415 puntos.',
  },
  {
    id: 'g3-sub-1',
    gradeLevel: 3,
    num1: 150,
    num2: 65,
    operation: '-',
    expectedAnswer: 85,
    itemType: 'pahina',
    itemEmoji: '📖',
    explanationTagalog: '150 pahina bawasan ng 65 pahina ay 85 pahina.',
  },
  {
    id: 'g3-sub-2',
    gradeLevel: 3,
    num1: 340,
    num2: 165,
    operation: '-',
    expectedAnswer: 175,
    itemType: 'hakbang',
    itemEmoji: '👣',
    explanationTagalog: '340 hakbang bawasan ng 165 hakbang ay 175 hakbang.',
  },
  {
    id: 'g3-mul-1',
    gradeLevel: 3,
    num1: 6,
    num2: 7,
    operation: '×',
    expectedAnswer: 42,
    itemType: 'kahon',
    itemEmoji: '📦',
    explanationTagalog: '6 na pangkat ng 7: 6 × 7 = 42.',
  },
  {
    id: 'g3-mul-2',
    gradeLevel: 3,
    num1: 8,
    num2: 4,
    operation: '×',
    expectedAnswer: 32,
    itemType: 'gulong',
    itemEmoji: '🛞',
    explanationTagalog: '8 sasakyan na may tig-4 na gulong: 8 × 4 = 32.',
  },
  {
    id: 'g3-mul-3',
    gradeLevel: 3,
    num1: 9,
    num2: 8,
    operation: '×',
    expectedAnswer: 72,
    itemType: 'hiwa',
    itemEmoji: '🍕',
    explanationTagalog: '9 na kahon ng pizza na may 8 hiwa bawat isa: 9 × 8 = 72.',
  },
  {
    id: 'g3-div-1',
    gradeLevel: 3,
    num1: 24,
    num2: 4,
    operation: '÷',
    expectedAnswer: 6,
    itemType: 'kendi',
    itemEmoji: '🍬',
    explanationTagalog: '24 na kendi hinati sa 4 na bata: tig-6 na kendi bawat bata.',
  },
  {
    id: 'g3-div-2',
    gradeLevel: 3,
    num1: 35,
    num2: 5,
    operation: '÷',
    expectedAnswer: 7,
    itemType: 'mansanas',
    itemEmoji: '🍎',
    explanationTagalog: '35 mansanas hinati sa 5 basket: tig-7 mansanas bawat basket.',
  },
  {
    id: 'g3-div-3',
    gradeLevel: 3,
    num1: 48,
    num2: 6,
    operation: '÷',
    expectedAnswer: 8,
    itemType: 'itlog',
    itemEmoji: '🥚',
    explanationTagalog: '48 itlog hinati sa 6 na tray: tig-8 itlog bawat tray.',
  },
  {
    id: 'g3-div-4',
    gradeLevel: 3,
    num1: 63,
    num2: 9,
    operation: '÷',
    expectedAnswer: 7,
    itemType: 'lapis',
    itemEmoji: '✏️',
    explanationTagalog: '63 lapis hinati sa 9 na mag-aaral: tig-7 lapis bawat isa.',
  },

  // ==========================================
  // BAITANG 4 (Grade 4): Multi-digit operations, 2-digit multiplication, division with larger dividends
  // ==========================================
  {
    id: 'g4-add-1',
    gradeLevel: 4,
    num1: 450,
    num2: 385,
    operation: '+',
    expectedAnswer: 835,
    itemType: 'metro',
    itemEmoji: '📏',
    explanationTagalog: '450 metro dagdagan ng 385 metro ay 835 metro.',
  },
  {
    id: 'g4-sub-1',
    gradeLevel: 4,
    num1: 750,
    num2: 285,
    operation: '-',
    expectedAnswer: 465,
    itemType: 'piso',
    itemEmoji: '💵',
    explanationTagalog: '750 piso bawasan ng 285 piso ay 465 piso.',
  },
  {
    id: 'g4-mul-1',
    gradeLevel: 4,
    num1: 15,
    num2: 6,
    operation: '×',
    expectedAnswer: 90,
    itemType: 'oras',
    itemEmoji: '⏱️',
    explanationTagalog: '15 minuto minultiply sa 6: 15 × 6 = 90 minuto.',
  },
  {
    id: 'g4-mul-2',
    gradeLevel: 4,
    num1: 24,
    num2: 5,
    operation: '×',
    expectedAnswer: 120,
    itemType: 'bote',
    itemEmoji: '🍶',
    explanationTagalog: '24 bote sa bawat kahon, may 5 kahon: 24 × 5 = 120 bote.',
  },
  {
    id: 'g4-mul-3',
    gradeLevel: 4,
    num1: 36,
    num2: 4,
    operation: '×',
    expectedAnswer: 144,
    itemType: 'rosas',
    itemEmoji: '🌹',
    explanationTagalog: '36 rosas sa bawat plorera, may 4 na plorera: 36 × 4 = 144 rosas.',
  },
  {
    id: 'g4-mul-4',
    gradeLevel: 4,
    num1: 25,
    num2: 8,
    operation: '×',
    expectedAnswer: 200,
    itemType: 'puno',
    itemEmoji: '🌳',
    explanationTagalog: '25 puno sa bawat hanay, may 8 hanay: 25 × 8 = 200 puno.',
  },
  {
    id: 'g4-div-1',
    gradeLevel: 4,
    num1: 84,
    num2: 4,
    operation: '÷',
    expectedAnswer: 21,
    itemType: 'papel',
    itemEmoji: '📄',
    explanationTagalog: '84 piraso ng papel hinati sa 4 na grupo: 84 ÷ 4 = 21 bawat grupo.',
  },
  {
    id: 'g4-div-2',
    gradeLevel: 4,
    num1: 96,
    num2: 6,
    operation: '÷',
    expectedAnswer: 16,
    itemType: 'biskwit',
    itemEmoji: '🍪',
    explanationTagalog: '96 biskwit hinati sa 6 na plato: 96 ÷ 6 = 16 biskwit bawat plato.',
  },
  {
    id: 'g4-div-3',
    gradeLevel: 4,
    num1: 120,
    num2: 5,
    operation: '÷',
    expectedAnswer: 24,
    itemType: 'oras',
    itemEmoji: '⌛',
    explanationTagalog: '120 oras hinati sa 5 araw ng trabaho: 120 ÷ 5 = 24 oras.',
  },
  {
    id: 'g4-div-4',
    gradeLevel: 4,
    num1: 144,
    num2: 12,
    operation: '÷',
    expectedAnswer: 12,
    itemType: 'itlog',
    itemEmoji: '🥚',
    explanationTagalog: '144 itlog (1 gross) hinati sa 12 dosena: 144 ÷ 12 = 12 bawat dosena.',
  },

  // ==========================================
  // BAITANG 5 (Grade 5): Thousands operations, 2-digit by 2-digit multiplication, multi-digit division
  // ==========================================
  {
    id: 'g5-add-1',
    gradeLevel: 5,
    num1: 1250,
    num2: 850,
    operation: '+',
    expectedAnswer: 2100,
    itemType: 'litro',
    itemEmoji: '💧',
    explanationTagalog: '1,250 litro dagdagan ng 850 litro ay 2,100 litro.',
  },
  {
    id: 'g5-sub-1',
    gradeLevel: 5,
    num1: 2500,
    num2: 1150,
    operation: '-',
    expectedAnswer: 1350,
    itemType: 'kilometro',
    itemEmoji: '🛣️',
    explanationTagalog: '2,500 km bawasan ng 1,150 km ay 1,350 km.',
  },
  {
    id: 'g5-mul-1',
    gradeLevel: 5,
    num1: 25,
    num2: 16,
    operation: '×',
    expectedAnswer: 400,
    itemType: 'kahon',
    itemEmoji: '📦',
    explanationTagalog: '25 kahon na may 16 na aklat: 25 × 16 = 400.',
  },
  {
    id: 'g5-mul-2',
    gradeLevel: 5,
    num1: 35,
    num2: 14,
    operation: '×',
    expectedAnswer: 490,
    itemType: 'punla',
    itemEmoji: '🌱',
    explanationTagalog: '35 hanay na may 14 punla: 35 × 14 = 490.',
  },
  {
    id: 'g5-mul-3',
    gradeLevel: 5,
    num1: 48,
    num2: 15,
    operation: '×',
    expectedAnswer: 720,
    itemType: 'tiket',
    itemEmoji: '🎟️',
    explanationTagalog: '48 tiket na nagkakahalaga ng 15 piso: 48 × 15 = 720 piso.',
  },
  {
    id: 'g5-mul-4',
    gradeLevel: 5,
    num1: 60,
    num2: 25,
    operation: '×',
    expectedAnswer: 1500,
    itemType: 'segundo',
    itemEmoji: '⏱️',
    explanationTagalog: '60 segundo sa 25 minuto: 60 × 25 = 1,500 segundo.',
  },
  {
    id: 'g5-div-1',
    gradeLevel: 5,
    num1: 225,
    num2: 15,
    operation: '÷',
    expectedAnswer: 15,
    itemType: 'metro',
    itemEmoji: '📏',
    explanationTagalog: '225 metro hinati sa 15 piraso: 225 ÷ 15 = 15 metro bawat piraso.',
  },
  {
    id: 'g5-div-2',
    gradeLevel: 5,
    num1: 360,
    num2: 12,
    operation: '÷',
    expectedAnswer: 30,
    itemType: 'digri',
    itemEmoji: '🔄',
    explanationTagalog: '360 digri ng bilog hinati sa 12 bahagi: 360 ÷ 12 = 30 digri.',
  },
  {
    id: 'g5-div-3',
    gradeLevel: 5,
    num1: 450,
    num2: 18,
    operation: '÷',
    expectedAnswer: 25,
    itemType: 'kendi',
    itemEmoji: '🍬',
    explanationTagalog: '450 kendi hinati sa 18 bag: 450 ÷ 18 = 25 kendi bawat bag.',
  },
  {
    id: 'g5-div-4',
    gradeLevel: 5,
    num1: 625,
    num2: 25,
    operation: '÷',
    expectedAnswer: 25,
    itemType: 'puntos',
    itemEmoji: '🎯',
    explanationTagalog: '625 kabuuang puntos hinati sa 25 kalahok: 625 ÷ 25 = 25 puntos bawat isa.',
  },

  // ==========================================
  // BAITANG 6 (Grade 6): Advanced operations, larger quotients/products, problem mastery
  // ==========================================
  {
    id: 'g6-add-1',
    gradeLevel: 6,
    num1: 3450,
    num2: 2680,
    operation: '+',
    expectedAnswer: 6130,
    itemType: 'kilo',
    itemEmoji: '⚖️',
    explanationTagalog: '3,450 kilo dagdagan ng 2,680 kilo ay 6,130 kilo.',
  },
  {
    id: 'g6-sub-1',
    gradeLevel: 6,
    num1: 5000,
    num2: 2480,
    operation: '-',
    expectedAnswer: 2520,
    itemType: 'piso',
    itemEmoji: '💰',
    explanationTagalog: '5,000 piso bawasan ng 2,480 piso ay 2,520 piso.',
  },
  {
    id: 'g6-mul-1',
    gradeLevel: 6,
    num1: 75,
    num2: 24,
    operation: '×',
    expectedAnswer: 1800,
    itemType: 'puntos',
    itemEmoji: '🏆',
    explanationTagalog: '75 puntos kada round sa 24 rounds: 75 × 24 = 1,800 puntos.',
  },
  {
    id: 'g6-mul-2',
    gradeLevel: 6,
    num1: 64,
    num2: 35,
    operation: '×',
    expectedAnswer: 2240,
    itemType: 'piraso',
    itemEmoji: '🧩',
    explanationTagalog: '64 kahon na may 35 piraso: 64 × 35 = 2,240 piraso.',
  },
  {
    id: 'g6-mul-3',
    gradeLevel: 6,
    num1: 125,
    num2: 16,
    operation: '×',
    expectedAnswer: 2000,
    itemType: 'mililitro',
    itemEmoji: '🧪',
    explanationTagalog: '125 mL na gamot sa 16 na bote: 125 × 16 = 2,000 mL.',
  },
  {
    id: 'g6-mul-4',
    gradeLevel: 6,
    num1: 85,
    num2: 42,
    operation: '×',
    expectedAnswer: 3570,
    itemType: 'kilometro',
    itemEmoji: '🚀',
    explanationTagalog: '85 km bawat oras sa loob ng 42 oras: 85 × 42 = 3,570 km.',
  },
  {
    id: 'g6-div-1',
    gradeLevel: 6,
    num1: 750,
    num2: 25,
    operation: '÷',
    expectedAnswer: 30,
    itemType: 'mag-aaral',
    itemEmoji: '🎒',
    explanationTagalog: '750 mag-aaral hinati sa 25 silid-aralan: 750 ÷ 25 = 30 bawat silid.',
  },
  {
    id: 'g6-div-2',
    gradeLevel: 6,
    num1: 960,
    num2: 32,
    operation: '÷',
    expectedAnswer: 30,
    itemType: 'kusing',
    itemEmoji: '🪙',
    explanationTagalog: '960 barya hinati sa 32 supot: 960 ÷ 32 = 30 bawat supot.',
  },
  {
    id: 'g6-div-3',
    gradeLevel: 6,
    num1: 1250,
    num2: 50,
    operation: '÷',
    expectedAnswer: 25,
    itemType: 'pakete',
    itemEmoji: '📦',
    explanationTagalog: '1,250 aklat hinati sa 50 kahon: 1,250 ÷ 50 = 25 bawat kahon.',
  },
  {
    id: 'g6-div-4',
    gradeLevel: 6,
    num1: 1440,
    num2: 36,
    operation: '÷',
    expectedAnswer: 40,
    itemType: 'oras',
    itemEmoji: '⏱️',
    explanationTagalog: '1,440 minuto hinati sa 36 gawain: 1,440 ÷ 36 = 40 minuto bawat gawain.',
  },
  {
    id: 'g6-div-5',
    gradeLevel: 6,
    num1: 1800,
    num2: 45,
    operation: '÷',
    expectedAnswer: 40,
    itemType: 'metro',
    itemEmoji: '📏',
    explanationTagalog: '1,800 metro hinati sa 45 segment: 1,800 ÷ 45 = 40 metro bawat isa.',
  },
];

// Grade 1 baseline items preserved for backward compatibility
export const DEFAULT_GRADE_1_ITEMS: MathItem[] = MATH_CURRICULUM_ITEMS.filter(
  (item) => item.gradeLevel === 1
);

const EMOJI_PALETTE = ['🍎', '🐶', '🍬', '⭐', '🦆', '🌸', '🚗', '🏀', '🍌', '🐱', '✏️', '🍕', '🍰', '🎈', '🐠'];

/**
 * Generate a clean, curriculum-aligned randomized math problem for any Grade 1-6
 */
export function generateMathProblem(
  grade: number,
  operationChoice?: MathOperation
): MathItem {
  const g = Math.min(6, Math.max(1, grade));
  
  // Available operations per grade
  let allowedOps: MathOperation[] = ['+', '-'];
  if (g >= 2) allowedOps.push('×');
  if (g >= 3) allowedOps.push('÷');

  const op = operationChoice && allowedOps.includes(operationChoice)
    ? operationChoice
    : allowedOps[Math.floor(Math.random() * allowedOps.length)];

  let num1 = 1;
  let num2 = 1;
  let expectedAnswer = 2;
  const emoji = EMOJI_PALETTE[Math.floor(Math.random() * EMOJI_PALETTE.length)];

  if (op === '+') {
    if (g === 1) {
      num1 = Math.floor(Math.random() * 9) + 1; // 1-9
      num2 = Math.floor(Math.random() * 9) + 1; // 1-9
    } else if (g === 2) {
      num1 = Math.floor(Math.random() * 40) + 10; // 10-49
      num2 = Math.floor(Math.random() * 40) + 5;
    } else if (g === 3) {
      num1 = Math.floor(Math.random() * 200) + 50;
      num2 = Math.floor(Math.random() * 150) + 20;
    } else if (g === 4) {
      num1 = Math.floor(Math.random() * 400) + 100;
      num2 = Math.floor(Math.random() * 300) + 50;
    } else if (g === 5) {
      num1 = Math.floor(Math.random() * 1500) + 500;
      num2 = Math.floor(Math.random() * 1000) + 200;
    } else {
      num1 = Math.floor(Math.random() * 4000) + 1000;
      num2 = Math.floor(Math.random() * 3000) + 500;
    }
    expectedAnswer = num1 + num2;
  } else if (op === '-') {
    if (g === 1) {
      expectedAnswer = Math.floor(Math.random() * 9) + 1;
      num2 = Math.floor(Math.random() * 8) + 1;
      num1 = expectedAnswer + num2;
    } else if (g === 2) {
      expectedAnswer = Math.floor(Math.random() * 35) + 5;
      num2 = Math.floor(Math.random() * 25) + 5;
      num1 = expectedAnswer + num2;
    } else if (g === 3) {
      expectedAnswer = Math.floor(Math.random() * 150) + 20;
      num2 = Math.floor(Math.random() * 120) + 15;
      num1 = expectedAnswer + num2;
    } else if (g === 4) {
      expectedAnswer = Math.floor(Math.random() * 350) + 50;
      num2 = Math.floor(Math.random() * 250) + 30;
      num1 = expectedAnswer + num2;
    } else if (g === 5) {
      expectedAnswer = Math.floor(Math.random() * 1200) + 200;
      num2 = Math.floor(Math.random() * 900) + 100;
      num1 = expectedAnswer + num2;
    } else {
      expectedAnswer = Math.floor(Math.random() * 3000) + 500;
      num2 = Math.floor(Math.random() * 2000) + 400;
      num1 = expectedAnswer + num2;
    }
  } else if (op === '×') {
    if (g === 2) {
      const basicFactors = [2, 3, 4, 5, 10];
      num1 = basicFactors[Math.floor(Math.random() * basicFactors.length)];
      num2 = Math.floor(Math.random() * 9) + 1;
    } else if (g === 3) {
      num1 = Math.floor(Math.random() * 9) + 2; // 2-10
      num2 = Math.floor(Math.random() * 9) + 2; // 2-10
    } else if (g === 4) {
      num1 = Math.floor(Math.random() * 30) + 12; // 12-41
      num2 = Math.floor(Math.random() * 7) + 3; // 3-9
    } else if (g === 5) {
      num1 = Math.floor(Math.random() * 40) + 15;
      num2 = Math.floor(Math.random() * 15) + 10;
    } else {
      num1 = Math.floor(Math.random() * 60) + 25;
      num2 = Math.floor(Math.random() * 35) + 15;
    }
    expectedAnswer = num1 * num2;
  } else {
    // op === '÷'
    if (g <= 3) {
      num2 = Math.floor(Math.random() * 8) + 2; // 2-9
      expectedAnswer = Math.floor(Math.random() * 8) + 2; // 2-9
    } else if (g === 4) {
      num2 = Math.floor(Math.random() * 8) + 3; // 3-10
      expectedAnswer = Math.floor(Math.random() * 20) + 5; // 5-24
    } else if (g === 5) {
      num2 = Math.floor(Math.random() * 15) + 10; // 10-24
      expectedAnswer = Math.floor(Math.random() * 20) + 10; // 10-29
    } else {
      num2 = Math.floor(Math.random() * 30) + 15; // 15-44
      expectedAnswer = Math.floor(Math.random() * 35) + 15; // 15-49
    }
    num1 = expectedAnswer * num2;
  }

  return {
    id: `rand-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    gradeLevel: g,
    num1,
    num2,
    operation: op,
    expectedAnswer,
    itemType: 'bagay',
    itemEmoji: emoji,
    explanationTagalog: `${num1} ${op} ${num2} = ${expectedAnswer}`,
  };
}

/**
 * Generate 3 sensible multiple-choice distractors close to the expected answer
 */
export function getDistractorChoices(expectedAnswer: number): number[] {
  const choices = new Set<number>([expectedAnswer]);
  const deltas = [-3, -2, -1, 1, 2, 3, 4, 5, 10, -10];
  
  // Shuffle deltas
  const shuffledDeltas = [...deltas].sort(() => Math.random() - 0.5);

  for (const delta of shuffledDeltas) {
    const candidate = expectedAnswer + delta;
    if (candidate >= 0 && candidate !== expectedAnswer) {
      choices.add(candidate);
    }
    if (choices.size >= 4) break;
  }

  // Fallback if needed
  let counter = 1;
  while (choices.size < 4) {
    choices.add(expectedAnswer + counter);
    counter++;
  }

  return Array.from(choices).sort(() => Math.random() - 0.5);
}

/**
 * Speech prompt in natural Filipino for math problems
 */
export function getMathQuestionSpeech(item: MathItem): string {
  let opWord = 'dagdagan ng';
  if (item.operation === '-') opWord = 'bawasan ng';
  if (item.operation === '×') opWord = 'i-multiply sa';
  if (item.operation === '÷') opWord = 'hatiin sa';

  return `Ilan ang ${item.num1} ${opWord} ${item.num2}?`;
}
