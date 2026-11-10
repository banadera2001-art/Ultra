import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { BADGES } from '../data/badgesData';
import { getPetById } from '../data/petsData';
import { speakTagalog } from '../services/speechService';
import { playBadgeUnlockSound } from '../services/soundEffects';
import { Award, Users, Star, BookOpen, PenTool, Calculator, Plus, Trash2, CheckCircle, Clock } from 'lucide-react';

interface RosterSlideProps {
  students: StudentProfile[];
  activeStudent: StudentProfile;
  onSelectStudent: (id: string) => void;
  onAddStudent: (name: string) => void;
  onDeleteStudent: (id: string) => void;
  onUpdateAvatar: (id: string, avatar: string) => void;
}

const AVATAR_OPTIONS = ['👧', '👦', '🎒', '🦉', '🦊', '🦁', '🐯', '🐼', '🚀', '👑'];

export const RosterSlide: React.FC<RosterSlideProps> = ({
  students,
  activeStudent,
  onSelectStudent,
  onAddStudent,
  onDeleteStudent,
  onUpdateAvatar,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  const activePet = activeStudent.ownedPets?.find((p) => p.petId === activeStudent.activePetId) || activeStudent.ownedPets?.[0];
  const activePetDef = activePet ? getPetById(activePet.petId) : undefined;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudentName.trim()) {
      onAddStudent(newStudentName.trim());
      setNewStudentName('');
      setShowAddForm(false);
    }
  };

  const handleBadgeClick = (badgeTitle: string, badgeDescription: string, isUnlocked: boolean) => {
    playBadgeUnlockSound();
    if (isUnlocked) {
      speakTagalog(`Nakuha mo ang badge na: ${badgeTitle}! ${badgeDescription}`);
    } else {
      speakTagalog(`Badge: ${badgeTitle}. ${badgeDescription}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">

      {/* Profile Summary Card */}
      <div className="bg-gradient-to-r from-[#FF8400] via-[#FFD93D] to-[#F472B6] text-white rounded-[36px] p-6 sm:p-8 shadow-xl relative overflow-hidden border-4 border-white">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          
          {/* Avatar & Name */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-4 border-[#FF8400] flex items-center justify-center text-4xl sm:text-5xl shadow-lg text-slate-800">
                {activeStudent.avatar}
              </div>

              {/* Quick Avatar Change Dropdown */}
              <div className="absolute -bottom-1 -right-1 bg-white text-[#4B2C20] rounded-full p-1 border-2 border-[#FF8400] shadow-md opacity-90 hover:opacity-100 cursor-pointer">
                <select
                  value={activeStudent.avatar}
                  onChange={(e) => onUpdateAvatar(activeStudent.id, e.target.value)}
                  className="bg-transparent text-xs font-black cursor-pointer focus:outline-none"
                  title="Baguhin ang Avatar"
                >
                  {AVATAR_OPTIONS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <span className="bg-white text-[#FF8400] font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                Aktibong Mag-aaral
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-1 text-[#4B2C20] drop-shadow-xs">
                {activeStudent.name}
              </h2>
              <p className="text-xs text-white font-extrabold uppercase tracking-wider mt-0.5">
                {activeStudent.gradeLevel} • Pangkat {activeStudent.activeGroup} Marungko Level
              </p>
            </div>
          </div>

          {/* Stars Badge & Stats */}
          <div className="flex items-center gap-4 bg-white/30 backdrop-blur-md p-4 rounded-3xl border-2 border-white/60">
            <div className="text-center">
              <span className="text-[10px] text-[#4B2C20] font-black block uppercase tracking-wider">NAKULITANG BITUIN</span>
              <div className="flex items-center justify-center gap-1.5 text-3xl font-black text-white drop-shadow-sm mt-0.5">
                <span className="text-3xl animate-bounce">⭐</span>
                <span className="text-[#4B2C20] font-black">{activeStudent.stars}</span>
              </div>
            </div>

            <div className="w-0.5 h-10 bg-white/50" />

            <div className="text-center">
              <span className="text-[10px] text-[#4B2C20] font-black block uppercase tracking-wider">MGA ALAGA</span>
              <div className="flex items-center justify-center gap-1.5 text-2xl font-black text-[#4B2C20] mt-0.5">
                <span>{activePetDef ? activePetDef.emoji : '🐾'}</span>
                <span className="font-black text-xl">{activeStudent.ownedPets?.length || 0}</span>
              </div>
            </div>

            <div className="w-0.5 h-10 bg-white/50" />

            <div className="text-center">
              <span className="text-[10px] text-[#4B2C20] font-black block uppercase tracking-wider">BADGES</span>
              <div className="flex items-center justify-center gap-1.5 text-2xl font-black text-[#4B2C20] mt-0.5">
                <Award className="w-7 h-7 text-[#FF8400]" />
                <span className="font-black text-xl">{activeStudent.unlockedBadges.length} / {BADGES.length}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Detailed Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t-2 border-white/40">
          
          <div className="bg-white/30 p-3.5 rounded-2xl border-2 border-white/50 flex items-center gap-3 text-[#4B2C20]">
            <BookOpen className="w-8 h-8 text-[#FF8400] shrink-0" />
            <div>
              <span className="text-[10px] font-black uppercase block">Wastong Pagbasa</span>
              <span className="text-lg font-black">{activeStudent.readingAccuracy}% Katumpakan</span>
            </div>
          </div>

          <div className="bg-white/30 p-3.5 rounded-2xl border-2 border-white/50 flex items-center gap-3 text-[#4B2C20]">
            <PenTool className="w-8 h-8 text-[#3B82F6] shrink-0" />
            <div>
              <span className="text-[10px] font-black uppercase block">Linis sa Pagsulat</span>
              <span className="text-lg font-black">{activeStudent.writingScore}% Pagsunod</span>
            </div>
          </div>

          <div className="bg-white/30 p-3.5 rounded-2xl border-2 border-white/50 flex items-center gap-3 text-[#4B2C20]">
            <Calculator className="w-8 h-8 text-[#15803D] shrink-0" />
            <div>
              <span className="text-[10px] font-black uppercase block">Nalutas sa Math</span>
              <span className="text-lg font-black">{activeStudent.mathSolvedCount} mga Tanong</span>
            </div>
          </div>

        </div>

      </div>

      {/* Badges Showcase Section */}
      <div className="bg-white rounded-[32px] p-6 border-4 border-[#F472B6] shadow-lg space-y-4">
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-[#4B2C20] flex items-center gap-2">
              <Award className="w-6 h-6 text-[#F472B6]" />
              Mga Badge at Gantimpala (Reward System)
            </h3>
            <p className="text-xs font-bold text-[#8B4513]">
              Pindutin ang bawat badge para pakinggan ang paliwanag nito sa Tagalog.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {BADGES.map((badge) => {
            const isUnlocked = activeStudent.unlockedBadges.includes(badge.id);

            return (
              <div
                key={badge.id}
                onClick={() => handleBadgeClick(badge.titleTagalog, badge.description, isUnlocked)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer hover:scale-102 ${
                  isUnlocked
                    ? 'bg-[#FFF5F8] border-[#F472B6] shadow-md'
                    : 'bg-[#FFFBEB] border-slate-200 opacity-60 hover:opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border-2 shadow-xs ${
                      isUnlocked
                        ? 'bg-[#F472B6] border-[#F472B6] text-white'
                        : 'bg-slate-200 border-slate-300 text-slate-400'
                    }`}
                  >
                    {badge.icon}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm text-[#4B2C20]">{badge.titleTagalog}</h4>
                      {isUnlocked && (
                        <span className="text-[10px] font-black bg-[#F472B6] text-white px-2 py-0.5 rounded-full">
                          Nakuha na!
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#8B4513] font-semibold line-clamp-2">{badge.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Student Roster Management Section */}
      <div className="bg-white rounded-[32px] p-6 border-4 border-[#FF8400] shadow-lg space-y-4">
        
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-[#4B2C20] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#FF8400]" />
            Talaan ng mga Mag-aaral (Student Roster)
          </h3>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 bg-[#FF8400] hover:bg-orange-600 text-white px-5 py-2 rounded-full text-xs font-black transition-all shadow-md hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Bagong Mag-aaral</span>
          </button>
        </div>

        {/* Add Student Form */}
        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="bg-[#FFFBEB] p-4 rounded-2xl border-2 border-[#FF8400] flex items-center gap-3">
            <input
              type="text"
              required
              placeholder="Isulat ang pangalan (hal. Maria Santos)"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="flex-1 px-4 py-2 text-xs font-bold border-2 border-[#FF8400] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8400] bg-white text-[#4B2C20]"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-[#FF8400] text-white text-xs font-black rounded-full hover:scale-105 transition-all shadow-sm"
            >
              Idagdag
            </button>
          </form>
        )}

        {/* Roster Cards List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {students.map((student) => {
            const isActive = student.id === activeStudent.id;

            return (
              <div
                key={student.id}
                onClick={() => onSelectStudent(student.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  isActive
                    ? 'bg-[#FFFBEB] border-[#FF8400] shadow-md'
                    : 'bg-white border-slate-200 hover:bg-[#FFFBEB]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{student.avatar}</span>
                  <div>
                    <h4 className="font-black text-sm text-[#4B2C20]">{student.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[#FF8400] font-black flex items-center gap-0.5">
                        ⭐ {student.stars}
                      </span>
                      <span className="text-xs text-purple-700 font-bold flex items-center gap-0.5">
                        🐾 {student.ownedPets?.length || 0} alaga
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isActive && (
                    <span className="text-[10px] font-black text-white bg-[#FF8400] px-2.5 py-0.5 rounded-full uppercase">
                      Aktibo
                    </span>
                  )}
                  {students.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Sigurado ka bang buburahin si ${student.name}?`)) {
                          onDeleteStudent(student.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Burahin"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Practice History Activity Logs */}
      <div className="bg-white rounded-[32px] p-6 border-4 border-[#60A5FA] shadow-lg space-y-4">
        
        <h3 className="text-lg font-black text-[#1E3A8A] flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#60A5FA]" />
          Kasanayan at Kasaysayan ng Pagsasanay (Practice History)
        </h3>

        {activeStudent.history && activeStudent.history.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
            {activeStudent.history.slice().reverse().map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl border-2 border-[#60A5FA]/30 bg-[#EFF6FF] flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-black uppercase text-[10px] px-2 py-0.5 rounded-full ${
                        item.type === 'reading'
                          ? 'bg-[#FF8400] text-white'
                          : item.type === 'writing'
                          ? 'bg-[#60A5FA] text-white'
                          : 'bg-[#4ADE80] text-white'
                      }`}
                    >
                      {item.type === 'reading' ? 'Pagbasa' : item.type === 'writing' ? 'Pagsulat' : 'Math'}
                    </span>
                    <span className="font-black text-[#1E3A8A] text-sm">"{item.target}"</span>
                  </div>
                  <p className="text-[#1E3A8A]/80 font-bold">{item.feedback}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-black text-[#FF8400] bg-white px-2.5 py-1 rounded-full border border-[#FF8400]">
                    Marka: {item.score}%
                  </span>
                  <span className="block text-[10px] text-slate-400 font-bold mt-1">{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-[#8B4513] text-xs font-black">
            Wala pang naitalang kasaysayan ng pagsasanay. Magsimula nang magbasa o magsulat!
          </div>
        )}

      </div>

    </div>
  );
};
