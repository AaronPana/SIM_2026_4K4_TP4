// Lee un valor anidado indicado por un parámetro tipo "generadores.B.x0".
export function leerParametro(obj, parametro) {
  return parametro.split(".").reduce((nodo, clave) => nodo?.[clave], obj);
}
