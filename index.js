// Example express application adding the parse-server module to expose Parse
// compatible API routes.
//mongo --port 27017 --ssl --sslAllowInvalidCertificates --authenticationDatabase admin --username sammy --password
//mongodb://parse:password@159.203.204.76:27017/popii_parse
//parse-server --appId Nw47gz5W9KvrZMxKCaFV6GGfwBw4kC4BkFz4EB7f --masterKey 6UzqOhby6pmAqyipt7xcgiNtlnDJkhUioB1lm6JW

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');


var api = new ParseServer({
  databaseURI: 'mongodb://localhost:27017/popii_parse',
  cloud:  __dirname + '/cloud/main.js',
  appId: 'Nw47gz5W9KvrZMxKCaFV6GGfwBw4kC4BkFz4EB7f',
  masterKey:'6UzqOhby6pmAqyipt7xcgiNtlnDJkhUioB1lm6JW', //Add your master key here. Keep it secret!
  javascriptKey:'HZCSf3Kt6hxb9sENGuFEp17EAjOZuL7hpFc1PaCY',
  restAPIKey:'akV3idRdPE3tzV8KBEkeL6Q2GDj5zPnswBlb9laO',
  fileKey:'1f508bb2-6ecd-4791-a17b-6c78a3f0f832',
  serverURL: 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Products", "Shows"] // List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey,  dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath =  '/parse';
app.use(mountPath, api);

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
