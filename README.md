# Mijn Recepten — versie 1.3.0

**Releasedatum:** 28 oktober 2026

## Wijzigingen in deze versie

- De tekst die via het deelmenu naar de iOS-Opdracht wordt gestuurd, is nu gegroepeerd per gerecht.
- De naam van het gerecht staat op een eigen regel; ingrediënten staan eronder met inspringing en een streepje.
- Hoeveelheden per gerecht worden apart bijgehouden voor nieuw gegenereerde boodschappen, ook als hetzelfde ingrediënt in meerdere recepten voorkomt.
- Handmatig toegevoegde of oudere boodschappen waarvan de herkomst niet meer betrouwbaar is, worden onder **Overige boodschappen** gezet in plaats van een onjuiste hoeveelheid aan een gerecht toe te wijzen.
- De service-worker-cache is bijgewerkt naar versie 1.3.0.

## Formaat voor delen

De gedeelde tekst gebruikt deze structuur:

```text
Mexicaanse wraps
  - Tomaat — 2 stuks
  - Komkommer — 1 stuk

Kip met rijst
  - Kipfilet — 300 g
  - Rijst — 150 g
```

De bestaande iOS-Opdracht moet deze indeling interpreteren om echte hoofdherinneringen met subtaken te maken. Als de Opdracht nog iedere tekstregel als een losse herinnering aanmaakt, wordt de tekst wel ingesprongen gedeeld maar ontstaat er nog geen hiërarchie in Apple Herinneringen.

## Opslag

Recepten, weekmenu en boodschappen worden lokaal in de browser opgeslagen. De app verwijdert deze gegevens niet bij een update.
