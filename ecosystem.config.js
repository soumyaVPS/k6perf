apptemplate = {
    name: 'DEVICE 2',
        script: './registerUserDevice.js',
    args: ["--delay=0", "--login=qqqqqqqq11"],
    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    node_args: ["--expose-gc"],
    instances: 1,
    autorestart: false,
    watch: false,
    max_memory_restart: '1G',
    env: {
    NODE_ENV: 'development'
},
    env_production: {
        NODE_ENV: 'production'
    }
}
login_prefix= process.env.login_prefix
device_count= process.env.device_count
console.log(process.env, login_prefix, device_count)
applist = []
for (i = 1; i<=device_count; i++) {
    let login = login_prefix + i
    let app = JSON.parse(JSON.stringify(apptemplate))
    app.args = ["--delay=0", "--login="+login]
    app.name = "Device " + i
    applist.push(app)
}

var http = require('http');
var fs = require('fs');
var path = require('path');

http.createServer(function (request, response) {

    console.log('request starting for ');
    request.body.
        response.writeHead(200,"Hello");
        response.end();

}).listen(process.env.PORT ||3030);
used = process.memoryUsage().heapUsed / 1024 / 1024;
console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
module.exports = {
  apps : applist,

  deploy : {
    development : {
      user : 'node',
      host : '0.0.0.0',
      //port: process.env.PORT || 3030,
      ref  : 'origin/master',
      repo : 'git@github.com:soumyaVPS/k6perf.git',
      path : '/var/www/production',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env development'
    }
  }

};
