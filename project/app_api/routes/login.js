'use strict'

var passport = require('passport');
var User = require('../models/user');

module.exports = function(router) {

  router.post('/login', function(req, res) {
    console.log('POST Request: ' + req.url);
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        return console.log(err);
      }
      if (user) {
        return res.json({ token: user.generateJwt()});
      }
      return res.status(401).json(info);
    })(req, res);
  });
}
