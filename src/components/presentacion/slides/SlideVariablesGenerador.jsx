// Slide 5: variables aleatorias con su fórmula reemplazada y el generador compartido.
import Reveal from "../Reveal.jsx";
import { PARAMETROS_POR_DEFECTO as P } from "../../../config/parametrosPorDefecto.js";
import { PERSONAS_MINIMO_POR_GRUPO } from "../../../config/constantes.js";
import {
  ORDEN_LLEGADAS_INICIALES,
  ORDEN_RND_EN_LLEGADA,
  RND_EN_LLEGADA,
} from "../../../config/criteriosModelo.js";
import {
  crearGCM,
  longitudCiclo,
} from "../../../domain/generadores/congruencialMixto.js";
import { ejecutarSimulacion } from "../../../domain/motor.js";
import {
  NOMBRE_VACUNA,
  EVENTO_LLEGADA,
} from "../../../domain/vacunatorio/vocabulario.js";
import { formatearValor } from "../../../utils/formato.js";
import {
  TEXTO_ORDEN_LLEGADAS_INICIALES,
  TEXTO_ORDEN_RND_EN_LLEGADA,
} from "../../../utils/descripcionCriterios.js";

const l = P.llegadas;
const g = P.generador;
const mediaCovid = (
  l.covidCadaMinutos / l.covidCantidadLlegadas
).toLocaleString("es-AR");
const rango = l.personasMaximoPorGrupo - PERSONAS_MINIMO_POR_GRUPO + 1;
const { ciclo } = longitudCiclo(g);

const VARIABLES = [
  [
    "Tiempo entre llegadas COVID",
    `Exp. negativa, media ${l.covidCadaMinutos} / ${l.covidCantidadLlegadas}`,
    `T = −${mediaCovid} · ln(1 − RND)`,
  ],
  [
    "Tiempo entre llegadas gripe",
    `Exp. negativa, media ${l.gripeMediaMinutos}`,
    `T = −${l.gripeMediaMinutos} · ln(1 − RND)`,
  ],
  [
    "Personas por grupo",
    `Uniforme discreta [${PERSONAS_MINIMO_POR_GRUPO}; ${l.personasMaximoPorGrupo}]`,
    `N = ${PERSONAS_MINIMO_POR_GRUPO} + ⌊RND · ${rango}⌋`,
  ],
];

// Primeros RND de la secuencia y en qué variable se usó cada uno (sale de correr el motor).
function primerosUsos(cantidad) {
  const r = ejecutarSimulacion({
    ...P,
    ejecucion: { ...P.ejecucion, cantidadFilas: cantidad },
  });
  const usos = [];
  for (const fila of r.filas) {
    if (fila.fila === 0) {
      ORDEN_LLEGADAS_INICIALES.forEach((t) =>
        usos.push(`Próxima llegada ${NOMBRE_VACUNA[t]} (inicio)`),
      );
      continue;
    }
    const tipo = Object.keys(EVENTO_LLEGADA).find(
      (t) => EVENTO_LLEGADA[t] === fila.evento,
    );
    if (!tipo) continue;
    ORDEN_RND_EN_LLEGADA.forEach((paso) =>
      usos.push(
        paso === RND_EN_LLEGADA.PROXIMA_LLEGADA
          ? `Próxima llegada ${NOMBRE_VACUNA[tipo]} (fila ${fila.fila})`
          : `Personas del grupo ${NOMBRE_VACUNA[tipo]} (fila ${fila.fila})`,
      ),
    );
  }
  const gcm = crearGCM(g);
  return usos
    .slice(0, cantidad)
    .map((uso, i) => ({ n: i + 1, ...gcm.siguiente(), uso }));
}
const USOS = primerosUsos(6);

export default function SlideVariablesGenerador() {
  return (
    <section className="slide">
      <Reveal className="slide-cuerpo">
        <h2 className="slide-titulo">
          Variables aleatorias y generador compartido
        </h2>
        <table className="tabla-slide tabla-slide-compacta">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Distribución</th>
              <th>Fórmula con los valores del caso</th>
            </tr>
          </thead>
          <tbody>
            {VARIABLES.map(([v, d, f]) => (
              <tr key={v}>
                <td className="celda-codigo">{v}</td>
                <td>{d}</td>
                <td>{f}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="nota">
          La duración del lote ({P.vacunacion.segundosPorPersona} · N segundos)
          no es aleatoria: no usa RND.
        </p>
        <div className="columnas-slide">
          <div>
            <p className="formula formula-chica">
              X(n+1) = (a · X(n) + c) mod m · RND = X / m
            </p>
            <ul className="lista-simple">
              <li>
                Semilla {g.semilla}, a = {g.a}, c = {g.c}, m = {g.m}. El primer
                RND sale de X1.
              </li>
              <li>
                <strong>Un solo generador compartido</strong>: cada variable
                toma el siguiente número de la misma secuencia, en el orden en
                que se necesita.
              </li>
              <li>
                Orden: al inicio, {TEXTO_ORDEN_LLEGADAS_INICIALES}; en cada
                llegada, {TEXTO_ORDEN_RND_EN_LLEGADA}. Configurable en el
                código.
              </li>
              <li>
                Con m = {g.m} la secuencia se repite cada{" "}
                <strong>{ciclo} números</strong>: en corridas largas los RND se
                reciclan. Es propio de los parámetros, no un error.
              </li>
            </ul>
          </div>
          <table className="tabla-slide tabla-slide-compacta">
            <caption>Primeros RND y dónde se usaron</caption>
            <thead>
              <tr>
                <th>n</th>
                <th>X(n)</th>
                <th>RND</th>
                <th>Uso</th>
              </tr>
            </thead>
            <tbody>
              {USOS.map((u) => (
                <tr key={u.n}>
                  <td>{u.n}</td>
                  <td>{u.x}</td>
                  <td>{formatearValor(u.rnd, "decimal", 4)}</td>
                  <td>{u.uso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </section>
  );
}
