import { PublicationDatePipe } from './publication-date.pipe';

type FechaLocal = [number, number, number, number, number, number, number];

describe('PublicationDatePipe', () => {
  // «Ahora» y las fechas de los casos son locales (año, mes 0-11, día, h, min, s, ms).
  const ahora = new Date(2026, 6, 15, 12, 0, 0, 0);
  const pipe = new PublicationDatePipe();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(ahora);
  });

  afterEach(() => vi.useRealTimers());

  // Valores esperados sacados de moment(fecha).fromNow() con moment 2.31.0 (el de master) y el
  // locale «es», con el mismo «ahora». Son iguales en UTC, Europe/Madrid, America/New_York,
  // Australia/Sydney, Asia/Kolkata y America/Sao_Paulo.
  it.each<[FechaLocal, string]>([
    [[2026, 6, 15, 12, 0, 0, 0], 'hace unos segundos'], // ahora mismo
    [[2026, 6, 15, 11, 59, 16, 0], 'hace unos segundos'], // hace 44 s
    [[2026, 6, 15, 11, 59, 15, 501], 'hace unos segundos'], // hace 44,499 s
    [[2026, 6, 15, 11, 59, 15, 500], 'hace un minuto'], // hace 44,5 s
    [[2026, 6, 15, 11, 58, 31, 0], 'hace un minuto'], // hace 89 s
    [[2026, 6, 15, 11, 58, 30, 0], 'hace 2 minutos'], // hace 90 s
    [[2026, 6, 15, 11, 15, 31, 0], 'hace 44 minutos'], // hace 44 min 29 s
    [[2026, 6, 15, 11, 15, 30, 0], 'hace una hora'], // hace 44 min 30 s
    [[2026, 6, 15, 10, 31, 0, 0], 'hace una hora'], // hace 89 min
    [[2026, 6, 15, 10, 30, 0, 0], 'hace 2 horas'], // hace 90 min
    [[2026, 6, 14, 14, 31, 0, 0], 'hace 21 horas'], // hace 21 h 29 min
    [[2026, 6, 14, 14, 30, 0, 0], 'hace un día'], // hace 21 h 30 min
    [[2026, 6, 14, 0, 1, 0, 0], 'hace un día'], // hace 35 h 59 min
    [[2026, 6, 14, 0, 0, 0, 0], 'hace 2 días'], // hace 36 h
    [[2026, 5, 20, 0, 1, 0, 0], 'hace 25 días'], // hace 25 d 11 h 59 min
    [[2026, 5, 20, 0, 0, 0, 0], 'hace un mes'], // hace 25 d 12 h
    [[2026, 4, 31, 12, 0, 0, 0], 'hace un mes'], // hace 45 d (31/05 + 1 mes = 30/06)
    [[2026, 4, 30, 12, 0, 0, 0], 'hace un mes'], // hace 46 d: 1 mes de calendario y 15 d
    [[2026, 4, 29, 12, 0, 0, 0], 'hace 2 meses'], // hace 47 d: 1 mes de calendario y 16 d
    [[2026, 2, 31, 6, 0, 0, 0], 'hace 4 meses'], // 31/03 + 3 meses = 30/06, y 15,25 d más
    [[2025, 7, 31, 12, 0, 0, 0], 'hace 10 meses'], // hace 10 meses y 15 d
    [[2025, 7, 29, 12, 0, 0, 0], 'hace un año'], // hace 10 meses y 16 d
    [[2025, 6, 15, 12, 0, 0, 0], 'hace un año'], // hace 1 año justo
    [[2025, 0, 16, 12, 0, 0, 0], 'hace un año'], // hace 17 meses y 29 d
    [[2025, 0, 15, 12, 0, 0, 0], 'hace 2 años'], // hace 18 meses justos
    [[2016, 3, 20, 0, 0, 0, 0], 'hace 10 años'], // como los productos de db.json
    [[2026, 6, 15, 12, 0, 44, 0], 'en unos segundos'], // dentro de 44 s
    [[2026, 6, 15, 12, 0, 45, 0], 'en un minuto'], // dentro de 45 s
    [[2026, 6, 17, 12, 0, 0, 0], 'en 2 días'], // dentro de 2 d
    [[2026, 7, 30, 12, 0, 0, 0], 'en un mes'], // dentro de 46 d
    [[2027, 5, 15, 12, 0, 0, 0], 'en un año'], // dentro de 11 meses
  ])('%j → «%s»', (fecha, texto) => {
    expect(pipe.transform(new Date(...fecha).getTime())).toBe(texto);
  });

  it('devuelve una cadena vacía si la fecha no es un número (moment daba «Invalid date»)', () => {
    expect(pipe.transform(Number.NaN)).toBe('');
  });
});
