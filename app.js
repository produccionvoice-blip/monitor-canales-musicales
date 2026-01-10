const container = document.getElementById("channels");
const searchInput = document.getElementById("search");
let channels = [];

fetch("channels.json", { cache: "no-store" })
  .then((r) => r.json())
  .then((data) => {
    channels = Array.isArray(data) ? data : [];
    renderChannels(channels);
  })
  .catch((e) => {
    console.error(e);
    container.innerHTML = `<div class="error">No se pudo cargar channels.json</div>`;
  });

function renderChannels(list) {
  container.innerHTML = "";
  list.forEach((ch, idx) => {
    const card = document.createElement("div");
    card.className = "channel";

    const client = ch.client || "SIN NOMBRE";
    const url = ch.url || "";

    card.innerHTML = `
      <h3>${escapeHtml(client)}</h3>

      ${url ? `
        <audio controls preload="none" crossorigin="anonymous">
          <source src="${escapeAttr(url)}" type="audio/mpeg">
          Tu navegador no soporta audio HTML5.
        </audio>
      ` : `<div class="rb-missing">Sin URL de stream.</div>`}

      <div class="rb-block">
        <div class="rb-title">AHORA SONANDO</div>
        <div id="np_${idx}" class="rb-now"></div>
      </div>

      <div class="rb-block">
        <div class="rb-title">RECIENTES (10)</div>
        <div id="rt_${idx}" class="rb-recent"></div>
      </div>
    `;

    container.appendChild(card);

    // Insertar widgets RadioBOSS (si hay configuración)
    if (ch.rb && ch.rb.host && ch.rb.u && ch.rb.widNow && ch.rb.widRecent) {
      mountRadioBossWidgets(ch.rb, idx);
    } else {
      card.querySelectorAll(".rb-now, .rb-recent").forEach(el => {
        el.innerHTML = `<div class="rb-missing">Falta configuración rb en channels.json</div>`;
      });
    }
  });
}

function mountRadioBossWidgets(rb, idx) {
  const host = rb.host;
  const u = rb.u;
  const widNow = rb.widNow;
  const widRecent = rb.widRecent;
  const tf = rb.tf ? `&tf=${rb.tf}` : "";

  // Now Playing (HTML oficial)
  const np = document.getElementById(`np_${idx}`);
  np.innerHTML = `
    <div class="rbcloud_nowplaying">
      <div>
        <a target="_blank" rel="noopener" href="${host}/w/artwork/${u}.jpg">
          <img id="rbcloud_np_c${widNow}" src="${host}/w/artwork/${u}.jpg" width="65" height="65" alt="cover art">
        </a>
      </div>
      <div style="margin-left: 5pt;">
        <div id="rbcloud_np_a${widNow}" style="font-weight: bold"></div>
        <div id="rbcloud_np_t${widNow}">...</div>
      </div>
    </div>
  `;

  // Recent (HTML oficial)
  const rt = document.getElementById(`rt_${idx}`);
  rt.innerHTML = `
    <div class="rbcloud_recenttracks" id="rbcloud_recent${widRecent}" data-cnt="10">
      <div class="rbcloud_recent_track">
        <div class="rbcloud_recent_track_cover" data-size="65"></div>
        <div style="margin-left: 5pt;">
          <div class="rbcloud_recent_artist" style="font-weight: bold"></div>
          <div class="rbcloud_recent_title">...</div>
        </div>
      </div>
    </div>
  `;

  // Scripts (evitar duplicado por wid)
  injectOnce(`rb_np_script_${widNow}`, `${host}/w/nowplaying2.js?u=${u}&wid=${widNow}${tf}`);
  injectOnce(`rb_recent_script_${widRecent}`, `${host}/w/recent.js?u=${u}&wid=${widRecent}&v=2${tf}`);
}

function injectOnce(id, src) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.src = src;
  s.async = true;
  document.body.appendChild(s);
}

searchInput?.addEventListener("input", (e) => {
  const v = (e.target.value || "").toLowerCase().trim();
  if (!v) return renderChannels(channels);
  renderChannels(channels.filter(c => String(c.client || "").toLowerCase().includes(v)));
});

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function escapeAttr(str) { return escapeHtml(str); }
