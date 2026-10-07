// Librería compartida: parseo del SQL de creación + deltas verificados en vivo.
// Usada por generar.mjs (diagrama) y diccionario.mjs (diccionario de datos).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
export const SQL_PATH = path.resolve(DIR, "..", "creacion", "creacion-bd-yemheng-postgres.sql");

export const AUDIT = ["usucre", "pccre", "feccre", "usumod", "pcmod", "fecmod", "estado"];

export const AUDIT_DESC = {
  usucre: "Usuario de BD que creó el registro.",
  pccre: "Terminal/PC donde se creó el registro.",
  feccre: "Fecha y hora de creación del registro.",
  usumod: "Usuario de BD que modificó el registro por última vez.",
  pcmod: "Terminal/PC de la última modificación.",
  fecmod: "Fecha y hora de la última modificación.",
  estado: "Estado lógico del registro: A=Activo, I=Inactivo, E=Eliminado (borrado lógico).",
};

export const MODULOS = [
  ["M01", "UBIGEO", ["departamento", "provincia", "distrito"]],
  ["M02", "PERSONAS Y CLIENTES", ["tipo_identidad", "persona", "empresa", "cliente"]],
  ["M03", "RECURSOS HUMANOS", ["cargo", "contrato", "empleado"]],
  ["M04", "SEGURIDAD Y AUDITORÍA", ["tipo_usuario", "usuario", "modulo", "rol", "permiso", "rol_permiso", "usuario_rol", "auditoria"]],
  ["M05", "SALÓN Y MESAS", ["ambiente", "estado_mesa", "tipo_mesa", "mesa"]],
  ["M06", "CARTA", ["unidad_medida", "categoria_producto", "producto"]],
  ["M07", "PEDIDOS Y COMANDAS", ["tipo_pedido", "estado_pedido", "pedido", "detalle_pedido", "reserva"]],
  ["M08", "DELIVERY", ["pedido_delivery"]],
  ["M09", "CAJA", ["metodo_pago", "caja", "apertura_caja", "tipo_movimiento_caja", "concepto_caja", "movimiento_caja", "serie_documento"]],
  ["M10", "FACTURACIÓN Y VENTAS", ["venta", "detalle_venta", "boleta", "factura", "nota_credito", "pago_venta"]],
  ["M11", "INVENTARIO", ["receta", "movimiento_inventario"]],
];

function extractCreateTables(src) {
  const tables = [];
  const re = /CREATE\s+TABLE\s+(\w+)\s*\(/gi;
  let m;
  while ((m = re.exec(src))) {
    const name = m[1].toLowerCase();
    let i = re.lastIndex, depth = 1, inStr = false, body = "";
    for (; i < src.length && depth > 0; i++) {
      const ch = src[i];
      if (ch === "'") inStr = !inStr;
      if (!inStr && ch === "(") depth++;
      if (!inStr && ch === ")") { depth--; if (depth === 0) break; }
      body += ch;
    }
    tables.push({ name, body });
    re.lastIndex = i + 1;
  }
  return tables;
}

// Divide el cuerpo en segmentos por comas de profundidad 0 y captura
// los comentarios -- de cada segmento (fuera de literales).
// Un comentario al final de la línea pertenece a la columna de esa línea;
// un comentario en línea propia pertenece a la columna siguiente.
function splitSegments(body) {
  const segs = [];
  let cur = "", depth = 0, inStr = false;
  let own = [];    // comentario en línea propia -> columna siguiente
  let trail = [];  // comentario al final de la línea -> columna de esa línea
  let lastComma = -1;
  const push = () => {
    if (cur.trim()) segs.push({ text: cur.trim(), comments: [...own, ...trail] });
    cur = ""; own = []; trail = [];
  };
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === "'") { inStr = !inStr; cur += ch; continue; }
    if (!inStr && ch === "-" && body[i + 1] === "-") {
      let j = i + 2, c = "";
      while (j < body.length && body[j] !== "\n") { c += body[j]; j++; }
      const nl = body.lastIndexOf("\n", i);
      if (cur.trim()) trail.push(c.trim());
      else if (segs.length && lastComma > nl) segs[segs.length - 1].comments.push(c.trim());
      else own.push(c.trim());
      i = j - 1;
      continue;
    }
    if (!inStr && ch === "(") depth++;
    if (!inStr && ch === ")") depth--;
    if (!inStr && depth === 0 && ch === ",") { push(); lastComma = i; }
    else cur += ch;
  }
  push();
  return segs;
}

const TYPE_STOP = new Set(["NOT", "NULL", "DEFAULT", "PRIMARY", "UNIQUE", "CHECK", "REFERENCES", "GENERATED", "CONSTRAINT", "COLLATE"]);

function parseColumn(seg) {
  const m = seg.match(/^(\w+)\s+(.*)$/s);
  if (!m) return null;
  const col = m[1].toLowerCase();
  // quita la cláusula de identidad: si no, su "BY DEFAULT AS IDENTITY" se
  // leería como un DEFAULT y aparecería como valor por defecto
  const rest = m[2]
    .replace(/\bGENERATED\s+(?:ALWAYS|BY\s+DEFAULT)\s+AS\s+IDENTITY(?:\s*\([^)]*\))?/gi, "")
    .trim();
  const toks = [];
  const re = /(\([^()]*\)|\S+)/g;
  let t;
  while ((t = re.exec(rest))) {
    const w = t[1];
    if (TYPE_STOP.has(w.toUpperCase()) && !w.startsWith("(")) break;
    toks.push(w);
  }
  const type = toks.join(" ");
  const nn = /\bNOT\s+NULL\b/i.test(rest);
  let def = null;
  const dm = rest.match(/\bDEFAULT\s+(.+)$/is);
  if (dm) def = dm[1].trim().replace(/;$/, "");
  return { name: col, type, nn, def };
}

