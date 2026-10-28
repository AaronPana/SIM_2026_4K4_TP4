// Valores por defecto del formulario: los del enunciado (en rojo) y los que fijamos nosotros.
// Todos los tiempos se guardan en minutos, salvo la vacunación, que el enunciado da en segundos.
import { MAX_ITERACIONES } from "./constantes.js";

export const PARAMETROS_POR_DEFECTO = {
  // El enunciado no fija X, j ni i: 24 h porque el vacunatorio atiende las 24 horas.
  ejecucion: {
    tiempoSimulacionMinutos: 1440,
    topeIteraciones: MAX_ITERACIONES,
    horaDesdeMinutos: 0,
    cantidadFilas: 100,
    precision: "completa",
  },

  // Generador congruencial mixto del enunciado, compartido por todas las variables aleatorias.
  generador: { semilla: 1234, a: 1714, c: 1221, m: 3922 },

  // COVID: "4 veces cada 15 minutos" (media 15 / 4). Gripe: media de 5 minutos.
  llegadas: {
    covidCantidadLlegadas: 4,
    covidCadaMinutos: 15,
    gripeMediaMinutos: 5,
    personasMaximoPorGrupo: 4,
  },

  // 22 segundos por persona vacunada. El vencimiento ("X hs") no tiene valor en el enunciado: 1 h.
  vacunacion: {
    segundosPorPersona: 22,
    vencimientoCajaGripeMinutos: 60,
  },
};
