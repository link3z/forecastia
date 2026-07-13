/**
 * Seed de datos de ejemplo:
 *  - Usuario demo (demo@forecastia.app / Demo1234!)
 *  - Negocio "Chiringuito O Solpor"
 *  - Variables predictivas configuradas
 *  - Cierres diarios de ejemplo (temporada estival realista)
 *
 * Ejecutar: npx ts-node --esm apps/api/prisma/seed.ts
 * O vía Prisma: npx prisma db seed --schema apps/api/prisma/schema.prisma
 */
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@forecastia.app';
const DEMO_PASSWORD = 'Demo1234!';
const SALT_ROUNDS = 10;

async function main(): Promise<void> {
  console.log('[seed] Iniciando seed de datos de ejemplo…');

  // ── 1. Usuario demo ──────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { passwordHash },
    create: {
      name: 'Demo ForecastIA',
      email: DEMO_EMAIL,
      passwordHash,
    },
  });
  console.log(`[seed] Usuario: ${user.email} (id: ${user.id})`);

  // ── 2. Negocio demo ───────────────────────────────────────────────────────
  const existingBusiness = await prisma.business.findFirst({
    where: { userId: user.id, name: 'Chiringuito O Solpor' },
  });

  const business = existingBusiness
    ? await prisma.business.update({
        where: { id: existingBusiness.id },
        data: {
          type: 'Chiringuito de playa',
          location: 'Praia de Laxe, Galicia',
          currency: 'EUR',
          startDate: new Date('2023-06-01'),
          isSeasonal: true,
          seasonStart: new Date('2023-06-01'),
          seasonEnd: new Date('2023-09-30'),
          thresholds: [100, 200, 300, 500, 1000],
        },
      })
    : await prisma.business.create({
        data: {
          userId: user.id,
          name: 'Chiringuito O Solpor',
          type: 'Chiringuito de playa',
          location: 'Praia de Laxe, Galicia',
          currency: 'EUR',
          startDate: new Date('2023-06-01'),
          isSeasonal: true,
          seasonStart: new Date('2023-06-01'),
          seasonEnd: new Date('2023-09-30'),
          thresholds: [100, 200, 300, 500, 1000],
        },
      });
  console.log(`[seed] Negocio: ${business.name} (id: ${business.id})`);

  // ── 3. Variables predictivas ───────────────────────────────────────────────
  await prisma.predictiveVariableConfig.upsert({
    where: { businessId: business.id },
    update: {},
    create: {
      businessId: business.id,
      useWeather: true,
      useTemperature: true,
      useRain: true,
      useWind: false,
      useEvents: true,
      useCampaigns: true,
      useSocialFollowers: false,
      useObservations: true,
    },
  });
  console.log('[seed] Variables predictivas configuradas.');

  // ── 4. Cierres diarios de ejemplo ─────────────────────────────────────────
  // Datos realistas para un chiringuito de playa, temporada 2024 (junio–septiembre)
  const records: DailyRecordSeed[] = [
    // Junio — arranque de temporada
    { date: '2024-06-01', revenue: 210, tickets: 38, weather: 'parcialmente nublado', tempMax: 22, tempMin: 16, rain: null, event: null, campaign: 'Apertura temporada' },
    { date: '2024-06-02', revenue: 185, tickets: 34, weather: 'nublado', tempMax: 20, tempMin: 15, rain: null, event: null, campaign: null },
    { date: '2024-06-07', revenue: 320, tickets: 58, weather: 'soleado', tempMax: 26, tempMin: 18, rain: null, event: null, campaign: null },
    { date: '2024-06-08', revenue: 295, tickets: 52, weather: 'soleado', tempMax: 27, tempMin: 19, rain: null, event: null, campaign: null },
    { date: '2024-06-14', revenue: 410, tickets: 71, weather: 'soleado', tempMax: 29, tempMin: 21, rain: null, event: 'Fiesta San Antonio', campaign: null },
    { date: '2024-06-15', revenue: 385, tickets: 66, weather: 'soleado', tempMax: 28, tempMin: 20, rain: null, event: null, campaign: null },
    { date: '2024-06-21', revenue: 155, tickets: 29, weather: 'lluvia', tempMax: 18, tempMin: 14, rain: 'ligera', event: null, campaign: null },
    { date: '2024-06-22', revenue: 98, tickets: 18, weather: 'tormenta', tempMax: 16, tempMin: 13, rain: 'fuerte', event: null, campaign: null },
    { date: '2024-06-23', revenue: 260, tickets: 47, weather: 'parcialmente nublado', tempMax: 22, tempMin: 17, rain: null, event: null, campaign: null },
    { date: '2024-06-28', revenue: 340, tickets: 61, weather: 'soleado', tempMax: 28, tempMin: 20, rain: null, event: null, campaign: null },
    { date: '2024-06-29', revenue: 360, tickets: 64, weather: 'soleado', tempMax: 29, tempMin: 21, rain: null, event: null, campaign: null },
    { date: '2024-06-30', revenue: 290, tickets: 53, weather: 'parcialmente nublado', tempMax: 25, tempMin: 18, rain: null, event: null, campaign: null },

    // Julio — temporada alta
    { date: '2024-07-01', revenue: 420, tickets: 74, weather: 'soleado', tempMax: 30, tempMin: 22, rain: null, event: null, campaign: 'Menú verano especial' },
    { date: '2024-07-05', revenue: 680, tickets: 112, weather: 'soleado', tempMax: 32, tempMin: 24, rain: null, event: 'Festival de la Playa', campaign: null },
    { date: '2024-07-06', revenue: 620, tickets: 105, weather: 'soleado', tempMax: 31, tempMin: 23, rain: null, event: null, campaign: null },
    { date: '2024-07-07', revenue: 510, tickets: 88, weather: 'soleado', tempMax: 30, tempMin: 22, rain: null, event: null, campaign: null },
    { date: '2024-07-12', revenue: 490, tickets: 84, weather: 'soleado', tempMax: 31, tempMin: 22, rain: null, event: null, campaign: null },
    { date: '2024-07-13', revenue: 545, tickets: 93, weather: 'soleado', tempMax: 32, tempMin: 23, rain: null, event: null, campaign: null },
    { date: '2024-07-14', revenue: 470, tickets: 81, weather: 'parcialmente nublado', tempMax: 28, tempMin: 21, rain: null, event: null, campaign: null },
    { date: '2024-07-15', revenue: 200, tickets: 38, weather: 'lluvia', tempMax: 20, tempMin: 16, rain: 'ligera', event: null, campaign: null },
    { date: '2024-07-19', revenue: 530, tickets: 91, weather: 'soleado', tempMax: 31, tempMin: 22, rain: null, event: null, campaign: null },
    { date: '2024-07-20', revenue: 610, tickets: 103, weather: 'soleado', tempMax: 33, tempMin: 24, rain: null, event: null, campaign: null },
    { date: '2024-07-21', revenue: 580, tickets: 98, weather: 'soleado', tempMax: 32, tempMin: 23, rain: null, event: null, campaign: null },
    { date: '2024-07-25', revenue: 720, tickets: 118, weather: 'soleado', tempMax: 34, tempMin: 25, rain: null, event: 'Regata de Vela', campaign: null },
    { date: '2024-07-26', revenue: 695, tickets: 114, weather: 'soleado', tempMax: 33, tempMin: 24, rain: null, event: null, campaign: null },
    { date: '2024-07-27', revenue: 580, tickets: 97, weather: 'soleado', tempMax: 32, tempMin: 23, rain: null, event: null, campaign: null },
    { date: '2024-07-28', revenue: 550, tickets: 94, weather: 'soleado', tempMax: 31, tempMin: 22, rain: null, event: null, campaign: null },

    // Agosto — pico de temporada
    { date: '2024-08-02', revenue: 640, tickets: 108, weather: 'soleado', tempMax: 33, tempMin: 24, rain: null, event: null, campaign: null },
    { date: '2024-08-03', revenue: 710, tickets: 116, weather: 'soleado', tempMax: 34, tempMin: 25, rain: null, event: null, campaign: null },
    { date: '2024-08-04', revenue: 685, tickets: 113, weather: 'soleado', tempMax: 34, tempMin: 25, rain: null, event: null, campaign: null },
    { date: '2024-08-09', revenue: 590, tickets: 101, weather: 'parcialmente nublado', tempMax: 29, tempMin: 22, rain: null, event: null, campaign: null },
    { date: '2024-08-10', revenue: 630, tickets: 107, weather: 'soleado', tempMax: 31, tempMin: 23, rain: null, event: null, campaign: null },
    { date: '2024-08-14', revenue: 850, tickets: 138, weather: 'soleado', tempMax: 35, tempMin: 26, rain: null, event: 'Noche de San Lorenzo', campaign: 'Cóctel Estrella del Mar' },
    { date: '2024-08-15', revenue: 920, tickets: 148, weather: 'soleado', tempMax: 35, tempMin: 26, rain: null, event: 'Día de Galicia', campaign: 'Cóctel Estrella del Mar' },
    { date: '2024-08-16', revenue: 760, tickets: 124, weather: 'soleado', tempMax: 33, tempMin: 24, rain: null, event: null, campaign: null },
    { date: '2024-08-17', revenue: 680, tickets: 112, weather: 'soleado', tempMax: 32, tempMin: 23, rain: null, event: null, campaign: null },
    { date: '2024-08-23', revenue: 660, tickets: 110, weather: 'soleado', tempMax: 32, tempMin: 23, rain: null, event: null, campaign: null },
    { date: '2024-08-24', revenue: 720, tickets: 118, weather: 'soleado', tempMax: 33, tempMin: 24, rain: null, event: null, campaign: null },
    { date: '2024-08-25', revenue: 590, tickets: 99, weather: 'parcialmente nublado', tempMax: 28, tempMin: 21, rain: null, event: null, campaign: null },
    { date: '2024-08-30', revenue: 500, tickets: 86, weather: 'soleado', tempMax: 30, tempMin: 22, rain: null, event: null, campaign: null },
    { date: '2024-08-31', revenue: 480, tickets: 83, weather: 'parcialmente nublado', tempMax: 28, tempMin: 20, rain: null, event: null, campaign: null },

    // Septiembre — final de temporada
    { date: '2024-09-01', revenue: 380, tickets: 66, weather: 'parcialmente nublado', tempMax: 26, tempMin: 19, rain: null, event: null, campaign: null },
    { date: '2024-09-06', revenue: 320, tickets: 58, weather: 'soleado', tempMax: 27, tempMin: 20, rain: null, event: null, campaign: null },
    { date: '2024-09-07', revenue: 295, tickets: 53, weather: 'soleado', tempMax: 26, tempMin: 19, rain: null, event: null, campaign: null },
    { date: '2024-09-08', revenue: 140, tickets: 27, weather: 'lluvia', tempMax: 19, tempMin: 15, rain: 'ligera', event: null, campaign: null },
    { date: '2024-09-13', revenue: 260, tickets: 47, weather: 'nublado', tempMax: 22, tempMin: 17, rain: null, event: null, campaign: null },
    { date: '2024-09-14', revenue: 310, tickets: 55, weather: 'soleado', tempMax: 25, tempMin: 18, rain: null, event: null, campaign: null },
    { date: '2024-09-20', revenue: 230, tickets: 42, weather: 'nublado', tempMax: 21, tempMin: 16, rain: null, event: null, campaign: null },
    { date: '2024-09-21', revenue: 195, tickets: 36, weather: 'lluvia', tempMax: 19, tempMin: 14, rain: 'ligera', event: null, campaign: null },
    { date: '2024-09-27', revenue: 175, tickets: 32, weather: 'nublado', tempMax: 20, tempMin: 15, rain: null, event: null, campaign: 'Cierre de temporada' },
    { date: '2024-09-28', revenue: 160, tickets: 30, weather: 'lluvia', tempMax: 18, tempMin: 14, rain: 'ligera', event: null, campaign: null },
    { date: '2024-09-29', revenue: 210, tickets: 38, weather: 'parcialmente nublado', tempMax: 22, tempMin: 16, rain: null, event: null, campaign: null },
    { date: '2024-09-30', revenue: 240, tickets: 43, weather: 'soleado', tempMax: 24, tempMin: 17, rain: null, event: 'Fiesta de cierre', campaign: null },
  ];

  let created = 0;
  let skipped = 0;

  for (const r of records) {
    const date = new Date(r.date + 'T00:00:00.000Z');
    const existing = await prisma.dailyRecord.findUnique({
      where: { businessId_date: { businessId: business.id, date } },
    });
    if (existing) {
      skipped++;
      continue;
    }
    const averageTicket = r.tickets > 0 ? r.revenue / r.tickets : 0;
    await prisma.dailyRecord.create({
      data: {
        businessId: business.id,
        date,
        revenue: r.revenue,
        tickets: r.tickets,
        averageTicket: Math.round(averageTicket * 100) / 100,
        weather: r.weather,
        tempMax: r.tempMax,
        tempMin: r.tempMin,
        rain: r.rain,
        wind: null,
        event: r.event,
        campaign: r.campaign,
        socialFollowers: null,
        observations: null,
      },
    });
    created++;
  }
  console.log(`[seed] Cierres diarios: ${created} creados, ${skipped} omitidos (ya existían).`);

  // ── 5. Recalcular métricas ─────────────────────────────────────────────────
  const allRecords = await prisma.dailyRecord.findMany({ where: { businessId: business.id } });
  const revenues = allRecords.map((r) => Number(r.revenue));
  const totalRevenue = revenues.reduce((s, v) => s + v, 0);
  const totalTickets = allRecords.reduce((s, r) => s + r.tickets, 0);
  const best = allRecords.reduce((a, b) => (Number(b.revenue) > Number(a.revenue) ? b : a));
  const worst = allRecords.reduce((a, b) => (Number(b.revenue) < Number(a.revenue) ? b : a));

  await prisma.businessMetrics.upsert({
    where: { businessId: business.id },
    update: {
      totalRevenue,
      averageDailyRevenue: totalRevenue / allRecords.length,
      totalTickets,
      globalAverageTicket: totalTickets > 0 ? totalRevenue / totalTickets : 0,
      bestDay: { date: best.date.toISOString().slice(0, 10), revenue: Number(best.revenue) } as object,
      worstDay: { date: worst.date.toISOString().slice(0, 10), revenue: Number(worst.revenue) } as object,
      recordsCount: allRecords.length,
      recentTrend: 0,
    },
    create: {
      businessId: business.id,
      totalRevenue,
      averageDailyRevenue: totalRevenue / allRecords.length,
      totalTickets,
      globalAverageTicket: totalTickets > 0 ? totalRevenue / totalTickets : 0,
      bestDay: { date: best.date.toISOString().slice(0, 10), revenue: Number(best.revenue) } as object,
      worstDay: { date: worst.date.toISOString().slice(0, 10), revenue: Number(worst.revenue) } as object,
      recordsCount: allRecords.length,
      recentTrend: 0,
    },
  });
  console.log(`[seed] Métricas recalculadas. Total: €${totalRevenue.toFixed(2)}, ${allRecords.length} cierres.`);
  console.log('[seed] ✅ Seed completado.');
  console.log(`[seed]    Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

interface DailyRecordSeed {
  date: string;
  revenue: number;
  tickets: number;
  weather: string | null;
  tempMax: number | null;
  tempMin: number | null;
  rain: string | null;
  event: string | null;
  campaign: string | null;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
