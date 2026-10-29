// Slide 8: qué muestra el vector de estado, cómo leerlo y el ciclo del motor.
import Reveal from "../Reveal.jsx";
import FlujoMotor from "../../diagramas/FlujoMotor.jsx";

const PARTES = [
  [
    "Evento y reloj",
    "Número de fila, evento, reloj en minutos y hora hh:mm:ss.",
  ],
  [
    "Llegadas",
    "RND, tiempo entre llegadas, próxima llegada, RND y personas del grupo.",
  ],
  [
    "Enfermero y caja",
    "Estado, motivo y composición del lote, fin de vacunación; dosis y vencimiento de la caja.",
  ],
  [
    "Acumuladores",
    "Colas, cajas y dosis, esperas, permanencias y tiempos ponderados.",
  ],
  [
    "Grupos presentes",
    "Lugares reutilizables por tipo: cada grupo conserva su lugar hasta retirarse.",
  ],
];

export default function SlideVectorMotor({ onComenzar }) {
  return (
    <section className="slide">
      <Reveal className="slide-cuerpo">
        <h2 className="slide-titulo">Vector de estado y motor</h2>
        <div className="columnas-slide columnas-con-diagrama">
          <div>
            <dl className="lista-definiciones lista-definiciones-compacta">
              {PARTES.map(([t, d]) => (
                <div key={t} className="definicion definicion-angosta">
                  <dt>{t}</dt>
                  <dd>{d}</dd>
                </div>
              ))}
            </dl>
            <p className="texto">
              Se muestran i filas desde la hora j y siempre la última (instante
              X), con los grupos que quedaron. Al seleccionar una fila, la{" "}
              <strong>foto del instante</strong> muestra el enfermero, la caja y
              cada grupo con su estado. El Excel exporta las mismas filas.
            </p>
            <button className="boton boton-primario" onClick={onComenzar}>
              Ir al simulador
            </button>
          </div>
          <FlujoMotor />
        </div>
      </Reveal>
    </section>
  );
}
