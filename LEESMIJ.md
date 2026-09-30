# Wijnkelder — installatie, beveiliging en onderhoud

Eén app die je zowel als webpagina gebruikt als op je gsm of tablet installeert. De gegevens staan op OneDrive (Microsoft 365). Aanmelden gebeurt met Microsoft; mensen met een Gmail-adres worden als gast uitgenodigd.

## Hoe het in elkaar zit

Er zijn twee strikt gescheiden plaatsen:

| | Programmacode | Gegevens |
|---|---|---|
| Wat | De app: schermen, logica, lijst van velden | Wijnen, aankopen, verbruik, notities, foto's, gebruikers |
| Waar | Een GitHub-repository (deze map) | Je OneDrive, map `Wijnkelder` |
| Wie kan erbij | Jij, en Claude als je dat toelaat | Enkel wie jij uitnodigt, na aanmelden bij Microsoft |
| Gepubliceerd via | Azure Static Web Apps (automatisch na jouw goedkeuring) | Niet van toepassing |

Claude kan de app dus bijwerken zonder ooit bij de gegevens te kunnen. Zie het onderdeel **Bijwerken door Claude** verderop.

## Inhoud van de repository

| Pad | Functie |
|---|---|
| `app/index.html`, `app/app.js` | De app |
| `app/velden.js` | Extra velden op de wijnfiche (één regel per veld) |
| `app/bewaking.js` | Gegevensbewaking en alle schrijfacties naar OneDrive (beschermd) |
| `app/kaarten.js` | Landsgrenzen voor de kaart |
| `app/config.js` | Jouw instellingen: app-registratie en OneDrive-map (beschermd) |
| `app/staticwebapp.config.json` | Beveiligingsheaders, o.a. de Content-Security-Policy (beschermd) |
| `app/msal-browser.min.js` | Microsoft-aanmelding (officiële bibliotheek, v2.38.3) |
| `app/manifest.webmanifest`, `app/sw.js`, `app/icon-*.png` | Maken de app installeerbaar en offline te openen |
| `tests/controle.mjs` | Automatische controle bij elke wijziging (beschermd) |
| `voorbeeld/cellar.json` | Fictieve voorbeeldkelder voor ontwikkeling en tests |
| `CLAUDE.md` | De regels die Claude volgt in deze repository |
| `.github/workflows/` | Controle bij elke pull request, publiceren na goedkeuring (beschermd) |

Open je `app/index.html` zonder `clientId` in `config.js`, dan start de app in demo-modus met voorbeeldwijnen.

---

## Stap 1 — App registreren in Microsoft Entra (eenmalig)

1. **entra.microsoft.com** › Identiteit › Toepassingen › **App-registraties** › **Nieuwe registratie**.
2. Naam `Wijnkelder`, accounttype **Alleen accounts in deze organisatiemap**.
3. Omleidings-URI: platform **Single-page application (SPA)**, met het adres van de app (stap 2), bv. `https://wijnkelder.jouwdomein.be/`.
4. Noteer **Toepassings-id (client)** en **Map-id (tenant)**.
5. **API-machtigingen** › Microsoft Graph › **Gedelegeerd**: `User.Read`, `Files.ReadWrite.All`, en `User.Invite.All` als de app gasten mag uitnodigen.
6. **Beheerderstoestemming verlenen**.

## Stap 2 — Repository en publicatie

1. Maak op GitHub een **privé**-repository en zet de inhoud van deze map erin.
2. portal.azure.com › **Static Web Apps** › Maken. Plan *Free*, bron *Other*. Kopieer het **implementatietoken**.
3. In GitHub › Settings › Secrets and variables › Actions: nieuwe secret `AZURE_STATIC_WEB_APPS_API_TOKEN` met dat token.
4. In GitHub › Settings › **Branches** › regel voor `main`:
   - *Require a pull request before merging*
   - *Require status checks to pass* › kies **controle**
   - *Do not allow bypassing the above settings*
