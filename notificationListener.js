var pm2 = require('pm2')
var express = require('express');
var app = express();
var wallet_procs = {};
const args = require('yargs').argv;
var events = require('events');

var eventEmitter = new events.EventEmitter();


pm2.connect(function (err) {
    ////console.log(process)
    login_prefix = args.login

    pm2.list(function (err, data) {
        ////console.log(data)
        //console.log ("**************", process.env.pm_id)
        for (var i in data) {
            //console.log(data[i].pm_id)
            if (data[i].pm_id != process.env.pm_id) {
                wallet_procs[login_prefix + (parseInt(data[i].pm2_env.pm_id) + 1)] = data[i].pm2_env.pm_id;

            }
        }
        pm2.disconnect(function () {});
    });
});

async function walletResponse( login) {
    return new Promise(function(resolve,reject){
        eventEmitter.once(login,()=>{
            //console.log("Event caught for ", login )
            resolve(login)
        })
    })
}

process.on('message', function (data) {
    //console.log("recieved :", data.data.login)
    if (data.data.login)
        eventEmitter.emit(data.data.login)
});


app.get('/notified',  async function(req, res) {
     login = req.query.login
    //console.log("login :", login)
    //console.log(wallet_procs)
    if (!(login in wallet_procs))
    {
        return res.status(404).send("login does not exist")
    }

    pm2.connect(function () {
        //console.log("login :", login, wallet_procs[login])
        pm2.sendDataToProcessId(wallet_procs[login], {
            data: {
                respondTo:process.env.pm_id},
            topic: 'process:msg'
        }, function (err, res) {
            //console.log(err, res)

        });

    });
     pm2.disconnect()
    await walletResponse(login)
    //console.log("before returning")

    return res.status(200).send("auth complete")
})

port = process.env.PORT ||8090
//console.log(port)
app.listen(port, function() {

    //console.log('Example app listening on port 8090!');
});
