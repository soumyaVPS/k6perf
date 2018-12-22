


// Custom Trusted Key http client that signs requests
const WalletUtils = require('./lib/WalletUtils.js')
const Utils = require('trustedkey-js/utils.js')

const Config = require('./config')
const App = Config.walletServiceUrl

const URL = require('url')

//var Agent = require('agentkeepalive').HttpsAgent;
/*
var keepaliveAgent = new Agent({
    maxSockets: 100,
    maxFreeSockets: 10,
    timeout: 120000,
    freeSocketTimeout: 60000 // free socket keepalive for 60 seconds
});
*/

/**
 * Create a new HTTP client with `get` and `post` functions
 * @param {object?} [pair] User credential, or null to create a new key pair
 * @param {string?} [appKey] App client key/ID, or null to use test credential
 * @param {string?} [appSecret] App client secret, or null to use test credential
 * @returns {object} New HTTP client with `get` and `post` functions
 */
module.exports = function RequestConstructor (pair, appKey, appSecret) {
    pair = pair || Utils.generateKeyPair()
    pair.address = Utils.userPubKeyHexToAddress(pair.pubKeyHex)

    return {
        pair,
        address: pair.address,
    }
}

RequestConstructor.prototype.get= (path, options) => {
    const {app = App, credential = pair, agent = false, key = appKey, secret = appSecret, json = true} = options || {}
    //console.log("*********************", Date.now())
    absUrl = URL.resolve(app, path)
    reqURL = absUrl.split(/[?#]/)[0]
    let authzheader = WalletUtils.getAuthorizationHeader(absUrl, credential, undefined, key, secret)
    return {path: absUrl, options: {Authorization: authzheader}}
},

RequestConstructor.prototype.post=(path, body, options) => {
    const {app = App, credential = pair, agent = false, key = appKey, secret = appSecret, json = true} = options || {}
    absUrl = URL.resolve(app, path)
    reqURL = absUrl.split(/[?#]/)[0]
    let authzheader = WalletUtils.getAuthorizationHeader(absUrl, credential, body, key, secret)
    return {
        path: absUrl,
        payload: body,
        options: {
            Authorization: authzheader
        }
    }
}
