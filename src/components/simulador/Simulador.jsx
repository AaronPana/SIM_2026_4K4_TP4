// Pantalla del simulador: parámetros arriba (siempre visibles) y resultados abajo.
import { useEffect, useMemo, useState } from "react";
import { resumenEstadisticas } from "../../utils/resumenEstadisticas.js";
import { formatearHora } from "../../utils/tiempo.js";
import { formatearValor } from "../../utils/formato.js";
import FormularioParametros from "../parametros/FormularioParametros.jsx";
import PanelEstadisticas from "../resultados/PanelEstadisticas.jsx";
import LeyendaVector from "../resultados/LeyendaVector.jsx";
import TablaVector from "../resultados/TablaVector.jsx";
import FotoInstante from "../resultados/FotoInstante.jsx";

// Texto que explica cómo terminó la corrida y qué filas se muestran.
function textoCorrida(resultado) {
  const {
    iteraciones,
    relojFinal,
    cortePor,
    filas,
    ultimaIncluida,
    parametros,
  } = resultado;
  const p = parametros.ejecucion;
  const corte =
    cortePor === "tiempo"
      ? "se llegó al tiempo X"
      : `se alcanzó el tope de ${p.topeIteraciones.toLocaleString("es-AR")} iteraciones`;
  const reloj = formatearValor(relojFinal, "decimal", p.precision);
  const mostradas =
    filas.length === 0
      ? "Ninguna fila cumple la hora j; se muestra solo la última."
      : `Se muestran ${filas.length.toLocaleString("es-AR")} filas desde la hora ${p.horaDesdeMinutos} min${
          ultimaIncluida ? "" : " y la última"
        }.`;
  return `${iteraciones.toLocaleString("es-AR")} iteraciones hasta el reloj ${reloj} min (${formatearHora(
    relojFinal,
  )}): ${corte}. ${mostradas}`;
}

// El estado vive en App para no perderlo al volver a la presentación.
export default function Simulador({ form, simulacion, onVolver }) {
  const { resultado, corriendo, error, ejecutar } = simulacion;
  const [exportando, setExportando] = useState(false);
  const [filaSeleccionada, setFilaSeleccionada] = useState(null);
  const resumen = useMemo(
    () => (resultado ? resumenEstadisticas(resultado) : null),
    [resultado],
  );

  // Una corrida nueva limpia la selección anterior.
  useEffect(() => setFilaSeleccionada(null), [resultado]);

  // Filas que se pueden seleccionar, en orden: las mostradas y, si quedó afuera, la última.
  const filasNavegables = useMemo(() => {
    if (!resultado) return [];
    const { filas, ultima, ultimaIncluida } = resultado;
    return ultimaIncluida ? filas : [...filas, ultima];
  }, [resultado]);
  const indiceFoto = filasNavegables.findIndex(
    (f) => f.fila === filaSeleccionada,
  );
  const filaDeLaFoto = indiceFoto === -1 ? null : filasNavegables[indiceFoto];

  // Anterior / siguiente para la foto. Sin selección, "Siguiente" arranca por la primera fila.
  const hayAnterior = indiceFoto > 0;
  const haySiguiente = indiceFoto < filasNavegables.length - 1;
  const moverFoto = (paso) => {
    const destino = filasNavegables[indiceFoto + paso];
    if (destino) setFilaSeleccionada(destino.fila);
  };

  // Avisa si el formulario cambió después de la última corrida.
  const desactualizado =
    resultado &&
    JSON.stringify(form.params) !== JSON.stringify(resultado.parametros);

  const descargar = async () => {
    setExportando(true);
    try {
      // El exportador se carga solo cuando se pide el Excel.
      const { exportarExcel } = await import("../../export/exportarExcel.js");
      await exportarExcel(resultado);
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="simulador">
      <header className="barra">
        <div>
          <h1 className="barra-titulo">Simulador del vacunatorio</h1>
          <p className="barra-sub">Eventos discretos · TP4 · 4K4</p>
        </div>
        <button className="boton boton-secundario" onClick={onVolver}>
          Volver a la presentación
        </button>
      </header>

      <main className="simulador-cuerpo">
        <section className="seccion">
          <h2 className="seccion-titulo">Parámetros</h2>
          <FormularioParametros
            form={form}
            onSimular={ejecutar}
            corriendo={corriendo}
          />
        </section>

        {error && <p className="aviso aviso-error">{error}</p>}

        {resultado && (
          <>
            {desactualizado && (
              <p className="aviso">
                Cambiaste parámetros: los resultados corresponden a la corrida
                anterior.
              </p>
            )}
            <section className="seccion">
              <div className="seccion-cabecera">
                <h2 className="seccion-titulo">Resultados</h2>
                <button
                  className="boton boton-excel"
                  onClick={descargar}
                  disabled={exportando}
                >
                  {exportando ? "Generando Excel…" : "Descargar Excel"}
                </button>
              </div>
              <p className="nota resumen-corrida">{textoCorrida(resultado)}</p>
              <PanelEstadisticas
                resumen={resumen}
                precision={resultado.parametros.ejecucion.precision}
              />
            </section>

            <section className="seccion">
              <h2 className="seccion-titulo">Vector de estado</h2>
              <LeyendaVector />
              <p className="nota">
                Clic en una fila para seleccionarla (o flechas ↑ ↓ con la tabla
                enfocada). La última fila está resaltada.
              </p>
              <TablaVector
                resultado={resultado}
                filaSeleccionada={filaSeleccionada}
                onSeleccionar={setFilaSeleccionada}
              />
              <div className="foto-cabecera">
                <h3 className="subtitulo-panel">Foto del instante</h3>
                <div className="foto-navegacion">
                  <button
                    type="button"
                    className="boton-anclar"
                    onClick={() => moverFoto(-1)}
                    disabled={!hayAnterior}
                  >
                    ← Anterior
                  </button>
                  <span className="foto-posicion">
                    {filaDeLaFoto ? `Fila ${filaDeLaFoto.fila}` : "Sin fila"}
                  </span>
                  <button
                    type="button"
                    className="boton-anclar"
                    onClick={() => moverFoto(1)}
                    disabled={!haySiguiente}
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
              <FotoInstante
                fila={filaDeLaFoto}
                precision={resultado.parametros.ejecucion.precision}
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
