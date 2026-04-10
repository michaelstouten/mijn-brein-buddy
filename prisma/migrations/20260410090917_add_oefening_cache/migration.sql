-- CreateTable
CREATE TABLE "GeslagenOefening" (
    "id" TEXT NOT NULL,
    "vak" TEXT NOT NULL,
    "groep" INTEGER NOT NULL,
    "niveau" INTEGER NOT NULL,
    "vraag" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "opties" TEXT,
    "antwoord" TEXT NOT NULL,
    "uitleg" TEXT NOT NULL,
    "aangemaaktOp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeslagenOefening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OefeningPoging" (
    "id" TEXT NOT NULL,
    "datum" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "goed" BOOLEAN NOT NULL,
    "kindId" TEXT NOT NULL,
    "oefeningId" TEXT NOT NULL,

    CONSTRAINT "OefeningPoging_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OefeningPoging" ADD CONSTRAINT "OefeningPoging_kindId_fkey" FOREIGN KEY ("kindId") REFERENCES "Kind"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OefeningPoging" ADD CONSTRAINT "OefeningPoging_oefeningId_fkey" FOREIGN KEY ("oefeningId") REFERENCES "GeslagenOefening"("id") ON DELETE CASCADE ON UPDATE CASCADE;
