// Wijnkelder — instellingen. Vul dit in na de app-registratie (zie LEESMIJ.md).
// Laat clientId leeg om de app in demo-modus te openen (gegevens enkel in de browser).
window.WK_CONFIG = {
  accountType: "persoonlijk", // "persoonlijk" = persoonlijke Microsoft-accounts en persoonlijke OneDrive
                              // "organisatie" = een Microsoft 365-omgeving (vul dan ook tenantId in)
  clientId: "e2f6ce4d-d891-418a-9c71-c64ab24640c1", // Toepassings-ID (client) van de app-registratie
  tenantId: "",               // enkel bij "organisatie"
  driveId: "051B42333EA0F4F6",
  folderId: "51B42333EA0F4F6!s7f079ae6c9ff4006b52c4e2c11b507e9",
  folderName: "Wijnkelder",
  internalDomains: [],        // enkel bij "organisatie": adressen die geen gastuitnodiging krijgen
  inviteGuests: false,        // enkel bij "organisatie": externe adressen als gast uitnodigen
  aiModel: "claude-sonnet-5-5"   // model voor "Zoek op internet"
};
