
import React from 'react';
import { ResourceUnit, ActivityLog } from '../types';

interface SidebarProps {
  resources: ResourceUnit[];
  logs: ActivityLog[];
  aiBriefing: string;
  isBriefingLoading: boolean;
  onRefreshBriefing: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ resources, logs, aiBriefing, isBriefingLoading, onRefreshBriefing }) => {
  return (
    <aside className="w-[30%] h-full bg-slate-900/40 backdrop-blur-2xl flex flex-col p-6 border-l border-slate-800">
      
      {/* AI Strategy Briefing */}
      <div className="mb-8 bg-indigo-950/20 p-5 rounded-xl border border-indigo-500/20">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-[10px] font-black mono text-indigo-400 tracking-[0.2em] uppercase">Intelligence feed</h4>
          <button 
            onClick={onRefreshBriefing}
            className={`p-1 text-indigo-400 hover:text-indigo-200 transition-colors ${isBriefingLoading ? 'animate-spin' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>
        </div>
        <div className="text-xs text-slate-400 leading-relaxed italic mono whitespace-pre-wrap">
          {isBriefingLoading ? 'Analyzing battlefield data...' : aiBriefing}
        </div>
      </div>

      {/* Logistics Status */}
      <div className="mb-8">
        <h4 className="text-[10px] font-black mono text-slate-500 mb-4 uppercase">後勤資源狀態 (RESOURCES)</h4>
        <div className="space-y-3">
          {resources.map(res => {
            const isUrgent = res.status === 'URGENT';
            const statusColor = 
              isUrgent ? 'bg-orange-500 shadow-[0_0_10px_#f97316]' :
              res.status === 'Ready' || res.status === 'Available' ? 'bg-green-500' : 'bg-red-500';
            
            return (
              <div key={res.id} className={`p-4 rounded border transition-all ${isUrgent ? 'bg-orange-500/10 border-orange-500/50 animate-pulse' : 'bg-slate-900/50 border-slate-800/50'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-200">{res.category}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black mono uppercase ${isUrgent ? 'text-orange-500' : 'text-slate-500'}`}>{res.status}</span>
                    <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 italic line-clamp-1">{res.message}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Logs */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <h4 className="text-[10px] font-black mono text-slate-500 mb-4 uppercase">施工日誌 (LOGS)</h4>
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-slate-800/20 p-4 rounded border-l-2 border-slate-700 hover:border-amber-500/30 transition-all group">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-amber-500 group-hover:text-amber-400">{log.userName}</span>
                <span className="text-[9px] mono text-slate-600">{log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                {log.action}
                {log.projectId !== 'sys' && <span className="text-slate-500 ml-1">@ {log.projectName}</span>}
              </p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
