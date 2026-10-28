// Tiempo con dos inputs vinculados, horas y minutos: completás uno y el otro se actualiza solo.
// El valor que se guarda (y se valida) es siempre el de minutos.
import { useId, useState } from "react";
import { leerParametro } from "../../../utils/parametros.js";
import { minutosAHoras, horasAMinutos } from "../../../utils/tiempo.js";
import { crearTruncador } from "../../../utils/truncar.js";

const truncar4 = crearTruncador(4);

// Texto de horas derivado de los minutos guardados (vacío si no es un número).
function textoHoras(minutos) {
  if (minutos === "" || minutos === null || Number.isNaN(Number(minutos)))
    return "";
  return String(truncar4(minutosAHoras(Number(minutos))));
}

export default function CampoConversor({ form, parametro, etiqueta, ayuda }) {
  const id = useId();
  // Mientras se escribe en un input se respeta su texto; el otro se recalcula.
  const [edicion, setEdicion] = useState(null);
  const minutos = leerParametro(form.raw, parametro) ?? "";
  const error = form.errores[parametro];

  const valorHoras =
    edicion?.unidad === "horas" ? edicion.texto : textoHoras(minutos);
  const valorMinutos =
    edicion?.unidad === "minutos" ? edicion.texto : String(minutos);

  const cambiarHoras = (texto) => {
    setEdicion({ unidad: "horas", texto });
    const horas = Number(texto);
    form.setCampo(
      parametro,
      texto === "" || Number.isNaN(horas)
        ? texto
        : String(horasAMinutos(horas)),
    );
  };
  const cambiarMinutos = (texto) => {
    setEdicion({ unidad: "minutos", texto });
    form.setCampo(parametro, texto);
  };

  return (
    <div className={`campo campo-conversor ${error ? "con-error" : ""}`}>
      <span className="campo-etiqueta" id={`${id}-etiqueta`}>
        {etiqueta}
      </span>
      <div
        className="conversor"
        role="group"
        aria-labelledby={`${id}-etiqueta`}
      >
        <label className="conversor-unidad">
          <input
            type="number"
            step="any"
            value={valorHoras}
            onChange={(e) => cambiarHoras(e.target.value)}
            onBlur={() => setEdicion(null)}
            aria-invalid={Boolean(error)}
          />
          <span>h</span>
        </label>
        <span className="conversor-igual" aria-hidden="true">
          =
        </span>
        <label className="conversor-unidad">
          <input
            type="number"
            step="any"
            value={valorMinutos}
            onChange={(e) => cambiarMinutos(e.target.value)}
            onBlur={() => setEdicion(null)}
            aria-invalid={Boolean(error)}
          />
          <span>min</span>
        </label>
      </div>
      {error ? (
        <p className="campo-error">{error}</p>
      ) : (
        ayuda && <p className="campo-ayuda">{ayuda}</p>
      )}
    </div>
  );
}
