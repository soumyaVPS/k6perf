//Cmd to execute: k6 run  -e userid=test-login0.8211764547939031@example.com oaauth.js

import { check } from "k6";
import http from "k6/http";
import { Trend, Rate, Counter, Gauge } from "k6/metrics";


const config = require('./config.js');
export let TrendRTT1 = new Trend("RTT1"); //heroku app rtt
export let RateContentOK1 = new Rate("Content OK");
export let GaugeContentSize1 = new Gauge("ContentSize");
export let AuthReqErrors1 = new Counter("rp-login-rq");

export let TrendRTT2 = new Trend("RTT2"); //heroku app rtt
export let RateContentOK2 = new Rate("Content OK");
export let GaugeContentSize2 = new Gauge("ContentSize");
export let AuthReqErrors2 = new Counter("wallet-oaut-callback-Req");


export let TrendRTT3 = new Trend("RTT3");
export let RateContentOK3 = new Rate("Content OK");
export let GaugeContentSize3 = new Gauge("ContentSize");
export let AuthReqErrors3 = new Counter("wallet-login-html");

export let TrendRTT5 = new Trend("RTT-Waitlogin");
export let RateContentOK5 = new Rate("Content OK Waitlogin");
export let GaugeContentSize5 = new Gauge("ContentSize Waitlogin");
export let AuthReqErrors5 = new Counter("waitlogin-loop");

let env_username = __ENV.userid;

//console.log(username)

export let options = {
    /*thresholds: {
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
    }*/
       // vus: 1,
        //duration: "1m"
   };
``

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
    console.log(env_username)
    let res = http.get(config.relyingparty+"?login_hint="+env_username, {redirects:0}) ;
    console.log("Relying party  login request\'s response headers: ", JSON.stringify(res.headers))
    console.log("response body: ",JSON.stringify(res.body))

    let contentOK = res.status==302
    TrendRTT1.add(res.timings.duration);
    RateContentOK1.add(contentOK);
    GaugeContentSize1.add(res.body.length);
    AuthReqErrors1.add(!contentOK);
``
    //redirect to trustedkey wallet oauth/authorize

    let res2 = http.get(res.headers["Location"],
        {headers: {"referer":config.relyingparty},
         redirects: 0})

    console.log("wallet  oauth/authorize request\'s response headers: ", JSON.stringify(res2.headers))
    console.log("response body: ",res2.body)

    contentOK = res2.status==302
    TrendRTT2.add(res2.timings.duration);
    RateContentOK2.add(contentOK);
    GaugeContentSize2.add(res.body.length);
    AuthReqErrors2.add(!contentOK);

    //redirect to login.html

    let urlpath = config.walletServiceUrl + res2.headers["Location"]
    console.log("login.html redirect path" ,urlpath)
    let res3 = http.get(urlpath,
        {headers: {"referer":config.relyingparty}, redirects: 0})

    //const usernameParam = encodeURIComponent(env_username)
    let loc = res2.headers["Location"]
    let queryParam = loc.substring(loc.indexOf('?')).substring(1)

    console.log("*********************************** \n")
    console.log(queryParam)
    let usernameParam = parseParam(queryParam, "login_hint")
    let nonceParam = parseParam(queryParam,"nonce")
    console.log(usernameParam, nonceParam)
    console.log("*********************************** \n")


    //submitlogin
    urlpath = config.walletServiceUrl + config.submitloginuri + "?"+"nonce="+nonceParam +"&username="+usernameParam

    console.log("submit urlPath :", urlpath)

    let res4 = http.get(urlpath, {cache: 'no-cache'})
    let jsonResp =res4.body

    console.log(jsonResp)

    //waitlogin

    urlpath = config.walletServiceUrl + config.waitloginuri.replace('nonceParam',nonceParam)
    console.log("wait urlPath :", urlpath)

    let res5 = http.get(urlpath, {cache: 'no-cache'})
    let contentOK5 = false
    while (!contentOK5) {
        console.log(res5.status, res5.body, res5.headers)
        contentOK5 = !(res5.status == 408 || res5.status == 499)

        TrendRTT5.add(res5.timings.duration);
        RateContentOK5.add(contentOK5);
        GaugeContentSize5.add(res5.body.length);
        AuthReqErrors5.add(!contentOK5);
        if (contentOK5 && res5.status != 200)
        {
            break
        }

    }
    //redirect back to heroku oauth


/*
    contentOK = res3.status==200
    TrendRTT3.add(res3.timings.duration);
    RateContentOK3.add(contentOK);
    GaugeContentSize3.add(res.body.length);
    AuthReqErrors3.add(!contentOK);
    */

};
