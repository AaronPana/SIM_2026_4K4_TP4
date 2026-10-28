// Exporta a Excel lo mismo que muestra la tabla: filas desde la hora j + la última fila.
// Los decimales se truncan a la precisión que se ve en pantalla (6 si es "completa").
import { crearLibro, ESTILO } from "./escritorXlsx.js";
import {
  construirColumnas,
  aplanarColumnas,
} from "../config/columnasVector.js";
import {
  DOSIS_POR_CAJA_COVID,
  DOSIS_POR_CAJA_GRIPE,
  PERSONAS_MINIMO_POR_GRUPO,
  MINIMO_PACIENTES_ABRIR_CAJA_COVID,
} from "../config/constantes.js";
import { CRITERIOS_DEL_MODELO } from "../utils/descripcionCriterios.js";
import { resumenEstadisticas } from "../utils/resumenEstadisticas.js";
import { decimalesVisibles } from "../utils/formato.js";
import { crearTruncador } from "../utils/truncar.js";

// Trunca solo números; null y textos pasan sin cambios.
const truncarNumero = (truncar, v) => (typeof v === "number" ? truncar(v) : v);

const COLOR_ENCABEZADO = "FF1B2430";
// Mismo color de encabezado por objeto que en pantalla.
const COLOR_OBJETO = {
  general: "FF2F3B4C",
  covid: "FF2F5D8A",
  gripe: "FF2E7D6B",
  enfermero: "FF5A4A8A",
  caja: "FF3F6E5F",
};

// Fila de encabezado: todas sus celdas con el mismo estilo.
const encabezado = (textos, estilo) =>
  textos.map((valor) => ({ valor, estilo }));

// Hoja del vector: encabezado agrupado en dos filas, como en pantalla. Las filas se generan de a una.
function hojaVector(libro, resultado, truncar) {
  const grupos = construirColumnas({ lugares: resultado.lugares });
  const columnas = aplanarColumnas(grupos);
  const estiloTitulos = libro.estiloEncabezado(COLOR_ENCABEZADO);

  // Fila 1: nombre del grupo en su primera columna, el resto combinado con el mismo color.
  const filaGrupos = [];
  const combinadas = [];
  for (const g of grupos) {
    const estilo = libro.estiloEncabezado(
      COLOR_OBJETO[g.objeto] ?? COLOR_OBJETO.general,
    );
    const desde = filaGrupos.length;
    g.columnas.forEach((_, i) =>
      filaGrupos.push({ valor: i === 0 ? g.grupo : null, estilo }),
    );
    if (g.columnas.length > 1)
      combinadas.push({ fila: 1, desde, hasta: filaGrupos.length - 1 });
  }

  // Solo las columnas "decimal" se truncan; enteros, textos y estados van tal cual.
  const valores = (fila) =>
    columnas.map((c) => {
      const v = c.obtener(fila) ?? null;
      return c.tipo === "decimal" ? truncarNumero(truncar, v) : v;
    });

  function* filas() {
    yield filaGrupos;
    yield encabezado(
      columnas.map((c) => c.titulo),
      estiloTitulos,
    );
    for (const fila of resultado.filas) {
      if (fila === resultado.ultima) break;
      yield valores(fila);
    }
    // Si la última fila quedó fuera de lo mostrado, se agrega igual, separada.
    if (!resultado.ultimaIncluida) yield ["…"];
    yield valores(resultado.ultima).map((valor) => ({
      valor,
      estilo: ESTILO.RESALTADO,
    }));
  }

  libro.agregarHoja({
    nombre: "Vector de estado",
    filas: filas(),
    anchos: columnas.map((c) => Math.max(10, c.titulo.length + 2)),
    combinadas,
    congelar: { columnas: 1, filas: 2 },
  });
}

// Hoja de estadísticas finales: lo pedido por el enunciado y las adicionales.
function hojaEstadisticas(libro, resultado, resumen, truncar) {
  const t = (v) => truncarNumero(truncar, v);
  const estilo = libro.estiloEncabezado(COLOR_ENCABEZADO);
  const filas = [
    ["Iteraciones simuladas", resultado.iteraciones],
    ["Reloj final (min)", t(resultado.relojFinal)],
    [
      "Corte",
      resultado.cortePor === "tiempo" ? "Tiempo X" : "Tope de iteraciones",
    ],
    [],
  ];
  for (const [titulo, items] of [
    ["Lo que pide el enunciado", resumen.pedidas],
    ["Estadísticas adicionales", resumen.adicionales],
  ]) {
    filas.push(encabezado([titulo, "Valor", "Unidad"], estilo));
    items.forEach((d) =>
      filas.push([
        d.etiqueta,
        t(d.valor),
        d.tipo === "proporcion" ? "proporción (0 a 1)" : (d.unidad ?? ""),
      ]),
    );
    filas.push([]);
  }
  libro.agregarHoja({ nombre: "Estadísticas", filas, anchos: [58, 18, 20] });
}

