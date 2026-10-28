// "Foto del instante": todos los objetos presentes en la fila seleccionada, como tarjetas.
import { Fragment } from "react";
import {
  TIPO_VACUNA,
  NOMBRE_VACUNA,
  EVENTO,
  NOMBRE_EVENTO,
} from "../../domain/vacunatorio/vocabulario.js";
import { PRIORIDAD_EVENTOS_SIMULTANEOS } from "../../config/criteriosModelo.js";
import { formatearValor } from "../../utils/formato.js";
import { formatearHora } from "../../utils/tiempo.js";
import EstadoChip from "./EstadoChip.jsx";

// Eventos programados en ese instante (uno por tipo), ordenados por hora; si empatan, por la prioridad configurada.
// El primero es el que ocurre en la fila siguiente.
function proximosEventos({ llegadas, enfermero, cajaGripe }) {
  const prioridad = (evento) => PRIORIDAD_EVENTOS_SIMULTANEOS.indexOf(evento);
  return [
    { evento: EVENTO.LLEGADA_GRUPO_COVID, hora: llegadas.COVID.proximaLlegada },
    { evento: EVENTO.LLEGADA_GRUPO_GRIPE, hora: llegadas.GRIPE.proximaLlegada },
    { evento: EVENTO.FIN_VACUNACION, hora: enfermero.finVacunacion },
    { evento: EVENTO.VENCIMIENTO_CAJA_GRIPE, hora: cajaGripe.horaVencimiento },
  ]
    .filter((p) => p.hora !== null && p.hora !== undefined)
    .sort(
      (a, b) => a.hora - b.hora || prioridad(a.evento) - prioridad(b.evento),
    );
}

// Un punto por persona: vacunada, en el lote actual o pendiente.
function PersonasDelGrupo({ grupo }) {
  const puntos = [
    ...Array(grupo.vacunados).fill("vacunada"),
    ...Array(grupo.enLote).fill("en-lote"),
    ...Array(grupo.pendientes).fill("pendiente"),
  ];
  return (
    <span
      className="personas"
      aria-label={`${grupo.vacunados} vacunados, ${grupo.enLote} en lote, ${grupo.pendientes} pendientes`}
    >
      {puntos.map((clase, i) => (
        <span key={i} className={`persona persona-${clase}`} />
      ))}
    </span>
  );
}

function ColaDeGrupos({ tipo, grupos, precision }) {
  return (
    <div className={`foto-tarjeta foto-cola foto-${tipo.toLowerCase()}`}>
      <h4>
        Grupos {NOMBRE_VACUNA[tipo]}{" "}
        <span className="foto-contador">{grupos.length}</span>
      </h4>
      {grupos.length === 0 ? (
        <p className="nota">
          No hay grupos de {NOMBRE_VACUNA[tipo]} en el sistema.
        </p>
      ) : (
        <ul className="foto-grupos">
          {grupos.map((g) => (
            <li key={g.id} className="foto-grupo">
              <span className="foto-grupo-id">{g.id}</span>
              <EstadoChip estado={g.estado} />
              <PersonasDelGrupo grupo={g} />
              <span className="foto-grupo-dato">
                llegó {formatearValor(g.horaLlegada, "decimal", precision)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function FotoInstante({ fila, precision }) {
  if (!fila) {
    return (
      <p className="foto-vacia">
        Seleccioná una fila del vector para ver qué había en el vacunatorio en
        ese instante.
      </p>
    );
  }
  const f = (v) => formatearValor(v, "decimal", precision);
  const { enfermero, cajaGripe } = fila;
  const proximos = proximosEventos(fila);

  return (
    <div className="foto">
      <div className="foto-cabecera">
        <p>
          <strong>Fila {fila.fila}</strong> · {fila.nombreEvento} · reloj{" "}
          {f(fila.reloj)} min ({formatearHora(fila.reloj)})
        </p>
        <p className="nota">
          Próximos eventos programados, por hora:{" "}
          {proximos.map((p, i) => (
            <Fragment key={p.evento}>
              {i > 0 && " · "}
              <span className={i === 0 ? "proximo-evento-siguiente" : ""}>
                {NOMBRE_EVENTO[p.evento]} {f(p.hora)}
                {i === 0 && " (el siguiente)"}
              </span>
            </Fragment>
          ))}
        </p>
      </div>
      <div className="foto-grilla">
        <div className="foto-tarjeta">
          <h4>Enfermero</h4>
          <EstadoChip estado={enfermero.estado} />
          <dl className="foto-datos">
            <dt>Lote</dt>
            <dd>{enfermero.composicionLote ?? "—"}</dd>
            <dt>Termina</dt>
            <dd>{f(enfermero.finVacunacion)}</dd>
            <dt>Último tipo</dt>
            <dd>
              {enfermero.ultimoTipoAplicado
                ? NOMBRE_VACUNA[enfermero.ultimoTipoAplicado]
                : "—"}
            </dd>
          </dl>
        </div>
        <div className="foto-tarjeta">
          <h4>Caja de gripe</h4>
          <EstadoChip estado={cajaGripe.estado} />
          <dl className="foto-datos">
            <dt>Caja</dt>
            <dd>{cajaGripe.numero ?? "—"}</dd>
            <dt>Dosis</dt>
            <dd>{cajaGripe.dosisRestantes ?? "—"}</dd>
            <dt>Vence</dt>
            <dd>{f(cajaGripe.horaVencimiento)}</dd>
          </dl>
        </div>
        <ColaDeGrupos
          tipo={TIPO_VACUNA.COVID}
          grupos={fila.grupos.COVID}
          precision={precision}
        />
        <ColaDeGrupos
          tipo={TIPO_VACUNA.GRIPE}
          grupos={fila.grupos.GRIPE}
          precision={precision}
        />
      </div>
      <p className="nota foto-referencias">
        <span className="persona persona-vacunada" /> vacunada
        <span className="persona persona-en-lote" /> en el lote actual
        <span className="persona persona-pendiente" /> pendiente
      </p>
    </div>
  );
}
