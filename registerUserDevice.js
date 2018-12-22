

//const login = `test-login${Math.random()}@example.com`
const  TK_APP_KEY = "7472b6380925e165b32acb0871e8f5e5";
const TK_APP_SECRET = "c8248a05f6c7494391109ac309a5b74d";
const Config = require('./config.js');
const WalletUtils = require('./lib/WalletUtils')
URL = require('url')
import RequestConstructor from './k6client.js'

module.exports = function UserWallet(loginID) {
    this.loginID = loginID
    var rqCreate = new RequestConstructor(undefined, TK_APP_KEY, TK_APP_SECRET)
    var devicetoken =
        'elYWjUdm1O4:APA91bGveIgqwCegLGp1RTdrUYPB1e7BEMHbuKi84nLSDw9ie94ckxDOx9cp9mH4ITue-BxE3SFs28hoQGA7i9ynK6DL70e09k9Qe6bLd1icC5FfDN4RHfJy2YYAgbRavQRtZM-' + (Math.random() * 0xFFFFFF).toString(16).substring(2, 6)


    const createRequest = (path, credential, key, secret) => rqCreate.get(path, {cedential, key, secret});

}

    UserWallet.prototype.dumpcreds= function() {
        console.log("login: ", loginID)
        console.log("devicetoken: ", devicetoken)
        console.log("address", httpClient.address)
        //console.log("credentials: ", httpClient.pair)
    }

    UserWallet.prototype.completeLogin = function (signatureRequest, options, nonce, checksum) {
        //const objectIds = signatureRequest.objectIds
        // Assert.deepStrictEqual(signatureRequest.claims, options.claims)
        delete signatureRequest.claims
        delete signatureRequest.objectIds
        delete signatureRequest.universalLink

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
            const body = {certs, chain: options.chain}
            return rqCreate.post(URL.parse(url).path, body, {TK_APP_KEY, TK_APP_SECRET})
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

            return rqCreate.get(URL.parse(url).path, options)
        } else {
            Assert.fail('Unsupported callbackType: ' + signatureRequest.callbackType)
        }
    }

    UserWallet.prototype.getPendingRequest =()=> {
        //console.log("getpendingRequest :" , Date.now())
        return createRequest('/getPendingRequest', undefined, TK_APP_KEY, TK_APP_SECRET)
    }



    UserWallet.prototype.registerLogin = ()=>{
            return createRequest('/registerLogin?login=' + encodeURIComponent(loginID), undefined, TK_APP_KEY, TK_APP_SECRET)
    }

    UserWallet.prototype.registerDevice =() =>{
        return createRequest('/registerDevice?devicetoken=' + devicetoken, undefined, TK_APP_KEY, TK_APP_SECRET)
    }
