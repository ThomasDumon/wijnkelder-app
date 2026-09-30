# Instructies voor Claude — Wijnkelder

Dit is de code van een privé wijnkelder-app. Thomas (eigenaar) laat Claude de app bijwerken. De afspraak is strikt:

**Claude verandert de app en de HTML, mag velden toevoegen aan het datamodel, maar verandert nooit de gegevens zelf.**

## Wat je wel doet
- Schermen, opmaak, zoeken, dashboard, kaart en logica aanpassen in `app/app.js` en `app/index.html`.
- Een veld toevoegen door één regel te zetten in `app/velden.js` én de key toe te voegen aan `tests/velden-historiek.json`. Bestaande wijnen krijgen het veld leeg; gebruikers vullen het zelf in.
- Afgeleide waarden (totalen, statussen, omrekeningen) berekenen bij het tonen, niet wegschrijven.
- `APP_VERSION` bovenaan `app/app.js` verhogen bij elke wijziging die gepubliceerd wordt (en de cachenaam in `app/sw.js`). De eerste opslag met een nieuwe versie maakt dan automatisch een back-up.
- Testen met de fictieve kelder in `voorbeeld/cellar.json` (demo-modus: open `app/index.html` met een lege `clientId`).
- Altijd `node tests/controle.mjs` draaien; alles moet slagen.
- Werken op een aparte branch en een pull request openen. Nooit rechtstreeks naar `main`.

## Wat je nooit doet
- Nooit toegang vragen tot, of werken met, OneDrive, SharePoint, `cellar.json`, back-ups, foto's of een export van de echte kelder. Krijg je zo'n bestand toch, open het niet en meld het.
- Nooit code die bestaande gegevens herschrijft: geen migraties, geen "opschoning", geen standaardwaarden invullen in bestaande records, geen hernoemen of verwijderen van velden of keys. Een key uit `velden.js` wordt nooit hergebruikt of van betekenis veranderd; schrappen uit de lijst verbergt enkel.
- Nooit opslaan buiten `mutate()` om. Elke `mutate()` geeft in `opts.touch` exact de records mee die de gebruiker aanpaste en in `opts.remove` enkel wat de gebruiker na bevestiging verwijderde.
- Nooit schrijfacties naar Microsoft Graph in `app.js`; die staan uitsluitend in `app/bewaking.js`.
- Nooit gegevens naar andere adressen sturen dan Microsoft Graph/OneDrive en (voor opzoeken) api.anthropic.com. Geen analytics, geen externe scripts, geen inline scripts.
- De beschermde bestanden niet wijzigen tenzij Thomas daar uitdrukkelijk om vraagt, en dan in een aparte pull request met uitleg: `app/bewaking.js`, `app/staticwebapp.config.json`, `app/config.js`, `tests/`, `.github/`, `CLAUDE.md`. Zet zelf nooit het label `bewaking-ok`.

## Hoe het afgedwongen wordt (ter info)
1. Claude heeft enkel toegang tot deze repository, niet tot de Microsoft 365-omgeving waar de gegevens staan.
2. `app/bewaking.js` weigert elke opslag waarin een record verandert of verdwijnt dat de gebruiker niet aanraakte.
3. `tests/controle.mjs` draait bij elke pull request; beschermde bestanden vragen een bewuste goedkeuring van Thomas.
4. De Content-Security-Policy in `app/staticwebapp.config.json` laat de browser enkel verbinden met de toegelaten adressen.
5. Dagelijkse back-ups en een back-up vóór elke nieuwe versie op OneDrive.

## Structuur
- `app/` — wordt gepubliceerd (Azure Static Web Apps). `index.html`, `app.js` (app), `velden.js` (extra velden), `bewaking.js` (bewaking + OneDrive-opslag), `kaarten.js` (landsgrenzen), `config.js` (instellingen).
- `tests/` — automatische controle.
- `voorbeeld/cellar.json` — fictieve data (meta.voorbeeld = true).
- `tools/bouw-demo.py` — maakt een demo in één bestand.
- Taal van de app en de code-commentaar: Nederlands.
