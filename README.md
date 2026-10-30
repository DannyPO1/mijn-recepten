# Mijn Recepten — v1.9.3 (productie)

## Wijzigingen in v1.9.3
- Maaltijdmoment staat uitsluitend in de vaste tegelbadge en wordt niet nogmaals als tag getoond.
- Keuken en Kindvriendelijk blijven zichtbaar als afzonderlijke kenmerken.
- Kindergerecht wordt niet langer automatisch als tag toegevoegd; bestaande Kindergerecht-tags worden gemigreerd naar het vinkje Kindvriendelijk.
- Aanvullende tags zijn optioneel en kunnen volledig worden verwijderd door het veld leeg te maken.
- Productiedatabase blijft `mijn-recepten-db`, zodat bestaande productiegegevens behouden blijven.
- Productiecache is vernieuwd naar `mijn-recepten-v1.9.3`. Testcaches (`mijn-recepten-test-*`) worden niet verwijderd.

Maak voor publicatie altijd eerst een JSON-back-up. Deze ZIP is bedoeld voor de productiebranch `main`.
