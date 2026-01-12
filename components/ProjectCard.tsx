
import React from 'react';
import { Project, ProjectPhase } from '../types';

interface ProjectCardProps {
  project: Project;
  onProgressClick: () => void;
  onEmergencyClick: () => void;
  onPhaseClick: (phase: ProjectPhase) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onProgressClick, onEmergencyClick, onPhaseClick }) => {
  const phases: ProjectPhase[] = ['現場勘查', '材料準備', '施工安裝', '測試驗收', '完工結案'];
  const currentIdx = phases.indexOf(project.currentPhase);

  const getHealthColor = () => {
    switch(project.health) {
      case 'missing_material': return 'bg-orange-500 shadow-[0_0_15px_#f97316] animate-pulse';
      case 'blocked': return 'bg-red-500 shadow-[0_0_15px_#ef4444] animate-ping';
      default: return 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]';
    }
  };

  return (
    <div className={`bg-slate-900/40 border-l border-slate-800 p-8 rounded-sm shadow-2xl relative overflow-hidden group transition-all hover:bg-slate-900/60 ${project.health === 'missing_material' ? 'border-orange-500/40 bg-orange-500/5' : ''}`}>
      {/* 網格背景 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* 狀態燈與時間 */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[8px] mono text-slate-500 font-bold uppercase tracking-widest">{project.health === 'normal' ? 'LOCKED' : 'ALERT'}</span>
          <div className={`w-2.5 h-2.5 rounded-full ${getHealthColor()}`}></div>
        </div>
        {project.lastUpdated && (
          <span className="text-[8px] mono text-slate-600">SYNC: {project.lastUpdated}</span>
        )}
      </div>

      <div className="mb-6 relative">
        <span className="text-[9px] mono text-amber-500/40 font-bold block mb-1 tracking-[0.2em]">CASE-REF: {project.id.slice(-8).toUpperCase()}</span>
        <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight leading-none group-hover:text-amber-500 transition-colors">{project.name}</h3>
      </div>

      {/* 階段切換器 */}
      <div className="mb-8 bg-black/60 p-5 rounded border border-white/5 shadow-inner">
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-[8px] mono text-slate-600 font-black uppercase tracking-[0.3em]">Operational Phase</span>
          <div className="h-[1px] flex-1 mx-4 bg-slate-800/50"></div>
          <span className="text-[8px] mono text-amber-500/30 font-bold">CLICK TO DEPLOY</span>
        </div>
        <div className="flex justify-between items-center relative">
          {phases.map((p, i) => (
            <div 
              key={p} 
              className="flex flex-col items-center gap-2 flex-1 relative group/phase cursor-pointer z-10"
              onClick={() => onPhaseClick(p)}
            >
              <div className={`w-3.5 h-3.5 rounded-sm border transform rotate-45 transition-all duration-300 group-hover/phase:scale-125 ${i <= currentIdx ? 'bg-amber-500 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]' : 'border-slate-800 bg-slate-900 group-hover/phase:border-amber-500/50'}`}></div>
              <span className={`text-[8px] font-black tracking-tighter transition-colors mt-1 ${i === currentIdx ? 'text-amber-500' : 'text-slate-600 group-hover/phase:text-slate-400'}`}>{p}</span>
              
              {i < phases.length - 1 && (
                <div className={`absolute left-[50%] top-1.5 w-full h-[1px] -z-10 ${i < currentIdx ? 'bg-amber-500/30' : 'bg-slate-800'}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* 進度系統 */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[9px] font-bold text-slate-500 mono uppercase tracking-widest">Efficiency Rating</span>
          <span className="text-3xl font-black text-amber-500 mono leading-none">{project.progress}%</span>
        </div>
        <div 
          onClick={onProgressClick}
          className="h-10 w-full bg-slate-950 border border-slate-800 p-1 rounded-sm cursor-pointer active:scale-[0.99] transition-all"
        >
          <div 
            className="h-full bg-gradient-to-r from-amber-600 to-amber-500 relative overflow-hidden transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
            style={{ width: `${project.progress}%` }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.15)_50%,transparent_100%)] bg-[size:200%_100%] animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-800/40">
        <div>
          <span className="text-[9px] text-slate-600 mono block mb-2 uppercase tracking-widest font-black">Operator Assigned</span>
          <div className="flex flex-wrap gap-1.5">
            {project.responsibleTeam.map((member, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-slate-800/50 border border-slate-700/50 text-slate-300 text-[9px] font-bold rounded-sm uppercase flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                {member}
              </span>
            ))}
          </div>
        </div>
        <div>
          <span className="text-[9px] text-slate-600 mono block mb-2 uppercase tracking-widest font-black">Target Objective</span>
          <p className="text-[11px] font-bold text-slate-400 group-hover:text-amber-500/80 transition-colors">➔ {project.nextStep}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="flex gap-1.5">
          {project.supportNeeded.slice(0, 2).map((s, i) => (
            <span key={i} className="text-[8px] mono text-orange-500/60 bg-orange-500/5 px-2 py-0.5 border border-orange-500/10 uppercase">NEED: {s}</span>
          ))}
        </div>
        <button 
          onClick={onEmergencyClick}
          className={`px-4 py-2 rounded-sm font-black text-[9px] uppercase transition-all flex items-center gap-2 border ${project.health === 'missing_material' ? 'bg-orange-600 text-white border-orange-400 shadow-lg' : 'bg-slate-900 text-orange-500 border-orange-500/20 hover:border-orange-500/50'}`}
        >
          <span className="animate-pulse">🚨</span> 缺料通報
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
