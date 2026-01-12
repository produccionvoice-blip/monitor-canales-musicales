// app.js (HOME) – Lista de clientes + buscador
const container = document.getElementById("channels");
const searchInput = document.getElementById("search");

let channels = [];

fetch("channels.json", { cache: "no-store" })
  .then((r) => r.json())
  .then((data) => {
    channels = Array.isArray(data) ? data : [];
    renderHome(channels);
  })
  .catch((e) => {
    console.error(e);
    container.innerHTML = `<div class="error">No se pudo cargar channels.json</div>`;
  });

function renderHome(list) {
  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML = `<div class="empty">No hay clientes para mostrar.</div>`;
    return;
  }

  list.forEach((ch) => {
    const id = String(ch.id || "").trim();
    const name = String(ch.client || "SIN NOMBRE").trim();

    const card = document.createElement("div");
    card.className = "clientCard";

    const safeName = escapeHtml(name);
    const safeId = encodeURIComponent(id);

    card.innerHTML = `
      <h3>${safeName}</h3>
      ${
        id
          ? `<a href="client.html?id=${safeId}">Ver monitor</a>`
          : `<div class="error">Falta "id" para este cliente en channels.json</div>`
      }
    `;

    container.appendChild(card);
  });
}

// Buscador
searchInput?.addEventListener("input", (e) => {
  const q = String(e.target.value || "").toLowerCase().trim();
  if (!q) return renderHome(channels);

  const filtered = channels.filter((c) =>
    String(c.client || "").toLowerCase().includes(q) ||
    String(c.id || "").toLowerCase().includes(q)
  );

  renderHome(filtered);
});

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
