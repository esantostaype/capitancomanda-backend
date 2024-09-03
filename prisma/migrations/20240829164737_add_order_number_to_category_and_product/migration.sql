/*
  Warnings:

  - You are about to drop the column `order` on the `Category` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderNumber]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderNumber]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "order",
ADD COLUMN     "orderNumber" TEXT;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "orderNumber" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "orderNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_orderNumber_key" ON "Category"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Product_orderNumber_key" ON "Product"("orderNumber");
