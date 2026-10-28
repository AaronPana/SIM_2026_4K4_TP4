// Formato solo para mostrar en pantalla; no altera los valores calculados.
import { DECIMALES_PANTALLA_COMPLETA } from "../config/constantes.js";
import { crearTruncador } from "./truncar.js";

// Decimales visibles según la precisión elegida.
export function decimalesVisibles(precision) {
  return precision === "completa" ? DECIMALES_PANTALLA_COMPLETA : precision;
}

// Formatea un valor según su tipo de columna. null/undefined se muestran como guion.
// Al mostrar también se trunca (no se redondea), igual que en el cálculo.
export function formatearValor(valor, tipo, precision) {
  if (valor === null || valor === undefined || valor === "") return "—";
  if (tipo === "texto" || tipo === "estado") return String(valor);
  if (tipo === "entero") return Number(valor).toLocaleString("es-AR");
  const dec = decimalesVisibles(precision);
  return crearTruncador(dec)(Number(valor)).toLocaleString("es-AR", {
    maximumFractionDigits: dec,
  });
}

// Porcentaje legible para proporciones (0.4213 → "42,13 %").
export function formatearPorcentaje(valor) {
  if (valor === null || valor === undefined) return "—";
  return (
    crearTruncador(2)(valor * 100).toLocaleString("es-AR", {
      maximumFractionDigits: 2,
    }) + " %"
  );
}
