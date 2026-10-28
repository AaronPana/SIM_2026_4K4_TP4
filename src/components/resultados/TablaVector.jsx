// Vector de estado con encabezado agrupado y anclado. Virtualizada: solo dibuja las filas visibles.
// Una fila se selecciona con clic (o flechas ↑ ↓) y la selección se mantiene al hacer scroll.
import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  construirColumnas,
  aplanarColumnas,
} from "../../config/columnasVector.js";
import { formatearValor } from "../../utils/formato.js";
import EstadoChip from "./EstadoChip.jsx";

const ALTO_FILA = 32;

export default function TablaVector({
  resultado,
  filaSeleccionada,
  onSeleccionar,
}) {
  const scrollRef = useRef(null);
  const { filas, ultima, ultimaIncluida, lugares, parametros } = resultado;
  const precision = parametros.ejecucion.precision;

  const grupos = useMemo(() => construirColumnas({ lugares }), [lugares]);
  const columnas = useMemo(() => aplanarColumnas(grupos), [grupos]);

  // Si la última fila quedó fuera de lo mostrado, se agrega al final tras un separador.
  const items = useMemo(
    () => (ultimaIncluida ? filas : [...filas, { separador: true }, ultima]),
    [filas, ultima, ultimaIncluida],
  );
  const indiceSeleccionado = items.findIndex(
    (f) => !f.separador && f.fila === filaSeleccionada,
  );

  const virtualizador = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ALTO_FILA,
    overscan: 12,
  });
  const virtuales = virtualizador.getVirtualItems();
  const arriba = virtuales.length ? virtuales[0].start : 0;
  const abajo = virtuales.length
    ? virtualizador.getTotalSize() - virtuales.at(-1).end
    : 0;

  // Flechas ↑ ↓ mueven la selección (saltando el separador) y la mantienen a la vista.
  const moverSeleccion = (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const paso = e.key === "ArrowDown" ? 1 : -1;
    let i = indiceSeleccionado === -1 ? 0 : indiceSeleccionado + paso;
    if (items[i]?.separador) i += paso;
    if (i < 0 || i >= items.length) return;
    onSeleccionar(items[i].fila);
    virtualizador.scrollToIndex(i, { align: "auto" });
  };

  const renderCelda = (columna, fila) => {
    const valor = columna.obtener(fila);
    if (columna.tipo === "estado")
      return valor ? <EstadoChip estado={valor} /> : "—";
    return formatearValor(valor, columna.tipo, precision);
  };

  return (
    <div
      className="tabla-vector"
      ref={scrollRef}
      tabIndex={0}
      onKeyDown={moverSeleccion}
      aria-label="Vector de estado. Clic en una fila para seleccionarla; flechas para moverse."
    >
      <table>
        <thead>
          <tr className="fila-grupos">
            {grupos.map((g, i) => (
              <th
                key={i}
                colSpan={g.columnas.length}
                className={`obj-${g.objeto} ${i === 0 ? "col-fija" : ""}`}
              >
                {g.grupo}
              </th>
            ))}
          </tr>
          <tr className="fila-titulos">
            {columnas.map((c, i) => (
              <th key={c.clave} className={i === 0 ? "col-fija" : ""}>
                {c.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {arriba > 0 && <tr style={{ height: arriba }} aria-hidden="true" />}
          {virtuales.map((v) => {
            const fila = items[v.index];
            if (fila.separador) {
              return (
                <tr key={v.key} className="fila-separador">
                  <td colSpan={columnas.length}>
                    <span className="separador-texto">
                      … filas sin mostrar …
                    </span>
                  </td>
                </tr>
              );
            }
            const clases = [
              fila.fila === ultima.fila ? "fila-ultima" : "",
              fila.fila === filaSeleccionada ? "fila-seleccionada" : "",
            ].join(" ");
            return (
              <tr
                key={v.key}
                className={clases}
                onClick={() => onSeleccionar(fila.fila)}
                aria-selected={fila.fila === filaSeleccionada}
              >
                {columnas.map((c, i) => (
                  <td
                    key={c.clave}
                    className={`${i === 0 ? "col-fija" : ""} ${c.tipo === "texto" || c.tipo === "estado" ? "celda-texto" : ""}`}
                  >
                    {renderCelda(c, fila)}
                  </td>
                ))}
              </tr>
            );
          })}
          {abajo > 0 && <tr style={{ height: abajo }} aria-hidden="true" />}
        </tbody>
      </table>
    </div>
  );
}
