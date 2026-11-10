import { MathItem, MathOperation } from '../types';
import { MATH_CURRICULUM_ITEMS } from '../data/mathData';
import { READING_COMBAT_POOL, ReadingCombatWord } from '../data/combatReadingData';

export type CombatSubject = 'reading' | 'english' | 'math';
export type CombatGradeLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface CombatChallenge {
  id: string;
  mode: CombatSubject;
  gradeLevel: CombatGradeLevel;
  // Reading / English attributes
  targetWord?: string;
  syllables?: string[];
  phoneticGuide?: string;
  clue?: string;
  readingPassage?: string;
  // Math attributes
  mathQuestion?: string;
  mathEmoji?: string;
  mathHint?: string;
  // Compatibility aliases
  equation?: string;
  questionText?: string;
  visualEmoji?: string;
  // Common attributes
  options: string[];
  correctAnswer: string;
  correctIndex: number;
  explanation: string;
}

/**
 * Session tracking of asked words, passages, and math questions to strictly GUARANTEE
 * that no words, reading passages, or questions are EVER repeated during combat.
 */
const askedReadingWordSignatures = new Set<string>();
const askedReadingPassageSignatures = new Set<string>();
const askedEnglishWordSignatures = new Set<string>();
const askedEnglishPassageSignatures = new Set<string>();
const askedMathQuestionSignatures = new Set<string>();

/**
 * Pre-fetched queues of AI-generated challenges for instantaneous zero-latency battle turns.
 */
const readingQueues = new Map<CombatGradeLevel, CombatChallenge[]>();
const englishQueues = new Map<CombatGradeLevel, CombatChallenge[]>();
const mathQueues = new Map<CombatGradeLevel, CombatChallenge[]>();

for (let g = 1; g <= 6; g++) {
  readingQueues.set(g as CombatGradeLevel, []);
  englishQueues.set(g as CombatGradeLevel, []);
  mathQueues.set(g as CombatGradeLevel, []);
}

let isPrefetchingReading = false;
let isPrefetchingEnglish = false;
let isPrefetchingMath = false;

// =========================================================================
// Curated Multi-Grade Reading Vocabulary & Reading Passage Pools (Grades 1 to 6)
// =========================================================================
interface CuratedReadingItem {
  word: string;
  syllables: string[];
  phoneticGuide: string;
  clue: string;
  readingPassage: string;
  distractors: string[];
}

