# Mijn Recepten — v1.5.2

## Wijzigingen in deze versie
- Structurele cache-aanpassing: de service worker haalt HTML, JavaScript, CSS en andere lokale bestanden online eerst op van het netwerk.
- De cache wordt bijgewerkt na een succesvolle netwerkrespons en wordt alleen gebruikt als terugval bij verbindingsproblemen.
- De service-worker-URL bevat het versienummer, zodat de browser de nieuwe worker expliciet registreert.
- De cache is opnieuw versienummerd; bij activatie worden oude caches van Mijn Recepten verwijderd.
- De IndexedDB-opslag met recepten, weekmenu en boodschappenlijst blijft onaangeroerd.
