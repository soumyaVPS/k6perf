
const Utils = require('trustedkey-js/utils')
const JWT = require('jsonwebtoken')
const Chai = require('chai')
const args = require('yargs').argv;

const Assert = Chai.assert

const Config = require('./config');
const Storage = require('./walletdb')


function genDevToken() {
    return 'elYWjUdm1O4:APA91bGveIgqwCegLGp1RTdrUYPB1e7BEMHauKi84nLSDw9ie94ckxDOx9cp9mH4ITue-BxE3SFs28hoQGA7i9ynK6DL70e09k9Qe6bLd1icC5FfDN4RHfJy2YYAgbRavQRtZM-' + (Math.random() * 0xFFFFFF).toString(16).substring(2, 6)
}

module.exports = function  register(login_name) {
    deviceToken = genDevToken()
    var httpClient = require('./client')(undefined, Config.clientId, Config.clientSecret)
    function httpGet(path, credential, key, secret) {
        return httpClient.get(path, {credential, key, secret})
    }
     var registerLogin = () => {

            httpGet('/registerLogin?login=' + encodeURIComponent(login_name), undefined, Config.clientId, Config.clientSecret)
                .then(r => {
                    console.log("registered Login at :", Date.now());
                    console.log(r.body);
                    let parsed=JSON.parse(r.body)
                    if (typeof parsed.body != "undefined") {
                        console.log("Passed delete me")
                        Storage.saveCreds(login_name, deviceToken, httpClient)
                    }
                })
                .catch(err => {
                    console.log("caught error", err.message)
                })
        };

        console.log("registerDevice at :", Date.now());

        httpGet('/registerDevice?devicetoken=' + deviceToken, undefined, Config.clientId, Config.clientSecret)
            .then(r => {
                Assert.deepStrictEqual(r.body, {data: {registerDevice: true}});
                registerLogin();
                return r.body
            })

    }