// Grupo 4: duración de la vacunación por persona, vencimiento de la caja de gripe y cajas (fijas).
import CampoNumero from "./campos/CampoNumero.jsx";
import CampoConversor from "./campos/CampoConversor.jsx";
import {
  DOSIS_POR_CAJA_COVID,
  DOSIS_POR_CAJA_GRIPE,
  MINIMO_PACIENTES_ABRIR_CAJA_COVID,
} from "../../config/constantes.js";
import { crearTruncador } from "../../utils/truncar.js";

const truncar4 = crearTruncador(4);

export default function GrupoVacunacion({ form }) {
  const segundos = Number(form.raw.vacunacion.segundosPorPersona);
  const equivalencia =
    segundos > 0
      ? `= ${truncar4(segundos / 60).toLocaleString("es-AR", { maximumFractionDigits: 4 })} min por persona`
      : null;

  return (
    <fieldset className="grupo">
      <legend>Vacunación y cajas</legend>
      <div className="grilla-bloques">
        <div className="bloque">
          <h4>
            Lote del enfermero{" "}
            <span className="bloque-dist">Duración fija</span>
          </h4>
          <CampoNumero
            form={form}
            parametro="vacunacion.segundosPorPersona"
            etiqueta="Tiempo por persona"
            unidad="s"
            ayuda={equivalencia}
          />
          <p className="nota">
            Un lote de N personas tarda N veces este tiempo.
          </p>
        </div>
        <div className="bloque">
          <h4>
            Caja de gripe{" "}
            <span className="bloque-dist">
              {DOSIS_POR_CAJA_GRIPE} dosis (fijo)
            </span>
          </h4>
          <CampoConversor
            form={form}
            parametro="vacunacion.vencimientoCajaGripeMinutos"
            etiqueta="Vencimiento de las dosis sobrantes"
            ayuda="Cuenta desde que se abre la caja"
          />
        </div>
        <div className="bloque">
          <h4>
            Caja de COVID{" "}
            <span className="bloque-dist">
              {DOSIS_POR_CAJA_COVID} dosis (fijo)
            </span>
          </h4>
          <p className="nota">
            Se abre solo con al menos {MINIMO_PACIENTES_ABRIR_CAJA_COVID}{" "}
            pacientes pendientes y se usa completa: cada lote de COVID vacuna
            exactamente {DOSIS_POR_CAJA_COVID} personas.
          </p>
        </div>
      </div>
    </fieldset>
  );
}
