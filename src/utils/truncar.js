// Precisión por truncamiento (nunca redondeo: evita RND = 1 y ln(0) en la exponencial).

// Devuelve una función que trunca a la precisión elegida ("completa" = sin cambios).
export function crearTruncador(precision) {
  if (precision === "completa") return (v) => v;
  const factor = 10 ** precision;
  // toPrecision(15) limpia el error de coma flotante (0.29·100 = 28.999…).
  return (v) => Math.trunc(Number((v * factor).toPrecision(15))) / factor;
}
