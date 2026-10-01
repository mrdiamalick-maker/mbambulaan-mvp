// Petits calculs de tracés SVG partagés entre les écrans — portage direct
// des fonctions utilitaires du standalone (sparklines, histogrammes
// empilés). Aucune bibliothèque de graphiques : comme la source, les
// graphiques sont des <svg> faits main pour rester pixel-fidèles.

export function sparkline(values: number[], width: number, height: number, padTop = 2, padBottom = 2) {
  const mx = Math.max(...values);
  const mn = Math.min(...values);
  const span = mx - mn || 1;
  const usableH = height - padTop - padBottom;
  const xy = values.map((v, i) => [
    (i / (values.length - 1 || 1)) * width,
    padTop + usableH - ((v - mn) / span) * usableH
  ]);
  const line = "M" + xy.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join("L");
  const area = line + `L${width},${height}L0,${height}Z`;
  return { line, area, last: xy[xy.length - 1] };
}

export function fmtNum(n: number): string {
  return n.toFixed(1);
}
