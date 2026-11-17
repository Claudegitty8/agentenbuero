// Erzeugt docs/LEHRPLAN.md aus den Inhaltsdateien. So bleibt der Lehrplan immer gleich wie das Spiel.
// Aufruf: node werkzeuge/lehrplan-doku.mjs [datum]
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AUFTRAEGE } from '../spiel/code/inhalte/lader.js';

const WURZEL = fileURLToPath(new URL('..', import.meta.url));
const lies = async (datei) => JSON.parse(await readFile(path.join(WURZEL, 'spiel/inhalte', datei), 'utf8'));
const paket = JSON.parse(await readFile(path.join(WURZEL, 'package.json'), 'utf8'));
const datum = process.argv[2] ?? new Date().toLocaleDateString('de-CH');

const lehrplan = await lies('lehrplan.json');
const texte = await lies('de/texte.json');
const lexikon = await lies('de/lexikon.json');
const auftraege = await Promise.all(AUFTRAEGE.map((id) => lies(`de/auftraege/${id}.json`)));
const version = paket.version.replace(/\.0$/, '');

const FORM = { wahl: 'Vorhersagen', reihe: 'Sortieren', klick: 'Durchklicken', einstellen: 'Einstellen im Bild' };
const form = (aufgabe) => FORM[aufgabe.typ] ?? 'Zusammenstecken';
const name = (id) => texte.konzepte[id].name;
const kapitelName = (nr) => `${nr} ${texte.kapitel[nr].name}`;
const gespielt = new Set(auftraege.flatMap((a) => a.runden.map((r) => r.konzept).filter(Boolean)));

// Alle Hinweise einer Aufgabe, in der Reihenfolge der Aufgaben, ohne Doppelte.
function hinweise(auftrag, ids) {
  const liste = [];
  for (const id of ids) {
    const aufgabe = auftrag.aufgaben[id];
    if (aufgabe.typ === 'wahl') liste.push(...aufgabe.optionen.filter((o) => !o.richtig).map((o) => o.hinweis));
    else if (aufgabe.typ === 'reihe') liste.push(aufgabe.daneben.hinweis);
    else liste.push(...Object.values(aufgabe.fehlbilder).map((f) => f.hinweis));
  }
  return [...new Set(liste)];
}

const zeilen = [
  '# Lehrplan',
  '',
  `Stand: ${datum} · Version ${version}. Aus den Inhaltsdateien erzeugt mit \`node werkzeuge/lehrplan-doku.mjs\`. Die Tabelle «Mechanik ist das Konzept» steht in \`KONZEPT.md\`.`,
  '',
  '## Übersicht',
  '',
  '| Nr | Konzept | Kapitel | Braucht | Merkbild | Spielbar |',
  '|---|---|---|---|---|---|',
  ...lehrplan.konzepte.map((k, i) => `| ${i + 1} | ${name(k.id)} | ${kapitelName(k.kapitel)} | ${k.braucht.map(name).join(', ') || '–'} | ${texte.konzepte[k.id].analogie} | ${gespielt.has(k.id) ? 'ja' : 'später'} |`),
  '',
  '## Aufträge',
  '',
  '| Nr | Auftrag | Kapitel | Auftraggeber | Runden | Aufgaben | Einsatzschrank |',
  '|---|---|---|---|---|---|---|',
  ...auftraege.map((a, i) => `| ${i + 1} | ${a.titel} | ${kapitelName(a.kapitel)} | ${a.kunde} | ${a.runden.length} | ${Object.keys(a.aufgaben).length} | ${a.schrank?.titel ?? '–'} |`),
  '',
];

for (const auftrag of auftraege) {
  zeilen.push(`## Kapitel ${kapitelName(auftrag.kapitel).replace(' ', ': ')} – Auftrag «${auftrag.titel}»`, '');
  zeilen.push(`Auftraggeber: ${auftrag.kunde}. Wunsch: «${auftrag.wunsch}»`, '');
  for (const runde of auftrag.runden) {
    if (runde.art === 'misch') {
      zeilen.push(`### Mischrunde «${runde.titel}»`, '');
      zeilen.push(...runde.frei.map((id) => `- ${id}, ${form(auftrag.aufgaben[id])}: «${auftrag.aufgaben[id].wunsch}»`), '');
      continue;
    }
    const k = texte.konzepte[runde.konzept];
    const eintrag = lexikon[runde.konzept];
    zeilen.push(`### ${k.name}`, '');
    zeilen.push(`- **Lernziel:** ${k.tipp}`);
    zeilen.push(`- **Merkbild:** ${k.analogie}`);
    zeilen.push(`- **Aha:** ${k.aha.join(' ')}`);
    zeilen.push(`- **Lexikon:** ${eintrag ? `${eintrag.begriff} (${eintrag.englisch})` : '–'}`);
    zeilen.push(`- **Probieren und Beispiel:** ${runde.probieren.aufgabe} (nur sichtbar: ${runde.probieren.nurTeile.join(', ')})`);
    zeilen.push(`- **Lücke:** ${runde.luecke.aufgabe} (schon gesteckt: ${runde.luecke.vorgabe.join(', ')})`);
    zeilen.push('- **Frei:**');
    zeilen.push(...runde.frei.map((id) => `  - ${id}, ${form(auftrag.aufgaben[id])}: «${auftrag.aufgaben[id].wunsch}»`));
    zeilen.push('- **Typische Fehler und was Echo dann tut (Hinweise):**');
    const ids = [runde.probieren.aufgabe, runde.luecke.aufgabe, ...runde.frei];
    zeilen.push(...hinweise(auftrag, [...new Set(ids)]).map((h) => `  - ${h}`), '');
  }
  if (auftrag.schrank) zeilen.push(`**Einsatzschrank:** ${auftrag.schrank.titel}. ${auftrag.schrank.wo}`, '');
}

await writeFile(path.join(WURZEL, 'docs/LEHRPLAN.md'), `${zeilen.join('\n').trimEnd()}\n`);
console.log(`docs/LEHRPLAN.md geschrieben: ${lehrplan.konzepte.length} Konzepte, ${auftraege.length} Aufträge.`);
