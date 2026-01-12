
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Project, ActivityLog, ResourceUnit, User, ProjectPhase } from './types';
import { INITIAL_PROJECTS, INITIAL_RESOURCES, USERS } from './constants';
import ProjectCard from './components/ProjectCard';
import Sidebar from './components/Sidebar';
import UserSelector from './components/UserSelector';
import AddProjectModal from './components/AddProjectModal';
import { getAIBriefing, getDailySummary } from './services/geminiService';

const App: React.FC = () => {
  // 核心狀態管理
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('cd-v-projects');
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch (e) {
      return INITIAL_PROJECTS;
    }
  });
  
  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem('cd-v-logs');
      if (!saved) return [];
      return JSON.parse(saved).map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) }));
    } catch (e) {
      return [];
    }
  });

  const [resources, setResources] = useState<ResourceUnit[]>(INITIAL_RESOURCES);
  const [pendingUpdate, setPendingUpdate] = useState<{ projectId: string; type: 'progress' | 'material' | 'phase'; value?: any } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // AI 相關狀態
  const [aiBriefing, setAiBriefing] = useState<string>('INIT_ANALYSIS_PROTOCOL...');
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [dailySummary, setDailySummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  
  // 系統時間
  const [sysTime, setSysTime] = useState(new Date());

  // 持久化存儲
  useEffect(() => {
    localStorage.setItem('cd-v-projects', JSON.stringify(projects));
    localStorage.setItem('cd-v-logs', JSON.stringify(logs));
  }, [projects, logs]);

  // 時鐘與初始化
  useEffect(() => {
    const timer = setInterval(() => setSysTime(new Date()), 1000);
    if (logs.length === 0) {
      addLog('sys', '系統', '指揮中心', '戰略控制台已在 Vercel 生態系完成熱布署');
    }
    refreshBriefing();
    return () => clearInterval(timer);
  }, []);

  const refreshBriefing = useCallback(async () => {
    if (isBriefingLoading) return;
    setIsBriefingLoading(true);
    const briefing = await getAIBriefing(projects, logs);
    setAiBriefing(briefing);
    setIsBriefingLoading(false);
  }, [projects, logs, isBriefingLoading]);

  const generateReport = async () => {
    if (isSummaryLoading) return;
    setIsSummaryLoading(true);
    const summary = await getDailySummary(logs);
    setDailySummary(summary);
    setIsSummaryLoading(false);
  };

  const addLog = (projectId: string, projectName: string, userName: string, action: string) => {
    const newLog: ActivityLog = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      projectId,
      projectName,
      userName,
      action,
      timestamp: new Date()
    };
    setLogs(prev => [newLog, ...prev].slice(0, 40));
  };

  const handleUpdateTrigger = (projectId: string, type: 'progress' | 'material' | 'phase', value?: any) => {
    setPendingUpdate({ projectId, type, value });
  };

  const confirmAction = (user: User) => {
    if (!pendingUpdate) return;

    const timestampStr = new Date().toLocaleTimeString([], { hour12: false });

    setProjects(prev => prev.map(p => {
      if (p.id === pendingUpdate.projectId) {
        let updatedProject = { ...p, lastUpdated: timestampStr };
        
        if (pendingUpdate.type === 'progress') {
          const nextIdx = Math.min(p.progress + 10, 100);
          let newPhase = p.currentPhase;
          if (nextIdx >= 100) newPhase = '完工結案';
          else if (nextIdx >= 85) newPhase = '測試驗收';
          else if (nextIdx >= 55) newPhase = '施工安裝';
          else if (nextIdx >= 25) newPhase = '材料準備';

          addLog(p.id, p.name, user.name, `進度遞增至 ${nextIdx}%`);
          updatedProject = { ...updatedProject, progress: nextIdx, currentPhase: newPhase, health: nextIdx === 100 ? 'normal' : p.health };
        } else if (pendingUpdate.type === 'material') {
          addLog(p.id, p.name, user.name, `🚨 發出材料鏈中斷預警！`);
          setResources(res => res.map(r => r.id === 'pu' ? { ...r, status: 'URGENT', message: `注意: ${p.name} 材料延宕` } : r));
          updatedProject = { ...updatedProject, health: 'missing_material' };
        } else if (pendingUpdate.type === 'phase') {
          const newPhase = pendingUpdate.value as ProjectPhase;
          addLog(p.id, p.name, user.name, `手動切換至階段: ${newPhase}`);
          
          let newProgress = p.progress;
          if (newPhase === '完工結案') newProgress = 100;
          else if (newPhase === '測試驗收' && newProgress < 85) newProgress = 85;
          else if (newPhase === '施工安裝' && newProgress < 55) newProgress = 55;
          else if (newPhase === '材料準備' && newProgress < 25) newProgress = 25;
          else if (newPhase === '現場勘查' && newProgress > 24) newProgress = 0;

          updatedProject = { ...updatedProject, currentPhase: newPhase, progress: newProgress, health: newPhase === '完工結案' ? 'normal' : p.health };
        }
        return updatedProject;
      }
      return p;
    }));
    setPendingUpdate(null);
  };

  const addNewProject = (newProject: any) => {
    const project: Project = { 
      ...newProject, 
      id: `PRJ-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      health: 'normal',
      lastUpdated: new Date().toLocaleTimeString([], { hour12: false })
    };
    setProjects(prev => [...prev, project]);
    addLog(project.id, project.name, 'HQ_ADMIN', '核准新部署計畫');
    setShowAddModal(false);
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex overflow-hidden tactical-glow">
      <main className="w-[70%] p-8 overflow-y-auto border-r border-slate-900 bg-slate-950 flex flex-col relative">
        {/* 背景裝飾 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[120px] pointer-events-none"></div>

        <header className="flex justify-between items-start mb-10 border-b border-slate-900 pb-10 relative shrink-0">
          <div className="flex items-center gap-8">
            <div className="group relative">
              <div className="absolute -inset-1 bg-amber-500 rounded-sm blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="w-24 h-24 bg-amber-500 flex items-center justify-center rounded-sm text-black font-black text-5xl italic border-4 border-amber-600/50 relative">CD</div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-4">
                <h1 className="text-6xl font-black tracking-tight uppercase flex items-center">
                  <span className="text-amber-500">成鼎電工</span> 
                  <span className="text-slate-800 text-4xl mx-4">/</span> 
                  <span className="tracking-widest text-4xl font-light">戰略控制台</span>
                </h1>
                <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-sm">
                  <span className="text-[10px] mono text-emerald-500 font-black animate-pulse uppercase tracking-[0.2em]">Live_Vercel</span>
                </div>
              </div>
              
              <div className="flex items-center gap-10 mt-6">
                <div className="flex flex-col">
                  <span className="text-[10px] mono text-slate-600 font-black uppercase tracking-widest mb-1">Current Sync Time</span>
                  <span className="text-xl mono text-slate-300 font-bold">{sysTime.toLocaleTimeString([], { hour12: false })}</span>
                </div>
                <div className="flex flex-col border-l border-slate-800 pl-8">
                  <span className="text-[10px] mono text-slate-600 font-black uppercase tracking-widest mb-1">Deployment Node</span>
                  <span className="text-xl mono text-amber-500/80 font-bold tracking-tighter">VRC-APAC-TPE-04</span>
                </div>
                <div className="flex flex-col border-l border-slate-800 pl-8">
                  <span className="text-[10px] mono text-slate-600 font-black uppercase tracking-widest mb-1">Active Projects</span>
                  <span className="text-xl mono text-slate-300 font-bold">{projects.filter(p => p.progress < 100).length} UNITS</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={generateReport}
              disabled={isSummaryLoading}
              className={`group px-8 py-5 bg-slate-900 hover:bg-slate-800 text-slate-100 font-black rounded-sm border border-slate-800 active:translate-y-0.5 transition-all text-xs uppercase flex items-center gap-4 shadow-xl ${isSummaryLoading ? 'opacity-50' : ''}`}
            >
              <div className={`w-2 h-2 rounded-full ${isSummaryLoading ? 'bg-amber-500 animate-ping' : 'bg-slate-700 group-hover:bg-amber-500'}`}></div>
              {isSummaryLoading ? 'COMPILING...' : '生成戰略簡報'}
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-10 py-5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-sm border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all text-xs uppercase flex items-center gap-4 shadow-[0_10px_40px_-10px_rgba(245,158,11,0.3)]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4"></path></svg>
              初始化新案場
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
          {dailySummary && (
            <div className="mb-12 p-10 bg-slate-900/40 border border-amber-500/20 rounded-sm relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="absolute top-0 left-0 w-2 h-full bg-amber-500/40"></div>
              <button onClick={() => setDailySummary(null)} className="absolute top-6 right-6 text-slate-600 hover:text-amber-500 transition-colors p-2 text-xl">✕</button>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-3 h-3 bg-amber-500 animate-pulse shadow-[0_0_10px_#f59e0b]"></div>
                <h3 className="text-amber-500 font-black uppercase tracking-[0.4em] text-sm mono">AI Strategic Intelligence Report</h3>
                <div className="flex-1 h-[1px] bg-slate-800"></div>
              </div>

              <div className="text-lg text-slate-300 leading-relaxed italic border-l-2 border-slate-800 pl-8 py-2 whitespace-pre-line font-medium tracking-tight">
                {dailySummary}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 pb-16">
            {projects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onProgressClick={() => handleUpdateTrigger(project.id, 'progress')} 
                onEmergencyClick={() => handleUpdateTrigger(project.id, 'material')}
                onPhaseClick={(phase) => handleUpdateTrigger(project.id, 'phase', phase)}
              />
            ))}
          </div>
        </div>
        
        <footer className="mt-auto pt-6 border-t border-slate-900 flex justify-between items-center shrink-0">
          <div className="flex gap-8">
            <p className="text-[10px] mono text-slate-700 uppercase font-black tracking-[0.2em] italic flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
              Secure Data Link: Stable
            </p>
            <p className="text-[10px] mono text-slate-700 uppercase font-black tracking-[0.2em] italic flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
              Node.js Runtime: v24.x Ready
            </p>
          </div>
          <p className="text-[10px] mono text-slate-800 uppercase font-bold">
            © 2025 CD Electric Tactical Div.
          </p>
        </footer>
      </main>

      <Sidebar 
        resources={resources} 
        logs={logs} 
        aiBriefing={aiBriefing} 
        isBriefingLoading={isBriefingLoading}
        onRefreshBriefing={refreshBriefing}
      />

      {pendingUpdate && (
        <UserSelector 
          onSelect={confirmAction} 
          onCancel={() => setPendingUpdate(null)} 
        />
      )}

      {showAddModal && (
        <AddProjectModal 
          onAdd={addNewProject} 
          onCancel={() => setShowAddModal(false)} 
        />
      )}
    </div>
  );
};

export default App;
