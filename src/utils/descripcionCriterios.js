// Textos legibles de los criterios del modelo. Los usan el simulador, las slides y el Excel,
// así un cambio en config/criteriosModelo.js se refleja en todos lados sin editar textos.
import {
  ORDEN_LLEGADAS_INICIALES,
  ORDEN_RND_EN_LLEGADA,
  RND_EN_LLEGADA,
  CRITERIO_ESPERA,
  CRITERIO_ESPERA_OPCIONES,
  PRIORIDAD_EVENTOS_SIMULTANEOS,
  TURNO_INICIAL,
} from "../config/criteriosModelo.js";
import {
  NOMBRE_VACUNA,
  NOMBRE_EVENTO,
} from "../domain/vacunatorio/vocabulario.js";

const NOMBRE_RND = {
  [RND_EN_LLEGADA.PROXIMA_LLEGADA]: "próxima llegada",
  [RND_EN_LLEGADA.TAMANIO_GRUPO]: "personas del grupo",
};

// "COVID → gripe"
export const TEXTO_ORDEN_LLEGADAS_INICIALES = ORDEN_LLEGADAS_INICIALES.map(
  (t) => NOMBRE_VACUNA[t],
).join(" → ");

// "próxima llegada → personas del grupo"
export const TEXTO_ORDEN_RND_EN_LLEGADA = ORDEN_RND_EN_LLEGADA.map(
  (r) => NOMBRE_RND[r],
).join(" → ");

// "primer integrante" o "último integrante"
export const TEXTO_INTEGRANTE_ESPERA =
  CRITERIO_ESPERA === CRITERIO_ESPERA_OPCIONES.PRIMER_INTEGRANTE
    ? "primer integrante"
    : "último integrante";

// La opción que no se está usando (para avisar que existe).
export const TEXTO_INTEGRANTE_ESPERA_ALTERNATIVO =
  CRITERIO_ESPERA === CRITERIO_ESPERA_OPCIONES.PRIMER_INTEGRANTE
    ? "último"
    : "primer";

// "Vencimiento caja gripe > Fin de vacunación > …"
export const TEXTO_PRIORIDAD_EVENTOS = PRIORIDAD_EVENTOS_SIMULTANEOS.map(
  (e) => NOMBRE_EVENTO[e],
).join(" > ");

export const TEXTO_TURNO_INICIAL = NOMBRE_VACUNA[TURNO_INICIAL];

// Lista para mostrar en el simulador y exportar al Excel.
export const CRITERIOS_DEL_MODELO = [
  {
    criterio: "Orden de las primeras llegadas",
    valor: TEXTO_ORDEN_LLEGADAS_INICIALES,
    detalle: "Qué llegada consume primero un RND al inicializar.",
  },
  {
    criterio: "Orden de los RND en cada llegada",
    valor: TEXTO_ORDEN_RND_EN_LLEGADA,
    detalle: "Qué se sortea primero cuando llega un grupo.",
  },
  {
    criterio: "Espera de un grupo",
    valor: `Hasta que empieza a vacunarse el ${TEXTO_INTEGRANTE_ESPERA}`,
    detalle: "Solo cambia el resultado en los grupos partidos.",
  },
  {
    criterio: "Prioridad de eventos simultáneos",
    valor: TEXTO_PRIORIDAD_EVENTOS,
    detalle:
      "Si dos eventos ocurren en el mismo instante, va primero el de la izquierda.",
  },
  {
    criterio: "Desempate del primer lote",
    valor: TEXTO_TURNO_INICIAL,
    detalle:
      "Solo actúa si, sin lote anterior, se pueden atender ambos tipos a la vez.",
  },
];
