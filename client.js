// client.js (DETALLE /client/?id=...)
const elTitle = document.getElementById("pageTitle");
const elSub = document.getElementById("pageSub");
const elAudio = document.getElementById("player");
const elFrame = document.getElementById("rbFrame");
const elErr = document.getElementById("clientError");

function getId() {
  const p = new URLSearchParams(location.search);
  return (p.get("id") || "").trim();
}

async function fetchChannels() {
  const res = await fetch(`/channels.json?v=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function buildWidgetUrl(rb) {
  const params = new URLSearchParams();
  params.set("host", rb.host);
  params.set("u", String(rb.u));
  params.set("widNow", String(rb.widNow));
  params.set("widRecent", String(rb.widRecent));
  params.set("cnt", "10");

  // ocultar carátulas para monitoreo, pero dejando los elementos (RadioBOSS igual los usa)
  params.set("npSize", "0");
  params.set("recentSize", "0");

  if (rb.tf) params.set("tf", "1");

  // cache-bust
  params.set("v", String(Date.now()));

  return `/widget.html?${params.toString()}`;
}

async function init() {
  const id = getId();
  if (!id) {
    elErr.textContent = "Falta el parámetro ?id= en la URL.";
    elErr.style.display = "block";
    return;
  }

  try {
    const channels = await fetchChannels();
    const ch = channels.find((x) => x.id === id);

    if (!ch) {
      elErr.textContent = `No encontré el cliente con id="${id}" en channels.json.`;
      elErr.style.display = "block";
      return;
    }

    const name = ch.name || ch.client || ch.id;

    document.title = `Monitor: ${name}`;
    elTitle.textContent = name;
    elSub.textContent = `Voice Experience - Musicar | ID: ${ch.id}`;

    // Player
    elAudio.src = ch.streamUrl;
    elAudio.load();

    // Widget iframe
    if (!ch.rb?.host || !ch.rb?.u || !ch.rb?.widNow || !ch.rb?.widRecent) {
      elErr.textContent = "Falta configuración rb (host/u/widNow/widRecent) para este cliente.";
      elErr.style.display = "block";
      return;
    }

    elFrame.src = buildWidgetUrl(ch.rb);
  } catch (e) {
    elErr.textContent = `Error cargando datos: ${e.message}`;
    elErr.style.display = "block";
  }
}

init();
