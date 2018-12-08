
const Utils = require('trustedkey-js/utils')
const JWT = require('jsonwebtoken')
const Chai = require('chai')
const args = require('yargs').argv;

const Assert = Chai.assert
const devicetoken =
    'elYWjUdm1O4:APA91bGveIgqwCegLGp1RTdrUYPB1e7BEMHauKi84nLSDw9ie94ckxDOx9cp9mH4ITue-BxE3SFs28hoQGA7i9ynK6DL70e09k9Qe6bLd1icC5FfDN4RHfJy2YYAgbRavQRtZM-' + (Math.random() * 0xFFFFFF).toString(16).substring(2, 6)
//const login = `test-login${Math.random()}@example.com`
const login = args.login
const  TK_APP_KEY = "7472b6380925e165b32acb0871e8f5e5";
const TK_APP_SECRET = "c8248a05f6c7494391109ac309a5b74d";
const httpClient = require('./client')(undefined, TK_APP_KEY, TK_APP_SECRET)
const Config = require('./config.js');
const URL = require('url')
function httpGet(path, credential, key, secret) {
    return httpClient.get(path, {credential, key, secret})
}

const WalletUtils = require('./lib/WalletUtils')

function dumpcreds()
{
    console.log("login: ", login)
    console.log("devicetoken: ",devicetoken)
    console.log("address",  httpClient.address)
    //console.log("credentials: ", httpClient.pair)

}
function deviceRespond(signatureRequest, options, nonce, checksum) {
    //const objectIds = signatureRequest.objectIds
   // Assert.deepStrictEqual(signatureRequest.claims, options.claims)
    delete signatureRequest.claims
    delete signatureRequest.objectIds
    delete signatureRequest.universalLink

    /*Assert.deepEqual(signatureRequest, {
        callbackType: 'post',
        callbackUrl: ExpectedCallbackUrl,
        nonce: nonce,
        username: options.username,
        message: options.message || `Please authenticate ${checksum}`,
        hostname: '127.0.0.1',
        client_id: clientId,
        scope: options.scope
    })
    */

    // Assemble callback URL for device
    var certs = []

    if (signatureRequest.callbackType === 'post') {
        let url = WalletUtils.buildClaimCallback(
            options.credential || pair,
            signatureRequest.callbackUrl,
           // clientId,
            Config.clientId,
            signatureRequest.nonce,
            //signatureRequest.username,
            undefined,
            options.accept_login
        )//.replace(/https?:\/\/[^/?]+/, walletUrl)

        //console.log(url.path)
        const body = {certs, chain: options.chain}
        return httpClient.post(URL.parse(url).path, body, {TK_APP_KEY, TK_APP_SECRET})
    }
    else if (objectIds && options.include_certificate) {
        certs = WalletUtils.matchClaims(Globals.pems, objectIds.split(',')).map(
            claim => (options.noPemHeader ? claim.pem.replace(/-----[ A-Z]+-----|\r?\n/g, '') : claim.pem)
        )
    }

    if (signatureRequest.callbackType === 'json') {
        let url = WalletUtils.buildClaimCallback(
            options.credential || pair,
            signatureRequest.callbackUrl,
            Config.clientId,
            signatureRequest.nonce,
            options.username_response,
            options.accept_login ? certs : null,
            options.chain
        )

        return httpClient.get(URL.parse(url).path, options)
    } else {
        Assert.fail('Unsupported callbackType: ' + signatureRequest.callbackType)
    }
}

function  register() {

    var getPendingRequest = () =>{
        //console.log("getpendingRequest :" , Date.now())
        httpGet('/getPendingRequest',undefined, TK_APP_KEY, TK_APP_SECRET).expect(200)
            .then( r=>{
               // console.log(r.body)
                //console.log("getpendingRequest 2:" , Date.now())
                if (r.body.data.result != false ) {
                    sigReq = r.body.data
                    //console.log("Got a pending request at :",Date.now())
                    deviceRespond(sigReq,{accept_login: true, abort_poll: true, credential: httpClient.pair},sigReq.nonce)
                        .then(r=>{
                              //console.log("Device responded at :" , Date.now())
                              })
                }

                setTimeout(getPendingRequest, 500)
                //getPendingRequest()
            })
    }

    var registerLogin = () => {

        httpGet('/registerLogin?login=' + encodeURIComponent(login), undefined, TK_APP_KEY, TK_APP_SECRET)
            .then(r => {
                console.log("registerLogin at :",Date.now())
                console.log(r.body)
                Assert.deepStrictEqual(r.body, { data: true })
                setTimeout(getPendingRequest, 200)
            })
            .catch(err => {
                console.log("caught error", err.message)
            })
    }

    console.log("registerDevice at :",Date.now())
    httpGet('/registerDevice?devicetoken=' + devicetoken, undefined, TK_APP_KEY, TK_APP_SECRET)
        .then(r => {
            console.log("registerDevice at :",Date.now())
            console.log(r.body);
            Assert.deepStrictEqual(r.body, {data: {registerDevice: true}})
            registerLogin();
            return r.body
        })

}
//loadusers()

dumpcreds()
register()
