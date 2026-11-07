/**
 * Prints the on-page certificate as a single A4 landscape sheet (Save as PDF).
 * Clones the artwork to the top of <body> and adds a temporary @page rule so
 * other print styles (e.g. voucher cards) are unaffected.
 */
export function printCertificate() {
  const source = document.querySelector(".print-certificate");
  if (!source) return window.print();
  const root = document.createElement("div");
  root.className = "cert-print-root cert-wrap";
  root.style.width = "297mm";
  root.appendChild(source.querySelector(".cert")!.cloneNode(true));
  const style = document.createElement("style");
  style.textContent = "@page { size: A4 landscape; margin: 0; }";
  document.head.appendChild(style);
  document.body.appendChild(root);
  document.documentElement.classList.add("printing-cert");
  const cleanup = () => {
    root.remove();
    style.remove();
    document.documentElement.classList.remove("printing-cert");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.print();
  setTimeout(cleanup, 60000);
}
