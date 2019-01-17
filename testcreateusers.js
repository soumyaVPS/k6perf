const Request = require('supertest')


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function main() {
    for (let i =0; i < 1000; i++) {
        let urlpath = "http://tkperftestwallets.us-east-2.elasticbeanstalk.com";

        let res3 = Request(urlpath).get("/createUser?login=testuser12345673" + i).then(r => {
            console.log(Date.now(), ": created user ", "testuser12345673" + i)
        })
        await sleep(500);

        console.log(res3.status)
    }
}
//main()
let recordTime = {}
recordTime.notificationArrived = Date.now() +150
recordTime.dbResponded = Date.now()
a = JSON.stringify(recordTime)
console.log(recordTime)
console.log(a)
console.log(new Date(parseInt("1547594545839")).toLocaleString())
console.log(new Date(1547594618643).toLocaleString())
console.log (recordTime.notificationArrived - recordTime.dbResponded)
