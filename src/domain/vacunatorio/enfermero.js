// Enfermero (servidor permanente): alternancia preferente, armado de lotes y cierre del lote.
import {
  DOSIS_POR_CAJA_COVID,
  MINIMO_PACIENTES_ABRIR_CAJA_COVID,
} from "../../config/constantes.js";
import {
  CRITERIO_ESPERA,
  CRITERIO_ESPERA_OPCIONES,
  TURNO_INICIAL,
} from "../../config/criteriosModelo.js";
import {
  TIPO_VACUNA,
  ESTADO_ENFERMERO,
  ESTADO_VACUNANDO,
  ESTADO_GRUPO,
  MOTIVO_LOTE,
  otroTipo,
} from "./vocabulario.js";
import { personasPendientes } from "./grupos.js";
import { abrirCajaGripe } from "./cajaGripe.js";
import {
  registrarEspera,
  registrarRetiro,
} from "../estadisticas/acumuladores.js";

export function crearEnfermero() {
  return {
    estado: ESTADO_ENFERMERO.LIBRE,
    tipoLote: null,
    personasEnLote: 0,
    composicionLote: [],
    duracionLote: null,
    finVacunacion: null,
    ultimoTipoAplicado: null,
  };
}

// Qué tipo se puede vacunar ahora: COVID necesita el mínimo para abrir caja; gripe, al menos uno.
function tiposVacunables(grupos) {
  return {
    [TIPO_VACUNA.COVID]:
      personasPendientes(grupos.COVID) >= MINIMO_PACIENTES_ABRIR_CAJA_COVID,
    [TIPO_VACUNA.GRIPE]: personasPendientes(grupos.GRIPE) > 0,
  };
}

// Alternancia preferente: le toca el tipo contrario al último lote; si no se puede, atiende el otro.
// Devuelve { tipo, motivo } o null si no puede vacunar a nadie (queda libre).
export function elegirProximoLote(ultimoTipoAplicado, grupos) {
  const vacunable = tiposVacunables(grupos);

  if (ultimoTipoAplicado === null) {
    const tipo = vacunable[TURNO_INICIAL]
      ? TURNO_INICIAL
      : otroTipo(TURNO_INICIAL);
    return vacunable[tipo] ? { tipo, motivo: MOTIVO_LOTE.PRIMER_LOTE } : null;
  }

  const turno = otroTipo(ultimoTipoAplicado);
  if (vacunable[turno]) {
    const motivo =
      turno === TIPO_VACUNA.COVID
        ? MOTIVO_LOTE.TURNO_COVID
        : MOTIVO_LOTE.TURNO_GRIPE;
    return { tipo: turno, motivo };
  }
  if (vacunable[ultimoTipoAplicado]) {
    const motivo =
      turno === TIPO_VACUNA.COVID
        ? MOTIVO_LOTE.COVID_SIN_MINIMO
        : MOTIVO_LOTE.SIN_GRIPE;
    return { tipo: ultimoTipoAplicado, motivo };
  }
  return null;
}

// Toma personas en orden de llegada de los grupos hasta llenar la capacidad del lote.
// En COVID un grupo que no entra completo queda "Vacunándose parcial"; en gripe la capacidad es un grupo entero.
function armarLote(gruposDelTipo, capacidad, hora, estadisticas, truncar) {
  const composicion = [];
  let lugaresLibres = capacidad;
  for (const grupo of gruposDelTipo) {
    if (lugaresLibres === 0) break;
    if (grupo.pendientes === 0) continue;

    const personas = Math.min(grupo.pendientes, lugaresLibres);
    const esSuPrimerLote = grupo.horaInicioVacunacion === null;
    if (esSuPrimerLote) grupo.horaInicioVacunacion = hora;
    grupo.pendientes -= personas;
    grupo.enLote = personas;
    grupo.estado =
      grupo.pendientes === 0
        ? ESTADO_GRUPO.VACUNANDOSE
        : ESTADO_GRUPO.VACUNANDOSE_PARCIAL;
    lugaresLibres -= personas;
    composicion.push({ grupo: grupo.id, personas });

    // La espera se registra según el criterio configurado (primer o último integrante).
    const terminaSuEspera =
      CRITERIO_ESPERA === CRITERIO_ESPERA_OPCIONES.PRIMER_INTEGRANTE
        ? esSuPrimerLote
        : grupo.pendientes === 0;
    if (terminaSuEspera) {
      registrarEspera(
        estadisticas,
        grupo.tipo,
        truncar(hora - grupo.horaLlegada),
        truncar,
      );
    }
  }
  return composicion;
}

