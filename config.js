module.exports=
{ "relyingparty": "https://soumya-rp-ip-stg-example.herokuapp.com/login",
    "login_hint":"soumya.aithal@trustedkey.com",
    "walletServiceUrl": "https://wallet-stg.trustedkey.com",
    //"submitloginuri": `/oauth/IDentify/submitLogin?query=queryParam&username=usernameParam`,
    "submitloginuri": "/oauth/IDentify/submitLogin",
    "waitloginuri": `/oauth/IDentify/waitLogin?nonce=nonceParam`,

  "callbackRoute": "/oauth/callback",
    "clientId": "56623880-b4a1-4085-bb3e-b32986503c67",
    "clientSecret": "MtmZPhOuQRqoogWI9c49VTh-nVTLATT7EcvjVGk5zP4",
  "claims": ["https://auth-stg.trustedkey.com/publicKey"],
  "port": 80,
  "expiryYears": 10,

  //"username":"soumya.aithal@trustedkey.com"
}
