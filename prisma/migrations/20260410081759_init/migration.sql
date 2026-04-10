-- CreateTable
CREATE TABLE "Ouder" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "wachtwoord" TEXT NOT NULL,
    "aangemeldOp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ouder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kind" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "leeftijd" INTEGER NOT NULL,
    "groep" INTEGER NOT NULL,
    "kleur" TEXT NOT NULL,
    "ouderId" TEXT NOT NULL,

    CONSTRAINT "Kind_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OefeningScore" (
    "id" TEXT NOT NULL,
    "datum" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vak" TEXT NOT NULL,
    "niveau" INTEGER NOT NULL,
    "aantalGoed" INTEGER NOT NULL,
    "aantalTotaal" INTEGER NOT NULL,
    "duurSeconden" INTEGER NOT NULL,
    "kindId" TEXT NOT NULL,

    CONSTRAINT "OefeningScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ouder_email_key" ON "Ouder"("email");

-- AddForeignKey
ALTER TABLE "Kind" ADD CONSTRAINT "Kind_ouderId_fkey" FOREIGN KEY ("ouderId") REFERENCES "Ouder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OefeningScore" ADD CONSTRAINT "OefeningScore_kindId_fkey" FOREIGN KEY ("kindId") REFERENCES "Kind"("id") ON DELETE CASCADE ON UPDATE CASCADE;
