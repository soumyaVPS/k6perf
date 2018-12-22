//Cmd to execute: k6 run  -e userid=test-login0.8211764547939031@example.com oaauth.js
//const debug = require('debug')('oauth')
import { check } from "k6";
import http from "k6/http";
import { Trend, Rate, Counter, Gauge } from "k6/metrics";


const config = require('./config.js');

export let TrendRTTRP1 = new Trend("rp-login-rq RTT");
export let RateContentOKRPP1 = new Rate("rp-login-rq Content OK");
export let GaugeContentSizeRPP1 = new Gauge("rp-login-rq ContentSize");
export let AuthReqErrorsRPP1 = new Counter("rp-login-rq errors");

export let TrendRTTTK2 = new Trend("tk_oauth-authz RTT");
export let RateContentOKTK2 = new Rate("tk-oauth-authz Content OK");
export let GaugeContentSizeTK2 = new Gauge("tk-oauth-authz ContentSize");
export let AuthReqErrorsTK2 = new Counter("tk-oauth-authz errors");


export let TrendRTTTK3 = new Trend("tk-login.html RTT");
export let RateContentOKTK3 = new Rate("tk-login.html Content OK");
export let GaugeContentSizeTK3 = new Gauge("tk-login.html ContentSize");
export let AuthReqErrorsTK3 = new Counter("tk-login.html errors");

export let TrendRTTTK4 = new Trend("tk-submit-login RTT");
export let RateContentOKTK4 = new Rate("tk-submit-login Content OK");
export let GaugeContentSizeTK4 = new Gauge("tk-submit-login ContentSize");
export let AuthReqErrorsTK4 = new Counter("tk-submit-login errors");

export let TrendRTTTK5 = new Trend("tk-getPendingRequest RTT");
export let RateContentOKTK5 = new Rate("tk-getPendingRequest Content OK");
export let GaugeContentSizeTK5 = new Gauge("tk-getPendingRequest ContentSize");
export let AuthReqErrorsTK5 = new Counter("tk-getPendingRequest errors");


export let TrendRTTTK6 = new Trend("tk-completeLogin RTT");
export let RateContentOKTK6 = new Rate("tk-completeLogin Content OK");
export let GaugeContentSizeTK6 = new Gauge("tk-completeLogin ContentSize");
export let AuthReqErrorsTK6 = new Counter("tk-completeLogin errors");

export let TrendRTTTK7 = new Trend("tk-wait-login RTT");
export let RateContentOKTK7 = new Rate("tk-wait-login Content OK ");
export let GaugeContentSizeTK7 = new Gauge("tk-wait-login ContentSize");
export let AuthReqErrorsTK7 = new Counter("tk-wait-login errors");

import UserWallet from './registerUserDevice.js'

let envLoginPrefix = __ENV.login_prefix;
////console.log(env_login_prefix)
let envDeviceCount = __ENV.device_count
let userWallets = {}
for (let i = 1; i <= envDeviceCount; i++)
{
    let wallet = new UserWallet(envLoginPrefix + i)
    let req =http.get(wallet.registerDevice())
    let res = http.get(req.path,req.options)
    if (res.status == 200) {
        req = wallet.registerLogin()
        res = http.get(req.path, req.options)
        if (res.status = 200)
        {
            console.log("registered wallet for: ", envLoginPrefix+i)
        }

    }
    userWallets[envLoginPrefix + 1] = wallet
}


function parseParam(query, qp)
{
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0] == qp)
            return pair[1]
    }
    return undefined
}

