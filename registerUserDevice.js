const Utils = require('trustedkey-js/utils');
const JWT = require('jsonwebtoken');
const Chai = require('chai');
const args = require('yargs').argv;

const Assert = Chai.assert;
const devicetoken =
    'elYWjUdm1O4:APA91bGveIgqwCegLGp1RTdrUYPB1e7BEMHauKi84nLSDw9ie94ckxDOx9cp9mH4ITue-BxE3SFs28hoQGA7i9ynK6DL70e09k9Qe6bLd1icC5FfDN4RHfJy2YYAgbRavQRtZM-' + (Math.random() * 0xFFFFFF).toString(16).substring(2, 6);
const login_name = args.login;
//const  TK_APP_KEY = "7472b6380925e165b32acb0871e8f5e5";
//const TK_APP_SECRET = "c8248a05f6c7494391109ac309a5b74d";
//const  TK_APP_KEY = "8c92a928-8315-4869-987b-5fd24353463a";
//const  TK_APP_SECRET = "OPB5iBOBEiatqX_FnRotfmr0An8ivAYt7LXBU6Ovxmg";
const TK_APP_KEY = "56623880-b4a1-4085-bb3e-b32986503c67";
const TK_APP_SECRET = "MtmZPhOuQRqoogWI9c49VTh-nVTLATT7EcvjVGk5zP4";
const httpClient = require('./client')(undefined, TK_APP_KEY, TK_APP_SECRET);
const Config = require('./config.js');
const URL = require('url');

function httpGet(path, credential, key, secret) {
    return httpClient.get(path, {credential, key, secret})
}

const WalletUtils = require('./lib/WalletUtils');

function dumpcreds() {
    console.log("login: ", login_name);
    //  console.log("devicetoken: ",devicetoken)
    console.log("address", httpClient.address)
    //console.log("credentials: ", httpClient.pair)

}

function deviceRespond(signatureRequest, options, nonce, checksum) {
    //const objectIds = signatureRequest.objectIds
    // Assert.deepStrictEqual(signatureRequest.claims, options.claims)
    delete signatureRequest.claims;
    delete signatureRequest.objectIds;
    delete signatureRequest.universalLink;

    // Assemble callback URL for device
    var certs = [];

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
        );//.replace(/https?:\/\/[^/?]+/, walletUrl)


        const body = {certs, chain: options.chain};
        return httpClient.post(URL.parse(url).path, body, {TK_APP_KEY, TK_APP_SECRET})
    } else if (objectIds && options.include_certificate) {
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
        );

        return httpClient.get(URL.parse(url).path, options)
    } else {
        Assert.fail('Unsupported callbackType: ' + signatureRequest.callbackType)
    }
}

var reqCount = 0;
var timeSum = 0;
var allPendingTimeSum = 0;
var allPendingCount = 0;
var dateNow = Date.now()
var dateLast = dateNow

function register() {

    var getPendingRequest = () => {
        //console.log("getpendingRequest :" , Date.now())
        let timestart = Date.now();
        httpGet('/getPendingRequest', undefined, TK_APP_KEY, TK_APP_SECRET).expect(200)
            .then(r => {
                dateNow = Date.now()
                allPendingTimeSum += Date.now() - timestart;
                allPendingCount++;
                if (allPendingCount == 100) {
                    console.log(login_name, ": Average time over ", allPendingCount, " getPendingRequest calls:", allPendingTimeSum / allPendingCount);
                    allPendingCount = 0;
                    allPendingTimeSum = 0
                    if (dateNow - dateLast >= 60000) {
                        used = process.memoryUsage().heapUsed / 1024 / 1024;
                        console.log(`The script used approximately ${Math.round(used * 100) / 100} MB`);
                        if(global.gc) {
                            global.gc();

                        }
                        used = process.memoryUsage().heapUsed / 1024 / 1024;
                        console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
                    }
                }
                if (r.body.data.result != false) {
                    sigReq = r.body.data;
                    //console.log(timestart ," Got a pending request at :",Date.now())
                    //console.log(sigReq)
                    deviceRespond(sigReq, {
                        accept_login: true,
                        abort_poll: true,
                        credential: httpClient.pair
                    }, sigReq.nonce)
                        .then(r => {
                            //console.log("Device responded at :" , Date.now())
                            timeSum += Date.now() - timestart;
                            reqCount++;
                            if (reqCount == 30) {
                                console.log(login_name, ": Average time over ", reqCount, " completeLogin calls:", timeSum / reqCount);
                                reqCount = 0;
                                timeSum = 0
                            }
                        })
                }

                setTimeout(getPendingRequest, 100)
                //getPendingRequest()
            })
    };

    var registerLogin = () => {

        httpGet('/registerLogin?login=' + encodeURIComponent(login_name), undefined, TK_APP_KEY, TK_APP_SECRET)
            .then(r => {
                console.log("registerLogin at :", Date.now());
                console.log(r.body);
                Assert.deepStrictEqual(r.body, {data: true});
                setTimeout(getPendingRequest, 200)
            })
            .catch(err => {
                console.log("caught error", err.message)
            })
    };

    console.log("registerDevice at :", Date.now());
    httpGet('/registerDevice?devicetoken=' + devicetoken, undefined, TK_APP_KEY, TK_APP_SECRET)
        .then(r => {
            console.log("registerDevice at :", Date.now());
            console.log(r.body);
            Assert.deepStrictEqual(r.body, {data: {registerDevice: true}});
            registerLogin();
            return r.body
        })

}

//loadusers()

dumpcreds();
register();
