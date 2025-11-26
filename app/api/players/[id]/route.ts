import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { Player, ApiResponse } from '@/lib/types';

// 更新玩家信息
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { gameRole, isEliminated } = body;

    const updates: string[] = [];
    const values: any[] = [];

    if (gameRole !== undefined) {
      updates.push('gameRole = ?');
      values.push(gameRole);
    }

    if (isEliminated !== undefined) {
      updates.push('isEliminated = ?');
      values.push(isEliminated ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, message: '没有要更新的字段' },
        { status: 400 }
      );
    }

    updates.push('updatedAt = ?');
    values.push(new Date().toISOString());
    values.push(params.id);

    db.prepare(`
      UPDATE players 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...values);

    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(params.id) as any;
    const formattedPlayer: Player = {
      id: player.id,
      name: player.name,
      role: player.role as 'host' | 'player',
      gameRole: player.gameRole as 'civilian' | 'undercover' | 'blank' | null | undefined,
      isEliminated: player.isEliminated === 1,
      createdAt: player.createdAt,
      updatedAt: player.updatedAt,
    };
    const response: ApiResponse<Player> = {
      success: true,
      data: formattedPlayer,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('更新玩家失败:', error);
    return NextResponse.json(
      { success: false, message: '更新玩家失败' },
      { status: 500 }
    );
  }
}

