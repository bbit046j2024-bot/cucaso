const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
if (toggle) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}
document.querySelectorAll(".main-nav a").forEach(link => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

// Demo countdown only. Replace with the real rally date in the production app.
const rallyDate = new Date("2026-11-15T09:00:00+03:00").getTime();
function updateCountdown() {
  const diff = rallyDate - Date.now();
  if (diff <= 0) return;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const minutes = Math.floor((diff / 60000) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  document.querySelector("#days").textContent = days;
  const values = document.querySelectorAll(".countdown strong");
  if (values[1]) values[1].textContent = hours;
  if (values[2]) values[2].textContent = minutes;
  if (values[3]) values[3].textContent = seconds;
}
updateCountdown();
setInterval(updateCountdown, 1000);
