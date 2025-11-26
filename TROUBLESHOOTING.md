# 故障排查指南

## 端口占用问题

### 错误信息
```
Error: listen EADDRINUSE: address already in use :::3000
```

### 原因
端口 3000 已经被其他进程占用。

### 解决方案

#### 方案一：查找并停止占用端口的进程（推荐）

```bash
# 1. 查找占用 3000 端口的进程
lsof -i :3000
# 或
netstat -tulpn | grep :3000
# 或
ss -tulpn | grep :3000

# 2. 查看进程详情
ps aux | grep <PID>

# 3. 停止进程
kill -9 <PID>

# 4. 如果是 PM2 进程，使用 PM2 命令停止
pm2 stop all
pm2 delete all
```

#### 方案二：更改应用端口

修改 `ecosystem.config.js` 或 `pm2.config.js`：

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3001,  // 改为其他端口，如 3001
},
```

然后重启应用。

#### 方案三：使用环境变量设置端口

```bash
# 启动时指定端口
PORT=3001 pm2 start ecosystem.config.js

# 或在腾讯云面板中设置环境变量
PORT=3001
```

### 快速解决脚本

```bash
# 一键查找并停止占用 3000 端口的进程
lsof -ti :3000 | xargs kill -9

# 或更安全的方式（先查看再决定）
PID=$(lsof -ti :3000)
if [ ! -z "$PID" ]; then
  echo "找到占用 3000 端口的进程: $PID"
  ps aux | grep $PID
  read -p "是否要停止此进程? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    kill -9 $PID
    echo "进程已停止"
  fi
fi
```

## 其他常见问题

### 1. 日志目录权限问题

**错误信息：**
```
Log files were not written due to an error writing to the directory
```

**解决方案：**
```bash
# 创建日志目录并设置权限
mkdir -p /www/wwwroot/whoTiger/logs
chmod -R 755 /www/wwwroot/whoTiger/logs
chown -R www:www /www/wwwroot/whoTiger/logs
```

### 2. 数据库目录权限问题

**解决方案：**
```bash
# 创建数据目录并设置权限
mkdir -p /www/wwwroot/whoTiger/data
chmod -R 755 /www/wwwroot/whoTiger/data
chown -R www:www /www/wwwroot/whoTiger/data
```

### 3. Node.js 版本不兼容

**检查版本：**
```bash
node -v  # 应该 >= 18.0.0
```

**解决方案：**
```bash
# 使用 nvm 安装正确的版本
nvm install 18
nvm use 18
```

### 4. better-sqlite3 编译失败

**错误信息：**
```
Error: Cannot find module 'better-sqlite3'
```

**解决方案：**
```bash
# 安装编译工具
# Ubuntu/Debian
apt-get install build-essential python3

# CentOS/RHEL
yum groupinstall "Development Tools"
yum install python3

# 重新安装依赖
cd /www/wwwroot/whoTiger
rm -rf node_modules
npm install --production
```

### 5. PM2 进程管理问题

**查看所有 PM2 进程：**
```bash
pm2 list
pm2 status
```

**停止所有 PM2 进程：**
```bash
pm2 stop all
pm2 delete all
```

**查看 PM2 日志：**
```bash
pm2 logs who-tiger
pm2 logs who-tiger --err
```

### 6. 内存不足

**检查内存使用：**
```bash
free -h
pm2 monit
```

**解决方案：**
- 降低 PM2 内存限制
- 增加服务器内存
- 优化应用代码

## 预防措施

### 1. 启动前检查端口

```bash
# 检查端口是否被占用
check_port() {
  PORT=$1
  if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "端口 $PORT 已被占用"
    lsof -i :$PORT
    return 1
  else
    echo "端口 $PORT 可用"
    return 0
  fi
}

# 使用
check_port 3000
```

### 2. 使用不同的端口

如果 3000 端口经常被占用，可以：
- 在配置文件中使用其他端口（如 3001, 3002）
- 使用环境变量动态设置端口

### 3. 清理旧的 PM2 进程

```bash
# 定期清理
pm2 kill
pm2 resurrect  # 如果需要恢复
```

## 调试技巧

### 1. 查看详细日志

```bash
# PM2 日志
pm2 logs who-tiger --lines 100

# Next.js 详细日志
NODE_ENV=production DEBUG=* npm start

# 系统日志
journalctl -u who-tiger -f  # systemd
```

### 2. 测试端口连接

```bash
# 测试端口是否可访问
curl http://localhost:3000
telnet localhost 3000
```

### 3. 检查防火墙

```bash
# 检查防火墙规则
iptables -L -n
ufw status

# 开放端口（如果需要）
ufw allow 3000
```

## 联系支持

如果问题仍然存在，请提供：
1. 完整的错误日志
2. `pm2 logs who-tiger --lines 50`
3. `pm2 info who-tiger`
4. `node -v` 和 `npm -v`
5. 系统信息：`uname -a`