const GRADE_READING_POOLS: Record<CombatGradeLevel, CuratedReadingItem[]> = {
  1: [
    { word: 'MATA', syllables: ['MA', 'TA'], phoneticGuide: 'M-A + T-A', clue: 'Ginagamit sa pagtingin at pagbasa', readingPassage: 'Malinaw ang mata ng batang si Maya.', distractors: ['BATA', 'PATA', 'TASA'] },
    { word: 'BATA', syllables: ['BA', 'TA'], phoneticGuide: 'B-A + T-A', clue: 'Musmos na tao na nag-aaral', readingPassage: 'Mabait at masipag na bata si Juan.', distractors: ['MATA', 'LATA', 'BATO'] },
    { word: 'GATAS', syllables: ['GA', 'TAS'], phoneticGuide: 'G-A + T-A-S', clue: 'Masustansyang inuming pampalakas', readingPassage: 'Umiinom ng sariwang gatas ang bata tuwing umaga.', distractors: ['BIGAS', 'LAKAS', 'BUTAS'] },
    { word: 'PUSA', syllables: ['PU', 'SA'], phoneticGuide: 'P-U + S-A', clue: 'Alagang hayop na ngumingiyaw', readingPassage: 'Humihilik ang pusang si Muning sa tabi ng kama.', distractors: ['ASO', 'PATO', 'KUSA'] },
    { word: 'ASO', syllables: ['A', 'SO'], phoneticGuide: 'A + S-O', clue: 'Matalik na kaibigan ng tao', readingPassage: 'Bantay ng tahanan ang matapat na aso.', distractors: ['PUSA', 'IBON', 'USO'] },
    { word: 'DAHON', syllables: ['DA', 'HON'], phoneticGuide: 'D-A + H-O-N', clue: 'Kulay berdeng bahagi ng halaman', readingPassage: 'Lumalaglag ang tuyong dahon mula sa sanga.', distractors: ['KAHON', 'LAHON', 'IBON'] },
    { word: 'LATA', syllables: ['LA', 'TA'], phoneticGuide: 'L-A + T-A', clue: 'Lalagyan ng sardinas o gatas', readingPassage: 'Nire-recycle ni lolo ang mga lumang lata.', distractors: ['BATA', 'MATA', 'LUPA'] },
    { word: 'MANGA', syllables: ['MANG', 'GA'], phoneticGuide: 'M-A-N-G + G-A', clue: 'Matamis at dilaw na pambansang prutas', readingPassage: 'Matamis at manilaw-nilaw ang hinog na manga.', distractors: ['SAGING', 'PINYA', 'BANGA'] },
    { word: 'BATO', syllables: ['BA', 'TO'], phoneticGuide: 'B-A + T-O', clue: 'Matigas na bagay sa lupa at ilog', readingPassage: 'Makinis ang puting bato sa tabi ng batis.', distractors: ['BATA', 'PATO', 'KUTO'] },
    { word: 'TASA', syllables: ['TA', 'SA'], phoneticGuide: 'T-A + S-A', clue: 'Iniinuman ng mainit na tsokolate o sabaw', readingPassage: 'Mainit ang gatas sa makulay na tasa.', distractors: ['BASO', 'KASA', 'MATA'] },
    { word: 'LAPIZ', syllables: ['LA', 'PIS'], phoneticGuide: 'L-A + P-I-S', clue: 'Ginagamit pangguhit at pansulat ng bata', readingPassage: 'Matalas ang dulo ng lapis ni Ana.', distractors: ['PAPEL', 'AKLAT', 'BAG'] },
    { word: 'BOLA', syllables: ['BO', 'LA'], phoneticGuide: 'B-O + L-A', clue: 'Mabilog na laruan sa basketbol', readingPassage: 'Pinatalbog ng bata ang bagong bola sa plaza.', distractors: ['BOTA', 'KOLA', 'TALA'] },
    { word: 'ILAW', syllables: ['I', 'LAW'], phoneticGuide: 'I + L-A-W', clue: 'Nagbibigay ng liwanag sa silid', readingPassage: 'Maliwanag ang ilaw sa aming tahanan.', distractors: ['AWIT', 'ARAW', 'ULAP'] },
    { word: 'KAMA', syllables: ['KA', 'MA'], phoneticGuide: 'K-A + M-A', clue: 'Hinihigaan kapag nagpapahinga', readingPassage: 'Malambot at malinis ang kama sa kuwarto.', distractors: ['KASA', 'MAMA', 'SALA'] },
    { word: 'SAGING', syllables: ['SA', 'GING'], phoneticGuide: 'S-A + G-I-N-G', clue: 'Dilaw na prutas na mayaman sa potassium', readingPassage: 'Masarap kumain ng saging pagkatapos mag-ehersisyo.', distractors: ['MANGA', 'PAKWAN', 'SABAW'] },
    { word: 'PUNO', syllables: ['PU', 'NO'], phoneticGuide: 'P-U + N-O', clue: 'Mataas na halaman na nagbibigay lilim', readingPassage: 'Sumilong ang bata sa ilalim ng malaking puno.', distractors: ['DAMO', 'SANGA', 'KAHY'] },
    { word: 'IBON', syllables: ['I', 'BON'], phoneticGuide: 'I + B-O-N', clue: 'May pakpak at lumilipad sa himpapawid', readingPassage: 'Umaawit ang munting ibon tuwing umaga.', distractors: ['IPIS', 'ISDA', 'ILOG'] },
    { word: 'ULAP', syllables: ['U', 'LAP'], phoneticGuide: 'U + L-A-P', clue: 'Puting anyo sa asul na kalangitan', readingPassage: 'Puti at parang bulak ang ulap sa langit.', distractors: ['ULAN', 'USOK', 'ILAW'] },
    { word: 'DAMO', syllables: ['DA', 'MO'], phoneticGuide: 'D-A + M-O', clue: 'Berdeng halaman sa halamanan', readingPassage: 'Sariwa at basa ng hamog ang damo sa bakuran.', distractors: ['DAGA', 'DAHON', 'DAMIT'] },
    { word: 'ISDA', syllables: ['IS', 'DA'], phoneticGuide: 'I-S + D-A', clue: 'Lumalangoy sa malinis na tubig', readingPassage: 'Lumalangoy ang makulay na isda sa malinaw na ilog.', distractors: ['IBON', 'ITLOG', 'ILAW'] },
  ],
  2: [
    { word: 'KABAYO', syllables: ['KA', 'BA', 'YO'], phoneticGuide: 'KA-BA-YO', clue: 'Mabilis tumakbong hayop na may kiling', readingPassage: 'Mabilis tumakbo ang kabayo sa malawak na parang.', distractors: ['KALABAW', 'KAMELYO', 'BABOY'] },
    { word: 'BULAKLAK', syllables: ['BU', 'LAK', 'LAK'], phoneticGuide: 'BU-LAK-LAK', clue: 'Mabangong bahagi ng halaman na may talulot', readingPassage: 'Mabangong bulaklak ang pinitas ni inay sa hardin.', distractors: ['HALAMAN', 'TALULOT', 'DAHON'] },
    { word: 'MASAYA', syllables: ['MA', 'SA', 'YA'], phoneticGuide: 'MA-SA-YA', clue: 'Pakiramdam kapag nagagalak at nakangiti', readingPassage: 'Masaya ang buong pamilya habang nagsasalo-salo.', distractors: ['MALUNGKOT', 'MASIGLA', 'PAYAPA'] },
    { word: 'KUBYERTO', syllables: ['KUB', 'YER', 'TO'], phoneticGuide: 'KUB-YER-TO', clue: 'Kutsara at tinidor sa hapag-kainan', readingPassage: 'Inihanda nang maayos ang kubyerto bago kumain.', distractors: ['PINGGAN', 'KOPITA', 'SANDOK'] },
    { word: 'SAPATOS', syllables: ['SA', 'PA', 'TOS'], phoneticGuide: 'SA-PA-TOS', clue: 'Isinusuot sa paa kapag pumapasok sa paaralan', readingPassage: 'Makintab at malinis ang bagong sapatos ng mag-aaral.', distractors: ['TSINELAS', 'MEDYAS', 'SANDALYAS'] },
    { word: 'BANDILA', syllables: ['BAN', 'DI', 'LA'], phoneticGuide: 'BAN-DI-LA', clue: 'Watawat ng Pilipinas na may tatlong bituin at araw', readingPassage: 'Igalang natin ang bandila ng ating mahal na bansa.', distractors: ['KORONA', 'SAGISAG', 'KULAY'] },
    { word: 'TINAPAY', syllables: ['TI', 'NA', 'PAY'], phoneticGuide: 'TI-NA-PAY', clue: 'Masarap na pagkaing gawa sa harina', readingPassage: 'Mainit na tinapay ang inihanda ni tatay para sa almusal.', distractors: ['KANIN', 'SOPAS', 'PANDESAL'] },
    { word: 'PARU-PARO', syllables: ['PA', 'RU', 'PA', 'RO'], phoneticGuide: 'PA-RU-PA-RO', clue: 'Makulay na insekto na sumisipsip ng nektar', readingPassage: 'Dumapo ang makulay na paru-paro sa rosas.', distractors: ['GAGAMBA', 'BUBUYOG', 'LANGAW'] },
    { word: 'LANGIT', syllables: ['LA', 'NGIT'], phoneticGuide: 'LA-NGIT', clue: 'Asul na kalawakan sa itaas ng daigdig', readingPassage: 'Maaliwalas at walang ulap ang asul na langit ngayon.', distractors: ['LUPA', 'ULAP', 'HIMPAPAWID'] },
    { word: 'ILOG', syllables: ['I', 'LOG'], phoneticGuide: 'I-LOG', clue: 'Umaagos na sariwang tubig patungong dagat', readingPassage: 'Malinaw at malamig ang tubig sa mahabang ilog.', distractors: ['DAGAT', 'LAWA', 'BUKAL'] },
    { word: 'KALABAW', syllables: ['KA', 'LA', 'BAW'], phoneticGuide: 'KA-LA-BAW', clue: 'Pambansang hayop na katulong sa pagsasaka', readingPassage: 'Matiyagang nag-aararo ang kalabaw sa bukid.', distractors: ['BAKA', 'KABAYO', 'KAMBING'] },
    { word: 'PAARALAN', syllables: ['PA', 'A', 'RA', 'LAN'], phoneticGuide: 'PA-A-RA-LAN', clue: 'Lugar kung saan natututo ang mga mag-aaral', readingPassage: 'Masayang pumapasok ang mga bata sa paaralan araw-araw.', distractors: ['PALENGKE', 'SIMBAHAN', 'OSPITAL'] },
    { word: 'KAIBIGAN', syllables: ['KA', 'I', 'BI', 'GAN'], phoneticGuide: 'KA-I-BI-GAN', clue: 'Kasamang nagmamalasakit at nagtitiwala', readingPassage: 'Mabait at maaasahan ang aking matalik na kaibigan.', distractors: ['KAPATID', 'KAKLASE', 'KAPITBAHAY'] },
    { word: 'TALONG', syllables: ['TA', 'LONG'], phoneticGuide: 'TA-LONG', clue: 'Lilang gulay na masustansya', readingPassage: 'Nagluto si nanay ng masarap na tortang talong.', distractors: ['KALABASA', 'SITAW', 'OKRA'] },
  ],
  3: [
    { word: 'PANGARAP', syllables: ['PA', 'NGA', 'RAP'], phoneticGuide: 'PA-NGA-RAP', clue: 'Hangarin o nais maabot sa buhay ng isang mag-aaral', readingPassage: 'Magsikap mag-aral upang maabot ang iyong mataas na pangarap.', distractors: ['HANGARIN', 'PANAGINIP', 'PAG-ASA'] },
    { word: 'KAPALIGIRAN', syllables: ['KA', 'PA', 'LI', 'GI', 'RAN'], phoneticGuide: 'KA-PA-LI-GI-RAN', clue: 'Lugar, kalikasan, at komunidad sa ating paligid', readingPassage: 'Panatilihing malinis at luntian ang ating kapaligiran.', distractors: ['KALIKASAN', 'PAMAYANAN', 'HIMPAPAWID'] },
    { word: 'KASIPAGAN', syllables: ['KA', 'SI', 'PA', 'GAN'], phoneticGuide: 'KA-SI-PA-GAN', clue: 'Katangiang nagpapakita ng tiyaga at sigasig sa gawain', readingPassage: 'Ang kasipagan at tiyaga ang susi sa magandang kinabukasan.', distractors: ['KATAPATAN', 'KAGALINGAN', 'KAPAYAPAAN'] },
    { word: 'MAGALANG', syllables: ['MA', 'GA', 'LANG'], phoneticGuide: 'MA-GA-LANG', clue: 'Nagsasabi ng po at opo sa mga nakatatanda', readingPassage: 'Magalang na bumati ang mag-aaral sa kanyang guro.', distractors: ['MABAIT', 'MASUNURIN', 'MAALAGA'] },
    { word: 'BAHAGHARI', syllables: ['BA', 'HAG', 'HA', 'RI'], phoneticGuide: 'BA-HAG-HA-RI', clue: 'Pitong makukulay na arko pagkatapos ng ulan', readingPassage: 'Lumitaw ang kahanga-hangang bahaghari sa himpapawid.', distractors: ['ULAP', 'LIWANAG', 'KULAY'] },
    { word: 'TULAY', syllables: ['TU', 'LAY'], phoneticGuide: 'TU-LAY', clue: 'Matatag na daanang nag-uugnay sa magkabilang pampang', readingPassage: 'Ligtas na tumawid ang mga sasakyan sa bagong tulay.', distractors: ['KALSADA', 'DAANAN', 'ILOG'] },
    { word: 'DAKILA', syllables: ['DA', 'KI', 'LA'], phoneticGuide: 'DA-KI-LA', clue: 'Kapuri-puri, marangal, at tanyag na gawa o tao', readingPassage: 'Dakila ang pagmamahal at sakripisyo ng ating mga magulang.', distractors: ['MAHALAGA', 'KAHANGA-HANGA', 'BAYANI'] },
    { word: 'TAHIMIK', syllables: ['TA', 'HI', 'MIK'], phoneticGuide: 'TA-HI-MIK', clue: 'Walang ingay, mapayapa, at mahinahon', readingPassage: 'Tahimik at payapa ang simoy ng hangin sa bukid.', distractors: ['PAYAPA', 'MAHINAHON', 'MAINGAY'] },
    { word: 'BINTANA', syllables: ['BIN', 'TA', 'NA'], phoneticGuide: 'BIN-TA-NA', clue: 'Dungawan sa bahay na nagpapapasok ng sariwang hangin', readingPassage: 'Binuksan ng bata ang bintana upang pumasok ang liwanag ng araw.', distractors: ['PINTUAN', 'DINGDING', 'ATIP'] },
    { word: 'AKLATAN', syllables: ['AK', 'LA', 'TAN'], phoneticGuide: 'AK-LA-TAN', clue: 'Silid sa paaralan na puno ng mga aklat at babasahin', readingPassage: 'Nagsaliksik ang mga mag-aaral sa tahimik na aklatan.', distractors: ['SILID-ARALAN', 'KANTINA', 'GYMNASIUM'] },
    { word: 'KALIKASAN', syllables: ['KA', 'LI', 'KA', 'SAN'], phoneticGuide: 'KA-LI-KA-SAN', clue: 'Mga puno, hayop, ilog, at bundok na likha ng Maykapal', readingPassage: 'Tungkulin ng bawat bata na mahalin ang inang kalikasan.', distractors: ['KAPALIGIRAN', 'KASAYSAYAN', 'KATUBIGAN'] },
  ],
  4: [
    { word: 'KALIKASAN', syllables: ['KA', 'LI', 'KA', 'SAN'], phoneticGuide: 'KA-LI-KA-SAN', clue: 'Likas na yaman, kabundukan, at karagatan ng bansa', readingPassage: 'Pangalagaan natin ang kalikasan upang maiwasan ang pagbaha.', distractors: ['KAPALIGIRAN', 'KASAYSAYAN', 'KATUBIGAN'] },
    { word: 'KASAYSAYAN', syllables: ['KA', 'SAY', 'SA', 'YAN'], phoneticGuide: 'KA-SAY-SA-YAN', clue: 'Talaan ng mahahalagang kaganapan sa nakaraan ng bayan', readingPassage: 'Pinag-aralan ng klase ang makulay na kasaysayan ng Pilipinas.', distractors: ['KALINANGAN', 'PANITIKAN', 'KABAYANIHAN'] },
    { word: 'PAGTUTULUNGAN', syllables: ['PAG', 'TU', 'TU', 'LU', 'NGAN'], phoneticGuide: 'PAG-TU-TU-LU-NGAN', clue: 'Sama-samang pagkilos upang mabilis matapos ang gawain', readingPassage: 'Dahil sa pagtutulungan, naging maunlad ang kanilang pamayanan.', distractors: ['BAYANIHAN', 'PAKIKIPAGKAPWA', 'PAGKAKAISA'] },
    { word: 'KAYAMANAN', syllables: ['KA', 'YA', 'MA', 'NAN'], phoneticGuide: 'KA-YA-MA-NAN', clue: 'Mahahalagang yaman, karunungan, o biyayang taglay', readingPassage: 'Ang edukasyon at karunungan ay hindi mananakaw na kayamanan.', distractors: ['SALAPI', 'KABUTIHAN', 'GINTO'] },
    { word: 'PAMAYANAN', syllables: ['PA', 'MA', 'YA', 'NAN'], phoneticGuide: 'PA-MA-YA-NAN', clue: 'Pangkat ng mamamayang namumuhay sa isang teritoryo', readingPassage: 'Nagtutulungan ang mga mamamayan sa malinis na pamayanan.', distractors: ['LALAWIGAN', 'LUNGSOD', 'BARANGAY'] },
    { word: 'BAYANIHAN', syllables: ['BA', 'YA', 'NI', 'HAN'], phoneticGuide: 'BA-YA-NI-HAN', clue: 'Katutubong tradisyon ng kusang-loob na pagtulong sa kapwa', readingPassage: 'Buhay na buhay ang diwa ng bayanihan sa panahon ng sakuna.', distractors: ['PAGKAKAIBIGAN', 'PAGTUTULUNGAN', 'PAKIKISAMA'] },
    { word: 'KATUTUBO', syllables: ['KA', 'TU', 'TU', 'BO'], phoneticGuide: 'KA-TU-TU-BO', clue: 'Unang pangkat na naninirahan sa isang rehiyon o lupain', readingPassage: 'Igalang at pahalagahan natin ang sining ng mga katutubo.', distractors: ['MAMAMAYAN', 'KABABAYAN', 'KALAHI'] },
    { word: 'SALAWIKAIN', syllables: ['SA', 'LA', 'WI', 'KA', 'IN'], phoneticGuide: 'SA-LA-WI-KA-IN', clue: 'Matatandang kasabihang may taglay na gintong aral', readingPassage: 'Puno ng malalim na karunungan ang mga lumang salawikain.', distractors: ['BUGTONG', 'KASABIHAN', 'IDYOMA'] },
    { word: 'PAGPAPASALAMAT', syllables: ['PAG', 'PA', 'PA', 'SA', 'LA', 'MAT'], phoneticGuide: 'PAG-PA-PA-SA-LA-MAT', clue: 'Pagtanaw ng utang na loob at pasasalamat sa biyayang natanggap', readingPassage: 'Taos-pusong pagpapasalamat ang ipinaabot ng mag-aaral.', distractors: ['PAGPAPAHALAGA', 'PAGKILALA', 'PAGMAMAHAL'] },
  ],
  5: [
    { word: 'PANGANGALAGA', syllables: ['PA', 'NGA', 'NGA', 'LA', 'GA'], phoneticGuide: 'PA-NGA-NGA-LA-GA', clue: 'Pag-aaruga, pag-iingat, at proteksyon sa kalikasan at kapwa', readingPassage: 'Mahalaga ang pangangalaga sa mga bakawan at yamang-dagat.', distractors: ['PAG-AARUGA', 'PAGBABANTAY', 'PAG-IINGAT'] },
    { word: 'RESPONSIBILIDAD', syllables: ['RES', 'PON', 'SI', 'BI', 'LI', 'DAD'], phoneticGuide: 'RES-PON-SI-BI-LI-DAD', clue: 'Tungkulin at pananagutang dapat gampanan nang buong puso', readingPassage: 'Responsibilidad ng bawat bata na mag-aral at maging magalang.', distractors: ['PANANAGUTAN', 'TUNGKULIN', 'OBLIGASYON'] },
    { word: 'PAGPAPAHALAGA', syllables: ['PAG', 'PA', 'PA', 'HA', 'LA', 'GA'], phoneticGuide: 'PAG-PA-PA-HA-LA-GA', clue: 'Pagbibigay halaga at paggalang sa magagandang asal', readingPassage: 'Ipakita ang pagpapahalaga sa sakripisyo ng ating mga guro.', distractors: ['PAGGALANG', 'PAGKILALA', 'PAGMAMAHAL'] },
    { word: 'KALUSUGAN', syllables: ['KA', 'LU', 'SU', 'GAN'], phoneticGuide: 'KA-LU-SU-GAN', clue: 'Kalagayan ng katawan at kaisipan na malayo sa karamdaman', readingPassage: 'Ang wastong pagkain at ehersisyo ang sandigan ng kalusugan.', distractors: ['LAKAS', 'KATATAGAN', 'KASIGLAHAN'] },
    { word: 'KINABUKASAN', syllables: ['KI', 'NA', 'BU', 'KA', 'SAN'], phoneticGuide: 'KI-NA-BU-KA-SAN', clue: 'Mga darating na panahon at kinabukasan ng susunod na salinlahi', readingPassage: 'Mag-aral nang masigasig para sa isang maaliwalas na kinabukasan.', distractors: ['KASALUKUYAN', 'PANGARAP', 'BUKAS'] },
    { word: 'KAPAYAPAAN', syllables: ['KA', 'PA', 'YA', 'PA', 'AN'], phoneticGuide: 'KA-PA-YA-PA-AN', clue: 'Katahimikan, pagkakasundo, at kawalan ng hidwaan sa lipunan', readingPassage: 'Nagsusumikap ang bawat pamayanan na mapanatili ang kapayapaan.', distractors: ['KATAHIMIKAN', 'PAGKASUNDO', 'KATATAGAN'] },
    { word: 'PAGKAKAIBIGAN', syllables: ['PAG', 'KA', 'KA', 'I', 'BI', 'GAN'], phoneticGuide: 'PAG-KA-KA-I-BI-GAN', clue: 'Banal na ugnayan ng mga taong nagtutulungan at nagmamahalan', readingPassage: 'Lalong tumibay ang kanilang pagkakaibigan sa gitna ng pagsubok.', distractors: ['SAMAHAN', 'UGNAYAN', 'PAKIKISAMA'] },
    { word: 'PAGKUKUSA', syllables: ['PAG', 'KU', 'KU', 'SA'], phoneticGuide: 'PAG-KU-KU-SA', clue: 'Kusang pagkilos nang hindi na kailangang utusan ng iba', readingPassage: 'May pagkukusa siyang naglinis ng kanilang silid-aralan.', distractors: ['KASIPAGAN', 'KATAPATAN', 'PAGKILOS'] },
    { word: 'MAKATOTOHANAN', syllables: ['MA', 'KA', 'TO', 'TO', 'HA', 'NAN'], phoneticGuide: 'MA-KA-TO-TO-HA-NAN', clue: 'Nagsasabi ng tunay na pangyayari at hindi kathang-isip', readingPassage: 'Makatotohanan ang mga impormasyong ibinahagi sa ulat.', distractors: ['MAKATUWID', 'MAKABULUHAN', 'MAKABAGO'] },
  ],
  6: [
    { word: 'KATAPATAN', syllables: ['KA', 'TA', 'PA', 'TAN'], phoneticGuide: 'KA-TA-PA-TAN', clue: 'Pagsasabi ng totoo, pagkamatapat, at pagiging marangal', readingPassage: 'Ang katapatan sa lahat ng oras ang pundasyon ng dangal ng tao.', distractors: ['KABUTIHAN', 'KATARUNGAN', 'KALINISAN'] },
    { word: 'PAGKAKAISA', syllables: ['PAG', 'KA', 'KA', 'I', 'SA'], phoneticGuide: 'PAG-KA-KA-I-SA', clue: 'Sama-samang lakas at damdamin tungo sa iisang mithiin', readingPassage: 'Nakamit ang tagumpay ng buong koponan dahil sa kanilang pagkakaisa.', distractors: ['PAGTUTULUNGAN', 'BAYANIHAN', 'KASUNDUAN'] },
    { word: 'TEKNOLOHIYA', syllables: ['TEK', 'NO', 'LO', 'HI', 'YA'], phoneticGuide: 'TEK-NO-LO-HI-YA', clue: 'Makabagong imbensyon at agham na nagpapabilis ng gawain', readingPassage: 'Gamitin ang makabagong teknolohiya sa kapaki-pakinabang na pagkatuto.', distractors: ['IMBENSYON', 'KOMPYUTER', 'AGHAM'] },
    { word: 'KARANGALAN', syllables: ['KA', 'RA', 'NGA', 'LAN'], phoneticGuide: 'KA-RA-NGA-LAN', clue: 'Mataas na reputasyon, dangal, at papuring ipinagmamalaki', readingPassage: 'Isang dakilang karangalan ang maglingkod sa sariling bayan.', distractors: ['DANGAL', 'KAPURIHAN', 'TAGUMPAY'] },
    { word: 'KALAYAAN', syllables: ['KA', 'LA', 'YA', 'AN'], phoneticGuide: 'KA-LA-YA-AN', clue: 'Karapatang mamuhay nang malaya at walang pananakop', readingPassage: 'Ipinaglaban ng ating mga magigiting na bayani ang ating kalayaan.', distractors: ['KASARINLAN', 'KAPAYAPAAN', 'KATARUNGAN'] },
    { word: 'KATARUNGAN', syllables: ['KA', 'TA', 'RU', 'NGAN'], phoneticGuide: 'KA-TA-RU-NGAN', clue: 'Pantay-pantay at makatarungang pagtrato sa batas at lipunan', readingPassage: 'Dapat manaig ang katarungan para sa kapakanan ng lahat ng tao.', distractors: ['KATAPATAN', 'PAGKAPANTAY', 'KALAYAAN'] },
    { word: 'DIGNIDAD', syllables: ['DIG', 'NI', 'DAD'], phoneticGuide: 'DIG-NI-DAD', clue: 'Likas na dangal, halaga, at karapatan ng bawat nilalang', readingPassage: 'Igalang natin ang dangal at dignidad ng bawat kapwa tao.', distractors: ['KARANGALAN', 'KATAUHAN', 'HALAGA'] },
    { word: 'PANANAGUTAN', syllables: ['PA', 'NA', 'NA', 'GU', 'TAN'], phoneticGuide: 'PA-NA-NA-GU-TAN', clue: 'Pananagutan sa bawat pasya, kilos, at pananalita', readingPassage: 'Tuparin natin ang ating pananagutan bilang mamamayang Pilipino.', distractors: ['TUNGKULIN', 'RESPONSIBILIDAD', 'AKUSASYON'] },
    { word: 'SOBERANYA', syllables: ['SO', 'BE', 'RAN', 'YA'], phoneticGuide: 'SO-BE-RAN-YA', clue: 'Pinakamataas na kapangyarihan ng isang malayang estado', readingPassage: 'Ipagtanggol natin ang soberanya at kasarinlan ng Pilipinas.', distractors: ['KASARINLAN', 'KALAYAAN', 'PAMAHALAAN'] },
    { word: 'KABAYANIHAN', syllables: ['KA', 'BA', 'YA', 'NI', 'HAN'], phoneticGuide: 'KA-BA-YA-NI-HAN', clue: 'Pambihirang gawa ng pagmamahal at pag-aalay sa bayan', readingPassage: 'Ipinamalas ng ating mga manggagawa ang tunay na kabayanihan.', distractors: ['KATAPANGAN', 'KADAKILAAN', 'PAGMAMAHAL'] },
  ],
};

