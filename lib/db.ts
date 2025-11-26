import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// 数据库文件路径
const dbPath = path.join(process.cwd(), 'data', 'game.db');

// 确保 data 目录存在
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 创建数据库连接
const db = new Database(dbPath);

// 初始化数据库表
export function initDatabase() {
  // 玩家表
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'player',
      gameRole TEXT,
      isEliminated INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // 游戏状态表
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT NOT NULL,
      countdown INTEGER,
      voteRoundActive INTEGER DEFAULT 0,
      updatedAt TEXT NOT NULL
    )
  `);

  // 游戏设置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      civilianWord TEXT NOT NULL,
      undercoverWord TEXT NOT NULL,
      civilianCount INTEGER NOT NULL DEFAULT 0,
      undercoverCount INTEGER NOT NULL DEFAULT 0,
      blankCount INTEGER NOT NULL DEFAULT 0,
      updatedAt TEXT NOT NULL
    )
  `);

  // 投票表
  db.exec(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      voterId TEXT NOT NULL,
      targetId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      UNIQUE(voterId)
    )
  `);

  // 初始化游戏状态
  try {
    const statusExists = db.prepare('SELECT COUNT(*) as count FROM game_status').get() as { count: number };
    if (statusExists.count === 0) {
      db.prepare(`
        INSERT INTO game_status (status, countdown, voteRoundActive, updatedAt)
        VALUES (?, ?, ?, ?)
      `).run('waiting', null, 0, new Date().toISOString());
    } else {
      // 如果表已存在但没有 voteRoundActive 字段，需要添加
      try {
        db.exec('ALTER TABLE game_status ADD COLUMN voteRoundActive INTEGER DEFAULT 0');
      } catch (error) {
        // 字段可能已存在，忽略错误
      }
    }
  } catch (error) {
    console.error('初始化游戏状态失败:', error);
  }

  console.log('数据库初始化完成');
}

// 初始化数据库
initDatabase();

export default db;

