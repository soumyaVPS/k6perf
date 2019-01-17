var AWS = require('aws-sdk');
const Config = require('./config.js')
// Set the region
AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.ACCESS_SECRET,
    region: Config.awsRegion
});


const express = require('express');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
//catch non json body error

var docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
app.post('/logger',  async function(req,res){

    const msg = req.body;
    console.log("message received: ", Date.now(), msg);

    if (msg.cmd == 'log') {
        var params = {
            'TableName': Config.responseTimeTable,
            'Item': {

                'guid':msg.guid,
                'httpNotifiedAt':msg.httpNotifiedAt,
                'notificationArrived':  msg.notificationArrived,
                'dbResponded': msg.dbResponded,
                'loginCompleted': msg.loginCompleted,
                'Totalduration':  msg.loginCompleted - msg.httpNotifiedAt,
                'dbResponseTime' : msg.dbResponded - msg.notificationArrived,
            }

        };

        dbprom = docClient.put(params).promise()
        dbprom.then(function (data){
            console.log("PutItem succeeded for guid", msg.guid);  //TODO:: Remove unnecessary logs
        }).catch(function (err){console.log("Error",err)});

    }
    else{
        console.log("invalid command:", msg);
    }

    return res.status(200).send("Hello, you've reached response time logger")
});

port = process.env.PORT ||3000

app.listen(port, function() {
    console.log('Example app listening on port', port);
});
