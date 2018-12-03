module.exports=
{ "relyingparty": "https://soumya-rp-ip-stg-example.herokuapp.com/login",
    "login_hint":"soumya.aithal@trustedkey.com",
    "walletServiceUrl": "https://wallet-stg.trustedkey.com",
    "submitloginuri": `/oauth/IDentify/submitLogin?query=queryParam&username=usernameParam`,
    "waitloginuri": `/oauth/IDentify/waitLogin?nonce=nonceParam`,

  "callbackRoute": "/oauth/callback",
  "clientId": "8c92a928-8315-4869-987b-5fd24353463a",

  "clientSecret": "OPB5iBOBEiatqX_FnRotfmr0An8ivAYt7LXBU6Ovxmg",
  "claims": ["https://auth-stg.trustedkey.com/publicKey"],
  "port": 80,
  "expiryYears": 10,

  "username":"soumya.aithal@trustedkey.com"
}
