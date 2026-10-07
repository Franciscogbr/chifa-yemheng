// Genera el DICCIONARIO DE DATOS en PDF de la BD Chifa Yemheng.
// Fuente del esquema: lib-esquema.mjs (SQL de creación + deltas verificados en la BD viva).
// Uso: node diccionario.mjs [ruta-salida.pdf]
import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSchema, MODULOS, AUDIT, AUDIT_DESC, shortDef } from "./lib-esquema.mjs";
import { TABLA_DESC, COL_DESC, COL_DESC_TABLA, VISTAS, RUTINAS, MODULO_DESC } from "./descripciones.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const DEF_OUT = "C:/Users/franc/Documents/6° ciclo/Proyecto marcos/ENTREGABLE AVP/03 BASE DE DATOS/diccionario-datos-chifa-yemheng.pdf";
const OUT = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(DEF_OUT);

const A4 = { w: 595.28, h: 841.89 };
const M = 45;
const CW = A4.w - M * 2;
const HEAD = 56;
const FOOT = 40;
const BODY_TOP = HEAD;
const LIMIT = A4.h - FOOT;

const C = {
  ink: "#111827", muted: "#6b7280", line: "#d1d5db", head: "#1f2937",
  band: "#f9fafb", audit: "#f3f4f6", accent: "#1d4ed8", white: "#ffffff",
};

const F = { t: "Helvetica", tb: "Helvetica-Bold", ti: "Helvetica-Oblique" };

function descripcion(tbl, col, fk) {
  const key = `${tbl.name}.${col.name}`;
  if (COL_DESC_TABLA[key]) return { txt: COL_DESC_TABLA[key], curada: true };
  if (AUDIT.includes(col.name)) return { txt: AUDIT_DESC[col.name], curada: true };
  if (fk) return { txt: `Clave foránea que referencia a ${fk.parent}.${fk.pcol}.`, curada: true };
  if (col.comentario) {
    const c = col.comentario;
    return { txt: c.charAt(0).toUpperCase() + c.slice(1) + ".", curada: true };
  }
  if (COL_DESC[col.name]) return { txt: COL_DESC[col.name], curada: true };
  if (/^f_/.test(col.name) && /date|timestamp/.test(col.type))
    return { txt: `Fecha${col.name.endsWith("cion") ? " de creación" : ""} del registro.`, curada: false };
  if (/^n_/.test(col.name)) return { txt: "Nombre del registro.", curada: false };
  if (col.name.startsWith("id_")) return { txt: "Código identificador.", curada: false };
  return { txt: "Dato del registro.", curada: false };
}

function header(doc, titulo) {
  doc.font(F.tb).fontSize(8).fillColor(C.muted)
    .text("CHIFA YEMHENG  ·  DICCIONARIO DE DATOS", M, 22, { width: CW, align: "left", lineBreak: false });
  doc.font(F.t).fontSize(8).fillColor(C.muted)
    .text(titulo, M, 22, { width: CW, align: "right", lineBreak: false });
  doc.moveTo(M, 36).lineTo(A4.w - M, 36).lineWidth(0.6).strokeColor(C.line).stroke();
}

function footer(doc, txt) {
  const y = A4.h - FOOT + 10;
  doc.moveTo(M, y).lineTo(A4.w - M, y).lineWidth(0.6).strokeColor(C.line).stroke();
  doc.font(F.t).fontSize(7.5).fillColor(C.muted)
    .text("Base de datos RESTAURANTEV3 · esquema public", M, y + 6, { width: CW / 2, align: "left", lineBreak: false });
  doc.font(F.t).fontSize(7.5).fillColor(C.muted)
    .text(txt, M + CW / 2, y + 6, { width: CW / 2, align: "right", lineBreak: false });
}

const pageNo = (doc) => doc.bufferedPageRange().count;

function sectionTitle(doc, num, txt, sub) {
  if (doc.y > BODY_TOP + 1) doc.addPage();
  doc.y = BODY_TOP;
  doc.font(F.tb).fontSize(15).fillColor(C.head).text(`${num}.  ${txt}`, M, doc.y, { width: CW });
  let y = doc.y + 3;
  if (sub) {
    doc.font(F.t).fontSize(8).fillColor(C.muted).text(sub, M, y, { width: CW });
    y = doc.y + 2;
  }
  doc.moveTo(M, y).lineTo(A4.w - M, y).lineWidth(1.3).strokeColor(C.head).stroke();
  doc.y = y + 9;
}

