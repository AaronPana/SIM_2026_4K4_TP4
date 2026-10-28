// Estado de un objeto (enfermero, caja o grupo) como etiqueta de color.
import {
  ESTADO_ENFERMERO,
  ESTADO_GRUPO,
  ESTADO_CAJA_GRIPE,
} from "../../domain/vacunatorio/vocabulario.js";

// Clase de color por estado: neutro, esperando, vacunando, etc.
const CLASE_POR_ESTADO = {
  [ESTADO_ENFERMERO.LIBRE]: "estado-neutro",
  [ESTADO_ENFERMERO.VACUNANDO_COVID]: "estado-covid",
  [ESTADO_ENFERMERO.VACUNANDO_GRIPE]: "estado-gripe",
  [ESTADO_GRUPO.ESPERANDO]: "estado-esperando",
  [ESTADO_GRUPO.VACUNANDOSE]: "estado-vacunandose",
  [ESTADO_GRUPO.VACUNANDOSE_PARCIAL]: "estado-parcial",
  [ESTADO_GRUPO.ESPERANDO_RESTO]: "estado-resto",
  [ESTADO_CAJA_GRIPE.SIN_CAJA]: "estado-neutro",
  [ESTADO_CAJA_GRIPE.ABIERTA]: "estado-gripe",
};

export default function EstadoChip({ estado }) {
  if (!estado) return "—";
  return (
    <span
      className={`estado-chip ${CLASE_POR_ESTADO[estado] ?? "estado-neutro"}`}
    >
      {estado}
    </span>
  );
}
