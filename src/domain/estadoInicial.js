// Carga un estado inicial sobre el sistema vacío y valida que sea coherente.
// Si hay errores, la simulación no arranca y se muestran en el aviso de error.
import {
  DOSIS_POR_CAJA_COVID,
  DOSIS_POR_CAJA_GRIPE,
  PERSONAS_MINIMO_POR_GRUPO,
} from "../config/constantes.js";
import {
  TIPO_VACUNA,
  NOMBRE_VACUNA,
  ESTADO_GRUPO,
  ESTADO_VACUNANDO,
} from "./vacunatorio/vocabulario.js";
import { crearGrupo, primerLugarLibre } from "./vacunatorio/grupos.js";

const TIPOS = Object.values(TIPO_VACUNA);
const esEntero = (v) => Number.isInteger(v) && v >= 0;

// Revisa el estado contra las reglas del modelo y los parámetros cargados. Devuelve la lista de problemas.
export function validarEstadoInicial(estado, ctx) {
  const {
    personasMaximoPorGrupo,
    segundosPorPersona,
    vencimientoCajaGripeMinutos,
  } = ctx;
  const errores = [];
  const tiposEnLote = new Set();
  const personasEnLote = { COVID: 0, GRIPE: 0 };
  let gruposGripeEnLote = 0;

  for (const tipo of TIPOS) {
    estado.grupos[tipo].forEach((g, i) => {
      const nombre = `Grupo ${NOMBRE_VACUNA[tipo]} ${i + 1}`;
      if (![g.vacunados, g.enLote, g.pendientes, g.tamanio].every(esEntero))
        errores.push(
          `${nombre}: tamaño, vacunados, en lote y pendientes deben ser enteros ≥ 0.`,
        );
      if (g.vacunados + g.enLote + g.pendientes !== g.tamanio)
        errores.push(
          `${nombre}: vacunados + en lote + pendientes debe dar el tamaño.`,
        );
      if (
        g.tamanio < PERSONAS_MINIMO_POR_GRUPO ||
        g.tamanio > personasMaximoPorGrupo
      )
        errores.push(
          `${nombre}: el tamaño debe estar entre ${PERSONAS_MINIMO_POR_GRUPO} y ${personasMaximoPorGrupo}.`,
        );
      if (g.pendientes === 0 && g.enLote === 0)
        errores.push(
          `${nombre}: ya está vacunado completo; no debería seguir en el sistema.`,
        );
      if (!(g.horaLlegada <= 0))
        errores.push(`${nombre}: la hora de llegada debe ser ≤ 0 (ya llegó).`);
      // Gripe no parte grupos: un grupo en lote entra completo y nunca queda con vacunados.
      if (
        tipo === TIPO_VACUNA.GRIPE &&
        (g.vacunados > 0 || (g.enLote > 0 && g.pendientes > 0))
      )
        errores.push(
          `${nombre}: en gripe el grupo entra completo al lote; no puede tener vacunados ni quedar con pendientes estando en lote.`,
        );
      if (tipo === TIPO_VACUNA.GRIPE && g.enLote > 0) gruposGripeEnLote++;
      if (g.enLote > 0) tiposEnLote.add(tipo);
      personasEnLote[tipo] += g.enLote;
    });
  }

  // Lote en curso: de un solo tipo, del tamaño correcto y con hora de fin futura.
  const hayLote = tiposEnLote.size > 0;
  if (tiposEnLote.size > 1)
    errores.push("El lote en curso no puede mezclar COVID y gripe.");
  if (personasEnLote.COVID > 0 && personasEnLote.COVID !== DOSIS_POR_CAJA_COVID)
    errores.push(
      `Un lote de COVID tiene exactamente ${DOSIS_POR_CAJA_COVID} personas.`,
    );
  if (gruposGripeEnLote > 1)
    errores.push("Un lote de gripe es un solo grupo, completo.");
  if (hayLote && !(estado.enfermero.finVacunacion > 0))
    errores.push(
      "Hay un lote en curso: el fin de vacunación debe ser mayor a 0.",
    );
  if (!hayLote && estado.enfermero.finVacunacion !== null)
    errores.push("No hay grupos en lote: el fin de vacunación debe ser null.");

  // El lote ya empezó, así que no puede terminar más tarde que su duración completa contada desde ahora.
  const duracionLote =
    ((personasEnLote.COVID + personasEnLote.GRIPE) * segundosPorPersona) / 60;
  if (hayLote && estado.enfermero.finVacunacion > duracionLote + 1e-9)
    errores.push(
      `El lote en curso dura ${duracionLote.toLocaleString("es-AR", { maximumFractionDigits: 4 })} min: el fin de vacunación no puede ser mayor.`,
    );

  const ultimo = estado.enfermero.ultimoTipoAplicado;
  if (ultimo !== null && ultimo !== undefined && !TIPOS.includes(ultimo))
    errores.push(
      `El último tipo aplicado debe ser ${TIPOS.join(" o ")} (o null).`,
    );

  const caja = estado.cajaGripe;
  if (caja) {
    if (
      !Number.isInteger(caja.dosisRestantes) ||
      caja.dosisRestantes < 1 ||
      caja.dosisRestantes > DOSIS_POR_CAJA_GRIPE
    )
      errores.push(
        `La caja de gripe debe tener entre 1 y ${DOSIS_POR_CAJA_GRIPE} dosis.`,
      );
    if (!(caja.horaApertura <= 0))
      errores.push(
        "La caja de gripe tiene que haberse abierto antes del inicio (≤ 0).",
      );
    if (!(caja.horaVencimiento > 0))
      errores.push("La caja de gripe debe vencer después del inicio (> 0).");
    // Tiene que respetar el vencimiento cargado en el formulario.
    if (
      Math.abs(
        caja.horaVencimiento - caja.horaApertura - vencimientoCajaGripeMinutos,
      ) > 1e-9
    )
      errores.push(
        `La caja de gripe debe vencer ${vencimientoCajaGripeMinutos} min después de abierta (parámetro de vencimiento).`,
      );
  }

  for (const tipo of TIPOS) {
    const hora = estado.proximaLlegada[tipo];
    if (hora !== null && !(hora > 0))
      errores.push(
        `La próxima llegada de ${NOMBRE_VACUNA[tipo]} debe ser > 0 o null.`,
      );
  }
  return errores;
}

