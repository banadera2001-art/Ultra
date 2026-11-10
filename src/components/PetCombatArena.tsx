import React, { useState, useEffect, useRef } from 'react';
import {
  StudentProfile,
  BattleArena,
  BattleEnemy,
  CombatQuizItem,
  OwnedPet,
  PetDefinition,
} from '../types';
import {
  ARENAS,
  COMBAT_QUIZZES,
  PET_CATALOG,
  getPetById,
  generateRandomEnemiesForArena,
  generateRandomEnemyForArena,
} from '../data/petsData';
import {
  ReadingCombatWord,
  READING_COMBAT_POOL,
  getUniqueReadingCombatWord,
  generateDynamicReadingOptions,
} from '../data/combatReadingData';
import { DragonCityPet } from './DragonCityPet';
import {
  Swords,
  Shield,
  Zap,
  Sparkles,
  Trophy,
  ArrowLeft,
  RotateCcw,
  Star,
  Flame,
  CheckCircle2,
  XCircle,
  Brain,
  Heart,
  Award,
  Mic,
  MicOff,
  BookOpen,
  HelpCircle,
  Volume2,
  Calculator,
} from 'lucide-react';
import {
  CombatSubject,
  CombatGradeLevel,
  CombatChallenge,
  getCombatChallenge,
  prefetchCombatChallenges,
  resetCombatChallengeHistory,
} from '../services/aiCombatService';
import confetti from 'canvas-confetti';
import {
  playAttackSound,
  playSpecialSkillSound,
  playShieldSound,
  playCriticalHitSound,
  playBattleVictorySound,
  playStarSound,
  playSuccessFanfare,
  playAttackMissSound,
} from '../services/soundEffects';
import { TagalogSpeechRecognizer, speakTagalog, speakEnglish } from '../services/speechService';
import { evaluatePronunciationStrict, normalizeFilipinoTranscript } from '../utils/pronunciationValidator';
import { motion, AnimatePresence } from 'motion/react';

interface PetCombatArenaProps {
  activeStudent: StudentProfile;
  voiceEnabled: boolean;
  onAwardStars: (count: number, reason?: string) => void;
  onAddPetExp: (
    petId: string,
    exp: number
  ) => { leveledUp: boolean; newLevel?: number; newStage?: string };
  onClose?: () => void;
  onNavigateToNursery?: () => void;
}

interface FloatingText {
  id: number;
  text: string;
  color: string;
  target: 'player' | 'enemy';
}

export interface AttackReadingChallenge {
  attackType: 'basic' | 'special' | 'marungko';
  attackTitle: string;
  attackIcon: string;
  element?: string;
  targetWord: string;
  syllables: string[];
  phoneticGuide: string;
  clue: string;
  options: string[];
}

