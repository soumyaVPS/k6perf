const ChildProcess = require('child_process')
const args = require('yargs').argv

//const login_prefix = `test-login${Math.random()}`
//const login_prefix = 'zion111'
const device_count = args.n
const login_prefix = args.login_prefix
console.log("*****", device_count, login_prefix)
const launch_k6 = `k6 run  -e login_prefix=${login_prefix} -d 1m --vus ${device_count} oaauth.js`
var device_procs = []
for (let i = 1;i<=device_count;i++) {
    let devicetoken =
    'elYWjUdm1O4:APA91bGveIgqwCegLGp1RTdrUYPB1e7BEMHauKi84nLSDw9ie94ckxDOx9cp9mH4ITue-BxE3SFs28hoQGA7i9ynK6DL70e09k9Qe6bLd1icC5FfDN4RHfJy2YYAgbRavQRtZM-' + (Math.random() * 0xFFFFFF).toString(16).substring(2, 6)
    let login_name = `${login_prefix}${i}`
    console.log(devicetoken,login_name)
    const p = ChildProcess.exec("node registerUserDevice --login=" +login_name, (error, stdout, stderr) => {
                                if (error) {
                                console.error(`exec error: ${error}`);
                                return;
                                }
                                console.log(`stdout: ${stdout}`);
                                console.log(`stderr: ${stderr}`);
                                })
    p.stdout.pipe(process.stdout);
    
    device_procs.push(p)
    
}
/*
 setTimeout(()=>
 {
 console.log("launch "+launch_k6)
 ChildProcess.exec(launch_k6, (error, stdout, stderr) => {
 //ChildProcess.exec(`k6 run  -e login_prefix=${login_prefix} oaauth.js`, (error, stdout, stderr) => {
 
 if (error) {
 console.error(`exec error: ${error}`);
 return;
 }
 console.log(`stdout: ${stdout}`);
 console.log(`stderr: ${stderr}`);
 })
 }, 2000)
 */