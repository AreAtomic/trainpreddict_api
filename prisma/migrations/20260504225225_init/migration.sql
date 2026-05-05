-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" TEXT NOT NULL,
    "prenom" TEXT,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Coureur',
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "codeSecurite" INTEGER,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "structureId" TEXT,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profil" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "fcfs" INTEGER NOT NULL DEFAULT 200,
    "pfs" INTEGER NOT NULL DEFAULT 300,
    "age" INTEGER NOT NULL DEFAULT 14,
    "poids" DOUBLE PRECISION NOT NULL DEFAULT 75,

    CONSTRAINT "Profil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonneesUtilisateur" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "experience" INTEGER,
    "heureSommeil" DOUBLE PRECISION,
    "tempsRecupMax" DOUBLE PRECISION,
    "sse" DOUBLE PRECISION NOT NULL DEFAULT 700,
    "nombreHeureSemaine" DOUBLE PRECISION NOT NULL,
    "nombreSeanceSemaine" INTEGER NOT NULL,
    "joursRepos" JSONB NOT NULL DEFAULT '[]',
    "musculation" BOOLEAN NOT NULL,
    "ppg" BOOLEAN NOT NULL DEFAULT true,
    "etirement" BOOLEAN NOT NULL,
    "foncier" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "pointFaible" TEXT NOT NULL,

    CONSTRAINT "DonneesUtilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfoSup" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "naissance" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "decouverte" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,

    CONSTRAINT "InfoSup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParametreStructure" (
    "id" TEXT NOT NULL,
    "structureId" TEXT NOT NULL,
    "coureurCourbes" BOOLEAN NOT NULL DEFAULT false,
    "seancePartage" BOOLEAN NOT NULL DEFAULT true,
    "seanceOwn" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ParametreStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entrainement" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "typeEntrainement" JSONB NOT NULL DEFAULT '[]',
    "type" TEXT NOT NULL,
    "duree" TEXT NOT NULL,
    "distance" TEXT NOT NULL,
    "deniv" DOUBLE PRECISION NOT NULL,
    "fcMoy" DOUBLE PRECISION,
    "fcMax" DOUBLE PRECISION,
    "cadenceMoy" DOUBLE PRECISION,
    "cadenceMax" DOUBLE PRECISION,
    "powerMoy" DOUBLE PRECISION,
    "powerMax" DOUBLE PRECISION,
    "normalizedPower" DOUBLE PRECISION,
    "calories" DOUBLE PRECISION,
    "specifique" JSONB NOT NULL DEFAULT '[]',
    "fcSeconds" JSONB NOT NULL DEFAULT '[]',
    "powerSeconds" JSONB NOT NULL DEFAULT '[]',
    "cadSeconds" JSONB NOT NULL DEFAULT '[]',
    "n10Fc" JSONB NOT NULL DEFAULT '[]',
    "n10Power" JSONB NOT NULL DEFAULT '[]',
    "n30Fc" JSONB NOT NULL DEFAULT '[]',
    "n30Power" JSONB NOT NULL DEFAULT '[]',
    "description" TEXT,
    "zoneFc" JSONB NOT NULL DEFAULT '[]',
    "powerZone" JSONB NOT NULL DEFAULT '[]',
    "Z1" TEXT NOT NULL,
    "Z2" TEXT NOT NULL,
    "Z3" TEXT NOT NULL,
    "Z4" TEXT NOT NULL,
    "Z5" TEXT NOT NULL,
    "Z6" TEXT,
    "Z7" TEXT,
    "intensiteTravail" DOUBLE PRECISION NOT NULL,
    "scoreStressEntrainement" DOUBLE PRECISION NOT NULL,
    "ressentis" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pointCarte" JSONB NOT NULL DEFAULT '[]',
    "statistiques" BOOLEAN NOT NULL DEFAULT false,
    "tableauStatistiques" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Entrainement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seance" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT,
    "type" JSONB NOT NULL,
    "titre" TEXT NOT NULL,
    "duree" TEXT NOT NULL,
    "estimationDistance" DOUBLE PRECISION NOT NULL,
    "estimationDeniv" DOUBLE PRECISION NOT NULL,
    "specifique" JSONB NOT NULL DEFAULT '[]',
    "description" TEXT,
    "descripiqueDescription" TEXT,
    "Z1" TEXT NOT NULL,
    "Z2" TEXT NOT NULL,
    "Z3" TEXT NOT NULL,
    "Z4" TEXT NOT NULL,
    "Z5" TEXT NOT NULL,
    "Z6" TEXT NOT NULL,
    "Z7" TEXT NOT NULL,
    "puissanceMoyenne" DOUBLE PRECISION NOT NULL,
    "chargeEntrainementEstime" DOUBLE PRECISION NOT NULL,
    "intensiteTravail" DOUBLE PRECISION NOT NULL,
    "scoreStressEntrainement" DOUBLE PRECISION NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Seance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bloc" (
    "id" TEXT NOT NULL,
    "specifique" JSONB NOT NULL,
    "certified" BOOLEAN NOT NULL DEFAULT false,
    "creatorId" TEXT,

    CONSTRAINT "Bloc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT,
    "organismeId" TEXT,
    "date" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Cyclosportive',
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "denivele" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "temps" TEXT NOT NULL,
    "sse" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "course" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Objectif" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Vallon',
    "resultatVise" TEXT DEFAULT 'Victoire',
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "denivele" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "temps" TEXT NOT NULL,
    "realise" BOOLEAN NOT NULL DEFAULT false,
    "sse" DOUBLE PRECISION NOT NULL DEFAULT 200,

    CONSTRAINT "Objectif_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "donneesUtilisateurId" TEXT,
    "dateDebut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "seancesDefinies" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assistant" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,

    CONSTRAINT "Assistant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendrierAnnee" (
    "id" TEXT NOT NULL,
    "assistantId" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "statsPlanned" JSONB NOT NULL DEFAULT '{}',
    "statsDone" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "CalendrierAnnee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendrierSemaine" (
    "id" TEXT NOT NULL,
    "anneeId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "statsPlanned" JSONB NOT NULL DEFAULT '{}',
    "statsDone" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "CalendrierSemaine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendrierJour" (
    "id" TEXT NOT NULL,
    "semaineId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "formPlanned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "formDone" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tirednessPlanned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tirednessDone" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "statsPlanned" JSONB NOT NULL DEFAULT '{}',
    "statsDone" JSONB NOT NULL DEFAULT '{}',
    "comments" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "CalendrierJour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "writerId" TEXT,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '[]',
    "coverId" TEXT,
    "state" TEXT,
    "creation" TEXT,
    "lastUpdate" TEXT,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "fileId" TEXT,
    "name" TEXT,
    "thumbnailUrl" TEXT,
    "url" TEXT,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_JourPlannedSeance" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_JourPlannedCourse" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_JourObjectif" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_JourDone" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE INDEX "Utilisateur_email_idx" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profil_utilisateurId_key" ON "Profil"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "DonneesUtilisateur_utilisateurId_key" ON "DonneesUtilisateur"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "InfoSup_utilisateurId_key" ON "InfoSup"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "ParametreStructure_structureId_key" ON "ParametreStructure"("structureId");

-- CreateIndex
CREATE INDEX "Entrainement_date_idx" ON "Entrainement"("date");

-- CreateIndex
CREATE INDEX "Entrainement_utilisateurId_idx" ON "Entrainement"("utilisateurId");

-- CreateIndex
CREATE INDEX "Seance_titre_idx" ON "Seance"("titre");

-- CreateIndex
CREATE INDEX "Course_date_idx" ON "Course"("date");

-- CreateIndex
CREATE INDEX "Objectif_date_idx" ON "Objectif"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Assistant_utilisateurId_key" ON "Assistant"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendrierAnnee_assistantId_year_key" ON "CalendrierAnnee"("assistantId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "CalendrierSemaine_anneeId_week_key" ON "CalendrierSemaine"("anneeId", "week");

-- CreateIndex
CREATE UNIQUE INDEX "CalendrierJour_date_key" ON "CalendrierJour"("date");

-- CreateIndex
CREATE UNIQUE INDEX "_JourPlannedSeance_AB_unique" ON "_JourPlannedSeance"("A", "B");

-- CreateIndex
CREATE INDEX "_JourPlannedSeance_B_index" ON "_JourPlannedSeance"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_JourPlannedCourse_AB_unique" ON "_JourPlannedCourse"("A", "B");

-- CreateIndex
CREATE INDEX "_JourPlannedCourse_B_index" ON "_JourPlannedCourse"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_JourObjectif_AB_unique" ON "_JourObjectif"("A", "B");

-- CreateIndex
CREATE INDEX "_JourObjectif_B_index" ON "_JourObjectif"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_JourDone_AB_unique" ON "_JourDone"("A", "B");

-- CreateIndex
CREATE INDEX "_JourDone_B_index" ON "_JourDone"("B");

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profil" ADD CONSTRAINT "Profil_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonneesUtilisateur" ADD CONSTRAINT "DonneesUtilisateur_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfoSup" ADD CONSTRAINT "InfoSup_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParametreStructure" ADD CONSTRAINT "ParametreStructure_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrainement" ADD CONSTRAINT "Entrainement_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bloc" ADD CONSTRAINT "Bloc_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_organismeId_fkey" FOREIGN KEY ("organismeId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objectif" ADD CONSTRAINT "Objectif_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_donneesUtilisateurId_fkey" FOREIGN KEY ("donneesUtilisateurId") REFERENCES "DonneesUtilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assistant" ADD CONSTRAINT "Assistant_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendrierAnnee" ADD CONSTRAINT "CalendrierAnnee_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendrierSemaine" ADD CONSTRAINT "CalendrierSemaine_anneeId_fkey" FOREIGN KEY ("anneeId") REFERENCES "CalendrierAnnee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendrierJour" ADD CONSTRAINT "CalendrierJour_semaineId_fkey" FOREIGN KEY ("semaineId") REFERENCES "CalendrierSemaine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JourPlannedSeance" ADD CONSTRAINT "_JourPlannedSeance_A_fkey" FOREIGN KEY ("A") REFERENCES "CalendrierJour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JourPlannedSeance" ADD CONSTRAINT "_JourPlannedSeance_B_fkey" FOREIGN KEY ("B") REFERENCES "Seance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JourPlannedCourse" ADD CONSTRAINT "_JourPlannedCourse_A_fkey" FOREIGN KEY ("A") REFERENCES "CalendrierJour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JourPlannedCourse" ADD CONSTRAINT "_JourPlannedCourse_B_fkey" FOREIGN KEY ("B") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JourObjectif" ADD CONSTRAINT "_JourObjectif_A_fkey" FOREIGN KEY ("A") REFERENCES "CalendrierJour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JourObjectif" ADD CONSTRAINT "_JourObjectif_B_fkey" FOREIGN KEY ("B") REFERENCES "Objectif"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JourDone" ADD CONSTRAINT "_JourDone_A_fkey" FOREIGN KEY ("A") REFERENCES "CalendrierJour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JourDone" ADD CONSTRAINT "_JourDone_B_fkey" FOREIGN KEY ("B") REFERENCES "Entrainement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
