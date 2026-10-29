// Criterios del modelo: interpretaciones del enunciado que se cambian desde el código.
// Cada uno está explicado en el README (sección "Criterios configurables").
import { TIPO_VACUNA, EVENTO } from "../domain/vacunatorio/vocabulario.js";

// Orden en que se sortean las primeras llegadas al inicializar (cada una consume un RND).
export const ORDEN_LLEGADAS_INICIALES = [TIPO_VACUNA.COVID, TIPO_VACUNA.GRIPE];

// Qué se sortea en cada llegada y en qué orden: tiempo hasta la próxima llegada y tamaño del grupo.
// Para invertirlo, cambiar el orden del arreglo. Pendiente de confirmar con la cátedra.
export const RND_EN_LLEGADA = {
  PROXIMA_LLEGADA: "PROXIMA_LLEGADA",
  TAMANIO_GRUPO: "TAMANIO_GRUPO",
};
export const ORDEN_RND_EN_LLEGADA = [
  RND_EN_LLEGADA.PROXIMA_LLEGADA,
  RND_EN_LLEGADA.TAMANIO_GRUPO,
];

// Hasta cuándo se mide la espera de un grupo: inicio de su primer integrante o de su último.
// Solo cambia en los grupos partidos (solo COVID); en los demás ambos criterios dan lo mismo.
export const CRITERIO_ESPERA_OPCIONES = {
  PRIMER_INTEGRANTE: "PRIMER_INTEGRANTE",
  ULTIMO_INTEGRANTE: "ULTIMO_INTEGRANTE",
};
export const CRITERIO_ESPERA = CRITERIO_ESPERA_OPCIONES.PRIMER_INTEGRANTE;

// Prioridad entre eventos del mismo instante: primero el de más arriba.
// La caja vence antes de que un lote que arranca en ese instante pueda usarla.
export const PRIORIDAD_EVENTOS_SIMULTANEOS = [
  EVENTO.VENCIMIENTO_CAJA_GRIPE,
  EVENTO.FIN_VACUNACION,
  EVENTO.LLEGADA_GRUPO_COVID,
  EVENTO.LLEGADA_GRUPO_GRIPE,
];

// Desempate del primer lote: solo decide si, sin lote anterior, se pueden atender ambos tipos a la vez.
// En la práctica decide el primero que llega; esto cubre llegadas simultáneas.
export const TURNO_INICIAL = TIPO_VACUNA.COVID;
