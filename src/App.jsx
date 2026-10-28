// Alterna entre la presentación y el simulador. Parámetros y resultado viven acá para no perderse.
import { useState } from "react";
import { useParametros } from "./hooks/useParametros.js";
import { useSimulacion } from "./hooks/useSimulacion.js";
import Presentacion from "./components/presentacion/Presentacion.jsx";
import Simulador from "./components/simulador/Simulador.jsx";

export default function App() {
  const [vista, setVista] = useState("presentacion");
  const form = useParametros();
  const simulacion = useSimulacion();

  return vista === "presentacion" ? (
    <Presentacion onComenzar={() => setVista("simulador")} />
  ) : (
    <Simulador
      form={form}
      simulacion={simulacion}
      onVolver={() => setVista("presentacion")}
    />
  );
}
