-- CreateTable
CREATE TABLE "Warehouse" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductInWarehouse" (
    "productId" INTEGER NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "notFulfilledQuantity" INTEGER NOT NULL DEFAULT 0,
    "inStockQuantity" INTEGER NOT NULL DEFAULT 0,
    "backOrderQuantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductInWarehouse_pkey" PRIMARY KEY ("productId","warehouseId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_address_key" ON "Warehouse"("address");

-- AddForeignKey
ALTER TABLE "ProductInWarehouse" ADD CONSTRAINT "ProductInWarehouse_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductInWarehouse" ADD CONSTRAINT "ProductInWarehouse_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
