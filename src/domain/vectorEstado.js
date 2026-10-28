// Arma la "foto" de una fila del vector de estado a partir del sistema y de lo que pasó en el evento.
// Solo se llama para las filas que se muestran y para la última: el resto no se guarda.
import {
  TIPO_VACUNA,
  NOMBRE_EVENTO,
  ESTADO_CAJA_GRIPE,
} from "./vacunatorio/vocabulario.js";
import { personasPendientes, gruposEnCola } from "./vacunatorio/grupos.js";
import { promedio } from "./estadisticas/acumuladores.js";

// Lo que se anota durante un evento y solo aparece en su fila (RND sorteados, motivo, novedades de caja).
export function crearNovedades() {
  return {
    llegadas: { [TIPO_VACUNA.COVID]: null, [TIPO_VACUNA.GRIPE]: null },
    motivoLote: null,
    caja: [],
  };
}

// Texto de la composición del lote: "COV-4 ×2 + COV-5 ×3".
const textoComposicion = (composicion) =>
  composicion.length
    ? composicion.map((p) => `${p.grupo} ×${p.personas}`).join(" + ")
    : null;

// Copia de los grupos presentes de un tipo, para que la fila no cambie cuando el sistema avance.
const copiarGrupos = (grupos) =>
  grupos.map(
    ({
      id,
      estado,
      tamanio,
      vacunados,
      enLote,
      pendientes,
      horaLlegada,
      lugar,
    }) => ({
      id,
      estado,
      tamanio,
      vacunados,
      enLote,
      pendientes,
      horaLlegada,
      lugar,
    }),
  );

// Valor por tipo calculado con una función.
const porTipo = (calcular) => ({
  [TIPO_VACUNA.COVID]: calcular(TIPO_VACUNA.COVID),
  [TIPO_VACUNA.GRIPE]: calcular(TIPO_VACUNA.GRIPE),
});

export function construirFilaVector(
  numeroFila,
  evento,
  sistema,
  novedades,
  truncar,
) {
  const { enfermero, cajaGripe, grupos, estadisticas: e } = sistema;
  return {
    fila: numeroFila,
    evento,
    nombreEvento: NOMBRE_EVENTO[evento],
    reloj: sistema.reloj,

    // Llegadas: lo sorteado en este evento (si hubo) y la próxima llegada programada.
    llegadas: porTipo((tipo) => ({
      ...(novedades.llegadas[tipo] ?? {}),
      proximaLlegada: sistema.proximaLlegada[tipo],
    })),

    enfermero: {
      estado: enfermero.estado,
      motivoLote: novedades.motivoLote,
      composicionLote: textoComposicion(enfermero.composicionLote),
      personasEnLote: enfermero.personasEnLote || null,
      duracionLote: enfermero.duracionLote,
      finVacunacion: enfermero.finVacunacion,
      ultimoTipoAplicado: enfermero.ultimoTipoAplicado,
    },

    cajaGripe: {
      estado: cajaGripe
        ? ESTADO_CAJA_GRIPE.ABIERTA
        : ESTADO_CAJA_GRIPE.SIN_CAJA,
      numero: cajaGripe?.numero ?? null,
      dosisRestantes: cajaGripe?.dosisRestantes ?? null,
      horaApertura: cajaGripe?.horaApertura ?? null,
      horaVencimiento: cajaGripe?.horaVencimiento ?? null,
      novedad: novedades.caja.length ? novedades.caja.join(" · ") : null,
    },

    colas: {
      personas: porTipo((tipo) => personasPendientes(grupos[tipo])),
      grupos: porTipo((tipo) => gruposEnCola(grupos[tipo])),
    },

    estadisticas: {
      cajasGripeAbiertas: e.cajasGripeAbiertas,
      dosisGripeAplicadas: e.dosisGripeAplicadas,
      dosisGripeDescartadas: e.dosisGripeDescartadas,
      cajasCovidAbiertas: e.cajasCovidAbiertas,
      dosisCovidAplicadas: e.dosisCovidAplicadas,
      esperaAcumulada: { ...e.esperaAcumulada },
      gruposConEspera: { ...e.gruposConEspera },
      esperaPromedio: porTipo((t) =>
        promedio(e.esperaAcumulada[t], e.gruposConEspera[t], truncar),
      ),
      esperaMaxima: { ...e.esperaMaxima },
      permanenciaAcumulada: { ...e.permanenciaAcumulada },
      gruposRetirados: { ...e.gruposRetirados },
      tiempoOcupadoEnfermero: e.tiempoOcupadoEnfermero,
      areaPersonasEnCola: { ...e.areaPersonasEnCola },
    },

    grupos: porTipo((tipo) => copiarGrupos(grupos[tipo])),
  };
}
