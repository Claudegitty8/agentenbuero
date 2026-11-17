// Tests für die Übungen «In echt»: nachgezeichnete Bildschirme, Durchklicken und Einstellen im Bild.
// Die Probe-Aufgaben hier sind erfunden und klein, damit jede Regel einzeln sichtbar wird.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SCHIRM_ARTEN, loeseSchirm, stellenVon, istAktiv, schrittText } from '../spiel/code/logik/schirme.js';
import { BAUSTEIN_ARTEN } from '../spiel/code/oberflaeche/schirm.js';
import { bewerte, hilfeTeil, loesungVon } from '../spiel/code/logik/bewertung.js';
import { zaehleTokens } from '../spiel/code/logik/prompt.js';
import { erstelleKi } from '../spiel/code/ki/schnittstelle.js';
import { pruefeAufgabe, pruefeSchirme } from '../werkzeuge/pruefe-inhalte.mjs';

const lies = async (pfad) => JSON.parse(await readFile(new URL(`../spiel/inhalte/${pfad}`, import.meta.url), 'utf8'));
const echteSchirme = (await lies('de/schirme.json')).schirme;

const SCHIRME = {
  grund: {
    stand: '17.11.2026',
    fenster: 'Claude',
    seitenleiste: [{ id: 'neu', text: '+ Neu' }, { id: 'anpassungen', text: 'Anpassungen' }, { text: 'Deine Chats' }],
    inhalt: [{ art: 'eingabe', id: 'eingabe', text: 'Schreib …', knoepfe: [{ id: 'plus', text: '+' }] }],
  },
  skills: {
    basis: 'grund',
    aktiv: ['anpassungen', 'reiterSkills'],
    inhalt: [
      { art: 'reiter', eintraege: [{ id: 'reiterSkills', text: 'Skills' }, { id: 'reiterKonnektoren', text: 'Konnektoren' }] },
      { art: 'knoepfe', eintraege: [{ id: 'hinzufuegen', text: '+ Hinzufügen' }] },
    ],
  },
  kreisA: { basis: 'kreisB', inhalt: [] },
  kreisB: { basis: 'kreisA', inhalt: [] },
};

const fehlbild = (hinweis) => ({ texte: [`${hinweis} Erstens.`, `${hinweis} Zweitens.`], hinweis });

const KLICK = {
  typ: 'klick',
  wunsch: 'Wo lädst du den Skill hoch?',
  frage: 'Tippe dich zum Hochladen durch.',
  schritte: [
    { schirm: 'grund', ziel: 'anpassungen', text: 'Links auf «Anpassungen».', falsch: { plus: 'plusChat' }, sonst: 'daneben' },
    { schirm: 'skills', ziel: 'hinzufuegen', text: 'Oben rechts «+ Hinzufügen».', sonst: 'daneben' },
  ],
  nachher: 'skills',
  erfolg: ['Geschafft.'],
  fehlbilder: { plusChat: fehlbild('Das Plus im Chat hängt eine Datei an.'), daneben: fehlbild('Hier geht es nicht weiter.') },
};

const EINSTELLEN = {
  typ: 'einstellen',
  wunsch: 'Welche Werkzeuge darf Claude ohne Nachfrage benutzen?',
  frage: 'Stell die Rechte ein.',
  schirm: 'skills',
  zeilen: [
    { id: 'lesen', text: 'Termine lesen', start: 'lesenFrag', optionen: [{ id: 'lesenImmer', text: 'Immer' }, { id: 'lesenFrag', text: 'Nachfragen' }, { id: 'lesenNie', text: 'Nie' }] },
    { id: 'senden', text: 'Mail senden', start: 'sendenImmer', optionen: [{ id: 'sendenImmer', text: 'Immer' }, { id: 'sendenFrag', text: 'Nachfragen' }, { id: 'sendenNie', text: 'Nie' }] },
  ],
  loesung: ['lesenImmer', 'sendenFrag'],
  pruefungen: [
    { wenn: { gewaehlt: ['sendenImmer'] }, fehlbild: 'freiSenden' },
    { wenn: { gewaehlt: ['lesenNie', 'lesenFrag'] }, fehlbild: 'zuStreng' },
  ],
  erfolg: ['Gut eingestellt.'],
  fehlbilder: { freiSenden: fehlbild('Senden ohne Nachfrage ist heikel.'), zuStreng: fehlbild('Lesen schadet nicht.') },
};

