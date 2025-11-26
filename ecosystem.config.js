module.exports = {
  apps: [
    {
      name: 'who-tiger',
      script: 'npm',
      args: 'start',
      cwd: process.cwd(),
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // 如果内存超过 1G，自动重启
      max_memory_restart: '1024M',
      // 进程崩溃后等待时间（毫秒）
      min_uptime: '10s',
      // 最大重启次数
      max_restarts: 10,
      // 重启间隔
      restart_delay: 4000,
    },
  ],
};
