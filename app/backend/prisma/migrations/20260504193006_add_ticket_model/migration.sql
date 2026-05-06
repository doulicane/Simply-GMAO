-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('CREE', 'EN_ATTENTE', 'EN_COURS', 'RESOLU', 'REJETE', 'CONVERTI_EN_BT');

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "equipment_id" TEXT,
    "operateur_id" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'CREE',
    "priority" "Priority" NOT NULL DEFAULT 'MOYENNE',
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "work_order_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tickets_numero_key" ON "tickets"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_work_order_id_key" ON "tickets"("work_order_id");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_operateur_id_fkey" FOREIGN KEY ("operateur_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
