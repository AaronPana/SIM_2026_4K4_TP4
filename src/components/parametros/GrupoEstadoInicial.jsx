// Estado inicial (solo lectura): resumen de lo cargado en config/estadoInicial.js y sus errores.
// Solo aparece si el estado inicial está activo. Con errores, no se puede simular.
import { ESTADO_INICIAL } from "../../config/estadoInicial.js";
import {
  TIPO_VACUNA,
  NOMBRE_VACUNA,
} from "../../domain/vacunatorio/vocabulario.js";

const TIPOS = Object.values(TIPO_VACUNA);
const numero = (v) =>
  Number(v).toLocaleString("es-AR", { maximumFractionDigits: 4 });

// Una línea de texto por cada parte del estado.
function resumen(estado) {
  const lineas = TIPOS.map((tipo) => {
    const grupos = estado.grupos[tipo];
    const pendientes = grupos.reduce((total, g) => total + g.pendientes, 0);
    const personas =
      pendientes === 1 ? "persona pendiente" : "personas pendientes";
    return `Grupos ${NOMBRE_VACUNA[tipo]}: ${grupos.length} (${pendientes} ${personas})`;
  });
  const enLote = TIPOS.find((t) => estado.grupos[t].some((g) => g.enLote > 0));
  lineas.push(
    enLote
      ? `Enfermero: vacunando ${NOMBRE_VACUNA[enLote]} hasta ${numero(estado.enfermero.finVacunacion)} min`
      : `Enfermero: libre (último tipo: ${estado.enfermero.ultimoTipoAplicado ? NOMBRE_VACUNA[estado.enfermero.ultimoTipoAplicado] : "ninguno"})`,
  );
  lineas.push(
    estado.cajaGripe
      ? `Caja de gripe: ${estado.cajaGripe.dosisRestantes} dosis, vence en ${numero(estado.cajaGripe.horaVencimiento)} min`
      : "Caja de gripe: ninguna abierta",
  );
  lineas.push(
    `Próximas llegadas: ${TIPOS.map((t) => {
      const hora = estado.proximaLlegada[t];
      return `${NOMBRE_VACUNA[t]} ${hora === null ? "se sortea" : `${numero(hora)} min`}`;
    }).join(" · ")}`,
  );
  return lineas;
}

export default function GrupoEstadoInicial({ form }) {
  if (!ESTADO_INICIAL.activo) return null;
  const errores = form.erroresEstadoInicial;
  return (
    <fieldset className={`grupo ${errores.length ? "grupo-con-error" : ""}`}>
      <legend>Estado inicial</legend>
      <p className="nota">
        La simulación no arranca vacía: parte de lo cargado en{" "}
        <code>src/config/estadoInicial.js</code>. El reloj 0 es el inicio; las
        horas negativas son de antes.
      </p>
      <ul className="estado-inicial-resumen">
        {resumen(ESTADO_INICIAL).map((linea) => (
          <li key={linea}>{linea}</li>
        ))}
      </ul>
      {errores.length > 0 && (
        <div className="aviso aviso-error" role="alert">
          <p>
            <strong>
              El estado inicial no es coherente con el modelo o con los
              parámetros actuales:
            </strong>
          </p>
          <ul className="estado-inicial-errores">
            {errores.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </fieldset>
  );
}
