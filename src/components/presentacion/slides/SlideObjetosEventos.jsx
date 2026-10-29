// Slide 4: objetos (con estados y atributos), eventos y colas del sistema.
import Reveal from "../Reveal.jsx";
import {
  ESTADO_ENFERMERO,
  ESTADO_GRUPO,
  ESTADO_CAJA_GRIPE,
  NOMBRE_EVENTO,
  EVENTO,
} from "../../../domain/vacunatorio/vocabulario.js";
import { MINIMO_PACIENTES_ABRIR_CAJA_COVID } from "../../../config/constantes.js";
import { TEXTO_ORDEN_RND_EN_LLEGADA } from "../../../utils/descripcionCriterios.js";

const lista = (obj) => Object.values(obj).join(" · ");

const OBJETOS = [
  [
    "Enfermero",
    "Permanente · servidor",
    lista(ESTADO_ENFERMERO),
    "Último tipo aplicado, composición y personas del lote, fin de vacunación",
  ],
  [
    "Grupo COVID",
    "Temporal · cliente",
    lista(ESTADO_GRUPO),
    "Tamaño, vacunados, en lote, pendientes, hora de llegada",
  ],
  [
    "Grupo de gripe",
    "Temporal · cliente",
    lista(ESTADO_GRUPO),
    "Ídem; nunca se parte: un grupo completo por lote",
  ],
  [
    "Caja de gripe",
    "Temporal (mientras está abierta)",
    lista(ESTADO_CAJA_GRIPE),
    "Número, dosis restantes, hora de apertura y de vencimiento",
  ],
];

const EVENTOS = [
  [
    NOMBRE_EVENTO[EVENTO.LLEGADA_GRUPO_COVID],
    "Llegada",
    `Sortea ${TEXTO_ORDEN_RND_EN_LLEGADA}`,
  ],
  [NOMBRE_EVENTO[EVENTO.LLEGADA_GRUPO_GRIPE], "Llegada", "Ídem para gripe"],
  [
    NOMBRE_EVENTO[EVENTO.FIN_VACUNACION],
    "Fin de atención",
    "Se retiran los grupos completos; elige el próximo lote",
  ],
  [
    NOMBRE_EVENTO[EVENTO.VENCIMIENTO_CAJA_GRIPE],
    "Temporal",
    "Descarta las dosis sobrantes; la caja deja de existir",
  ],
  [
    NOMBRE_EVENTO[EVENTO.FIN_SIMULACION],
    "Temporal",
    "En el instante X: última fila",
  ],
];

export default function SlideObjetosEventos() {
  return (
    <section className="slide">
      <Reveal className="slide-cuerpo">
        <h2 className="slide-titulo">Objetos, eventos y colas</h2>
        <table className="tabla-slide tabla-slide-compacta">
          <thead>
            <tr>
              <th>Objeto</th>
              <th>Tipo</th>
              <th>Estados</th>
              <th>Otros atributos</th>
            </tr>
          </thead>
          <tbody>
            {OBJETOS.map(([o, t, e, a]) => (
              <tr key={o}>
                <td className="celda-codigo">{o}</td>
                <td>{t}</td>
                <td>{e}</td>
                <td>{a}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="columnas-slide">
          <table className="tabla-slide tabla-slide-compacta">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Tipo</th>
                <th>Qué hace</th>
              </tr>
            </thead>
            <tbody>
              {EVENTOS.map(([e, t, d]) => (
                <tr key={e}>
                  <td className="celda-codigo">{e}</td>
                  <td>{t}</td>
                  <td>{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="tabla-slide tabla-slide-compacta">
            <thead>
              <tr>
                <th>Cola</th>
                <th>Características</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="celda-codigo">Cola COVID</td>
                <td>
                  FIFO por grupo, sin límite ni abandono. Solo se atiende con ≥{" "}
                  {MINIMO_PACIENTES_ABRIR_CAJA_COVID} pendientes.
                </td>
              </tr>
              <tr>
                <td className="celda-codigo">Cola gripe</td>
                <td>
                  FIFO por grupo, sin límite ni abandono. Se atiende con
                  cualquier cantidad.
                </td>
              </tr>
              <tr>
                <td className="celda-codigo">Entre colas</td>
                <td>Alternancia preferente: un tipo por lote.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Reveal>
    </section>
  );
}
