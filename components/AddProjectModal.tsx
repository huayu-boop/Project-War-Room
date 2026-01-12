
import React, { useState } from 'react';
import { Project } from '../types';

interface AddProjectModalProps {
  onAdd: (project: Omit<Project, 'id' | 'health'>) => void;
  onCancel: () => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    nextStep: '',
    supportNeeded: '',
    responsibleTeam: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    onAdd({
      name: formData.name,
      progress: 0,
      currentPhase: '現場勘查',
      nextStep: formData.nextStep || '初次現勘與圖面確認',
      supportNeeded: formData.supportNeeded ? formData.supportNeeded.split(',').map(s => s.trim()) : [],
      responsibleTeam: formData.responsibleTeam ? formData.responsibleTeam.split(',').map(s => s.trim()) : ['待指派'],
      status: 'active'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
      <form 
        onSubmit={handleSubmit}
        className="bg-slate-900 border-2 border-amber-500/20 p-10 rounded-2xl w-full max-w-xl shadow-2xl space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-black text-amber-500 uppercase tracking-[0.2em] mb-2">案場部署 (INITIALIZE)</h2>
          <p className="text-xs text-slate-500 mono">Create new electric engineering deployment</p>
        </div>
        
        <div className="space-y-1">
          <label className="text-[10px] text-slate-500 mono uppercase block">案名 / Project Name</label>
          <input 
            autoFocus
            type="text"
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 focus:outline-none focus:border-amber-500 transition-all text-lg font-bold"
            placeholder="例如: 台積電南科廠配電"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 mono uppercase block">負責人員 (用逗號隔開)</label>
            <input 
              type="text"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 focus:outline-none focus:border-amber-500 transition-all text-sm"
              placeholder="例如: 師傅A, 師傅B"
              value={formData.responsibleTeam}
              onChange={e => setFormData({...formData, responsibleTeam: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 mono uppercase block">次要目標 / Next Step</label>
            <input 
              type="text"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 focus:outline-none focus:border-amber-500 transition-all text-sm"
              placeholder="例如: 確認電表位置"
              value={formData.nextStep}
              onChange={e => setFormData({...formData, nextStep: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-slate-500 mono uppercase block">資源需求 / Support Needed</label>
          <input 
            type="text"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 focus:outline-none focus:border-amber-500 transition-all text-sm"
            placeholder="例如: 缺吊車, 缺配線師傅"
            value={formData.supportNeeded}
            onChange={e => setFormData({...formData, supportNeeded: e.target.value})}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all uppercase mono text-xs"
          >
            Abort
          </button>
          <button 
            type="submit"
            className="flex-[2] py-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl transition-all uppercase mono text-sm shadow-[0_0_20px_rgba(251,191,36,0.3)]"
          >
            Deploy Project
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProjectModal;
