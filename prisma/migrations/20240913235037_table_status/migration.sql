-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'OCCUPIED_AWAITING_ORDER', 'OCCUPIED_SERVED');

-- AlterTable
ALTER TABLE "Table" ADD COLUMN     "status" "TableStatus";
