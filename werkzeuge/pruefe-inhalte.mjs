// Prüft die Lerninhalte automatisch. Aufruf: npm run inhalte
// Gibt eine Liste von Fehlern zurück. Leere Liste = alles in Ordnung.
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { bewerte, hilfeTeil, loesungVon } from '../spiel/code/logik/bewertung.js';
import { ARTEN } from '../spiel/code/logik/prompt.js';
import { SCHIRM_ARTEN, eintraegeVon, loeseSchirm, stellenVon } from '../spiel/code/logik/schirme.js';

const STANDARD_ORDNER = fileURLToPath(new URL('../spiel/inhalte/', import.meta.url));
const MAX_WOERTER = 40; // Leitlinie B7: kein Textblock über 40 Wörter

// Eine Datei, die es nicht in jedem Inhaltsordner gibt (zum Beispiel die Bildschirme in der Testvorlage).
async function liesWennDa(ordner, datei, fehler) {
  try {
    await readFile(path.join(ordner, datei));
  } catch {
    return null;
  }
  return lies(ordner, datei, fehler);
}

async function lies(ordner, datei, fehler) {
  try {
    return JSON.parse(await readFile(path.join(ordner, datei), 'utf8'));
  } catch (grund) {
    fehler.push(`${datei}: nicht lesbar (${grund.message})`);
    return null;
  }
}

function istText(wert) {
  return typeof wert === 'string' && wert.trim().length > 0;
}

function zuLang(text) {
  return istText(text) && text.trim().split(/\s+/).length > MAX_WOERTER;
}

// Alle Teilmengen einer kleinen Liste (für «Probieren muss immer Quatsch ergeben»).
function teilmengen(liste) {
  return liste.reduce((mengen, eintrag) => [...mengen, ...mengen.map((menge) => [...menge, eintrag])], [[]]);
}

