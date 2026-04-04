-- AlterTable: make passwordHash optional for Google OAuth users
ALTER TABLE "Customer" ALTER COLUMN "passwordHash" DROP NOT NULL;
