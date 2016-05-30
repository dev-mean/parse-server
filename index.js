// Example express application adding the parse-server module to expose Parse
// compatible API routes.
//mongo --port 27017 --ssl --sslAllowInvalidCertificates --authenticationDatabase admin --username sammy --password
//mongodb://parse:password@159.203.204.76:27017/popii_parse
//parse-server --appId B88zTS61xWg64r0SfYjFAL1kq7x9LYDzNFNykKU1 --masterKey oTq8jsoCJiUuzonNVHNGzBP58CBBHrlECCSQu1dn

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');


var api = new ParseServer({
  databaseURI: 'mongodb://localhost:27017/popii_parse',
  cloud:  __dirname + '/cloud/main.js',
  appId: 'B88zTS61xWg64r0SfYjFAL1kq7x9LYDzNFNykKU1',
  masterKey:'oTq8jsoCJiUuzonNVHNGzBP58CBBHrlECCSQu1dn', //Add your master key here. Keep it secret!
  javascriptKey:'HZCSf3Kt6hxb9sENGuFEp17EAjOZuL7hpFc1PaCY',
  serverURL: 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Products", "Shows"] // List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();
var express = require('express');
var expressLayouts = require('./express-layouts');
var parseExpressCookieSession = require('parse-express-cookie-session');
var parseExpressHttpsRedirect = require('parse-express-https-redirect');
app.set('views', 'views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(expressLayouts);          // Use the layout engine for express
app.use(parseExpressHttpsRedirect());    // Automatically redirect non-secure urls to secure ones
app.use(express.bodyParser());    // Middleware for reading request body
app.use(express.methodOverride());
app.use(express.cookieParser('SECRET_SIGNING_KEY'));
app.use(parseExpressCookieSession({
  fetchUser: true,
  key: 'image.sess',
  cookie: {
    maxAge: 3600000 * 24 * 30
  }
}));


app.locals._ = require('underscore');
var PromoCodes = Parse.Object.extend("PromoCodes");

var authCheck = function(req,res, next) {
    var currentUser = Parse.User.current();
    console.log(currentUser);
    if (!currentUser) {
        res.redirect('/');
    }
  else
    return next();
};
app.get('/logout', function(req, res) {
Parse.User.logOut();
res.redirect('/');
});
app.post('/login', function(req, res) {
    Parse.User.logIn(req.body.username, req.body.password).then(function(user) {
      res.redirect('home');
    }, function(error) {
      // PromoCodes the error message and let the user try again
      res.render('login', { flash: error.message });
    });
  });
app.get('/', function(req, res) {
res.render('login');
});
app.get('/home',authCheck, function(req, res) {
res.render('home');
});
//##A###########################################################PromoCodes#################################################################
//Getting all PromoCodes to render on html page
app.get('/PromoCodes',authCheck, function(req, res) {
  var query = new Parse.Query(PromoCodes);
  query.limit(1000);
  query.find().then(function(objects) {
    res.render('PromoCodes', { PromoCodes : objects });
  });
});
//get PromoCodes by PromoCodes id to json
app.get('/PromoCodes/list/:id',authCheck, function(req, res) {
if(req.params.id !=='undefined' || req.params.id!==null)
{
  var objectId =req.params.id;
  var query = new Parse.Query(PromoCodes);
  query.equalTo("objectId",objectId);
  query.find({
  success: function(PromoCodes) {
  res.json(PromoCodes[0]);
  },
  error: function(PromoCodes, error) {
    res.json({success:-2});
  }
});
}else
{
    res.json({success:-1});
}
});
//delete PromoCodes by PromoCodes id
app.get('/PromoCodes/del/:id',authCheck, function(req, res) {
if(req.params.id !=='undefined' || req.params.id!==null)
{
  var objectId =req.params.id;
  var query = new Parse.Query(PromoCodes);
  query.equalTo("objectId",objectId);
  query.find({
  success: function(PromoCodes) {
  var delPromoCode=PromoCodes[0];
  delPromoCode.destroy({
  success: function(delPromoCode) {
    res.json({success:1});
  },
  error: function(delPromoCode, error) {
    res.json({success:-3});
  }
  });
  },
  error: function(delPromoCode, error) {
    res.json({success:-2});
  }
});
}else
{
    res.json({success:-1});
}
});
//edit PromoCodes objectId
app.post('/PromoCodes/:id',authCheck, function(req, res) {
try{
var payLoad=req.body;
if(req.params.id !=='undefined' || req.params.id!==null)
{
if(payLoad) {
  var query = new Parse.Query(PromoCodes);
  var objectId =req.params.id;
  console.log(objectId);
  query.get(objectId,{
  success: function(editPromoCode) {
  editPromoCode.set("PromoCode", payLoad.PromoCode);
  editPromoCode.set("AmountType", payLoad.AmountType);
  editPromoCode.set("Value", payLoad.Value);
  editPromoCode.save(null,{
  success: function(editPromoCode) {
    res.json({success:1});
  },
  error: function(editPromoCode, error) {
    res.json({success:-4});
  }
  });
  },
  error: function(editPromoCode, error) {
    res.json({success:-3});
  }
});
}
else
{
    res.json({success:-2});
}
}else
{
    res.json({success:-1});
}
}catch(e)
{
  res.json(e);
}
});
//add new PromoCodes 
app.post('/PromoCodes',authCheck, function(req, res) {
var payLoad=req.body;
var newPromoCode = new PromoCodes();
  newPromoCode.set("PromoCode", payLoad.PromoCode);
  newPromoCode.set("AmountType", payLoad.AmountType);
  newPromoCode.set("Value", payLoad.Value);
  newPromoCode.save(null, {
  success: function(savedPromoCode) {
     var query = new Parse.Query(PromoCodes);
  query.find().then(function(objects) {
    res.render('PromoCodes', { PromoCodes : objects });
  });
  },
  error: function(savedPromoCode, error) {
    res.json({success:0,error:error});
  }});
});
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
