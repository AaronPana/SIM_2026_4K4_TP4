// Contadores y acumuladores del vector de estado. Se actualizan en cada evento, sin guardar filas pasadas.
import { TIPO_VACUNA, ESTADO_ENFERMERO } from "../vacunatorio/vocabulario.js";
import { personasPendientes } from "../vacunatorio/grupos.js";

// Un valor por tipo de vacuna.
const porTipo = (valor) => ({
  [TIPO_VACUNA.COVID]: valor,
  [TIPO_VACUNA.GRIPE]: valor,
});

export function crearEstadisticas() {
  return {
    cajasGripeAbiertas: 0,
    dosisGripeAplicadas: 0,
    dosisGripeDescartadas: 0,
    cajasCovidAbiertas: 0,
    dosisCovidAplicadas: 0,
    esperaAcumulada: porTipo(0),
    gruposConEspera: porTipo(0),
    esperaMaxima: porTipo(null),
    permanenciaAcumulada: porTipo(0),
    gruposRetirados: porTipo(0),
    tiempoOcupadoEnfermero: 0,
    // Área bajo la curva de personas en cola: Σ (personas en cola · Δt).
    areaPersonasEnCola: porTipo(0),
  };
}

// Espera de un grupo: desde que llega hasta que empieza a vacunarse (según el criterio configurado).
export function registrarEspera(estadisticas, tipo, espera, truncar) {
  estadisticas.esperaAcumulada[tipo] = truncar(
    estadisticas.esperaAcumulada[tipo] + espera,
  );
  estadisticas.gruposConEspera[tipo]++;
  const maxima = estadisticas.esperaMaxima[tipo];
  estadisticas.esperaMaxima[tipo] =
    maxima === null ? espera : Math.max(maxima, espera);
}

// Permanencia de un grupo: desde que llega hasta que se retira con todos sus integrantes vacunados.
export function registrarRetiro(estadisticas, tipo, permanencia, truncar) {
  estadisticas.permanenciaAcumulada[tipo] = truncar(
    estadisticas.permanenciaAcumulada[tipo] + permanencia,
  );
  estadisticas.gruposRetirados[tipo]++;
}

// Antes de avanzar el reloj: suma el tiempo ocupado y el área de las colas del intervalo transcurrido.
export function acumularTiempoTranscurrido(sistema, horaEvento, truncar) {
  const { estadisticas, enfermero, grupos } = sistema;
  const delta = truncar(horaEvento - sistema.reloj);
  if (delta <= 0) return;
  if (enfermero.estado !== ESTADO_ENFERMERO.LIBRE) {
    estadisticas.tiempoOcupadoEnfermero = truncar(
      estadisticas.tiempoOcupadoEnfermero + delta,
    );
  }
  for (const tipo of Object.values(TIPO_VACUNA)) {
    const area = personasPendientes(grupos[tipo]) * delta;
    estadisticas.areaPersonasEnCola[tipo] = truncar(
      estadisticas.areaPersonasEnCola[tipo] + area,
    );
  }
}

// Promedio que se muestra en cada fila (null mientras no haya datos).
export const promedio = (acumulado, cantidad, truncar) =>
  cantidad > 0 ? truncar(acumulado / cantidad) : null;
