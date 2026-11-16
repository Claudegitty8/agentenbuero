# Changelog

## Version 0.1 (16.11.2026)

### Neu
- Lernspiel «Agentenbüro» aus der Technik des KI-Studios (Version 0.17) aufgebaut (E-008).
- Schauplatz Geheimzentrale in Zwirbelwil, Einsatzroboter «Echo», Einsatzkoffer als Bild für den Kontext (E-011).
- Lehrplan mit 21 Kernkonzepten in 6 Kapiteln. Spielbar: Kapitel 1 «Der Funkspruch».
- Auftrag 1 «Operation Nussgipfel» (Bäckerei Brunner) mit 3 Konzept-Runden und einer Mischrunde: 20 Aufgaben (17 zum Zusammenstecken, 3 zum Vorhersagen), 61 Fehlbilder mit je zwei Varianten.
- Einsatzschrank mit «In Claude ausprobieren»: geprüfte Vorlage zum Kopieren, mit Ersatz, wenn Kopieren gesperrt ist (E-016, E-020).
- Spielwort und echtes Wort stehen zusammen, zum Beispiel «Dein Funkspruch (Prompt)» (E-013).
- Lexikon mit 8 Einträgen, Faktendatei mit 7 Angaben samt Quelle und Prüfdatum, 3 freiwillige Fragen vorher und nachher.
- Eigene Farben, Echo als Roboter, eigene Symbole für den Home-Bildschirm (E-018).
- Inhaltsprüfung: prüft zusätzlich den Einsatzschrank und meldet jedes scharfe S.
- Tests: 98 (87 übernommene mit Testvorlage, 11 eigene). Browser-Durchspiel mit gutem und schwachem Spieler (`werkzeuge/durchspiel-browser.mjs`).

### Behoben (vor der ersten Auslieferung gefunden)
- Startansicht hiess nach dem Umbenennen noch «studio», das Spiel wäre nicht gestartet.
- Ein neuer Spielstand beginnt mit dem Lexikon-Eintrag «KI», den es noch nicht gab (E-021).
- Texte aus dem KI-Studio: «sechs Fragen» (es sind drei), «Spiel-Tokens», Abschlussgruss passte nicht zum Stand.
- Der Browser-Test für den schwachen Spieler hat anfangs richtig gelöst und damit nichts bewiesen. Jetzt nimmt er alle Hilfen.

### Bekannte Grenzen
- Nur Kapitel 1 spielbar.
- Bereiche als Knöpfe in der Zentrale, noch keine Leiste unten (E-019).
- Einsatzschrank zeigt die Vorlage, noch nicht den eigenen Funkspruch (E-020).
- Nicht geprüft: echte Handys, Vorlesehilfe, Offline-Betrieb (geht erst auf GitHub Pages).
- Grösse des Spiels: 356 KB (Budget 800 KB).
