'use strict';

var IndexModel = require('../models/index');
var Wit = require('node-wit').Wit;
var log = require('node-wit').log;
//const WIT_TOKEN = "FOIYGF3YNV2TI3JR23B3NPWM2U632WSJ";
const WIT_TOKEN= "QZ6Y3AXEEVJD4XGSQKENRZLEUIYDRUMD";
const sessionId = 'my-user-session-01';
const context = {};

var PythonShell = require('python-shell');

var options = {
    mode: 'text',
    pythonPath: '/usr/local/bin/python3',
    pythonOptions: ['-u'],
    scriptPath: '/Users/ravkrishnan/krakenapp/scripts/'

};


var responseText ;
var counter;
var allow = false;

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
    createCase({sessionId, context, text, entities}) {
        return new Promise(function(resolve, reject) {
            var txn_id = firstEntityValue(entities, 'txn_id')
            if (txn_id) {

            //   call Create Case API and perform the action
            // context.response = 'success';

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

        res.send('Hello, how can i help you today?');
        counter = 1;

    });

    // Message handler
    router.post('/message', function (req, res) {
        var pyoutput ="";
        // Parse the Messenger payload
        // See the Webhook reference
        // https://developers.facebook.com/docs/messenger-platform/webhook-reference

        //console.log("request object", req);
        const data = req.body;
        console.log(data.message)

        if (data.message != undefined) {

            var text = data.message;

            if ( counter == 1) {
                options.args = [text];

                PythonShell.run('Weighted_Classifier.py', options, function (err, results) {
                    if (err) throw err;
                    // results is an array consisting of messages collected during execution
                    pyoutput = results.toString();
                    if (pyoutput == 'inr' || pyoutput == 'snad')
                        allow = true;
                    counter++;
                    if (allow) {
                        wit.runActions(
                            sessionId, // the user's current session
                            pyoutput, // the user's message
                            context // the user's current session state
                        ).then((context) => {
                            // Our bot did everything it has to do.
                            // Now it's waiting for further messages to proceed.
                            res.writeHead(200, {"Content-Type": "text/plain"});
                        res.end(responseText);
                        responseText = "";
                        console.log('Waiting for next user messages');
                    })
                    .
                        catch((err) => {
                            console.error('Oops! Got an error from Wit: ', err.stack || err);
                    })
                    }
                    else {
                        res.writeHead(200, {"Content-Type": "text/plain"});
                        res.end(pyoutput);

                    }

                    //res.send(results);
                });

            }
            else {
                wit.runActions(
                    sessionId, // the user's current session
                    text, // the user's message
                    context // the user's current session state
                ).then((context) => {
                    // Our bot did everything it has to do.
                    // Now it's waiting for further messages to proceed.
                    res.writeHead(200, {"Content-Type": "text/plain"});
                    res.end(responseText);
                    responseText = "";
                    console.log('Waiting for next user messages');
            })
            .
                catch((err) => {
                    console.error('Oops! Got an error from Wit: ', err.stack || err);
            })
            }

            //
        }

        //res.sendStatus(200);

    });
}
