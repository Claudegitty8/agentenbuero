# Changelog

## Version 0.11 (17.11.2026, noch nicht veröffentlicht)

### Neu
- Lexikon: neuer Teil «So geht es in echt (Anleitungen)» mit 11 Anleitungen zu den vier Themen (3 Skill, 3 Konnektor, 2 Subagent, 3 Hook und Plugin). Wege zum Durchklicken erscheinen als Bilderstrecke, Rechte und Werkzeuge als fertig eingestelltes Bild (E-033).
- Ein Thema öffnet sich, sobald man seine Runde erreicht hat oder den Auftrag erledigt hat. So bekommen auch Spielstände von vor Version 0.10 die Anleitungen.

### Geändert
- Inhaltsprüfung prüft das neue Feld `anleitungen`. Browser-Durchspiel prüft die Anleitungen im Lexikon.
- Tests: 116 (2 neue).

## Version 0.10 (17.11.2026)

Bebilderte Übungen «In echt»: Wie man Skills, Konnektoren, Subagenten, Hooks und Plugins in der echten Claude-App einrichtet.

Veröffentlicht am 17.11.2026 auf https://claudegitty8.github.io/agentenbuero/.

### Neu
- Vier Runden «In echt», je am Ende eines Kapitels vor der Mischrunde: Skill hochladen (Notenständer), Konnektor verbinden (Stammtisch), Subagent anlegen (Ferienplan), Hook und Plugin (Hobelbank). 25 statt 21 Konzepte (E-031).
- 36 nachgezeichnete Bildschirme der deutschen Claude-Desktop-App aus Textbausteinen, nach Bildschirmfotos des Besitzers (E-030, E-032). Jedes Bild trägt «Vereinfacht nachgezeichnet, Stand 17.11.2026».
- Neue Übungsform «Durchklicken»: In den Bildern die richtige Stelle antippen. Jeder Fehltipp wird sofort erklärt, danach geht es im selben Bild weiter.
- Neue Übungsform «Einstellen im Bild»: Rechte pro Werkzeug und Werkzeuge eines Subagenten einstellen.
- Sortieren mit kleinen Bildern, Bilderstrecke als Beispiel und bei «Lösung zeigen».
- Probefahrt im Einsatzschrank: den Weg nochmals ansehen und abhaken, was in der echten App geklappt hat. Die Haken bleiben gespeichert (E-029).
- 24 neue Aufgaben (14 Durchklicken, 3 Einstellen, 3 Sortieren, 4 Vorhersagen), zusammen 173. 4 Lexikon-Einträge (45), 5 Fakten mit Quelle (20).

### Geändert
- Einsatzschrank «Schutzregeln für Funkleitungen»: deutsche Namen der Rechte statt englischer.
- Inhaltsprüfung kennt Bildschirme, Durchklicken, Einstellen und Probefahrt. Browser-Durchspiel tippt sich durch die Bilder, der schwache Spieler tippt zuerst daneben.
- Tests: 114 (14 neue).

## Version 0.9 (16.11.2026)

Alle 21 Konzepte sind spielbar. Version 1.0 folgt nach der Testrunde mit Erwachsenen.

Veröffentlicht am 17.11.2026 auf https://claudegitty8.github.io/agentenbuero/.

### Neu
- Auftrag 2 «Operation Notenständer» (Musikverein, Kapitel 2 «Das Archiv»): Wohin gehört es, Deckblatt, Schlankes Dossier, Probefälle.
- Auftrag 3 «Operation Stammtisch» (Gasthof Ochsen, Kapitel 3 «Die Funkleitungen»): Freigaben mit Ampel, abgefangene Nachrichten (E-022).
- Auftrag 4 «Operation Generalversammlung» (Gewerbeverein, Kapitel 4 «Der Einsatz»): Einsatzschleife, Plan, Kette, Haltepunkte, frischer Koffer.
- Auftrag 5 «Operation Ferienplan» (Familie Meier, Kapitel 5 «Agenten im Feld»): Feldagent, Einsatzprofil, Lagebericht, Aufteilen, Zweiter Blick.
- Auftrag 6 «Operation Hobelbank» (Schreinerei Odermatt, Kapitel 6): Sicherheitsprotokoll aus Zeitpunkt und Regel, Einsatzpaket.
- Schlussmission «Operation Dorffest»: drei Mischrunden über alle Kapitel, am Ende ein ganzes kleines System als Paket.
- Zusammen 149 Aufgaben (94 zum Zusammenstecken, 51 zum Vorhersagen, 4 zum Sortieren) und 396 Fehlbilder mit je zwei Varianten.
- Einsatzschrank mit 7 Bauteilen: Funkspruch, Skill, Schutzregeln, Einsatzbefehl, Subagent, Bauplan für Hook und Plugin, Bauplan für ein ganzes System.
- Gruppen einer Aufgabe können eigene Namen tragen, zum Beispiel «Was es tut» und «Wann es gebraucht wird» beim Deckblatt.
- Lexikon mit 41 Einträgen, Faktendatei mit 15 Angaben samt Quelle, 8 freiwillige Fragen vorher und nachher.
- Lehrplan wird aus den Inhalten erzeugt (`node werkzeuge/lehrplan-doku.mjs`).

### Geändert
- Inhaltsprüfung: Jedes Teil einer Lösung muss nötig sein (E-023). Das hat 21 Stellen in Auftrag 1 und 2 aufgedeckt, an denen eine halbe Lösung als richtig galt. Alle behoben, zum Beispiel braucht die Absage jetzt auch die Formangabe.
- Auftrag 1: Drei Kundenfragen haben jetzt eine echte Lücke (Nussgipfel um 6 Uhr, Nussspuren, Zopf vorbestellen), damit «Lücken melden» zählt.
- Gruppen von Textteilen sind für Vorlesehilfen benannt. Derselbe Satz kann so in zwei Gruppen stehen (E-025).
- Abschlusstexte der Zentrale passen zum vollständigen Spiel.

### Behoben
- «Zeig mir, wo» zeigte bei zu vollem Koffer nichts an. Jetzt zeigt die Hilfe auf das schwerste Teil, das nicht zur Lösung gehört (E-024). Neuer Test prüft alle 2760 möglichen Auswahlen.
- Browser-Durchspiel konnte Sortieraufgaben nicht lösen und Teile mit gleichem Text nicht unterscheiden. Es spielt jetzt alle 7 Aufträge stark und schwach durch und meldet, wenn das Spiel hängt.

### Bekannte Grenzen
- Bereiche als Knöpfe in der Zentrale, noch keine Leiste unten (E-019).
- Einsatzschrank zeigt Vorlagen, noch nicht die eigenen Bauteile (E-020).
- Nicht geprüft: echte Handys, Vorlesehilfe am Gerät, Offline-Betrieb (geht erst auf GitHub Pages).
- Grösse des Spiels: 569 KB (Budget 800 KB).

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