test('Bildschirme: Basis wird übernommen, Kreise und Unbekanntes ergeben null', () => {
  const skills = loeseSchirm(SCHIRME, 'skills');
  assert.equal(skills.fenster, 'Claude');
  assert.equal(skills.stand, '17.11.2026');
  assert.deepEqual(stellenVon(skills), ['neu', 'anpassungen', 'reiterSkills', 'reiterKonnektoren', 'hinzufuegen']);
  assert.ok(istAktiv(skills, skills.seitenleiste[1]));
  assert.ok(!istAktiv(skills, skills.seitenleiste[0]));
  // Ein offenes Menü wird direkt unter der Stelle eingefügt, der Rest kommt aus der Basis.
  const mitMenue = loeseSchirm({ ...SCHIRME, menue: { basis: 'skills', einschub: { nach: 'reiterSkills', inhalt: [{ art: 'menue', eintraege: [{ id: 'hoch', text: 'Hochladen' }] }] } } }, 'menue');
  assert.deepEqual(mitMenue.inhalt.map((b) => b.art), ['reiter', 'menue', 'knoepfe']);
  assert.deepEqual(mitMenue.aktiv, ['anpassungen', 'reiterSkills']);
  assert.equal(loeseSchirm(SCHIRME, 'kreisA'), null);
  assert.equal(loeseSchirm(SCHIRME, 'gibtEsNicht'), null);
  assert.equal(loeseSchirm(undefined, 'grund'), null);
});

test('Durchklicken: {ziel} im Schritt wird zur Beschriftung der richtigen Stelle', () => {
  assert.equal(schrittText({ schirm: 'skills', ziel: 'hinzufuegen', text: 'Tippe auf «{ziel}».' }, SCHIRME), 'Tippe auf «+ Hinzufügen».');
  assert.equal(schrittText({ schirm: 'skills', ziel: 'x', text: 'Ohne Platzhalter.' }, SCHIRME), 'Ohne Platzhalter.');
  // Pfeile für Menüs gehören nicht in den Text: «Skills ›» wird zu «Skills».
  assert.equal(schrittText({ schirm: 'menue', ziel: 'm', text: '«{ziel}»' }, { menue: { inhalt: [{ art: 'menue', eintraege: [{ id: 'm', text: 'Skills ›' }] }] } }), '«Skills»');
});

test('Bildschirme: Logik und Oberfläche kennen dieselben Bausteine', () => {
  assert.deepEqual([...BAUSTEIN_ARTEN].sort(), [...SCHIRM_ARTEN].sort());
});

test('Durchklicken: nur der ganze richtige Weg gilt, jeder Fehltipp hat sein Fehlbild', () => {
  assert.deepEqual(loesungVon(KLICK), ['anpassungen', 'hinzufuegen']);
  assert.equal(bewerte(KLICK, ['anpassungen', 'hinzufuegen']).ok, true);
  assert.equal(bewerte(KLICK, ['plus']).fehlbild, 'plusChat'); // eigene Erklärung für genau diese Stelle
  assert.equal(bewerte(KLICK, ['neu']).fehlbild, 'daneben'); // alle anderen Stellen
  assert.equal(bewerte(KLICK, ['anpassungen', 'neu']).fehlbild, 'daneben');
  assert.equal(bewerte(KLICK, ['anpassungen']).ok, false); // zu früh abgegeben
  assert.equal(bewerte(KLICK, []).fehlbild, 'daneben');
  assert.equal(bewerte(KLICK, ['anpassungen', 'hinzufuegen', 'neu']).ok, false);
  assert.equal(zaehleTokens(KLICK, ['plus']) > 0, true);
});

test('Durchklicken: «Zeig mir, wo» zeigt immer die nächste richtige Stelle', () => {
  assert.deepEqual(hilfeTeil(KLICK, []), { id: 'anpassungen', grund: 'tippen' });
  assert.deepEqual(hilfeTeil(KLICK, ['plus']), { id: 'anpassungen', grund: 'tippen' });
  assert.deepEqual(hilfeTeil(KLICK, ['anpassungen']), { id: 'hinzufuegen', grund: 'tippen' });
  assert.equal(hilfeTeil(KLICK, ['anpassungen', 'hinzufuegen']), null);
});

test('Einstellen: Prüfungen wie beim Zusammenstecken, die Hilfe zeigt die passende Einstellung', () => {
  assert.equal(bewerte(EINSTELLEN, EINSTELLEN.loesung).ok, true);
  assert.equal(bewerte(EINSTELLEN, ['lesenFrag', 'sendenImmer']).fehlbild, 'freiSenden');
  assert.equal(bewerte(EINSTELLEN, ['lesenNie', 'sendenFrag']).fehlbild, 'zuStreng');
  // Auch «Nie» beim Senden ist in Ordnung: Es gibt mehr als eine gute Einstellung.
  assert.equal(bewerte(EINSTELLEN, ['lesenImmer', 'sendenNie']).ok, true);
  assert.deepEqual(hilfeTeil(EINSTELLEN, ['lesenFrag', 'sendenImmer']), { id: 'sendenFrag', grund: 'einstellen' });
  assert.deepEqual(hilfeTeil(EINSTELLEN, ['lesenNie', 'sendenFrag']), { id: 'lesenImmer', grund: 'einstellen' });
  assert.equal(hilfeTeil(EINSTELLEN, EINSTELLEN.loesung), null);
});

