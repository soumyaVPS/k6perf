const Utils = require('trustedkey-js/utils')
const JWT = require('jsonwebtoken')
const Chai = require('chai')
const Assert = Chai.assert
const httpClient = require('./client')()

function httpGet(path, credential, key, secret) {
    return httpClient.get(path, {credential, key, secret})
}

const  TK_APP_KEY = "7472b6380925e165b32acb0871e8f5e5";
const TK_APP_SECRET = "c8248a05f6c7494391109ac309a5b74d";
const devicetoken =
    'elYWjUdm1O4:APA91bGveIgqwCegLGp1RTdrUYPB1e7BEMHauKi84nLSDw9ie94ckxDOx9cp9mH4ITue-BxE3SFs28hoQGA7i9ynK6DL70e09k9Qe6bLd1icC5FfDN4RHfJy2YYAgbRavQRtZM-oagdr'
const login = 'test-login@example.com'

var registerLogin = ()=> {
    console.log("in registerlogin")
    httpGet('/registerLogin?login=' + encodeURIComponent(login),undefined,TK_APP_KEY, TK_APP_SECRET)
        .then(r=>
        {
            console.log(r.body)

        })
        .catch(err=>
        {
           console.log("caught error", err.message)
        })


}

httpGet('/registerDevice?devicetoken=' + devicetoken,undefined,TK_APP_KEY, TK_APP_SECRET)
    .then(r =>
        {console.log(r.body);
        registerLogin();
        return r.body})
//Assert.deepStrictEqual(o, {data: {registerDevice: true}})
/*
const oo =  httpGet('/getPendingRequest')
Assert.strictEqual(oo.data.nonce, nonce)
*/