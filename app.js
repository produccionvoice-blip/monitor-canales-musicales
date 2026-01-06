const container = document.getElementById("channels");
const searchInput = document.getElementById("search");

let channels = [];

fetch("channels.json")
  .then(res => res.json())
  .then(data => {
    channels = data;
    renderChannels(channels);
  });

function renderChannels(list) {
  container.innerHTML = "";
  list.forEach(channel => {
    const div = document.createElement("div");
    div.className = "channel";
    div.innerHTML = `
      <h3>${channel.client}</h3>
      <audio controls preload="none">
        <source src="${channel.url}" type="audio/mpeg">
      </audio>
    `;
    container.appendChild(div);
  });
}

searchInput.addEventListener("input", e => {
  const value = e.target.value.toLowerCase();
  const filtered = channels.filter(c =>
    c.client.toLowerCase().includes(value)
  );
  renderChannels(filtered);
});
