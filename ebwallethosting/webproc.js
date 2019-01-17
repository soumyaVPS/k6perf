var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

sqs = {}
var AWS = require('aws-sdk')
const Config = require('./config.js');


AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY| Config.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.ACCESS_SECRET|Config.AWS_SECRET_KEY,
    region: Config.awsRegion
});

const qurl = Config.awsSQSUrl

function sendSqsMessage(message)
{
    sqs = new AWS.SQS();

    var params = {
        MessageBody: message,
        QueueUrl: qurl,
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

app.all('/notified',  async function(req, res) {
   // console.log("notification received :",Date.now(),req.query, req.body, req.headers)
    let taskMsg = {
        cmd:"notified",
        payload:req.body,
        deviceToken:req.query.devicetoken,
        httpNotifiedAt: Date.now()
    }
    sendSqsMessage(JSON.stringify(taskMsg))
    return res.status(200).send("auth complete")
})


app.get('/createuser',  async function(req, res) {
    //console.log("createUser received :",Date.now() ,req.query, req.body, req.headers)
    let taskMsg = {
        cmd:"createUser",
        id:req.query.login
    }
    sendSqsMessage(JSON.stringify(taskMsg))
    return res.status(200).send("register complete " + req.query.login)
})

app.get('/', async function(req,res){
    return res.status(200).send("Hello, you've reached wallet simulator")
})

port = process.env.PORT ||8090
//console.log(port)
app.listen(port, function() {
    console.log("webproc.js app listening on port 8090!")
    console.log("Qurl:", qurl)
});
