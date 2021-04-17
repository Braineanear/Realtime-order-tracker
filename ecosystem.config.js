module.exports = {
  apps: [
    {
      name: 'Realtime Pizza Order',
      script: 'src/server.js',
      instance: 'max',
      watch: true,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
