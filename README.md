# Mijn Recepten — v1.7.0

## Wijzigingen in deze versie
- JavaScript en CSS worden met een expliciet versienummer geladen om verouderde browsercache te omzeilen.
- De service-worker-URL en cache zijn bijgewerkt naar v1.7.0, zodat Safari een nieuwe worker kan detecteren.
- De versieweergave is overal gelijkgetrokken naar v1.7.0.
- De bestaande IndexedDB-opslag met recepten, weekmenu en boodschappenlijst wordt niet aangepast.

## Belangrijk
Deze update wist of migreert geen lokale recepten. Bewaar je JSON-back-up als extra voorzorg.


Extra correctie: iconbestanden blijven in het ZIP-pakket aanwezig; de GitHub Actions-workflow moet de map `icons/` ook naar de publicatiemap kopiëren.
