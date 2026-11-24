-- ============================================================
-- C-TECH v2 — INITIAL SCHEMA
-- Plain SQL, no ORM. Applied by scripts/migrate.js in filename order.
-- ============================================================

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'TRADER_STAFF', 'SELLER', 'BUYER');
CREATE TYPE verification_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE unit_type AS ENUM ('KG', 'TON', 'LITRE');
CREATE TYPE margin_type AS ENUM ('FIXED', 'PERCENTAGE', 'MANUAL');
CREATE TYPE seller_doc_type AS ENUM ('GST_CERTIFICATE', 'COMPANY_LICENSE', 'OTHER');
CREATE TYPE quotation_request_status AS ENUM ('REQUESTED', 'REVIEWED', 'QUOTED', 'ACCEPTED', 'REJECTED', 'EXPIRED');
CREATE TYPE quotation_status AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED');
CREATE TYPE po_status AS ENUM ('PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED');
CREATE TYPE transport_status AS ENUM ('PENDING', 'PICKUP_SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED');
CREATE TYPE payment_method AS ENUM ('BANK_TRANSFER', 'UPI', 'CHEQUE', 'CASH', 'OTHER');
CREATE TYPE payment_status AS ENUM ('PENDING', 'VERIFIED', 'PAID');
CREATE TYPE margin_scope AS ENUM ('GLOBAL', 'CATEGORY', 'CHEMICAL');

