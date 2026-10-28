// Contenedor de slides a pantalla completa: scroll vertical, teclado y puntos de navegación.
import { useEffect, useRef, useState, Children } from "react";

export default function Deck({ children }) {
  const deckRef = useRef(null);
  const [actual, setActual] = useState(0);
  const total = Children.count(children);

  // Slides renderizadas dentro del deck (cada hijo es una <section className="slide">).
  const slides = () =>
    Array.from(deckRef.current?.querySelectorAll(":scope > .slide") ?? []);

  const irA = (i) => {
    const destino = slides()[Math.max(0, Math.min(total - 1, i))];
    destino?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const deck = deckRef.current;
    // La slide actual es la más cercana al borde superior del deck.
    const indiceActual = () => {
      const tope = deck.getBoundingClientRect().top;
      const distancias = slides().map((s) =>
        Math.abs(s.getBoundingClientRect().top - tope),
      );
      return distancias.indexOf(Math.min(...distancias));
    };
    const onScroll = () => setActual(indiceActual());
    const onKey = (e) => {
      if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;
      const mapa = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 };
      if (e.key in mapa) {
        e.preventDefault();
        irA(indiceActual() + mapa[e.key]);
      } else if (e.key === "Home") irA(0);
      else if (e.key === "End") irA(total - 1);
    };
    deck.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      deck.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  return (
    <div className="deck" ref={deckRef}>
      {children}
      <nav className="deck-puntos" aria-label="Navegación de slides">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            className={`deck-punto ${i === actual ? "es-actual" : ""}`}
            onClick={() => irA(i)}
            aria-label={`Ir a la slide ${i + 1}`}
            aria-current={i === actual ? "step" : undefined}
          />
        ))}
      </nav>
      <p className="deck-ayuda">
        Flechas ↑ ↓ para navegar · {actual + 1} de {total}
      </p>
    </div>
  );
}
