// Slide 7: decisiones del grupo sobre lo que el enunciado deja abierto.
import Reveal from "../Reveal.jsx";
import {
  TEXTO_ORDEN_LLEGADAS_INICIALES,
  TEXTO_ORDEN_RND_EN_LLEGADA,
  TEXTO_INTEGRANTE_ESPERA,
  TEXTO_INTEGRANTE_ESPERA_ALTERNATIVO,
  TEXTO_PRIORIDAD_EVENTOS,
} from "../../../utils/descripcionCriterios.js";

const DECISIONES = [
  [
    "Reloj en minutos",
    "X y j se cargan en horas o minutos (conversor); la vacunación en segundos. Todo se pasa a minutos.",
  ],
  [
    "Valores por defecto",
    "X = 24 h (atiende las 24 horas), vencimiento 1 h, j = 0, i = 100, tope 100.000.",
  ],
  [
    "Valores fijos",
    "Cajas de 5 y 10 dosis y mínimo de 1 persona: no están en rojo, quedan como constantes.",
  ],
  [
    "Orden de los RND",
    `Inicio: ${TEXTO_ORDEN_LLEGADAS_INICIALES}. En cada llegada: ${TEXTO_ORDEN_RND_EN_LLEGADA}.`,
  ],
  ["Lote de COVID", "Una caja por lote: exactamente 5 personas."],
  [
    "Lote de gripe",
    "Hasta las dosis que le quedan a la caja abierta (máximo 10).",
  ],
  [
    "Apertura de la caja de gripe",
    "Al iniciar un lote de gripe sin caja abierta.",
  ],
  [
    "Grupo partido",
    'Queda "Esperando resto" al frente de la cola; para el mínimo de 5 cuentan solo los pendientes.',
  ],
  [
    "Alternancia preferente",
    "Si no puede atender el tipo que le toca, atiende el otro. El primer lote lo decide quién llega primero.",
  ],
  [
    "Espera",
    `Hasta que empieza a vacunarse el ${TEXTO_INTEGRANTE_ESPERA} (opción "${TEXTO_INTEGRANTE_ESPERA_ALTERNATIVO}" disponible en el código).`,
  ],
  [
    "Vencimiento",
    "Descarta solo dosis no asignadas; la caja abierta al final no cuenta como descartada.",
  ],
  ["Eventos simultáneos", TEXTO_PRIORIDAD_EVENTOS],
];

export default function SlideDecisiones() {
  return (
    <section className="slide">
      <Reveal className="slide-cuerpo">
        <h2 className="slide-titulo">Decisiones del grupo</h2>
        <p className="slide-bajada">
          Lo que el enunciado deja abierto y cómo lo resolvimos. Las
          interpretaciones discutibles están en{" "}
          <code>config/criteriosModelo.js</code> para cambiarlas sin tocar la
          lógica.
        </p>
        <dl className="grilla-decisiones grilla-decisiones-compacta">
          {DECISIONES.map(([t, d]) => (
            <div key={t} className="decision">
              <dt>{t}</dt>
              <dd>{d}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
