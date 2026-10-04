/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
| Blue Path                                                        |
|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
| Crea el pipe PublicationDatePipe. Su cometido es, partiendo de   |
| una fecha dada, retornar una cadena de texto que exprese el      |
| tiempo que ha pasado desde dicha fecha hasta ahora. Por ejemplo: |
| hace 2 horas. Antes nos apoyábamos en la librería Moment.js      |
| ('moment(fecha).fromNow()'); ahora el pipe hace lo mismo, con    |
| los mismos textos en español, sin dependencias.                  |
|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

import { Pipe, PipeTransform } from '@angular/core';

// Reproduce moment(fecha).fromNow() con el locale «es» (moment 2.31, el de master):
// - La diferencia se mide en meses de calendario más el resto en milisegundos, como
//   moment.duration({ from, to }).
// - Cada unidad se redondea con Math.round y se elige con los umbrales de moment: 45 s, 45 min,
//   22 h, 26 días y 11 meses.
// - Los textos son los del locale «es».
const SEGUNDO = 1000;
const MINUTO = 60 * SEGUNDO;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

@Pipe({
  name: 'LapseOfTime',
})
export class PublicationDatePipe implements PipeTransform {
  transform(publishedDate: number): string {
    // moment devolvía «Invalid date»; aquí, una cadena vacía.
    if (!Number.isFinite(publishedDate)) {
      return '';
    }
    const fecha = new Date(publishedDate);
    const ahora = new Date();
    const futuro = fecha > ahora;
    const texto = cantidad(futuro ? diferencia(ahora, fecha) : diferencia(fecha, ahora));
    return futuro ? `en ${texto}` : `hace ${texto}`;
  }
}

/** Meses de calendario de `desde` a `hasta` (`desde` <= `hasta`) y el resto en milisegundos. */
function diferencia(desde: Date, hasta: Date): { meses: number; ms: number } {
  let meses =
    (hasta.getFullYear() - desde.getFullYear()) * 12 + hasta.getMonth() - desde.getMonth();
  if (sumarMeses(desde, meses) > hasta) {
    meses--;
  }
  return { meses, ms: hasta.getTime() - sumarMeses(desde, meses).getTime() };
}

/** Como moment().add(n, 'months'): el mismo día del mes, o el último si el mes es más corto. */
function sumarMeses(fecha: Date, meses: number): Date {
  const resultado = new Date(fecha.getTime());
  // Con 0 meses moment no toca la fecha: setMonth() la recalcularía desde la hora local, que en
  // la hora que se repite al acabar el horario de verano puede ser la otra.
  if (meses !== 0) {
    const mes = fecha.getMonth() + meses;
    const diasDelMes = new Date(fecha.getFullYear(), mes + 1, 0).getDate();
    resultado.setMonth(mes, Math.min(fecha.getDate(), diasDelMes));
  }
  return resultado;
}

/** Como relativeTime() de moment con los textos de «es». */
function cantidad({ meses, ms }: { meses: number; ms: number }): string {
  // Para segundos, minutos, horas y días moment pasa los meses a días enteros; para meses y años,
  // el resto en milisegundos a meses. Un mes son 146097 / 4800 días: la media del calendario
  // gregoriano (146097 días cada 400 años). Mismas operaciones y en el mismo orden que moment.
  const diasDeLosMeses = Math.round((meses * 146097) / 4800);
  const segundos = Math.round(diasDeLosMeses * (DIA / SEGUNDO) + ms / SEGUNDO);
  const minutos = Math.round(diasDeLosMeses * (DIA / MINUTO) + ms / MINUTO);
  const horas = Math.round(diasDeLosMeses * (DIA / HORA) + ms / HORA);
  const dias = Math.round(diasDeLosMeses + ms / DIA);
  const mesesExactos = meses + ((ms / DIA) * 4800) / 146097;
  const mesesRedondeados = Math.round(mesesExactos);
  const anyos = Math.round(mesesExactos / 12);

  if (segundos < 45) return 'unos segundos';
  if (minutos <= 1) return 'un minuto';
  if (minutos < 45) return `${minutos} minutos`;
  if (horas <= 1) return 'una hora';
  if (horas < 22) return `${horas} horas`;
  if (dias <= 1) return 'un día';
  if (dias < 26) return `${dias} días`;
  if (mesesRedondeados <= 1) return 'un mes';
  if (mesesRedondeados < 11) return `${mesesRedondeados} meses`;
  if (anyos <= 1) return 'un año';
  return `${anyos} años`;
}
