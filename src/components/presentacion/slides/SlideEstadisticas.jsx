// Slide 6: fórmulas de lo que se desea conocer y de las estadísticas adicionales.
import Reveal from "../Reveal.jsx";
import { DOSIS_POR_CAJA_GRIPE } from "../../../config/constantes.js";
import { TEXTO_INTEGRANTE_ESPERA } from "../../../utils/descripcionCriterios.js";

const PEDIDAS = [
  [
    "Cajas de gripe colocadas",
    "Contador: +1 cada vez que se abre una caja.",
    "Incluye la que quede abierta al final.",
  ],
  [
    "Dosis de gripe descartadas",
    "Σ dosis restantes en cada vencimiento.",
    "La caja abierta al final todavía no venció: no cuenta.",
  ],
  [
    "Espera promedio COVID",
    "Σ esperas de grupos COVID / grupos con espera registrada.",
    `Espera = inicio de vacunación del ${TEXTO_INTEGRANTE_ESPERA} − llegada.`,
  ],
  [
    "Espera promedio gripe",
    "Σ esperas de grupos de gripe / grupos con espera registrada.",
    "Los grupos que siguen esperando al final no entran.",
  ],
];

const ADICIONALES = [
  ["Ocupación del enfermero", "Σ tiempo ocupado / tiempo simulado"],
  ["Espera máxima por tipo", "Mayor espera registrada"],
  ["Personas promedio en cola", "Σ (personas en cola · Δt) / tiempo simulado"],
  ["Permanencia promedio", "Σ (retiro − llegada) / grupos retirados"],
  ["Cajas y dosis de COVID", "Contadores (5 dosis por caja)"],
  [
    "% dosis de gripe descartadas",
    `Descartadas / (cajas abiertas · ${DOSIS_POR_CAJA_GRIPE})`,
  ],
];

export default function SlideEstadisticas() {
  return (
    <section className="slide">
      <Reveal className="slide-cuerpo">
        <h2 className="slide-titulo">Estadísticas y sus fórmulas</h2>
        <p className="slide-bajada">
          Todas se calculan con contadores y acumuladores que se actualizan en
          cada evento; se muestran en el vector y su valor final sale de la
          última fila.
        </p>
        <div className="columnas-slide">
          <div>
            <h3 className="subtitulo">Lo que pide el enunciado</h3>
            <dl className="lista-definiciones lista-definiciones-compacta">
              {PEDIDAS.map(([t, f, n]) => (
                <div key={t} className="definicion definicion-angosta">
                  <dt>{t}</dt>
                  <dd>
                    {f}
                    <span className="celda-detalle">{n}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h3 className="subtitulo">Adicionales</h3>
            <dl className="lista-definiciones lista-definiciones-compacta">
              {ADICIONALES.map(([t, f]) => (
                <div key={t} className="definicion definicion-angosta">
                  <dt>{t}</dt>
                  <dd>{f}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
