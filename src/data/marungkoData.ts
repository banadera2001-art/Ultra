import { MarungkoGroup, ReadingItem, WritingItem, MathItem } from '../types';

export const MARUNGKO_GROUPS: MarungkoGroup[] = [
  {
    id: 1,
    title: 'Pangkat 1: M, A, S, I, O',
    letters: ['M', 'A', 'S', 'I', 'O'],
    description: 'Pagsasama ng M, A, S, I, O sa 2 letra (pantig), 3 letra, at 4 na letrang salita tulad ng Mama at Aso.',
    themeColor: 'from-amber-500 to-orange-500',
  },
  {
    id: 2,
    title: 'Pangkat 2: B, E, U, T, K',
    letters: ['B', 'E', 'U', 'T', 'K'],
    description: 'Pagsasama ng B, E, U, T, K sa 2 letra, 3 letra, at 4 na letrang salita tulad ng Bote, Tasa, at Kubo.',
    themeColor: 'from-blue-500 to-cyan-500',
  },
  {
    id: 3,
    title: 'Pangkat 3: L, Y, G, N, NG',
    letters: ['L', 'Y', 'G', 'N', 'NG'],
    description: 'Pagsasama ng L, Y, G, N, NG sa 2, 3, at 4 na letrang salita tulad ng Gatas, Lata, at Yoyo.',
    themeColor: 'from-emerald-500 to-teal-500',
  },
  {
    id: 4,
    title: 'Pangkat 4: P, R, D, H, W',
    letters: ['P', 'R', 'D', 'H', 'W'],
    description: 'Pagsasama ng P, R, D, H, W sa 2, 3, at 4 na letrang salita tulad ng Pusa, Relo, at Damo.',
    themeColor: 'from-purple-500 to-indigo-500',
  },
];

