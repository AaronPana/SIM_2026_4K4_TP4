// Uniforme discreta entre dos enteros, todos con igual probabilidad: X = mínimo + ⌊RND · (máximo − mínimo + 1)⌋.
// Se usa para la cantidad de personas de cada grupo (1 a 4).
export function uniformeDiscreta(rnd, minimo, maximo) {
  return minimo + Math.floor(rnd * (maximo - minimo + 1));
}
