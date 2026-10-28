// Motor de simulación de eventos discretos del vacunatorio.
// Avanza de evento en evento hasta el tiempo X o el tope de iteraciones, lo que ocurra primero.
import {
  ORDEN_LLEGADAS_INICIALES,
  PRIORIDAD_EVENTOS_SIMULTANEOS,
} from "../config/criteriosModelo.js";
import { crearGCM } from "./generadores/congruencialMixto.js";
import {
  TIPO_VACUNA,
  EVENTO,
  EVENTO_LLEGADA,
} from "./vacunatorio/vocabulario.js";
import { crearEnfermero } from "./vacunatorio/enfermero.js";
import {
  crearEstadisticas,
  acumularTiempoTranscurrido,
} from "./estadisticas/acumuladores.js";
import {
  programarProximaLlegada,
  procesarLlegadaGrupo,
} from "./eventos/llegadaGrupo.js";
import { procesarFinVacunacion } from "./eventos/finVacunacion.js";
import { procesarVencimientoCajaGripe } from "./eventos/vencimientoCajaGripe.js";
import { crearNovedades, construirFilaVector } from "./vectorEstado.js";
import { crearTruncador } from "../utils/truncar.js";

// Lo que no cambia durante la corrida: truncado, generador compartido y parámetros ya en minutos.
function prepararContexto(parametros) {
  const { ejecucion, generador, llegadas, vacunacion } = parametros;
  const truncar = crearTruncador(ejecucion.precision);
  const gcm = crearGCM(generador);
  return {
    truncar,
    // Un único generador para todas las variables: cada llamada consume el siguiente RND.
    sortearRnd: () => truncar(gcm.siguiente().rnd),
    mediaEntreLlegadas: {
      [TIPO_VACUNA.COVID]:
        llegadas.covidCadaMinutos / llegadas.covidCantidadLlegadas,
      [TIPO_VACUNA.GRIPE]: llegadas.gripeMediaMinutos,
    },
    personasMaximoPorGrupo: llegadas.personasMaximoPorGrupo,
    segundosPorPersona: vacunacion.segundosPorPersona,
    vencimientoCajaGripeMinutos: vacunacion.vencimientoCajaGripeMinutos,
  };
}

// Estado inicial: enfermero libre, sin caja de gripe abierta y colas vacías.
function crearSistema() {
  return {
    reloj: 0,
    proximaLlegada: { [TIPO_VACUNA.COVID]: null, [TIPO_VACUNA.GRIPE]: null },
    enfermero: crearEnfermero(),
    cajaGripe: null,
    grupos: { [TIPO_VACUNA.COVID]: [], [TIPO_VACUNA.GRIPE]: [] },
    gruposLlegados: { [TIPO_VACUNA.COVID]: 0, [TIPO_VACUNA.GRIPE]: 0 },
    estadisticas: crearEstadisticas(),
  };
}

// Próximo evento: el de menor hora; si hay empate, decide la prioridad configurada.
function proximoEvento(sistema) {
  const candidatos = [
    { evento: EVENTO.LLEGADA_GRUPO_COVID, hora: sistema.proximaLlegada.COVID },
    { evento: EVENTO.LLEGADA_GRUPO_GRIPE, hora: sistema.proximaLlegada.GRIPE },
    { evento: EVENTO.FIN_VACUNACION, hora: sistema.enfermero.finVacunacion },
    {
      evento: EVENTO.VENCIMIENTO_CAJA_GRIPE,
      hora: sistema.cajaGripe?.horaVencimiento ?? null,
    },
  ].filter((c) => c.hora !== null);

  const prioridad = (evento) => PRIORIDAD_EVENTOS_SIMULTANEOS.indexOf(evento);
  candidatos.sort(
    (x, y) => x.hora - y.hora || prioridad(x.evento) - prioridad(y.evento),
  );
  return candidatos[0];
}

