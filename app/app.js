
"use strict";
/* ================= Configuratie & modus ================= */
const APP_VERSION="1.1.0"; // verhogen bij elke publicatie: de eerste opslag met een nieuwe versie maakt eerst een back-up
const MAPS=window.WK_MAPS||{};
const SAFE=window.WK_SAFE;
const CFG = Object.assign({}, window.WK_CONFIG || {});
const IN_ARTIFACT = !!window.claude;
const HOSTED = !IN_ARTIFACT && !!CFG.clientId;
const YEAR = new Date().getFullYear();
const ls = { get(k){try{return localStorage.getItem(k)}catch(e){return null}}, set(k,v){try{localStorage.setItem(k,v)}catch(e){}}, del(k){try{localStorage.removeItem(k)}catch(e){}} };

/* ================= Referentiedata ================= */
const TYPES=[["rood","Rood"],["wit","Wit"],["rose","Rosé"],["champagne","Champagne & mousserend"],["dessert","Zoet & dessert"],["versterkt","Versterkt"]];
const TYPE_LABEL=Object.fromEntries(TYPES);
const TYPE_SHORT={rood:"Rood",wit:"Wit",rose:"Rosé",champagne:"Mousserend",dessert:"Zoet",versterkt:"Versterkt"};
const COUNTRIES=[
 ["FR","Frankrijk","france,frankrijk,frankreich"],["IT","Italië","italy,italie,italia,italien"],["ES","Spanje","spain,espagne,espana,spanien"],
 ["PT","Portugal","portugal"],["DE","Duitsland","germany,allemagne,deutschland"],["AT","Oostenrijk","austria,autriche,osterreich"],
 ["CH","Zwitserland","switzerland,suisse,schweiz"],["BE","België","belgium,belgique,belgie"],["LU","Luxemburg","luxembourg,luxemburg"],
 ["NL","Nederland","netherlands,pays bas,holland"],["GB","Verenigd Koninkrijk","united kingdom,engeland,england,uk,royaume uni"],
 ["GR","Griekenland","greece,grece"],["HU","Hongarije","hungary,hongrie"],["SI","Slovenië","slovenia,slovenie"],["HR","Kroatië","croatia,croatie"],
 ["RO","Roemenië","romania,roumanie"],["BG","Bulgarije","bulgaria,bulgarie"],["MD","Moldavië","moldova,moldavie"],["GE","Georgië","georgia,georgie"],
 ["LB","Libanon","lebanon,liban"],["IL","Israël","israel"],["US","Verenigde Staten","usa,united states,etats unis,vs,amerika"],["CA","Canada","canada"],
 ["AR","Argentinië","argentina,argentine"],["CL","Chili","chile"],["UY","Uruguay","uruguay"],["AU","Australië","australia,australie"],
 ["NZ","Nieuw-Zeeland","new zealand,nouvelle zelande,nieuw zeeland"],["ZA","Zuid-Afrika","south africa,afrique du sud,zuid afrika"],["CZ","Tsjechië","czechia,czech republic,tchequie"]
];
const REG={
 FR:[["Bordeaux",44.84,-0.58],["Médoc",45.25,-0.85],["Haut-Médoc",45.1,-0.75],["Pauillac",45.2,-0.75],["Margaux",45.04,-0.67],["Saint-Julien",45.16,-0.74],["Saint-Estèphe",45.26,-0.77],["Pessac-Léognan",44.75,-0.63],["Graves",44.6,-0.4],["Sauternes",44.53,-0.34],["Barsac",44.6,-0.32],["Saint-Émilion",44.89,-0.16],["Pomerol",44.93,-0.2],["Entre-Deux-Mers",44.75,-0.3],
  ["Bourgogne",47.05,4.85],["Chablis",47.81,3.8],["Côte de Nuits",47.2,4.95],["Gevrey-Chambertin",47.23,4.97],["Côte de Beaune",46.98,4.75],["Meursault",46.98,4.77],["Puligny-Montrachet",46.95,4.75],["Pommard",47.01,4.8],["Mâconnais",46.35,4.75],["Pouilly-Fuissé",46.28,4.75],["Beaujolais",46.1,4.6],
  ["Champagne",49.05,4.0],["Reims",49.25,4.03],["Épernay",49.04,3.96],["Côte des Blancs",48.95,4.0],["Alsace",48.2,7.35],["Jura",46.75,5.65],["Savoie",45.55,6.0],
  ["Rhône",44.8,4.8],["Côte-Rôtie",45.48,4.8],["Hermitage",45.07,4.84],["Crozes-Hermitage",45.1,4.85],["Châteauneuf-du-Pape",44.06,4.83],["Gigondas",44.16,5.0],["Côtes du Rhône",44.3,4.75],
  ["Loire",47.3,0.5],["Sancerre",47.33,2.84],["Pouilly-Fumé",47.29,2.95],["Vouvray",47.41,0.8],["Chinon",47.17,0.24],["Saumur",47.26,-0.08],["Anjou",47.35,-0.6],["Muscadet",47.15,-1.4],["Savennières",47.38,-0.66],
  ["Languedoc",43.5,3.3],["Roussillon",42.6,2.8],["Provence",43.45,6.2],["Bandol",43.14,5.75],["Sud-Ouest",44.0,0.5],["Cahors",44.45,1.44],["Madiran",43.55,-0.05],["Jurançon",43.28,-0.39],["Corse",42.1,9.05],["Cognac",45.69,-0.33]],
 IT:[["Piemonte",44.7,8.0],["Barolo",44.61,7.94],["Barbaresco",44.72,8.08],["Langhe",44.6,8.0],["Asti",44.9,8.2],["Toscana",43.35,11.2],["Chianti",43.47,11.25],["Chianti Classico",43.47,11.3],["Montalcino",43.06,11.49],["Brunello di Montalcino",43.06,11.49],["Montepulciano",43.09,11.78],["Bolgheri",43.23,10.61],
  ["Veneto",45.5,11.5],["Valpolicella",45.53,10.9],["Amarone",45.53,10.9],["Soave",45.42,11.25],["Prosecco",45.9,12.2],["Friuli",46.05,13.3],["Trentino-Alto Adige",46.5,11.35],["Alto Adige",46.5,11.35],["Lombardia",45.6,9.9],["Franciacorta",45.6,10.0],
  ["Emilia-Romagna",44.5,11.0],["Marche",43.4,13.2],["Umbria",42.95,12.6],["Abruzzo",42.3,13.9],["Campania",41.0,14.8],["Puglia",40.8,17.0],["Sicilia",37.5,14.1],["Etna",37.75,15.0],["Sardegna",40.1,9.0]],
 ES:[["Rioja",42.45,-2.45],["Ribera del Duero",41.65,-3.7],["Toro",41.52,-5.4],["Rueda",41.4,-4.95],["Priorat",41.2,0.8],["Penedès",41.35,1.7],["Cava",41.4,1.75],["Rías Baixas",42.4,-8.7],["Bierzo",42.6,-6.7],["Navarra",42.6,-1.7],["Jerez",36.68,-6.13],["Sherry",36.68,-6.13],["La Mancha",39.2,-3.0],["Jumilla",38.47,-1.33],["Montsant",41.25,0.85]],
 PT:[["Douro",41.16,-7.6],["Porto",41.15,-8.61],["Vinho Verde",41.7,-8.4],["Dão",40.6,-7.9],["Bairrada",40.45,-8.45],["Lisboa",39.2,-9.1],["Alentejo",38.6,-7.9],["Setúbal",38.5,-8.9]],
 DE:[["Mosel",49.9,7.0],["Rheingau",50.0,8.0],["Rheinhessen",49.8,8.15],["Pfalz",49.35,8.1],["Nahe",49.8,7.7],["Baden",48.2,7.8],["Franken",49.8,10.0],["Ahr",50.53,7.0],["Württemberg",48.9,9.2]],
 AT:[["Wachau",48.37,15.4],["Kamptal",48.5,15.7],["Kremstal",48.43,15.6],["Weinviertel",48.6,16.3],["Burgenland",47.6,16.6],["Neusiedlersee",47.85,16.8],["Steiermark",46.8,15.5],["Wien",48.25,16.35]],
 CH:[["Valais",46.2,7.4],["Vaud",46.5,6.7],["Lavaux",46.49,6.73],["Genève",46.2,6.1],["Ticino",46.2,8.95],["Neuchâtel",47.0,6.9]],
 BE:[["Hageland",50.93,4.9],["Haspengouw",50.8,5.3],["Heuvelland",50.77,2.8],["Maasvallei Limburg",51.0,5.75],["Côtes de Sambre et Meuse",50.4,4.8],["Crémant de Wallonie",50.45,4.2],["Wallonië",50.45,4.4],["Vlaanderen",51.0,4.0]],
 LU:[["Moselle Luxembourgeoise",49.6,6.35]],
 NL:[["Limburg",50.85,5.8],["Gelderland",52.0,5.9],["Zeeland",51.5,3.8]],
 GB:[["Kent",51.25,0.8],["Sussex",50.95,-0.3],["Hampshire",51.05,-1.3],["Cornwall",50.4,-4.9]],
 GR:[["Santorini",36.4,25.43],["Nemea",37.82,22.66],["Naoussa",40.63,22.07],["Kreta",35.25,24.9],["Peloponnesos",37.5,22.3],["Macedonië",40.7,22.5]],
 HU:[["Tokaj",48.12,21.4],["Villány",45.87,18.45],["Eger",47.9,20.37],["Balaton",46.85,17.7],["Szekszárd",46.35,18.7]],
 SI:[["Goriška Brda",46.0,13.53],["Vipava",45.85,13.95],["Štajerska",46.5,15.8]],
 HR:[["Istrië",45.2,13.9],["Dalmatië",43.3,16.7],["Slavonië",45.4,18.0]],
 RO:[["Dealu Mare",45.0,26.3],["Cotnari",47.35,26.95],["Transsylvanië",46.5,24.0]],
 BG:[["Thracische vallei",42.2,25.3],["Donauvlakte",43.5,25.0]],
 MD:[["Codru",47.0,28.6],["Purcari",46.5,29.9]],
 GE:[["Kakheti",41.9,45.8],["Kartli",41.95,44.2],["Imereti",42.2,42.7]],
 LB:[["Bekaa",33.85,35.9],["Bekaa Valley",33.85,35.9],["Batroun",34.25,35.66]],
 IL:[["Golan",33.0,35.75],["Galilea",32.9,35.4],["Judea",31.75,35.0]],
 US:[["Napa Valley",38.5,-122.35],["Sonoma",38.45,-122.8],["Dry Creek Valley",38.65,-122.95],["Russian River Valley",38.5,-122.9],["Paso Robles",35.63,-120.7],["Santa Barbara",34.6,-120.2],["Willamette Valley",45.1,-123.1],["Columbia Valley",46.3,-119.5],["Walla Walla",46.07,-118.34],["Finger Lakes",42.6,-76.9],["Californië",37.0,-120.5],["Oregon",44.5,-122.5],["Washington",46.8,-120.5]],
 CA:[["Niagara",43.1,-79.2],["Okanagan",49.9,-119.5],["Prince Edward County",44.0,-77.2]],
 AR:[["Mendoza",-33.0,-68.8],["Uco Valley",-33.6,-69.2],["Valle de Uco",-33.6,-69.2],["Luján de Cuyo",-33.05,-68.9],["Salta",-24.8,-65.4],["Cafayate",-26.07,-65.97],["Patagonia",-39.0,-67.9],["San Juan",-31.5,-68.5]],
 CL:[["Maipo",-33.7,-70.7],["Colchagua",-34.6,-71.2],["Casablanca",-33.3,-71.4],["Aconcagua",-32.8,-70.6],["Maule",-35.4,-71.6],["Itata",-36.5,-72.4],["Limarí",-30.6,-71.2]],
 UY:[["Canelones",-34.5,-56.2],["Maldonado",-34.9,-55.0]],
 AU:[["Barossa",-34.55,138.95],["Barossa Valley",-34.55,138.95],["McLaren Vale",-35.2,138.55],["Clare Valley",-33.85,138.6],["Coonawarra",-37.3,140.8],["Eden Valley",-34.6,139.1],["Adelaide Hills",-35.0,138.8],["Margaret River",-33.95,115.07],["Yarra Valley",-37.7,145.5],["Hunter Valley",-32.8,151.3],["Rutherglen",-36.05,146.47],["Tasmanië",-42.0,146.8]],
 NZ:[["Marlborough",-41.5,173.9],["Central Otago",-45.0,169.2],["Hawke's Bay",-39.6,176.8],["Martinborough",-41.2,175.45],["Wairarapa",-41.2,175.5],["Nelson",-41.3,173.2],["Gisborne",-38.66,178.0],["Waipara",-43.05,172.75]],
 ZA:[["Stellenbosch",-33.93,18.86],["Franschhoek",-33.91,19.12],["Paarl",-33.73,18.97],["Swartland",-33.35,18.7],["Constantia",-34.03,18.43],["Elgin",-34.15,19.05],["Hemel-en-Aarde",-34.38,19.25],["Walker Bay",-34.4,19.3],["Robertson",-33.8,19.88]],
 CZ:[["Moravië",48.85,16.6],["Bohemen",50.4,14.4]]
};
const norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const COUNTRY_BY_KEY=Object.fromEntries(COUNTRIES.map(c=>[c[0],c]));
function countryKey(name){const n=norm(name);if(!n)return null;for(const [k,nl,al] of COUNTRIES){if(norm(nl)===n||k.toLowerCase()===n||al.split(",").some(a=>norm(a)===n))return k;}return null;}
function countryName(k){return COUNTRY_BY_KEY[k]?.[1]||k;}
function coordsFor(w){
  if(isFinite(parseFloat(w.lat))&&isFinite(parseFloat(w.lng)))return [parseFloat(w.lat),parseFloat(w.lng)];
  const k=countryKey(w.country);if(!k||!REG[k])return null;
  const tries=[w.appellation,w.region].map(norm).filter(Boolean);
  for(const t of tries){const hit=REG[k].find(r=>norm(r[0])===t);if(hit)return [hit[1],hit[2]];}
  for(const t of tries){const hit=REG[k].find(r=>{const n=norm(r[0]);return t.includes(n)||n.includes(t)});if(hit)return [hit[1],hit[2]];}
  return null;
}
function project(k,lat,lng){const m=MAPS[k];return [(lng-m.lon0)*m.c*m.k,(m.lat0-lat)*m.k];}

