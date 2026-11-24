const express = require('express');
const { z } = require('zod');
const { pool } = require('../../db/pool');
const { asyncHandler } = require('../../middleware/error');
const { validate } = require('../../middleware/validate');
const { authenticate, requireRole } = require('../../middleware/auth');
const { NotFoundError } = require('../../utils/errors');
const { logAction } = require('../../common/audit-log');

const router = express.Router();
router.use(authenticate);

const createSchema = z.object({ name: z.string().min(1).max(60) });
const updateSchema = z.object({ name: z.string().min(1).max(60).optional(), isActive: z.boolean().optional() });

router.get('/', requireRole('SUPER_ADMIN', 'TRADER_STAFF'), asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM expense_categories ORDER BY name');
  res.json(rows);
}));

router.post('/', requireRole('SUPER_ADMIN'), validate(createSchema), asyncHandler(async (req, res) => {
  const { rows } = await pool.query('INSERT INTO expense_categories (name) VALUES ($1) RETURNING *', [req.body.name]);
  await logAction({ userId: req.user.id, action: 'CREATE_EXPENSE_CATEGORY', entityType: 'ExpenseCategory', entityId: rows[0].id, metadata: req.body });
  res.status(201).json(rows[0]);
}));

router.patch('/:id', requireRole('SUPER_ADMIN'), validate(updateSchema), asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE expense_categories SET name = COALESCE($2, name), is_active = COALESCE($3, is_active)
     WHERE id = $1 RETURNING *`,
    [req.params.id, req.body.name ?? null, req.body.isActive ?? null],
  );
  if (rows.length === 0) throw new NotFoundError('Expense category not found');
  await logAction({ userId: req.user.id, action: 'UPDATE_EXPENSE_CATEGORY', entityType: 'ExpenseCategory', entityId: rows[0].id, metadata: req.body });
  res.json(rows[0]);
}));

module.exports = router;