function drawTable(doc, cols, rows, opts) {
  opts = opts || {};
  const fs_ = opts.fontSize || 8;
  const padX = 4, padY = 3.2;
  const headerH = fs_ + 6;
  const startX = M;
  const scale = CW / cols.reduce((a, c) => a + c.w, 0);

  const drawHead = () => {
    // alto según la etiqueta más larga (evita cortar "VALOR POR DEFECTO")
    const labelH = cols.map((c) => {
      const w = c.w * scale - padX * 2;
      return doc.font(F.tb).fontSize(fs_).heightOfString(c.label, { width: w });
    });
    const h = Math.max.apply(null, labelH.concat([fs_])) + padY * 2 + 2;
    const y0 = doc.y;
    doc.rect(startX, y0, CW, h).fill(C.head);
    let x = startX;
    doc.font(F.tb).fontSize(fs_).fillColor(C.white);
    for (const c of cols) {
      const w = c.w * scale;
      doc.text(c.label, x + padX, y0 + padY, { width: w - padX * 2, align: c.align || "left" });
      x += w;
    }
    doc.y = y0 + h;
  };

  drawHead();

  for (const raw of rows) {
    const row = Array.isArray(raw) ? { cells: raw } : raw;
    const cells = row.cells;
    const hs = cells.map((cell, i) => {
      const t = cell == null ? "" : (cell.text != null ? cell.text : String(cell));
      if (!t) return 0;
      const w = cols[i].w * scale - padX * 2;
      return doc.font(cell.bold ? F.tb : F.t).fontSize(cell.size || fs_).heightOfString(String(t), { width: w });
    });
    const rowH = Math.max(row.minRowH || opts.minRowH || 0, Math.max.apply(null, hs.concat([0])) + padY * 2);
    if (doc.y + rowH > LIMIT) {
      doc.addPage();
      header(doc, opts.titulo || "");
      doc.y = BODY_TOP;
      drawHead();
    }
    const y0 = doc.y;
    if (row.fill) doc.rect(startX, y0, CW, rowH).fill(row.fill);
    let x = startX;
    cells.forEach((cell, i) => {
      const w = cols[i].w * scale;
      const t = cell == null ? "" : (cell.text != null ? cell.text : String(cell));
      if (t) {
        doc.font(cell.bold ? F.tb : F.t).fontSize(cell.size || fs_).fillColor(cell.color || C.ink)
          .text(String(t), x + padX, y0 + padY, { width: w - padX * 2, align: cols[i].align || "left" });
      }
      doc.moveTo(x + w, y0).lineTo(x + w, y0 + rowH).lineWidth(0.4).strokeColor(row.border || C.line).stroke();
      x += w;
    });
    doc.y = y0 + rowH;
    doc.moveTo(startX, doc.y).lineTo(startX + CW, doc.y).lineWidth(0.4).strokeColor(row.border || C.line).stroke();
  }
  doc.y += 6;
}

function build(tables, names) {
  const model = {};
  for (const n of names) {
    const tbl = tables[n];
    const fkByCol = {};
    for (const f of tbl.fks) fkByCol[f.col] = f;
    const uqCols = new Map();
    for (const u of tbl.uqs) for (const c of u.cols) if (!uqCols.has(c)) uqCols.set(c, u.name);
    const chkByCol = {};
    for (const c of tbl.checks) {
      const col = (c.expr.match(/^\s*(\w+)/) || [, ""])[1].toLowerCase();
      if (col) (chkByCol[col] = chkByCol[col] || []).push(c);
    }
    const own = tbl.cols.filter((c) => !AUDIT.includes(c.name));
    const audit = tbl.cols.filter((c) => AUDIT.includes(c.name));
    model[n] = {
      name: n,
      mod: null,
      purpose: TABLA_DESC[n] || "Tabla del modelo de datos.",
      own: own.map((c) => {
        const claves = [];
        if (tbl.pk.includes(c.name)) claves.push("PK");
        if (fkByCol[c.name]) claves.push("FK");
        if (uqCols.has(c.name)) claves.push("UQ");
        const d = descripcion(tbl, c, fkByCol[c.name]);
        const checks = chkByCol[c.name] || [];
        // si la descripción ya es curada, el CHECK se omite para no repetirla
        return {
          name: c.name, type: c.type, nn: c.nn, def: shortDef(c.def),
          claves, clavesTxt: claves.join(" / ") || "—",
          fk: fkByCol[c.name] || null,
          desc: d.txt + (d.curada ? "" : checks.length ? "  [" + checks.map((k) => k.expr).join(" ; ") + "]" : ""),
          checks,
        };
      }),
      audit: audit.map((c) => ({ name: c.name, type: c.type, nn: c.nn, def: shortDef(c.def), desc: AUDIT_DESC[c.name] })),
      uqs: tbl.uqs, checks: tbl.checks, fks: tbl.fks,
    };
  }
  for (const [id, , ts] of MODULOS) for (const t of ts) model[t].mod = id;
  return model;
}