/* ================= Hulpfuncties ================= */
const $=(s,el=document)=>el.querySelector(s);
const $$=(s,el=document)=>[...el.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=()=>(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2));
const today=()=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
const eur=(n,dec=0)=>n==null||n===""||isNaN(n)?"–":new Intl.NumberFormat("nl-BE",{style:"currency",currency:"EUR",maximumFractionDigits:dec,minimumFractionDigits:dec}).format(n);
const fmtDate=d=>d?new Date(d+"T12:00:00").toLocaleDateString("nl-BE",{day:"numeric",month:"short",year:"numeric"}):"";
const num=v=>{if(v===""||v==null)return null;const n=parseFloat(String(v).replace(",","."));return isNaN(n)?null:n;};
const stars=r=>r?"★".repeat(Math.round(r))+"☆".repeat(5-Math.round(r)):"";
const wineTitle=w=>[w.domain,w.name].filter(Boolean).join(" · ")||"Naamloze wijn";
const vint=w=>w.vintage?String(w.vintage):"NV";
function icon(n){const P={
 cellar:'<path d="M4 20V9l8-5 8 5v11"/><path d="M8 20v-6h8v6"/><circle cx="10" cy="11" r=".6"/><circle cx="14" cy="11" r=".6"/>',
 chart:'<path d="M4 20h16"/><path d="M7 16v-5M12 16V6M17 16v-8"/>',
 map:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/>',
 log:'<path d="M6 4h12v16H6z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
 cog:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
 search:'<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
 plus:'<path d="M12 5v14M5 12h14"/>', glass:'<path d="M7 3h10l-1 6a4 4 0 0 1-8 0L7 3Z"/><path d="M12 13v7M8 21h8"/>',
 cart:'<path d="M3 4h2l2 11h11l2-8H6"/><circle cx="9" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/>',
 pen:'<path d="M4 20h4L19 9l-4-4L4 16v4Z"/>', star:'<path d="m12 4 2.4 5 5.5.8-4 3.9.9 5.4L12 16.6 7.2 19l.9-5.4-4-3.9 5.5-.8L12 4Z"/>',
 globe:'<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16"/>',
 dl:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', ul:'<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>'};
 return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]||""}</svg>`;}
function bottle(type){const champ=type==="champagne";return `<svg class="bottle t-${esc(type||"rood")}" viewBox="0 0 30 80" aria-hidden="true"><path class="b" d="${champ?"M12 2h6v4c0 6 8 12 8 22v48c0 1-1 2-2 2H6c-1 0-2-1-2-2V28C4 18 12 12 12 6Z":"M12.5 2h5v18c0 4 8.5 6 8.5 14v42c0 1-1 2-2 2H6c-1 0-2-1-2-2V34c0-8 8.5-10 8.5-14Z"}"/><path class="l" d="M7 44h16v18H7z"/></svg>`;}
function drinkWindow(w){let f=num(w.drinkFrom),u=num(w.drinkUntil);if(f==null&&u==null&&w.storage){const ys=(String(w.storage).match(/(19|20)\d{2}/g)||[]).map(Number);if(ys.length){f=ys[0];u=ys[1]||null;}}return {f,u};}
function drinkStatus(w){if(!(w.stock>0))return {k:"op",t:"Op"};const {f,u}=drinkWindow(w);if(f==null&&u==null)return null;
 if(f&&YEAR<f)return {k:"jong",t:"Nog bewaren tot "+f};if(u&&YEAR>u)return {k:"over",t:"Over hoogtepunt"};if(u&&YEAR>=u)return {k:"nu",t:"Nu drinken"};return {k:"dronk",t:u?"Op dronk tot "+u:"Op dronk"};}

/* ================= Extra velden (velden.js) ================= */
const CORE_KEYS=new Set(["id","created","country","region","appellation","color","domain","name","vintage","grapes","character","gastronomy","storage","drinkFrom","drinkUntil","stock","purchaseValue","webValue","location","remark","photo","lat","lng"]);
const XF=(window.WK_EXTRA_FIELDS||[]).filter((f,i,a)=>{const ok=f&&/^[a-zA-Z][a-zA-Z0-9_]*$/.test(f.key||"")&&!CORE_KEYS.has(f.key)&&a.findIndex(g=>g&&g.key===f.key)===i;if(!ok)console.warn("Extra veld genegeerd:",f);return ok;});
function xFields(section,w){return XF.filter(f=>(f.section||"kelder")===section).map(f=>{const v=w[f.key]??"",id="x_"+f.key;
  const inp=f.type==="textarea"?`<textarea id="${id}">${esc(v)}</textarea>`:f.type==="select"?`<select id="${id}"><option value=""></option>${(f.options||[]).map(o=>`<option ${String(o)===String(v)?"selected":""}>${esc(o)}</option>`).join("")}${v&&!(f.options||[]).map(String).includes(String(v))?`<option selected>${esc(v)}</option>`:""}</select>`:`<input id="${id}" ${f.type==="number"?'inputmode="decimal"':f.type==="date"?'type="date"':""} value="${esc(v)}">`;
  return `<div class="f ${f.type==="textarea"?"c6":"c2"}"><label for="${id}">${esc(f.label)}</label>${inp}</div>`;}).join("");}
const xRead=(f,el)=>{const v=($("#x_"+f.key,el)?.value??"").trim();return f.type==="number"?num(v):v;};

/* ================= Rechten ================= */
const ROLES={admin:"Beheerder",editor:"Bewerker",drinker:"Proever",viewer:"Lezer"};
const ROLE_INFO={admin:"Alles, inclusief gebruikers en koppeling",editor:"Wijnen toevoegen en wijzigen, aankopen, verbruik en notities",drinker:"Raadplegen, verbruik registreren en notities toevoegen",viewer:"Enkel raadplegen"};
const CAN={admin:["edit","buy","drink","note","users","lookup","import"],editor:["edit","buy","drink","note","lookup","import"],drinker:["drink","note"],viewer:[]};
const can=a=>(CAN[S.me?.role]||[]).includes(a);

/* ================= Toestand ================= */
const S={data:null,me:null,store:null,view:(location.hash||"#kelder").slice(1),f:{q:"",type:"",country:"",stock:"in",sort:"name"},mapCountry:null,logKind:"",logYear:"",mode:"demo",readonly:false};
const VIEWS=[["kelder","Kelder","cellar"],["dashboard","Dashboard","chart"],["kaart","Kaart","map"],["logboek","Logboek","log"],["beheer","Beheer","cog"]];

/* ================= Opslag ================= */
function emptyData(email){return {app:"wijnkelder",version:1,name:"Mijn wijnkelder",wines:[],moves:[],notes:[],users:email?[{email,role:"admin",name:"",added:today()}]:[],meta:{created:today()}};}

/* ================= Microsoft-aanmelding & Graph ================= */
let PCA=null,ACCOUNT=null;
const SCOPES=["User.Read","Files.ReadWrite.All"];
function loadScript(src){return new Promise((ok,no)=>{const s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=()=>no(new Error("Kon "+src+" niet laden"));document.head.appendChild(s);});}
async function token(scopes=SCOPES){
  try{return (await PCA.acquireTokenSilent({scopes,account:ACCOUNT})).accessToken;}
  catch(e){await PCA.acquireTokenRedirect({scopes,account:ACCOUNT});throw new Error("Doorsturen naar aanmelden…");}
}
// Alle schrijfacties naar Microsoft Graph staan in bewaking.js; deze app leest enkel (zie tests/controle.mjs).
async function graphRaw(path,opt={}){const {scopes,...o}=opt;const t=await token(scopes||SCOPES);const h=Object.assign({Authorization:"Bearer "+t},o.headers||{});
  return fetch("https://graph.microsoft.com/v1.0"+path,Object.assign({},o,{headers:h}));}
function storageRef(){if(CFG.driveId&&CFG.folderId)return {driveId:CFG.driveId,folderId:CFG.folderId};try{return JSON.parse(ls.get("wk.storage")||"null")}catch(e){return null}}

/* ================= Opstart ================= */
async function boot(){
  window.addEventListener("hashchange",()=>{const v=location.hash.slice(1);if(VIEWS.some(x=>x[0]===v)){S.view=v;render();}});
  if(!IN_ARTIFACT&&"serviceWorker" in navigator&&location.protocol==="https:")navigator.serviceWorker.register("sw.js").catch(()=>{});
  if(HOSTED)return bootHosted().catch(e=>{screen(`<h1>Er liep iets mis</h1><p>${esc(e.message)}</p><p><button class="btn" id="retry">Opnieuw proberen</button></p>`);$("#retry").onclick=()=>location.reload();});
  // demo: in de artifact-viewer enkel in het geheugen, lokaal geopend in de browser bewaard
  S.mode="demo";S.store=new SAFE.MemoryStore(IN_ARTIFACT?null:"wk.demo",APP_VERSION);
  S.data=await S.store.load(seed);S.me={email:"demo@voorbeeld.be",name:"Demo-gebruiker",role:"admin"};render();
}
async function bootHosted(){
  screen(`<p class="muted"><span class="spin"></span> Wijnkelder laden…</p>`);
  if(!window.msal)await loadScript(CFG.msalUrl||"msal-browser.min.js");
  PCA=new msal.PublicClientApplication({auth:{clientId:CFG.clientId,authority:"https://login.microsoftonline.com/"+(CFG.tenantId||"organizations"),redirectUri:location.origin+location.pathname,navigateToLoginRequestUrl:false},cache:{cacheLocation:"localStorage"}});
  const res=await PCA.handleRedirectPromise();
  ACCOUNT=res?.account||PCA.getActiveAccount()||PCA.getAllAccounts()[0];
  if(!ACCOUNT)return loginScreen();
  PCA.setActiveAccount(ACCOUNT);
  const cl=ACCOUNT.idTokenClaims||{};
  S.me={email:String(cl.email||ACCOUNT.username||"").toLowerCase(),name:ACCOUNT.name||"",role:null};
  const ref=storageRef();if(!ref)return setupScreen();
  SAFE.init(graphRaw);S.mode="onedrive";S.store=new SAFE.OneDriveStore(ref,APP_VERSION);
  try{S.data=await S.store.load();}
  catch(e){const c=ls.get("wk.cache");if(c&&!navigator.onLine){S.data=JSON.parse(c);S.readonly=true;}else if(e.status===403||e.status===404){return deniedScreen("Je account heeft (nog) geen toegang tot de gedeelde kelder op OneDrive.");}else throw e;}
  if(!S.data){ // map bestaat, bestand nog niet: eerste beheerder
    S.data=await S.store.create(emptyData(S.me.email));}
  const u=findUser(S.me.email);
  if(!u)return deniedScreen("Je bent aangemeld als "+S.me.email+", maar dit adres staat niet in de gebruikerslijst van de kelder.");
  S.me.role=u.role;
  render();
}
function findUser(email){const e=String(email||"").toLowerCase();return (S.data.users||[]).find(u=>u.email.toLowerCase()===e||(u.alias||"").toLowerCase()===e);}
function screen(inner){$("#root").innerHTML=`<div class="center"><div class="box">${inner}</div></div>`;}
function loginScreen(){screen(`<div class="label">Privé wijnkelder</div><h1>Wijnkelder</h1><p class="muted">Meld je aan met je Microsoft-account. Kreeg je een uitnodiging op een Gmail-adres, gebruik dan dat adres: Microsoft stuurt je een eenmalige code.</p><p><button class="btn primary" id="login">Aanmelden met Microsoft</button></p>`);
  $("#login").onclick=()=>PCA.loginRedirect({scopes:SCOPES,prompt:"select_account"});}
function deniedScreen(msg){screen(`<div class="label">Geen toegang</div><h1>Nog even geduld</h1><p>${esc(msg)}</p><p class="muted">Vraag de beheerder van de kelder om je toe te voegen. Geef dit adres door: <code>${esc(S.me.email)}</code></p><p><button class="btn" id="lo">Afmelden</button></p>`);$("#lo").onclick=()=>PCA.logoutRedirect();}
function setupScreen(){
  screen(`<div class="label">Eerste gebruik</div><h1>Kelder koppelen</h1><p>De app weet nog niet waar de kelder op OneDrive staat. Als beheerder maak je hem aan in je eigen OneDrive: er komt een map <b>${esc(CFG.folderName||"Wijnkelder")}</b> met het bestand <code>cellar.json</code>, een map voor foto's en dagelijkse back-ups.</p>
  <p><button class="btn primary" id="mk">Kelder aanmaken in mijn OneDrive</button></p><p class="muted" id="mkout">Ben je geen beheerder? Dan is de koppeling nog niet ingesteld. Vraag de beheerder om config.js aan te vullen.</p>`);
  $("#mk").onclick=async()=>{const out=$("#mkout");out.innerHTML='<span class="spin"></span> Map aanmaken…';
    try{SAFE.init(graphRaw);const item=await SAFE.createFolder(CFG.folderName||"Wijnkelder");
      const ref={driveId:item.parentReference.driveId,folderId:item.id};ls.set("wk.storage",JSON.stringify(ref));
      out.innerHTML=`Klaar. Zet deze twee regels in <code>config.js</code> zodat iedereen dezelfde kelder gebruikt:<pre class="code">driveId: "${esc(ref.driveId)}",\nfolderId: "${esc(ref.folderId)}",</pre><button class="btn primary" id="open">Kelder openen</button>`;$("#open").onclick=()=>location.reload();
    }catch(e){out.textContent="Aanmaken mislukt: "+e.message;}};
}

/* ================= Opslaan (mutaties) ================= */
/* Elke wijziging loopt via bewaking.js. opts.touch = id's van records die de gebruiker aanpaste,
   opts.remove = id's die de gebruiker na bevestiging verwijderde. Al het andere moet ongewijzigd blijven. */
async function mutate(fn,msg,opts={}){
  if(S.readonly){toast("Offline: wijzigingen kunnen nu niet bewaard worden","err");return false;}
  let after;
  try{after=SAFE.apply(S.data,fn,opts);}
  catch(e){console.error(e);toast("Niet opgeslagen. De gegevensbewaking hield deze wijziging tegen: "+e.message,"err");return false;}
  S.data=after;render();
  try{const saved=await S.store.save(after,fn,opts);if(saved&&saved!==after){S.data=saved;render();}if(msg)toast(msg);return true;}
  catch(e){console.error(e);
    if(e.name==="GuardError"){const b=S.store.snapshot();if(b){S.data=b;render();}toast("Niet opgeslagen. De gegevensbewaking hield deze wijziging tegen: "+e.message,"err");}
    else toast("Niet opgeslagen: "+e.message,"err");return false;}
}

/* ================= Weergave ================= */
function render(){
  if(!S.data)return;
  if(!VIEWS.some(v=>v[0]===S.view))S.view="kelder";
  const demo=S.mode==="demo";
  const sub=demo?"Demo met voorbeeldwijnen":S.data.name;
  $("#root").innerHTML=`<header class="top"><div class="top-in">
    <div class="brand"><h1>Wijnkelder</h1><span class="sub">${esc(sub)}</span></div>
    <nav class="tabs" aria-label="Onderdelen">${VIEWS.map(([k,l,i])=>`<button class="tab" data-view="${k}" aria-current="${S.view===k}">${icon(i)}<span>${l}</span></button>`).join("")}</nav>
    <div class="who"><b>${esc(S.me.name||S.me.email)}</b>${ROLES[S.me.role]||""}</div></div></header>
  ${demo?`<div class="banner"><div><b>Demo.</b> De wijnen, aankopen en notities hieronder zijn voorbeelden. ${IN_ARTIFACT?"Wijzigingen blijven enkel bewaard zolang deze pagina open staat.":"Wijzigingen worden enkel in deze browser bewaard."} In de geïnstalleerde versie staat alles op OneDrive en meld je aan met Microsoft.</div></div>`:""}
  ${S.readonly?`<div class="banner"><div><b>Offline.</b> Je bekijkt de laatst geladen versie. Wijzigen kan weer zodra je verbonden bent.</div></div>`:""}
  <main id="view"></main>`;
  $$(".tab").forEach(b=>b.onclick=()=>{S.view=b.dataset.view;history.replaceState(null,"","#"+S.view);render();window.scrollTo(0,0);});
  ({kelder:viewKelder,dashboard:viewDashboard,kaart:viewKaart,logboek:viewLog,beheer:viewBeheer})[S.view]();
  hydratePhotos();
}
async function hydratePhotos(){for(const img of $$("img[data-ref]")){const ref=img.dataset.ref;img.removeAttribute("data-ref");try{const u=await S.store.photoUrl(ref);if(u)img.src=u;}catch(e){}}}
function photoTag(w,alt=""){if(!w.photo)return bottle(w.color);return w.photo.startsWith("data:")?`<img src="${w.photo}" alt="${esc(alt)}">`:`<img data-ref="${esc(w.photo)}" alt="${esc(alt)}">`;}

/* ---------- Kelder ---------- */
function filtered(){
  const f=S.f,q=norm(f.q);const words=q?q.split(" "):[];
  let ws=S.data.wines.filter(w=>{
    if(f.type&&w.color!==f.type)return false;
    if(f.country&&countryKey(w.country)!==f.country&&w.country!==f.country)return false;
    if(f.stock==="in"&&!(w.stock>0))return false;if(f.stock==="op"&&w.stock>0)return false;
    if(f.stock==="drink"){const s=drinkStatus(w);if(!s||!["nu","over","dronk"].includes(s.k))return false;}
    if(words.length){const hay=norm([w.domain,w.name,w.vintage,w.country,countryName(countryKey(w.country)),w.region,w.appellation,w.grapes,w.character,w.gastronomy,w.location,w.remark,TYPE_LABEL[w.color],...XF.map(f=>w[f.key])].join(" "));if(!words.every(x=>hay.includes(x)))return false;}
    return true;});
  const by={name:(a,b)=>wineTitle(a).localeCompare(wineTitle(b)),vintage:(a,b)=>(a.vintage||0)-(b.vintage||0),stock:(a,b)=>(b.stock||0)-(a.stock||0),value:(a,b)=>(num(b.webValue)||0)-(num(a.webValue)||0),window:(a,b)=>(drinkWindow(a).u||9999)-(drinkWindow(b).u||9999),rating:(a,b)=>(avgRating(b.id)||0)-(avgRating(a.id)||0)};
  return ws.sort(by[f.sort]||by.name);
}
function avgRating(id){const r=S.data.notes.filter(n=>n.wineId===id&&n.rating);return r.length?r.reduce((s,n)=>s+n.rating,0)/r.length:null;}
function viewKelder(){
  const f=S.f;const countries=[...new Set(S.data.wines.map(w=>countryKey(w.country)||w.country).filter(Boolean))].sort((a,b)=>countryName(a).localeCompare(countryName(b)));
  $("#view").innerHTML=`<div class="toolbar"><label class="search">${icon("search")}<input id="q" type="search" placeholder="Zoek op domein, naam, druif, regio, gerecht…" value="${esc(f.q)}" aria-label="Zoeken"></label>
    ${can("edit")?`<button class="btn primary" id="add">${icon("plus")}<span>Wijn toevoegen</span></button>`:""}</div>
  <div class="filters">${TYPES.map(([k,l])=>`<button class="chip t-${k}" data-type="${k}" aria-pressed="${f.type===k}"><span class="dot"></span>${TYPE_SHORT[k]}</button>`).join("")}
    <select id="fc" aria-label="Land"><option value="">Alle landen</option>${countries.map(c=>`<option value="${esc(c)}" ${f.country===c?"selected":""}>${esc(countryName(c))}</option>`).join("")}</select>
    <select id="fs" aria-label="Voorraad"><option value="in" ${f.stock==="in"?"selected":""}>Op voorraad</option><option value="drink" ${f.stock==="drink"?"selected":""}>Op dronk</option><option value="op" ${f.stock==="op"?"selected":""}>Op (historiek)</option><option value="all" ${f.stock==="all"?"selected":""}>Alles</option></select>
    <select id="so" aria-label="Sorteren">${[["name","Naam"],["vintage","Jaargang"],["stock","Aantal"],["value","Waarde"],["window","Drinken vóór"],["rating","Beoordeling"]].map(([k,l])=>`<option value="${k}" ${f.sort===k?"selected":""}>Sorteer: ${l}</option>`).join("")}</select>
    <span class="count" id="cnt"></span></div>
  <div class="list" id="list"></div>`;
  const q=$("#q");q.oninput=()=>{f.q=q.value;drawList();};
  $$(".chip[data-type]").forEach(b=>b.onclick=()=>{f.type=f.type===b.dataset.type?"":b.dataset.type;viewKelder();hydratePhotos();});
  $("#fc").onchange=e=>{f.country=e.target.value;drawList();};$("#fs").onchange=e=>{f.stock=e.target.value;drawList();};$("#so").onchange=e=>{f.sort=e.target.value;drawList();};
  if($("#add"))$("#add").onclick=()=>wineForm();
  drawList();
}
function drawList(){
  const ws=filtered();const bottles=ws.reduce((s,w)=>s+(w.stock||0),0);
  $("#cnt").textContent=`${ws.length} ${ws.length===1?"wijn":"wijnen"} · ${bottles} flessen`;
  $("#list").innerHTML=ws.length?ws.map(w=>{const st=drinkStatus(w);const ar=avgRating(w.id);
    return `<div class="item" data-id="${w.id}" tabindex="0" role="button"><div class="thumb">${photoTag(w)}</div>
    <div style="min-width:0"><h3>${esc(w.domain||"")}${w.domain&&w.name?" · ":""}<em>${esc(w.name||"")}</em> <span class="num muted" style="font-size:14px">${vint(w)}</span></h3>
    <div class="meta">${[TYPE_SHORT[w.color],w.appellation||w.region,countryName(countryKey(w.country))||w.country,w.grapes].filter(Boolean).map(esc).join(" · ")}</div></div>
    <div class="right"><span class="stock">${w.stock||0}<small> fl.</small></span>${st?`<span class="pill ${st.k}">${esc(st.t)}</span>`:""}${ar?`<span class="stars" style="font-size:12px" aria-label="${ar.toFixed(1)} op 5">${stars(ar)}</span>`:""}</div></div>`;}).join("")
    :`<div class="empty">${S.data.wines.length?"Geen wijnen gevonden met deze zoekopdracht of filters.":"De kelder is nog leeg. Voeg je eerste wijn toe met de knop hierboven."}</div>`;
  $$(".item").forEach(el=>{el.onclick=()=>openWine(el.dataset.id);el.onkeydown=e=>{if(e.key==="Enter")openWine(el.dataset.id)}});
  hydratePhotos();
}

/* ---------- Fiche ---------- */
function openWine(id){
  const w=S.data.wines.find(x=>x.id===id);if(!w)return;
  const st=drinkStatus(w);const {f,u}=drinkWindow(w);const ar=avgRating(id);
  const moves=S.data.moves.filter(m=>m.wineId===id);const notes=S.data.notes.filter(n=>n.wineId===id);
  const drunk=moves.filter(m=>m.kind==="consume").reduce((s,m)=>s+m.qty,0);
  const hist=[...moves.map(m=>({d:m.date,h:moveLine(m)})),...notes.map(n=>({d:n.date,h:`<span class="kind note">Proefnotitie</span> ${n.rating?`<span class="stars">${stars(n.rating)}</span>`:""} ${esc(n.by||"")}<br>${esc(n.comment||"")}`}))].sort((a,b)=>b.d.localeCompare(a.d));
  const k=countryKey(w.country);const xy=coordsFor(w);
  const html=`<button class="close" data-close aria-label="Sluiten">×</button>
   <div class="label t-${w.color}" style="display:flex;gap:6px;align-items:center"><span style="width:9px;height:9px;border-radius:50%;background:var(--tc)"></span>${esc(TYPE_LABEL[w.color]||"")}</div>
   <h2>${esc(w.domain||"")}${w.domain?"<br>":""}${esc(w.name||"")} <span class="num" style="font-style:normal;font-size:22px">${vint(w)}</span></h2>
   <div class="hero"><div class="ph">${photoTag(w,wineTitle(w))}</div>
    <dl class="kv"><dt>Land</dt><dd>${esc(countryName(k)||w.country||"–")}</dd><dt>Regio</dt><dd>${esc(w.region||"–")}</dd><dt>Herkomst & appellatie</dt><dd>${esc(w.appellation||"–")}</dd><dt>Druif</dt><dd>${esc(w.grapes||"–")}</dd>
    <dt>Drinkvenster</dt><dd>${f||u?`<span class="num">${f||"…"}–${u||"…"}</span> `:"–"}${st&&st.k!=="op"?`<span class="pill ${st.k}">${esc(st.t)}</span>`:""}</dd>${w.location?`<dt>Plaats in kelder</dt><dd>${esc(w.location)}</dd>`:""}${XF.filter(f=>w[f.key]!=null&&w[f.key]!=="").map(f=>`<dt>${esc(f.label)}</dt><dd>${esc(w[f.key])}</dd>`).join("")}</dl></div>
   <div class="stats3"><div><span class="label">Op stock</span><b>${w.stock||0}</b></div><div><span class="label">Aanschaf/fl.</span><b>${eur(num(w.purchaseValue),0)}</b></div><div><span class="label">Internet/fl.</span><b>${eur(num(w.webValue),0)}</b></div></div>
   <div class="actions">${can("drink")?`<button class="btn primary" data-a="drink" ${w.stock>0?"":"disabled"}>${icon("glass")}Fles gedronken</button>`:""}${can("buy")?`<button class="btn" data-a="buy">${icon("cart")}Aankoop</button>`:""}${can("note")?`<button class="btn" data-a="note">${icon("star")}Proefnotitie</button>`:""}${can("edit")?`<button class="btn" data-a="edit">${icon("pen")}Wijzigen</button>`:""}</div>
   <div class="sec"><div class="label">Karakter</div><p>${esc(w.character||"–")}</p></div>
   <div class="sec"><div class="label">Gastronomie</div><p>${esc(w.gastronomy||"–")}</p></div>
   <div class="sec"><div class="label">Bewaren</div><p>${esc(w.storage||"–")}</p></div>
   ${w.remark?`<div class="sec"><div class="label">Notitie</div><p>${esc(w.remark)}</p></div>`:""}
   <div class="sec"><div class="label" style="margin-bottom:8px">Herkomst op de kaart</div>${k&&MAPS[k]?`<div class="minimap">${countrySvg(k,xy?[{xy,color:w.color,label:w.appellation||w.region||""}]:[],{small:true})}<div class="muted" style="font-size:13px">${xy?esc([w.appellation,w.region].filter(Boolean).join(", ")):"Deze regio staat nog niet in de lijst. Gebruik <b>Zoek op internet</b> bij Wijzigen om de ligging aan te vullen."}</div></div>`:`<p class="muted">Geen kaart beschikbaar voor dit land.</p>`}</div>
   <div class="sec"><div class="label" style="margin-bottom:6px">Historiek · ${drunk} gedronken${ar?` · gemiddeld <span class="stars">${stars(ar)}</span>`:""}</div>
   ${hist.length?`<ul class="hist">${hist.map(x=>`<li><span class="num muted" style="font-size:13px">${fmtDate(x.d)}</span><span>${x.h}</span></li>`).join("")}</ul>`:`<p class="muted">Nog geen aankopen, verbruik of notities.</p>`}</div>
   ${can("edit")?`<div class="sec"><button class="btn danger sm" data-a="del">Wijn verwijderen</button></div>`:""}`;
  const d=drawer(html);
  d.querySelector("[data-a=drink]")?.addEventListener("click",()=>drinkDialog(w));
  d.querySelector("[data-a=buy]")?.addEventListener("click",()=>buyDialog(w));
  d.querySelector("[data-a=note]")?.addEventListener("click",()=>noteDialog(w));
  d.querySelector("[data-a=edit]")?.addEventListener("click",()=>{closeLayer();wineForm(w);});
  d.querySelector("[data-a=del]")?.addEventListener("click",()=>confirmDialog(`${wineTitle(w)} ${vint(w)} verwijderen?`,"De wijn, zijn aankopen, verbruik en proefnotities verdwijnen uit de kelder. Dit kan niet ongedaan gemaakt worden (de dagelijkse back-up op OneDrive bevat de vorige versie).","Verwijderen",async()=>{closeLayer();const rm=[id,...S.data.moves.filter(m=>m.wineId===id).map(m=>m.id),...S.data.notes.filter(n=>n.wineId===id).map(n=>n.id)];await mutate(D=>{D.wines=D.wines.filter(x=>x.id!==id);D.moves=D.moves.filter(m=>m.wineId!==id);D.notes=D.notes.filter(n=>n.wineId!==id);},"Wijn verwijderd",{remove:rm});}));
  hydratePhotos();
}
function moveLine(m){const k={consume:"Gedronken",purchase:"Aankoop",adjust:"Correctie"}[m.kind];
  return `<span class="kind ${m.kind}">${k}</span> <span class="num">${m.kind==="consume"?"−":m.qty>0&&m.kind!=="consume"?"+":""}${m.qty}</span> fl.${m.price?` à ${eur(m.price,2)}`:""}${m.supplier?` · ${esc(m.supplier)}`:""}${m.by?` · ${esc(m.by)}`:""}${m.note?`<br><span class="muted">${esc(m.note)}</span>`:""}`;}

/* ---------- Lagen ---------- */
function closeLayer(){$("#layer").innerHTML="";document.body.style.overflow="";}
function drawer(html){closeLayer();$("#layer").innerHTML=`<div class="scrim"><aside class="drawer" role="dialog" aria-modal="true">${html}</aside></div>`;document.body.style.overflow="hidden";
  const sc=$("#layer .scrim");sc.onclick=e=>{if(e.target===sc||e.target.closest("[data-close]"))closeLayer();};return $("#layer .drawer");}
function modal(html,cls=""){const wrap=document.createElement("div");wrap.className="modalwrap";wrap.innerHTML=`<div class="modal ${cls}" role="dialog" aria-modal="true">${html}</div>`;$("#layer").appendChild(wrap);document.body.style.overflow="hidden";
  const close=()=>{wrap.remove();if(!$("#layer").children.length)document.body.style.overflow="";};
  wrap.addEventListener("click",e=>{if(e.target===wrap||e.target.closest("[data-close]"))close();});return {el:wrap.firstElementChild,close};}
document.addEventListener("keydown",e=>{if(e.key==="Escape"){const m=$$("#layer .modalwrap").pop();if(m){m.remove();if(!$("#layer").children.length)document.body.style.overflow="";}else closeLayer();}});
function confirmDialog(title,text,label,onok){const m=modal(`<h2 style="font-size:22px">${esc(title)}</h2><p>${esc(text)}</p><div class="foot"><button class="btn" data-close>Annuleren</button><button class="btn primary" id="ok">${esc(label)}</button></div>`,"sm");$("#ok",m.el).onclick=()=>{m.close();onok();};}
let toastT;function toast(msg,kind=""){$$(".toast").forEach(t=>t.remove());const t=document.createElement("div");t.className="toast "+kind;t.textContent=msg;t.setAttribute("role","status");document.body.appendChild(t);clearTimeout(toastT);toastT=setTimeout(()=>t.remove(),kind?6000:2600);}

/* ---------- Verbruik / aankoop / notitie ---------- */
function rateWidget(id,val=0){return `<div class="rate" id="${id}" data-v="${val}" role="radiogroup" aria-label="Beoordeling">${[1,2,3,4,5].map(i=>`<button type="button" data-i="${i}" class="${i<=val?"on":""}" aria-label="${i} op 5">★</button>`).join("")}</div>`;}
function bindRate(root,id){const r=$("#"+id,root);r.onclick=e=>{const b=e.target.closest("button");if(!b)return;let v=+b.dataset.i;if(+r.dataset.v===v)v=0;r.dataset.v=v;$$("button",r).forEach(x=>x.classList.toggle("on",+x.dataset.i<=v));};return ()=>+r.dataset.v||null;}
function drinkDialog(w){
  const m=modal(`<button class="close" data-close aria-label="Sluiten">×</button><h2 style="font-size:24px">Fles gedronken</h2><p class="muted">${esc(wineTitle(w))} ${vint(w)} · nog ${w.stock} op stock</p>
  <form id="fd"><div class="grid"><div class="f c2"><label for="d_qty">Aantal flessen</label><input id="d_qty" type="number" min="1" max="${w.stock}" value="1" required></div><div class="f c4"><label for="d_date">Datum</label><input id="d_date" type="date" value="${today()}" required></div>
  <div class="f c6"><label for="d_occ">Gelegenheid (optioneel)</label><input id="d_occ" placeholder="bv. etentje met vrienden, lamsbout"></div>
  <div class="f c6"><label>Beoordeling (optioneel)</label>${rateWidget("d_rate")}</div>
  <div class="f c6"><label for="d_com">Commentaar na het drinken (optioneel)</label><textarea id="d_com" placeholder="Hoe smaakte hij? Nog bewaren of opdrinken?"></textarea></div></div>
  <div class="foot"><button type="button" class="btn" data-close>Annuleren</button><button class="btn primary">Registreren</button></div></form>`,"sm");
  const getR=bindRate(m.el,"d_rate");
  $("#fd",m.el).onsubmit=async e=>{e.preventDefault();const qty=Math.max(1,Math.min(w.stock,parseInt($("#d_qty",m.el).value)||1));const date=$("#d_date",m.el).value||today();const occ=$("#d_occ",m.el).value.trim();const r=getR();const com=$("#d_com",m.el).value.trim();
    const mid=uid(),nid=uid(),by=S.me.name||S.me.email;m.close();closeLayer();
    await mutate(D=>{const x=D.wines.find(y=>y.id===w.id);if(!x||D.moves.some(y=>y.id===mid))return;x.stock=Math.max(0,(x.stock||0)-qty);D.moves.push({id:mid,wineId:w.id,kind:"consume",qty,date,note:occ,by});if(r||com)D.notes.push({id:nid,wineId:w.id,date,rating:r,comment:com,by,moveId:mid});},`${qty} fles${qty>1?"sen":""} geregistreerd`,{touch:[w.id]});
    openWine(w.id);};
}
function buyDialog(w){
  const m=modal(`<button class="close" data-close aria-label="Sluiten">×</button><h2 style="font-size:24px">Aankoop toevoegen</h2><p class="muted">${esc(wineTitle(w))} ${vint(w)}</p>
  <form id="fb"><div class="grid"><div class="f c2"><label for="b_qty">Aantal flessen</label><input id="b_qty" type="number" min="1" value="6" required></div><div class="f c2"><label for="b_price">Prijs per fles (€)</label><input id="b_price" inputmode="decimal" value="${esc(w.purchaseValue??"")}"></div><div class="f c2"><label for="b_date">Datum</label><input id="b_date" type="date" value="${today()}"></div>
  <div class="f c6"><label for="b_sup">Leverancier (optioneel)</label><input id="b_sup" list="suppliers"><datalist id="suppliers">${[...new Set(S.data.moves.map(x=>x.supplier).filter(Boolean))].map(s=>`<option value="${esc(s)}">`).join("")}</datalist></div>
  <div class="f c6"><label style="display:flex;gap:8px;align-items:center;font-weight:500;color:var(--ink)"><input type="checkbox" id="b_avg" checked style="width:auto"> Aanschafwaarde bijwerken naar het gewogen gemiddelde</label></div></div>
  <div class="foot"><button type="button" class="btn" data-close>Annuleren</button><button class="btn primary">Toevoegen</button></div></form>`,"sm");
  $("#fb",m.el).onsubmit=async e=>{e.preventDefault();const qty=Math.max(1,parseInt($("#b_qty",m.el).value)||1);const price=num($("#b_price",m.el).value);const date=$("#b_date",m.el).value||today();const sup=$("#b_sup",m.el).value.trim();const avg=$("#b_avg",m.el).checked;const id=uid();m.close();closeLayer();
    await mutate(D=>{const x=D.wines.find(y=>y.id===w.id);if(!x||D.moves.some(y=>y.id===id))return;const old=x.stock||0,ov=num(x.purchaseValue);
      if(avg&&price!=null)x.purchaseValue=ov!=null&&old>0?Math.round(((old*ov+qty*price)/(old+qty))*100)/100:price;x.stock=old+qty;D.moves.push({id,wineId:w.id,kind:"purchase",qty,price,date,supplier:sup,by:S.me.name||S.me.email});},`${qty} flessen toegevoegd`,{touch:[w.id]});openWine(w.id);};
}
function noteDialog(w){
  const m=modal(`<button class="close" data-close aria-label="Sluiten">×</button><h2 style="font-size:24px">Proefnotitie</h2><p class="muted">${esc(wineTitle(w))} ${vint(w)}</p>
  <form id="fn"><div class="grid"><div class="f c3"><label for="n_date">Datum</label><input id="n_date" type="date" value="${today()}"></div><div class="f c3"><label>Beoordeling</label>${rateWidget("n_rate")}</div>
  <div class="f c6"><label for="n_com">Commentaar</label><textarea id="n_com" required></textarea></div></div>
  <div class="foot"><button type="button" class="btn" data-close>Annuleren</button><button class="btn primary">Bewaren</button></div></form>`,"sm");
  const getR=bindRate(m.el,"n_rate");
  $("#fn",m.el).onsubmit=async e=>{e.preventDefault();const id=uid(),date=$("#n_date",m.el).value||today(),rating=getR(),comment=$("#n_com",m.el).value.trim();m.close();closeLayer();
    await mutate(D=>{if(D.notes.some(n=>n.id===id))return;D.notes.push({id,wineId:w.id,date,rating,comment,by:S.me.name||S.me.email});},"Notitie bewaard");openWine(w.id);};
}

/* ---------- Wijnformulier ---------- */
const FIELDS=[["country","Land"],["region","Regio"],["appellation","Herkomst & appellatie"],["color","Type"],["domain","Domein"],["name","Naam van de wijn"],["vintage","Jaar"],["grapes","Druif"],["character","Karakter"],["gastronomy","Gastronomie"],["storage","Bewaren"],["drinkFrom","Drinken vanaf"],["drinkUntil","Drinken tot"],["webValue","Waarde op internet (€/fl.)"],["lat","Breedtegraad"],["lng","Lengtegraad"]];
let pendingPhoto=null;
function wineForm(w){
  const isNew=!w;w=w||{color:"rood",stock:0};pendingPhoto=null;
  const ck=countryKey(w.country);
  const m=modal(`<button class="close" data-close aria-label="Sluiten">×</button><h2>${isNew?"Wijn toevoegen":"Wijn wijzigen"}</h2>
  <form id="fw" autocomplete="off">
   <div class="lookup" id="lk"><div class="label">Gegevens opzoeken</div><p style="margin:4px 0 0;font-size:14px">Vul in wat je weet (bv. domein, naam, jaar) of kies een foto van het etiket, en laat de rest opzoeken. Je kiest daarna zelf welke velden je overneemt.</p>
    <div class="row" style="margin-top:10px"><button type="button" class="btn primary sm" id="doLook">${icon("globe")}Zoek op internet</button><span id="lkState" class="muted" style="font-size:13px"></span></div>
    <div class="links" id="lkLinks"></div><div id="lkOut"></div></div>
   <fieldset><legend>Wijn</legend><div class="grid">
    <div class="f c6"><label>Type</label><div class="seg">${TYPES.map(([k,l])=>`<label class="t-${k}"><input type="radio" name="color" value="${k}" ${w.color===k?"checked":""}><span>${l}</span></label>`).join("")}</div></div>
    <div class="f c3"><label for="f_domain">Domein</label><input id="f_domain" value="${esc(w.domain)}" placeholder="bv. Château Musar"></div>
    <div class="f c2"><label for="f_name">Naam van de wijn</label><input id="f_name" value="${esc(w.name)}" placeholder="bv. Rouge"></div>
    <div class="f c1" style="grid-column:span 1"><label for="f_vintage">Jaar</label><input id="f_vintage" inputmode="numeric" value="${esc(w.vintage??"")}" placeholder="NV"></div>
    ${xFields("wijn",w)}</div></fieldset>
   <fieldset><legend>Herkomst</legend><div class="grid">
    <div class="f c2"><label for="f_country">Land</label><input id="f_country" list="dl_c" value="${esc(ck?countryName(ck):w.country||"")}"><datalist id="dl_c">${COUNTRIES.map(c=>`<option value="${esc(c[1])}">`).join("")}</datalist></div>
    <div class="f c2"><label for="f_region">Regio</label><input id="f_region" list="dl_r" value="${esc(w.region)}"><datalist id="dl_r"></datalist></div>
    <div class="f c2"><label for="f_appellation">Herkomst & appellatie</label><input id="f_appellation" value="${esc(w.appellation)}" placeholder="bv. Pauillac AOC"></div>
    ${xFields("herkomst",w)}</div></fieldset>
   <fieldset><legend>Foto of etiket</legend><div class="photo-in"><div class="ph" id="phPrev">${w.photo?photoTag(w):bottle(w.color)}</div>
    <div><input type="file" id="f_photo" accept="image/*" capture="environment" aria-label="Foto kiezen"><div class="muted" style="font-size:12px;margin-top:4px">Wordt verkleind tot 900 px en ${S.mode==="onedrive"?"bewaard in de map fotos op OneDrive":"in de demo mee bewaard"}.</div>${w.photo?`<button type="button" class="btn ghost sm" id="rmPhoto">Foto verwijderen</button>`:""}</div></div></fieldset>
   <fieldset><legend>Beschrijving</legend><div class="grid">
    <div class="f c6"><label for="f_grapes">Druif</label><input id="f_grapes" value="${esc(w.grapes)}" placeholder="bv. Cabernet Sauvignon 60%, Merlot 40%"></div>
    <div class="f c6"><label for="f_character">Karakter</label><textarea id="f_character">${esc(w.character)}</textarea></div>
    <div class="f c6"><label for="f_gastronomy">Gastronomie</label><textarea id="f_gastronomy">${esc(w.gastronomy)}</textarea></div>
    <div class="f c4"><label for="f_storage">Bewaren</label><input id="f_storage" value="${esc(w.storage)}" placeholder="bv. Op dronk 2026–2035, bewaren bij 12 °C"></div>
    <div class="f c1" style="grid-column:span 1"><label for="f_drinkFrom">Vanaf</label><input id="f_drinkFrom" inputmode="numeric" value="${esc(w.drinkFrom??"")}"></div>
    <div class="f c1" style="grid-column:span 1"><label for="f_drinkUntil">Tot</label><input id="f_drinkUntil" inputmode="numeric" value="${esc(w.drinkUntil??"")}"></div>
    ${xFields("beschrijving",w)}</div></fieldset>
   <fieldset><legend>Kelder & waarde</legend><div class="grid">
    <div class="f c2"><label for="f_stock">Aantal op stock</label><input id="f_stock" type="number" min="0" value="${w.stock||0}"></div>
    <div class="f c2"><label for="f_purchaseValue">Aanschafwaarde (€/fl.)</label><input id="f_purchaseValue" inputmode="decimal" value="${esc(w.purchaseValue??"")}"></div>
    <div class="f c2"><label for="f_webValue">Waarde op internet (€/fl.)</label><input id="f_webValue" inputmode="decimal" value="${esc(w.webValue??"")}"></div>
    <div class="f c2"><label for="f_location">Plaats in kelder</label><input id="f_location" value="${esc(w.location)}" placeholder="bv. Rek B, vak 3"></div>
    <div class="f c4"><label for="f_remark">Notitie</label><input id="f_remark" value="${esc(w.remark)}"></div>
    ${xFields("kelder",w)}
    <input type="hidden" id="f_lat" value="${esc(w.lat??"")}"><input type="hidden" id="f_lng" value="${esc(w.lng??"")}">
   </div>${!isNew?`<p class="muted" style="font-size:12px;margin:6px 0 0">Wijzig je het aantal hier, dan wordt het verschil als correctie in het logboek gezet. Gebruik liever <b>Aankoop</b> of <b>Fles gedronken</b>.</p>`:`<p class="muted" style="font-size:12px;margin:6px 0 0">Het beginaantal wordt als aankoop tegen de aanschafwaarde in het logboek gezet.</p>`}</fieldset>
   <div class="foot"><button type="button" class="btn" data-close>Annuleren</button><button class="btn primary">${isNew?"Toevoegen":"Bewaren"}</button></div>
  </form>`);
  const el=m.el;const fillRegions=()=>{const k=countryKey($("#f_country",el).value);$("#dl_r",el).innerHTML=(REG[k]||[]).map(r=>`<option value="${esc(r[0])}">`).join("");};
  fillRegions();$("#f_country",el).addEventListener("input",fillRegions);
  const drawLinks=()=>{const q=[$("#f_domain",el).value,$("#f_name",el).value,$("#f_vintage",el).value].filter(Boolean).join(" ").trim();
    $("#lkLinks",el).innerHTML=q?[["Vivino","https://www.vivino.com/search/wines?q="+encodeURIComponent(q)],["Wine-Searcher","https://www.wine-searcher.com/find/"+encodeURIComponent(q.replace(/\s+/g,"+"))],["Google","https://www.google.com/search?q="+encodeURIComponent(q+" wijn")]].map(([l,u])=>`<a class="btn sm" href="${u}" target="_blank" rel="noopener">${l} ↗</a>`).join(""):"";};
  drawLinks();["f_domain","f_name","f_vintage"].forEach(i=>$("#"+i,el).addEventListener("input",drawLinks));
  $$('input[name=color]',el).forEach(r=>r.onchange=()=>{if(!pendingPhoto&&!w.photo)$("#phPrev",el).innerHTML=bottle(r.value);});
  $("#f_photo",el).onchange=async e=>{const file=e.target.files[0];if(!file)return;try{pendingPhoto=await shrink(file);$("#phPrev",el).innerHTML=`<img src="${pendingPhoto.dataUrl}" alt="">`;}catch(err){toast("Deze afbeelding kan niet gelezen worden","err");}};
  $("#rmPhoto",el)?.addEventListener("click",()=>{pendingPhoto={remove:true};$("#phPrev",el).innerHTML=bottle(w.color);});
  $("#doLook",el).onclick=()=>runLookup(el);
  hydratePhotos();
  $("#fw",el).onsubmit=async e=>{e.preventDefault();
    const v=id=>$("#f_"+id,el).value.trim();const color=($('input[name=color]:checked',el)||{}).value||"rood";
    const rec={country:v("country"),region:v("region"),appellation:v("appellation"),color,domain:v("domain"),name:v("name"),vintage:num(v("vintage")),grapes:v("grapes"),character:v("character"),gastronomy:v("gastronomy"),storage:v("storage"),drinkFrom:num(v("drinkFrom")),drinkUntil:num(v("drinkUntil")),purchaseValue:num(v("purchaseValue")),webValue:num(v("webValue")),location:v("location"),remark:v("remark"),lat:num(v("lat")),lng:num(v("lng"))};XF.forEach(f=>{rec[f.key]=xRead(f,el);});
    if(!rec.domain&&!rec.name){toast("Geef minstens een domein of een naam in","err");return;}
    const stock=Math.max(0,parseInt(v("stock"))||0);const id=w.id||uid();const btn=e.submitter;if(btn){btn.disabled=true;btn.innerHTML='<span class="spin"></span> Bewaren…';}
    try{
      if(pendingPhoto?.remove)rec.photo="";else if(pendingPhoto)rec.photo=await S.store.putPhoto(id,pendingPhoto.blob,pendingPhoto.dataUrl);
      const mid=uid(),by=S.me.name||S.me.email;m.close();
      await mutate(D=>{let x=D.wines.find(y=>y.id===id);
        if(!x){if(D.wines.some(y=>y.id===id))return;x=Object.assign({id,created:today()},rec,{stock});D.wines.push(x);if(stock>0)D.moves.push({id:mid,wineId:id,kind:"purchase",qty:stock,price:rec.purchaseValue,date:today(),by,note:"Beginvoorraad"});}
        else{Object.assign(x,rec);const diff=stock-(x.stock||0);if(diff!==0&&!D.moves.some(y=>y.id===mid)){D.moves.push({id:mid,wineId:id,kind:"adjust",qty:diff,date:today(),by,note:"Voorraad aangepast"});x.stock=stock;}}},isNew?"Wijn toegevoegd":"Wijzigingen bewaard",{touch:[id]});
      openWine(id);
    }catch(err){toast("Niet opgeslagen: "+err.message,"err");if(btn){btn.disabled=false;btn.textContent="Bewaren";}}
  };
}
function shrink(file,max=900){return new Promise((ok,no)=>{const img=new Image();const u=URL.createObjectURL(file);img.onload=()=>{const s=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement("canvas");c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);const dataUrl=c.toDataURL("image/jpeg",.82);c.toBlob(b=>ok({blob:b,dataUrl}),"image/jpeg",.82);};img.onerror=no;img.src=u;});}

/* ---------- Opzoeken op internet ---------- */
async function aiProvider(){
  if(IN_ARTIFACT){const s=await window.claude.use("sample").catch(()=>null);if(!s)return null;const lim=await s.limits().catch(()=>null);return {kind:"sample",s,images:!!lim?.images,live:false};}
  const key=ls.get("wk.aikey");if(key)return {kind:"api",key,images:true,live:true};return null;
}
function lookupPrompt(known,hasImg,live){
  return `Je helpt een wijnverzamelaar in België om een fiche voor zijn kelder in te vullen.${hasImg?" Bijgevoegd is een foto van de fles of het etiket: lees domein, naam, jaargang en appellatie af van het etiket.":""}${live?" Zoek op het internet naar de wijn en een actuele verkoopprijs in België of de EU.":" Gebruik je eigen kennis; geef bij prijs een realistische schatting van de gangbare winkelprijs in de EU."}
