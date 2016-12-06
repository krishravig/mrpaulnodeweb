'use strict';

var IndexModel = require('../models/index');
var Wit = require('node-wit').Wit;
var log = require('node-wit').log;
//const WIT_TOKEN = "FOIYGF3YNV2TI3JR23B3NPWM2U632WSJ";
const WIT_TOKEN= "L47UC7Z4WTN7X6I4UQEWSFH2MTWVXEZJ";
const sessionId = 'my-user-session-01';
const context = {};

var PythonShell = require('python-shell');

var options = {
    mode: 'text',
    pythonPath: '/usr/local/bin/python3',
    pythonOptions: ['-u'],
    scriptPath: '/Users/ravkrishnan/krakenapp/scripts/',
    args:['Did not receive my TV.']
};


var responseText ;

const firstEntityValue = (entities, entity) => {
    const val = entities && entities[entity] &&
            Array.isArray(entities[entity]) &&
            entities[entity].length > 0 &&
            entities[entity][0].value
        ;
    if (!val) {
        return null;
    }
    return typeof val === 'object' ? val.value : val;
};

// Our bot actions
const actions = {
    send(request, response) {
        const {sessionId, context, entities} = request;
        const {text, quickreplies} = response;
        //console.log('---------', response.text);
        return new Promise(function(resolve, reject) {
            console.log('sending...',response.text);
            sendResponse(response.text);
            return resolve();

        });
    },
    getWeather({sessionId, context, text, entities}) {
        //console.log(`Session ${sessionId} received ${text}`);
        //console.log(`The current context is ${JSON.stringify(context)}`);
        //console.log(`Wit extracted ${JSON.stringify(entities)}`);
        return new Promise(function(resolve, reject) {
            var location = firstEntityValue(entities, 'location')
            if (location) {
                context.weather = 'sunny in ' + location; // we should call a weather API here
                //context.forecast = 'sunny';
                delete context.missingWeather;
            } else {
                context.missingWeather = true;
                delete context.weather;
            }
            return resolve(context);
        });
    }
};

function sendResponse(msg) {
     responseText = msg;

}
const wit = new Wit({
    accessToken: WIT_TOKEN,
    actions,
    logger: new log.Logger(log.INFO)
});

module.exports = function (router) {

    var model = new IndexModel();

    router.get('/message', function (req, res) {

        PythonShell.run('Weighted_Classifier.py', options, function (err, results) {
            if (err) throw err;
            // results is an array consisting of messages collected during execution
            console.log('results:', results);
        });

        res.send('Hello world');

    });

    // Message handler
    router.post('/message', function (req, res) {
        // Parse the Messenger payload
        // See the Webhook reference
        // https://developers.facebook.com/docs/messenger-platform/webhook-reference

        //console.log("request object", req);
        const data = req.body;
        console.log(data.message)

        if (data.message != undefined) {
            //console.log("inside page");
            // We retrieve the message content
            const text = data.message;
            // We received a text message
            // Let's forward the message to the Wit.ai Bot Engine
            // This will run all actions until our bot has nothing left to do
        //     wit.converse(sessionId, text, {})
        //         .then((rsp) => {
        //
        //         console.log('Yay, got Wit.ai response: ' + JSON.stringify(rsp));
        //     res.writeHead(200, {"Content-Type": "text/plain"});
        //     res.end(rsp.msg);
        //
        // })
        // .catch((err) => {
        //                  console.error('Oops! Got an error from Wit: ', err.stack || err);
        //          })
            wit.runActions(
                sessionId, // the user's current session
                text, // the user's message
                context // the user's current session state
            ).then((context) => {
                // Our bot did everything it has to do.
                // Now it's waiting for further messages to proceed.
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.end(responseText);
                responseText="";
                 console.log('Waiting for next user messages');
        })
        .catch((err) => {
                console.error('Oops! Got an error from Wit: ', err.stack || err);
        })
            //
        }

        //res.sendStatus(200);

    });
}
