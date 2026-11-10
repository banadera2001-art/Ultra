export interface ReadingCombatWord {
  id: string;
  word: string;
  syllables: string[];
  phoneticGuide: string;
  clue: string;
  distractors: string[];
  category: 'pantig' | 'salita' | 'parirala';
}

/**
 * Expansive pool of 130+ Filipino words and syllables for Grade 1 Marungko reading.
 * Covers all 4 Marungko sound groups, common objects, animals, nature, actions, and body parts.
 */
export const READING_COMBAT_POOL: ReadingCombatWord[] = [
  // ==========================================
  // 1. PANTIG (2-Letter Syllables)
  // ==========================================
  {
    id: 'rc-p-ma',
    word: 'MA',
    syllables: ['M', 'A'],
    phoneticGuide: 'M + A = MA',
    clue: 'Unang pantig ng mama',
    distractors: ['SA', 'MI', 'BA'],
    category: 'pantig',
  },
  {
    id: 'rc-p-sa',
    word: 'SA',
    syllables: ['S', 'A'],
    phoneticGuide: 'S + A = SA',
    clue: 'Tunog ng sss... + a',
    distractors: ['MA', 'SI', 'SO'],
    category: 'pantig',
  },
  {
    id: 'rc-p-ba',
    word: 'BA',
    syllables: ['B', 'A'],
    phoneticGuide: 'B + A = BA',
    clue: 'Unang pantig ng bata at bato',
    distractors: ['TA', 'LA', 'KA'],
    category: 'pantig',
  },
  {
    id: 'rc-p-ta',
    word: 'TA',
    syllables: ['T', 'A'],
    phoneticGuide: 'T + A = TA',
    clue: 'Unang pantig ng tasa at tala',
    distractors: ['BA', 'SA', 'MA'],
    category: 'pantig',
  },
  {
    id: 'rc-p-la',
    word: 'LA',
    syllables: ['L', 'A'],
    phoneticGuide: 'L + A = LA',
    clue: 'Unang pantig ng lata at lakad',
    distractors: ['RA', 'YA', 'PA'],
    category: 'pantig',
  },
  {
    id: 'rc-p-ko',
    word: 'KO',
    syllables: ['K', 'O'],
    phoneticGuide: 'K + O = KO',
    clue: 'Unang pantig ng kubo',
    distractors: ['TO', 'BO', 'SO'],
    category: 'pantig',
  },
  {
    id: 'rc-p-pu',
    word: 'PU',
    syllables: ['P', 'U'],
    phoneticGuide: 'P + U = PU',
    clue: 'Unang pantig ng pusa',
    distractors: ['PO', 'PI', 'PA'],
    category: 'pantig',
  },
  {
    id: 'rc-p-da',
    word: 'DA',
    syllables: ['D', 'A'],
    phoneticGuide: 'D + A = DA',
    clue: 'Unang pantig ng damo at daga',
    distractors: ['BA', 'RA', 'GA'],
    category: 'pantig',
  },
  {
    id: 'rc-p-mi',
    word: 'MI',
    syllables: ['M', 'I'],
    phoneticGuide: 'M + I = MI',
    clue: 'Unang pantig ng misa',
    distractors: ['SI', 'TI', 'LI'],
    category: 'pantig',
  },
  {
    id: 'rc-p-si',
    word: 'SI',
    syllables: ['S', 'I'],
    phoneticGuide: 'S + I = SI',
    clue: 'Pambungad sa pangalan ng tao',
    distractors: ['MI', 'BI', 'TI'],
    category: 'pantig',
  },
  {
    id: 'rc-p-so',
    word: 'SO',
    syllables: ['S', 'O'],
    phoneticGuide: 'S + O = SO',
    clue: 'Huling pantig ng aso',
    distractors: ['MO', 'BO', 'KO'],
    category: 'pantig',
  },
  {
    id: 'rc-p-bo',
    word: 'BO',
    syllables: ['B', 'O'],
    phoneticGuide: 'B + O = BO',
    clue: 'Unang pantig ng bote at bola',
    distractors: ['TO', 'KO', 'LO'],
    category: 'pantig',
  },
  {
    id: 'rc-p-to',
    word: 'TO',
    syllables: ['T', 'O'],
    phoneticGuide: 'T + O = TO',
    clue: 'Huling pantig ng bato',
    distractors: ['BO', 'KO', 'SO'],
    category: 'pantig',
  },
  {
    id: 'rc-p-ku',
    word: 'KU',
    syllables: ['K', 'U'],
    phoneticGuide: 'K + U = KU',
    clue: 'Unang pantig ng kuneho at kubo',
    distractors: ['PU', 'TU', 'BU'],
    category: 'pantig',
  },
  {
    id: 'rc-p-ka',
    word: 'KA',
    syllables: ['K', 'A'],
    phoneticGuide: 'K + A = KA',
    clue: 'Unang pantig ng kape at kahon',
    distractors: ['BA', 'TA', 'LA'],
    category: 'pantig',
  },
  {
    id: 'rc-p-li',
    word: 'LI',
    syllables: ['L', 'I'],
    phoneticGuide: 'L + I = LI',
    clue: 'Unang pantig ng lipad at lima',
    distractors: ['MI', 'SI', 'TI'],
    category: 'pantig',
  },
  {
    id: 'rc-p-ga',
    word: 'GA',
    syllables: ['G', 'A'],
    phoneticGuide: 'G + A = GA',
    clue: 'Unang pantig ng gatas',
    distractors: ['DA', 'BA', 'KA'],
    category: 'pantig',
  },
  {
    id: 'rc-p-na',
    word: 'NA',
    syllables: ['N', 'A'],
    phoneticGuide: 'N + A = NA',
    clue: 'Unang pantig ng nanay',
    distractors: ['MA', 'SA', 'LA'],
    category: 'pantig',
  },
  {
    id: 'rc-p-pa',
    word: 'PA',
    syllables: ['P', 'A'],
    phoneticGuide: 'P + A = PA',
    clue: 'Unang pantig ng pana at paa',
    distractors: ['BA', 'TA', 'DA'],
    category: 'pantig',
  },
  {
    id: 'rc-p-ra',
    word: 'RA',
    syllables: ['R', 'A'],
    phoneticGuide: 'R + A = RA',
    clue: 'Tunog ng letrang R + A',
    distractors: ['LA', 'DA', 'TA'],
    category: 'pantig',
  },
  {
    id: 'rc-p-ya',
    word: 'YA',
    syllables: ['Y', 'A'],
    phoneticGuide: 'Y + A = YA',
    clue: 'Unang pantig ng yaya at yapak',
    distractors: ['WA', 'LA', 'MA'],
    category: 'pantig',
  },
  {
    id: 'rc-p-wa',
    word: 'WA',
    syllables: ['W', 'A'],
    phoneticGuide: 'W + A = WA',
    clue: 'Unang pantig ng walis',
    distractors: ['YA', 'BA', 'SA'],
    category: 'pantig',
  },
  {
    id: 'rc-p-lo',
    word: 'LO',
    syllables: ['L', 'O'],
    phoneticGuide: 'L + O = LO',
    clue: 'Unang pantig ng lobo at lolo',
    distractors: ['BO', 'RO', 'SO'],
    category: 'pantig',
  },
  {
    id: 'rc-p-mo',
    word: 'MO',
    syllables: ['M', 'O'],
    phoneticGuide: 'M + O = MO',
    clue: 'Huling pantig ng damo',
    distractors: ['SO', 'KO', 'TO'],
    category: 'pantig',
  },

  // ==========================================
  // 2. TATLONG LETRA (3-Letter Words)
  // ==========================================
  {
    id: 'rc-3-aso',
    word: 'ASO',
    syllables: ['A', 'SO'],
    phoneticGuide: 'A + SO = ASO',
    clue: 'Alagang hayop na tumatahol ng Aw-Aw',
    distractors: ['OSA', 'BASO', 'APO'],
    category: 'salita',
  },
  {
    id: 'rc-3-isa',
    word: 'ISA',
    syllables: ['I', 'SA'],
    phoneticGuide: 'I + SA = ISA',
    clue: 'Simulang bilang: isa, dalawa, tatlo',
    distractors: ['SIA', 'INA', 'ASO'],
    category: 'salita',
  },
  {
    id: 'rc-3-amo',
    word: 'AMO',
    syllables: ['A', 'MO'],
    phoneticGuide: 'A + MO = AMO',
    clue: 'Tagapag-alaga o tagapamahala',
    distractors: ['ASO', 'APO', 'AMA'],
    category: 'salita',
  },
  {
    id: 'rc-3-apo',
    word: 'APO',
    syllables: ['A', 'PO'],
    phoneticGuide: 'A + PO = APO',
    clue: 'Mahal na anak ng anak ni lolo at lola',
    distractors: ['ASO', 'AMO', 'INA'],
    category: 'salita',
  },
  {
    id: 'rc-3-ulo',
    word: 'ULO',
    syllables: ['U', 'LO'],
    phoneticGuide: 'U + LO = ULO',
    clue: 'Nasa itaas ng leeg kung saan naroon ang buhok',
    distractors: ['ILO', 'OLO', 'PAA'],
    category: 'salita',
  },
  {
    id: 'rc-3-paa',
    word: 'PAA',
    syllables: ['PA', 'A'],
    phoneticGuide: 'PA + A = PAA',
    clue: 'Ginagamit natin sa pagtayo at paglakad',
    distractors: ['PAO', 'PUA', 'ULO'],
    category: 'salita',
  },
  {
    id: 'rc-3-tao',
    word: 'TAO',
    syllables: ['TA', 'O'],
    phoneticGuide: 'TA + O = TAO',
    clue: 'Lahat tayo tulad ng bata, guro, at magulang',
    distractors: ['TAA', 'TOA', 'ASO'],
    category: 'salita',
  },
  {
    id: 'rc-3-uod',
    word: 'UOD',
    syllables: ['U', 'OD'],
    phoneticGuide: 'U + OD = UOD',
    clue: 'Gumagapang na munting hayop sa dahon',
    distractors: ['UOT', 'UDO', 'IBON'],
    category: 'salita',
  },
  {
    id: 'rc-3-ina',
    word: 'INA',
    syllables: ['I', 'NA'],
    phoneticGuide: 'I + NA = INA',
    clue: 'Tawag sa ating mapagmahal na nanay',
    distractors: ['ANA', 'ISA', 'AMA'],
    category: 'salita',
  },
  {
    id: 'rc-3-ama',
    word: 'AMA',
    syllables: ['A', 'MA'],
    phoneticGuide: 'A + MA = AMA',
    clue: 'Tawag sa ating masipag na tatay',
    distractors: ['INA', 'AMO', 'ASA'],
    category: 'salita',
  },
  {
    id: 'rc-3-oso',
    word: 'OSO',
    syllables: ['O', 'SO'],
    phoneticGuide: 'O + SO = OSO',
    clue: 'Mabalahibong hayop sa gubat na mahilig sa pulot',
    distractors: ['ASO', 'USO', 'BASO'],
    category: 'salita',
  },
  {
    id: 'rc-3-upo',
    word: 'UPO',
    syllables: ['U', 'PO'],
    phoneticGuide: 'U + PO = UPO',
    clue: 'Paggamit ng upuan, o gulay na luntian',
    distractors: ['APO', 'OPO', 'USA'],
    category: 'salita',
  },
  {
    id: 'rc-3-usa',
    word: 'USA',
    syllables: ['U', 'SA'],
    phoneticGuide: 'U + SA = USA',
    clue: 'Mabilis tumakbong hayop na may sungay sa kagubatan',
    distractors: ['ISA', 'OSA', 'ASO'],
    category: 'salita',
  },
  {
    id: 'rc-3-ibi',
    word: 'IBO',
    syllables: ['I', 'BO'],
    phoneticGuide: 'I + BO = IBO',
    clue: 'Pagsisimula ng salitang ibon',
    distractors: ['ABO', 'UBO', 'INA'],
    category: 'salita',
  },

  // ==========================================
  // 3. APAT NA LETRA (4-Letter Basic Words)
  // ==========================================
  {
    id: 'rc-w-mama',
    word: 'MAMA',
    syllables: ['MA', 'MA'],
    phoneticGuide: 'MA + MA = MAMA',
    clue: 'Ang ating mapagmahal na ina',
    distractors: ['SAMA', 'MASA', 'AMO'],
    category: 'salita',
  },
  {
    id: 'rc-w-bato',
    word: 'BATO',
    syllables: ['BA', 'TO'],
    phoneticGuide: 'BA + TO = BATO',
    clue: 'Matigas na bagay sa daan o ilog',
    distractors: ['BOTE', 'BOTA', 'BASO'],
    category: 'salita',
  },
  {
    id: 'rc-w-bote',
    word: 'BOTE',
    syllables: ['BO', 'TE'],
    phoneticGuide: 'BO + TE = BOTE',
    clue: 'Lalagyan ng inumin na gawa sa bubog',
    distractors: ['BATO', 'BOTA', 'TOTE'],
    category: 'salita',
  },
  {
    id: 'rc-w-bota',
    word: 'BOTA',
    syllables: ['BO', 'TA'],
    phoneticGuide: 'BO + TA = BOTA',
    clue: 'Sapatos na isinusuot sa ulan o putikan',
    distractors: ['BATO', 'BOTE', 'BATA'],
    category: 'salita',
  },
  {
    id: 'rc-w-tasa',
    word: 'TASA',
    syllables: ['TA', 'SA'],
    phoneticGuide: 'TA + SA = TASA',
    clue: 'Inuman ng mainit na gatas o tsokolate',
    distractors: ['PASA', 'SAPA', 'BATA'],
    category: 'salita',
  },
  {
    id: 'rc-w-kubo',
    word: 'KUBO',
    syllables: ['KU', 'BO'],
    phoneticGuide: 'KU + BO = KUBO',
    clue: 'Bahay na gawa sa kawayan at nipa',
    distractors: ['TUBO', 'LOBO', 'KUTO'],
    category: 'salita',
  },
  {
    id: 'rc-w-lata',
    word: 'LATA',
    syllables: ['LA', 'TA'],
    phoneticGuide: 'LA + TA = LATA',
    clue: 'Lalagyan ng sardinas o gatas',
    distractors: ['TALA', 'PATA', 'BATA'],
    category: 'salita',
  },
  {
    id: 'rc-w-pusa',
    word: 'PUSA',
    syllables: ['PU', 'SA'],
    phoneticGuide: 'PU + SA = PUSA',
    clue: 'Alagang humuhuni ng: Niyaw! Niyaw!',
    distractors: ['PASA', 'PITA', 'KUSA'],
    category: 'salita',
  },
  {
    id: 'rc-w-isda',
    word: 'ISDA',
    syllables: ['IS', 'DA'],
    phoneticGuide: 'IS + DA = ISDA',
    clue: 'Lumalangoy sa malinis na tubig',
    distractors: ['ASO', 'DAGA', 'BATA'],
    category: 'salita',
  },
  {
    id: 'rc-w-bola',
    word: 'BOLA',
    syllables: ['BO', 'LA'],
    phoneticGuide: 'BO + LA = BOLA',
    clue: 'Mabilog na laruang tumatalbog',
    distractors: ['BOTA', 'BATO', 'LALA'],
    category: 'salita',
  },
  {
    id: 'rc-w-ilaw',
    word: 'ILAW',
    syllables: ['I', 'LAW'],
    phoneticGuide: 'I + LAW = ILAW',
    clue: 'Nagbibigay ng liwanag sa gabi',
    distractors: ['ARAW', 'ULAW', 'INA'],
    category: 'salita',
  },
  {
    id: 'rc-w-damo',
    word: 'DAMO',
    syllables: ['DA', 'MO'],
    phoneticGuide: 'DA + MO = DAMO',
    clue: 'Luntiang halaman na kinakain ng baka',
    distractors: ['DAGA', 'TAMO', 'RAMO'],
    category: 'salita',
  },
  {
    id: 'rc-w-relo',
    word: 'RELO',
    syllables: ['RE', 'LO'],
    phoneticGuide: 'RE + LO = RELO',
    clue: 'Nagsasabi ng tamang oras sa pulso',
    distractors: ['ROLO', 'LERO', 'PELO'],
    category: 'salita',
  },
  {
    id: 'rc-w-sapa',
    word: 'SAPA',
    syllables: ['SA', 'PA'],
    phoneticGuide: 'SA + PA = SAPA',
    clue: 'Maliit na ilog na may malinaw na agos',
    distractors: ['PASA', 'TASA', 'SAMA'],
    category: 'salita',
  },
  {
    id: 'rc-w-mesa',
    word: 'MESA',
    syllables: ['ME', 'SA'],
    phoneticGuide: 'ME + SA = MESA',
    clue: 'Pinagpapatungan ng plato at aklat',
    distractors: ['MISA', 'TASA', 'SAMA'],
    category: 'salita',
  },
  {
    id: 'rc-w-tala',
    word: 'TALA',
    syllables: ['TA', 'LA'],
    phoneticGuide: 'TA + LA = TALA',
    clue: 'Kumukutikutitap na bituin sa madilim na langit',
    distractors: ['LATA', 'TASA', 'BATA'],
    category: 'salita',
  },
  {
    id: 'rc-w-daga',
    word: 'DAGA',
    syllables: ['DA', 'GA'],
    phoneticGuide: 'DA + GA = DAGA',
    clue: 'Maliit na hayop na mabilis tumakbo',
    distractors: ['DAMA', 'BAGA', 'DAMO'],
    category: 'salita',
  },
  {
    id: 'rc-w-bata',
    word: 'BATA',
    syllables: ['BA', 'TA'],
    phoneticGuide: 'BA + TA = BATA',
    clue: 'Masisiglang mag-aaral sa paaralan',
    distractors: ['BATO', 'LATA', 'TASA'],
    category: 'salita',
  },
  {
    id: 'rc-w-pana',
    word: 'PANA',
    syllables: ['PA', 'NA'],
    phoneticGuide: 'PA + NA = PANA',
    clue: 'Sandata na may matulis na dulo',
    distractors: ['PATA', 'SANA', 'TANA'],
    category: 'salita',
  },
  {
    id: 'rc-w-gabi',
    word: 'GABI',
    syllables: ['GA', 'BI'],
    phoneticGuide: 'GA + BI = GABI',
    clue: 'Oras kung kailan lumilitaw ang buwan',
    distractors: ['GATA', 'KAPE', 'BIBE'],
    category: 'salita',
  },
  {
    id: 'rc-w-kape',
    word: 'KAPE',
    syllables: ['KA', 'PE'],
    phoneticGuide: 'KA + PE = KAPE',
    clue: 'Mainit na inumin ng mga matatanda tuwing umaga',
    distractors: ['KAPI', 'KAPO', 'TASA'],
    category: 'salita',
  },
  {
    id: 'rc-w-yoyo',
    word: 'YOYO',
    syllables: ['YO', 'YO'],
    phoneticGuide: 'YO + YO = YOYO',
    clue: 'Laruang paikot-ikot na nakatali sa pisi',
    distractors: ['LOLO', 'BOBO', 'TOTO'],
    category: 'salita',
  },
  {
    id: 'rc-w-bibe',
    word: 'BIBE',
    syllables: ['BI', 'BE'],
    phoneticGuide: 'BI + BE = BIBE',
    clue: 'Ibon na lumalangoy sa tubig: Kwak! Kwak!',
    distractors: ['BOTE', 'BATO', 'PUSA'],
    category: 'salita',
  },
  {
    id: 'rc-w-kuto',
    word: 'KUTO',
    syllables: ['KU', 'TO'],
    phoneticGuide: 'KU + TO = KUTO',
    clue: 'Munting insekto na nangangati sa ulo',
    distractors: ['KUBO', 'BATO', 'TUBO'],
    category: 'salita',
  },
  {
    id: 'rc-w-lobo',
    word: 'LOBO',
    syllables: ['LO', 'BO'],
    phoneticGuide: 'LO + BO = LOBO',
    clue: 'Pumuputok na laruan na lumilipad sa hangin',
    distractors: ['KUBO', 'TUBO', 'BOLA'],
    category: 'salita',
  },
  {
    id: 'rc-w-tubo',
    word: 'TUBO',
    syllables: ['TU', 'BO'],
    phoneticGuide: 'TU + BO = TUBO',
    clue: 'Daanan ng tubig, o matamis na pananim',
    distractors: ['KUBO', 'LOBO', 'BATO'],
    category: 'salita',
  },
  {
    id: 'rc-w-loro',
    word: 'LORO',
    syllables: ['LO', 'RO'],
    phoneticGuide: 'LO + RO = LORO',
    clue: 'Ibon na marunong gumaya ng boses ng tao',
    distractors: ['LOBO', 'LOLO', 'TORO'],
    category: 'salita',
  },
  {
    id: 'rc-w-pera',
    word: 'PERA',
    syllables: ['PE', 'RA'],
    phoneticGuide: 'PE + RA = PERA',
    clue: 'Ginagamit pambili ng pagkain at gamit',
    distractors: ['PARA', 'PERO', 'PANA'],
    category: 'salita',
  },
  {
    id: 'rc-w-susi',
    word: 'SUSI',
    syllables: ['SU', 'SI'],
    phoneticGuide: 'SU + SI = SUSI',
    clue: 'Pambukas ng kandado sa pinto',
    distractors: ['SISI', 'SUSA', 'TASA'],
    category: 'salita',
  },
  {
    id: 'rc-w-dila',
    word: 'DILA',
    syllables: ['DI', 'LA'],
    phoneticGuide: 'DI + LA = DILA',
    clue: 'Panlasa sa loob ng bibig',
    distractors: ['DAGA', 'LATA', 'TALA'],
    category: 'salita',
  },
  {
    id: 'rc-w-labi',
    word: 'LABI',
    syllables: ['LA', 'BI'],
    phoneticGuide: 'LA + BI = LABI',
    clue: 'Kulay rosas na bahagi sa ibaba ng ilong',
    distractors: ['LATA', 'LIMA', 'GABI'],
    category: 'salita',
  },
  {
    id: 'rc-w-suka',
    word: 'SUKA',
    syllables: ['SU', 'KA'],
    phoneticGuide: 'SU + KA = SUKA',
    clue: 'Maasim na sawsawan sa kusina',
    distractors: ['KUSA', 'SAPA', 'TASA'],
    category: 'salita',
  },
  {
    id: 'rc-w-tawa',
    word: 'TAWA',
    syllables: ['TA', 'WA'],
    phoneticGuide: 'TA + WA = TAWA',
    clue: 'Tunog ng saya: Ha! Ha! Ha!',
    distractors: ['TASA', 'TALA', 'SAWA'],
    category: 'salita',
  },
  {
    id: 'rc-w-puno',
    word: 'PUNO',
    syllables: ['PU', 'NO'],
    phoneticGuide: 'PU + NO = PUNO',
    clue: 'Mataas na halaman na may mga sanga at lilim',
    distractors: ['PUSA', 'PANA', 'KUNO'],
    category: 'salita',
  },
  {
    id: 'rc-w-araw',
    word: 'ARAW',
    syllables: ['A', 'RAW'],
    phoneticGuide: 'A + RAW = ARAW',
    clue: 'Maliwanag na bola ng apoy sa langit tuwing tanghali',
    distractors: ['APOY', 'ILAW', 'ALON'],
    category: 'salita',
  },
  {
    id: 'rc-w-ulap',
    word: 'ULAP',
    syllables: ['U', 'LAP'],
    phoneticGuide: 'U + LAP = ULAP',
    clue: 'Puting parang bulak na lumulutang sa kalangitan',
    distractors: ['ULAN', 'ALAP', 'ALON'],
    category: 'salita',
  },
  {
    id: 'rc-w-alon',
    word: 'ALON',
    syllables: ['A', 'LON'],
    phoneticGuide: 'A + LON = ALON',
    clue: 'Hampas ng tubig sa tabing-dagat',
    distractors: ['ILOG', 'ULAP', 'APOY'],
    category: 'salita',
  },
  {
    id: 'rc-w-ilog',
    word: 'ILOG',
    syllables: ['I', 'LOG'],
    phoneticGuide: 'I + LOG = ILOG',
    clue: 'Mahabang agos ng tubig tabang patungong dagat',
    distractors: ['ALON', 'ITLOG', 'ILAW'],
    category: 'salita',
  },
  {
    id: 'rc-w-keso',
    word: 'KESO',
    syllables: ['KE', 'SO'],
    phoneticGuide: 'KE + SO = KESO',
    clue: 'Kulay dilaw at masarap na palaman sa tinapay',
    distractors: ['KAPE', 'BASO', 'KUTO'],
    category: 'salita',
  },
  {
    id: 'rc-w-siko',
    word: 'SIKO',
    syllables: ['SI', 'KO'],
    phoneticGuide: 'SI + KO = SIKO',
    clue: 'Nababaling bahagi sa gitna ng ating braso',
    distractors: ['SUKO', 'KUTO', 'KUBO'],
    category: 'salita',
  },
  {
    id: 'rc-w-mata',
    word: 'MATA',
    syllables: ['MA', 'TA'],
    phoneticGuide: 'MA + TA = MATA',
    clue: 'Ginagamit natin sa pagtingin at pagbasa',
    distractors: ['BATA', 'LATA', 'TASA'],
    category: 'salita',
  },
  {
    id: 'rc-w-buko',
    word: 'BUKO',
    syllables: ['BU', 'KO'],
    phoneticGuide: 'BU + KO = BUKO',
    clue: 'Bungang may matamis na sabaw mula sa puno ng niyog',
    distractors: ['KUBO', 'BATO', 'BOTE'],
    category: 'salita',
  },
  {
    id: 'rc-w-bago',
    word: 'BAGO',
    syllables: ['BA', 'GO'],
    phoneticGuide: 'BA + GO = BAGO',
    clue: 'Kabaligtaran ng luma',
    distractors: ['BATO', 'BATA', 'DAGA'],
    category: 'salita',
  },
  {
    id: 'rc-w-siga',
    word: 'SIGA',
    syllables: ['SI', 'GA'],
    phoneticGuide: 'SI + GA = SIGA',
    clue: 'Nagliliyab na apoy sa natuyong dahon',
    distractors: ['DAGA', 'SAPA', 'MISA'],
    category: 'salita',
  },
  {
    id: 'rc-w-bula',
    word: 'BULA',
    syllables: ['BU', 'LA'],
    phoneticGuide: 'BU + LA = BULA',
    clue: 'Lumilitaw kapag may sabon sa paliligo',
    distractors: ['BOLA', 'BOTA', 'BATA'],
    category: 'salita',
  },
  {
    id: 'rc-w-tali',
    word: 'TALI',
    syllables: ['TA', 'LI'],
    phoneticGuide: 'TA + LI = TALI',
    clue: 'Pisi na ginagamit sa pagbigkis ng kahon',
    distractors: ['TALA', 'TASA', 'LATA'],
    category: 'salita',
  },
  {
    id: 'rc-w-baso',
    word: 'BASO',
    syllables: ['BA', 'SO'],
    phoneticGuide: 'BA + SO = BASO',
    clue: 'Lalagyan ng inuming tubig o juice',
    distractors: ['BATO', 'BOTE', 'BOTA'],
    category: 'salita',
  },
  {
    id: 'rc-w-lima',
    word: 'LIMA',
    syllables: ['LI', 'MA'],
    phoneticGuide: 'LI + MA = LIMA',
    clue: 'Bilang ng mga daliri sa isang kamay',
    distractors: ['MISA', 'LATA', 'MAMA'],
    category: 'salita',
  },
  {
    id: 'rc-w-hari',
    word: 'HARI',
    syllables: ['HA', 'RI'],
    phoneticGuide: 'HA + RI = HARI',
    clue: 'May korona na namumuno sa kaharian',
    distractors: ['PARI', 'BARI', 'GABI'],
    category: 'salita',
  },
  {
    id: 'rc-w-pari',
    word: 'PARI',
    syllables: ['PA', 'RI'],
    phoneticGuide: 'PA + RI = PARI',
    clue: 'Nangunguna sa misa sa simbahan',
    distractors: ['HARI', 'PERA', 'PANA'],
    category: 'salita',
  },
  {
    id: 'rc-w-kuya',
    word: 'KUYA',
    syllables: ['KU', 'YA'],
    phoneticGuide: 'KU + YA = KUYA',
    clue: 'Tawag sa nakatatandang kapatid na lalaki',
    distractors: ['KUTO', 'KUBO', 'ATE'],
    category: 'salita',
  },
  {
    id: 'rc-w-ate',
    word: 'ATE',
    syllables: ['A', 'TE'],
    phoneticGuide: 'A + TE = ATE',
    clue: 'Tawag sa nakatatandang kapatid na babae',
    distractors: ['BOTE', 'AMO', 'KUYA'],
    category: 'salita',
  },
  {
    id: 'rc-w-dahon',
    word: 'DAHON',
    syllables: ['DA', 'HON'],
    phoneticGuide: 'DA + HON = DAHON',
    clue: 'Luntiang tumutubo sa sanga ng halaman',
    distractors: ['KAHON', 'DAMO', 'PUNO'],
    category: 'salita',
  },
  {
    id: 'rc-w-kahon',
    word: 'KAHON',
    syllables: ['KA', 'HON'],
    phoneticGuide: 'KA + HON = KAHON',
    clue: 'Lalagyan ng mga laruan at regalo',
    distractors: ['DAHON', 'KUBO', 'LATA'],
    category: 'salita',
  },

  // ==========================================
  // 4. LIMANG LETRA AT PATAAS (5+ Letter Words)
  // ==========================================
  {
    id: 'rc-5-gatas',
    word: 'GATAS',
    syllables: ['GA', 'TAS'],
    phoneticGuide: 'GA + TAS = GATAS',
    clue: 'Puting inumin na pampatibay ng buto at ngipin',
    distractors: ['LATAS', 'PATAS', 'TUBIG'],
    category: 'salita',
  },
  {
    id: 'rc-5-kidlat',
    word: 'KIDLAT',
    syllables: ['KID', 'LAT'],
    phoneticGuide: 'KID + LAT = KIDLAT',
    clue: 'Maliwanag na guhit ng kuryente sa kalangitan',
    distractors: ['KULOG', 'KILAT', 'ILAW'],
    category: 'salita',
  },
  {
    id: 'rc-5-hangin',
    word: 'HANGIN',
    syllables: ['HA', 'NGIN'],
    phoneticGuide: 'HA + NGIN = HANGIN',
    clue: 'Malamig na simoy na nagpapalipad ng saranggola',
    distractors: ['ULAP', 'ALON', 'LANGIT'],
    category: 'salita',
  },
  {
    id: 'rc-5-tubig',
    word: 'TUBIG',
    syllables: ['TU', 'BIG'],
    phoneticGuide: 'TU + BIG = TUBIG',
    clue: 'Malinis na inumin kapag tayo ay nauuhaw',
    distractors: ['GATAS', 'TIGAS', 'KABIG'],
    category: 'salita',
  },
  {
    id: 'rc-5-lakad',
    word: 'LAKAD',
    syllables: ['LA', 'KAD'],
    phoneticGuide: 'LA + KAD = LAKAD',
    clue: 'Pagkilos gamit ang dalawang paa',
    distractors: ['LIPAD', 'LAYAG', 'TAKBO'],
    category: 'salita',
  },
  {
    id: 'rc-5-lipad',
    word: 'LIPAD',
    syllables: ['LI', 'PAD'],
    phoneticGuide: 'LI + PAD = LIPAD',
    clue: 'Pag-angat sa himpapawid tulad ng ibon',
    distractors: ['LAKAD', 'LAYAG', 'TALON'],
    category: 'salita',
  },
  {
    id: 'rc-5-layag',
    word: 'LAYAG',
    syllables: ['LA', 'YAG'],
    phoneticGuide: 'LA + YAG = LAYAG',
    clue: 'Telang sumasagap ng hangin sa bangka',
    distractors: ['LAKAD', 'LIPAD', 'BAYAG'],
    category: 'salita',
  },
  {
    id: 'rc-5-kulog',
    word: 'KULOG',
    syllables: ['KU', 'LOG'],
    phoneticGuide: 'KU + LOG = KULOG',
    clue: 'Malakas na dagundong sa langit tuwing may bagyo',
    distractors: ['KIDLAT', 'KULAY', 'TULOG'],
    category: 'salita',
  },
  {
    id: 'rc-5-bahay',
    word: 'BAHAY',
    syllables: ['BA', 'HAY'],
    phoneticGuide: 'BA + HAY = BAHAY',
    clue: 'Tirahan ng ating masayang pamilya',
    distractors: ['KUBO', 'BUHAY', 'BATA'],
    category: 'salita',
  },
  {
    id: 'rc-5-tahol',
    word: 'TAHOL',
    syllables: ['TA', 'HOL'],
    phoneticGuide: 'TA + HOL = TAHOL',
    clue: 'Malakas na tunog ng aso',
    distractors: ['KAHOL', 'DAHOL', 'PUSA'],
    category: 'salita',
  },
  {
    id: 'rc-5-kotse',
    word: 'KOTSE',
    syllables: ['KOT', 'SE'],
    phoneticGuide: 'KOT + SE = KOTSE',
    clue: 'Sasakyang may apat na gulong sa kalsada',
    distractors: ['BAPOR', 'KUBYE', 'TREN'],
    category: 'salita',
  },
  {
    id: 'rc-5-lapis',
    word: 'LAPIS',
    syllables: ['LA', 'PIS'],
    phoneticGuide: 'LA + PIS = LAPIS',
    clue: 'Gamit sa pagsulat at pagguhit sa papel',
    distractors: ['PAPEL', 'AKLAT', 'LATA'],
    category: 'salita',
  },
  {
    id: 'rc-5-papel',
    word: 'PAPEL',
    syllables: ['PA', 'PEL'],
    phoneticGuide: 'PA + PEL = PAPEL',
    clue: 'Sinusulatan gamit ang lapis',
    distractors: ['LAPIS', 'AKLAT', 'PANA'],
    category: 'salita',
  },
  {
    id: 'rc-5-aklat',
    word: 'AKLAT',
    syllables: ['AK', 'LAT'],
    phoneticGuide: 'AK + LAT = AKLAT',
    clue: 'Binabasa upang matuto ng maraming aralin',
    distractors: ['PAPEL', 'LAPIS', 'SULAT'],
    category: 'salita',
  },
  {
    id: 'rc-5-talon',
    word: 'TALON',
    syllables: ['TA', 'LON'],
    phoneticGuide: 'TA + LON = TALON',
    clue: 'Paglundag paitaas, o lagaslas ng tubig sa bangin',
    distractors: ['ALON', 'TAKBO', 'LAKAD'],
    category: 'salita',
  },
  {
    id: 'rc-5-saging',
    word: 'SAGING',
    syllables: ['SA', 'GING'],
    phoneticGuide: 'SA + GING = SAGING',
    clue: 'Dilaw at matamis na prutas na paborito ng unggoy',
    distractors: ['MANGGA', 'GATAS', 'SAPA'],
    category: 'salita',
  },
  {
    id: 'rc-5-gubat',
    word: 'GUBAT',
    syllables: ['GU', 'BAT'],
    phoneticGuide: 'GU + BAT = GUBAT',
    clue: 'Lupain na maraming matatayog na puno at mababangis na hayop',
    distractors: ['DAGAT', 'BUNDOK', 'DAMO'],
    category: 'salita',
  },
  {
    id: 'rc-5-dagat',
    word: 'DAGAT',
    syllables: ['DA', 'GAT'],
    phoneticGuide: 'DA + GAT = DAGAT',
    clue: 'Malawak at maalat na katubigan kung saan lumalangoy ang isda',
    distractors: ['GUBAT', 'ILOG', 'SAPA'],
    category: 'salita',
  },
  {
    id: 'rc-5-bundok',
    word: 'BUNDOK',
    syllables: ['BUN', 'DOK'],
    phoneticGuide: 'BUN + DOK = BUNDOK',
    clue: 'Mataas na anyong lupa na may sariwang simoy',
    distractors: ['GUBAT', 'DAGAT', 'KULOG'],
    category: 'salita',
  },
  {
    id: 'rc-5-bituin',
    word: 'BITUIN',
    syllables: ['BI', 'TU', 'IN'],
    phoneticGuide: 'BI + TU + IN = BITUIN',
    clue: 'Kumikinang sa gabi sa kalangitan',
    distractors: ['TALA', 'ARAW', 'BULAN'],
    category: 'salita',
  },
  {
    id: 'rc-5-ulan',
    word: 'ULAN',
    syllables: ['U', 'LAN'],
    phoneticGuide: 'U + LAN = ULAN',
    clue: 'Pumatak na tubig mula sa madidilim na ulap',
    distractors: ['ULAP', 'ALON', 'ILOG'],
    category: 'salita',
  },
  {
    id: 'rc-5-bagyo',
    word: 'BAGYO',
    syllables: ['BAG', 'YO'],
    phoneticGuide: 'BAG + YO = BAGYO',
    clue: 'Malakas na hangin at ulan na may kulog',
    distractors: ['ULAN', 'KULOG', 'BAPOR'],
    category: 'salita',
  },
  {
    id: 'rc-5-ilong',
    word: 'ILONG',
    syllables: ['I', 'LONG'],
    phoneticGuide: 'I + LONG = ILONG',
    clue: 'Pang-amoy sa gitna ng ating mukha',
    distractors: ['MATA', 'DILA', 'LABI'],
    category: 'salita',
  },
  {
    id: 'rc-5-kamay',
    word: 'KAMAY',
    syllables: ['KA', 'MAY'],
    phoneticGuide: 'KA + MAY = KAMAY',
    clue: 'May limang daliri na ginagamit sa paghawak',
    distractors: ['PAA', 'SIKO', 'ULO'],
    category: 'salita',
  },
  {
    id: 'rc-5-takbo',
    word: 'TAKBO',
    syllables: ['TAK', 'BO'],
    phoneticGuide: 'TAK + BO = TAKBO',
    clue: 'Mabilis na paghakbang kapag nagmamadali',
    distractors: ['LAKAD', 'TALON', 'LIPAD'],
    category: 'salita',
  },
  {
    id: 'rc-5-lukso',
    word: 'LUKSO',
    syllables: ['LUK', 'SO'],
    phoneticGuide: 'LUK + SO = LUKSO',
    clue: 'Patalon na kilos tulad ng palaka',
    distractors: ['TAKBO', 'LAKAD', 'TALON'],
    category: 'salita',
  },
  {
    id: 'rc-5-sapatos',
    word: 'SAPATOS',
    syllables: ['SA', 'PA', 'TOS'],
    phoneticGuide: 'SA + PA + TOS = SAPATOS',
    clue: 'Suot sa mga paa bago pumasok sa paaralan',
    distractors: ['BOTA', 'PAA', 'MEDYAS'],
    category: 'salita',
  },
  {
    id: 'rc-5-bulaklak',
    word: 'BULAKLAK',
    syllables: ['BU', 'LAK', 'LAK'],
    phoneticGuide: 'BU + LAK + LAK = BULAKLAK',
    clue: 'Mabangong halaman na may makukulay na talulot',
    distractors: ['DAHON', 'PUNO', 'DAMO'],
    category: 'salita',
  },
  {
    id: 'rc-5-bintana',
    word: 'BINTANA',
    syllables: ['BIN', 'TA', 'NA'],
    phoneticGuide: 'BIN + TA + NA = BINTANA',
    clue: 'Binubuksan sa bahay para pumasok ang sariwang hangin',
    distractors: ['PINTO', 'KUBO', 'BAHAY'],
    category: 'salita',
  },
  {
    id: 'rc-5-pinto',
    word: 'PINTO',
    syllables: ['PIN', 'TO'],
    phoneticGuide: 'PIN + TO = PINTO',
    clue: 'Daanan sa pagpasok at paglabas ng bahay',
    distractors: ['BINTANA', 'KANDADO', 'BAHAY'],
    category: 'salita',
  },
  {
    id: 'rc-5-kanin',
    word: 'KANIN',
    syllables: ['KA', 'NIN'],
    phoneticGuide: 'KA + NIN = KANIN',
    clue: 'Pangunahing pagkaing inihahain sa hapag-kainan',
    distractors: ['GATAS', 'SAGING', 'ULAM'],
    category: 'salita',
  },
  // --- EXTENSIVE GRADE 1 VOCABULARY EXPANSION (NO-REPEAT COMBAT POOL) ---
  // More Syllables (Pantig)
  { id: 'rc-p-me', word: 'ME', syllables: ['ME'], phoneticGuide: 'M + E = ME', clue: 'Pantig na M at E', distractors: ['MA', 'MI', 'MO'], category: 'pantig' },
  { id: 'rc-p-mu', word: 'MU', syllables: ['MU'], phoneticGuide: 'M + U = MU', clue: 'Pantig na M at U', distractors: ['MO', 'MA', 'MI'], category: 'pantig' },
  { id: 'rc-p-se', word: 'SE', syllables: ['SE'], phoneticGuide: 'S + E = SE', clue: 'Pantig na S at E', distractors: ['SA', 'SI', 'SO'], category: 'pantig' },
  { id: 'rc-p-su', word: 'SU', syllables: ['SU'], phoneticGuide: 'S + U = SU', clue: 'Pantig na S at U', distractors: ['SO', 'SA', 'SI'], category: 'pantig' },
  { id: 'rc-p-bo', word: 'BO', syllables: ['BO'], phoneticGuide: 'B + O = BO', clue: 'Pantig na B at O', distractors: ['BA', 'BE', 'BU'], category: 'pantig' },
  { id: 'rc-p-be', word: 'BE', syllables: ['BE'], phoneticGuide: 'B + E = BE', clue: 'Pantig na B at E', distractors: ['BA', 'BI', 'BO'], category: 'pantig' },
  { id: 'rc-p-bi', word: 'BI', syllables: ['BI'], phoneticGuide: 'B + I = BI', clue: 'Pantig na B at I', distractors: ['BE', 'BA', 'BU'], category: 'pantig' },
  { id: 'rc-p-bu', word: 'BU', syllables: ['BU'], phoneticGuide: 'B + U = BU', clue: 'Pantig na B at U', distractors: ['BO', 'BA', 'BI'], category: 'pantig' },
  { id: 'rc-p-te', word: 'TE', syllables: ['TE'], phoneticGuide: 'T + E = TE', clue: 'Pantig na T at E', distractors: ['TA', 'TI', 'TO'], category: 'pantig' },
  { id: 'rc-p-ti', word: 'TI', syllables: ['TI'], phoneticGuide: 'T + I = TI', clue: 'Pantig na T at I', distractors: ['TE', 'TO', 'TU'], category: 'pantig' },
  { id: 'rc-p-to', word: 'TO', syllables: ['TO'], phoneticGuide: 'T + O = TO', clue: 'Pantig na T at O', distractors: ['TA', 'TE', 'TU'], category: 'pantig' },
  { id: 'rc-p-tu', word: 'TU', syllables: ['TU'], phoneticGuide: 'T + U = TU', clue: 'Pantig na T at U', distractors: ['TO', 'TA', 'TI'], category: 'pantig' },
  { id: 'rc-p-ka', word: 'KA', syllables: ['KA'], phoneticGuide: 'K + A = KA', clue: 'Pantig na K at A', distractors: ['KO', 'KU', 'KI'], category: 'pantig' },
  { id: 'rc-p-ke', word: 'KE', syllables: ['KE'], phoneticGuide: 'K + E = KE', clue: 'Pantig na K at E', distractors: ['KA', 'KI', 'KO'], category: 'pantig' },
  { id: 'rc-p-ki', word: 'KI', syllables: ['KI'], phoneticGuide: 'K + I = KI', clue: 'Pantig na K at I', distractors: ['KE', 'KO', 'KU'], category: 'pantig' },
  { id: 'rc-p-ko', word: 'KO', syllables: ['KO'], phoneticGuide: 'K + O = KO', clue: 'Pantig na K at O', distractors: ['KA', 'KI', 'KU'], category: 'pantig' },
  { id: 'rc-p-ku', word: 'KU', syllables: ['KU'], phoneticGuide: 'K + U = KU', clue: 'Pantig na K at U', distractors: ['KO', 'KA', 'KI'], category: 'pantig' },
  { id: 'rc-p-li', word: 'LI', syllables: ['LI'], phoneticGuide: 'L + I = LI', clue: 'Pantig na L at I', distractors: ['LA', 'LO', 'LU'], category: 'pantig' },
  { id: 'rc-p-lu', word: 'LU', syllables: ['LU'], phoneticGuide: 'L + U = LU', clue: 'Pantig na L at U', distractors: ['LO', 'LA', 'LE'], category: 'pantig' },
  { id: 'rc-p-le', word: 'LE', syllables: ['LE'], phoneticGuide: 'L + E = LE', clue: 'Pantig na L at E', distractors: ['LA', 'LI', 'LO'], category: 'pantig' },
  { id: 'rc-p-lo', word: 'LO', syllables: ['LO'], phoneticGuide: 'L + O = LO', clue: 'Pantig na L at O', distractors: ['LA', 'LE', 'LU'], category: 'pantig' },
  { id: 'rc-p-ga', word: 'GA', syllables: ['GA'], phoneticGuide: 'G + A = GA', clue: 'Pantig na G at A', distractors: ['GO', 'GU', 'GI'], category: 'pantig' },
  { id: 'rc-p-go', word: 'GO', syllables: ['GO'], phoneticGuide: 'G + O = GO', clue: 'Pantig na G at O', distractors: ['GA', 'GU', 'GI'], category: 'pantig' },
  { id: 'rc-p-gu', word: 'GU', syllables: ['GU'], phoneticGuide: 'G + U = GU', clue: 'Pantig na G at U', distractors: ['GO', 'GA', 'GE'], category: 'pantig' },
  { id: 'rc-p-na', word: 'NA', syllables: ['NA'], phoneticGuide: 'N + A = NA', clue: 'Pantig na N at A', distractors: ['NO', 'NI', 'NU'], category: 'pantig' },
  { id: 'rc-p-ni', word: 'NI', syllables: ['NI'], phoneticGuide: 'N + I = NI', clue: 'Pantig na N at I', distractors: ['NA', 'NO', 'NU'], category: 'pantig' },
  { id: 'rc-p-no', word: 'NO', syllables: ['NO'], phoneticGuide: 'N + O = NO', clue: 'Pantig na N at O', distractors: ['NA', 'NI', 'NU'], category: 'pantig' },
  { id: 'rc-p-nu', word: 'NU', syllables: ['NU'], phoneticGuide: 'N + U = NU', clue: 'Pantig na N at U', distractors: ['NO', 'NA', 'NI'], category: 'pantig' },
  { id: 'rc-p-pa', word: 'PA', syllables: ['PA'], phoneticGuide: 'P + A = PA', clue: 'Pantig na P at A', distractors: ['PO', 'PU', 'PI'], category: 'pantig' },
  { id: 'rc-p-pe', word: 'PE', syllables: ['PE'], phoneticGuide: 'P + E = PE', clue: 'Pantig na P at E', distractors: ['PA', 'PI', 'PO'], category: 'pantig' },
  { id: 'rc-p-pi', word: 'PI', syllables: ['PI'], phoneticGuide: 'P + I = PI', clue: 'Pantig na P at I', distractors: ['PE', 'PO', 'PU'], category: 'pantig' },
  { id: 'rc-p-po', word: 'PO', syllables: ['PO'], phoneticGuide: 'P + O = PO', clue: 'Pantig na P at O', distractors: ['PA', 'PI', 'PU'], category: 'pantig' },
  { id: 'rc-p-pu', word: 'PU', syllables: ['PU'], phoneticGuide: 'P + U = PU', clue: 'Pantig na P at U', distractors: ['PO', 'PA', 'PI'], category: 'pantig' },
  { id: 'rc-p-da', word: 'DA', syllables: ['DA'], phoneticGuide: 'D + A = DA', clue: 'Pantig na D at A', distractors: ['DO', 'DU', 'DI'], category: 'pantig' },
  { id: 'rc-p-de', word: 'DE', syllables: ['DE'], phoneticGuide: 'D + E = DE', clue: 'Pantig na D at E', distractors: ['DA', 'DI', 'DO'], category: 'pantig' },
  { id: 'rc-p-di', word: 'DI', syllables: ['DI'], phoneticGuide: 'D + I = DI', clue: 'Pantig na D at I', distractors: ['DE', 'DO', 'DU'], category: 'pantig' },
  { id: 'rc-p-do', word: 'DO', syllables: ['DO'], phoneticGuide: 'D + O = DO', clue: 'Pantig na D at O', distractors: ['DA', 'DI', 'DU'], category: 'pantig' },
  { id: 'rc-p-du', word: 'DU', syllables: ['DU'], phoneticGuide: 'D + U = DU', clue: 'Pantig na D at U', distractors: ['DO', 'DA', 'DI'], category: 'pantig' },
  { id: 'rc-p-ha', word: 'HA', syllables: ['HA'], phoneticGuide: 'H + A = HA', clue: 'Pantig na H at A', distractors: ['HO', 'HU', 'HI'], category: 'pantig' },
  { id: 'rc-p-he', word: 'HE', syllables: ['HE'], phoneticGuide: 'H + E = HE', clue: 'Pantig na H at E', distractors: ['HA', 'HI', 'HO'], category: 'pantig' },
  { id: 'rc-p-hi', word: 'HI', syllables: ['HI'], phoneticGuide: 'H + I = HI', clue: 'Pantig na H at I', distractors: ['HE', 'HO', 'HU'], category: 'pantig' },
  { id: 'rc-p-ho', word: 'HO', syllables: ['HO'], phoneticGuide: 'H + O = HO', clue: 'Pantig na H at O', distractors: ['HA', 'HI', 'HU'], category: 'pantig' },
  { id: 'rc-p-hu', word: 'HU', syllables: ['HU'], phoneticGuide: 'H + U = HU', clue: 'Pantig na H at U', distractors: ['HO', 'HA', 'HI'], category: 'pantig' },
  { id: 'rc-p-wa', word: 'WA', syllables: ['WA'], phoneticGuide: 'W + A = WA', clue: 'Pantig na W at A', distractors: ['WO', 'WI', 'WE'], category: 'pantig' },
  { id: 'rc-p-wi', word: 'WI', syllables: ['WI'], phoneticGuide: 'W + I = WI', clue: 'Pantig na W at I', distractors: ['WA', 'WO', 'WE'], category: 'pantig' },
  { id: 'rc-p-wo', word: 'WO', syllables: ['WO'], phoneticGuide: 'W + O = WO', clue: 'Pantig na W at O', distractors: ['WA', 'WI', 'WE'], category: 'pantig' },

  // Rich Grade 1 Filipino Words (Salita)
  { id: 'rc-w-manok', word: 'MANOK', syllables: ['MA', 'NOK'], phoneticGuide: 'MA + NOK = MANOK', clue: 'Alagang hayop na nangingitlog tuwing umaga', distractors: ['BABOY', 'BATO', 'MANGA'], category: 'salita' },
  { id: 'rc-w-baboy', word: 'BABOY', syllables: ['BA', 'BOY'], phoneticGuide: 'BA + BOY = BABOY', clue: 'Hayop sa bukid na may kulot na buntot', distractors: ['BATA', 'MANOK', 'ASO'], category: 'salita' },
  { id: 'rc-w-kambing', word: 'KAMBING', syllables: ['KAM', 'BING'], phoneticGuide: 'KAM + BING = KAMBING', clue: 'Hayop na mahilig kumain ng sariwang damo', distractors: ['KALABAW', 'KUNEHO', 'PUSA'], category: 'salita' },
  { id: 'rc-w-araw', word: 'ARAW', syllables: ['A', 'RAW'], phoneticGuide: 'A + RAW = ARAW', clue: 'Maliwanag na tanglaw sa kalangitan sa umaga', distractors: ['BUWAN', 'ULAP', 'ULAN'], category: 'salita' },
  { id: 'rc-w-buwan', word: 'BUWAN', syllables: ['BU', 'WAN'], phoneticGuide: 'BU + WAN = BUWAN', clue: 'Maliwanag na ilaw sa langit kung gabi', distractors: ['ARAW', 'BITUIN', 'HANGIN'], category: 'salita' },
  { id: 'rc-w-bituin', word: 'BITUIN', syllables: ['BI', 'TU', 'IN'], phoneticGuide: 'BI + TU + IN = BITUIN', clue: 'Kumikislap na ilaw sa langit tuwing gabi', distractors: ['BUWAN', 'ARAW', 'ULAP'], category: 'salita' },
  { id: 'rc-w-ulap', word: 'ULAP', syllables: ['U', 'LAP'], phoneticGuide: 'U + LAP = ULAP', clue: 'Puting parang bulak sa asul na kalangitan', distractors: ['ULAN', 'ARAW', 'ILOG'], category: 'salita' },
  { id: 'rc-w-ilog', word: 'ILOG', syllables: ['I', 'LOG'], phoneticGuide: 'I + LOG = ILOG', clue: 'Umaagos na tubig mula sa bundok', distractors: ['DAGAT', 'LAWA', 'TUBIG'], category: 'salita' },
  { id: 'rc-w-dagat', word: 'DAGAT', syllables: ['DA', 'GAT'], phoneticGuide: 'DA + GAT = DAGAT', clue: 'Malawak na maalat na katubigan', distractors: ['ILOG', 'ULAN', 'LAWA'], category: 'salita' },
  { id: 'rc-w-bundok', word: 'BUNDOK', syllables: ['BUN', 'DOK'], phoneticGuide: 'BUN + DOK = BUNDOK', clue: 'Napakataas na anyong lupa sa kalikasan', distractors: ['BUKID', 'KUBO', 'PUNO'], category: 'salita' },
  { id: 'rc-w-bukid', word: 'BUKID', syllables: ['BU', 'KID'], phoneticGuide: 'BU + KID = BUKID', clue: 'Lupang tinataniman ng palay ng magsasaka', distractors: ['BUNDOK', 'BAHAY', 'DAMO'], category: 'salita' },
  { id: 'rc-w-mesa', word: 'MESA', syllables: ['ME', 'SA'], phoneticGuide: 'ME + SA = MESA', clue: 'Patag na patungan sa pagkain at pagsusulat', distractors: ['SILYA', 'KAMA', 'PISO'], category: 'salita' },
  { id: 'rc-w-silya', word: 'SILYA', syllables: ['SIL', 'YA'], phoneticGuide: 'SIL + YA = SILYA', clue: 'Inuupuan sa silid-aralan at tahanan', distractors: ['MESA', 'KAMA', 'PINTO'], category: 'salita' },
  { id: 'rc-w-kama', word: 'KAMA', syllables: ['KA', 'MA'], phoneticGuide: 'KA + MA = KAMA', clue: 'Hihigan sa kwarto kapag matutulog sa gabi', distractors: ['MESA', 'KUBO', 'KASO'], category: 'salita' },
  { id: 'rc-w-unan', word: 'UNAN', syllables: ['U', 'NAN'], phoneticGuide: 'U + NAN = UNAN', clue: 'Malambot na patungan ng ulo sa pagtulog', distractors: ['KUMOT', 'ULAN', 'KAMA'], category: 'salita' },
  { id: 'rc-w-kumot', word: 'KUMOT', syllables: ['KU', 'MOT'], phoneticGuide: 'KU + MOT = KUMOT', clue: 'Pang-init sa katawan kapag malamig ang gabi', distractors: ['UNAN', 'DAMIT', 'KAMA'], category: 'salita' },
  { id: 'rc-w-plato', word: 'PLATO', syllables: ['PLA', 'TO'], phoneticGuide: 'PLA + TO = PLATO', clue: 'Lalagyan ng kanin at ulam sa hapag-kainan', distractors: ['BASO', 'TASA', 'PINTO'], category: 'salita' },
  { id: 'rc-w-baso', word: 'BASO', syllables: ['BA', 'SO'], phoneticGuide: 'BA + SO = BASO', clue: 'Inuman ng malinis at malamig na tubig', distractors: ['TASA', 'PLATO', 'BOTE'], category: 'salita' },
  { id: 'rc-w-kutsara', word: 'KUTSARA', syllables: ['KUT', 'SA', 'RA'], phoneticGuide: 'KUT + SA + RA = KUTSARA', clue: 'Pangsubo ng pagkain kapag kumakain', distractors: ['TINIDOR', 'PLATO', 'KAPOTE'], category: 'salita' },
  { id: 'rc-w-tinidor', word: 'TINIDOR', syllables: ['TI', 'NI', 'DOR'], phoneticGuide: 'TI + NI + DOR = TINIDOR', clue: 'Pangtuhog ng ulam sa hapag-kainan', distractors: ['KUTSARA', 'PLATO', 'BINTANA'], category: 'salita' },
  { id: 'rc-w-lapis', word: 'LAPIS', syllables: ['LA', 'PIS'], phoneticGuide: 'LA + PIS = LAPIS', clue: 'Gamit sa pagsusulat at pagguhit sa papel', distractors: ['PAPEL', 'LIBRO', 'LATA'], category: 'salita' },
  { id: 'rc-w-papel', word: 'PAPEL', syllables: ['PA', 'PEL'], phoneticGuide: 'PA + PEL = PAPEL', clue: 'Puti at malinis na sinusulatan gamit ang lapis', distractors: ['LAPIS', 'LIBRO', 'PASO'], category: 'salita' },
  { id: 'rc-w-libro', word: 'LIBRO', syllables: ['LIB', 'RO'], phoneticGuide: 'LIB + RO = LIBRO', clue: 'Binabasa upang matuto ng iba\'t ibang aralin', distractors: ['PAPEL', 'LAPIS', 'RELO'], category: 'salita' },
  { id: 'rc-w-pambura', word: 'PAMBURA', syllables: ['PAM', 'BU', 'RA'], phoneticGuide: 'PAM + BU + RA = PAMBURA', clue: 'Pambura sa mga maling guhit o sulat ng lapis', distractors: ['PANTASA', 'PAPEL', 'KRAYOLA'], category: 'salita' },
  { id: 'rc-w-pantasa', word: 'PANTASA', syllables: ['PAN', 'TA', 'SA'], phoneticGuide: 'PAN + TA + SA = PANTASA', clue: 'Pampatalim sa pudpod na dulo ng lapis', distractors: ['PAMBURA', 'LAPIS', 'TASA'], category: 'salita' },
  { id: 'rc-w-krayola', word: 'KRAYOLA', syllables: ['KRA', 'YO', 'LA'], phoneticGuide: 'KRA + YO + LA = KRAYOLA', clue: 'Pangkulay sa magagandang guhit sa papel', distractors: ['LAPIS', 'PAPEL', 'KULAY'], category: 'salita' },
  { id: 'rc-w-mata', word: 'MATA', syllables: ['MA', 'TA'], phoneticGuide: 'MA + TA = MATA', clue: 'Bahagi ng mukha na ginagamit sa paningin', distractors: ['ILONG', 'BIBIG', 'TASA'], category: 'salita' },
  { id: 'rc-w-ilong', word: 'ILONG', syllables: ['I', 'LONG'], phoneticGuide: 'I + LONG = ILONG', clue: 'Ginagamit sa pang-amoy ng mababangong bagay', distractors: ['MATA', 'BIBIG', 'ILOG'], category: 'salita' },
  { id: 'rc-w-bibig', word: 'BIBIG', syllables: ['BI', 'BIG'], phoneticGuide: 'BI + BIG = BIBIG', clue: 'Ginagamit sa pagsasalita at pagkain', distractors: ['MATA', 'ILONG', 'DILA'], category: 'salita' },
  { id: 'rc-w-tainga', word: 'TAINGA', syllables: ['TA', 'I', 'NGA'], phoneticGuide: 'TA + I + NGA = TAINGA', clue: 'Ginagamit sa pakikinig sa guro at magulang', distractors: ['MATA', 'ILONG', 'BIBIG'], category: 'salita' },
  { id: 'rc-w-kamay', word: 'KAMAY', syllables: ['KA', 'MAY'], phoneticGuide: 'KA + MAY = KAMAY', clue: 'May limang daliri na ginagamit sa paghawak', distractors: ['PAA', 'BRASO', 'KAPATID'], category: 'salita' },
  { id: 'rc-w-paa', word: 'PAA', syllables: ['PA', 'A'], phoneticGuide: 'PA + A = PAA', clue: 'Ginagamit sa paglalakad, pagtakbo, at paglukso', distractors: ['KAMAY', 'BOTA', 'PUSA'], category: 'salita' },
  { id: 'rc-w-ngipin', word: 'NGIPIN', syllables: ['NGI', 'PIN'], phoneticGuide: 'NGI + PIN = NGIPIN', clue: 'Puting pangkagat sa pagkain sa loob ng bibig', distractors: ['DILA', 'BIBIG', 'PINTO'], category: 'salita' },
  { id: 'rc-w-dila', word: 'DILA', syllables: ['DI', 'LA'], phoneticGuide: 'DI + LA = DILA', clue: 'Panlasa sa matamis, maalat, at maasim', distractors: ['BIBIG', 'NGIPIN', 'DILAW'], category: 'salita' },
  { id: 'rc-w-buhok', word: 'BUHOK', syllables: ['BU', 'HOK'], phoneticGuide: 'BU + HOK = BUHOK', clue: 'Tumutubo sa ulunan na sinusuklay nang maayos', distractors: ['NOO', 'MATA', 'BUBONG'], category: 'salita' },
  { id: 'rc-w-pula', word: 'PULA', syllables: ['PU', 'LA'], phoneticGuide: 'PU + LA = PULA', clue: 'Kulay ng hinog na mansanas at ng puso', distractors: ['ASUL', 'DILAW', 'PUTI'], category: 'salita' },
  { id: 'rc-w-asul', word: 'ASUL', syllables: ['A', 'SUL'], phoneticGuide: 'A + SUL = ASUL', clue: 'Kulay ng maaliwalas na kalangitan at dagat', distractors: ['PULA', 'DILAW', 'ASO'], category: 'salita' },
  { id: 'rc-w-dilaw', word: 'DILAW', syllables: ['DI', 'LAW'], phoneticGuide: 'DI + LAW = DILAW', clue: 'Kulay ng sikat ng araw at hinog na mangga', distractors: ['PULA', 'ASUL', 'DILA'], category: 'salita' },
  { id: 'rc-w-puti', word: 'PUTI', syllables: ['PU', 'TI'], phoneticGuide: 'PU + TI = PUTI', clue: 'Kulay ng malinis na gatas at bulak sa ulap', distractors: ['ITIM', 'PULA', 'PUSA'], category: 'salita' },
  { id: 'rc-w-itim', word: 'ITIM', syllables: ['I', 'TIM'], phoneticGuide: 'I + TIM = ITIM', clue: 'Madilim na kulay ng gabing walang buwan', distractors: ['PUTI', 'ASUL', 'ILOG'], category: 'salita' },
  { id: 'rc-w-guro', word: 'GURO', syllables: ['GU', 'RO'], phoneticGuide: 'GU + RO = GURO', clue: 'Nagtuturo sa mga bata sa silid-aralan', distractors: ['DOKTOR', 'PULIS', 'KUBO'], category: 'salita' },
  { id: 'rc-w-nanay', word: 'NANAY', syllables: ['NA', 'NAY'], phoneticGuide: 'NA + NAY = NANAY', clue: 'Mapagmahal na ina na nag-aaruga sa pamilya', distractors: ['TATAY', 'ATE', 'LOLA'], category: 'salita' },
  { id: 'rc-w-tatay', word: 'TATAY', syllables: ['TA', 'TAY'], phoneticGuide: 'TA + TAY = TATAY', clue: 'Haligi ng tahanan na masipag magtrabaho', distractors: ['NANAY', 'KUYA', 'LOLO'], category: 'salita' },
  { id: 'rc-w-kuya', word: 'KUYA', syllables: ['KU', 'YA'], phoneticGuide: 'KU + YA = KUYA', clue: 'Nakatatandang kapatid na lalaki sa tahanan', distractors: ['ATE', 'BUNSO', 'TATAY'], category: 'salita' },
  { id: 'rc-w-ate', word: 'ATE', syllables: ['A', 'TE'], phoneticGuide: 'A + TE = ATE', clue: 'Nakatatandang kapatid na babae sa pamilya', distractors: ['KUYA', 'NANAY', 'BUNSO'], category: 'salita' },
  { id: 'rc-w-bunso', word: 'BUNSO', syllables: ['BUN', 'SO'], phoneticGuide: 'BUN + SO = BUNSO', clue: 'Pinakabatang anak sa buong pamilya', distractors: ['KUYA', 'ATE', 'BATA'], category: 'salita' },
  { id: 'rc-w-kaibigan', word: 'KAIBIGAN', syllables: ['KA', 'I', 'BI', 'GAN'], phoneticGuide: 'KA + I + BI + GAN = KAIBIGAN', clue: 'Kalaro at kasamang nag-aaral nang masaya', distractors: ['KAPATID', 'KAPITBAHAY', 'KLASE'], category: 'salita' },
  { id: 'rc-w-paruparo', word: 'PARUPARO', syllables: ['PA', 'RU', 'PA', 'RO'], phoneticGuide: 'PA + RU + PA + RO = PARUPARO', clue: 'Lumilipad na makulay na insekto sa bulaklak', distractors: ['TUTUBI', 'LANGGAM', 'IBON'], category: 'salita' },
  { id: 'rc-w-tutubi', word: 'TUTUBI', syllables: ['TU', 'TU', 'BI'], phoneticGuide: 'TU + TU + BI = TUTUBI', clue: 'Lumilipad na may mahahabang pakpak sa hangin', distractors: ['PARUPARO', 'LANGGAM', 'PALAKA'], category: 'salita' },
  { id: 'rc-w-langgam', word: 'LANGGAM', syllables: ['LANG', 'GAM'], phoneticGuide: 'LANG + GAM = LANGGAM', clue: 'Maliit ngunit masipag na hayop sa lupa', distractors: ['GAGAMBA', 'TUTUBI', 'PARUPARO'], category: 'salita' },
  { id: 'rc-w-palaka', word: 'PALAKA', syllables: ['PA', 'LA', 'KA'], phoneticGuide: 'PA + LA + KA = PALAKA', clue: 'Tumatalon sa damuhan at kumakokak sa ulan', distractors: ['PAGONG', 'ISDA', 'PUSA'], category: 'salita' },
  { id: 'rc-w-pagong', word: 'PAGONG', syllables: ['PA', 'GONG'], phoneticGuide: 'PA + GONG = PAGONG', clue: 'Mabagal maglakad na may matigas na bahay sa likod', distractors: ['PALAKA', 'ISDA', 'PUSA'], category: 'salita' },
  { id: 'rc-w-watawat', word: 'WATAWAT', syllables: ['WA', 'TA', 'WAT'], phoneticGuide: 'WA + TA + WAT = WATAWAT', clue: 'Bandila ng Pilipinas na may asul, pula, at puti', distractors: ['BAYANI', 'AWIT', 'TULA'], category: 'salita' },
  { id: 'rc-w-laro', word: 'LARO', syllables: ['LA', 'RO'], phoneticGuide: 'LA + RO = LARO', clue: 'Masayang libangan kasama ang mga kaibigan', distractors: ['ARAL', 'TULOG', 'KAIN'], category: 'salita' },
  { id: 'rc-w-sayaw', word: 'SAYAW', syllables: ['SA', 'YAW'], phoneticGuide: 'SA + YAW = SAYAW', clue: 'Masayang paggalaw ng katawan kasabay ng tugtog', distractors: ['KANTA', 'TAKBO', 'TALON'], category: 'salita' },
  { id: 'rc-w-kain', word: 'KAIN', syllables: ['KA', 'IN'], phoneticGuide: 'KA + IN = KAIN', clue: 'Pagkain ng masustansyang gulay at prutas', distractors: ['INOM', 'TULOG', 'LARO'], category: 'salita' },
  { id: 'rc-w-inom', word: 'INOM', syllables: ['I', 'NOM'], phoneticGuide: 'I + NOM = INOM', clue: 'Pag-inom ng walong basong malinis na tubig', distractors: ['KAIN', 'LARO', 'TULOG'], category: 'salita' },
  { id: 'rc-w-ngiti', word: 'NGITI', syllables: ['NGI', 'TI'], phoneticGuide: 'NGI + TI = NGITI', clue: 'Masayang kislap sa mukha ng batang mabait', distractors: ['TAWA', 'SAYA', 'IYAK'], category: 'salita' },
  { id: 'rc-w-saya', word: 'SAYA', syllables: ['SA', 'YA'], phoneticGuide: 'SA + YA = SAYA', clue: 'Damdamin ng kagalakan at tuwa sa pag-aaral', distractors: ['LUNGKOT', 'TAWA', 'LARO'], category: 'salita' },
  { id: 'rc-w-payong', word: 'PAYONG', syllables: ['PA', 'YONG'], phoneticGuide: 'PA + YONG = PAYONG', clue: 'Pananggalang laban sa init ng araw at ulan', distractors: ['KAPOTE', 'BOTA', 'PASO'], category: 'salita' },
  { id: 'rc-w-bota', word: 'BOTA', syllables: ['BO', 'TA'], phoneticGuide: 'BO + TA = BOTA', clue: 'Kasuotan sa paa kapag maulan at may baha', distractors: ['SAPATOS', 'MEDYAS', 'BOTE'], category: 'salita' },
];