Wat al ingevuld is (kan leeg of onvolledig zijn): ${JSON.stringify(known)}
Antwoord met enkel één JSON-object met deze sleutels (laat een sleutel weg als je het niet weet, verzin niets):
{"country":"land in het Nederlands","region":"wijnstreek","appellation":"herkomst en appellatie, bv. Pauillac AOC","color":"een van: rood, wit, rose, champagne, dessert, versterkt","domain":"producent/domein","name":"naam van de cuvée","vintage":2019,"grapes":"druiven met aandeel indien bekend","character":"karakter in 1-2 zinnen, Nederlands","gastronomy":"3-5 gerechten, Nederlands","storage":"bewaaradvies incl. drinkvenster en temperatuur, Nederlands","drinkFrom":2024,"drinkUntil":2032,"webValue":35,"lat":44.8,"lng":-0.6,"source":"korte bronvermelding of 'schatting'"}
webValue is een getal in euro per fles van 75 cl. lat/lng is de ligging van de appellatie of streek.${XF.filter(f=>f.lookup).map(f=>`\nVoeg ook toe: "${f.key}" (${f.label}${f.hint?"; "+f.hint:""}).`).join("")}`;
}
async function runLookup(el){
  const st=$("#lkState",el),out=$("#lkOut",el),btn=$("#doLook",el);
  const known={};["domain","name","vintage","country","region","appellation","grapes"].forEach(k=>{const v=$("#f_"+k,el).value.trim();if(v)known[k]=v;});
  const p=await aiProvider();
  if(!p){out.innerHTML=`<p style="font-size:13px;margin:10px 0 0">${HOSTED?"Automatisch opzoeken staat nog niet aan. Een beheerder kan het inschakelen onder <b>Beheer › Opzoeken</b>. Tot dan kun je de links hierboven gebruiken.":"Automatisch opzoeken is hier niet beschikbaar. Gebruik de links hierboven."}</p>`;return;}
  const hasImg=!!pendingPhoto?.blob&&p.images;
  if(!Object.keys(known).length&&!hasImg){st.textContent="Vul eerst een domein of naam in, of kies een foto.";return;}
  btn.disabled=true;st.innerHTML='<span class="spin"></span> Opzoeken… dit duurt meestal 10 tot 40 seconden';out.innerHTML="";
  try{
    let res;
    if(p.kind==="sample"){res=await p.s.json(lookupPrompt(known,hasImg,false),hasImg?{images:[pendingPhoto.blob]}:{});}
    else{res=await apiLookup(p.key,lookupPrompt(known,hasImg,true),hasImg?pendingPhoto.dataUrl:null);}
    if(!res||typeof res!=="object")throw {code:"invalid_json"};
    showSuggestions(el,res,p.live);st.textContent=p.live?"":"Op basis van de kennis van Claude, zonder live prijzen. Controleer de waarde via de links.";
  }catch(e){const c=e?.code;st.textContent=c==="not_granted"?"Opzoeken werd niet toegestaan.":c==="rate_limited"?"Even te veel vragen. Probeer het zo meteen opnieuw.":c==="invalid_json"?"Het antwoord was onvolledig. Probeer het opnieuw.":"Opzoeken mislukt: "+(e.message||c||"onbekende fout");}
  finally{btn.disabled=false;}
}
async function apiLookup(key,prompt,dataUrl){
  const content=[];if(dataUrl)content.push({type:"image",source:{type:"base64",media_type:"image/jpeg",data:dataUrl.split(",")[1]}});content.push({type:"text",text:prompt});
  const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
    body:JSON.stringify({model:CFG.aiModel||"claude-sonnet-5-5",max_tokens:2500,tools:[{type:"web_search_20250305",name:"web_search",max_uses:4}],messages:[{role:"user",content}]})});
  const j=await r.json();if(!r.ok)throw new Error(j?.error?.message||("API "+r.status));
  const text=(j.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n");return parseJsonLoose(text);
}
function parseJsonLoose(t){try{return JSON.parse(t)}catch(e){}const f=t.match(/```(?:json)?\s*([\s\S]*?)```/);if(f)try{return JSON.parse(f[1])}catch(e){}const a=t.lastIndexOf("{"),i=t.indexOf("{"),b=t.lastIndexOf("}");if(i>=0&&b>i)try{return JSON.parse(t.slice(i,b+1))}catch(e){}throw {code:"invalid_json"};}
function showSuggestions(el,res,live){
  if(res.color){const c=norm(res.color);res.color=c.startsWith("ros")?"rose":TYPES.some(t=>t[0]===c)?c:c.includes("mousse")||c.includes("spark")?"champagne":c.includes("zoet")||c.includes("sweet")?"dessert":c.includes("port")||c.includes("fort")?"versterkt":c.includes("wit")||c.includes("white")?"wit":c.includes("rood")||c.includes("red")?"rood":"";}
  if(res.country){const k=countryKey(res.country);if(k)res.country=countryName(k);}
  const inp=k=>$("#f_"+k,el)||$("#x_"+k,el);const cur=k=>k==="color"?(($('input[name=color]:checked',el)||{}).value||""):(inp(k)?.value||"");
  const rows=[...FIELDS,...XF.filter(f=>f.lookup).map(f=>[f.key,f.label])].filter(([k])=>res[k]!=null&&res[k]!==""&&String(res[k])!==String(cur(k)));
  if(!rows.length){$("#lkOut",el).innerHTML='<p style="font-size:13px;margin:10px 0 0">Geen nieuwe gegevens gevonden.</p>';return;}
  $("#lkOut",el).innerHTML=`<table class="sugg"><thead><tr><th></th><th>Veld</th><th>Voorstel</th></tr></thead><tbody>${rows.map(([k,l])=>{const c=cur(k);return `<tr><td><input type="checkbox" data-k="${k}" ${c?"":"checked"} aria-label="${esc(l)} overnemen"></td><td>${esc(l)}${c?`<br><span class="muted">nu: ${esc(k==="color"?TYPE_SHORT[c]:c)}</span>`:""}</td><td>${esc(k==="color"?TYPE_LABEL[res[k]]||res[k]:k==="webValue"?eur(num(res[k]),2):res[k])}</td></tr>`}).join("")}</tbody></table>
   ${res.source?`<p class="muted" style="font-size:12px;margin:6px 0 0">Bron: ${esc(res.source)}</p>`:""}<div class="row" style="margin-top:8px"><button type="button" class="btn primary sm" id="apply">Aangevinkte velden overnemen</button></div>`;
  $("#apply",el).onclick=()=>{$$(".sugg input:checked",el).forEach(cb=>{const k=cb.dataset.k,v=res[k];if(k==="color"){const r=$(`input[name=color][value="${v}"]`,el);if(r){r.checked=true;r.dispatchEvent(new Event("change"));}}else{const i=inp(k);if(i){i.value=v;i.dispatchEvent(new Event("input"));}}});
    $("#lkOut",el).innerHTML='<p style="font-size:13px;margin:10px 0 0">Overgenomen. Controleer en bewaar de fiche.</p>';};
}

/* ---------- Dashboard ---------- */
function sumBy(items,keyFn,valFn){const m=new Map();for(const it of items){const k=keyFn(it);if(k==null)continue;const t=it.color||"rood";if(!m.has(k))m.set(k,{});const o=m.get(k);o[t]=(o[t]||0)+valFn(it);}return m;}
function total(parts){return Object.values(parts).reduce((a,b)=>a+b,0);}
function legend(types){return `<div class="legend">${types.map(t=>`<span class="t-${t}"><i></i>${TYPE_SHORT[t]}</span>`).join("")}</div>`;}
function tipParts(label,parts,unit){return esc(label+": "+TYPES.filter(t=>parts[t[0]]).map(t=>TYPE_SHORT[t[0]]+" "+parts[t[0]]).join(", ")+" "+unit);}
function hbars(map,unit,labelFn=x=>x){const rows=[...map.entries()].sort((a,b)=>total(b[1])-total(a[1]));const max=Math.max(1,...rows.map(r=>total(r[1])));
  return `<div class="hbars">${rows.map(([k,p])=>`<div class="hbar" data-tip="${tipParts(labelFn(k),p,unit)}"><span class="nm">${esc(labelFn(k))}</span><div class="track" style="width:${total(p)/max*100}%">${TYPES.filter(t=>p[t[0]]).map(t=>`<span class="seg-b t-${t[0]}" style="flex:${p[t[0]]}"></span>`).join("")}</div><span class="num" style="text-align:right">${total(p)}</span></div>`).join("")}</div>`;}
function niceMax(v){if(v<=4)return 4;const p=Math.pow(10,Math.floor(Math.log10(v)));const s=[1,2,2.5,5,10].find(s=>s*p>=v/1)*p;return s;}
function columns(map,unit,keys){const max=niceMax(Math.max(1,...keys.map(k=>total(map.get(k)||{}))));const ticks=[0,.25,.5,.75,1].map(f=>Math.round(max*f*10)/10);
  return `<div class="cols-wrap"><div class="cols">${ticks.map(t=>`<div class="grid-l" style="bottom:${t/max*100}%"><span>${t}</span></div>`).join("")}${keys.map(k=>{const p=map.get(k)||{};return `<div class="col" data-tip="${tipParts(String(k),p,unit)}">${TYPES.filter(t=>p[t[0]]).map(t=>`<span class="seg-v t-${t[0]}" style="height:${p[t[0]]/max*100}%"></span>`).join("")}</div>`}).join("")}</div>
  <div class="xlab">${keys.map(k=>`<span>${esc(String(k).length>4?String(k).slice(-2):k)}</span>`).join("")}</div></div>`;}
function range(a,b){const r=[];for(let i=a;i<=b;i++)r.push(i);return r;}
function viewDashboard(){
  const D=S.data,ws=D.wines,inStock=ws.filter(w=>w.stock>0);
  const bottles=inStock.reduce((s,w)=>s+w.stock,0);
  const buyV=inStock.reduce((s,w)=>s+w.stock*(num(w.purchaseValue)||0),0),webV=inStock.reduce((s,w)=>s+w.stock*(num(w.webValue)||num(w.purchaseValue)||0),0);
  const drunkY=D.moves.filter(m=>m.kind==="consume"&&m.date.startsWith(YEAR)).reduce((s,m)=>s+m.qty,0);
  const colorOf=id=>(ws.find(w=>w.id===id)||{}).color||"rood";
  const byType=sumBy(inStock,w=>"x",w=>w.stock).get("x")||{};
  const typesPresent=TYPES.map(t=>t[0]).filter(t=>ws.some(w=>w.color===t));
  const byCountry=sumBy(inStock,w=>countryKey(w.country)||w.country||"Onbekend",w=>w.stock);
  const vmap=sumBy(inStock.filter(w=>w.vintage),w=>w.vintage,w=>w.stock);const vk=[...vmap.keys()].sort();const vkeys=vk.length?range(vk[0],vk[vk.length-1]):[];
  const nv=inStock.filter(w=>!w.vintage).reduce((s,w)=>s+w.stock,0);
  const cons=D.moves.filter(m=>m.kind==="consume").map(m=>({y:+m.date.slice(0,4),color:colorOf(m.wineId),qty:m.qty}));
  const cmap=sumBy(cons,c=>c.y,c=>c.qty);const ck=[...cmap.keys()].sort();const ckeys=ck.length?range(ck[0],Math.max(YEAR,ck[ck.length-1])):[];
  const buys=D.moves.filter(m=>m.kind==="purchase").map(m=>({y:+m.date.slice(0,4),color:colorOf(m.wineId),qty:m.qty}));const bmap=sumBy(buys,c=>c.y,c=>c.qty);const bk=[...bmap.keys()].sort();const bkeys=bk.length?range(bk[0],Math.max(YEAR,bk[bk.length-1])):[];
  const st={jong:[],dronk:[],nu:[],over:[]};inStock.forEach(w=>{const s=drinkStatus(w);if(s&&st[s.k])st[s.k].push(w);});
  const soon=[...st.over,...st.nu,...st.dronk].sort((a,b)=>(drinkWindow(a).u||9999)-(drinkWindow(b).u||9999)).slice(0,6);
  const rated=ws.map(w=>({w,r:avgRating(w.id),n:D.notes.filter(n=>n.wineId===w.id&&n.rating).length})).filter(x=>x.r).sort((a,b)=>b.r-a.r||b.n-a.n).slice(0,6);
  const gain=buyV?Math.round((webV-buyV)/buyV*100):null;
  $("#view").innerHTML=`<div class="kpis">
   <div class="kpi"><span class="label">Flessen op stock</span><b>${bottles}</b><small>${inStock.length} verschillende wijnen</small></div>
   <div class="kpi"><span class="label">Aanschafwaarde</span><b>${eur(buyV)}</b><small>gemiddeld ${eur(bottles?buyV/bottles:0)} per fles</small></div>
   <div class="kpi"><span class="label">Waarde op internet</span><b>${eur(webV)}</b><small>${gain==null?"":(gain>=0?"+":"")+gain+"% t.o.v. aanschaf"}</small></div>
   <div class="kpi"><span class="label">Gedronken in ${YEAR}</span><b>${drunkY}</b><small>${D.notes.filter(n=>n.date.startsWith(YEAR)).length} proefnotities dit jaar</small></div></div>
  <div class="board">
   <section class="panel"><h3>Voorraad per type</h3><div class="hint">Flessen op stock</div>${bottles?`<div class="hbars">${TYPES.filter(t=>byType[t[0]]).map(([k])=>`<div class="hbar t-${k}" data-tip="${esc(TYPE_LABEL[k]+": "+byType[k]+" flessen ("+Math.round(byType[k]/bottles*100)+"%)")}"><span class="nm">${TYPE_SHORT[k]}</span><div class="track" style="width:${byType[k]/Math.max(...Object.values(byType))*100}%"><span class="seg-b" style="flex:1"></span></div><span class="num" style="text-align:right">${byType[k]}</span></div>`).join("")}</div>`:emptyP()}</section>
   <section class="panel"><h3>Voorraad per land</h3><div class="hint">Flessen op stock, per type</div>${legend(typesPresent)}${byCountry.size?hbars(byCountry,"flessen",k=>countryName(k)):emptyP()}</section>
   <section class="panel"><h3>Voorraad per jaargang</h3><div class="hint">Flessen op stock${nv?` · plus ${nv} fl. zonder jaargang (NV)`:""}</div>${legend(typesPresent)}${vkeys.length?columns(vmap,"flessen",vkeys):emptyP()}</section>
   <section class="panel"><h3>Verbruik per jaar</h3><div class="hint">Gedronken flessen, per type</div>${legend(typesPresent)}${ckeys.length?columns(cmap,"flessen gedronken",ckeys):emptyP("Nog geen verbruik geregistreerd.")}</section>
   <section class="panel"><h3>Drinkvenster</h3><div class="hint">Op basis van de velden Bewaren, Vanaf en Tot</div>
    <div class="statuses"><div><span class="pill jong">Nog bewaren</span><b>${cnt(st.jong)}</b></div><div><span class="pill dronk">Op dronk</span><b>${cnt(st.dronk)}</b></div><div><span class="pill nu">Nu drinken</span><b>${cnt(st.nu)}</b></div><div><span class="pill over">Over hoogtepunt</span><b>${cnt(st.over)}</b></div></div>
    <div class="label" style="margin-bottom:4px">Eerst opdrinken</div>${soon.length?`<ul class="mini">${soon.map(w=>`<li data-id="${w.id}"><span>${esc(wineTitle(w))} <span class="num muted">${vint(w)}</span></span><span class="num muted">tot ${drinkWindow(w).u||"?"} · ${w.stock} fl.</span></li>`).join("")}</ul>`:emptyP("Geen flessen op dronk.")}</section>
   <section class="panel"><h3>Hoogst gewaardeerd</h3><div class="hint">Gemiddelde van de proefnotities</div>${rated.length?`<ul class="mini">${rated.map(x=>`<li data-id="${x.w.id}"><span>${esc(wineTitle(x.w))} <span class="num muted">${vint(x.w)}</span></span><span><span class="stars">${stars(x.r)}</span> <span class="muted num">${x.n}×</span></span></li>`).join("")}</ul>`:emptyP("Nog geen beoordelingen.")}</section>
   <section class="panel" style="grid-column:1/-1"><h3>Aankopen per jaar</h3><div class="hint">Aangekochte flessen, per type</div>${legend(typesPresent)}${bkeys.length?columns(bmap,"flessen gekocht",bkeys):emptyP()}</section>
  </div>`;
  $$(".mini li[data-id]").forEach(li=>li.onclick=()=>openWine(li.dataset.id));
}
const cnt=a=>a.reduce((s,w)=>s+w.stock,0);
const emptyP=(t="Nog geen gegevens.")=>`<p class="muted">${t}</p>`;

/* ---------- Kaart ---------- */
function countrySvg(k,pins,opt={}){
  const m=MAPS[k];const pad=opt.small?14:30;
  const circles=pins.map(p=>{const [x,y]=project(k,p.xy[0],p.xy[1]);return {x,y,p};});
  return `<svg viewBox="${-pad} ${-pad} ${m.w+pad*2} ${m.h+pad*2}" role="img" aria-label="Kaart van ${esc(countryName(k))}"><path class="land" d="${m.d}"/>
   ${circles.map(({x,y,p})=>`<circle class="pin t-${p.color}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${opt.small?24:Math.min(22,7+Math.sqrt(p.n||1)*3)}" ${p.tip?`data-tip="${esc(p.tip)}"`:""} ${p.region?`data-region="${esc(p.region)}"`:""}/>`).join("")}
   ${opt.small?"":circles.map(({x,y,p})=>`<text class="pin-l" x="${(x+Math.min(22,7+Math.sqrt(p.n||1)*3)+4).toFixed(1)}" y="${(y+4).toFixed(1)}">${esc(p.label)}</text>`).join("")}</svg>`;}
function viewKaart(){
  const ws=S.data.wines;const per=new Map();ws.forEach(w=>{const k=countryKey(w.country);if(k&&MAPS[k])per.set(k,(per.get(k)||0)+(w.stock||0));});
  const keys=[...per.keys()].sort((a,b)=>per.get(b)-per.get(a));
  if(!S.mapCountry||!MAPS[S.mapCountry])S.mapCountry=keys[0]||"FR";const k=S.mapCountry;
  const inC=ws.filter(w=>countryKey(w.country)===k&&(w.stock>0||S.f.stock==="all"));
  const groups=new Map();const nopos=[];inC.forEach(w=>{const xy=coordsFor(w);if(!xy){nopos.push(w);return;}const lab=w.appellation&&REG[k]?.some(r=>norm(r[0])===norm(w.appellation))?w.appellation:(w.region||w.appellation);const key=xy.map(v=>v.toFixed(2)).join(",");if(!groups.has(key))groups.set(key,{xy,label:lab,ws:[],n:0,types:{}});const g=groups.get(key);g.ws.push(w);g.n+=w.stock||0;g.types[w.color]=(g.types[w.color]||0)+(w.stock||0);});
  const pins=[...groups.values()].map(g=>({xy:g.xy,n:g.n,label:g.label,region:g.label,color:Object.entries(g.types).sort((a,b)=>b[1]-a[1])[0][0],tip:`${g.label}: ${g.n} fl. · ${g.ws.length} wijn${g.ws.length>1?"en":""}`}));
  $("#view").innerHTML=`<div class="cty">${keys.map(c=>`<button class="chip" data-c="${c}" aria-pressed="${c===k}">${esc(countryName(c))} <span class="num muted">${per.get(c)}</span></button>`).join("")}
   <select id="allc" aria-label="Ander land" class="chip" style="padding:4px 10px"><option value="">Ander land…</option>${Object.keys(MAPS).filter(c=>!per.has(c)).sort((a,b)=>countryName(a).localeCompare(countryName(b))).map(c=>`<option value="${c}">${esc(countryName(c))}</option>`).join("")}</select></div>
  <div class="mapview"><div class="mapbox"><div class="row" style="justify-content:space-between;margin-bottom:6px"><h3 style="margin:0;font:italic 500 24px var(--f-display)">${esc(countryName(k))}</h3>${legend(TYPES.map(t=>t[0]).filter(t=>pins.some(p=>p.color===t)))}</div>
   ${countrySvg(k,pins)}<p class="muted" style="font-size:12px;margin:6px 0 0">Schematisch. De grootte van een punt volgt het aantal flessen op stock; de kleur het meest voorkomende type.</p></div>
   <div class="panel"><h3>Wijnen uit ${esc(countryName(k))}</h3><div class="hint" id="mapHint">${inC.length} wijnen op stock</div><ul class="mini" id="mapList">${mapList(inC)}</ul>
   ${nopos.length?`<p class="muted" style="font-size:12px">${nopos.length} wijn${nopos.length>1?"en":""} zonder gekende ligging: ${nopos.map(w=>esc(wineTitle(w))).join(", ")}.</p>`:""}</div></div>`;
  $$(".cty .chip[data-c]").forEach(b=>b.onclick=()=>{S.mapCountry=b.dataset.c;viewKaart();});
  $("#allc").onchange=e=>{if(e.target.value){S.mapCountry=e.target.value;viewKaart();}};
  $$("circle[data-region]").forEach(c=>c.onclick=()=>{const g=[...groups.values()].find(x=>x.label===c.dataset.region);if(!g)return;$("#mapList").innerHTML=mapList(g.ws);$("#mapHint").textContent=g.label+" · "+g.ws.length+" wijnen";bindMini();});
  bindMini();
}
function mapList(ws){return ws.length?ws.map(w=>`<li data-id="${w.id}" class="t-${w.color}"><span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--tc);margin-right:6px"></span>${esc(wineTitle(w))} <span class="num muted">${vint(w)}</span></span><span class="num muted">${w.stock} fl.</span></li>`).join(""):`<li class="muted">Geen wijnen op stock uit dit land.</li>`;}
function bindMini(){$$("#mapList li[data-id]").forEach(li=>li.onclick=()=>openWine(li.dataset.id));}

