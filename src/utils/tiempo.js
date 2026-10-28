// Conversiones de tiempo para mostrar. El motor trabaja siempre en minutos.

// Minutos a horas, sin errores de coma flotante visibles (90 → 1,5).
export const minutosAHoras = (minutos) =>
  Number((minutos / 60).toPrecision(15));

// Horas a minutos (1,5 → 90).
export const horasAMinutos = (horas) => Number((horas * 60).toPrecision(15));

// Reloj en minutos a "hh:mm:ss". Los segundos se truncan, como el resto de los valores.
export function formatearHora(minutos) {
  if (minutos === null || minutos === undefined) return null;
  const totalSegundos = Math.floor(Number((minutos * 60).toPrecision(12)));
  const h = Math.floor(totalSegundos / 3600);
  const m = Math.floor((totalSegundos % 3600) / 60);
  const s = totalSegundos % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}