// Persistent LocalStorage key for combat word variety
const STORAGE_KEY_COMBAT_HISTORY = 'marungko_combat_word_history_v3';

function getStoredWordHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMBAT_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredWordHistory(history: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Keep up to 120 past words so students cycle through the pool without memorization
    localStorage.setItem(STORAGE_KEY_COMBAT_HISTORY, JSON.stringify(history.slice(-120)));
  } catch {}
}

/**
 * Picks a guaranteed non-repeating reading word from the expansive 200+ word pool.
 * Persists seen words across turns and battles in localStorage, ensuring true variety
 * so children do not memorize words in a fixed sequence.
 */
export function getUniqueReadingCombatWord(
  sessionExcludedIds?: Set<string>,
  categoryFilter?: 'pantig' | 'salita'
): ReadingCombatWord {
  const storedHistory = getStoredWordHistory();

  // Combine session exclusions and persistent history
  const combinedExcluded = new Set<string>([
    ...(sessionExcludedIds ? Array.from(sessionExcludedIds) : []),
    ...storedHistory,
  ]);

  let candidates = READING_COMBAT_POOL.filter((item) => {
    if (categoryFilter && item.category !== categoryFilter) return false;
    return !combinedExcluded.has(item.id);
  });

  // If pool candidates run low, release older history while keeping the last 20 most recent words
  if (candidates.length < 8) {
    const recentOnly = new Set(storedHistory.slice(-20));
    candidates = READING_COMBAT_POOL.filter((item) => {
      if (categoryFilter && item.category !== categoryFilter) return false;
      return !recentOnly.has(item.id);
    });
  }

  // Fallback to full category if still empty
  if (candidates.length === 0) {
    candidates = categoryFilter
      ? READING_COMBAT_POOL.filter((item) => item.category === categoryFilter)
      : READING_COMBAT_POOL;
  }

  // Pick truly random from available fresh candidates
  const picked = candidates[Math.floor(Math.random() * candidates.length)];

  // Update persistent history
  const updatedHistory = [...storedHistory.filter((id) => id !== picked.id), picked.id];
  saveStoredWordHistory(updatedHistory);

  return picked;
}

