import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { Player, ApiResponse } from '@/lib/types';

// 获取所有玩家
export async function GET() {
  try {
    const players = db.prepare('SELECT * FROM players ORDER BY createdAt ASC').all() as any[];
    // 转换数据库格式到 Player 类型
    const formattedPlayers: Player[] = players.map((p) => ({
      id: p.id,
      name: p.name,
      role: p.role as 'host' | 'player',
      gameRole: p.gameRole as 'civilian' | 'undercover' | 'blank' | null | undefined,
      isEliminated: p.isEliminated === 1,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
    const response: ApiResponse<Player[]> = {
      success: true,
      data: formattedPlayers,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('获取玩家列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取玩家列表失败' },
      { status: 500 }
    );
  }
}

// 添加玩家
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, role = 'player' } = body;

    if (!id || !name) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 检查玩家是否已存在
    const existing = db.prepare('SELECT * FROM players WHERE id = ?').get(id) as Player | undefined;
    
    if (existing) {
      // 更新玩家信息
      db.prepare(`
        UPDATE players 
        SET name = ?, role = ?, updatedAt = ?
        WHERE id = ?
      `).run(name, role, new Date().toISOString(), id);
    } else {
      // 插入新玩家
      db.prepare(`
        INSERT INTO players (id, name, role, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, name, role, new Date().toISOString(), new Date().toISOString());
    }

    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(id) as any;
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
    console.error('添加玩家失败:', error);
    return NextResponse.json(
      { success: false, message: '添加玩家失败' },
      { status: 500 }
    );
  }
}

// 删除玩家
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少玩家ID' },
        { status: 400 }
      );
    }

    db.prepare('DELETE FROM players WHERE id = ?').run(id);

    const response: ApiResponse = {
      success: true,
      message: '玩家已删除',
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('删除玩家失败:', error);
    return NextResponse.json(
      { success: false, message: '删除玩家失败' },
      { status: 500 }
    );
  }
}