-- ------------------------------------------------------------
-- IDENTITY
-- ------------------------------------------------------------
CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  role           user_role NOT NULL,
  phone          TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sellers (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID UNIQUE NOT NULL REFERENCES users(id),
  company_name         TEXT NOT NULL,
  gst_number           TEXT UNIQUE NOT NULL,
  gst_verified         BOOLEAN NOT NULL DEFAULT FALSE,
  address              TEXT NOT NULL,
  city                 TEXT NOT NULL,
  state                TEXT NOT NULL,
  pincode              TEXT NOT NULL,
  verification_status  verification_status NOT NULL DEFAULT 'PENDING',
  verified_at          TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE buyers (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID UNIQUE NOT NULL REFERENCES users(id),
  company_name         TEXT NOT NULL,
  gst_number           TEXT UNIQUE NOT NULL,
  gst_verified         BOOLEAN NOT NULL DEFAULT FALSE,
  address              TEXT NOT NULL,
  city                 TEXT NOT NULL,
  state                TEXT NOT NULL,
  pincode              TEXT NOT NULL,
  verification_status  verification_status NOT NULL DEFAULT 'PENDING',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE seller_documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id    UUID NOT NULL REFERENCES sellers(id),
  type         seller_doc_type NOT NULL,
  file_url     TEXT NOT NULL,
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- CATALOG + PRICING ENGINE
-- ------------------------------------------------------------
CREATE TABLE chemicals (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id           UUID NOT NULL REFERENCES sellers(id),
  name                TEXT NOT NULL,
  category            TEXT NOT NULL DEFAULT 'Industrial Chemical',
  cas_number          TEXT,
  purity              TEXT NOT NULL,
  unit                unit_type NOT NULL DEFAULT 'KG',
  seller_price        NUMERIC(12,2) NOT NULL,       -- visible only to Trader/Admin
  buyer_price         NUMERIC(12,2),                 -- visible to Buyer; null until priced
  margin_type         margin_type,
  margin_value        NUMERIC(12,2),
  warehouse_location  TEXT NOT NULL,
  description         TEXT,
  coa_url             TEXT,
  msds_url            TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE inventory (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chemical_id         UUID UNIQUE NOT NULL REFERENCES chemicals(id),
  quantity_available  NUMERIC(12,2) NOT NULL DEFAULT 0,
  quantity_reserved   NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin-configurable default margin rules (Super Admin > Margin policies).
-- A chemical's own margin_type/margin_value, if set, overrides these.
CREATE TABLE margin_policies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  scope         margin_scope NOT NULL DEFAULT 'GLOBAL',
  category      TEXT,               -- used when scope = CATEGORY
  chemical_id   UUID REFERENCES chemicals(id), -- used when scope = CHEMICAL
  margin_type   margin_type NOT NULL,
  margin_value  NUMERIC(12,2) NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- RFQ / QUOTATION WORKFLOW
-- ------------------------------------------------------------
CREATE TABLE quotation_requests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id            UUID NOT NULL REFERENCES buyers(id),
  chemical_id         UUID NOT NULL REFERENCES chemicals(id),
  requested_quantity  NUMERIC(12,2) NOT NULL,
  unit                unit_type NOT NULL,
  status              quotation_request_status NOT NULL DEFAULT 'REQUESTED',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quotations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_request_id  UUID NOT NULL REFERENCES quotation_requests(id),
  quoted_price_per_unit NUMERIC(12,2) NOT NULL,
  quantity              NUMERIC(12,2) NOT NULL, -- trader can edit qty from the original request
  margin_per_unit       NUMERIC(12,2) NOT NULL,
  valid_until           TIMESTAMPTZ NOT NULL,
  status                quotation_status NOT NULL DEFAULT 'DRAFT',
  pdf_url               TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- PURCHASE ORDERS
-- ------------------------------------------------------------
CREATE TABLE purchase_orders (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number               TEXT UNIQUE NOT NULL,
  buyer_id                UUID NOT NULL REFERENCES buyers(id),
  quotation_id            UUID REFERENCES quotations(id), -- set when PO came from an accepted quotation
  status                  po_status NOT NULL DEFAULT 'PENDING',
  delivery_address        TEXT NOT NULL,
  expected_dispatch_date  DATE,
  payment_terms           TEXT,
  total_amount            NUMERIC(14,2) NOT NULL,
  gst_amount              NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at            TIMESTAMPTZ,
  delivered_at            TIMESTAMPTZ
);

CREATE TABLE purchase_order_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id     UUID NOT NULL REFERENCES purchase_orders(id),
  chemical_id           UUID NOT NULL REFERENCES chemicals(id),
  quantity               NUMERIC(12,2) NOT NULL,
  unit                  unit_type NOT NULL,
  seller_price_per_unit NUMERIC(12,2) NOT NULL,
  buyer_price_per_unit  NUMERIC(12,2) NOT NULL,
  subtotal              NUMERIC(14,2) NOT NULL
);

-- ------------------------------------------------------------
-- TRANSPORTATION
-- ------------------------------------------------------------
CREATE TABLE transport_vendors (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  contact_phone  TEXT,
  contact_email  TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE drivers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id       UUID REFERENCES transport_vendors(id),
  name            TEXT NOT NULL,
  phone           TEXT,
  license_number  TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE transportation (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id  UUID UNIQUE NOT NULL REFERENCES purchase_orders(id),
  vendor_id          UUID REFERENCES transport_vendors(id),
  driver_id          UUID REFERENCES drivers(id),
  pickup_location    TEXT NOT NULL,
  delivery_location  TEXT NOT NULL,
  distance_km        NUMERIC(8,2),
  vehicle_type       TEXT NOT NULL,
  cost               NUMERIC(12,2) NOT NULL,
  status             transport_status NOT NULL DEFAULT 'PENDING',
  pod_url            TEXT, -- proof of delivery upload
  scheduled_at       TIMESTAMPTZ,
  picked_up_at       TIMESTAMPTZ,
  delivered_at       TIMESTAMPTZ,
  completed_at       TIMESTAMPTZ
);

-- ------------------------------------------------------------
-- EXPENSES + PROFIT ENGINE
-- ------------------------------------------------------------
CREATE TABLE expense_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT UNIQUE NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE expenses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id   UUID NOT NULL REFERENCES purchase_orders(id),
  category_id         UUID NOT NULL REFERENCES expense_categories(id),
  amount              NUMERIC(12,2) NOT NULL,
  description         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profit snapshot per order — recalculated whenever expenses change,
-- matching the spec's "Profit updates automatically whenever expense changes."
CREATE TABLE transactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id   UUID UNIQUE NOT NULL REFERENCES purchase_orders(id),
  seller_amount       NUMERIC(14,2) NOT NULL,
  buyer_amount        NUMERIC(14,2) NOT NULL,
  gross_margin        NUMERIC(14,2) NOT NULL,
  total_expense       NUMERIC(14,2) NOT NULL,
  net_profit          NUMERIC(14,2) NOT NULL,
  calculated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- INVOICING + PAYMENTS
-- ------------------------------------------------------------
CREATE TABLE gst_settings (
  id                       INT PRIMARY KEY DEFAULT 1,
  default_gst_rate_percent NUMERIC(5,2) NOT NULL DEFAULT 18,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

CREATE TABLE invoices (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number      TEXT UNIQUE NOT NULL,
  purchase_order_id   UUID UNIQUE NOT NULL REFERENCES purchase_orders(id),
  gst_amount          NUMERIC(12,2) NOT NULL,
  total_amount        NUMERIC(14,2) NOT NULL,
  pdf_url             TEXT,
  qr_data             TEXT,
  issued_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date            TIMESTAMPTZ
);

-- Buyer -> Trader payment against an invoice.
CREATE TABLE payments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id    UUID NOT NULL REFERENCES invoices(id),
  amount        NUMERIC(14,2) NOT NULL,
  method        payment_method NOT NULL,
  reference_note TEXT, -- e.g. UTR number, cheque number
  status        payment_status NOT NULL DEFAULT 'PENDING',
  recorded_by   UUID NOT NULL REFERENCES users(id),
  paid_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trader -> Seller payout, tracked separately from the buyer's payment
-- ("Seller payment recorded" is its own workflow step in the spec).
CREATE TABLE seller_payouts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id   UUID NOT NULL REFERENCES purchase_orders(id),
  seller_id           UUID NOT NULL REFERENCES sellers(id),
  amount              NUMERIC(14,2) NOT NULL,
  paid_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes               TEXT
);

-- ------------------------------------------------------------
-- SYSTEM
-- ------------------------------------------------------------
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id),
  event_type  TEXT NOT NULL, -- e.g. 'SELLER_APPROVED', 'RFQ_SUBMITTED'
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id),
  action       TEXT NOT NULL,       -- e.g. 'APPROVE_SELLER', 'SET_MARGIN', 'BAN_USER'
  entity_type  TEXT NOT NULL,
  entity_id    TEXT,
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- INDEXES for the lookups every module above does constantly
-- ------------------------------------------------------------
CREATE INDEX idx_chemicals_seller ON chemicals(seller_id);
CREATE INDEX idx_chemicals_active_priced ON chemicals(is_active) WHERE buyer_price IS NOT NULL;
CREATE INDEX idx_quotation_requests_buyer ON quotation_requests(buyer_id);
CREATE INDEX idx_quotations_request ON quotations(quotation_request_id);
CREATE INDEX idx_po_buyer ON purchase_orders(buyer_id);
CREATE INDEX idx_po_items_po ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_expenses_po ON expenses(purchase_order_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ------------------------------------------------------------
-- SEED: default expense categories + GST setting row (structural
-- data, not demo accounts — those come from scripts/seed-demo.js)
-- ------------------------------------------------------------
INSERT INTO expense_categories (name) VALUES
  ('Transportation'), ('Billing'), ('Loading'), ('Packaging'),
  ('Insurance'), ('Commission'), ('Miscellaneous');

INSERT INTO gst_settings (id, default_gst_rate_percent) VALUES (1, 18);
