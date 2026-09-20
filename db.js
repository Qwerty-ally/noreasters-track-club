// Data layer: Firebase (Firestore + Auth) when configured, otherwise a localStorage demo backend.
import { firebaseConfig, ADMIN_EMAIL } from "./firebase-config.js";

export const isDemo = !firebaseConfig.apiKey || !firebaseConfig.projectId;
const V = "10.12.2";
let api;

if (!isDemo) {
  const [{ initializeApp }, fs, au] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`)
  ]);
  const app = initializeApp(firebaseConfig);
  const db = fs.getFirestore(app);
  const auth = au.getAuth(app);
  const sub = (path, order, cb) =>
    fs.onSnapshot(fs.query(fs.collection(db, ...path), fs.orderBy(...order)),
      s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))), e => console.error(e));
  api = {
    races: cb => sub(["races"], ["date", "asc"], cb),
    addRace: r => fs.addDoc(fs.collection(db, "races"), r),
    deleteRace: id => fs.deleteDoc(fs.doc(db, "races", id)),
    rsvps: (raceId, cb) => sub(["races", raceId, "rsvps"], ["createdAt", "asc"], cb),
    addRsvp: (raceId, r) => fs.addDoc(fs.collection(db, "races", raceId, "rsvps"), { ...r, createdAt: Date.now() }),
    deleteRsvp: (raceId, id) => fs.deleteDoc(fs.doc(db, "races", raceId, "rsvps", id)),
    comments: cb => sub(["comments"], ["createdAt", "desc"], cb),
    addComment: c => fs.addDoc(fs.collection(db, "comments"), { ...c, createdAt: Date.now() }),
    deleteComment: id => fs.deleteDoc(fs.doc(db, "comments", id)),
    messages: cb => sub(["messages"], ["createdAt", "desc"], cb),
    addMessage: m => fs.addDoc(fs.collection(db, "messages"), { ...m, createdAt: Date.now() }),
    deleteMessage: id => fs.deleteDoc(fs.doc(db, "messages", id)),
    login: (e, p) => au.signInWithEmailAndPassword(auth, e, p),
    logout: () => au.signOut(auth),
    onAuth: cb => au.onAuthStateChanged(auth, u => cb(u && u.email === ADMIN_EMAIL ? u : null))
  };
} else {
  // ---- demo backend (localStorage) ----
  const listeners = new Set();
  const load = k => { try { return JSON.parse(localStorage.getItem("ntc:" + k)) || []; } catch { return []; } };
  const save = (k, v) => { localStorage.setItem("ntc:" + k, JSON.stringify(v)); listeners.forEach(f => f()); };
  const uid = () => Math.random().toString(36).slice(2, 10);
  const watch = (fn) => { listeners.add(fn); fn(); return () => listeners.delete(fn); };
  // clear sample races seeded by earlier versions
  save("races", load("races").filter(r => r.id !== "d1" && r.id !== "d2"));
  let authCb = () => {};
  const logged = () => localStorage.getItem("ntc:admin") === "1";
  api = {
    races: cb => watch(() => cb(load("races").sort((a, b) => a.date.localeCompare(b.date)))),
    addRace: r => save("races", [...load("races"), { ...r, id: uid() }]),
    deleteRace: id => save("races", load("races").filter(r => r.id !== id)),
    rsvps: (raceId, cb) => watch(() => cb(load("rsvps").filter(r => r.raceId === raceId))),
    addRsvp: (raceId, r) => save("rsvps", [...load("rsvps"), { ...r, raceId, id: uid(), createdAt: Date.now() }]),
    deleteRsvp: (raceId, id) => save("rsvps", load("rsvps").filter(r => r.id !== id)),
    comments: cb => watch(() => cb(load("comments").sort((a, b) => b.createdAt - a.createdAt))),
    addComment: c => save("comments", [...load("comments"), { ...c, id: uid(), createdAt: Date.now() }]),
    deleteComment: id => save("comments", load("comments").filter(c => c.id !== id)),
    messages: cb => watch(() => cb(load("messages").sort((a, b) => b.createdAt - a.createdAt))),
    addMessage: m => save("messages", [...load("messages"), { ...m, id: uid(), createdAt: Date.now() }]),
    deleteMessage: id => save("messages", load("messages").filter(m => m.id !== id)),
    login: async () => { localStorage.setItem("ntc:admin", "1"); authCb(logged() ? { email: ADMIN_EMAIL } : null); },
    logout: async () => { localStorage.removeItem("ntc:admin"); authCb(null); },
    onAuth: cb => { authCb = cb; cb(logged() ? { email: ADMIN_EMAIL } : null); }
  };
}

export default api;
