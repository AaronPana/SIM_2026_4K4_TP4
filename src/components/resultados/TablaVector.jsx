// Vector de estado con encabezado agrupado y anclado. Virtualizada: solo dibuja las filas visibles.
// Una fila se selecciona con clic (o flechas ↑ ↓) y la selección se mantiene al hacer scroll.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  construirColumnas,
  aplanarColumnas,
} from "../../config/columnasVector.js";
import { formatearValor } from "../../utils/formato.js";
import EstadoChip from "./EstadoChip.jsx";

const ALTO_FILA = 32;
// Las dos filas del encabezado quedan ancladas arriba y tapan ese alto de la zona visible.
const ALTO_ENCABEZADO = 2 * ALTO_FILA;

// Si la fila quedó fuera de la ventana (debajo o detrás de la barra superior), desplaza la página lo justo.
function mantenerEnPantalla(tr) {
  const margen = 8;
  const barra = document.querySelector(".barra")?.offsetHeight ?? 0;
  const { top, bottom } = tr.getBoundingClientRect();
  if (bottom > window.innerHeight - margen)
    window.scrollBy({ top: bottom - window.innerHeight + margen });
  else if (top < barra + margen) window.scrollBy({ top: top - barra - margen });
}

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

  // "Fila" siempre queda anclada; con el botón también se anclan las columnas de "Evento y reloj".
  const [fijarEvento, setFijarEvento] = useState(false);
  const ancladas = fijarEvento ? 1 + grupos[1].columnas.length : 1;
  const titulosRef = useRef(null);
  const [izquierdas, setIzquierdas] = useState([0]);

  // Cada columna anclada se pega donde termina la anterior: se miden los anchos reales (y si cambian).
  useLayoutEffect(() => {
    const ths = [...titulosRef.current.children].slice(0, ancladas);
    const medir = () => {
      let x = 0;
      setIzquierdas(
        ths.map((th) => {
          const izquierda = x;
          x += th.offsetWidth;
          return izquierda;
        }),
      );
    };
    medir();
    const observador = new ResizeObserver(medir);
    ths.forEach((th) => observador.observe(th));
    return () => observador.disconnect();
  }, [ancladas, columnas]);

  // Clase y posición de la columna i: Fila (fija), anclada (con su "left") o normal.
  const anclaje = (i) => {
    if (i === 0) return { clase: "col-fija", estilo: undefined };
    if (i >= ancladas) return { clase: "", estilo: undefined };
    const ultima = i === ancladas - 1 ? "col-anclada-ultima" : "";
    return {
      clase: `col-anclada ${ultima}`,
      estilo: { left: izquierdas[i] ?? 0 },
    };
  };

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
    // Sin esto, al bajar la fila queda escondida debajo del borde (el encabezado ocupa lugar arriba).
    scrollPaddingEnd: ALTO_ENCABEZADO,
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
    seguirConLaPagina.current = true;
    onSeleccionar(items[i].fila);
  };

  // Al cambiar la selección (flechas o botones de la foto), la tabla se desplaza hasta la fila.
  // Con flechas también se desplaza la página, para no perder la fila de vista.
  const seguirConLaPagina = useRef(false);
  useEffect(() => {
    if (indiceSeleccionado === -1) return;
    virtualizador.scrollToIndex(indiceSeleccionado, { align: "auto" });
    if (!seguirConLaPagina.current) return;
    seguirConLaPagina.current = false;
    // Se espera a que la tabla dibuje la fila antes de medirla.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const tr = scrollRef.current?.querySelector("tr.fila-seleccionada");
        if (tr) mantenerEnPantalla(tr);
      }),
    );
  }, [indiceSeleccionado, virtualizador]);

  const renderCelda = (columna, fila) => {
    const valor = columna.obtener(fila);
    if (columna.tipo === "estado")
      return valor ? <EstadoChip estado={valor} /> : "—";
    return formatearValor(valor, columna.tipo, precision);
  };

  return (
    <>
      <div className="tabla-herramientas">
        <button
          type="button"
          className={`boton-anclar ${fijarEvento ? "es-activo" : ""}`}
          aria-pressed={fijarEvento}
          onClick={() => setFijarEvento((f) => !f)}
          title="Mantiene visibles el evento y el reloj al desplazarse a la derecha"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M5 1.5h6M6 1.5v5L3.5 9.5h9L10 6.5v-5M8 9.5V15" />
          </svg>
          {fijarEvento ? "Evento y reloj fijados" : "Fijar evento y reloj"}
        </button>
      </div>
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
                  className={`obj-${g.objeto} ${i === 0 ? "col-fija" : ""} ${i === 1 && fijarEvento ? "col-anclada col-anclada-ultima" : ""}`}
                  style={
                    i === 1 && fijarEvento
                      ? { left: izquierdas[1] ?? 0 }
                      : undefined
                  }
                >
                  {g.grupo}
                </th>
              ))}
            </tr>
            <tr className="fila-titulos" ref={titulosRef}>
              {columnas.map((c, i) => (
                <th
                  key={c.clave}
                  className={anclaje(i).clase}
                  style={anclaje(i).estilo}
                >
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
                      className={`${anclaje(i).clase} ${c.tipo === "texto" || c.tipo === "estado" ? "celda-texto" : ""}`}
                      style={anclaje(i).estilo}
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
    </>
  );
}