// Cajas de gripe a demanda: usa lo que queda de la abierta y, si no alcanza, abre otra al atender al grupo.
// Una caja que llega a 0 se agota y su vencimiento se cancela.
function usarDosisGripe(sistema, ctx, personas, novedades) {
  const { estadisticas, reloj } = sistema;
  let faltan = personas;
  while (faltan > 0) {
    if (sistema.cajaGripe === null) {
      estadisticas.cajasGripeAbiertas++;
      sistema.cajaGripe = abrirCajaGripe({
        numero: estadisticas.cajasGripeAbiertas,
        horaApertura: reloj,
        vencimientoMinutos: ctx.vencimientoCajaGripeMinutos,
        truncar: ctx.truncar,
      });
      novedades.caja.push(`Abre caja ${sistema.cajaGripe.numero}`);
    }
    const usadas = Math.min(faltan, sistema.cajaGripe.dosisRestantes);
    sistema.cajaGripe.dosisRestantes -= usadas;
    faltan -= usadas;
    if (sistema.cajaGripe.dosisRestantes === 0) {
      novedades.caja.push(`Caja ${sistema.cajaGripe.numero} agotada`);
      sistema.cajaGripe = null;
    }
  }
}

// Si el enfermero está libre y puede vacunar a alguien, arranca el próximo lote.
// Anota en "novedades" el motivo del lote y lo que pasó con la caja de gripe.
export function intentarIniciarLote(sistema, ctx, novedades) {
  const { enfermero, grupos, estadisticas, reloj } = sistema;
  if (enfermero.estado !== ESTADO_ENFERMERO.LIBRE) return;

  const decision = elegirProximoLote(enfermero.ultimoTipoAplicado, grupos);
  if (!decision) return;
  const { tipo, motivo } = decision;

  // COVID: una caja de 5 por lote (puede partir grupos). Gripe: el lote es el primer grupo de la cola, completo.
  let capacidad;
  if (tipo === TIPO_VACUNA.COVID) {
    capacidad = DOSIS_POR_CAJA_COVID;
    estadisticas.cajasCovidAbiertas++;
  } else {
    capacidad = grupos.GRIPE.find((g) => g.pendientes > 0).pendientes;
  }

  const composicion = armarLote(
    grupos[tipo],
    capacidad,
    reloj,
    estadisticas,
    ctx.truncar,
  );
  const personas = composicion.reduce(
    (total, parte) => total + parte.personas,
    0,
  );

  // Las dosis se consideran usadas al iniciar el lote.
  if (tipo === TIPO_VACUNA.COVID) {
    estadisticas.dosisCovidAplicadas += personas;
  } else {
    usarDosisGripe(sistema, ctx, personas, novedades);
    estadisticas.dosisGripeAplicadas += personas;
  }

  // 22 · N segundos, pasado a minutos (unidad del reloj).
  const duracionLote = ctx.truncar((personas * ctx.segundosPorPersona) / 60);
  Object.assign(enfermero, {
    estado: ESTADO_VACUNANDO[tipo],
    tipoLote: tipo,
    personasEnLote: personas,
    composicionLote: composicion,
    duracionLote,
    finVacunacion: ctx.truncar(reloj + duracionLote),
    ultimoTipoAplicado: tipo,
  });
  novedades.motivoLote = motivo;
}

// Al terminar el lote: los grupos sin pendientes se retiran; los partidos (solo COVID) pasan a "Esperando resto".
export function cerrarLote(sistema, ctx) {
  const { enfermero, grupos, estadisticas, reloj } = sistema;
  const tipo = enfermero.tipoLote;

  for (const grupo of grupos[tipo]) {
    if (grupo.enLote === 0) continue;
    grupo.vacunados += grupo.enLote;
    grupo.enLote = 0;
    if (grupo.pendientes === 0) {
      registrarRetiro(
        estadisticas,
        tipo,
        ctx.truncar(reloj - grupo.horaLlegada),
        ctx.truncar,
      );
    } else {
      grupo.estado = ESTADO_GRUPO.ESPERANDO_RESTO;
    }
  }
  // Los grupos completos dejan de existir en el sistema.
  grupos[tipo] = grupos[tipo].filter((g) => g.pendientes > 0 || g.enLote > 0);

  Object.assign(enfermero, {
    estado: ESTADO_ENFERMERO.LIBRE,
    tipoLote: null,
    personasEnLote: 0,
    composicionLote: [],
    duracionLote: null,
    finVacunacion: null,
  });
}
