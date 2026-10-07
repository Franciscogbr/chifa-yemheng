import fs from "node:fs";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const file = process.argv[2] ||
  "C:/Users/franc/Documents/6° ciclo/Proyecto marcos/ENTREGABLE AVP/03 BASE DE DATOS/diccionario-datos-chifa-yemheng.pdf";
const data = new Uint8Array(fs.readFileSync(file));
const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
console.log("archivo:", file.split("/").pop());
console.log("paginas:", doc.numPages);

// extrae filas agrupando por coordenada Y
const pages = [];
for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const tc = await page.getTextContent();
  const byY = new Map();
  for (const it of tc.items) {
    if (!it.str || !it.str.trim()) continue;
    // tolerancia: pdfkit desplaza la línea base según el tamaño de fuente de cada celda
    let y = Math.round(it.transform[5]);
    let key = null;
    for (const k of byY.keys()) if (Math.abs(k - y) <= 3) { key = k; break; }
    if (key == null) { key = y; byY.set(key, []); }
    byY.get(key).push({ x: it.transform[4], s: it.str });
  }
  const rows = [];
  for (const [y, items] of [...byY.entries()].sort((a, b) => b[0] - a[0])) {
    items.sort((a, b) => a.x - b.x);
    rows.push({ y, cells: items.map((i) => i.s), text: items.map((i) => i.s).join(" ").replace(/\s+/g, " ") });
  }
  const flat = tc.items.map((i) => i.str).join(" ").replace(/\s+/g, " ");
  pages.push({ rows, flat });
}

const tablas = ["departamento","provincia","distrito","tipo_identidad","persona","empresa","cliente","cargo","contrato","empleado","tipo_usuario","usuario","modulo","rol","permiso","rol_permiso","usuario_rol","auditoria","ambiente","estado_mesa","tipo_mesa","mesa","unidad_medida","categoria_producto","producto","tipo_pedido","estado_pedido","pedido","detalle_pedido","reserva","pedido_delivery","metodo_pago","caja","apertura_caja","tipo_movimiento_caja","concepto_caja","serie_documento","venta","detalle_venta","boleta","factura","nota_credito","pago_venta","movimiento_caja","receta","movimiento_inventario"];

// 1. página real de cada ficha (página cuyo título es el nombre en mayúscula)
const fichaPagina = {};
for (const t of tablas) {
  const up = t.toUpperCase();
  for (let i = 0; i < pages.length; i++) {
    const hit = pages[i].rows.find((r) => r.cells.some((c) => c === up));
    if (hit) { fichaPagina[t] = i + 1; break; }
  }
}
const sinFicha = tablas.filter((t) => !fichaPagina[t]);
console.log("fichas con titulo propio:", tablas.length - sinFicha.length, "/ 46",
  sinFicha.length ? "FALTAN: " + sinFicha.join(", ") : "");

// 2. el índice debe declarar la página correcta: fila "tabla" + última celda numérica
const idxPaginas = [2, 3];
let ok = 0, bad = [];
for (const t of tablas) {
  let claimed = null;
  for (const ip of idxPaginas) {
    for (const r of pages[ip - 1].rows) {
      const nameCell = r.cells.find((c) => c.trim() === t);
      if (!nameCell) continue;
      const nums = r.cells.filter((c) => /^\d+$/.test(c.trim()));
      if (nums.length) { claimed = parseInt(nums[nums.length - 1], 10); break; }
    }
    if (claimed) break;
  }
  if (claimed === null) { bad.push(t + " (no encontrado en índice)"); continue; }
  if (claimed === fichaPagina[t]) ok++;
  else bad.push(t + " (índice " + claimed + " vs real " + fichaPagina[t] + ")");
}
console.log("índice correcto:", ok, "/ 46", bad.length ? "ERRORES: " + bad.slice(0, 6).join(" | ") : "");

// 3. cada ficha lista todas sus columnas
const { loadSchema } = await import("./lib-esquema.mjs");
const { tables, names } = loadSchema();
const audit = ["usucre","pccre","feccre","usumod","pcmod","fecmod","estado"];
let faltanCols = [], faltanDesc = [];
for (const t of names) {
  const pag = fichaPagina[t];
  if (!pag) continue;
  const txt = pages[pag - 1].flat + " " + (pages[pag] ? pages[pag].flat : "");
  const propias = tables[t].cols.filter((c) => !audit.includes(c.name));
  const f = propias.filter((c) => !txt.includes(c.name));
  if (f.length) faltanCols.push(t + ": " + f.map((c) => c.name).join(","));
  // cada columna propia debe tener texto de descripción no vacío (heurística: tras el nombre)
  const sinD = propias.filter((c) => {
    const row = pages[pag - 1].rows.find((r) => r.cells.some((x) => x === c.name));
    if (!row) return true;
    const last = row.cells[row.cells.length - 1];
    return !last || last.trim().length < 3;
  });
  if (sinD.length) faltanDesc.push(t + ": " + sinD.map((c) => c.name).join(","));
}
console.log("fichas con todas sus columnas:", 46 - faltanCols.length, "/ 46",
  faltanCols.length ? "FALTAN: " + faltanCols.slice(0, 4).join(" | ") : "");
console.log("columnas sin descripcion:", faltanDesc.length,
  faltanDesc.length ? faltanDesc.slice(0, 4).join(" | ") : "");

// 4. secciones del documento
const all = pages.map((p) => p.flat).join("\n");
const secciones = ["Índice de tablas","Relaciones entre tablas","Vistas de la base de datos",
  "Rutinas almacenadas","Dominios de valores","Diccionario de Datos"];
console.log("secciones:", secciones.filter((s) => all.includes(s)).length, "/", secciones.length);

// 5. auditoría presente en las 46 fichas
let conAudit = 0;
for (const t of names) { const p = fichaPagina[t]; if (p && pages[p - 1].flat.includes("AUDITORÍA")) conAudit++; }
console.log("fichas con bloque de auditoría:", conAudit, "/ 46");

// 6.Encoding
console.log("mojibake:", (all.match(/Ã|Â|�/g) || []).length);
const acentos = (all.match(/[áéíóúñÁÉÍÓÚÑ·º]/g) || []).length;
console.log("caracteres acentuados:", acentos);
const raros = [...new Set((all.match(/[^\x20-\x7EÀ-ÿ·—…º]/g) || []))];
console.log("caracteres fuera de WinAnsi:", raros.length ? raros.join(" ") : "ninguno");