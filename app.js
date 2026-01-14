const container = document.getElementById("channels");
const searchInput = document.getElementById("search");

let channels = [];

fetch("channels.json", { cache: "no-store" })
  .then((r) => r.json())
  .then((data) => {
    channels = Array.isArray(data) ? data : [];
    render(channels);
  })
  .catch((e) => {
    console.error(e);
    container.innerHTML = `<div class="error">No se pudo cargar channels.json</div>`;
  });

function render(list) {
  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML = `<div class="empty">No hay clientes para mostrar.</div>`;
    return;
  }

  const grid = document.createElement("div");
  grid.className = "grid";

  list.forEach((ch) => {
    const card = document.createElement("div");
    card.className = "clientCard";

    const name = escapeHtml(ch.client || "SIN NOMBRE");
    const id = String(ch.id || "").trim();

    card.innerHTML = `
      <h3>${name}</h3>
      <a class="btn" href="client/?id=${encodeURIComponent(id)}">Abrir monitor</a>
    `;

    grid.appendChild(card);
  });

  container.appendChild(grid);
}

searchInput?.addEventListener("input", (e) => {
  const q = String(e.target.value || "").toLowerCase().trim();
  if (!q) return render(channels);

  const filtered = channels.filter((c) =>
    String(c.client || "").toLowerCase().includes(q) ||
    String(c.id || "").toLowerCase().includes(q)
  );
  render(filtered);
});

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

