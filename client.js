// client.js (root) — Página /client/ (client/index.html)
(async function () {
  const qs = new URLSearchParams(location.search);
  const id = (qs.get("id") || "").trim();

  const $title = document.getElementById("pageTitle");
  const $subtitle = document.getElementById("pageSubtitle");
  const $clientName = document.getElementById("clientName");
  const $audio = document.getElementById("player");
  const $frame = document.getElementById("rbFrame");
  const $error = document.getElementById("errorBox");

  function showError(msg) {
    if ($error) {
      $error.textContent = msg;
      $error.style.display = "block";
    } else {
      alert(msg);
    }
  }

  if (!id) {
    showError("Falta el parámetro ?id= en la URL. Ej: /client/?id=pepe-ganga");
    return;
  }

  let channels;
  try {
    const res = await fetch("/channels.json", { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo leer /channels.json");
    channels = await res.json();
  } catch (e) {
    showError("Error cargando channels.json: " + e.message);
    return;
  }

  const ch = channels.find(x => x.id === id);
  if (!ch) {
    showError(`No existe el cliente con id="${id}" en channels.json`);
    return;
  }

  // Header texts
  if ($title) $title.textContent = `Monitor: ${ch.name}`;
  if ($subtitle) $subtitle.textContent = `Voice Experience - Musicar | ID: ${ch.id}`;
  if ($clientName) $clientName.textContent = ch.name;

  // Player
  if ($audio) {
    $audio.src = ch.streamUrl;
    $audio.load();
  }

  // Widget iframe (RadioBOSS)
  const rb = ch.rb || {};
  const host = rb.host;
  const u = rb.u;
  const widNow = rb.widNow;
  const widRecent = rb.widRecent;
  const tf = rb.tf ? 1 : 0;
  const cnt = rb.recentCount || 10;
  const coverSize = (typeof rb.coverSize === "number") ? rb.coverSize : 0;

  if (!host || !u || !widNow || !widRecent) {
    showError("Faltan datos rb (host/u/widNow/widRecent) en channels.json para este cliente.");
    return;
  }

  const iframeUrl =
    `/widget.html?host=${encodeURIComponent(host)}` +
    `&u=${encodeURIComponent(u)}` +
    `&widNow=${encodeURIComponent(widNow)}` +
    `&widRecent=${encodeURIComponent(widRecent)}` +
    `&tf=${encodeURIComponent(tf)}` +
    `&cnt=${encodeURIComponent(cnt)}` +
    `&coverSize=${encodeURIComponent(coverSize)}`;

  if ($frame) {
    $frame.src = iframeUrl;
  }
})();
