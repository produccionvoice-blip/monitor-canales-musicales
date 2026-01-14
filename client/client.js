// client/client.js — Solo reproductor
(async function () {
  const title = document.getElementById("title");
  const clientName = document.getElementById("clientName");
  const player = document.getElementById("player");
  const msg = document.getElementById("msg");

  const id = new URLSearchParams(location.search).get("id");

  function setMsg(text, isError = false) {
    msg.textContent = text;
    msg.className = isError ? "error" : "hint";
  }

  if (!id) {
    title.textContent = "Cliente no especificado";
    clientName.textContent = "—";
    setMsg("Falta el parámetro ?id= en la URL.", true);
    return;
  }

  let channels = [];
  try {
    const res = await fetch("../channels.json?v=" + Date.now(), { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    channels = await res.json();
  } catch (e) {
    title.textContent = "Error";
    clientName.textContent = "—";
    setMsg("No se pudo leer channels.json: " + e.message, true);
    return;
  }

  const ch = channels.find((c) => c.id === id);
  if (!ch) {
    title.textContent = "Cliente no encontrado";
    clientName.textContent = "—";
    setMsg(`No existe el cliente con id="${id}" en channels.json`, true);
    return;
  }

  title.textContent = `Monitor: ${ch.name}`;
  clientName.textContent = ch.name;

  // Reproductor
  player.src = ch.stream;
  setMsg("Listo. Presiona Play para escuchar el canal.");
})();
