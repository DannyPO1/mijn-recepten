# Mijn Recepten — versie 1.2.2

**Releasedatum:** 28 oktober 2026

## Wijzigingen in deze versie

- Bij het openen van de app wordt actief gecontroleerd of er een nieuwe service-worker beschikbaar is.
- Als een nieuwe service-worker klaarstaat, wordt deze geactiveerd en wordt de app automatisch opnieuw geladen.
- Bij terugkeer naar de app wordt opnieuw gecontroleerd op updates, zodat de snelkoppeling op het iPhone-beginscherm sneller de nieuwste versie ophaalt.
- De service worker haalt de appbestanden opnieuw op bij installatie van een nieuwe cacheversie en probeert de actuele startpagina via het netwerk te laden. Bij offlinegebruik blijft de gecachte app beschikbaar.
- Recepten, weekmenu en boodschappen blijven in lokale IndexedDB-opslag staan; de update verwijdert die gegevens niet.

## Recepten importeren vanuit ChatGPT

Op **Back-up & herstel** kun je een JSON-bestand met recepten importeren. Je kunt alleen nieuwe recepten toevoegen of bestaande recepten met dezelfde naam bijwerken. Deze import verandert het weekmenu en de boodschappenlijst niet.

## Opslag en back-up

Recepten, weekmenu en boodschappen worden lokaal in de browser opgeslagen. Deze gegevens synchroniseren niet automatisch met iCloud. Maak regelmatig een back-up en bewaar het JSON-bestand op een veilige plek, bijvoorbeeld in iCloud Drive.
