
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
    const saved = localStorage.getItem('cd-projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });
  
  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('cd-logs');
    if (!saved) return [];
    return JSON.parse(saved).map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) }));
  });

  const [resources, setResources] = useState<ResourceUnit[]>(INITIAL_RESOURCES);
  const [pendingUpdate, setPendingUpdate] = useState<{ projectId: string; type: 'progress' | 'material' | 'phase'; value?: any } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [aiBriefing, setAiBriefing] = useState<string>('系統初始化...');
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [dailySummary, setDailySummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('cd-projects', JSON.stringify(projects));
    localStorage.setItem('cd-logs', JSON.stringify(logs));
  }, [projects, logs]);

  useEffect(() => {
    if (logs.length === 0) {
      addLog('sys', '系統', '指揮中心', '戰略看板已連線至 Vercel 雲端節點');
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
    setIsSummaryLoading(true);
    const summary = await getDailySummary(logs);
    setDailySummary(summary);
    setIsSummaryLoading(false);
  };

  const addLog = (projectId: string, projectName: string, userName: string, action: string) => {
    const newLog: ActivityLog = {
      id: Math.random().toString(),
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

    const timestamp = new Date().toLocaleTimeString();

    setProjects(prev => prev.map(p => {
      if (p.id === pendingUpdate.projectId) {
        let updatedProject = { ...p, lastUpdated: timestamp };
        
        if (pendingUpdate.type === 'progress') {
          const nextIdx = Math.min(p.progress + 10, 100);
          let newPhase = p.currentPhase;
          if (nextIdx >= 100) newPhase = '完工結案';
          else if (nextIdx >= 80) newPhase = '測試驗收';
          else if (nextIdx >= 50) newPhase = '施工安裝';
          else if (nextIdx >= 20) newPhase = '材料準備';

          addLog(p.id, p.name, user.name, `進度更新: ${nextIdx}%`);
          updatedProject = { ...updatedProject, progress: nextIdx, currentPhase: newPhase, health: nextIdx === 100 ? 'normal' : p.health };
        } else if (pendingUpdate.type === 'material') {
          addLog(p.id, p.name, user.name, `🚨 發出緊急缺料通報`);
          setResources(res => res.map(r => r.id === 'pu' ? { ...r, status: 'URGENT', message: `${p.name} 材料短缺` } : r));
          updatedProject = { ...updatedProject, health: 'missing_material' };
        } else if (pendingUpdate.type === 'phase') {
          const newPhase = pendingUpdate.value as ProjectPhase;
          addLog(p.id, p.name, user.name, `階段變更 -> ${newPhase}`);
          
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
      id: Math.random().toString(),
      health: 'normal',
      lastUpdated: new Date().toLocaleTimeString()
    };
    setProjects(prev => [...prev, project]);
    addLog(project.id, project.name, '管理端', '新部署計畫已核准');
    setShowAddModal(false);
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex overflow-hidden">
      <main className="w-[70%] p-8 overflow-y-auto border-r border-slate-900 bg-slate-950">
        <header className="flex justify-between items-end mb-10 border-b border-slate-900 pb-8 relative">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-amber-500 flex items-center justify-center rounded-sm text-black font-black text-3xl italic shadow-[0_0_20px_rgba(251,191,36,0.2)] border-2 border-amber-400 select-none">CD</div>
            <div>
              <h1 className="text-4xl font-black tracking-widest text-amber-500 uppercase flex items-center gap-3">
                成鼎電工 <span className="text-slate-800 font-light">/</span> <span className="text-slate-100">戰略部署中心</span>
              </h1>
              <div className="flex items-center gap-5 mt-3">
                <p className="text-slate-500 mono text-[10px] uppercase flex items-center gap-2 tracking-[0.2em]">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#fbbf24] animate-pulse"></span>
                  Tactical Link Active • {new Date().toLocaleDateString()}
                </p>
                <div className="text-[10px] mono text-slate-600 bg-slate-900/50 px-2 py-1 border border-slate-800/50 rounded">
                  DEPLOY_STATUS: <span className="text-emerald-500">OPTIMAL</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={generateReport}
              disabled={isSummaryLoading}
              className={`px-6 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded border border-slate-800 active:scale-95 transition-all text-xs uppercase flex items-center gap-3 ${isSummaryLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className={`w-4 h-4 ${isSummaryLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              {isSummaryLoading ? '處理中...' : '生成戰報'}
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all text-xs uppercase flex items-center gap-3 shadow-[0_0_15px_rgba(251,191,36,0.1)]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
              新案立項
            </button>
          </div>
        </header>

        {dailySummary && (
          <div className="mb-10 p-6 bg-amber-500/5 border border-amber-500/20 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/40"></div>
            <button onClick={() => setDailySummary(null)} className="absolute top-3 right-3 text-amber-500/50 hover:text-amber-500 transition-colors">✕</button>
            <h3 className="text-amber-500 font-black mb-4 flex items-center gap-2 uppercase tracking-widest text-[10px] mono">
              <span className="w-2 h-2 bg-amber-500 animate-pulse"></span>
              AI Tactical Intel Briefing
            </h3>
            <div className="text-sm text-slate-300 leading-relaxed italic border-l border-slate-800 pl-4 py-1 whitespace-pre-line">
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
        </div>
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
