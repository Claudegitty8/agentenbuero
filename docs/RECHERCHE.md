# Agentenbüro: Recherche

Abgerufen am 16.11.2026


## Fachinhalte und Quellen

Status: **Offiziell** (Anthropic oder MCP-Doku), **Drittquelle**, **Widerspruch** (offizielle Quellen sagen Verschiedenes), **Unklar** (Quelle vielleicht veraltet), **Annahme**.

### Was es schon gibt
- Claude Academy: offizielle Gratis-Kurse. Claude Code 101 hat Teile zu Subagenten, Skills, MCP und Hooks. Es gibt einen eigenen Kurs zu Skills (Offiziell: https://anthropic.skilljar.com/claude-code-101 , https://anthropic.skilljar.com/introduction-to-agent-skills). Laut Drittquelle auch einen Kurs zu Subagenten, mit Videos, Quiz und Zertifikat, vermutlich nur auf Englisch, seit August 2026 unter academy.claude.com (https://pasqualepillitteri.it/en/news/12081/claude-academy-live-free-courses-learn-claude).
- Kurs «AI Fluency» von Anthropic und zwei Professoren: 4D-Modell Delegation, Description, Discernment, Diligence, für alle, unabhängig vom Beruf (Offiziell: https://www-cdn.anthropic.com/334975cdec18f744b4fa511dc8518bd8d119d29d.pdf).
- Anthropics Prompt-Tutorial auf GitHub: laut offizieller Übersicht für Claude-3-Modelle geschrieben, bei Abweichungen gilt die neue Anleitung (https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview).
- Prompt-Spiele wie Gandalf, PromptQuest, Secret Prompter: üben fast nur Prompten, oft für Bilder. MCP-Challenge: für Entwickler (Drittquellen: https://mcpchallenge.pages.dev/ , https://www.pulse.bot/ai/blogs/learn-ai-by-playing-games-not-watching-boring-tutorials-3690298d-1315-4b34-b0ec-46c199c808b6/).
- Lücke: kein deutsches Handy-Spiel für Nicht-Informatiker, das diese Themen mit Spielmechanik verbindet (Suche nicht vollständig).

### Prompten (Kapitel 1, dazu Konzepte 10, 13 und 14) – Offiziell
Quelle: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- Klar und direkt sein, gewünschtes Ergebnis ausdrücklich nennen. Gründe nennen, damit Claude verallgemeinern kann.
- 3 bis 5 passende, verschiedene Beispiele. Abschnitte mit Tags trennen. Rolle in einem Satz.
- Lange Unterlagen oben, vor der Frage. Zuerst passende Stellen zitieren lassen.
- Sagen, was zu tun ist, statt was nicht.
- Soll Claude handeln: Anweisung statt Frage, sonst gibt es Vorschläge statt Taten.
- Vor unumkehrbaren Schritten (Löschen, Veröffentlichen) bestätigen lassen.
- Bei langen Aufgaben den Stand in Dateien festhalten. Grundlage für Konzept 14.
- Vorausgefüllte Antworten (Prefill) gehen ab den Modellen der Reihe 4.6 nicht mehr. Nur fürs Lexikon.

### Arbeiten mit Claude Code (Konzepte 1, 10, 11, 14, 15, 19, 20) – Offiziell
Quelle: https://code.claude.com/docs/en/best-practices
- Der Kontext füllt sich schnell, und mit vollem Kontext arbeitet Claude schlechter. Er ist die wichtigste Ressource.
- Claude eine Prüfung geben, die es selbst laufen lassen kann, und einen Beweis zeigen lassen statt «Erfolg» zu behaupten.
- Erst erkunden, dann planen, dann umsetzen. Bei kleinen, klaren Änderungen den Plan weglassen.
- Bei grösseren Vorhaben kann Claude dich zuerst befragen und daraus eine Beschreibung schreiben.
- Früh korrigieren. Zwischen Aufgaben, die nichts miteinander zu tun haben, den Kontext leeren. Nach zwei misslungenen Korrekturen frisch anfangen mit besserem Auftrag.
- Recherche an Subagenten geben, damit der Hauptkontext sauber bleibt.
- Vor dem Abschluss einen Subagenten mit frischem Kontext prüfen lassen. Er soll nur Lücken melden, die für Richtigkeit oder Anforderungen zählen, sonst wird zu viel umgebaut.
- Anweisungen in CLAUDE.md sind Bitten, Hooks laufen sicher jedes Mal.
- Weitere Quelle zum Kontext: https://platform.claude.com/cookbook/tool-use-context-engineering-context-engineering-tools (Zusammenfassen verliert Einzelheiten, Notizen ausserhalb überdauern Sitzungen).

### Projekte und Gedächtnis (Kapitel 2, Konzept 4) – Offiziell
Quellen: https://support.claude.com/en/articles/9517075 · https://support.claude.com/en/articles/9519177 · https://support.claude.com/en/articles/11817273
- Projekte gibt es für alle, auch gratis (höchstens fünf Projekte). Projektanweisungen gelten für alle Chats im Projekt.
- Ohne Gedächtnis teilen die Chats eines Projekts nur, was im Projektwissen steht. Mit Gedächtnis hat jedes Projekt sein eigenes Gedächtnis.
- Gedächtnis: Claude merkt sich Themen aus Chats und nimmt sie in neue Chats mit. Einsehen und ändern in den Einstellungen (je nach Version «Your Claude» oder «Memory»).
- **Widerspruch 5:** Gedächtnis für alle Abos (ein Abschnitt) oder erst ab Pro (anderer Abschnitt). Gedächtnis in Cowork: geteilt (ein Abschnitt) oder nicht verfügbar (anderer). Im Spiel nur «je nach Abo», Details in die Faktendatei.

### Skills (Kapitel 2, Konzepte 5 bis 7)
Quellen: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview (Offiziell) · https://support.claude.com/en/articles/12512198-use-custom-skills (Offiziell) · https://support.claude.com/en/articles/12512180 (Offiziell) · https://anthropic.skilljar.com/introduction-to-agent-skills (Offiziell)
- Ein Skill ist ein Ordner mit `SKILL.md`. Pflicht: Name und Beschreibung. Die Beschreibung muss sagen, was er tut und wann.
- Name: höchstens 64 Zeichen. Laut Plattform-Doku nur Kleinbuchstaben, Zahlen, Bindestriche, ohne «claude» und «anthropic». Im Spiel gilt die strengere Regel.
- Stufenweises Laden: Name und Beschreibung immer (rund 100 Tokens), die Anleitung erst bei Bedarf, Zusatzdateien erst, wenn gelesen.
- In der Claude-App: hochladen als ZIP unter «Customize > Skills», Codeausführung muss eingeschaltet sein. Ordnername gleich wie Skill-Name.
- Testen: mit Anfragen, die den Skill auslösen sollen, prüfen, ob er lädt, und sonst die Beschreibung verbessern (Hilfe-Center). Der Skills-Kurs hat eine eigene Lektion zu Skills, die nicht anspringen. Gegenproben mit Anfragen, bei denen er nicht anspringen soll: eigene Ergänzung (Annahme: sinnvoll, weil zu breite Beschreibungen sonst unbemerkt bleiben).
- Ein Ablauf pro Skill, genaue Beschreibung, keine vertraulichen Angaben fest einbauen.
- Nur Skills aus vertrauenswürdigen Quellen, wie Software behandeln.
- **Widerspruch 1:** Beschreibung höchstens 1024 Zeichen (Plattform-Doku) oder 200 Zeichen (Hilfe-Center). Im Spiel gilt «unter 200 Zeichen», das passt zu beiden.
- **Widerspruch 2:** Gratis-Konto dabei (Hilfe-Center) oder erst ab Pro (Plattform-Doku).
- **Widerspruch 3:** Skills übertragen sich nicht zwischen App und Claude Code (Plattform-Doku) oder laden in Claude Code mit demselben Konto (Hilfe-Center, Claude-Doku zu Plugins). Nicht neu geprüft. Das Spiel behauptet dazu nichts: Die Anleitungen im Einsatzschrank sagen für jedes Bauteil, wo man es einrichtet.
- skill-creator (Offiziell, https://support.claude.com/en/articles/12599426): In der Claude-App kann man im Gespräch einen Skill bauen lassen.

### Konnektoren (Kapitel 3)
Quellen: https://support.claude.com/en/articles/11176164 · https://support.claude.com/en/articles/11175166 · https://support.claude.com/en/articles/11503834 (alle Offiziell) · https://modelcontextprotocol.io/docs/learn/server-concepts (Offiziell, MCP)
- Konnektoren verbinden Claude mit Diensten, zum Beispiel um Dateien zu durchsuchen oder Nachrichten zu senden.
- Eigene Konnektoren laufen über einen MCP-Server im Internet, Claude verbindet sich aus Anthropics Cloud.
- Eigene Konnektoren sind nicht von Anthropic geprüft: nur vertrauenswürdige verbinden, Rechte genau ansehen, Anfragen um Erlaubnis genau lesen, bei der Funktion «Research» schreibende Werkzeuge ausschalten.
- MCP kennt drei Arten: Werkzeuge (Claude entscheidet), Ressourcen (Daten), Vorlagen (vom Menschen gestartet). Programme können pro Werkzeug festlegen lassen, ob es verfügbar ist.
- **Geprüft (vorher Annahme):** Die Werkzeuge eines Konnektors lassen sich nach Gruppen (nur lesen, schreiben und löschen) oder einzeln auf «Always allow», «Needs approval» oder «Blocked» stellen. In Team- und Enterprise-Konten legen das die Verantwortlichen für alle fest (https://support.claude.com/en/articles/11176164). Mitglieder können ihre eigene Freigabe auf «Always allow» setzen, wenn die Rolle es erlaubt (https://support.claude.com/en/articles/13930458). Deutsche Knopfnamen: nicht geprüft, darum nennt das Spiel die englischen.
- Sicherheit bei eigenen Konnektoren (Offiziell, https://support.claude.com/en/articles/11175166): Bösartige Server können versteckte Anweisungen enthalten. Nur Server von vertrauenswürdigen Anbietern, verlangte Rechte prüfen und unnötige ablehnen, Anfragen um Erlaubnis genau lesen, «Allow always» nur für Werkzeuge, denen man ohne Aufsicht traut, nicht nötige Werkzeuge ausschalten.
- Versteckte Anweisungen (Prompt Injection), Offiziell: Anweisungen in Websites, Mails und Dokumenten können Claude zu ungewollten Handlungen verleiten. Verlangt Claude plötzlich heikle Angaben, den Auftrag sofort stoppen (https://support.claude.com/en/articles/12902428). Beispiel einer Mail mit weisser Schrift, die Weiterleiten verlangt (https://anthropic.com/research/prompt-injection-defenses). Claude ist darauf trainiert, Anweisungen in Werkzeug-Ergebnissen skeptisch zu behandeln (https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks). Darum übertreibt das Spiel bewusst, wenn Echo fremde Anweisungen befolgt, und das Lexikon sagt, dass Claude dagegen trainiert ist.
- **Unklar:** Verbinden am Handy: Ein neuerer Artikel sagt, man kann am Handy neue Dienste verbinden. Ein älterer sagt, eigene Server lassen sich am Handy nicht hinzufügen. Beides kann stimmen. Vor Kapitel 3 prüfen.

### Agenten und Abläufe (Kapitel 4)
Quelle: https://anthropic.com/engineering/building-effective-agents (Offiziell)
- Feste Abläufe folgen vorgegebenen Wegen, Agenten steuern ihre Schritte selbst.
- Fünf Ablauf-Muster: Kette (mit Kontrollpunkten), Weiche, gleichzeitig arbeiten, Chef und Helfer, Schreiber und Prüfer.
- Agenten arbeiten in einer Schleife mit Rückmeldung aus der Umgebung, halten an Kontrollpunkten für Menschen, haben Abbruchgrenzen.
- Einfach anfangen, mehr Aufwand nur, wenn es messbar besser wird.
- Schleife «Kontext sammeln, handeln, prüfen»: aus dem Wissensspeicher (offiziell, Agent SDK), heute nicht neu abgerufen.
- Verantwortung: Im 4D-Modell heisst sie «Diligence», die Verantwortung dafür, was man mit KI tut (https://www-cdn.anthropic.com/334975cdec18f744b4fa511dc8518bd8d119d29d.pdf).

### Subagenten (Kapitel 5)
Quellen: https://code.claude.com/docs/en/sub-agents (Offiziell) · https://code.claude.com/docs/en/best-practices (Offiziell) · https://support.claude.com/en/articles/13837440 (Offiziell)
- Eigener Arbeitsbereich, eigene Anleitung, eigene Werkzeuge und Rechte. Nur die Zusammenfassung kommt zurück.
- Claude gibt einem Subagenten eine Aufgabe, wenn sie zu seiner Beschreibung passt.
- In Claude Code: eine Textdatei in `.claude/agents/` (Projekt) oder `~/.claude/agents/` (alle Projekte). Pflicht: Name und Beschreibung. Einfachster Weg: Claude bitten, die Datei zu schreiben.
- In der Claude-App laufen Subagenten und Hooks aus Plugins in Cowork, im normalen Chat nicht.
- Gute Praxis: kurze klare Beschreibung, Werkzeuge beschränken, für viel Lesestoff verwenden, Hin und Her im Hauptgespräch lassen, Prüf-Subagent mit frischem Kontext.
- Neu geprüft am 16.11.2026 (Offiziell, https://code.claude.com/docs/en/sub-agents): Pflicht sind nur Name und Beschreibung. Fehlt die Werkzeugliste, erbt der Subagent die Werkzeuge des Hauptgesprächs. Rückfragen kann ein Subagent nicht stellen (das Werkzeug dafür fehlt ihm), Anfragen um Erlaubnis kommen aber bei dir an. Ein eigener Subagent startet ohne deinen Chatverlauf. Die Abzweig-Art («fork») nimmt den Verlauf mit und ist in interaktiven Sitzungen eingeschaltet. Subagenten können selbst Subagenten starten, standardmässig bis drei Ebenen tief. Bis 20 laufen gleichzeitig. Viele ausführliche Berichte füllen den Hauptkontext. Feld `model` ist freiwillig.
- Das Spiel stützt sich bei «Einsatzbefehl» auf den eigenen Subagenten ohne Verlauf und erwähnt die Abzweig-Art im Lexikon. Die frühere Drittquelle zu Rückfragen ist damit offiziell bestätigt.

### Hooks und Plugins (Kapitel 6) – Offiziell
Quellen: https://code.claude.com/docs/en/hooks-guide · https://claude.com/docs/plugins/overview · https://support.claude.com/en/articles/13837440
- Hooks sind meist kleine Befehle, die Claude Code an festen Stellen ausführt (es gibt auch Hooks, die ein Claude-Modell urteilen lassen). Sie sorgen dafür, dass etwas sicher jedes Mal passiert, statt darauf zu hoffen, dass die KI daran denkt.
- Beispiele: nach jeder Änderung aufräumen, gefährliche Befehle sperren, melden, wenn Claude etwas braucht. Claude kann den Hook auf Wunsch selbst schreiben.
- Neu geprüft am 16.11.2026 (https://code.claude.com/docs/en/hooks-guide): `/hooks` zeigt die eingerichteten Hooks. Zeitpunkte unter anderem `PreToolUse` (vor einer Werkzeug-Nutzung, kann sperren), `PostToolUse` (nach Erfolg), `Notification` (wenn Claude auf dich wartet), `SessionStart`. Beispiel aus der Anleitung: Änderungen an geschützten Dateien sperren. Es gibt auch Hooks, die ein Claude-Modell oder einen Agenten prüfen lassen.
- Ein Plugin bündelt Skills, Konnektoren, Befehle und Agenten zu einem Paket. Hinzufügen unter «Customize > Plugins» in der Claude-App oder am Desktop.
- Skills aus Plugins gehen im Chat, in Cowork und in Claude Code. Agenten und Hooks nur in Cowork und Claude Code.

### Hosting, Marken, Recht (keine Rechtsberatung, ich bin kein Anwalt)
- GitHub Pages ist mit GitHub Free nur in öffentlichen Repositories gratis. GitHub speichert die IP-Adresse der Besucher (Offiziell: https://docs.github.com/en/articles/about-github-pages).
- Anthropics Markenregeln (gültig seit 1.8.2024): Marken nur wie ausdrücklich erlaubt, kein Eindruck einer Partnerschaft. Produktnamen und Adressen werden nicht einzeln geregelt. Darum Name ohne «Claude» (https://www.anthropic.com/legal/trademark-guidelines).
- Impressum vor Spenden und Informationspflicht beim Datenschutz: aus dem Wissensspeicher (Stand 13.11.2026), heute nicht neu geprüft. Vor Spenden neu prüfen.
- Lernforschung (Lernspiele wirken, sich abfragen und verteilt üben, produktives Scheitern): aus dem Wissensspeicher (Stand 11.11.2026), heute nicht neu geprüft.

## Fehlerprüfung des Konzepts

**Wie geprüft:** In jeder Runde zuerst ein Prüfskript (`werkzeuge/pruefe_vorschlag.py`): kein scharfes S, 21 Konzepte fortlaufend und richtig auf die Kapitel verteilt, jede Tabellenzeile vollständig, Verweise «Konzept N» passen zum Namen, gleiche Konzeptzahl überall, keine Namen aus Entwurf 1 ausserhalb von der Änderungsliste des Vorschlags, Entscheide fortlaufend, nur https-Links, keine Doppelnamen bei Kapiteln und Bereichen, jedes Spielwort wird auch benutzt. Danach das Dokument von Hand gelesen und jede Fachaussage mit der Quelle aus dieser Sitzung verglichen. Ein neu gefundener Fehlertyp wurde ins Skript aufgenommen und mit einer Gegenprobe getestet (der alte Fehler wird erkannt).

| Runde | Gefunden | Beispiele | Korrigiert |
|---|---|---|---|
| 1 | 1 formal, 14 inhaltlich | Konzeptname im Verweis falsch. «Häufigster Fehler» ohne Beleg. «Subagent sieht das Hauptgespräch nicht» zu absolut (es gibt eine Abzweig-Art). Gedächtnis so beschrieben, als lege man es selbst an. Fehlbild stützte sich auf eine Drittquelle. Zwei Überschriften in RECHERCHE.md mit falschen Konzeptnummern. | alle |
| 2 | 0 formal, 5 inhaltlich | «Archiv» als Kapitel und als Dienst. Fehlbild von Konzept 7 wiederholte Konzept 5. «Kalender» und «Terminstelle» gemischt. Gegenproben bei Skill-Tests waren eigene Idee, aber nicht so bezeichnet. | alle |
| 3 | 0 formal, 3 inhaltlich | «Zentrale» als Startbereich und als Kapitel 6 (jetzt «Technikabteilung»). «Archiv» im Merkbild. «Einsatzschrank» fehlte in der Begriffstabelle. | alle, Prüfskript ergänzt |
| 4 | 1 formal (neue Prüfung), 2 inhaltlich | «Echos Notizbuch» und «Notizbuch» gemischt. Zwei Fehlbilder entsprachen nicht echtem Verhalten (ohne Konnektor erfindet Claude meist keine Termine, sondern sagt, dass es keinen Zugriff hat). | alle |
| 5 | 0 formal, 0 inhaltlich | Übrige Übertreibungen sind gewollt und jetzt als Regel festgehalten (KONZEPT.md, Spielidee und Rahmen). | – |

**Ehrlich gesagt:** Fünf Runden ohne neuen Fund in der letzten Runde heisst nicht, dass das Dokument sicher fehlerfrei ist. Nicht geprüft werden konnte, was nur in der echten Claude-App sichtbar ist (Knopfnamen, Abo-Grenzen, Rechte pro Werkzeug). Diese Punkte stehen in RECHERCHE.md als Widerspruch, Unklar oder Annahme und werden vor dem jeweiligen Kapitel neu geprüft.

## Fehlerprüfung Version 0.9 (Inhalte aller Kapitel)

**Wie geprüft:** Inhaltsprüfung (`npm run inhalte`), 100 Tests, neue Prüfung «jedes Lösungsteil nötig», Prüfung «Hilfe führt von jeder Auswahl zur Lösung» (2760 Auswahlen), Browser-Durchspiel aller 7 Aufträge mit gutem und schwachem Spieler, Bildschirmfotos aus jedem Kapitel angesehen, Durchsicht aller Texte auf scharfes S, doppelte Leerzeichen, falsche Anführungszeichen und Wörter aus dem KI-Studio, Fakten gegen die oben genannten Quellen.

| Runde | Gefunden | Beispiele | Korrigiert |
|---|---|---|---|
| 1 | 21 | Halbe Lösungen galten als richtig (zum Beispiel Absage ohne Formangabe, Antwort ohne «Lücken melden», Einladung ohne heutigen Auftrag). | alle, neue Prüfregel |
| 2 | 3 | Deckblatt-Text über 40 Wörter. Hausarztpraxis mit Mailzugriff passt nicht zu Gesundheitsdaten (E-022). Behauptung zur Einreise eines Hundes ohne Quelle. | alle |
| 3 | 4 | Browser: Teile mit gleichem Text nicht unterscheidbar, auch nicht für Vorlesehilfen (E-025). Sortieraufgaben im Durchspiel nicht lösbar. Hilfe zeigte bei vollem Koffer nichts (E-024). Abschlusstext «Mehr Aufträge folgen bald». | alle, neuer Test |
| 4 | 0 | – | – |

**Ehrlich gesagt:** Eine Runde ohne neuen Fund heisst nicht, dass alles fehlerfrei ist. Nicht geprüft: echte Handys, Vorlesehilfe am Gerät, deutsche Knopfnamen in der Claude-App, ob Skills zwischen App und Claude Code wandern (Widerspruch 3).
