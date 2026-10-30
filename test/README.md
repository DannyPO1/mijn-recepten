# Mijn Recepten — v1.9.1 (test)

## Wijzigingen in v1.9.1
- De indeling is consequent gescheiden in **maaltijdmoment**, **keuken** en **tags**.
- Maaltijdmomenten: Ontbijt, Lunch, Avondeten, Snack, Dessert en Bijgerecht.
- Keukens: Nederlands, Italiaans, Mexicaans, Marokkaans, Aziatisch, Indonesisch, Indiaas, Midden-Oosters en Internationaal.
- Tagsuggesties: Kindergerecht, Mealprep, Pasta, Rijst & Bowls, Wraps & Flatbreads, Kip, Salades, Vegetarisch en Curry.
- Mealprep is uitsluitend een tag. Recepten die alleen voorbereid worden, mogen geen maaltijdmoment hebben.
- Oude categoriegegevens worden bij opstarten en bij import automatisch naar de nieuwe structuur vertaald.
- De filterbalk gebruikt uitsluitend maaltijdmomenten en bevat ook ‘Zonder maaltijdmoment’.
- Kindvriendelijk aanvinken voegt ook de tag Kindergerecht toe.
- Bestaande gegevens in de aparte testdatabase blijven behouden; de testdatabase-naam is ongewijzigd.
- Serviceworker-cache vernieuwd naar v1.9.1.

## Back-up en migratie
JSON schema v2 blijft gehandhaafd en oudere back-ups blijven importeerbaar. Bij import worden oude categorieën naar maaltijdmoment, keuken of tag vertaald. Receptinhoud, ingrediënten, stappen, foto's, weekmenu en boodschappen blijven behouden.

## Testrelease
Deze ZIP is bedoeld voor de testbranch `feature/nieuw-ontwerp`. Upload de inhoud van de ZIP naar de root van die branch. Laat `main` ongemoeid totdat de test op iPhone/Safari is afgerond.
