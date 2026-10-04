/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
| Blue Path                                                        |
|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
| Crea el pipe PublicationDatePipe. Su cometido es, partiendo de   |
| una fecha dada, retornar una cadena de texto que exprese el      |
| tiempo que ha pasado desde dicha fecha hasta ahora. Por ejemplo: |
| hace 2 horas. Antes nos apoyábamos en la librería Moment.js      |
| ('moment(fecha).fromNow()'); ahora basta con la API estándar     |
| Intl.RelativeTimeFormat del navegador, sin dependencias.         |
|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

import { Pipe, PipeTransform } from "@angular/core";

const SEGUNDO = 1000;
const MINUTO = 60 * SEGUNDO;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;
// Duración media de un mes y de un año del calendario gregoriano, como en moment.
const MES = (146097 / 4800) * DIA;
const ANYO = 12 * MES;

// Mismos umbrales que moment().fromNow(): se usa cada unidad mientras la cantidad
// redondeada no llegue al límite (45 minutos, 22 horas, 26 días y 11 meses).
const UMBRALES: ReadonlyArray<readonly [Intl.RelativeTimeFormatUnit, number, number]> = [
    ["minute", MINUTO, 45],
    ["hour", HORA, 22],
    ["day", DIA, 26],
    ["month", MES, 11]
];

const relativo = new Intl.RelativeTimeFormat("es", { numeric: "always" });
// "ahora": lo que moment llamaba "hace unos segundos" (menos de 45 s).
const ahora = new Intl.RelativeTimeFormat("es", { numeric: "auto" }).format(0, "second");

@Pipe({
    name: "LapseOfTime"
})
export class PublicationDatePipe implements PipeTransform {
    transform(publishedDate: number): string {
        if (!Number.isFinite(publishedDate)) {
            return "";
        }

        const diferencia = publishedDate - Date.now();
        const transcurrido = Math.abs(diferencia);
        const sentido = diferencia > 0 ? 1 : -1;

        if (Math.round(transcurrido / SEGUNDO) < 45) {
            return ahora;
        }
        for (const [unidad, duracion, limite] of UMBRALES) {
            const cantidad = Math.round(transcurrido / duracion);
            if (cantidad < limite) {
                return relativo.format(sentido * Math.max(cantidad, 1), unidad);
            }
        }
        return relativo.format(sentido * Math.round(transcurrido / ANYO), "year");
    }
}
