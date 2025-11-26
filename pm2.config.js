/**
 * PM2 配置文件
 * 用于生产环境部署
 * 
 * 使用方法:
 *   pm2 start pm2.config.js
 *   pm2 start pm2.config.js --env production
 *   pm2 restart who-tiger
 *   pm2 stop who-tiger
 *   pm2 logs who-tiger
 */

module.exports = {
  apps: [
    {
      // 应用名称
      name: 'who-tiger',
      
      // 启动脚本 - 使用 npm start
      script: 'npm',
      args: 'start',
      
      // 工作目录
      cwd: process.cwd(),
      
      // 实例数量（1 = 单实例，'max' = CPU核心数）
      instances: 1,
      
      // 执行模式：fork（单实例）或 cluster（集群）
      exec_mode: 'fork',
      
      // 自动重启
      autorestart: true,
      
      // 文件监听（生产环境建议关闭）
      watch: false,
      
      // 忽略监听的文件/目录
      ignore_watch: [
        'node_modules',
        'logs',
        'data',
        '.next/cache',
      ],
      
      // 环境变量
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      
      // 日志配置
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      log_type: 'json',
      
      // 内存限制（超过此值自动重启）
      max_memory_restart: '1024M',
      
      // 最小运行时间（小于此时间重启会被视为异常）
      min_uptime: '10s',
      
      // 最大重启次数（超过此次数后停止重启）
      max_restarts: 10,
      
      // 重启延迟（毫秒）
      restart_delay: 4000,
      
      // 等待就绪时间（毫秒）
      listen_timeout: 10000,
      
      // 杀死进程超时时间（毫秒）
      kill_timeout: 5000,
      
      // 等待重载时间（毫秒）
      wait_ready: true,
      
      // 实例间负载均衡
      instance_var: 'INSTANCE_ID',
    },
  ],
};