// =========================================================================
// Procedural Reading Generator (Guarantees limitless non-repeating reading passages)
// =========================================================================
function generateProceduralReadingItem(grade: CombatGradeLevel): CuratedReadingItem {
  const subjectsByGrade: Record<CombatGradeLevel, { words: string[]; contexts: string[] }> = {
    1: {
      words: ['LUPA', 'PATO', 'KASOY', 'MAMA', 'TALA', 'ULAN', 'SAPA', 'BOTA', 'BASO', 'KULA', 'PAA', 'DILA', 'NGIPIN', 'KAMAY'],
      contexts: [
        'Mabait at masipag si Maya.',
        'Kumakain ng masustansyang gulay ang bata.',
        'Naglalaro sila sa ilalim ng araw.',
        'Umiinom ng malinis na tubig ang bata araw-araw.',
        'Maliwanag ang mga bituin sa gabi.',
      ],
    },
    2: {
      contexts: [
        'Masiglang nag-aaral ang mga bata sa kanilang silid.',
        'Nagtutulungan ang magkakapitbahay upang linisin ang paligid.',
        'Sumisikat ang ginintuang araw sa likod ng bundok.',
        'Umihip ang malamig na simoy ng hangin sa bukid.',
        'Mabilis tumalon ang munting kuneho sa halamanan.',
      ],
      words: ['TALAHIB', 'BAKOD', 'HARDIN', 'HAPAG', 'TINIDOR', 'KUTSARA', 'PALASYO', 'KAPOTE', 'PAYONG', 'GINTONG'],
    },
    3: {
      contexts: [
        'Naging maunlad ang nayon dahil sa kasipagan ng mga tao.',
        'Ipinagmamalaki ng mga guro ang mabuting gawi ng mag-aaral.',
        'Tahimik na dumadaloy ang sariwang tubig sa batis.',
        'Nagtanim ng mga punongkahoy ang mga mag-aaral sa kabundukan.',
        'Mayaman sa makukulay na kultura ang kapuluan ng Pilipinas.',
      ],
      words: ['KAPULUAN', 'LUNTIAN', 'MABUTI', 'MARANGAL', 'SIGASIG', 'KALASAG', 'PANGAKO', 'KAPATID', 'LIWANAG'],
    },
    4: {
      contexts: [
        'Ipinakita ng mga kabataan ang kanilang pagmamahal sa kalikasan.',
        'Matiyagang nagsasaliksik ang pangkat upang makatuklas ng bago.',
        'Ang pangangalaga sa mga anyong-tubig ay pananagutan ng lahat.',
        'Bawat rehiyon sa ating bansa ay may natatanging tradisyon.',
      ],
      words: ['TRADISYON', 'PAGKILALA', 'KATATAGAN', 'ANYONG-LUPA', 'KARAPATAN', 'MAMAMAYAN', 'KULTURA'],
    },
    5: {
      contexts: [
        'Mahalagang maunawaan ng bawat indibidwal ang kahalagahan ng pagkakaisa.',
        'Ang pananagutan sa kapaligiran ay nagbubunga ng kasaganaan.',
        'Ipinaglaban ng mga bayani ang dangal at kinabukasan ng bansa.',
      ],
      words: ['KASAGANAAN', 'KAPAKANAN', 'KATARUNGAN', 'PAKIKIBAKA', 'PAGKUKUSA', 'KAGALINGAN'],
    },
    6: {
      contexts: [
        'Ang masusing pagsusuri sa mga datos ay nagbubunga ng tamang desisyon.',
        'Ang tunay na lider ay naglilingkod nang may katapatan at kababaang-loob.',
        'Ang pagtatanggol sa soberanya ay sagradong tungkulin ng bawat mamamayan.',
      ],
      words: ['PAMUMUNO', 'KABABAANG-LOOB', 'PAGSUSURI', 'INTEGRIDAD', 'KATATAGAN', 'PANANAMPALATAYA'],
    },
  };

  const pool = subjectsByGrade[grade] || subjectsByGrade[1];
  const word = pool.words[Math.floor(Math.random() * pool.words.length)];
  const contextSentence = pool.contexts[Math.floor(Math.random() * pool.contexts.length)];

  // Build syllables
  const syl = word.match(/.{1,2}/g) || [word];
  const phonetic = syl.join(' - ');

  return {
    word,
    syllables: syl,
    phoneticGuide: phonetic,
    clue: `Basahin nang wasto ang salitang "${word}"`,
    readingPassage: `${contextSentence} Pansinin ang salitang "${word}".`,
    distractors: [
      word.split('').reverse().join(''),
      word.slice(0, 2) + 'AN',
      'KA' + word.slice(-2),
    ],
  };
}

