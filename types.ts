
export type ProjectPhase = '現場勘查' | '材料準備' | '施工安裝' | '測試驗收' | '完工結案';
export type ResourceStatusLevel = 'Ready' | 'Wait' | 'Low' | 'In-progress' | 'Delayed' | 'Available' | 'Busy' | 'URGENT';
export type ProjectHealth = 'normal' | 'missing_material' | 'blocked';

export interface Project {
  id: string;
  name: string;
  progress: number;
  currentPhase: ProjectPhase;
  nextStep: string;
  supportNeeded: string[];
  responsibleTeam: string[];
  status: 'active' | 'on-hold' | 'completed';
  health: ProjectHealth;
  lastUpdated?: string; // 最後更新時間
}

export interface ActivityLog {
  id: string;
  projectId: string;
  projectName: string;
  userName: string;
  action: string;
  timestamp: Date;
}

export interface ResourceUnit {
  id: string;
  category: string;
  status: ResourceStatusLevel;
  message: string;
}

export interface User {
  id: string;
  name: string;
  role: string;
}
