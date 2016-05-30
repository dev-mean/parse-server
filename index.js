// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');


var api = new ParseServer({
  databaseURI: 'mongodb://localhost:27017/popii_parse',
  cloud:  __dirname + '/cloud/main.js',
  appId: '63ptxDF1N5amy1qBh3j8aXvxDGIdqzsYCiSqXiNE',
  masterKey:'0rEa7v3ZGugDGIocClYDyjEkGGbWjmnQLhoNDVX2', //Add your master key here. Keep it secret!
  javascriptKey:'IqhXk8haw1vDOoBzyYJ1RnOcF3HTcmgB2e5xmxA8',
  serverURL: 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Products", "Shows"] // List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath =  '/parse';
app.use(mountPath, api);

/* Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});*/

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
