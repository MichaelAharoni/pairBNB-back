var config;

// keys.js - figure out what set of credentials to return
if (false && process.env.NODE_ENV === 'production') {
  // we are in production - return the prod set of keys
  console.log('In production');
  config = require('./prod')
} else {
  console.log('In development');
  // we are in development - return the dev keys!!!
  // config = require('./dev')
}

module.exports = config