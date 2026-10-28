// Input numérico conectado al formulario por su parámetro. Muestra el error debajo si lo hay.
import { useId } from "react";
import { leerParametro } from "../../../utils/parametros.js";

export default function CampoNumero({
  form,
  parametro,
  etiqueta,
  unidad,
  paso = "any",
  ayuda,
}) {
  const id = useId();
  const error = form.errores[parametro];
  const valor = leerParametro(form.raw, parametro) ?? "";
  return (
    <div className={`campo ${error ? "con-error" : ""}`}>
      <label htmlFor={id}>
        {etiqueta}
        {unidad && <span className="campo-unidad">{unidad}</span>}
      </label>
      <input
        id={id}
        type="number"
        step={paso}
        value={valor}
        onChange={(e) => form.setCampo(parametro, e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? (
        <p id={`${id}-error`} className="campo-error">
          {error}
        </p>
      ) : (
        ayuda && <p className="campo-ayuda">{ayuda}</p>
      )}
    </div>
  );
}
