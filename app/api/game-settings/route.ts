import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { GameSettings, ApiResponse } from '@/lib/types';

// 获取游戏设置
export async function GET() {
  try {
    const settings = db.prepare('SELECT * FROM game_settings ORDER BY id DESC LIMIT 1').get() as GameSettings | undefined;

    const response: ApiResponse<GameSettings | null> = {
      success: true,
      data: settings || null,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('获取游戏设置失败:', error);
    return NextResponse.json(
      { success: false, message: '获取游戏设置失败' },
      { status: 500 }
    );
  }
}

// 更新游戏设置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { civilianWord, undercoverWord, civilianCount, undercoverCount, blankCount } = body;

    // 检查是否已存在设置
    const existing = db.prepare('SELECT * FROM game_settings ORDER BY id DESC LIMIT 1').get() as GameSettings | undefined;

    if (existing) {
      // 更新设置
      db.prepare(`
        UPDATE game_settings 
        SET civilianWord = ?, undercoverWord = ?, civilianCount = ?, 
            undercoverCount = ?, blankCount = ?, updatedAt = ?
        WHERE id = (SELECT id FROM game_settings ORDER BY id DESC LIMIT 1)
      `).run(
        civilianWord,
        undercoverWord,
        civilianCount,
        undercoverCount,
        blankCount,
        new Date().toISOString()
      );
    } else {
      // 插入新设置
      db.prepare(`
        INSERT INTO game_settings 
        (civilianWord, undercoverWord, civilianCount, undercoverCount, blankCount, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        civilianWord,
        undercoverWord,
        civilianCount,
        undercoverCount,
        blankCount,
        new Date().toISOString()
      );
    }

    const updated = db.prepare('SELECT * FROM game_settings ORDER BY id DESC LIMIT 1').get() as GameSettings;
    const response: ApiResponse<GameSettings> = {
      success: true,
      data: updated,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('更新游戏设置失败:', error);
    return NextResponse.json(
      { success: false, message: '更新游戏设置失败' },
      { status: 500 }
    );
  }
}

// 清空游戏设置
export async function DELETE() {
  try {
    db.prepare('DELETE FROM game_settings').run();
    
    const response: ApiResponse = {
      success: true,
      message: '游戏设置已清空',
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('清空游戏设置失败:', error);
    return NextResponse.json(
      { success: false, message: '清空游戏设置失败' },
      { status: 500 }
    );
  }
}

