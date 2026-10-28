# Mijn Recepten

Een privacygerichte, statische PWA voor iPhone/Safari. Receptgegevens worden lokaal in IndexedDB opgeslagen. Er is geen externe receptenbackend of analytics opgenomen.

## Bestanden

- `index.html` — appstructuur en schermen
- `styles.css` — mobiele interface
- `app.js` — receptenbeheer, weekmenu, boodschappen, import/export
- `manifest.webmanifest` — PWA-instellingen
- `sw.js` — offline cache

## Publiceren via GitHub Pages

**Eenmalige setup:** als je de CalorieTracker-achtige ZIP-workflow wilt gebruiken, voeg dan het aparte workflowbestand `install-mijn-recepten-zip.yml` toe aan `.github/workflows/` in je repository. GitHub Actions moet ingeschakeld zijn en `GITHUB_TOKEN` moet contents kunnen schrijven. Upload daarna `MijnRecepten-iPhone-v1.0.0.zip` naar de root van de branch `main`; de workflow pakt de ZIP uit, plaatst de appbestanden in de root en commit de wijziging. De workflow zelf wordt apart meegeleverd, omdat een workflow eerst in de repository aanwezig moet zijn voordat hij de ZIP kan verwerken.

Alternatief: upload de losse appbestanden rechtstreeks naar de root van de repository.

Daarna:
1. Open in GitHub: **Settings → Pages**.
2. Kies **Deploy from a branch**, selecteer `main` en `/ (root)`, en sla op.
3. Open de gepubliceerde URL in Safari op de iPhone.
4. Kies **Deel → Zet op beginscherm**.

De PWA moet via HTTPS of localhost worden geopend om de service worker te kunnen gebruiken. GitHub Pages levert HTTPS.

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