5. Maak in GitHub › Issues › Labels het label **`bewaking-ok`** aan.
6. Vanaf nu publiceert elke goedgekeurde wijziging op `main` automatisch naar Azure.
7. Zet het adres van de Static Web App als omleidings-URI in de app-registratie (stap 1.3), met afsluitende `/`.

## Stap 3 — Instellen en kelder aanmaken

1. Vul `clientId` en `tenantId` in `app/config.js` in (via een pull request met label `bewaking-ok`, want het is een beschermd bestand).
2. Open de app, meld je aan, klik **Kelder aanmaken in mijn OneDrive**.
3. Zet de getoonde `driveId` en `folderId` in `app/config.js`. Vanaf dan gebruikt iedereen dezelfde kelder.

## Stap 4 — Gasten met Gmail toelaten

- **Entra** › External Identities › *Instellingen voor externe samenwerking*: uitnodigen door beheerders toegestaan.
- **Entra** › External Identities › *Alle id-providers*: **Eenmalige wachtwoordcode via e-mail** aan (standaard). Of voeg Google toe als id-provider.
- **SharePoint-beheercentrum** › Beleid › *Delen*: OneDrive minstens op **Nieuwe en bestaande gasten**.

## Stap 5 — Gebruikers en rechten

In de app › **Beheer** › *Gebruikers en rechten*. De app nodigt externe adressen uit als gast, deelt de map op OneDrive (leesrecht voor Lezers, schrijfrecht voor de rest) en zet de persoon in de gebruikerslijst.

| Rol | Mag |
|---|---|
| Beheerder | Alles, inclusief gebruikers, herstel van back-ups en instellingen |
| Bewerker | Wijnen toevoegen en wijzigen, aankopen, verbruik, notities, opzoeken, CSV-import |
| Proever | Raadplegen, flessen als gedronken registreren, beoordelingen en commentaar |
| Lezer | Enkel raadplegen |

## Stap 6 — Op gsm of tablet installeren

- **iPhone/iPad**: Safari › Deel › **Zet op beginscherm**.
- **Android**: Chrome › menu › **App installeren**.

---

## Bijwerken door Claude

Je kunt Claude vragen om de app te verbeteren of een veld toe te voegen. De afspraak: **Claude verandert de app en de HTML, mag velden toevoegen, maar verandert nooit de gegevens zelf.** Dat rust niet op vertrouwen alleen; er zijn vijf lagen.

**1. Geen toegang.** Claude krijgt enkel toegang tot de GitHub-repository (bv. via Claude Code met de GitHub-koppeling op die ene repository). De gegevens staan op OneDrive, achter een Microsoft-aanmelding van een uitgenodigde gebruiker. Claude heeft daar geen account en geen sleutel.
> Let op: koppel je in claude.ai een Microsoft 365- of OneDrive-connector, dan kan Claude met jouw rechten wel bij je bestanden. Doe dat niet in gesprekken over de wijnkelder, of gebruik die connector niet.

**2. Gegevensbewaking in de app.** Elke opslag loopt via `app/bewaking.js`. Die vergelijkt de gegevens voor en na, en weigert de opslag als:
- een wijn, logregel, notitie of gebruiker verdwijnt die niemand verwijderde;
- een record verandert dat de gebruiker niet aanraakte (bv. code die bij het laden "stilletjes" iets bijwerkt);
- een ingevuld veld verdwijnt.

Nieuwe wijnen, regels en velden toevoegen mag altijd. Zelfs een foutieve update kan dus geen bestaande gegevens overschrijven; de gebruiker krijgt dan de melding *"De gegevensbewaking hield deze wijziging tegen"*.

