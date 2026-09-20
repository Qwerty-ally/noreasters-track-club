import db from "./db.js";
import { esc, $, ago } from "./common.js";

// Site-wide comment wall. Mount with mountComments("#comments").
export function mountComments(sel) {
  const root = $(sel);
  root.innerHTML = `
    <form id="cform">
      <div class="row2">
        <div><label for="cn">Name</label><input id="cn" required maxlength="60" autocomplete="name"></div>
        <div></div>
      </div>
      <label for="ct">Comment</label>
      <textarea id="ct" required maxlength="1000" placeholder="Cheer someone on, ask a question, share a training tip..."></textarea>
      <div style="margin-top:14px"><button class="btn" type="submit">Post comment</button></div>
      <div class="msg" id="cmsg" role="status"></div>
    </form>
    <div id="clist"></div>`;
  const saved = localStorage.getItem("ntc:name"); if (saved) $("#cn", root).value = saved;
  $("#cform", root).addEventListener("submit", async e => {
    e.preventDefault();
    const name = $("#cn", root).value.trim(), text = $("#ct", root).value.trim();
    if (!name || !text) return;
    const btn = e.submitter; btn.disabled = true;
    try {
      await db.addComment({ name, text });
      localStorage.setItem("ntc:name", name);
      $("#ct", root).value = ""; $("#cmsg", root).textContent = "";
    } catch (err) {
      console.error(err); $("#cmsg", root).className = "msg err"; $("#cmsg", root).textContent = "Couldn't post your comment. Please try again.";
    }
    btn.disabled = false;
  });
  db.comments(list => {
    $("#clist", root).innerHTML = list.length
      ? list.map(c => `<div class="comment"><span class="by">${esc(c.name)}</span><span class="when">${ago(c.createdAt)}</span><p>${esc(c.text)}</p></div>`).join("")
      : `<div class="empty" style="margin-top:14px">No comments yet. Be the first!</div>`;
  });
}
