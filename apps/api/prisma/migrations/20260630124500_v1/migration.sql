-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "startDate" TIMESTAMP(3) NOT NULL,
    "isSeasonal" BOOLEAN NOT NULL DEFAULT false,
    "seasonStart" TIMESTAMP(3),
    "seasonEnd" TIMESTAMP(3),
    "thresholds" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictive_variable_configs" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "useWeather" BOOLEAN NOT NULL DEFAULT true,
    "useTemperature" BOOLEAN NOT NULL DEFAULT true,
    "useRain" BOOLEAN NOT NULL DEFAULT true,
    "useWind" BOOLEAN NOT NULL DEFAULT false,
    "useEvents" BOOLEAN NOT NULL DEFAULT true,
    "useCampaigns" BOOLEAN NOT NULL DEFAULT true,
    "useSocialFollowers" BOOLEAN NOT NULL DEFAULT false,
    "useObservations" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "predictive_variable_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_records" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "revenue" DECIMAL(12,2) NOT NULL,
    "tickets" INTEGER NOT NULL,
    "averageTicket" DECIMAL(12,2) NOT NULL,
    "weather" TEXT,
    "tempMax" DECIMAL(5,2),
    "tempMin" DECIMAL(5,2),
    "rain" TEXT,
    "wind" TEXT,
    "event" TEXT,
    "campaign" TEXT,
    "socialFollowers" INTEGER,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_metrics" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "totalRevenue" DECIMAL(14,2) NOT NULL,
    "averageDailyRevenue" DECIMAL(12,2) NOT NULL,
    "totalTickets" INTEGER NOT NULL,
    "globalAverageTicket" DECIMAL(12,2) NOT NULL,
    "bestDay" JSONB,
    "worstDay" JSONB,
    "recordsCount" INTEGER NOT NULL DEFAULT 0,
    "recentTrend" DECIMAL(6,4) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forecasts" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "expectedRevenue" DECIMAL(12,2) NOT NULL,
    "minRevenue" DECIMAL(12,2) NOT NULL,
    "maxRevenue" DECIMAL(12,2) NOT NULL,
    "pessimisticScenario" DECIMAL(12,2) NOT NULL,
    "averageScenario" DECIMAL(12,2) NOT NULL,
    "optimisticScenario" DECIMAL(12,2) NOT NULL,
    "probabilities" JSONB NOT NULL,
    "influencingFactors" JSONB NOT NULL,
    "aiExplanation" TEXT,
    "inputVariables" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "businesses_userId_idx" ON "businesses"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "predictive_variable_configs_businessId_key" ON "predictive_variable_configs"("businessId");

-- CreateIndex
CREATE INDEX "daily_records_businessId_idx" ON "daily_records"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_records_businessId_date_key" ON "daily_records"("businessId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "business_metrics_businessId_key" ON "business_metrics"("businessId");

-- CreateIndex
CREATE INDEX "forecasts_businessId_idx" ON "forecasts"("businessId");

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predictive_variable_configs" ADD CONSTRAINT "predictive_variable_configs_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_records" ADD CONSTRAINT "daily_records_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_metrics" ADD CONSTRAINT "business_metrics_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forecasts" ADD CONSTRAINT "forecasts_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
