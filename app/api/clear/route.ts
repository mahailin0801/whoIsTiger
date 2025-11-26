import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { ApiResponse } from '@/lib/types';

// 清空所有游戏数据
export async function POST() {
  try {
    // 清空玩家表（保留主持人）
    db.prepare("DELETE FROM players WHERE role != 'host'").run();
    
    // 重置所有玩家的游戏状态
    db.prepare('UPDATE players SET gameRole = NULL, isEliminated = 0, updatedAt = ?').run(new Date().toISOString());
    
    // 重置游戏状态
    db.prepare(`
      UPDATE game_status 
      SET status = ?, countdown = NULL, voteRoundActive = 0, updatedAt = ?
      WHERE id = (SELECT id FROM game_status ORDER BY id DESC LIMIT 1)
    `).run('waiting', new Date().toISOString());
    
    // 清空游戏设置
    db.prepare('DELETE FROM game_settings').run();

    const response: ApiResponse = {
      success: true,
      message: '所有游戏数据已清空',
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('清空数据失败:', error);
    return NextResponse.json(
      { success: false, message: '清空数据失败' },
      { status: 500 }
    );
  }
}

