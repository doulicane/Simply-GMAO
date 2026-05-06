-- CreateEnum
CREATE TYPE "Role" AS ENUM ('RESPONSABLE', 'TECHNICIEN', 'OPERATEUR', 'MAGASINIER', 'HSE', 'ADMIN');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('CREE', 'PLANIFIE', 'EN_COURS', 'TERMINE', 'CLOTURE', 'ANNULE');

-- CreateEnum
CREATE TYPE "WorkOrderType" AS ENUM ('CORRECTIF', 'PREVENTIF', 'CONDITIONNEL', 'AMELIORATION', 'SECURITE');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('URGENTE', 'HAUTE', 'MOYENNE', 'BASSE');

-- CreateEnum
CREATE TYPE "EquipmentCriticality" AS ENUM ('CRITIQUE', 'ELEVEE', 'MOYENNE', 'FAIBLE');

-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('EN_SERVICE', 'EN_ARRET', 'EN_MAINTENANCE', 'HORS_SERVICE');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('ENTREE', 'SORTIE', 'RESERVATION', 'TRANSFERT', 'AJUSTEMENT', 'RETOUR');

-- CreateEnum
CREATE TYPE "ATEXInspectionType" AS ENUM ('VISUELLE', 'MESURE', 'COMPLETE');

-- CreateEnum
CREATE TYPE "ATEXInspectionResult" AS ENUM ('CONFORME', 'NON_CONFORME', 'A_SURVEILLER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "code" TEXT NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "zone_id" TEXT NOT NULL,

    CONSTRAINT "lignes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipments" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "criticality" "EquipmentCriticality" NOT NULL,
    "localisation" TEXT,
    "ligne_id" TEXT,
    "atex_zone" TEXT,
    "atex_category" TEXT,
    "contact_alimentaire" BOOLEAN NOT NULL DEFAULT false,
    "date_achat" TIMESTAMP(3),
    "num_serie" TEXT,
    "constructeur" TEXT,
    "date_mise_service" TIMESTAMP(3),
    "statut" "EquipmentStatus" NOT NULL DEFAULT 'EN_SERVICE',
    "compteur_actuel" DECIMAL(15,2) DEFAULT 0,
    "compteur_unite" TEXT,
    "qr_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "equipment_id" TEXT,
    "type" "WorkOrderType" NOT NULL,
    "priority" "Priority" NOT NULL,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'CREE',
    "demandeur_id" TEXT NOT NULL,
    "technicien_id" TEXT,
    "responsable_id" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_planifiee" TIMESTAMP(3),
    "date_debut" TIMESTAMP(3),
    "date_fin" TIMESTAMP(3),
    "duree_minutes" INTEGER,
    "cause_panne" TEXT,
    "actions_realisees" TEXT,
    "pieces_consommees" TEXT,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "atex_required" BOOLEAN NOT NULL DEFAULT false,
    "permis_feu_numero" TEXT,
    "consignation_electrique" BOOLEAN NOT NULL DEFAULT false,
    "outillage_certifie_ex" BOOLEAN NOT NULL DEFAULT false,
    "commentaire_cloture" TEXT,
    "cout_main_oeuvre" DECIMAL(10,2) DEFAULT 0,
    "validated_by" TEXT,
    "validated_at" TIMESTAMP(3),

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preventive_plans" (
    "id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "frequency_type" TEXT NOT NULL,
    "frequency_value" INTEGER NOT NULL,
    "checklist" JSONB,
    "last_execution" TIMESTAMP(3),
    "next_execution" TIMESTAMP(3),
    "alerte_avant_jours" INTEGER NOT NULL DEFAULT 3,
    "auto_generate_wo" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "preventive_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_items" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "famille" TEXT NOT NULL,
    "sous_famille" TEXT,
    "designation" TEXT,
    "quantite" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock_minimum" DECIMAL(10,2) NOT NULL,
    "stock_maximum" DECIMAL(10,2),
    "localisation" TEXT,
    "unite" TEXT,
    "prix_unitaire" DECIMAL(10,2),
    "fournisseur" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "stock_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "stock_item_id" TEXT NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "quantite" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "work_order_id" TEXT,
    "utilisateur_id" TEXT,
    "commentaire" TEXT,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atex_checklists" (
    "id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "date_inspection" TIMESTAMP(3) NOT NULL,
    "inspecteur_id" TEXT NOT NULL,
    "type_inspection" "ATEXInspectionType" NOT NULL,
    "resultat" "ATEXInspectionResult" NOT NULL,
    "anomalies" TEXT,
    "actions_correctives" TEXT,
    "prochaine_inspection" TIMESTAMP(3),
    "documents" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "atex_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "details" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sites_code_key" ON "sites"("code");

-- CreateIndex
CREATE UNIQUE INDEX "zones_code_key" ON "zones"("code");

-- CreateIndex
CREATE UNIQUE INDEX "lignes_code_key" ON "lignes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "equipments_code_key" ON "equipments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "equipments_qr_code_key" ON "equipments"("qr_code");

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_numero_key" ON "work_orders"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "stock_items_code_key" ON "stock_items"("code");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes" ADD CONSTRAINT "lignes_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_ligne_id_fkey" FOREIGN KEY ("ligne_id") REFERENCES "lignes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_demandeur_id_fkey" FOREIGN KEY ("demandeur_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_technicien_id_fkey" FOREIGN KEY ("technicien_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preventive_plans" ADD CONSTRAINT "preventive_plans_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_stock_item_id_fkey" FOREIGN KEY ("stock_item_id") REFERENCES "stock_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atex_checklists" ADD CONSTRAINT "atex_checklists_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atex_checklists" ADD CONSTRAINT "atex_checklists_inspecteur_id_fkey" FOREIGN KEY ("inspecteur_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
