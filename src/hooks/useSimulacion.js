// Ejecuta el motor y guarda el resultado. El setTimeout deja que la UI muestre "Simulando…".
import { useState, useCallback } from "react";
import { ejecutarSimulacion } from "../domain/motor.js";

export function useSimulacion() {
  const [resultado, setResultado] = useState(null);
  const [corriendo, setCorriendo] = useState(false);
  const [error, setError] = useState(null);

  const ejecutar = useCallback((params) => {
    setCorriendo(true);
    setError(null);
    setTimeout(() => {
      try {
        setResultado(ejecutarSimulacion(params));
      } catch (e) {
        setError(`La simulación se interrumpió: ${e.message}`);
      } finally {
        setCorriendo(false);
      }
    }, 30);
  }, []);

  return { resultado, corriendo, error, ejecutar };
}
