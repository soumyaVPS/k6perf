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
/*
export let TrendRTTTK5 = new Trend("tk-wallet-notify RTT");
export let RateContentOKTK5 = new Rate("tk-wallet-notify Content OK");
export let GaugeContentSizeTK5 = new Gauge("tk-wallet-notify ContentSize");
export let AuthReqErrorsTK5 = new Counter("tk-wallet-notify errors");
*/

export let TrendRTTTK5 = new Trend("tk-waitlogin RTT");
export let RateContentOKTK5 = new Rate("tk-waitlogin Content OK");
export let GaugeContentSizeTK5 = new Gauge("tk-waitlogin ContentSize");
export let AuthReqErrorsTK5 = new Counter("tk-waitlogin errors");
/*
export let TrendRTTRP7 = new Trend("tk-rp-callback RTT");
export let RateContentOKRP7 = new Rate("tk-rp-callback Content OK");
export let GaugeContentSizeRP7 = new Gauge("tk-rp-callback ContentSize");
export let AuthReqErrorsRP7 = new Counter("tk-rp-callback errors");
*/
let envLoginPrefix = __ENV.login_prefix;



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
    //username = "tree123666"

    let urlpath =config.relyingparty+"?login_hint="+username
    console.log("RP path", urlpath)
    let res = http.get(urlpath, {
        tags:{"urltype":"RP login"},
        redirects:0}) ;

    let contentOK = res.status==302
    TrendRTTRP1.add(res.timings.duration);
    RateContentOKRPP1.add(contentOK);
    GaugeContentSizeRPP1.add(res.body.length);
    AuthReqErrorsRPP1.add(!contentOK);

    //redirects to trustedkey wallet oauth/authorize

    urlpath = res.headers["Location"]

    console.log("\n redirect to :",res.status, ":", urlpath)
    let res2 = http.get(urlpath,
        {
            tags:{"urltype":"Oauth/Authorize"},
        headers: {"referer":config.relyingparty},
         redirects: 0})

    console.log("\n res2 response body: ",res2.body)
    contentOK = res2.status==302
    TrendRTTTK2.add(res2.timings.duration);
    RateContentOKTK2.add(contentOK);
    GaugeContentSizeTK2.add(res2.body.length);
    AuthReqErrorsTK2.add(!contentOK);


    //oauth redirects to login.html. Shows image and downloads scripts. the scripts invoke submitlogin and waitlogin
    //urlpath = config.walletServiceUrl + res2.headers["Location"]

   var loginurl = res2.headers["Location"] //TODO::which urlpath to chose? http push has the complete url

    console.log("Calling All logging urls: \n", loginurl)
    let res3 = http.get(loginurl,
        {   tags:{"urltype":"loginurl"},
            headers: {"referer":config.relyingparty},
            redirects: 0}) //TODO:: referer  is not right
    //console.log("res3 response:", res3.headers, res3.status,res3.body)


    contentOK = res3.status==200
    TrendRTTTK3.add(res3.timings.duration);
    RateContentOKTK3.add(contentOK);
    GaugeContentSizeTK3.add(res3.body.length);
    AuthReqErrorsTK3.add(!contentOK);

    //construct submitlogin
    let loc = res2.headers["Location"]
    let queryParam = loc.substring(loc.indexOf('?')).substring(1)

    let usernameParam = parseParam(queryParam, "login_hint")
    let guidparam = parseParam(queryParam,"guid")
    //console.log(usernameParam, guidparam)

    urlpath = config.walletServiceUrl + config.submitloginuri + "?"+"guid="+guidparam +"&username="+usernameParam
    //console.log(urlpath)

    let res4 = http.post(urlpath, {}
    ,{
        tags:{"urltype":"submitlogin"},
        headers: {"referer":loginurl,

        cache: 'no-cache',
            'x-requested-with': 'XmlHttpRequest'}})
    //console.log("submitlogin response:", res4.headers, res4.status, res4.body)

    contentOK = res4.status == 200
    TrendRTTTK4.add(res4.timings.duration);
    RateContentOKTK4.add(contentOK);
    GaugeContentSizeTK4.add(res4.body.length);
    AuthReqErrorsTK4.add(!contentOK);

    let jsonResp =res4.body
    //console.log(res4.headers, "\n", jsonResp)

    //waitlogin
    contentOK = false
    while (!contentOK) {

        urlpath = config.walletServiceUrl + config.waitloginuri.replace('guidparam', guidparam)

        let res5 = http.post(urlpath,{}
            ,{ tags:{"urltype":"waitlogin"},
                headers:{"referer":loginurl,cache: 'no-cache','x-requested-with': 'XmlHttpRequest'}})


        contentOK = res5.status == 200

        //console.log(res5.status, res5.body, res5.headers)
        TrendRTTTK5.add(res5.timings.duration);
        RateContentOKTK5.add(contentOK);
        GaugeContentSizeTK5.add(res5.body.length);
        AuthReqErrorsTK5.add(!contentOK);

break;
        //redirect back to heroku oauth
        //let json = res5.body
        ////console.log(json)
    }


};
