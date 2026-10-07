import fs from "node:fs";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const data = new Uint8Array(fs.readFileSync("diagrama-bd-chifa-yemheng.pdf"));
const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
console.log("pages:", doc.numPages);
let text = "";
for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const tc = await page.getTextContent();
  text += tc.items.map((i) => i.str).join(" ") + "\n";
  if (p === 1) {
    const vp = page.getViewport({ scale: 1 });
    console.log("page size pt:", Math.round(vp.width), "x", Math.round(vp.height));
  }
}
const tablas = ["departamento","provincia","distrito","tipo_identidad","persona","empresa","cliente","cargo","contrato","empleado","tipo_usuario","usuario","modulo","rol","permiso","rol_permiso","usuario_rol","auditoria","ambiente","estado_mesa","tipo_mesa","mesa","unidad_medida","categoria_producto","producto","tipo_pedido","estado_pedido","pedido","detalle_pedido","reserva","pedido_delivery","metodo_pago","caja","apertura_caja","tipo_movimiento_caja","concepto_caja","serie_documento","venta","detalle_venta","boleta","factura","nota_credito","pago_venta","movimiento_caja","receta","movimiento_inventario"];
const low = text.toLowerCase();
const missing = tablas.filter((t) => !low.includes(t));
console.log("tablas encontradas:", tablas.length - missing.length, "/ 46");
if (missing.length) console.log("FALTAN:", missing.join(", "));
console.log("tiene 'linea_credito':", low.includes("linea_credito"));
console.log("tiene 'marca' como columna producto:", /marca/.test(low));
console.log("tiene audit agrupado:", low.includes("usucre"));
console.log("tiene FK-> labels:", (low.match(/fk ->/g) || []).length);
console.log("tiene clusters M01..M11:", ["m01","m04","m09","m11"].every((s) => low.includes(s)));
console.log("chars no-ascii muestra:", JSON.stringify(text.match(/[^\x00-\x7F]/g)?.slice(0, 20)));
fs.writeFileSync("texto-extraido.txt", text);
console.log("texto-extraido.txt bytes:", fs.statSync("texto-extraido.txt").size);
