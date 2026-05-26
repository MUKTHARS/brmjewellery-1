module.exports = {
  apps: [{
    name: 'brm-jewellery-frontend',
    script: '.next/standalone/server.js',
    cwd: './',
    instances: 1,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    max_restarts: 10,
    min_uptime: '10s',
    listen_timeout: 10000,
    kill_timeout: 5000,
    env: {
      PORT: 3000,
      NODE_ENV: 'production',
      HOSTNAME: '0.0.0.0',
    },
    env_production: {
      PORT: 3000,
      NODE_ENV: 'production',
      HOSTNAME: '0.0.0.0',
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    merge_logs: true
  }]
};