// =========================================================================
// Curated Multi-Grade English Reading Pools (Grades 1 to 6)
// =========================================================================
const GRADE_ENGLISH_POOLS: Record<CombatGradeLevel, CuratedReadingItem[]> = {
  1: [
    { word: 'FAMILY', syllables: ['FAM', 'I', 'LY'], phoneticGuide: 'FAM-ih-lee', clue: 'People who love and care for each other at home', readingPassage: 'We eat dinner together as a happy family.', distractors: ['FRIEND', 'FATHER', 'FLOWER'] },
    { word: 'FRIEND', syllables: ['FRIEND'], phoneticGuide: 'FREND', clue: 'Someone you like and enjoy playing with', readingPassage: 'Maya is my best friend in school.', distractors: ['FAMILY', 'FATHER', 'FARMER'] },
    { word: 'WATER', syllables: ['WA', 'TER'], phoneticGuide: 'WAH-ter', clue: 'Clear liquid that we drink to stay healthy', readingPassage: 'Drink clean water every day to stay strong.', distractors: ['WAITER', 'WINTER', 'WEATHER'] },
    { word: 'GARDEN', syllables: ['GAR', 'DEN'], phoneticGuide: 'GAR-den', clue: 'A green place where plants and flowers grow', readingPassage: 'Grandmother waters the roses in the garden.', distractors: ['GARAGE', 'GOLDEN', 'GROUND'] },
    { word: 'SUNSHINE', syllables: ['SUN', 'SHINE'], phoneticGuide: 'SUN-shyn', clue: 'Warm, bright light that comes from the sun', readingPassage: 'The morning sunshine makes the flowers bloom.', distractors: ['SUNSET', 'STARLIGHT', 'SHADOW'] },
    { word: 'MORNING', syllables: ['MORN', 'ING'], phoneticGuide: 'MORN-ing', clue: 'The early time of day when the sun rises', readingPassage: 'We eat breakfast early in the morning.', distractors: ['MONKEY', 'MOVING', 'MARKET'] },
    { word: 'SCHOOL', syllables: ['SCHOOL'], phoneticGuide: 'SKOOL', clue: 'A place where children learn and study', readingPassage: 'Children walk to school with their backpacks.', distractors: ['SCHOLAR', 'SPRING', 'STREET'] },
    { word: 'PENCIL', syllables: ['PEN', 'CIL'], phoneticGuide: 'PEN-sil', clue: 'A tool used for writing and drawing on paper', readingPassage: 'Leo sharpens his yellow pencil before class.', distractors: ['PAPER', 'PICTURE', 'POCKET'] },
    { word: 'BREAD', syllables: ['BREAD'], phoneticGuide: 'BRED', clue: 'Warm baked food from the bakery', readingPassage: 'Father bought fresh warm bread for breakfast.', distractors: ['BROWN', 'BRAVE', 'BOARD'] },
    { word: 'HAPPY', syllables: ['HAP', 'PY'], phoneticGuide: 'HAP-ee', clue: 'Feeling joy and smiling with pleasure', readingPassage: 'The children have happy smiles on their faces.', distractors: ['HEAVY', 'HONEY', 'HELP'] },
    { word: 'FLOWER', syllables: ['FLOW', 'ER'], phoneticGuide: 'FLOW-er', clue: 'A colorful, fragrant part of a plant', readingPassage: 'The red flower smells sweet in the garden.', distractors: ['FLAVOR', 'FATHER', 'FLOOR'] },
    { word: 'KITTEN', syllables: ['KIT', 'TEN'], phoneticGuide: 'KIT-en', clue: 'A playful baby cat', readingPassage: 'The little kitten sleeps softly on the rug.', distractors: ['KITCHEN', 'MITTEN', 'CHICKEN'] },
  ],
  2: [
    { word: 'KITCHEN', syllables: ['KITCH', 'EN'], phoneticGuide: 'KITCH-en', clue: 'The room in the house where meals are cooked', readingPassage: 'Mother cooks delicious soup in the kitchen.', distractors: ['CHICKEN', 'KITTEN', 'CURTAIN'] },
    { word: 'BREAKFAST', syllables: ['BREAK', 'FAST'], phoneticGuide: 'BREK-fast', clue: 'The first meal eaten in the morning', readingPassage: 'We enjoy eggs and toast for our breakfast.', distractors: ['BLANKET', 'BASKET', 'BAKERY'] },
    { word: 'BASKET', syllables: ['BAS', 'KET'], phoneticGuide: 'BAS-kit', clue: 'A container woven from reeds to hold fruits', readingPassage: 'Grandpa filled the basket with sweet mangoes.', distractors: ['BLANKET', 'BUCKET', 'BREAKFAST'] },
    { word: 'WINDOW', syllables: ['WIN', 'DOW'], phoneticGuide: 'WIN-doh', clue: 'An opening in a wall to let in light and air', readingPassage: 'Sunlight streams through the open bedroom window.', distractors: ['WINTER', 'YELLOW', 'PILLOW'] },
    { word: 'RAINBOW', syllables: ['RAIN', 'BOW'], phoneticGuide: 'RAYN-boh', clue: 'An arch of colors that appears after the rain', readingPassage: 'A colorful rainbow appeared in the blue sky.', distractors: ['RAINDROP', 'RIBBON', 'WINDOW'] },
    { word: 'BLANKET', syllables: ['BLAN', 'KET'], phoneticGuide: 'BLANG-kit', clue: 'A warm cover used on a bed when sleeping', readingPassage: 'The warm blanket keeps the baby cozy at night.', distractors: ['BASKET', 'BUCKET', 'JACKET'] },
    { word: 'MARKET', syllables: ['MAR', 'KET'], phoneticGuide: 'MAR-kit', clue: 'A busy place where fresh foods are sold', readingPassage: 'Aunt Maria buys fresh vegetables at the market.', distractors: ['BASKET', 'JACKET', 'POCKET'] },
    { word: 'BUTTERFLY', syllables: ['BUT', 'TER', 'FLY'], phoneticGuide: 'BUT-er-fly', clue: 'An insect with large, colorful wings', readingPassage: 'The butterfly flutters from flower to flower.', distractors: ['DRAGONFLY', 'BEAUTIFUL', 'YELLOW'] },
  ],
  3: [
    { word: 'BEAUTIFUL', syllables: ['BEAU', 'TI', 'FUL'], phoneticGuide: 'BYOO-tih-ful', clue: 'Pleasing to the eyes and wonderful to see', readingPassage: 'The sunset over the hills is truly beautiful.', distractors: ['WONDERFUL', 'CAREFUL', 'PEACEFUL'] },
    { word: 'TOGETHER', syllables: ['TO', 'GETH', 'ER'], phoneticGuide: 'tuh-GETH-er', clue: 'With each other in one group or team', readingPassage: 'The students cleaned their classroom together.', distractors: ['WEATHER', 'FEATHER', 'ANOTHER'] },
    { word: 'HEALTHY', syllables: ['HEALTH', 'Y'], phoneticGuide: 'HEL-thee', clue: 'In good physical condition and eating well', readingPassage: 'Eating fresh vegetables keeps our bodies healthy.', distractors: ['WEALTHY', 'HEAVY', 'HAPPY'] },
    { word: 'NEIGHBOR', syllables: ['NEIGH', 'BOR'], phoneticGuide: 'NAY-ber', clue: 'A person who lives near your house', readingPassage: 'Our kind neighbor shared fresh bread with us.', distractors: ['NEPHEW', 'NUMBER', 'NATURAL'] },
    { word: 'CLASSROOM', syllables: ['CLASS', 'ROOM'], phoneticGuide: 'KLAS-room', clue: 'A room in a school where lessons are taught', readingPassage: 'The classroom is clean, bright, and organized.', distractors: ['BEDROOM', 'BATHROOM', 'MUSHROOM'] },
    { word: 'DELICIOUS', syllables: ['DE', 'LI', 'CIOUS'], phoneticGuide: 'dih-LISH-us', clue: 'Having a very pleasing and tasty flavor', readingPassage: 'Mother baked a delicious batch of warm cookies.', distractors: ['PRECIOUS', 'DANGEROUS', 'GENEROUS'] },
    { word: 'EXERCISE', syllables: ['EX', 'ER', 'CISE'], phoneticGuide: 'EK-ser-syz', clue: 'Physical activity done to keep fit and healthy', readingPassage: 'Morning exercise gives us energy for the day.', distractors: ['EXAMPLE', 'EXAMINE', 'EXPERIENCE'] },
  ],
  4: [
    { word: 'DISCOVER', syllables: ['DIS', 'COV', 'ER'], phoneticGuide: 'dih-SKUV-er', clue: 'To find or learn something new for the first time', readingPassage: 'Scientists discover new stars in the night sky.', distractors: ['RECOVER', 'UNCOVER', 'DELIVER'] },
    { word: 'COMMUNITY', syllables: ['COM', 'MU', 'NI', 'TY'], phoneticGuide: 'kuh-MYOO-nih-tee', clue: 'A group of people living together in one area', readingPassage: 'Neighbors help each other in our peaceful community.', distractors: ['OPPORTUNITY', 'COMMUNICATION', 'SECURITY'] },
    { word: 'ENVIRONMENT', syllables: ['EN', 'VI', 'RON', 'MENT'], phoneticGuide: 'en-VY-run-munt', clue: 'The natural world of land, water, air, and trees', readingPassage: 'We plant green trees to protect our environment.', distractors: ['GOVERNMENT', 'DEVELOPMENT', 'EXPERIMENT'] },
    { word: 'COOPERATION', syllables: ['CO', 'OP', 'ER', 'A', 'TION'], phoneticGuide: 'koh-op-er-AY-shun', clue: 'Working together willingly to achieve a common goal', readingPassage: 'Cooperation among classmates makes group projects fun.', distractors: ['CELEBRATION', 'CONVERSATION', 'OPERATION'] },
    { word: 'CELEBRATION', syllables: ['CEL', 'E', 'BRA', 'TION'], phoneticGuide: 'sel-uh-BRAY-shun', clue: 'A joyful gathering or party for a special event', readingPassage: 'The town held a grand celebration for the harvest.', distractors: ['COOPERATION', 'MEDITATION', 'GENERATION'] },
    { word: 'IMPORTANT', syllables: ['IM', 'POR', 'TANT'], phoneticGuide: 'im-POR-tunt', clue: 'Having great value, significance, or meaning', readingPassage: 'Reading every day is important for learning.', distractors: ['IMPATIENT', 'IMPRESSIVE', 'INVENTOR'] },
  ],
  5: [
    { word: 'RESPONSIBILITY', syllables: ['RE', 'SPON', 'SI', 'BIL', 'I', 'TY'], phoneticGuide: 'rih-spon-suh-BIL-ih-tee', clue: 'A duty or obligation to take care of something', readingPassage: 'Taking care of household chores is my responsibility.', distractors: ['POSSIBILITY', 'ABILITY', 'PRODUCTIVITY'] },
    { word: 'GENEROSITY', syllables: ['GEN', 'ER', 'OS', 'I', 'TY'], phoneticGuide: 'jen-er-OS-ih-tee', clue: 'The quality of being kind and sharing with others', readingPassage: 'Her generosity brought warm meals to hungry families.', distractors: ['CURIOSITY', 'VELOCITY', 'CAPACITY'] },
    { word: 'KNOWLEDGE', syllables: ['KNOWL', 'EDGE'], phoneticGuide: 'NOL-ij', clue: 'Information, skills, and understanding gained by study', readingPassage: 'Reading books expands our knowledge of the world.', distractors: ['COLLEGE', 'COURAGE', 'PACKAGE'] },
    { word: 'APPRECIATION', syllables: ['AP', 'PRE', 'CI', 'A', 'TION'], phoneticGuide: 'uh-pree-shee-AY-shun', clue: 'Recognizing the good qualities of someone or something', readingPassage: 'We expressed deep appreciation to our teachers.', distractors: ['PARTICIPATION', 'ANTICIPATION', 'APPLICATION'] },
    { word: 'COMMUNICATION', syllables: ['COM', 'MU', 'NI', 'CA', 'TION'], phoneticGuide: 'kuh-myoo-nih-KAY-shun', clue: 'Sharing information, thoughts, and feelings clearly', readingPassage: 'Clear communication helps friends solve problems peacefully.', distractors: ['COMMUNITY', 'CONVERSATION', 'CELEBRATION'] },
    { word: 'CONSERVATION', syllables: ['CON', 'SER', 'VA', 'TION'], phoneticGuide: 'kon-ser-VAY-shun', clue: 'Protecting and saving natural resources from waste', readingPassage: 'Water conservation ensures clean water for the future.', distractors: ['CONVERSATION', 'OBSERVATION', 'RESERVATION'] },
  ],
  6: [
    { word: 'PERSEVERANCE', syllables: ['PER', 'SE', 'VER', 'ANCE'], phoneticGuide: 'per-suh-VEER-uns', clue: 'Continuing effort to achieve success despite difficulty', readingPassage: 'Through hard work and perseverance, Maria reached her dream.', distractors: ['PERFORMANCE', 'PREFERENCE', 'IMPORTANCE'] },
    { word: 'CIVILIZATION', syllables: ['CIV', 'I', 'LI', 'ZA', 'TION'], phoneticGuide: 'siv-uh-lih-ZAY-shun', clue: 'An advanced stage of human society and culture', readingPassage: 'Ancient civilizations built great libraries and monuments.', distractors: ['PARTICIPATION', 'CELEBRATION', 'ORGANIZATION'] },
    { word: 'SUSTAINABLE', syllables: ['SUS', 'TAIN', 'A', 'BLE'], phoneticGuide: 'suh-STAY-nuh-bul', clue: 'Able to be maintained without harming the environment', readingPassage: 'Solar energy provides clean and sustainable power.', distractors: ['RELIABLE', 'REMARKABLE', 'VALUABLE'] },
    { word: 'PARTICIPATION', syllables: ['PAR', 'TIC', 'I', 'PA', 'TION'], phoneticGuide: 'par-tis-ih-PAY-shun', clue: 'The action of taking part in an activity or event', readingPassage: 'Active participation in school clubs builds leadership.', distractors: ['CIVILIZATION', 'ANTICIPATION', 'APPRECIATION'] },
    { word: 'EXTRAORDINARY', syllables: ['EX', 'TRAOR', 'DI', 'NAR', 'Y'], phoneticGuide: 'ek-stror-duh-ner-ee', clue: 'Very unusual, remarkable, and beyond the ordinary', readingPassage: 'The young inventor created an extraordinary water filter.', distractors: ['ORDINARY', 'REVOLUTIONARY', 'DISCIPLINARY'] },
    { word: 'BIODIVERSITY', syllables: ['BI', 'O', 'DI', 'VER', 'SI', 'TY'], phoneticGuide: 'by-oh-dy-VER-sih-tee', clue: 'The variety of living plants and animals in an ecosystem', readingPassage: 'Tropical rainforests have rich biodiversity of wildlife.', distractors: ['UNIVERSITY', 'COMMUNITY', 'SECURITY'] },
  ],
};

