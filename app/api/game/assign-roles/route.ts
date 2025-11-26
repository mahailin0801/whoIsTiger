import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ApiResponse, Player, GameSettings } from '@/lib/types';

// 分配角色
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { civilianCount, undercoverCount, blankCount } = body;

    // 获取所有真实玩家（排除主持人）
    const players = db.prepare(`
      SELECT * FROM players 
      WHERE role != 'host' 
      ORDER BY createdAt ASC
    `).all() as Player[];

    if (players.length === 0) {
      return NextResponse.json(
        { success: false, message: '没有玩家' },
        { status: 400 }
      );
    }

    const totalRoles = civilianCount + undercoverCount + blankCount;
    if (totalRoles > players.length) {
      return NextResponse.json(
        { success: false, message: '角色数量超过玩家数量' },
        { status: 400 }
      );
    }

    // 创建角色数组
    const roles: Array<'civilian' | 'undercover' | 'blank'> = [];
    for (let i = 0; i < civilianCount; i++) roles.push('civilian');
    for (let i = 0; i < undercoverCount; i++) roles.push('undercover');
    for (let i = 0; i < blankCount; i++) roles.push('blank');

    // 随机打乱
    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }

    // 分配角色
    const assignments: Array<{ id: string; role: string }> = [];
    players.forEach((player, index) => {
      if (index < roles.length) {
        const role = roles[index];
        db.prepare(`
          UPDATE players 
          SET gameRole = ?, updatedAt = ?
          WHERE id = ?
        `).run(role, new Date().toISOString(), player.id);
        assignments.push({ id: player.id, role });
      }
    });

    const response: ApiResponse<Array<{ id: string; role: string }>> = {
      success: true,
      data: assignments,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('分配角色失败:', error);
    return NextResponse.json(
      { success: false, message: '分配角色失败' },
      { status: 500 }
    );
  }
}

// 清空所有角色
export async function DELETE() {
  try {
    db.prepare('UPDATE players SET gameRole = NULL, isEliminated = 0, updatedAt = ?').run(new Date().toISOString());
    
    const response: ApiResponse = {
      success: true,
      message: '角色已清空',
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('清空角色失败:', error);
    return NextResponse.json(
      { success: false, message: '清空角色失败' },
      { status: 500 }
    );
  }
}

