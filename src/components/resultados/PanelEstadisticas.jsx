// Estadísticas finales: lo que pide el enunciado y las adicionales elegidas.
import { formatearValor, formatearPorcentaje } from "../../utils/formato.js";

function ListaEstadisticas({ titulo, items, precision }) {
  const mostrar = (d) =>
    d.tipo === "proporcion"
      ? formatearPorcentaje(d.valor)
      : `${formatearValor(d.valor, d.tipo, precision)}${d.valor !== null && d.unidad ? ` ${d.unidad}` : ""}`;
  return (
    <div>
      <h3 className="subtitulo-panel">{titulo}</h3>
      <dl className="estadisticas-lista">
        {items.map((d) => (
          <div key={d.etiqueta} className="estadistica">
            <dt>{d.etiqueta}</dt>
            <dd>{mostrar(d)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function PanelEstadisticas({ resumen, precision }) {
  return (
    <div className="panel-estadisticas">
      <ListaEstadisticas
        titulo="Lo que pide el enunciado"
        items={resumen.pedidas}
        precision={precision}
      />
      <ListaEstadisticas
        titulo="Estadísticas adicionales"
        items={resumen.adicionales}
        precision={precision}
      />
    </div>
  );
}
