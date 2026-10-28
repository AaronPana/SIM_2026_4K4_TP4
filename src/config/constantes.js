// Datos fijos del trabajo. Se editan acá y se reflejan en toda la app.

// Datos de la portada. Si grupo o integrantes quedan vacíos, no se muestran.
export const PORTADA = {
  titulo: "Simulación de un vacunatorio",
  subtitulo: "Trabajo Práctico 4 — Simulación de colas · Vacunatorio B",
  materia: "Simulación",
  curso: "4K4",
  anio: 2026,
  facultad: "UTN — Facultad Regional Córdoba",
  grupo: "",
  integrantes: [],
};

// Opciones de precisión. "completa" no trunca; el resto trunca a esa cantidad de decimales.
export const PRECISIONES = [
  { valor: "completa", etiqueta: "Completa" },
  { valor: 4, etiqueta: "4 decimales" },
  { valor: 3, etiqueta: "3 decimales" },
  { valor: 2, etiqueta: "2 decimales" },
];

// Tope que exige el enunciado: hasta 100.000 iteraciones o el tiempo X, lo que ocurra primero.
export const MAX_ITERACIONES = 100_000;

// Decimales con los que se muestran en pantalla los valores de precisión completa.
export const DECIMALES_PANTALLA_COMPLETA = 6;

// Valores del modelo que no están en rojo en el enunciado: fijos, editables solo desde el código.
export const DOSIS_POR_CAJA_COVID = 5;
export const DOSIS_POR_CAJA_GRIPE = 10;
export const PERSONAS_MINIMO_POR_GRUPO = 1;

// Una caja de COVID solo se abre si hay al menos tantos pacientes como dosis trae.
export const MINIMO_PACIENTES_ABRIR_CAJA_COVID = DOSIS_POR_CAJA_COVID;
