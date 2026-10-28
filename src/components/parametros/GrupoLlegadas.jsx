// Grupo 3: llegadas de grupos de COVID y de gripe, y cantidad de personas por grupo.
import CampoNumero from "./campos/CampoNumero.jsx";
import { PERSONAS_MINIMO_POR_GRUPO } from "../../config/constantes.js";
import { crearTruncador } from "../../utils/truncar.js";

const truncar4 = crearTruncador(4);
const formatear = (v) =>
  truncar4(v).toLocaleString("es-AR", { maximumFractionDigits: 4 });

export default function GrupoLlegadas({ form }) {
  const { covidCantidadLlegadas, covidCadaMinutos } = form.raw.llegadas;
  const cantidad = Number(covidCantidadLlegadas);
  const cada = Number(covidCadaMinutos);
  // Media derivada de "N llegadas cada M minutos": M / N.
  const mediaCovid =
    cantidad > 0 && cada > 0
      ? `Media entre llegadas: ${formatear(cada / cantidad)} min`
      : null;

  return (
    <fieldset className="grupo">
      <legend>Llegadas de grupos</legend>
      <div className="grilla-bloques">
        <div className="bloque">
          <h4>
            COVID <span className="bloque-dist">Exponencial negativa</span>
          </h4>
          <div className="grilla-campos">
            <CampoNumero
              form={form}
              parametro="llegadas.covidCantidadLlegadas"
              etiqueta="Llegadas"
              unidad="grupos"
            />
            <CampoNumero
              form={form}
              parametro="llegadas.covidCadaMinutos"
              etiqueta="Cada"
              unidad="min"
            />
          </div>
          {mediaCovid && <p className="nota nota-destacada">{mediaCovid}</p>}
        </div>
        <div className="bloque">
          <h4>
            Gripe <span className="bloque-dist">Exponencial negativa</span>
          </h4>
          <CampoNumero
            form={form}
            parametro="llegadas.gripeMediaMinutos"
            etiqueta="Media entre llegadas"
            unidad="min"
          />
        </div>
        <div className="bloque">
          <h4>
            Personas por grupo{" "}
            <span className="bloque-dist">Uniforme discreta</span>
          </h4>
          <div className="grilla-campos">
            <div className="campo">
              <span className="campo-etiqueta">
                Mínimo <span className="campo-unidad">personas</span>
              </span>
              <p className="valor-fijo">{PERSONAS_MINIMO_POR_GRUPO}</p>
              <p className="campo-ayuda">Fijo (no está en rojo)</p>
            </div>
            <CampoNumero
              form={form}
              parametro="llegadas.personasMaximoPorGrupo"
              etiqueta="Máximo"
              unidad="personas"
              paso={1}
            />
          </div>
          <p className="nota">
            Todos los integrantes van por la misma vacuna; cada tamaño es igual
            de probable.
          </p>
        </div>
      </div>
    </fieldset>
  );
}
