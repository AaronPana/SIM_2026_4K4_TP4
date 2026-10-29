// Diagrama del sistema: llegadas → colas → enfermero (con sus cajas) → retiro del grupo.
// Los textos toman los valores por defecto, así coinciden con el formulario.
import { PARAMETROS_POR_DEFECTO as P } from "../../config/parametrosPorDefecto.js";
import {
  DOSIS_POR_CAJA_COVID,
  DOSIS_POR_CAJA_GRIPE,
  MINIMO_PACIENTES_ABRIR_CAJA_COVID,
  PERSONAS_MINIMO_POR_GRUPO,
} from "../../config/constantes.js";
import { minutosAHoras } from "../../utils/tiempo.js";

const l = P.llegadas;
const mediaCovid = (
  l.covidCadaMinutos / l.covidCantidadLlegadas
).toLocaleString("es-AR");
const personas = `${PERSONAS_MINIMO_POR_GRUPO} a ${l.personasMaximoPorGrupo} personas`;
const vence = minutosAHoras(
  P.vacunacion.vencimientoCajaGripeMinutos,
).toLocaleString("es-AR");

// Nodo con título y hasta dos renglones de detalle.
function Nodo({ x, y, w, h, clase, titulo, lineas = [] }) {
  const inicio = y + h / 2 - lineas.length * 10;
  return (
    <g className={`nodo ${clase}`}>
      <rect x={x} y={y} width={w} height={h} rx="8" />
      <text x={x + w / 2} y={inicio + 4} className="nodo-titulo">
        {titulo}
      </text>
      {lineas.map((linea, i) => (
        <text
          key={i}
          x={x + w / 2}
          y={inicio + 24 + i * 19}
          className="nodo-detalle"
        >
          {linea}
        </text>
      ))}
    </g>
  );
}

// Curva suave entre dos puntos.
const curva = (p, q) => {
  const mx = (p.x + q.x) / 2;
  return `M${p.x},${p.y} C${mx},${p.y} ${mx},${q.y} ${q.x},${q.y}`;
};

export default function FlujoVacunatorio({ oscuro = false }) {
  return (
    <svg
      className={`diagrama ${oscuro ? "diagrama-oscuro" : ""}`}
      viewBox="0 0 940 310"
      role="img"
      aria-label="Flujo del vacunatorio: llegadas, colas, enfermero y retiro"
    >
      <defs>
        <marker
          id="flecha-vac"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="9"
          markerHeight="9"
          markerUnits="userSpaceOnUse"
          orient="auto"
        >
          <path d="M0,0 L10,5 L0,10 z" className="diagrama-flecha" />
        </marker>
      </defs>

      <path
        d={curva({ x: 190, y: 62 }, { x: 236, y: 62 })}
        className="arista arista-covid"
        markerEnd="url(#flecha-vac)"
      />
      <path
        d={curva({ x: 190, y: 248 }, { x: 236, y: 248 })}
        className="arista arista-gripe"
        markerEnd="url(#flecha-vac)"
      />
      <path
        d={curva({ x: 430, y: 62 }, { x: 506, y: 135 })}
        className="arista arista-covid"
        markerEnd="url(#flecha-vac)"
      />
      <path
        d={curva({ x: 430, y: 248 }, { x: 506, y: 175 })}
        className="arista arista-gripe"
        markerEnd="url(#flecha-vac)"
      />
      <path
        d={curva({ x: 706, y: 155 }, { x: 756, y: 155 })}
        className="arista"
        markerEnd="url(#flecha-vac)"
      />

      <text x="470" y="88" className="arista-etiqueta">
        caja de {DOSIS_POR_CAJA_COVID} dosis
      </text>
      <text x="470" y="232" className="arista-etiqueta">
        caja de {DOSIS_POR_CAJA_GRIPE} · vence en {vence} h
      </text>

      <Nodo
        x={10}
        y={22}
        w={180}
        h={80}
        clase="nodo-covid"
        titulo="Grupos COVID"
        lineas={[personas, `cada ${mediaCovid} min (media)`]}
      />
      <Nodo
        x={10}
        y={208}
        w={180}
        h={80}
        clase="nodo-gripe"
        titulo="Grupos de gripe"
        lineas={[personas, `cada ${l.gripeMediaMinutos} min (media)`]}
      />
      <Nodo
        x={240}
        y={22}
        w={190}
        h={80}
        clase="nodo-covid"
        titulo="Cola COVID"
        lineas={[
          "por orden de llegada",
          `se atiende con ≥ ${MINIMO_PACIENTES_ABRIR_CAJA_COVID}`,
        ]}
      />
      <Nodo
        x={240}
        y={208}
        w={190}
        h={80}
        clase="nodo-gripe"
        titulo="Cola gripe"
        lineas={["por orden de llegada", "con cualquier cantidad"]}
      />
      <Nodo
        x={510}
        y={105}
        w={196}
        h={100}
        clase="nodo-enfermero"
        titulo="Enfermero"
        lineas={[
          "lotes de un tipo por vez",
          `${P.vacunacion.segundosPorPersona} s por persona`,
          "alterna COVID / gripe",
        ]}
      />
      <Nodo
        x={760}
        y={115}
        w={170}
        h={80}
        clase="nodo-salida"
        titulo="Se retira"
        lineas={["el grupo completo,", "todos vacunados"]}
      />
    </svg>
  );
}
