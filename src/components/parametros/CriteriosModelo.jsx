// Criterios del modelo (solo lectura): con qué interpretación del enunciado corre la simulación.
// Se cambian en src/config/criteriosModelo.js y este bloque se actualiza solo.
import { CRITERIOS_DEL_MODELO } from "../../utils/descripcionCriterios.js";

export default function CriteriosModelo() {
  return (
    <fieldset className="grupo">
      <legend>Criterios del modelo</legend>
      <p className="nota">
        Interpretaciones del enunciado. No se editan desde acá: se cambian en{" "}
        <code>src/config/criteriosModelo.js</code>.
      </p>
      <dl className="criterios-lista">
        {CRITERIOS_DEL_MODELO.map((c) => (
          <div key={c.criterio} className="criterio">
            <dt>{c.criterio}</dt>
            <dd>
              <span className="criterio-valor">{c.valor}</span>
              <span className="campo-ayuda">{c.detalle}</span>
            </dd>
          </div>
        ))}
      </dl>
    </fieldset>
  );
}