// Hoja de parámetros usados en la corrida, tal como se cargaron.
function hojaParametros(libro, p) {
  const e = p.ejecucion;
  const filas = [
    encabezado(
      ["Grupo", "Parámetro", "Valor", "Unidad"],
      libro.estiloEncabezado(COLOR_ENCABEZADO),
    ),
    ["Ejecución", "Tiempo a simular (X)", e.tiempoSimulacionMinutos, "min"],
    ["Ejecución", "Tope de iteraciones", e.topeIteraciones, "filas"],
    ["Ejecución", "Mostrar desde la hora (j)", e.horaDesdeMinutos, "min"],
    ["Ejecución", "Filas a mostrar (i)", e.cantidadFilas, "filas"],
    [
      "Ejecución",
      "Precisión",
      e.precision === "completa" ? "Completa" : `${e.precision} decimales`,
      "truncado",
    ],
    ["Generador", "Semilla X0", p.generador.semilla, ""],
    ["Generador", "Constante multiplicativa a", p.generador.a, ""],
    ["Generador", "Constante aditiva c", p.generador.c, ""],
    ["Generador", "Módulo m", p.generador.m, ""],
    ["Llegadas COVID", "Llegadas", p.llegadas.covidCantidadLlegadas, "grupos"],
    ["Llegadas COVID", "Cada", p.llegadas.covidCadaMinutos, "min"],
    [
      "Llegadas gripe",
      "Media entre llegadas",
      p.llegadas.gripeMediaMinutos,
      "min",
    ],
    [
      "Personas por grupo",
      "Mínimo (fijo)",
      PERSONAS_MINIMO_POR_GRUPO,
      "personas",
    ],
    [
      "Personas por grupo",
      "Máximo",
      p.llegadas.personasMaximoPorGrupo,
      "personas",
    ],
    ["Vacunación", "Tiempo por persona", p.vacunacion.segundosPorPersona, "s"],
    [
      "Vacunación",
      "Vencimiento caja de gripe",
      p.vacunacion.vencimientoCajaGripeMinutos,
      "min",
    ],
    ["Cajas (fijo)", "Dosis por caja COVID", DOSIS_POR_CAJA_COVID, "dosis"],
    [
      "Cajas (fijo)",
      "Mínimo de pacientes para abrir COVID",
      MINIMO_PACIENTES_ABRIR_CAJA_COVID,
      "pacientes",
    ],
    ["Cajas (fijo)", "Dosis por caja gripe", DOSIS_POR_CAJA_GRIPE, "dosis"],
  ];
  libro.agregarHoja({ nombre: "Parámetros", filas, anchos: [20, 38, 14, 12] });
}

// Hoja con los criterios del modelo con que se corrió (ver config/criteriosModelo.js).
function hojaCriterios(libro) {
  const filas = [
    encabezado(
      ["Criterio", "Valor usado", "Qué significa"],
      libro.estiloEncabezado(COLOR_ENCABEZADO),
    ),
    ...CRITERIOS_DEL_MODELO.map((c) => [c.criterio, c.valor, c.detalle]),
  ];
  libro.agregarHoja({
    nombre: "Criterios del modelo",
    filas,
    anchos: [36, 80, 70],
  });
}

export async function exportarExcel(resultado) {
  const libro = crearLibro();
  const resumen = resumenEstadisticas(resultado);
  // Misma cantidad de decimales que en pantalla (6 si la precisión es completa).
  const truncar = crearTruncador(
    decimalesVisibles(resultado.parametros.ejecucion.precision),
  );
  hojaVector(libro, resultado, truncar);
  hojaEstadisticas(libro, resultado, resumen, truncar);
  hojaParametros(libro, resultado.parametros);
  hojaCriterios(libro);

  const blob = await libro.generarBlob();
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), {
    href: url,
    download: "SIM_2026_4K4_TP4.xlsx",
  });
  link.click();
  URL.revokeObjectURL(url);
}
