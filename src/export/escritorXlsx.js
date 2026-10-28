// Escritor de .xlsx mínimo que comprime fila por fila (fflate), sin armar todo el libro en memoria.
// Con 100.000 filas y más de 100 columnas una librería como exceljs agota la memoria del navegador.
import { Zip, ZipDeflate, strToU8 } from "fflate";

// Letra de columna de Excel: 0 → A, 25 → Z, 26 → AA.
function letraColumna(indice) {
  let letras = "";
  for (let n = indice + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    letras = String.fromCharCode(65 + ((n - 1) % 26)) + letras;
  }
  return letras;
}

const escaparXml = (texto) =>
  String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Estilos: 0 normal, 1 negrita, 2 resaltado (última fila); desde 3, encabezados con el color pedido.
function construirEstilos(coloresEncabezado) {
  const fills = coloresEncabezado.map(
    (c) =>
      `<fill><patternFill patternType="solid"><fgColor rgb="${c}"/><bgColor indexed="64"/></patternFill></fill>`,
  );
  const encabezados = coloresEncabezado.map(
    (_, i) =>
      `<xf numFmtId="0" fontId="1" fillId="${i + 3}" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>`,
  );
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="${3 + fills.length}"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFCE8A6"/><bgColor indexed="64"/></patternFill></fill>${fills.join("")}</fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="${3 + encabezados.length}"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>${encabezados.join("")}</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
}

export const ESTILO = { NORMAL: 0, NEGRITA: 1, RESALTADO: 2 };

// Crea un libro. Los colores de encabezado se registran con estiloEncabezado(color) antes de escribir.
export function crearLibro() {
  const colores = [];
  const hojas = [];
  return {
    // Devuelve el número de estilo para un encabezado con ese color de fondo (ARGB, ej. "FF1B2430").
    estiloEncabezado(color) {
      let i = colores.indexOf(color);
      if (i === -1) i = colores.push(color) - 1;
      return 3 + i;
    },
    // filas: iterable de filas; cada fila es un arreglo de valores o de { valor, estilo }.
    agregarHoja({
      nombre,
      filas,
      anchos = [],
      combinadas = [],
      congelar = null,
    }) {
      hojas.push({ nombre, filas, anchos, combinadas, congelar });
    },
    // Genera el .xlsx comprimiendo cada hoja de a bloques. Cede el control cada tanto para no congelar la pantalla.
    async generarBlob() {
      const partes = [];
      const zip = new Zip((err, datos) => {
        if (err) throw err;
        partes.push(datos);
      });
      const agregarArchivo = async (ruta, generarTexto) => {
        const archivo = new ZipDeflate(ruta, { level: 6 });
        zip.add(archivo);
        for await (const bloque of generarTexto())
          archivo.push(strToU8(bloque));
        archivo.push(new Uint8Array(0), true);
      };

      for (const [i, hoja] of hojas.entries()) {
        await agregarArchivo(`xl/worksheets/sheet${i + 1}.xml`, () =>
          xmlHoja(hoja),
        );
      }
      await agregarArchivo("xl/styles.xml", async function* () {
        yield construirEstilos(colores);
      });
      await agregarArchivo("xl/workbook.xml", async function* () {
        yield xmlLibro(hojas);
      });
      await agregarArchivo("xl/_rels/workbook.xml.rels", async function* () {
        yield xmlRelacionesLibro(hojas);
      });
      await agregarArchivo("[Content_Types].xml", async function* () {
        yield xmlTiposContenido(hojas);
      });
      await agregarArchivo("_rels/.rels", async function* () {
        yield `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
      });
      zip.end();
      return new Blob(partes, {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    },
  };
}

// Celda en XML: números como número, textos como texto en línea, vacíos se omiten.
function xmlCelda(celda, ref) {
  const { valor, estilo = ESTILO.NORMAL } =
    celda !== null && typeof celda === "object" ? celda : { valor: celda };
  const s = estilo ? ` s="${estilo}"` : "";
  if (valor === null || valor === undefined || valor === "")
    return estilo ? `<c r="${ref}"${s}/>` : "";
  if (typeof valor === "number" && Number.isFinite(valor))
    return `<c r="${ref}"${s}><v>${valor}</v></c>`;
  return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${escaparXml(valor)}</t></is></c>`;
}

const FILAS_POR_BLOQUE = 2000;

// XML de una hoja, generado de a bloques de filas.
async function* xmlHoja({ filas, anchos, combinadas, congelar }) {
  let cabecera =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">';
  if (congelar) {
    const celda = `${letraColumna(congelar.columnas)}${congelar.filas + 1}`;
    cabecera += `<sheetViews><sheetView workbookViewId="0"><pane xSplit="${congelar.columnas}" ySplit="${congelar.filas}" topLeftCell="${celda}" activePane="bottomRight" state="frozen"/></sheetView></sheetViews>`;
  }
  if (anchos.length) {
    cabecera += `<cols>${anchos.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("")}</cols>`;
  }
  yield cabecera + "<sheetData>";

  const letras = [];
  let numeroFila = 0;
  let bloque = [];
  for (const fila of filas) {
    numeroFila++;
    let xml = `<row r="${numeroFila}">`;
    fila.forEach((celda, i) => {
      letras[i] ??= letraColumna(i);
      xml += xmlCelda(celda, `${letras[i]}${numeroFila}`);
    });
    bloque.push(xml + "</row>");
    if (bloque.length === FILAS_POR_BLOQUE) {
      yield bloque.join("");
      bloque = [];
      await new Promise((r) => setTimeout(r, 0));
    }
  }
  let cierre = bloque.join("") + "</sheetData>";
  if (combinadas.length) {
    cierre += `<mergeCells count="${combinadas.length}">${combinadas
      .map(
        ({ fila, desde, hasta }) =>
          `<mergeCell ref="${letraColumna(desde)}${fila}:${letraColumna(hasta)}${fila}"/>`,
      )
      .join("")}</mergeCells>`;
  }
  yield cierre + "</worksheet>";
}

const xmlLibro = (hojas) =>
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${hojas
    .map(
      (h, i) =>
        `<sheet name="${escaparXml(h.nombre)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`,
    )
    .join("")}</sheets></workbook>`;

const xmlRelacionesLibro = (hojas) =>
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${hojas
    .map(
      (_, i) =>
        `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`,
    )
    .join(
      "",
    )}<Relationship Id="rId${hojas.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;

const xmlTiposContenido = (hojas) =>
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${hojas
    .map(
      (_, i) =>
        `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
    )
    .join(
      "",
    )}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`;
