/* =====================================================================
   bewaking.js — gegevensbewaking en ALLE schrijfacties naar OneDrive
   ---------------------------------------------------------------------
   Beschermd bestand. Een wijziging hieraan laat de automatische controle
   falen tot de eigenaar het label "bewaking-ok" op de pull request zet.

   Regels die hier afgedwongen worden, bij elke opslag:
   1. Geen record verdwijnt, behalve records die de gebruiker expliciet
      verwijderde (opts.remove).
   2. Records die de gebruiker niet aanraakte (opts.touch) blijven
      byte-voor-byte gelijk. Code die bij het laden of opslaan stilletjes
      bestaande gegevens aanpast, wordt dus altijd geweigerd.
   3. Ook in een aangeraakt record verdwijnt geen enkel ingevuld veld.
   4. Toevoegen mag altijd: nieuwe wijnen, nieuwe regels, nieuwe velden.
   5. Enkel een herstel van een back-up (opts.replaceAll) mag alles
      vervangen, en daarvoor wordt eerst een back-up gemaakt.
   6. Bij de eerste opslag met een nieuwe appversie wordt eerst een
      volledige back-up weggeschreven.
   De opslag zelf vergelijkt altijd met de laatst geladen of opgeslagen
   versie (baseline), niet met wat de app in het geheugen heeft. Code die
   de gegevens in het geheugen buiten mutate() om aanpast, komt er dus
   niet door. De baseline is enkel binnen dit bestand aan te passen.
   ===================================================================== */
