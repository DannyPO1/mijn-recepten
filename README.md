# Mijn Recepten

**Huidige appversie: 1.2.0**

Een privacygerichte, statische PWA voor iPhone/Safari. Receptgegevens worden lokaal in IndexedDB opgeslagen. Er is geen externe receptenbackend of analytics opgenomen.

## Bestanden

- `index.html` — appstructuur en schermen
- `styles.css` — mobiele interface
- `app.js` — receptenbeheer, weekmenu, boodschappen, import/export
- `manifest.webmanifest` — PWA-instellingen
- `sw.js` — offline cache

## Publiceren via GitHub Pages

De app wordt gepubliceerd met GitHub Pages vanuit de branch `main` en de repository-root. De workflow `install-mijn-recepten-zip.yml` verwerkt versiegebonden ZIP-bestanden die in de root worden geplaatst, bijvoorbeeld `MijnRecepten-iPhone-v1.2.0.zip`. De workflow pakt de ZIP uit, kopieert de appbestanden naar de repository-root en commit die wijziging. De ZIP wordt na installatie verwijderd.

**Workflow instellen of vervangen:** plaats het meegeleverde workflowbestand in `.github/workflows/install-mijn-recepten-zip.yml`. Schakel zo nodig Actions in en controleer bij **Settings → Actions → General** dat workflows toestemming hebben om repository-inhoud te lezen en te schrijven. De workflow gebruikt `GITHUB_TOKEN` met `contents: write`.

Voor iedere release: upload alleen de nieuwe ZIP naar de root van `main`, met de volledige versienaam in het bestand. De workflow verwerkt bij een push de nieuw toegevoegde versie-ZIP. Je kunt de workflow ook handmatig starten via **Actions → Install Mijn Recepten ZIP → Run workflow**; dan kiest hij de hoogste aanwezige semantische versie-ZIP.

Daarna: open in GitHub **Settings → Pages**, kies **Deploy from a branch**, selecteer `main` en `/ (root)`, en sla op. Open de gepubliceerde URL in Safari op de iPhone en kies **Deel → Zet op beginscherm**.

## Lokale gegevens en back-up

De app bewaart gegevens in IndexedDB in de browser. Gebruik **Back-up → Download back-upbestand** en sla het JSON-bestand via de iOS-deel-/bestandsinterface op in iCloud Drive. Met **Kies back-upbestand** kan een back-up later worden samengevoegd of teruggezet.

**Let op:** IndexedDB wordt niet automatisch gesynchroniseerd met iCloud. Bewaar regelmatig een back-up. Wis Safari-/websitegegevens niet voordat je hebt gecontroleerd dat je een recente back-up hebt.

## Apple Herinneringen

De knop **Deel lijst** gebruikt het iOS-deelmenu waar dit wordt ondersteund. Maak in Opdrachten een opdracht die tekst ontvangt, de invoer op nieuwe regels splitst en voor elke regel een nieuwe herinnering toevoegt aan de bestaande lijst `Boodschappen`. Kies vervolgens die opdracht vanuit het deelmenu. De webapp wijzigt Herinneringen niet rechtstreeks.

## Huidige starterrecepten

De app start met vier bewerkbare starterrecepten: Havermout-bananenpannenkoeken, Mexicaanse vulling, Kip-flatbread en Kip met rijst. Alleen de pannenkoeken hebben voorbeeldhoeveelheden. De andere recepten zijn bewust als invulbare concepten aangemaakt; vul de exacte gegevens uit je eigen recept in.

## Belangrijke notities

- Dit is een statische frontend zonder server of externe database.
- Gebruik alleen een back-upbestand dat je vertrouwt; import vervangt of wijzigt lokale gegevens.
- De PWA gebruikt geen externe afbeeldingen, lettertypes of JavaScript-CDN's.


## Recepten importeren vanuit ChatGPT (v1.2.0)

Gebruik in de app **Back-up → Recepten importeren vanuit ChatGPT** en selecteer een JSON-bestand. Dit is een receptenimport, geen volledige back-up: weekmenu en boodschappen blijven onaangeroerd. Je kunt alleen nieuwe recepten toevoegen of bestaande recepten met dezelfde naam bijwerken.

Vraag ChatGPT bijvoorbeeld: “Maak een JSON-bestand voor Mijn Recepten met de volgende recepten. Gebruik `format: \"mijn-recepten-recipes\"`, `version: 1` en een array `recipes`. Elk recept heeft `name`, `category`, `servings`, `prep`, `cook`, `description`, `ingredients` (objecten met `name`, `qty`, `unit`, `optional`), `steps` (objecten met `text`) en `notes`. Verzin geen ontbrekende hoeveelheden; laat die leeg.”

Ondersteund: een kale JSON-array met recepten, een object met `recipes`, of een volledige back-up met `data.recipes`.


## Versiebeheer

We volgen Semantic Versioning: `MAJOR.MINOR.PATCH`. Een `MAJOR`-verhoging is voor grote/brekende wijzigingen, `MINOR` voor nieuwe functies die compatibel blijven, en `PATCH` voor kleine reparaties. De versie in de ZIP-bestandsnaam, deze README en de appweergave moeten bij iedere release overeenkomen. De service-worker-cache gebruikt ook de releaseversie, zodat Safari de nieuwe appbestanden opnieuw ophaalt.
