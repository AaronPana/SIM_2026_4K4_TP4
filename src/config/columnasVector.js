// Esquema ÚNICO de columnas del vector de estado. Lo usan la tabla en pantalla y el Excel.
// Cada grupo de columnas tiene un "objeto" que da el color del encabezado.
import {
  TIPO_VACUNA,
  NOMBRE_VACUNA,
} from "../domain/vacunatorio/vocabulario.js";
import { formatearHora } from "../utils/tiempo.js";

// Columna genérica: clave, título, tipo de formato y cómo leer el valor de la fila.
const col = (clave, titulo, tipo, obtener) => ({
  clave,
  titulo,
  tipo,
  obtener,
});

// Bloque de llegada de un tipo: lo sorteado en ese evento y la próxima llegada programada.
const columnasLlegada = (tipo) => {
  const t = tipo.toLowerCase();
  return [
    col(
      `rndLlegada-${t}`,
      "RND llegada",
      "decimal",
      (f) => f.llegadas[tipo].rndProximaLlegada,
    ),
    col(
      `entreLlegadas-${t}`,
      "Tiempo entre llegadas",
      "decimal",
      (f) => f.llegadas[tipo].tiempoEntreLlegadas,
    ),
    col(
      `proxima-${t}`,
      "Próxima llegada",
      "decimal",
      (f) => f.llegadas[tipo].proximaLlegada,
    ),
    col(
      `rndTamanio-${t}`,
      "RND tamaño",
      "decimal",
      (f) => f.llegadas[tipo].rndTamanio,
    ),
    col(`tamanio-${t}`, "Personas", "entero", (f) => f.llegadas[tipo].tamanio),
  ];
};

// Bloque de un lugar de grupo (cliente temporal). El grupo conserva su lugar hasta retirarse.
const columnasLugar = (tipo, indice) => {
  const t = tipo.toLowerCase();
  const grupoEnLugar = (f) => f.grupos[tipo].find((g) => g.lugar === indice);
  const atributo = (nombre) => (f) => grupoEnLugar(f)?.[nombre] ?? null;
  return {
    grupo: `Grupo ${NOMBRE_VACUNA[tipo]} · lugar ${indice + 1}`,
    objeto: tipo === TIPO_VACUNA.COVID ? "covid" : "gripe",
    columnas: [
      col(`lugar-${t}-${indice}-id`, "Grupo", "texto", atributo("id")),
      col(
        `lugar-${t}-${indice}-estado`,
        "Estado",
        "estado",
        atributo("estado"),
      ),
      col(
        `lugar-${t}-${indice}-tamanio`,
        "Tamaño",
        "entero",
        atributo("tamanio"),
      ),
      col(
        `lugar-${t}-${indice}-vacunados`,
        "Vacunados",
        "entero",
        atributo("vacunados"),
      ),
      col(
        `lugar-${t}-${indice}-enLote`,
        "En lote",
        "entero",
        atributo("enLote"),
      ),
      col(
        `lugar-${t}-${indice}-pendientes`,
        "Pendientes",
        "entero",
        atributo("pendientes"),
      ),
      col(
        `lugar-${t}-${indice}-llegada`,
        "Hora llegada",
        "decimal",
        atributo("horaLlegada"),
      ),
    ],
  };
};

const porTipoCol = (prefijo, titulo, tipoFormato, leer) =>
  Object.values(TIPO_VACUNA).map((tipo) =>
    col(
      `${prefijo}-${tipo.toLowerCase()}`,
      `${titulo} ${NOMBRE_VACUNA[tipo]}`,
      tipoFormato,
      (f) => leer(f, tipo),
    ),
  );

