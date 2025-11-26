# 快速修复：端口占用问题

## 问题
```
Error: listen EADDRINUSE: address already in use :::3000
```

## 快速解决方案

### 方法一：停止占用端口的进程（推荐）

在服务器上执行：

```bash
# 1. 查找占用 3000 端口的进程
lsof -i :3000

# 2. 查看进程详情（替换 <PID> 为实际的进程 ID）
ps aux | grep <PID>

# 3. 停止进程
kill -9 <PID>

# 或者如果是 PM2 进程
pm2 stop all
pm2 delete all
```

### 方法二：使用修复脚本

```bash
# 上传 fix-port.sh 到服务器后
chmod +x fix-port.sh
./fix-port.sh 3000
```

### 方法三：更改端口

如果无法停止占用端口的进程，可以更改应用端口：

#### 在腾讯云面板中：

1. 找到项目设置
2. 在环境变量中添加：
   ```
   PORT=3001
   ```
3. 或者在启动命令中使用：
   ```
   PORT=3001 npm start
   ```

#### 或修改配置文件：

编辑 `ecosystem.config.js`：

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3001,  // 改为其他端口
},
```

然后重启应用。

## 一键解决命令

```bash
# 停止所有占用 3000 端口的进程
lsof -ti :3000 | xargs kill -9

# 然后重新启动应用
pm2 restart who-tiger
# 或
npm start
```

## 预防措施

### 1. 启动前检查端口

```bash
# 检查端口是否可用
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
  echo "端口 3000 已被占用"
  lsof -i :3000
else
  echo "端口 3000 可用"
fi
```

### 2. 使用环境变量设置端口

在腾讯云面板的项目配置中，添加环境变量：
- 变量名：`PORT`
- 变量值：`3001`（或其他可用端口）

这样即使默认端口被占用，也会使用指定的端口。

## 常见占用端口的原因

1. **之前的 PM2 进程未停止**
   ```bash
   pm2 list  # 查看所有进程
   pm2 stop all  # 停止所有进程
   ```

2. **其他 Node.js 应用正在运行**
   ```bash
   ps aux | grep node
   ```

3. **面板自动启动的进程**
   - 检查面板中的其他项目
   - 确保没有重复启动

## 验证修复

修复后，验证端口是否可用：

```bash
# 检查端口
lsof -i :3000

# 如果返回空，说明端口可用
# 然后启动应用
pm2 start ecosystem.config.js
```

## 如果问题仍然存在

1. 查看详细错误日志：
   ```bash
   pm2 logs who-tiger --err
   ```

2. 检查系统资源：
   ```bash
   free -h
   df -h
   ```

3. 查看系统日志：
   ```bash
   journalctl -xe
   ```

