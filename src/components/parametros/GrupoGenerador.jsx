// Grupo 2: el único generador congruencial mixto, compartido por todas las variables aleatorias.
import CampoNumero from "./campos/CampoNumero.jsx";
import { longitudCiclo } from "../../domain/generadores/congruencialMixto.js";

// Calcular el ciclo recorre la secuencia entera: con módulos enormes trabaría la pantalla.
const MODULO_MAXIMO_PARA_CICLO = 2_000_000;

export default function GrupoGenerador({ form }) {
  const errorEnGenerador = Object.keys(form.errores).some((k) =>
    k.startsWith("generador."),
  );
  // El ciclo se calcula en vivo con los valores cargados, si son válidos y m no es enorme.
  const ciclo =
    errorEnGenerador || Number(form.raw.generador.m) > MODULO_MAXIMO_PARA_CICLO
      ? null
      : longitudCiclo({
          semilla: Number(form.raw.generador.semilla),
          a: Number(form.raw.generador.a),
          c: Number(form.raw.generador.c),
          m: Number(form.raw.generador.m),
        });

  return (
    <fieldset className="grupo">
      <legend>Generador congruencial mixto (compartido)</legend>
      <p className="nota">
        X(n+1) = (a · X(n) + c) mod m · RND = X / m · el primer RND sale de X1.
        Todas las variables toman el siguiente número de esta misma secuencia.
      </p>
      <div className="grilla-campos grilla-campos-4">
        <CampoNumero
          form={form}
          parametro="generador.semilla"
          etiqueta="Semilla X0"
          paso={1}
        />
        <CampoNumero
          form={form}
          parametro="generador.a"
          etiqueta="Constante multiplicativa a"
          paso={1}
        />
        <CampoNumero
          form={form}
          parametro="generador.c"
          etiqueta="Constante aditiva c"
          paso={1}
        />
        <CampoNumero
          form={form}
          parametro="generador.m"
          etiqueta="Módulo m"
          paso={1}
        />
      </div>
      {ciclo && (
        <p className="nota nota-destacada">
          Con estos valores la secuencia se repite cada{" "}
          {ciclo.ciclo.toLocaleString("es-AR")} números
          {ciclo.cola > 0
            ? ` (la semilla no vuelve a aparecer: ${ciclo.cola} número previo al ciclo)`
            : ""}
          .
        </p>
      )}
    </fieldset>
  );
}
