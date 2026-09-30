// tests/controle.mjs — automatische controle bij elke wijziging (lokaal: `node tests/controle.mjs`)
// Faalt als de code de afspraken rond gegevensbescherming schendt.
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const app = f => readFileSync(join(root, "app", f), "utf8");
let fails = 0, passes = 0;
const ok = (cond, msg) => { if (cond) passes++; else { fails++; console.error("✗ " + msg); } };
const throws = (fn, msg) => { try { fn(); ok(false, msg + " (werd NIET tegengehouden)"); } catch (e) { ok(e.name === "GuardError", msg + " (verkeerde fout: " + e.message + ")"); } };
const passesG = (fn, msg) => { try { fn(); ok(true, msg); } catch (e) { ok(false, msg + " — " + e.message); } };

/* 1. Gegevensbewaking werkt zoals afgesproken ------------------------------------------ */
const ctx = { window: {}, localStorage: { getItem: () => null, setItem() {} }, console };
vm.createContext(ctx);
vm.runInContext(app("bewaking.js"), ctx);
const S = ctx.window.WK_SAFE;
ok(S && typeof S.apply === "function", "bewaking.js levert WK_SAFE.apply");
const base = () => JSON.parse(readFileSync(join(root, "voorbeeld", "cellar.json"), "utf8"));
const w0 = base().wines[0].id, w1 = base().wines[1].id, u0 = base().users[0].email;

throws(() => S.apply(base(), d => { d.wines[1].stock = 99; }, { touch: [w0] }), "Een wijn wijzigen die de gebruiker niet aanraakte");
throws(() => S.apply(base(), d => { d.wines.forEach(w => { w.webValue = 0; }); }, {}), "Alle wijnen tegelijk aanpassen (bv. een 'migratie')");
throws(() => S.apply(base(), d => { d.wines.splice(1, 1); }, {}), "Een wijn laten verdwijnen zonder verwijderopdracht");
throws(() => S.apply(base(), d => { d.moves = []; }, {}), "Het logboek leegmaken");
throws(() => S.apply(base(), d => { delete d.wines[0].grapes; }, { touch: [w0] }), "Een ingevuld veld laten verdwijnen, ook in een aangeraakt record");
throws(() => S.apply(base(), d => { d.notes[0].rating = 1; }, {}), "Een beoordeling aanpassen zonder dat iemand het deed");
throws(() => S.apply(base(), d => { d.users[0].role = "viewer"; }, {}), "Een rol wijzigen zonder opdracht");
throws(() => S.apply(base(), d => { d.name = "x"; }, {}), "De naam van de kelder wijzigen zonder opdracht");
throws(() => S.apply(base(), d => { delete d.wines; }, {}), "Het onderdeel wijnen laten verdwijnen");
passesG(() => S.apply(base(), d => { d.wines[0].stock -= 1; d.moves.push({ id: "t1", wineId: w0, kind: "consume", qty: 1, date: "2026-01-01" }); }, { touch: [w0] }), "Een fles drinken (aangeraakte wijn + nieuwe regel)");
passesG(() => S.apply(base(), d => { d.wines.push({ id: "nieuw", domain: "Test", stock: 1 }); }, {}), "Een nieuwe wijn toevoegen");
passesG(() => S.apply(base(), d => { d.wines[0].nieuwVeld = "waarde"; }, { touch: [w0] }), "Een nieuw veld invullen op een aangeraakte wijn");
passesG(() => S.apply(base(), d => { d.wines = d.wines.filter(w => w.id !== w1); }, { remove: [w1] }), "Een wijn verwijderen na bevestiging");
passesG(() => S.apply(base(), d => { d.users = d.users.filter(u => u.email !== u0); }, { remove: [u0] }), "Een gebruiker verwijderen na bevestiging");
passesG(() => S.apply(base(), d => { d.meta = { appVersion: "9.9.9" }; }, {}), "Technische metadata bijwerken");

// De opslag vergelijkt met de laatst opgeslagen versie, ook als de app het geheugen buiten mutate() om wijzigde
{
  const st = new S.MemoryStore(null, "test");
  const run = async () => {
    let d = await st.load(base);
    d.wines[1].webValue = 1; // foute code wijzigt het geheugen rechtstreeks
    const after = S.apply(d, x => { x.notes.push({ id: "n-test", wineId: w0, date: "2026-01-01", comment: "x" }); }, {});
    try { await st.save(after, null, {}); ok(false, "Opslag na een stille wijziging in het geheugen (werd NIET tegengehouden)"); }
    catch (e) { ok(e.name === "GuardError", "Opslag na een stille wijziging in het geheugen (verkeerde fout: " + e.message + ")"); }
    const good = S.apply(st.snapshot(), x => { x.notes.push({ id: "n-test2", wineId: w0, date: "2026-01-01", comment: "y" }); }, {});
    try { await st.save(good, null, {}); ok(true, ""); } catch (e) { ok(false, "Gewone opslag na herstel — " + e.message); }
  };
  await run();
}

