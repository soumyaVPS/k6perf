// Custom Trusted Key http client that signs requests
const WalletUtils = require('./lib/WalletUtils')
const Utils = require('trustedkey-js/utils')
const Request = require('supertest')
const Express = require('express')
//const App = Express()
const Config = require('./config')
const App = Config.walletServiceUrl


/**
 * Create a new HTTP client with `get` and `post` functions
 * @param {object?} [pair] User credential, or null to create a new key pair
 * @param {string?} [appKey] App client key/ID, or null to use test credential
 * @param {string?} [appSecret] App client secret, or null to use test credential
 * @returns {object} New HTTP client with `get` and `post` functions
 */
module.exports = function(pair, appKey, appSecret) {
    pair = pair || Utils.generateKeyPair()
    pair.address = Utils.userPubKeyHexToAddress(pair.pubKeyHex)

    return {
        pair,
        address: pair.address,

        get: (path, options) => {
            const {app = App, credential = pair, agent = false, key = appKey, secret = appSecret, json = true} = options || {}

            //let req = agent || Request(app)

            req = Request(app).get(path)
                .set('Accept', json ? 'application/json' : 'text/plain')
            req.set('Authorization', WalletUtils.getAuthorizationHeader(req.url, credential, null, key, secret))
            return req
            //console.log(req.headers)

        },

        post: (path, body, options) => {
            const {app = App, credential = pair, agent = false, key = appKey, secret = appSecret, json = true} = options || {}
            let req = agent || Request(app)
            req = req
                .post(path)
                .set('Accept', json ? 'application/json' : 'text/plain')
                .set('Content-Type', 'application/json')
            let authzheader = WalletUtils.getAuthorizationHeader(req.url, credential, body, key, secret)
          //  console.log("Before Post ", Date.now())
            return req
                .set('Authorization', authzheader)
                .send(body)
        }
    }
}