function cover(doc) {
  const y0 = 225;
  doc.font(F.tb).fontSize(29).fillColor(C.head).text("Diccionario de Datos", M, y0, { width: CW, align: "center" });
  doc.font(F.t).fontSize(14).fillColor(C.muted)
    .text("Base de datos del sistema Chifa Yemheng", M, y0 + 40, { width: CW, align: "center" });
  doc.font(F.tb).fontSize(10.5).fillColor(C.accent)
    .text("RESTAURANTEV3  ·  PostgreSQL  ·  esquema public", M, y0 + 66, { width: CW, align: "center" });

  const stats = [
    ["Tablas", "46"], ["Columnas", "670"], ["Claves primarias", "46"],
    ["Claves foráneas", "66"], ["Restricciones CHECK", "78"],
    ["Índices", "95"], ["Vistas", "6"], ["Rutinas", "18"],
  ];
  const bw = (CW - 7 * 8) / 8;
  const y = y0 + 108;
  stats.forEach((s, i) => {
    const x = M + i * (bw + 8);
    doc.rect(x, y, bw, 52).fill(C.band).lineWidth(0.5).strokeColor(C.line).stroke();
    doc.font(F.tb).fontSize(14).fillColor(C.head).text(s[1], x, y + 11, { width: bw, align: "center", lineBreak: false });
    doc.font(F.t).fontSize(5.8).fillColor(C.muted).text(s[0].toUpperCase(), x + 2, y + 32, { width: bw - 4, align: "center", lineBreak: false });
  });

  doc.font(F.t).fontSize(8.5).fillColor(C.ink).text(
    "Documento generado a partir del esquema real de la base de datos en producción (Supabase).\n" +
    "Cada tabla se documenta con sus columnas, tipo de dato, nulabilidad, valor por defecto,\n" +
    "claves (PK, FK, UQ), restricciones y propósito.",
    M, y + 86, { width: CW, align: "center" }
  );
  doc.font(F.ti).fontSize(8).fillColor(C.muted)
    .text("Fecha de generación: 1 de octubre de 2026", M, y + 140, { width: CW, align: "center" });
}

function indexSection(doc, model, pages) {
  sectionTitle(doc, 1, "Índice de tablas",
    "Tablas por módulo funcional, con su contenido y la página donde se documentan.");
  const rows = [];
  for (const [id, nombre, ts] of MODULOS) {
    rows.push({
      cells: [
        { text: "", size: 6 },
        { text: id + " · " + nombre, bold: true, size: 8.2, color: C.head },
        { text: MODULO_DESC[id] || "", size: 7.2, color: C.muted },
        { text: String(ts.length), size: 8, align: "right" },
      ],
      fill: C.band, minRowH: 15,
    });
    for (const t of ts) {
      const m = model[t];
      rows.push({
        cells: [
          { text: "", size: 6 },
          { text: "   " + t, size: 8.2 },
          { text: m.own.length + " columnas + auditoría · " + m.fks.length + " FK", size: 7, color: C.muted },
          { text: pages[t] ? String(pages[t]) : "—", size: 8, align: "right", color: C.accent, bold: true },
        ],
        minRowH: 13,
      });
    }
  }
  drawTable(doc, [
    { label: "", w: 3 },
    { label: "Tabla", w: 28 },
    { label: "Contenido", w: 61 },
    { label: "Pág.", w: 8, align: "right" },
  ], rows, { fontSize: 8, minRowH: 13, titulo: "Índice" });
}

