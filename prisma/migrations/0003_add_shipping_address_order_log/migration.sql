-- AlterTable: add shippingAddress and retryCount to Order
ALTER TABLE "Order" ADD COLUMN "shippingAddress" JSONB;
ALTER TABLE "Order" ADD COLUMN "retryCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable: OrderLog for audit trail of AE order attempts
CREATE TABLE "OrderLog" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "requestData" JSONB,
    "responseData" JSONB,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderLog_orderId_idx" ON "OrderLog"("orderId");

-- AddForeignKey
ALTER TABLE "OrderLog" ADD CONSTRAINT "OrderLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
