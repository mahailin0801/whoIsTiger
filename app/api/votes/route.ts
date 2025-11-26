import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ApiResponse } from '@/lib/types';

// 获取所有投票
export async function GET() {
  try {
    const votes = db.prepare('SELECT * FROM votes').all() as Array<{
      voterId: string;
      targetId: string;
    }>;
    const response: ApiResponse<Array<{ voterId: string; targetId: string }>> = {
      success: true,
      data: votes,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('获取投票列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取投票列表失败' },
      { status: 500 }
    );
  }
}

// 提交投票
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { voterId, targetId } = body;

    if (!voterId || !targetId) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 检查是否已经投票
    const existing = db.prepare('SELECT * FROM votes WHERE voterId = ?').get(voterId);
    
    if (existing) {
      // 更新投票
      db.prepare(`
        UPDATE votes 
        SET targetId = ?, createdAt = ?
        WHERE voterId = ?
      `).run(targetId, new Date().toISOString(), voterId);
    } else {
      // 插入新投票
      db.prepare(`
        INSERT INTO votes (voterId, targetId, createdAt)
        VALUES (?, ?, ?)
      `).run(voterId, targetId, new Date().toISOString());
    }

    const response: ApiResponse = {
      success: true,
      message: '投票成功',
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('提交投票失败:', error);
    return NextResponse.json(
      { success: false, message: '提交投票失败' },
      { status: 500 }
    );
  }
}

// 清空所有投票
export async function DELETE() {
  try {
    db.prepare('DELETE FROM votes').run();
    const response: ApiResponse = {
      success: true,
      message: '投票已清空',
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('清空投票失败:', error);
    return NextResponse.json(
      { success: false, message: '清空投票失败' },
      { status: 500 }
    );
  }
}