function ficha(doc, m, modNombre) {
  if (doc.y + 150 > LIMIT) { doc.addPage(); header(doc, "Tabla " + m.name); doc.y = BODY_TOP; }

  const y0 = doc.y;
  doc.rect(M, y0, CW, 22).fill(C.head);
  doc.font(F.tb).fontSize(11).fillColor(C.white)
    .text(m.name.toUpperCase(), M + 7, y0 + 6, { width: CW - 185, lineBreak: false });
  doc.font(F.t).fontSize(7).fillColor("#cbd5e1")
    .text(modNombre, M + CW - 172, y0 + 7.5, { width: 165, align: "right", lineBreak: false });
  doc.y = y0 + 28;

  doc.font(F.ti).fontSize(8.5).fillColor(C.ink).text(m.purpose, M, doc.y, { width: CW });
  doc.y += doc.heightOfString(m.purpose, { width: CW }) + 7;

  const COLS = [
    { label: "Nº", w: 4, align: "right" },
    { label: "COLUMNA", w: 21 },
    { label: "TIPO DE DATO", w: 16 },
    { label: "ADMITE NULL", w: 8, align: "center" },
    { label: "VALOR POR DEFECTO", w: 16 },
    { label: "CLAVE", w: 11 },
    { label: "DESCRIPCIÓN", w: 33 },
  ];

  const rows = m.own.map((c, i) => ({
    cells: [
      { text: String(i + 1), size: 6.8, color: C.muted },
      { text: c.name, size: 8, bold: c.claves.includes("PK"), color: c.claves.includes("PK") ? C.head : C.ink },
      { text: c.type, size: 7.3, color: C.muted },
      { text: c.nn ? "NO" : "SÍ", size: 7, color: c.nn ? C.ink : "#b45309", bold: !c.nn },
      { text: c.def || "—", size: 7, color: C.muted },
      { text: c.clavesTxt, size: 7, bold: true, color: c.claves.includes("PK") ? C.head : c.claves.length ? C.accent : C.muted },
      { text: c.desc, size: 7.2 },
    ],
    minRowH: 12.5,
  }));
  drawTable(doc, COLS, rows, { fontSize: 7.6, minRowH: 12.5, titulo: "Tabla " + m.name });

  if (m.audit.length) {
    if (doc.y + 70 > LIMIT) { doc.addPage(); header(doc, "Tabla " + m.name); doc.y = BODY_TOP; }
    doc.font(F.tb).fontSize(7.4).fillColor(C.muted)
      .text("AUDITORÍA — columnas comunes a todas las tablas (" + m.audit.length + ")", M, doc.y, { width: CW, lineBreak: false });
    doc.y += 11;
    drawTable(doc, [
      { label: "COLUMNA", w: 21 },
      { label: "TIPO DE DATO", w: 16 },
      { label: "ADMITE NULL", w: 8, align: "center" },
      { label: "VALOR POR DEFECTO", w: 16 },
      { label: "DESCRIPCIÓN", w: 48 },
    ], m.audit.map((c) => ({
      cells: [
        { text: c.name, size: 7.3, color: C.muted },
        { text: c.type, size: 7, color: C.muted },
        { text: c.nn ? "NO" : "SÍ", size: 7, color: C.muted },
        { text: c.def || "—", size: 7, color: C.muted },
        { text: c.desc, size: 7.2, color: C.muted },
      ],
      fill: C.audit, minRowH: 11.5,
    })), { fontSize: 7.4, minRowH: 11.5, titulo: "Tabla " + m.name });
  }

  const rest = [];
  for (const u of m.uqs) rest.push(["UNIQUE", (u.name || "").toUpperCase(), u.cols.join(", ")]);
  for (const c of m.checks) {
    if (/ESTADO IN/i.test(c.expr) && /_est$/.test(c.name || "")) continue;
    rest.push(["CHECK", c.name || "", c.expr]);
  }
  for (const f of m.fks) {
    const col = m.own.find((c) => c.name === f.col);
    rest.push(["FOREIGN KEY", f.name || "", f.col + " --> " + f.parent + "." + f.pcol + (col && !col.nn ? " (opcional)" : " (obligatoria)")]);
  }
  if (rest.length) {
    if (doc.y + 56 > LIMIT) { doc.addPage(); header(doc, "Tabla " + m.name); doc.y = BODY_TOP; }
    doc.font(F.tb).fontSize(7.4).fillColor(C.muted).text("RESTRICCIONES", M, doc.y, { width: CW, lineBreak: false });
    doc.y += 11;
    drawTable(doc, [
      { label: "TIPO", w: 18 },
      { label: "NOMBRE", w: 26 },
      { label: "DEFINICIÓN", w: 56 },
    ], rest.map((r) => ({
      cells: [
        { text: r[0], size: 7, bold: true, color: C.accent },
        { text: r[1], size: 7, color: C.muted },
        { text: r[2], size: 7.2 },
      ],
      minRowH: 11.5,
    })), { fontSize: 7.2, minRowH: 11.5, titulo: "Tabla " + m.name });
  }
  doc.y += 8;
}

