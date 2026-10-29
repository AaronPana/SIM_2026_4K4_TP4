// Ciclo del motor de eventos: de la inicialización al fin de simulación o al tope de iteraciones.
import { TEXTO_ORDEN_LLEGADAS_INICIALES } from "../../utils/descripcionCriterios.js";

const PASOS = [
  `Inicialización: programar las primeras llegadas (${TEXTO_ORDEN_LLEGADAS_INICIALES})`,
  "Elegir el próximo evento (menor hora; empate → prioridad)",
  "Si supera X: el evento es Fin de simulación, en X",
  "Acumular tiempo ocupado y personas·Δt hasta esa hora",
  "Avanzar el reloj y ejecutar la rutina del evento",
  "¿Reloj ≥ j y faltan filas por mostrar? → copiar la fila",
];
const X = 20;
const W = 530;
const H = 40;
const GAP = 14;

export default function FlujoMotor() {
  const yFin = PASOS.length * (H + GAP);
  return (
    <svg
      className="flujo"
      viewBox={`0 0 ${X + W + 70} ${yFin + H + 8}`}
      role="img"
      aria-label="Ciclo del motor de eventos"
    >
      <defs>
        <marker
          id="flecha-motor"
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
      {PASOS.map((texto, i) => {
        const y = i * (H + GAP);
        return (
          <g key={i}>
            <rect
              x={X}
              y={y}
              width={W}
              height={H}
              rx="8"
              className={`flujo-paso ${i === 0 ? "flujo-inicio" : ""} ${i === 5 ? "es-decision" : ""}`}
            />
            <text x={X + 14} y={y + 26} className="flujo-texto">
              {texto}
            </text>
            <line
              x1={X + W / 2}
              y1={y + H}
              x2={X + W / 2}
              y2={y + H + GAP - 2}
              className="flujo-linea"
              markerEnd="url(#flecha-motor)"
            />
          </g>
        );
      })}
      <rect x={X} y={yFin} width={W} height={H} rx="20" className="flujo-fin" />
      <text x={X + 14} y={yFin + 26} className="flujo-texto">
        ¿Fin de simulación o tope de iteraciones? No: volver · Sí: fin
      </text>
      <path
        d={`M${X + W},${yFin + H / 2} H${X + W + 44} V${H + GAP + H / 2} H${X + W + 4}`}
        className="flujo-linea"
        markerEnd="url(#flecha-motor)"
      />
    </svg>
  );
}