/* 2. Enkel bewaking.js schrijft naar Microsoft Graph -------------------------------------- */
const appjs = app("app.js");
ok(!/baseline|setBase/.test(appjs), "app.js raakt de baseline van de bewaking niet aan");
appjs.split("\n").forEach((line, i) => {
  if (/method\s*:\s*["'`](PUT|POST|PATCH|DELETE)/i.test(line) && !line.includes("https://api.anthropic.com/"))
    ok(false, `app.js regel ${i + 1}: schrijfactie buiten bewaking.js`);
});
ok(!/graph\.microsoft\.com[^"'`]*["'`]\s*,\s*\{[^}]*method/i.test(appjs), "app.js roept Graph niet rechtstreeks aan met een schrijfmethode");
ok(!/WK_SAFE\s*=/.test(appjs) && !/SAFE\.(check|apply)\s*=/.test(appjs), "app.js vervangt de bewaking niet");
ok((appjs.match(/store\.(save|create)\(/g) || []).length === 2 && appjs.includes("S.store.save(after,fn,opts)"), "app.js slaat enkel op via mutate() en de eenmalige aanmaak");

/* 3. Geen gegevens naar onbekende adressen ------------------------------------------------ */
const ALLOWED = ["graph.microsoft.com", "login.microsoftonline.com", "api.anthropic.com"];
for (const f of ["app.js", "bewaking.js", "velden.js", "config.js"]) {
  const src = app(f);
  for (const m of src.matchAll(/fetch\(\s*["'`](https?:\/\/[^/"'`]+)/g)) ok(ALLOWED.some(h => m[1].endsWith(h)), `${f}: fetch naar niet-toegelaten adres ${m[1]}`);
  ok(!/XMLHttpRequest|sendBeacon|WebSocket|new\s+EventSource/.test(src), `${f}: geen andere netwerkkanalen`);
}
const swa = JSON.parse(app("staticwebapp.config.json"));
const csp = swa.globalHeaders?.["Content-Security-Policy"] || "";
ok(/script-src 'self';/.test(csp), "CSP: scripts enkel van eigen adres");
const connect = (csp.match(/connect-src ([^;]+)/) || [, ""])[1].trim();
ok(connect === "'self' https://graph.microsoft.com https://login.microsoftonline.com https://login.live.com https://*.sharepoint.com https://*.1drv.com https://*.livefilestore.com https://*.microsoftpersonalcontent.com https://api.anthropic.com", "CSP: connect-src is exact de afgesproken lijst (nu: " + connect + ")");
ok(!/<script>(?!\s*<\/script>)[\s\S]*?<\/script>/.test(app("index.html")) && !/\son[a-z]+\s*=\s*"/i.test(app("index.html")), "index.html bevat geen inline scripts of on…-attributen");
ok(!/\son(click|load|error|change)\s*=\s*\\?["']/.test(appjs), "app.js zet geen inline on…-attributen (werkt niet onder de CSP)");

/* 4. Extra velden zijn geldig ------------------------------------------------------------- */
const vctx = { window: {} }; vm.createContext(vctx); vm.runInContext(app("velden.js"), vctx);
const XF = vctx.window.WK_EXTRA_FIELDS || [];
const CORE = ["id","created","country","region","appellation","color","domain","name","vintage","grapes","character","gastronomy","storage","drinkFrom","drinkUntil","stock","purchaseValue","webValue","location","remark","photo","lat","lng"];
const seen = new Set();
for (const f of XF) {
  ok(/^[a-zA-Z][a-zA-Z0-9_]*$/.test(f.key || ""), `velden.js: ongeldige key "${f.key}"`);
  ok(!CORE.includes(f.key), `velden.js: "${f.key}" is al een standaardveld`);
  ok(!seen.has(f.key), `velden.js: "${f.key}" staat er twee keer in`); seen.add(f.key);
  ok(["text", "textarea", "number", "select", "date"].includes(f.type || "text"), `velden.js: onbekend type "${f.type}" bij ${f.key}`);
  ok(["wijn", "herkomst", "beschrijving", "kelder", undefined].includes(f.section), `velden.js: onbekende sectie "${f.section}" bij ${f.key}`);
  ok(f.type !== "select" || (Array.isArray(f.options) && f.options.length), `velden.js: keuzelijst zonder opties bij ${f.key}`);
}
// Eens gebruikte keys mogen niet verdwijnen of van betekenis veranderen: vergelijk met de lijst in tests/velden-historiek.json
const hist = JSON.parse(readFileSync(join(root, "tests", "velden-historiek.json"), "utf8"));
for (const f of XF) if (!hist.includes(f.key)) ok(false, `velden.js: nieuw veld "${f.key}" — voeg het ook toe aan tests/velden-historiek.json (en hergebruik nooit een oude key)`);

/* 5. Geen echte gegevens in de repository ------------------------------------------------- */
const walk = d => readdirSync(d, { withFileTypes: true }).flatMap(e => e.name.startsWith(".git") && e.name !== ".github" ? [] : e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]);
for (const f of walk(root)) {
  if (/cellar\.json$/i.test(f) && !f.includes(join("voorbeeld", "cellar.json"))) ok(false, `${f}: kelderbestanden horen niet in de repository`);
  if (/\/backups?\//i.test(f)) ok(false, `${f}: back-ups horen niet in de repository`);
}
ok(base().meta?.voorbeeld === true, "voorbeeld/cellar.json is als voorbeeld gemarkeerd (meta.voorbeeld = true)");

console.log(`\n${passes} controles geslaagd, ${fails} mislukt`);
process.exit(fails ? 1 : 0);
