import fs from "node:fs";
import * as mupdf from "mupdf";

const file = "C:/Users/franc/Documents/6° ciclo/Proyecto marcos/ENTREGABLE AVP/03 BASE DE DATOS/diccionario-datos-chifa-yemheng.pdf";
const outDir = "C:/Users/franc/AppData/Local/Temp/opencode/dd";
fs.mkdirSync(outDir, { recursive: true });

const doc = mupdf.Document.openDocument(fs.readFileSync(file), "application/pdf");
console.log("paginas:", doc.countPages());
const paginas = process.argv.slice(2).map(Number);
for (const p of paginas) {
  const page = doc.loadPage(p - 1);
  const pix = page.toPixmap(mupdf.Matrix.scale(1.7, 1.7), mupdf.ColorSpace.DeviceRGB, false, true);
  const f = `${outDir}/pag-${p}.png`;
  fs.writeFileSync(f, pix.asPNG());
  console.log(f, pix.getWidth() + "x" + pix.getHeight());
}