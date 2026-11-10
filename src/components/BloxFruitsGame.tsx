import React, { useState, useEffect, useRef } from 'react';
import { StudentProfile } from '../types';
import {
  BLOX_FRUITS,
  BLOX_SWORDS,
  BLOX_ACCESSORIES,
  BLOX_QUESTS,
  DEFAULT_PLAYER_DATA,
  FRUIT_ROLL_COST,
  FRUIT_PRIZES,
  DUPLICATE_FRUIT_CASH_PRIZE,
  rollRandomBloxFruit,
} from '../data/bloxFruitsData';
import {
  BloxFruit,
  BloxSword,
  BloxAccessory,
  BloxFruitsPlayerData,
  FruitSkill,
  BloxQuest,
} from '../types';
import { BloxFruitsWorld3D } from './bloxfruits3d/BloxFruitsWorld3D';
import {
  ChestQuestion,
  getRandomChestQuestion,
  GradeLevel,
  QuizSubject,
  GRADE_CATEGORIES,
  QUIZ_SUBJECTS,
} from '../data/chestQuizData';
import {
  playStarSound,
  playSuccessFanfare,
  playTryAgainSound,
  playHakiSound,
  playDashSound,
  playLevelUpSound,
  playBattleVictorySound,
  playExplosionSound,
  playSwordSlashSound,
} from '../services/soundEffects';
import confetti from 'canvas-confetti';
import {
  Swords,
  Shield,
  Zap,
  Sparkles,
  BarChart2,
  HelpCircle,
  X,
  Plus,
  Compass,
  ArrowUp,
  MapPin,
  Scroll,
  CheckCircle2,
  Wind,
  BookOpen,
  GraduationCap,
  Skull,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  Globe,
} from 'lucide-react';
import {
  getNonRepeatingDepEdQuestion,
  getRespawnQuestionsSet,
  prefetchDepEdQuestions,
  markQuestionAsAsked,
} from '../services/bloxQuizService';

// =========================================================================
// LEGO DESIGN SYSTEM VISUAL HELPERS (Tactile Bricks, Studs & Minifig Badges)
// =========================================================================
export const LegoStud: React.FC<{ size?: 'xs' | 'sm' | 'md'; color?: string; className?: string }> = ({
  size = 'sm',
  color = 'bg-white/30',
  className = '',
}) => {
  const sizeMap = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5 sm:w-3 sm:h-3',
    md: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
  };
  return (
    <div
      className={`${sizeMap[size]} rounded-full ${color} border border-black/25 shadow-[0_1.5px_2px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.7)] flex items-center justify-center shrink-0 ${className}`}
    >
      <div className="w-[45%] h-[45%] rounded-full bg-black/15 shadow-inner" />
    </div>
  );
};

