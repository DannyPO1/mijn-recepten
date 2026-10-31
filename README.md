# Mijn Recepten — v2.0.1 (productie)

## Wijzigingen in v2.0.1
- Recepten kunnen rechtstreeks via het klembord worden overgedragen aan CalorieTracker.
- De knop ‘Naar CalorieTracker’ kopieert het recept; in CalorieTracker kies je ‘Recept ontvangen’.
- Fotogegevens worden niet meegestuurd; recept, ingrediënten, hoeveelheden en porties wel.
- JSON-download blijft beschikbaar als terugval wanneer iOS klembordschrijven blokkeert.
- Productiedatabase blijft `mijn-recepten-db`.
- Productiecache is vernieuwd naar `mijn-recepten-v2.0.1`.

# Mijn Recepten — v1.9.7 (productie)

## Wijzigingen in v1.9.7
- Receptdetail-acties staan nu in een tweekolomsindeling; de knop ‘Naar CalorieTracker’ staat op een eigen rij.
- Voorkomt dat de drie knoppen samen de breedte van het receptdetail overschrijden op iPhone.
- Productiedatabase blijft `mijn-recepten-db`.
- Productiecache is vernieuwd naar `mijn-recepten-v1.9.7`.

# Mijn Recepten — v1.9.6 (productie)

## Wijzigingen in v1.9.6
- Receptentegels hebben een consistente flexibele kolomindeling.
- Titels krijgen een vaste ruimte van maximaal drie regels.
- Omschrijvingen krijgen een vaste ruimte van maximaal twee regels.
- Bereidingstijd en porties worden consequent uitgelijnd; labels staan onderaan.
- Productiedatabase blijft `mijn-recepten-db`.
- Productiecache is vernieuwd naar `mijn-recepten-v1.9.6`.


## v1.9.6
- Houdt het iPhone-scherm actief zolang een receptdetail geopend is via de Screen Wake Lock API.
- Geeft de Wake Lock vrij zodra het recept wordt gesloten en vraagt deze opnieuw aan wanneer de gebruiker terugkeert naar de app.
- Bij browsers of iOS-versies zonder Wake Lock-ondersteuning blijft de app normaal werken.


## v1.9.6
- Added per-recipe “Naar CalorieTracker” export from the recipe detail view.
- Exports one recipe as a CalorieTracker-compatible JSON file; photo payload is omitted.
