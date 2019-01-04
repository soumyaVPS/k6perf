var express = require('express');
var app = express();
sqs = {}
var AWS = require('aws-sdk')
const Config = require('./config.js');


AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY| Config.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.ACCESS_SECRET|Config.AWS_SECRET_KEY,
    region: Config.awsRegion
});


function sendSqsMessage(message)
{
    sqs = new AWS.SQS();

    var params = {
        MessageBody: message,
        QueueUrl: Config.awsSQSUrl,
        DelaySeconds: 0
    };

    sqs.sendMessage(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
        } // an error occurred
        else {
            console.log('Victory, message sent  ' + params.MessageBody + '!');
        };
    });
}
app.get('/notified',  async function(req, res) {
    console.log("notification received :" ,req.query, req.body, req.headers)
    sendSqsMessage("{cmd:\'notified\', payload:\'"+ req.body+"\', deviceToken:\'"+ req.query.devicetoken+"\'}")
    return res.status(200).send("auth complete")
})

app.get('/createuser',  async function(req, res) {
    console.log("createUser received :" ,req.query, req.body, req.headers)
    sendSqsMessage("{cmd:\'createUser\', id: \'"+req.query.login+"\'}")
    return res.status(200).send("auth complete")
})

app.get('/', async function(req,res){
    return res.status(200).send("Hello, you've reached wallet simulator")
})

port = process.env.PORT ||8090
//console.log(port)
app.listen(port, function() {

    //console.log('Example app listening on port 8090!');
});