function generateProceduralEnglishItem(grade: CombatGradeLevel): CuratedReadingItem {
  const englishThemesByGrade: Record<CombatGradeLevel, { words: string[]; contexts: string[] }> = {
    1: {
      words: ['SUNLIGHT', 'KITTEN', 'PUPPY', 'BASKET', 'GARDEN', 'PICNIC', 'PENCIL', 'RABBIT', 'YELLOW', 'SWEET'],
      contexts: [
        'The morning brings gentle sunshine to the porch.',
        'A playful puppy runs across the green lawn.',
        'Mother puts fresh fruit inside the picnic basket.',
      ],
    },
    2: {
      words: ['BLANKET', 'BREAKFAST', 'KITCHEN', 'RAINBOW', 'DOCTOR', 'SUMMER', 'POCKET', 'MARKET', 'BUTTERFLY'],
      contexts: [
        'Warm pancakes smell wonderful in the breakfast room.',
        'We buy sweet apples and bread at the local market.',
        'A colorful butterfly rests upon the flower petals.',
      ],
    },
    3: {
      words: ['BEAUTIFUL', 'TOGETHER', 'HEALTHY', 'NEIGHBOR', 'CLASSROOM', 'EXERCISE', 'DELICIOUS', 'VACATION'],
      contexts: [
        'Our friendly neighbors greeted us with warm smiles.',
        'Students work together to plant trees around the campus.',
        'Eating fresh fruits keeps our minds and bodies healthy.',
      ],
    },
    4: {
      words: ['DISCOVER', 'COMMUNITY', 'ENVIRONMENT', 'CELEBRATION', 'COOPERATION', 'IMPORTANT', 'HARVEST'],
      contexts: [
        'Children discover fascinating sea shells along the shore.',
        'Our community gathers every month to clean the park.',
        'Protecting our natural environment is our common duty.',
      ],
    },
    5: {
      words: ['RESPONSIBILITY', 'GENEROSITY', 'KNOWLEDGE', 'APPRECIATION', 'COMMUNICATION', 'CONSERVATION'],
      contexts: [
        'Taking care of younger siblings is a valued family duty.',
        'Books provide limitless knowledge about distant galaxies.',
        'Generosity brings peace and warmth to all people.',
      ],
    },
    6: {
      words: ['PERSEVERANCE', 'CIVILIZATION', 'SUSTAINABLE', 'PARTICIPATION', 'EXTRAORDINARY', 'BIODIVERSITY'],
      contexts: [
        'Through perseverance and steady practice, the athlete succeeded.',
        'Preserving biodiversity maintains balance in our ecosystem.',
        'Active civic participation helps democracy flourish.',
      ],
    },
  };

  const pool = englishThemesByGrade[grade] || englishThemesByGrade[1];
  const word = pool.words[Math.floor(Math.random() * pool.words.length)];
  const context = pool.contexts[Math.floor(Math.random() * pool.contexts.length)];
  const syl = word.match(/.{1,3}/g) || [word];

  return {
    word,
    syllables: syl,
    phoneticGuide: syl.join(' - '),
    clue: `Read and pronounce the word "${word}" carefully`,
    readingPassage: `${context} Focus on the word "${word}".`,
    distractors: [
      word.split('').reverse().join(''),
      word.slice(0, 3) + 'ING',
      'UN' + word.slice(-3),
    ],
  };
}