/* ---------- Logboek ---------- */
function viewLog(){
  const D=S.data;const wn=id=>{const w=D.wines.find(x=>x.id===id);return w?wineTitle(w)+" "+vint(w):"(verwijderd)";};
  let rows=[...D.moves.map(m=>({d:m.date,kind:m.kind,m})),...D.notes.filter(n=>!n.moveId).map(n=>({d:n.date,kind:"note",n}))];
  // notities die bij een verbruik horen tonen we bij die regel
  const years=[...new Set(rows.map(r=>r.d.slice(0,4)))].sort().reverse();
  if(S.logKind)rows=rows.filter(r=>r.kind===S.logKind);if(S.logYear)rows=rows.filter(r=>r.d.startsWith(S.logYear));
  rows.sort((a,b)=>b.d.localeCompare(a.d));
  const kinds=[["","Alles"],["consume","Verbruik"],["purchase","Aankopen"],["note","Proefnotities"],["adjust","Correcties"]];
  $("#view").innerHTML=`<div class="filters">${kinds.map(([k,l])=>`<button class="chip" data-k="${k}" aria-pressed="${S.logKind===k}">${l}</button>`).join("")}
   <select id="ly" aria-label="Jaar"><option value="">Alle jaren</option>${years.map(y=>`<option ${S.logYear===y?"selected":""}>${y}</option>`).join("")}</select><span class="count">${rows.length} regels</span><button class="btn sm" id="csv">${icon("dl")}CSV</button></div>
  <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Datum</th><th>Soort</th><th>Wijn</th><th class="num">Aantal</th><th>Details</th></tr></thead><tbody>
  ${rows.slice(0,400).map(r=>{if(r.n){return `<tr data-id="${r.n.wineId}"><td class="num">${fmtDate(r.d)}</td><td><span class="kind note">Proefnotitie</span></td><td>${esc(wn(r.n.wineId))}</td><td></td><td>${r.n.rating?`<span class="stars">${stars(r.n.rating)}</span> `:""}${esc(r.n.comment||"")} <span class="muted">${esc(r.n.by||"")}</span></td></tr>`;}
   const m=r.m;const note=D.notes.find(n=>n.moveId===m.id);const lbl={consume:"Verbruik",purchase:"Aankoop",adjust:"Correctie"}[m.kind];
   return `<tr data-id="${m.wineId}"><td class="num">${fmtDate(r.d)}</td><td><span class="kind ${m.kind}">${lbl}</span></td><td>${esc(wn(m.wineId))}</td><td class="num">${m.kind==="consume"?"−":m.qty>0?"+":""}${m.kind==="consume"?m.qty:m.qty}</td><td>${[m.price?eur(m.price,2)+"/fl.":"",m.supplier,m.note].filter(Boolean).map(esc).join(" · ")}${note?`<br>${note.rating?`<span class="stars">${stars(note.rating)}</span> `:""}${esc(note.comment||"")}`:""} <span class="muted">${esc(m.by||"")}</span></td></tr>`;}).join("")||`<tr><td colspan="5" class="muted">Nog niets geregistreerd.</td></tr>`}
  </tbody></table></div>`;
  $$(".chip[data-k]").forEach(b=>b.onclick=()=>{S.logKind=b.dataset.k;viewLog();});$("#ly").onchange=e=>{S.logYear=e.target.value;viewLog();};
  $$("tr[data-id]").forEach(tr=>{tr.style.cursor="pointer";tr.onclick=()=>openWine(tr.dataset.id);});
  $("#csv").onclick=()=>{const lines=[["datum","soort","wijn","aantal","prijs","leverancier","notitie","beoordeling","commentaar","door"]];rows.forEach(r=>{if(r.n)lines.push([r.d,"proefnotitie",wn(r.n.wineId),"","","","",r.n.rating||"",r.n.comment||"",r.n.by||""]);else{const m=r.m,n=D.notes.find(x=>x.moveId===m.id);lines.push([m.date,m.kind,wn(m.wineId),m.kind==="consume"?-m.qty:m.qty,m.price??"",m.supplier||"",m.note||"",n?.rating||"",n?.comment||"",m.by||""]);}});
    saveFile("wijnkelder-logboek.csv",toCsv(lines),"text/csv");};
}
const toCsv=rows=>"﻿"+rows.map(r=>r.map(v=>{v=String(v??"");return /[;"\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}).join(";")).join("\n");
async function saveFile(name,content,type){
  if(IN_ARTIFACT){const dl=await window.claude.use("downloads").catch(()=>null);if(!dl){toast("Downloaden is hier niet beschikbaar","err");return;}try{await dl.save({filename:name,data:new Blob([content],{type})});}catch(e){if(e?.code!=="cancelled")toast("Downloaden niet gelukt","err");}return;}
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);}

/* ---------- Beheer ---------- */
function viewBeheer(){
  const D=S.data,demo=S.mode==="demo";
  $("#view").innerHTML=`<div class="cards">
   <section class="panel"><h3>Je account</h3><div class="hint">${esc(S.me.email)}</div><p style="margin:0 0 10px">Rol: <b>${ROLES[S.me.role]}</b> · ${esc(ROLE_INFO[S.me.role])}</p>
    ${demo?`<label class="f"><span class="label">Demo: bekijk de app als</span><select id="asRole">${Object.entries(ROLES).map(([k,l])=>`<option value="${k}" ${S.me.role===k?"selected":""}>${l}</option>`).join("")}</select></label>`:`<button class="btn sm" id="logout">Afmelden</button>`}</section>
   <section class="panel"><h3>Gebruikers en rechten</h3><div class="hint">${D.users.length} gebruikers · ook Gmail-adressen kunnen als gast worden uitgenodigd</div>
    <div class="tbl-wrap" style="border:0"><table class="tbl"><tbody>${D.users.map((u,i)=>`<tr><td style="min-width:0;word-break:break-all">${esc(u.name||"")}${u.name?"<br>":""}<span class="muted">${esc(u.email)}</span></td><td>${can("users")?`<select data-u="${i}" aria-label="Rol">${Object.entries(ROLES).map(([k,l])=>`<option value="${k}" ${u.role===k?"selected":""}>${l}</option>`).join("")}</select>`:ROLES[u.role]}</td><td>${can("users")&&u.email!==S.me.email?`<button class="btn ghost sm danger" data-del="${i}" aria-label="Verwijderen">×</button>`:""}</td></tr>`).join("")}</tbody></table></div>
    ${can("users")?`<form id="fu" class="grid" style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;margin-top:10px"><input id="u_email" type="email" required placeholder="naam@gmail.com of naam@dumon.com" aria-label="E-mailadres" style="border:1px solid var(--line);border-radius:var(--r);background:var(--bg);padding:8px 10px;min-width:0">
      <select id="u_role" aria-label="Rol" style="border:1px solid var(--line);border-radius:var(--r);background:var(--bg);padding:8px">${Object.entries(ROLES).map(([k,l])=>`<option value="${k}" ${k==="drinker"?"selected":""}>${l}</option>`).join("")}</select>
      <input id="u_name" placeholder="Naam (optioneel)" aria-label="Naam" style="border:1px solid var(--line);border-radius:var(--r);background:var(--bg);padding:8px 10px;min-width:0"><button class="btn primary">Uitnodigen</button></form>
      <p class="muted" style="font-size:12px;margin:8px 0 0">${demo?"In de demo wordt enkel de lijst aangepast.":"De app stuurt een gastuitnodiging via Microsoft (voor adressen buiten je organisatie) en deelt de kelder op OneDrive met leesrecht (Lezer) of schrijfrecht (andere rollen)."}</p>`:""}
    <details style="margin-top:10px;font-size:13px"><summary>Wat mag elke rol?</summary><ul style="padding-left:18px;margin:6px 0 0">${Object.entries(ROLES).map(([k,l])=>`<li><b>${l}</b>: ${esc(ROLE_INFO[k])}</li>`).join("")}</ul></details></section>
   <section class="panel"><h3>Opslag</h3>${demo?`<p style="margin:0">Demo-modus: gegevens staan niet op OneDrive.</p>`:`<p style="margin:0 0 6px">Alles staat in één bestand op OneDrive: <code>${esc(CFG.folderName||"Wijnkelder")}/cellar.json</code>, foto's in <code>fotos/</code> en elke dag een back-up in <code>backups/</code>.</p><p class="muted" style="font-size:12px;margin:0">Drive-ID <code>${esc(S.store.d)}</code><br>Map-ID <code>${esc(S.store.f)}</code></p>`}
    ${can("edit")?`<label class="f" style="margin-top:10px"><span class="label">Naam van de kelder</span><input id="cname" value="${esc(D.name)}"></label>`:""}</section>
   <section class="panel"><h3>Opzoeken op internet</h3>${IN_ARTIFACT?`<p style="margin:0">In deze demo zoekt Claude de gegevens op met zijn eigen kennis (zonder live prijzen). Je wordt bij de eerste opzoeking om toestemming gevraagd.</p>`:HOSTED?`<p style="margin:0 0 8px">De app gebruikt Claude met webzoeken om een fiche aan te vullen vanuit de beschrijving of een foto van het etiket, inclusief een actuele prijsindicatie.</p>
      ${can("lookup")?`<label class="f"><span class="label">Anthropic API-sleutel (enkel op dit toestel bewaard)</span><input id="aikey" type="password" value="${ls.get("wk.aikey")?"••••••••":""}" placeholder="sk-ant-…"></label><div class="row" style="margin-top:8px"><button class="btn sm" id="savekey">Bewaren</button><button class="btn ghost sm" id="delkey">Wissen</button></div><p class="muted" style="font-size:12px;margin:6px 0 0">Zonder sleutel blijven de links naar Vivino, Wine-Searcher en Google beschikbaar.</p>`:`<p class="muted">Alleen beheerders en bewerkers zoeken op.</p>`}`:`<p style="margin:0">Beschikbaar na koppeling met Microsoft 365. Links naar Vivino, Wine-Searcher en Google werken altijd.</p>`}</section>
   <section class="panel"><h3>Import en export</h3><div class="hint">Volledige kopie (JSON) of wijnlijst (CSV, bruikbaar in Excel)</div>
    <div class="row"><button class="btn sm" id="exJson">${icon("dl")}Export JSON</button><button class="btn sm" id="exCsv">${icon("dl")}Wijnlijst CSV</button>${can("import")?`<label class="btn sm">${icon("ul")}Import CSV<input type="file" id="imCsv" accept=".csv,text/csv" hidden></label>`:""}${can("users")?`<label class="btn sm">${icon("ul")}Herstel JSON<input type="file" id="imJson" accept=".json,application/json" hidden></label>`:""}</div>
    <p class="muted" style="font-size:12px;margin:8px 0 0">CSV-import herkent kolommen zoals land, regio, appellatie, type, domein, naam, jaar, druif, karakter, gastronomie, bewaren, aantal, aanschafwaarde, internetwaarde (scheidingsteken ; of ,).</p></section>
  </div>`;
  $("#asRole")?.addEventListener("change",e=>{S.me.role=e.target.value;render();toast("Je bekijkt de app nu als "+ROLES[S.me.role]);});
  $("#logout")?.addEventListener("click",()=>PCA.logoutRedirect());
  $("#cname")?.addEventListener("change",e=>mutate(D=>{D.name=e.target.value.trim()||"Mijn wijnkelder";},"Naam bewaard",{touch:["$name"]}));
  $$("select[data-u]").forEach(s=>s.onchange=()=>changeRole(+s.dataset.u,s.value));
  $$("button[data-del]").forEach(b=>b.onclick=()=>{const u=D.users[+b.dataset.del];confirmDialog(u.email+" verwijderen?","Deze persoon verliest de toegang tot de kelder en de gedeelde map op OneDrive.","Verwijderen",()=>removeUser(u.email));});
  $("#fu")?.addEventListener("submit",e=>{e.preventDefault();inviteUser($("#u_email").value.trim().toLowerCase(),$("#u_role").value,$("#u_name").value.trim(),e.submitter);});
  $("#savekey")?.addEventListener("click",()=>{const v=$("#aikey").value.trim();if(v&&!v.startsWith("•")){ls.set("wk.aikey",v);toast("Sleutel bewaard op dit toestel");}});
  $("#delkey")?.addEventListener("click",()=>{ls.del("wk.aikey");$("#aikey").value="";toast("Sleutel gewist");});
  $("#exJson").onclick=()=>saveFile(`wijnkelder-${today()}.json`,JSON.stringify(S.data,null,1),"application/json");
  $("#exCsv").onclick=()=>{const cols=["domain","name","vintage","color","country","region","appellation","grapes","character","gastronomy","storage","drinkFrom","drinkUntil","stock","purchaseValue","webValue","location","remark",...XF.map(f=>f.key)];saveFile("wijnkelder-wijnen.csv",toCsv([cols,...S.data.wines.map(w=>cols.map(c=>c==="color"?TYPE_SHORT[w.color]:w[c]??""))]),"text/csv");};
  $("#imCsv")?.addEventListener("change",e=>importCsv(e.target.files[0]));
  $("#imJson")?.addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{const j=JSON.parse(await f.text());if(!Array.isArray(j.wines))throw new Error("geen wijnkelderbestand");confirmDialog("Kelder vervangen door deze kopie?",`${j.wines.length} wijnen uit ${f.name}. De huidige inhoud wordt overschreven (de back-up van vandaag blijft bestaan).`,"Vervangen",()=>mutate(D=>{const users=D.users;Object.keys(D).forEach(k=>delete D[k]);Object.assign(D,j);if(!D.users?.length)D.users=users;},"Kelder hersteld",{replaceAll:true}));}catch(err){toast("Kan dit bestand niet lezen: "+err.message,"err");}});
}
async function inviteUser(email,role,name,btn){
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){toast("Geef een geldig e-mailadres in","err");return;}
  if(findUser(email)){toast("Deze persoon staat al in de lijst","err");return;}
  if(btn){btn.disabled=true;btn.innerHTML='<span class="spin"></span>';}
  const notes=[];
  if(S.mode==="onedrive"){
    const internal=(CFG.internalDomains||[]).some(d=>email.endsWith("@"+d.toLowerCase()));
    if(!internal&&CFG.inviteGuests!==false){try{await SAFE.inviteGuest(email,name,location.origin+location.pathname);notes.push("gastuitnodiging verstuurd");}catch(e){notes.push("gastuitnodiging niet gelukt ("+e.message+"), nodig uit via Entra");}}
    try{await S.store.share(email,role);notes.push("map gedeeld");}catch(e){notes.push("delen van de map mislukt ("+e.message+")");}
  }
  await mutate(D=>{if(!D.users.some(u=>u.email===email))D.users.push({email,role,name,added:today()});},email+" toegevoegd"+(notes.length?": "+notes.join(", "):""));
  if(btn){btn.disabled=false;btn.textContent="Uitnodigen";}
}
async function changeRole(i,role){const u=S.data.users[i];if(!u)return;
  if(u.email===S.me.email&&role!=="admin"&&S.data.users.filter(x=>x.role==="admin").length<2){toast("Er moet minstens één beheerder blijven","err");render();return;}
  if(S.mode==="onedrive"&&(role==="viewer")!==(u.role==="viewer")){try{await S.store.setShareRole(u.email,role);}catch(e){toast("OneDrive-recht niet aangepast: "+e.message,"err");}}
  const email=u.email;await mutate(D=>{const x=D.users.find(y=>y.email===email);if(x)x.role=role;},"Rol aangepast",{touch:[email]});}
async function removeUser(email){
  if(S.mode==="onedrive"){try{await S.store.unshare(email);}catch(e){toast("Toegang tot de map niet ingetrokken: "+e.message,"err");}}
  await mutate(D=>{D.users=D.users.filter(u=>u.email!==email);},"Gebruiker verwijderd",{remove:[email]});}
async function importCsv(file){if(!file)return;const txt=(await file.text()).replace(/^﻿/,"");const sep=(txt.split("\n")[0].match(/;/g)||[]).length>=(txt.split("\n")[0].match(/,/g)||[]).length?";":",";
  const rows=parseCsv(txt,sep);if(rows.length<2){toast("Het bestand bevat geen wijnen","err");return;}
  const H={land:"country",country:"country",regio:"region",region:"region",appellatie:"appellation","herkomst appellatie":"appellation",appellation:"appellation",herkomst:"appellation",type:"color",kleur:"color",color:"color",domein:"domain",domain:"domain",producent:"domain",naam:"name",name:"name",wijn:"name",jaar:"vintage",jaargang:"vintage",vintage:"vintage",druif:"grapes",druiven:"grapes",grapes:"grapes",karakter:"character",character:"character",gastronomie:"gastronomy",gastronomy:"gastronomy",bewaren:"storage",storage:"storage",vanaf:"drinkFrom",drinkfrom:"drinkFrom",tot:"drinkUntil",drinkuntil:"drinkUntil",aantal:"stock",stock:"stock",voorraad:"stock",aanschafwaarde:"purchaseValue",purchasevalue:"purchaseValue",aankoopprijs:"purchaseValue",internetwaarde:"webValue","waarde op internet":"webValue",webvalue:"webValue",plaats:"location",location:"location",notitie:"remark",remark:"remark"};
  XF.forEach(f=>{H[norm(f.key)]=f.key;H[norm(f.label)]=f.key;});const idx=rows[0].map(h=>H[norm(h)]||null);const tmap={rood:"rood",red:"rood",wit:"wit",white:"wit",rose:"rose",champagne:"champagne",mousserend:"champagne",sparkling:"champagne",zoet:"dessert",dessert:"dessert",versterkt:"versterkt",port:"versterkt"};
  const add=rows.slice(1).filter(r=>r.some(c=>c.trim())).map(r=>{const w={id:uid(),created:today(),color:"rood",stock:0};idx.forEach((k,i)=>{if(!k)return;let v=(r[i]||"").trim();if(["vintage","drinkFrom","drinkUntil","purchaseValue","webValue"].includes(k))v=num(v);if(k==="stock")v=parseInt(v)||0;if(k==="color")v=tmap[norm(v)]||"rood";w[k]=v;});return w;}).filter(w=>w.domain||w.name);
  if(!add.length){toast("Geen herkenbare kolommen gevonden (minstens domein of naam)","err");return;}
  confirmDialog(`${add.length} wijnen importeren?`,"Ze worden toegevoegd aan de kelder; de aantallen worden als beginvoorraad in het logboek gezet.","Importeren",()=>mutate(D=>{add.forEach(w=>{if(D.wines.some(x=>x.id===w.id))return;D.wines.push(w);if(w.stock>0)D.moves.push({id:"imp-"+w.id,wineId:w.id,kind:"purchase",qty:w.stock,price:w.purchaseValue,date:today(),by:S.me.name||S.me.email,note:"Import"});});},add.length+" wijnen geïmporteerd"));}
function parseCsv(t,sep){const out=[];let row=[],cur="",q=false;for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c==='"'){if(t[i+1]==='"'){cur+='"';i++;}else q=false;}else cur+=c;}else if(c==='"')q=true;else if(c===sep){row.push(cur);cur="";}else if(c==="\n"){row.push(cur.replace(/\r$/,""));out.push(row);row=[];cur="";}else cur+=c;}if(cur||row.length){row.push(cur);out.push(row);}return out;}

/* ---------- Tooltip ---------- */
document.addEventListener("pointermove",e=>{const t=e.target.closest?.("[data-tip]");const tip=$("#tip");if(!t){tip.hidden=true;return;}tip.textContent=t.dataset.tip;tip.hidden=false;const x=Math.min(e.clientX+14,innerWidth-tip.offsetWidth-8),y=e.clientY+16+tip.offsetHeight>innerHeight?e.clientY-tip.offsetHeight-10:e.clientY+16;tip.style.left=x+"px";tip.style.top=y+"px";});

/* ================= Voorbeelddata (demo) ================= */
function seed(){
  const W=[
   ["Château Musar","Rouge",2016,"rood","Libanon","Bekaa","Bekaa Valley","Cinsault, Cabernet Sauvignon, Carignan","Rijp rood fruit, leder, kruidnagel en een licht oxidatieve toets. Levendige zuren, fijne tannines.","Lamsbout met rozemarijn, gestoofde eend, oude Comté","Op dronk 2024–2040; bewaren bij 13 °C",2024,2040,6,45,55],
   ["Domaine Huet","Le Haut-Lieu Sec",2020,"wit","Frankrijk","Loire","Vouvray AOC","Chenin blanc","Kweepeer, honing en krijt; strak droog met een lange, zilte afdronk.","Rivierkreeft, geitenkaas, kip met room en morieljes","Op dronk 2023–2035; bewaren bij 11 °C",2023,2035,4,32,38],
   ["Château Cantemerle","Grand Cru Classé",2015,"rood","Frankrijk","Bordeaux","Haut-Médoc AOC","Cabernet Sauvignon 60%, Merlot 30%, Cabernet franc 6%, Petit verdot 4%","Cassis, ceder en grafiet; elegante, middelzware structuur.","Entrecote op de grill, lamsfilet, paddenstoelenrisotto","Op dronk 2023–2035; decanteren 1 uur",2023,2035,8,35,42],
   ["Bollinger","Special Cuvée",null,"champagne","Frankrijk","Champagne","Champagne AOC","Pinot noir 60%, Chardonnay 25%, Pinot meunier 15%","Gerijpte appel, brioche en walnoot; romige, fijne mousse.","Aperitief, oesters, zeetong, gevogelte","Direct drinken of 3–5 jaar bewaren; schenken bij 8–10 °C",2024,2029,6,55,62],
   ["G.D. Vajra","Barolo Albe",2018,"rood","Italië","Piemonte","Barolo DOCG","Nebbiolo","Rozen, teer, kers en sinaasappelschil; stevige maar verfijnde tannines.","Vitello tonnato, truffelrisotto, gestoofd rundvlees in barolo","Op dronk 2025–2038",2025,2038,5,40,48],
   ["Fèlsina","Rancia Chianti Classico Riserva",2019,"rood","Italië","Toscana","Chianti Classico DOCG","Sangiovese","Zure kers, viooltjes, gedroogde kruiden; sappig en strak.","Bistecca alla fiorentina, pasta met wildragout, pecorino","Op dronk 2024–2034",2024,2034,6,26,32],
   ["La Rioja Alta","Viña Ardanza Reserva",2016,"rood","Spanje","Rioja","DOCa Rioja","Tempranillo 80%, Garnacha 20%","Gedroogde kers, vanille, tabak; zacht en harmonieus door lange houtlagering.","Gebraden speenvarken, lamskoteletten, manchego","Op dronk 2022–2032",2022,2032,6,27,30],
   ["Niepoort","Redoma Branco",2021,"wit","Portugal","Douro","Douro DOC","Rabigato, Códega, Donzelinho, Viosinho","Citrus, witte bloemen en mineraliteit; fris met lichte houttoets.","Gegrilde zeebaars, bacalhau, gevogelte","Op dronk 2023–2030",2023,2030,3,24,28],
   ["Dr. Loosen","Wehlener Sonnenuhr Riesling Kabinett",2021,"wit","Duitsland","Mosel","Mosel","Riesling","Groene appel, perzik en leisteen; lichtzoet met sprankelende zuren.","Thaise curry, sushi, gerookte forel","Op dronk 2023–2036",2023,2036,6,19,22],
   ["Domaine Tempier","Bandol Rosé",2023,"rose","Frankrijk","Provence","Bandol AOC","Mourvèdre, Grenache, Cinsault","Rode bes, perzik en garrigue; vol voor een rosé, met structuur.","Bouillabaisse, gegrilde gamba's, salade niçoise","Op dronk 2024–2027",2024,2027,4,34,40],
   ["Château Coutet","Premier Cru Classé",2011,"dessert","Frankrijk","Bordeaux","Barsac AOC","Sémillon 75%, Sauvignon blanc 23%, Muscadelle 2%","Gekonfijte abrikoos, saffraan en honing; zoet maar fris.","Foie gras, blauwe kaas, tarte tatin","Op dronk 2020–2045",2020,2045,2,38,45],
   ["Taylor's","20 Year Old Tawny",null,"versterkt","Portugal","Douro","Porto DOC","Touriga Nacional, Touriga Franca, Tinta Roriz","Noten, karamel, gedroogde vijg en sinaasappel.","Crème brûlée, oude Gouda, pecannotentaart","Klaar om te drinken; na openen 1–2 maanden houdbaar",null,null,2,48,55],
   ["Cloudy Bay","Sauvignon Blanc",2023,"wit","Nieuw-Zeeland","Marlborough","Marlborough","Sauvignon blanc","Passievrucht, limoen en vers gras; uitbundig en fris.","Geitenkaas, asperges, ceviche","Jong drinken, 2024–2026",2024,2026,0,26,30],
   ["Domaine du Chenoy","Brut",2021,"champagne","België","Wallonië","Crémant de Wallonie","Chardonnay, Pinot noir","Fijne bubbel, citrus en toast; droog en verfrissend.","Aperitief, garnaalkroketten, sint-jakobsvruchten","Op dronk 2023–2027",2023,2027,6,21,25],
   ["Catena Zapata","Malbec Argentino",2019,"rood","Argentinië","Mendoza","Valle de Uco","Malbec","Zwarte bes, viooltjes en cacao; krachtig en fluwelig.","Asado, gegrilde ribeye, empanadas","Op dronk 2024–2035",2024,2035,3,52,60],
   ["Kanonkop","Pinotage",2019,"rood","Zuid-Afrika","Stellenbosch","Stellenbosch WO","Pinotage","Pruim, moerbei en rook; rijp en stevig.","Wildstoofpot, bobotie, gerookte ribben","Op dronk 2023–2032",2023,2032,4,30,35],
   ["Ridge","Lytton Springs",2019,"rood","Verenigde Staten","Sonoma","Dry Creek Valley","Zinfandel 72%, Petite sirah 20%, Carignane 8%","Bramen, peper en zoethout; rijk maar evenwichtig.","Barbecue, lamsburger, chili con carne","Op dronk 2024–2034",2024,2034,2,50,58],
   ["Château de Beaucastel","Châteauneuf-du-Pape",2012,"rood","Frankrijk","Rhône","Châteauneuf-du-Pape AOC","Mourvèdre, Grenache, Counoise, Syrah en andere","Gedroogde kruiden, leer, zwarte olijf en rijp fruit.","Hertenkalf, lamsstoofpot met olijven, truffel","Op dronk 2020–2026",2020,2026,3,62,85]
  ];
  let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
  const D=emptyData();D.name="Voorbeeldkelder";D.users=[{email:"demo@voorbeeld.be",role:"admin",name:"Demo-gebruiker"},{email:"sofie.voorbeeld@gmail.com",role:"drinker",name:"Sofie (voorbeeld)"},{email:"marc@voorbeeld.be",role:"viewer",name:"Marc (voorbeeld)"}];
  const people=["Demo-gebruiker","Sofie (voorbeeld)"];const comments=["Mooi op dronk, lange afdronk.","Nog wat gesloten, beter over een paar jaar.","Prachtig bij het eten, iedereen enthousiast.","Iets vermoeid, niet meer bewaren.","Fris en precies, een aanrader.","Evenwichtig, fijne tannines."];
  W.forEach((r,i)=>{const id="w"+(i+1);const [domain,name,vintage,color,country,region,appellation,grapes,character,gastronomy,storage,drinkFrom,drinkUntil,stock,pv,wv]=r;
    D.wines.push({id,domain,name,vintage,color,country,region,appellation,grapes,character,gastronomy,storage,drinkFrom,drinkUntil,stock,purchaseValue:pv,webValue:wv,location:"Rek "+"ABCD"[i%4]+", vak "+(1+i%6),created:"2023-01-01"});
    const drunk=stock===0?6:Math.floor(rnd()*6);const buyY=2022+Math.floor(rnd()*3);const buyM=1+Math.floor(rnd()*11);
    D.moves.push({id:"p"+id,wineId:id,kind:"purchase",qty:stock+drunk,price:pv,date:`${buyY}-${String(buyM).padStart(2,"0")}-${String(3+Math.floor(rnd()*24)).padStart(2,"0")}`,supplier:["Wijnhandel Vandenbussche","Vinoteca Brugge","Rechtstreeks bij het domein","Wijnbeurs"][Math.floor(rnd()*4)],by:"Demo-gebruiker"});
    for(let j=0;j<drunk;j++){const y=Math.max(buyY,2023)+Math.floor(rnd()*(YEAR-Math.max(buyY,2023)+1));const mo=y===YEAR?1+Math.floor(rnd()*9):1+Math.floor(rnd()*12);const date=`${y}-${String(mo).padStart(2,"0")}-${String(1+Math.floor(rnd()*27)).padStart(2,"0")}`;const mid="c"+id+"_"+j;
      D.moves.push({id:mid,wineId:id,kind:"consume",qty:1,date,note:rnd()>.6?["Zondagse lunch","Verjaardag","Etentje met vrienden","Kerstmis"][Math.floor(rnd()*4)]:"",by:people[Math.floor(rnd()*2)]});
      if(rnd()>.35)D.notes.push({id:"n"+mid,wineId:id,moveId:mid,date,rating:3+Math.floor(rnd()*3),comment:comments[Math.floor(rnd()*comments.length)],by:people[Math.floor(rnd()*2)]});}
  });
  return D;
}

boot();
