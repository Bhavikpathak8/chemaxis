const express = require('express');
const controller = require('./notifications.controller');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();
router.use(authenticate); // every role has its own inbox

router.get('/mine', controller.findMine);
// Declared before '/:id/read' so "mine" is never parsed as an id.
router.patch('/mine/read-all', controller.markAllRead);
router.patch('/:id/read', controller.markRead);

module.exports = router;
