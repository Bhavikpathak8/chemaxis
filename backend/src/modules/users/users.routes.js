const express = require('express');
const controller = require('./users.controller');
const { validate, validateQuery } = require('../../middleware/validate');
const { authenticate, requireRole } = require('../../middleware/auth');
const { createStaffSchema, listUsersQuery, statusQuery, gstVerifySchema } = require('./users.schemas');

const router = express.Router();
const ADMIN = ['SUPER_ADMIN', 'TRADER_STAFF'];

router.use(authenticate);

// Super Admin: user management
router.get('/', requireRole('SUPER_ADMIN'), validateQuery(listUsersQuery), controller.list);
router.patch('/:id/deactivate', requireRole('SUPER_ADMIN'), controller.deactivate);
router.patch('/:id/activate', requireRole('SUPER_ADMIN'), controller.activate);
router.post('/staff', requireRole('SUPER_ADMIN'), validate(createStaffSchema), controller.createStaff);

// Trader/Admin: seller + buyer directory and approvals
router.get('/sellers', requireRole(...ADMIN), validateQuery(statusQuery), controller.listSellers);
router.get('/buyers', requireRole(...ADMIN), validateQuery(statusQuery), controller.listBuyers);
router.get('/sellers/pending', requireRole(...ADMIN), controller.getPendingSellers);
router.get('/buyers/pending', requireRole(...ADMIN), controller.getPendingBuyers);
router.get('/sellers/:id/documents', requireRole(...ADMIN), controller.sellerDocuments);
router.patch('/sellers/:id/approve', requireRole(...ADMIN), controller.approveSeller);
router.patch('/sellers/:id/reject', requireRole(...ADMIN), controller.rejectSeller);
router.patch('/buyers/:id/approve', requireRole(...ADMIN), controller.approveBuyer);
router.patch('/buyers/:id/reject', requireRole(...ADMIN), controller.rejectBuyer);
router.patch('/sellers/:id/gst-verify', requireRole(...ADMIN), validate(gstVerifySchema), controller.gstVerify('seller'));
router.patch('/buyers/:id/gst-verify', requireRole(...ADMIN), validate(gstVerifySchema), controller.gstVerify('buyer'));

module.exports = router;
