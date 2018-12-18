module.exports = {
  apps : [{
    name: 'DEVICE Starter',
      script: './registerUserDevice.js',
    args: ["-n=1", "--login=qqqqqqqq4"],

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],

  deploy : {
    development : {
      user : 'node',
      host : '0.0.0.0',
      ref  : 'origin/master',
      repo : 'git@github.com:soumyaVPS/k6perf.git',
      path : '/var/www/production',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env development'
    }
  }

};
