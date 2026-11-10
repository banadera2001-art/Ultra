import React, { useState } from 'react';
import { PetDefinition, OwnedPet, PetFood, PetTier, StudentProfile } from '../types';
import {
  PET_CATALOG,
  PET_FOODS,
  TIER_CONFIG,
  getPetById,
  getFoodCostForPet,
  getFoodExpGainForPet,
  getMaxExpForLevel,
  getPetStageFromLevel,
} from '../data/petsData';
import {
  Sparkles,
  Heart,
  Utensils,
  ShoppingBag,
  Search,
  Check,
  Lock,
  Volume2,
  Crown,
  Zap,
  ArrowRight,
  BookOpen,
  PenTool,
  Calculator,
  Edit2,
  HelpCircle,
  Swords,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playPetFeedSound, playLevelUpSound, playBuyPetSound, playAttackSound, playSpecialSkillSound } from '../services/soundEffects';
import { speakTagalog } from '../services/speechService';
import { DragonCityPet } from './DragonCityPet';
import { PetCombatArena } from './PetCombatArena';

interface PetsSlideProps {
  activeStudent: StudentProfile;
  voiceEnabled: boolean;
  onBuyPet: (petId: string, price: number) => boolean;
  onFeedPet: (petId: string, foodId: string, cost: number) => { success: boolean; leveledUp: boolean; newLevel?: number; newStage?: string };
  onSetActivePet: (petId: string) => void;
  onUpdateNickname: (petId: string, nickname: string) => void;
  onNavigateToTab: (tab: 'reading' | 'writing' | 'math') => void;
  onAwardStars?: (count: number, reason?: string) => void;
  onAddPetExp?: (petId: string, exp: number) => { leveledUp: boolean; newLevel?: number; newStage?: string };
}

