import React, { useState, useEffect } from 'react';
import { StudentProfile, MarungkoGroupId, OwnedPet } from './types';
import { Header } from './components/Header';
import { ReadingSlide } from './components/ReadingSlide';
import { WritingSlide } from './components/WritingSlide';
import { MathSlide } from './components/MathSlide';
import { PetsSlide } from './components/PetsSlide';
import { RosterSlide } from './components/RosterSlide';
import { AITutorSlide } from './components/AITutorSlide';
import { BloxFruitsGame } from './components/BloxFruitsGame';
import {
  PET_FOODS,
  getPetStageFromLevel,
  getMaxExpForLevel,
  getFoodCostForPet,
  getFoodExpGainForPet,
} from './data/petsData';

const DEFAULT_STUDENTS: StudentProfile[] = [
  {
    id: 's1',
    name: 'Juan Dela Cruz',
    avatar: '👦',
    gradeLevel: 'Ginawa ni Emmanuel Prince Banadera',
    stars: 35,
    activeGroup: 1,
    unlockedBadges: ['badge-starter'],
    history: [
      {
        id: 'h1',
        type: 'reading',
        target: 'MAMA',
        score: 100,
        timestamp: new Date().toLocaleDateString('tl-PH'),
        feedback: 'Napakagaling! Tumpak ang iyong pagbasa sa MAMA.',
      },
    ],
    readingAccuracy: 95,
    writingScore: 90,
    mathSolvedCount: 3,
    ownedPets: [
      {
        petId: 'pet-001',
        nickname: 'Bantay',
        level: 1,
        stage: 'Baby',
        currentExp: 20,
        maxExp: 50,
        hunger: 70,
        timesFed: 1,
        adoptedAt: new Date().toLocaleDateString('tl-PH'),
      },
    ],
    activePetId: 'pet-001',
    foodInventory: {},
  },
  {
    id: 's2',
    name: 'Maria Clara Santos',
    avatar: '👧',
    gradeLevel: 'Baitang 1 - Rosal',
    stars: 45,
    activeGroup: 2,
    unlockedBadges: ['badge-starter', 'badge-pen-king'],
    history: [],
    readingAccuracy: 92,
    writingScore: 95,
    mathSolvedCount: 5,
    ownedPets: [
      {
        petId: 'pet-002',
        nickname: 'Muningsing',
        level: 1,
        stage: 'Baby',
        currentExp: 35,
        maxExp: 50,
        hunger: 80,
        timesFed: 2,
        adoptedAt: new Date().toLocaleDateString('tl-PH'),
      },
    ],
    activePetId: 'pet-002',
    foodInventory: {},
  },
];

const ensureStudentPetFields = (s: StudentProfile): StudentProfile => {
  const updatedGradeLevel =
    s.gradeLevel === 'Baitang 1 - Sampaguita'
      ? 'Ginawa ni Emmanuel Prince Banadera'
      : s.gradeLevel;

  if (!s.ownedPets || s.ownedPets.length === 0) {
    const starterPetId = s.avatar === '👧' ? 'pet-002' : 'pet-001';
    return {
      ...s,
      gradeLevel: updatedGradeLevel,
      ownedPets: [
        {
          petId: starterPetId,
          nickname: starterPetId === 'pet-001' ? 'Bantay' : 'Muningsing',
          level: 1,
          stage: 'Baby',
          currentExp: 20,
          maxExp: 50,
          hunger: 70,
          timesFed: 1,
          adoptedAt: new Date().toLocaleDateString('tl-PH'),
        },
      ],
      activePetId: starterPetId,
      foodInventory: s.foodInventory || {},
    };
  }
  return {
    ...s,
    gradeLevel: updatedGradeLevel,
    foodInventory: s.foodInventory || {},
  };
};

