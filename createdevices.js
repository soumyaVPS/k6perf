const ChildProcess = require('child_process')
const args = require('yargs').argv

const login_prefix = `test-login${Math.random()}`
//const login_prefix = 'aaaa-test'
const device_count = args.n


const launch_k6 = `k6 run  -e login_prefix=${login_prefix} -d 1m --vus ${device_count} oaauth.js`
for (let i = 0;i<device_count;i++) {
    let devicetoken =
        'elYWjUdm1O4:APA91bGveIgqwCegLGp1RTdrUYPB1e7BEMHauKi84nLSDw9ie94ckxDOx9cp9mH4ITue-BxE3SFs28hoQGA7i9ynK6DL70e09k9Qe6bLd1icC5FfDN4RHfJy2YYAgbRavQRtZM-' + (Math.random() * 0xFFFFFF).toString(16).substring(2, 6)
    let login = `${login_prefix}${i}@example.com`
    console.log(devicetoken,login)
    const p = ChildProcess.exec("node registerUserDevice --login=" +login, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
        })

}
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
