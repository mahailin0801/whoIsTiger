import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { ApiResponse } from '@/lib/types';

// 获取投票结果
export async function GET() {
  try {
    // 获取所有真实玩家（排除主持人和已淘汰的玩家）
    const players = db.prepare(`
      SELECT * FROM players 
      WHERE role != 'host' AND isEliminated = 0
    `).all() as Array<{ id: string; name: string }>;

    // 获取所有投票（只统计未淘汰玩家的投票）
    const allVotes = db.prepare('SELECT * FROM votes').all() as Array<{
      voterId: string;
      targetId: string;
    }>;

    // 创建玩家ID集合，用于快速查找
    const playerIds = new Set(players.map(p => p.id));

    // 只统计未淘汰玩家的投票
    const votes = allVotes.filter(vote => playerIds.has(vote.voterId));

    // 统计每个玩家的得票数
    const voteCounts: Record<string, number> = {};
    players.forEach((player) => {
      voteCounts[player.id] = 0;
    });

    votes.forEach((vote) => {
      if (voteCounts[vote.targetId] !== undefined) {
        voteCounts[vote.targetId]++;
      }
    });

    // 找出最高票数（至少要有1票才能被淘汰）
    const voteValues = Object.values(voteCounts);
    const maxVotes = voteValues.length > 0 ? Math.max(...voteValues) : 0;

    // 找出得票最多的玩家（可能有多个）
    // 只有当最高票数大于0时，才返回得票最多的玩家
    const topPlayers = maxVotes > 0 
      ? players.filter((player) => voteCounts[player.id] === maxVotes)
      : [];

    // 检查是否所有玩家都已投票（排除已淘汰的玩家）
    const totalPlayers = players.length;
    const votedCount = votes.length;
    // 确保所有未淘汰的玩家都已投票
    const allVoted = totalPlayers > 0 && votedCount >= totalPlayers && votedCount === totalPlayers;

    const response: ApiResponse<{
      allVoted: boolean;
      voteCounts: Record<string, number>;
      topPlayers: Array<{ id: string; name: string; votes: number }>;
      isTie: boolean;
    }> = {
      success: true,
      data: {
        allVoted,
        voteCounts,
        topPlayers: topPlayers.map((p) => ({
          id: p.id,
          name: p.name,
          votes: voteCounts[p.id],
        })),
        isTie: topPlayers.length > 1,
      },
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('获取投票结果失败:', error);
    return NextResponse.json(
      { success: false, message: '获取投票结果失败' },
      { status: 500 }
    );
  }
}

