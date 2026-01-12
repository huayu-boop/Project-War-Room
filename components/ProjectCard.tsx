
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
      case 'missing_material': return 'bg-orange-500 shadow-[0_0_20px_#f97316]';
      case 'blocked': return 'bg-red-500 shadow-[0_0_20px_#ef4444] animate-ping';
      default: return 'bg-emerald-500 shadow-[0_0_12px_#10b981]';
    }
  };

  return (
    <div className={`group bg-slate-900/40 border-l-2 border-slate-800 p-10 rounded-sm shadow-2xl relative overflow-hidden transition-all duration-500 hover:bg-slate-900/60 hover:border-amber-500/50 ${project.health === 'missing_material' ? 'bg-orange-500/5' : ''}`}>
      {/* 戰術網格 */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

      {/* 頂部狀態欄 */}
      <div className="absolute top-6 right-6 flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-[8px] mono text-slate-600 font-black uppercase tracking-widest mb-1">Status Link</span>
          <div className="flex items-center gap-3">
             <span className="text-[10px] mono text-slate-400 font-bold uppercase">{project.health === 'normal' ? 'Active' : 'Warning'}</span>
             <div className={`w-2.5 h-2.5 rounded-full ${getHealthColor()} transition-all duration-300`}></div>
          </div>
        </div>
        {project.lastUpdated && (
          <div className="flex flex-col items-end border-l border-slate-800 pl-6">
            <span className="text-[8px] mono text-slate-600 font-black uppercase tracking-widest mb-1">Last Sync</span>
            <span className="text-[10px] mono text-slate-400 font-bold">{project.lastUpdated}</span>
          </div>
        )}
      </div>

      <header className="mb-10">
        <span className="text-[10px] mono text-amber-500/50 font-black block mb-2 tracking-[0.3em]">REF_ID: {project.id}</span>
        <h3 className="text-3xl font-black text-slate-100 uppercase tracking-tight group-hover:text-amber-500 transition-colors duration-300">{project.name}</h3>
      </header>

      {/* 階段視覺化 */}
      <div className="mb-10 bg-black/40 p-6 rounded-sm border border-white/5 relative">
        <div className="flex justify-between items-center mb-5">
          <span className="text-[9px] mono text-slate-500 font-black uppercase tracking-widest">Operational Phasing</span>
          <div className="flex-1 mx-6 h-[1px] bg-slate-800"></div>
          <span className="text-[9px] mono text-amber-500 font-black uppercase tracking-widest animate-pulse">Live</span>
        </div>
        <div className="flex justify-between items-center relative px-2">
          {phases.map((p, i) => (
            <div 
              key={p} 
              className="flex flex-col items-center gap-3 flex-1 relative group/phase cursor-pointer z-10"
              onClick={() => onPhaseClick(p)}
            >
              <div className={`w-4 h-4 rounded-sm border-2 transform rotate-45 transition-all duration-500 ${i <= currentIdx ? 'bg-amber-500 border-amber-400 shadow-[0_0_15px_#f59e0b]' : 'border-slate-800 bg-slate-950 group-hover/phase:border-amber-500/40'}`}></div>
              <span className={`text-[9px] font-black tracking-tighter transition-all ${i === currentIdx ? 'text-amber-500 scale-110' : 'text-slate-700 group-hover/phase:text-slate-400'}`}>{p}</span>
              
              {i < phases.length - 1 && (
                <div className={`absolute left-[50%] top-2 w-full h-[2px] -z-10 transition-colors duration-700 ${i < currentIdx ? 'bg-amber-500/40' : 'bg-slate-800/50'}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* 進度核心 */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-500 mono uppercase tracking-widest">Execution Progress</span>
            {project.progress === 100 && <span className="text-[8px] bg-emerald-500 text-black px-2 py-0.5 font-black rounded-full animate-bounce">COMPLETED</span>}
          </div>
          <span className="text-4xl font-black text-amber-500 mono tracking-tighter italic">{project.progress}%</span>
        </div>
        <div 
          onClick={onProgressClick}
          className="h-14 w-full bg-slate-950 border border-slate-800 p-1.5 rounded-sm cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden group/bar"
        >
          <div 
            className="h-full bg-gradient-to-r from-amber-600 to-amber-500 relative transition-all duration-1000 ease-out" 
            style={{ width: `${project.progress}%` }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] bg-[size:1000px_100%] animate-shimmer"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/bar:opacity-100 transition-opacity">
            <span className="text-[10px] font-black text-white mono tracking-[1em] uppercase">Advance Progress +10%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-800/50">
        <div>
          <span className="text-[10px] text-slate-600 mono block mb-3 uppercase tracking-widest font-black">Field Engineers</span>
          <div className="flex flex-wrap gap-2">
            {project.responsibleTeam.map((member, idx) => (
              <span key={idx} className="px-3 py-1 bg-slate-800/80 border border-slate-700/50 text-slate-300 text-[10px] font-bold rounded-sm uppercase tracking-tight flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_#f59e0b]"></div>
                {member}
              </span>
            ))}
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-600 mono block mb-3 uppercase tracking-widest font-black">Strategic Objective</span>
          <div className="p-3 bg-black/20 border border-slate-800 rounded-sm">
            <p className="text-[11px] font-bold text-slate-400 group-hover:text-amber-500 transition-colors flex gap-2">
               <span className="text-amber-500">▶</span> {project.nextStep}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <div className="flex gap-2">
          {project.supportNeeded.length > 0 ? project.supportNeeded.slice(0, 2).map((s, i) => (
            <span key={i} className="text-[9px] mono text-orange-500/80 bg-orange-500/5 px-3 py-1 border border-orange-500/20 uppercase font-black">
              Req: {s}
            </span>
          )) : (
            <span className="text-[9px] mono text-emerald-500/40 px-3 py-1 border border-emerald-500/10 uppercase font-black">
              Resources Stable
            </span>
          )}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onEmergencyClick(); }}
          className={`px-6 py-3 rounded-sm font-black text-[10px] uppercase transition-all duration-300 flex items-center gap-3 border-2 ${project.health === 'missing_material' ? 'bg-orange-600 text-white border-orange-400 shadow-[0_0_30px_rgba(249,115,22,0.4)]' : 'bg-slate-900 text-orange-500 border-orange-500/20 hover:border-orange-500/50'}`}
        >
          <span className={project.health === 'missing_material' ? 'animate-pulse' : ''}>🚨</span> 缺料通報
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
