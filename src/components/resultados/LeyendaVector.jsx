// Cómo leer el vector: identificadores de grupo, estados, motivos del lote y novedades de caja.
import {
  ESTADO_GRUPO,
  DESCRIPCION_ESTADO_GRUPO,
  MOTIVO_LOTE,
  DESCRIPCION_MOTIVO_LOTE,
  PREFIJO_GRUPO,
} from "../../domain/vacunatorio/vocabulario.js";
import EstadoChip from "./EstadoChip.jsx";

export default function LeyendaVector() {
  return (
    <details className="leyenda" open>
      <summary>Cómo leer el vector</summary>
      <div className="leyenda-cuerpo">
        <div>
          <h4>Grupos (clientes)</h4>
          <p className="nota">
            {PREFIJO_GRUPO.COVID}-4 es el cuarto grupo de COVID y{" "}
            {PREFIJO_GRUPO.GRIPE}-7 el séptimo de gripe. Cada grupo conserva su
            lugar hasta retirarse. Siempre se cumple: vacunados + en lote +
            pendientes = tamaño.
          </p>
          <dl className="leyenda-lista">
            {Object.values(ESTADO_GRUPO).map((estado) => (
              <div key={estado}>
                <dt>
                  <EstadoChip estado={estado} />
                </dt>
                <dd>{DESCRIPCION_ESTADO_GRUPO[estado]}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h4>Motivo del lote</h4>
          <p className="nota">Aparece solo en la fila donde arranca el lote.</p>
          <dl className="leyenda-lista">
            {Object.values(MOTIVO_LOTE).map((motivo) => (
              <div key={motivo}>
                <dt className="leyenda-motivo">{motivo}</dt>
                <dd>{DESCRIPCION_MOTIVO_LOTE[motivo]}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h4>Novedad de caja</h4>
          <dl className="leyenda-lista">
            <div>
              <dt className="leyenda-motivo">Abre caja 12</dt>
              <dd>
                Un grupo de gripe empezó a vacunarse y las dosis que quedaban no
                alcanzaban: se abre otra caja (suma una colocada).
              </dd>
            </div>
            <div>
              <dt className="leyenda-motivo">Caja 12 agotada</dt>
              <dd>Se usaron todas sus dosis; su vencimiento se cancela.</dd>
            </div>
            <div>
              <dt className="leyenda-motivo">Caja 11 agotada · Abre caja 12</dt>
              <dd>
                Al grupo le faltaban dosis: usa las que quedaban y completa con
                la caja nueva.
              </dd>
            </div>
            <div>
              <dt className="leyenda-motivo">Vence caja 12: descarta 4</dt>
              <dd>
                Pasó el tiempo de vencimiento con dosis sin usar: se descartan.
              </dd>
            </div>
          </dl>
          <p className="nota">
            Composición del lote: "{PREFIJO_GRUPO.COVID}-4 ×2 +{" "}
            {PREFIJO_GRUPO.COVID}-5 ×3" son 2 personas del grupo{" "}
            {PREFIJO_GRUPO.COVID}-4 y 3 del {PREFIJO_GRUPO.COVID}-5.
          </p>
        </div>
      </div>
    </details>
  );
}
