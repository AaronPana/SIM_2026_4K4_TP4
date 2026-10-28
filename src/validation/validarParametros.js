// Valida el formulario y convierte los valores a número. Devuelve { errores, params, esValido }.
// Los errores se guardan con el mismo parámetro del campo ("llegadas.gripeMediaMinutos").
import {
  MAX_ITERACIONES,
  PERSONAS_MINIMO_POR_GRUPO,
} from "../config/constantes.js";

// Convierte lo escrito en el input a número; vacío o inválido → NaN.
const aNumero = (v) =>
  v === "" || v === null || v === undefined ? NaN : Number(v);

// Crea el acumulador de errores y el validador numérico reutilizable.
function crearValidador() {
  const errores = {};
  const error = (parametro, msg) => {
    if (!errores[parametro]) errores[parametro] = msg;
  };

  // Valida un número con reglas simples; devuelve el número (o NaN si falla).
  const numero = (
    parametro,
    valor,
    { entero = false, min, max, minExclusivo } = {},
  ) => {
    const n = aNumero(valor);
    if (Number.isNaN(n)) return (error(parametro, "Requerido"), NaN);
    if (entero && !Number.isInteger(n))
      return (error(parametro, "Debe ser entero"), n);
    if (min !== undefined && n < min)
      return (error(parametro, `Mínimo ${min.toLocaleString("es-AR")}`), n);
    if (max !== undefined && n > max)
      return (error(parametro, `Máximo ${max.toLocaleString("es-AR")}`), n);
    if (minExclusivo !== undefined && n <= minExclusivo)
      return (error(parametro, `Debe ser mayor a ${minExclusivo}`), n);
    return n;
  };

  return { errores, error, numero };
}

// Ejecución: tiempo X, tope de iteraciones, hora j, cantidad de filas i y precisión.
function validarEjecucion(raw, v) {
  const e = "ejecucion";
  const tiempoSimulacionMinutos = v.numero(
    `${e}.tiempoSimulacionMinutos`,
    raw.tiempoSimulacionMinutos,
    {
      minExclusivo: 0,
    },
  );
  const topeIteraciones = v.numero(
    `${e}.topeIteraciones`,
    raw.topeIteraciones,
    {
      entero: true,
      min: 1,
      max: MAX_ITERACIONES,
    },
  );
  const horaDesdeMinutos = v.numero(
    `${e}.horaDesdeMinutos`,
    raw.horaDesdeMinutos,
    { min: 0 },
  );
  const cantidadFilas = v.numero(`${e}.cantidadFilas`, raw.cantidadFilas, {
    entero: true,
    min: 1,
    max: MAX_ITERACIONES,
  });

  if (horaDesdeMinutos > tiempoSimulacionMinutos)
    v.error(`${e}.horaDesdeMinutos`, "No puede superar el tiempo a simular");

  const precision =
    raw.precision === "completa" ? "completa" : Number(raw.precision);
  return {
    tiempoSimulacionMinutos,
    topeIteraciones,
    horaDesdeMinutos,
    cantidadFilas,
    precision,
  };
}

// Generador: enteros, semilla menor que m y a·(m−1)+c dentro de la precisión entera de JavaScript.
function validarGenerador(raw, v) {
  const g = "generador";
  const m = v.numero(`${g}.m`, raw.m, { entero: true, min: 2 });
  const a = v.numero(`${g}.a`, raw.a, { entero: true, min: 1 });
  const c = v.numero(`${g}.c`, raw.c, { entero: true, min: 0 });
  const semilla = v.numero(`${g}.semilla`, raw.semilla, {
    entero: true,
    min: 0,
  });

  if (semilla >= m) v.error(`${g}.semilla`, "Debe ser menor que m");
  if (a * (m - 1) + c > Number.MAX_SAFE_INTEGER)
    v.error(`${g}.a`, "a·(m−1)+c excede la precisión entera de JavaScript");
  return { semilla, a, c, m };
}

// Llegadas: tasas positivas y máximo de personas por grupo entero desde el mínimo fijo.
function validarLlegadas(raw, v) {
  const l = "llegadas";
  return {
    covidCantidadLlegadas: v.numero(
      `${l}.covidCantidadLlegadas`,
      raw.covidCantidadLlegadas,
      {
        minExclusivo: 0,
      },
    ),
    covidCadaMinutos: v.numero(`${l}.covidCadaMinutos`, raw.covidCadaMinutos, {
      minExclusivo: 0,
    }),
    gripeMediaMinutos: v.numero(
      `${l}.gripeMediaMinutos`,
      raw.gripeMediaMinutos,
      { minExclusivo: 0 },
    ),
    personasMaximoPorGrupo: v.numero(
      `${l}.personasMaximoPorGrupo`,
      raw.personasMaximoPorGrupo,
      {
        entero: true,
        min: PERSONAS_MINIMO_POR_GRUPO,
      },
    ),
  };
}

// Vacunación: segundos por persona y vencimiento de la caja de gripe, ambos positivos.
function validarVacunacion(raw, v) {
  const p = "vacunacion";
  return {
    segundosPorPersona: v.numero(
      `${p}.segundosPorPersona`,
      raw.segundosPorPersona,
      { minExclusivo: 0 },
    ),
    vencimientoCajaGripeMinutos: v.numero(
      `${p}.vencimientoCajaGripeMinutos`,
      raw.vencimientoCajaGripeMinutos,
      { minExclusivo: 0 },
    ),
  };
}

export function validarParametros(raw) {
  const v = crearValidador();
  const params = {
    ejecucion: validarEjecucion(raw.ejecucion, v),
    generador: validarGenerador(raw.generador, v),
    llegadas: validarLlegadas(raw.llegadas, v),
    vacunacion: validarVacunacion(raw.vacunacion, v),
  };
  const esValido = Object.keys(v.errores).length === 0;
  return { errores: v.errores, esValido, params: esValido ? params : null };
}
