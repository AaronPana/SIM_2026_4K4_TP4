// Estado del formulario de parámetros + validación en vivo.
import { useMemo, useState, useCallback } from "react";
import { PARAMETROS_POR_DEFECTO } from "../config/parametrosPorDefecto.js";
import { validarParametros } from "../validation/validarParametros.js";

const copiar = (o) => structuredClone(o);

// Asigna un valor en un parámetro tipo "llegadas.gripeMediaMinutos" sin mutar el original.
function asignarParametro(obj, parametro, valor) {
  const claves = parametro.split(".");
  const nuevo = copiar(obj);
  let nodo = nuevo;
  claves.slice(0, -1).forEach((k) => (nodo = nodo[k]));
  nodo[claves.at(-1)] = valor;
  return nuevo;
}

export function useParametros() {
  const [raw, setRaw] = useState(() => copiar(PARAMETROS_POR_DEFECTO));
  const validacion = useMemo(() => validarParametros(raw), [raw]);

  const setCampo = useCallback(
    (parametro, valor) => setRaw((p) => asignarParametro(p, parametro, valor)),
    [],
  );

  // "Mostrar todas las filas": desde la hora 0 y tantas filas como el tope de iteraciones.
  const mostrarTodasLasFilas = useCallback(() => {
    setRaw((p) => {
      const nuevo = copiar(p);
      nuevo.ejecucion.horaDesdeMinutos = 0;
      nuevo.ejecucion.cantidadFilas = p.ejecucion.topeIteraciones;
      return nuevo;
    });
  }, []);

  const restaurar = useCallback(
    () => setRaw(copiar(PARAMETROS_POR_DEFECTO)),
    [],
  );

  return { raw, ...validacion, setCampo, mostrarTodasLasFilas, restaurar };
}
