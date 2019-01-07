const Config = require('./config.js');
const URL = require('url');
const WalletUtils = require('./lib/WalletUtils');
const Storage = require('./walletdb')
module.exports = function authn (deviceToken, payload) {

function completeLogin(signatureRequest, options, nonce, checksum) {
    delete signatureRequest.claims;
    delete signatureRequest.objectIds;
    delete signatureRequest.universalLink;
    const httpClient =  options.httpClient
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
        return options.httpClient.post(URL.parse(url).path, body)
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


var getPendingRequest = (wallet) =>{

    httpGet('/getPendingRequest',undefined, TK_APP_KEY, TK_APP_SECRET).expect(200)
        .then( r=>{

            if (r.body.data.result != false ) {
                sigReq = r.body.data
                //console.log(timestart ," Got a pending request at :",Date.now())
                console.log("sigReq : ", sigReq)

                completeLogin(sigReq, {
                    accept_login: true,
                    abort_poll: true,
                    httpClient: httpClient
                }, sigReq.nonce)
                    .then(r => {
                        console.log("completeLogin finished at:" , Date.now())
                    })
            }
        })
}

    wallet = {}

    Storage.getCreds(deviceToken).then(function (data) {
            wallet = data.item
            console.log (wallet)
            getPendingRequest(wallet)
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
