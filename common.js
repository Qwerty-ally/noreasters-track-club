import { isDemo } from "./db.js";
import { CONTACT_EMAIL } from "./firebase-config.js";

export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const $ = (s, r = document) => r.querySelector(s);
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const parseDate = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
export const longDate = s => parseDate(s).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
export const ago = t => {
  const s = (Date.now() - t) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + " min ago";
  if (s < 86400) return Math.floor(s / 3600) + " hr ago";
  return new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const page = document.body.dataset.page;
const link = (href, label, key) => `<a href="${href}"${page === key ? " aria-current=page" : ""}>${label}</a>`;
document.body.insertAdjacentHTML("afterbegin", `
${isDemo ? `<div class="banner">Demo mode: Firebase isn't connected yet, so data is saved only in this browser. See README.md.</div>` : ""}
<header class="site"><div class="wrap">
  <a href="index.html" aria-label="Nor'easters Track Club home"><img src="img/logo-full.png" alt="Nor'easters Track Club"></a>
  <nav class="nav">
    ${link("index.html#about", "About", "home")}
    ${link("races.html", "Races", "races")}
    ${link("contact.html", "Contact", "contact")}
  </nav>
</div></header>`);
document.body.insertAdjacentHTML("beforeend", `
<footer><div class="wrap">
  <img src="img/logo-icon.png" alt="">
  <div>Nor'easters Track Club &middot; Masters women's running in New England</div>
  <div style="margin-top:6px"><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> &middot; <a href="admin.html">Admin</a></div>
</div></footer>`);
