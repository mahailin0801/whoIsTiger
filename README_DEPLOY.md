# 快速部署指南

## 本地打包

```bash
npm run build
```

构建完成后，`.next` 目录包含生产代码。

## 部署到服务器

### 方式一：使用部署脚本（推荐）

```bash
# 基本用法
./deploy.sh your-server-ip

# 指定用户名和路径
./deploy.sh your-server-ip username /path/to/app
```

### 方式二：手动部署

1. **上传文件到服务器**
   ```bash
   rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'data' \
     .next/ app/ components/ lib/ package.json next.config.js \
     tsconfig.json ecosystem.config.js \
     user@server:/path/to/app/
   ```

2. **在服务器上安装依赖**
   ```bash
   ssh user@server
   cd /path/to/app
   npm install --production
   ```

3. **启动应用**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   ```

## 服务器要求

- Node.js >= 18.0.0
- npm
- PM2（推荐）或 systemd

## 检查部署

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs who-tiger

# 查看应用信息
pm2 info who-tiger
```

## 更新应用

```bash
# 在本地重新构建
npm run build

# 使用部署脚本更新
./deploy.sh your-server-ip

# 或手动更新
rsync -avz --exclude 'node_modules' .next/ app/ components/ lib/ \
  package.json next.config.js tsconfig.json \
  user@server:/path/to/app/
ssh user@server "cd /path/to/app && npm install --production && pm2 restart who-tiger"
```

## 配置 Nginx（可选）

如果需要通过域名访问，配置 Nginx 反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:30000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

详细说明请查看 `DEPLOY.md` 文件。