export async function pruefeInhalte(ordner = STANDARD_ORDNER, sprachen = ['de']) {
  const fehler = [];
  const regeln = await lies(ordner, 'regeln.json', fehler);
  const lehrplan = await lies(ordner, 'lehrplan.json', fehler);
  const fakten = await lies(ordner, 'fakten.json', fehler);

  if (regeln) {
    if (!Number.isInteger(regeln.erfolgeFuerMeisterschaft) || regeln.erfolgeFuerMeisterschaft < 1) {
      fehler.push('regeln.json: erfolgeFuerMeisterschaft muss eine ganze Zahl ab 1 sein');
    }
    const abstaende = regeln.wiederholungsAbstaende ?? [];
    if (abstaende.length === 0 || abstaende.some((a, i) => i > 0 && a <= abstaende[i - 1])) {
      fehler.push('regeln.json: wiederholungsAbstaende müssen wachsen');
    }
    // Ausweg nach so vielen Durchgängen ohne Fortschritt (E-047).
    if (!Number.isInteger(regeln.durchgaengeBisAusweg) || regeln.durchgaengeBisAusweg < 1) {
      fehler.push('regeln.json: durchgaengeBisAusweg muss eine ganze Zahl ab 1 sein');
    }
  }

  if (lehrplan) {
    const kapitelIds = new Set(lehrplan.kapitel.map((k) => k.id));
    const gesehen = new Set();
    let letztesKapitel = 0;
    for (const konzept of lehrplan.konzepte) {
      if (gesehen.has(konzept.id)) fehler.push(`lehrplan.json: Konzept «${konzept.id}» ist doppelt`);
      if (!kapitelIds.has(konzept.kapitel)) fehler.push(`lehrplan.json: «${konzept.id}» hat ein unbekanntes Kapitel`);
      if (konzept.kapitel < letztesKapitel) fehler.push(`lehrplan.json: «${konzept.id}» steht nicht in Kapitel-Reihenfolge`);
      for (const voraussetzung of konzept.braucht ?? []) {
        // Ein Konzept darf nur auf Konzepte bauen, die vorher eingeführt wurden.
        if (!gesehen.has(voraussetzung)) {
          fehler.push(`lehrplan.json: «${konzept.id}» braucht «${voraussetzung}», das nicht vorher kommt`);
        }
      }
      gesehen.add(konzept.id);
      letztesKapitel = konzept.kapitel;
    }

    for (const sprache of sprachen) {
      const texte = await lies(ordner, `${sprache}/texte.json`, fehler);
      const lexikon = await lies(ordner, `${sprache}/lexikon.json`, fehler);
      if (!texte || !lexikon) continue;
      // Nachgezeichnete Bildschirme für «In echt».
      const schirmDatei = await liesWennDa(ordner, `${sprache}/schirme.json`, fehler);
      const schirme = schirmDatei?.schirme ?? {};
      pruefeSchirme(schirme, `${sprache}/schirme.json`, fehler);

      for (const kapitel of lehrplan.kapitel) {
        const eintrag = texte.kapitel?.[kapitel.id];
        if (!istText(eintrag?.name) || !istText(eintrag?.thema)) {
          fehler.push(`${sprache}/texte.json: Kapitel ${kapitel.id} braucht name und thema`);
        }
      }
      for (const konzept of lehrplan.konzepte) {
        const eintrag = texte.konzepte?.[konzept.id];
        if (!istText(eintrag?.name) || !istText(eintrag?.analogie)) {
          fehler.push(`${sprache}/texte.json: Konzept «${konzept.id}» braucht name und analogie`);
        }
      }
      for (const [id, eintrag] of Object.entries(lexikon)) {
        const name = `${sprache}/lexikon.json «${id}»`;
        if (!istText(eintrag.begriff) || !istText(eintrag.erklaerung)) fehler.push(`${name}: braucht begriff und erklaerung`);
        if (eintrag.kern && !gesehen.has(eintrag.kern)) fehler.push(`${name}: unbekanntes Kernkonzept`);
        for (const feld of ['erklaerung', 'quatsch', 'genauer']) {
          if (zuLang(eintrag[feld])) fehler.push(`${name}: ${feld} hat mehr als ${MAX_WOERTER} Wörter`);
        }
      }

      // Zierde fürs Zentrale: Jedes Ding braucht einen Preis und einen Namen.
      const einrichtung = await lies(ordner, 'einrichtung.json', fehler);
      for (const ding of einrichtung?.dinge ?? []) {
        if (!(Number.isInteger(ding.preis) && ding.preis > 0)) fehler.push(`einrichtung.json: «${ding.id}» braucht einen Preis`);
        if (!istText(texte.app?.einrichtung?.[ding.id])) fehler.push(`${sprache}/texte.json: Name für «${ding.id}» fehlt`);
      }
      // «Über dieses Spiel»: Texte vorhanden, kurz, Adressen gültig (E-045).
      pruefeUeber(texte.app ?? {}, `${sprache}/texte.json`, fehler);
      // Hinweise und Ausweg bei freien Situationen (E-047).
      for (const feld of ['hilfeRegel', 'schonGesehen', 'auswegText', 'auswegKnopf', 'verschobenTitel', 'verschobenText']) {
        const text = texte.app?.[feld];
        if (!istText(text)) fehler.push(`${sprache}/texte.json: ${feld} fehlt`);
        else if (zuLang(text)) fehler.push(`${sprache}/texte.json: ${feld} hat mehr als ${MAX_WOERTER} Wörter`);
      }
      // Freiwillige Fragen: genau eine richtige Antwort pro Frage.
      const umfrage = await lies(ordner, `${sprache}/umfrage.json`, fehler);
      for (const frage of umfrage?.fragen ?? []) {
        const name = `${sprache}/umfrage.json «${frage.id}»`;
        if (!istText(frage.frage) || zuLang(frage.frage)) fehler.push(`${name}: frage fehlt oder ist zu lang`);
        if ((frage.optionen ?? []).filter((o) => o.richtig).length !== 1) fehler.push(`${name}: genau eine Antwort muss richtig sein`);
        if ((frage.optionen ?? []).some((o) => !istText(o.text))) fehler.push(`${name}: Antwort ohne text`);
      }

      let dateien = [];
      try {
        dateien = (await readdir(path.join(ordner, sprache, 'auftraege'))).filter((d) => d.endsWith('.json'));
      } catch {
        fehler.push(`${sprache}/auftraege: Ordner fehlt`);
      }
      for (const datei of dateien) {
        const name = `${sprache}/auftraege/${datei}`;
        const auftrag = await lies(ordner, name, fehler);
        if (auftrag) pruefeAuftrag(auftrag, name, { regeln, konzepte: gesehen, texte, lexikon, schirme }, fehler);
      }
    }
  }

  if (fakten) {
    for (const fakt of fakten.fakten ?? []) {
      if (!istText(fakt.id) || !istText(fakt.aussage)) fehler.push('fakten.json: Eintrag ohne id oder aussage');
      if (!/^https:\/\//.test(fakt.quelle ?? '')) fehler.push(`fakten.json: «${fakt.id}» braucht eine Quelle (https)`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fakt.geprueft ?? '')) fehler.push(`fakten.json: «${fakt.id}» braucht ein Prüfdatum (JJJJ-MM-TT)`);
    }
  }

  return fehler;
}

// Teil «Über dieses Spiel» in den Einstellungen. Die Kontakt-Adresse darf leer sein, dann fehlt der Kontakt im Spiel.
export function pruefeUeber(app, name, fehler) {
  const pflicht = ['ueberEtikett', 'ueberDatenEtikett', 'ueberDaten', 'ueberGithubLink',
    'ueberInoffiziellEtikett', 'ueberInoffiziell', 'ueberKontaktEtikett', 'ueberKontakt'];
  for (const feld of pflicht) {
    if (!istText(app[feld])) fehler.push(`${name}: ${feld} fehlt`);
    else if (zuLang(app[feld])) fehler.push(`${name}: ${feld} hat mehr als ${MAX_WOERTER} Wörter`);
  }
  if (!/^https:\/\/\S+$/.test(app.ueberGithubAdresse ?? '')) fehler.push(`${name}: ueberGithubAdresse braucht eine https-Adresse`);
  const adresse = app.ueberKontaktAdresse ?? '';
  if (typeof adresse !== 'string' || (adresse.trim() !== '' && !/^[^\s@<>"]+@[^\s@<>"]+\.[A-Za-z]{2,}$/.test(adresse.trim()))) {
    fehler.push(`${name}: ueberKontaktAdresse ist keine gültige E-Mail-Adresse (oder leer lassen)`);
  }
}

export function pruefeAuftrag(auftrag, name, { regeln, konzepte, texte, lexikon, schirme = {} }, fehler) {
  for (const feld of ['id', 'kunde', 'wunsch', 'kundenstimme', 'ueberraschung']) {
    if (!istText(auftrag[feld])) fehler.push(`${name}: ${feld} fehlt`);
    if (zuLang(auftrag[feld])) fehler.push(`${name}: ${feld} hat mehr als ${MAX_WOERTER} Wörter`);
  }
  for (const id of auftrag.lexikon ?? []) {
    if (!lexikon[id]) fehler.push(`${name}: Lexikon-Eintrag «${id}» fehlt`);
  }
  // Einsatzschrank (Agentenbüro, E-016): Titel und Anleitung kurz, die Vorlage ist ein echter Prompt und darf länger sein.
  if (auftrag.schrank) {
    for (const feld of ['titel', 'wo']) {
      if (!istText(auftrag.schrank[feld])) fehler.push(`${name}: schrank.${feld} fehlt`);
      if (zuLang(auftrag.schrank[feld])) fehler.push(`${name}: schrank.${feld} hat mehr als ${MAX_WOERTER} Wörter`);
    }
    if (!istText(auftrag.schrank.vorlage)) fehler.push(`${name}: schrank.vorlage fehlt`);
    else if (auftrag.schrank.vorlage.split(/\s+/).length > 200) fehler.push(`${name}: schrank.vorlage hat mehr als 200 Wörter`);
    for (const feld of ['schrankKnopf', 'schrankTitel', 'schrankInfo', 'schrankLeer', 'schrankVorlage', 'schrankWo',
      'schrankKopieren', 'schrankKopiert', 'schrankKopierenNicht', 'schrankNeu', 'schrankOeffnen']) {
      if (!istText(texte.app?.[feld])) fehler.push(`texte.json: ${feld} fehlt (gebraucht für den Einsatzschrank)`);
    }
    // Probefahrt (E-029): ein Weg zum Durchklicken aus diesem Auftrag und zwei bis sechs Punkte zum Abhaken.
    const probe = auftrag.schrank.probefahrt;
    if (probe) {
      if (auftrag.aufgaben?.[probe.aufgabe]?.typ !== 'klick') fehler.push(`${name}: schrank.probefahrt.aufgabe muss eine Aufgabe zum Durchklicken sein`);
      const punkte = probe.punkte ?? [];
      if (punkte.length < 2 || punkte.length > 6) fehler.push(`${name}: schrank.probefahrt braucht zwei bis sechs Punkte`);
      if (new Set(punkte.map((p) => p.id)).size !== punkte.length) fehler.push(`${name}: schrank.probefahrt hat doppelte Punkte`);
      if (punkte.some((p) => !istText(p.id) || !istText(p.text) || zuLang(p.text))) fehler.push(`${name}: schrank.probefahrt: Punkt ohne id, ohne text oder zu lang`);
      for (const feld of ['schrankProbefahrt', 'schrankProbefahrtInfo', 'schrankWegZeigen']) {
        if (!istText(texte.app?.[feld])) fehler.push(`texte.json: ${feld} fehlt (gebraucht für die Probefahrt)`);
      }
    }
  }
  // Anleitungen im Lexikon (E-033): Konzept einer Runde dieses Auftrags, Wege zum Durchklicken oder Einstellen.
  if (auftrag.anleitungen) {
    const { konzept, wege = [] } = auftrag.anleitungen;
    if (!(auftrag.runden ?? []).some((runde) => runde.konzept === konzept)) fehler.push(`${name}: anleitungen.konzept «${konzept}» hat keine Runde in diesem Auftrag`);
    if (wege.length === 0) fehler.push(`${name}: anleitungen braucht mindestens einen Weg`);
    const gesehenWege = new Set();
    for (const weg of wege) {
      const typ = auftrag.aufgaben?.[weg.aufgabe]?.typ;
      if (typ !== 'klick' && typ !== 'einstellen') fehler.push(`${name}: Anleitung «${weg.aufgabe}» muss eine Aufgabe zum Durchklicken oder Einstellen sein`);
      if (!istText(weg.titel) || zuLang(weg.titel)) fehler.push(`${name}: Anleitung «${weg.aufgabe}» braucht einen kurzen titel`);
      if (gesehenWege.has(weg.aufgabe)) fehler.push(`${name}: Anleitung «${weg.aufgabe}» ist doppelt`);
      gesehenWege.add(weg.aufgabe);
    }
    for (const feld of ['anleitungenTitel', 'anleitungenInfo', 'anleitungZu', 'anleitungEingestellt']) {
      if (!istText(texte.app?.[feld])) fehler.push(`texte.json: ${feld} fehlt (gebraucht für die Anleitungen im Lexikon)`);
    }
  }
  // Eigene Gruppennamen einer Aufgabe (artNamen): nur bekannte Arten, kurze Texte.
  for (const [id, aufgabe] of Object.entries(auftrag.aufgaben ?? {})) {
    for (const [art, text] of Object.entries(aufgabe.artNamen ?? {})) {
      if (!ARTEN.includes(art)) fehler.push(`${name} Aufgabe ${id}: artNamen nennt unbekannte Art «${art}»`);
      if (!istText(text) || zuLang(text)) fehler.push(`${name} Aufgabe ${id}: artNamen.${art} fehlt oder ist zu lang`);
    }
  }
  // Schweizer Schreibweise: nirgends ein scharfes S (Wunsch des Besitzers).
  if (JSON.stringify(auftrag).includes('ß')) fehler.push(`${name}: enthält ein scharfes S, bitte «ss» schreiben`);
  const aufgaben = auftrag.aufgaben ?? {};
  const benutzt = new Set();
  const kennt = (id, wo) => {
    benutzt.add(id);
    if (!aufgaben[id]) fehler.push(`${name}: ${wo} verweist auf unbekannte Aufgabe «${id}»`);
    return aufgaben[id];
  };

  for (const runde of auftrag.runden ?? []) {
    const wo = `${name} Runde ${runde.id}`;
    const mindestens = runde.art === 'misch' ? 1 : (regeln?.erfolgeFuerMeisterschaft ?? 3) + 1;
    if ((runde.frei ?? []).length < mindestens) fehler.push(`${wo}: braucht mindestens ${mindestens} freie Situationen`);
    for (const id of runde.frei ?? []) kennt(id, wo);

    if (runde.art === 'misch') {
      if (!istText(runde.titel)) fehler.push(`${wo}: Mischrunde braucht einen titel`);
      continue;
    }
    // Jede Konzept-Runde hat alle fünf Schritte: Probieren, Aha, Beispiel, Lücke, Frei.
    if (!konzepte.has(runde.konzept)) fehler.push(`${wo}: unbekanntes Konzept «${runde.konzept}»`);
    const konzeptText = texte.konzepte?.[runde.konzept];
    const aha = konzeptText?.aha ?? [];
    if (aha.length < 1 || aha.length > 3) fehler.push(`${wo}: Aha braucht ein bis drei Sätze`);
    if (!istText(konzeptText?.tipp)) fehler.push(`${wo}: Konzept «${runde.konzept}» braucht einen tipp`);
    if (lexikon[runde.konzept]?.kern !== runde.konzept) fehler.push(`${wo}: Lexikon-Eintrag für «${runde.konzept}» fehlt`);

    const probieren = kennt(runde.probieren?.aufgabe, `${wo} Probieren`);
    if (probieren?.typ === 'klick' || probieren?.typ === 'einstellen') {
      // Durchklicken und Einstellen: Probieren ist frei, es gibt keine Teile zum Weglassen.
      if (runde.probieren.nurTeile) fehler.push(`${wo}: Probieren mit Bildschirm braucht keine nurTeile`);
    } else if (probieren) {
      // Beim Probieren muss jede mögliche Auswahl Quatsch ergeben.
      for (const menge of teilmengen(runde.probieren.nurTeile ?? [])) {
        if (bewerte(probieren, menge).ok) fehler.push(`${wo}: Probieren lässt sich lösen (${menge.join(', ')})`);
      }
    }
    kennt(runde.beispiel?.aufgabe, `${wo} Beispiel`);
    const luecke = kennt(runde.luecke?.aufgabe, `${wo} Lücke`);
    if (luecke) {
      const vorgabe = runde.luecke.vorgabe ?? [];
      const loesung = loesungVon(luecke) ?? [];
      if (vorgabe.some((id) => !loesung.includes(id))) fehler.push(`${wo}: Vorgabe der Lücke gehört nicht zur Lösung`);
      // Beim Durchklicken ist die Vorgabe der Anfang des Wegs: die ersten Schritte, schon getippt.
      if (luecke.typ === 'klick' && (vorgabe.length === 0 || vorgabe.some((id, i) => loesung[i] !== id))) {
        fehler.push(`${wo}: Vorgabe der Lücke muss der Anfang des Wegs sein`);
      }
      const startwahl = luecke.typ === 'einstellen' ? startVon(luecke, vorgabe) : vorgabe;
      if (bewerte(luecke, startwahl).ok) fehler.push(`${wo}: Die Lücke ist schon gelöst`);
    }
  }

  for (const [id, aufgabe] of Object.entries(aufgaben)) {
    if (!benutzt.has(id)) fehler.push(`${name}: Aufgabe «${id}» wird nirgends verwendet`);
    pruefeAufgabe(aufgabe, `${name} Aufgabe ${id}`, fehler, schirme);
  }
}

// Eine Aufgabe ist in Ordnung, wenn ihre Lösung besteht, ein leerer Prompt scheitert
// und jedes Fehlbild mehrere Varianten und einen erklärenden Hinweis hat.
export function pruefeAufgabe(aufgabe, name, fehler, schirme = {}) {
  if (aufgabe.typ === 'wahl') {
    pruefeWahl(aufgabe, name, fehler);
    return;
  }
  if (aufgabe.typ === 'reihe') {
    pruefeReihe(aufgabe, name, fehler, schirme);
    return;
  }
  if (aufgabe.typ === 'klick') {
    pruefeKlick(aufgabe, name, fehler, schirme);
    return;
  }
  if (aufgabe.typ === 'einstellen') {
    pruefeEinstellen(aufgabe, name, fehler, schirme);
    return;
  }
  if (aufgabe.typ) {
    fehler.push(`${name}: unbekannte Übungsform «${aufgabe.typ}»`);
    return;
  }
  if (!istText(aufgabe.wunsch)) fehler.push(`${name}: wunsch fehlt`);
  if (!istText(aufgabe.grundprompt)) fehler.push(`${name}: grundprompt fehlt`);
  if (!Array.isArray(aufgabe.erfolg) || aufgabe.erfolg.length < 1) fehler.push(`${name}: mindestens ein Erfolgstext nötig`);

  const ids = new Set();
  for (const teil of aufgabe.teile ?? []) {
    if (ids.has(teil.id)) fehler.push(`${name}: Teil «${teil.id}» ist doppelt`);
    ids.add(teil.id);
    if (!istText(teil.text)) fehler.push(`${name}: Teil «${teil.id}» braucht einen text`);
    if (!ARTEN.includes(teil.art)) fehler.push(`${name}: Teil «${teil.id}» hat eine unbekannte art`);
    if ('ampel' in teil && !['gruen', 'gelb', 'rot'].includes(teil.ampel)) fehler.push(`${name}: Teil «${teil.id}» hat eine unbekannte ampel`);
  }

  const fehlbilder = aufgabe.fehlbilder ?? {};
  const erreichbar = new Set();
  for (const pruefung of aufgabe.pruefungen ?? []) {
    erreichbar.add(pruefung.fehlbild);
    if (!fehlbilder[pruefung.fehlbild]) fehler.push(`${name}: Fehlbild «${pruefung.fehlbild}» fehlt`);
    const genannt = [...(pruefung.wenn.gewaehlt ?? []), ...(pruefung.wenn.fehlt ?? []), ...(pruefung.wenn.aus ?? [])];
    if ('tokensUeber' in pruefung.wenn && !Number.isInteger(pruefung.wenn.tokensUeber)) fehler.push(`${name}: tokensUeber muss eine ganze Zahl sein`);
    for (const id of genannt) {
      if (!ids.has(id)) fehler.push(`${name}: Prüfung nennt unbekanntes Teil «${id}»`);
    }
  }
  for (const [id, fehlbild] of Object.entries(fehlbilder)) {
    if (!erreichbar.has(id)) fehler.push(`${name}: Fehlbild «${id}» wird von keiner Prüfung benutzt`);
    if ((fehlbild.texte ?? []).length < 2) fehler.push(`${name}: Fehlbild «${id}» braucht mindestens zwei Varianten`);
    if (!istText(fehlbild.hinweis)) fehler.push(`${name}: Fehlbild «${id}» braucht einen Hinweis`);
    if ('ausgabeTokens' in fehlbild && !(Number.isInteger(fehlbild.ausgabeTokens) && fehlbild.ausgabeTokens > 0)) fehler.push(`${name}: Fehlbild «${id}» hat ungültige ausgabeTokens`);
  }

  // Budget und Kontextfenster müssen zu den Prüfungen passen, sonst zeigt die Anzeige etwas anderes als die Bewertung.
  const grenzen = (aufgabe.pruefungen ?? []).map((pruefung) => pruefung.wenn.tokensUeber).filter(Number.isInteger);
  for (const feld of ['budget', 'fenster', 'eng']) {
    if (feld in aufgabe && !grenzen.includes(aufgabe[feld])) fehler.push(`${name}: ${feld} hat keine passende Prüfung tokensUeber`);
  }
  for (const teil of aufgabe.teile ?? []) {
    if ('tokens' in teil && !(Number.isInteger(teil.tokens) && teil.tokens > 0)) fehler.push(`${name}: Teil «${teil.id}» hat ungültige tokens`);
  }

  const loesung = aufgabe.loesung ?? [];
  if (loesung.some((id) => !ids.has(id))) fehler.push(`${name}: Lösung nennt ein unbekanntes Teil`);
  if (aufgabe.pruefungen) {
    if (!bewerte(aufgabe, loesung).ok) fehler.push(`${name}: Die Lösung besteht die eigenen Prüfungen nicht`);
    if (bewerte(aufgabe, []).ok) fehler.push(`${name}: Ein leerer Prompt gilt als richtig`);
    // Jedes Teil der Lösung muss nötig sein. Sonst gilt eine halbe Lösung als richtig.
    // Ausnahme: Teile einer Gruppe «aus … höchstens» (zum Beispiel «mindestens zwei Beispiele»).
    const inGruppe = new Set((aufgabe.pruefungen ?? []).flatMap((pruefung) => pruefung.wenn.aus ?? []));
    for (const id of loesung.filter((teil) => !inGruppe.has(teil))) {
      if (bewerte(aufgabe, loesung.filter((andere) => andere !== id)).ok) fehler.push(`${name}: Lösung ohne «${id}» gilt auch als richtig`);
    }
  } else {
    fehler.push(`${name}: pruefungen fehlen`);
  }

  const texte = [
    aufgabe.wunsch, aufgabe.grundprompt, ...(aufgabe.erfolg ?? []),
    ...(aufgabe.teile ?? []).map((teil) => teil.text),
    ...Object.values(fehlbilder).flatMap((fehlbild) => [...(fehlbild.texte ?? []), fehlbild.hinweis]),
  ];
  if (texte.some(zuLang)) fehler.push(`${name}: Ein Text hat mehr als ${MAX_WOERTER} Wörter`);
}

// Übungsform «Sortieren»: mindestens drei Schritte, die Lösung nennt jeden genau einmal,
// und die gezeigte Anfangsreihenfolge ist noch nicht die Lösung.
function pruefeReihe(aufgabe, name, fehler, schirme) {
  for (const feld of ['wunsch', 'frage', 'echo']) {
    if (!istText(aufgabe[feld])) fehler.push(`${name}: ${feld} fehlt`);
  }
  const schritte = aufgabe.schritte ?? [];
  const ids = schritte.map((schritt) => schritt.id);
  if (schritte.length < 3) fehler.push(`${name}: mindestens drei Schritte nötig`);
  if (schritte.some((schritt) => !istText(schritt.text))) fehler.push(`${name}: Schritt ohne text`);
  const loesung = aufgabe.loesung ?? [];
  if (new Set(ids).size !== ids.length || loesung.length !== ids.length || [...loesung].sort().join() !== [...ids].sort().join()) {
    fehler.push(`${name}: Die Lösung muss jeden Schritt genau einmal nennen`);
  }
  if (bewerte(aufgabe, ids).ok) fehler.push(`${name}: Die Schritte stehen schon in der richtigen Reihenfolge`);
  if (!bewerte(aufgabe, loesung).ok) fehler.push(`${name}: Die Lösung besteht nicht`);
  if ((aufgabe.daneben?.texte ?? []).length < 2 || !istText(aufgabe.daneben?.hinweis)) fehler.push(`${name}: daneben braucht zwei Varianten und einen Hinweis`);
  // Ein Schritt kann ein kleines Bild zeigen. Dann muss es den Bildschirm und die gezeigte Stelle geben.
  for (const schritt of schritte.filter((s) => s.schirm)) {
    const schirm = loeseSchirm(schirme, schritt.schirm);
    if (!schirm) fehler.push(`${name}: Schritt «${schritt.id}» zeigt unbekannten Bildschirm «${schritt.schirm}»`);
    else if (schritt.ziel && !stellenVon(schirm).includes(schritt.ziel)) fehler.push(`${name}: Schritt «${schritt.id}»: Stelle «${schritt.ziel}» gibt es im Bild nicht`);
  }
  const texte = [aufgabe.wunsch, aufgabe.frage, aufgabe.echo, ...schritte.map((s) => s.text), ...(aufgabe.daneben?.texte ?? []), aufgabe.daneben?.hinweis];
  if (texte.some(zuLang)) fehler.push(`${name}: Ein Text hat mehr als ${MAX_WOERTER} Wörter`);
}

// Übungsform «Vorhersagen»: genau eine richtige Antwort, jede Antwort mit Erklärung.
function pruefeWahl(aufgabe, name, fehler) {
  for (const feld of ['wunsch', 'frage', 'echo']) {
    if (!istText(aufgabe[feld])) fehler.push(`${name}: ${feld} fehlt`);
  }
  const optionen = aufgabe.optionen ?? [];
  if (optionen.length < 2) fehler.push(`${name}: mindestens zwei Antworten nötig`);
  const richtige = optionen.filter((option) => option.richtig);
  if (richtige.length !== 1) fehler.push(`${name}: genau eine Antwort muss richtig sein`);
  if (new Set(optionen.map((option) => option.id)).size !== optionen.length) fehler.push(`${name}: Antwort doppelt`);
  for (const option of optionen) {
    if (!istText(option.text) || !istText(option.hinweis)) fehler.push(`${name}: Antwort «${option.id}» braucht text und hinweis`);
  }
  if (aufgabe.loesung?.length !== 1 || aufgabe.loesung[0] !== richtige[0]?.id) fehler.push(`${name}: loesung muss die richtige Antwort nennen`);
  for (const anteil of aufgabe.anteile ?? []) {
    if (!istText(anteil.wort) || ![1, 2, 3].includes(anteil.stufe)) fehler.push(`${name}: anteile brauchen wort und stufe 1 bis 3`);
  }
  const texte = [aufgabe.wunsch, aufgabe.frage, aufgabe.echo, ...optionen.flatMap((option) => [option.text, option.hinweis])];
  if (texte.some(zuLang)) fehler.push(`${name}: Ein Text hat mehr als ${MAX_WOERTER} Wörter`);
}

// Fehlbilder der Bildschirm-Übungen: jedes wird benutzt, hat zwei Varianten und einen Hinweis.
function pruefeFehlbilder(fehlbilder, benutzt, name, fehler) {
  for (const id of benutzt) {
    if (!fehlbilder[id]) fehler.push(`${name}: Fehlbild «${id}» fehlt`);
  }
  for (const [id, fehlbild] of Object.entries(fehlbilder)) {
    if (!benutzt.has(id)) fehler.push(`${name}: Fehlbild «${id}» wird nirgends benutzt`);
    if ((fehlbild.texte ?? []).length < 2) fehler.push(`${name}: Fehlbild «${id}» braucht mindestens zwei Varianten`);
    if (!istText(fehlbild.hinweis)) fehler.push(`${name}: Fehlbild «${id}» braucht einen Hinweis`);
    if ((fehlbild.texte ?? []).some((text) => text.includes('{teil}'))) fehler.push(`${name}: Fehlbild «${id}»: {teil} gibt es hier nicht`);
  }
}

// Übungsform «Durchklicken»: Jeder Schritt zeigt einen bekannten Bildschirm, die richtige Stelle gibt es darin,
// und es gibt dort mindestens eine falsche Stelle zum Antippen. Jeder Fehltipp führt zu einem Fehlbild.
function pruefeKlick(aufgabe, name, fehler, schirme) {
  for (const feld of ['wunsch', 'frage']) {
    if (!istText(aufgabe[feld])) fehler.push(`${name}: ${feld} fehlt`);
  }
  if (!Array.isArray(aufgabe.erfolg) || aufgabe.erfolg.length < 1) fehler.push(`${name}: mindestens ein Erfolgstext nötig`);
  // Die Lösung steht nur einmal in den Daten: als Ziel jedes Schritts (Regel 11).
  if ('loesung' in aufgabe) fehler.push(`${name}: Durchklicken braucht keine loesung, sie steht in den Schritten (ziel)`);
  const schritte = aufgabe.schritte ?? [];
  if (schritte.length < 2) fehler.push(`${name}: mindestens zwei Schritte nötig`);
  const benutzt = new Set();
  for (const [nr, schritt] of schritte.entries()) {
    const wo = `${name} Schritt ${nr + 1}`;
    if (!istText(schritt.text)) fehler.push(`${wo}: text fehlt`);
    const schirm = loeseSchirm(schirme, schritt.schirm);
    if (!schirm) {
      fehler.push(`${wo}: unbekannter Bildschirm «${schritt.schirm}»`);
      continue;
    }
    const stellen = stellenVon(schirm);
    if (!stellen.includes(schritt.ziel)) fehler.push(`${wo}: Stelle «${schritt.ziel}» gibt es im Bild «${schritt.schirm}» nicht`);
    if (stellen.length < 2) fehler.push(`${wo}: Im Bild braucht es mindestens eine falsche Stelle zum Antippen`);
    for (const [stelle, fehlbild] of Object.entries(schritt.falsch ?? {})) {
      if (!stellen.includes(stelle)) fehler.push(`${wo}: falsch nennt Stelle «${stelle}», die es im Bild nicht gibt`);
      if (stelle === schritt.ziel) fehler.push(`${wo}: Die richtige Stelle steht auch unter falsch`);
      benutzt.add(fehlbild);
    }
    if (!istText(schritt.sonst)) fehler.push(`${wo}: sonst fehlt (Fehlbild für alle übrigen Stellen)`);
    else benutzt.add(schritt.sonst);
  }
  if (aufgabe.nachher && !loeseSchirm(schirme, aufgabe.nachher)) fehler.push(`${name}: unbekannter Bildschirm nachher «${aufgabe.nachher}»`);
  pruefeFehlbilder(aufgabe.fehlbilder ?? {}, benutzt, name, fehler);
  if (schritte.length > 0 && !bewerte(aufgabe, loesungVon(aufgabe)).ok) fehler.push(`${name}: Der richtige Weg besteht nicht`);
  const texte = [aufgabe.wunsch, aufgabe.frage, ...(aufgabe.erfolg ?? []), ...schritte.map((s) => s.text),
    ...Object.values(aufgabe.fehlbilder ?? {}).flatMap((f) => [...(f.texte ?? []), f.hinweis])];
  if (texte.some(zuLang)) fehler.push(`${name}: Ein Text hat mehr als ${MAX_WOERTER} Wörter`);
}

// Startzustand einer Übung «Einstellen»: wie in der echten App, dann die Vorgabe darüber.
function startVon(aufgabe, vorgabe = []) {
  const wahl = new Map((aufgabe.zeilen ?? []).map((zeile) => [zeile.id, zeile.start]));
  for (const id of vorgabe) {
    const zeile = (aufgabe.zeilen ?? []).find((z) => z.optionen.some((o) => o.id === id));
    if (zeile) wahl.set(zeile.id, id);
  }
  return [...wahl.values()];
}

// Übungsform «Einstellen im Bild»: jede Zeile mit Startwert und mindestens zwei Optionen,
// die Lösung stellt jede Zeile genau einmal ein und besteht, der Startzustand besteht nicht.
// Von jedem möglichen Zustand aus führt die Hilfe «Zeig mir, wo» zur Lösung.
function pruefeEinstellen(aufgabe, name, fehler, schirme) {
  const vorher = fehler.length;
  for (const feld of ['wunsch', 'frage']) {
    if (!istText(aufgabe[feld])) fehler.push(`${name}: ${feld} fehlt`);
  }
  if (!Array.isArray(aufgabe.erfolg) || aufgabe.erfolg.length < 1) fehler.push(`${name}: mindestens ein Erfolgstext nötig`);
  if (!loeseSchirm(schirme, aufgabe.schirm)) fehler.push(`${name}: unbekannter Bildschirm «${aufgabe.schirm}»`);
  const zeilen = aufgabe.zeilen ?? [];
  if (zeilen.length < 1) fehler.push(`${name}: mindestens eine Zeile nötig`);
  const optionIds = new Set();
  for (const zeile of zeilen) {
    if (!istText(zeile.text)) fehler.push(`${name}: Zeile «${zeile.id}» braucht einen text`);
    if ((zeile.optionen ?? []).length < 2) fehler.push(`${name}: Zeile «${zeile.id}» braucht mindestens zwei Optionen`);
    for (const option of zeile.optionen ?? []) {
      if (optionIds.has(option.id)) fehler.push(`${name}: Option «${option.id}» ist doppelt`);
      optionIds.add(option.id);
      if (!istText(option.text)) fehler.push(`${name}: Option «${option.id}» braucht einen text`);
    }
    if (!(zeile.optionen ?? []).some((o) => o.id === zeile.start)) fehler.push(`${name}: Zeile «${zeile.id}» braucht einen gültigen start`);
    const inLoesung = (zeile.optionen ?? []).filter((o) => (aufgabe.loesung ?? []).includes(o.id));
    if (inLoesung.length !== 1) fehler.push(`${name}: Die Lösung muss Zeile «${zeile.id}» genau einmal einstellen`);
  }
  if ((aufgabe.loesung ?? []).some((id) => !optionIds.has(id))) fehler.push(`${name}: Lösung nennt eine unbekannte Option`);
  const benutzt = new Set();
  for (const pruefung of aufgabe.pruefungen ?? []) {
    benutzt.add(pruefung.fehlbild);
    for (const id of [...(pruefung.wenn.gewaehlt ?? []), ...(pruefung.wenn.fehlt ?? []), ...(pruefung.wenn.aus ?? [])]) {
      if (!optionIds.has(id)) fehler.push(`${name}: Prüfung nennt unbekannte Option «${id}»`);
    }
    if ('tokensUeber' in pruefung.wenn) fehler.push(`${name}: tokensUeber passt nicht zum Einstellen`);
  }
  pruefeFehlbilder(aufgabe.fehlbilder ?? {}, benutzt, name, fehler);
  if (!aufgabe.pruefungen) {
    fehler.push(`${name}: pruefungen fehlen`);
  } else if (fehler.length === vorher) {
    // Nur wenn der Aufbau stimmt: sonst gäbe es Folgefehler.
    if (!bewerte(aufgabe, aufgabe.loesung).ok) fehler.push(`${name}: Die Lösung besteht die eigenen Prüfungen nicht`);
    if (bewerte(aufgabe, startVon(aufgabe)).ok) fehler.push(`${name}: Schon der Startzustand gilt als richtig`);
    // Alle Zustände durchgehen (wenige Zeilen, wenige Optionen): Die Hilfe muss jedes Mal weiterführen.
    const zustaende = zeilen.reduce((liste, zeile) => liste.flatMap((wahl) => zeile.optionen.map((o) => [...wahl, o.id])), [[]]);
    for (const zustand of zustaende.slice(0, 500)) {
      let wahl = zustand;
      for (let schritt = 0; schritt <= zeilen.length && !bewerte(aufgabe, wahl).ok; schritt += 1) {
        const hilfe = hilfeTeil(aufgabe, wahl);
        if (!hilfe) break;
        const zeile = zeilen.find((z) => z.optionen.some((o) => o.id === hilfe.id));
        wahl = wahl.map((id) => (zeile.optionen.some((o) => o.id === id) ? hilfe.id : id));
      }
      if (!bewerte(aufgabe, wahl).ok) {
        fehler.push(`${name}: Hilfe führt von [${zustand}] nicht zur Lösung`);
        break;
      }
    }
  }
  const texte = [aufgabe.wunsch, aufgabe.frage, ...(aufgabe.erfolg ?? []),
    ...zeilen.flatMap((z) => [z.text, z.unter, ...(z.optionen ?? []).map((o) => o.text)]),
    ...Object.values(aufgabe.fehlbilder ?? {}).flatMap((f) => [...(f.texte ?? []), f.hinweis])];
  if (texte.some(zuLang)) fehler.push(`${name}: Ein Text hat mehr als ${MAX_WOERTER} Wörter`);
}

// Die nachgezeichneten Bildschirme: Jeder lässt sich auflösen, kennt nur bekannte Bausteine,
// hat jede antippbare Stelle nur einmal, ein Datum (Stand) und kurze Texte.
export function pruefeSchirme(schirme, name, fehler) {
  if (JSON.stringify(schirme).includes('ß')) fehler.push(`${name}: enthält ein scharfes S, bitte «ss» schreiben`);
  for (const id of Object.keys(schirme)) {
    const wo = `${name} «${id}»`;
    const schirm = loeseSchirm(schirme, id);
    if (!schirm) {
      fehler.push(`${wo}: Basis fehlt oder verweist im Kreis`);
      continue;
    }
    const einschub = schirme[id].einschub;
    if (einschub && !stellenVon(loeseSchirm(schirme, schirme[id].basis) ?? {}).includes(einschub.nach)) fehler.push(`${wo}: einschub.nach nennt «${einschub.nach}», das es in der Basis nicht gibt`);
    if (!/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(schirm.stand ?? '')) fehler.push(`${wo}: braucht ein Datum «stand» (TT.MM.JJJJ)`);
    if (!istText(schirm.fenster)) fehler.push(`${wo}: braucht einen Fensternamen`);
    for (const baustein of schirm.inhalt ?? []) {
      if (!SCHIRM_ARTEN.includes(baustein.art)) fehler.push(`${wo}: unbekannter Baustein «${baustein.art}»`);
    }
    const stellen = stellenVon(schirm);
    const doppelt = stellen.filter((stelle, i) => stellen.indexOf(stelle) !== i);
    if (doppelt.length > 0) fehler.push(`${wo}: Stelle doppelt: ${[...new Set(doppelt)].join(', ')}`);
    // Hervorheben lässt sich jede antippbare Stelle und jeder Eintrag ohne id über seinen Text.
    const namen = new Set([...stellenVon(schirm),
      ...[...(schirm.kopfleiste ?? []), ...(schirm.seitenleiste ?? []), ...(schirm.inhalt ?? []).flatMap((b) => b.eintraege ?? [])].map((e) => e.text)]);
    for (const aktiv of schirm.aktiv ?? []) {
      if (!namen.has(aktiv)) fehler.push(`${wo}: aktiv nennt «${aktiv}», das es nicht gibt`);
    }
    const texte = eintraegeVon(schirm).map((e) => e.text).concat((schirm.inhalt ?? []).map((b) => b.text));
    if (texte.some(zuLang)) fehler.push(`${wo}: Ein Text hat mehr als ${MAX_WOERTER} Wörter`);
  }
}

// Direkter Aufruf von der Kommandozeile
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const fehler = await pruefeInhalte();
  if (fehler.length === 0) {
    console.log('Lerninhalte: alles in Ordnung.');
  } else {
    console.error(`Lerninhalte: ${fehler.length} Fehler gefunden.`);
    for (const zeile of fehler) console.error(` - ${zeile}`);
    process.exit(1);
  }
}
