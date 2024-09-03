/*
  Warnings:

  - The `orderNumber` column on the `Category` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `orderNumber` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "orderNumber",
ADD COLUMN     "orderNumber" INTEGER;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "orderNumber",
ADD COLUMN     "orderNumber" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Category_orderNumber_key" ON "Category"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Product_orderNumber_key" ON "Product"("orderNumber");
