-- ============================================================
-- C-TECH v2 — MIGRATION 004: CHEMICAL SAFETY & HAZMAT SPECIFICATIONS
-- Adds industrial chemical compliance fields: Grade, Hazard Class,
-- UN Number, Packing Group, Packaging Type, and MOQ.
-- ============================================================

ALTER TABLE chemicals ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE chemicals ADD COLUMN IF NOT EXISTS hazard_class TEXT;
ALTER TABLE chemicals ADD COLUMN IF NOT EXISTS un_number TEXT;
ALTER TABLE chemicals ADD COLUMN IF NOT EXISTS packing_group TEXT;
ALTER TABLE chemicals ADD COLUMN IF NOT EXISTS packaging_type TEXT;
ALTER TABLE chemicals ADD COLUMN IF NOT EXISTS moq NUMERIC(12,2) DEFAULT 1;

-- Index for HazMat and Grade searches
CREATE INDEX IF NOT EXISTS idx_chemicals_grade ON chemicals(grade);
CREATE INDEX IF NOT EXISTS idx_chemicals_hazard_class ON chemicals(hazard_class);
