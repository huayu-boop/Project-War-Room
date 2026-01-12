
import React, { useState, useEffect, useCallback } from 'react';
import { Project, ActivityLog, ResourceUnit, User, ProjectPhase } from './types';
import { INITIAL_PROJECTS, INITIAL_RESOURCES, USERS } from './constants';
import ProjectCard from './components/ProjectCard';
import Sidebar from './components/Sidebar';
import UserSelector from './components/UserSelector';
import AddProjectModal from './components/AddProjectModal';
import { getAIBriefing, getDailySummary } from './services/geminiService';

const App: React.FC = () => {
  // 優先嘗試從 LocalStorage 讀取，以模擬 Vercel 布署後的資料持久化感
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('cd-projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });
  
  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('cd-logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [resources, setResources] = useState<ResourceUnit[]>(INITIAL_RESOURCES);
  const [pendingUpdate, setPendingUpdate] = useState<{ projectId: string; type: 'progress' | 'material' | 'phase'; value?: any } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [aiBriefing, setAiBriefing] = useState<string>('情報官正在分析戰情...');
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [dailySummary, setDailySummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // 當資料變更時存入 localStorage (Vercel 靜態布署的暫時持久化方案)
  useEffect(() => {
    localStorage.setItem('cd-projects', JSON.stringify(projects));
    localStorage.setItem('cd-logs', JSON.stringify(logs));
  }, [projects, logs]);

  useEffect(() => {
    if (logs.length === 0) {
      const initialLog: ActivityLog = {
        id: 'init',
        projectId: 'sys',
        projectName: '系統',
        userName: '指揮中心',
        action: '成鼎電工戰略室已於 Vercel 上線',
        timestamp: new Date()
      };
      setLogs([initialLog]);
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

    setProjects(prev => prev.map(p => {
      if (p.id === pendingUpdate.projectId) {
        if (pendingUpdate.type === 'progress') {
          const nextIdx = Math.min(p.progress + 10, 100);
          let newPhase = p.currentPhase;
          if (nextIdx >= 100) newPhase = '完工結案';
          else if (nextIdx >= 75) newPhase = '測試驗收';
          else if (nextIdx >= 50) newPhase = '施工安裝';
          else if (nextIdx >= 25) newPhase = '材料準備';

          addLog(p.id, p.name, user.name, `更新進度至 ${nextIdx}% (${newPhase})`);
          return { ...p, progress: nextIdx, currentPhase: newPhase, health: nextIdx === 100 ? 'normal' : p.health };
        } else if (pendingUpdate.type === 'material') {
          addLog(p.id, p.name, user.name, `發出緊急缺料通報！`);
          setResources(res => res.map(r => r.id === 'pu' ? { ...r, status: 'URGENT', message: `${p.name} 缺料待補!` } : r));
          return { ...p, health: 'missing_material' };
        } else if (pendingUpdate.type === 'phase') {
          const newPhase = pendingUpdate.value as ProjectPhase;
          addLog(p.id, p.name, user.name, `手動調整施工階段為：${newPhase}`);
          
          let newProgress = p.progress;
          if (newPhase === '完工結案') newProgress = 100;
          else if (newPhase === '測試驗收' && newProgress < 75) newProgress = 75;
          else if (newPhase === '施工安裝' && newProgress < 50) newProgress = 50;
          else if (newPhase === '材料準備' && newProgress < 25) newProgress = 25;
          else if (newPhase === '現場勘查' && newProgress > 24) newProgress = 0;

          return { ...p, currentPhase: newPhase, progress: newProgress, health: newPhase === '完工結案' ? 'normal' : p.health };
        }
      }
      return p;
    }));
    setPendingUpdate(null);
  };

  const addNewProject = (newProject: any) => {
    const project: Project = { 
      ...newProject, 
      id: Math.random().toString(),
      health: 'normal'
    };
    setProjects(prev => [...prev, project]);
    addLog(project.id, project.name, '管理端', '新增工程部署計畫');
    setShowAddModal(false);
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex overflow-hidden">
      <main className="w-[70%] p-8 overflow-y-auto border-r border-slate-800 bg-slate-950">
        <header className="flex justify-between items-end mb-10 border-b border-slate-800 pb-8">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-amber-500 flex items-center justify-center rounded-lg text-black font-black text-2xl italic shadow-lg select-none">CD</div>
            <div>
              <h1 className="text-4xl font-black tracking-[0.1em] text-amber-500 uppercase flex items-center gap-3">
                成鼎電工 <span className="text-slate-700 font-light">|</span> <span className="text-slate-200">工程戰略中心</span>
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-slate-500 mono text-xs uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Vercel Live Deployment • {new Date().toLocaleDateString()}
                </p>
                <div className="flex items-center gap-3 bg-slate-900 px-3 py-1 rounded border border-slate-800">
                  <span className="text-amber-500">☀️</span>
                  <span className="text-xs font-bold text-slate-300">目前案場 31°C / 晴朗</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={generateReport}
              disabled={isSummaryLoading}
              className={`px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded border border-slate-700 active:scale-95 transition-all text-sm uppercase flex items-center gap-2 ${isSummaryLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className={`w-5 h-5 ${isSummaryLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              {isSummaryLoading ? '摘要生成中...' : '產出施工日報摘要'}
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all text-sm uppercase flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
              新案立案部署
            </button>
          </div>
        </header>

        {dailySummary && (
          <div className="mb-8 p-6 bg-amber-500/10 border-2 border-amber-500/30 rounded-xl relative animate-in fade-in duration-500">
            <button onClick={() => setDailySummary(null)} className="absolute top-2 right-2 text-amber-500 hover:text-white p-2">✕</button>
            <h3 className="text-amber-500 font-bold mb-3 flex items-center gap-2 uppercase tracking-widest text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              AI 智能施工摘要匯報
            </h3>
            <div className="text-sm text-slate-200 leading-relaxed italic border-l-2 border-amber-500/50 pl-4 py-1">
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
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
              <p className="text-slate-600 font-bold uppercase tracking-widest">目前尚無進行中的工程案場</p>
              <button onClick={() => setShowAddModal(true)} className="mt-4 text-amber-500 hover:text-amber-400 font-bold">點擊此處開始立案 ➔</button>
            </div>
          )}
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
