// 玩家信息类型
export interface Player {
  id: string;
  name: string;
  role: 'host' | 'player';
  gameRole?: 'civilian' | 'undercover' | 'blank' | null;
  isEliminated?: boolean;
  createdAt: string;
  updatedAt?: string;
  isReal?: boolean; // 用于区分真实玩家和mock玩家
}

// 游戏状态类型
export type GameStatus = 'waiting' | 'preparing' | 'playing' | 'ended';

// 游戏状态详情
export interface GameStatusDetail {
  status: GameStatus;
  countdown: number | null;
  voteRoundActive: boolean;
}

// 游戏设置类型
export interface GameSettings {
  civilianWord: string;
  undercoverWord: string;
  civilianCount: number;
  undercoverCount: number;
  blankCount: number;
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

