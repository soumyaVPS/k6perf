const Config = require('./config.js');
const URL = require('url');
const WalletUtils = require('./lib/WalletUtils');
const Storage = require('./walletdb')

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
