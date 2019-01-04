const Chai = require('chai');
Assert = Chai.assert
var app = express();

const Config = require('./config.js');
const URL = require('url');
const WalletUtils = require('./lib/WalletUtils');
const Storage = require('./walletdb')
const Register = require ('./register')
function completeLogin(signatureRequest, options, nonce, checksum) {
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
        return httpClient.post(URL.parse(url).path, body)
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

async function authn (deviceToken, payload){
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
                    credential: httpClient.pair
                }, sigReq.nonce)
                    .then(r => {
                        //console.log("Device responded at :" , Date.now())
                    })
}


var AWS = require('aws-sdk');

// Create SQS service object
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
var queueURL = Config.awsSQSUrl;
var params = {
    AttributeNames: [
        "SentTimestamp"
    ],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: [
        "All"
    ],
    QueueUrl: queueURL,
    VisibilityTimeout: 20,
    WaitTimeSeconds: 0
};

sqs.receiveMessage(params, function(err, data) {
    if (err) {
        console.log("Receive Error", err);
    } else if (data.Messages) {
        msg = data.Messages[0].Body
        msg = JSON.parse(msg)
        if (msg.cmd == 'createUser') {
            return Register(msg.id)
        }
        else if(msg.cmd == 'notified'){
            return authn(msg.deviceToken, msg.payload)
        }
        else{
            console.log("invalid command:", msg);
        }
        var deleteParams = {
            QueueUrl: queueURL,
            ReceiptHandle: data.Messages[0].ReceiptHandle
        };
        sqs.deleteMessage(deleteParams, function(err, data) {
            if (err) {
                console.log("Delete Error", err);
            } else {
                console.log("Message Deleted", data);
            }
        });
    }
});


port = process.env.PORT ||3000
//console.log(port)
app.listen(port, function() {

    //console.log('Example app listening on port 8090!');
});




