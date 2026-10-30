# Mijn Recepten — v1.9.5 (productie)

## Wijzigingen in v1.9.5
- Receptentegels hebben een consistente flexibele kolomindeling.
- Titels krijgen een vaste ruimte van maximaal drie regels.
- Omschrijvingen krijgen een vaste ruimte van maximaal twee regels.
- Bereidingstijd en porties worden consequent uitgelijnd; labels staan onderaan.
- Productiedatabase blijft `mijn-recepten-db`.
- Productiecache is vernieuwd naar `mijn-recepten-v1.9.5`.


## v1.9.5
- Houdt het iPhone-scherm actief zolang een receptdetail geopend is via de Screen Wake Lock API.
- Geeft de Wake Lock vrij zodra het recept wordt gesloten en vraagt deze opnieuw aan wanneer de gebruiker terugkeert naar de app.
- Bij browsers of iOS-versies zonder Wake Lock-ondersteuning blijft de app normaal werken.
