import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ApiResponse, GameStatus, GameStatusDetail } from '@/lib/types';

// 获取游戏状态
export async function GET() {
  try {
    const status = db.prepare('SELECT * FROM game_status ORDER BY id DESC LIMIT 1').get() as {
      status: GameStatus;
      countdown: number | null;
      voteRoundActive: number;
    } | undefined;

    const response: ApiResponse<GameStatusDetail> = {
      success: true,
      data: status ? {
        status: status.status,
        countdown: status.countdown,
        voteRoundActive: status.voteRoundActive === 1,
      } : { status: 'waiting', countdown: null, voteRoundActive: false },
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('获取游戏状态失败:', error);
    return NextResponse.json(
      { success: false, message: '获取游戏状态失败' },
      { status: 500 }
    );
  }
}

// 更新游戏状态
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { status, countdown, voteRoundActive } = body;

    // 更新游戏状态
    const updateFields: string[] = [];
    const values: any[] = [];

    if (status !== undefined) {
      updateFields.push('status = ?');
      values.push(status);
    }
    if (countdown !== undefined) {
      updateFields.push('countdown = ?');
      values.push(countdown);
    }
    if (voteRoundActive !== undefined) {
      updateFields.push('voteRoundActive = ?');
      values.push(voteRoundActive ? 1 : 0);
    }
    
    updateFields.push('updatedAt = ?');
    values.push(new Date().toISOString());

    db.prepare(`
      UPDATE game_status 
      SET ${updateFields.join(', ')}
      WHERE id = (SELECT id FROM game_status ORDER BY id DESC LIMIT 1)
    `).run(...values);

    const updated = db.prepare('SELECT * FROM game_status ORDER BY id DESC LIMIT 1').get() as {
      status: GameStatus;
      countdown: number | null;
      voteRoundActive: number;
    };

    const response: ApiResponse<GameStatusDetail> = {
      success: true,
      data: {
        status: updated.status,
        countdown: updated.countdown,
        voteRoundActive: updated.voteRoundActive === 1,
      },
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('更新游戏状态失败:', error);
    return NextResponse.json(
      { success: false, message: '更新游戏状态失败' },
      { status: 500 }
    );
  }
}

