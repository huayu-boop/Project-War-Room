
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
    <aside className="w-[30%] h-full bg-slate-950/95 backdrop-blur-xl flex flex-col p-8 border-l border-slate-900 relative shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
      
      {/* Tactical Status Header */}
      <div className="flex justify-between items-end mb-8 border-b border-slate-900 pb-4">
        <div>
          <h4 className="text-[10px] font-black mono text-slate-500 tracking-[0.3em] uppercase mb-1">Satellite Link</h4>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`w-1 h-3 rounded-full ${i <= 4 ? 'bg-amber-500 shadow-[0_0_5px_#f59e0b]' : 'bg-slate-800'}`}></div>
            ))}
          </div>
        </div>
        <div className="text-right">
          <span className="text-[9px] mono text-slate-600 block">ENCRYPTION: AES-256</span>
          <span className="text-[9px] mono text-amber-500/60 font-black">LATENCY: 14ms</span>
        </div>
      </div>

      {/* AI Strategy Briefing */}
      <div className="mb-10 group">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-[11px] font-black mono text-amber-500/80 tracking-[0.25em] uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 animate-pulse"></span>
            Tactical Feed
          </h4>
          <button 
            onClick={onRefreshBriefing}
            disabled={isBriefingLoading}
            className={`p-2 text-slate-600 hover:text-amber-500 transition-all rounded-full hover:bg-slate-900 ${isBriefingLoading ? 'animate-spin' : ''}`}
            title="Refresh Analysis"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>
        </div>
        <div className="relative p-5 bg-slate-900/40 border border-slate-800/60 rounded-sm overflow-hidden min-h-[120px]">
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-500/20"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-500/20"></div>
          <div className={`text-xs text-slate-400 leading-relaxed font-bold mono italic whitespace-pre-wrap transition-opacity duration-300 ${isBriefingLoading ? 'opacity-30' : 'opacity-100'}`}>
            {isBriefingLoading ? 'INTERCEPTING_SIGNALS...' : aiBriefing}
          </div>
          {isBriefingLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      {/* Logistics Status */}
      <div className="mb-10">
        <h4 className="text-[11px] font-black mono text-slate-500 mb-5 uppercase tracking-[0.25em]">Logistics Grid</h4>
        <div className="grid grid-cols-1 gap-4">
          {resources.map(res => {
            const isUrgent = res.status === 'URGENT';
            const statusColor = 
              isUrgent ? 'bg-orange-500 shadow-[0_0_15px_#f97316]' :
              res.status === 'Ready' || res.status === 'Available' ? 'bg-emerald-500' : 'bg-red-600';
            
            return (
              <div key={res.id} className={`p-4 rounded-sm border transition-all relative overflow-hidden ${isUrgent ? 'bg-orange-500/5 border-orange-500/40' : 'bg-slate-900/30 border-slate-800/40 hover:border-slate-700/80'}`}>
                {isUrgent && <div className="absolute top-0 left-0 w-full h-0.5 bg-orange-500 animate-pulse"></div>}
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-black text-slate-100 uppercase tracking-tighter">{res.category}</span>
                  <div className={`px-1.5 py-0.5 rounded-sm border ${isUrgent ? 'border-orange-500/50 text-orange-500' : 'border-slate-800 text-slate-500'} text-[8px] mono font-black uppercase`}>
                    {res.status}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${statusColor} ${isUrgent ? 'animate-ping' : ''}`}></div>
                  <p className="text-[10px] text-slate-600 italic font-bold leading-tight">{res.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Logs */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <h4 className="text-[11px] font-black mono text-slate-500 mb-5 uppercase tracking-[0.25em]">Comms Log</h4>
        <div className="flex-1 overflow-y-auto pr-3 space-y-4 custom-scrollbar">
          {logs.map((log) => (
            <div key={log.id} className="relative pl-4 group">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-800 group-hover:bg-amber-500/40 transition-colors"></div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{log.userName}</span>
                <span className="text-[9px] mono text-slate-600 font-bold tracking-tighter">
                  {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-normal group-hover:text-slate-200 transition-colors">
                <span className="text-slate-700 mr-2">>></span>
                {log.action}
                {log.projectId !== 'sys' && <span className="text-slate-700 ml-2 italic text-[9px] font-black">[{log.projectName}]</span>}
              </p>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center py-10 opacity-20 mono text-[10px] uppercase font-bold tracking-widest">
              No Comms Intercepted
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
