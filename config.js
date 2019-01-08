module.exports=
{ "relyingparty": "https://perf-tk-rp.herokuapp.com/login",
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
    "awsSQSUrl":'https://sqs.us-east-2.amazonaws.com/348848623230/awseb-e-i4fykjfmze-stack-AWSEBWorkerQueue-JSDUN99IJ373',
    "AWS_ACCESS_KEY_ID":"AKIAJGNXRXZ5WBPJZH4Q",
    "AWS_SECRET_KEY": "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",
    "walletTable":"awsWalletTable"
}