export default function (uriComponent) {

    var vu_id=`${__VU}`

    //console.log("****************************"+ env_login_prefix)
    var username = envLoginPrefix+vu_id

    let urlpath =config.relyingparty+"?login_hint="+username
    let res = http.get(urlpath, {redirects:0}) ;

    let contentOK = res.status==302
    TrendRTTRP1.add(res.timings.duration);
    RateContentOKRPP1.add(contentOK);
    GaugeContentSizeRPP1.add(res.body.length);
    AuthReqErrorsRPP1.add(!contentOK);

    //redirects to trustedkey wallet oauth/authorize

    urlpath = res.headers["Location"]
    console.log(urlpath)
    let res2 = http.get(urlpath,
        {headers: {"referer":config.relyingparty},
         redirects: 0})

    //console.log("response body: ",res2.body)
    contentOK = res2.status==302
    TrendRTTTK2.add(res2.timings.duration);
    RateContentOKTK2.add(contentOK);
    GaugeContentSizeTK2.add(res2.body.length);
    AuthReqErrorsTK2.add(!contentOK);


    //oauth redirects to login.html. Shows image and downloads scripts. the scripts invoke submitlogin and waitlogin
    urlpath = config.walletServiceUrl + res2.headers["Location"]
    //console.log(urlpath)
    let res3 = http.get(urlpath,
        {headers: {"referer":config.relyingparty}, redirects: 0}) //TODO:: referer  is not right
    //console.log("login.html response:", res3.headers, res3.status, res3.body)


    contentOK = res3.status==200
    TrendRTTTK3.add(res3.timings.duration);
    RateContentOKTK3.add(contentOK);
    GaugeContentSizeTK3.add(res3.body.length);
    AuthReqErrorsTK3.add(!contentOK);

    //construct submitlogin
    let loc = res2.headers["Location"]
    let queryParam = loc.substring(loc.indexOf('?')).substring(1)

    ////console.log(queryParam)
    let usernameParam = parseParam(queryParam, "login_hint")
    let guidparam = parseParam(queryParam,"guid")
    //console.log(usernameParam, guidparam)


    urlpath = config.walletServiceUrl + config.submitloginuri + "?"+"guid="+guidparam +"&username="+usernameParam
    //console.log(urlpath)

    let res4 = http.get(urlpath, {cache: 'no-cache'})
    //console.log("submitlogin response:", res4.headers, res4.status, res4.body)

    contentOK = res4.status == 200
    TrendRTTTK4.add(res4.timings.duration);
    RateContentOKTK4.add(contentOK);
    GaugeContentSizeTK4.add(res4.body.length);
    AuthReqErrorsTK4.add(!contentOK);

    let jsonResp =res4.body
    //console.log(res4.headers, "\n", jsonResp)

    //getPendingRequest
    let wallet = userWallets[username]
    contentOK = false

    while (!contentOK) {
        let req = wallet.getPendingRequest()
        res = http.get(req.path, req.options)
        contentOK = res.status == 200
        TrendRTTTK5.add(res.timings.duration);
        RateContentOKTK5.add(contentOK);
        GaugeContentSizeTK5.add(res.body.length);
        AuthReqErrorsTK5.add(!contentOK);

        if (req.status == 200  && req.body.data.result != false)
        {
            contentOK = true
            let sigReq = r.body.data
            req = wallet.completeLogin(sigReq,{accept_login: true, abort_poll: true, credential: httpClient.pair},sigReq.nonce)
            res = http.post(req.path,req.payload, req.body )
            contentOK = res.status == 200
            TrendRTTTK6.add(res.timings.duration);
            RateContentOKTK6.add(contentOK);
            GaugeContentSizeTK6.add(res.body.length);
            AuthReqErrorsTK6.add(!contentOK);

        }
    }


    //completeLogin


    //waitlogin
    contentOK = false
    while (!contentOK) {

        urlpath = config.walletServiceUrl + config.waitloginuri.replace('guidparam', guidparam)

        let res5 = http.get(urlpath, {cache: 'no-cache'})


        contentOK = res5.status == 200

        //console.log(res5.status, res5.body, res5.headers)
        TrendRTTTK7.add(res5.timings.duration);
        RateContentOKTK7.add(contentOK);
        GaugeContentSizeTK7.add(res5.body.length);
        AuthReqErrorsTK7.add(!contentOK);


        //redirect back to heroku oauth
        //let json = res5.body
        //console.log(json)
    }


};
