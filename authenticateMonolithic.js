const Config = require('./config.js');
const URL = require('url');
const WalletUtils = require('./lib/WalletUtils');
const Storage = require('./walletdb')
const CircularJSON = require('circular-json-es6')
const Jsrsasign = require("jsrsasign");

var AWS = require('aws-sdk');
const MemoryCache = require('memory-cache')
var deviceCache = new MemoryCache.Cache();

function sendSqsMessage(message)
{
    sqs = new AWS.SQS();

    var params = {
        MessageBody: message,
        QueueUrl: Config.responseTimeLogQueue,
        DelaySeconds: 0
    };

    sqs.sendMessage(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
        } // an error occurred
        else {
            console.log('Victory, message sent  ' + params.MessageBody + '!');
        }
    });
}
//module.exports=Oauthn
module.exports = function authn (msg) {
    deviceToken = msg.deviceToken
    payload = msg.payload

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
         else {
            Assert.fail('Unsupported callbackType: ' + signatureRequest.callbackType)
        }
    }

/*
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
                            recordTime.loginCompleted = Date.now()
                            recordTime.cmd = "log"
                            recordTime.guid = sigReq.nonce  //TODO::guid or nonce
                            sendSqsMessage(JSON.stringify(recordTime))
                        })
                }
            })
    }
*/

    let recordTime = {}
    recordTime.notificationArrived = Date.now()
    function invokeCompleteLogin(wallet){
        const keyObj = Jsrsasign.KEYUTIL.getKey(wallet.credentials)
        httpClient = require('./client')(keyObj, Config.clientId, Config.clientSecret)

        const sigReq=payload
        recordTime.dbResponded = Date.now()
        //console.log("Signing signature request for sigReq : ", sigReq)

        completeLogin(sigReq, {
            accept_login: true,
            abort_poll: true,
        }, sigReq.nonce).then(r => {
            recordTime.loginCompleted = Date.now()
            recordTime.cmd = "log"
            recordTime.guid = sigReq.nonce  //TODO::guid or nonce
            recordTime.httpNotifiedAt = msg.httpNotifiedAt
            console.log( "completeLogin finished for:",wallet.loginhint)
            sendSqsMessage(JSON.stringify(recordTime))
        })
    }
    let wallet = deviceCache.get(deviceToken)
    if (wallet !=null)
    {
        invokeCompleteLogin(wallet)
    }
    else {
        Storage.getCreds(deviceToken).then(function (data) {
                const wallet = data.Item
                deviceCache.put(deviceToken, wallet)
                invokeCompleteLogin(wallet)
            }
        ).catch(err => {
            console.log("caught error", err.message)
        })
    }
}

//sign the payload : correct way to do
/*
Oauthn.getPendingRequest = async function (deviceToken, payload){
    Storage.getCreds(deviceToken).then(function (data) {
            const wallet = data.Item
            console.log("Retrieved Wallet from db: " ,wallet)
            const keyObj = Jsrsasign.KEYUTIL.getKey(wallet.credentials)
            console.log("Key Obj ", keyObj)

            const sigReq=payload

            completeLogin(sigReq, {
                        accept_login: true,
                        abort_poll: true,
                    }, sigReq.nonce).then(r => {
                            console.log("completeLogin finished at:", Date.now())
                        })
        }
    ).catch(err => {
        console.log("caught error", err.message)
    })

}
*/