test('Echo antwortet bei beiden neuen Formen mit Erfolg oder dem passenden Fehlbild', async () => {
  const ki = erstelleKi('simuliert');
  const gut = await ki.antworte({ aufgabe: KLICK, auswahl: loesungVon(KLICK), versuch: 0 });
  assert.equal(gut.ok, true);
  assert.equal(gut.text, 'Geschafft.');
  const falsch = await ki.antworte({ aufgabe: KLICK, auswahl: ['plus'], versuch: 1 });
  assert.equal(falsch.text, 'Das Plus im Chat hängt eine Datei an. Zweitens.');
  assert.equal(falsch.hinweis, 'Das Plus im Chat hängt eine Datei an.');
  const einstellen = await ki.antworte({ aufgabe: EINSTELLEN, auswahl: ['lesenFrag', 'sendenImmer'], versuch: 0 });
  assert.equal(einstellen.ok, false);
  assert.equal(einstellen.hinweis, 'Senden ohne Nachfrage ist heikel.');
});

test('Inhaltsprüfung: Probe-Aufgaben sind in Ordnung', () => {
  const fehler = [];
  pruefeAufgabe(KLICK, 'klick', fehler, SCHIRME);
  pruefeAufgabe(EINSTELLEN, 'einstellen', fehler, SCHIRME);
  assert.deepEqual(fehler, []);
});

test('Inhaltsprüfung: findet Fehler beim Durchklicken', () => {
  const fehler = [];
  pruefeAufgabe({
    ...KLICK,
    loesung: ['anpassungen'],
    schritte: [
      { ...KLICK.schritte[0], falsch: { plus: 'gibtsNicht', anpassungen: 'daneben', woanders: 'daneben' } },
      { schirm: 'unbekannt', ziel: 'x', text: 'Dort.', sonst: 'daneben' },
    ],
  }, 'k', fehler, SCHIRME);
  for (const erwartet of ['braucht keine loesung', 'Fehlbild «gibtsNicht» fehlt', 'richtige Stelle steht auch unter falsch',
    'Stelle «woanders»', 'unbekannter Bildschirm «unbekannt»', 'Fehlbild «plusChat» wird nirgends benutzt']) {
    assert.ok(fehler.some((f) => f.includes(erwartet)), `erwartet: ${erwartet}\n${fehler.join('\n')}`);
  }
  const zweiter = [];
  pruefeAufgabe({ ...KLICK, schritte: [{ ...KLICK.schritte[0], ziel: 'gibtsNicht' }] }, 'k', zweiter, SCHIRME);
  assert.ok(zweiter.some((f) => f.includes('mindestens zwei Schritte')));
  assert.ok(zweiter.some((f) => f.includes('Stelle «gibtsNicht» gibt es im Bild')));
});

test('Inhaltsprüfung: findet Fehler beim Einstellen', () => {
  const fehler = [];
  pruefeAufgabe({ ...EINSTELLEN, zeilen: EINSTELLEN.zeilen.map((z) => ({ ...z, start: z.id === 'lesen' ? 'lesenImmer' : 'sendenFrag' })) }, 'e', fehler, SCHIRME);
  assert.ok(fehler.some((f) => f.includes('Startzustand gilt als richtig')));
  const zweiter = [];
  pruefeAufgabe({ ...EINSTELLEN, loesung: ['lesenImmer', 'lesenFrag', 'sendenFrag'] }, 'e', zweiter, SCHIRME);
  assert.ok(zweiter.some((f) => f.includes('Zeile «lesen» genau einmal')));
  const dritter = [];
  pruefeAufgabe({ ...EINSTELLEN, pruefungen: [{ wenn: { gewaehlt: ['sendenImmer'] }, fehlbild: 'freiSenden' }] }, 'e', dritter, SCHIRME);
  assert.ok(dritter.some((f) => f.includes('Fehlbild «zuStreng» wird nirgends benutzt')));
});

