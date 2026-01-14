(function () {
  const $ = (sel) => document.querySelector(sel);
  const params = new URLSearchParams(location.search);
  const id = (params.get("id") || "").trim();

  async function load() {
    if (!id) {
      $("#clientName").textContent = "Falta ?id=";
      $("#clientMeta").textContent = "Ejemplo: /client/?id=pepe-ganga";
      return;
    }

    const res = await fetch("../channels.json", { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar channels.json");

    const list = await res.json();
    const ch = (Array.isArray(list) ? list : []).find((x) => String(x.id || "") === id);

    if (!ch) {
      $("#clientName").textContent = "Cliente no encontrado";
      $("#clientMeta").textContent = "ID: " + id;
      return;
    }

    document.title = `Monitor: ${ch.client} | Musicar`;
    $("#pageTitle").textContent = `Monitor: ${ch.client}`;
    $("#clientName").textContent = ch.client;
    $("#clientMeta").textContent = `Voice Experience - Musicar | ID: ${ch.id}`;

    const audio = $("#player");
    if (audio) audio.src = ch.streamUrl || "";

    const iframe = $("#rbFrame");
    if (iframe) {
      // cb=1 fuerza recarga de scripts si el navegador cachea demasiado
      iframe.src = `../widget.html?id=${encodeURIComponent(ch.id)}&cb=1`;
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    load().catch((e) => {
      console.error(e);
      $("#clientName").textContent = "Error cargando monitor";
      $("#clientMeta").textContent = e.message || String(e);
    });
  });
})();
