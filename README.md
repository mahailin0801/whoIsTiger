# 谁是卧底 H5 游戏

基于 Next.js + TypeScript + SQLite 的多人游戏应用。

## 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript
- **数据库**: SQLite (better-sqlite3)
- **UI 组件**: antd-mobile
- **样式**: CSS Modules

## 项目结构

```
whoTiger/
├── app/                    # Next.js App Router
│   ├── api/                # API 路由
│   │   ├── players/        # 玩家相关 API
│   │   ├── game-status/    # 游戏状态 API
│   │   ├── game-settings/  # 游戏设置 API
│   │   └── game/           # 游戏相关 API
│   ├── entry/             # 入口页面
│   ├── game/               # 游戏页面
│   └── settings/           # 设置页面
├── components/             # 共享组件
├── lib/                    # 工具库
│   ├── db.ts              # 数据库配置
│   ├── types.ts           # TypeScript 类型定义
│   └── constants.ts       # 常量定义
└── data/                   # SQLite 数据库文件（自动生成）
```

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 运行开发服务器

```bash
npm run dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 启动。

### 3. 构建生产版本

```bash
npm run build
npm start
```

## 数据库

项目使用 SQLite 数据库，数据库文件会自动创建在 `data/game.db`。

### 数据库表结构

- **players**: 存储玩家信息
- **game_status**: 存储游戏状态
- **game_settings**: 存储游戏设置

## API 路由

### 玩家相关

- `GET /api/players` - 获取所有玩家
- `POST /api/players` - 添加玩家
- `DELETE /api/players?id={id}` - 删除玩家
- `PATCH /api/players/[id]` - 更新玩家信息

### 游戏状态

- `GET /api/game-status` - 获取游戏状态
- `POST /api/game-status` - 更新游戏状态

### 游戏设置

- `GET /api/game-settings` - 获取游戏设置
- `POST /api/game-settings` - 更新游戏设置

### 游戏操作

- `POST /api/game/assign-roles` - 分配角色
- `DELETE /api/game/assign-roles` - 清空角色

### 数据管理

- `POST /api/clear` - 清空所有游戏数据

## 功能特性

- ✅ 玩家进入和退出
- ✅ 游戏设置（词语、角色数量）
- ✅ 游戏开始倒计时
- ✅ 角色分配（平民、卧底、空白）
- ✅ 主持人控制面板
- ✅ 实时数据同步（通过轮询）
- ✅ 响应式设计

## 注意事项

1. 数据库文件 `data/game.db` 会在首次运行时自动创建
2. 主持人用户名固定为 `mahailin888`
3. 所有玩家进入同一个房间（固定房间ID）
4. 游戏数据通过 API 轮询实现同步（每2秒）

## 开发说明

- 使用 TypeScript 进行类型检查
- 使用 CSS Modules 进行样式隔离
- API 路由使用 Next.js App Router
- 客户端组件使用 `'use client'` 指令
