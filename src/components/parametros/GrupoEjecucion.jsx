// Grupo 1: tiempo a simular (X), tope de iteraciones, filas a mostrar (i desde la hora j) y precisión.
import CampoNumero from "./campos/CampoNumero.jsx";
import CampoConversor from "./campos/CampoConversor.jsx";
import SelectorPrecision from "./campos/SelectorPrecision.jsx";

export default function GrupoEjecucion({ form }) {
  return (
    <fieldset className="grupo">
      <legend>Ejecución</legend>
      <div className="grilla-campos grilla-campos-ejecucion">
        <CampoConversor
          form={form}
          parametro="ejecucion.tiempoSimulacionMinutos"
          etiqueta="Tiempo a simular (X)"
          ayuda="Corta en X o en el tope, lo primero"
        />
        <CampoNumero
          form={form}
          parametro="ejecucion.topeIteraciones"
          etiqueta="Tope de iteraciones"
          unidad="filas"
          paso={1}
          ayuda="Máximo 100.000"
        />
        <CampoConversor
          form={form}
          parametro="ejecucion.horaDesdeMinutos"
          etiqueta="Mostrar desde la hora (j)"
          ayuda="Se compara con el reloj (min)"
        />
        <CampoNumero
          form={form}
          parametro="ejecucion.cantidadFilas"
          etiqueta="Filas a mostrar (i)"
          unidad="filas"
          paso={1}
        />
        <SelectorPrecision form={form} />
      </div>
      <div className="grupo-acciones">
        <button
          type="button"
          className="boton boton-texto"
          onClick={form.mostrarTodasLasFilas}
        >
          Mostrar todas las filas
        </button>
        <span className="nota">
          Pone j = 0 e i = tope de iteraciones. La última fila (instante X) se
          muestra siempre.
        </span>
      </div>
    </fieldset>
  );
}
