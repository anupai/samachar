var restify = require('restify');
var builder = require('botbuilder');
var http = require('http');
var Bing = require('node-bing-api')({ accKey: "6edf74fa7c7e41079312978b85e469fa" });

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: '904abe13-3111-4212-9200-e92cb98f4cc4',
    appPassword: 'MOoZu8SjPNtWgkN5mTgnoZk'
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function (session) {
    console.log(session);
    let localtime = new Date(session.message.localTimestamp);
    let wishingMsg = localtime.getHours() < 12 ? 'Good Morning!!!' :
        (localtime.getHours() < 17 ? 'Good Afternoon!!' : 'Good Evening!!');

    if (session.message.text.toLowerCase().indexOf('hi') > -1 ||
        session.message.text.toLowerCase().indexOf('hello') > -1) {
        session.send(wishingMsg + ' What can I do for you today!!!');
        Bing.news("Headlines", {
            count: 10,  // Number of results (max 15)
           // offset: 3   // Skip first 3 results
        }, (error, res, body) => {
            console.log(body.value);
            body.value.forEach((news) => {
                session.send(news.name);
            });
        });



    } else {
        session.send("You said: %s", session.message.text);
    }
});