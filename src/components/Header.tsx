import React, { useState } from 'react';
import { StudentProfile } from '../types';
import {
  Volume2,
  VolumeX,
  Star,
  Users,
  Award,
  BookOpen,
  PenTool,
  Calculator,
  Sparkles,
  Bot,
  Swords,
} from 'lucide-react';
import { getPetById } from '../data/petsData';

interface HeaderProps {
  activeTab: 'reading' | 'writing' | 'math' | 'pets' | 'roster' | 'aitutor' | 'bloxfruits';
  setActiveTab: (
    tab: 'reading' | 'writing' | 'math' | 'pets' | 'roster' | 'aitutor' | 'bloxfruits'
  ) => void;
  activeStudent: StudentProfile;
  students: StudentProfile[];
  onSelectStudent: (studentId: string) => void;
  onAddStudent: (name: string) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeStudent,
  students,
  onSelectStudent,
  onAddStudent,
  voiceEnabled,
  setVoiceEnabled,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  // Find active pet if any
  const activePet = activeStudent.ownedPets?.find(
    (p) => p.petId === activeStudent.activePetId
  ) || activeStudent.ownedPets?.[0];
  const activePetDef = activePet ? getPetById(activePet.petId) : undefined;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudentName.trim()) {
      onAddStudent(newStudentName.trim());
      setNewStudentName('');
      setShowAddModal(false);
    }
  };

  return (
    <header className="bg-[#FFD93D] border-b-2 sm:border-b-4 border-[#FF8400] sticky top-0 z-40 shadow-xs shrink-0">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between py-1.5 sm:py-2 gap-1.5 sm:gap-3">
          
          {/* Logo & Student Header Branding */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full border-2 sm:border-3 border-[#FF8400] flex items-center justify-center text-lg sm:text-xl shadow-xs shrink-0">
              {activeStudent.avatar || '👦'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="font-black text-[#4B2C20] text-xs sm:text-base leading-none truncate max-w-[100px] sm:max-w-[160px]">
                  {activeStudent.name}
                </h1>
                <span className="bg-[#FF8400] text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.2 rounded-full font-extrabold uppercase tracking-wider shrink-0">
                  Lvl {activeStudent.activeGroup}
                </span>

                {/* Companion Pet Badge */}
                {activePet && activePetDef && (
                  <button
                    onClick={() => setActiveTab('pets')}
                    className="hidden sm:flex items-center gap-1 bg-white/90 border border-purple-400 hover:bg-purple-100 px-1.5 py-0.5 rounded-full transition-all shadow-xs cursor-pointer shrink-0"
                    title="Pumunta sa Alaga"
                  >
                    <span className="text-xs">{activePetDef.emoji}</span>
                    <span className="text-[9px] font-black text-purple-900 hidden md:inline">
                      {activePet.nickname || activePetDef.nameTagalog}
                    </span>
                    <span className="text-[8px] bg-purple-600 text-white px-1 rounded font-extrabold uppercase">
                      L{activePet.level}
                    </span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-[#8B4513] font-bold truncate max-w-[150px] sm:max-w-[240px] block">
                {activeStudent.gradeLevel}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-white/90 p-1 rounded-full border border-[#FF8400]/30 shadow-inner overflow-x-auto max-w-full order-3 md:order-2 shrink-0">
            <button
              onClick={() => setActiveTab('reading')}
              className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full font-black text-[11px] sm:text-xs uppercase tracking-wide transition-all shrink-0 ${
                activeTab === 'reading'
                  ? 'bg-[#FF8400] text-white shadow-xs'
                  : 'text-[#4B2C20] hover:bg-[#FFD93D]/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Basa</span>
            </button>

            <button
              onClick={() => setActiveTab('writing')}
              className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full font-black text-[11px] sm:text-xs uppercase tracking-wide transition-all shrink-0 ${
                activeTab === 'writing'
                  ? 'bg-[#60A5FA] text-white shadow-xs'
                  : 'text-[#4B2C20] hover:bg-[#FFD93D]/50'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Sulat</span>
            </button>

            <button
              onClick={() => setActiveTab('math')}
              className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full font-black text-[11px] sm:text-xs uppercase tracking-wide transition-all shrink-0 ${
                activeTab === 'math'
                  ? 'bg-[#4ADE80] text-white shadow-xs'
                  : 'text-[#4B2C20] hover:bg-[#FFD93D]/50'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Math</span>
            </button>

            {/* Pets Tab */}
            <button
              onClick={() => setActiveTab('pets')}
              className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full font-black text-[11px] sm:text-xs uppercase tracking-wide transition-all shrink-0 ${
                activeTab === 'pets'
                  ? 'bg-[#A855F7] text-white shadow-xs'
                  : 'text-[#4B2C20] hover:bg-[#FFD93D]/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Alaga</span>
            </button>

            <button
              onClick={() => setActiveTab('roster')}
              className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full font-black text-[11px] sm:text-xs uppercase tracking-wide transition-all shrink-0 ${
                activeTab === 'roster'
                  ? 'bg-[#F472B6] text-white shadow-xs'
                  : 'text-[#4B2C20] hover:bg-[#FFD93D]/50'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Roster</span>
            </button>

            <button
              onClick={() => setActiveTab('aitutor')}
              className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full font-black text-[11px] sm:text-xs uppercase tracking-wide transition-all shrink-0 ${
                activeTab === 'aitutor'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-xs'
                  : 'text-[#4B2C20] hover:bg-[#FFD93D]/50'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Tutor</span>
              <span className="bg-pink-500 text-white text-[8px] px-1 rounded-full font-black hidden sm:inline leading-tight">
                VR
              </span>
            </button>

            <button
              onClick={() => setActiveTab('bloxfruits')}
              className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full font-black text-[11px] sm:text-xs uppercase tracking-wide transition-all shrink-0 ${
                activeTab === 'bloxfruits'
                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-xs'
                  : 'text-[#4B2C20] hover:bg-[#FFD93D]/50'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Blox Fruits</span>
              <span className="bg-amber-400 text-slate-950 text-[8px] px-1 rounded-full font-black hidden sm:inline leading-tight">
                ⭐
              </span>
            </button>
          </nav>

          {/* Student Selector, Stars & Voice Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 order-2 md:order-3 ml-auto shrink-0">
            
            {/* Student Dropdown */}
            <div className="flex items-center gap-1 bg-white border border-[#FF8400] rounded-full px-2 py-0.5 shadow-xs">
              <span className="text-sm sm:text-base">{activeStudent.avatar}</span>
              <select
                value={activeStudent.id}
                onChange={(e) => {
                  if (e.target.value === 'ADD_NEW') {
                    setShowAddModal(true);
                  } else {
                    onSelectStudent(e.target.value);
                  }
                }}
                className="bg-transparent text-[11px] sm:text-xs font-black text-[#4B2C20] focus:outline-none cursor-pointer max-w-[80px] sm:max-w-[120px] truncate"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
                <option value="ADD_NEW">+ Bago...</option>
              </select>
            </div>

            {/* Stars Counter */}
            <div className="flex items-center gap-1 bg-white border border-[#FF8400] px-2.5 py-0.5 rounded-full shadow-inner">
              <span className="text-sm sm:text-base">⭐</span>
              <span className="text-xs sm:text-sm font-black text-[#FF8400]">{activeStudent.stars}</span>
            </div>

            {/* AI Voice Toggle */}
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              title={voiceEnabled ? 'Patayin ang Boses' : 'Buksan ang Boses'}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#FF8400] flex items-center justify-center transition-all ${
                voiceEnabled
                  ? 'bg-white text-[#FF8400] shadow-xs'
                  : 'bg-slate-200 text-slate-400 border-slate-300'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Modal for Adding New Student */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#FFFBEB] rounded-[32px] p-6 max-w-md w-full border-4 border-[#FF8400] shadow-2xl">
            <h3 className="text-xl font-black text-[#4B2C20] mb-2 flex items-center gap-2">
              <Users className="w-6 h-6 text-[#FF8400]" />
              Magdagdag ng Bagong Mag-aaral
            </h3>
            <p className="text-xs text-[#8B4513] font-bold mb-4">
              Isulat ang pangalan ng mag-aaral sa Baitang 1 para simulan ang kanyang talaan ng mga bituin at mga badge.
            </p>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[#4B2C20] uppercase tracking-wider mb-1">
                  Pangalan ng Mag-aaral
                </label>
                <input
                  type="text"
                  required
                  placeholder="Halimbawa: Juan Dela Cruz"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-[#FF8400] rounded-2xl focus:ring-2 focus:ring-[#FF8400] outline-none text-[#4B2C20] font-bold bg-white"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2 text-xs font-black text-[#8B4513] hover:bg-[#FFD93D]/30 rounded-full transition-colors"
                >
                  Kanselahin
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-black bg-[#FF8400] text-white rounded-full shadow-md hover:scale-105 transition-all"
                >
                  Idagdag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
