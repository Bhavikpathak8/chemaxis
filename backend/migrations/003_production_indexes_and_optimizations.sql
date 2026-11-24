-- ============================================================
-- C-TECH v2 — MIGRATION 003: PRODUCTION PERFORMANCE INDEXES
-- Optimizes high-throughput queries, multi-criteria chemical
-- searches, status filtering, and audit log lookups.
-- ============================================================

-- 1. User & Authentication Lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_lower_email ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active);

-- 2. Chemical Catalog & CAS Search
CREATE INDEX IF NOT EXISTS idx_chemicals_cas_number ON chemicals(cas_number);
CREATE INDEX IF NOT EXISTS idx_chemicals_category ON chemicals(category);

-- 3. Trade Desk RFQs & Quotations
CREATE INDEX IF NOT EXISTS idx_quotation_requests_status ON quotation_requests(status);
CREATE INDEX IF NOT EXISTS idx_quotation_requests_buyer ON quotation_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_quotation_requests_chemical ON quotation_requests(chemical_id);

-- 4. Purchase Orders & Fulfillment
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_buyer ON purchase_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_po_num ON purchase_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_chemical ON purchase_order_items(chemical_id);

-- 5. Invoices & Financial Tracking
CREATE INDEX IF NOT EXISTS idx_invoices_po_id ON invoices(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- 6. Audit Trail & Compliance Queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
