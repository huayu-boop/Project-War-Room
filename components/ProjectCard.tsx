
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
      case 'missing_material': return 'bg-orange-500 shadow-[0_0_12px_#f97316] animate-pulse';
      case 'blocked': return 'bg-red-500 shadow-[0_0_12px_#ef4444] animate-ping';
      default: return 'bg-cyan-500 shadow-[0_0_12px_#06b6d4]';
    }
  };

  return (
    <div className={`bg-slate-900/60 border-l-4 p-8 rounded shadow-2xl relative overflow-hidden group transition-all ${project.health === 'missing_material' ? 'border-orange-500 bg-orange-500/5' : 'border-amber-500'}`}>
      {/* 背景裝飾 */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(rgba(251,191,36,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.1)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

      {/* 狀態燈號 */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className="text-[9px] mono text-slate-500 font-bold uppercase">{project.health === 'normal' ? 'OPERATIONAL' : 'ALERT'}</span>
        <div className={`w-3 h-3 rounded-full ${getHealthColor()}`}></div>
      </div>

      <div className="mb-6">
        <span className="text-[10px] mono text-amber-500/60 font-bold block mb-1">PROJ-ID: {project.id.slice(-6).toUpperCase()}</span>
        <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight">{project.name}</h3>
      </div>

      {/* 階段追蹤 (可點擊) */}
      <div className="mb-8 bg-black/40 p-5 rounded-xl border border-white/5">
        <div className="flex justify-between items-center mb-1 px-1">
          <span className="text-[9px] mono text-slate-600 font-black uppercase tracking-widest">Construction Lifecycle</span>
          <span className="text-[9px] mono text-amber-500/40 font-bold animate-pulse">Select phase to jump ➔</span>
        </div>
        <div className="flex justify-between items-center">
          {phases.map((p, i) => (
            <div 
              key={p} 
              className="flex flex-col items-center gap-2 flex-1 relative group/phase cursor-pointer"
              onClick={() => onPhaseClick(p)}
            >
              <div className={`w-4 h-4 rounded-full border-2 z-10 transition-all duration-300 group-hover/phase:scale-150 ${i <= currentIdx ? 'bg-amber-500 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'border-slate-700 bg-slate-900 group-hover/phase:border-amber-500/50'}`}></div>
              <span className={`text-[9px] font-black transition-colors ${i === currentIdx ? 'text-amber-500' : 'text-slate-600 group-hover/phase:text-slate-400'}`}>{p}</span>
              
              {/* 連接線 */}
              {i < phases.length - 1 && (
                <div className={`absolute left-[50%] top-2 w-full h-[2px] -z-0 ${i < currentIdx ? 'bg-amber-500/50' : 'bg-slate-800'}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* 進度條 */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[10px] font-bold text-slate-500 mono uppercase">Current Progress</span>
          <span className="text-3xl font-black text-amber-500 mono">{project.progress}%</span>
        </div>
        <div 
          onClick={onProgressClick}
          className="h-14 w-full bg-black border-2 border-slate-800 p-1 rounded-xl cursor-pointer active:scale-[0.98] transition-all group/bar"
        >
          <div 
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg relative overflow-hidden transition-all duration-1000" 
            style={{ width: `${project.progress}%` }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[size:20px_20px]"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-800/50">
        <div>
          <span className="text-[10px] text-slate-500 mono block mb-1 uppercase">負責人員 TEAM</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {project.responsibleTeam.map((member, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-bold rounded">
                👤 {member}
              </span>
            ))}
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 mono block mb-1 uppercase">下一步任務 NEXT</span>
          <p className="text-xs font-bold text-amber-500/80">➔ {project.nextStep}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button 
          onClick={onEmergencyClick}
          className={`px-4 py-2 rounded font-black text-[10px] uppercase transition-all flex items-center gap-2 ${project.health === 'missing_material' ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-800 text-orange-500 border border-orange-500/30 hover:bg-orange-500/10'}`}
        >
          🚨 缺料通報
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
