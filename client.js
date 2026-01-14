// client.js
const $ = (id) => document.getElementById(id);

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

async function loadClient() {
  const id = (qs("id") || "").trim();

  if (!id) {
    $("pageTitle").textContent = "Cliente no especificado";
    $("clientName").textContent = "—";
    $("widgetError").style.display = "block";
    $("widgetError").textContent = "Falta el parámetro ?id= en la URL.";
    return;
  }

  let channels;
  try {
    const res = await fetch(`/channels.json?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    channels = await res.json();
  } catch (e) {
    $("pageTitle").textContent = "Error";
    $("widgetError").style.display = "block";
    $("widgetError").textContent = `No se pudo cargar channels.json: ${e.message}`;
    return;
  }

  const ch = channels.find((c) => c.id === id);

  if (!ch) {
    $("pageTitle").textContent = "Cliente no encontrado";
    $("clientName").textContent = id;
    $("widgetError").style.display = "block";
    $("widgetError").textContent = `No existe un cliente con id="${id}" en channels.json.`;
    return;
  }

  // Títulos
  $("pageTitle").textContent = `Monitor: ${ch.name}`;
  $("clientName").textContent = ch.name;
  document.title = `Monitor - ${ch.name} | Musicar`;

  // Audio
  const audio = $("player");
  audio.src = ch.streamUrl;
  audio.crossOrigin = "anonymous";
  audio.load();

  audio.addEventListener("error", () => {
    $("audioError").style.display = "block";
    $("audioError").textContent =
      "El stream no pudo cargarse. Verifica que el streamUrl funcione y sea accesible por HTTPS.";
  });

  // Widget (iframe): el widget.html hará fetch de channels.json y pintará NowPlaying + Recientes
  const frame = $("rbFrame");
  frame.src = `/widget.html?id=${encodeURIComponent(id)}&v=${Date.now()}`;
}

loadClient();