export const PetsSlide: React.FC<PetsSlideProps> = ({
  activeStudent,
  voiceEnabled,
  onBuyPet,
  onFeedPet,
  onSetActivePet,
  onUpdateNickname,
  onNavigateToTab,
  onAwardStars,
  onAddPetExp,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'my-pets' | 'combat' | 'shop' | 'guide'>('my-pets');
  const [selectedPetId, setSelectedPetId] = useState<string>(() => {
    return activeStudent.activePetId || (activeStudent.ownedPets && activeStudent.ownedPets[0]?.petId) || 'pet-001';
  });

  // Shop filters
  const [selectedTier, setSelectedTier] = useState<PetTier | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [elementFilter, setElementFilter] = useState<string>('all');

  // Evolution Celebration Modal
  const [evolvedPetInfo, setEvolvedPetInfo] = useState<{ pet: PetDefinition; newStage: string; newLevel: number } | null>(null);

  // Star Insufficiency Guidance Modal
  const [insufficientStarPet, setInsufficientStarPet] = useState<PetDefinition | null>(null);

  // Nickname editing
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');

  // Floating feed notification
  const [feedNotification, setFeedNotification] = useState<{ text: string; exp: number } | null>(null);

  // Nursery Test Attack animation state
  const [nurseryAttackAnim, setNurseryAttackAnim] = useState<'idle' | 'attack'>('idle');
  const [nurseryAttackBanner, setNurseryAttackBanner] = useState<string | null>(null);

  const ownedPetsList: OwnedPet[] = activeStudent.ownedPets || [];
  
  // Find current selected owned pet
  const selectedOwnedPet = ownedPetsList.find((p) => p.petId === selectedPetId) || ownedPetsList[0];
  const selectedPetDef = selectedOwnedPet ? getPetById(selectedOwnedPet.petId) : getPetById(selectedPetId);

  // Test Pet Attack Animation in Nursery
  const handleTestPetAttack = () => {
    if (!selectedPetDef) return;
    setNurseryAttackAnim('attack');
    playAttackSound();
    playSpecialSkillSound();

    const petDisplayName = selectedOwnedPet?.nickname || selectedPetDef.nameTagalog;
    const moveTitle = `⚔️ ${petDisplayName}: ${selectedPetDef.specialSkillTagalog}!`;
    setNurseryAttackBanner(moveTitle);

    if (voiceEnabled) {
      speakTagalog(`${petDisplayName}! ${selectedPetDef.specialSkillTagalog}!`);
    }

    setTimeout(() => {
      setNurseryAttackAnim('idle');
    }, 700);

    setTimeout(() => {
      setNurseryAttackBanner(null);
    }, 2400);
  };

  // Handle Feeding (Food price scales with pet level)
  const handleFeed = (food: PetFood) => {
    if (!selectedOwnedPet) return;

    const dynamicCost = getFoodCostForPet(food.cost, selectedOwnedPet.level);
    const scaledExp = getFoodExpGainForPet(food.expGain, selectedOwnedPet.level);

    if (activeStudent.stars < dynamicCost) {
      if (voiceEnabled) {
        speakTagalog(`Kulang ang iyong mga bituin. Kailangan mo ng ${dynamicCost} bituin para bilhin ang pagkain na ito.`);
      }
      setInsufficientStarPet(selectedPetDef || null);
      return;
    }

    const result = onFeedPet(selectedOwnedPet.petId, food.id, dynamicCost);
    if (result.success) {
      playPetFeedSound();

      // Show floating notification
      setFeedNotification({
        text: `Nasarapan si ${selectedOwnedPet.nickname || selectedPetDef?.nameTagalog}! +${scaledExp} EXP`,
        exp: scaledExp,
      });
      setTimeout(() => setFeedNotification(null), 3000);

      // Trigger level-up celebration if evolved/leveled up
      if (result.leveledUp && selectedPetDef) {
        playLevelUpSound();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });

        const nextLvl = result.newLevel || (selectedOwnedPet.level + 1);
        const stageTitle = result.newStage || getPetStageFromLevel(nextLvl);
        setEvolvedPetInfo({
          pet: selectedPetDef,
          newStage: stageTitle,
          newLevel: nextLvl,
        });

        if (voiceEnabled) {
          const petName = selectedOwnedPet.nickname || selectedPetDef.nameTagalog;
          speakTagalog(`Yehey! Umabot sa Antas ${nextLvl} si ${petName}! Naging ${stageTitle} na siya! Napakagaling mag-alaga!`);
        }
      } else {
        if (voiceEnabled) {
          speakTagalog(`Kain nang mabuti! Binigyan mo siya ng ${food.nameTagalog}.`);
        }
      }
    }
  };

  // Handle Buying a Pet
  const handleBuy = (pet: PetDefinition) => {
    if (activeStudent.stars < pet.price) {
      setInsufficientStarPet(pet);
      if (voiceEnabled) {
        speakTagalog(`Kulang ang iyong mga bituin upang ampunin si ${pet.nameTagalog}. Kailangan mo pa ng ${pet.price - activeStudent.stars} bituin.`);
      }
      return;
    }

    const success = onBuyPet(pet.id, pet.price);
    if (success) {
      playBuyPetSound();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setSelectedPetId(pet.id);
      setActiveSubTab('my-pets');

      if (voiceEnabled) {
        speakTagalog(`Malugod na pagdating kay ${pet.nameTagalog}! Alagaan siya nang mabuti at pakainin upang lumaki!`);
      }
    }
  };

  // Sound play for pet
  const handleHearPetSound = (pet: PetDefinition) => {
    if (voiceEnabled) {
      speakTagalog(`${pet.sound} Ako si ${selectedOwnedPet?.nickname || pet.nameTagalog}! Paborito kong pagkain ang ${pet.favoriteFood}.`);
    }
  };

  // Filter 100 pets
  const filteredPets = PET_CATALOG.filter((pet) => {
    if (selectedTier !== 'all' && pet.tier !== selectedTier) return false;
    if (elementFilter !== 'all' && pet.element !== elementFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        pet.name.toLowerCase().includes(q) ||
        pet.nameTagalog.toLowerCase().includes(q) ||
        pet.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
      
      {/* Top Banner: Stars Wallet & Navigation */}
      <div className="bg-white rounded-[32px] p-4 sm:p-6 border-4 border-[#A855F7] shadow-xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg border-2 border-white text-white">
            🐾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#4B2C20]">
                Tahanan ng mga Alaga (Pet Haven)
              </h2>
              <span className="bg-[#A855F7] text-white text-xs px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                100 Nilalang
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#8B4513] font-bold mt-0.5">
              Gamitin ang iyong mga naipong bituin ⭐ para mag-ampon at magpakain ng mga alaga!
            </p>
          </div>
        </div>

        {/* Current Student Wallet & Action */}
        <div className="flex items-center gap-3 bg-purple-50 px-4 py-2 rounded-2xl border-2 border-purple-200">
          <div className="text-right">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 block">
              Naipong Bituin ni {activeStudent.name.split(' ')[0]}
            </span>
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-2xl font-black text-amber-500">⭐</span>
              <span className="text-2xl font-black text-[#4B2C20]">{activeStudent.stars}</span>
            </div>
          </div>
          <div className="h-9 w-px bg-purple-200 mx-1" />
          <div className="text-right">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 block">
              Mga Alaga Mo
            </span>
            <span className="text-xl font-black text-purple-900">
              {ownedPetsList.length} / 100
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center justify-center sm:justify-start gap-2 mb-6 border-b-2 border-purple-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('my-pets')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs sm:text-sm uppercase tracking-wide transition-all cursor-pointer ${
            activeSubTab === 'my-pets'
              ? 'bg-[#A855F7] text-white shadow-md scale-105'
              : 'bg-white text-[#4B2C20] border-2 border-purple-200 hover:bg-purple-50'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Aking mga Alaga ({ownedPetsList.length})</span>
        </button>

        <button
          id="tab-combat-arena-btn"
          onClick={() => setActiveSubTab('combat')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs sm:text-sm uppercase tracking-wide transition-all cursor-pointer ${
            activeSubTab === 'combat'
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md scale-105 ring-2 ring-orange-300'
              : 'bg-white text-orange-700 border-2 border-orange-300 hover:bg-orange-50'
          }`}
        >
          <Swords className="w-4 h-4 text-orange-500" />
          <span>Combat Arena (Labanan) ⚔️</span>
        </button>

        <button
          onClick={() => setActiveSubTab('shop')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs sm:text-sm uppercase tracking-wide transition-all ${
            activeSubTab === 'shop'
              ? 'bg-[#A855F7] text-white shadow-md scale-105'
              : 'bg-white text-[#4B2C20] border-2 border-purple-200 hover:bg-purple-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Tindahan ng 100 Alaga</span>
        </button>

        <button
          onClick={() => setActiveSubTab('guide')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs sm:text-sm uppercase tracking-wide transition-all ${
            activeSubTab === 'guide'
              ? 'bg-[#A855F7] text-white shadow-md scale-105'
              : 'bg-white text-[#4B2C20] border-2 border-purple-200 hover:bg-purple-50'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Gabay sa Paglaki (3 Levels)</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: MY PETS & FEEDING STATION */}
      {/* ======================================================== */}
      {activeSubTab === 'my-pets' && (
        <div className="space-y-6">
          {ownedPetsList.length === 0 ? (
            <div className="bg-white rounded-[32px] p-12 text-center border-4 border-dashed border-purple-300 shadow-md">
              <div className="text-6xl mb-4">🐾</div>
              <h3 className="text-2xl font-black text-[#4B2C20] mb-2">
                Wala ka pang alaga ngayon!
              </h3>
              <p className="text-sm text-[#8B4513] font-bold max-w-md mx-auto mb-6">
                Pumunta sa Tindahan ng 100 Alaga upang gamitin ang iyong mga bituin at mag-ampon ng una mong makakasamang alaga!
              </p>
              <button
                onClick={() => setActiveSubTab('shop')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#A855F7] text-white rounded-full font-black text-sm uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Pumunta sa Tindahan ng mga Alaga</span>
              </button>
            </div>
          ) : (
            <>
              {/* Pet Interactive Stage & Feeding Area */}
              {selectedOwnedPet && selectedPetDef && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Interactive Pet Stage & Evolution Scale */}
                  <div className="lg:col-span-7 bg-white rounded-[32px] p-6 sm:p-8 border-4 border-purple-300 shadow-xl relative overflow-hidden flex flex-col justify-between">
                    
                    {/* Background Subtle Gradient & Stage lighting */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-purple-100 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60" />
                    
                    <div>
                      {/* Pet Header Details */}
                      <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border ${TIER_CONFIG[selectedPetDef.tier].badgeBg}`}>
                              {TIER_CONFIG[selectedPetDef.tier].nameTagalog} ({TIER_CONFIG[selectedPetDef.tier].name})
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border border-slate-200">
                              Elemento: {selectedPetDef.element}
                            </span>
                            {activeStudent.activePetId === selectedOwnedPet.petId && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border border-emerald-300 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Aktibong Kasama
                              </span>
                            )}
                          </div>

                          {/* Nickname and Title */}
                          <div className="flex items-center gap-2 mt-1">
                            {isEditingNickname ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={nicknameInput}
                                  onChange={(e) => setNicknameInput(e.target.value)}
                                  placeholder="Pangalanan ang alaga..."
                                  maxLength={15}
                                  className="px-3 py-1 text-base font-black border-2 border-purple-400 rounded-xl outline-none"
                                />
                                <button
                                  onClick={() => {
                                    if (nicknameInput.trim()) {
                                      onUpdateNickname(selectedOwnedPet.petId, nicknameInput.trim());
                                    }
                                    setIsEditingNickname(false);
                                  }}
                                  className="px-3 py-1 bg-purple-600 text-white rounded-xl text-xs font-black"
                                >
                                  I-save
                                </button>
                              </div>
                            ) : (
                              <>
                                <h3 className="text-2xl sm:text-3xl font-black text-[#4B2C20]">
                                  {selectedOwnedPet.nickname || selectedPetDef.nameTagalog}
                                </h3>
                                <button
                                  onClick={() => {
                                    setNicknameInput(selectedOwnedPet.nickname || selectedPetDef.nameTagalog);
                                    setIsEditingNickname(true);
                                  }}
                                  title="Palitan ang Palayaw"
                                  className="text-purple-600 hover:text-purple-800 p-1"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                          <p className="text-xs font-bold text-[#8B4513]">
                            {selectedPetDef.name} • {selectedPetDef.description}
                          </p>
                        </div>

                        {/* Pet Voice / Sound Button */}
                        <button
                          onClick={() => handleHearPetSound(selectedPetDef)}
                          title="Pakinggan ang Boses ng Alaga"
                          className="w-12 h-12 rounded-full bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 flex items-center justify-center text-purple-700 transition-all hover:scale-105 shadow-sm"
                        >
                          <Volume2 className="w-6 h-6" />
                        </button>
                      </div>

                      {/* THE INTERACTIVE PET AVATAR DISPLAY WITH DRAGON CITY ANIMATION */}
                      <div className="my-6 py-6 bg-gradient-to-b from-purple-50/70 to-purple-100/50 rounded-3xl border-2 border-purple-200 flex flex-col items-center justify-center relative min-h-[260px]">
                        
                        {/* Feed Floating Toast */}
                        {feedNotification && (
                          <div className="absolute top-2 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg animate-bounce z-20 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{feedNotification.text}</span>
                          </div>
                        )}

                        {/* Nursery Test Attack Toast Banner */}
                        {nurseryAttackBanner && (
                          <div className="absolute top-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg animate-pulse z-20 flex items-center gap-1.5 border border-white/40">
                            <Zap className="w-3.5 h-3.5" />
                            <span>{nurseryAttackBanner}</span>
                          </div>
                        )}

                        {/* Dragon City Animated Pet Avatar with Breathing, Shadow, and Elemental Aura */}
                        <div className="relative flex flex-col items-center justify-center my-2">
                          <DragonCityPet
                            petId={selectedPetDef.id}
                            emoji={selectedPetDef.emoji}
                            name={selectedPetDef.name}
                            nameTagalog={selectedOwnedPet.nickname || selectedPetDef.nameTagalog}
                            element={selectedPetDef.element}
                            stage={selectedOwnedPet.stage}
                            size="xl"
                            interactive={true}
                            sound={selectedPetDef.sound}
                            animationState={nurseryAttackAnim}
                            showAura={true}
                            showCrown={true}
                            showShadow={true}
                          />

                          {/* Quick Combat Stats Preview */}
                          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold px-2.5 py-1 bg-white/90 rounded-full border border-purple-200 shadow-xs flex items-center gap-1 text-emerald-800">
                              ❤️ Buhay (HP): {selectedPetDef.baseHp}
                            </span>
                            <span className="text-[11px] font-bold px-2.5 py-1 bg-white/90 rounded-full border border-purple-200 shadow-xs flex items-center gap-1 text-red-800">
                              ⚔️ Atake (ATK): {selectedPetDef.baseAtk}
                            </span>
                            <span className="text-[11px] font-bold px-2.5 py-1 bg-white/90 rounded-full border border-purple-200 shadow-xs flex items-center gap-1 text-blue-800">
                              🛡️ Depensa (DEF): {selectedPetDef.baseDef}
                            </span>
                            <span className="text-[11px] font-bold px-2.5 py-1 bg-white/90 rounded-full border border-purple-200 shadow-xs flex items-center gap-1 text-amber-800">
                              ⚡ Kakayahan: {selectedPetDef.specialSkillTagalog}
                            </span>
                          </div>

                          {/* Action Buttons: Test Attack & Go to Combat Arena */}
                          <div className="mt-3 flex items-center justify-center gap-2.5 flex-wrap">
                            <button
                              id="test-pet-attack-btn"
                              onClick={handleTestPetAttack}
                              disabled={nurseryAttackAnim === 'attack'}
                              className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                            >
                              <Zap className="w-4 h-4" />
                              <span>Subukan ang Atake! ⚔️</span>
                            </button>

                            <button
                              id="take-pet-to-arena-btn"
                              onClick={() => setActiveSubTab('combat')}
                              className="px-5 py-2 rounded-full bg-gradient-to-r from-[#FF8400] to-rose-500 hover:from-[#E55604] hover:to-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                            >
                              <Swords className="w-4 h-4 animate-pulse" />
                              <span>Lalaban sa Combat Arena!</span>
                            </button>
                          </div>
                        </div>

                        {/* Stage Tag */}
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 ${
                              selectedOwnedPet.level >= 100
                                ? 'bg-amber-100 text-amber-950 border-2 border-amber-400 ring-2 ring-yellow-400 shadow-md animate-pulse'
                                : selectedOwnedPet.level >= 60
                                ? 'bg-amber-100 text-amber-800 border border-amber-300 ring-2 ring-amber-400'
                                : selectedOwnedPet.level >= 25
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {selectedOwnedPet.level >= 100
                              ? '🌟 Antas 100: MAX LEVEL (Grand Champion)'
                              : selectedOwnedPet.level >= 60
                              ? `👑 Antas ${selectedOwnedPet.level}: Adult (Ganap na Alaga)`
                              : selectedOwnedPet.level >= 25
                              ? `⚡ Antas ${selectedOwnedPet.level}: Teen (Kabataan)`
                              : `🐣 Antas ${selectedOwnedPet.level}: Baby (Sanggol)`}
                          </span>
                        </div>
                      </div>

                      {/* ======================================================= */}
                      {/* LEVEL SCALE (LEVEL 1-100: BABY -> TEEN -> ADULT -> CHAMPION) */}
                      {/* ======================================================= */}
                      <div className="bg-purple-50/90 rounded-2xl p-4 border-2 border-purple-200 mb-4">
                        
                        {/* 4-Step Milestones Track */}
                        <div className="flex items-center justify-between mb-3 text-center">
                          {/* Step 1: Baby */}
                          <div className="flex-1 flex flex-col items-center">
                            <div
                              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs sm:text-sm border-2 ${
                                selectedOwnedPet.level >= 1
                                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                                  : 'bg-white text-slate-400 border-slate-300'
                              }`}
                            >
                              🐣
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#4B2C20] mt-1">
                              Antas 1-24: Baby
                            </span>
                          </div>

                          {/* Connector 1 */}
                          <div className={`h-1.5 flex-1 mx-1 rounded-full ${selectedOwnedPet.level >= 25 ? 'bg-emerald-500' : 'bg-purple-200'}`} />

                          {/* Step 2: Teen */}
                          <div className="flex-1 flex flex-col items-center">
                            <div
                              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs sm:text-sm border-2 ${
                                selectedOwnedPet.level >= 25
                                  ? 'bg-blue-500 text-white border-blue-600 shadow-sm'
                                  : 'bg-white text-slate-400 border-slate-300'
                              }`}
                            >
                              ⚡
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#4B2C20] mt-1">
                              Antas 25-59: Teen
                            </span>
                          </div>

                          {/* Connector 2 */}
                          <div className={`h-1.5 flex-1 mx-1 rounded-full ${selectedOwnedPet.level >= 60 ? 'bg-blue-500' : 'bg-purple-200'}`} />

                          {/* Step 3: Adult */}
                          <div className="flex-1 flex flex-col items-center">
                            <div
                              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs sm:text-sm border-2 ${
                                selectedOwnedPet.level >= 60
                                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm ring-2 ring-amber-300'
                                  : 'bg-white text-slate-400 border-slate-300'
                              }`}
                            >
                              👑
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#4B2C20] mt-1">
                              Antas 60-99: Adult
                            </span>
                          </div>

                          {/* Connector 3 */}
                          <div className={`h-1.5 flex-1 mx-1 rounded-full ${selectedOwnedPet.level >= 100 ? 'bg-amber-500' : 'bg-purple-200'}`} />

                          {/* Step 4: Grand Champion Max Level */}
                          <div className="flex-1 flex flex-col items-center">
                            <div
                              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs sm:text-sm border-2 ${
                                selectedOwnedPet.level >= 100
                                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-amber-600 shadow-md ring-2 ring-yellow-300'
                                  : 'bg-white text-slate-400 border-slate-300'
                              }`}
                            >
                              🌟
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#4B2C20] mt-1">
                              Antas 100: Max
                            </span>
                          </div>
                        </div>

                        {/* Real-time Numerical EXP Progress Scale */}
                        <div>
                          <div className="flex items-center justify-between text-xs font-black text-[#4B2C20] mb-1">
                            <span className="flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 text-purple-600" />
                              Karanasan (EXP Scale):
                            </span>
                            <span>
                              {selectedOwnedPet.level >= 100
                                ? '🌟 MAX LEVEL 100 (Ganap na Kampeon!)'
                                : `${selectedOwnedPet.currentExp} / ${selectedOwnedPet.maxExp} EXP (${Math.max(0, selectedOwnedPet.maxExp - selectedOwnedPet.currentExp)} EXP bago mag-Antas ${selectedOwnedPet.level + 1})`}
                            </span>
                          </div>

                          {/* EXP Progress Bar */}
                          <div className="w-full bg-purple-200 rounded-full h-4 overflow-hidden p-0.5 border border-purple-300 shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                selectedOwnedPet.level >= 100
                                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 w-full'
                                  : selectedOwnedPet.level >= 60
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                  : selectedOwnedPet.level >= 25
                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                  : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                              }`}
                              style={{
                                width:
                                  selectedOwnedPet.level >= 100
                                    ? '100%'
                                    : `${Math.min(100, Math.round((selectedOwnedPet.currentExp / selectedOwnedPet.maxExp) * 100))}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Busog / Health Meter */}
                        <div className="mt-3 flex items-center justify-between text-xs font-bold text-[#8B4513]">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                            Busog at Sigla: {selectedOwnedPet.hunger}%
                          </span>
                          <span>
                            Pakain: {selectedOwnedPet.timesFed} beses
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stage Footer: Primary Companion Selection */}
                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-purple-200">
                      <div className="text-xs text-[#8B4513] font-bold">
                        Paboritong Pagkain: <span className="font-black text-purple-700">{selectedPetDef.favoriteFood}</span>
                      </div>
                      
                      {activeStudent.activePetId !== selectedOwnedPet.petId ? (
                        <button
                          onClick={() => onSetActivePet(selectedOwnedPet.petId)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-black uppercase tracking-wider shadow-sm transition-all hover:scale-105"
                        >
                          Gawing Aktibong Kasama 🐾
                        </button>
                      ) : (
                        <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                          <Check className="w-4 h-4" /> Kasama mo sa Header!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Feeding Station (Pakainin Gamit ang Bituin) */}
                  <div className="lg:col-span-5 bg-white rounded-[32px] p-6 border-4 border-amber-300 shadow-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl text-amber-600">
                            <Utensils className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-lg text-[#4B2C20]">
                              Pakainin Gamit ang Bituin
                            </h4>
                            <p className="text-xs font-bold text-[#8B4513]">
                              Bumili ng pagkain para mag-level up si {selectedOwnedPet.nickname || selectedPetDef.nameTagalog}!
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Current Stars & Level Economy Callout */}
                      <div className="bg-amber-50 rounded-2xl p-3 border-2 border-amber-200 mb-3 flex items-center justify-between">
                        <span className="text-xs font-black text-amber-900">
                          Kasalukuyang Bituin:
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xl">⭐</span>
                          <span className="text-xl font-black text-amber-600">
                            {activeStudent.stars}
                          </span>
                        </div>
                      </div>

                      {/* Level Economy Note */}
                      <div className="bg-indigo-50/90 border border-indigo-200 rounded-xl px-3 py-2 text-[11px] text-indigo-900 font-bold flex items-center gap-2 mb-3">
                        <span className="text-sm">📈</span>
                        <span>
                          Antas {selectedOwnedPet.level}: Ang presyo at sustansya ng pagkain ay tumataas habang tumataas ang antas ng alaga (hanggang Antas 100)!
                        </span>
                      </div>

                      {/* Available Foods to Buy & Feed */}
                      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                        {PET_FOODS.map((food) => {
                          const dynamicCost = getFoodCostForPet(food.cost, selectedOwnedPet.level);
                          const dynamicExp = getFoodExpGainForPet(food.expGain, selectedOwnedPet.level);
                          const canAfford = activeStudent.stars >= dynamicCost;
                          const isFavorite = selectedPetDef.favoriteFood.toLowerCase().includes(food.nameTagalog.toLowerCase()) ||
                            food.nameTagalog.toLowerCase().includes(selectedPetDef.favoriteFood.toLowerCase());

                          return (
                            <div
                              key={food.id}
                              className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                                isFavorite
                                  ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                                  : 'bg-white border-slate-200 hover:border-purple-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-3xl w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shadow-xs">
                                  {food.emoji}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h5 className="font-black text-xs sm:text-sm text-[#4B2C20]">
                                      {food.nameTagalog}
                                    </h5>
                                    {isFavorite && (
                                      <span className="bg-amber-200 text-amber-900 text-[9px] px-1.5 py-0.2 rounded-md font-black uppercase">
                                        Paborito!
                                      </span>
                                    )}
                                    {selectedOwnedPet.level > 1 && (
                                      <span className="bg-purple-100 text-purple-700 text-[9px] px-1.5 py-0.2 rounded-md font-bold">
                                        Lvl {selectedOwnedPet.level} Presyo
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-[#8B4513] font-bold">
                                    +{dynamicExp} EXP • +{food.hungerGain} Busog
                                  </p>
                                </div>
                              </div>

                              {/* Buy & Feed Button with Dynamic Star Deduction */}
                              <button
                                onClick={() => handleFeed(food)}
                                className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm ${
                                  canAfford
                                    ? 'bg-[#FF8400] hover:bg-[#e07500] text-white hover:scale-105 active:scale-95'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                <span>⭐</span>
                                <span>{dynamicCost}</span>
                                <span className="text-[10px]">Pakainin</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* How to earn more stars shortcut */}
                    <div className="mt-4 pt-3 border-t border-amber-200">
                      <p className="text-[11px] font-bold text-[#8B4513] text-center mb-2">
                        Kulang sa bituin? Magsanay upang makaipon:
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => onNavigateToTab('reading')}
                          className="flex items-center justify-center gap-1 py-1.5 px-2 bg-orange-100 hover:bg-orange-200 text-[#FF8400] rounded-xl text-[11px] font-black transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Basa</span>
                        </button>
                        <button
                          onClick={() => onNavigateToTab('writing')}
                          className="flex items-center justify-center gap-1 py-1.5 px-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl text-[11px] font-black transition-colors"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Sulat</span>
                        </button>
                        <button
                          onClick={() => onNavigateToTab('math')}
                          className="flex items-center justify-center gap-1 py-1.5 px-2 bg-green-100 hover:bg-green-200 text-emerald-600 rounded-xl text-[11px] font-black transition-colors"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                          <span>Math</span>
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* Carousel / Grid of Owned Pets */}
              <div className="bg-white rounded-[32px] p-6 border-4 border-purple-200 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-black text-lg text-[#4B2C20] flex items-center gap-2">
                    <span>Ang Iyong Koleksyon ({ownedPetsList.length})</span>
                    <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                      Pindutin ang alaga para piliin
                    </span>
                  </h4>

                  <button
                    onClick={() => setActiveSubTab('shop')}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-full font-black text-xs transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Mag-ampon Pa sa Tindahan</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {ownedPetsList.map((op) => {
                    const petDef = getPetById(op.petId);
                    if (!petDef) return null;
                    const isSelected = selectedOwnedPet?.petId === op.petId;
                    const isActiveCompanion = activeStudent.activePetId === op.petId;

                    return (
                      <button
                        key={op.petId}
                        onClick={() => setSelectedPetId(op.petId)}
                        className={`p-3 rounded-2xl border-2 text-left transition-all relative flex flex-col items-center justify-between ${
                          isSelected
                            ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-300 shadow-md scale-105'
                            : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/50'
                        }`}
                      >
                        {isActiveCompanion && (
                          <span className="absolute top-2 right-2 text-xs bg-emerald-500 text-white rounded-full p-0.5">
                            <Check className="w-3 h-3" />
                          </span>
                        )}

                        <div className="my-1 flex items-center justify-center">
                          <DragonCityPet
                            petId={petDef.id}
                            emoji={petDef.emoji}
                            name={petDef.name}
                            nameTagalog={op.nickname || petDef.nameTagalog}
                            element={petDef.element}
                            stage={op.stage}
                            size="sm"
                            showShadow={false}
                            interactive={false}
                          />
                        </div>

                        <div className="w-full text-center">
                          <p className="font-black text-xs text-[#4B2C20] truncate">
                            {op.nickname || petDef.nameTagalog}
                          </p>
                          <span
                            className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-black uppercase mt-1 ${
                              op.level >= 100
                                ? 'bg-amber-200 text-amber-950 ring-1 ring-amber-400 font-black'
                                : op.level >= 60
                                ? 'bg-amber-100 text-amber-800 font-bold'
                                : op.level >= 25
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            Lvl {op.level} {op.stage}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW: PET COMBAT ARENA (DRAGON CITY STYLE BATTLES) */}
      {/* ======================================================== */}
      {activeSubTab === 'combat' && (
        <div className="bg-white rounded-[32px] border-4 border-orange-300 shadow-xl overflow-hidden min-h-[620px]">
          <PetCombatArena
            activeStudent={activeStudent}
            voiceEnabled={voiceEnabled}
            onAwardStars={onAwardStars || ((_count, _reason) => {})}
            onAddPetExp={onAddPetExp || ((_petId, _exp) => ({ leveledUp: false }))}
            onClose={() => setActiveSubTab('my-pets')}
            onNavigateToNursery={() => setActiveSubTab('my-pets')}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: 100 PETS SHOP (TINDAHAN NG 100 ALAGA) */}
      {/* ======================================================== */}
      {activeSubTab === 'shop' && (
        <div className="space-y-6">
          
          {/* Filter Bar */}
          <div className="bg-white rounded-[32px] p-6 border-4 border-purple-300 shadow-lg space-y-4">
            
            {/* Search and Element Filter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-purple-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Maghanap ng alaga (hal. Bakunawa, Agila, Tuta)..."
                  className="w-full pl-10 pr-4 py-2 text-xs font-bold border-2 border-purple-200 rounded-full focus:border-purple-500 outline-none bg-purple-50/30"
                />
              </div>

              {/* Element filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <span className="text-xs font-black text-purple-900 mr-1 whitespace-nowrap">
                  Elemento:
                </span>
                {['all', 'Lupa', 'Tubig', 'Hangin', 'Apoy', 'Liwanag', 'Mahika'].map((el) => (
                  <button
                    key={el}
                    onClick={() => setElementFilter(el)}
                    className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                      elementFilter === el
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                    }`}
                  >
                    {el === 'all' ? 'Lahat' : el}
                  </button>
                ))}
              </div>
            </div>

            {/* Rarity Tier Selectors */}
            <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-purple-100">
              <button
                onClick={() => setSelectedTier('all')}
                className={`px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider transition-all shrink-0 ${
                  selectedTier === 'all'
                    ? 'bg-[#4B2C20] text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Lahat ng Alaga (100)
              </button>

              <button
                onClick={() => setSelectedTier('common')}
                className={`px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider transition-all shrink-0 ${
                  selectedTier === 'common'
                    ? 'bg-slate-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Karaniwan / Common (30) • 5-10 ⭐
              </button>

              <button
                onClick={() => setSelectedTier('rare')}
                className={`px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider transition-all shrink-0 ${
                  selectedTier === 'rare'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                Pambihira / Rare (25) • 12-22 ⭐
              </button>

              <button
                onClick={() => setSelectedTier('epic')}
                className={`px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider transition-all shrink-0 ${
                  selectedTier === 'epic'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                Epiko / Epic (20) • 25-40 ⭐
              </button>

              <button
                onClick={() => setSelectedTier('legendary')}
                className={`px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider transition-all shrink-0 ${
                  selectedTier === 'legendary'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                }`}
              >
                Alamat / Legendary (15) • 45-70 ⭐
              </button>

              <button
                onClick={() => setSelectedTier('mythic')}
                className={`px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider transition-all shrink-0 ${
                  selectedTier === 'mythic'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                }`}
              >
                Mitiko / Mythic (10) • 75-100 ⭐
              </button>
            </div>
          </div>

          {/* 100 Pets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPets.map((pet) => {
              const isOwned = ownedPetsList.some((op) => op.petId === pet.id);
              const ownedPetRecord = ownedPetsList.find((op) => op.petId === pet.id);
              const canAfford = activeStudent.stars >= pet.price;
              const tierInfo = TIER_CONFIG[pet.tier];

              return (
                <div
                  key={pet.id}
                  style={{
                    contentVisibility: 'auto',
                    containIntrinsicSize: '1px 380px',
                  }}
                  className={`bg-white rounded-[28px] p-5 border-3 transition-all flex flex-col justify-between relative shadow-md hover:shadow-lg ${
                    isOwned
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : tierInfo.borderColor
                  }`}
                >
                  {/* Top Badges */}
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider border ${tierInfo.badgeBg}`}>
                        {tierInfo.nameTagalog}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-black uppercase">
                        {pet.element}
                      </span>
                    </div>

                    {/* Dragon City Animated Pet Avatar */}
                    <div className="my-2 flex justify-center">
                      <div className="p-2 rounded-2xl bg-gradient-to-b from-purple-50/50 to-purple-100/30 border border-purple-100 flex items-center justify-center">
                        <DragonCityPet
                          petId={pet.id}
                          emoji={pet.emoji}
                          name={pet.name}
                          nameTagalog={pet.nameTagalog}
                          element={pet.element}
                          stage="Baby"
                          size="md"
                          interactive={true}
                          isStatic={true}
                          sound={pet.sound}
                          showAura={false}
                          showShadow={true}
                        />
                      </div>
                    </div>

                    {/* Pet Names & Description */}
                    <div className="text-center">
                      <h4 className="font-black text-base text-[#4B2C20] leading-tight">
                        {pet.nameTagalog}
                      </h4>
                      <p className="text-[11px] font-bold text-purple-700 mb-1">
                        {pet.name}
                      </p>
                      <p className="text-xs text-[#8B4513] line-clamp-2 mb-2 font-medium">
                        {pet.description}
                      </p>
                    </div>

                    {/* Combat Attributes Grid */}
                    <div className="grid grid-cols-3 gap-1 bg-amber-50/80 rounded-xl p-1.5 mb-2 text-center text-[10px] font-bold text-[#4B2C20] border border-amber-200">
                      <div>❤️ {pet.baseHp} HP</div>
                      <div>⚔️ {pet.baseAtk} ATK</div>
                      <div>🛡️ {pet.baseDef} DEF</div>
                    </div>

                    {/* Special Skill & Food info */}
                    <div className="bg-purple-50/60 rounded-xl p-2 text-center text-[10px] font-bold text-[#8B4513] mb-3">
                      <div>Galing: <span className="text-purple-800 font-black">{pet.specialSkillTagalog}</span></div>
                      <div>Paborito: <span className="text-[#4B2C20] font-black">{pet.favoriteFood}</span></div>
                    </div>
                  </div>

                  {/* Bottom Action: Buy with Stars OR Show Owned */}
                  <div>
                    {isOwned ? (
                      <button
                        onClick={() => {
                          setSelectedPetId(pet.id);
                          setActiveSubTab('my-pets');
                        }}
                        className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-black text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>Nabili Mo Na (Lvl {ownedPetRecord?.level} {ownedPetRecord?.stage})</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(pet)}
                        className={`w-full py-2.5 px-4 rounded-full font-black text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all ${
                          canAfford
                            ? 'bg-gradient-to-r from-[#FF8400] to-amber-500 hover:from-[#e07500] hover:to-amber-600 text-white hover:scale-102 active:scale-98 shadow-md'
                            : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                        }`}
                      >
                        {canAfford ? (
                          <>
                            <span>⭐</span>
                            <span>Ampunin ({pet.price} Bituin)</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Kulang ng {pet.price - activeStudent.stars} ⭐</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 3: EVOLUTION GUIDE & MILESTONES */}
      {/* ======================================================== */}
      {activeSubTab === 'guide' && (
        <div className="bg-white rounded-[32px] p-6 sm:p-8 border-4 border-purple-300 shadow-xl space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-black text-[#4B2C20] mb-2">
              Gabay sa Paglaki at Ebolusyon ng Alaga (Level 1 hanggang Level 3)
            </h3>
            <p className="text-sm text-[#8B4513] font-bold">
              Bawat alaga sa Marungko Pet Haven ay maaaring lumaki sa pamamagitan ng patuloy na pagpapakain at pag-aalaga gamit ang mga bituin mula sa iyong pag-aaral!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* Level 1 Baby */}
            <div className="bg-emerald-50 rounded-3xl p-6 border-3 border-emerald-300 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-3xl shadow-md mb-3">
                🐣
              </div>
              <span className="bg-emerald-200 text-emerald-900 text-xs px-3 py-0.5 rounded-full font-black uppercase mb-2">
                Antas 1: Baby (Sanggol)
              </span>
              <h4 className="font-black text-lg text-[#4B2C20] mb-2">
                Bagong Panganak na Alaga
              </h4>
              <p className="text-xs text-[#8B4513] font-bold leading-relaxed mb-4">
                Lahat ng alaga ay nagsisimula bilang cute na baby. Maliit at mahilig maglaro. Nangangailangan ng 50 EXP upang mag-evolve!
              </p>
              <div className="mt-auto bg-white px-4 py-2 rounded-xl text-xs font-black text-emerald-700 border border-emerald-200">
                Kailangan: 0 - 50 EXP
              </div>
            </div>

            {/* Level 2 Teen */}
            <div className="bg-blue-50 rounded-3xl p-6 border-3 border-blue-300 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-3xl shadow-md mb-3">
                ⚡
              </div>
              <span className="bg-blue-200 text-blue-900 text-xs px-3 py-0.5 rounded-full font-black uppercase mb-2">
                Antas 2: Teen (Kabataan)
              </span>
              <h4 className="font-black text-lg text-[#4B2C20] mb-2">
                Masigla at Mabilis na Alaga
              </h4>
              <p className="text-xs text-[#8B4513] font-bold leading-relaxed mb-4">
                Lumaki na ang katawan at lumakas ang enerhiya! May kislap na aura at mas mabilis na kilos. Nangangailangan ng 100 EXP para maging Adult.
              </p>
              <div className="mt-auto bg-white px-4 py-2 rounded-xl text-xs font-black text-blue-700 border border-blue-200">
                Kailangan: 50 - 150 Kabuuang EXP
              </div>
            </div>

            {/* Level 3 Adult */}
            <div className="bg-amber-50 rounded-3xl p-6 border-3 border-amber-300 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-3xl shadow-md mb-3 ring-2 ring-amber-300">
                👑
              </div>
              <span className="bg-amber-200 text-amber-900 text-xs px-3 py-0.5 rounded-full font-black uppercase mb-2">
                Antas 3: Adult (Ganap na Alaga)
              </span>
              <h4 className="font-black text-lg text-[#4B2C20] mb-2">
                Maringal at Sagad na Antas (MAX)
              </h4>
              <p className="text-xs text-[#8B4513] font-bold leading-relaxed mb-4">
                Naabot na ang pinakamataas na anyo ng alaga! May gintong korona at napakagandang makinang na kapangyarihan.
              </p>
              <div className="mt-auto bg-white px-4 py-2 rounded-xl text-xs font-black text-amber-700 border border-amber-200">
                PINAKAMATAAS NA ANTAS (MAX)
              </div>
            </div>
          </div>

          {/* Tips for earning stars */}
          <div className="bg-purple-50 rounded-2xl p-5 border-2 border-purple-200 mt-6">
            <h5 className="font-black text-sm text-[#4B2C20] mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Paano Makaipon ng Maraming Bituin ⭐ para sa mga Alaga?
            </h5>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-[#8B4513]">
              <li className="bg-white p-3 rounded-xl border border-purple-100 flex items-center gap-2">
                <span className="text-lg">📖</span>
                <span>Magbasa nang tumpak sa 4 na Pangkat ng Marungko (+5 ⭐ kada pagsasanay)</span>
              </li>
              <li className="bg-white p-3 rounded-xl border border-purple-100 flex items-center gap-2">
                <span className="text-lg">✍️</span>
                <span>Magsulat nang maganda sa 3 guhit na canvas (+5 ⭐ kada salita)</span>
              </li>
              <li className="bg-white p-3 rounded-xl border border-purple-100 flex items-center gap-2">
                <span className="text-lg">🔢</span>
                <span>Lutasin ang mga suliranin sa Grade 1 Math (+5 ⭐ kada tamang sagot)</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: EVOLUTION LEVEL UP CELEBRATION */}
      {/* ======================================================== */}
      {evolvedPetInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#FFFBEB] rounded-[36px] p-8 max-w-md w-full border-4 border-[#A855F7] shadow-2xl text-center relative overflow-hidden">
            <div className="text-6xl mb-2 animate-bounce">
              👑
            </div>
            <div className="text-8xl my-3">
              {evolvedPetInfo.pet.emoji}
            </div>
            <h3 className="text-2xl font-black text-[#4B2C20] mb-1">
              YEHEY! NAG-LEVEL UP ANG ALAGA!
            </h3>
            <p className="text-sm font-black text-purple-700 mb-3">
              Si {evolvedPetInfo.pet.nameTagalog} ay isa nang ganap na {evolvedPetInfo.newStage}!
            </p>
            <p className="text-xs text-[#8B4513] font-bold mb-6">
              Dahil sa iyong sipag sa pagpapakain at pag-aaral, lumaki at lumakas ang iyong alaga. Ipagpatuloy ang mabuting gawain!
            </p>
            <button
              onClick={() => setEvolvedPetInfo(null)}
              className="w-full py-3 bg-[#A855F7] hover:bg-purple-700 text-white rounded-full font-black text-sm uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
            >
              Napakagaling! (Ipagpatuloy) 🌟
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: INSUFFICIENT STARS GUIDANCE */}
      {/* ======================================================== */}
      {insufficientStarPet && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#FFFBEB] rounded-[32px] p-6 max-w-md w-full border-4 border-[#FF8400] shadow-2xl text-center">
            <div className="text-5xl mb-2">⭐</div>
            <h3 className="text-xl font-black text-[#4B2C20] mb-2">
              Kulang Pa ang Iyong Bituin!
            </h3>
            <p className="text-xs text-[#8B4513] font-bold mb-4">
              Kailangan mo ng mas maraming bituin para ma-adopt o maipakain si <span className="font-black text-[#4B2C20]">{insufficientStarPet.nameTagalog}</span>.
              Mag-aral muna sa Pagbasa, Pagsulat, o Math upang magkapuntos ng mga bituin!
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => {
                  setInsufficientStarPet(null);
                  onNavigateToTab('reading');
                }}
                className="py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black transition-colors"
              >
                Magbasa 📖
              </button>
              <button
                onClick={() => {
                  setInsufficientStarPet(null);
                  onNavigateToTab('writing');
                }}
                className="py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-black transition-colors"
              >
                Magsulat ✍️
              </button>
              <button
                onClick={() => {
                  setInsufficientStarPet(null);
                  onNavigateToTab('math');
                }}
                className="py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-black transition-colors"
              >
                Mag-Math 🔢
              </button>
            </div>

            <button
              onClick={() => setInsufficientStarPet(null)}
              className="text-xs font-black text-[#8B4513] hover:underline"
            >
              Isara ang Mensahe
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
