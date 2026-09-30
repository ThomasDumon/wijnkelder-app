// Wijnkelder — instellingen. Vul dit in na de app-registratie (zie LEESMIJ.md).
// Laat clientId leeg om de app in demo-modus te openen (gegevens enkel in de browser).
window.WK_CONFIG = {
  clientId: "",            // Toepassings-ID (client) uit Microsoft Entra
  tenantId: "",            // Map-ID (tenant) uit Microsoft Entra
  driveId: "",             // verschijnt na "Kelder aanmaken in mijn OneDrive"
  folderId: "",            // idem
  folderName: "Wijnkelder",
  internalDomains: ["dumon.com"],  // adressen op deze domeinen krijgen geen gastuitnodiging
  inviteGuests: true,      // Gmail- en andere externe adressen automatisch als gast uitnodigen
  aiModel: "claude-sonnet-5-5"     // model voor "Zoek op internet"
};