export const PetCombatArena: React.FC<PetCombatArenaProps> = ({
  activeStudent,
  voiceEnabled,
  onAwardStars,
  onAddPetExp,
  onClose,
  onNavigateToNursery,
}) => {
  // Procedural random enemies generated per arena - foes are NEVER fixed!
  const [arenaEnemies, setArenaEnemies] = useState<Record<string, BattleEnemy[]>>(() => {
    const initial: Record<string, BattleEnemy[]> = {};
    ARENAS.forEach((a) => {
      initial[a.id] = generateRandomEnemiesForArena(a.id, 3);
    });
    return initial;
  });

  // Navigation & Selection States
  const [selectedArenaId, setSelectedArenaId] = useState<string>(ARENAS[0].id);
  const [selectedEnemyId, setSelectedEnemyId] = useState<string>(() => {
    return arenaEnemies[ARENAS[0].id]?.[0]?.id || ARENAS[0].enemies[0].id;
  });
  const [fighterPetId, setFighterPetId] = useState<string>(
    activeStudent.activePetId || activeStudent.ownedPets[0]?.petId || 'pet-001'
  );

  // Battle loop states
  const [battleState, setBattleState] = useState<'select' | 'battle' | 'victory' | 'defeat'>(
    'select'
  );
  const [turn, setTurn] = useState<'player' | 'enemy' | 'animating'>('player');

  // Combatants runtime stats
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [maxPlayerHp, setMaxPlayerHp] = useState<number>(100);
  const [enemyHp, setEnemyHp] = useState<number>(100);
  const [maxEnemyHp, setMaxEnemyHp] = useState<number>(100);
  const [isPlayerShielded, setIsPlayerShielded] = useState<boolean>(false);

  // Animation states for Dragon City characters
  const [playerAnim, setPlayerAnim] = useState<'idle' | 'attack' | 'hit' | 'defend' | 'victory'>(
    'idle'
  );
  const [enemyAnim, setEnemyAnim] = useState<'idle' | 'attack' | 'hit' | 'defend' | 'victory'>(
    'idle'
  );

  // Combat Logs & Floating Popups
  const [combatLogs, setCombatLogs] = useState<string[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // Combat Subject & Grade Level Selection (Reading & Math, Grade 1 to 6)
  const [combatSubject, setCombatSubject] = useState<CombatSubject>('reading');
  const [combatGradeLevel, setCombatGradeLevel] = useState<CombatGradeLevel>(() => {
    const raw = String(activeStudent.gradeLevel || '1').replace(/\D/g, '');
    const parsed = parseInt(raw, 10);
    return Math.min(6, Math.max(1, parsed || 1)) as CombatGradeLevel;
  });

  // Active Combat Challenge & Attack Metadata
  const [activeChallenge, setActiveChallenge] = useState<CombatChallenge | null>(null);
  const [currentAttackMeta, setCurrentAttackMeta] = useState<{
    attackType: 'basic' | 'special' | 'marungko';
    attackTitle: string;
    attackIcon: string;
    element?: string;
  } | null>(null);
  const [isChallengeLoading, setIsChallengeLoading] = useState<boolean>(false);
  const [challengeFeedback, setChallengeFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [isListeningForReading, setIsListeningForReading] = useState<boolean>(false);
  const [readingTranscript, setReadingTranscript] = useState<string>('');
  const [readingMicError, setReadingMicError] = useState<string | null>(null);
  const speechRecognizerRef = useRef<TagalogSpeechRecognizer | null>(null);

  // Pre-fetch combat challenges in background whenever subject, grade, or battle state changes
  useEffect(() => {
    prefetchCombatChallenges(combatSubject, combatGradeLevel);
  }, [combatSubject, combatGradeLevel, battleState]);

  // Active combat projectile/slash animation on battlefield
  const [activeCombatVfx, setActiveCombatVfx] = useState<{
    direction: 'to-enemy' | 'to-player';
    type: 'basic' | 'special' | 'marungko' | 'enemy';
    icon: string;
    label?: string;
  } | null>(null);

  useEffect(() => {
    speechRecognizerRef.current = new TagalogSpeechRecognizer();
    return () => {
      speechRecognizerRef.current?.stopListening();
    };
  }, []);

  // Victory Rewards storage
  const [earnedStars, setEarnedStars] = useState<number>(0);
  const [earnedExp, setEarnedExp] = useState<number>(0);
  const [evolutionNote, setEvolutionNote] = useState<string>('');

  const currentArena = ARENAS.find((a) => a.id === selectedArenaId) || ARENAS[0];
  const currentArenaEnemies =
    arenaEnemies[selectedArenaId] && arenaEnemies[selectedArenaId].length > 0
      ? arenaEnemies[selectedArenaId]
      : currentArena.enemies;
  const currentEnemy =
    currentArenaEnemies.find((e) => e.id === selectedEnemyId) ||
    currentArenaEnemies[0] ||
    ARENAS[0].enemies[0];

  const safeEnemyMaxHp =
    typeof currentEnemy?.maxHp === 'number' && Number.isFinite(currentEnemy.maxHp) && currentEnemy.maxHp > 0
      ? currentEnemy.maxHp
      : 200;
  const safeEnemyAtk =
    typeof currentEnemy?.atk === 'number' && Number.isFinite(currentEnemy.atk) && currentEnemy.atk > 0
      ? currentEnemy.atk
      : 40;
  const safeEnemyDef =
    typeof currentEnemy?.def === 'number' && Number.isFinite(currentEnemy.def) && currentEnemy.def > 0
      ? currentEnemy.def
      : 25;

  // Re-roll random enemies for an arena on demand
  const handleRollRandomEnemies = (arenaId: string = selectedArenaId) => {
    const freshEnemies = generateRandomEnemiesForArena(arenaId, 3);
    setArenaEnemies((prev) => ({
      ...prev,
      [arenaId]: freshEnemies,
    }));
    setSelectedEnemyId(freshEnemies[0].id);
    playSpecialSkillSound();
  };

  // Select an arena with auto-randomized enemies
  const handleSelectArena = (arenaId: string) => {
    setSelectedArenaId(arenaId);
    let enemies = arenaEnemies[arenaId];
    if (!enemies || enemies.length === 0) {
      enemies = generateRandomEnemiesForArena(arenaId, 3);
      setArenaEnemies((prev) => ({
        ...prev,
        [arenaId]: enemies,
      }));
    }
    setSelectedEnemyId(enemies[0].id);
  };

  const ownedFighter =
    activeStudent.ownedPets.find((p) => p.petId === fighterPetId) ||
    activeStudent.ownedPets[0] || {
      petId: 'pet-001',
      nickname: 'Bantay',
      level: 1,
      stage: 'Baby' as const,
      currentExp: 0,
      maxExp: 50,
      hunger: 80,
      timesFed: 0,
      adoptedAt: '',
    };

  const fighterDef = getPetById(ownedFighter.petId) || PET_CATALOG[0];

  // Calculate combat stats based on Pet Level, Stage, and Tier
  const calculatePlayerStats = (def: PetDefinition, owned: OwnedPet) => {
    const stage = owned?.stage || 'Baby';
    const stageMult =
      stage === 'Adult'
        ? { hp: 2.4, atk: 2.3, def: 2.1, spd: 1.6 }
        : stage === 'Teen'
        ? { hp: 1.6, atk: 1.5, def: 1.4, spd: 1.3 }
        : { hp: 1.0, atk: 1.0, def: 1.0, spd: 1.0 };

    const tier = def?.tier || 'common';
    const tierBonus =
      tier === 'mythic'
        ? 2.0
        : tier === 'legendary'
        ? 1.55
        : tier === 'epic'
        ? 1.3
        : tier === 'rare'
        ? 1.15
        : 1.0;

    const level = Math.max(1, Math.min(100, owned?.level || 1));
    // Scales pet power progressively up to Level 100
    const levelMult = 1 + (level - 1) * 0.085;

    const baseHp = typeof def?.baseHp === 'number' && !isNaN(def.baseHp) ? def.baseHp : 100;
    const baseAtk = typeof def?.baseAtk === 'number' && !isNaN(def.baseAtk) ? def.baseAtk : 25;
    const baseDef = typeof def?.baseDef === 'number' && !isNaN(def.baseDef) ? def.baseDef : 15;
    const baseSpd = typeof def?.baseSpd === 'number' && !isNaN(def.baseSpd) ? def.baseSpd : 25;

    const hp = Math.max(50, Math.round(baseHp * stageMult.hp * tierBonus * levelMult));
    const atk = Math.max(10, Math.round(baseAtk * stageMult.atk * tierBonus * levelMult));
    const defense = Math.max(5, Math.round(baseDef * stageMult.def * tierBonus * levelMult));
    const spd = Math.max(10, Math.round(baseSpd * stageMult.spd * tierBonus * levelMult));

    return { hp, atk, defense, spd };
  };

  const playerStats = calculatePlayerStats(fighterDef, ownedFighter);

  // Spawn floating combat numbers
  const addFloatingText = (text: string, color: string, target: 'player' | 'enemy') => {
    const id = Date.now() + Math.random();
    setFloatingTexts((prev) => [...prev, { id, text, color, target }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 1200);
  };

  // Start a battle
  const startBattle = (targetEnemyOverride?: BattleEnemy | any) => {
    // CRITICAL: Ensure targetEnemyOverride is an actual BattleEnemy object with a valid id and maxHp,
    // and NOT a React synthetic event from onClick={startBattle}!
    const isRealEnemy =
      targetEnemyOverride &&
      typeof targetEnemyOverride === 'object' &&
      typeof targetEnemyOverride.id === 'string' &&
      typeof targetEnemyOverride.maxHp === 'number' &&
      Number.isFinite(targetEnemyOverride.maxHp) &&
      targetEnemyOverride.maxHp > 0;

    const chosenEnemy =
      (isRealEnemy ? targetEnemyOverride : undefined) ||
      currentArenaEnemies.find((e) => e.id === selectedEnemyId) ||
      currentArenaEnemies[0] ||
      ARENAS[0].enemies[0];

    const safeMaxEnemyHp =
      typeof chosenEnemy?.maxHp === 'number' && Number.isFinite(chosenEnemy.maxHp) && chosenEnemy.maxHp > 0
        ? chosenEnemy.maxHp
        : safeEnemyMaxHp;

    const safeMaxPlayerHp =
      typeof playerStats?.hp === 'number' && Number.isFinite(playerStats.hp) && playerStats.hp > 0
        ? playerStats.hp
        : 100;

    setSelectedEnemyId(chosenEnemy.id);
    setMaxPlayerHp(safeMaxPlayerHp);
    setPlayerHp(safeMaxPlayerHp);
    setMaxEnemyHp(safeMaxEnemyHp);
    setEnemyHp(safeMaxEnemyHp);
    setIsPlayerShielded(false);
    setPlayerAnim('idle');
    setEnemyAnim('idle');
    setCombatLogs([
      `Nagsimula ang labanan sa ${currentArena.titleTagalog}!`,
      `Humarap si ${fighterDef.nameTagalog} laban kay ${chosenEnemy.nameTagalog}!`,
    ]);
    setTurn('player');
    setBattleState('battle');
    // Note: AI speech voice removed per user instruction to prioritize reading independently
  };

  // Execute Enemy Counter-Attack
  const executeEnemyTurn = (currentRemainingPlayerHp: number) => {
    setTurn('animating');

    setTimeout(() => {
      // Enemy chooses move: 30% special skill, 70% normal attack
      const usesSpecial = Math.random() < 0.35;
      setEnemyAnim('attack');

      setActiveCombatVfx({
        direction: 'to-player',
        type: 'enemy',
        icon: usesSpecial ? '🐾⚡' : '🐾',
        label: usesSpecial ? currentEnemy.specialSkillTagalog : 'Pangil at Kuko',
      });
      setTimeout(() => setActiveCombatVfx(null), 600);

      if (usesSpecial) {
        playSpecialSkillSound();
      } else {
        playAttackSound();
      }

      setTimeout(() => {
        // Calculate enemy damage
        const enemyAtk = Number.isFinite(currentEnemy?.atk) ? currentEnemy.atk : 40;
        const playerDef = Number.isFinite(playerStats?.defense) ? playerStats.defense : 20;

        let rawDmg = usesSpecial
          ? Math.max(Math.floor(enemyAtk * 0.45), Math.floor(enemyAtk * 1.35 - playerDef * 0.35))
          : Math.max(Math.floor(enemyAtk * 0.3), Math.floor(enemyAtk * 1.0 - playerDef * 0.4));

        rawDmg = Math.round(rawDmg + (Math.random() * 8 - 4));
        if (!Number.isFinite(rawDmg) || rawDmg <= 0) rawDmg = 12;

        // If player shielded, reduce damage by 50%
        let finalDmg = rawDmg;
        if (isPlayerShielded) {
          finalDmg = Math.max(4, Math.floor(rawDmg * 0.45));
          addFloatingText('🛡️ SANGGA! -50%', 'text-cyan-400 font-bold', 'player');
        }

        setPlayerAnim('hit');
        addFloatingText(`-${finalDmg}`, 'text-rose-500 font-extrabold text-2xl', 'player');

        const safePlayerHp = Number.isFinite(currentRemainingPlayerHp) ? currentRemainingPlayerHp : (Number.isFinite(playerHp) ? playerHp : 100);
        const newPlayerHp = Math.max(0, safePlayerHp - finalDmg);
        setPlayerHp(newPlayerHp);

        const skillName = usesSpecial
          ? currentEnemy.specialSkillTagalog
          : 'Pangkaraniwang Atake';
        setCombatLogs((prev) => [
          `Ginamit ni ${currentEnemy.nameTagalog} ang ${skillName}! Bawas ${finalDmg} HP kay ${fighterDef.nameTagalog}.`,
          ...prev.slice(0, 5),
        ]);

        // Reset shield
        setIsPlayerShielded(false);

        setTimeout(() => {
          setEnemyAnim('idle');
          setPlayerAnim('idle');

          if (newPlayerHp <= 0) {
            handleBattleDefeat();
          } else {
            setTurn('player');
          }
        }, 500);
      }, 400);
    }, 900);
  };

  // Watchdog: Ensure battle turn never gets permanently stuck
  useEffect(() => {
    if (turn === 'animating') {
      const fallbackTimer = setTimeout(() => {
        setTurn('player');
      }, 4000);
      return () => clearTimeout(fallbackTimer);
    }
  }, [turn]);

  // Player Attack Trigger: Launches Challenge (Reading or Math for Grade 1-6)
  const handleInitiateAttack = async (type: 'basic' | 'special' | 'marungko') => {
    if (turn !== 'player') return;

    const attackTitle =
      type === 'basic'
        ? 'Pangunahing Atake'
        : type === 'special'
        ? fighterDef.specialSkillTagalog
        : 'Lakas ng Marungko';

    const attackIcon = type === 'basic' ? '🐾' : type === 'special' ? '⚡' : '🌟';

    setCurrentAttackMeta({
      attackType: type,
      attackTitle,
      attackIcon,
      element: fighterDef.element,
    });

    setChallengeFeedback(null);
    setReadingTranscript('');
    setReadingMicError(null);
    setIsChallengeLoading(true);

    try {
      const challenge = await getCombatChallenge({
        mode: combatSubject,
        gradeLevel: combatGradeLevel,
        attackTitle,
        attackIcon,
      });
      setActiveChallenge(challenge);
    } finally {
      setIsChallengeLoading(false);
    }
  };

  // Switch between Reading and Math inside the challenge modal
  const handleChangeChallengeSubject = async (newSubject: CombatSubject) => {
    if (challengeFeedback || !currentAttackMeta) return;
    setCombatSubject(newSubject);
    setIsChallengeLoading(true);
    setChallengeFeedback(null);
    setReadingTranscript('');
    setReadingMicError(null);
    speechRecognizerRef.current?.stopListening();
    setIsListeningForReading(false);

    try {
      const challenge = await getCombatChallenge({
        mode: newSubject,
        gradeLevel: combatGradeLevel,
        attackTitle: currentAttackMeta.attackTitle,
        attackIcon: currentAttackMeta.attackIcon,
        forceFreshAi: true,
      });
      setActiveChallenge(challenge);
    } finally {
      setIsChallengeLoading(false);
    }
  };

  // Switch Grade level (1 to 6) inside the challenge modal
  const handleChangeChallengeGrade = async (newGrade: CombatGradeLevel) => {
    if (challengeFeedback || !currentAttackMeta) return;
    setCombatGradeLevel(newGrade);
    setIsChallengeLoading(true);
    setChallengeFeedback(null);
    setReadingTranscript('');
    setReadingMicError(null);
    speechRecognizerRef.current?.stopListening();
    setIsListeningForReading(false);

    try {
      const challenge = await getCombatChallenge({
        mode: combatSubject,
        gradeLevel: newGrade,
        attackTitle: currentAttackMeta.attackTitle,
        attackIcon: currentAttackMeta.attackIcon,
        forceFreshAi: true,
      });
      setActiveChallenge(challenge);
    } finally {
      setIsChallengeLoading(false);
    }
  };

  // Start voice recognition for reading, english, or math challenge
  const handleStartReadingMic = (showError = true) => {
    if (!speechRecognizerRef.current || !activeChallenge || challengeFeedback) return;
    setReadingMicError(null);
    setReadingTranscript('');
    setIsListeningForReading(true);

    const currentChallenge = activeChallenge;
    // Set speech recognizer language based on current challenge mode
    if (currentChallenge.mode === 'english' || currentChallenge.mode === 'math') {
      speechRecognizerRef.current.setLanguage('en-US');
    } else {
      speechRecognizerRef.current.setLanguage('tl-PH');
    }

    const started = speechRecognizerRef.current.startListening(
      (transcript, isFinal) => {
        const expected = (currentChallenge.mode === 'reading' || currentChallenge.mode === 'english')
          ? (currentChallenge.targetWord || currentChallenge.correctAnswer || '')
          : currentChallenge.correctAnswer;
        const normalized = currentChallenge.mode === 'reading'
          ? normalizeFilipinoTranscript(transcript, expected)
          : transcript;
        setReadingTranscript(normalized || transcript);
        if (isFinal && transcript.trim().length > 0) {
          handleEvaluateReadingSpeech(normalized || transcript.trim(), currentChallenge);
        }
      },
      () => setIsListeningForReading(true),
      () => setIsListeningForReading(false),
      (err) => {
        setIsListeningForReading(false);
        if (showError) {
          setReadingMicError(err);
        }
      }
    );

    if (!started && showError) {
      setReadingMicError('Pahintulutan ang mikropono sa browser upang makapag-atake gamit ang boses, o pindutin ang tamang sagot sa ibaba.');
    }
  };

  // Stop voice recognition
  const handleStopReadingMic = () => {
    speechRecognizerRef.current?.stopListening();
    setIsListeningForReading(false);
  };

  // Handle Touch Option Selection (Tablet / Mobile friendly!)
  const handleSelectChallengeOption = (chosen: string, challenge: CombatChallenge) => {
    if (challengeFeedback || !currentAttackMeta) return;
    speechRecognizerRef.current?.stopListening();
    setIsListeningForReading(false);

    const cleanChosen = chosen.trim().toUpperCase();
    const cleanCorrect = challenge.correctAnswer.trim().toUpperCase();

    const isMatch =
      cleanChosen === cleanCorrect ||
      (challenge.mode === 'math' &&
        !isNaN(Number(chosen)) &&
        !isNaN(Number(challenge.correctAnswer)) &&
        Number(chosen) === Number(challenge.correctAnswer));

    if (isMatch) {
      setReadingTranscript(chosen);
      setChallengeFeedback({
        isCorrect: true,
        message: challenge.explanation || `🎉 Tumpak! Ang tamang sagot ay "${challenge.correctAnswer}". Tumama ang atake!`,
      });
      playStarSound();
      playSuccessFanfare();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

      setTimeout(() => {
        executePlayerAttackOutcome(true, challenge, currentAttackMeta, 1.2, 'pindot');
      }, 850);
    } else {
      setChallengeFeedback({
        isCorrect: false,
        message: `💨 Maling sagot: "${chosen}" (Ang tama ay "${challenge.correctAnswer}"). ${challenge.explanation || 'Nagmintis ang atake!'}`,
      });
      playAttackMissSound();

      setTimeout(() => {
        executePlayerAttackOutcome(false, challenge, currentAttackMeta, 0, 'mali');
      }, 1300);
    }
  };

  // Evaluate speech transcript against target word or math answer
  const handleEvaluateReadingSpeech = (spoken: string, challenge: CombatChallenge) => {
    if (!currentAttackMeta) return;
    speechRecognizerRef.current?.stopListening();
    setIsListeningForReading(false);

    const expected = (challenge.mode === 'reading' || challenge.mode === 'english')
      ? (challenge.targetWord || challenge.correctAnswer || '')
      : challenge.correctAnswer;

    const normalizedSpoken = challenge.mode === 'reading'
      ? normalizeFilipinoTranscript(spoken, expected)
      : spoken;

    let isCorrect = false;
    if (challenge.mode === 'reading') {
      const evalResult = evaluatePronunciationStrict(
        challenge.targetWord || '',
        normalizedSpoken,
        (challenge.targetWord || '').length <= 3 ? 'two_letters' : 'words'
      );
      isCorrect = evalResult.isCorrect;
    } else if (challenge.mode === 'english') {
      const cleanSpoken = spoken.trim().toUpperCase();
      const cleanExpected = expected.trim().toUpperCase();
      if (cleanSpoken === cleanExpected || cleanSpoken.includes(cleanExpected) || cleanExpected.includes(cleanSpoken)) {
        isCorrect = true;
      } else {
        const evalResult = evaluatePronunciationStrict(
          cleanExpected,
          cleanSpoken,
          'words'
        );
        isCorrect = evalResult.isCorrect;
      }
    } else {
      // Math answer verification
      const cleanSpoken = spoken.trim().toLowerCase();
      const cleanExp = expected.trim().toLowerCase();
      isCorrect =
        cleanSpoken === cleanExp ||
        cleanSpoken.includes(cleanExp) ||
        (!isNaN(Number(cleanSpoken)) && !isNaN(Number(cleanExp)) && Number(cleanSpoken) === Number(cleanExp));
    }

    if (isCorrect) {
      setReadingTranscript(expected);
      setChallengeFeedback({
        isCorrect: true,
        message: `🎉 Tumpak ang sagot gamit ang boses: "${expected}"! Tumama ang atake!`,
      });
      playStarSound();
      playSuccessFanfare();
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });

      setTimeout(() => {
        executePlayerAttackOutcome(true, challenge, currentAttackMeta, 1.25, 'boses');
      }, 1050);
    } else {
      setChallengeFeedback({
        isCorrect: false,
        message: `💨 Narinig ng AI: "${spoken || 'walang narinig'}" (Dapat ay "${expected}"). Nagmintis ang atake!`,
      });
      playAttackMissSound();

      setTimeout(() => {
        executePlayerAttackOutcome(false, challenge, currentAttackMeta, 0, 'maling_boses');
      }, 1400);
    }
  };

  // Student skips or couldn't answer
  const handleSkipReading = (challenge: CombatChallenge) => {
    if (challengeFeedback || !currentAttackMeta) return;
    speechRecognizerRef.current?.stopListening();
    setIsListeningForReading(false);

    setChallengeFeedback({
      isCorrect: false,
      message: `💨 Nagmintis ang atake dahil nilaktawan ang hamon. Subukan muli sa susunod na turn!`,
    });
    playAttackMissSound();

    setTimeout(() => {
      executePlayerAttackOutcome(false, challenge, currentAttackMeta, 0, 'nilaktawan');
    }, 1100);
  };

  // Execute attack outcome (Damage dealt if answered correctly; Miss with 0 damage if failed!)
  const executePlayerAttackOutcome = (
    isHit: boolean,
    challenge: CombatChallenge,
    attackMeta: {
      attackType: 'basic' | 'special' | 'marungko';
      attackTitle: string;
      attackIcon: string;
      element?: string;
    },
    powerMultiplier: number,
    method: string
  ) => {
    setActiveChallenge(null);
    setCurrentAttackMeta(null);
    setChallengeFeedback(null);
    setReadingTranscript('');
    setReadingMicError(null);

    setTurn('animating');
    setPlayerAnim('attack');

    if (isHit) {
      // ATTACK LANDS!
      setActiveCombatVfx({
        direction: 'to-enemy',
        type: attackMeta.attackType,
        icon: attackMeta.attackType === 'marungko' ? '🌟⚡' : attackMeta.attackType === 'special' ? '🔥⚔️' : '⚔️',
        label: attackMeta.attackTitle,
      });
      setTimeout(() => setActiveCombatVfx(null), 600);

      if (attackMeta.attackType === 'marungko') {
        playCriticalHitSound();
        onAwardStars(2, `Kritikal na ${challenge.mode === 'reading' ? 'Pagbasa' : 'Matematika'} sa Combat`);
      } else if (attackMeta.attackType === 'special') {
        playSpecialSkillSound();
      } else {
        playAttackSound();
      }

      setTimeout(() => {
        const playerAtk = Number.isFinite(playerStats?.atk) ? playerStats.atk : 45;
        const enemyDef = Number.isFinite(currentEnemy?.def) ? currentEnemy.def : 25;

        let baseDmg = 14;
        if (attackMeta.attackType === 'marungko') {
          baseDmg = Math.max(
            Math.floor(playerAtk * 0.65),
            Math.floor(playerAtk * 2.2 - enemyDef * 0.25 + (Math.random() * 16 - 8))
          );
        } else if (attackMeta.attackType === 'special') {
          baseDmg = Math.max(
            Math.floor(playerAtk * 0.48),
            Math.floor(playerAtk * 1.6 - enemyDef * 0.3 + (Math.random() * 12 - 6))
          );
        } else {
          baseDmg = Math.max(
            Math.floor(playerAtk * 0.35),
            Math.floor(playerAtk * 1.15 - enemyDef * 0.35 + (Math.random() * 10 - 5))
          );
        }

        if (!Number.isFinite(baseDmg) || baseDmg <= 0) baseDmg = 20;

        const finalDmg = Math.max(5, Math.round(baseDmg * (Number.isFinite(powerMultiplier) ? powerMultiplier : 1)));
        setEnemyAnim('hit');

        if (attackMeta.attackType === 'marungko' || powerMultiplier > 1.1) {
          addFloatingText(
            `💥 KRITIKAL! -${finalDmg}`,
            'text-rose-600 font-black text-3xl animate-bounce',
            'enemy'
          );
        } else {
          addFloatingText(`-${finalDmg}`, 'text-amber-500 font-black text-2xl', 'enemy');
        }

        const safeCurrentEnemyHp = Number.isFinite(enemyHp) ? enemyHp : safeEnemyMaxHp;
        const nextEnemyHp = Math.max(0, safeCurrentEnemyHp - finalDmg);
        setEnemyHp(nextEnemyHp);

        const targetDesc = challenge.mode === 'reading'
          ? `salitang "${challenge.targetWord}"`
          : challenge.mode === 'english'
          ? `English word "${challenge.targetWord}"`
          : `tanong na "${challenge.mathQuestion || challenge.equation || challenge.questionText || ''}" = ${challenge.correctAnswer}`;

        const methodLabel = method === 'boses' ? 'gamit ang boses 🎙️' : 'pagsagot';
        setCombatLogs((prev) => [
          `🎯 Tamang ${challenge.mode === 'reading' || challenge.mode === 'english' ? 'nabasa' : 'nalutas'} ang ${targetDesc} (${methodLabel})! Tumama ang ${attackMeta.attackTitle} ni ${fighterDef.nameTagalog} ng ${finalDmg} pinsala kay ${currentEnemy.nameTagalog}!`,
          ...prev.slice(0, 5),
        ]);

        setTimeout(() => {
          setPlayerAnim('idle');
          setEnemyAnim('idle');

          if (nextEnemyHp <= 0) {
            handleBattleVictory();
          } else {
            executeEnemyTurn(playerHp);
          }
        }, 550);
      }, 400);
    } else {
      // ATTACK MISSES!
      playAttackMissSound();

      setTimeout(() => {
        addFloatingText('💨 MINTIS! / MISS!', 'text-slate-400 font-black text-xl animate-pulse', 'enemy');

        const failTarget = challenge.mode === 'reading'
          ? `salitang "${challenge.targetWord}"`
          : challenge.mode === 'english'
          ? `English word "${challenge.targetWord}"`
          : `tanong na "${challenge.mathQuestion || challenge.equation || challenge.questionText || ''}"`;

        setCombatLogs((prev) => [
          `💨 Nagmintis ang atake ni ${fighterDef.nameTagalog}! Hindi ${challenge.mode === 'reading' || challenge.mode === 'english' ? 'nabasa nang wasto' : 'nasagot nang tama'} ang ${failTarget}.`,
          ...prev.slice(0, 5),
        ]);

        setTimeout(() => {
          setPlayerAnim('idle');
          setEnemyAnim('idle');
          executeEnemyTurn(playerHp);
        }, 550);
      }, 400);
    }
  };

  // Backward compatibility wrappers
  const handleOpenMarungkoQuiz = () => {
    handleInitiateAttack('marungko');
  };

  const handlePlayerBasicAttack = () => {
    handleInitiateAttack('basic');
  };

  const handlePlayerSpecialSkill = () => {
    handleInitiateAttack('special');
  };

  // Player Action 3: Shield & Recovery
  const handlePlayerDefend = () => {
    if (turn !== 'player') return;
    setTurn('animating');
    setPlayerAnim('defend');
    playShieldSound();
    setIsPlayerShielded(true);

    const healAmount = Math.round(maxPlayerHp * 0.2);
    const newHp = Math.min(maxPlayerHp, playerHp + healAmount);
    setPlayerHp(newHp);

    addFloatingText(`+${healAmount} HP`, 'text-emerald-500 font-black text-xl', 'player');
    addFloatingText('🛡️ PANANGGALANG!', 'text-cyan-400 font-black text-lg', 'player');

    setCombatLogs((prev) => [
      `Naglabas ng Mahiwagang Pananggalang si ${fighterDef.nameTagalog}! Nabawasan ng 50% ang susunod na pinsala at nagpagaling ng +${healAmount} HP!`,
      ...prev.slice(0, 5),
    ]);

    setTimeout(() => {
      setPlayerAnim('idle');
      executeEnemyTurn(newHp);
    }, 850);
  };

  // Handle Battle Victory
  const handleBattleVictory = () => {
    setPlayerAnim('victory');
    setEnemyAnim('hit');
    playBattleVictorySound();

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    const rewardStars = currentArena.rewardStars;
    const rewardExp = currentArena.rewardExp;

    setEarnedStars(rewardStars);
    setEarnedExp(rewardExp);

    // Award Stars directly to Student
    onAwardStars(rewardStars, `Tagumpay sa ${currentArena.titleTagalog}`);

    // Award EXP to fighter pet
    const expResult = onAddPetExp(ownedFighter.petId, rewardExp);
    if (expResult.leveledUp) {
      setEvolutionNote(
        `🎉 Tumaas ang Antas ni ${fighterDef.nameTagalog} patungong Antas ${expResult.newLevel} (${expResult.newStage})!`
      );
    } else {
      setEvolutionNote('');
    }

    setCombatLogs((prev) => [
      `🏆 TAGUMPAY! Natalo mo si ${currentEnemy.nameTagalog}! Napanalunan: +${rewardStars} ⭐ Bituin at +${rewardExp} EXP!`,
      ...prev,
    ]);

    setTimeout(() => {
      setBattleState('victory');
    }, 1200);
  };

  // Handle Battle Defeat
  const handleBattleDefeat = () => {
    setCombatLogs((prev) => [
      `Bumagsak si ${fighterDef.nameTagalog}... Huwag mag-alala! Pakainin at sanayin ang alaga upang lumakas!`,
      ...prev,
    ]);

    setTimeout(() => {
      setBattleState('defeat');
    }, 1000);
  };

  return (
    <div id="pet-combat-arena-container" className="flex flex-col h-full bg-[#FFFBEB]">
      {/* Top Header Bar */}
      {battleState === 'battle' ? (
        /* Streamlined Combat Top Bar (Zero-Scroll Optimized) */
        <div className="bg-white/95 border-b-2 border-[#4B2C20]/15 px-3 py-1.5 flex items-center justify-between shadow-xs shrink-0 z-30">
          <div className="flex items-center gap-2">
            <button
              id="back-to-arena-select-btn"
              onClick={() => setBattleState('select')}
              className="px-2.5 py-1 rounded-xl bg-[#4B2C20]/10 hover:bg-[#4B2C20]/20 text-[#4B2C20] font-black text-xs flex items-center gap-1 transition-colors cursor-pointer touch-manipulation"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pumili ng Kalaban</span>
            </button>
            <span className="text-base sm:text-lg">{currentArena.environmentEmoji}</span>
            <span className="font-black text-xs sm:text-sm text-[#4B2C20] truncate max-w-[140px] sm:max-w-none">
              {currentArena.titleTagalog}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black transition-colors ${
                turn === 'player'
                  ? 'bg-emerald-500 text-white animate-pulse'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {turn === 'player' ? '👉 Turn Mo: Pumili ng Atake' : '⏳ Turn ng Kalaban...'}
            </span>
            <div className="flex items-center gap-1 bg-[#FFD93D]/30 border border-[#FF8400]/40 px-2 py-0.5 rounded-xl shadow-xs">
              <Star className="w-3.5 h-3.5 fill-[#FF8400] text-[#FF8400]" />
              <span className="font-black text-[#8B4513] text-xs">{activeStudent.stars}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Header for Select Screen */
        <div className="bg-white/90 backdrop-blur-xs border-b-2 border-[#4B2C20]/15 px-4 py-2 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-2.5">
            {onClose && (
              <button
                id="close-combat-arena-btn"
                onClick={onClose}
                className="px-2.5 py-1.5 rounded-xl bg-[#4B2C20]/10 hover:bg-[#4B2C20]/20 text-[#4B2C20] font-black text-xs flex items-center gap-1 transition-colors cursor-pointer touch-manipulation"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Bumalik</span>
              </button>
            )}
            <div>
              <h2 className="text-base md:text-lg font-black text-[#4B2C20] flex items-center gap-1.5">
                <Swords className="w-5 h-5 text-[#FF8400]" />
                <span>Combat Base ng mga Alaga</span>
              </h2>
              <p className="text-[10px] sm:text-xs font-semibold text-[#8B4513]">
                Labanan ng mga Alagang Hayop • Marungko Reading Power!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-[#FFD93D]/30 border-2 border-[#FF8400]/40 px-3 py-1 rounded-2xl shadow-xs">
            <Star className="w-4 h-4 fill-[#FF8400] text-[#FF8400]" />
            <span className="font-black text-[#8B4513] text-sm">{activeStudent.stars}</span>
            <span className="text-[10px] font-bold text-[#8B4513]/80">Bituin</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. ARENA & OPPONENT SELECTION VIEW                        */}
      {/* ========================================================= */}
      {battleState === 'select' && (
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-w-5xl mx-auto w-full">
          {/* Active Fighter Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-16 h-16 bg-white rounded-xl border-2 border-amber-200 shadow-xs flex items-center justify-center relative shrink-0">
                <DragonCityPet
                  petId={fighterDef.id}
                  emoji={fighterDef.emoji}
                  name={fighterDef.name}
                  nameTagalog={ownedFighter.nickname || fighterDef.nameTagalog}
                  element={fighterDef.element}
                  stage={ownedFighter.stage}
                  size="sm"
                  showShadow={false}
                  showAura={true}
                  interactive={true}
                />
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                  Lvl {ownedFighter.level}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-base text-[#4B2C20] truncate">
                    {ownedFighter.nickname || fighterDef.nameTagalog}
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    {ownedFighter.stage}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {fighterDef.element}
                  </span>
                </div>
                <p className="text-[11px] text-[#8B4513] font-medium truncate mt-0.5">
                  Lakas: <strong className="text-amber-800">{fighterDef.specialSkillTagalog}</strong>
                </p>
                <div className="flex items-center gap-2.5 mt-1 text-[11px] font-bold text-[#4B2C20]">
                  <span className="text-emerald-700">❤️ {playerStats.hp} HP</span>
                  <span className="text-red-700">⚔️ {playerStats.atk} ATK</span>
                  <span className="text-blue-700">🛡️ {playerStats.defense} DEF</span>
                  <span className="text-teal-700">⚡ {playerStats.spd} SPD</span>
                </div>
              </div>
            </div>

            {/* Change Fighter Selector if has multiple pets */}
            {activeStudent.ownedPets.length > 1 && (
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <span className="text-xs font-bold text-[#8B4513] whitespace-nowrap">
                  Palitan:
                </span>
                <select
                  id="fighter-pet-selector"
                  value={fighterPetId}
                  onChange={(e) => setFighterPetId(e.target.value)}
                  className="bg-white border-2 border-amber-400 rounded-xl px-2.5 py-1 text-xs font-black text-[#4B2C20] shadow-xs cursor-pointer"
                >
                  {activeStudent.ownedPets.map((p) => {
                    const pDef = getPetById(p.petId);
                    return (
                      <option key={p.petId} value={p.petId}>
                        {pDef.emoji} {p.nickname || pDef.nameTagalog} (Antas {p.level})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          {/* Arena Picker Tabs */}
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[#4B2C20] mb-2 flex items-center gap-1.5">
              <span>🏟️ Pumili ng Arena ng Labanan:</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {ARENAS.map((arena) => {
                const isSelected = arena.id === selectedArenaId;
                return (
                  <button
                    key={arena.id}
                    id={`arena-tab-${arena.id}`}
                    onClick={() => handleSelectArena(arena.id)}
                    className={`p-2 sm:p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                      isSelected
                        ? 'border-[#FF8400] bg-white shadow-md ring-2 ring-[#FF8400]/30'
                        : 'border-[#4B2C20]/15 bg-white/70 hover:bg-white hover:border-[#FF8400]/50'
                    }`}
                  >
                    <div>
                      <div className="text-xl mb-0.5">{arena.environmentEmoji}</div>
                      <h4 className="font-black text-xs text-[#4B2C20] line-clamp-1">
                        {arena.titleTagalog}
                      </h4>
                      <p className="text-[10px] text-[#8B4513] mt-0.5 line-clamp-1">
                        Antas {arena.recommendedLevel}+
                      </p>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[10px] font-black">
                      <span className="text-amber-600 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        +{arena.rewardStars}
                      </span>
                      <span className="text-indigo-600">+{arena.rewardExp} EXP</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Arena & Challengers Showcase */}
          <div className={`rounded-2xl border-2 border-[#4B2C20]/20 bg-gradient-to-b ${currentArena.bgGradient} p-3 sm:p-4 shadow-sm`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#4B2C20]/15 pb-2.5 mb-3">
              <div>
                <span className="text-[10px] font-black text-white bg-[#4B2C20] px-2 py-0.5 rounded-full inline-block mb-1">
                  {currentArena.environmentEmoji} {currentArena.title}
                </span>
                <h3 className="text-base sm:text-lg font-black text-[#4B2C20]">
                  {currentArena.titleTagalog}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#4B2C20]/80 font-medium line-clamp-1 mt-0.5">
                  {currentArena.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-[#4B2C20]/20 text-center">
                  <div className="text-[9px] uppercase font-bold text-[#8B4513]">Bituin</div>
                  <div className="text-xs sm:text-sm font-black text-amber-600 flex items-center justify-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    +{currentArena.rewardStars}
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-[#4B2C20]/20 text-center">
                  <div className="text-[9px] uppercase font-bold text-[#8B4513]">EXP</div>
                  <div className="text-xs sm:text-sm font-black text-indigo-700">
                    +{currentArena.rewardExp}
                  </div>
                </div>
              </div>
            </div>

            {/* Adversaries in this arena with Randomize Option */}
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] font-black text-[#4B2C20] uppercase tracking-wider flex items-center gap-1.5">
                <span>🎲 Mga Random na Kalaban sa Arena:</span>
              </h4>
              <button
                type="button"
                id="roll-random-foes-btn"
                onClick={() => handleRollRandomEnemies(selectedArenaId)}
                className="flex items-center gap-1.5 text-xs font-black bg-white hover:bg-orange-50 text-[#E55604] border border-[#FF8400]/40 px-3 py-1 rounded-full shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer touch-manipulation"
                title="Mag-roll ng panibagong mga random na kalaban"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FF8400]" />
                <span>🎲 Magpalit ng Kalaban (Random)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {currentArenaEnemies.map((enemy) => {
                const isSelected = enemy.id === selectedEnemyId;
                return (
                  <div
                    key={enemy.id}
                    id={`enemy-card-${enemy.id}`}
                    onClick={() => setSelectedEnemyId(enemy.id)}
                    className={`rounded-xl border-2 p-2.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#FF8400] bg-white shadow-md ring-2 ring-[#FF8400]/40'
                        : 'border-[#4B2C20]/15 bg-white/80 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-14 h-14 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center relative overflow-hidden shrink-0">
                        <DragonCityPet
                          petId={enemy.id}
                          emoji={enemy.emoji}
                          name={enemy.name}
                          nameTagalog={enemy.nameTagalog}
                          element={enemy.element as any}
                          stage={enemy.stage}
                          size="sm"
                          showShadow={false}
                          interactive={false}
                        />
                        <span className="absolute bottom-0.5 right-0.5 text-[8px] font-black bg-rose-500 text-white px-1 rounded">
                          Lvl {enemy.level}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="font-black text-xs text-[#4B2C20] truncate">
                            {enemy.nameTagalog}
                          </h5>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-800">
                            {enemy.element}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#8B4513] font-medium truncate mt-0.5">
                          {enemy.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-[#4B2C20]">
                          <span className="text-emerald-700">❤️ {Number.isFinite(enemy.maxHp) ? enemy.maxHp : 200} HP</span>
                          <span className="text-red-700">⚔️ {Number.isFinite(enemy.atk) ? enemy.atk : 40} ATK</span>
                          <span className="text-blue-700">🛡️ {Number.isFinite(enemy.def) ? enemy.def : 25} DEF</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-[#8B4513] truncate max-w-[70%]">
                        Lakas: <strong>{enemy.specialSkillTagalog}</strong>
                      </span>
                      {isSelected ? (
                        <span className="font-black text-[#FF8400] flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> Napili
                        </span>
                      ) : (
                        <span className="font-bold text-[#8B4513]/70 shrink-0">Piliin</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Launch Battle CTA Button */}
            <div className="mt-3.5 flex justify-center">
              <button
                id="start-combat-btn"
                onClick={() => startBattle()}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8400] to-[#E55604] hover:from-[#E55604] hover:to-[#C63D00] text-white font-black text-sm md:text-base shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Swords className="w-5 h-5 animate-pulse" />
                <span>Simulan ang Labanan sa Arena!</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ACTIVE COMBAT BATTLEGROUND VIEW                        */}
      {/* ========================================================= */}
      {battleState === 'battle' && (
        <div className="flex-1 min-h-0 flex flex-col justify-between p-1.5 sm:p-2.5 overflow-hidden max-w-4xl mx-auto w-full relative">
          {/* Battle Arena Floating Texts Layer */}
          <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
            {floatingTexts.map((f) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 1, y: 0, scale: 0.8 }}
                animate={{ opacity: 0, y: -60, scale: 1.2 }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
                className={`absolute ${
                  f.target === 'player' ? 'left-1/4 top-1/3' : 'right-1/4 top-1/3'
                } ${f.color} drop-shadow-md select-none`}
              >
                {f.text}
              </motion.div>
            ))}
          </div>

          {/* Main Battlefield Stage */}
          <div
            className={`flex-1 min-h-[140px] sm:min-h-[170px] rounded-2xl border-2 border-[#4B2C20]/20 bg-gradient-to-b ${currentArena.bgGradient} relative flex flex-col justify-between p-2 sm:p-3 shadow-inner overflow-hidden`}
          >
            {/* Background Environmental Particles */}
            <div className="absolute inset-0 pointer-events-none opacity-30 flex justify-around items-center text-2xl select-none">
              <span>{currentArena.environmentEmoji}</span>
              <span>🍃</span>
              <span>✨</span>
              <span>⭐</span>
            </div>

            {/* HP Bars Row */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 z-10">
              {/* Player Pet HP Bar */}
              {(() => {
                const displayPlayerHp = Math.max(0, Math.round(Number.isFinite(playerHp) ? playerHp : (playerStats?.hp || 100)));
                const displayMaxPlayerHp = Math.round(Number.isFinite(maxPlayerHp) && maxPlayerHp > 0 ? maxPlayerHp : (playerStats?.hp || 100));
                const playerHpPct = displayMaxPlayerHp > 0 ? Math.max(0, Math.min(100, (displayPlayerHp / displayMaxPlayerHp) * 100)) : 100;
                return (
                  <div className="bg-white/95 backdrop-blur-xs border-2 border-[#4B2C20]/20 rounded-xl p-2 shadow-xs">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-black text-xs text-[#4B2C20] truncate">
                        {fighterDef.emoji} {ownedFighter.nickname || fighterDef.nameTagalog}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-black text-emerald-700">
                        {displayPlayerHp} / {displayMaxPlayerHp} HP
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
                      <motion.div
                        animate={{
                          width: `${playerHpPct}%`,
                        }}
                        transition={{ duration: 0.4 }}
                        className={`h-full ${
                          playerHpPct > 50
                            ? 'bg-emerald-500'
                            : playerHpPct > 25
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                    </div>
                    {isPlayerShielded && (
                      <div className="mt-0.5 flex items-center gap-1 text-[9px] font-black text-cyan-700 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-300 w-fit">
                        <Shield className="w-2.5 h-2.5 text-cyan-600" />
                        <span>Pananggalang (-50%)</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Enemy Pet HP Bar */}
              {(() => {
                const displayEnemyHp = Math.max(0, Math.round(Number.isFinite(enemyHp) ? enemyHp : safeEnemyMaxHp));
                const displayMaxEnemyHp = Math.round(Number.isFinite(maxEnemyHp) && maxEnemyHp > 0 ? maxEnemyHp : safeEnemyMaxHp);
                const enemyHpPct = displayMaxEnemyHp > 0 ? Math.max(0, Math.min(100, (displayEnemyHp / displayMaxEnemyHp) * 100)) : 100;
                return (
                  <div className="bg-white/95 backdrop-blur-xs border-2 border-[#4B2C20]/20 rounded-xl p-2 shadow-xs">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-black text-xs text-[#4B2C20] truncate">
                        {currentEnemy.emoji} {currentEnemy.nameTagalog}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-black text-rose-700">
                        {displayEnemyHp} / {displayMaxEnemyHp} HP
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
                      <motion.div
                        animate={{
                          width: `${enemyHpPct}%`,
                        }}
                        transition={{ duration: 0.4 }}
                        className={`h-full ${
                          enemyHpPct > 50
                            ? 'bg-emerald-500'
                            : enemyHpPct > 25
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                    </div>
                    <div className="mt-0.5 text-[9px] font-bold text-[#8B4513] truncate">
                      Lakas: {currentEnemy.specialSkillTagalog}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Combat Center Stage: Left Player vs Right Opponent on Combat Pedestals */}
            <div className="my-auto flex items-end justify-between px-2 sm:px-8 md:px-14 relative z-10 py-1">
              {/* Player Fighter on earthen pedestal */}
              <div className="flex flex-col items-center">
                <DragonCityPet
                  petId={fighterDef.id}
                  emoji={fighterDef.emoji}
                  name={fighterDef.name}
                  nameTagalog={ownedFighter.nickname || fighterDef.nameTagalog}
                  element={fighterDef.element}
                  stage={ownedFighter.stage}
                  size="md"
                  facing="right"
                  animationState={playerAnim}
                  sound={fighterDef.sound}
                  interactive={true}
                />
                {/* Earthen Combat Platform Pedestal */}
                <div className="w-20 sm:w-28 h-3.5 bg-amber-800/40 rounded-full border border-amber-900/30 blur-[0.5px] -mt-2 -z-10 shadow-md" />
              </div>

              {/* VS Battle Emblem or Flying Combat Attack Projectile */}
              <div className="flex flex-col items-center justify-center my-auto relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#FF8400] to-[#FFD93D] border-2 border-white shadow-md flex items-center justify-center">
                  <span className="font-black text-white text-xs drop-shadow-xs">VS</span>
                </div>

                {/* Flying Attack Blast / Claw Slash VFX */}
                {activeCombatVfx && (
                  <div
                    className={`absolute z-30 pointer-events-none ${
                      activeCombatVfx.direction === 'to-enemy'
                        ? 'combat-projectile-right'
                        : 'combat-projectile-left'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-3xl sm:text-4xl filter drop-shadow-[0_0_10px_rgba(255,200,0,0.9)] animate-pulse">
                        {activeCombatVfx.icon}
                      </span>
                      {activeCombatVfx.label && (
                        <span className="text-[9px] sm:text-[10px] font-black text-white bg-black/80 px-2 py-0.5 rounded-full mt-0.5 whitespace-nowrap shadow-md border border-amber-300/40">
                          {activeCombatVfx.label}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Enemy Challenger on stone pedestal */}
              <div className="flex flex-col items-center">
                <DragonCityPet
                  petId={currentEnemy.id}
                  emoji={currentEnemy.emoji}
                  name={currentEnemy.name}
                  nameTagalog={currentEnemy.nameTagalog}
                  element={currentEnemy.element as any}
                  stage={currentEnemy.stage}
                  size="md"
                  facing="left"
                  animationState={enemyAnim}
                  sound="Grrrr!"
                  interactive={false}
                />
                {/* Stone Combat Platform Pedestal */}
                <div className="w-20 sm:w-28 h-3.5 bg-slate-800/40 rounded-full border border-slate-900/30 blur-[0.5px] -mt-2 -z-10 shadow-md" />
              </div>
            </div>

            {/* Live Combat Narration Banner */}
            <div className="bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-semibold shadow-xs flex items-center justify-between z-10">
              <span className="truncate">
                {combatLogs[0] || 'Labanan ng mga alagang hayop sa arena!'}
              </span>
              <span className="text-[9px] text-amber-300 font-bold whitespace-nowrap ml-2">
                Turn Logs
              </span>
            </div>
          </div>

          {/* Action Control Deck */}
          <div className="mt-2 flex flex-col gap-1.5 shrink-0 z-20">
            {/* Subject (Reading vs Math) & Grade Level (1 to 6) Selection Bar */}
            <div className="bg-white/95 border-2 border-amber-300 rounded-xl px-2.5 py-1.5 shadow-xs flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-[#8B4513] uppercase tracking-wider flex items-center gap-1">
                  <span>🎯 Paksa:</span>
                </span>
                <div className="flex items-center gap-1 bg-amber-50 p-0.5 rounded-lg border border-amber-200">
                  <button
                    type="button"
                    id="deck-subject-reading-btn"
                    onClick={() => setCombatSubject('reading')}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                      combatSubject === 'reading'
                        ? 'bg-[#FF8400] text-white shadow-xs'
                        : 'text-[#4B2C20] hover:bg-amber-100'
                    }`}
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Pagbasa</span>
                  </button>
                  <button
                    type="button"
                    id="deck-subject-english-btn"
                    onClick={() => setCombatSubject('english')}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                      combatSubject === 'english'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-[#4B2C20] hover:bg-blue-50'
                    }`}
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>English</span>
                  </button>
                  <button
                    type="button"
                    id="deck-subject-math-btn"
                    onClick={() => setCombatSubject('math')}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                      combatSubject === 'math'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-[#4B2C20] hover:bg-indigo-50'
                    }`}
                  >
                    <Calculator className="w-3 h-3" />
                    <span>Matematika</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-[#8B4513] uppercase tracking-wider">
                  Baitang:
                </span>
                <div className="flex items-center gap-1">
                  {([1, 2, 3, 4, 5, 6] as CombatGradeLevel[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      id={`deck-grade-btn-${g}`}
                      onClick={() => setCombatGradeLevel(g)}
                      className={`w-6 h-6 rounded-md text-[11px] font-black transition-all cursor-pointer flex items-center justify-center ${
                        combatGradeLevel === g
                          ? 'bg-[#4B2C20] text-amber-300 ring-2 ring-amber-400 shadow-xs scale-105'
                          : 'bg-white hover:bg-amber-100 text-[#4B2C20] border border-amber-300'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Attack Actions Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
              {/* Action 1: Basic Physical Attack */}
              <button
                id="combat-basic-attack-btn"
                disabled={turn !== 'player'}
                onClick={handlePlayerBasicAttack}
                className={`p-1.5 sm:p-2 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 font-black transition-all touch-manipulation active:scale-95 ${
                  turn === 'player'
                    ? 'border-amber-400 bg-gradient-to-b from-amber-100 to-amber-200 text-amber-950 shadow-xs cursor-pointer'
                    : 'border-slate-300 bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="text-base sm:text-lg">🐾</div>
                <span className="text-xs font-black">Normal na Atake</span>
                <span className="text-[9px] text-amber-800 font-bold bg-amber-50/80 px-1.5 py-0.2 rounded-full border border-amber-300 flex items-center gap-0.5">
                  {combatSubject === 'reading' ? (
                    <>
                      <BookOpen className="w-2.5 h-2.5" /> Pagbasa (Baitang {combatGradeLevel})
                    </>
                  ) : combatSubject === 'english' ? (
                    <>
                      <BookOpen className="w-2.5 h-2.5" /> English (Grade {combatGradeLevel})
                    </>
                  ) : (
                    <>
                      <Calculator className="w-2.5 h-2.5" /> Math (Grade {combatGradeLevel})
                    </>
                  )}
                </span>
              </button>

              {/* Action 2: Elemental Special Skill */}
              <button
                id="combat-special-skill-btn"
                disabled={turn !== 'player'}
                onClick={handlePlayerSpecialSkill}
                className={`p-1.5 sm:p-2 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 font-black transition-all touch-manipulation active:scale-95 ${
                  turn === 'player'
                    ? 'border-purple-400 bg-gradient-to-b from-purple-100 to-purple-200 text-purple-950 shadow-xs cursor-pointer'
                    : 'border-slate-300 bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                }`}
              >
                <Zap className="w-4 h-4 text-purple-700" />
                <span className="text-xs font-black truncate max-w-full">
                  {fighterDef.specialSkillTagalog}
                </span>
                <span className="text-[9px] text-purple-800 font-bold bg-purple-50/80 px-1.5 py-0.2 rounded-full border border-purple-300 flex items-center gap-0.5">
                  {combatSubject === 'reading' ? (
                    <>
                      <BookOpen className="w-2.5 h-2.5" /> {fighterDef.element}
                    </>
                  ) : combatSubject === 'english' ? (
                    <>
                      <BookOpen className="w-2.5 h-2.5" /> {fighterDef.element}
                    </>
                  ) : (
                    <>
                      <Calculator className="w-2.5 h-2.5" /> {fighterDef.element}
                    </>
                  )}
                </span>
              </button>

              {/* Action 3: Shield & Recovery */}
              <button
                id="combat-shield-btn"
                disabled={turn !== 'player'}
                onClick={handlePlayerDefend}
                className={`p-1.5 sm:p-2 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 font-black transition-all touch-manipulation active:scale-95 ${
                  turn === 'player'
                    ? 'border-cyan-400 bg-gradient-to-b from-cyan-100 to-cyan-200 text-cyan-950 shadow-xs cursor-pointer'
                    : 'border-slate-300 bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                }`}
              >
                <Shield className="w-4 h-4 text-cyan-700" />
                <span className="text-xs font-black">Pananggalang</span>
                <span className="text-[9px] text-cyan-800 font-bold bg-cyan-50/80 px-1.5 py-0.2 rounded-full border border-cyan-300">
                  -50% Dmg + 20% HP
                </span>
              </button>

              {/* Action 4: Marungko Power Quiz 2.5x Critical Attack! */}
              <button
                id="combat-marungko-quiz-btn"
                disabled={turn !== 'player'}
                onClick={handleOpenMarungkoQuiz}
                className={`p-1.5 sm:p-2 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 font-black transition-all relative overflow-hidden touch-manipulation active:scale-95 ${
                  turn === 'player'
                    ? 'border-rose-400 bg-gradient-to-b from-rose-100 via-amber-100 to-yellow-100 text-rose-950 shadow-xs shadow-rose-500/20 cursor-pointer animate-pulse'
                    : 'border-slate-300 bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-1 text-rose-700">
                  <Brain className="w-4 h-4" />
                  <Flame className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <span className="text-xs font-black">
                  {combatSubject === 'reading'
                    ? 'Marungko Power!'
                    : combatSubject === 'english'
                    ? 'English Master!'
                    : 'Math Wizard!'}
                </span>
                <span className="text-[9px] font-black text-rose-700 bg-rose-200 px-1.5 py-0.2 rounded">
                  2.5x + 2 ⭐ (G{combatGradeLevel})
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. PAGBASA PARA SA ATAKE (READING GATED COMBAT MODAL)     */}
      {/* ========================================================= */}
      <AnimatePresence>
        {(activeChallenge || isChallengeLoading) && currentAttackMeta && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl border-4 border-[#FF8400] p-4 sm:p-5 max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col items-center text-center max-h-[92vh] overflow-y-auto"
            >
              {/* Header Badge */}
              <div className="w-full flex items-center justify-between mb-2 border-b-2 border-amber-100 pb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-lg shadow-xs">
                    {currentAttackMeta.attackIcon}
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {currentAttackMeta.attackType === 'marungko'
                        ? '💥 2.5x KRITIKAL NA HAMON'
                        : currentAttackMeta.attackType === 'special'
                        ? `⚡ ${currentAttackMeta.element || 'ELEMENTAL'} SKILL`
                        : '🐾 NORMAL NA ATAKE'}
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-[#4B2C20]">
                      {currentAttackMeta.attackTitle}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      currentAttackMeta.attackType === 'marungko'
                        ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                        : currentAttackMeta.attackType === 'special'
                        ? 'bg-purple-100 text-purple-800 border-purple-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {currentAttackMeta.attackType === 'marungko'
                      ? '💥 2.5x + 2 ⭐'
                      : currentAttackMeta.attackType === 'special'
                      ? `⚡ ${currentAttackMeta.element}`
                      : '🐾 Normal'}
                  </span>
                  <button
                    type="button"
                    id="close-combat-challenge-btn"
                    onClick={() => {
                      speechRecognizerRef.current?.stopListening();
                      setIsListeningForReading(false);
                      setActiveChallenge(null);
                      setCurrentAttackMeta(null);
                      setChallengeFeedback(null);
                    }}
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center cursor-pointer touch-manipulation transition-colors"
                    title="Isara"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* In-Modal Subject & Grade Level Quick Switchers */}
              <div className="w-full bg-amber-50/80 border-2 border-amber-200 rounded-2xl p-2 mb-2 flex flex-col sm:flex-row items-center justify-between gap-2">
                {/* Subject Switcher: Reading vs English vs Math */}
                <div className="flex items-center gap-1 w-full sm:w-auto justify-center flex-wrap">
                  <span className="text-[10px] font-black text-[#8B4513] mr-0.5">Hamon:</span>
                  <button
                    type="button"
                    id="modal-switch-reading-btn"
                    disabled={isChallengeLoading || challengeFeedback !== null}
                    onClick={() => handleChangeChallengeSubject('reading')}
                    className={`px-2 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                      combatSubject === 'reading'
                        ? 'bg-[#FF8400] text-white shadow-xs ring-2 ring-[#FF8400]/40'
                        : 'bg-white text-[#4B2C20] hover:bg-amber-100 border border-amber-300'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>📖 Pagbasa</span>
                  </button>
                  <button
                    type="button"
                    id="modal-switch-english-btn"
                    disabled={isChallengeLoading || challengeFeedback !== null}
                    onClick={() => handleChangeChallengeSubject('english')}
                    className={`px-2 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                      combatSubject === 'english'
                        ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-500/40'
                        : 'bg-white text-[#4B2C20] hover:bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>📚 English</span>
                  </button>
                  <button
                    type="button"
                    id="modal-switch-math-btn"
                    disabled={isChallengeLoading || challengeFeedback !== null}
                    onClick={() => handleChangeChallengeSubject('math')}
                    className={`px-2 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                      combatSubject === 'math'
                        ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-500/40'
                        : 'bg-white text-[#4B2C20] hover:bg-indigo-50 border border-indigo-200'
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>🔢 Math</span>
                  </button>
                </div>

                {/* Grade Level Switcher: 1 to 6 */}
                <div className="flex items-center gap-1 w-full sm:w-auto justify-center">
                  <span className="text-[10px] font-black text-[#8B4513] mr-0.5">Baitang:</span>
                  <div className="flex items-center gap-1">
                    {([1, 2, 3, 4, 5, 6] as CombatGradeLevel[]).map((g) => (
                      <button
                        key={g}
                        type="button"
                        id={`modal-grade-btn-${g}`}
                        disabled={isChallengeLoading || challengeFeedback !== null}
                        onClick={() => handleChangeChallengeGrade(g)}
                        className={`w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                          combatGradeLevel === g
                            ? 'bg-[#4B2C20] text-amber-300 ring-2 ring-amber-400 shadow-xs scale-105'
                            : 'bg-white hover:bg-amber-100 text-[#4B2C20] border border-amber-300'
                        }`}
                        title={`Piliin ang Baitang ${g}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Challenge Body: Loading State OR Challenge Display */}
              {isChallengeLoading || !activeChallenge ? (
                <div className="w-full py-8 px-4 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center animate-bounce shadow-md text-2xl">
                    {combatSubject === 'reading' ? '📖' : combatSubject === 'english' ? '📚' : '🔢'}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-[#4B2C20]">
                      Lumilikha ang AI ng sariwang hamon...
                    </p>
                    <p className="text-xs font-semibold text-amber-800">
                      {combatSubject === 'reading'
                        ? `Bagong pagbasa para sa Baitang ${combatGradeLevel}`
                        : combatSubject === 'english'
                        ? `New English reading challenge for Grade ${combatGradeLevel}`
                        : `Bagong tanong sa matematika para sa Baitang ${combatGradeLevel}`}
                    </p>
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF8400] animate-ping" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-300 animate-pulse" />
                  </div>
                </div>
              ) : activeChallenge.mode === 'english' ? (
                /* ========================================= */
                /* 📚 ENGLISH READING CHALLENGE DISPLAY       */
                /* ========================================= */
                <div className="w-full flex flex-col items-center">
                  <div className="w-full bg-gradient-to-b from-sky-50 to-blue-50/70 rounded-2xl p-2.5 sm:p-3.5 border-2 border-sky-300 mb-2 shadow-inner flex flex-col items-center">
                    <div className="flex items-center gap-1.5 text-blue-900 font-black text-xs uppercase tracking-wider mb-1">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>English Reading Challenge (Grade {combatGradeLevel})</span>
                    </div>

                    {/* Syllables Segmentation or Target Word */}
                    {activeChallenge.syllables && activeChallenge.syllables.length > 0 ? (
                      <div className="flex items-center justify-center gap-1.5 my-1 flex-wrap">
                        {activeChallenge.syllables.map((syl, sIdx) => (
                          <span
                            key={sIdx}
                            className={`px-3 py-1 rounded-xl font-black text-2xl sm:text-3xl shadow-md border-2 ${
                              sIdx % 2 === 0
                                ? 'bg-blue-600 border-blue-700 text-white'
                                : 'bg-teal-500 border-teal-600 text-white'
                            }`}
                          >
                            {syl}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-2xl sm:text-3xl font-black text-blue-950 my-1 tracking-wide">
                        {activeChallenge.targetWord || activeChallenge.correctAnswer}
                      </div>
                    )}

                    {/* Pronunciation audio button & phonetic guide */}
                    <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
                      <button
                        type="button"
                        id="combat-english-pronounce-btn"
                        onClick={() => {
                          const wordToSpeak =
                            activeChallenge.targetWord || activeChallenge.correctAnswer;
                          speakEnglish(wordToSpeak);
                        }}
                        className="flex items-center gap-1 bg-sky-100 hover:bg-sky-200 text-sky-950 border-2 border-sky-400 px-2.5 py-0.5 rounded-full text-xs font-black shadow-xs transition-transform active:scale-95 cursor-pointer touch-manipulation"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-sky-700" />
                        <span>Listen to English Pronunciation</span>
                      </button>

                      {activeChallenge.phoneticGuide && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-sky-900 bg-white/90 px-2 py-0.5 rounded-full border border-sky-200">
                          <span>💡 Phonics:</span>
                          <span className="font-black text-sky-950">
                            {activeChallenge.phoneticGuide}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Daily Life Reading Passage */}
                    {activeChallenge.readingPassage && (
                      <div className="mt-2 px-3 py-1.5 bg-white/90 border border-sky-200 rounded-xl text-center shadow-xs">
                        <p className="text-xs sm:text-sm font-semibold text-blue-950">
                          "{activeChallenge.readingPassage}"
                        </p>
                      </div>
                    )}

                    {/* Clue if available */}
                    {activeChallenge.clue && (
                      <p className="text-[10px] text-sky-800 font-semibold mt-1">
                        ❓ {activeChallenge.clue}
                      </p>
                    )}
                  </div>

                  {/* Tablet & Phone Touch Selection Options */}
                  <div className="w-full my-1">
                    <div className="bg-sky-50/80 border-2 border-sky-200 rounded-2xl p-2 mb-1.5 text-center">
                      <span className="text-[11px] font-black text-sky-950 flex items-center justify-center gap-1">
                        <span>👇 Select the correct word to attack:</span>
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                        {activeChallenge.options.map((opt, idx) => (
                          <button
                            key={idx}
                            id={`combat-english-option-${idx}`}
                            disabled={challengeFeedback !== null}
                            onClick={() => handleSelectChallengeOption(opt, activeChallenge)}
                            className="py-2.5 px-3 bg-white hover:bg-sky-100 active:scale-95 border-2 border-sky-300 hover:border-blue-600 rounded-xl font-black text-sm sm:text-base text-blue-950 shadow-xs transition-all cursor-pointer touch-manipulation flex items-center justify-center min-h-[44px]"
                          >
                            <span>{opt}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Voice Option Alternative */}
                  <div className="w-full space-y-1.5">
                    <button
                      id="combat-english-mic-btn"
                      disabled={challengeFeedback !== null}
                      onClick={isListeningForReading ? handleStopReadingMic : () => handleStartReadingMic(true)}
                      className={`w-full py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border-2 transition-all cursor-pointer shadow-xs touch-manipulation ${
                        isListeningForReading
                          ? 'bg-rose-500 border-rose-600 text-white animate-pulse shadow-rose-400/50'
                          : 'bg-sky-50 border-sky-300 text-sky-900 hover:bg-sky-100 active:scale-95'
                      }`}
                    >
                      {isListeningForReading ? (
                        <>
                          <MicOff className="w-4 h-4 animate-spin" />
                          <span>Listening in English... Say: "{activeChallenge.targetWord || activeChallenge.correctAnswer}"!</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 text-sky-600" />
                          <span>Or Speak the Word Aloud (English Voice)</span>
                        </>
                      )}
                    </button>

                    {/* Real-time speech transcript feedback */}
                    {readingTranscript && (
                      <div className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-bold flex items-center justify-between shadow-xs">
                        <span>🎙️ Heard:</span>
                        <span className="font-black text-blue-700">"{readingTranscript}"</span>
                      </div>
                    )}

                    {readingMicError && (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-1.5 text-center">
                        <p className="text-[10px] font-bold text-rose-600">
                          ⚠️ {readingMicError}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : activeChallenge.mode === 'reading' ? (
                /* ========================================= */
                /* 📖 PAGBASA CHALLENGE DISPLAY              */
                /* ========================================= */
                <div className="w-full flex flex-col items-center">
                  {/* Big Word Display Card with Syllable Badges */}
                  <div className="w-full bg-gradient-to-b from-amber-50 to-orange-50/60 rounded-2xl p-2.5 sm:p-3.5 border-2 border-amber-200 mb-2 shadow-inner flex flex-col items-center">
                    {/* Syllables Segmentation or Target Word */}
                    {activeChallenge.syllables && activeChallenge.syllables.length > 0 ? (
                      <div className="flex items-center justify-center gap-1.5 my-1 flex-wrap">
                        {activeChallenge.syllables.map((syl, sIdx) => (
                          <span
                            key={sIdx}
                            className={`px-3 py-1 rounded-xl font-black text-2xl sm:text-3xl shadow-md border-2 ${
                              sIdx % 2 === 0
                                ? 'bg-rose-500 border-rose-600 text-white'
                                : 'bg-sky-500 border-sky-600 text-white'
                            }`}
                          >
                            {syl}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-2xl sm:text-3xl font-black text-[#4B2C20] my-1 tracking-wide">
                        {activeChallenge.targetWord || activeChallenge.questionText}
                      </div>
                    )}

                    {/* Pronunciation audio button & phonetic guide */}
                    <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
                      <button
                        type="button"
                        id="combat-reading-pronounce-btn"
                        onClick={() => {
                          const wordToSpeak =
                            activeChallenge.targetWord || activeChallenge.correctAnswer;
                          const isPantig =
                            (activeChallenge.syllables && activeChallenge.syllables.length === 1) ||
                            wordToSpeak.trim().length <= 2;
                          speakTagalog(isPantig ? wordToSpeak.trim().toLowerCase() : wordToSpeak);
                        }}
                        className="flex items-center gap-1 bg-[#FFD93D] hover:bg-[#FFC800] text-[#4B2C20] border-2 border-[#FF8400] px-2.5 py-0.5 rounded-full text-xs font-black shadow-xs transition-transform active:scale-95 cursor-pointer touch-manipulation"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[#FF8400]" />
                        <span>Pakinggan ang Bigkas</span>
                      </button>

                      {activeChallenge.phoneticGuide && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-[#8B4513] bg-white/90 px-2 py-0.5 rounded-full border border-amber-200">
                          <span>💡 Baybay:</span>
                          <span className="font-black text-[#4B2C20]">
                            {activeChallenge.phoneticGuide}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Question text or Reading Passage / Clue */}
                    {activeChallenge.questionText && activeChallenge.questionText !== activeChallenge.targetWord && (
                      <div className="mt-2 px-2 py-1 bg-amber-100/70 border border-amber-300/80 rounded-xl text-center">
                        <p className="text-xs sm:text-sm font-bold text-[#4B2C20]">
                          "{activeChallenge.questionText}"
                        </p>
                      </div>
                    )}

                    {/* Clue if available */}
                    {activeChallenge.clue && (
                      <p className="text-[10px] text-[#8B4513] font-semibold mt-1">
                        ❓ {activeChallenge.clue}
                      </p>
                    )}
                  </div>

                  {/* Tablet & Phone Touch Selection Options */}
                  <div className="w-full my-1">
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-2 mb-1.5 text-center">
                      <span className="text-[11px] font-black text-[#4B2C20] flex items-center justify-center gap-1">
                        <span>👇 Pindutin ang tamang salita para umatake:</span>
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                        {activeChallenge.options.map((opt, idx) => (
                          <button
                            key={idx}
                            id={`combat-option-${idx}`}
                            disabled={challengeFeedback !== null}
                            onClick={() => handleSelectChallengeOption(opt, activeChallenge)}
                            className="py-2.5 px-3 bg-white hover:bg-amber-100 active:scale-95 border-2 border-amber-300 hover:border-[#FF8400] rounded-xl font-black text-sm sm:text-base text-[#4B2C20] shadow-xs transition-all cursor-pointer touch-manipulation flex items-center justify-center min-h-[44px]"
                          >
                            <span>{opt}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Voice Option Alternative */}
                  <div className="w-full space-y-1.5">
                    <button
                      id="combat-reading-mic-btn"
                      disabled={challengeFeedback !== null}
                      onClick={isListeningForReading ? handleStopReadingMic : () => handleStartReadingMic(true)}
                      className={`w-full py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border-2 transition-all cursor-pointer shadow-xs touch-manipulation ${
                        isListeningForReading
                          ? 'bg-rose-500 border-rose-600 text-white animate-pulse shadow-rose-400/50'
                          : 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100 active:scale-95'
                      }`}
                    >
                      {isListeningForReading ? (
                        <>
                          <MicOff className="w-4 h-4 animate-spin" />
                          <span>Nakikinig ang AI... Bigkasin: "{activeChallenge.targetWord || activeChallenge.correctAnswer}"!</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 text-rose-600" />
                          <span>O Gamitin ang Mikropono (Boses)</span>
                        </>
                      )}
                    </button>

                    {/* Real-time speech transcript feedback */}
                    {readingTranscript && (
                      <div className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-bold flex items-center justify-between shadow-xs">
                        <span>🎙️ Narinig:</span>
                        <span className="font-black text-blue-700">"{readingTranscript}"</span>
                      </div>
                    )}

                    {readingMicError && (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-1.5 text-center">
                        <p className="text-[10px] font-bold text-rose-600">
                          ⚠️ {readingMicError}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* ========================================= */
                /* 🔢 DAILY LIFE MATH CHALLENGE DISPLAY       */
                /* ========================================= */
                <div className="w-full flex flex-col items-center">
                  {/* Math Question Card */}
                  <div className="w-full bg-gradient-to-b from-indigo-50 to-blue-50/70 rounded-2xl p-3 sm:p-4 border-2 border-indigo-200 mb-2 shadow-inner flex flex-col items-center">
                    <div className="flex items-center gap-2 text-indigo-800 font-black text-xs uppercase tracking-wider mb-1">
                      <span className="text-xl">{activeChallenge.mathEmoji || activeChallenge.visualEmoji || '🔢'}</span>
                      <span>Daily Life Math Challenge (Grade {combatGradeLevel})</span>
                    </div>

                    {/* Math Equation or Problem Card (Guaranteed never blank!) */}
                    <div className="bg-white px-4 py-3 rounded-2xl border-2 border-indigo-300 shadow-sm w-full my-1 text-center">
                      <div className="text-base sm:text-lg md:text-xl font-black text-indigo-950 tracking-normal leading-relaxed">
                        {activeChallenge.mathQuestion || activeChallenge.equation || activeChallenge.questionText || 'Solve the math problem below:'}
                      </div>
                    </div>

                    {/* Real-life Hint / Clue */}
                    {(activeChallenge.mathHint || activeChallenge.clue) && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-indigo-900 bg-indigo-100/80 px-2.5 py-0.5 rounded-full border border-indigo-200">
                        <span>💡 Real-Life Hint:</span>
                        <span>{activeChallenge.mathHint || activeChallenge.clue}</span>
                      </div>
                    )}
                  </div>

                  {/* Touch Options Grid for Math */}
                  <div className="w-full my-1">
                    <div className="bg-indigo-50/70 border-2 border-indigo-200 rounded-2xl p-2 mb-1.5 text-center">
                      <span className="text-[11px] font-black text-indigo-950 flex items-center justify-center gap-1">
                        <span>👇 Select the correct answer to attack:</span>
                      </span>
                      <div className="grid grid-cols-2 gap-2 mt-1.5">
                        {activeChallenge.options.map((opt, idx) => (
                          <button
                            key={idx}
                            id={`combat-math-option-${idx}`}
                            disabled={challengeFeedback !== null}
                            onClick={() => handleSelectChallengeOption(opt, activeChallenge)}
                            className="py-3 px-3 bg-white hover:bg-indigo-100 active:scale-95 border-2 border-indigo-300 hover:border-indigo-600 rounded-xl font-black text-base sm:text-lg text-indigo-950 shadow-xs transition-all cursor-pointer touch-manipulation flex items-center justify-center min-h-[46px]"
                          >
                            <span>{opt}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Voice Math Option */}
                  <div className="w-full space-y-1.5">
                    <button
                      id="combat-math-mic-btn"
                      disabled={challengeFeedback !== null}
                      onClick={isListeningForReading ? handleStopReadingMic : () => handleStartReadingMic(true)}
                      className={`w-full py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border-2 transition-all cursor-pointer shadow-xs touch-manipulation ${
                        isListeningForReading
                          ? 'bg-rose-500 border-rose-600 text-white animate-pulse shadow-rose-400/50'
                          : 'bg-indigo-50 border-indigo-300 text-indigo-800 hover:bg-indigo-100 active:scale-95'
                      }`}
                    >
                      {isListeningForReading ? (
                        <>
                          <MicOff className="w-4 h-4 animate-spin" />
                          <span>Listening... Say the answer aloud!</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 text-indigo-600" />
                          <span>Or Speak the Answer with Microphone</span>
                        </>
                      )}
                    </button>

                    {/* Real-time speech transcript feedback */}
                    {readingTranscript && (
                      <div className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-bold flex items-center justify-between shadow-xs">
                        <span>🎙️ Heard:</span>
                        <span className="font-black text-indigo-700">"{readingTranscript}"</span>
                      </div>
                    )}

                    {readingMicError && (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-1.5 text-center">
                        <p className="text-[10px] font-bold text-rose-600">
                          ⚠️ {readingMicError}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Feedback Notice on Correct or Miss */}
              {challengeFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-2 p-2.5 rounded-xl w-full text-center text-xs sm:text-sm font-black flex items-center justify-center gap-2 ${
                    challengeFeedback.isCorrect
                      ? 'bg-emerald-100 border-2 border-emerald-400 text-emerald-950 shadow-md'
                      : 'bg-rose-100 border-2 border-rose-400 text-rose-950 shadow-md'
                  }`}
                >
                  {challengeFeedback.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{challengeFeedback.message}</span>
                </motion.div>
              )}

              {/* Skip / "Hindi ko pa masagot" Button */}
              {!challengeFeedback && !isChallengeLoading && activeChallenge && (
                <button
                  id="combat-challenge-skip-btn"
                  onClick={() => handleSkipReading(activeChallenge)}
                  className="mt-2 text-[11px] font-bold text-slate-500 hover:text-slate-700 underline cursor-pointer touch-manipulation"
                >
                  Hindi ko pa masagot (Magmimintis ang atake)
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 4. VICTORY REWARD MODAL                                   */}
      {/* ========================================================= */}
      <AnimatePresence>
        {battleState === 'victory' && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-white rounded-3xl border-4 border-amber-400 p-6 md:p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
            >
              <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-3xl border-2 border-white shadow-lg flex items-center justify-center">
                <Trophy className="w-10 h-10 text-white drop-shadow-md" />
              </div>

              <h3 className="text-2xl font-black text-[#4B2C20]">TAGUMPAY SA LABANAN!</h3>
              <p className="text-xs text-[#8B4513] font-semibold mt-1">
                Naitumba mo si <strong>{currentEnemy.nameTagalog}</strong> sa {currentArena.titleTagalog}!
              </p>

              {/* Victory Rewards Showcase */}
              <div className="my-5 grid grid-cols-2 gap-3">
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3">
                  <div className="text-2xl mb-0.5">⭐</div>
                  <div className="text-lg font-black text-amber-700">+{earnedStars} Bituin</div>
                  <div className="text-[10px] font-bold text-[#8B4513]">Naidagdag sa profile</div>
                </div>

                <div className="bg-indigo-50 border-2 border-indigo-300 rounded-2xl p-3">
                  <div className="text-2xl mb-0.5">⚡</div>
                  <div className="text-lg font-black text-indigo-700">+{earnedExp} EXP</div>
                  <div className="text-[10px] font-bold text-[#8B4513]">Para sa iyong alaga</div>
                </div>
              </div>

              {evolutionNote && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 text-xs font-black text-emerald-800 mb-4 animate-pulse">
                  {evolutionNote}
                </div>
              )}

              <div className="space-y-2">
                <button
                  id="victory-fight-again-btn"
                  onClick={() => {
                    handleRollRandomEnemies(selectedArenaId);
                    setBattleState('select');
                  }}
                  className="w-full py-3 rounded-2xl bg-[#FF8400] hover:bg-[#E55604] text-white font-black text-sm shadow-md transition-transform hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Swords className="w-4 h-4" />
                  <span>Pumili ng Bagong Random na Kalaban 🎲</span>
                </button>

                {onNavigateToNursery && (
                  <button
                    id="victory-go-to-nursery-btn"
                    onClick={onNavigateToNursery}
                    className="w-full py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-[#4B2C20] font-black text-xs transition-colors cursor-pointer"
                  >
                    Pumunta sa Tahanan ng mga Alaga (Pakainin at Alagaan)
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 5. DEFEAT & ENCOURAGEMENT MODAL                           */}
      {/* ========================================================= */}
      <AnimatePresence>
        {battleState === 'defeat' && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-white rounded-3xl border-4 border-slate-400 p-6 md:p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
            >
              <div className="text-5xl mb-3">🩹</div>
              <h3 className="text-xl font-black text-[#4B2C20]">Kailangan Pa ng Pagsasanay!</h3>
              <p className="text-xs text-[#8B4513] font-semibold mt-1">
                Bumagsak ang lakas ng iyong alaga laban kay <strong>{currentEnemy.nameTagalog}</strong>.
              </p>

              <div className="my-4 bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 text-xs text-[#4B2C20] text-left space-y-1">
                <p className="font-black text-amber-800">💡 Mga Tip sa Pagpapalakas:</p>
                <p>1. Pakainin ang iyong alaga ng gatas o biskwit upang umangat sa Antas 2 (Teen) o Antas 3 (Adult).</p>
                <p>2. Gamitin ang <strong>Marungko Power</strong> sa laban para sa 2.5x kritikal na pinsala!</p>
                <p>3. Magsanay sa Pagbasa at Pagsulat upang kumita ng higit pang mga Bituin.</p>
              </div>

              <div className="space-y-2">
                <button
                  id="defeat-retry-btn"
                  onClick={() => {
                    const freshFoes = generateRandomEnemiesForArena(selectedArenaId, 3);
                    setArenaEnemies((prev) => ({
                      ...prev,
                      [selectedArenaId]: freshFoes,
                    }));
                    const freshFoe = freshFoes[Math.floor(Math.random() * freshFoes.length)];
                    startBattle(freshFoe);
                  }}
                  className="w-full py-3 rounded-2xl bg-[#FF8400] hover:bg-[#E55604] text-white font-black text-sm shadow-md transition-transform hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Subukan Muli (Bagong Kalaban 🎲)</span>
                </button>

                <button
                  id="defeat-back-btn"
                  onClick={() => {
                    handleRollRandomEnemies(selectedArenaId);
                    setBattleState('select');
                  }}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition-colors cursor-pointer"
                >
                  Pumili ng Bagong Kalaban 🎲
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
