// Slide 3: reglas del enfermero (alternancia y lotes) y de las cajas de vacunas.
import Reveal from "../Reveal.jsx";
import FlujoEnfermero from "../../diagramas/FlujoEnfermero.jsx";
import { PARAMETROS_POR_DEFECTO as P } from "../../../config/parametrosPorDefecto.js";
import {
  DOSIS_POR_CAJA_COVID,
  DOSIS_POR_CAJA_GRIPE,
  MINIMO_PACIENTES_ABRIR_CAJA_COVID,
} from "../../../config/constantes.js";
import { minutosAHoras } from "../../../utils/tiempo.js";

const vence = minutosAHoras(
  P.vacunacion.vencimientoCajaGripeMinutos,
).toLocaleString("es-AR");

const REGLAS = [
  [
    "Lotes",
    `Vacuna N personas juntas en ${P.vacunacion.segundosPorPersona} · N segundos. El lote se arma tomando personas de los grupos por orden de llegada.`,
  ],
  [
    "Alternancia preferente",
    "Le toca el tipo contrario al último lote. Si no puede atenderlo, atiende el otro; nunca queda libre si puede vacunar a alguien.",
  ],
  [
    "Caja de COVID",
    `${DOSIS_POR_CAJA_COVID} dosis, muy costosa: se abre solo con al menos ${MINIMO_PACIENTES_ABRIR_CAJA_COVID} pacientes pendientes. Cada lote de COVID usa una caja: exactamente ${DOSIS_POR_CAJA_COVID} personas.`,
  ],
  [
    "Caja de gripe",
    `${DOSIS_POR_CAJA_GRIPE} dosis. Se abre al iniciar un lote de gripe sin caja abierta. El lote llega hasta las dosis que le quedan; las sobrantes vencen ${vence} h después de abierta.`,
  ],
  [
    "Grupo partido",
    "Si el lote no alcanza para todo el grupo, se vacuna una parte y el resto espera al frente de la cola. El grupo se retira completo, con todos vacunados.",
  ],
  [
    "Dosis usadas",
    "Se descuentan al iniciar el lote. Si la caja se agota, su vencimiento se cancela.",
  ],
];

export default function SlideReglas() {
  return (
    <section className="slide">
      <Reveal className="slide-cuerpo">
        <h2 className="slide-titulo">Reglas del enfermero y de las cajas</h2>
        <div className="columnas-slide">
          <dl className="lista-definiciones lista-definiciones-compacta">
            {REGLAS.map(([t, d]) => (
              <div key={t} className="definicion definicion-angosta">
                <dt>{t}</dt>
                <dd>{d}</dd>
              </div>
            ))}
          </dl>
          <div>
            <h3 className="subtitulo">Qué hace cuando queda libre</h3>
            <FlujoEnfermero />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
