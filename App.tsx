
import React, { useState, useEffect, useCallback } from 'react';
import { Project, ActivityLog, ResourceUnit, User, ProjectPhase } from './types';
import { INITIAL_PROJECTS, INITIAL_RESOURCES, USERS } from './constants';
import ProjectCard from './components/ProjectCard';
import Sidebar from './components/Sidebar';
import UserSelector from './components/UserSelector';
import AddProjectModal from './components/AddProjectModal';
import { getAIBriefing, getDailySummary } from './services/geminiService';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('cd-projects');
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch (e) {
      return INITIAL_PROJECTS;
    }
  });
  
  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem('cd-logs');
      if (!saved) return [];
      return JSON.parse(saved).map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) }));
    } catch (e) {
      return [];
    }
  });

  const [resources, setResources] = useState<ResourceUnit[]>(INITIAL_RESOURCES);
  const [pendingUpdate, setPendingUpdate] = useState<{ projectId: string; type: 'progress' | 'material' | 'phase'; value?: any } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [aiBriefing, setAiBriefing] = useState<string>('ANALYZING_SITUATION...');
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [dailySummary, setDailySummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('cd-projects', JSON.stringify(projects));
    localStorage.setItem('cd-logs', JSON.stringify(logs));
  }, [projects, logs]);

  useEffect(() => {
    if (logs.length === 0) {
      addLog('sys', '系統', '指揮中心', '戰略看板已連線至雲端部署節點');
    }
    refreshBriefing();
  }, []);

  const refreshBriefing = useCallback(async () => {
    setIsBriefingLoading(true);
    const briefing = await getAIBriefing(projects, logs);
    setAiBriefing(briefing);
    setIsBriefingLoading(false);
  }, [projects, logs]);

  const generateReport = async () => {
    if (isSummaryLoading) return;
    setIsSummaryLoading(true);
    const summary = await getDailySummary(logs);
    setDailySummary(summary);
    setIsSummaryLoading(false);
  };

  const addLog = (projectId: string, projectName: string, userName: string, action: string) => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      projectId,
      projectName,
      userName,
      action,
      timestamp: new Date()
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const handleUpdateTrigger = (projectId: string, type: 'progress' | 'material' | 'phase', value?: any) => {
    setPendingUpdate({ projectId, type, value });
  };

  const confirmAction = (user: User) => {
    if (!pendingUpdate) return;

    const now = new Date();
    const timestampStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setProjects(prev => prev.map(p => {
      if (p.id === pendingUpdate.projectId) {
        let updatedProject = { ...p, lastUpdated: timestampStr };
        
        if (pendingUpdate.type === 'progress') {
          const nextIdx = Math.min(p.progress + 10, 100);
          let newPhase = p.currentPhase;
          if (nextIdx >= 100) newPhase = '完工結案';
          else if (nextIdx >= 80) newPhase = '測試驗收';
          else if (nextIdx >= 50) newPhase = '施工安裝';
          else if (nextIdx >= 20) newPhase = '材料準備';

          addLog(p.id, p.name, user.name, `進度遞增 -> ${nextIdx}%`);
          updatedProject = { ...updatedProject, progress: nextIdx, currentPhase: newPhase, health: nextIdx === 100 ? 'normal' : p.health };
        } else if (pendingUpdate.type === 'material') {
          addLog(p.id, p.name, user.name, `🚨 發起材料供應鏈預警`);
          setResources(res => res.map(r => r.id === 'pu' ? { ...r, status: 'URGENT', message: `${p.name} 材料短缺` } : r));
          updatedProject = { ...updatedProject, health: 'missing_material' };
        } else if (pendingUpdate.type === 'phase') {
          const newPhase = pendingUpdate.value as ProjectPhase;
          addLog(p.id, p.name, user.name, `戰術階段切換: ${newPhase}`);
          
          let newProgress = p.progress;
          if (newPhase === '完工結案') newProgress = 100;
          else if (newPhase === '測試驗收' && newProgress < 80) newProgress = 80;
          else if (newPhase === '施工安裝' && newProgress < 50) newProgress = 50;
          else if (newPhase === '材料準備' && newProgress < 20) newProgress = 20;
          else if (newPhase === '現場勘查' && newProgress > 19) newProgress = 0;

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
      id: Math.random().toString(36).substr(2, 9),
      health: 'normal',
      lastUpdated: new Date().toLocaleTimeString()
    };
    setProjects(prev => [...prev, project]);
    addLog(project.id, project.name, 'ADMIN', '核准新工程案場立項');
    setShowAddModal(false);
  };

  const resetData = () => {
    if (confirm("確定要重設所有作戰數據嗎？")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex overflow-hidden">
      <main className="w-[70%] p-8 overflow-y-auto border-r border-slate-900 bg-slate-950 flex flex-col">
        <header className="flex justify-between items-start mb-10 border-b border-slate-900 pb-8 relative shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-amber-500 flex items-center justify-center rounded-sm text-black font-black text-4xl italic shadow-[0_0_30px_rgba(245,158,11,0.3)] border-4 border-amber-600/50 select-none">CD</div>
            <div className="flex flex-col">
              <h1 className="text-5xl font-black tracking-tighter text-slate-100 uppercase flex items-center gap-4">
                <span className="text-amber-500">成鼎電工</span> 
                <span className="text-slate-800 text-3xl">/</span> 
                <span className="tracking-[0.15em] text-3xl font-bold">戰略部署中心</span>
              </h1>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></div>
                   <span className="text-[10px] mono text-emerald-500 font-black uppercase tracking-widest">System Online</span>
                </div>
                <div className="text-[10px] mono text-slate-500 flex gap-4 uppercase font-bold">
                  <span>DEPLOYMENT_VER: 3.1.2</span>
                  <span>NODE: TPE_CENTRAL_01</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={generateReport}
              disabled={isSummaryLoading}
              className={`group px-6 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-black rounded border border-slate-800 active:scale-95 transition-all text-[11px] uppercase flex items-center gap-3 shadow-lg ${isSummaryLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className={`w-4 h-4 text-amber-500 ${isSummaryLoading ? 'animate-spin' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              {isSummaryLoading ? '處理數據中...' : '生成作戰摘要'}
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all text-[11px] uppercase flex items-center gap-3 shadow-[0_0_25px_rgba(245,158,11,0.2)]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4"></path></svg>
              新部署計畫
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {dailySummary && (
            <div className="mb-10 p-8 bg-slate-900/60 border border-amber-500/30 rounded-sm relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/60 shadow-[0_0_15px_#f59e0b]"></div>
              <button onClick={() => setDailySummary(null)} className="absolute top-4 right-4 text-slate-600 hover:text-amber-500 transition-colors p-2">✕</button>
              <h3 className="text-amber-500 font-black mb-6 flex items-center gap-3 uppercase tracking-widest text-xs mono">
                <span className="w-2.5 h-2.5 bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse"></span>
                Strategic Intel Report
              </h3>
              <div className="text-base text-slate-300 leading-relaxed italic border-l border-slate-800 pl-6 py-1 whitespace-pre-line font-medium">
                {dailySummary}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-10">
            {projects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onProgressClick={() => handleUpdateTrigger(project.id, 'progress')} 
                onEmergencyClick={() => handleUpdateTrigger(project.id, 'material')}
                onPhaseClick={(phase) => handleUpdateTrigger(project.id, 'phase', phase)}
              />
            ))}
            {projects.length === 0 && (
              <div className="col-span-full py-40 text-center border-2 border-dashed border-slate-800 rounded-lg">
                <p className="text-slate-600 font-bold uppercase tracking-[0.5em] text-xs">目前無活躍工程案場 / NO_ACTIVE_DEPLOYS</p>
                <button onClick={() => setShowAddModal(true)} className="mt-8 text-amber-500/60 hover:text-amber-500 font-black uppercase text-sm border-b border-amber-500/20 pb-1">初始化案場 ➔</button>
              </div>
            )}
          </div>
        </div>
        
        <footer className="mt-auto pt-4 border-t border-slate-900 flex justify-between items-center shrink-0">
          <p className="text-[10px] mono text-slate-700 uppercase font-black tracking-widest italic">
            Confidential - Proprietary Data System of CD Electric
          </p>
          <button onClick={resetData} className="text-[9px] mono text-slate-800 hover:text-red-900 transition-colors uppercase font-bold tracking-tighter">
            [ EMERGENCY_PURGE ]
          </button>
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
