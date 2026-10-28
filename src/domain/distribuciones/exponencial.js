// Exponencial negativa por transformada inversa: X = −μ·ln(1 − RND), con μ = media.
// Usamos (1 − RND) como en el apunte para poder replicar los mismos valores que la cátedra.
export function exponencial(rnd, media) {
  return -media * Math.log(1 - rnd);
}
