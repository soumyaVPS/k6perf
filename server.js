const Register = require ('./register')
const OAuthn = require ('./authenticate')
const Chai = require('chai');
Assert = Chai.assert
const express = require('express');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
//catch non json body error

app.post('/walletep',  async function(req,res){

    const msg = req.body;
    console.log("message received: ", msg);

    if (msg.cmd == 'createUser') {
        return Register(msg.id)
    }
    else if(msg.cmd == 'notified'){
        return authn(msg.deviceToken, msg.payload)
    }
    else{
        console.log("invalid command:", msg);
    }

    return res.status(200).send("Hello, you've reached wallet simulator")
});

port = process.env.PORT ||3000

app.listen(port, function() {
    console.log('Example app listening on port', port);
});