// Ejecuta la rutina del evento sobre el sistema.
function procesarEvento(evento, sistema, ctx, novedades) {
  switch (evento) {
    case EVENTO_LLEGADA.COVID:
      return procesarLlegadaGrupo(sistema, TIPO_VACUNA.COVID, ctx, novedades);
    case EVENTO_LLEGADA.GRIPE:
      return procesarLlegadaGrupo(sistema, TIPO_VACUNA.GRIPE, ctx, novedades);
    case EVENTO.FIN_VACUNACION:
      return procesarFinVacunacion(sistema, ctx, novedades);
    case EVENTO.VENCIMIENTO_CAJA_GRIPE:
      return procesarVencimientoCajaGripe(sistema, novedades);
    default:
      return undefined; // Fin de simulación: solo cierra los acumuladores de tiempo.
  }
}

// Máximo de lugares ocupados por tipo en las filas mostradas (columnas de grupos necesarias).
function lugaresNecesarios(filas) {
  // Con reduce y no con Math.max(...): con 100.000 filas el spread excede el límite de argumentos.
  const maximo = (tipo) =>
    filas.reduce(
      (max, f) =>
        f.grupos[tipo].reduce((m, g) => Math.max(m, g.lugar + 1), max),
      0,
    );
  return {
    [TIPO_VACUNA.COVID]: maximo(TIPO_VACUNA.COVID),
    [TIPO_VACUNA.GRIPE]: maximo(TIPO_VACUNA.GRIPE),
  };
}

export function ejecutarSimulacion(parametros) {
  const {
    tiempoSimulacionMinutos,
    topeIteraciones,
    horaDesdeMinutos,
    cantidadFilas,
  } = parametros.ejecucion;
  const ctx = prepararContexto(parametros);
  const sistema = crearSistema();
  const filas = [];

  // Se muestran i filas a partir de la hora j; el resto no se guarda.
  const registrarSiCorresponde = (numeroFila, evento, novedades) => {
    if (sistema.reloj >= horaDesdeMinutos && filas.length < cantidadFilas) {
      filas.push(
        construirFilaVector(
          numeroFila,
          evento,
          sistema,
          novedades,
          ctx.truncar,
        ),
      );
    }
  };

  // Fila 0: se programan las primeras llegadas en el orden configurado.
  let novedades = crearNovedades();
  for (const tipo of ORDEN_LLEGADAS_INICIALES) {
    novedades.llegadas[tipo] = programarProximaLlegada(sistema, tipo, ctx);
  }
  let evento = EVENTO.INICIALIZACION;
  let numeroFila = 0;
  registrarSiCorresponde(numeroFila, evento, novedades);

  while (numeroFila < topeIteraciones) {
    const proximo = proximoEvento(sistema);
    const superaX = proximo.hora > tiempoSimulacionMinutos;
    evento = superaX ? EVENTO.FIN_SIMULACION : proximo.evento;
    const hora = superaX ? tiempoSimulacionMinutos : proximo.hora;

    numeroFila++;
    acumularTiempoTranscurrido(sistema, hora, ctx.truncar);
    sistema.reloj = hora;
    novedades = crearNovedades();
    procesarEvento(evento, sistema, ctx, novedades);
    registrarSiCorresponde(numeroFila, evento, novedades);
    if (evento === EVENTO.FIN_SIMULACION) break;
  }

  // La última fila se muestra siempre, con los grupos presentes al terminar.
  const ultimaIncluida = filas.at(-1)?.fila === numeroFila;
  const ultima = ultimaIncluida
    ? filas.at(-1)
    : construirFilaVector(numeroFila, evento, sistema, novedades, ctx.truncar);

  return {
    filas,
    ultima,
    ultimaIncluida,
    iteraciones: numeroFila,
    relojFinal: sistema.reloj,
    cortePor: evento === EVENTO.FIN_SIMULACION ? "tiempo" : "tope",
    lugares: lugaresNecesarios([...filas, ultima]),
    parametros,
  };
}