export const READING_ITEMS: ReadingItem[] = [
  // ==================== PANGKAT 1 (M, A, S, I, O) ====================
  // 2 Letra (Pantig)
  {
    id: 'r1-2l-1',
    groupId: 1,
    category: 'two_letters',
    text: 'MA',
    phoneticGuide: 'M + A = MA',
    tagalogGuide: 'Pagsamahin ang dalawang letra: M at A para mabuo ang MA.',
    sampleWord: 'mama',
  },
  {
    id: 'r1-2l-2',
    groupId: 1,
    category: 'two_letters',
    text: 'SA',
    phoneticGuide: 'S + A = SA',
    tagalogGuide: 'Pagsamahin ang dalawang letra: S at A para mabuo ang SA.',
    sampleWord: 'sama',
  },
  {
    id: 'r1-2l-3',
    groupId: 1,
    category: 'two_letters',
    text: 'MI',
    phoneticGuide: 'M + I = MI',
    tagalogGuide: 'Pagsamahin ang dalawang letra: M at I para mabuo ang MI.',
    sampleWord: 'misa',
  },
  {
    id: 'r1-2l-4',
    groupId: 1,
    category: 'two_letters',
    text: 'SI',
    phoneticGuide: 'S + I = SI',
    tagalogGuide: 'Pagsamahin ang dalawang letra: S at I para mabuo ang SI.',
    sampleWord: 'si',
  },
  {
    id: 'r1-2l-5',
    groupId: 1,
    category: 'two_letters',
    text: 'MO',
    phoneticGuide: 'M + O = MO',
    tagalogGuide: 'Pagsamahin ang dalawang letra: M at O para mabuo ang MO.',
    sampleWord: 'amo',
  },
  {
    id: 'r1-2l-6',
    groupId: 1,
    category: 'two_letters',
    text: 'SO',
    phoneticGuide: 'S + O = SO',
    tagalogGuide: 'Pagsamahin ang dalawang letra: S at O para mabuo ang SO.',
    sampleWord: 'aso',
  },

  // 3 Letra
  {
    id: 'r1-3l-1',
    groupId: 1,
    category: 'three_letters',
    text: 'ASO',
    phoneticGuide: 'A + SO = ASO',
    tagalogGuide: 'Tatlong letra: A at SO para mabuo ang salitang ASO.',
    sampleWord: 'aso',
    sampleSentence: 'May aso si ama.',
  },
  {
    id: 'r1-3l-2',
    groupId: 1,
    category: 'three_letters',
    text: 'ISA',
    phoneticGuide: 'I + SA = ISA',
    tagalogGuide: 'Tatlong letra: I at SA para mabuo ang salitang ISA.',
    sampleWord: 'isa',
    sampleSentence: 'Isa ang aso.',
  },
  {
    id: 'r1-3l-3',
    groupId: 1,
    category: 'three_letters',
    text: 'AMO',
    phoneticGuide: 'A + MO = AMO',
    tagalogGuide: 'Tatlong letra: A at MO para mabuo ang salitang AMO.',
    sampleWord: 'amo',
  },
  {
    id: 'r1-3l-4',
    groupId: 1,
    category: 'three_letters',
    text: 'MAS',
    phoneticGuide: 'M + A + S = MAS',
    tagalogGuide: 'Tatlong letra na pinagsama: MAS.',
  },

  // 4 Letra (Dalawang Pantig)
  {
    id: 'r1-4l-1',
    groupId: 1,
    category: 'four_letters',
    text: 'MAMA',
    phoneticGuide: 'MA + MA = MAMA',
    tagalogGuide: 'Apat na letra: Dalawang pantig na MA at MA ay MAMA.',
    sampleSentence: 'Mabait ang aking mama.',
  },
  {
    id: 'r1-4l-2',
    groupId: 1,
    category: 'four_letters',
    text: 'SAMA',
    phoneticGuide: 'SA + MA = SAMA',
    tagalogGuide: 'Apat na letra: Pagsamahin ang SA at MA para mabuo ang SAMA.',
    sampleSentence: 'Sama-sama tayo sa aralin.',
  },
  {
    id: 'r1-4l-3',
    groupId: 1,
    category: 'four_letters',
    text: 'MISA',
    phoneticGuide: 'MI + SA = MISA',
    tagalogGuide: 'Apat na letra: Pagsamahin ang MI at SA para mabuo ang MISA.',
  },
  {
    id: 'r1-4l-4',
    groupId: 1,
    category: 'four_letters',
    text: 'MASA',
    phoneticGuide: 'MA + SA = MASA',
    tagalogGuide: 'Apat na letra: Pagsamahin ang MA at SA para mabuo ang MASA.',
  },

  // Pangungusap
  {
    id: 'r1-sen-1',
    groupId: 1,
    category: 'sentence',
    text: 'Ang mama at ama.',
    phoneticGuide: 'Ang ma-ma at a-ma.',
    tagalogGuide: 'Basahin nang dahan-dahan ang buong pangungusap.',
  },
  {
    id: 'r1-sen-2',
    groupId: 1,
    category: 'sentence',
    text: 'May aso si ama.',
    phoneticGuide: 'May a-so si a-ma.',
    tagalogGuide: 'Basahin ang buong pangungusap mula kaliwa pakanan.',
  },

  // ==================== PANGKAT 2 (B, E, U, T, K) ====================
  // 2 Letra (Pantig)
  {
    id: 'r2-2l-1',
    groupId: 2,
    category: 'two_letters',
    text: 'BA',
    phoneticGuide: 'B + A = BA',
    tagalogGuide: 'Pagsamahin ang B at A para mabuo ang BA.',
  },
  {
    id: 'r2-2l-2',
    groupId: 2,
    category: 'two_letters',
    text: 'BO',
    phoneticGuide: 'B + O = BO',
    tagalogGuide: 'Pagsamahin ang B at O para mabuo ang BO.',
  },
  {
    id: 'r2-2l-3',
    groupId: 2,
    category: 'two_letters',
    text: 'TA',
    phoneticGuide: 'T + A = TA',
    tagalogGuide: 'Pagsamahin ang T at A para mabuo ang TA.',
  },
  {
    id: 'r2-2l-4',
    groupId: 2,
    category: 'two_letters',
    text: 'KU',
    phoneticGuide: 'K + U = KU',
    tagalogGuide: 'Pagsamahin ang K at U para mabuo ang KU.',
  },
  {
    id: 'r2-2l-5',
    groupId: 2,
    category: 'two_letters',
    text: 'KA',
    phoneticGuide: 'K + A = KA',
    tagalogGuide: 'Pagsamahin ang K at A para mabuo ang KA.',
  },

  // 3 Letra
  {
    id: 'r2-3l-1',
    groupId: 2,
    category: 'three_letters',
    text: 'BAS',
    phoneticGuide: 'B + A + S = BAS',
    tagalogGuide: 'Tatlong letra na pinagsama: BAS.',
  },
  {
    id: 'r2-3l-2',
    groupId: 2,
    category: 'three_letters',
    text: 'TAS',
    phoneticGuide: 'T + A + S = TAS',
    tagalogGuide: 'Tatlong letra na pinagsama: TAS.',
  },
  {
    id: 'r2-3l-3',
    groupId: 2,
    category: 'three_letters',
    text: 'KUB',
    phoneticGuide: 'K + U + B = KUB',
    tagalogGuide: 'Tatlong letra na pinagsama: KUB.',
  },

  // 4 Letra
  {
    id: 'r2-4l-1',
    groupId: 2,
    category: 'four_letters',
    text: 'BOTE',
    phoneticGuide: 'BO + TE = BOTE',
    tagalogGuide: 'Apat na letra: BO at TE para mabuo ang BOTE.',
    sampleSentence: 'Nasa mesa ang bote.',
  },
  {
    id: 'r2-4l-2',
    groupId: 2,
    category: 'four_letters',
    text: 'TASA',
    phoneticGuide: 'TA + SA = TASA',
    tagalogGuide: 'Apat na letra: TA at SA para mabuo ang TASA.',
    sampleSentence: 'May gatas sa tasa.',
  },
  {
    id: 'r2-4l-3',
    groupId: 2,
    category: 'four_letters',
    text: 'KUBO',
    phoneticGuide: 'KU + BO = KUBO',
    tagalogGuide: 'Apat na letra: KU at BO para mabuo ang KUBO.',
    sampleSentence: 'Maliit ang kubo.',
  },
  {
    id: 'r2-4l-4',
    groupId: 2,
    category: 'four_letters',
    text: 'BATA',
    phoneticGuide: 'BA + TA = BATA',
    tagalogGuide: 'Apat na letra: BA at TA para mabuo ang BATA.',
    sampleSentence: 'Mabait ang bata.',
  },

  // Pangungusap
  {
    id: 'r2-sen-1',
    groupId: 2,
    category: 'sentence',
    text: 'Nasa kubo ang bibe.',
    phoneticGuide: 'Na-sa ku-bo ang bi-be.',
    tagalogGuide: 'Basahin nang may tiwala at malinaw na boses.',
  },
  {
    id: 'r2-sen-2',
    groupId: 2,
    category: 'sentence',
    text: 'May tasa at bote.',
    phoneticGuide: 'May ta-sa at bo-te.',
    tagalogGuide: 'Basahin ang buong pangungusap.',
  },

  // ==================== PANGKAT 3 (L, Y, G, N, NG) ====================
  // 2 Letra (Pantig)
  {
    id: 'r3-2l-1',
    groupId: 3,
    category: 'two_letters',
    text: 'LA',
    phoneticGuide: 'L + A = LA',
    tagalogGuide: 'Pagsamahin ang L at A para mabuo ang LA.',
  },
  {
    id: 'r3-2l-2',
    groupId: 3,
    category: 'two_letters',
    text: 'GA',
    phoneticGuide: 'G + A = GA',
    tagalogGuide: 'Pagsamahin ang G at A para mabuo ang GA.',
  },
  {
    id: 'r3-2l-3',
    groupId: 3,
    category: 'two_letters',
    text: 'NA',
    phoneticGuide: 'N + A = NA',
    tagalogGuide: 'Pagsamahin ang N at A para mabuo ang NA.',
  },
  {
    id: 'r3-2l-4',
    groupId: 3,
    category: 'two_letters',
    text: 'YA',
    phoneticGuide: 'Y + A = YA',
    tagalogGuide: 'Pagsamahin ang Y at A para mabuo ang YA.',
  },

  // 3 Letra
  {
    id: 'r3-3l-1',
    groupId: 3,
    category: 'three_letters',
    text: 'ANG',
    phoneticGuide: 'A + NG = ANG',
    tagalogGuide: 'Tatlong letra: Pantukoy na ANG.',
  },
  {
    id: 'r3-3l-2',
    groupId: 3,
    category: 'three_letters',
    text: 'MAY',
    phoneticGuide: 'M + A + Y = MAY',
    tagalogGuide: 'Tatlong letra: MAY.',
  },
  {
    id: 'r3-3l-3',
    groupId: 3,
    category: 'three_letters',
    text: 'MGA',
    phoneticGuide: 'M + G + A = MGA',
    tagalogGuide: 'Tatlong letra: Salitang MGA.',
  },

  // 4 Letra
  {
    id: 'r3-4l-1',
    groupId: 3,
    category: 'four_letters',
    text: 'LATA',
    phoneticGuide: 'LA + TA = LATA',
    tagalogGuide: 'Apat na letra: LA at TA para mabuo ang LATA.',
  },
  {
    id: 'r3-4l-2',
    groupId: 3,
    category: 'four_letters',
    text: 'YOYO',
    phoneticGuide: 'YO + YO = YOYO',
    tagalogGuide: 'Apat na letra: YO at YO para mabuo ang laruang YOYO.',
  },
  {
    id: 'r3-4l-3',
    groupId: 3,
    category: 'four_letters',
    text: 'GATA',
    phoneticGuide: 'GA + TA = GATA',
    tagalogGuide: 'Apat na letra: GA at TA para mabuo ang GATA.',
  },
  {
    id: 'r3-4l-4',
    groupId: 3,
    category: 'four_letters',
    text: 'LIMA',
    phoneticGuide: 'LI + MA = LIMA',
    tagalogGuide: 'Apat na letra: LI at MA para mabuo ang bilang na LIMA.',
  },

  // Pangungusap
  {
    id: 'r3-sen-1',
    groupId: 3,
    category: 'sentence',
    text: 'Nasa lata ang gatas.',
    phoneticGuide: 'Na-sa la-ta ang ga-tas.',
    tagalogGuide: 'Basahin nang tuloy-tuloy ang pangungusap.',
  },
  {
    id: 'r3-sen-2',
    groupId: 3,
    category: 'sentence',
    text: 'May bagong yoyo ang bata.',
    phoneticGuide: 'May ba-gong yo-yo ang ba-ta.',
    tagalogGuide: 'Basahin nang malinaw ang bawat salita.',
  },

  // ==================== PANGKAT 4 (P, R, D, H, W) ====================
  // 2 Letra (Pantig)
  {
    id: 'r4-2l-1',
    groupId: 4,
    category: 'two_letters',
    text: 'PA',
    phoneticGuide: 'P + A = PA',
    tagalogGuide: 'Pagsamahin ang P at A para mabuo ang PA.',
  },
  {
    id: 'r4-2l-2',
    groupId: 4,
    category: 'two_letters',
    text: 'PU',
    phoneticGuide: 'P + U = PU',
    tagalogGuide: 'Pagsamahin ang P at U para mabuo ang PU.',
  },
  {
    id: 'r4-2l-3',
    groupId: 4,
    category: 'two_letters',
    text: 'RE',
    phoneticGuide: 'R + E = RE',
    tagalogGuide: 'Pagsamahin ang R at E para mabuo ang RE.',
  },
  {
    id: 'r4-2l-4',
    groupId: 4,
    category: 'two_letters',
    text: 'DA',
    phoneticGuide: 'D + A = DA',
    tagalogGuide: 'Pagsamahin ang D at A para mabuo ang DA.',
  },
  {
    id: 'r4-2l-5',
    groupId: 4,
    category: 'two_letters',
    text: 'HA',
    phoneticGuide: 'H + A = HA',
    tagalogGuide: 'Pagsamahin ang H at A para mabuo ang HA.',
  },

  // 3 Letra
  {
    id: 'r4-3l-1',
    groupId: 4,
    category: 'three_letters',
    text: 'DAM',
    phoneticGuide: 'D + A + M = DAM',
    tagalogGuide: 'Tatlong letra na pinagsama: DAM.',
  },
  {
    id: 'r4-3l-2',
    groupId: 4,
    category: 'three_letters',
    text: 'POS',
    phoneticGuide: 'P + O + S = POS',
    tagalogGuide: 'Tatlong letra na pinagsama: POS.',
  },
  {
    id: 'r4-3l-3',
    groupId: 4,
    category: 'three_letters',
    text: 'RAW',
    phoneticGuide: 'R + A + W = RAW',
    tagalogGuide: 'Tatlong letra na pinagsama: RAW.',
  },

  // 4 Letra
  {
    id: 'r4-4l-1',
    groupId: 4,
    category: 'four_letters',
    text: 'PUSA',
    phoneticGuide: 'PU + SA = PUSA',
    tagalogGuide: 'Apat na letra: PU at SA para mabuo ang PUSA.',
    sampleSentence: 'May pusa sa damuhan.',
  },
  {
    id: 'r4-4l-2',
    groupId: 4,
    category: 'four_letters',
    text: 'RELO',
    phoneticGuide: 'RE + LO = RELO',
    tagalogGuide: 'Apat na letra: RE at LO para mabuo ang RELO.',
    sampleSentence: 'Nasa mesa ang relo.',
  },
  {
    id: 'r4-4l-3',
    groupId: 4,
    category: 'four_letters',
    text: 'DAMO',
    phoneticGuide: 'DA + MO = DAMO',
    tagalogGuide: 'Apat na letra: DA at MO para mabuo ang DAMO.',
  },
  {
    id: 'r4-4l-4',
    groupId: 4,
    category: 'four_letters',
    text: 'HARI',
    phoneticGuide: 'HA + RI = HARI',
    tagalogGuide: 'Apat na letra: HA at RI para mabuo ang HARI.',
  },

  // Pangungusap
  {
    id: 'r4-sen-1',
    groupId: 4,
    category: 'sentence',
    text: 'May pusa sa damuhan.',
    phoneticGuide: 'May pu-sa sa da-mu-han.',
    tagalogGuide: 'Basahin nang malinaw at buo ang pangungusap.',
  },
  {
    id: 'r4-sen-2',
    groupId: 4,
    category: 'sentence',
    text: 'Nasa mesa ang bagong relo.',
    phoneticGuide: 'Na-sa me-sa ang ba-gong re-lo.',
    tagalogGuide: 'Basahin ang buong pangungusap.',
  },
];

