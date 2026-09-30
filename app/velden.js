/* =====================================================================
   velden.js — extra velden op de wijnfiche
   ---------------------------------------------------------------------
   Een veld toevoegen = hier één regel bijzetten. Het veld verschijnt dan
   automatisch in het formulier, op de fiche, in de zoekfunctie en in de
   CSV-export en -import. Bestaande wijnen krijgen het veld leeg: er wordt
   niets aan de bestaande gegevens veranderd. Waarden vullen de gebruikers
   zelf in (of via "Zoek op internet" als lookup: true).

   Eigenschappen:
     key      technische naam: letters/cijfers, begint met een letter, uniek,
              nooit wijzigen of hergebruiken zodra er gegevens voor bestaan
     label    naam op het scherm
     type     "text" | "textarea" | "number" | "select" | "date"
     options  keuzelijst (alleen bij type "select")
     section  "wijn" | "herkomst" | "beschrijving" | "kelder"
     lookup   true = mee laten invullen door "Zoek op internet"
     hint     korte uitleg voor het opzoeken (optioneel)

   Een veld schrappen uit deze lijst verbergt het enkel; de ingevulde
   waarden blijven in de gegevens bewaard.
   ===================================================================== */
window.WK_EXTRA_FIELDS = [
  { key: "format", label: "Flesformaat", type: "select", options: ["37,5 cl", "50 cl", "75 cl", "150 cl (magnum)", "300 cl (dubbele magnum)"], section: "kelder" },
  { key: "alcohol", label: "Alcohol (%)", type: "number", section: "beschrijving", lookup: true, hint: "alcoholpercentage als getal, bv. 13.5" }
];
