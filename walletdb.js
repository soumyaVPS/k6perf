var AWS = require('aws-sdk');
const Config = require('./config.js')
// Set the region
AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.ACCESS_SECRET,
    region: Config.awsRegion
});

// Create DynamoDB service object
 
const storage = module.exports

var docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const CircularJSON = require('circular-json-es6')
storage.saveCreds = function (loginName, deviceToken, httpClient)
{
    console.log("Saving Creds")
   /* var params = {
        'TableName': Config.walletTable,
        'Item': {

            'deviceToken':{'S':deviceToken},
            'loginhint':  {'S':loginName},
            'address':  {'S':httpClient.address},
            'credentials': {'S': CircularJSON.stringify(httpClient.pair)}
        }
    };*/
    var params = {
        'TableName': Config.walletTable,
        'Item': {

            'deviceToken':deviceToken,
            'loginhint':  loginName,
            'address':  httpClient.address,
            'credentials': CircularJSON.stringify(httpClient.pair)
        }
    };
    console.log("Save creds:" ,params.Item.loginhint, params.Item.deviceToken)
    dbprom = docClient.put(params).promise()
    dbprom.then(function (data){
            console.log("PutItem succeeded for ", loginName," :", data);
        }).catch(function (err){console.log("Error",err)});

}
storage.getCreds = function (deviceToken)
{
    // 'Key': {devicetoken: {S:deviceToken}}
      var params = {
        'TableName': Config.awsWalletTable,
          'Key': {devicetoken:deviceToken}
    };
    console.log("Get creds:" ,deviceToken)
    return docClient.get(params).promise()
}