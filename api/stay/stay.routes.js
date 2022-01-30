const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { addStay, getStays, deleteStay, getById, updateStay } = require('./stay.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getStays)
router.get('/:id', log, getById)
router.post('/', log, requireAuth, addStay)
router.put('/', updateStay);
router.delete('/:id', requireAuth, deleteStay)

module.exports = router
