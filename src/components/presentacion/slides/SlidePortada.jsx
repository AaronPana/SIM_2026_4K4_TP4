// Slide 1: portada. Grupo e integrantes solo aparecen si están cargados en constantes.js.
import { PORTADA } from "../../../config/constantes.js";
import FlujoVacunatorio from "../../diagramas/FlujoVacunatorio.jsx";

export default function SlidePortada({ onComenzar }) {
  const {
    titulo,
    subtitulo,
    materia,
    curso,
    anio,
    facultad,
    grupo,
    integrantes,
  } = PORTADA;
  return (
    <section className="slide slide-portada">
      <div className="portada-texto">
        <p className="portada-meta">
          {facultad} · {materia} {anio} · Curso {curso}
        </p>
        <h1 className="portada-titulo">{titulo}</h1>
        <p className="portada-sub">{subtitulo}</p>
        {(grupo || integrantes.length > 0) && (
          <div className="portada-grupo">
            {grupo && <p>Grupo {grupo}</p>}
            {integrantes.length > 0 && <p>{integrantes.join(" · ")}</p>}
          </div>
        )}
        <button className="boton boton-primario" onClick={onComenzar}>
          Ir al simulador
        </button>
      </div>
      <div className="portada-diagrama" aria-hidden="true">
        <FlujoVacunatorio oscuro />
      </div>
    </section>
  );
}
