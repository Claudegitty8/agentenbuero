# Agentenbüro: Regeln für jede Sitzung

Lernspiel, in dem Erwachsene, die Claude schon nutzen, aber keine Informatiker sind, spielerisch lernen: gute Aufträge (Prompts), Projekte und Gedächtnis, Skills, Konnektoren, Agenten, Subagenten, Hooks und Plugins. Schauplatz: eine kleine Geheimzentrale in Zwirbelwil, Figur: Einsatzroboter «Echo». Der Besitzer ist kein Programmierer: Erkläre alles kurz, in einfacher Sprache, auf Deutsch mit Schweizer Schreibweise (immer «ss»), ohne Emoji.

Die Technik stammt aus dem Lernspiel «KI-Studio» (`Claudegitty8/game-how-to-use-claudecode`, Version 0.17). Das KI-Studio wird nur gelesen, nie geändert (E-008).

## Zuerst lesen

- `docs/STAND.md`: wo wir stehen, was offen ist. Immer zuerst.
- `docs/PROJEKT.md`: Steckbrief (Ziel, Zielgruppe, Hosting, Datenschutz, Rechte, Budgets).
- `docs/KONZEPT.md`: Spielidee, 21 Kernkonzepte mit «Mechanik ist das Konzept», Aufbau.
- `docs/LEHRPLAN.md`: pro Konzept Lernziel, Übungen, Fehlbilder. Wird erzeugt mit `node werkzeuge/lehrplan-doku.mjs`.
- `docs/REGELN.md`: Fachlogik mit Testfällen (Meisterschaft, Wiederholung, Hilfen, Ausweg, Einsatzschrank).
- `docs/ENTSCHEIDE.md`: alle Entscheide mit Datum und Status.
- `docs/RECHERCHE.md`: Fachinhalte mit Quellen, Widersprüche, Fehlerprüfung.
- `docs/ARCHITEKTUR.md`: Technik, Ordner, Datenformate.
- `docs/BACKLOG.md`, `docs/FEATURES.md`, `docs/CHANGELOG.md`, `docs/VEROEFFENTLICHEN.md`.

## Befehle

- `npm run pruefen`: alle Tests und die Prüfung der Lerninhalte. Muss vor jedem Commit bestehen.
- `npm test`: nur die Tests. `npm run inhalte`: nur die Inhaltsprüfung.
- `npm start`: Spiel lokal unter http://localhost:8080.
- `node werkzeuge/durchspiel-browser.mjs [bilderordner]`: spielt jeden Auftrag im Browser durch, mit gutem und mit schwachem Spieler, prüft Konsole, Ränder und den Einsatzschrank, macht Bildschirmfotos.

Keine installierten Pakete, kein Build-Schritt. Neue Abhängigkeit nur mit Eintrag in `docs/ENTSCHEIDE.md`.

## Feste Regeln

1. **Drei Schichten, strikt getrennt.** `spiel/code/logik/` kennt keine Oberfläche. `spiel/code/oberflaeche/` enthält keine Spielregeln und keine festen Texte. Lerninhalte liegen als JSON in `spiel/inhalte/`.
2. **Alle sichtbaren Texte stehen in `spiel/inhalte/de/`.** Nie im Code.
3. **Die Mechanik ist das Konzept.** Jedes Fehlbild darf übertreiben, aber die Richtung muss dem echten Verhalten von Claude entsprechen.
4. **Spielwort und echtes Wort zusammen** («Funkspruch (Prompt)», «Dossier (Skill)»), damit man die echten Begriffe lernt (E-013).
5. **Fakten über Claude nur mit offizieller Quelle und Prüfdatum** in `spiel/inhalte/fakten.json`, nicht in Spieltexten. Was sich schnell ändert (Knopfnamen, Abos, Grenzen), vor jedem Kapitel neu prüfen.
6. **Texte:** Du-Form, kurze Sätze, kein Textblock über 40 Wörter, nirgends ein scharfes S.
7. **Keine Geheimnisse, keine persönlichen Daten, kein Tracking, keine fremden Server, keine manipulativen Mechaniken** (Zeitdruck, Streaks, Ranglisten, Kaufanreize).
8. **Bewertet wird nur in `spiel/code/logik/`.** Der Lernfortschritt hängt nie von echter KI ab.
9. **Gespeicherte Spielstände nie verwerfen.** Neues Feld: in `neuerStand` und `wandleUm` ergänzen (siehe ARCHITEKTUR).
10. **Immer ein Ausweg.** Jede strenge Regel braucht einen sichtbaren Ausweg. Jede Änderung auch mit einem schwachen Spieler testen.
11. **Jede Information an einem Ort.** Jede Änderung führt die betroffenen Dokumente und `docs/CHANGELOG.md` nach. Zahlen im Changelog zählen, nicht schätzen.
12. **Nichts löschen oder umbauen ohne Eintrag** in `docs/ENTSCHEIDE.md`.

## Tests

- `tests/agentenbuero.test.js` prüft die eigenen Inhalte: ganzes Spiel stark, schwach, nur Schnelltest, Einsatzschrank, Texte.
- Die übrigen Testdateien stammen aus dem KI-Studio und prüfen die übernommene Spiellogik mit der Testvorlage `tests/vorlage/` (zwölf Aufträge des KI-Studios, E-015). Nicht löschen: Sie schützen die Technik.

## Arbeitsweise

- Vor jeder Arbeit: `git pull`, `git log`, `docs/STAND.md`, `docs/CHANGELOG.md` und offene Entscheide lesen.
- Erst planen, dann bauen. Pläne in einfacher Sprache, auf das Okay des Besitzers warten.
- Neue Spiellogik und jeder behobene Fehler bekommen einen Test.
- Erst «fertig» melden, wenn `npm run pruefen` und das Browser-Durchspiel bestehen und die Bildschirmfotos selbst angesehen wurden. Nichts als geprüft melden, was nicht geprüft ist.
- Prüfen in Runden: prüfen, korrigieren, wieder prüfen, bis eine Runde nichts mehr findet. Neue Fehlerarten in die automatische Prüfung aufnehmen.
- Kleine Commits auf `main` mit deutscher Nachricht.
- Fragen nur als Auswahlfenster mit höchstens 4 Antworten, Empfehlung zuerst.
- Veröffentlichen, öffentlich stellen, Löschen, Kosten, neue Konten: nur nach ausdrücklichem Ja.
- Am Ende jeder Antwort mit Änderungen: Version · Veröffentlicht · Dokumente · Offen.

## Sprache im Code

Fachliche Namen und Kommentare auf Deutsch, ohne Umlaute in Dateinamen und Bezeichnern (`pruefen`).
