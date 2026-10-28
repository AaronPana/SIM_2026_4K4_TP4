// Evento fin de vacunación: termina el lote en curso y el enfermero decide si arranca otro.
import { cerrarLote, intentarIniciarLote } from "../vacunatorio/enfermero.js";

export function procesarFinVacunacion(sistema, ctx, novedades) {
  cerrarLote(sistema, ctx);
  intentarIniciarLote(sistema, ctx, novedades);
}
