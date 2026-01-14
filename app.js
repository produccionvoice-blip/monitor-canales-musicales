// app.js (HOME)
const grid = document.getElementById("grid");
const search = document.getElementById("search");

let CHANNELS = [];

function norm(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function render(list) {
  if (!grid) return;

  grid.innerHTML = "";

  if (!list.length) {
    grid.innerHTML = `<div class="empty">No hay resultados.</div>`;
    return;
  }

  for (const ch of list) {
    const name = ch.name || ch.client || "SIN NOMBRE";
    const id = ch.id || "";

    const card = document.createElement("div");
    card.className = "clientCard";

    card.innerHTML = `
      <div class="clientTitle">${name}</div>
      <div class="clientMeta">ID: ${id || "-"}</div>
      <a class="btn" href="/client/?id=${encodeURIComponent(id)}">Abrir monitor</a>
    `;

    grid.appendChild(card);
  }
}

async function load() {
  // Si el contenedor no existe, mostramos error visible (evita “pantalla vacía”)
  if (!grid) {
    console.error('No existe el contenedor #grid en index.html');
    return;
  }

  try {
    const res = await fetch(`/channels.json?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    CHANNELS = await res.json();

    render(CHANNELS);
  } catch (e) {
    grid.innerHTML = `<div class="error">Error cargando channels.json: ${e.message}</div>`;
  }
}

search?.addEventListener("input", () => {
  const q = norm(search.value);
  if (!q) return render(CHANNELS);

  render(
    CHANNELS.filter((c) => {
      const name = c.name || c.client || "";
      return norm(name).includes(q) || norm(c.id).includes(q);
    })
  );
});

load();
