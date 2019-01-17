module.exports=
{ "relyingparty": "https://perf-tk-rp.herokuapp.com/login",
     "walletServiceUrl": "https://perfwalletv1.stg.trustedkey.io",
    //"submitloginuri": `/oauth/IDentify/submitLogin?query=queryParam&username=usernameParam`,
    "submitloginuri": "/oauth/IDentify/submitLogin",
    "waitloginuri": `/oauth/IDentify/waitLogin?guid=guidparam`,
    "callbackRoute": "/oauth/callback",
    "clientId": "56623880-b4a1-4085-bb3e-b32986503c67",
    "clientSecret": "MtmZPhOuQRqoogWI9c49VTh-nVTLATT7EcvjVGk5zP4",
  "claims": ["https://auth-stg.trustedkey.com/publicKey"],


  "expiryYears": 10,

    "awsRegion":"us-east-2",
    "awsSQSUrl":'https://sqs.us-east-2.amazonaws.com/279674402355/awseb-e-mpmi7qejgh-stack-AWSEBWorkerQueue-1WBCMC2B6CZOU',
    //"awsSQSUrl": "https://sqs.us-east-2.amazonaws.com/279674402355/notifiQ.fifo",
    "responseTimeLogQueue" : "https://sqs.us-east-2.amazonaws.com/279674402355/awseb-e-q9mqwdmqkr-stack-AWSEBWorkerQueue-IW3CN8MSOBBB",
    "walletTable":"awsWalletTable",
    "responseTimeTable":"ResponseTimes"
}
