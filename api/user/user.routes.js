const express = require('express');
const { requireAuth } = require('../../middlewares/requireAuth.middleware');
const { getUser, getUsers, deleteUser, updateUser } = require('./user.controller');
const router = express.Router();

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/', requireAuth, updateUser);
router.delete('/:id', requireAuth, deleteUser)

module.exports = router