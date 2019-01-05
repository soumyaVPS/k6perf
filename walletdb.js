var AWS = require('aws-sdk');
const Config = require('./config.js')
// Set the region
AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY| Config.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.ACCESS_SECRET|Config.AWS_SECRET_KEY,
    region: Config.awsRegion
});

// Create DynamoDB service object
 
const storage = module.exports

var docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const CircularJSON = require('circular-json-es6')
storage.saveCreds = function (loginName, deviceToken, httpClient)
{
    console.log("Saving Creds")
    var params = {
        TableName: Config.walletTable,
        Item: {
            "loginhint":  {S:loginName},
            "devicetToken":{S:deviceToken},
            "address":  {S:httpClient.address},
            "credentials": {S: CircularJSON.stringify(httpClient.pair)}
        }
    };
    console.log("Save creds:" ,params.Item.loginhint, params.Item.devicetToken)
    dbprom = docClient.put(params).promise()
    dbprom.then(function (data){
            console.log("PutItem succeeded for ", loginName," :", data);
        }).catch(function (err){console.log("Error",err)});

}
storage.getCreds = function (deviceToken)
{
      var params = {
        TableName: Config.awsWalletTable,
        Key: {'devicetoken': {S:deviceToken}}
    };
    console.log("Get creds:" ,deviceToken)
    return docClient.get(params).promise()
}