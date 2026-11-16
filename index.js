const KEY = "attach.publisher.v1";
const GENRES = ["Fiction", "Non-fiction", "Poetry", "Children’s", "Essay"];

const seed = () => [
  { id: "s1", author: "Amina Bello", title: "Harmattan Letters", genre: "Fiction", mine: false,
    synopsis: "A set of linked letters between two sisters separated by the Lagos–Kano road, following one dry season.",
    status: "In review", note: "", date: new Date().toISOString() },
  { id: "s2", author: "Tunde Adeyemi", title: "Small Phones, Big Markets", genre: "Non-fiction", mine: false,
    synopsis: "How basic-phone services such as USSD keep informal traders connected when data is expensive.",
    status: "In review", note: "", date: new Date().toISOString() }
];

function load() {
  try { const r = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(r)) return r; } catch {}
  return seed();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(subs)); } catch {} }

let subs = load();
let role = "writer";

const $ = id => document.getElementById(id);
const announce = t => { $("announce").textContent = t; };
function el(tag, props = {}, ...kids) { const e = Object.assign(document.createElement(tag), props); e.append(...kids); return e; }

/* ---------- Role switch ---------- */
function setRole(r) {
  role = r;
  $("role-writer").setAttribute("aria-pressed", r === "writer");
  $("role-publisher").setAttribute("aria-pressed", r === "publisher");
  $("role-writer").className = "btn" + (r === "writer" ? "" : " ghost");
  $("role-publisher").className = "btn" + (r === "publisher" ? "" : " ghost");
  $("writer-view").hidden = r !== "writer";
  $("publisher-view").hidden = r !== "publisher";
  announce(r === "writer" ? "Writer view" : "Publisher review desk");
  render();
}
$("role-writer").addEventListener("click", () => setRole("writer"));
$("role-publisher").addEventListener("click", () => setRole("publisher"));

/* ---------- Cards ---------- */
function card(s) {
  const li = el("li", { className: "sub" });
  li.append(
    el("h3", { textContent: s.title }),
    el("p", { className: "meta", textContent: `${s.author} · ${s.genre} · ${new Date(s.date).toLocaleDateString()}` }),
    el("p", { textContent: s.synopsis }),
    el("p", {}, "Status: ", el("span", { className: "badge", textContent: s.status }))
  );
  if (s.note) li.append(el("p", { className: "pnote" }, el("strong", { textContent: "Publisher note: " }), s.note));
  return li;
}

function renderWriter() {
  const list = $("my-list");
  list.replaceChildren();
  const mine = subs.filter(s => s.mine);
  if (!mine.length) { list.append(el("li", { className: "empty-row", textContent: "You have not submitted anything yet." })); return; }
  mine.forEach(s => {
    const li = card(s);
    if (s.status === "Changes requested") {
      const b = el("button", { className: "btn ghost", type: "button", textContent: "Resubmit for review" });
      b.addEventListener("click", () => { s.status = "In review"; save(); announce(`“${s.title}” resubmitted.`); render(); });
      li.append(b);
    }
    list.append(li);
  });
}

function decide(s, status, noteEl, errEl) {
  const note = noteEl.value.trim();
  if (status !== "Accepted" && !note) {
    errEl.textContent = "Add a short note so the writer knows why.";
    noteEl.setAttribute("aria-invalid", "true");
    noteEl.focus();
    return;
  }
  s.status = status; s.note = note; save();
  announce(`“${s.title}”: ${status}.`);
  render();
}

function renderDesk() {
  const list = $("desk-list");
  list.replaceChildren();
  const f = $("filter").value;
  const shown = subs.filter(s => f === "All" || s.status === f);
  if (!shown.length) { list.append(el("li", { className: "empty-row", textContent: "Nothing to show for this filter." })); return; }
  shown.forEach(s => {
    const li = card(s);
    if (s.status === "In review") {
      const nid = "note-" + s.id, eid = "note-err-" + s.id;
      const ta = el("textarea", { id: nid });
      ta.setAttribute("aria-describedby", eid);
      const err = el("p", { className: "err", id: eid });
      err.setAttribute("role", "alert");
      const row = el("div", { className: "row" });
      [["Accept", "Accepted"], ["Request changes", "Changes requested"], ["Decline", "Declined"]].forEach(([label, st], i) => {
        const b = el("button", { className: "btn" + (i ? " ghost" : ""), type: "button", textContent: label });
        b.addEventListener("click", () => decide(s, st, ta, err));
        row.append(b);
      });
      li.append(el("label", { htmlFor: nid, textContent: "Note to the writer (required unless accepting)" }), ta, err, row);
    }
    list.append(li);
  });
}

function render() { role === "writer" ? renderWriter() : renderDesk(); }
$("filter").addEventListener("change", renderDesk);

/* ---------- Pitch form ---------- */
GENRES.forEach(g => $("genre").append(el("option", { textContent: g })));

const rules = {
  author:   v => v.trim() ? "" : "Enter your name.",
  title:    v => v.trim() ? "" : "Enter a title.",
  synopsis: v => v.trim().length >= 30 ? "" : "Write at least 30 characters."
};
function check(id) {
  const e = $(id), m = rules[id](e.value);
  $(id + "-err").textContent = m;
  e.setAttribute("aria-invalid", m ? "true" : "false");
  return !m;
}
Object.keys(rules).forEach(id => $(id).addEventListener("blur", () => check(id)));

$("pitch-form").addEventListener("submit", e => {
  e.preventDefault();
  const ids = Object.keys(rules), ok = ids.map(check);
  if (ok.includes(false)) { $(ids[ok.indexOf(false)]).focus(); return; }
  subs.unshift({
    id: "s" + Date.now(), mine: true, status: "In review", note: "", date: new Date().toISOString(),
    author: $("author").value.trim(), title: $("title").value.trim(),
    genre: $("genre").value, synopsis: $("synopsis").value.trim()
  });
  save();
  $("title").value = ""; $("synopsis").value = "";
  ["title", "synopsis"].forEach(id => $(id).removeAttribute("aria-invalid"));
  announce("Pitch submitted. It is now in review.");
  render();
});

$("reset").addEventListener("click", () => {
  subs = seed(); save();
  announce("Demo data reset.");
  render();
});

$("yr").textContent = new Date().getFullYear();
render();
