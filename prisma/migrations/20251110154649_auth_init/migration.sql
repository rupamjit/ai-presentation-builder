/*
Warnings:

- You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/

-- Begin transaction for safe data migration
BEGIN;

-- Backup existing User table if it has data
ALTER TABLE "User" RENAME TO "User_backup";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user" ("email");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user" ("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session" ("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session" ("userId");

-- CreateIndex
CREATE INDEX "session_token_idx" ON "session" ("token");

-- CreateIndex
CREATE INDEX "session_expiresAt_idx" ON "session" ("expiresAt");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account" ("userId");

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account" ("providerId", "accountId");

-- CreateIndex
CREATE INDEX "verification_expiresAt_idx" ON "verification" ("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "verification_identifier_value_key" ON "verification" ("identifier", "value");

-- Detect and log duplicate emails before migration
-- This helps identify data issues before they cause silent data loss
DO $$
DECLARE
    duplicate_count INT;
BEGIN
    SELECT COUNT(DISTINCT "email") INTO duplicate_count
    FROM (
        SELECT "email", COUNT(*) as email_count
        FROM "User_backup"
        GROUP BY "email"
        HAVING COUNT(*) > 1
    ) AS duplicates;
    
    IF duplicate_count > 0 THEN
        RAISE WARNING 'MIGRATION WARNING: Found % email addresses with duplicate entries in User_backup table. These duplicates will be merged with the most recently updated record preserved.', duplicate_count;
        
        -- Log duplicates to help with post-migration audit
        CREATE TEMP TABLE IF NOT EXISTS migration_duplicate_log AS
        SELECT "email", COUNT(*) as duplicate_count, ARRAY_AGG("id" ORDER BY "updatedAt" DESC) as user_ids
        FROM "User_backup"
        GROUP BY "email"
        HAVING COUNT(*) > 1;

END IF;

END $$;

-- Migrate data from backup table to new user table (preserving existing data)
-- For duplicate emails, keep the most recently updated record
-- and discard older duplicates (this assumes the most recent record has the correct data)
INSERT INTO
    "user" (
        "id",
        "name",
        "email",
        "emailVerified",
        "image",
        "createdAt",
        "updatedAt"
    )
WITH deduplicated_users AS (
    SELECT
        "id",
        "name",
        "email",
        "emailVerified",
        "image",
        "createdAt",
        "updatedAt",
        ROW_NUMBER() OVER (PARTITION BY "email" ORDER BY "updatedAt" DESC, "id") as rn
    FROM "User_backup"
)
SELECT
    "id",
    "name",
    "email",
    COALESCE("emailVerified", false),
    "image",
    "createdAt",
    "updatedAt"
FROM deduplicated_users
WHERE rn = 1
ON CONFLICT ("email") DO UPDATE SET
    "name" = EXCLUDED."name",
    "emailVerified" = EXCLUDED."emailVerified",
    "image" = EXCLUDED."image",
    "updatedAt" = EXCLUDED."updatedAt";
-- For duplicate emails across old and new data (if any), update with the excluded row's values

-- AddForeignKey
ALTER TABLE "session"
ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account"
ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Verify data integrity: count rows in backup vs new table
-- If counts match, migration was successful
DO $$
DECLARE
    backup_count INT;
    new_count INT;
BEGIN
    SELECT COUNT(*) INTO backup_count FROM "User_backup";
    SELECT COUNT(*) INTO new_count FROM "user";
    
    IF backup_count != new_count THEN
        RAISE WARNING 'Data integrity check: backup has % rows but new table has % rows', backup_count, new_count;
    ELSE
        RAISE NOTICE 'Migration successful: % rows migrated', new_count;
    END IF;
END $$;

-- Optionally drop backup table (uncomment after verifying data integrity in next migration)
-- DROP TABLE "User_backup";

COMMIT;