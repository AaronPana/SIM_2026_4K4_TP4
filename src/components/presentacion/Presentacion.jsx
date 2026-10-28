// Presentación: arma el deck con las 8 slides en orden.
import Deck from "./Deck.jsx";
import SlidePortada from "./slides/SlidePortada.jsx";
import SlideCaso from "./slides/SlideCaso.jsx";
import SlideReglas from "./slides/SlideReglas.jsx";
import SlideObjetosEventos from "./slides/SlideObjetosEventos.jsx";
import SlideVariablesGenerador from "./slides/SlideVariablesGenerador.jsx";
import SlideEstadisticas from "./slides/SlideEstadisticas.jsx";
import SlideDecisiones from "./slides/SlideDecisiones.jsx";
import SlideVectorMotor from "./slides/SlideVectorMotor.jsx";

export default function Presentacion({ onComenzar }) {
  return (
    <Deck>
      <SlidePortada onComenzar={onComenzar} />
      <SlideCaso />
      <SlideReglas />
      <SlideObjetosEventos />
      <SlideVariablesGenerador />
      <SlideEstadisticas />
      <SlideDecisiones />
      <SlideVectorMotor onComenzar={onComenzar} />
    </Deck>
  );
}
