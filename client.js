// client.js – Detalle por cliente (client.html?id=xxxx)
const view = document.getElementById("clientView");
const titleEl = document.getElementById("clientTitle");
const subtitleEl = document.getElementById("clientSubtitle");

const params = new URLSearchParams(location.search);
const id = (params.get("id") || "").trim();

if (!id) {
  renderError(`Falta el parámetro "id" en la URL. Ejemplo: client.html?id=pepe-ganga`);
} else {
  loadClient(id);
}

function loadClient(clientId) {
  fetch("channels.json", { cache: "no-store" })
    .then((r) => r.json())
    .then((list) => {
      const channels = Array.isArray(list) ? list : [];
      const client = channels.find((c) => String(c.id || "").toLowerCase() === clientId.toLowerCase());

      if (!client) {
        renderError(`No se encontró el cliente con id: "${escapeHtml(clientId)}"`);
        return;
      }

      renderClient(client);
    })
    .catch((e) => {
      console.error(e);
      renderError("No se pudo cargar channels.json");
    });
}

function renderClient(client) {
  const name = String(client.client || "SIN NOMBRE").trim();
  const url = String(client.url || "").trim();
  const rb = client.rb || null;

  // Títulos de la página
  if (titleEl) titleEl.textContent = `Monitor: ${name}`;
  if (subtitleEl) subtitleEl.textContent = `Voice Experience - Musicar | ID: ${client.id}`;

  // Iframe widget
  let iframeSrc = "";
  if (rb && rb.host && rb.u && rb.widNow && rb.widRecent) {
    const q = new URLSearchParams({
      host: rb.host,
      u: String(rb.u),
      widNow: String(rb.widNow),
      widRecent: String(rb.widRecent)
    });
    if (rb.tf) q.set("tf", String(rb.tf));
    iframeSrc = `widget.html?${q.toString()}`;
  }

  view.innerHTML = `
    <div class="clientPanel">
      <h2>${escapeHtml(name)}</h2>

      ${
        url
          ? `
        <audio controls preload="none" crossorigin="anonymous">
          <source src="${escapeAttr(url)}" type="audio/mpeg">
          Tu navegador no soporta audio HTML5.
        </audio>
        `
          : `<div class="error">Este cliente no tiene URL de stream configurada.</div>`
      }

      <div class="widgetWrap">
        <div class="widgetTitle">Ahora sonando y recientes</div>

        ${
          iframeSrc
            ? `<iframe class="rb-frame" src="${iframeSrc}" loading="lazy"></iframe>`
            : `<div class="error">Falta configuración rb (host/u/widNow/widRecent) en channels.json</div>`
        }
      </div>
    </div>
  `;
}

function renderError(msg) {
  if (titleEl) titleEl.textContent = "Monitor: Cliente no disponible";
  if (subtitleEl) subtitleEl.textContent = "Voice Experience - Musicar";

  view.innerHTML = `<div class="error">${msg}</div>`;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(str) {
  return escapeHtml(str);
}
