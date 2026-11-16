# Regeln der Fachlogik

Stand: 16.11.2026 · Version 0.9. Die Regeln stammen aus dem KI-Studio (Wissensspeicher Teil 4.2) und sind dort erprobt. Einstellbare Zahlen stehen in `spiel/inhalte/regeln.json`.

| Regel | Inhalt | Zahl | Test |
|---|---|---|---|
| Meisterschaft | Ein Konzept gilt als gelernt nach 3 gezählten Erfolgen in verschiedenen Situationen. Gezählt wird nur, was beim ersten Versuch und höchstens mit der ersten Hilfe (Tipp) gelingt. | 3 | `tests/logik.test.js`, `tests/agentenbuero.test.js` (guter Spieler) |
| Freie Situationen | Mindestens 4 pro Konzept. | 4 | Inhaltsprüfung |
| Probieren | Lässt sich mit keiner Auswahl lösen, ergibt immer ein Fehlbild. | – | Inhaltsprüfung |
| Hilfen | Tipp, «Zeig mir, wo», «Lösung zeigen». Nach zwei Fehlversuchen wird der Tipp angeboten. | 3 | `tests/extras.test.js` |
| Ausweg | Nach 2 Durchgängen ohne Fortschritt: «Weitergehen und später üben». Das Konzept kommt als Wiederholung, bis es sitzt. | 2 | `tests/ausweg.test.js`, `tests/agentenbuero.test.js` (schwacher Spieler) |
| Wiederholung | Nach 1, 3 und 7 Runden, auch über Aufträge hinweg. Misslingt sie, kommt sie früher wieder, ohne Abzug. | 1, 3, 7 | `tests/ablauf.test.js`, `tests/abwechslung.test.js` |
| Schnelltest | 3 Aufgaben pro Konzept, ein Versuch. Bestanden: Einführung übersprungen. Nicht bestanden: kostet nichts. | 3 | `tests/agentenbuero.test.js` |
| Mischrunde | Am Ende jedes Auftrags, beliebig viele Versuche. | – | `tests/agentenbuero.test.js` |
| Bewertung | Die erste zutreffende Prüfung bestimmt das Fehlbild (gewählt, fehlt, aus + höchstens, zu viel Platz im Koffer). | – | `tests/logik.test.js` |
| Einsatzkoffer | Ist der Funkspruch grösser als der Koffer (`fenster`), passt nicht alles hinein. Es braucht dazu eine Prüfung mit derselben Grenze. | pro Aufgabe | Inhaltsprüfung |
| Einsatzschrank | Ein Bauteil (Feld `schrank` im Auftrag) ist frei, sobald der Auftrag erledigt ist. Kein neues Feld im Spielstand nötig. Kaputte oder alte Stände ergeben einen leeren Schrank. | – | `tests/agentenbuero.test.js` |
| Spielstand | Nur auf dem Gerät. Alte Stände werden umgewandelt, nie verworfen. Passt ein angefangener Auftrag nicht mehr, beginnt nur dieser neu. | – | `tests/springen.test.js`, `tests/ki-und-inhalte.test.js` |

## Sonderfälle

- Kein Gerätespeicher: Das Spiel läuft im Arbeitsspeicher weiter.
- Kopieren in die Zwischenablage gesperrt (zum Beispiel in der Claude-Vorschau): Der Text wird markiert, eine Meldung erklärt, wie man von Hand kopiert.
- Fehlbild mit Platzhalter `{teil}`: nur erlaubt, wenn genau ein Teil übrig bleibt (Test «Kein Fehlbild zeigt einen leeren Platzhalter»).

## Offene Fragen

- Wird «3 Erfolge» als zu viel oder zu wenig empfunden? Erst die Testrunde zeigt es (Annahme aus dem KI-Studio).
