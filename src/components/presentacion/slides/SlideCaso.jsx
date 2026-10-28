// Slide 2: el caso del vacunatorio y lo que se desea conocer.
import Reveal from "../Reveal.jsx";
import FlujoVacunatorio from "../../diagramas/FlujoVacunatorio.jsx";

const PREGUNTAS = [
  "Cajas de vacunas contra la gripe colocadas en el tiempo simulado.",
  "Dosis de gripe descartadas por vencimiento.",
  "Espera promedio de los grupos que van por COVID.",
  "Espera promedio de los grupos que van por gripe.",
];

export default function SlideCaso() {
  return (
    <section className="slide">
      <Reveal className="slide-cuerpo">
        <h2 className="slide-titulo">
          El caso: un vacunatorio con un solo enfermero
        </h2>
        <p className="slide-bajada">
          Atiende las 24 horas. Llegan grupos de 1 a 4 personas, todas por la
          misma vacuna. Un único enfermero vacuna por lotes, de un tipo por vez.
        </p>
        <div className="diagrama-caso">
          <FlujoVacunatorio />
        </div>
        <div className="dos-columnas">
          <div>
            <h3 className="subtitulo">Se desea conocer</h3>
            <ol className="lista-simple lista-numerada lista-compacta">
              {PREGUNTAS.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className="subtitulo">Tipo de simulación</h3>
            <p className="texto">
              <strong>Eventos discretos</strong>: el reloj salta de un evento al
              siguiente (llegadas, fin de vacunación, vencimiento de caja) y en
              cada uno se actualiza el vector de estado. A diferencia del TP3,
              cada fila depende de la anterior: las colas y la caja abierta se
              arrastran.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
