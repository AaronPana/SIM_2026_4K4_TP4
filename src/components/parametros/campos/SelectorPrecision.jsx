// Selector del único parámetro de precisión (truncamiento).
import { PRECISIONES } from "../../../config/constantes.js";

export default function SelectorPrecision({ form }) {
  return (
    <div className="campo">
      <label htmlFor="precision">Precisión</label>
      <select
        id="precision"
        value={String(form.raw.ejecucion.precision)}
        onChange={(e) => form.setCampo("ejecucion.precision", e.target.value)}
      >
        {PRECISIONES.map((p) => (
          <option key={p.valor} value={String(p.valor)}>
            {p.etiqueta}
          </option>
        ))}
      </select>
      <p className="campo-ayuda">Trunca RND, tiempos y estadísticas</p>
    </div>
  );
}