function relaciones(doc, model, fks) {
  doc.addPage();
  header(doc, "Relaciones");
  sectionTitle(doc, 2, "Relaciones entre tablas (integridad referencial)",
    "Las 66 claves foráneas del modelo. “Opcional” indica que la columna admite NULL.");
  const rows = fks.map((f) => {
    const col = model[f.child].own.find((c) => c.name === f.col);
    const opc = col && !col.nn;
    return {
      cells: [
        { text: f.child, size: 7.5, bold: true },
        { text: f.col, size: 7.1, color: C.accent },
        { text: f.parent, size: 7.5 },
        { text: f.pcol, size: 7.1, color: C.accent },
        { text: opc ? "Opcional" : "Obligatoria", size: 7, color: opc ? "#b45309" : C.ink },
        { text: model[f.child].mod, size: 7, color: C.muted },
        { text: "1 a N", size: 7.2, color: C.muted },
      ],
      minRowH: 12.5,
    };
  });
  drawTable(doc, [
    { label: "TABLA ORIGEN", w: 18 },
    { label: "COLUMNA FK", w: 17 },
    { label: "TABLA DESTINO", w: 18 },
    { label: "COLUMNA PK", w: 17 },
    { label: "CARDINALIDAD", w: 14 },
    { label: "MÓD.", w: 6 },
    { label: "RELACIÓN", w: 8 },
  ], rows, { fontSize: 7.4, minRowH: 12.5, titulo: "Relaciones" });
}

function vistas(doc) {
  doc.addPage();
  header(doc, "Vistas");
  sectionTitle(doc, 3, "Vistas de la base de datos",
    "Consultas predefinidas que el sistema utiliza para reportes y pantallas operativas.");
  drawTable(doc, [
    { label: "VISTA", w: 24 },
    { label: "PROPÓSITO", w: 76 },
  ], VISTAS.map((v) => ({
    cells: [{ text: v[0], size: 8, bold: true }, { text: v[1], size: 7.6 }],
    minRowH: 14,
  })), { fontSize: 8, minRowH: 14, titulo: "Vistas" });
}

function rutinas(doc) {
  doc.addPage();
  header(doc, "Rutinas");
  sectionTitle(doc, 4, "Rutinas almacenadas (funciones y procedimientos)",
    "Lógica de negocio encapsulada en la base de datos: autenticación, caja, pedidos, facturación y auditoría.");
  const mk = (arr) => arr.map((r) => ({
    cells: [{ text: r[0], size: 8, bold: true }, { text: r[2], size: 7.6 }],
    minRowH: 14,
  }));
  const cols = [{ label: "NOMBRE", w: 24 }, { label: "PROPÓSITO", w: 76 }];
  const fn = RUTINAS.filter((r) => r[1] === "FUNCTION");
  const usp = RUTINAS.filter((r) => r[1] === "PROCEDURE");
  doc.font(F.tb).fontSize(9).fillColor(C.head).text("Funciones (" + fn.length + ")", M, doc.y, { width: CW, lineBreak: false });
  doc.y += 13;
  drawTable(doc, cols, mk(fn), { fontSize: 8, minRowH: 14, titulo: "Rutinas" });
  doc.y += 6;
  doc.font(F.tb).fontSize(9).fillColor(C.head).text("Procedimientos almacenados (" + usp.length + ")", M, doc.y, { width: CW, lineBreak: false });
  doc.y += 13;
  drawTable(doc, cols, mk(usp), { fontSize: 8, minRowH: 14, titulo: "Rutinas" });
}

