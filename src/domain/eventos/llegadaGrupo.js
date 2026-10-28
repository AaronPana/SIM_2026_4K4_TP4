// Eventos de llegada: un grupo de COVID o de gripe entra al vacunatorio.
import { PERSONAS_MINIMO_POR_GRUPO } from "../../config/constantes.js";
import {
  ORDEN_RND_EN_LLEGADA,
  RND_EN_LLEGADA,
} from "../../config/criteriosModelo.js";
import { exponencial } from "../distribuciones/exponencial.js";
import { uniformeDiscreta } from "../distribuciones/uniformeDiscreta.js";
import { crearGrupo, primerLugarLibre } from "../vacunatorio/grupos.js";
import { intentarIniciarLote } from "../vacunatorio/enfermero.js";

// Sortea el tiempo hasta la próxima llegada de un tipo y la programa. Devuelve lo sorteado.
export function programarProximaLlegada(sistema, tipo, ctx) {
  const rnd = ctx.sortearRnd();
  const tiempoEntreLlegadas = ctx.truncar(
    exponencial(rnd, ctx.mediaEntreLlegadas[tipo]),
  );
  sistema.proximaLlegada[tipo] = ctx.truncar(
    sistema.reloj + tiempoEntreLlegadas,
  );
  return { rndProximaLlegada: rnd, tiempoEntreLlegadas };
}

// Sortea cuántas personas trae el grupo que llega (uniforme discreta de 1 al máximo).
function sortearTamanioGrupo(ctx) {
  const rnd = ctx.sortearRnd();
  const tamanio = uniformeDiscreta(
    rnd,
    PERSONAS_MINIMO_POR_GRUPO,
    ctx.personasMaximoPorGrupo,
  );
  return { rndTamanio: rnd, tamanio };
}

// Llegada de un grupo: sortea en el orden configurado, lo pone en su cola y, si el enfermero
// está libre, intenta arrancar un lote.
export function procesarLlegadaGrupo(sistema, tipo, ctx, novedades) {
  let sorteo = {};
  for (const paso of ORDEN_RND_EN_LLEGADA) {
    if (paso === RND_EN_LLEGADA.PROXIMA_LLEGADA) {
      sorteo = { ...sorteo, ...programarProximaLlegada(sistema, tipo, ctx) };
    } else {
      sorteo = { ...sorteo, ...sortearTamanioGrupo(ctx) };
    }
  }
  novedades.llegadas[tipo] = sorteo;

  sistema.gruposLlegados[tipo]++;
  const gruposDelTipo = sistema.grupos[tipo];
  gruposDelTipo.push(
    crearGrupo({
      tipo,
      numero: sistema.gruposLlegados[tipo],
      tamanio: sorteo.tamanio,
      horaLlegada: sistema.reloj,
      lugar: primerLugarLibre(gruposDelTipo),
    }),
  );

  intentarIniciarLote(sistema, ctx, novedades);
}
