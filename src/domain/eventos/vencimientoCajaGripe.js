// Evento temporal: vencen las dosis sobrantes de la caja de gripe abierta y se descartan.
export function procesarVencimientoCajaGripe(sistema, novedades) {
  const caja = sistema.cajaGripe;
  sistema.estadisticas.dosisGripeDescartadas += caja.dosisRestantes;
  novedades.caja.push(
    `Vence caja ${caja.numero}: descarta ${caja.dosisRestantes}`,
  );
  sistema.cajaGripe = null;
}
