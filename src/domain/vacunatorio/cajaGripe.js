// Caja de vacunas contra la gripe: existe mientras está abierta (hasta agotarse o vencer).
import { DOSIS_POR_CAJA_GRIPE } from "../../config/constantes.js";

// Abre una caja nueva. Sus dosis sobrantes vencen "vencimiento" minutos después de abierta.
export function abrirCajaGripe({
  numero,
  horaApertura,
  vencimientoMinutos,
  truncar,
}) {
  return {
    numero,
    dosisRestantes: DOSIS_POR_CAJA_GRIPE,
    horaApertura,
    horaVencimiento: truncar(horaApertura + vencimientoMinutos),
  };
}
