
import React from 'react';
import { User } from '../types';
import { USERS } from '../constants';

interface UserSelectorProps {
  onSelect: (user: User) => void;
  onCancel: () => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({ onSelect, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
      <div className="bg-slate-900 border-2 border-amber-500/30 p-10 rounded shadow-2xl w-full max-w-3xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-amber-500 uppercase tracking-[0.2em] mb-2">權限驗證 (IDENTITY)</h2>
          <p className="text-slate-500 mono text-sm uppercase">Select operator to confirm progress log</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {USERS.map(user => (
            <button
              key={user.id}
              onClick={() => onSelect(user)}
              className="group flex flex-col items-center p-8 bg-slate-950 rounded border-2 border-slate-800 hover:border-amber-500 transition-all active:scale-95"
            >
              <div className="w-20 h-20 bg-slate-800 rounded mb-4 flex items-center justify-center text-3xl font-black text-slate-500 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                {user.name.charAt(0)}
              </div>
              <span className="text-xl font-bold text-slate-100 mb-1">{user.name}</span>
              <span className="text-[10px] font-black mono text-amber-500/50 tracking-widest">{user.role.toUpperCase()}</span>
            </button>
          ))}
        </div>
        
        <button 
          onClick={onCancel}
          className="mt-10 w-full py-4 text-slate-500 font-black mono hover:text-slate-300 transition-colors uppercase tracking-[0.5em] text-xs border-t border-slate-800 pt-8"
        >
          取消更新 (ABORT)
        </button>
      </div>
    </div>
  );
};

export default UserSelector;
