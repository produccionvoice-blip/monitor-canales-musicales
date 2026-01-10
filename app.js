// app.js — Monitor de Canales Musicales (Musicar)
// - Lee channels.json
// - Renderiza reproductor + metadata RadioBOSS vía iframe (widget.html)
// - Buscador por cliente
// - Muestra aviso si falta configuración rb

const container = document.getElementById("channels");
const searchInput = document.getElementById("search");

let channels = [];

// Cargar canales
fetch("channels.json", { cache: "no-store" })
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then((data) => {
    channels = Array.isArray(data) ? data : [];
    renderChannels(channels);
  })
  .catch((err) => {
    console.error("Error cargando channels.json:", err);
    container.innerHTML = `
      <div class="error" style="padding:16px;">
        No se pudo cargar <b>channels.json</b>. Verifica que exista en la raíz del repositorio y sea JSON válido.
      </div>
    `;
  });

// Render de tarjetas
function renderChannels(list) {
  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML = `
      <div class="empty" style="padding:16px;opacity:.8;">
        No hay canales para mostrar.
      </div>
    `;
    return;
  }

  list.forEach((channel) => {
    const clientName = channel.client ?? "Cliente sin nombre";
    const streamUrl = channel.url ?? "";

    const hasRB =
      channel.rb &&
      channel.rb.host &&
      channel.rb.u !== undefined &&
      channel.rb.widNow !== undefined &&
      channel.rb.widCover !== undefined &&
      channel.rb.widRecent !== undefined;

    const widgetUrl = hasRB ? buildWidgetUrl(channel.rb) : null;

    const card = document.createElement("div");
    card.className = "channel";

    card.innerHTML = `
      <h3>${escapeHtml(clientName)}</h3>

      ${
        streamUrl
          ? `
            <audio controls preload="none">
              <source src="${escapeAttr(streamUrl)}" type="audio/mpeg">
              Tu navegador no soporta audio HTML5.
            </audio>
          `
          : `<div style="opacity:.8;font-size:12px;">Sin URL de stream configurada</div>`
      }

      ${
        widgetUrl
          ? `
            <div class="rb-frame-wrap">
              <iframe
                class="rb-frame"
                src="${escapeAttr(widgetUrl)}"
                title="RadioBOSS Widget - ${escapeAttr(clientName)}"
                loading="lazy"
              ></iframe>
            </div>
          `
          : `
            <div class="rb-missing">
              Metadata no configurada (falta <b>rb</b> en channels.json).
            </div>
          `
      }
    `;

    container.appendChild(card);
  });
}

// Construye URL del iframe hacia widget.html con parámetros RadioBOSS
function buildWidgetUrl(rb) {
  // rb esperado:
  // {
  //   host: "https://c38.radioboss.fm",
  //   u: 216,
  //   widNow: 7129,
  //   widCover: 9063,
  //   widRecent: 8064,
  //   tf: 1 (opcional)
  // }

  const params = new URLSearchParams({
    host: String(rb.host ?? ""),
    u: String(rb.u ?? ""),
    widNow: String(rb.widNow ?? ""),
    widCover: String(rb.widCover ?? ""),
    widRecent: String(rb.widRecent ?? "")
  });

  // tf opcional
  if (rb.tf !== undefined && rb.tf !== null && String(rb.tf) !== "" && String(rb.tf) !== "0") {
    params.set("tf", String(rb.tf));
  }

  return `./widget.html?${params.toString()}`;
}

// Buscador por nombre de cliente
searchInput?.addEventListener("input", (e) => {
  const value = (e.target.value || "").toLowerCase().trim();

  if (!value) {
    renderChannels(channels);
    return;
  }

  const filtered = channels.filter((c) =>
    String(c.client || "").toLowerCase().includes(value)
  );

  renderChannels(filtered);
});

// Helpers de escape
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


