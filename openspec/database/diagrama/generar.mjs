// Genera el diagrama ER (hoja única) de la BD Chifa Yemheng.
// Usa lib-esquema.mjs (fuente única de verdad del esquema).
// Uso: node generar.mjs
import { Graphviz } from "@hpcc-js/wasm-graphviz";
import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSchema, MODULOS, AUDIT, shortDef } from "./lib-esquema.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT_PDF = path.resolve(DIR, "diagrama-bd-chifa-yemheng.pdf");
const OUT_DOT = path.resolve(DIR, "diagrama.dot");
const OUT_JSON = path.resolve(DIR, "schema-live.json");

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function main() {
  const { tables, names, fks, totalCols, modOf } = loadSchema();
  console.log(`OK esquema: 46 tablas, 670 columnas, 66 FK, PK completas.`);

  fs.writeFileSync(OUT_JSON, JSON.stringify({ tablas: names.length, columnas: totalCols, fks: fks.length, modulos: MODULOS.map(([id, nombre, tablas]) => ({ id, nombre, tablas })) }, null, 2));
  console.log("schema-live.json escrito.");

  const dotNode = (tbl) => {
    const pkSet = new Set(tbl.pk);
    const fkOf = {};
    for (const f of tbl.fks) fkOf[f.col] = f.parent;
    const uqSet = new Set(tbl.uqs.flatMap((u) => u.cols));
    const rows = [];
    rows.push(`<TR><TD BGCOLOR="#1f2937"><FONT COLOR="white" POINT-SIZE="22"><B>${esc(tbl.name.toUpperCase())}</B></FONT></TD><TD BGCOLOR="#1f2937"></TD></TR>`);
    const ordered = [
      ...tbl.cols.filter((c) => pkSet.has(c.name)),
      ...tbl.cols.filter((c) => !pkSet.has(c.name) && fkOf[c.name]),
      ...tbl.cols.filter((c) => !pkSet.has(c.name) && !fkOf[c.name] && !AUDIT.includes(c.name)),
    ];
    for (const c of ordered) {
      let left = esc(c.name);
      if (pkSet.has(c.name)) { left = `<B>${left} PK</B>`; }
      else if (fkOf[c.name]) { left = `${left} <FONT COLOR="#1d4ed8"><B>FK -&gt; ${esc(fkOf[c.name])}</B></FONT>`; }
      if (uqSet.has(c.name) && !pkSet.has(c.name)) left += " (UQ)";
      let right = esc(c.type);
      const d = shortDef(c.def);
      if (d) right += ` = ${esc(d)}`;
      rows.push(`<TR><TD ALIGN="LEFT"><FONT POINT-SIZE="16">${left}</FONT></TD><TD ALIGN="RIGHT"><FONT POINT-SIZE="15" COLOR="#555555">${right}</FONT></TD></TR>`);
    }
    const audit = tbl.cols.filter((c) => AUDIT.includes(c.name)).map((c) => c.name);
    if (audit.length)
      rows.push(`<TR><TD ALIGN="LEFT" BGCOLOR="#f3f4f6"><FONT POINT-SIZE="13" COLOR="#4b5563">${audit.map(esc).join(" &#183; ")}</FONT></TD><TD ALIGN="RIGHT" BGCOLOR="#f3f4f6"><FONT POINT-SIZE="13" COLOR="#4b5563">audit (${audit.length})</FONT></TD></TR>`);
    return `${tbl.name} [label=<\n<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5">\n${rows.join("\n")}\n</TABLE>>];`;
  };

  let dot = `digraph BD {\n  compound=true;\n  rankdir=TB;\n  splines=ortho;\n  nodesep=0.7;\n  ranksep=1.0;\n  node [shape=plaintext, fontname="Helvetica"];\n  edge [fontname="Helvetica", fontsize=13, arrowhead=crow, arrowsize=1.1, color="#374151"];\n`;
  for (const [id, nombre, ts] of MODULOS) {
    dot += `  subgraph cluster_${id} {\n    label="${id} \\u00B7 ${nombre}"; fontsize=26; fontname="Helvetica-Bold"; style=rounded; color="#9ca1af"; penwidth=2;\n`;
    for (const t of ts) dot += `    ${dotNode(tables[t])}\n`;
    dot += `  }\n`;
  }
  for (const f of fks) {
    const col = tables[f.child].cols.find((c) => c.name === f.col);
    const optional = col && !col.nn;
    const receta = f.child === "receta" && f.parent === "producto";
    const attrs = [`label="${f.col}"`, `fontsize=13`];
    if (optional) attrs.push(`style=dashed`, `color="#9ca1af"`, `fontcolor="#6b7280"`);
    if (receta) attrs.push(`color="#c2410c"`, `penwidth=2.2`, `fontcolor="#c2410c"`);
    dot += `  ${f.parent} -> ${f.child} [${attrs.join(", ")}];\n`;
  }
  dot += `}\n`;
  fs.writeFileSync(OUT_DOT, dot);
  console.log("diagrama.dot escrito.");

  const graphviz = await Graphviz.load();
  const svg = graphviz.layout(dot, "svg", "dot");
  const m = svg.match(/width="([\d.]+)pt" height="([\d.]+)pt"/);
  const nNodes = (svg.match(/class="node"/g) || []).length;
  const nEdges = (svg.match(/class="edge"/g) || []).length;
  console.log(`SVG: ${m[1]} x ${m[2]} pt | nodos=${nNodes} aristas=${nEdges}`);
  if (nNodes !== 46 || nEdges !== 66) { console.error("FALLO: conteo de nodos/aristas en el render."); process.exit(1); }

  let W = Math.ceil(parseFloat(m[1])), H = Math.ceil(parseFloat(m[2]));
  const MAX = 14300;
  if (W > MAX || H > MAX) { const k = MAX / Math.max(W, H); W = Math.floor(W * k); H = Math.floor(H * k); }
  const doc = new PDFDocument({ size: [W, H], margin: 0 });
  const out = fs.createWriteStream(OUT_PDF);
  doc.pipe(out);
  SVGtoPDF(doc, svg, 0, 0, { width: W, height: H, preserveAspectRatio: "xMinYMin meet" });
  doc.end();
  await new Promise((r) => out.on("finish", r));
  console.log(`PDF: ${OUT_PDF} (${(fs.statSync(OUT_PDF).size / 1024).toFixed(0)} KB, 1 pag, ${W}x${H} pt)`);
}

await main();
