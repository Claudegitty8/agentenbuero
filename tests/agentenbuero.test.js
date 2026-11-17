// Tests für die Inhalte des Agentenbüros (nicht für die Testvorlage aus dem KI-Studio).
// Drei Durchspiele nach Wissensspeicher 5.3: guter Spieler, schwacher Spieler, nur Schnelltest.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { AUFTRAEGE } from '../spiel/code/inhalte/lader.js';
import {
  neuerStand, starteAuftrag, ansicht, weiter, verbucheFrei, verbucheWiederholungsErgebnis,
  auswegOffen, ueberspringeRunde,
} from '../spiel/code/logik/ablauf.js';
import { istGemeistert } from '../spiel/code/logik/meisterschaft.js';
import { schnelltestAufgaben, verbucheSchnelltest, wandleUm } from '../spiel/code/logik/extras.js';
import { schrankInhalt } from '../spiel/code/logik/schrank.js';
import { erstelleKi } from '../spiel/code/ki/schnittstelle.js';
import { pruefeAuftrag } from '../werkzeuge/pruefe-inhalte.mjs';
import { loesungVon } from '../spiel/code/logik/bewertung.js';

const lies = async (pfad) => JSON.parse(await readFile(new URL(`../spiel/inhalte/${pfad}`, import.meta.url), 'utf8'));
const regeln = await lies('regeln.json');
const lehrplan = await lies('lehrplan.json');
const texte = await lies('de/texte.json');
const lexikon = await lies('de/lexikon.json');
const alle = await Promise.all(AUFTRAEGE.map((id) => lies(`de/auftraege/${id}.json`)));
const GEZAEHLT = { ok: true, zaehlt: true };
const NICHT_GEZAEHLT = { ok: true, zaehlt: false };

// Konzepte, für die es eine Runde gibt. Seit Version 0.9 sind das alle Konzepte des Lehrplans.
const spielbar = alle.flatMap((a) => a.runden.filter((r) => r.art === 'konzept').map((r) => r.konzept));

// Spielt alle Aufträge durch. «stark»: jede freie Situation zählt. «schwach»: nie, dann nimmt er den Ausweg.
function spieleAlles(art) {
  let stand = neuerStand();
  for (const auftrag of alle) {
    stand = starteAuftrag(stand, auftrag, regeln, alle);
    let ereignis = 'weiter';
    let schritte = 0;
    while (ereignis !== 'auftragFertig') {
      schritte += 1;
      assert.ok(schritte < 400, `«${auftrag.id}» darf nicht hängen bleiben (${art})`);
      const sicht = ansicht(stand, auftrag);
      if (sicht.art === 'wiederholung') {
        stand = verbucheWiederholungsErgebnis(stand, regeln, art === 'stark');
      } else if (sicht.art === 'frei') {
        if (art === 'schwach' && auswegOffen(stand, auftrag, regeln)) ({ stand, ereignis } = ueberspringeRunde(stand, auftrag, regeln, alle));
        else ({ stand, ereignis } = verbucheFrei(stand, auftrag, regeln, art === 'stark' ? GEZAEHLT : NICHT_GEZAEHLT, alle));
      } else if (sicht.art === 'misch') {
        ({ stand, ereignis } = verbucheFrei(stand, auftrag, regeln, art === 'stark' ? GEZAEHLT : NICHT_GEZAEHLT, alle));
      } else {
        stand = weiter(stand, auftrag);
      }
    }
  }
  return stand;
}

test('Agentenbüro: Ein guter Spieler kommt durch, alle spielbaren Konzepte sind gemeistert', () => {
  const stand = spieleAlles('stark');
  assert.deepEqual(stand.erledigt, AUFTRAEGE);
  for (const id of spielbar) assert.ok(istGemeistert(stand.fortschritt[id], regeln), `«${id}» ist gemeistert`);
  // Alle Lexikon-Einträge, die es schon gibt, sind am Ende offen.
  assert.deepEqual([...stand.lexikon].sort(), Object.keys(lexikon).sort());
});

test('Agentenbüro: Ein schwacher Spieler, der nie ohne Hilfe löst, bleibt nie hängen', () => {
  const stand = spieleAlles('schwach');
  assert.deepEqual(stand.erledigt, AUFTRAEGE);
  // Was er übersprungen hat, holt er als Wiederholung nach.
  assert.ok(spielbar.some((id) => stand.fortschritt[id]?.nachholen), 'Übersprungenes wird nachgeholt');
});

test('Agentenbüro: Mit bestandenem Schnelltest geht es direkt zur Mischrunde', () => {
  for (const auftrag of alle) {
    const reihe = schnelltestAufgaben(auftrag, regeln);
    const konzepteHier = auftrag.runden.filter((r) => r.art === 'konzept').map((r) => r.konzept);
    assert.equal(reihe.length, konzepteHier.length * 3, 'drei Schnelltest-Aufgaben pro Konzept');
    const { stand, bestanden } = verbucheSchnelltest(neuerStand(), auftrag, regeln, reihe.map((e) => ({ ...e, richtig: true })));
    assert.deepEqual(bestanden, konzepteHier);
    assert.equal(ansicht(starteAuftrag(stand, auftrag, regeln, alle), auftrag).art, 'misch');
  }
});

test('Agentenbüro: Die Konzept-Runden folgen der Reihenfolge des Lehrplans', () => {
  const reihenfolge = lehrplan.konzepte.map((k) => k.id);
  // Ab Version 0.9 ist das Spiel vollständig: jedes Konzept genau einmal, in Lehrplan-Reihenfolge.
  assert.deepEqual(spielbar, reihenfolge);
  assert.equal(lehrplan.konzepte.length, 21);
  assert.equal(lehrplan.kapitel.length, 6);
});