function dominios(doc, model) {
  doc.addPage();
  header(doc, "Dominios");
  sectionTitle(doc, 5, "Dominios de valores",
    "Restricciones CHECK que limitan los valores admitidos por las columnas de tipo código.");
  const byExpr = new Map();
  for (const n of Object.keys(model)) {
    for (const c of model[n].checks) {
      const e = c.expr.replace(/\s+/g, " ").trim();
      if (!byExpr.has(e)) byExpr.set(e, []);
      byExpr.get(e).push(c);
    }
  }
  const LEGEND = {
    "ESTADO IN ('A', 'I', 'E')": "Estado lógico (borrado lógico). A=Activo, I=Inactivo, E=Eliminado.",
  };
  const rows = [];
  for (const e of byExpr.keys()) {
    const chks = byExpr.get(e);
    const cols = [...new Set(chks.map((c) => (c.expr.match(/^\s*(\w+)/) || [, ""])[1].toLowerCase()))];
    const tablas = [...new Set(chks.map((c) => (c.name || "").replace(/_est$/, "")))];
    const donde = chks.length === 46 ? "las 46 tablas"
      : tablas.length <= 3 ? tablas.join(", ")
      : tablas.slice(0, 3).join(", ") + " y " + (tablas.length - 3) + " más";
    rows.push({
      cells: [
        { text: cols.join(", "), size: 7.8, bold: true },
        { text: e, size: 7.2, color: C.accent },
        { text: LEGEND[e] || "", size: 7.4 },
        { text: donde, size: 7, color: C.muted },
      ],
      minRowH: 13.5,
    });
  }
  rows.sort((a, b) => a.cells[3].text.localeCompare(b.cells[3].text));
  drawTable(doc, [
    { label: "COLUMNA(S)", w: 16 },
    { label: "VALORES PERMITIDOS", w: 29 },
    { label: "SIGNIFICADO", w: 35 },
    { label: "APLICA EN", w: 20 },
  ], rows, { fontSize: 7.4, minRowH: 13.5, titulo: "Dominios" });
}

const newDoc = () => new PDFDocument({
  size: "A4",
  margins: { left: M, right: M, top: BODY_TOP, bottom: FOOT },
  bufferPages: true,
  autoFirstPage: true,
});

async function main() {
  const { tables, names, fks } = loadSchema();
  const model = build(tables, names);
  const modNombre = {};
  for (const m of MODULOS) modNombre[m[0]] = m[0] + " · " + m[1];

  // pasada 1: páginas donde empieza cada ficha
  const pages = {};
  {
    const doc = newDoc();
    cover(doc);
    for (const n of names) {
      doc.addPage();
      header(doc, "Tabla " + n);
      doc.y = BODY_TOP;
      pages[n] = pageNo(doc);
      ficha(doc, model[n], modNombre[model[n].mod]);
    }
    doc.end();
  }

  // longitud real del índice
  let idxPages = 1;
  {
    const d = newDoc();
    indexSection(d, model, pages);
    idxPages = pageNo(d);
    d.end();
  }

  // pasada 2: documento final
  const doc = newDoc();
  cover(doc);
  doc.addPage();
  header(doc, "Índice");
  const real = {};
  for (const k of Object.keys(pages)) real[k] = pages[k] + idxPages;
  indexSection(doc, model, real);

  for (const n of names) {
    doc.addPage();
    header(doc, "Tabla " + n);
    doc.y = BODY_TOP;
    if (pageNo(doc) !== real[n]) {
      console.error("DESALINEACIÓN de índice: " + n + " esperado " + real[n] + ", real " + pageNo(doc));
      process.exit(1);
    }
    ficha(doc, model[n], modNombre[model[n].mod]);
  }
  relaciones(doc, model, fks);
  vistas(doc);
  rutinas(doc);
  dominios(doc, model);

  const total = doc.bufferedPageRange().count;
  for (let i = 0; i < total; i++) {
    doc.switchToPage(i);
    // sin esto pdfkit inserta una página nueva al escribir fuera del margen inferior
    doc.page.margins.bottom = 0;
    doc.page.margins.top = 0;
    if (i > 0) footer(doc, "Página " + (i + 1) + " de " + total);
  }
  doc.flushPages();

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const stream = fs.createWriteStream(OUT);
  doc.pipe(stream);
  doc.end();
  await new Promise((r) => stream.on("finish", r));

  console.log("PDF: " + OUT);
  console.log("Páginas: " + total + " | índice " + idxPages + " | fichas " + names.length +
    " | secciones 2-5");
  console.log("KB: " + (fs.statSync(OUT).size / 1024).toFixed(0));
}

await main();