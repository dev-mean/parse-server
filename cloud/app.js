var express = require('express');
var expressLayouts = require('./express-layouts');
var parseExpressCookieSession = require('parse-express-cookie-session');
var parseExpressHttpsRedirect = require('parse-express-https-redirect');
var app = express();
app.set('views', 'views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(expressLayouts);          // Use the layout engine for express
app.use(parseExpressHttpsRedirect());    // Automatically redirect non-secure urls to secure ones
/*app.use(express.bodyParser());    // Middleware for reading request body
//app.use(express.methodOverride());
//app.use(express.cookieParser('SECRET_SIGNING_KEY'));
app.use(parseExpressCookieSession({
  fetchUser: true,
  key: 'image.sess',
  cookie: {
    maxAge: 3600000 * 24 * 30
  }
}));
*/

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


app.listen();
