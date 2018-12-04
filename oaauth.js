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

export let TrendRTTTK5 = new Trend("tk-wait-login RTT");
export let RateContentOKTK5 = new Rate("tk-wait-login Content OK ");
export let GaugeContentSizeTK5 = new Gauge("tk-wait-login ContentSize Waitlogin");
export let AuthReqErrorsTK5 = new Counter("tk-wait-login waitlogin-loop");

let env_login_prefix = __ENV.login_prefix;
////console.log(env_login_prefix)
/*
export let options = {
    thresholds: {
        "RTT": [
            "p(99)<300",
            "p(70)<250",
            "avg<200",
            "med<150",
            "min<100",
        ],
        "Content OK": ["rate>0.95"],
        "ContentSize": ["value<4000"],
        "Errors": ["count<100"]
    }
        vus: 1,
        duration: "1m"
   };
*/

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

    var vu_id=`${__VU}` - 1

    //console.log("****************************"+ env_login_prefix)
    var username = env_login_prefix+vu_id+"@example.com"
    console.log("***************************"+username);
    let res = http.get(config.relyingparty+"?login_hint="+username, {redirects:0}) ;
    //console.log("Relying party  login request\'s response headers: ", JSON.stringify(res.headers))
    ////console.log("response body: ",JSON.stringify(res.body))

    let contentOK = res.status==302
    TrendRTTRP1.add(res.timings.duration);
    RateContentOKRPP1.add(contentOK);
    GaugeContentSizeRPP1.add(res.body.length);
    AuthReqErrorsRPP1.add(!contentOK);

    //redirects to trustedkey wallet oauth/authorize

    let res2 = http.get(res.headers["Location"],
        {headers: {"referer":config.relyingparty},
         redirects: 0})

    //console.log("wallet  oauth/authorize request\'s response headers: ", JSON.stringify(res2.headers))
    ////console.log("response body: ",res2.body)

    contentOK = res2.status==302
    TrendRTTTK2.add(res2.timings.duration);
    RateContentOKTK2.add(contentOK);
    GaugeContentSizeTK2.add(res2.body.length);
    AuthReqErrorsTK2.add(!contentOK);


    //oauth redirects to login.html. Shows image and downloads scripts. the scripts invoke submitlogin and waitlogin
    let urlpath = config.walletServiceUrl + res2.headers["Location"]
    //console.log("login.html redirect path" ,urlpath)
    let res3 = http.get(urlpath,
        {headers: {"referer":config.relyingparty}, redirects: 0}) //TODO:: referer  is not right
    ////console.log("login.html response:", res3.headers, res3.status, res3.body)


    contentOK = res3.status==200
    TrendRTTTK3.add(res3.timings.duration);
    RateContentOKTK3.add(contentOK);
    GaugeContentSizeTK3.add(res3.body.length);
    AuthReqErrorsTK3.add(!contentOK);

    //construct submitlogin
    let loc = res2.headers["Location"]
    let queryParam = loc.substring(loc.indexOf('?')).substring(1)

    ////console.log("*********************************** \n")
    ////console.log(queryParam)
    let usernameParam = parseParam(queryParam, "login_hint")
    let nonceParam = parseParam(queryParam,"nonce")
    ////console.log(usernameParam, nonceParam)
    ////console.log("*********************************** \n")



    urlpath = config.walletServiceUrl + config.submitloginuri + "?"+"nonce="+nonceParam +"&username="+usernameParam

    ////console.log("submit urlPath :", urlpath)
    //console.log("submitlogin initiated @",Date.now(), "url : ", urlpath)

    let res4 = http.get(urlpath, {cache: 'no-cache'})
    //console.log("submitlogin response:", res4.headers, res4.status, res4.body)

    contentOK = res4.status == 200
    TrendRTTTK4.add(res4.timings.duration);
    RateContentOKTK4.add(contentOK);
    GaugeContentSizeTK4.add(res4.body.length);
    AuthReqErrorsTK4.add(!contentOK);

    let jsonResp =res4.body
    //console.log(jsonResp)

    //waitlogin

    urlpath = config.walletServiceUrl + config.waitloginuri.replace('nonceParam',nonceParam)
    //console.log("waitlogin initiated @",Date.now(), "url : ", urlpath)

    let res5 = http.get(urlpath, {cache: 'no-cache'})
    let contentOK5 = false
    while (!contentOK5) {
        //console.log(res5.status, res5.body, res5.headers)
        contentOK5 = !(res5.status == 408 || res5.status == 499)

        TrendRTTTK5.add(res5.timings.duration);
        RateContentOKTK5.add(contentOK5);
        GaugeContentSizeTK5.add(res5.body.length);
        AuthReqErrorsTK5.add(!contentOK5);
        if (contentOK5 && res5.status != 200)
        {
            break
        }

    }
    //redirect back to heroku oauth



};
