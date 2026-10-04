import { PublicationDatePipe } from './publication-date.pipe';

const SEGUNDO = 1000;
const MINUTO = 60 * SEGUNDO;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

describe('PublicationDatePipe', () => {
  const ahora = Date.UTC(2026, 9, 4, 12, 0, 0);
  const pipe = new PublicationDatePipe();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(ahora);
  });

  afterEach(() => vi.useRealTimers());

  // Los mismos tramos que moment().fromNow(), que es lo que usaba antes el pipe.
  it.each([
    [10 * SEGUNDO, 'ahora'],
    [44 * SEGUNDO, 'ahora'],
    [50 * SEGUNDO, 'hace 1 minuto'],
    [5 * MINUTO, 'hace 5 minutos'],
    [44 * MINUTO, 'hace 44 minutos'],
    [45 * MINUTO, 'hace 1 hora'],
    [3 * HORA, 'hace 3 horas'],
    [22 * HORA, 'hace 1 día'],
    [3 * DIA, 'hace 3 días'],
    [26 * DIA, 'hace 1 mes'],
    [100 * DIA, 'hace 3 meses'],
    [330 * DIA, 'hace 1 año'],
    [3796 * DIA, 'hace 10 años'],
  ])('hace %i ms → «%s»', (transcurrido, texto) => {
    expect(pipe.transform(ahora - transcurrido)).toBe(texto);
  });

  it('expresa las fechas futuras', () => {
    expect(pipe.transform(ahora + 2 * DIA)).toBe('dentro de 2 días');
  });

  it('devuelve una cadena vacía si la fecha no es un número', () => {
    expect(pipe.transform(Number.NaN)).toBe('');
  });
});
