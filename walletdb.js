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

storage.saveCreds = function (loginName, deviceToken, httpClient)
{
    console.log("saveCreds login/token: ", loginName +" " + deviceToken)
    console.log("address",  httpClient.address)
    console.log("credentials: ", httpClient.pair)
    var params = {
        TableName: Config.walletTable,
        Item: {
            "loginhint":  loginName,
            "devicetoken":deviceToken,
            "address":  httpClient.address,
            "credentials": httpClient.pair
        }
    };

    dbprom = docClient.put(params).promise()
    dbprom.then(function (data){
            console.log("PutItem succeeded for ", loginName," :", data);
        }).catch(function (err){console.log("Error",error)});

}
storage.getCreds = function (deviceToken)
{
    console.log("")
    var params = {
        TableName: Config.awsWalletTable,
        Key: {'devicetoken': deviceToken}
    };

    return docClient.get(params).promise()
}