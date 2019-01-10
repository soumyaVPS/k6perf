const Request = require('supertest')


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function main() {
    for (let i = 149; i < 500; i++) {
        let urlpath = "http://perfsyntheticwallets-env.dpxssdrz7n.us-east-2.elasticbeanstalk.com";

        let res3 = Request(urlpath).get("/createUser?login=testuser12345670" + i).then(r => {
            console.log(Date.now(), ": created user ", "testuser12345670" + i)
        })
        await sleep(500);

        console.log(res3.status)
    }
}
main()