export const WRITING_ITEMS: WritingItem[] = [
  // Group 1
  {
    id: 'w1-1',
    groupId: 1,
    targetText: 'Ma',
    guideType: 'two_letters',
    instruction: 'Isulat ang 2 letra "Ma". Ang malaking "M" ay mula asul hanggang asul, at ang "a" ay nasa gitnang pula.',
    strokeTips: [
      'Magsimula sa itaas na asul na linya para sa malaking M.',
      'Ang maliit na "a" ay manatili sa pagitan ng pulang linya at ibabang asul na linya.',
    ],
  },
  {
    id: 'w1-2',
    groupId: 1,
    targetText: 'Sa',
    guideType: 'two_letters',
    instruction: 'Isulat ang 2 letra "Sa". Siguraduhing pantay ang hugis ng kurba sa mga linya.',
    strokeTips: [
      'Ang malaking S ay magsisimula sa itaas na asul na linya pababa sa ibabang asul.',
      'Ang "a" ay manatili sa pulang linya pababa sa asul.',
    ],
  },
  {
    id: 'w1-3',
    groupId: 1,
    targetText: 'Aso',
    guideType: 'three_letters',
    instruction: 'Isulat ang 3 letrang salitang "Aso". Magsimula sa malaking A at sundan ng s at o.',
    strokeTips: [
      'Ang malaking A ay mula itaas na asul pababa sa ibabang asul.',
      'Ang "s" at "o" ay maingat na isulat sa loob ng pulang linya at ibabang asul.',
    ],
  },
  {
    id: 'w1-4',
    groupId: 1,
    targetText: 'Mama',
    guideType: 'four_letters',
    instruction: 'Isulat ang 4 na letrang salitang "Mama". Panatilihing pantay ang espasyo ng bawat letra.',
    strokeTips: [
      'Malaking M sa simula na aabot sa itaas na asul na linya.',
      'Ang mga letrang "a", "m", at "a" ay pantay lamang sa gitnang pulang linya.',
    ],
  },

  // Group 2
  {
    id: 'w2-1',
    groupId: 2,
    targetText: 'Ba',
    guideType: 'two_letters',
    instruction: 'Isulat ang 2 letra "Ba". Ang B ay may tuwid na linya at dalawang bilog.',
    strokeTips: [
      'Tuwid na linya mula sa itaas na asul hanggang ibabang asul.',
      'Dalawang kurba sa kanan ng B, at maliit na "a" sa gitnang pulang linya.',
    ],
  },
  {
    id: 'w2-2',
    groupId: 2,
    targetText: 'Ta',
    guideType: 'two_letters',
    instruction: 'Isulat ang 2 letra "Ta". Magsimula sa itaas na asul na linya para sa T.',
    strokeTips: [
      'Pahalang na linya sa itaas na asul at pababang tuwid na linya.',
      'Isunod ang "a" sa pulang linya.',
    ],
  },
  {
    id: 'w2-3',
    groupId: 2,
    targetText: 'Bote',
    guideType: 'four_letters',
    instruction: 'Isulat ang 4 na letrang salitang "Bote". Panoorin ang matangkad na letrang t!',
    strokeTips: [
      'Malaking B sa itaas na asul.',
      'Ang letrang "t" ay matangkad din patungo sa itaas na asul na linya.',
    ],
  },
  {
    id: 'w2-4',
    groupId: 2,
    targetText: 'Tasa',
    guideType: 'four_letters',
    instruction: 'Isulat ang 4 na letrang salitang "Tasa" nang maayos sa loob ng mga linya.',
    strokeTips: [
      'Malaking T mula itaas na asul.',
      'Ang "a", "s", at "a" ay pantay sa gitnang pulang linya.',
    ],
  },
  {
    id: 'w2-5',
    groupId: 2,
    targetText: 'Kubo',
    guideType: 'four_letters',
    instruction: 'Isulat ang 4 na letrang salitang "Kubo".',
    strokeTips: [
      'Malaking K sa simula.',
      'Ang "b" ay may matangkad na linya na aabot sa itaas na asul na linya.',
    ],
  },

  // Group 3
  {
    id: 'w3-1',
    groupId: 3,
    targetText: 'La',
    guideType: 'two_letters',
    instruction: 'Isulat ang 2 letra "La".',
    strokeTips: [
      'Malaking L mula itaas na asul patungo sa ibaba at pakanan.',
      'Maliit na "a" sa gitnang pulang linya.',
    ],
  },
  {
    id: 'w3-2',
    groupId: 3,
    targetText: 'Ga',
    guideType: 'two_letters',
    instruction: 'Isulat ang 2 letra "Ga".',
    strokeTips: [
      'Malaking G mula itaas na asul paikot pababa at may pahalang na linya.',
      'Maliit na "a" sa gitnang pulang linya.',
    ],
  },
  {
    id: 'w3-3',
    groupId: 3,
    targetText: 'Lata',
    guideType: 'four_letters',
    instruction: 'Isulat ang 4 na letrang salitang "Lata".',
    strokeTips: [
      'Malaking L sa itaas na asul.',
      'Ang "t" ay matangkad din mula itaas na asul.',
    ],
  },
  {
    id: 'w3-4',
    groupId: 3,
    targetText: 'Yoyo',
    guideType: 'four_letters',
    instruction: 'Isulat ang 4 na letrang salitang "Yoyo". Ang buntot ng "y" ay bababa sa ibabang asul na linya!',
    strokeTips: [
      'Ang letrang "y" ay may pababang linya na bumababa sa ibabang asul na linya.',
    ],
  },
  {
    id: 'w3-5',
    groupId: 3,
    targetText: 'Gabi',
    guideType: 'four_letters',
    instruction: 'Isulat ang 4 na letrang salitang "Gabi".',
    strokeTips: [
      'Malaking G mula itaas na asul.',
      'Ang letrang "b" ay matangkad at aabot sa itaas na asul.',
    ],
  },

  // Group 4
  {
    id: 'w4-1',
    groupId: 4,
    targetText: 'Pa',
    guideType: 'two_letters',
    instruction: 'Isulat ang 2 letra "Pa".',
    strokeTips: [
      'Malaking P mula itaas na asul na may kurba sa gitnang pula.',
      'Isunod ang "a" sa loob ng pulang linya.',
    ],
  },
  {
    id: 'w4-2',
    groupId: 4,
    targetText: 'Da',
    guideType: 'two_letters',
    instruction: 'Isulat ang 2 letra "Da".',
    strokeTips: [
      'Malaking D mula itaas na asul na may malaking kurba.',
      'Isunod ang "a" sa gitnang pulang linya.',
    ],
  },
  {
    id: 'w4-3',
    groupId: 4,
    targetText: 'Pusa',
    guideType: 'four_letters',
    instruction: 'Isulat ang 4 na letrang salitang "Pusa".',
    strokeTips: [
      'Malaking P sa itaas na asul.',
      'Ang "u", "s", at "a" ay manatili sa gitnang pulang linya pababa sa asul.',
    ],
  },
  {
    id: 'w4-4',
    groupId: 4,
    targetText: 'Relo',
    guideType: 'four_letters',
    instruction: 'Isulat ang 4 na letrang salitang "Relo".',
    strokeTips: [
      'Malaking R sa unahan.',
      'Ang letrang "l" ay matangkad at aabot sa itaas na asul na linya.',
    ],
  },
  {
    id: 'w4-5',
    groupId: 4,
    targetText: 'Damo',
    guideType: 'four_letters',
    instruction: 'Isulat ang 4 na letrang salitang "Damo".',
    strokeTips: [
      'Malaking D mula itaas na asul pababa.',
      'Ang mga letrang "a", "m", at "o" ay manatili sa gitnang pulang linya.',
    ],
  },
];

import { MATH_CURRICULUM_ITEMS } from './mathData';
export const MATH_ITEMS: MathItem[] = MATH_CURRICULUM_ITEMS;

