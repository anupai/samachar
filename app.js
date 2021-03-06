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
    let wishingMsg = localtime.getHours() < 12 ? 'Good Morning!!! <ss type =\"coffee\">;)</ss> <ss type =\"sun\">;)</ss>' :
        (localtime.getHours() < 17 ? 'Good Afternoon!!' : 'Good Evening!!');
    
    if (session.message.value) {
        console.log(session.message.value);
        getnews(session.message.value.postback, session);
    } else if (session.message.text && (session.message.text.toLowerCase().indexOf('hi') > -1 ||
        session.message.text.toLowerCase().indexOf('hello') > -1)) {
        session.send(wishingMsg + ' What can I do for you today!!!');
        session.send(new builder.Message(session).addAttachment({
            contentType: "application/vnd.microsoft.card.adaptive",
            content: {
                "type": "AdaptiveCard",
                "version": "0.5",

                "actions": [

                    {
                        "type": "Action.Submit",
                        "title": "General News",
                        "data": { "postback": "Headlines" }
                    },
                    {
                        "type": "Action.Submit",
                        "title": "Trending News",
                        "data": { "postback": "TrendingTopics" }

                    },
                    {
                        "type": "Action.Submit",
                        "title": "Sports",
                        "data": { "postback": "sports" }

                    },
                    {
                        "type": "Action.Submit",
                        "title": "Weather",
                        "data": { "postback": "weather" }

                    }
                ],

                body: [{
                    "type": "TextBlock",
                    "text": "For others, '@news : <search topic>'",
                    "size": "large",
                    "weight":"bolder"
                }]


            }
        }));

    } else if (session.message.text && session.message.text.indexOf('@news') > -1){
        console.log(session.message.text);
        getnews(session.message.text.substring(session.message.text.indexOf(':')+1, session.message.text.length),session);
    } 
    else {
        session.send("You said: %s", session.message.text);
    }
});

function getnews(topic, session) {
    console.log('topic:',topic);
    Bing.news(topic, {
        count: 5,  // Number of results (max 15)
        // offset: 3   // Skip first 3 results
    }, (error, res, body) => {
        console.log(body.value);
        body.value.forEach((news) => {
            session.send(`<a href='${news.url}'>${news.name}</a>`);
        });
    });
}
