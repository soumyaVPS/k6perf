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


  "expiryYears": 10,

    "awsRegion":"us-east-2",
    "awsSQSUrl":'https://sqs.us-east-2.amazonaws.com/348848623230/awseb-e-itfg7gtrbp-stack-AWSEBWorkerQueue-1UM19ILN2FJZC',
    "AWS_ACCESS_KEY_ID":"AKIAJWDLE4I3S7IT4VAA",
    "AWS_SECRET_KEY": "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",
    "awsWalletTable":"walletDynamoTable"
}
