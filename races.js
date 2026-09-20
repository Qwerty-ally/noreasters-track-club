import db from "./db.js";
import { esc, $, MONTHS, parseDate, longDate } from "./common.js";

// Renders upcoming (and optionally past) races with "I'm coming" sign-ups.
export function mountRaces(sel, { limit = Infinity, showPast = false } = {}) {
  const root = $(sel);
  let unsubs = [];
  db.races(all => {
    unsubs.forEach(u => u && u()); unsubs = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const up = all.filter(r => parseDate(r.date) >= today);
    const past = all.filter(r => parseDate(r.date) < today).reverse();
    const shown = up.slice(0, limit);
    root.innerHTML = shown.length ? shown.map(card).join("")
      : `<div class="empty">No upcoming races posted yet. Check back soon!</div>`;
    if (showPast && past.length) root.insertAdjacentHTML("beforeend", `<h3 style="margin-top:40px">Past races</h3>` + past.map(r => card(r, true)).join(""));
    [...shown, ...(showPast ? past : [])].forEach(r => wire(r));
  });

  function card(r, isPast) {
    const d = parseDate(r.date);
    return `<article class="race${isPast ? " past" : ""}" id="race-${r.id}">
      <div class="race-top">
        <div class="date"><div class="m">${MONTHS[d.getMonth()]}</div><div class="d">${d.getDate()}</div></div>
        <div class="race-info">
          <h3>${esc(r.name)}</h3>
          <div class="meta">${esc(longDate(r.date))}${r.location ? " &middot; " + esc(r.location) : ""}</div>
          ${r.notes ? `<p style="margin:8px 0 0">${esc(r.notes)}</p>` : ""}
          ${/^https?:\/\//.test(r.url || "") ? `<p style="margin:8px 0 0"><a href="${esc(r.url)}" target="_blank" rel="noopener">Race website &rarr;</a></p>` : ""}
        </div>
      </div>
      <div class="who">
        <div class="who-head"><strong style="font-family:Montserrat,sans-serif;font-size:.85rem">Who's coming <span class="tag" data-count>0</span></strong></div>
        <div class="pills" data-pills><span class="meta">Nobody yet.</span></div>
        ${isPast ? "" : `<form class="rsvp" data-form>
          <input name="name" placeholder="Your name" required maxlength="60" aria-label="Your name">
          <select name="status" aria-label="Status"><option value="going">I'm coming</option><option value="maybe">Maybe</option></select>
          <button class="btn small" type="submit">Sign up</button>
        </form>`}
      </div>
    </article>`;
  }

  function wire(r) {
    const el = $("#race-" + CSS.escape(r.id), root);
    if (!el) return;
    unsubs.push(db.rsvps(r.id, list => {
      $("[data-count]", el).textContent = list.filter(x => x.status === "going").length;
      $("[data-pills]", el).innerHTML = list.length
        ? list.map(x => `<span class="pill ${x.status === "maybe" ? "maybe" : ""}">${esc(x.name)}${x.status === "maybe" ? " (maybe)" : ""}</span>`).join("")
        : `<span class="meta">Nobody yet. Be the first!</span>`;
    }));
    const f = $("[data-form]", el);
    if (!f) return;
    const saved = localStorage.getItem("ntc:name"); if (saved) f.name.value = saved;
    f.addEventListener("submit", async e => {
      e.preventDefault();
      const name = f.name.value.trim(); if (!name) return;
      e.submitter.disabled = true;
      try { await db.addRsvp(r.id, { name, status: f.status.value }); localStorage.setItem("ntc:name", name); }
      catch (err) { console.error(err); alert("Couldn't save your sign-up. Please try again."); }
      e.submitter.disabled = false;
    });
  }
}
