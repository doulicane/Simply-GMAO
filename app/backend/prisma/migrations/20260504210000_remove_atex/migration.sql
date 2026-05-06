-- Remove ATEX & Sécurité references from the database schema

-- DropForeignKey
ALTER TABLE "atex_checklists" DROP CONSTRAINT IF EXISTS "atex_checklists_equipment_id_fkey";

-- DropForeignKey
ALTER TABLE "atex_checklists" DROP CONSTRAINT IF EXISTS "atex_checklists_inspecteur_id_fkey";

-- AlterEnum (remove SECURITE from WorkOrderType)
BEGIN;
CREATE TYPE "WorkOrderType_new" AS ENUM ('CORRECTIF', 'PREVENTIF', 'CONDITIONNEL', 'AMELIORATION');
ALTER TABLE "work_orders" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "work_orders" ALTER COLUMN "type" TYPE "WorkOrderType_new" USING ("type"::text::"WorkOrderType_new");
ALTER TYPE "WorkOrderType" RENAME TO "WorkOrderType_old";
ALTER TYPE "WorkOrderType_new" RENAME TO "WorkOrderType";
DROP TYPE "WorkOrderType_old";
ALTER TABLE "work_orders" ALTER COLUMN "type" SET DEFAULT 'CORRECTIF';
COMMIT;

-- AlterTable (drop ATEX columns from equipments)
ALTER TABLE "equipments" DROP COLUMN IF EXISTS "atex_zone";
ALTER TABLE "equipments" DROP COLUMN IF EXISTS "atex_category";

-- AlterTable (drop ATEX & sécurité columns from work_orders)
ALTER TABLE "work_orders" DROP COLUMN IF EXISTS "atex_required";
ALTER TABLE "work_orders" DROP COLUMN IF EXISTS "permis_feu_numero";
ALTER TABLE "work_orders" DROP COLUMN IF EXISTS "consignation_electrique";
ALTER TABLE "work_orders" DROP COLUMN IF EXISTS "outillage_certifie_ex";

-- DropTable
DROP TABLE IF EXISTS "atex_checklists";

-- DropEnum
DROP TYPE IF EXISTS "ATEXInspectionType";
DROP TYPE IF EXISTS "ATEXInspectionResult";