(function () {
  "use strict";
  const COLLECTIONS = { wines: "id", moves: "id", notes: "id", users: "email", refs: "id" }; // refs = zelf toegevoegde keuzes (land, streek, classificatie)
  const FREE_TOP = new Set(["meta"]); // vrij aanpasbaar door de app (technische gegevens)

  class GuardError extends Error { constructor(m) { super(m); this.name = "GuardError"; } }
  const clone = o => JSON.parse(JSON.stringify(o));
  function stable(o) {
    if (Array.isArray(o)) return "[" + o.map(stable).join(",") + "]";
    if (o && typeof o === "object") return "{" + Object.keys(o).filter(k => o[k] !== undefined).sort().map(k => JSON.stringify(k) + ":" + stable(o[k])).join(",") + "}";
    return JSON.stringify(o === undefined ? null : o);
  }
  const filled = v => !(v === undefined || v === null || v === "");

  function check(before, after, opts) {
    opts = opts || {};
    if (!after || typeof after !== "object") throw new GuardError("De kelder zou leeg worden.");
    if (opts.replaceAll) return;
    const touch = new Set((opts.touch || []).map(String));
    const remove = new Set((opts.remove || []).map(String));
    for (const [col, key] of Object.entries(COLLECTIONS)) {
      if (!(col in before) && !(col in after)) continue; // onderdeel bestaat (nog) niet, bv. refs in een oudere kelder
      const b = before[col] || [], a = after[col];
      if (!Array.isArray(a)) throw new GuardError(`Het onderdeel "${col}" zou verdwijnen.`);
      const am = new Map(a.map(r => [String(r && r[key]), r]));
      for (const r of b) {
        const k = String(r[key]);
        if (remove.has(k)) continue;
        const x = am.get(k);
        if (!x) throw new GuardError(`${col}/${k} zou verdwijnen zonder dat iemand het verwijderde.`);
        if (touch.has(k)) {
          for (const f of Object.keys(r)) if (filled(r[f]) && !(f in x)) throw new GuardError(`Het veld "${f}" van ${col}/${k} zou verdwijnen.`);
        } else if (stable(r) !== stable(x)) {
          throw new GuardError(`${col}/${k} zou veranderen zonder dat iemand het aanpaste.`);
        }
      }
    }
    for (const k of Object.keys(before)) {
      if (k in COLLECTIONS || FREE_TOP.has(k)) continue;
      if (!(k in after)) throw new GuardError(`Het onderdeel "${k}" zou verdwijnen.`);
      if (!touch.has("$" + k) && stable(before[k]) !== stable(after[k])) throw new GuardError(`"${k}" zou veranderen zonder dat iemand het aanpaste.`);
    }
  }

  /** Past een wijziging toe op een kopie en controleert ze. Geeft de nieuwe gegevens terug of gooit GuardError. */
  function apply(data, fn, opts) {
    const before = clone(data), after = clone(data);
    fn(after);
    check(before, after, opts);
    return after;
  }

  /* ---------------- Opslag in het geheugen / de browser (demo) ---------------- */
  const baselines = new WeakMap(); // store -> laatst geladen/opgeslagen versie (niet bereikbaar van buitenaf)
  const setBase = (store, d) => baselines.set(store, d ? clone(d) : null);
  const guardSave = (store, data, opts) => { const b = baselines.get(store); if (b) check(b, data, opts); };

  class MemoryStore {
    constructor(persistKey, appVersion) { this.key = persistKey; this.appVersion = appVersion; this.kind = "demo"; }
    /** fallback: functie die startgegevens levert als er nog niets bewaard is (demo). */
    async load(fallback) { let d = null; if (this.key) { try { const s = localStorage.getItem(this.key); if (s) d = JSON.parse(s); } catch (e) {} } if (!d && fallback) d = fallback(); setBase(this, d); return d; }
    snapshot() { const b = baselines.get(this); return b ? clone(b) : null; }
    async save(data, fn, opts) { guardSave(this, data, opts); data.meta = Object.assign({}, data.meta, { appVersion: this.appVersion }); if (this.key) { try { localStorage.setItem(this.key, JSON.stringify(data)); } catch (e) {} } setBase(this, data); return data; }
    async putPhoto(id, blob, dataUrl) { return dataUrl; }
    async photoUrl(ref) { return ref; }
  }

  /* ---------------- OneDrive ---------------- */
  let graphRaw = null; // wordt door de app aangeleverd (aangemelde gebruiker)
  const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  async function gjson(path, opt) {
    const r = await graphRaw(path, opt);
    if (!r.ok) { let m = String(r.status); try { m = (await r.json()).error.message; } catch (e) {} const err = new Error(m); err.status = r.status; throw err; }
    return r.status === 204 ? null : r.json();
  }
  const J = body => ({ headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

  class OneDriveStore {
    constructor(ref, appVersion) { this.d = ref.driveId; this.f = ref.folderId; this.etag = null; this.q = Promise.resolve(); this.cache = new Map(); this.appVersion = appVersion; this.kind = "onedrive"; }
    base() { return `/drives/${encodeURIComponent(this.d)}/items/${encodeURIComponent(this.f)}`; }
    async load() {
      const r = await graphRaw(this.base() + ":/cellar.json");
      if (r.status === 404) { this.etag = null; return null; }
      if (!r.ok) { const e = new Error("Kan de kelder niet openen (" + r.status + ")"); e.status = r.status; throw e; }
      const meta = await r.json(); this.etag = meta.eTag;
      const c = await fetch(meta["@microsoft.graph.downloadUrl"]);
      if (!c.ok) throw new Error("Kan cellar.json niet lezen (" + c.status + ")");
      const data = await c.json(); lsSet("wk.cache", JSON.stringify(data)); setBase(this, data); return data;
    }
    snapshot() { const b = baselines.get(this); return b ? clone(b) : null; }
    /** Eerste aanmaak: enkel als er nog geen cellar.json bestaat. */
    async create(data) {
      const r = await graphRaw(this.base() + ":/cellar.json:/content", { method: "PUT", headers: { "Content-Type": "application/json", "If-None-Match": "*" }, body: JSON.stringify(data, null, 1) });
      if (!r.ok) throw new Error("Aanmaken mislukt (" + r.status + ")");
      this.etag = (await r.json()).eTag; setBase(this, data); return data;
    }
    save(data, fn, opts) { this.q = this.q.then(() => this._save(data, fn, opts)); return this.q; }
    async _save(data, fn, opts) {
      opts = opts || {};
      guardSave(this, data, opts);
      if (opts.replaceAll) await this.backup("voor-herstel-" + today() + "-" + Date.now());
      if (!data.meta || data.meta.appVersion !== this.appVersion) {
        await this.backup("voor-versie-" + this.appVersion + "-" + today(), true);
        data.meta = Object.assign({}, data.meta, { appVersion: this.appVersion });
      }
      const put = d => graphRaw(this.base() + ":/cellar.json:/content", { method: "PUT", headers: Object.assign({ "Content-Type": "application/json" }, this.etag ? { "If-Match": this.etag } : {}), body: JSON.stringify(d, null, 1) });
      let r = await put(data);
      if (r.status === 412 && fn) {
        // Iemand anders heeft intussen opgeslagen: nieuwste versie laden, wijziging opnieuw toepassen én opnieuw controleren.
        const fresh = await this.load();
        data = apply(fresh, fn, opts);
        data.meta = Object.assign({}, data.meta, { appVersion: this.appVersion });
        r = await put(data);
      }
      if (!r.ok) throw new Error("OneDrive weigerde de wijziging (" + r.status + ")");
      this.etag = (await r.json()).eTag; lsSet("wk.cache", JSON.stringify(data)); setBase(this, data);
      this.backup("cellar-" + today()).catch(() => {});
      return data;
    }
    /** Kopie van het huidige bestand op OneDrive naar backups/ (server-side, geen herschrijving van de inhoud). */
    async backup(name, force) {
      const key = "wk.backup." + this.f;
      if (!force && name.startsWith("cellar-") && lsGet(key) === today()) return;
      const r = await graphRaw(this.base() + ":/cellar.json:/content");
      if (!r.ok) return; // nog geen bestand
      const blob = await r.blob();
      const w = await graphRaw(this.base() + ":/backups/" + name + ".json:/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: blob });
      if (!w.ok && force) throw new Error("Back-up vóór de update mislukt (" + w.status + "); er werd niets opgeslagen.");
      if (name.startsWith("cellar-")) lsSet(key, today());
    }
    async putPhoto(id, blob) {
      const path = `fotos/${id}.jpg`;
      const r = await graphRaw(this.base() + ":/" + path + ":/content", { method: "PUT", headers: { "Content-Type": "image/jpeg" }, body: blob });
      if (!r.ok) throw new Error("Foto uploaden mislukt (" + r.status + ")");
      return "od:" + path;
    }
    async photoUrl(ref) {
      if (!ref.startsWith("od:")) return ref;
      if (this.cache.has(ref)) return this.cache.get(ref);
      const r = await graphRaw(this.base() + ":/" + ref.slice(3) + ":/content"); if (!r.ok) return null;
      const u = URL.createObjectURL(await r.blob()); this.cache.set(ref, u); return u;
    }
    /* ---- toegang (delen van de map) ---- */
    async share(email, role) { return gjson(this.base() + "/invite", Object.assign({ method: "POST" }, J({ recipients: [{ email }], requireSignIn: true, sendInvitation: false, roles: [role === "viewer" ? "read" : "write"] }))); }
    async permsFor(email) { const l = await gjson(this.base() + "/permissions"); const e = email.toLowerCase(); return (l.value || []).filter(p => (p.grantedToV2?.user?.email || p.grantedTo?.user?.email || p.invitation?.email || "").toLowerCase() === e); }
    async setShareRole(email, role) { for (const p of await this.permsFor(email)) await gjson(this.base() + "/permissions/" + p.id, Object.assign({ method: "PATCH" }, J({ roles: [role === "viewer" ? "read" : "write"] }))); }
    async unshare(email) { for (const p of await this.permsFor(email)) await gjson(this.base() + "/permissions/" + p.id, { method: "DELETE" }); }
  }

  /* ---------------- Eenmalige handelingen van de beheerder ---------------- */
  async function createFolder(name) {
    try { return await gjson("/me/drive/root/children", Object.assign({ method: "POST" }, J({ name, folder: {}, "@microsoft.graph.conflictBehavior": "fail" }))); }
    catch (e) { if (e.status === 409) return gjson("/me/drive/root:/" + encodeURIComponent(name)); throw e; }
  }
  async function inviteGuest(email, name, redirect) {
    return gjson("/invitations", Object.assign({ method: "POST", scopes: ["User.Invite.All"] }, J({ invitedUserEmailAddress: email, invitedUserDisplayName: name || undefined, inviteRedirectUrl: redirect, sendInvitationMessage: true })));
  }

  window.WK_SAFE = Object.freeze({
    GuardError, check, apply, clone, MemoryStore, OneDriveStore, createFolder, inviteGuest,
    init(fn) { graphRaw = fn; }
  });
})();
