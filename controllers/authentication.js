const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../config');

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signin = function(request, response, next) {
  // User is authenticated; give user a token
  response.send({ token: tokenForUser(request.user) });
}

exports.signup = function(request, response, next) {
  const email = request.body.email;
  const password = request.body.password;

  if (!email || !password) {
    return response.status(422).send({ error: 'You must provide email and password' })
  }
  // See if a user with the given email exists
  User.findOne({ email: email }, function(error, existingUser) {
    if (error) { return next(error); }

    // If user exists, return error
    if (existingUser) {
      return response.status(422).send({ error: 'Email is in use' });
    }

    // If a user with email does not exist, create and save user record
    const user = new User({
      email: email,
      password: password
    });

    user.save(function(error) {
      if (error) { return next(error); }

      // Respond to request indicating the user was created
      response.json({ token: tokenForUser(user) });
    });
  });
}