function balancedInner(s, openIdx) {
  let depth = 0, inStr = false, out = "";
  for (let i = openIdx; i < s.length; i++) {
    const ch = s[i];
    if (ch === "'") inStr = !inStr;
    if (!inStr && ch === "(") { depth++; if (depth > 1) out += ch; continue; }
    if (!inStr && ch === ")") { depth--; if (depth === 0) break; out += ch; continue; }
    out += ch;
  }
  return out.trim();
}

export function shortType(t) {
  return t
    .replace(/character varying\((\d+)\)/gi, "varchar($1)")
    .replace(/character\((\d+)\)/gi, "char($1)")
    .replace(/\bnumeric\(([\d, ]+)\)/gi, "num($1)")
    .replace(/\binteger\b/gi, "int")
    .replace(/timestamp without time zone/gi, "timestamp")
    .replace(/timestamp with time zone/gi, "timestamptz")
    .replace(/\s+/g, " ").trim().toLowerCase();
}

export function shortDef(d) {
  if (!d) return null;
  let s = d.replace(/::[\w\s()]+/g, "").trim();
  s = s.replace(/^CURRENT_TIMESTAMP$/i, "now()").replace(/^CURRENT_USER$/i, "user");
  return s;
}

function parseSchema(src) {
  const tables = {};
  for (const { name, body } of extractCreateTables(src)) {
    const tbl = { name, cols: [], pk: [], fks: [], uqs: [], checks: [] };
    for (const seg of splitSegments(body)) {
      const text = seg.text;
      const up = text.toUpperCase();
      if (up.startsWith("CONSTRAINT")) {
        let m;
        const cm = text.match(/CONSTRAINT\s+(\w+)/i);
        const cname = cm ? cm[1].toLowerCase() : "";
        if ((m = text.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i)))
          tbl.pk = m[1].split(",").map((s) => s.trim().toLowerCase());
        else if ((m = text.match(/FOREIGN\s+KEY\s*\(\s*(\w+)\s*\)\s*REFERENCES\s*(\w+)\s*\(\s*(\w+)\s*\)/i)))
          tbl.fks.push({ col: m[1].toLowerCase(), parent: m[2].toLowerCase(), pcol: m[3].toLowerCase(), name: cname });
        else if ((m = text.match(/UNIQUE\s*\(([^)]+)\)/i)))
          tbl.uqs.push({ cols: m[1].split(",").map((s) => s.trim().toLowerCase()), name: cname });
        else if (/CHECK/i.test(text)) {
          const ci = text.toUpperCase().indexOf("CHECK");
          const pi = text.indexOf("(", ci);
          if (pi > 0) tbl.checks.push({ name: cname, expr: balancedInner(text, pi) });
        }
      } else {
        const c = parseColumn(text);
        if (c) {
          c.type = shortType(c.type);
          c.comentario = seg.comments.join(" ").trim() || null;
          tbl.cols.push(c);
        }
      }
    }
    tables[name] = tbl;
  }
  return tables;
}

function applyLiveDeltas(tables) {
  tables["producto"].cols = tables["producto"].cols.filter((c) => c.name !== "marca");
  const cli = tables["cliente"].cols;
  if (!cli.some((c) => c.name === "linea_credito")) {
    const i = cli.findIndex((c) => c.name === "f_registro");
    cli.splice(i < 0 ? cli.length : i, 0,
      { name: "linea_credito", type: "num(12,2)", nn: true, def: "0", comentario: "Columna dormida: linea de credito no usada (pendiente DROP)." });
  }
  const mesa = tables["mesa"];
  if (!mesa.uqs.some((u) => u.cols.length === 1 && u.cols[0] === "codigo_qr"))
    mesa.uqs.push({ cols: ["codigo_qr"], name: "uq_mesa_codigo_qr" });
}

// Carga, aplica deltas y valida. Lanza si hay deriva.
export function loadSchema() {
  const src = fs.readFileSync(SQL_PATH, "utf8");
  const tables = parseSchema(src);
  applyLiveDeltas(tables);
  const names = Object.keys(tables);
  const fks = names.flatMap((n) => tables[n].fks.map((f) => ({ child: n, ...f })));
  const totalCols = names.reduce((a, n) => a + tables[n].cols.length, 0);
  const errors = [];
  if (names.length !== 46) errors.push(`tablas=${names.length} (esperado 46)`);
  if (fks.length !== 66) errors.push(`fks=${fks.length} (esperado 66)`);
  if (totalCols !== 670) errors.push(`columnas=${totalCols} (esperado 670)`);
  for (const n of names) if (!tables[n].pk.length) errors.push(`sin PK: ${n}`);
  for (const f of fks) {
    if (!tables[f.parent]) errors.push(`padre inexistente: ${f.parent}`);
    if (!tables[f.child].cols.some((c) => c.name === f.col)) errors.push(`col inexistente: ${f.child}.${f.col}`);
  }
  const inMod = new Set(MODULOS.flatMap((m) => m[2]));
  for (const n of names) if (!inMod.has(n)) errors.push(`tabla sin modulo: ${n}`);
  if (errors.length) throw new Error("ERRORES DE FIDELIDAD:\n- " + errors.join("\n- "));
  const modOf = {};
  for (const [id, , ts] of MODULOS) for (const t of ts) modOf[t] = id;
  return { tables, names, fks, totalCols, modOf };
}
