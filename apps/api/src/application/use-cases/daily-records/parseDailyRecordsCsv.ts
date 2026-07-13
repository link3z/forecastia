/**
 * Parser del CSV de importación de cierres históricos (CU-004).
 * Formato esperado (cabecera obligatoria):
 * fecha,caja,tickets,ticketMedio,clima,tempMax,tempMin,lluvia,viento,eventos,campania,seguidores,observaciones
 *
 * No usa librerías externas: el formato es simple (sin comillas ni comas
 * escapadas dentro de los campos), suficiente para el alcance del TFM.
 */
export interface ParsedCsvRow {
  line: number;
  date: Date;
  revenue: number;
  tickets: number;
  averageTicket: number | null;
  weather: string | null;
  tempMax: number | null;
  tempMin: number | null;
  rain: string | null;
  wind: string | null;
  event: string | null;
  campaign: string | null;
  socialFollowers: number | null;
  observations: string | null;
}

export interface CsvRowError {
  line: number;
  message: string;
}

export interface ParseCsvResult {
  rows: ParsedCsvRow[];
  errors: CsvRowError[];
}

const EXPECTED_COLUMNS = [
  'fecha',
  'caja',
  'tickets',
  'ticketmedio',
  'clima',
  'tempmax',
  'tempmin',
  'lluvia',
  'viento',
  'eventos',
  'campania',
  'seguidores',
  'observaciones',
];

export function parseDailyRecordsCsv(content: string): ParseCsvResult {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { rows: [], errors: [{ line: 0, message: 'El fichero CSV está vacío.' }] };
  }

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const headerOk = EXPECTED_COLUMNS.every((col, idx) => header[idx] === col);
  if (!headerOk) {
    return {
      rows: [],
      errors: [
        {
          line: 1,
          message: `Cabecera inválida. Se espera: ${EXPECTED_COLUMNS.join(',')}`,
        },
      ],
    };
  }

  const rows: ParsedCsvRow[] = [];
  const errors: CsvRowError[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const lineNumber = i + 1;
    const cols = lines[i].split(',').map((c) => c.trim());

    if (cols.length !== EXPECTED_COLUMNS.length) {
      errors.push({ line: lineNumber, message: 'Número de columnas incorrecto.' });
      continue;
    }

    const [
      fecha,
      caja,
      tickets,
      ticketMedio,
      clima,
      tempMax,
      tempMin,
      lluvia,
      viento,
      eventos,
      campania,
      seguidores,
      observaciones,
    ] = cols;

    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) {
      errors.push({ line: lineNumber, message: `Fecha inválida: "${fecha}".` });
      continue;
    }

    const revenue = Number(caja);
    if (Number.isNaN(revenue) || revenue < 0) {
      errors.push({ line: lineNumber, message: `Caja inválida: "${caja}".` });
      continue;
    }

    const ticketsValue = Number(tickets);
    if (Number.isNaN(ticketsValue) || ticketsValue < 0) {
      errors.push({ line: lineNumber, message: `Tickets inválidos: "${tickets}".` });
      continue;
    }

    rows.push({
      line: lineNumber,
      date,
      revenue,
      tickets: ticketsValue,
      averageTicket: toOptionalNumber(ticketMedio),
      weather: toOptionalString(clima),
      tempMax: toOptionalNumber(tempMax),
      tempMin: toOptionalNumber(tempMin),
      rain: toOptionalString(lluvia),
      wind: toOptionalString(viento),
      event: toOptionalString(eventos),
      campaign: toOptionalString(campania),
      socialFollowers: toOptionalNumber(seguidores),
      observations: toOptionalString(observaciones),
    });
  }

  return { rows, errors };
}

function toOptionalNumber(value: string): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function toOptionalString(value: string): string | null {
  return value ? value : null;
}