// Arma los grupos de columnas. Los lugares dependen de cuántos grupos simultáneos hubo en lo mostrado.
export function construirColumnas({ lugares }) {
  const e = (f) => f.estadisticas;
  return [
    // Solo "Fila" queda anclada a la izquierda al hacer scroll horizontal.
    {
      grupo: "",
      objeto: "general",
      columnas: [col("fila", "Fila", "entero", (f) => f.fila)],
    },
    {
      grupo: "Evento y reloj",
      objeto: "general",
      columnas: [
        col("evento", "Evento", "texto", (f) => f.nombreEvento),
        col("reloj", "Reloj (min)", "decimal", (f) => f.reloj),
        col("hora", "Hora (hh:mm:ss)", "texto", (f) => formatearHora(f.reloj)),
      ],
    },
    {
      grupo: "Llegada grupo COVID",
      objeto: "covid",
      columnas: columnasLlegada(TIPO_VACUNA.COVID),
    },
    {
      grupo: "Llegada grupo gripe",
      objeto: "gripe",
      columnas: columnasLlegada(TIPO_VACUNA.GRIPE),
    },
    {
      grupo: "Enfermero (servidor)",
      objeto: "enfermero",
      columnas: [
        col("enfermero-estado", "Estado", "estado", (f) => f.enfermero.estado),
        col(
          "enfermero-motivo",
          "Motivo del lote",
          "texto",
          (f) => f.enfermero.motivoLote,
        ),
        col(
          "enfermero-composicion",
          "Composición del lote",
          "texto",
          (f) => f.enfermero.composicionLote,
        ),
        col(
          "enfermero-personas",
          "Personas en lote",
          "entero",
          (f) => f.enfermero.personasEnLote,
        ),
        col(
          "enfermero-duracion",
          "Duración lote (min)",
          "decimal",
          (f) => f.enfermero.duracionLote,
        ),
        col(
          "enfermero-fin",
          "Fin vacunación",
          "decimal",
          (f) => f.enfermero.finVacunacion,
        ),
        col("enfermero-ultimo", "Último tipo aplicado", "texto", (f) =>
          f.enfermero.ultimoTipoAplicado
            ? NOMBRE_VACUNA[f.enfermero.ultimoTipoAplicado]
            : null,
        ),
      ],
    },
    {
      grupo: "Caja de gripe abierta",
      objeto: "caja",
      columnas: [
        col("caja-estado", "Estado", "estado", (f) => f.cajaGripe.estado),
        col("caja-numero", "N° caja", "entero", (f) => f.cajaGripe.numero),
        col(
          "caja-dosis",
          "Dosis restantes",
          "entero",
          (f) => f.cajaGripe.dosisRestantes,
        ),
        col(
          "caja-apertura",
          "Hora apertura",
          "decimal",
          (f) => f.cajaGripe.horaApertura,
        ),
        col(
          "caja-vencimiento",
          "Vencimiento",
          "decimal",
          (f) => f.cajaGripe.horaVencimiento,
        ),
        col(
          "caja-novedad",
          "Novedad de caja",
          "texto",
          (f) => f.cajaGripe.novedad,
        ),
      ],
    },
    {
      grupo: "Colas",
      objeto: "general",
      columnas: [
        ...porTipoCol(
          "cola-personas",
          "Personas en cola",
          "entero",
          (f, t) => f.colas.personas[t],
        ),
        ...porTipoCol(
          "cola-grupos",
          "Grupos en cola",
          "entero",
          (f, t) => f.colas.grupos[t],
        ),
      ],
    },
    {
      grupo: "Cajas y dosis",
      objeto: "general",
      columnas: [
        col(
          "cajas-gripe",
          "Cajas gripe abiertas",
          "entero",
          (f) => e(f).cajasGripeAbiertas,
        ),
        col(
          "dosis-gripe",
          "Dosis gripe aplicadas",
          "entero",
          (f) => e(f).dosisGripeAplicadas,
        ),
        col(
          "descartadas-gripe",
          "Dosis gripe descartadas",
          "entero",
          (f) => e(f).dosisGripeDescartadas,
        ),
        col(
          "cajas-covid",
          "Cajas COVID abiertas",
          "entero",
          (f) => e(f).cajasCovidAbiertas,
        ),
        col(
          "dosis-covid",
          "Dosis COVID aplicadas",
          "entero",
          (f) => e(f).dosisCovidAplicadas,
        ),
      ],
    },
    ...Object.values(TIPO_VACUNA).map((tipo) => ({
      grupo: `Espera grupos ${NOMBRE_VACUNA[tipo]}`,
      objeto: "general",
      columnas: [
        col(
          `espera-acum-${tipo}`,
          "Σ espera (min)",
          "decimal",
          (f) => e(f).esperaAcumulada[tipo],
        ),
        col(
          `espera-cant-${tipo}`,
          "Grupos",
          "entero",
          (f) => e(f).gruposConEspera[tipo],
        ),
        col(
          `espera-prom-${tipo}`,
          "Promedio (min)",
          "decimal",
          (f) => e(f).esperaPromedio[tipo],
        ),
        col(
          `espera-max-${tipo}`,
          "Máxima (min)",
          "decimal",
          (f) => e(f).esperaMaxima[tipo],
        ),
      ],
    })),
    {
      grupo: "Permanencia",
      objeto: "general",
      columnas: [
        ...porTipoCol(
          "perm-acum",
          "Σ permanencia",
          "decimal",
          (f, t) => e(f).permanenciaAcumulada[t],
        ),
        ...porTipoCol(
          "perm-retirados",
          "Retirados",
          "entero",
          (f, t) => e(f).gruposRetirados[t],
        ),
      ],
    },
    {
      grupo: "Acumuladores de tiempo",
      objeto: "general",
      columnas: [
        col(
          "ocupado",
          "Tiempo ocupado enfermero",
          "decimal",
          (f) => e(f).tiempoOcupadoEnfermero,
        ),
        ...porTipoCol(
          "area",
          "Σ personas·Δt",
          "decimal",
          (f, t) => e(f).areaPersonasEnCola[t],
        ),
      ],
    },
    ...Array.from({ length: lugares.COVID }, (_, i) =>
      columnasLugar(TIPO_VACUNA.COVID, i),
    ),
    ...Array.from({ length: lugares.GRIPE }, (_, i) =>
      columnasLugar(TIPO_VACUNA.GRIPE, i),
    ),
  ];
}

// Lista plana de columnas (útil para recorrer celdas).
export const aplanarColumnas = (grupos) => grupos.flatMap((g) => g.columnas);
