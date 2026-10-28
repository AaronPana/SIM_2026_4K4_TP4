// Grupos de pacientes (clientes temporales): creación, lugar en el vector y personas pendientes.
import { ESTADO_GRUPO, PREFIJO_GRUPO } from "./vocabulario.js";

// Crea un grupo recién llegado. vacunados + enLote + pendientes = tamaño en todo momento.
export function crearGrupo({ tipo, numero, tamanio, horaLlegada, lugar }) {
  return {
    id: `${PREFIJO_GRUPO[tipo]}-${numero}`,
    tipo,
    numero,
    tamanio,
    vacunados: 0,
    enLote: 0,
    pendientes: tamanio,
    horaLlegada,
    horaInicioVacunacion: null,
    lugar,
    estado: ESTADO_GRUPO.ESPERANDO,
  };
}

// Primer lugar libre del vector para un tipo. El grupo lo conserva hasta retirarse.
export function primerLugarLibre(gruposDelTipo) {
  const ocupados = new Set(gruposDelTipo.map((g) => g.lugar));
  let lugar = 0;
  while (ocupados.has(lugar)) lugar++;
  return lugar;
}

// Personas en cola de un tipo: las que todavía no empezaron a vacunarse.
export function personasPendientes(gruposDelTipo) {
  return gruposDelTipo.reduce((total, g) => total + g.pendientes, 0);
}

// Grupos de un tipo que tienen al menos una persona esperando.
export function gruposEnCola(gruposDelTipo) {
  return gruposDelTipo.filter((g) => g.pendientes > 0).length;
}
