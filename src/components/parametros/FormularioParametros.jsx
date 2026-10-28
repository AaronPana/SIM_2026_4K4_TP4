// Formulario completo: cuatro grupos y la acción de simular (deshabilitada si hay errores).
import GrupoEjecucion from "./GrupoEjecucion.jsx";
import GrupoGenerador from "./GrupoGenerador.jsx";
import GrupoLlegadas from "./GrupoLlegadas.jsx";
import GrupoVacunacion from "./GrupoVacunacion.jsx";
import GrupoEstadoInicial from "./GrupoEstadoInicial.jsx";
import CriteriosModelo from "./CriteriosModelo.jsx";

export default function FormularioParametros({ form, onSimular, corriendo }) {
  const cantidadErrores = Object.keys(form.errores).length;
  const enviar = (e) => {
    e.preventDefault();
    if (form.esValido) onSimular(form.params);
  };
  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      <GrupoEjecucion form={form} />
      <GrupoGenerador form={form} />
      <GrupoLlegadas form={form} />
      <GrupoVacunacion form={form} />
      <GrupoEstadoInicial form={form} />
      <CriteriosModelo />
      <div className="formulario-acciones">
        <button
          type="submit"
          className="boton boton-primario"
          disabled={!form.esValido || corriendo}
        >
          {corriendo ? "Simulando…" : "Simular"}
        </button>
        <button
          type="button"
          className="boton boton-secundario"
          onClick={form.restaurar}
        >
          Restaurar valores del enunciado
        </button>
        {form.erroresEstadoInicial.length > 0 && (
          <p className="campo-error" role="status">
            Corregí el estado inicial en src/config/estadoInicial.js para poder
            simular.
          </p>
        )}
        {cantidadErrores > 0 && (
          <p className="campo-error" role="status">
            Corregí{" "}
            {cantidadErrores === 1 ? "1 campo" : `${cantidadErrores} campos`}{" "}
            para poder simular.
          </p>
        )}
      </div>
    </form>
  );
}
