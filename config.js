module.exports=
{ "relyingparty": "https://soumya-rp-ip-example.herokuapp.com/login",
    "login_hint":"soumya.aithal@trustedkey.com",
    "walletServiceUrl": "https://wallet.trustedkey.com",
    "submitloginuri": `/oauth/IDentify/submitLogin?query=queryParam&username=usernameParam`,
    "waitloginuri": `/oauth/IDentify/waitLogin?nonce=nonceParam`,

  "callbackRoute": "/oauth/callback",
  "clientId": "0cf24443-5eb7-43e0-bda1-817fe741598f",

  "clientSecret": "WRQntocJzNv0xZN3tvCWc5DdLurwV8Xm_zp9C_b0Qm8",
  "claims": ["https://auth.trustedkey.com/publicKey"],
  "port": 80,
  "expiryYears": 10,

  "username":"soumya.aithal@trustedkey.com"
}
