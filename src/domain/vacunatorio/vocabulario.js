// Vocabulario del dominio: tipos de vacuna, eventos, estados y motivos.
// Lo comparten el motor, la interfaz, las slides y el Excel para nombrar todo igual.
import { MINIMO_PACIENTES_ABRIR_CAJA_COVID } from "../../config/constantes.js";

export const TIPO_VACUNA = { COVID: "COVID", GRIPE: "GRIPE" };

// Nombre visible y prefijo del identificador de grupo (COV-4 = cuarto grupo de COVID).
export const NOMBRE_VACUNA = { COVID: "COVID", GRIPE: "gripe" };
export const PREFIJO_GRUPO = { COVID: "COV", GRIPE: "GRI" };

// El otro tipo de vacuna (para alternar).
export const otroTipo = (tipo) =>
  tipo === TIPO_VACUNA.COVID ? TIPO_VACUNA.GRIPE : TIPO_VACUNA.COVID;

export const EVENTO = {
  INICIALIZACION: "INICIALIZACION",
  LLEGADA_GRUPO_COVID: "LLEGADA_GRUPO_COVID",
  LLEGADA_GRUPO_GRIPE: "LLEGADA_GRUPO_GRIPE",
  FIN_VACUNACION: "FIN_VACUNACION",
  VENCIMIENTO_CAJA_GRIPE: "VENCIMIENTO_CAJA_GRIPE",
  FIN_SIMULACION: "FIN_SIMULACION",
};

export const NOMBRE_EVENTO = {
  [EVENTO.INICIALIZACION]: "Inicialización",
  [EVENTO.LLEGADA_GRUPO_COVID]: "Llegada grupo COVID",
  [EVENTO.LLEGADA_GRUPO_GRIPE]: "Llegada grupo gripe",
  [EVENTO.FIN_VACUNACION]: "Fin de vacunación",
  [EVENTO.VENCIMIENTO_CAJA_GRIPE]: "Vencimiento caja gripe",
  [EVENTO.FIN_SIMULACION]: "Fin de simulación",
};

// Evento de llegada que corresponde a cada tipo de vacuna.
export const EVENTO_LLEGADA = {
  COVID: EVENTO.LLEGADA_GRUPO_COVID,
  GRIPE: EVENTO.LLEGADA_GRUPO_GRIPE,
};

export const ESTADO_ENFERMERO = {
  LIBRE: "Libre",
  VACUNANDO_COVID: "Vacunando COVID",
  VACUNANDO_GRIPE: "Vacunando gripe",
};

// Estado del enfermero mientras vacuna cada tipo.
export const ESTADO_VACUNANDO = {
  COVID: ESTADO_ENFERMERO.VACUNANDO_COVID,
  GRIPE: ESTADO_ENFERMERO.VACUNANDO_GRIPE,
};

// Estados de un grupo. "Parcial" y "resto" solo aparecen en COVID, cuando el lote de 5 no alcanza para todo el grupo.
export const ESTADO_GRUPO = {
  ESPERANDO: "Esperando",
  VACUNANDOSE: "Vacunándose",
  VACUNANDOSE_PARCIAL: "Vacunándose parcial",
  ESPERANDO_RESTO: "Esperando resto",
};

export const DESCRIPCION_ESTADO_GRUPO = {
  [ESTADO_GRUPO.ESPERANDO]: "Nadie del grupo empezó a vacunarse.",
  [ESTADO_GRUPO.VACUNANDOSE]:
    "Todos sus pendientes están en el lote actual; se retira al terminar.",
  [ESTADO_GRUPO.VACUNANDOSE_PARCIAL]:
    "Solo COVID: una parte está en el lote de 5; el resto no entró.",
  [ESTADO_GRUPO.ESPERANDO_RESTO]:
    "Solo COVID: ya se vacunó una parte; espera el próximo lote para el resto.",
};

export const ESTADO_CAJA_GRIPE = { SIN_CAJA: "Sin caja", ABIERTA: "Abierta" };

// Por qué el enfermero arrancó un lote (muestra la alternancia preferente).
export const MOTIVO_LOTE = {
  PRIMER_LOTE: "Primer lote",
  TURNO_COVID: "Turno COVID",
  TURNO_GRIPE: "Turno gripe",
  COVID_SIN_MINIMO: `COVID sin ${MINIMO_PACIENTES_ABRIR_CAJA_COVID} → gripe`,
  SIN_GRIPE: "Sin gripe → COVID",
};

export const DESCRIPCION_MOTIVO_LOTE = {
  [MOTIVO_LOTE.PRIMER_LOTE]:
    "No había lote anterior: atiende al primer tipo que se puede vacunar.",
  [MOTIVO_LOTE.TURNO_COVID]: `Le tocaba COVID y había al menos ${MINIMO_PACIENTES_ABRIR_CAJA_COVID} pendientes.`,
  [MOTIVO_LOTE.TURNO_GRIPE]: "Le tocaba gripe y había pacientes de gripe.",
  [MOTIVO_LOTE.COVID_SIN_MINIMO]: `Le tocaba COVID pero había menos de ${MINIMO_PACIENTES_ABRIR_CAJA_COVID}: atiende gripe.`,
  [MOTIVO_LOTE.SIN_GRIPE]:
    "Le tocaba gripe pero no había nadie: atiende COVID.",
};
