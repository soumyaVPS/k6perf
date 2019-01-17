
    //const debug = require('debug')('oauth')
    import { check } from "k6";
    import http from "k6/http";
    import { Trend, Rate, Counter, Gauge } from "k6/metrics";


    const config = require('./k6config.js');

    export let TrendRTTTK2 = new Trend("tk_oauth-authz RTT");
    export let RateContentOKTK2 = new Rate("tk-oauth-authz Content OK");
    export let AuthReqErrorsTK2 = new Counter("tk-oauth-authz errors");


    export let TrendRTTTK3 = new Trend("tk-login.html RTT");
    export let RateContentOKTK3 = new Rate("tk-login.html Content OK");
    export let AuthReqErrorsTK3 = new Counter("tk-login.html errors");

    export let TrendRTTTK4 = new Trend("tk-submit-login RTT");
    export let RateContentOKTK4 = new Rate("tk-submit-login Content OK");
    export let AuthReqErrorsTK4 = new Counter("tk-submit-login errors");
    /*
    export let TrendRTTTK5 = new Trend("tk-wallet-notify RTT");
    export let RateContentOKTK5 = new Rate("tk-wallet-notify Content OK");
    export let GaugeContentSizeTK5 = new Gauge("tk-wallet-notify ContentSize");
    export let AuthReqErrorsTK5 = new Counter("tk-wallet-notify errors");
    */

    let envLoginPrefix = __ENV.login_prefix;

    function parseParam(query, qp)
    {
        let vars = query.split('&');
        for (let i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (pair[0] == qp)
                return pair[1]
        }
        return undefined
    }

    export default function (uriComponent) {


        const vu_id = `${__VU}`
        let username = envLoginPrefix + vu_id

        let urlpath = config.walletServiceUrl + "/oauth/authorize?client_id=" +config.clientId+
            "&redirect_uri=https%3A%2F%2Fperf-tk-rp.herokuapp.com%2Foauth%2Fcallback" +
//            "&redirect_uri="+ encodeURI(config.walletServiceUrl+config.callbackRoute)+
            "&scope=openid%20https%3A%2F%2Fauth.trustedkey.com%2Fuser_sign" +
            "&response_type=code&state=login&login_hint="
        urlpath += username
        let res2 = http.get(urlpath,
            {
                tags: {name: "Oauth/Authorize"},
                headers: {"referer": config.relyingparty},
                redirects: 0
            })
        let contentOK = res2.status == 302
        TrendRTTTK2.add(res2.timings.duration);
        RateContentOKTK2.add(contentOK);
        AuthReqErrorsTK2.add(!contentOK);
        if (!contentOK) {
            console.log("Failed  oauth/authorize call:", urlpath, " status:", res2.status)
        }


        //oauth redirects to login.html. Shows image and downloads scripts. the scripts invoke submitlogin and waitlogin
        //loginurl = config.walletServiceUrl + res2.headers["Location"]

        let loginurl = res2.headers["Location"] //TODO::which urlpath to chose? http push has the complete url
        if(loginurl[0] == '/'){
            loginurl = config.walletServiceUrl + loginurl
        }

        let res3 = http.get(loginurl,
            {
                tags: {name: "loginurl"},
                headers: {"referer": config.relyingparty},
                redirects: 0
            }) //TODO:: referer  is not right
        ////console.log("res3 response:", res3.headers, res3.status,res3.body)


        contentOK = res3.status == 200
        TrendRTTTK3.add(res3.timings.duration);
        RateContentOKTK3.add(contentOK);
        AuthReqErrorsTK3.add(!contentOK);
        if (!contentOK) {
            console.log("Failed loginurl call", loginurl, " status:", res3.status)
        }

        //construct submitlogin
        let loc = res2.headers["Location"]
        let queryParam = loc.substring(loc.indexOf('?')).substring(1)
        let usernameParam = parseParam(queryParam, "login_hint")
        let guidparam = parseParam(queryParam, "guid")


        urlpath = config.walletServiceUrl + config.submitloginuri + "?" + "guid=" + guidparam + "&username=" + usernameParam

        let res4 = http.post(urlpath, {}
            , {
                tags: {name: "submitlogin"},
                headers: {
                    "referer": loginurl,

                    cache: 'no-cache',
                    'x-requested-with': 'XmlHttpRequest'
                }
            })
        ////console.log("submitlogin response:", res4.headers, res4.status, res4.body)
        contentOK = res4.status == 200
        TrendRTTTK4.add(res4.timings.duration);
        RateContentOKTK4.add(contentOK);
        AuthReqErrorsTK4.add(!contentOK);
        if (!contentOK) {
            console.log("Failed submitlogin call ", urlpath, " status:", res4.status)
        }

        /*

                //waitlogin

                contentOK = false
                let duration =0
                let count = 0

                while (!contentOK) {

                    count +=1
                    urlpath = config.walletServiceUrl + config.waitloginuri.replace('guidparam', guidparam)

                    var res5 = http.post(urlpath,{}
                        ,{ tags:{name:"waitlogin"},
                            headers:{"referer":loginurl,cache: 'no-cache','x-requested-with': 'XmlHttpRequest'}})


                    contentOK = res5.status == 200

                    //redirect back to heroku oauth
                    //let json = res5.body
                    //////console.log(json)
                    duration += res5.timings.duration
                    TrendRTTTK5.add();
                    RateContentOKTK5.add(contentOK);
                    AuthReqErrorsTK5.add(!contentOK);
                    ////console.log(res5.status, res5.body, res5.headers)

                }

            */
        sleep(100)
    }