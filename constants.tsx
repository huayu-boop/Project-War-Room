
import { Project, ResourceUnit, User } from './types';

export const PHASES: Project['currentPhase'][] = [
  '現場勘查',
  '材料準備',
  '施工安裝',
  '測試驗收',
  '完工結案'
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    name: '台積電南科廠電控箱安裝',
    progress: 40,
    currentPhase: '施工安裝',
    nextStep: '進行 A3 區配線',
    supportNeeded: ['缺配線師傅', '電錶一組'],
    responsibleTeam: ['師傅A', '經理'],
    status: 'active',
    health: 'normal'
  },
  {
    id: '2',
    name: '桃園航空城路燈配電工程',
    progress: 15,
    currentPhase: '材料準備',
    nextStep: '確認電纜規格',
    supportNeeded: ['缺吊車支援'],
    responsibleTeam: ['師傅B', '老闆'],
    status: 'active',
    health: 'normal'
  },
  {
    id: '3',
    name: '台北 101 機房定期維修',
    progress: 80,
    currentPhase: '測試驗收',
    nextStep: '出具測試報告',
    supportNeeded: [],
    responsibleTeam: ['師傅A', '師傅B'],
    status: 'active',
    health: 'normal'
  }
];

export const INITIAL_RESOURCES: ResourceUnit[] = [
  { id: 'wh', category: '倉儲備料 (Warehouse)', status: 'Ready', message: '主要耗材充足' },
  { id: 'pu', category: '採購進度 (Purchasing)', status: 'In-progress', message: 'XLPE 電纜配送中' },
  { id: 'eq', category: '車輛工具 (Equipment)', status: 'Available', message: '3號貨車可用' },
  { id: 'ad', category: '行政報價 (Admin)', status: 'Ready', message: '報價單已發出' }
];

export const USERS: User[] = [
  { id: 'u1', name: '老闆', role: 'Owner' },
  { id: 'u2', name: '經理', role: 'Manager' },
  { id: 'u3', name: '師傅A', role: 'Chief Engineer' },
  { id: 'u4', name: '師傅B', role: 'Technician' },
  { id: 'u5', name: '會計', role: 'Accountant' }
];