export const LegoStudRow: React.FC<{ count?: number; size?: 'xs' | 'sm' | 'md'; className?: string; studColor?: string }> = ({
  count = 8,
  size = 'xs',
  className = '',
  studColor = 'bg-white/30',
}) => (
  <div className={`flex items-center justify-around gap-1 px-2 py-0.5 bg-black/30 border-b border-black/40 overflow-hidden ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <LegoStud key={i} size={size} color={studColor} />
    ))}
  </div>
);

export const LegoBrandBadge: React.FC<{ text?: string; subtext?: string }> = ({
  text = 'BLOX FRUITS',
  subtext = 'LEGO MMORPG',
}) => (
  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-600 border-2 border-yellow-400 rounded-lg shadow-[0_3px_0_0_#991b1b] transform -rotate-1 select-none shrink-0">
    <div className="flex flex-col gap-0.5">
      <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 shadow-xs" />
      <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 shadow-xs" />
    </div>
    <div className="leading-tight">
      <span className="font-black text-[10px] sm:text-xs text-yellow-300 tracking-wider uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] block font-sans">
        {text}
      </span>
      {subtext && (
        <span className="text-[7.5px] sm:text-[8px] font-black text-white uppercase tracking-widest block opacity-90">
          {subtext}
        </span>
      )}
    </div>
  </div>
);

export const LegoBrickBar: React.FC<{
  current: number;
  max: number;
  color: 'green' | 'cyan' | 'red' | 'amber';
  height?: string;
  segments?: number;
}> = ({ current, max, color, height = 'h-2 sm:h-2.5', segments = 10 }) => {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));
  const activeSegments = Math.round((percent / 100) * segments);

  const colorStyles = {
    green: {
      active: 'bg-emerald-500 border-emerald-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]',
      glow: 'shadow-[0_0_6px_rgba(16,185,129,0.5)]',
    },
    cyan: {
      active: 'bg-cyan-400 border-cyan-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]',
      glow: 'shadow-[0_0_6px_rgba(6,182,212,0.5)]',
    },
    red: {
      active: 'bg-red-500 border-red-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]',
      glow: 'shadow-[0_0_6px_rgba(239,68,68,0.5)]',
    },
    amber: {
      active: 'bg-amber-400 border-amber-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]',
      glow: 'shadow-[0_0_6px_rgba(245,158,11,0.5)]',
    },
  }[color];

  return (
    <div className={`w-full bg-slate-900/90 border border-black/60 rounded-md p-0.5 shadow-inner flex items-center gap-0.5 ${height}`}>
      {Array.from({ length: segments }).map((_, idx) => {
        const isActive = idx < activeSegments;
        return (
          <div
            key={idx}
            className={`flex-1 h-full rounded-[2px] transition-all duration-200 border-t ${
              isActive
                ? `${colorStyles.active} ${colorStyles.glow}`
                : 'bg-slate-800/80 border-slate-700/50'
            }`}
          />
        );
      })}
    </div>
  );
};

interface BloxFruitsGameProps {
  activeStudent: StudentProfile;
  onAwardStars: (count: number) => void;
  voiceEnabled: boolean;
}

export const BloxFruitsGame: React.FC<BloxFruitsGameProps> = ({
  activeStudent,
  onAwardStars,
}) => {
  // Load player Blox Fruits progression from localStorage per student
  const [player, setPlayer] = useState<BloxFruitsPlayerData>(() => {
    try {
      const saved = localStorage.getItem(`bloxfruits_player_${activeStudent.id}`);
      if (saved) {
        return JSON.parse(saved);
      }
      return DEFAULT_PLAYER_DATA;
    } catch {
      return DEFAULT_PLAYER_DATA;
    }
  });

  // Save state on change
  useEffect(() => {
    try {
      localStorage.setItem(`bloxfruits_player_${activeStudent.id}`, JSON.stringify(player));
    } catch (e) {
      console.warn('Blox Fruits save error:', e);
    }
  }, [player, activeStudent.id]);

  // Current equipped items
  const equippedFruit =
    BLOX_FRUITS.find((f) => f.id === player.equippedFruitId) || BLOX_FRUITS[0];
  const equippedSword =
    BLOX_SWORDS.find((s) => s.id === player.equippedSwordId) || BLOX_SWORDS[0];
  const equippedAccessory =
    BLOX_ACCESSORIES.find((a) => a.id === player.equippedAccessoryId) || BLOX_ACCESSORIES[0];

  // Active Modals / Overlays
  const [activeModal, setActiveModal] = useState<
    'none' | 'dealer' | 'blacksmith' | 'accessories' | 'stats' | 'quests' | 'map' | 'help' | 'chestQuiz' | 'respawnQuiz' | 'skills'
  >('none');
  const [inspectFruitId, setInspectFruitId] = useState<string>(() => player.equippedFruitId);

  // Chest Quiz Modal State
  const [activeChestQuestion, setActiveChestQuestion] = useState<ChestQuestion | null>(null);
  const [pendingChestId, setPendingChestId] = useState<string | null>(null);
  const [pendingChestReward, setPendingChestReward] = useState<number>(30);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [openedChestTrigger, setOpenedChestTrigger] = useState<{ id: string; time: number } | null>(null);
  const [selectedQuizGrade, setSelectedQuizGrade] = useState<GradeLevel | 'all'>(() => {
    return player.selectedGrade || 'all';
  });
  const [selectedQuizSubject, setSelectedQuizSubject] = useState<QuizSubject | 'all'>('all');
  const [customQuizTopic, setCustomQuizTopic] = useState<string>('');
  const [typedCustomTopicInput, setTypedCustomTopicInput] = useState<string>('');
  const [smoothMode, setSmoothMode] = useState<boolean>(true);
  const [mapCategoryFilter, setMapCategoryFilter] = useState<'all' | 'easy' | 'medium' | 'hard' | 'expert' | 'nightmare'>('all');

  // Live Combat & Death State
  const maxPlayerHp = 200 + player.stats.defense * 20 + equippedAccessory.hpBonus;
  const maxPlayerEnergy = 100 + player.stats.melee * 10 + equippedAccessory.energyBonus;
  const [playerHp, setPlayerHp] = useState<number>(maxPlayerHp);
  const [playerEnergy, setPlayerEnergy] = useState<number>(maxPlayerEnergy);
  const [isDead, setIsDead] = useState<boolean>(false);

  // Respawn Quiz State (Answer 5 questions correctly to respawn)
  const [respawnCorrectCount, setRespawnCorrectCount] = useState<number>(0);
  const [currentRespawnQuestion, setCurrentRespawnQuestion] = useState<ChestQuestion | null>(null);
  const [respawnQuestionsBatch, setRespawnQuestionsBatch] = useState<ChestQuestion[]>([]);
  const [selectedRespawnOption, setSelectedRespawnOption] = useState<number | null>(null);
  const [respawnFeedback, setRespawnFeedback] = useState<'none' | 'correct' | 'wrong'>('none');

  // Respawn Quiz Interactive Type Bar, Language & Grade Level State
  const [respawnQuizTopic, setRespawnQuizTopic] = useState<string>('');
  const [typedRespawnTopicInput, setTypedRespawnTopicInput] = useState<string>('');
  const [respawnQuizLanguage, setRespawnQuizLanguage] = useState<'all' | 'filipino' | 'english'>('all');
  const [respawnQuizGrade, setRespawnQuizGrade] = useState<GradeLevel | 'all'>(() => {
    return player.selectedGrade || 'all';
  });
  const [isRespawnLoading, setIsRespawnLoading] = useState<boolean>(false);

  // Background Game Pause (Freeze world simulation when questions are active or modals are open or player is dead)
  const isGamePaused = activeModal !== 'none' || isDead;

  // Buso Haki (Armament Haki) State
  const [hakiActive, setHakiActive] = useState<boolean>(false);
  const [hakiToggleTrigger, setHakiToggleTrigger] = useState<number>(0);

  // Dash Trigger
  const [dashTrigger, setDashTrigger] = useState<number>(0);

  // Teleport / Fast Travel Target
  const [teleportTarget, setTeleportTarget] = useState<{
    x: number;
    z: number;
    name: string;
  } | null>(null);

  // External Attack Triggers for 3D Engine
  const [attackTrigger, setAttackTrigger] = useState<{
    type: 'sword' | 'melee' | 'skill';
    skill?: FruitSkill;
    id: number;
  } | null>(null);

  // Orientation state for Phone view (Vertical vs Horizontal)
  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerHeight > window.innerWidth;
  });

  const [isCompactLandscape, setIsCompactLandscape] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= window.innerHeight && window.innerHeight < 560;
  });

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState<boolean>(false);

  useEffect(() => {
    const handleOrientationResize = () => {
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
      setIsCompactLandscape(!portrait && window.innerHeight < 560);
      setIsFullscreen(!!document.fullscreenElement);
    };
    window.addEventListener('resize', handleOrientationResize);
    window.addEventListener('orientationchange', handleOrientationResize);
    document.addEventListener('fullscreenchange', handleOrientationResize);
    return () => {
      window.removeEventListener('resize', handleOrientationResize);
      window.removeEventListener('orientationchange', handleOrientationResize);
      document.removeEventListener('fullscreenchange', handleOrientationResize);
    };
  }, []);

  // Pre-fetch non-repeating DepEd questions aligned with curriculum
  useEffect(() => {
    prefetchDepEdQuestions(selectedQuizGrade, selectedQuizSubject, customQuizTopic.trim() || undefined);
  }, [selectedQuizGrade, selectedQuizSubject, customQuizTopic]);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  // Virtual Controls for Touch / Mobile
  const [movementInput, setMovementInput] = useState({
    forward: 0,
    strafe: 0,
    jump: false,
    sprint: false,
  });

  // Virtual Movement Joystick & D-Pad State
  const [joystickKnob, setJoystickKnob] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [joystickActive, setJoystickActive] = useState<boolean>(false);
  const joystickPointerIdRef = useRef<number | null>(null);
  const joystickCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Cooldowns State for HUD buttons
  const [skillCooldowns, setSkillCooldowns] = useState<Record<string, number>>({});

  // Gacha Fruit Dealer State
  const [isRolling, setIsRolling] = useState(false);
  const [rolledFruit, setRolledFruit] = useState<BloxFruit | null>(null);

  // Live Counter for Coins & Chests
  const [coinsFound, setCoinsFound] = useState<number>(0);
  const [chestsOpened, setChestsOpened] = useState<number>(0);

  // Status Notification Banner
  const [notification, setNotification] = useState<string | null>(
    'Maglakad (WASD), Tumalon (Space), Mag-Dash (Q), at Kausapin ang NPCs (E)!'
  );

  // Ticker for Energy, Health, and Skill Cooldowns (Paused when answering questions)
  useEffect(() => {
    const timer = setInterval(() => {
      if (isGamePaused) return;

      setPlayerEnergy((prev) => (prev >= maxPlayerEnergy ? prev : Math.min(maxPlayerEnergy, prev + 6)));
      setPlayerHp((prev) => (prev >= maxPlayerHp ? prev : Math.min(maxPlayerHp, prev + 4)));

      setSkillCooldowns((prev) => {
        let hasActive = false;
        const next: Record<string, number> = {};
        for (const k in prev) {
          const rem = Math.max(0, prev[k] - 0.5);
          if (rem > 0) {
            next[k] = rem;
            hasActive = true;
          }
        }
        if (!hasActive && Object.keys(prev).length === 0) return prev;
        return next;
      });
    }, 500);

    return () => clearInterval(timer);
  }, [maxPlayerEnergy, maxPlayerHp, isGamePaused]);

  // Handle Keyboard Attack Shortcuts (Z, X, C, V, F, Q, B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGamePaused) return;

      const key = e.key.toUpperCase();
      if (key === 'F') {
        handleTriggerAttack('sword');
      } else if (key === 'Q') {
        handleTriggerDash();
      } else if (key === 'B') {
        handleToggleHaki();
      } else if (['Z', 'X', 'C', 'V'].includes(key)) {
        const skill = equippedFruit.skills.find((s) => s.key === key);
        if (skill) {
          handleTriggerAttack('skill', skill);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [equippedFruit, isGamePaused, playerEnergy, skillCooldowns, hakiActive]);

  // Trigger Attack
  const handleTriggerAttack = (type: 'sword' | 'melee' | 'skill', skill?: FruitSkill) => {
    if (isGamePaused) return;

    if (type === 'skill' && skill) {
      if ((skillCooldowns[skill.key] || 0) > 0.1) return;
      if (playerEnergy < skill.energyCost) {
        showNotification('⚡ Kulang ang Energy! Maghintay magkarga.');
        return;
      }

      setPlayerEnergy((prev) => Math.max(0, prev - skill.energyCost));
      setSkillCooldowns((prev) => ({ ...prev, [skill.key]: skill.cooldown }));
      showNotification(`⚔️ Ginamit ang [${skill.key}] ${skill.name}!`);
    } else {
      showNotification(`⚔️ Inatake gamit ang ${equippedSword.name}!`);
    }

    setAttackTrigger({
      type,
      skill,
      id: Date.now() + Math.random(),
    });
  };

  // Trigger Flash Step / Dash (Q)
  const handleTriggerDash = () => {
    if (isGamePaused) return;
    if (playerEnergy < 15) {
      showNotification('⚡ Kulang ang Energy para sa Flash Step!');
      return;
    }
    setPlayerEnergy((prev) => Math.max(0, prev - 15));
    playDashSound();
    setDashTrigger(Date.now() + Math.random());
    showNotification('💨 Flash Step (Soru)!');
  };

  // Toggle Buso Haki (B)
  const handleToggleHaki = () => {
    if (isGamePaused) return;
    playHakiSound();
    setHakiActive((prev) => {
      const next = !prev;
      setNotification(next ? 'Buso Haki (Armament) PINAGANA! (+35% Dmg)' : 'Buso Haki PINATAY.');
      return next;
    });
    setHakiToggleTrigger(Date.now());
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
  };

  // Callback when 3D enemy or boss is defeated
  const handleEnemyDefeated = (
    enemyType: 'bandit' | 'baboon' | 'marine' | 'desert' | 'sky' | 'boss',
    isBoss: boolean,
    rewardStars: number,
    rewardExp: number
  ) => {
    if (isBoss && (rewardStars > 0 || rewardExp > 0)) {
      playStarSound();
      playSuccessFanfare();
      confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });

      // Award shared stars to student profile ONLY for bosses!
      onAwardStars(rewardStars);
      showNotification(
        `👑 Pinaslang ang BOSS! 🎁 Kaban ng Kayamanan ay bumagsak! (+${rewardStars} ⭐ Bituin, +${rewardExp} EXP)`
      );
    } else {
      // COMMON FOES DO NOT GIVE REWARDS (Only Boss drop chest & rewards)
      showNotification(`💀 Tinalo ang common minion! (Tanging Boss lamang ang nagbibigay ng Kaban at Premyo)`);
    }

    // Update quest progress if matching (minions and bosses can still count towards quests)
    setPlayer((prev) => {
      let curExp = prev.exp + (isBoss ? rewardExp : 0);
      let curLvl = prev.level;
      let maxExp = prev.maxExp;
      let newStatPoints = prev.statPoints;

      while (curExp >= maxExp) {
        curExp -= maxExp;
        curLvl += 1;
        maxExp = Math.round(maxExp * 1.35);
        newStatPoints += 3;
        playLevelUpSound();
      }

      // Check quest advancement
      let updatedQuest = prev.activeQuest ? { ...prev.activeQuest } : null;
      if (updatedQuest && !updatedQuest.isCompleted) {
        const activeDef = BLOX_QUESTS.find((q) => q.id === updatedQuest?.questId);
        let matches = false;
        if (activeDef?.targetType === 'bandit' && enemyType === 'bandit') matches = true;
        if (activeDef?.targetType === 'baboon' && enemyType === 'baboon') matches = true;
        if (activeDef?.targetType === 'marine' && enemyType === 'marine') matches = true;
        if (activeDef?.targetType === 'desert' && enemyType === 'desert') matches = true;
        if (activeDef?.targetType === 'sky' && enemyType === 'sky') matches = true;
        if (activeDef?.targetType === 'boss' && isBoss) matches = true;

        if (matches) {
          const nextCount = updatedQuest.currentCount + 1;
          const isDone = nextCount >= updatedQuest.requiredCount;
          updatedQuest.currentCount = nextCount;
          updatedQuest.isCompleted = isDone;

          if (isDone) {
            showNotification(`🎉 Tapos na ang Quest: ${activeDef?.title}! I-claim ang premyo!`);
          }
        }
      }

      return {
        ...prev,
        level: curLvl,
        exp: curExp,
        maxExp,
        bounty: prev.bounty + (isBoss ? 25000 : 0),
        statPoints: newStatPoints,
        activeQuest: updatedQuest,
      };
    });
  };

  // Callback when star chest is opened in 3D world
  const handleChestCollected = (rewardStars: number) => {
    playStarSound();
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    onAwardStars(rewardStars);
    setChestsOpened((prev) => prev + 1);

    // Check chest quest progress
    setPlayer((prev) => {
      if (prev.activeQuest && !prev.activeQuest.isCompleted) {
        const qDef = BLOX_QUESTS.find((q) => q.id === prev.activeQuest?.questId);
        if (qDef?.targetType === 'chest') {
          const nextCount = prev.activeQuest.currentCount + 1;
          const isDone = nextCount >= prev.activeQuest.requiredCount;
          return {
            ...prev,
            activeQuest: {
              ...prev.activeQuest,
              currentCount: nextCount,
              isCompleted: isDone,
            },
          };
        }
      }
      return prev;
    });

    showNotification(`📦 Nabuksan ang Kaban! Nakakuha ng +${rewardStars} ⭐ Bituin!`);
  };

  // Callback when approaching chest: open random curriculum quiz modal filtered by Grade & Subject
  const handleOpenChestQuiz = async (chestId: string, rewardStars: number) => {
    if (activeModal !== 'none') return;
    setPendingChestId(chestId);
    setPendingChestReward(rewardStars);
    setSelectedQuizOption(null);
    setQuizFeedback('none');
    setIsLoadingQuestion(true);
    setActiveChestQuestion(null);
    setActiveModal('chestQuiz');
    try {
      const question = await getNonRepeatingDepEdQuestion(
        selectedQuizGrade,
        selectedQuizSubject,
        customQuizTopic.trim() || undefined
      );
      setActiveChestQuestion(question);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  // Change question grade category
  const handleSelectQuizGrade = async (grade: GradeLevel | 'all') => {
    setSelectedQuizGrade(grade);
    setPlayer((prev) => ({ ...prev, selectedGrade: grade }));
    setSelectedQuizOption(null);
    setQuizFeedback('none');
    setIsLoadingQuestion(true);
    try {
      const nextQ = await getNonRepeatingDepEdQuestion(
        grade,
        selectedQuizSubject,
        customQuizTopic.trim() || undefined
      );
      setActiveChestQuestion(nextQ);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  // Change question subject category
  const handleSelectQuizSubject = async (subject: QuizSubject | 'all') => {
    setSelectedQuizSubject(subject);
    setSelectedQuizOption(null);
    setQuizFeedback('none');
    setIsLoadingQuestion(true);
    try {
      const nextQ = await getNonRepeatingDepEdQuestion(
        selectedQuizGrade,
        subject,
        customQuizTopic.trim() || undefined
      );
      setActiveChestQuestion(nextQ);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  // Change question if student wants a different question
  const handleRetryQuizQuestion = async () => {
    setSelectedQuizOption(null);
    setQuizFeedback('none');
    setIsLoadingQuestion(true);
    try {
      const nextQ = await getNonRepeatingDepEdQuestion(
        selectedQuizGrade,
        selectedQuizSubject,
        customQuizTopic.trim() || undefined
      );
      setActiveChestQuestion(nextQ);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  // Apply typed custom subject matter from Type Bar
  const handleApplyCustomTopic = async (topicToApply?: string) => {
    const target = (topicToApply !== undefined ? topicToApply : typedCustomTopicInput).trim();
    setCustomQuizTopic(target);
    setTypedCustomTopicInput(target);
    setSelectedQuizOption(null);
    setQuizFeedback('none');
    setIsLoadingQuestion(true);
    try {
      const nextQ = await getNonRepeatingDepEdQuestion(
        selectedQuizGrade,
        selectedQuizSubject,
        target || undefined
      );
      setActiveChestQuestion(nextQ);
      if (target) {
        showNotification(`🎯 Paksa ng AI: "${target}". Nakabuo ng natatanging tanong!`);
      } else {
        showNotification('🔄 Ibinalik sa random na kurikulum ng DepEd!');
      }
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  // Clear custom topic and restore full random DepEd curriculum
  const handleClearCustomTopic = async () => {
    setCustomQuizTopic('');
    setTypedCustomTopicInput('');
    setSelectedQuizOption(null);
    setQuizFeedback('none');
    setIsLoadingQuestion(true);
    try {
      const nextQ = await getNonRepeatingDepEdQuestion(
        selectedQuizGrade,
        selectedQuizSubject,
        undefined
      );
      setActiveChestQuestion(nextQ);
      showNotification('🔄 Inalis ang custom na paksa. Random DepEd curriculum aktibo.');
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  // Answer current chest quiz question
  const handleAnswerQuiz = (selectedIdx: number) => {
    if (!activeChestQuestion || quizFeedback === 'correct') return;
    setSelectedQuizOption(selectedIdx);
    const isCorrect = selectedIdx === activeChestQuestion.correctIndex;
    if (isCorrect) {
      setQuizFeedback('correct');
      playSuccessFanfare();
      confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
      const totalPrize = pendingChestReward + activeChestQuestion.bonusStars;
      onAwardStars(totalPrize);
      setChestsOpened((prev) => prev + 1);

      // Notify 3D world that chest was unlocked so it disappears/opens
      if (pendingChestId) {
        setOpenedChestTrigger({ id: pendingChestId, time: Date.now() });
      }

      // Progress active chest quest if any
      setPlayer((prev) => {
        if (prev.activeQuest && !prev.activeQuest.isCompleted) {
          const qDef = BLOX_QUESTS.find((q) => q.id === prev.activeQuest?.questId);
          if (qDef?.targetType === 'chest') {
            const nextCount = prev.activeQuest.currentCount + 1;
            const isDone = nextCount >= prev.activeQuest.requiredCount;
            return {
              ...prev,
              activeQuest: {
                ...prev.activeQuest,
                currentCount: nextCount,
                isCompleted: isDone,
              },
            };
          }
        }
        return prev;
      });

      showNotification(`🎉 Tumpak! Nabuksan ang Kaban: +${totalPrize} ⭐ Bituin!`);

      setTimeout(() => {
        setActiveModal('none');
        setPendingChestId(null);
        setSelectedQuizOption(null);
        setQuizFeedback('none');
      }, 2200);
    } else {
      setQuizFeedback('wrong');
      playTryAgainSound();
      showNotification('Maling sagot! Subukan muli o magpalit ng katanungan.');
    }
  };

  // Open Quiz Bank directly from HUD for DepEd BOW Question Practice
  const handleOpenPracticeQuiz = async (preferredGrade?: GradeLevel | 'all') => {
    const targetGrade = preferredGrade !== undefined ? preferredGrade : selectedQuizGrade;
    if (preferredGrade !== undefined) {
      setSelectedQuizGrade(preferredGrade);
      setPlayer((prev) => ({ ...prev, selectedGrade: preferredGrade }));
    }
    setPendingChestId(null);
    setPendingChestReward(60);
    setSelectedQuizOption(null);
    setQuizFeedback('none');
    setIsLoadingQuestion(true);
    setActiveModal('chestQuiz');
    try {
      const nextQ = await getNonRepeatingDepEdQuestion(
        targetGrade,
        selectedQuizSubject,
        customQuizTopic.trim() || undefined
      );
      setActiveChestQuestion(nextQ);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  // Virtual Movement Joystick Pointer Handlers for Phone & Touch
  const handleJoystickPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isGamePaused) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    joystickPointerIdRef.current = e.pointerId;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    joystickCenterRef.current = { x: centerX, y: centerY };

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    updateJoystickPosition(dx, dy);
    setJoystickActive(true);
  };

  const handleJoystickPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isGamePaused || joystickPointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();

    const dx = e.clientX - joystickCenterRef.current.x;
    const dy = e.clientY - joystickCenterRef.current.y;
    updateJoystickPosition(dx, dy);
  };

  const handleJoystickPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (joystickPointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    joystickPointerIdRef.current = null;
    setJoystickActive(false);
    setJoystickKnob({ x: 0, y: 0 });
    setMovementInput((prev) => ({ ...prev, forward: 0, strafe: 0 }));
  };

  const updateJoystickPosition = (dx: number, dy: number) => {
    const maxRadius = 38;
    const dist = Math.hypot(dx, dy);
    let clampedX = dx;
    let clampedY = dy;
    if (dist > maxRadius) {
      clampedX = (dx / dist) * maxRadius;
      clampedY = (dy / dist) * maxRadius;
    }
    setJoystickKnob({ x: Math.round(clampedX), y: Math.round(clampedY) });

    if (dist < 6) {
      setMovementInput((prev) => (prev.forward === 0 && prev.strafe === 0 ? prev : { ...prev, forward: 0, strafe: 0 }));
      return;
    }

    const normX = clampedX / maxRadius;
    const normY = clampedY / maxRadius;
    const nextForward = -Number(normY.toFixed(2));
    const nextStrafe = Number(normX.toFixed(2));

    setMovementInput((prev) => {
      if (Math.abs(prev.forward - nextForward) < 0.05 && Math.abs(prev.strafe - nextStrafe) < 0.05) {
        return prev;
      }
      return {
        ...prev,
        forward: nextForward,
        strafe: nextStrafe,
      };
    });
  };

  // Movement D-Pad Handlers for Mobile & Desktop Touch
  const handleDpadPress = (
    e: React.TouchEvent | React.MouseEvent | React.PointerEvent,
    direction: 'up' | 'down' | 'left' | 'right'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (direction === 'up') setMovementInput((prev) => ({ ...prev, forward: 1 }));
    if (direction === 'down') setMovementInput((prev) => ({ ...prev, forward: -1 }));
    if (direction === 'left') setMovementInput((prev) => ({ ...prev, strafe: -1 }));
    if (direction === 'right') setMovementInput((prev) => ({ ...prev, strafe: 1 }));
  };

  const handleDpadRelease = (
    e: React.TouchEvent | React.MouseEvent | React.PointerEvent,
    axis: 'forward' | 'strafe'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (axis === 'forward') setMovementInput((prev) => ({ ...prev, forward: 0 }));
    if (axis === 'strafe') setMovementInput((prev) => ({ ...prev, strafe: 0 }));
  };

  // Callback when floating star coin is picked up in 3D world
  const handleCoinCollected = (starsReward: number) => {
    onAwardStars(starsReward);
    setCoinsFound((prev) => prev + 1);

    // Check coin quest progress
    setPlayer((prev) => {
      if (prev.activeQuest && !prev.activeQuest.isCompleted) {
        const qDef = BLOX_QUESTS.find((q) => q.id === prev.activeQuest?.questId);
        if (qDef?.targetType === 'coin') {
          const nextCount = prev.activeQuest.currentCount + 1;
          const isDone = nextCount >= prev.activeQuest.requiredCount;
          return {
            ...prev,
            activeQuest: {
              ...prev.activeQuest,
              currentCount: nextCount,
              isCompleted: isDone,
            },
          };
        }
      }
      return prev;
    });

    showNotification(`⭐ Nakuha ang Bituin na Barya! +${starsReward} ⭐`);
  };

  // Trigger Player Death and open 5-question Respawn Quiz
  const isDyingRef = useRef<boolean>(false);

  const handlePlayerDeath = async () => {
    if (isDyingRef.current || isDead) return;
    isDyingRef.current = true;
    setIsDead(true);
    setRespawnCorrectCount(0);
    setRespawnFeedback('none');
    setSelectedRespawnOption(null);
    setCurrentRespawnQuestion(null);
    playExplosionSound();
    setActiveModal('respawnQuiz');
    showNotification('💀 Natalo ka sa laban! Bumabuo ang Groq AI ng 5 natatanging katanungan mula sa DepEd upang muling mabuhay!');

    const targetGrade = respawnQuizGrade !== 'all' ? respawnQuizGrade : (selectedQuizGrade !== 'all' ? selectedQuizGrade : 'all');
    setIsRespawnLoading(true);

    try {
      // Fetch a 5-question multi-subject battery via Groq AI
      const batch = await getRespawnQuestionsSet(
        targetGrade,
        5,
        respawnQuizTopic.trim() || undefined,
        respawnQuizLanguage
      );
      setRespawnQuestionsBatch(batch);
      if (batch.length > 0) {
        setCurrentRespawnQuestion(batch[0]);
      } else {
        const fallback = await getNonRepeatingDepEdQuestion(
          targetGrade,
          'all',
          respawnQuizTopic.trim() || undefined,
          respawnQuizLanguage
        );
        setCurrentRespawnQuestion(fallback);
      }
    } catch (err) {
      console.warn('Respawn batch fetch fallback:', err);
      const fallback = await getNonRepeatingDepEdQuestion(
        targetGrade,
        'all',
        undefined,
        respawnQuizLanguage
      );
      setCurrentRespawnQuestion(fallback);
    } finally {
      setIsRespawnLoading(false);
    }
  };

  // Respawn Quiz Custom Topic Handlers
  const handleApplyRespawnCustomTopic = async (topicToApply?: string) => {
    const raw = topicToApply !== undefined ? topicToApply : typedRespawnTopicInput;
    const finalTopic = raw.trim();
    setRespawnQuizTopic(finalTopic);
    setTypedRespawnTopicInput(finalTopic);
    setIsRespawnLoading(true);
    setSelectedRespawnOption(null);
    setRespawnFeedback('none');

    try {
      const targetGrade = respawnQuizGrade !== 'all' ? respawnQuizGrade : 'all';
      const batch = await getRespawnQuestionsSet(
        targetGrade,
        5,
        finalTopic || undefined,
        respawnQuizLanguage
      );
      setRespawnQuestionsBatch(batch);
      if (batch.length > 0) {
        setCurrentRespawnQuestion(batch[0]);
      } else {
        const nextQ = await getNonRepeatingDepEdQuestion(
          targetGrade,
          'all',
          finalTopic || undefined,
          respawnQuizLanguage
        );
        setCurrentRespawnQuestion(nextQ);
      }
      if (finalTopic) {
        showNotification(`🎯 Paksa para sa Respawn Quiz: "${finalTopic}"`);
      } else {
        showNotification('🔄 Pinalitan ang katanungan para sa muling pagkabuhay!');
      }
    } catch {
      const targetGrade = respawnQuizGrade !== 'all' ? respawnQuizGrade : 'all';
      const fallbackQ = await getNonRepeatingDepEdQuestion(
        targetGrade,
        'all',
        finalTopic || undefined,
        respawnQuizLanguage
      );
      setCurrentRespawnQuestion(fallbackQ);
    } finally {
      setIsRespawnLoading(false);
    }
  };

  const handleClearRespawnCustomTopic = async () => {
    setRespawnQuizTopic('');
    setTypedRespawnTopicInput('');
    setIsRespawnLoading(true);
    setSelectedRespawnOption(null);
    setRespawnFeedback('none');

    try {
      const targetGrade = respawnQuizGrade !== 'all' ? respawnQuizGrade : 'all';
      const batch = await getRespawnQuestionsSet(
        targetGrade,
        5,
        undefined,
        respawnQuizLanguage
      );
      setRespawnQuestionsBatch(batch);
      if (batch.length > 0) {
        setCurrentRespawnQuestion(batch[0]);
      }
      showNotification('✨ Pangkalahatang Kurikulum ng DepEd naipanumbalik!');
    } catch {
      const targetGrade = respawnQuizGrade !== 'all' ? respawnQuizGrade : 'all';
      const fallbackQ = await getNonRepeatingDepEdQuestion(targetGrade, 'all', undefined, respawnQuizLanguage);
      setCurrentRespawnQuestion(fallbackQ);
    } finally {
      setIsRespawnLoading(false);
    }
  };

  const handleSelectRespawnGrade = async (grade: GradeLevel | 'all') => {
    setRespawnQuizGrade(grade);
    setIsRespawnLoading(true);
    setSelectedRespawnOption(null);
    setRespawnFeedback('none');

    try {
      const batch = await getRespawnQuestionsSet(
        grade,
        5,
        respawnQuizTopic.trim() || undefined,
        respawnQuizLanguage
      );
      setRespawnQuestionsBatch(batch);
      if (batch.length > 0) {
        setCurrentRespawnQuestion(batch[0]);
      }
      showNotification(grade === 'all' ? '📚 Lahat ng Baitang napili para sa Respawn' : `📖 Baitang ${grade} napili para sa Respawn!`);
    } catch {
      const fallbackQ = await getNonRepeatingDepEdQuestion(
        grade,
        'all',
        respawnQuizTopic.trim() || undefined,
        respawnQuizLanguage
      );
      setCurrentRespawnQuestion(fallbackQ);
    } finally {
      setIsRespawnLoading(false);
    }
  };

  const handleSelectRespawnLanguage = async (lang: 'all' | 'filipino' | 'english') => {
    setRespawnQuizLanguage(lang);
    setIsRespawnLoading(true);
    setSelectedRespawnOption(null);
    setRespawnFeedback('none');

    try {
      const batch = await getRespawnQuestionsSet(
        respawnQuizGrade,
        5,
        respawnQuizTopic.trim() || undefined,
        lang
      );
      setRespawnQuestionsBatch(batch);
      if (batch.length > 0) {
        setCurrentRespawnQuestion(batch[0]);
      }
      showNotification(
        lang === 'filipino'
          ? '🇵🇭 Wikang Filipino napili para sa Respawn Quiz!'
          : lang === 'english'
          ? '🇺🇸 English language selected for Respawn Quiz!'
          : '🌐 DepEd Curriculum (Auto / Lahat) napili!'
      );
    } catch {
      const fallbackQ = await getNonRepeatingDepEdQuestion(
        respawnQuizGrade,
        'all',
        respawnQuizTopic.trim() || undefined,
        lang
      );
      setCurrentRespawnQuestion(fallbackQ);
    } finally {
      setIsRespawnLoading(false);
    }
  };

  // Re-roll current respawn question with Groq AI on demand
  const handleRerollRespawnQuestion = async () => {
    setIsRespawnLoading(true);
    setSelectedRespawnOption(null);
    setRespawnFeedback('none');
    try {
      const targetGrade = respawnQuizGrade !== 'all' ? respawnQuizGrade : (selectedQuizGrade !== 'all' ? selectedQuizGrade : 'all');
      const nextQ = await getNonRepeatingDepEdQuestion(
        targetGrade,
        'all',
        respawnQuizTopic.trim() || undefined,
        respawnQuizLanguage
      );
      setCurrentRespawnQuestion(nextQ);
      showNotification('✨ Bagong natatanging tanong nabuo gamit ang Groq AI!');
    } catch {
      // ignore
    } finally {
      setIsRespawnLoading(false);
    }
  };

  // Damage taken from 3D enemy, boss, or seawater
  const handleDamageTaken = (dmg: number) => {
    if (isDead || isDyingRef.current) return;
    const reducedDmg = hakiActive ? Math.round(dmg * 0.75) : dmg;
    setPlayerHp((prev) => {
      const next = Math.max(0, prev - reducedDmg);
      if (next <= 0 && !isDyingRef.current) {
        setTimeout(() => handlePlayerDeath(), 0);
        return 0;
      }
      return next;
    });
  };

  // Handle answering questions during the 5-question Respawn Quiz
  const handleAnswerRespawnQuestion = (optionIdx: number) => {
    if (!currentRespawnQuestion || respawnFeedback !== 'none') return;
    setSelectedRespawnOption(optionIdx);

    const isCorrect = optionIdx === currentRespawnQuestion.correctIndex;
    if (isCorrect) {
      playStarSound();
      const newCount = respawnCorrectCount + 1;
      setRespawnCorrectCount(newCount);
      setRespawnFeedback('correct');

      if (newCount >= 5) {
        playBattleVictorySound();
        playSuccessFanfare();
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.5 },
        });
      }
    } else {
      playTryAgainSound();
      setRespawnFeedback('wrong');
    }
  };

  // Next question or complete revival when 5 correct answers achieved
  const handleNextRespawnQuestion = async () => {
    if (respawnCorrectCount >= 5) {
      // Execute Player Respawn & Revival!
      isDyingRef.current = false;
      setPlayerHp(maxPlayerHp);
      setPlayerEnergy(maxPlayerEnergy);
      setIsDead(false);
      setActiveModal('none');
      setRespawnCorrectCount(0);
      setRespawnFeedback('none');
      setSelectedRespawnOption(null);
      setCurrentRespawnQuestion(null);
      setRespawnQuestionsBatch([]);
      // Teleport safely to Starter Pirate Village town square
      setTeleportTarget({ x: 0, z: 20, name: `Respawn-${Date.now()}` });
      showNotification('🛡️ Matagumpay kang muling nabuhay sa Bayan ng Pirata! +50 ⭐ Bonus Bituin!');
      onAwardStars(50);
      return;
    }

    // Pick next distinct question from pre-fetched multi-subject battery
    setSelectedRespawnOption(null);
    setRespawnFeedback('none');
    const nextIdx = respawnCorrectCount;
    if (respawnQuestionsBatch.length > nextIdx) {
      setCurrentRespawnQuestion(respawnQuestionsBatch[nextIdx]);
    } else {
      setIsRespawnLoading(true);
      try {
        const nextQ = await getNonRepeatingDepEdQuestion(
          respawnQuizGrade !== 'all' ? respawnQuizGrade : (selectedQuizGrade !== 'all' ? selectedQuizGrade : 'all'),
          'all',
          respawnQuizTopic.trim() || undefined,
          respawnQuizLanguage
        );
        setCurrentRespawnQuestion(nextQ);
      } finally {
        setIsRespawnLoading(false);
      }
    }
  };

  // Accept a Quest
  const handleAcceptQuest = (quest: BloxQuest) => {
    setPlayer((prev) => ({
      ...prev,
      activeQuest: {
        questId: quest.id,
        currentCount: 0,
        requiredCount: quest.requiredCount,
        isCompleted: false,
      },
    }));
    playSuccessFanfare();
    showNotification(`Tinanggap ang Quest: ${quest.title}!`);
    setActiveModal('none');
  };

  // Claim Completed Quest Reward
  const handleClaimQuestReward = () => {
    if (!player.activeQuest || !player.activeQuest.isCompleted) return;
    const qDef = BLOX_QUESTS.find((q) => q.id === player.activeQuest?.questId);
    if (!qDef) return;

    onAwardStars(qDef.rewardStars);
    playLevelUpSound();
    confetti({ particleCount: 100, spread: 75 });

    setPlayer((prev) => {
      let curExp = prev.exp + qDef.rewardExp;
      let curLvl = prev.level;
      let maxExp = prev.maxExp;
      let newStatPoints = prev.statPoints;

      while (curExp >= maxExp) {
        curExp -= maxExp;
        curLvl += 1;
        maxExp = Math.round(maxExp * 1.35);
        newStatPoints += 3;
      }

      return {
        ...prev,
        level: curLvl,
        exp: curExp,
        maxExp,
        bounty: prev.bounty + qDef.rewardBounty,
        statPoints: newStatPoints,
        activeQuest: null, // cleared
      };
    });

    showNotification(
      `🏆 Nakamit ang Premyo ng Quest! +${qDef.rewardStars} ⭐ Bituin, +${qDef.rewardExp} EXP, +฿${qDef.rewardBounty.toLocaleString()} Bounty!`
    );
  };

  // Fast Travel / Sail to Island
  const handleSailToIsland = (target: { x: number; z: number; name: string }) => {
    setTeleportTarget({ ...target, name: `${target.name}-${Date.now()}` });
    playSuccessFanfare();
    setActiveModal('none');
    showNotification(`Nakarating sa ${target.name}!`);
  };

  // Gacha Fruit Dealer Roll (25 Stars)
  const handleRollFruit = () => {
    if (activeStudent.stars < FRUIT_ROLL_COST || isRolling) {
      playTryAgainSound();
      return;
    }

    onAwardStars(-FRUIT_ROLL_COST);
    setIsRolling(true);
    setRolledFruit(null);

    setTimeout(() => {
      const selected = rollRandomBloxFruit();
      setRolledFruit(selected);
      setIsRolling(false);
      playSuccessFanfare();
      confetti({ particleCount: 85, spread: 70 });

      const alreadyOwned = player.ownedFruits.includes(selected.id);
      const prizeReward = alreadyOwned
        ? DUPLICATE_FRUIT_CASH_PRIZE
        : FRUIT_PRIZES[selected.rarity] || 50;

      // Award the fruit star prize to the student!
      onAwardStars(prizeReward);

      setPlayer((prev) => {
        return {
          ...prev,
          ownedFruits: alreadyOwned ? prev.ownedFruits : [...prev.ownedFruits, selected.id],
          equippedFruitId: selected.id,
        };
      });

      if (alreadyOwned) {
        showNotification(
          `🎁 Mayroon ka nang ${selected.name}! Nakakuha ng Cashback Prize na +${DUPLICATE_FRUIT_CASH_PRIZE} ⭐ Bituin!`
        );
      } else {
        showNotification(
          `🌟 Nakuha mo ang ${selected.name} (${selected.rarity.toUpperCase()})! Nanalo ng Grand Prize na +${prizeReward} ⭐ Bituin!`
        );
      }
    }, 1800);
  };

  // Buy Specific Fruit
  const handleBuyFruit = (fruit: BloxFruit) => {
    if (activeStudent.stars < fruit.priceStars) {
      playTryAgainSound();
      return;
    }
    if (player.ownedFruits.includes(fruit.id)) {
      setPlayer((prev) => ({ ...prev, equippedFruitId: fruit.id }));
      return;
    }

    onAwardStars(-fruit.priceStars);
    setPlayer((prev) => ({
      ...prev,
      ownedFruits: [...prev.ownedFruits, fruit.id],
      equippedFruitId: fruit.id,
    }));
    playSuccessFanfare();
    confetti({ particleCount: 60, spread: 50 });
    showNotification(`Nabili ang ${fruit.name}!`);
  };

  // Buy Sword
  const handleBuySword = (sword: BloxSword) => {
    if (activeStudent.stars < sword.priceStars && !player.ownedSwords.includes(sword.id)) {
      playTryAgainSound();
      return;
    }
    if (player.ownedSwords.includes(sword.id)) {
      setPlayer((prev) => ({ ...prev, equippedSwordId: sword.id }));
      return;
    }

    onAwardStars(-sword.priceStars);
    setPlayer((prev) => ({
      ...prev,
      ownedSwords: [...prev.ownedSwords, sword.id],
      equippedSwordId: sword.id,
    }));
    playSuccessFanfare();
    showNotification(`Nabili ang ${sword.name}!`);
  };

  // Buy Accessory
  const handleBuyAccessory = (acc: BloxAccessory) => {
    if (
      activeStudent.stars < acc.priceStars &&
      !player.ownedAccessories.includes(acc.id)
    ) {
      playTryAgainSound();
      return;
    }
    if (player.ownedAccessories.includes(acc.id)) {
      setPlayer((prev) => ({ ...prev, equippedAccessoryId: acc.id }));
      return;
    }

    onAwardStars(-acc.priceStars);
    setPlayer((prev) => ({
      ...prev,
      ownedAccessories: [...prev.ownedAccessories, acc.id],
      equippedAccessoryId: acc.id,
    }));
    playSuccessFanfare();
    showNotification(`Nabili ang ${acc.name}!`);
  };

  // Allocate Stat Points
  const handleAllocateStat = (stat: 'melee' | 'defense' | 'sword' | 'bloxFruit') => {
    if (player.statPoints <= 0) return;
    setPlayer((prev) => ({
      ...prev,
      statPoints: prev.statPoints - 1,
      stats: {
        ...prev.stats,
        [stat]: prev.stats[stat] + 1,
      },
    }));
  };

  const activeQuestDef = player.activeQuest
    ? BLOX_QUESTS.find((q) => q.id === player.activeQuest?.questId)
    : null;

  return (
    <div className="relative w-full h-full flex-1 min-h-0 bg-slate-950 overflow-hidden select-none font-sans touch-none">
      
      {/* ========================================================= */}
      {/* 1. THREE.JS 3D ROBLOX BLOX FRUITS MMORPG WORLD */}
      {/* ========================================================= */}
      <div className="absolute inset-0 z-0">
        <BloxFruitsWorld3D
          equippedFruit={equippedFruit}
          equippedSword={equippedSword}
          equippedAccessory={equippedAccessory}
          playerLevel={player.level}
          playerStats={player.stats}
          hakiActive={hakiActive}
          playerGender={player.gender || 'boy'}
          onOpenChestQuiz={handleOpenChestQuiz}
          openedChestTrigger={openedChestTrigger}
          onEnemyDefeated={handleEnemyDefeated}
          onChestCollected={handleChestCollected}
          onCoinCollected={handleCoinCollected}
          onOpenShop={(type) => setActiveModal(type as any)}
          onOpenStats={() => setActiveModal('stats')}
          onDamageTaken={handleDamageTaken}
          onRequestAttack={(type, skill) => handleTriggerAttack(type, skill)}
          attackTrigger={attackTrigger}
          dashTrigger={dashTrigger}
          hakiToggleTrigger={hakiToggleTrigger}
          teleportTarget={teleportTarget}
          movementInput={movementInput}
          isPaused={isGamePaused}
          smoothMode={smoothMode}
        />
      </div>

      {/* ========================================================= */}
      {/* 2. TOP FLOATING MMORPG HUD (Optimized for Phone & Desktop) */}
      {/* ========================================================= */}
      <div className="absolute top-1 sm:top-2 left-1 sm:left-2 right-1 sm:right-2 z-20 pointer-events-none flex items-center justify-between gap-1 sm:gap-2">
        
        {/* Left: LEGO Brick Player Profile & Health/Energy Status */}
        <div className="pointer-events-auto bg-red-600 border-2 border-yellow-300 rounded-2xl p-1 sm:p-1.5 shadow-[0_4px_0_0_#991b1b] flex flex-col gap-0.5 shrink-0 select-none">
          {/* Top Studs on Player Profile Brick */}
          <div className="flex items-center justify-around px-1 py-0.5 bg-black/20 rounded-t-lg">
            <LegoStud size="xs" color="bg-yellow-300/40" />
            <LegoStud size="xs" color="bg-yellow-300/40" />
            <LegoStud size="xs" color="bg-yellow-300/40" />
            <LegoStud size="xs" color="bg-yellow-300/40" />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-yellow-400 border-2 border-yellow-200 flex items-center justify-center text-sm sm:text-lg shadow-inner shrink-0 text-slate-950 font-black">
              {player.gender === 'girl' ? '👧' : '🏴‍☠️'}
            </div>

            <div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-black text-[10px] sm:text-xs text-yellow-300 truncate max-w-[65px] sm:max-w-[120px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                  {activeStudent.name}
                </span>
                <span className="bg-yellow-400 text-slate-950 text-[7.5px] sm:text-[8.5px] font-black px-1.5 py-0.2 rounded shadow-[0_1.5px_0_0_#ca8a04] uppercase">
                  L{player.level}
                </span>
                <button
                  onClick={() => {
                    const nextGender = player.gender === 'girl' ? 'boy' : 'girl';
                    setPlayer((prev) => ({ ...prev, gender: nextGender }));
                    showNotification(
                      `Pinalitan ang avatar: ${nextGender === 'girl' ? '👧 LEGO Piratang Babae' : '👦 LEGO Piratang Lalaki'}!`
                    );
                  }}
                  className={`text-[7.5px] sm:text-[8.5px] font-black px-1.5 py-0.2 rounded cursor-pointer transition-all border shadow-[0_2px_0_0_rgba(0,0,0,0.4)] active:translate-y-0.5 ${
                    player.gender === 'girl'
                      ? 'bg-pink-500 hover:bg-pink-400 border-pink-200 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 border-blue-200 text-white'
                  }`}
                  title="Palitan ang kasarian ng Minifigure (Lalaki / Babae)"
                >
                  {player.gender === 'girl' ? '👧' : '👦'}
                </button>
                {hakiActive && (
                  <span className="bg-purple-900 border border-purple-300 text-purple-200 text-[7px] font-black px-1 rounded shadow-xs animate-pulse">
                    HAKI
                  </span>
                )}
              </div>

              {/* Segmented LEGO Health & Energy Bars */}
              <div className="w-16 sm:w-36 mt-0.5 space-y-0.5">
                <LegoBrickBar
                  current={playerHp}
                  max={maxPlayerHp}
                  color="green"
                  height="h-1.5 sm:h-2"
                  segments={8}
                />
                <LegoBrickBar
                  current={playerEnergy}
                  max={maxPlayerEnergy}
                  color="cyan"
                  height="h-1 sm:h-1.5"
                  segments={8}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Quest Tracker or Notification or Pause Status */}
        {isGamePaused && activeModal !== 'respawnQuiz' ? (
          <div className="pointer-events-auto bg-yellow-400 text-slate-950 font-black text-[9px] sm:text-xs px-3 py-1 rounded-xl shadow-[0_3px_0_0_#ca8a04] border-2 border-yellow-200 flex items-center gap-1.5 animate-pulse shrink-0">
            <span>⏸️</span>
            <span>NAKA-PAUSE (LEGO Pagsusulit)</span>
          </div>
        ) : player.activeQuest && activeQuestDef ? (
          <div className="hidden lg:flex pointer-events-auto bg-slate-950/90 backdrop-blur-md border-2 border-amber-400 text-amber-200 text-xs font-bold px-3 py-1 rounded-xl shadow-[0_4px_0_0_#b45309] items-center gap-2 shrink-0">
            <Scroll className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-white font-black truncate block">
                {activeQuestDef.title} ({player.activeQuest.currentCount}/{player.activeQuest.requiredCount})
              </span>
              <span className="text-[9px] text-amber-300 block">
                Premyo: +{activeQuestDef.rewardStars} ⭐ Bituin • +{activeQuestDef.rewardExp} EXP
              </span>
            </div>

            {player.activeQuest.isCompleted && (
              <button
                onClick={handleClaimQuestReward}
                className="ml-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 border border-emerald-300 text-white font-black text-[10px] rounded-lg cursor-pointer animate-bounce shadow-[0_3px_0_0_#065f46] active:translate-y-0.5 flex items-center gap-1 shrink-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>I-claim!</span>
              </button>
            )}
          </div>
        ) : notification ? (
          <div className="hidden xl:flex pointer-events-auto bg-slate-950/90 backdrop-blur-md border-2 border-amber-400 text-amber-200 text-xs font-bold px-3 py-1.5 rounded-xl shadow-[0_3px_0_0_#b45309] items-center gap-1.5 animate-fade-in shrink-0">
            <span>📢</span>
            <span className="truncate max-w-[280px]">{notification}</span>
          </div>
        ) : null}

        {/* Right: Stars Currency & Tactile 3D LEGO Menu Buttons */}
        <div className="pointer-events-auto flex items-center gap-1 ml-auto shrink-0">
          
          {/* Shared Stars Currency Counter on LEGO Yellow Tile */}
          <div className="bg-yellow-400 border-2 border-yellow-200 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl shadow-[0_3px_0_0_#ca8a04] flex items-center gap-1 shrink-0 select-none">
            <span className="text-[12px] sm:text-base animate-pulse">⭐</span>
            <div>
              <span className="text-[11px] sm:text-xs font-black text-slate-950 font-mono leading-none block">
                {activeStudent.stars}
              </span>
            </div>
          </div>

          {/* Quick Menu Icons (Tactile 3D LEGO Bricks with Studs) */}
          <div className="bg-slate-950/95 backdrop-blur-md p-1 rounded-xl border-2 border-slate-700/80 flex items-center gap-1 shadow-2xl shrink-0">
            <button
              onClick={() => setActiveModal('quests')}
              className="p-1 sm:p-1.5 bg-amber-600 hover:bg-amber-500 border border-amber-300 text-white rounded-lg text-xs font-black shadow-[0_3px_0_0_#92400e] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer relative"
              title="Quests (📜)"
            >
              <Scroll className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-sm" />
              {player.activeQuest?.isCompleted && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveModal('map')}
              className="p-1 sm:p-1.5 bg-sky-600 hover:bg-sky-500 border border-sky-300 text-white rounded-lg text-xs font-black shadow-[0_3px_0_0_#0369a1] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title="Mapa (🗺️)"
            >
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-sm" />
            </button>

            <button
              onClick={() => setActiveModal('dealer')}
              className="p-1 sm:p-1.5 bg-purple-600 hover:bg-purple-500 border border-purple-300 text-white rounded-lg text-xs font-black shadow-[0_3px_0_0_#581c87] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title="Fruit Dealer (🍇)"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-sm" />
            </button>

            <button
              onClick={() => {
                setInspectFruitId(player.equippedFruitId);
                setActiveModal('skills');
              }}
              className="p-1 sm:p-1.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-300 text-white rounded-lg text-xs font-black shadow-[0_3px_0_0_#3730a3] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title="Aklat ng mga Kasanayan (Skill Details & Mastery 📜)"
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-sm" />
            </button>

            <button
              onClick={() => setActiveModal('blacksmith')}
              className="p-1 sm:p-1.5 bg-red-600 hover:bg-red-500 border border-red-300 text-white rounded-lg text-xs font-black shadow-[0_3px_0_0_#991b1b] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title="Armory (⚔️)"
            >
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-sm" />
            </button>

            <button
              onClick={() => setActiveModal('accessories')}
              className="p-1 sm:p-1.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-300 text-white rounded-lg text-xs font-black shadow-[0_3px_0_0_#065f46] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title="Aksesorya (🛡️)"
            >
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-sm" />
            </button>

            <button
              onClick={() => setActiveModal('stats')}
              className="p-1 sm:p-1.5 bg-blue-600 hover:bg-blue-500 border border-blue-300 text-white rounded-lg text-xs font-black shadow-[0_3px_0_0_#1e40af] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer relative"
              title="Stats (📊)"
            >
              <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-sm" />
              {player.statPoints > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping border border-black/30" />
              )}
            </button>

            <button
              onClick={() => handleOpenPracticeQuiz()}
              className="p-1 sm:p-1.5 bg-teal-600 hover:bg-teal-500 border border-teal-300 text-white rounded-lg text-xs font-black shadow-[0_3px_0_0_#115e59] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer relative"
              title="DepEd BOW Pagsusulit Baitang 1-10 (🎓)"
            >
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-sm" />
            </button>

            <button
              onClick={() => setActiveModal('help')}
              className="p-1 sm:p-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-400 text-white rounded-lg text-xs font-black shadow-[0_3px_0_0_#334155] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title="Gabay (❓)"
            >
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-sm" />
            </button>

            {/* Anti-Lag / Smooth 60FPS Performance Toggle */}
            <button
              onClick={() => {
                setSmoothMode((prev) => {
                  const next = !prev;
                  showNotification(
                    next
                      ? '⚡ Pinagana ang Smooth 60FPS Mode (Anti-lag: shadows off & 1.0x DPI)!'
                      : '✨ Pinagana ang HD Graphics Quality Mode.'
                  );
                  return next;
                });
              }}
              className={`p-1 sm:p-1.5 rounded-lg text-xs font-black transition-all cursor-pointer border active:translate-y-0.5 active:shadow-none ${
                smoothMode
                  ? 'bg-lime-600 hover:bg-lime-500 border-lime-300 text-white shadow-[0_3px_0_0_#3f6212]'
                  : 'bg-amber-700 hover:bg-amber-600 border-amber-300 text-white shadow-[0_3px_0_0_#78350f]'
              }`}
              title={
                smoothMode
                  ? '⚡ Smooth 60FPS Mode (Walang Lag: shadows off & 1.0x DPI)'
                  : '✨ HD Quality Mode (Dynamic Shadows)'
              }
            >
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-sm text-yellow-300" />
            </button>

            {/* Immersive Fullscreen Toggle */}
            <button
              onClick={handleToggleFullscreen}
              className="p-1 sm:p-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-400 text-yellow-300 rounded-lg text-xs font-black shadow-[0_3px_0_0_#334155] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title={isFullscreen ? 'I-exit ang Fullscreen' : 'I-fullscreen ang Laro'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-sm" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-sm" />
              )}
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. BOTTOM COMBAT ACTION BAR (Movement & Skills for Phone & Desktop) */}
      {/* ========================================================= */}
      <div
        className={`absolute left-1 sm:left-3 right-1 sm:right-3 z-20 pointer-events-none flex items-end justify-between select-none ${
          isCompactLandscape ? 'bottom-0.5' : isPortrait ? 'bottom-2' : 'bottom-1 sm:bottom-2'
        }`}
        style={{
          paddingBottom: isCompactLandscape
            ? 'max(env(safe-area-inset-bottom, 0px), 2px)'
            : 'max(env(safe-area-inset-bottom, 0px), 6px)',
          paddingLeft: 'max(env(safe-area-inset-left, 0px), 6px)',
          paddingRight: 'max(env(safe-area-inset-right, 0px), 6px)',
        }}
      >
        {/* Left Thumb: Movement Virtual Joystick / 4-Way D-Pad & Sprint */}
        <div className="pointer-events-auto flex flex-col items-center touch-none">
          {/* Sprint Toggle Button on LEGO Brick */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMovementInput((prev) => ({ ...prev, sprint: !prev.sprint }));
            }}
            className={`w-full mb-0.5 sm:mb-1 ${
              isCompactLandscape ? 'py-0.5 px-1.5 text-[8.5px]' : 'py-1 px-2 text-[10px] sm:text-xs'
            } font-black transition-all cursor-pointer flex items-center justify-center gap-1 border-2 shadow-[0_3px_0_0_#b45309] active:translate-y-0.5 active:shadow-none touch-none select-none rounded-xl ${
              movementInput.sprint
                ? 'bg-amber-400 text-slate-950 border-yellow-200 animate-pulse ring-2 ring-yellow-300'
                : 'bg-amber-600/90 hover:bg-amber-500 text-white border-amber-300'
            }`}
          >
            <span>⚡</span>
            <span>{movementInput.sprint ? 'Takbo ON' : 'Takbo'}</span>
          </button>

          {/* Touch Joystick / D-Pad Pad with LEGO Studs */}
          <div
            onPointerDown={handleJoystickPointerDown}
            onPointerMove={handleJoystickPointerMove}
            onPointerUp={handleJoystickPointerUp}
            onPointerCancel={handleJoystickPointerUp}
            className={`${
              isCompactLandscape ? 'w-20 h-20' : 'w-24 h-24 sm:w-28 sm:h-28'
            } rounded-full bg-slate-950/95 backdrop-blur-md border-4 border-slate-700 shadow-[0_8px_16px_rgba(0,0,0,0.85)] relative flex items-center justify-center touch-none select-none cursor-pointer`}
            style={{ touchAction: 'none' }}
          >
            {/* 4 Circular LEGO Studs on Directional Pad */}
            <div className="absolute top-1 flex flex-col items-center">
              <LegoStud size="xs" color="bg-sky-400/60" />
              <span className="text-[7.5px] font-mono font-black text-sky-300">W</span>
            </div>
            <div className="absolute left-1 flex items-center">
              <LegoStud size="xs" color="bg-sky-400/60" />
              <span className="text-[7.5px] font-mono font-black text-sky-300 ml-0.5">A</span>
            </div>
            <div className="absolute right-1 flex items-center">
              <span className="text-[7.5px] font-mono font-black text-sky-300 mr-0.5">D</span>
              <LegoStud size="xs" color="bg-sky-400/60" />
            </div>
            <div className="absolute bottom-1 flex flex-col items-center">
              <span className="text-[7.5px] font-mono font-black text-sky-300">S</span>
              <LegoStud size="xs" color="bg-sky-400/60" />
            </div>

            {/* Inner Ring */}
            <div className={`${isCompactLandscape ? 'w-10 h-10' : 'w-12 h-12'} rounded-full border-2 border-slate-700/60 pointer-events-none`} />

            {/* Dynamic Joystick LEGO Minifigure Stud Knob */}
            <div
              className={`${
                isCompactLandscape ? 'w-8 h-8' : 'w-10 h-10'
              } rounded-full transition-transform duration-75 flex flex-col items-center justify-center pointer-events-none border-2 shadow-[0_3px_0_0_#ca8a04] ${
                joystickActive
                  ? 'bg-yellow-400 border-yellow-100 scale-110 shadow-yellow-400/50'
                  : 'bg-yellow-500 border-yellow-300 text-slate-950'
              }`}
              style={{
                transform: `translate(${joystickKnob.x}px, ${joystickKnob.y}px)`,
              }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-300/80 border border-black/20 shadow-inner flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-black/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Thumb: Combat & Skills Controls */}
        {isPortrait ? (
          /* ======================================================== */
          /* PORTRAIT VIEW: Ergonomic Vertical Combat Cluster (NO CUTOFF) */
          /* ======================================================== */
          <div className="pointer-events-auto flex flex-col items-end gap-1.5 touch-none">
            {/* Utility Row: Jump, Dash, Haki (LEGO 3D Bricks) */}
            <div className="flex items-center gap-1.5 bg-slate-950/95 backdrop-blur-md p-1 rounded-xl border-2 border-slate-700/80 shadow-lg">
              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMovementInput((prev) => ({ ...prev, jump: true }));
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMovementInput((prev) => ({ ...prev, jump: false }));
                }}
                onPointerCancel={() => setMovementInput((prev) => ({ ...prev, jump: false }))}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black shadow-[0_3px_0_0_#065f46] active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-1 border border-emerald-300 touch-none select-none"
                title="Talon (Space)"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Talon</span>
              </button>

              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTriggerDash();
                }}
                className="px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-black shadow-[0_3px_0_0_#0369a1] active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-1 border border-sky-200 touch-none select-none"
                title="Flash Step (Q)"
              >
                <Wind className="w-3.5 h-3.5" />
                <span>Dash</span>
              </button>

              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleToggleHaki();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer transition-all active:translate-y-0.5 active:shadow-none border touch-none select-none shadow-[0_3px_0_0_#581c87] ${
                  hakiActive
                    ? 'bg-purple-600 border-purple-200 text-white ring-2 ring-purple-300'
                    : 'bg-purple-900/90 text-purple-200 border-purple-500/70 hover:bg-purple-800'
                }`}
                title="Armament Haki (B)"
              >
                <span>Haki</span>
              </button>
            </div>

            {/* Combat Actions Cluster: 2x2 LEGO Skills + Big Attack Button */}
            <div className="flex flex-col gap-1 bg-slate-950/95 backdrop-blur-md p-1.5 rounded-2xl border-2 border-slate-700/80 shadow-2xl touch-none">
              <div className="flex items-center justify-between px-1">
                <span className="text-[8.5px] font-black text-yellow-300 flex items-center gap-1">
                  <span>{equippedFruit.emoji}</span>
                  <span className="truncate max-w-[70px] uppercase font-sans tracking-wide">{equippedFruit.name}</span>
                </span>
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setInspectFruitId(equippedFruit.id);
                    setActiveModal('skills');
                  }}
                  className="text-[8px] font-black bg-indigo-600 hover:bg-indigo-500 text-white px-1.5 py-0.5 rounded-md border border-indigo-300 shadow-[0_2px_0_0_#3730a3] active:translate-y-0.5 flex items-center gap-0.5 cursor-pointer"
                  title="Tingnan ang detalye ng mga kasanayan"
                >
                  <BookOpen className="w-2.5 h-2.5 text-yellow-300" />
                  <span>Kasanayan</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {/* 2x2 Grid for Skills Z, X, C, V (Authentic LEGO Bricks with Studs) */}
                <div className="grid grid-cols-2 gap-1">
                  {equippedFruit.skills.map((skill) => {
                    const cd = skillCooldowns[skill.key] || 0;
                    const onCd = cd > 0.1;
                    const noEnergy = playerEnergy < skill.energyCost;

                    const legoSkillThemes: Record<string, { bg: string; border: string; shadow: string; stud: string }> = {
                      Z: { bg: 'bg-blue-600 hover:bg-blue-500', border: 'border-blue-300', shadow: 'shadow-[0_3px_0_0_#1e3a8a]', stud: 'bg-blue-300' },
                      X: { bg: 'bg-red-600 hover:bg-red-500', border: 'border-red-300', shadow: 'shadow-[0_3px_0_0_#991b1b]', stud: 'bg-red-300' },
                      C: { bg: 'bg-amber-500 hover:bg-amber-400', border: 'border-amber-200', shadow: 'shadow-[0_3px_0_0_#b45309]', stud: 'bg-amber-200' },
                      V: { bg: 'bg-purple-600 hover:bg-purple-500', border: 'border-purple-300', shadow: 'shadow-[0_3px_0_0_#581c87]', stud: 'bg-purple-300' },
                    };
                    const theme = legoSkillThemes[skill.key] || legoSkillThemes.Z;

                    return (
                      <button
                        key={skill.key}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!onCd && !noEnergy) {
                            handleTriggerAttack('skill', skill);
                          } else if (noEnergy) {
                            showNotification('⚡ Kulang ang Energy! Maghintay magkarga.');
                          }
                        }}
                        className={`w-12 h-11 rounded-xl border-2 text-[10px] font-black transition-all flex flex-col items-center justify-center shrink-0 cursor-pointer active:translate-y-0.5 active:shadow-none relative touch-none select-none ${
                          onCd
                            ? 'bg-slate-800 text-slate-500 border-slate-700 opacity-60 shadow-[0_2px_0_0_#1e293b]'
                            : noEnergy
                            ? 'bg-amber-950/80 text-amber-300 border-amber-600 shadow-[0_2px_0_0_#78350f]'
                            : `${theme.bg} ${theme.border} ${theme.shadow} text-white`
                        }`}
                        title={`${skill.name} (${skill.energyCost} Energy)`}
                      >
                        <div className="flex items-center gap-0.5 leading-none">
                          <span className="w-3.5 h-3.5 rounded-full bg-black/25 border border-white/30 flex items-center justify-center font-mono text-[8.5px] font-black text-yellow-300 shadow-inner">
                            {skill.key}
                          </span>
                          <span className="text-xs">{skill.icon}</span>
                        </div>
                        {onCd ? (
                          <span className="text-[8.5px] font-mono text-yellow-300 font-bold leading-tight">
                            {cd.toFixed(1)}s
                          </span>
                        ) : (
                          <span className="text-[7.5px] truncate max-w-[44px] text-white font-bold leading-tight">
                            {skill.name}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Big Attack Button (Sword) - Chunky Red LEGO Brick */}
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleTriggerAttack('sword');
                  }}
                  className="w-14 h-[84px] bg-gradient-to-b from-red-500 via-red-600 to-rose-700 hover:from-red-400 hover:to-rose-600 active:from-red-600 active:to-rose-800 text-white rounded-2xl font-black text-xs shadow-[0_5px_0_0_#991b1b] border-2 border-yellow-300 cursor-pointer flex flex-col items-center justify-center gap-1 shrink-0 active:translate-y-1 active:shadow-[0_1px_0_0_#991b1b] touch-none select-none"
                  title="Atake gamit ang Espada (F)"
                >
                  <div className="flex gap-1">
                    <LegoStud size="xs" color="bg-yellow-300/50" />
                    <LegoStud size="xs" color="bg-yellow-300/50" />
                  </div>
                  <span className="text-2xl drop-shadow-md">{equippedSword.emoji}</span>
                  <span className="font-mono text-[11px] font-black tracking-wide leading-none text-yellow-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                    Atake
                  </span>
                  <span className="text-[8px] font-mono leading-none bg-black/30 px-1 py-0.2 rounded text-yellow-200">
                    [F]
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* LANDSCAPE VIEW: Ultra-Ergonomic, 100% On-Screen Controls */
          /* ======================================================== */
          <div className="pointer-events-auto flex flex-col items-end gap-1 touch-none">
            {/* Utility Row: Jump, Dash, Haki (LEGO 3D Bricks) */}
            <div className="flex items-center gap-1 bg-slate-950/95 backdrop-blur-md p-1 rounded-xl border-2 border-slate-700/80 shadow-md">
              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMovementInput((prev) => ({ ...prev, jump: true }));
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMovementInput((prev) => ({ ...prev, jump: false }));
                }}
                onPointerCancel={() => setMovementInput((prev) => ({ ...prev, jump: false }))}
                className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9px] sm:text-xs font-black shadow-[0_3px_0_0_#065f46] active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-1 border border-emerald-300 touch-none select-none"
                title="Talon (Space)"
              >
                <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Talon</span>
              </button>

              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTriggerDash();
                }}
                className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-[9px] sm:text-xs font-black shadow-[0_3px_0_0_#0369a1] active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-1 border border-sky-200 touch-none select-none"
                title="Flash Step (Q)"
              >
                <Wind className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Dash</span>
              </button>

              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleToggleHaki();
                }}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[9px] sm:text-xs font-black shadow-[0_3px_0_0_#581c87] cursor-pointer transition-all active:translate-y-0.5 active:shadow-none border touch-none select-none ${
                  hakiActive
                    ? 'bg-purple-600 border-purple-200 text-white ring-2 ring-purple-300'
                    : 'bg-purple-900/90 text-purple-200 border-purple-500/70 hover:bg-purple-800'
                }`}
                title="Armament Haki (B)"
              >
                <span>Haki</span>
              </button>
            </div>

            {/* Combat Actions Cluster: 2x2 LEGO Skills + Big Attack Button */}
            <div className="flex flex-col gap-0.5 sm:gap-1 bg-slate-950/95 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border-2 border-slate-700/80 shadow-2xl touch-none">
              <div className="flex items-center justify-between px-1">
                <span className="text-[7.5px] sm:text-[8.5px] font-black text-yellow-300 flex items-center gap-1">
                  <span>{equippedFruit.emoji}</span>
                  <span className="truncate max-w-[65px] sm:max-w-[85px] uppercase font-sans tracking-wide">{equippedFruit.name}</span>
                </span>
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setInspectFruitId(equippedFruit.id);
                    setActiveModal('skills');
                  }}
                  className="text-[7px] sm:text-[8px] font-black bg-indigo-600 hover:bg-indigo-500 text-white px-1 py-0.5 rounded border border-indigo-300 shadow-[0_2px_0_0_#3730a3] active:translate-y-0.5 flex items-center gap-0.5 cursor-pointer"
                  title="Tingnan ang detalye ng mga kasanayan"
                >
                  <BookOpen className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-yellow-300" />
                  <span>Kasanayan</span>
                </button>
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5">
                {/* 2x2 Grid for Skills Z, X, C, V (Authentic LEGO Bricks with Studs) */}
                <div className="grid grid-cols-2 gap-0.5 sm:gap-1">
                  {equippedFruit.skills.map((skill) => {
                    const cd = skillCooldowns[skill.key] || 0;
                    const onCd = cd > 0.1;
                    const noEnergy = playerEnergy < skill.energyCost;

                    const legoSkillThemes: Record<string, { bg: string; border: string; shadow: string }> = {
                      Z: { bg: 'bg-blue-600 hover:bg-blue-500', border: 'border-blue-300', shadow: 'shadow-[0_3px_0_0_#1e3a8a]' },
                      X: { bg: 'bg-red-600 hover:bg-red-500', border: 'border-red-300', shadow: 'shadow-[0_3px_0_0_#991b1b]' },
                      C: { bg: 'bg-amber-500 hover:bg-amber-400', border: 'border-amber-200', shadow: 'shadow-[0_3px_0_0_#b45309]' },
                      V: { bg: 'bg-purple-600 hover:bg-purple-500', border: 'border-purple-300', shadow: 'shadow-[0_3px_0_0_#581c87]' },
                    };
                    const theme = legoSkillThemes[skill.key] || legoSkillThemes.Z;

                    return (
                      <button
                        key={skill.key}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!onCd && !noEnergy) {
                            handleTriggerAttack('skill', skill);
                          } else if (noEnergy) {
                            showNotification('⚡ Kulang ang Energy! Maghintay magkarga.');
                          }
                        }}
                        className={`${
                          isCompactLandscape ? 'w-[44px] h-[30px] text-[8px]' : 'w-12 h-9 sm:w-14 sm:h-11 text-[9px] sm:text-[10px]'
                        } rounded-lg border-2 font-black transition-all flex flex-col items-center justify-center shrink-0 cursor-pointer active:translate-y-0.5 active:shadow-none relative touch-none select-none ${
                          onCd
                            ? 'bg-slate-800 text-slate-500 border-slate-700 opacity-60 shadow-[0_2px_0_0_#1e293b]'
                            : noEnergy
                            ? 'bg-amber-950/80 text-amber-300 border-amber-600 shadow-[0_2px_0_0_#78350f]'
                            : `${theme.bg} ${theme.border} ${theme.shadow} text-white`
                        }`}
                        title={`${skill.name} (${skill.energyCost} Energy)`}
                      >
                        <div className="flex items-center gap-0.5 leading-none">
                          <span className="w-3 h-3 rounded-full bg-black/25 border border-white/30 flex items-center justify-center font-mono text-[8px] font-black text-yellow-300 shadow-inner">
                            {skill.key}
                          </span>
                          <span className="text-[10px] sm:text-xs">{skill.icon}</span>
                        </div>
                        {onCd ? (
                          <span className="text-[8px] font-mono text-yellow-300 font-bold leading-tight">
                            {cd.toFixed(1)}s
                          </span>
                        ) : (
                          <span className="text-[7px] truncate max-w-[38px] text-white font-bold leading-tight">
                            {skill.name}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Big Attack Button (Sword) - Chunky Red LEGO Brick */}
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleTriggerAttack('sword');
                  }}
                  className={`${
                    isCompactLandscape ? 'w-12 h-[64px]' : 'w-14 h-[76px] sm:w-16 sm:h-[88px]'
                  } bg-gradient-to-b from-red-500 via-red-600 to-rose-700 hover:from-red-400 hover:to-rose-600 text-white rounded-2xl font-black text-xs shadow-[0_5px_0_0_#991b1b] border-2 border-yellow-300 cursor-pointer flex flex-col items-center justify-center gap-0.5 shrink-0 active:translate-y-1 active:shadow-[0_1px_0_0_#991b1b] touch-none select-none`}
                  title="Atake gamit ang Espada (F)"
                >
                  <div className="flex gap-1">
                    <LegoStud size="xs" color="bg-yellow-300/50" />
                    <LegoStud size="xs" color="bg-yellow-300/50" />
                  </div>
                  <span className="text-xl sm:text-2xl drop-shadow-md">{equippedSword.emoji}</span>
                  <span className="font-mono text-[9.5px] sm:text-[11px] font-black tracking-wide leading-none text-yellow-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                    Atake
                  </span>
                  <span className="text-[7.5px] sm:text-[8px] font-mono leading-none bg-black/30 px-1 py-0.2 rounded text-yellow-200">
                    [F]
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. MODALS & SHOPS OVERLAYS (LEGO Master Construction Cases) */}
      {/* ========================================================= */}
      {activeModal !== 'none' && activeModal !== 'respawnQuiz' && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-3 animate-fade-in select-none">
          <div className="bg-slate-950 border-4 border-slate-900 rounded-3xl max-w-3xl w-full max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.95)]">
            
            {/* LEGO Stud Row along top of Modal */}
            <LegoStudRow count={16} size="xs" studColor="bg-yellow-300/40" />

            {/* Modal Header: LEGO Red Header Plate */}
            <div className="p-2.5 sm:p-3.5 bg-red-600 border-b-4 border-red-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <LegoBrandBadge text="BLOX FRUITS" subtext="LEGO EDITION" />
                <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 drop-shadow-sm">
                {activeModal === 'quests' && (
                  <>
                    <Scroll className="w-5 h-5 text-amber-400" />
                    <span>MMORPG Quest Board (Mga Pakikipagsapalaran)</span>
                  </>
                )}
                {activeModal === 'map' && (
                  <>
                    <MapPin className="w-5 h-5 text-sky-400" />
                    <span>Archipelago Map at Paglalayag (Fast Travel)</span>
                  </>
                )}
                {activeModal === 'dealer' && (
                  <>
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span>Blox Fruit Dealer (Tindahan at Random Roll)</span>
                  </>
                )}
                {activeModal === 'blacksmith' && (
                  <>
                    <Zap className="w-5 h-5 text-amber-400" />
                    <span>Blacksmith Armory (Mga Espada at Sandata)</span>
                  </>
                )}
                {activeModal === 'accessories' && (
                  <>
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <span>Kagamitan at Aksesorya</span>
                  </>
                )}
                {activeModal === 'stats' && (
                  <>
                    <BarChart2 className="w-5 h-5 text-blue-400" />
                    <span>Paghubog ng Lakas (Stats)</span>
                  </>
                )}
                {activeModal === 'chestQuiz' && (
                  <>
                    <span className="text-xl">🎁</span>
                    <span>Kaban ng Bituin — Pagsusulit at Premyo!</span>
                  </>
                )}
                {activeModal === 'help' && (
                  <>
                    <HelpCircle className="w-5 h-5 text-slate-300" />
                    <span>Gabay sa Paglalaro ng 3D Blox Fruits</span>
                  </>
                )}
                {activeModal === 'skills' && (
                  <>
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                    <span>Aklat ng mga Kasanayan (Blox Fruits Skills Encyclopedia)</span>
                  </>
                )}
                </h3>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 bg-yellow-400 text-slate-950 font-black text-xs font-mono px-2.5 py-1 rounded-xl border-2 border-yellow-200 shadow-[0_2px_0_0_#ca8a04]">
                  <span>⭐</span>
                  <span>{activeStudent.stars} Bituin</span>
                </div>
                <button
                  onClick={() => setActiveModal('none')}
                  className="p-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 border border-yellow-200 shadow-[0_2px_0_0_#ca8a04] active:translate-y-0.5 active:shadow-none cursor-pointer font-black flex items-center justify-center transition-all"
                  title="Isara"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-3 sm:p-4 flex-1 min-h-0 overflow-y-auto space-y-3">
              
              {/* QUESTS MODAL */}
              {activeModal === 'quests' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-300">
                    Pumili ng misyon upang makakuha ng maraming ⭐ Bituin at EXP. Maaari mong tapusin ang mga misyon habang naglalaro sa 3D na mundo!
                  </p>

                    <div className="grid grid-cols-1 gap-2.5">
                      {BLOX_QUESTS.map((quest) => {
                        const isCurrent = player.activeQuest?.questId === quest.id;
                        const isCompleted = isCurrent && player.activeQuest?.isCompleted;

                        return (
                          <div
                            key={quest.id}
                            className={`p-3 rounded-2xl border-2 transition-all flex flex-wrap items-center justify-between gap-2.5 relative overflow-hidden ${
                              isCurrent
                                ? 'bg-amber-950/60 border-yellow-400 shadow-[0_4px_0_0_#ca8a04]'
                                : 'bg-slate-950 border-slate-700/80 shadow-[0_4px_0_0_rgba(0,0,0,0.6)] hover:border-slate-500'
                            }`}
                          >
                            <div className="min-w-0 max-w-md">
                              <div className="flex items-center gap-2">
                                <LegoStud size="xs" color={isCurrent ? 'bg-yellow-300' : 'bg-amber-400'} />
                                <h4 className="text-xs sm:text-sm font-black text-white">
                                  {quest.title}
                                </h4>
                                <span className="text-[10px] bg-slate-900 border border-slate-700 text-amber-300 px-1.5 py-0.5 rounded font-black font-mono">
                                  Lvl {quest.minLevel}+
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mt-0.5 pl-3">{quest.description}</p>
                              <div className="flex items-center gap-3 text-xs font-black text-amber-300 mt-1 pl-3">
                                <span>⭐ +{quest.rewardStars} Bituin</span>
                                <span>✨ +{quest.rewardExp} EXP</span>
                                <span className="text-slate-400 font-mono">฿ +{quest.rewardBounty.toLocaleString()}</span>
                              </div>
                            </div>

                            <div>
                              {isCompleted ? (
                                <button
                                  onClick={handleClaimQuestReward}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 border-2 border-emerald-300 text-white rounded-xl font-black text-xs cursor-pointer shadow-[0_3px_0_0_#065f46] animate-bounce flex items-center gap-1 active:translate-y-0.5 active:shadow-none select-none"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-yellow-300" />
                                  <span>I-claim ang Premyo!</span>
                                </button>
                              ) : isCurrent ? (
                                <div className="text-right bg-black/40 px-3 py-1.5 rounded-xl border border-yellow-400/30">
                                  <span className="text-xs font-mono font-black text-yellow-300 block">
                                    {player.activeQuest?.currentCount} / {quest.requiredCount}
                                  </span>
                                  <span className="text-[9.5px] text-slate-400 font-bold">Kasalukuyang Ginagawa</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleAcceptQuest(quest)}
                                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 border-2 border-yellow-200 text-slate-950 rounded-xl font-black text-xs cursor-pointer shadow-[0_3px_0_0_#ca8a04] active:translate-y-0.5 active:shadow-none select-none"
                                >
                                  Tanggapin ang Misyon
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                </div>
              )}

              {/* MAP & FAST TRAVEL MODAL (CATEGORIZED FROM EASY TO NIGHTMARE) */}
              {activeModal === 'map' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-sky-400" />
                        <span>Kapuluan ng Blox Fruits (12 Pulo: Easy hanggang Nightmare)</span>
                      </h3>
                      <p className="text-xs text-slate-300">
                        Bawat pulo ay may tumataas na antas ng mga minion at boss. Tanging mga boss lamang ang naghuhulog ng Kaban ng Kayamanan!
                      </p>
                    </div>

                    {/* Category Filter Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none flex-nowrap text-xs">
                      {[
                        { id: 'all', label: '⭐ Lahat (12)', color: 'bg-slate-800' },
                        { id: 'easy', label: '🟢 Easy (2)', color: 'bg-emerald-900' },
                        { id: 'medium', label: '🟡 Medium (2)', color: 'bg-amber-900' },
                        { id: 'hard', label: '🟠 Hard (2)', color: 'bg-orange-900' },
                        { id: 'expert', label: '🔴 Expert (3)', color: 'bg-red-900' },
                        { id: 'nightmare', label: '🟣 Nightmare (3)', color: 'bg-purple-900' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setMapCategoryFilter(tab.id as any)}
                          className={`px-2.5 py-1 rounded-xl font-black transition-all cursor-pointer border shrink-0 ${
                            mapCategoryFilter === tab.id
                              ? 'bg-sky-500 text-slate-950 border-sky-300 shadow-md ring-1 ring-white'
                              : `${tab.color} text-slate-300 border-slate-700 hover:text-white`
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                    {[
                      // 🟢 CATEGORY 1: EASY (MADALI)
                      {
                        name: 'Bayan ng Simula',
                        subtitle: 'Pirate Starter Town',
                        category: 'easy',
                        categoryLabel: '🟢 EASY (MADALI)',
                        categoryColor: '#22c55e',
                        minions: 'Lvl 1 - 5 (Rookie Bandits)',
                        boss: '👑 Bandit King Buggy (Lvl 10 BOSS)',
                        bossDrop: '+40 ⭐ Kaban',
                        emoji: '🏝️',
                        bg: 'from-emerald-950 via-slate-900 to-slate-950',
                        x: 0,
                        z: 10,
                        desc: 'Simulang pulo kung saan naroon ang Fruit Dealer, Blacksmith, at si Rookie Bandit King Buggy.',
                      },
                      {
                        name: 'Gubat ng mga Unggoy',
                        subtitle: 'Jungle & Primate Canopy',
                        category: 'easy',
                        categoryLabel: '🟢 EASY (MADALI)',
                        categoryColor: '#22c55e',
                        minions: 'Lvl 15 - 20 (Wild Baboons)',
                        boss: '👑 Gorilla King Titan (Lvl 35 BOSS)',
                        bossDrop: '+55 ⭐ Kaban',
                        emoji: '🌴',
                        bg: 'from-green-950 via-stone-900 to-slate-950',
                        x: -135,
                        z: -65,
                        desc: 'Sinaunang templo, mga mababangis na baboon, at si Gorilla King Titan Boss.',
                      },

                      // 🟡 CATEGORY 2: MEDIUM (KATAMTAMAN)
                      {
                        name: 'Kuta ng Hukbong Dagat',
                        subtitle: 'Marineford Ocean Fortress',
                        category: 'medium',
                        categoryLabel: '🟡 MEDIUM (KATAMTAMAN)',
                        categoryColor: '#eab308',
                        minions: 'Lvl 45 - 55 (Elite Marines)',
                        boss: '👑 Vice Admiral Garp (Lvl 75 BOSS)',
                        bossDrop: '+75 ⭐ Kaban',
                        emoji: '⚓',
                        bg: 'from-slate-900 via-blue-950 to-slate-950',
                        x: 135,
                        z: -65,
                        desc: 'Matayog na fortress na may mga kanyon, Marine Captain Smoker, at si Vice Admiral Garp.',
                      },
                      {
                        name: 'Disyerto ng Alabasta',
                        subtitle: 'Alabasta Sand Dunes & Pyramid',
                        category: 'medium',
                        categoryLabel: '🟡 MEDIUM (KATAMTAMAN)',
                        categoryColor: '#eab308',
                        minions: 'Lvl 75 - 85 (Desert Bandits)',
                        boss: '👑 Crocodile Sand Lord (Lvl 110 BOSS)',
                        bossDrop: '+95 ⭐ Kaban',
                        emoji: '🏜️',
                        bg: 'from-amber-950 via-stone-900 to-slate-950',
                        x: 0,
                        z: 190,
                        desc: 'Gintong disyerto, Sinaunang Piramide ng Faraon, at si Crocodile Sand Lord.',
                      },

                      // 🟠 CATEGORY 3: HARD (MAHIRAP)
                      {
                        name: 'Pulo sa Ulap (Skylands)',
                        subtitle: 'Skylands Cloud Sanctum',
                        category: 'hard',
                        categoryLabel: '🟠 HARD (MAHIRAP)',
                        categoryColor: '#f97316',
                        minions: 'Lvl 125 - 140 (Sky Soldiers)',
                        boss: '⚡ Thunder God Enel (Lvl 170 BOSS)',
                        bossDrop: '+120 ⭐ Kaban',
                        emoji: '⚡',
                        bg: 'from-sky-950 via-indigo-950 to-slate-950',
                        x: 0,
                        z: -215,
                        desc: 'Lumulutang na pulo sa ulap, Gintong Kampana, at si Thunder God Enel na may kidlat.',
                      },
                      {
                        name: 'Nagyeyelong Kastilyo',
                        subtitle: 'Frozen Ice Castle of Frost',
                        category: 'hard',
                        categoryLabel: '🟠 HARD (MAHIRAP)',
                        categoryColor: '#f97316',
                        minions: 'Lvl 155 - 160 (Frost Ice Knights)',
                        boss: '👑 Admiral Aokiji Ice Emperor (Lvl 210 BOSS)',
                        bossDrop: '+140 ⭐ Kaban',
                        emoji: '❄️',
                        bg: 'from-cyan-950 via-blue-950 to-slate-950',
                        x: -165,
                        z: 155,
                        desc: 'Yelong kastilyo, kristal na spires, at si Admiral Aokiji na may nagyeyelong espada.',
                      },

                      // 🔴 CATEGORY 4: EXPERT (DALUBHASA)
                      {
                        name: 'Bulkang Nag-aapoy',
                        subtitle: 'Magma Caldera Volcano',
                        category: 'expert',
                        categoryLabel: '🔴 EXPERT (DALUBHASA)',
                        categoryColor: '#ef4444',
                        minions: 'Lvl 220 - 230 (Magma Knights)',
                        boss: '👑 Fleet Admiral Akainu (Lvl 290 BOSS)',
                        bossDrop: '+160 ⭐ Kaban',
                        emoji: '🌋',
                        bg: 'from-red-950 via-stone-950 to-slate-950',
                        x: 165,
                        z: 155,
                        desc: 'Kumukulong lawa ng lava, mga batong basalt, at si Fleet Admiral Akainu na may kamaong apoy.',
                      },
                      {
                        name: 'Barko ng mga Multo',
                        subtitle: 'Haunted Ghost Bark & Graveyard',
                        category: 'expert',
                        categoryLabel: '🔴 EXPERT (DALUBHASA)',
                        categoryColor: '#ef4444',
                        minions: 'Lvl 270 - 280 (Shadow Zombies)',
                        boss: '👑 Shadow Reaper Gecko (Lvl 360 BOSS)',
                        bossDrop: '+190 ⭐ Kaban',
                        emoji: '👻',
                        bg: 'from-purple-950 via-slate-950 to-black',
                        x: -200,
                        z: 40,
                        desc: 'Madilim na barkong puno ng multo, sementeryo, at si Shadow Reaper Gecko na may itim na scythe.',
                      },
                      {
                        name: 'Coliseo ng mga Kampeon',
                        subtitle: 'Dressrosa Gladiator Arena',
                        category: 'expert',
                        categoryLabel: '🔴 EXPERT (DALUBHASA)',
                        categoryColor: '#ef4444',
                        minions: 'Lvl 330 - 340 (Royal Gladiators)',
                        boss: '👑 Heavenly Demon Doflamingo (Lvl 430 BOSS)',
                        bossDrop: '+220 ⭐ Kaban',
                        emoji: '⚔️',
                        bg: 'from-amber-950 via-stone-900 to-slate-950',
                        x: 200,
                        z: 40,
                        desc: 'Roman arena ng mga gladiators at si Heavenly Demon Doflamingo na may string guillotine.',
                      },

                      // 🟣 CATEGORY 5: NIGHTMARE (BANGUNGOT / PINAKAMAHIRAP)
                      {
                        name: 'Bunganga ng Dragon (Onigashima)',
                        subtitle: 'Onigashima Skull Peak & Horns',
                        category: 'nightmare',
                        categoryLabel: '🟣 NIGHTMARE (BANGUNGOT)',
                        categoryColor: '#a855f7',
                        minions: 'Lvl 520 - 550 (Oni Beast Berserkers)',
                        boss: '🐉 Emperor Kaido Dragon Tyrant (Lvl 750 BOSS)',
                        bossDrop: '+350 ⭐ Kaban',
                        emoji: '🐉',
                        bg: 'from-purple-950 via-slate-950 to-zinc-950',
                        x: 0,
                        z: 380,
                        desc: 'Napakalaking Demon Skull Citadel, mga nagliliyab na purple dragon fire braziers, at si Emperor Kaido!',
                      },
                      {
                        name: 'Kaharian ng Matatamis (Whole Cake)',
                        subtitle: 'Whole Cake Sweet Metropolis',
                        category: 'nightmare',
                        categoryLabel: '🟣 NIGHTMARE (BANGUNGOT)',
                        categoryColor: '#a855f7',
                        minions: 'Lvl 650 - 680 (Sweet Chess Homies)',
                        boss: '🎂 Empress Big Mom Soul Queen (Lvl 900 BOSS)',
                        bossDrop: '+450 ⭐ Kaban',
                        emoji: '🎂',
                        bg: 'from-pink-950 via-rose-950 to-slate-950',
                        x: -280,
                        z: -180,
                        desc: '3-Tier Birthday Cake Citadel, mga candy soldiers, at si Empress Big Mom na may Napoleon Flame Saber!',
                      },
                      {
                        name: 'Ang Lihim na Pulo ng Raftel (Laugh Tale)',
                        subtitle: 'Laugh Tale Void Century Temple',
                        category: 'nightmare',
                        categoryLabel: '🟣 NIGHTMARE (PINAKAMAHIRAP)',
                        categoryColor: '#a855f7',
                        minions: 'Lvl 820 - 860 (Void Astral Guardians)',
                        boss: '👁️ IMU Void Supreme Sovereign (Lvl 1200 BOSS)',
                        bossDrop: '+600 ⭐ Kaban',
                        emoji: '👁️',
                        bg: 'from-slate-950 via-red-950 to-black',
                        x: 280,
                        z: -180,
                        desc: '4 Sacred Red Road Poneglyphs, Astral Temple Pillars, at ang pinakamalakas na Diyos: IMU VOID SUPREME SOVEREIGN!',
                      },
                    ]
                      .filter((island) => mapCategoryFilter === 'all' || island.category === mapCategoryFilter)
                      .map((island) => (
                        <div
                          key={island.name}
                          className={`p-3.5 rounded-2xl border-2 border-sky-500/40 bg-gradient-to-b ${island.bg} flex flex-col justify-between shadow-[0_4px_0_0_#0369a1] relative overflow-hidden`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-3xl">{island.emoji}</span>
                                <div className="flex flex-col gap-0.5">
                                  <LegoStud size="xs" color="bg-sky-300" />
                                  <LegoStud size="xs" color="bg-sky-300" />
                                </div>
                              </div>
                              <span
                                className="text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md text-white font-mono shadow-xs border border-white/20"
                                style={{ backgroundColor: island.categoryColor }}
                              >
                                {island.categoryLabel}
                              </span>
                            </div>

                            <h4 className="text-sm font-black text-white">{island.name}</h4>
                            <span className="text-[10px] text-yellow-300 block font-bold mb-1">
                              {island.subtitle}
                            </span>

                            {/* Level Scaling Indicators */}
                            <div className="space-y-1 my-2 bg-slate-950/80 p-2 rounded-xl border border-slate-700/80 text-[10px]">
                              <div className="flex items-center justify-between text-slate-300">
                                <span>👥 Minions:</span>
                                <strong className="text-amber-300 font-mono">{island.minions}</strong>
                              </div>
                              <div className="flex items-center justify-between text-slate-300">
                                <span>👑 Boss:</span>
                                <strong className="text-red-400 font-mono">{island.boss}</strong>
                              </div>
                              <div className="flex items-center justify-between text-slate-300">
                                <span>🎁 Boss Drop:</span>
                                <strong className="text-emerald-400 font-mono">{island.bossDrop}</strong>
                              </div>
                            </div>

                            <p className="text-xs text-slate-300/85 mb-3 leading-snug">{island.desc}</p>
                          </div>

                          <button
                            onClick={() => handleSailToIsland(island)}
                            className="w-full py-2 bg-sky-500 hover:bg-sky-400 border-2 border-sky-200 text-slate-950 rounded-xl font-black text-xs cursor-pointer shadow-[0_3px_0_0_#0369a1] active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-1.5 transition-all select-none"
                          >
                            <Compass className="w-4 h-4 text-slate-950" />
                            <span>Maglayag Dito (Fast Travel)</span>
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* DEALER MODAL */}
              {activeModal === 'dealer' && (
                <div className="space-y-3">
                  {/* Blox Fruit Prize Jackpot Banner */}
                  <div className="bg-gradient-to-r from-amber-950/70 via-purple-950/70 to-slate-950 border-2 border-amber-400/70 rounded-2xl p-3 shadow-lg flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl p-1.5 bg-amber-500/20 rounded-xl border border-amber-400/50">🎁</span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-amber-300">
                          Pinaangat na mga Premyo sa Bawat Blox Fruit! (Increased Fruit Prizes)
                        </h4>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          Bawat roll o pag-unlock ng Blox Fruit ay nagkakaloob ng premyong +150 hanggang +3,500 ⭐ Bituin, at may +{DUPLICATE_FRUIT_CASH_PRIZE} ⭐ Cashback Prize kapag duplicate roll!
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-amber-500/50 font-mono">
                      <span className="text-[10px] text-amber-400 block font-bold">Jackpot Prize:</span>
                      <span className="text-xs sm:text-sm font-black text-amber-300">Up to +3,500 ⭐</span>
                    </div>
                  </div>

                  {/* Gacha Roll Card */}
                  <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-black text-purple-200">
                        Random Blox Fruit Roll (Gacha)
                      </h4>
                      <p className="text-xs text-purple-300/80">
                        I-roll sa halagang {FRUIT_ROLL_COST} ⭐ at manalo ng prutas at Instant Star Prize!
                      </p>
                    </div>
                    <button
                      onClick={handleRollFruit}
                      disabled={activeStudent.stars < FRUIT_ROLL_COST || isRolling}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 text-white rounded-xl font-black text-xs cursor-pointer shadow-md disabled:opacity-40 animate-pulse"
                    >
                      {isRolling ? 'Pumipili...' : `I-Roll (${FRUIT_ROLL_COST} ⭐)`}
                    </button>
                  </div>

                  {rolledFruit && (
                    <div className="bg-purple-900/60 border border-purple-400 p-2.5 rounded-xl text-center">
                      <span className="text-3xl block">{rolledFruit.emoji}</span>
                      <span className="text-xs font-black text-white">Nakuha: {rolledFruit.name}</span>
                    </div>
                  )}

                  {/* Fruit Catalog */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {BLOX_FRUITS.map((fruit) => {
                      const isOwned = player.ownedFruits.includes(fruit.id);
                      const isEquipped = player.equippedFruitId === fruit.id;
                      const canAfford = activeStudent.stars >= fruit.priceStars;

                      return (
                        <div
                          key={fruit.id}
                          className="bg-slate-950 p-3 rounded-2xl border-2 border-purple-500/40 shadow-[0_4px_0_0_#581c87] hover:border-purple-400 flex flex-wrap items-center justify-between gap-2 transition-all relative overflow-hidden"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-purple-900/60 border-2 border-purple-400/60 flex items-center justify-center text-2xl shadow-inner shrink-0 relative">
                              {fruit.emoji}
                              <div className="absolute -top-1 -right-1">
                                <LegoStud size="xs" color="bg-purple-300" />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs sm:text-sm font-black text-white truncate">{fruit.name}</h5>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[8.5px] uppercase font-black px-1.5 py-0.2 rounded bg-purple-950 border border-purple-500 text-purple-300 shadow-xs">
                                  {fruit.rarity}
                                </span>
                                <span className="text-[8.5px] text-amber-300 font-black">Premyo: +{FRUIT_PRIZES[fruit.rarity] || 150} ⭐</span>
                              </div>
                              {/* 4 Skills Quick Badges */}
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                {fruit.skills.map((s) => (
                                  <span
                                    key={s.key}
                                    className="text-[8px] px-1 py-0.2 rounded bg-slate-900 border border-slate-700 text-purple-200 font-mono flex items-center gap-0.5"
                                    title={`${s.key} - ${s.name}: ${s.mechanicType || s.description}`}
                                  >
                                    <span className="text-amber-400 font-bold">{s.key}:</span>
                                    <span>{s.icon}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                            <button
                              onClick={() => {
                                setInspectFruitId(fruit.id);
                                setActiveModal('skills');
                              }}
                              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black border border-indigo-300 shadow-[0_2px_0_0_#3730a3] flex items-center gap-1 cursor-pointer transition-all active:translate-y-0.5"
                              title="Tingnan ang Detalye ng mga Kasanayan"
                            >
                              <BookOpen className="w-3 h-3 text-yellow-300" />
                              <span>Kasanayan</span>
                            </button>

                            <span className="text-xs font-black text-amber-300 font-mono bg-black/40 px-1.5 py-0.5 rounded border border-amber-400/30">
                              ⭐ {fruit.priceStars}
                            </span>
                            <button
                              onClick={() => handleBuyFruit(fruit)}
                              disabled={!isOwned && !canAfford}
                              className={`px-3 py-1 rounded-xl text-xs font-black cursor-pointer border-2 transition-all active:translate-y-0.5 active:shadow-none select-none ${
                                isEquipped
                                  ? 'bg-purple-600 border-purple-200 text-white shadow-[0_3px_0_0_#581c87]'
                                  : isOwned
                                  ? 'bg-blue-600 border-blue-300 text-white shadow-[0_3px_0_0_#1e3a8a] hover:bg-blue-500'
                                  : canAfford
                                  ? 'bg-yellow-400 border-yellow-200 text-slate-950 shadow-[0_3px_0_0_#ca8a04] hover:bg-yellow-300'
                                  : 'bg-slate-800 border-slate-700 text-slate-500 shadow-none'
                              }`}
                            >
                              {isEquipped ? 'Gamit Na' : isOwned ? 'Isangkap' : 'Bilhin'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* BLACKSMITH MODAL (LEGO Master Armory) */}
              {activeModal === 'blacksmith' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BLOX_SWORDS.map((sword) => {
                    const isOwned = player.ownedSwords.includes(sword.id);
                    const isEquipped = player.equippedSwordId === sword.id;
                    const canAfford = activeStudent.stars >= sword.priceStars;

                    return (
                      <div
                        key={sword.id}
                        className="bg-slate-950 p-3 rounded-2xl border-2 border-amber-500/40 shadow-[0_4px_0_0_#92400e] hover:border-amber-400 flex items-center justify-between gap-2.5 transition-all relative overflow-hidden"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-amber-950/60 border-2 border-amber-400/60 flex items-center justify-center text-2xl shadow-inner shrink-0 relative">
                            {sword.emoji}
                            <div className="absolute -top-1 -right-1">
                              <LegoStud size="xs" color="bg-amber-300" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs sm:text-sm font-black text-white truncate">{sword.name}</h5>
                            <span className="text-[10px] text-amber-300 font-black block">
                              +{sword.baseDamage} Damage
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-black text-amber-300 font-mono bg-black/40 px-2 py-0.5 rounded border border-amber-400/30">
                            ⭐ {sword.priceStars}
                          </span>
                          <button
                            onClick={() => handleBuySword(sword)}
                            disabled={!isOwned && !canAfford}
                            className={`px-3 py-1 rounded-xl text-xs font-black cursor-pointer border-2 transition-all active:translate-y-0.5 active:shadow-none select-none ${
                              isEquipped
                                ? 'bg-amber-500 border-yellow-200 text-slate-950 shadow-[0_3px_0_0_#ca8a04]'
                                : isOwned
                                ? 'bg-blue-600 border-blue-300 text-white shadow-[0_3px_0_0_#1e3a8a] hover:bg-blue-500'
                                : canAfford
                                ? 'bg-yellow-400 border-yellow-200 text-slate-950 shadow-[0_3px_0_0_#ca8a04] hover:bg-yellow-300'
                                : 'bg-slate-800 border-slate-700 text-slate-500 shadow-none'
                            }`}
                          >
                            {isEquipped ? 'Hawak Na' : isOwned ? 'Hawakan' : 'Bilhin'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ACCESSORIES MODAL (LEGO Gear Vault) */}
              {activeModal === 'accessories' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BLOX_ACCESSORIES.map((acc) => {
                    const isOwned = player.ownedAccessories.includes(acc.id);
                    const isEquipped = player.equippedAccessoryId === acc.id;
                    const canAfford = activeStudent.stars >= acc.priceStars;

                    return (
                      <div
                        key={acc.id}
                        className="bg-slate-950 p-3 rounded-2xl border-2 border-emerald-500/40 shadow-[0_4px_0_0_#065f46] hover:border-emerald-400 flex items-center justify-between gap-2.5 transition-all relative overflow-hidden"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border-2 border-emerald-400/60 flex items-center justify-center text-2xl shadow-inner shrink-0 relative">
                            {acc.emoji}
                            <div className="absolute -top-1 -right-1">
                              <LegoStud size="xs" color="bg-emerald-300" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs sm:text-sm font-black text-white truncate">{acc.name}</h5>
                            <span className="text-[10px] text-emerald-300 font-black block">
                              +{acc.hpBonus} HP • +{acc.damageBonusPercent}% Dmg
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-black text-amber-300 font-mono bg-black/40 px-2 py-0.5 rounded border border-amber-400/30">
                            ⭐ {acc.priceStars}
                          </span>
                          <button
                            onClick={() => handleBuyAccessory(acc)}
                            disabled={!isOwned && !canAfford}
                            className={`px-3 py-1 rounded-xl text-xs font-black cursor-pointer border-2 transition-all active:translate-y-0.5 active:shadow-none select-none ${
                              isEquipped
                                ? 'bg-emerald-600 border-emerald-200 text-white shadow-[0_3px_0_0_#065f46]'
                                : isOwned
                                ? 'bg-blue-600 border-blue-300 text-white shadow-[0_3px_0_0_#1e3a8a] hover:bg-blue-500'
                                : canAfford
                                ? 'bg-yellow-400 border-yellow-200 text-slate-950 shadow-[0_3px_0_0_#ca8a04] hover:bg-yellow-300'
                                : 'bg-slate-800 border-slate-700 text-slate-500 shadow-none'
                            }`}
                          >
                            {isEquipped ? 'Suot Na' : isOwned ? 'Isuot' : 'Bilhin'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* STATS ALLOCATION MODAL */}
              {activeModal === 'stats' && (
                <div className="space-y-3">
                  {/* Boy / Girl Avatar Customization Card */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-amber-300 block">
                      👤 Piliin ang Anyo ng Karakter (Character Avatar):
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setPlayer((prev) => ({ ...prev, gender: 'boy' }));
                          showNotification('Pinalitan ang avatar: 👦 Piratang Lalaki!');
                        }}
                        className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                          (player.gender || 'boy') === 'boy'
                            ? 'bg-blue-900/50 border-blue-400 text-white shadow-lg'
                            : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-2xl">👦</span>
                        <div className="text-left">
                          <span className="text-xs font-black block">Piratang Lalaki</span>
                          <span className="text-[10px] text-blue-300 block">Bandana & Pulang Vest</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setPlayer((prev) => ({ ...prev, gender: 'girl' }));
                          showNotification('Pinalitan ang avatar: 👧 Piratang Babae!');
                        }}
                        className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                          player.gender === 'girl'
                            ? 'bg-pink-900/50 border-pink-400 text-white shadow-lg'
                            : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-2xl">👧</span>
                        <div className="text-left">
                          <span className="text-xs font-black block">Piratang Babae</span>
                          <span className="text-[10px] text-pink-300 block">Twin Tails & Rosas na Vest</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-400 p-2.5 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-amber-300 font-bold">Magagamit na Stat Points:</span>
                    <span className="text-base font-black text-amber-400 font-mono">
                      {player.statPoints} Puntos
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { key: 'melee', label: '👊 Melee (Lakas at Energy)', val: player.stats.melee, color: 'text-cyan-300', theme: 'border-cyan-500/40 shadow-[0_4px_0_0_#0891b2]', stud: 'bg-cyan-400' },
                      { key: 'defense', label: '🛡️ Defense (Buhay / HP)', val: player.stats.defense, color: 'text-emerald-300', theme: 'border-emerald-500/40 shadow-[0_4px_0_0_#059669]', stud: 'bg-emerald-400' },
                      { key: 'sword', label: '⚔️ Sword (Talim ng Espada)', val: player.stats.sword, color: 'text-amber-300', theme: 'border-amber-500/40 shadow-[0_4px_0_0_#d97706]', stud: 'bg-amber-400' },
                      { key: 'bloxFruit', label: '🍇 Blox Fruit (Lakas ng Prutas)', val: player.stats.bloxFruit, color: 'text-purple-300', theme: 'border-purple-500/40 shadow-[0_4px_0_0_#9333ea]', stud: 'bg-purple-400' },
                    ].map((st) => (
                      <div
                        key={st.key}
                        className={`bg-slate-950 p-3 rounded-2xl border-2 ${st.theme} flex items-center justify-between transition-all relative overflow-hidden`}
                      >
                        <div className="flex items-center gap-2">
                          <LegoStud size="xs" color={st.stud} />
                          <div>
                            <span className="text-xs font-black text-white block">{st.label}</span>
                            <span className={`text-base font-black font-mono ${st.color} drop-shadow-xs`}>
                              Antas {st.val}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAllocateStat(st.key as any)}
                          disabled={player.statPoints <= 0}
                          className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 border-2 border-emerald-200 font-black text-lg flex items-center justify-center cursor-pointer shadow-[0_3px_0_0_#065f46] active:translate-y-0.5 active:shadow-none transition-all select-none"
                          title="Magdagdag ng punto sa katangian"
                        >
                          +
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CHEST QUIZ MODAL WITH GRADE 1-10 CATEGORISATION & SUBJECT SELECTOR */}
              {activeModal === 'chestQuiz' && !activeChestQuestion && isLoadingQuestion && (
                <div className="py-12 px-4 text-center space-y-3 bg-slate-950/90 rounded-2xl border border-amber-500/40 shadow-inner">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 shadow-lg animate-bounce">
                    <Sparkles className="w-8 h-8 text-slate-950 animate-spin" />
                  </div>
                  <h3 className="text-base font-black text-amber-300">
                    ⚡ Bumabuo ang Groq AI ng Natatanging Tanong...
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Sinusuri ang kurikulum ng DepEd upang matiyak na walang pag-uulit ng katanungan sa kaban!
                  </p>
                </div>
              )}

              {activeModal === 'chestQuiz' && activeChestQuestion && (
                <div className="space-y-2.5 sm:space-y-3.5">

                  {/* 1. GRADE CATEGORISATION SELECTOR (GRADE 1 - 10) */}
                  <div className="bg-slate-950 p-2 sm:p-3 rounded-2xl border border-amber-500/40 space-y-1.5 shadow-inner">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="text-[11px] sm:text-xs font-black text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                        🎓 DepEd Philippines Budget of Work (Baitang 1 - 10):
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] sm:text-[10px] bg-gradient-to-r from-orange-600 to-amber-600 text-white border border-amber-300/80 px-2.5 py-0.5 rounded-full font-black shadow-sm flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-yellow-200 animate-spin" />
                          ⚡ Groq AI Non-Repeating
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-amber-200/90 font-mono font-bold">
                          {selectedQuizGrade === 'all'
                            ? 'Lahat ng Baitang (G1-G10)'
                            : `Baitang ${selectedQuizGrade}`}
                        </span>
                      </div>
                    </div>

                    {/* Single-row horizontal scrollable grade tabs for zero vertical overflow in landscape */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-nowrap sm:flex-wrap">
                      <button
                        onClick={() => handleSelectQuizGrade('all')}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer border shrink-0 ${
                          selectedQuizGrade === 'all'
                            ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md ring-2 ring-amber-400'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white hover:border-slate-500'
                        }`}
                      >
                        🌟 Lahat (G1-G10)
                      </button>
                      {GRADE_CATEGORIES.map((cat) => {
                        const isActive = selectedQuizGrade === cat.grade;
                        return (
                          <button
                            key={cat.grade}
                            onClick={() => handleSelectQuizGrade(cat.grade)}
                            className={`px-2 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer border flex items-center gap-1 shrink-0 ${
                              isActive
                                ? 'text-white border-white shadow-lg ring-2 ring-white/50'
                                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white hover:border-slate-500'
                            }`}
                            style={{
                              backgroundColor: isActive ? cat.badgeColor : undefined,
                            }}
                          >
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Grade Curriculum Topic Scope */}
                    {selectedQuizGrade !== 'all' && (
                      <div className="bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800 text-[10px] sm:text-[11px] text-slate-300 flex items-center gap-1.5">
                        <span className="text-sm">📌</span>
                        <p className="leading-tight truncate">
                          <strong className="text-amber-300">Saklaw ng Baitang {selectedQuizGrade}: </strong>
                          {GRADE_CATEGORIES.find((c) => c.grade === selectedQuizGrade)?.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 2. SUBJECT CATEGORY SELECTOR */}
                  <div className="bg-slate-950 p-2 sm:p-3 rounded-2xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="text-[11px] sm:text-xs font-black text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                        📚 Asignatura at Wika (Subject & Language):
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono font-bold">
                        {selectedQuizSubject === 'all'
                          ? 'Lahat ng Asignatura'
                          : `${QUIZ_SUBJECTS.find((s) => s.subject === selectedQuizSubject)?.label}`}
                      </span>
                    </div>

                    {/* Single-row horizontal scrollable subject tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-nowrap sm:flex-wrap">
                      <button
                        onClick={() => handleSelectQuizSubject('all')}
                        className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer border shrink-0 ${
                          selectedQuizSubject === 'all'
                            ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white hover:border-slate-500'
                        }`}
                      >
                        ⭐ Lahat
                      </button>
                      {QUIZ_SUBJECTS.map((sub) => {
                        const isSubActive = selectedQuizSubject === sub.subject;
                        return (
                          <button
                            key={sub.subject}
                            onClick={() => handleSelectQuizSubject(sub.subject)}
                            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer border flex items-center gap-1 shrink-0 ${
                              isSubActive
                                ? 'text-white border-white shadow-lg ring-2'
                                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white hover:border-slate-500'
                            }`}
                            style={{
                              backgroundColor: isSubActive ? sub.color : undefined,
                            }}
                          >
                            <span>{sub.icon}</span>
                            <span>{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. TYPE BAR TO PICK SUBJECT MATTER FOR AI */}
                  <div className="bg-slate-950 p-2.5 sm:p-3 rounded-2xl border-2 border-indigo-500/80 shadow-lg space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <label htmlFor="custom-topic-input" className="text-[11px] sm:text-xs font-black text-indigo-300 uppercase tracking-wide flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 animate-pulse" />
                        🎯 Pumili ng Paksa / Type Bar (AI Subject Matter):
                      </label>
                      {customQuizTopic && (
                        <span className="text-[10px] bg-indigo-900/80 text-indigo-200 border border-indigo-400/50 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span>Aktibo:</span>
                          <strong className="text-amber-300 truncate max-w-[140px]">"{customQuizTopic}"</strong>
                        </span>
                      )}
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleApplyCustomTopic();
                      }}
                      className="flex items-center gap-1.5"
                    >
                      <div className="relative flex-1">
                        <input
                          id="custom-topic-input"
                          type="text"
                          value={typedCustomTopicInput}
                          onChange={(e) => setTypedCustomTopicInput(e.target.value)}
                          placeholder="🔍 I-type ang paksa (Hal. Solar System, fractions, photosynthesis, kasaysayan...)"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-xl px-3 py-1.5 sm:py-2 text-xs text-white placeholder-slate-400 outline-none pr-8 transition-colors"
                        />
                        {typedCustomTopicInput && (
                          <button
                            type="button"
                            onClick={() => {
                              setTypedCustomTopicInput('');
                              if (customQuizTopic) handleClearCustomTopic();
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer p-0.5"
                            title="Burahin"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoadingQuestion}
                        className="px-3 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-black text-xs cursor-pointer shadow-md flex items-center gap-1 shrink-0 disabled:opacity-50 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isLoadingQuestion ? 'Binubuo...' : 'Bumuo ng Tanong'}</span>
                      </button>

                      {customQuizTopic && (
                        <button
                          type="button"
                          onClick={handleClearCustomTopic}
                          className="px-2.5 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs cursor-pointer border border-slate-700 shrink-0"
                          title="Alisin ang custom topic at magbalik sa random kurikulum"
                        >
                          Alisin
                        </button>
                      )}
                    </form>

                    {/* Quick Topic Chips */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none flex-nowrap text-[10px]">
                      <span className="text-slate-400 font-bold shrink-0">Mabilisang Pili:</span>
                      {[
                        'Solar System & Planets',
                        'Fractions & Decimals',
                        'Photosynthesis & Plants',
                        'Human Body & Organs',
                        'Kasaysayan ng Pilipinas',
                        'Plate Tectonics & Volcanos',
                        'Matter: Solids, Liquids, Gas',
                        'Ecosystem & Food Chain',
                        'Geometry & Angles',
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleApplyCustomTopic(chip)}
                          className={`px-2 py-0.5 rounded-lg border shrink-0 transition-colors cursor-pointer ${
                            customQuizTopic.toLowerCase() === chip.toLowerCase()
                              ? 'bg-indigo-600 text-white border-indigo-300 font-black'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. CURRENT QUESTION DETAILS & PRIZE BADGE */}
                  <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-3 rounded-2xl border border-slate-700 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-3xl p-1.5 rounded-xl bg-slate-800 border border-slate-700">
                        {activeChestQuestion.subjectIcon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-xs font-black uppercase px-2 py-0.5 rounded-md text-white font-mono shadow-sm"
                            style={{ backgroundColor: activeChestQuestion.subjectColor }}
                          >
                            {activeChestQuestion.subjectLabel}
                          </span>
                          <span className="text-xs text-amber-300 font-bold">
                            ({activeChestQuestion.subjectTagalog})
                          </span>
                          <span className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs font-mono">
                            <span>⚡</span>
                            <span>Groq AI</span>
                          </span>
                          <span className="text-[10px] bg-slate-800 text-emerald-300 border border-emerald-600/40 font-black px-2 py-0.5 rounded-md">
                            Baitang {activeChestQuestion.gradeLevel} (Grade {activeChestQuestion.gradeLevel})
                          </span>
                          <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-700/50 font-black px-2 py-0.5 rounded-md">
                            {['filipino', 'ap', 'epp'].includes(activeChestQuestion.subject)
                              ? '🇵🇭 Wikang Filipino'
                              : '🇺🇸 English Language'}
                          </span>
                          {activeChestQuestion.topicCategory && (
                            <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-500/60 font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                              <span>🎯</span>
                              <span>{activeChestQuestion.topicCategory}</span>
                            </span>
                          )}
                          {customQuizTopic && (
                            <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-500/60 font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs animate-pulse">
                              <span>✨ Paksa:</span>
                              <span>{customQuizTopic}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Sagutin nang wasto upang buksan ang Kaban at makakuha ng premyong Bituin!
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 bg-amber-500/10 border border-amber-400/50 px-3 py-1.5 rounded-xl">
                      <span className="text-[10px] font-bold text-amber-400 block uppercase">
                        Premyo sa Kaban:
                      </span>
                      <span className="text-sm font-black text-amber-300 font-mono">
                        +{pendingChestReward + activeChestQuestion.bonusStars} ⭐ Bituin
                      </span>
                    </div>
                  </div>

                  {/* 4. QUESTION CARD - LEGO Master Builder Blueprint Card */}
                  <div className="bg-slate-950 p-3 sm:p-4 rounded-2xl border-4 border-yellow-400 shadow-[0_6px_0_0_#ca8a04] relative overflow-hidden">
                    <LegoStudRow count={10} size="xs" studColor="bg-yellow-400/40" className="mb-2 -mx-4 -mt-4 bg-yellow-950/40" />
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] sm:text-xs font-black text-yellow-300 uppercase tracking-wider flex items-center gap-1.5 drop-shadow-sm">
                        <span className="w-4 h-4 rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center text-[10px] font-black">?</span>
                        <span>KATANUNGAN SA KABAN:</span>
                      </span>
                      <button
                        onClick={handleRetryQuizQuestion}
                        disabled={isLoadingQuestion}
                        className="text-[10px] sm:text-[11px] font-black bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 px-2.5 py-1 rounded-lg border border-yellow-200 shadow-sm cursor-pointer transition-all active:translate-y-0.5 flex items-center gap-1"
                        title="Bumuo ng bagong tanong gamit ang Groq AI"
                      >
                        <Sparkles className="w-3 h-3 text-amber-950" />
                        <span>🎲 Ibang Tanong (Groq AI)</span>
                      </button>
                    </div>
                    <h4 className="text-xs sm:text-sm font-black text-white leading-relaxed">
                      {activeChestQuestion.question}
                    </h4>
                  </div>

                  {/* 5. 4 CLICKABLE OPTIONS (Styled as Colorful LEGO Bricks with Studs) */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                    {activeChestQuestion.options.map((option, idx) => {
                      const isSelected = selectedQuizOption === idx;
                      const isCorrect = idx === activeChestQuestion.correctIndex;

                      const legoOptionThemes = [
                        { bg: 'bg-red-600 hover:bg-red-500', border: 'border-red-300', shadow: 'shadow-[0_4px_0_0_#991b1b]', text: 'text-white' },
                        { bg: 'bg-blue-600 hover:bg-blue-500', border: 'border-blue-300', shadow: 'shadow-[0_4px_0_0_#1e3a8a]', text: 'text-white' },
                        { bg: 'bg-amber-500 hover:bg-amber-400', border: 'border-amber-200', shadow: 'shadow-[0_4px_0_0_#b45309]', text: 'text-white' },
                        { bg: 'bg-emerald-600 hover:bg-emerald-500', border: 'border-emerald-300', shadow: 'shadow-[0_4px_0_0_#065f46]', text: 'text-white' },
                      ];
                      const theme = legoOptionThemes[idx] || legoOptionThemes[0];

                      let btnThemeClass = `${theme.bg} ${theme.border} ${theme.shadow} ${theme.text}`;

                      if (quizFeedback !== 'none') {
                        if (isCorrect) {
                          btnThemeClass = 'bg-emerald-600 border-2 border-emerald-200 text-white shadow-[0_4px_0_0_#065f46] ring-4 ring-emerald-300 animate-pulse';
                        } else if (isSelected && !isCorrect) {
                          btnThemeClass = 'bg-rose-600 border-2 border-rose-300 text-white shadow-[0_4px_0_0_#9f1239] ring-4 ring-rose-400';
                        } else {
                          btnThemeClass = 'bg-slate-900 border-2 border-slate-800 text-slate-500 opacity-40 shadow-none';
                        }
                      }

                      const letters = ['A', 'B', 'C', 'D'];

                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswerQuiz(idx)}
                          disabled={quizFeedback === 'correct'}
                          className={`p-2.5 sm:p-3 rounded-2xl border-2 text-left text-xs font-black flex items-center gap-2.5 transition-all cursor-pointer ${btnThemeClass} active:translate-y-1 active:shadow-none select-none`}
                        >
                          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/25 border-2 border-white/40 flex items-center justify-center font-mono font-black text-yellow-300 text-xs sm:text-sm shrink-0 shadow-inner">
                            {letters[idx]}
                          </span>
                          <span className="flex-1 leading-tight line-clamp-2 drop-shadow-xs">{option}</span>
                          {quizFeedback !== 'none' && isCorrect && (
                            <span className="text-yellow-300 font-black text-base sm:text-lg animate-bounce">✓</span>
                          )}
                          {quizFeedback !== 'none' && isSelected && !isCorrect && (
                            <span className="text-white font-black text-base sm:text-lg">✗</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* 6. FEEDBACK MESSAGE */}
                  {quizFeedback === 'correct' && (
                    <div className="p-3 bg-emerald-950/90 border border-emerald-400 rounded-2xl text-center animate-bounce shadow-lg">
                      <span className="text-base font-black text-emerald-300 block">
                        🎉 Napakahusay! Tama ang iyong sagot!
                      </span>
                      <p className="text-xs text-emerald-200/90 mt-1">
                        {activeChestQuestion.explanation}
                      </p>
                      <span className="text-xs font-black text-amber-300 block mt-1">
                        + {pendingChestReward + activeChestQuestion.bonusStars} ⭐ Bituin ang naidagdag sa iyong kaban!
                      </span>
                    </div>
                  )}

                  {quizFeedback === 'wrong' && (
                    <div className="p-3 bg-rose-950/80 border border-rose-500 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-lg">
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-black text-rose-300 block">
                          ❌ Maling sagot, ngunit huwag sumuko!
                        </span>
                        <p className="text-[11px] text-rose-200/80 mt-0.5">
                          {activeChestQuestion.explanation}
                        </p>
                      </div>

                      <button
                        onClick={handleRetryQuizQuestion}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-md"
                      >
                        Subukan ang Ibang Tanong
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* HELP & CONTROLS MODAL */}
              {activeModal === 'help' && (
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <h4 className="font-black text-amber-400 text-sm mb-1">🎮 Mga Kontrol sa Keyboard:</h4>
                    <p>• <span className="font-bold text-white">W, A, S, D</span> o <span className="font-bold text-white">Arrow Keys</span>: Paglalakad sa 3D na mundo</p>
                    <p>• <span className="font-bold text-white">Shift</span>: Pagtakbo nang mabilis (Sprint / Takbo)</p>
                    <p>• <span className="font-bold text-white">Spacebar</span>: Pagtalon (Jump) at Sky Leap (Geppo)</p>
                    <p>• <span className="font-bold text-white">Q</span>: Flash Step (Soru / Dash)</p>
                    <p>• <span className="font-bold text-white">B</span>: Buso Haki (Armament Haki - +35% Attack & Defense)</p>
                    <p>• <span className="font-bold text-white">F</span> o <span className="font-bold text-white">Left Click</span>: Atake gamit ang Espada</p>
                    <p>• <span className="font-bold text-white">Z, X, C, V</span>: Mga kapangyarihan ng Blox Fruit</p>
                    <p>• <span className="font-bold text-white">E</span>: Pakikipag-usap sa mga NPC (Fruit Dealer, Blacksmith, Quest Giver, Harbor Master)</p>
                    <p>• <span className="font-bold text-white">Mouse Drag / Touch Drag</span>: Pag-ikot ng 3D Camera</p>
                    <p>• <span className="font-bold text-white">Scroll Wheel</span>: Pag-zoom in / zoom out</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <h4 className="font-black text-amber-400 text-sm mb-1">⭐ Paggamit ng Bituin bilang Currency:</h4>
                    <p>
                      Lahat ng Bituing naipon mo sa pag-aaral ng <span className="text-amber-300 font-bold">Basa</span>, <span className="text-blue-300 font-bold">Sulat</span>, at <span className="text-green-300 font-bold">Math</span> ay magagamit mo rito upang bumili ng mga maalamat na prutas (Dragon, Buddha, Light, Kitsune) at pambihirang sandata!
                    </p>
                  </div>
                </div>
              )}

              {/* SKILLS ENCYCLOPEDIA & MASTERY MODAL */}
              {activeModal === 'skills' && (() => {
                const targetFruit = BLOX_FRUITS.find((f) => f.id === inspectFruitId) || equippedFruit;
                const isOwned = player.ownedFruits.includes(targetFruit.id);
                const isEquipped = player.equippedFruitId === targetFruit.id;

                return (
                  <div className="space-y-3">
                    {/* Top Fruit Selection Carousel */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                      {BLOX_FRUITS.map((fruit) => {
                        const isCurrent = fruit.id === targetFruit.id;
                        const isFruitOwned = player.ownedFruits.includes(fruit.id);
                        const isFruitEquipped = player.equippedFruitId === fruit.id;

                        return (
                          <button
                            key={fruit.id}
                            onClick={() => setInspectFruitId(fruit.id)}
                            className={`px-2.5 py-1.5 rounded-xl border text-xs font-black shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                              isCurrent
                                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white border-purple-400 shadow-md ring-1 ring-purple-300'
                                : isFruitEquipped
                                ? 'bg-purple-950/80 text-purple-200 border-purple-600/70 hover:bg-purple-900/60'
                                : isFruitOwned
                                ? 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                                : 'bg-slate-950/60 text-slate-500 border-slate-800 hover:text-slate-400'
                            }`}
                          >
                            <span className="text-base">{fruit.emoji}</span>
                            <span className="truncate max-w-[85px]">{fruit.name}</span>
                            {isFruitEquipped && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Fruit Hero Overview Banner */}
                    <div className={`p-3 rounded-2xl border border-slate-700/80 bg-gradient-to-r ${targetFruit.color} shadow-lg relative overflow-hidden`}>
                      <div className="absolute -right-6 -bottom-6 text-7xl opacity-20 pointer-events-none select-none">
                        {targetFruit.emoji}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl p-2 bg-slate-950/60 rounded-2xl border border-white/20 shadow-md">
                            {targetFruit.emoji}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base font-black text-white drop-shadow">
                                {targetFruit.name}
                              </h4>
                              <span className="text-xs text-white/80 font-bold">
                                ({targetFruit.nameTagalog})
                              </span>
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-black/40 text-amber-300 border border-amber-300/40">
                                {targetFruit.rarity}
                              </span>
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-black/40 text-sky-300 border border-sky-300/40">
                                {targetFruit.type}
                              </span>
                            </div>
                            <p className="text-xs text-slate-100/90 mt-1 max-w-xl">
                              {targetFruit.description}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-amber-200 mt-1 font-semibold">
                              <span>✨ Pasibo:</span>
                              <span>{targetFruit.passiveDesc}</span>
                            </div>
                          </div>
                        </div>

                        {/* Equip Button if Owned */}
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          {isEquipped ? (
                            <span className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Kasalukuyang Gamit</span>
                            </span>
                          ) : isOwned ? (
                            <button
                              onClick={() => {
                                handleBuyFruit(targetFruit);
                                showNotification(`✨ Isinangkap ang ${targetFruit.name}!`);
                              }}
                              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all active:scale-95"
                            >
                              Isangkap ang Prutas na Ito
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveModal('dealer');
                              }}
                              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md cursor-pointer"
                            >
                              Bilhin sa Dealer (⭐ {targetFruit.priceStars})
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 4 Fruit Skills Detailed Breakdown Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {targetFruit.skills.map((skill) => {
                        const keyGradients: Record<string, string> = {
                          Z: 'from-blue-600 to-cyan-600 border-cyan-400',
                          X: 'from-amber-600 to-orange-600 border-amber-400',
                          C: 'from-purple-600 to-pink-600 border-purple-400',
                          V: 'from-rose-600 via-red-600 to-amber-600 border-red-400',
                        };

                        return (
                          <div
                            key={skill.key}
                            className="bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-3 flex flex-col justify-between gap-2 shadow-md transition-all relative overflow-hidden"
                          >
                            {/* Key Watermark Background */}
                            <div className="absolute right-2 top-2 text-4xl font-mono font-black text-slate-800/40 pointer-events-none select-none">
                              {skill.key}
                            </div>

                            {/* Skill Header */}
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className={`w-8 h-8 rounded-xl bg-gradient-to-br ${keyGradients[skill.key] || 'from-indigo-600 to-purple-600 border-indigo-400'} border flex items-center justify-center text-sm font-mono font-black text-white shadow-md shrink-0`}>
                                  {skill.key}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-base leading-none">{skill.icon}</span>
                                    <h5 className="text-xs sm:text-sm font-black text-white truncate">
                                      {skill.name}
                                    </h5>
                                  </div>
                                  <span className="text-[10px] text-slate-400 block truncate">
                                    {skill.nameTagalog}
                                  </span>
                                </div>
                              </div>

                              {/* Mechanic & Range Badges */}
                              <div className="flex items-center gap-1 flex-wrap mb-1.5">
                                {skill.mechanicType && (
                                  <span className="px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 text-[9.5px] font-bold">
                                    ⚙️ {skill.mechanicType}
                                  </span>
                                )}
                                {skill.range && (
                                  <span className="px-2 py-0.5 rounded-md bg-sky-950/80 border border-sky-500/50 text-sky-300 text-[9.5px] font-bold">
                                    📏 {skill.range}
                                  </span>
                                )}
                                {skill.hits && (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[9.5px] font-bold">
                                    💥 {skill.hits}
                                  </span>
                                )}
                              </div>

                              {/* Description & Deep Mechanical Detail */}
                              <p className="text-[11px] text-slate-300 mb-1 leading-snug">
                                {skill.description}
                              </p>
                              {skill.mechanicDetail && (
                                <p className="text-[10.5px] text-slate-400 bg-slate-900/90 border border-slate-800 rounded-xl p-2 mb-1.5 leading-relaxed">
                                  <span className="text-purple-300 font-bold block mb-0.5">🎮 Detalye sa Labanan (Combat Breakdown):</span>
                                  {skill.mechanicDetail}
                                </p>
                              )}
                              {skill.specialTrait && (
                                <div className="text-[10px] font-semibold text-amber-300 flex items-center gap-1 bg-amber-950/40 border border-amber-600/40 rounded-lg px-2 py-1">
                                  <span>⚡ Katangian:</span>
                                  <span>{skill.specialTrait}</span>
                                </div>
                              )}
                            </div>

                            {/* Combat Attributes Bar */}
                            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-4 gap-1 text-center font-mono">
                              <div className="bg-slate-900/80 p-1 rounded-lg border border-slate-800">
                                <span className="text-[8.5px] text-slate-400 block">Lakas</span>
                                <span className="text-[10px] font-black text-rose-400">{skill.damageMultiplier}x Atk</span>
                              </div>
                              <div className="bg-slate-900/80 p-1 rounded-lg border border-slate-800">
                                <span className="text-[8.5px] text-slate-400 block">Energy</span>
                                <span className="text-[10px] font-black text-sky-400">{skill.energyCost}⚡</span>
                              </div>
                              <div className="bg-slate-900/80 p-1 rounded-lg border border-slate-800">
                                <span className="text-[8.5px] text-slate-400 block">Cooldown</span>
                                <span className="text-[10px] font-black text-amber-400">{skill.cooldown}s</span>
                              </div>
                              <div className="bg-slate-900/80 p-1 rounded-lg border border-slate-800">
                                <span className="text-[8.5px] text-slate-400 block">Mastery</span>
                                <span className="text-[10px] font-black text-emerald-400">Lvl {skill.masteryReq || 1}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModal('none')}
                className="px-5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black cursor-pointer"
              >
                Isara at Magpatuloy sa 3D
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. RESPAWN QUIZ MODAL (Answer 5 questions correctly to respawn) */}
      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* 5. RESPAWN QUIZ MODAL (LEGO Minifigure Reassembly Studio) */}
      {/* ========================================================= */}
      {activeModal === 'respawnQuiz' && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in select-none">
          <div className="bg-slate-950 border-4 border-red-600 rounded-3xl max-w-2xl w-full max-h-[94vh] flex flex-col overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.95)]">
            
            {/* LEGO Stud Row along top of Modal */}
            <LegoStudRow count={14} size="xs" studColor="bg-yellow-300/40" />

            {/* Header: LEGO Red Header Plate */}
            <div className="p-2.5 sm:p-3.5 bg-red-600 border-b-4 border-red-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <LegoBrandBadge text="REASSEMBLY" subtext="MINIFIG STUDIO" />
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white tracking-wide uppercase flex items-center gap-1.5 drop-shadow-sm">
                    <span>Muling Mabuhay (Minifig Rebuild)</span>
                  </h3>
                  <p className="text-[9.5px] sm:text-[10.5px] text-yellow-100 font-bold">
                    Sagutin nang <strong>TAMA ang 5 katanungan</strong> upang buuin muli ang iyong Minifigure!
                  </p>
                </div>
              </div>

              {/* Progress Count Badge: LEGO Yellow Tile with Groq AI indicator */}
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline-flex text-[10px] bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-black px-2 py-1 rounded-xl items-center gap-1 shadow-sm font-mono">
                  <span>⚡</span>
                  <span>Groq AI</span>
                </span>
                <div className="bg-yellow-400 border-2 border-yellow-200 px-2.5 sm:px-3 py-1 rounded-xl shrink-0 text-center shadow-[0_3px_0_0_#ca8a04]">
                  <span className="text-[7.5px] sm:text-[8.5px] uppercase font-black text-slate-900 block leading-tight">Buong Parte</span>
                  <span className="text-xs sm:text-base font-black text-slate-950 font-mono leading-none">
                    {respawnCorrectCount} / 5 🧩
                  </span>
                </div>
              </div>
            </div>

            {/* 5-Step Visual Progress Bar (LEGO Brick Assembly) */}
            <div className="bg-slate-950 px-3 sm:px-4 py-2 border-b-2 border-slate-800 shrink-0">
              <div className="flex items-center justify-between gap-1 sm:gap-2 mb-1.5">
                {[
                  { step: 1, label: 'Binti' },
                  { step: 2, label: 'Katawan' },
                  { step: 3, label: 'Kamay' },
                  { step: 4, label: 'Ulo' },
                  { step: 5, label: 'Espada' },
                ].map(({ step, label }) => {
                  const isDone = respawnCorrectCount >= step;
                  const isCurrent = respawnCorrectCount === step - 1;
                  return (
                    <div
                      key={step}
                      className={`flex-1 py-1 px-1 rounded-xl text-center font-mono font-black text-[9.5px] sm:text-xs transition-all border-2 ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-300 text-white shadow-[0_3px_0_0_#065f46]'
                          : isCurrent
                          ? 'bg-yellow-400 border-yellow-200 text-slate-950 shadow-[0_3px_0_0_#ca8a04] ring-2 ring-yellow-300 animate-pulse'
                          : 'bg-slate-900 border-slate-800 text-slate-500 shadow-none'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-0.5">
                        <LegoStud size="xs" color={isDone ? 'bg-emerald-300' : isCurrent ? 'bg-yellow-200' : 'bg-slate-700'} />
                        <span className="hidden sm:inline">{label}</span>
                        <span className="sm:hidden">#{step}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-700 p-0.5 shadow-inner">
                <div
                  className="bg-gradient-to-r from-yellow-400 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(234,179,8,0.7)]"
                  style={{ width: `${(respawnCorrectCount / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* ========================================================= */}
            {/* INTERACTIVE CONTROLS BAR: TYPE BAR, LANGUAGE & GRADE LEVEL */}
            {/* ========================================================= */}
            <div className="bg-slate-950/95 px-3 sm:px-4 py-2.5 border-b border-rose-900/50 space-y-2 shrink-0">
              
              {/* Row 1: Type Bar with Generate Button and Clear Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={typedRespawnTopicInput}
                    onChange={(e) => setTypedRespawnTopicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleApplyRespawnCustomTopic();
                      }
                    }}
                    placeholder="Mag-type ng paksa (hal. Solar System, Fractions, Kasaysayan, Pandiwa)..."
                    className="w-full pl-9 pr-8 py-1.5 sm:py-2 bg-slate-900/90 border border-rose-500/50 focus:border-rose-400 text-rose-100 placeholder-slate-500 text-xs sm:text-sm rounded-xl focus:outline-hidden transition-all shadow-inner"
                  />
                  {typedRespawnTopicInput && (
                    <button
                      onClick={() => {
                        setTypedRespawnTopicInput('');
                        if (respawnQuizTopic) handleClearRespawnCustomTopic();
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded-full"
                      title="Burahin"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleApplyRespawnCustomTopic()}
                    disabled={isRespawnLoading}
                    className="flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Bumuo ng Tanong</span>
                  </button>

                  {respawnQuizTopic && (
                    <button
                      onClick={handleClearRespawnCustomTopic}
                      disabled={isRespawnLoading}
                      className="px-2.5 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer flex items-center gap-1"
                      title="Alisin ang custom topic at bumalik sa DepEd BOW"
                    >
                      <X className="w-3 h-3 text-rose-400" />
                      <span className="hidden sm:inline">Alisin</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Topic Suggestion Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] sm:text-xs no-scrollbar">
                <span className="text-slate-400 text-[10px] uppercase font-bold shrink-0">Mungkahi:</span>
                {[
                  { label: '🪐 Solar System', val: 'Solar System and Planets' },
                  { label: '🇵🇭 Kasaysayan', val: 'Kasaysayan at Bayani ng Pilipinas' },
                  { label: '🧬 Agham & Selula', val: 'Photosynthesis at Plant Cells' },
                  { label: '📐 Fractions', val: 'Fractions and Basic Decimals' },
                  { label: '📖 Panitikan', val: 'Pandiwa at Balarilang Filipino' },
                  { label: '🤝 Wastong Ugali', val: 'Pagpapakatao at Wastong Pag-uugali' },
                ].map((chip) => {
                  const isCurrent = respawnQuizTopic.toLowerCase() === chip.val.toLowerCase();
                  return (
                    <button
                      key={chip.val}
                      onClick={() => {
                        setTypedRespawnTopicInput(chip.val);
                        handleApplyRespawnCustomTopic(chip.val);
                      }}
                      className={`px-2 py-0.5 rounded-lg border font-bold transition-all shrink-0 cursor-pointer ${
                        isCurrent
                          ? 'bg-rose-950 border-rose-400 text-rose-200 ring-1 ring-rose-400 shadow-xs'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>

              {/* Row 2: Language & Grade Level Selectors */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 border-t border-slate-900">
                {/* Language Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 shrink-0">
                    <Globe className="w-3 h-3 text-indigo-400" />
                    <span>Wika:</span>
                  </span>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    {[
                      { id: 'all', label: '🌐 Lahat / Auto' },
                      { id: 'filipino', label: '🇵🇭 Filipino' },
                      { id: 'english', label: '🇺🇸 English' },
                    ].map((lang) => {
                      const active = respawnQuizLanguage === lang.id;
                      return (
                        <button
                          key={lang.id}
                          onClick={() => handleSelectRespawnLanguage(lang.id as any)}
                          disabled={isRespawnLoading}
                          className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                            active
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {lang.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grade Level Selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 shrink-0">
                    <GraduationCap className="w-3 h-3 text-emerald-400" />
                    <span>Baitang:</span>
                  </span>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 overflow-x-auto no-scrollbar">
                    <button
                      onClick={() => handleSelectRespawnGrade('all')}
                      disabled={isRespawnLoading}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 cursor-pointer ${
                        respawnQuizGrade === 'all'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Lahat
                    </button>
                    {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as GradeLevel[]).map((g) => {
                      const active = respawnQuizGrade === g;
                      return (
                        <button
                          key={g}
                          onClick={() => handleSelectRespawnGrade(g)}
                          disabled={isRespawnLoading}
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold shrink-0 cursor-pointer ${
                            active
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          G{g}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* Scrollable Question Content */}
            <div className="p-3 sm:p-4 flex-1 min-h-0 overflow-y-auto space-y-3">
              
              {/* Dynamic Loading Indicator for Initial Groq AI Generation */}
              {isRespawnLoading && !currentRespawnQuestion && (
                <div className="py-12 px-4 text-center space-y-3 bg-slate-950/80 rounded-2xl border border-red-500/40 shadow-inner">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 shadow-xl animate-bounce">
                    <Sparkles className="w-8 h-8 text-slate-950 animate-spin" />
                  </div>
                  <h3 className="text-base font-black text-amber-300">
                    ⚡ Bumabuo ang Groq AI ng 5 Natatanging Tanong...
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Naghahanda ng 5 magkakaibang paksa mula sa DepEd para sa iyong muling pagkabuhay. Walang pag-uulit!
                  </p>
                </div>
              )}

              {/* Dynamic Loading Indicator for Sub-action Generation */}
              {isRespawnLoading && currentRespawnQuestion && (
                <div className="p-2.5 bg-rose-950/60 border border-amber-500/60 rounded-2xl flex items-center justify-center gap-2.5 animate-pulse shadow-md">
                  <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                  <span className="text-xs font-bold text-amber-200">
                    Bumabuo ng bagong katanungan gamit ang Groq AI...
                  </span>
                </div>
              )}

              {currentRespawnQuestion && (
                <>
                  {/* Subject, Grade & Language Badge */}
                  <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl p-1 rounded-lg bg-slate-800 border border-slate-700">
                        {currentRespawnQuestion.subjectIcon}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="text-xs font-black uppercase px-2 py-0.5 rounded text-white font-mono shadow-sm"
                            style={{ backgroundColor: currentRespawnQuestion.subjectColor }}
                          >
                            {currentRespawnQuestion.subjectLabel}
                          </span>
                          <span className="text-xs text-amber-300 font-bold">
                            ({currentRespawnQuestion.subjectTagalog})
                          </span>
                          <span className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black px-2 py-0.5 rounded flex items-center gap-1 shadow-xs font-mono">
                            <span>⚡</span>
                            <span>Groq AI</span>
                          </span>
                          <span className="text-[10px] bg-slate-800 text-emerald-300 border border-emerald-600/40 font-black px-1.5 py-0.5 rounded">
                            Baitang {currentRespawnQuestion.gradeLevel} (Grade {currentRespawnQuestion.gradeLevel})
                          </span>
                          <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-700/50 font-black px-2 py-0.5 rounded">
                            {respawnQuizLanguage === 'filipino'
                              ? '🇵🇭 Wikang Filipino'
                              : respawnQuizLanguage === 'english'
                              ? '🇺🇸 English Language'
                              : ['filipino', 'ap', 'epp', 'esp'].includes(currentRespawnQuestion.subject)
                              ? '🇵🇭 Wikang Filipino'
                              : '🇺🇸 English Language'}
                          </span>
                          {(respawnQuizTopic || currentRespawnQuestion.topicCategory) && (
                            <span className="text-[10px] bg-rose-950 text-rose-200 border border-rose-500/60 font-black px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
                              <span>🎯</span>
                              <span>{respawnQuizTopic || currentRespawnQuestion.topicCategory}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRerollRespawnQuestion}
                        disabled={isRespawnLoading}
                        className="text-[10px] font-black bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 px-2 py-0.5 rounded-lg border border-yellow-200 shadow-sm cursor-pointer transition-all active:translate-y-0.5 flex items-center gap-1 disabled:opacity-50"
                        title="Bumuo ng ibang katanungan gamit ang Groq AI"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-amber-950" />
                        <span>🎲 Ibang Tanong</span>
                      </button>
                      <div className="text-[11px] font-bold text-amber-400 font-mono bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-400/40">
                        Tanong #{respawnCorrectCount + 1} sa 5
                      </div>
                    </div>
                  </div>

                  {/* Question Card: LEGO Yellow Blueprint Brick */}
                  <div className="bg-slate-950 p-3 sm:p-4 rounded-2xl border-4 border-yellow-400 shadow-[0_5px_0_0_#ca8a04] relative overflow-hidden">
                    <LegoStudRow count={10} size="xs" studColor="bg-yellow-400/40" className="mb-2 -mx-4 -mt-4 bg-yellow-950/40" />
                <span className="text-[11px] font-black text-yellow-300 uppercase tracking-wider block mb-1 drop-shadow-sm">
                  ❓ KATANUNGAN SA PAGKABUO:
                </span>
                <h4 className="text-xs sm:text-sm font-black text-white leading-relaxed">
                  {currentRespawnQuestion.question}
                </h4>
              </div>

              {/* 4 Clickable Options (Vibrant LEGO Bricks with Raised Letter Studs) */}
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                {currentRespawnQuestion.options.map((option, idx) => {
                  const isSelected = selectedRespawnOption === idx;
                  const isCorrect = idx === currentRespawnQuestion.correctIndex;

                  const legoOptionThemes = [
                    { bg: 'bg-red-600 hover:bg-red-500', border: 'border-red-300', shadow: 'shadow-[0_4px_0_0_#991b1b]', text: 'text-white' },
                    { bg: 'bg-blue-600 hover:bg-blue-500', border: 'border-blue-300', shadow: 'shadow-[0_4px_0_0_#1e3a8a]', text: 'text-white' },
                    { bg: 'bg-amber-500 hover:bg-amber-400', border: 'border-amber-200', shadow: 'shadow-[0_4px_0_0_#b45309]', text: 'text-white' },
                    { bg: 'bg-emerald-600 hover:bg-emerald-500', border: 'border-emerald-300', shadow: 'shadow-[0_4px_0_0_#065f46]', text: 'text-white' },
                  ];
                  const theme = legoOptionThemes[idx] || legoOptionThemes[0];

                  let btnThemeClass = `${theme.bg} ${theme.border} ${theme.shadow} ${theme.text}`;

                  if (respawnFeedback !== 'none') {
                    if (isCorrect) {
                      btnThemeClass = 'bg-emerald-600 border-2 border-emerald-200 text-white shadow-[0_4px_0_0_#065f46] ring-4 ring-emerald-300 animate-pulse';
                    } else if (isSelected && !isCorrect) {
                      btnThemeClass = 'bg-rose-600 border-2 border-rose-300 text-white shadow-[0_4px_0_0_#9f1239] ring-4 ring-rose-400';
                    } else {
                      btnThemeClass = 'bg-slate-900 border-2 border-slate-800 text-slate-500 opacity-40 shadow-none';
                    }
                  }

                  const letters = ['A', 'B', 'C', 'D'];

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerRespawnQuestion(idx)}
                      disabled={respawnFeedback !== 'none'}
                      className={`p-2.5 sm:p-3 rounded-2xl border-2 text-left text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${btnThemeClass} active:translate-y-1 active:shadow-none select-none`}
                    >
                      <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/25 border-2 border-white/40 flex items-center justify-center font-mono font-black text-yellow-300 text-xs sm:text-sm shrink-0 shadow-inner">
                        {letters[idx]}
                      </span>
                      <span className="flex-1 leading-tight line-clamp-2 drop-shadow-xs">{option}</span>
                      {respawnFeedback !== 'none' && isCorrect && (
                        <span className="text-yellow-300 font-black text-base sm:text-lg animate-bounce">✓</span>
                      )}
                      {respawnFeedback !== 'none' && isSelected && !isCorrect && (
                        <span className="text-white font-black text-base sm:text-lg">✗</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Next/Respawn Action */}
              {respawnFeedback === 'correct' && (
                <div className="p-3 bg-emerald-950/90 border border-emerald-400 rounded-2xl shadow-lg space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs sm:text-sm font-black text-emerald-300">
                      🎉 TAMA ANG IYONG SAGOT! Mahusay!
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      ({respawnCorrectCount} / 5 Tamang Sagot)
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200/90">
                    {currentRespawnQuestion.explanation}
                  </p>
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={handleNextRespawnQuestion}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5 animate-bounce"
                    >
                      {respawnCorrectCount >= 5 ? (
                        <>
                          <span>🛡️</span>
                          <span>BUMALIK SA LABAN (Muling Mabuhay)! ⚡</span>
                        </>
                      ) : (
                        <>
                          <span>Susunod na Tanong ({respawnCorrectCount + 1}/5)</span>
                          <span>➡️</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {respawnFeedback === 'wrong' && (
                <div className="p-3 bg-rose-950/90 border border-rose-500 rounded-2xl shadow-lg space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs sm:text-sm font-black text-rose-300">
                      ❌ Maling sagot, ngunit huwag mawalan ng pag-asa!
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      ({respawnCorrectCount} / 5 Naitalang Tama)
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-200/90">
                    <strong>Tamang Sagot: </strong>
                    {currentRespawnQuestion.options[currentRespawnQuestion.correctIndex]}. {currentRespawnQuestion.explanation}
                  </p>
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={handleNextRespawnQuestion}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🎲</span>
                      <span>Subukan ang Susunod na Tanong</span>
                    </button>
                  </div>
                </div>
              )}

                </>
              )}

            </div>

            {/* Modal Footer (No close button: Must complete 5 correct answers) */}
            <div className="p-2.5 sm:p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span className="text-[11px]">💡 Patuloy na matuto at sumagot nang tama upang muling makabalik sa laban!</span>
              <span className="font-mono text-amber-400 font-bold text-xs">
                Kailangan: 5 Tamang Sagot
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