// =========================================================================
// Procedural Math Question Generator (Grades 1 to 6)
// STRICTLY IN ENGLISH & GROUNDED ENTIRELY IN REAL DAILY LIFE SITUATIONS!
// Zero game mechanics, zero monster/HP references.
// =========================================================================
function generateProceduralMathItem(grade: CombatGradeLevel): {
  question: string;
  emoji: string;
  correctAnswer: string;
  distractors: string[];
  explanation: string;
  hint: string;
} {
  const emojis = ['🍎', '🥖', '🥛', '✏️', '🚌', '🪴', '🍪', '🧺', '🍌', '🥭', '📚', '🎒'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];

  if (grade === 1) {
    const type = Math.random();
    if (type < 0.35) {
      // Buying fruits at the grocery/market
      const red = Math.floor(Math.random() * 6) + 4; // 4 to 9
      const green = Math.floor(Math.random() * 6) + 3; // 3 to 8
      const total = red + green;
      return {
        question: `Lucas bought ${red} red apples and ${green} green apples at the fruit stall. How many apples did he buy in all?`,
        emoji: '🍎',
        correctAnswer: `${total} apples`,
        distractors: [`${total + 1} apples`, `${Math.max(1, total - 1)} apples`, `${total + 2} apples`],
        explanation: `Add the apples: ${red} + ${green} = ${total} apples in total.`,
        hint: 'Add the two groups of apples together.',
      };
    } else if (type < 0.7) {
      // Eggs for cooking breakfast
      const totalEggs = Math.floor(Math.random() * 6) + 10; // 10 to 15
      const usedEggs = Math.floor(Math.random() * 5) + 3;   // 3 to 7
      const left = totalEggs - usedEggs;
      return {
        question: `Mother had ${totalEggs} fresh eggs in a basket. She used ${usedEggs} eggs to cook breakfast. How many eggs are left in the basket?`,
        emoji: '🍳',
        correctAnswer: `${left} eggs`,
        distractors: [`${left + 1} eggs`, `${Math.max(1, left - 1)} eggs`, `${left + 2} eggs`],
        explanation: `Subtract the used eggs: ${totalEggs} - ${usedEggs} = ${left} eggs left.`,
        hint: 'Count backward or subtract the eggs that were used.',
      };
    } else {
      // School pencils
      const initial = Math.floor(Math.random() * 5) + 5; // 5 to 9
      const gifted = Math.floor(Math.random() * 4) + 3;  // 3 to 6
      const total = initial + gifted;
      return {
        question: `Maya has ${initial} colored pencils. Her teacher gave her ${gifted} more pencils. How many pencils does Maya have now?`,
        emoji: '✏️',
        correctAnswer: `${total} pencils`,
        distractors: [`${total + 1} pencils`, `${Math.max(1, total - 2)} pencils`, `${total + 3} pencils`],
        explanation: `${initial} pencils plus ${gifted} pencils equals ${total} pencils in all.`,
        hint: 'Add the new pencils to the ones Maya already had.',
      };
    }
  }

  if (grade === 2) {
    const type = Math.random();
    if (type < 0.35) {
      // Buying bread and milk at the bakery
      const breadPrice = [25, 30, 35, 40][Math.floor(Math.random() * 4)];
      const milkPrice = [35, 40, 45, 50][Math.floor(Math.random() * 4)];
      const total = breadPrice + milkPrice;
      return {
        question: `At the bakery, a loaf of bread costs ₱${breadPrice} and a carton of milk costs ₱${milkPrice}. What is the total cost?`,
        emoji: '🥖',
        correctAnswer: `₱${total}`,
        distractors: [`₱${total + 10}`, `₱${total - 5}`, `₱${total + 5}`],
        explanation: `Add the two prices: ₱${breadPrice} + ₱${milkPrice} = ₱${total}.`,
        hint: 'Add the tens digits first, then the ones digits.',
      };
    } else if (type < 0.7) {
      // School bus seating
      const totalSeats = 48;
      const seated = Math.floor(Math.random() * 15) + 20; // 20 to 34
      const empty = totalSeats - seated;
      return {
        question: `A school bus has ${totalSeats} passenger seats. If ${seated} students have taken their seats, how many seats are still empty?`,
        emoji: '🚌',
        correctAnswer: `${empty} seats`,
        distractors: [`${empty + 2} seats`, `${empty - 2} seats`, `${empty + 10} seats`],
        explanation: `Subtract seated students: ${totalSeats} - ${seated} = ${empty} empty seats.`,
        hint: 'Subtract the occupied seats from the total capacity.',
      };
    } else {
      // Packing cookies in bags
      const bags = [3, 4, 5, 6][Math.floor(Math.random() * 4)];
      const cookiesPerBag = [5, 6, 8, 10][Math.floor(Math.random() * 4)];
      const totalCookies = bags * cookiesPerBag;
      return {
        question: `Grandmother packed ${bags} small gift bags with ${cookiesPerBag} cookies in each bag. How many cookies did she pack in all?`,
        emoji: '🍪',
        correctAnswer: `${totalCookies} cookies`,
        distractors: [`${totalCookies + cookiesPerBag} cookies`, `${Math.max(2, totalCookies - cookiesPerBag)} cookies`, `${totalCookies + 4} cookies`],
        explanation: `${bags} bags with ${cookiesPerBag} cookies each: ${bags} × ${cookiesPerBag} = ${totalCookies} cookies.`,
        hint: 'Multiply the number of bags by the cookies per bag.',
      };
    }
  }

  if (grade === 3) {
    const type = Math.random();
    if (type < 0.35) {
      // Juice packs multiplication
      const packs = Math.floor(Math.random() * 5) + 4; // 4 to 8
      const cansPerPack = 6;
      const total = packs * cansPerPack;
      return {
        question: `Father bought ${packs} packs of juice for a family gathering. Each pack contains ${cansPerPack} juice boxes. How many juice boxes are there in all?`,
        emoji: '🧃',
        correctAnswer: `${total} boxes`,
        distractors: [`${total + cansPerPack} boxes`, `${Math.max(6, total - cansPerPack)} boxes`, `${total + 4} boxes`],
        explanation: `Multiply the packs: ${packs} × ${cansPerPack} = ${total} juice boxes.`,
        hint: 'Use the 6 times table.',
      };
    } else if (type < 0.7) {
      // Sharing snacks equally
      const students = [4, 5, 6, 8][Math.floor(Math.random() * 4)];
      const perStudent = Math.floor(Math.random() * 5) + 4; // 4 to 8
      const totalPieces = students * perStudent;
      return {
        question: `Teacher Grace has ${totalPieces} coloring crayons to distribute equally among ${students} students. How many crayons does each student get?`,
        emoji: '🖍️',
        correctAnswer: `${perStudent} crayons`,
        distractors: [`${perStudent + 1} crayons`, `${Math.max(1, perStudent - 1)} crayons`, `${perStudent + 2} crayons`],
        explanation: `Divide equally: ${totalPieces} ÷ ${students} = ${perStudent} crayons per student.`,
        hint: 'Divide the total crayons by the number of students.',
      };
    } else {
      // Weekly savings
      const week1 = Math.floor(Math.random() * 60) + 120; // 120 to 179
      const week2 = Math.floor(Math.random() * 60) + 130; // 130 to 189
      const totalSavings = week1 + week2;
      return {
        question: `David saved ₱${week1} in his piggy bank in the first week, and ₱${week2} in the second week. What is the total amount he saved?`,
        emoji: '🪙',
        correctAnswer: `₱${totalSavings}`,
        distractors: [`₱${totalSavings + 10}`, `₱${totalSavings - 10}`, `₱${totalSavings + 20}`],
        explanation: `Add the two savings: ₱${week1} + ₱${week2} = ₱${totalSavings}.`,
        hint: 'Line up hundreds, tens, and ones.',
      };
    }
  }

  if (grade === 4) {
    const type = Math.random();
    if (type < 0.35) {
      // Sacks of rice harvest
      const morning = Math.floor(Math.random() * 50) + 125; // 125 to 174
      const afternoon = Math.floor(Math.random() * 50) + 130; // 130 to 179
      const total = morning + afternoon;
      return {
        question: `A local farmer harvested ${morning} sacks of rice in the morning and ${afternoon} sacks in the afternoon. How many sacks were harvested in total?`,
        emoji: '🌾',
        correctAnswer: `${total} sacks`,
        distractors: [`${total + 10} sacks`, `${total - 10} sacks`, `${total + 20} sacks`],
        explanation: `Add the sacks: ${morning} + ${afternoon} = ${total} sacks.`,
        hint: 'Add the morning and afternoon harvest counts.',
      };
    } else if (type < 0.7) {
      // Measuring liquid in pitcher
      const totalMl = 950;
      const poured = Math.floor(Math.random() * 6) * 50 + 250; // 250 to 500
      const remaining = totalMl - poured;
      return {
        question: `A water pitcher holds ${totalMl} milliliters of fresh lemonade. If Sophia pours ${poured} milliliters for her family, how many milliliters remain?`,
        emoji: '🍋',
        correctAnswer: `${remaining} ml`,
        distractors: [`${remaining + 50} ml`, `${remaining - 50} ml`, `${remaining + 100} ml`],
        explanation: `Subtract poured liquid: ${totalMl} ml - ${poured} ml = ${remaining} ml left.`,
        hint: 'Subtract the poured volume from the initial volume.',
      };
    } else {
      // Garden perimeter
      const length = Math.floor(Math.random() * 5) + 8; // 8 to 12
      const width = Math.floor(Math.random() * 4) + 4;   // 4 to 7
      const perimeter = 2 * (length + width);
      return {
        question: `A rectangular community vegetable garden has a length of ${length} meters and a width of ${width} meters. What is its perimeter?`,
        emoji: '🪴',
        correctAnswer: `${perimeter} meters`,
        distractors: [`${perimeter + 4} meters`, `${length * width} meters`, `${perimeter - 2} meters`],
        explanation: `Perimeter of a rectangle = 2 × (length + width) = 2 × (${length} + ${width}) = ${perimeter} meters.`,
        hint: 'Perimeter formula: P = 2 × (length + width).',
      };
    }
  }

  if (grade === 5) {
    const type = Math.random();
    if (type < 0.35) {
      // Store discount percentage
      const originalPrice = [200, 300, 400, 500][Math.floor(Math.random() * 4)];
      const discountPercent = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
      const discountAmount = (originalPrice * discountPercent) / 100;
      return {
        question: `A student backpack originally priced at ₱${originalPrice} is on sale with a ${discountPercent}% discount. What is the discount amount in pesos?`,
        emoji: '🎒',
        correctAnswer: `₱${discountAmount}`,
        distractors: [`₱${discountAmount + 25}`, `₱${Math.max(10, discountAmount - 20)}`, `₱${discountAmount + 50}`],
        explanation: `${discountPercent}% of ₱${originalPrice} = (${discountPercent} / 100) × ${originalPrice} = ₱${discountAmount}.`,
        hint: 'Multiply the original price by the percentage in decimal form.',
      };
    } else if (type < 0.7) {
      // Fruit weight decimals
      const mangoKg = Math.round((Math.random() * 2 + 1.5) * 10) / 10; // 1.5 to 3.5
      const bananaKg = Math.round((Math.random() * 2 + 1.2) * 10) / 10; // 1.2 to 3.2
      const totalKg = Math.round((mangoKg + bananaKg) * 10) / 10;
      return {
        question: `Sarah bought ${mangoKg} kilograms of ripe mangoes and ${bananaKg} kilograms of bananas at the market. What is the total weight in kilograms?`,
        emoji: '🍌',
        correctAnswer: `${totalKg} kg`,
        distractors: [`${Math.round((totalKg + 0.5) * 10) / 10} kg`, `${Math.round((totalKg - 0.3) * 10) / 10} kg`, `${totalKg + 1} kg`],
        explanation: `Align the decimal points: ${mangoKg} kg + ${bananaKg} kg = ${totalKg} kg.`,
        hint: 'Line up the decimal points when adding decimals.',
      };
    } else {
      // Daily allowance savings
      const daily = [15, 20, 25, 30][Math.floor(Math.random() * 4)];
      const days = [5, 6, 7, 8][Math.floor(Math.random() * 4)];
      const totalSaved = daily * days;
      return {
        question: `Carlos saves ₱${daily} from his daily school allowance every day for ${days} days. How much money did he save in total?`,
        emoji: '🪙',
        correctAnswer: `₱${totalSaved}`,
        distractors: [`₱${totalSaved + daily}`, `₱${totalSaved - daily}`, `₱${totalSaved + 20}`],
        explanation: `Multiply daily savings: ₱${daily} × ${days} days = ₱${totalSaved}.`,
        hint: 'Multiply the daily amount by the number of days.',
      };
    }
  }

  // Grade 6: Real-life ratios, averages, percentages, and grocery budgets
  const type = Math.random();
  if (type < 0.35) {
    // Real-life ratio
    const boysRatio = [2, 3][Math.floor(Math.random() * 2)];
    const girlsRatio = [3, 4, 5][Math.floor(Math.random() * 3)];
    const factor = [4, 5, 6][Math.floor(Math.random() * 3)];
    const boysCount = boysRatio * factor;
    const girlsCount = girlsRatio * factor;
    return {
      question: `In a school music club, the ratio of boys to girls is ${boysRatio} to ${girlsRatio}. If there are ${boysCount} boys, how many girls are in the club?`,
      emoji: '🎵',
      correctAnswer: `${girlsCount} girls`,
      distractors: [`${girlsCount + 2} girls`, `${girlsCount - factor} girls`, `${boysCount + girlsRatio} girls`],
      explanation: `The multiplier is ${boysCount} ÷ ${boysRatio} = ${factor}. Multiply the girls ratio: ${girlsRatio} × ${factor} = ${girlsCount} girls.`,
      hint: 'Find the scaling multiplier by dividing the known quantity by its ratio part.',
    };
  } else if (type < 0.7) {
    // Three-day savings average
    const d1 = 120;
    const d2 = 150;
    const d3 = 180;
    const avg = (d1 + d2 + d3) / 3;
    return {
      question: `Lucas saved ₱${d1} on Monday, ₱${d2} on Tuesday, and ₱${d3} on Wednesday. What is his average daily savings in pesos?`,
      emoji: '📊',
      correctAnswer: `₱${avg}`,
      distractors: [`₱${avg + 15}`, `₱${avg - 10}`, `₱${avg + 25}`],
      explanation: `Add the savings: ₱${d1} + ₱${d2} + ₱${d3} = ₱${d1 + d2 + d3}. Divide by 3 days: ₱${d1 + d2 + d3} ÷ 3 = ₱${avg}.`,
      hint: 'Find the sum of all values, then divide by the number of days.',
    };
  } else {
    // Grocery budget and change
    const bill = 1000;
    const cost = Math.floor(Math.random() * 30) * 5 + 725; // 725 to 870
    const change = bill - cost;
    return {
      question: `Mrs. Santos paid with a ₱${bill} bill for family groceries amounting to ₱${cost}. How much change should she receive?`,
      emoji: '🛒',
      correctAnswer: `₱${change}`,
      distractors: [`₱${change + 10}`, `₱${change - 10}`, `₱${change + 5}`],
      explanation: `Subtract the cost from the cash given: ₱${bill} - ₱${cost} = ₱${change} change.`,
      hint: 'Subtract the total bill from the ₱1,000 banknote.',
    };
  }
}

