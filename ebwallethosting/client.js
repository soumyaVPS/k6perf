// Custom Trusted Key http client that signs requests
const WalletUtils = require('../lib/WalletUtils')
const Utils = require('trustedkey-js/utils')
const Request = require('supertest')
const Config = require('./config')
const App = Config.walletServiceUrl
const Jsrsasign = require("jsrsasign");

/**
 * Create a new HTTP client with `get` and `post` functions
 * @param {object?} [pair] User credential, or null to create a new key pair
 * @param {string?} [appKey] App client key/ID, or null to use test credential
 * @param {string?} [appSecret] App client secret, or null to use test credential
 * @returns {object} New HTTP client with `get` and `post` functions
 */
module.exports = function(pair, appKey, appSecret) {
    curveName=undefined // TODO:: copied Utils.generateKeyPair here because getting jwkey from the key that was gen did not work.
    pair = pair || Jsrsasign.KEYUTIL.generateKeypair(curveName>0?'RSA':'EC',curveName||'secp256r1').prvKeyObj
    pair.address = Utils.userPubKeyHexToAddress(pair.pubKeyHex)
    //console.log("created a httpClient object")
    return {
        pair,
        address: pair.address,

        get: (path, options) => {
            const {app = App, credential = pair, agent = false, key = appKey, secret = appSecret, json = true} = options || {}
            req = Request(app).get(path)
                .set('Accept', json ? 'application/json' : 'text/plain')
            req.set('Authorization', WalletUtils.getAuthorizationHeader(req.url, credential, null, key, secret))
            return req
        },

        post: (path, body, options) => {
            const {app = App, credential = pair, agent = false, key = appKey, secret = appSecret, json = true} = options || {}
            let req = agent || Request(app)
            req = req
                .post(path)
                .set('Accept', json ? 'application/json' : 'text/plain')
                .set('Content-Type', 'application/json')
            let authzheader = WalletUtils.getAuthorizationHeader(req.url, credential, body, key, secret)
            //console.log("Sending confirmlogin to ", req.url, " ", path)
            return req
                .set('Authorization', authzheader)
                .send(body)
        }
    }
}