**3. Automatische controle en jouw goedkeuring.** Claude werkt op een aparte branch en opent een pull request. Die wordt pas gepubliceerd als jij hem samenvoegt. Bij elke pull request draait `tests/controle.mjs` automatisch en controleert onder meer:
- de bewakingsregels hierboven (met testgevallen);
- dat enkel `bewaking.js` naar OneDrive schrijft;
- dat de app geen gegevens naar andere adressen stuurt;
- dat nieuwe velden geldig zijn en nooit een oude key hergebruiken;
- dat er geen echte kelderbestanden of back-ups in de repository staan.

Wijzigt een pull request een beschermd bestand (`bewaking.js`, `config.js`, `staticwebapp.config.json`, `tests/`, `.github/` of `CLAUDE.md`), dan blijft de controle rood tot jij zelf het label **`bewaking-ok`** zet. Claude doet dat nooit.

**4. Content-Security-Policy.** De browser laat de app enkel verbinden met Microsoft (aanmelden en OneDrive) en, voor opzoeken, api.anthropic.com. Alle andere adressen blokkeert de browser, wat de code ook probeert.

**5. Back-ups.** Elke dag een back-up op OneDrive (`backups/cellar-JJJJ-MM-DD.json`), en bij de eerste opslag met een nieuwe appversie eerst een volledige back-up (`backups/voor-versie-…json`). Lukt die laatste niet, dan wordt er niets opgeslagen.

### Een veld toevoegen

Vraag bijvoorbeeld: *"Voeg een veld 'Wijnmaker' toe onder Wijn"*. Claude zet één regel in `app/velden.js`. Het veld verschijnt automatisch in het formulier, op de fiche, in de zoekfunctie en in de CSV-export. Bestaande wijnen krijgen het veld leeg; jij en je gebruikers vullen het in. Een veld schrappen verbergt het enkel; de ingevulde waarden blijven bewaard. Er zijn al twee voorbeelden: *Flesformaat* en *Alcohol (%)*. Die kun je laten schrappen als je ze niet wilt.

### Wat je Claude dus niet kunt vragen

Alles wat bestaande gegevens herschrijft: bulkwijzigingen, prijzen van alle wijnen bijwerken, velden hernoemen, een oude waarde omzetten. Dat is bewust. Zulke wijzigingen doe je zelf in de app (per wijn), via een CSV-import van nieuwe wijnen, of als beheerder via **Herstel JSON** (waarbij eerst een back-up gemaakt wordt).

---

## Opzoeken op internet (optioneel)

Knop **Zoek op internet** in het wijnformulier vult de fiche aan vanuit wat je al ingaf of een etiketfoto, inclusief een actuele prijsindicatie en de ligging op de kaart. Jij kiest welke voorstellen je overneemt. Dit gebruikt Claude met webzoeken via de Anthropic API: maak een sleutel op **console.anthropic.com** en vul hem in onder **Beheer › Opzoeken op internet** (blijft op dat toestel). Kost enkele eurocent per opzoeking. Het opzoeken stuurt enkel de gegevens van die ene wijn mee, niet de kelder.

## Gegevens op OneDrive

- `Wijnkelder/cellar.json` — alles behalve foto's.
- `Wijnkelder/fotos/` — etiketfoto's, verkleind tot 900 px.
- `Wijnkelder/backups/` — dagelijkse back-ups en back-ups vóór elke nieuwe versie.
- Werken twee mensen tegelijk, dan laadt de app de nieuwste versie, past de wijziging opnieuw toe en controleert ze opnieuw.
- Zonder internet opent de app de laatst geladen versie, alleen om te lezen.

## Hoe de voorraad werkt

- Nieuwe wijn met een aantal = beginvoorraad, als aankoop in het logboek.
- **Aankoop** verhoogt de voorraad en past de aanschafwaarde aan naar het gewogen gemiddelde.
- **Fles gedronken** verlaagt de voorraad, met datum, gelegenheid, beoordeling en commentaar.
- **Proefnotitie**: beoordeling en commentaar zonder de voorraad te wijzigen.
- Aantal aanpassen in *Wijzigen* wordt als correctie gelogd.
