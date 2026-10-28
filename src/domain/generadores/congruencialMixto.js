// Generador congruencial mixto: X(n+1) = (a·X(n) + c) mod m, RND = X / m ∈ [0; 1).
// En este TP hay uno solo y lo comparten todas las variables aleatorias.

// Crea un generador con estado propio. El primer RND sale de X1 (la semilla no se usa como RND).
export function crearGCM({ semilla, a, c, m }) {
  let x = semilla;
  return {
    siguiente() {
      x = (a * x + c) % m;
      return { x, rnd: x / m };
    },
  };
}

// Cantidad de números distintos antes de que la secuencia se repita (ciclo) y pasos previos (cola).
export function longitudCiclo({ semilla, a, c, m }) {
  const visto = new Map();
  let x = semilla;
  let paso = 0;
  while (!visto.has(x)) {
    visto.set(x, paso);
    x = (a * x + c) % m;
    paso++;
  }
  return { ciclo: paso - visto.get(x), cola: visto.get(x) };
}
