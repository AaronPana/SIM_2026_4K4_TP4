// Estado inicial: en qué situación está el vacunatorio cuando arranca la simulación.
// Con activo: false arranca vacío (recién abierto). El reloj 0 es el inicio de la simulación:
// lo que pasó antes tiene horas negativas (un grupo que llegó hace 6 min tiene horaLlegada -6).
import { TIPO_VACUNA } from "../domain/vacunatorio/vocabulario.js";

export const ESTADO_INICIAL = {
  activo: false,

  // Próximas llegadas ya programadas (minutos, > 0). Con null se sortean como siempre.
  proximaLlegada: { [TIPO_VACUNA.COVID]: 2.5, [TIPO_VACUNA.GRIPE]: null },

  // El lote en curso se deduce de los grupos con "enLote" > 0. Si hay lote, finVacunacion es obligatorio.
  // ultimoTipoAplicado solo se usa si el enfermero arranca libre (decide a quién le toca).
  enfermero: { finVacunacion: 0.9, ultimoTipoAplicado: TIPO_VACUNA.GRIPE },

  // Caja de gripe ya abierta (se muestra como "caja 0"). null si no hay ninguna abierta.
  cajaGripe: { dosisRestantes: 4, horaApertura: -25, horaVencimiento: 35 },

  // Grupos presentes, en orden de llegada. vacunados + enLote + pendientes = tamanio.
  grupos: {
    [TIPO_VACUNA.COVID]: [
      { tamanio: 3, vacunados: 0, enLote: 0, pendientes: 3, horaLlegada: -6.2 },
      { tamanio: 2, vacunados: 0, enLote: 0, pendientes: 2, horaLlegada: -1.4 },
    ],
    [TIPO_VACUNA.GRIPE]: [
      { tamanio: 4, vacunados: 0, enLote: 4, pendientes: 0, horaLlegada: -2 },
    ],
  },
};
