const Request = require('supertest')
for (let i =0; i<100;i++) {
    let urlpath = "http://perfsyntheticwallets-env.dpxssdrz7n.us-east-2.elasticbeanstalk.com/createUser?login=testuser12345678";

    let res3 = Request.(urlpath)
    console.log(res3.status)
}
