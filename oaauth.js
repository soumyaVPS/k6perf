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

export let TrendRTTTK5 = new Trend("tk-wallet-notify RTT");
export let RateContentOKTK5 = new Rate("tk-wallet-notify Content OK");
export let GaugeContentSizeTK5 = new Gauge("tk-wallet-notify ContentSize");
export let AuthReqErrorsTK5 = new Counter("tk-wallet-notify errors");


export let TrendRTTTK6 = new Trend("tk-waitlogin RTT");
export let RateContentOKTK6 = new Rate("tk-waitlogin Content OK");
export let GaugeContentSizeTK6 = new Gauge("tk-waitlogin ContentSize");
export let AuthReqErrorsTK6 = new Counter("tk-waitlogin errors");

export let TrendRTTRP7 = new Trend("tk-rp-callback RTT");
export let RateContentOKRP7 = new Rate("tk-rp-callback Content OK");
export let GaugeContentSizeRP7 = new Gauge("tk-rp-callback ContentSize");
export let AuthReqErrorsRP7 = new Counter("tk-rp-callback errors");

let env_login_prefix = __ENV.login_prefix;
////console.log(env_login_prefix)



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

    var vuId=`${__VU}`

    var loginId = env_login_prefix+vuId
    console.log("***************************"+loginId);


    let urlpath =config.relyingparty+"?login_hint="+loginId
    console.log(urlpath)
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

    //console.log("wallet  oauth/authorize request\'s response headers: ", JSON.stringify(res2.headers))
    //console.log("response body: ",res2.body)
    contentOK = res2.status==302
    TrendRTTTK2.add(res2.timings.duration);
    RateContentOKTK2.add(contentOK);
    GaugeContentSizeTK2.add(res2.body.length);
    AuthReqErrorsTK2.add(!contentOK);


    //oauth redirects to login.html. Shows image and downloads scripts. the scripts invoke submitlogin and waitlogin
    urlpath = res2.headers["Location"]
    if (urlpath.indexOf("http")==-1)
        urlpath=config.walletServiceUrl+urlpath
    console.log(urlpath)
    res = http.get(urlpath,
        {headers: {"referer":config.relyingparty}, redirects: 0}) //TODO:: referer  is not right
    //console.log("login.html response:", res3.headers, res3.status, res3.body)


    contentOK = res.status==200
    TrendRTTTK3.add(res.timings.duration);
    RateContentOKTK3.add(contentOK);
    GaugeContentSizeTK3.add(res.body.length);
    AuthReqErrorsTK3.add(!contentOK);

    //construct submitlogin
    let loc = res2.headers["Location"]
    let queryParam = loc.substring(loc.indexOf('?')).substring(1)

    ////console.log(queryParam)
    //let usernameParam = parseParam(queryParam, "login_hint") //TODO::Validate queryparams
    let guidparam = parseParam(queryParam,"guid")
    //console.log(usernameParam, guidparam)
    urlpath = config.walletServiceUrl + config.submitloginuri + "?"+"guid="+guidparam +"&username="+loginId
    //console.log(urlpath)

    res = http.get(urlpath, {cache: 'no-cache'})
    //console.log("submitlogin response:", res4.headers, res4.status, res4.body)

    contentOK = res.status == 200
    TrendRTTTK4.add(res.timings.duration);
    RateContentOKTK4.add(contentOK);
    GaugeContentSizeTK4.add(res.body.length);
    AuthReqErrorsTK4.add(!contentOK);

    let jsonResp =res.body
    //console.log(res4.headers, "\n", jsonResp)

    //wallet call

    urlpath = config.notifyWalletUrl + "?login=" + loginId

    res = http.get(urlpath, {cache: 'no-cache'})
    console.log("notifyWallet Response",res.status, res.body)

    contentOK = res.status == 200
    TrendRTTTK5.add(res.timings.duration);
    RateContentOKTK5.add(contentOK);
    GaugeContentSizeTK5.add(res.body.length);
    AuthReqErrorsTK5.add(!contentOK);

    //waitlogin
    contentOK = false
    while (!contentOK) {

        urlpath = config.walletServiceUrl + config.waitloginuri + "guid=" + guidparam
        console.log(urlpath)
        let res = http.get(urlpath, {cache: 'no-cache'})

        console.log(res.status)
        for (var p in res.headers) {
            if (res2.headers.hasOwnProperty(p)) {
                console.log(p + " : " + res.headers[p]);
            }
        }
        console.log(res.body)

        if (res.status == 200) {
            contentOK = true
        }
        //console.log(res.status, res5.body, res5.headers)
        TrendRTTTK6.add(res.timings.duration);
        RateContentOKTK6.add(contentOK);
        GaugeContentSizeTK6.add(res.body.length);
        AuthReqErrorsTK6.add(!contentOK);
        if (res.status !=408 && !contentOK) {
            break
        }
    }

    if (contentOK)
    {
        let urlPath = res.body.url
        res = http.get(urlpath, {cache: 'no-cache'})
        console.log("RP callback response", res.status, res.body)

        contentOK = res.status == 200
        TrendRTTRP7.add(res.timings.duration);
        RateContentOKRP7.add(contentOK);
        GaugeContentSizeRP7.add(res.body.length);
        AuthReqErrorsRP7.add(!contentOK);

    }
        //redirect back to heroku oauth
        //let json = res.body
        //console.log(json)



};
