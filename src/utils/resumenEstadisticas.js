// Resumen final de estadísticas a partir de la última fila. Lo usan el panel de resultados y el Excel.
import { DOSIS_POR_CAJA_GRIPE } from "../config/constantes.js";
import {
  TIPO_VACUNA,
  NOMBRE_VACUNA,
} from "../domain/vacunatorio/vocabulario.js";
import { crearTruncador } from "./truncar.js";

export function resumenEstadisticas(resultado) {
  const { ultima, relojFinal, parametros } = resultado;
  const truncar = crearTruncador(parametros.ejecucion.precision);
  const e = ultima.estadisticas;
  const dividir = (a, b) => (b > 0 ? truncar(a / b) : null);
  const tipos = Object.values(TIPO_VACUNA);

  // Lo que pregunta el enunciado (incluye el desglose de dosis acordado).
  const pedidas = [
    {
      etiqueta: "Cajas de gripe abiertas (colocadas)",
      valor: e.cajasGripeAbiertas,
      tipo: "entero",
      unidad: "cajas",
    },
    {
      etiqueta: "Dosis de gripe aplicadas",
      valor: e.dosisGripeAplicadas,
      tipo: "entero",
      unidad: "dosis",
    },
    {
      etiqueta: "Dosis de gripe descartadas por vencimiento",
      valor: e.dosisGripeDescartadas,
      tipo: "entero",
      unidad: "dosis",
    },
    {
      etiqueta: "Dosis de gripe sin usar al final (caja abierta sin vencer)",
      valor: ultima.cajaGripe.dosisRestantes ?? 0,
      tipo: "entero",
      unidad: "dosis",
    },
    ...tipos.map((t) => ({
      etiqueta: `Espera promedio de los grupos de ${NOMBRE_VACUNA[t]}`,
      valor: e.esperaPromedio[t],
      tipo: "decimal",
      unidad: "min",
    })),
  ];

  // Las adicionales que elegimos (a, c, d, e, g, h).
  const adicionales = [
    {
      etiqueta: "Ocupación del enfermero",
      valor: dividir(e.tiempoOcupadoEnfermero, relojFinal),
      tipo: "proporcion",
    },
    ...tipos.map((t) => ({
      etiqueta: `Espera máxima ${NOMBRE_VACUNA[t]}`,
      valor: e.esperaMaxima[t],
      tipo: "decimal",
      unidad: "min",
    })),
    ...tipos.map((t) => ({
      etiqueta: `Personas promedio en cola ${NOMBRE_VACUNA[t]}`,
      valor: dividir(e.areaPersonasEnCola[t], relojFinal),
      tipo: "decimal",
      unidad: "personas",
    })),
    ...tipos.map((t) => ({
      etiqueta: `Permanencia promedio ${NOMBRE_VACUNA[t]}`,
      valor: dividir(e.permanenciaAcumulada[t], e.gruposRetirados[t]),
      tipo: "decimal",
      unidad: "min",
    })),
    {
      etiqueta: "Cajas de COVID abiertas",
      valor: e.cajasCovidAbiertas,
      tipo: "entero",
      unidad: "cajas",
    },
    {
      etiqueta: "Dosis de COVID aplicadas",
      valor: e.dosisCovidAplicadas,
      tipo: "entero",
      unidad: "dosis",
    },
    {
      etiqueta: "Dosis de gripe descartadas sobre las abiertas",
      valor: dividir(
        e.dosisGripeDescartadas,
        e.cajasGripeAbiertas * DOSIS_POR_CAJA_GRIPE,
      ),
      tipo: "proporcion",
    },
  ];

  return { pedidas, adicionales };
}
