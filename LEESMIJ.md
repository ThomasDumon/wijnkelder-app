# Wijnkelder — installatie, beveiliging en onderhoud

Eén app die je zowel als webpagina gebruikt als op je gsm of tablet installeert. Alles is privé: de app staat op je persoonlijke Azure-abonnement, de gegevens op je persoonlijke OneDrive, en aanmelden gebeurt met een persoonlijk Microsoft-account. Vrienden met enkel een Gmail-adres maken gratis een Microsoft-account aan op dat adres.

## Hoe het in elkaar zit

Er zijn twee strikt gescheiden plaatsen:

| | Programmacode | Gegevens |
|---|---|---|
| Wat | De app: schermen, logica, lijst van velden | Wijnen, aankopen, verbruik, notities, foto's, gebruikers |
| Waar | GitHub-repository, gepubliceerd op je persoonlijke Azure | Je persoonlijke OneDrive, map `Wijnkelder` |
| Wie kan erbij | Iedereen kan lezen (publieke repository); wijzigen enkel via jouw goedkeuring | Enkel wie jij toevoegt, na aanmelden met een Microsoft-account |
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

## Stap 1 — App registreren (eenmalig, in je persoonlijke Azure)

1. Meld je aan op **portal.azure.com** met je **persoonlijke** Microsoft-account (niet je werkaccount).
2. Zoek **Microsoft Entra ID** › links **App-registraties** › **+ Nieuwe registratie**.
3. Naam `Wijnkelder`. Ondersteunde accounttypen: **Alleen persoonlijke Microsoft-accounts**.
4. Omleidings-URI: platform **Single-page application (SPA)**, met het adres van je Static Web App en een `/` op het einde, bv. `https://blue-river-0d08cbb10.5.azurestaticapps.net/`.
5. Klik **Registreren** en noteer de **Toepassings-id (client)**.
6. **API-machtigingen** › *Een machtiging toevoegen* › **Microsoft Graph** › **Gedelegeerde machtigingen**: `Files.ReadWrite.All` (User.Read staat er al). Beheerderstoestemming is bij persoonlijke accounts niet nodig: elke gebruiker keurt bij de eerste aanmelding zelf goed.

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
7. Zet het adres van de Static Web App als omleidings-URI in de app-registratie (stap 1.4), met afsluitende `/`.

## Stap 3 — Instellen en kelder aanmaken

1. Zet in `app/config.js` je `clientId` (via een pull request met het label `bewaking-ok`, want het is een beschermd bestand). `accountType` blijft `"persoonlijk"`.
2. Open de app, meld je aan met je persoonlijke Microsoft-account en klik **Kelder aanmaken in mijn OneDrive**.
3. Zet de getoonde `driveId` en `folderId` in `app/config.js` (weer via een pull request). Vanaf dan gebruikt iedereen dezelfde kelder.

## Stap 4 — Vrienden en familie toegang geven

Iedereen heeft een **persoonlijk Microsoft-account** nodig. Wie enkel een Gmail-adres heeft, maakt er gratis een aan op account.microsoft.com (*Account maken* › *Gebruik in plaats daarvan je e-mailadres* › Gmail-adres). Voeg de persoon in de app toe met **precies dat e-mailadres**.

## Stap 5 — Gebruikers en rechten

In de app › **Beheer** › *Gebruikers en rechten*. De app deelt de map `Wijnkelder` op je OneDrive met dat adres (leesrecht voor Lezers, schrijfrecht voor de rest) en zet de persoon in de gebruikerslijst. Stuur de persoon daarna het adres van de app.

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

**1. Geen toegang.** Claude krijgt enkel toegang tot de GitHub-repository (bv. via de GitHub-koppeling van Claude op die ene repository). De gegevens staan op je persoonlijke OneDrive, achter een Microsoft-aanmelding. Claude heeft daar geen account en geen sleutel.
> Let op: koppel je in claude.ai een OneDrive- of Microsoft-connector met je persoonlijke account, dan kan Claude met jouw rechten wel bij je bestanden. Doe dat niet voor dit account.

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

## Azure-abonnement na 30 dagen

Je persoonlijke Azure-account begint als proefaccount van 30 dagen. Klik vóór het einde in de portal op **Upgraden naar betalen per gebruik**, anders schakelt Microsoft het abonnement uit en gaat de app offline. De Static Web App op het **Free**-plan blijft € 0 kosten. Stel voor de zekerheid een budgetmelding in: portal › **Kostenbeheer + facturering** › **Budgetten** › **Toevoegen**, bv. € 1 per maand met een mail bij 100 %.

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
