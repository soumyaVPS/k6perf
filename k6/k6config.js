module.exports=
{ "relyingparty": "https://perf-tk-rp.herokuapp.com/login",
    "walletServiceUrl": "https://perfwalletv1.stg.trustedkey.io",
    //"walletServiceUrl": "https://wallet-stg.trustedkey.com",
    //"walletServiceUrl": "https://tkdev.stg.trustedkey.io",
    //"submitloginuri": `/oauth/IDentify/submitLogin?query=queryParam&username=usernameParam`,
    "submitloginuri": "/oauth/IDentify/submitLogin",
    "waitloginuri": `/oauth/IDentify/waitLogin?guid=guidparam`,
    "callbackRoute": "/oauth/callback",
    "clientId": "56623880-b4a1-4085-bb3e-b32986503c67",
    //"claims": ["https://auth-stg.trustedkey.com/publicKey"]
}
