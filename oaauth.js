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


export let TrendRTT3 = new Trend("RTT3"); //heroku app rtt
export let RateContentOK3 = new Rate("Content OK");
export let GaugeContentSize3 = new Gauge("ContentSize");
export let AuthReqErrors3 = new Counter("wallet-login-html");

export let TrendRTT5 = new Trend("RTT-Waitlogin"); //heroku app rtt
export let RateContentOK5 = new Rate("Content OK");
export let GaugeContentSize5 = new Gauge("ContentSize");
export let AuthReqErrors5 = new Counter("waitlogin-loop");

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
};
``
function queryMap(urlstr) {
    return urlstr.search
        .substring(1)
        .split('&')
        .reduce((acc, kv) => {
            const [k, v] = kv.split('=')
            /* eslint-disable-next-line security/detect-object-injection */
            acc[k] = v
            return acc
        }, {})
}

export default function (uriComponent) {
    let res = http.get(config.relyingparty+"?login_hint="+config.login_hint, {redirects:0}) ;
   // console.log(JSON.stringify(res.headers))
    let contentOK = res.status==302
    TrendRTT1.add(res.timings.duration);
    RateContentOK1.add(contentOK);
    GaugeContentSize1.add(res.body.length);
    AuthReqErrors1.add(!contentOK);

    //redirect to trustedkey wallet oauth/authorize

    let res2 = http.get(res.headers["Location"],
        {headers: {"referer":config.relyingparty},
         redirects: 0})

    contentOK = res2.status==302
    TrendRTT2.add(res2.timings.duration);
    RateContentOK2.add(contentOK);
    GaugeContentSize2.add(res.body.length);
    AuthReqErrors2.add(!contentOK);

    //redirect to login.html
    let urlpath = config.walletServiceUrl + res2.headers["Location"]
    //console.log(urlpath)
    let res3 = http.get(urlpath,
        {headers: {"referer":config.relyingparty},
            redirects: 0})
    //const {login_hint} = queryMap(urlpath)
    const usernameParam = encodeURIComponent(config.username)
    let loc = res2.headers["Location"]

    const queryParam = encodeURIComponent(loc.substring(loc.indexOf('?')+1))


    //submitlogin
    urlpath = config.walletServiceUrl + config.submitloginuri.replace('usernameParam',usernameParam).replace('queryParam',queryParam)
    //console.log("submit urlPath :", urlpath)

    let res4 = http.get(urlpath, {cache: 'no-cache'})
    //console.log(res4.body)
    let jsonResp = JSON.parse(res4.body)

    console.log(jsonResp.data.nonce)

    //waitlogin

    urlpath = config.walletServiceUrl + config.waitloginuri.replace('nonceParam',jsonResp.data.nonce)
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
	sleep.sleep(10)
    }
    //redirect back to heroku oauth

   // console.log(JSON.stringify(res3.body))


    contentOK = res3.status==200
    TrendRTT3.add(res3.timings.duration);
    RateContentOK3.add(contentOK);
    GaugeContentSize3.add(res.body.length);
    AuthReqErrors3.add(!contentOK);

};