test('Inhaltsprüfung: findet Fehler in den Bildschirmen', () => {
  const fehler = [];
  pruefeSchirme({
    ...SCHIRME,
    ohneStand: { fenster: 'X', inhalt: [{ art: 'gibtsNicht' }, { art: 'knoepfe', eintraege: [{ id: 'a', text: 'Grösse' }, { id: 'a', text: 'b' }] }] },
    falschAktiv: { basis: 'grund', aktiv: ['niemand'], inhalt: [] },
    falscherEinschub: { basis: 'skills', einschub: { nach: 'gibtsNicht', inhalt: [] } },
  }, 's', fehler);
  for (const erwartet of ['«kreisA»: Basis fehlt', '«ohneStand»: braucht ein Datum', 'unbekannter Baustein «gibtsNicht»',
    'Stelle doppelt: a', 'aktiv nennt «niemand»', 'einschub.nach nennt «gibtsNicht»']) {
    assert.ok(fehler.some((f) => f.includes(erwartet)), `erwartet: ${erwartet}\n${fehler.join('\n')}`);
  }
  const mitSz = [];
  pruefeSchirme({ grund: { ...SCHIRME.grund, fenster: 'Strasse ß' } }, 's', mitSz);
  assert.ok(mitSz.some((f) => f.includes('scharfes S')));
});

test('Echte Bildschirme: alle in Ordnung und ohne private Chattitel', () => {
  const fehler = [];
  pruefeSchirme(echteSchirme, 'de/schirme.json', fehler);
  assert.deepEqual(fehler, []);
  // Die Vorlage (Bildschirmfoto des Besitzers) zeigt private Chats. Davon darf nichts im Spiel stehen.
  const alles = JSON.stringify(echteSchirme);
  for (const privat of ['Arc Raiders', 'Anka', 'Kia', 'Raider', 'Spielerisch Lernen', 'Hund']) assert.ok(!alles.includes(privat), privat);
});

test('Probefahrt: Haken bleiben im Spielstand, kaputte Einträge werden verworfen', async () => {
  const { neuerStand } = await import('../spiel/code/logik/ablauf.js');
  const { wandleUm } = await import('../spiel/code/logik/extras.js');
  const { hakeAb, schrankInhalt } = await import('../spiel/code/logik/schrank.js');
  const auftrag = {
    id: 'probe',
    schrank: { titel: 'T', vorlage: 'V', wo: 'W', probefahrt: { aufgabe: 'k', punkte: [{ id: 'a', text: 'Eins' }, { id: 'b', text: 'Zwei' }] } },
    aufgaben: { k: KLICK },
  };
  let stand = { ...neuerStand(), erledigt: ['probe'] };
  assert.deepEqual(stand.probefahrt, {});
  stand = hakeAb(stand, 'probe', 'b', true);
  stand = hakeAb(stand, 'probe', 'a', true);
  stand = hakeAb(stand, 'probe', 'a', false);
  const [eintrag] = schrankInhalt(stand, [auftrag]);
  assert.equal(eintrag.probefahrt.aufgabe, KLICK);
  assert.deepEqual(eintrag.probefahrt.punkte.map((p) => p.erledigt), [false, true]);
  // Gespeichert und wieder geladen: die Haken sind noch da. Alte Stände ohne Feld bekommen ein leeres.
  assert.deepEqual(wandleUm(JSON.parse(JSON.stringify(stand))).probefahrt, { probe: ['b'] });
  const { probefahrt: _, ...alt } = stand;
  assert.deepEqual(wandleUm(alt).probefahrt, {});
  assert.deepEqual(wandleUm({ ...stand, probefahrt: { probe: [1, 'b', 'b'], kaputt: 'x', leer: [] } }).probefahrt, { probe: ['b'] });
  assert.deepEqual(wandleUm({ ...stand, probefahrt: ['x'] }).probefahrt, {});
});

test('Inhaltsprüfung: Probefahrt braucht eine Aufgabe zum Durchklicken und zwei bis sechs Punkte', async () => {
  const { pruefeAuftrag } = await import('../werkzeuge/pruefe-inhalte.mjs');
  const fehler = [];
  pruefeAuftrag({
    id: 'p', kunde: 'K', wunsch: 'W', kundenstimme: 'S', ueberraschung: 'U', runden: [], aufgaben: {},
    schrank: { titel: 'T', vorlage: 'V', wo: 'W', probefahrt: { aufgabe: 'gibtsNicht', punkte: [{ id: 'a', text: 'Eins' }] } },
  }, 'p', { regeln: {}, konzepte: new Set(), texte: { app: {} }, lexikon: {} }, fehler);
  assert.ok(fehler.some((f) => f.includes('Aufgabe zum Durchklicken')));
  assert.ok(fehler.some((f) => f.includes('zwei bis sechs Punkte')));
  assert.ok(fehler.some((f) => f.includes('schrankProbefahrt fehlt')));
});