// =========================================================================
// Helpers & Core Service
// =========================================================================

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Fetch fresh AI challenges from backend API endpoint with strict non-repetition
 */
export async function requestAiCombatChallenges(params: {
  mode: CombatSubject;
  gradeLevel: CombatGradeLevel;
  count?: number;
}): Promise<CombatChallenge[]> {
  try {
    const { mode, gradeLevel, count = 2 } = params;
    const excludeWords =
      mode === 'english'
        ? Array.from(askedEnglishWordSignatures).slice(-60)
        : Array.from(askedReadingWordSignatures).slice(-60);
    const excludeQuestions = Array.from(askedMathQuestionSignatures).slice(-60);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8500);

    const res = await fetch('/api/ai/combat-challenge', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode,
        gradeLevel,
        excludeWords,
        excludeQuestions,
        count,
      }),
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.challenges) && data.challenges.length > 0) {
        const valid: CombatChallenge[] = [];
        for (const item of data.challenges) {
          if (mode === 'english' && (item.targetWord || item.word) && Array.isArray(item.options || item.choices)) {
            const wordUpper = String(item.targetWord || item.word).trim().toUpperCase();
            if (wordUpper.length > 0 && !askedEnglishWordSignatures.has(wordUpper)) {
              const rawOpts = Array.isArray(item.options) ? item.options : item.choices;
              let options = rawOpts.map((o: any) => String(o).trim().toUpperCase());
              if (!options.includes(wordUpper)) {
                options[0] = wordUpper;
              }
              options = Array.from(new Set(options.filter(Boolean)));
              while (options.length < 4) {
                options.push(`WORD-${options.length + 1}`);
              }
              options = shuffleArray(options.slice(0, 4));

              valid.push({
                id: `ai-ec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                mode: 'english',
                gradeLevel,
                targetWord: wordUpper,
                equation: item.readingPassage || wordUpper,
                questionText: item.readingPassage || wordUpper,
                syllables: Array.isArray(item.syllables) && item.syllables.length > 0 ? item.syllables : [wordUpper],
                phoneticGuide: item.phoneticGuide || wordUpper,
                clue: item.clue || 'Read the word aloud or choose the correct spelling',
                readingPassage: item.readingPassage || undefined,
                visualEmoji: '📚',
                options,
                correctAnswer: wordUpper,
                correctIndex: options.indexOf(wordUpper),
                explanation: `Correct! The word is "${wordUpper}".`,
              });
            }
          } else if (mode === 'reading' && (item.targetWord || item.word) && Array.isArray(item.options || item.choices)) {
            const wordUpper = String(item.targetWord || item.word).trim().toUpperCase();
            if (wordUpper.length > 0 && !askedReadingWordSignatures.has(wordUpper)) {
              const rawOpts = Array.isArray(item.options) ? item.options : item.choices;
              let options = rawOpts.map((o: any) => String(o).trim().toUpperCase());
              if (!options.includes(wordUpper)) {
                options[0] = wordUpper;
              }
              options = Array.from(new Set(options.filter(Boolean)));
              while (options.length < 4) {
                options.push(`PAGBASA-${options.length + 1}`);
              }
              options = shuffleArray(options.slice(0, 4));

              valid.push({
                id: `ai-rc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                mode: 'reading',
                gradeLevel,
                targetWord: wordUpper,
                equation: item.readingPassage || wordUpper,
                questionText: item.readingPassage || wordUpper,
                syllables: Array.isArray(item.syllables) && item.syllables.length > 0 ? item.syllables : [wordUpper],
                phoneticGuide: item.phoneticGuide || wordUpper,
                clue: item.clue || 'Basahin nang wasto ang salita',
                readingPassage: item.readingPassage || undefined,
                visualEmoji: '📖',
                options,
                correctAnswer: wordUpper,
                correctIndex: options.indexOf(wordUpper),
                explanation: `Tama ang pagbasa sa salitang "${wordUpper}"!`,
              });
            }
          } else if (
            mode === 'math' &&
            (item.mathQuestion || item.question || item.problem || item.equation || item.questionText)
          ) {
            const qStr = String(
              item.mathQuestion || item.question || item.problem || item.equation || item.questionText || ''
            ).trim();
            const correctStr = String(
              item.correctAnswer !== undefined ? item.correctAnswer : (item.answer !== undefined ? item.answer : '')
            ).trim();

            if (qStr.length > 0 && correctStr.length > 0 && !askedMathQuestionSignatures.has(qStr.toLowerCase())) {
              const rawOpts = Array.isArray(item.options)
                ? item.options
                : Array.isArray(item.choices)
                ? item.choices
                : [];
              let options = rawOpts.map((o: any) => String(o).trim());
              if (!options.includes(correctStr)) {
                options.unshift(correctStr);
              }
              options = Array.from(new Set(options.filter(Boolean)));
              while (options.length < 4) {
                const numeric = parseFloat(correctStr);
                if (!isNaN(numeric)) {
                  options.push(`${numeric + options.length}`);
                } else {
                  options.push(`Choice ${options.length + 1}`);
                }
              }
              options = shuffleArray(options.slice(0, 4));

              valid.push({
                id: `ai-mc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                mode: 'math',
                gradeLevel,
                mathQuestion: qStr,
                equation: qStr,
                questionText: qStr,
                mathEmoji: item.mathEmoji || item.emoji || '🍎',
                visualEmoji: item.mathEmoji || item.emoji || '🍎',
                mathHint: item.mathHint || item.hint || 'Solve the real-life math problem carefully.',
                clue: item.mathHint || item.hint || 'Solve the real-life math problem carefully.',
                options,
                correctAnswer: correctStr,
                correctIndex: options.indexOf(correctStr),
                explanation: item.explanation || `The correct answer is ${correctStr}.`,
              });
            }
          }
        }
        return valid;
      }
    }
  } catch (err) {
    console.warn('[AI Combat Challenge] Fetch fallback:', err);
  }
  return [];
}

/**
 * Pre-fetch challenges in the background for zero-latency combat turns
 */
export async function prefetchCombatChallenges(
  mode: CombatSubject,
  gradeLevel: CombatGradeLevel
): Promise<void> {
  const queue =
    mode === 'english'
      ? englishQueues.get(gradeLevel)
      : mode === 'reading'
      ? readingQueues.get(gradeLevel)
      : mathQueues.get(gradeLevel);

  if (!queue || queue.length >= 3) return;

  if (mode === 'english') {
    if (isPrefetchingEnglish) return;
    isPrefetchingEnglish = true;
    try {
      const fresh = await requestAiCombatChallenges({ mode: 'english', gradeLevel, count: 2 });
      fresh.forEach((f) => queue.push(f));
    } finally {
      isPrefetchingEnglish = false;
    }
  } else if (mode === 'reading') {
    if (isPrefetchingReading) return;
    isPrefetchingReading = true;
    try {
      const fresh = await requestAiCombatChallenges({ mode: 'reading', gradeLevel, count: 2 });
      fresh.forEach((f) => queue.push(f));
    } finally {
      isPrefetchingReading = false;
    }
  } else {
    if (isPrefetchingMath) return;
    isPrefetchingMath = true;
    try {
      const fresh = await requestAiCombatChallenges({ mode: 'math', gradeLevel, count: 2 });
      fresh.forEach((f) => queue.push(f));
    } finally {
      isPrefetchingMath = false;
    }
  }
}

/**
 * Get a guaranteed fresh, NON-REPEATING combat challenge for Reading, English, or Math.
 * Prioritizes AI generation with strict anti-repetition tracking.
 */
export async function getCombatChallenge(params: {
  mode: CombatSubject;
  gradeLevel: CombatGradeLevel;
  attackTitle?: string;
  attackIcon?: string;
  forceFreshAi?: boolean;
}): Promise<CombatChallenge> {
  const { mode, gradeLevel, forceFreshAi = false } = params;

  // 1. If not forcing fresh, check pre-fetched AI challenge queue for instant zero-latency turn
  const queue =
    mode === 'english'
      ? englishQueues.get(gradeLevel)
      : mode === 'reading'
      ? readingQueues.get(gradeLevel)
      : mathQueues.get(gradeLevel);

  if (!forceFreshAi && queue && queue.length > 0) {
    while (queue.length > 0) {
      const candidate = queue.shift()!;
      if (mode === 'english' && candidate.targetWord) {
        if (!askedEnglishWordSignatures.has(candidate.targetWord.toUpperCase())) {
          askedEnglishWordSignatures.add(candidate.targetWord.toUpperCase());
          if (candidate.readingPassage) {
            askedEnglishPassageSignatures.add(candidate.readingPassage.toLowerCase());
          }
          setTimeout(() => prefetchCombatChallenges(mode, gradeLevel), 300);
          return candidate;
        }
      } else if (mode === 'reading' && candidate.targetWord) {
        if (!askedReadingWordSignatures.has(candidate.targetWord.toUpperCase())) {
          askedReadingWordSignatures.add(candidate.targetWord.toUpperCase());
          if (candidate.readingPassage) {
            askedReadingPassageSignatures.add(candidate.readingPassage.toLowerCase());
          }
          setTimeout(() => prefetchCombatChallenges(mode, gradeLevel), 300);
          return candidate;
        }
      } else if (mode === 'math' && candidate.mathQuestion) {
        if (!askedMathQuestionSignatures.has(candidate.mathQuestion.toLowerCase())) {
          askedMathQuestionSignatures.add(candidate.mathQuestion.toLowerCase());
          setTimeout(() => prefetchCombatChallenges(mode, gradeLevel), 300);
          return candidate;
        }
      }
    }
  }

  // 2. If queue empty or forceFreshAi requested, try on-demand AI call with 2.2s quick timeout
  try {
    const aiFresh = await Promise.race([
      requestAiCombatChallenges({ mode, gradeLevel, count: 2 }),
      new Promise<CombatChallenge[]>((resolve) => setTimeout(() => resolve([]), 2200)),
    ]);

    if (aiFresh && aiFresh.length > 0) {
      const picked = aiFresh[0];
      if (mode === 'english' && picked.targetWord) {
        askedEnglishWordSignatures.add(picked.targetWord.toUpperCase());
        if (picked.readingPassage) {
          askedEnglishPassageSignatures.add(picked.readingPassage.toLowerCase());
        }
      } else if (mode === 'reading' && picked.targetWord) {
        askedReadingWordSignatures.add(picked.targetWord.toUpperCase());
        if (picked.readingPassage) {
          askedReadingPassageSignatures.add(picked.readingPassage.toLowerCase());
        }
      } else if (mode === 'math' && picked.mathQuestion) {
        askedMathQuestionSignatures.add(picked.mathQuestion.toLowerCase());
      }
      // Put remaining in queue
      if (aiFresh.length > 1 && queue) {
        aiFresh.slice(1).forEach((item) => queue.push(item));
      }
      return picked;
    }
  } catch (err) {
    console.warn('[AI Combat Challenge] Quick fetch skipped:', err);
  }

  // 3. Fallback to rich curated pools or procedural engine with STRICT NON-REPETITION
  if (mode === 'english') {
    const pool = GRADE_ENGLISH_POOLS[gradeLevel] || GRADE_ENGLISH_POOLS[1];
    let candidates = pool.filter((item) => !askedEnglishWordSignatures.has(item.word.toUpperCase()));

    // If grade pool exhausted, pull unasked from other grades
    if (candidates.length === 0) {
      for (let g = 1; g <= 6; g++) {
        const otherPool = GRADE_ENGLISH_POOLS[g as CombatGradeLevel] || [];
        candidates = otherPool.filter((item) => !askedEnglishWordSignatures.has(item.word.toUpperCase()));
        if (candidates.length > 0) break;
      }
    }

    let picked: CuratedReadingItem;
    if (candidates.length > 0) {
      picked = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      picked = generateProceduralEnglishItem(gradeLevel);
    }

    askedEnglishWordSignatures.add(picked.word.toUpperCase());
    if (picked.readingPassage) {
      askedEnglishPassageSignatures.add(picked.readingPassage.toLowerCase());
    }

    const rawOptions = [picked.word, ...picked.distractors];
    const options = shuffleArray(Array.from(new Set(rawOptions))).slice(0, 4);

    const challenge: CombatChallenge = {
      id: `local-ec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      mode: 'english',
      gradeLevel,
      targetWord: picked.word,
      equation: picked.readingPassage || picked.word,
      questionText: picked.readingPassage || picked.word,
      syllables: picked.syllables,
      phoneticGuide: picked.phoneticGuide,
      clue: picked.clue,
      readingPassage: picked.readingPassage,
      visualEmoji: '📚',
      options,
      correctAnswer: picked.word,
      correctIndex: options.indexOf(picked.word),
      explanation: `🎉 Excellent! The word is "${picked.word}".`,
    };

    setTimeout(() => prefetchCombatChallenges('english', gradeLevel), 200);
    return challenge;
  } else if (mode === 'reading') {
    const pool = GRADE_READING_POOLS[gradeLevel] || GRADE_READING_POOLS[1];
    let candidates = pool.filter((item) => !askedReadingWordSignatures.has(item.word.toUpperCase()));

    // If grade pool exhausted, pull unasked from other grades
    if (candidates.length === 0) {
      for (let g = 1; g <= 6; g++) {
        const otherPool = GRADE_READING_POOLS[g as CombatGradeLevel] || [];
        candidates = otherPool.filter((item) => !askedReadingWordSignatures.has(item.word.toUpperCase()));
        if (candidates.length > 0) break;
      }
    }

    let picked: CuratedReadingItem;
    if (candidates.length > 0) {
      picked = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      picked = generateProceduralReadingItem(gradeLevel);
    }

    askedReadingWordSignatures.add(picked.word.toUpperCase());
    if (picked.readingPassage) {
      askedReadingPassageSignatures.add(picked.readingPassage.toLowerCase());
    }

    const rawOptions = [picked.word, ...picked.distractors];
    const options = shuffleArray(Array.from(new Set(rawOptions))).slice(0, 4);

    const challenge: CombatChallenge = {
      id: `local-rc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      mode: 'reading',
      gradeLevel,
      targetWord: picked.word,
      equation: picked.readingPassage || picked.word,
      questionText: picked.readingPassage || picked.word,
      syllables: picked.syllables,
      phoneticGuide: picked.phoneticGuide,
      clue: picked.clue,
      readingPassage: picked.readingPassage,
      visualEmoji: '📖',
      options,
      correctAnswer: picked.word,
      correctIndex: options.indexOf(picked.word),
      explanation: `🎉 Tumpak! Ang wastong baybay at bigkas ay "${picked.word}".`,
    };

    setTimeout(() => prefetchCombatChallenges('reading', gradeLevel), 200);
    return challenge;
  } else {
    // Mode === 'math' -> 100% English & Daily Life Situations (Zero game mechanics!)
    let attempts = 0;
    let mathData: {
      question: string;
      emoji: string;
      correctAnswer: string;
      distractors: string[];
      explanation: string;
      hint: string;
    };

    do {
      mathData = generateProceduralMathItem(gradeLevel);
      attempts++;
    } while (askedMathQuestionSignatures.has(mathData.question.toLowerCase()) && attempts < 20);

    askedMathQuestionSignatures.add(mathData.question.toLowerCase());

    const rawOptions = [mathData.correctAnswer, ...mathData.distractors];
    const options = shuffleArray(Array.from(new Set(rawOptions))).slice(0, 4);

    const challenge: CombatChallenge = {
      id: `local-mc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      mode: 'math',
      gradeLevel,
      mathQuestion: mathData.question,
      equation: mathData.question,
      questionText: mathData.question,
      mathEmoji: mathData.emoji,
      visualEmoji: mathData.emoji,
      mathHint: mathData.hint,
      clue: mathData.hint,
      options,
      correctAnswer: mathData.correctAnswer,
      correctIndex: options.indexOf(mathData.correctAnswer),
      explanation: mathData.explanation,
    };

    setTimeout(() => prefetchCombatChallenges('math', gradeLevel), 200);
    return challenge;
  }
}

/**
 * Reset asked history if user explicitly starts a new game session
 */
export function resetCombatChallengeHistory(): void {
  askedReadingWordSignatures.clear();
  askedReadingPassageSignatures.clear();
  askedEnglishWordSignatures.clear();
  askedEnglishPassageSignatures.clear();
  askedMathQuestionSignatures.clear();
  readingQueues.forEach((q) => (q.length = 0));
  englishQueues.forEach((q) => (q.length = 0));
  mathQueues.forEach((q) => (q.length = 0));
}
