# PM2 使用指南

## 配置文件说明

项目包含两个 PM2 配置文件：

1. **`ecosystem.config.js`** - 简化版配置（推荐用于腾讯云面板）
2. **`pm2.config.js`** - 完整版配置（包含更多选项）

## 快速开始

### 1. 安装 PM2（如果还没有安装）

```bash
npm install -g pm2
```

### 2. 启动应用

```bash
# 使用简化配置
npm run pm2:start

# 或使用完整配置
npm run pm2:start:prod

# 或直接使用 PM2 命令
pm2 start ecosystem.config.js
pm2 start pm2.config.js --env production
```

### 3. 查看状态

```bash
npm run pm2:status
# 或
pm2 status
```

### 4. 查看日志

```bash
npm run pm2:logs
# 或
pm2 logs who-tiger

# 实时查看日志
pm2 logs who-tiger --lines 100
```

### 5. 重启应用

```bash
npm run pm2:restart
# 或
pm2 restart who-tiger

# 零停机重启（推荐）
npm run pm2:reload
# 或
pm2 reload who-tiger
```

### 6. 停止应用

```bash
npm run pm2:stop
# 或
pm2 stop who-tiger
```

### 7. 删除应用

```bash
npm run pm2:delete
# 或
pm2 delete who-tiger
```

## 常用命令

### 监控

```bash
# 实时监控
npm run pm2:monit
# 或
pm2 monit
```

### 保存配置

```bash
# 保存当前 PM2 进程列表
pm2 save

# 设置开机自启
pm2 startup
```

### 查看详细信息

```bash
# 查看应用信息
pm2 info who-tiger

# 查看进程列表
pm2 list

# 查看所有日志
pm2 logs
```

## 在腾讯云面板中使用

### 方式一：使用 ecosystem.config.js（推荐）

在腾讯云面板的 PM2 项目配置中：

- **启动文件**: `ecosystem.config.js`
- **运行目录**: `/www/wwwroot/who-tiger`（你的实际路径）

### 方式二：使用 package.json

- **启动文件**: `package.json`
- **启动选项**: 选择 `start`（对应 `npm start`）

### 方式三：自定义启动命令

- **启动文件**: 留空或填写 `package.json`
- **自定义启动命令**: `pm2 start ecosystem.config.js`

## 日志位置

日志文件保存在项目根目录的 `logs/` 文件夹：

- `logs/out.log` - 标准输出日志
- `logs/err.log` - 错误日志

## 环境变量

可以在配置文件中修改环境变量：

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3000,
}
```

或通过命令行设置：

```bash
pm2 start ecosystem.config.js --update-env --env production
```

## 性能调优

### 内存限制

如果服务器内存较小，可以降低内存限制：

```javascript
max_memory_restart: '512M',  // 改为 512MB
```

### 集群模式

如果需要更高的性能，可以启用集群模式：

```javascript
instances: 'max',  // 使用所有 CPU 核心
exec_mode: 'cluster',  // 集群模式
```

## 故障排查

### 应用无法启动

1. 检查日志：
   ```bash
   pm2 logs who-tiger --err
   ```

2. 检查端口是否被占用：
   ```bash
   lsof -i :3000
   ```

3. 检查 Node.js 版本：
   ```bash
   node -v  # 应该 >= 18.0.0
   ```

### 应用频繁重启

1. 查看重启原因：
   ```bash
   pm2 logs who-tiger --lines 50
   ```

2. 检查内存使用：
   ```bash
   pm2 monit
   ```

3. 增加内存限制或优化代码

## 备份和恢复

### 保存 PM2 配置

```bash
pm2 save
```

### 恢复 PM2 配置

```bash
pm2 resurrect
```

## 开机自启

```bash
# 生成启动脚本
pm2 startup

# 保存当前配置
pm2 save
```

## 注意事项

1. **日志目录**: 确保 `logs/` 目录存在且有写入权限
   ```bash
   mkdir -p logs
   chmod 755 logs
   ```

2. **数据库目录**: 确保 `data/` 目录有写入权限
   ```bash
   chmod -R 755 data
   ```

3. **端口冲突**: 确保 3000 端口未被占用

4. **Node.js 版本**: 确保服务器上的 Node.js 版本 >= 18.0.0

