# Mijn Recepten — v1.9.0 (test)

## Nieuwe functies
- Recepten hebben nu afzonderlijke velden voor maaltijdmoment, keuken en tags.
- Recepten kunnen als kindvriendelijk worden gemarkeerd; dit is zichtbaar op receptkaarten.
- Foto's kunnen uit de bestaande fotobibliotheek of uit Foto's op de iPhone worden gekozen.
- Persoonlijke foto's (`photoDataUrl`) en bibliotheekfoto's (`photoPath`) blijven behouden bij bewerken, back-up en import.
- JSON-back-ups gebruiken schema versie 2. Import blijft compatibel met schema versie 1 en oudere back-ups.
- Bestaande recepten worden bij het openen aangevuld met de nieuwe velden zonder bestaande ingrediënten, bereidingsstappen, weekmenu's, boodschappen of foto's te verwijderen.
- Deze testbuild gebruikt een aparte IndexedDB-database (`mijn-recepten-test-db`) en eigen service-worker-cache (`mijn-recepten-test-v1.9.0`).

## Back-up
Maak voor het testen eerst een JSON-back-up van de bestaande gegevens. Bewaar deze in iCloud Drive. De importfunctie kan oudere versie-1-back-ups lezen.

## Publiceren
Upload de inhoud van deze ZIP naar de testbranch. De testworkflow moet de bestanden `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `sw.js`, `icons/` en `images/` publiceren.
