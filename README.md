# Mijn Recepten — v1.7.2

## Wijzigingen in deze versie
- JavaScript en CSS worden met een expliciet versienummer geladen om verouderde browsercache te omzeilen.
- De service-worker-URL en cache zijn bijgewerkt naar v1.7.2, zodat Safari een nieuwe worker kan detecteren.
- De versieweergave is overal gelijkgetrokken naar v1.7.2.
- De bestaande IndexedDB-opslag met recepten, weekmenu en boodschappenlijst wordt niet aangepast.

## Belangrijk
Deze update wist of migreert geen lokale recepten. Bewaar je JSON-back-up als extra voorzorg.


Extra correctie: iconbestanden blijven in het ZIP-pakket aanwezig; de GitHub Actions-workflow moet de map `icons/` ook naar de publicatiemap kopiëren.


Versie 1.7.2: visuele homepage-tegels met grote foto’s, iconen op receptkaarten en categoriefilters verwijderd, en een fotobanner toegevoegd aan Boodschappen. Gegevensstructuur en functies zijn behouden.
