-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "message" TEXT NOT NULL,
    "user_id" UUID,
    "attachment" TEXT,
    "at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "table_schemas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "schema_slug" TEXT NOT NULL,
    "schema_name" TEXT NOT NULL,
    "raw_sql_schema" TEXT NOT NULL,
    "zod_validation_config" JSONB NOT NULL,
    "valid_at" TIMESTAMP(3) NOT NULL,
    "expired_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "table_schemas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "table_schemas_schema_name_valid_at_expired_at_idx" ON "table_schemas"("schema_name", "valid_at", "expired_at");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