export default function App() {
  // Load students from localStorage or use default
  const [students, setStudents] = useState<StudentProfile[]>(() => {
    try {
      const saved = localStorage.getItem('marungko_students');
      if (saved) {
        const parsed: StudentProfile[] = JSON.parse(saved);
        return parsed.map(ensureStudentPetFields);
      }
      return DEFAULT_STUDENTS;
    } catch {
      return DEFAULT_STUDENTS;
    }
  });

  const [activeStudentId, setActiveStudentId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem('marungko_active_student_id');
      return savedId && students.some((s) => s.id === savedId) ? savedId : students[0].id;
    } catch {
      return students[0].id;
    }
  });

  const [activeTab, setActiveTab] = useState<
    'reading' | 'writing' | 'math' | 'pets' | 'roster' | 'aitutor' | 'bloxfruits'
  >('reading');
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('marungko_students', JSON.stringify(students));
    } catch (e) {
      console.warn('localStorage save error:', e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem('marungko_active_student_id', activeStudentId);
    } catch (e) {
      console.warn('localStorage save error:', e);
    }
  }, [activeStudentId]);

  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  // Award Stars and check for Badge Unlocks
  const handleAwardStars = (count: number) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== activeStudentId) return student;

        const newStars = student.stars + count;
        const newBadges = new Set(student.unlockedBadges);

        // Check badge conditions
        if (newStars >= 50) newBadges.add('badge-5star-streak');
        if (student.mathSolvedCount >= 5) newBadges.add('badge-math-wizard');
        if (student.writingScore >= 90) newBadges.add('badge-pen-king');
        if (student.history.length >= 5) newBadges.add('badge-reader-fast');

        return {
          ...student,
          stars: newStars,
          unlockedBadges: Array.from(newBadges),
        };
      })
    );
  };

  // Pet Purchase Handler (Deduct stars & add pet)
  const handleBuyPet = (petId: string, price: number): boolean => {
    if (activeStudent.stars < price) return false;

    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== activeStudentId) return student;

        const alreadyOwned = student.ownedPets?.some((p) => p.petId === petId);
        if (alreadyOwned) return student;

        const newPet: OwnedPet = {
          petId,
          level: 1,
          stage: 'Baby',
          currentExp: 0,
          maxExp: 50,
          hunger: 60,
          timesFed: 0,
          adoptedAt: new Date().toLocaleDateString('tl-PH'),
        };

        const updatedOwnedPets = [...(student.ownedPets || []), newPet];
        const newStars = Math.max(0, student.stars - price);

        return {
          ...student,
          stars: newStars,
          ownedPets: updatedOwnedPets,
          activePetId: student.activePetId || petId,
        };
      })
    );

    return true;
  };

  // Pet Feeding & Evolution Handler (Deduct stars, add EXP, level up up to Level 100)
  const handleFeedPet = (
    petId: string,
    foodId: string,
    cost: number
  ): { success: boolean; leveledUp: boolean; newLevel?: number; newStage?: string } => {
    if (activeStudent.stars < cost) {
      return { success: false, leveledUp: false };
    }

    const food = PET_FOODS.find((f) => f.id === foodId);
    if (!food) return { success: false, leveledUp: false };

    let didLevelUp = false;
    let resultingLevel = 1;
    let resultingStage: 'Baby' | 'Teen' | 'Adult' = 'Baby';

    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== activeStudentId) return student;

        const updatedOwnedPets = (student.ownedPets || []).map((pet) => {
          if (pet.petId !== petId) return pet;

          let lvl = Math.max(1, Math.min(100, pet.level || 1));
          let stage = getPetStageFromLevel(lvl);
          const scaledExpGain = getFoodExpGainForPet(food.expGain, lvl);
          let exp = (pet.currentExp || 0) + scaledExpGain;
          let maxExp = getMaxExpForLevel(lvl);

          // Leveling up to 100 loop
          if (lvl < 100) {
            while (exp >= maxExp && lvl < 100) {
              exp -= maxExp;
              lvl += 1;
              maxExp = getMaxExpForLevel(lvl);
              stage = getPetStageFromLevel(lvl);
              didLevelUp = true;
            }
            if (lvl >= 100) {
              lvl = 100;
              exp = maxExp;
              stage = 'Adult';
            }
          } else {
            exp = maxExp;
          }

          resultingLevel = lvl;
          resultingStage = stage;

          return {
            ...pet,
            level: lvl,
            stage,
            currentExp: exp,
            maxExp,
            hunger: Math.min(100, (pet.hunger || 0) + food.hungerGain),
            timesFed: (pet.timesFed || 0) + 1,
          };
        });

        return {
          ...student,
          stars: Math.max(0, student.stars - cost),
          ownedPets: updatedOwnedPets,
        };
      })
    );

    return {
      success: true,
      leveledUp: didLevelUp,
      newLevel: resultingLevel,
      newStage: resultingStage,
    };
  };

  // Direct Pet EXP gain from combat arena victory (scaling up to Level 100)
  const handleAddPetExp = (
    petId: string,
    expGain: number
  ): { leveledUp: boolean; newLevel?: number; newStage?: string } => {
    let didLevelUp = false;
    let resultingLevel = 1;
    let resultingStage: 'Baby' | 'Teen' | 'Adult' = 'Baby';

    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== activeStudentId) return student;

        const updatedOwnedPets = (student.ownedPets || []).map((pet) => {
          if (pet.petId !== petId) return pet;

          let lvl = Math.max(1, Math.min(100, pet.level || 1));
          let stage = getPetStageFromLevel(lvl);
          let exp = (pet.currentExp || 0) + expGain;
          let maxExp = getMaxExpForLevel(lvl);

          if (lvl < 100) {
            while (exp >= maxExp && lvl < 100) {
              exp -= maxExp;
              lvl += 1;
              maxExp = getMaxExpForLevel(lvl);
              stage = getPetStageFromLevel(lvl);
              didLevelUp = true;
            }
            if (lvl >= 100) {
              lvl = 100;
              exp = maxExp;
              stage = 'Adult';
            }
          } else {
            exp = maxExp;
          }

          resultingLevel = lvl;
          resultingStage = stage;

          return {
            ...pet,
            level: lvl,
            stage,
            currentExp: exp,
            maxExp,
          };
        });

        return {
          ...student,
          ownedPets: updatedOwnedPets,
        };
      })
    );

    return {
      leveledUp: didLevelUp,
      newLevel: resultingLevel,
      newStage: resultingStage,
    };
  };

  // Set Active Companion
  const handleSetActivePet = (petId: string) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === activeStudentId ? { ...student, activePetId: petId } : student
      )
    );
  };

  // Update Pet Nickname
  const handleUpdatePetNickname = (petId: string, nickname: string) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== activeStudentId) return student;
        const updatedPets = (student.ownedPets || []).map((p) =>
          p.petId === petId ? { ...p, nickname } : p
        );
        return { ...student, ownedPets: updatedPets };
      })
    );
  };

  // Log Practice History
  const handleLogHistory = (
    type: 'reading' | 'writing' | 'math',
    target: string,
    score: number,
    feedback: string
  ) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== activeStudentId) return student;

        const newHistoryItem = {
          id: `h_${Date.now()}`,
          type,
          target,
          score,
          timestamp: new Date().toLocaleTimeString('tl-PH', { hour: '2-digit', minute: '2-digit' }),
          feedback,
        };

        const updatedHistory = [...student.history, newHistoryItem];
        const newBadges = new Set(student.unlockedBadges);
        newBadges.add('badge-starter');

        let mathCount = student.mathSolvedCount;
        if (type === 'math' && score >= 70) {
          mathCount += 1;
        }

        if (mathCount >= 5) newBadges.add('badge-math-wizard');
        if (updatedHistory.length >= 5) newBadges.add('badge-reader-fast');

        return {
          ...student,
          history: updatedHistory,
          mathSolvedCount: mathCount,
          unlockedBadges: Array.from(newBadges),
        };
      })
    );
  };

  // Add New Student Profile
  const handleAddStudent = (name: string) => {
    const avatars = ['👦', '👧', '🎒', '🦉', '🦊', '🦁'];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const newStudent: StudentProfile = {
      id: `s_${Date.now()}`,
      name,
      avatar: randomAvatar,
      gradeLevel: 'Baitang 1',
      stars: 15, // Starter bonus
      activeGroup: 1,
      unlockedBadges: ['badge-starter'],
      history: [],
      readingAccuracy: 100,
      writingScore: 100,
      mathSolvedCount: 0,
      ownedPets: [
        {
          petId: 'pet-001',
          nickname: 'Bantay',
          level: 1,
          stage: 'Baby',
          currentExp: 0,
          maxExp: 50,
          hunger: 70,
          timesFed: 0,
          adoptedAt: new Date().toLocaleDateString('tl-PH'),
        },
      ],
      activePetId: 'pet-001',
      foodInventory: {},
    };

    setStudents((prev) => [...prev, newStudent]);
    setActiveStudentId(newStudent.id);
  };

  // Delete Student
  const handleDeleteStudent = (id: string) => {
    if (students.length <= 1) return;
    const filtered = students.filter((s) => s.id !== id);
    setStudents(filtered);
    if (activeStudentId === id) {
      setActiveStudentId(filtered[0].id);
    }
  };

  // Update Avatar
  const handleUpdateAvatar = (id: string, avatar: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, avatar } : s))
    );
  };

  const isZeroScrollView = activeTab === 'aitutor' || activeTab === 'bloxfruits';

  return (
    <div className={`min-h-screen bg-[#FFFBEB] font-sans text-[#4B2C20] flex flex-col antialiased ${isZeroScrollView ? 'h-screen overflow-hidden' : ''}`}>
      
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeStudent={activeStudent}
        students={students}
        onSelectStudent={setActiveStudentId}
        onAddStudent={handleAddStudent}
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={setVoiceEnabled}
      />

      {/* Main Slide Content Area */}
      <main className={`flex-1 flex flex-col min-h-0 ${isZeroScrollView ? 'overflow-hidden p-0' : 'pb-12'}`}>
        {activeTab === 'reading' && (
          <ReadingSlide
            voiceEnabled={voiceEnabled}
            onAwardStars={handleAwardStars}
            onLogHistory={handleLogHistory}
          />
        )}

        {activeTab === 'writing' && (
          <WritingSlide
            voiceEnabled={voiceEnabled}
            onAwardStars={handleAwardStars}
            onLogHistory={handleLogHistory}
          />
        )}

        {activeTab === 'math' && (
          <MathSlide
            voiceEnabled={voiceEnabled}
            onAwardStars={handleAwardStars}
            onLogHistory={handleLogHistory}
          />
        )}

        {activeTab === 'pets' && (
          <PetsSlide
            activeStudent={activeStudent}
            voiceEnabled={voiceEnabled}
            onBuyPet={handleBuyPet}
            onFeedPet={handleFeedPet}
            onSetActivePet={handleSetActivePet}
            onUpdateNickname={handleUpdatePetNickname}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onAwardStars={handleAwardStars}
            onAddPetExp={handleAddPetExp}
          />
        )}

        {activeTab === 'roster' && (
          <RosterSlide
            students={students}
            activeStudent={activeStudent}
            onSelectStudent={setActiveStudentId}
            onAddStudent={handleAddStudent}
            onDeleteStudent={handleDeleteStudent}
            onUpdateAvatar={handleUpdateAvatar}
          />
        )}

        {activeTab === 'aitutor' && <AITutorSlide />}

        {activeTab === 'bloxfruits' && (
          <BloxFruitsGame
            activeStudent={activeStudent}
            onAwardStars={handleAwardStars}
            voiceEnabled={voiceEnabled}
          />
        )}
      </main>

      {/* Footer Branding - Hidden on zero-scroll games/tools to prevent page scrolling */}
      {!isZeroScrollView && (
        <footer className="bg-[#FFD93D]/30 border-t-2 border-[#FF8400]/20 py-4 text-center text-xs text-[#8B4513]">
          <p className="font-extrabold tracking-wide">
            Marungko Grade 1 AI Reading, Writing, Math & 100 Pet Haven • Sa Suporta ng Tagalog Speech at Vision AI
          </p>
        </footer>
      )}

    </div>
  );
}

