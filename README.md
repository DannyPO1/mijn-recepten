# Mijn Recepten — v1.7.8

## Wijzigingen in deze versie
- JavaScript en CSS worden met een expliciet versienummer geladen om verouderde browsercache te omzeilen.
- De service-worker-URL en cache zijn bijgewerkt naar v1.7.8, zodat Safari een nieuwe worker kan detecteren.
- De versieweergave is overal gelijkgetrokken naar v1.7.8.
- De bestaande IndexedDB-opslag met recepten, weekmenu en boodschappenlijst wordt niet aangepast.

## Belangrijk
Deze update wist of migreert geen lokale recepten. Bewaar je JSON-back-up als extra voorzorg.


Extra correctie: iconbestanden blijven in het ZIP-pakket aanwezig; de GitHub Actions-workflow moet de map `icons/` ook naar de publicatiemap kopiëren.


Versie 1.7.8: visuele homepage-tegels met grote foto’s, iconen op receptkaarten en categoriefilters verwijderd, en een fotobanner toegevoegd aan Boodschappen. Gegevensstructuur en functies zijn behouden.


Versie 1.7.8: je kunt nu per recept een eigen foto kiezen. De foto wordt verkleind opgeslagen als onderdeel van het recept in de lokale IndexedDB-opslag en gaat mee in de JSON-back-up. Zonder eigen foto blijft de automatische foto op basis van gerechtnaam/categorie actief.

## Fotobibliotheek
- Standaardgerechtfoto's staan in `images/recipes/` als WebP-bestanden.
- De foto's zijn geoptimaliseerd voor de mobiele app en worden lokaal vanaf dezelfde GitHub Pages-site geladen.
- Voor de eigen fotobibliotheek geldt: zorg dat de workflow de map `images/` meeneemt bij het uitpakken en publiceren.
- Persoonlijke foto's die je in de app kiest, blijven onderdeel van het recept in de lokale opslag en JSON-back-up.
