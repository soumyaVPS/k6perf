const ChildProcess = require('child_process')
const login_prefix = `test-login${Math.random()}`
const device_count = 10
const launch_k6 = "k6 run oaauth"
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
ChildProcess.exec(`k6 run  -e login_prefix=${login_prefix} -d 1m --vus ${device_count} oaauth.js`, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
})