test('Agentenbüro: Jeder Wunsch kommt nur einmal vor, jede Lösung besteht', async () => {
  const wuensche = alle.flatMap((auftrag) => Object.values(auftrag.aufgaben).map((a) => a.wunsch));
  assert.equal(new Set(wuensche).size, wuensche.length);
  const ki = erstelleKi('simuliert');
  for (const auftrag of alle) {
    for (const [id, aufgabe] of Object.entries(auftrag.aufgaben)) {
      const antwort = await ki.antworte({ aufgabe, auswahl: loesungVon(aufgabe), versuch: 0 });
      assert.equal(antwort.ok, true, `${auftrag.id} ${id}`);
    }
  }
});

test('Agentenbüro: Kein Fehlbild zeigt einen leeren Platzhalter', async () => {
  // {teil} darf nur in Fehlbildern stehen, deren Prüfung genau ein Teil übrig lässt (aus + hoechstens 1).
  for (const auftrag of alle) {
    for (const [id, aufgabe] of Object.entries(auftrag.aufgaben)) {
      for (const pruefung of aufgabe.pruefungen ?? []) {
        const mitPlatzhalter = aufgabe.fehlbilder[pruefung.fehlbild].texte.some((text) => text.includes('{teil}'));
        if (!mitPlatzhalter) continue;
        const vorher = aufgabe.pruefungen.slice(0, aufgabe.pruefungen.indexOf(pruefung));
        const nullAbgefangen = vorher.some((p) => p.wenn.hoechstens === 0 && String(p.wenn.aus) === String(pruefung.wenn.aus));
        assert.ok(pruefung.wenn.hoechstens === 1 && nullAbgefangen, `${auftrag.id} ${id}: {teil} könnte leer bleiben`);
      }
    }
  }
});

test('Einsatzschrank: leer am Anfang, nach dem Auftrag die Vorlage', () => {
  assert.deepEqual(schrankInhalt(neuerStand(), alle), []);
  const stand = spieleAlles('stark');
  const inhalt = schrankInhalt(stand, alle);
  assert.equal(inhalt.length, alle.filter((a) => a.schrank).length);
  assert.ok(inhalt.every((e) => e.vorlage.length > 50 && e.titel && e.wo));
});

test('Einsatzschrank: kaputte oder alte Stände ergeben einfach einen leeren Schrank', () => {
  assert.deepEqual(schrankInhalt(undefined, alle), []);
  assert.deepEqual(schrankInhalt({ erledigt: ['gibt-es-nicht'] }, alle), []);
  assert.deepEqual(schrankInhalt(wandleUm('{kaputt'), alle), []);
  assert.deepEqual(schrankInhalt(neuerStand(), undefined), []);
});

test('Inhaltsprüfung: findet fehlende Teile des Einsatzschranks und ein scharfes S', () => {
  const fehler = [];
  const auftrag = { ...alle[0], schrank: { titel: 'Grüsse', vorlage: '' }, wunsch: 'Strasse mit ß' };
  pruefeAuftrag(auftrag, 'probe', { regeln, konzepte: new Set(spielbar), texte: { app: {} }, lexikon }, fehler);
  assert.ok(fehler.some((f) => f.includes('schrank.wo fehlt')));
  assert.ok(fehler.some((f) => f.includes('schrank.vorlage fehlt')));
  assert.ok(fehler.some((f) => f.includes('schrankKopieren fehlt')));
  assert.ok(fehler.some((f) => f.includes('scharfes S')));
});

test('Texte: Echo und die Zentrale heissen überall gleich, keine Wörter aus dem KI-Studio', () => {
  const alles = JSON.stringify({ texte, lexikon, alle });
  for (const alt of ['Kiwi', 'Garage', 'Studio', 'Spiel-Tokens', 'sechs Fragen', 'Sechs kurze', 'Kundschaft hat nachgefüllt']) assert.ok(!alles.includes(alt), `«${alt}» kommt noch vor`);
  assert.ok(!alles.includes('ß'));
});

test('Hilfe «Zeig mir, wo»: Von jeder Auswahl aus führt sie Schritt für Schritt zur Lösung', async () => {
  // Gefunden beim Durchspielen: Bei vollem Koffer zeigte die Hilfe nichts an.
  const { hilfeTeil, bewerte } = await import('../spiel/code/logik/bewertung.js');
  for (const auftrag of alle) {
    for (const [id, aufgabe] of Object.entries(auftrag.aufgaben)) {
      if (aufgabe.typ) continue;
      const ids = aufgabe.teile.map((teil) => teil.id);
      for (let maske = 0; maske < (1 << ids.length); maske += 1) {
        let wahl = ids.filter((_, stelle) => maske & (1 << stelle));
        for (let schritt = 0; schritt <= ids.length && !bewerte(aufgabe, wahl).ok; schritt += 1) {
          const hilfe = hilfeTeil(aufgabe, wahl);
          assert.ok(hilfe, `${auftrag.id}/${id}: keine Hilfe bei [${wahl}]`);
          wahl = hilfe.grund === 'zuviel' ? wahl.filter((teil) => teil !== hilfe.id) : [...wahl, hilfe.id];
        }
        assert.ok(bewerte(aufgabe, wahl).ok, `${auftrag.id}/${id}: Hilfe führt nicht zur Lösung`);
      }
    }
  }
});