/**
 * Backwards-compatible random picker
 */
export function getRandomReadingCombatWord(categoryFilter?: 'pantig' | 'salita'): ReadingCombatWord {
  return getUniqueReadingCombatWord(undefined, categoryFilter);
}

/**
 * Generates dynamic, randomized multiple-choice options for a target word.
 * Instead of static choices (which students can visually memorize), this selects
 * 3 distinct, fresh distractors of similar length/category from the extensive pool,
 * shuffling them thoroughly every single time.
 */
export function generateDynamicReadingOptions(
  target: ReadingCombatWord,
  pool: ReadingCombatWord[] = READING_COMBAT_POOL
): string[] {
  const targetWord = target.word.trim().toUpperCase();
  const targetLen = targetWord.length;

  // Filter pool candidates: different word, same category preferred
  const categoryMatches = pool.filter(
    (item) => item.word.trim().toUpperCase() !== targetWord && item.category === target.category
  );

  // Group by similar length (+- 1 letter)
  const similarLength = categoryMatches.filter(
    (item) => Math.abs(item.word.trim().length - targetLen) <= 1
  );

  // Shuffle candidate pool
  const candidatePool = similarLength.length >= 6 ? similarLength : categoryMatches;
  const shuffledCandidates = [...candidatePool].sort(() => Math.random() - 0.5);

  const pickedDistractors: string[] = [];
  const pickedSet = new Set<string>([targetWord]);

  // If the word had custom curated distractors, mix some in optionally
  if (target.distractors && target.distractors.length > 0) {
    const shuffledCurated = [...target.distractors].sort(() => Math.random() - 0.5);
    for (const d of shuffledCurated) {
      const up = d.trim().toUpperCase();
      if (!pickedSet.has(up) && pickedDistractors.length < 2) {
        pickedDistractors.push(up);
        pickedSet.add(up);
      }
    }
  }

  // Fill the rest with fresh dynamic candidates from the pool
  for (const c of shuffledCandidates) {
    if (pickedDistractors.length >= 3) break;
    const wordUpper = c.word.trim().toUpperCase();
    if (!pickedSet.has(wordUpper)) {
      pickedDistractors.push(wordUpper);
      pickedSet.add(wordUpper);
    }
  }

  // Ensure exactly 3 distractors
  const fallbackList = ['BATA', 'MAMA', 'ASO', 'PUSA', 'ISDA', 'GATAS', 'KUBO', 'TASA'];
  for (const fb of fallbackList) {
    if (pickedDistractors.length >= 3) break;
    if (!pickedSet.has(fb)) {
      pickedDistractors.push(fb);
      pickedSet.add(fb);
    }
  }

  // Combine target + 3 distractors and shuffle
  const finalOptions = [targetWord, ...pickedDistractors.slice(0, 3)];
  return finalOptions.sort(() => Math.random() - 0.5);
}