// Estado de un grupo según cómo están repartidas sus personas.
function estadoSegunPersonas({ vacunados, enLote, pendientes }) {
  if (enLote > 0)
    return pendientes > 0
      ? ESTADO_GRUPO.VACUNANDOSE_PARCIAL
      : ESTADO_GRUPO.VACUNANDOSE;
  return vacunados > 0 ? ESTADO_GRUPO.ESPERANDO_RESTO : ESTADO_GRUPO.ESPERANDO;
}

// Copia el estado inicial al sistema vacío (reloj 0). Lanza un error si el estado no es coherente.
export function cargarEstadoInicial(sistema, estado, ctx) {
  const errores = validarEstadoInicial(estado, ctx);
  if (errores.length)
    throw new Error(`Estado inicial inválido. ${errores.join(" ")}`);

  // Grupos: numerados desde 1 en orden de llegada; los nuevos siguen la numeración.
  for (const tipo of TIPOS) {
    for (const datos of estado.grupos[tipo]) {
      sistema.gruposLlegados[tipo]++;
      const grupo = crearGrupo({
        tipo,
        numero: sistema.gruposLlegados[tipo],
        tamanio: datos.tamanio,
        horaLlegada: datos.horaLlegada,
        lugar: primerLugarLibre(sistema.grupos[tipo]),
      });
      Object.assign(grupo, {
        vacunados: datos.vacunados,
        enLote: datos.enLote,
        pendientes: datos.pendientes,
        estado: estadoSegunPersonas(datos),
        // Si ya empezó a vacunarse, su espera ocurrió antes del inicio y no se vuelve a registrar.
        horaInicioVacunacion:
          datos.vacunados + datos.enLote > 0 ? datos.horaLlegada : null,
      });
      sistema.grupos[tipo].push(grupo);
    }
  }

  // Enfermero: el lote en curso sale de los grupos con personas en lote.
  const tipoLote =
    TIPOS.find((t) => sistema.grupos[t].some((g) => g.enLote > 0)) ?? null;
  if (tipoLote) {
    const composicion = sistema.grupos[tipoLote]
      .filter((g) => g.enLote > 0)
      .map((g) => ({ grupo: g.id, personas: g.enLote }));
    const personas = composicion.reduce((total, p) => total + p.personas, 0);
    Object.assign(sistema.enfermero, {
      estado: ESTADO_VACUNANDO[tipoLote],
      tipoLote,
      personasEnLote: personas,
      composicionLote: composicion,
      duracionLote: ctx.truncar((personas * ctx.segundosPorPersona) / 60),
      finVacunacion: estado.enfermero.finVacunacion,
      ultimoTipoAplicado: tipoLote,
    });
  } else {
    sistema.enfermero.ultimoTipoAplicado =
      estado.enfermero.ultimoTipoAplicado ?? null;
  }

  // La caja abierta antes del inicio es la "caja 0": no cuenta como colocada en el tiempo simulado.
  if (estado.cajaGripe) sistema.cajaGripe = { numero: 0, ...estado.cajaGripe };

  for (const tipo of TIPOS)
    sistema.proximaLlegada[tipo] = estado.proximaLlegada[tipo];
}
