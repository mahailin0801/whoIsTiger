# 部署指南

本文档说明如何将 Next.js 项目打包并部署到服务器。

## 前置要求

### 服务器环境
- Node.js 18.x 或更高版本
- npm 或 yarn
- PM2（推荐用于进程管理）或 systemd

### 检查 Node.js 版本
```bash
node -v  # 应该 >= 18.0.0
npm -v
```

## 部署步骤

### 1. 本地打包

在本地开发机器上执行：

```bash
# 安装依赖（如果还没有安装）
npm install

# 构建生产版本
npm run build
```

构建完成后，会生成 `.next` 目录，包含优化后的生产代码。

### 2. 准备部署文件

需要上传到服务器的文件和目录：
- `.next/` - 构建输出目录
- `app/` - 应用代码
- `components/` - 组件代码
- `lib/` - 工具库
- `public/` - 静态资源（如果有）
- `package.json` - 依赖配置
- `next.config.js` - Next.js 配置
- `tsconfig.json` - TypeScript 配置
- `types/` - 类型定义（如果有）

**不需要上传的文件：**
- `node_modules/` - 在服务器上重新安装
- `.next/cache/` - 可以删除，会在服务器上重新生成
- `data/` - 数据库文件，在服务器上会自动创建

### 3. 上传文件到服务器

可以使用以下方式之一：

#### 方式一：使用 scp
```bash
# 在项目根目录执行
scp -r .next app components lib public package.json next.config.js tsconfig.json types/ user@your-server:/path/to/app/
```

#### 方式二：使用 rsync（推荐）
```bash
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'data' \
  . user@your-server:/path/to/app/
```

#### 方式三：使用 Git
```bash
# 在服务器上
git clone your-repo-url
cd whoTiger
npm install --production
npm run build
```

### 4. 在服务器上安装依赖

```bash
cd /path/to/app
npm install --production
```

### 5. 设置环境变量（如果需要）

创建 `.env.production` 文件（如果需要自定义配置）：
```bash
# 端口号（可选，默认 3000）
PORT=3000

# Node 环境
NODE_ENV=production
```

### 6. 启动应用

#### 方式一：使用 PM2（推荐）

安装 PM2：
```bash
npm install -g pm2
```

启动应用：
```bash
pm2 start npm --name "who-tiger" -- start
```

或者创建 `ecosystem.config.js` 配置文件：
```javascript
module.exports = {
  apps: [{
    name: 'who-tiger',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/app',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

然后启动：
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # 设置开机自启
```

#### 方式二：使用 systemd

创建服务文件 `/etc/systemd/system/who-tiger.service`：
```ini
[Unit]
Description=Who Tiger Next.js App
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/app
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable who-tiger
sudo systemctl start who-tiger
sudo systemctl status who-tiger
```

#### 方式三：直接运行（不推荐用于生产环境）
```bash
npm start
```

### 7. 配置反向代理（Nginx）

如果需要通过域名访问，配置 Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

然后重启 Nginx：
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 8. 数据库文件

数据库文件会自动创建在 `data/game.db`。确保：
- `data/` 目录有写入权限
- 定期备份数据库文件

备份数据库：
```bash
cp data/game.db data/game.db.backup.$(date +%Y%m%d_%H%M%S)
```

## 更新部署

当需要更新应用时：

```bash
# 1. 在本地构建
npm run build

# 2. 上传新文件到服务器（使用 rsync 或 scp）

# 3. 在服务器上重新安装依赖（如果有新依赖）
cd /path/to/app
npm install --production

# 4. 重启应用
pm2 restart who-tiger
# 或
sudo systemctl restart who-tiger
```

## 常见问题

### 1. better-sqlite3 编译错误

如果遇到 `better-sqlite3` 编译错误，确保服务器上安装了构建工具：

```bash
# Ubuntu/Debian
sudo apt-get install build-essential python3

# CentOS/RHEL
sudo yum groupinstall "Development Tools"
sudo yum install python3
```

### 2. 端口被占用

如果 3000 端口被占用，可以：
- 修改 `package.json` 中的启动脚本：`"start": "next start -p 3001"`
- 或使用环境变量：`PORT=3001 npm start`

### 3. 数据库权限问题

确保应用有权限创建和写入 `data/` 目录：
```bash
chmod -R 755 /path/to/app/data
chown -R your-user:your-user /path/to/app/data
```

### 4. 内存不足

如果服务器内存较小，可以：
- 减少 PM2 实例数
- 增加 swap 空间
- 优化 Next.js 配置

## 监控和日志

### PM2 日志
```bash
pm2 logs who-tiger
pm2 monit
```

### systemd 日志
```bash
sudo journalctl -u who-tiger -f
```

## 安全建议

1. **使用 HTTPS**：配置 SSL 证书（Let's Encrypt）
2. **防火墙**：只开放必要端口
3. **定期更新**：保持 Node.js 和依赖包更新
4. **备份**：定期备份数据库文件
5. **环境变量**：敏感信息使用环境变量，不要提交到代码库

## 性能优化

1. **启用压缩**：在 Nginx 中启用 gzip
2. **CDN**：静态资源使用 CDN
3. **缓存**：合理配置 Next.js 缓存策略
4. **数据库优化**：定期清理旧数据

