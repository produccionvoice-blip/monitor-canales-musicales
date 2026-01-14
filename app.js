// app.js — Home (lista de clientes)
(async function () {
  const grid = document.getElementById("channels");
  const search = document.getElementById("search");

  if (!grid) return;

  let channels = [];
  try {
    const res = await fetch("./channels.json?v=" + Date.now(), { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    channels = await res.json();
  } catch (e) {
    grid.innerHTML = `<div class="error">No se pudo cargar channels.json: ${e.message}</div>`;
    return;
  }

  function render(list) {
    if (!list.length) {
      grid.innerHTML = `<div class="empty">No hay clientes para mostrar.</div>`;
      return;
    }

    grid.innerHTML = list
      .map((c) => {
        return `
          <div class="clientCard">
            <h3>${c.name}</h3>
            <a class="btn" href="./client/index.html?id=${encodeURIComponent(c.id)}">Abrir monitor</a>
          </div>
        `;
      })
      .join("");
  }

  render(channels);

  if (search) {
    search.addEventListener("input", () => {
      const q = (search.value || "").trim().toLowerCase();
      const filtered = channels.filter((c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
      render(filtered);
    });
  }
})();
