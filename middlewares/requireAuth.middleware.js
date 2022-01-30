const logger = require('../services/logger.service')

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    res.status(401).end('Not authenticated, Please Login')
    return
  }
  next()
}

module.exports = {
  requireAuth
}
