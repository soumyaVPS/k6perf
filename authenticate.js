const Config = require('./config.js');
const URL = require('url');
const WalletUtils = require('./lib/WalletUtils');
const Storage = require('./walletdb')
const CircularJSON = require('circular-json-es6')
const Jsrsasign = require("jsrsasign");

module.exports = function authn(deviceToken, payload) {
    var httpClient = {}
    function httpGet(path, credential, key, secret) {
        return httpClient.get(path, {credential, key, secret})
    }

    function completeLogin(signatureRequest, options, nonce, checksum) {
        delete signatureRequest.claims;
        delete signatureRequest.objectIds;
        delete signatureRequest.universalLink;
        // Assemble callback URL for device
        var certs = [];

        if (signatureRequest.callbackType === 'post') {
            let url = WalletUtils.buildClaimCallback(
                httpClient.pair, //credentials
                signatureRequest.callbackUrl,
                Config.clientId,
                signatureRequest.nonce,
                undefined,  //signatureRequest.username,
                options.accept_login
            );//.replace(/https?:\/\/[^/?]+/, walletUrl)

            const body = {certs, chain: options.chain};
            return httpClient.post(URL.parse(url).path, body)
        }

       /* if (signatureRequest.callbackType === 'json') {
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
        }*/ else {
            Assert.fail('Unsupported callbackType: ' + signatureRequest.callbackType)
        }
    }


    var getPendingRequest = () => {

        httpGet('/getPendingRequest', undefined, Config.clientId, Config.clientSecret).expect(200)
            .then(r => {
                console.log("getPendingRequest returned:", r.body)
                if (r.body.data.result != false) {
                    sigReq = r.body.data
                    //console.log(timestart ," Got a pending request at :",Date.now())
                    console.log("sigReq : ", sigReq)

                    completeLogin(sigReq, {
                        accept_login: true,
                        abort_poll: true,
                    }, sigReq.nonce)
                        .then(r => {
                            console.log("completeLogin finished at:", Date.now())
                        })
                }
            })
    }


    Storage.getCreds(deviceToken).then(function (data) {
            wallet = data.Item
            console.log("Retrieved Wallet from db: " ,wallet)
            const keyObj = Jsrsasign.KEYUTIL.getKey(wallet.credentials)
            console.log("Key Obj ", keyObj)
            httpClient = require('./client')(keyObj, Config.clientId, Config.clientSecret)
            getPendingRequest()
        }
    ).catch(err => {
        console.log("caught error", err.message)
    })
}
/*
sign the payload : correct way to do

module.exports = async function authn (deviceToken, payload){
    wallet ={}
    try {
        wallet = await Storage.getCreds(deviceToken)
    }
    catch (error)
    {
        console.log("Error getting Creds for :",deviceToken)
    }
    const httpClient = require('./client')(wallet.credentials, Config.clientId, Config.clientSecret);
    sigReq=payload
    completeLogin(sigReq, {
        accept_login: true,
        abort_poll: true,
        httpClient: httpClient
    }, sigReq.nonce)
        .then(r => {
            //console.log("Device responded at :" , Date.now())
        })
}
*/
