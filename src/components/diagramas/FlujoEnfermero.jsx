// Decisión del enfermero cada vez que queda libre: alternancia preferente entre COVID y gripe.
import { MINIMO_PACIENTES_ABRIR_CAJA_COVID } from "../../config/constantes.js";

const ANCHO_IZQ = 360;
const ANCHO_DER = 190;
const X_DER = 420;
const ALTO = 46;

// Caja con texto centrado (una o dos líneas).
function Caja({ x, y, w, clase = "", lineas }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={ALTO}
        rx="8"
        className={`flujo-paso ${clase}`}
      />
      {lineas.map((t, i) => (
        <text
          key={i}
          x={x + w / 2}
          y={y + (lineas.length === 1 ? 29 : 19 + i * 18)}
          className="flujo-texto flujo-centrado"
        >
          {t}
        </text>
      ))}
    </g>
  );
}

const Flecha = ({ d, etiqueta, ex, ey }) => (
  <g>
    <path d={d} className="flujo-linea" markerEnd="url(#flecha-enf)" />
    {etiqueta && (
      <text x={ex} y={ey} className="flujo-etiqueta">
        {etiqueta}
      </text>
    )}
  </g>
);

export default function FlujoEnfermero() {
  const cx = 20 + ANCHO_IZQ / 2;
  return (
    <svg
      className="flujo"
      viewBox="0 0 630 392"
      role="img"
      aria-label="Decisión del enfermero al quedar libre"
    >
      <defs>
        <marker
          id="flecha-enf"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          markerUnits="userSpaceOnUse"
          orient="auto"
        >
          <path d="M0,0 L10,5 L0,10 z" className="diagrama-flecha" />
        </marker>
      </defs>

      <Caja
        x={20}
        y={6}
        w={ANCHO_IZQ}
        clase="flujo-inicio"
        lineas={[
          "Queda libre: terminó un lote",
          "o llegó un grupo con el enfermero libre",
        ]}
      />
      <Flecha d={`M${cx},52 V78`} />
      <Caja
        x={20}
        y={80}
        w={ANCHO_IZQ}
        lineas={["Le toca el tipo contrario al último lote"]}
      />
      <Flecha d={`M${cx},126 V152`} />
      <Caja
        x={20}
        y={154}
        w={ANCHO_IZQ}
        clase="es-decision"
        lineas={["¿Puede vacunar el tipo que le toca?"]}
      />
      <Flecha
        d={`M${20 + ANCHO_IZQ},177 H${X_DER - 2}`}
        etiqueta="Sí"
        ex={20 + ANCHO_IZQ + 14}
        ey={170}
      />
      <Caja
        x={X_DER}
        y={154}
        w={ANCHO_DER}
        clase="flujo-fin"
        lineas={["Lote del turno"]}
      />
      <Flecha d={`M${cx},200 V226`} etiqueta="No" ex={cx + 8} ey={218} />
      <Caja
        x={20}
        y={228}
        w={ANCHO_IZQ}
        clase="es-decision"
        lineas={["¿Puede vacunar el otro tipo?"]}
      />
      <Flecha
        d={`M${20 + ANCHO_IZQ},251 H${X_DER - 2}`}
        etiqueta="Sí"
        ex={20 + ANCHO_IZQ + 14}
        ey={244}
      />
      <Caja
        x={X_DER}
        y={228}
        w={ANCHO_DER}
        clase="flujo-fin"
        lineas={["Lote del otro tipo"]}
      />
      <Flecha d={`M${cx},274 V300`} etiqueta="No" ex={cx + 8} ey={292} />
      <Caja
        x={20}
        y={302}
        w={ANCHO_IZQ}
        lineas={["Queda libre hasta el próximo evento"]}
      />

      <text x="20" y="378" className="flujo-etiqueta">
        Puede vacunar COVID con ≥ {MINIMO_PACIENTES_ABRIR_CAJA_COVID} pendientes
        · gripe con ≥ 1 pendiente
      </text>
    </svg>
  );
}
