// Spielt das Agentenbüro im echten Browser durch (Wissensspeicher 5.3, Prüfliste 9.1 Punkt 3).
// Aufruf: node werkzeuge/durchspiel-browser.mjs [ordner-fuer-bilder]
// Braucht Playwright und Chrome. Pfade über PLAYWRIGHT und CHROME, sonst die Pfade der Claude-Umgebung.
// Prüft: guter Spieler kommt durch, schwacher Spieler (nur «Lösung zeigen», dann Ausweg) kommt durch,
// Einsatzschrank kopiert die Vorlage, keine Fehler in der Konsole, nichts ragt über den Rand.
import { spawn } from 'node:child_process';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = fileURLToPath(new URL('..', import.meta.url));
const { chromium } = await import(process.env.PLAYWRIGHT ?? '/opt/npm-tools/node_modules/playwright/index.mjs');
const CHROME = process.env.CHROME ?? '/usr/bin/google-chrome';
const BILDER = process.argv[2] ?? path.join(WURZEL, '..', 'bildschirm');
const ADRESSE = 'http://localhost:8080/';

const lies = async (datei) => JSON.parse(await readFile(path.join(WURZEL, 'spiel/inhalte', datei), 'utf8'));
const t = (await lies('de/texte.json')).app;
const { AUFTRAEGE } = await import('../spiel/code/inhalte/lader.js');
const auftraege = await Promise.all(AUFTRAEGE.map((id) => lies(`de/auftraege/${id}.json`)));
const aufgaben = auftraege.flatMap((a) => Object.entries(a.aufgaben).map(([id, aufgabe]) => ({ ...aufgabe, kennung: `${a.id}/${id}` })));
// Von diesen Aufgaben macht der gute Spieler ein Bildschirmfoto: je eine Art Aufgabe aus jedem Kapitel.
const FOTO_AUFGABEN = ['nussgipfel/z-a', 'notenstaender/w-a', 'notenstaender/d-a', 'notenstaender/l-a', 'ochsen/f-a', 'ochsen/e-a',
  'generalversammlung/s-a', 'generalversammlung/s-c', 'generalversammlung/k-a', 'ferienplan/fa-a', 'ferienplan/pr-a',
  'odermatt/hk-a', 'odermatt/pk-a', 'dorffest/df-a', 'dorffest/df-k'];

const probleme = [];
const melde = (text) => { probleme.push(text); console.log(`PROBLEM: ${text}`); };

async function sichtbar(seite, text) {
  const knopfOrt = seite.getByRole('button', { name: text, exact: true });
  return (await knopfOrt.count()) > 0 && (await knopfOrt.first().isVisible());
}
async function drueck(seite, text) {
  await seite.getByRole('button', { name: text, exact: true }).first().click();
}

// Ragt etwas waagrecht über den Rand?
async function pruefeBreite(seite, wo) {
  const zuBreit = await seite.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  if (zuBreit) melde(`${wo}: Inhalt ragt waagrecht über den Rand`);
}

// Welche Aufgabe ist gerade zu sehen? Der Wunsch ist im ganzen Spiel eindeutig.
async function aktuelleAufgabe(seite) {
  const text = await seite.locator('main').innerText();
  return aufgaben.find((a) => text.includes(a.wunsch));
}

// Stellt die Lösung ein (stark) oder lässt alles, wie es ist (schwach drückt «Lösung zeigen»).
async function loese(seite, aufgabe) {
  if (aufgabe.typ === 'reihe') {
    // Sortieren: jeden Schritt mit «nach oben» an seinen Platz schieben, von oben nach unten.
    const textVon = new Map(aufgabe.schritte.map((schritt) => [schritt.id, schritt.text]));
    for (const [ziel, id] of aufgabe.loesung.entries()) {
      const text = textVon.get(id);
      for (let versuch = 0; versuch < aufgabe.schritte.length; versuch += 1) {
        const zeilen = await seite.locator('li.reihe-zeile .reihe-text').allInnerTexts();
        if (zeilen.indexOf(text) <= ziel) break;
        await seite.getByRole('button', { name: t.reiheHoch.replace('{text}', text), exact: true }).click();
      }
    }
    return;
  }
  if (aufgabe.typ === 'wahl') {
    const richtig = aufgabe.optionen.find((o) => o.richtig);
    await seite.locator('button', { hasText: richtig.text }).first().click();
    return;
  }
  for (const teil of aufgabe.teile) {
    const ort = seite.locator(`button.baustein[data-teil="${teil.id}"]`);
    if ((await ort.count()) === 0) continue;
    const an = (await ort.first().getAttribute('aria-pressed')) === 'true';
    const soll = aufgabe.loesung.includes(teil.id);
    if (an !== soll) await ort.first().click();
  }
}

const zaehler = { hilfen: 0 };

async function spiele(seite, art, fotos) {
  await seite.goto(ADRESSE);
  await seite.waitForSelector('text=' + t.titel);
  if (fotos) await seite.screenshot({ path: path.join(BILDER, '01-zentrale-start.png'), fullPage: true });
  let schritte = 0;
  let foto = 2;
  let fertig = 0;
  let amEnde = false;               // Steht gerade das Bild «Auftrag erledigt» da? Dann nur einmal zählen.
  const gesehen = new Set();
  let leer = 0;                     // Schritte nacheinander, in denen nichts zu tun war
  while (schritte < 8000) {
    schritte += 1;
    await seite.waitForTimeout(20);
    if ((await seite.locator('h2', { hasText: t.auftragFertigTitel }).count()) > 0) {
      if (!amEnde) { fertig += 1; amEnde = true; console.log(`${art}: Auftrag ${fertig} von ${auftraege.length} erledigt nach ${schritte} Schritten`); }
      if (fertig >= auftraege.length) break;                          // alle Aufträge erledigt
      await drueck(seite, t.zurZentrale);
      continue;
    }
    amEnde = false;
    if (await sichtbar(seite, t.auswegKnopf) && art === 'schwach') { await drueck(seite, t.auswegKnopf); continue; }
    for (const knopfText of [t.wasPassiert, t.ahaWeiter, t.beispielWeiter, t.weiter, t.naechste, t.zurZentrale, t.weiterBauen, t.auftragAnnehmen]) {
      if (await sichtbar(seite, knopfText)) {
        if (fotos && foto < 12 && knopfText !== t.naechste) {
          await seite.screenshot({ path: path.join(BILDER, `${String(foto).padStart(2, '0')}-${art}.png`), fullPage: true });
          foto += 1;
        }
        await drueck(seite, knopfText);
        leer = 0;
        break;
      }
    }
    const aufgabe = await aktuelleAufgabe(seite);
    const los = aufgabe?.typ === 'wahl' || aufgabe?.typ === 'reihe' ? t.antworten : t.los;
    if (!aufgabe || !(await sichtbar(seite, los))) {
      // Hängt das Spiel? Dann Bild und Text festhalten, statt bis zum Schrittlimit zu warten.
      leer += 1;
      if (leer > 40) {
        await seite.screenshot({ path: path.join(BILDER, `99-haengt-${art}.png`), fullPage: true });
        melde(`${art}: Spiel hängt. Zu sehen: ${(await seite.locator('main').innerText()).slice(0, 400).replace(/\s+/g, ' ')}`);
        break;
      }
      continue;
    }
    leer = 0;
    if (fotos && FOTO_AUFGABEN.includes(aufgabe.kennung) && !gesehen.has(aufgabe.kennung)) {
      gesehen.add(aufgabe.kennung);
      await seite.screenshot({ path: path.join(BILDER, `40-${aufgabe.kennung.replace('/', '-')}.png`), fullPage: true });
    }
    if (art === 'stark') {
      await loese(seite, aufgabe);
    } else {
      // Schwacher Spieler: nimmt alle Hilfestufen bis «Lösung zeigen». Das zählt nie für die Meisterschaft.
      let hilfen = 0;
      for (const stufe of t.hilfe) {
        if (await sichtbar(seite, stufe)) { await drueck(seite, stufe); hilfen += 1; }
      }
      if (hilfen === 0) await loese(seite, aufgabe);                     // Probieren und Beispiel: keine Hilfe
      else zaehler.hilfen += 1;
    }
    await drueck(seite, los);
  }
  if (fertig < auftraege.length) melde(`${art}: nur ${fertig} von ${auftraege.length} Aufträgen fertig nach ${schritte} Schritten`);
  if (fotos) for (const kennung of FOTO_AUFGABEN) if (!gesehen.has(kennung)) melde(`stark: Aufgabe ${kennung} kam nie vor`);
  return schritte;
}

await mkdir(BILDER, { recursive: true });
const server = spawn(process.execPath, [path.join(WURZEL, 'werkzeuge/server.mjs')], { stdio: 'ignore' });
await new Promise((fertig) => setTimeout(fertig, 700));
const browser = await chromium.launch({ executablePath: CHROME });
try {
  for (const art of ['stark', 'schwach']) {
    const kontext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await kontext.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: ADRESSE });
    const seite = await kontext.newPage();
    seite.on('console', (m) => { if (m.type() === 'error') melde(`${art}: Konsole: ${m.text()}`); });
    seite.on('pageerror', (f) => melde(`${art}: Seitenfehler: ${f.message}`));
    const schritte = await spiele(seite, art, art === 'stark');
    console.log(`${art}: alle Aufträge fertig nach ${schritte} Schritten, Lösung gezeigt: ${zaehler.hilfen} Mal`);
    if (art === 'schwach' && zaehler.hilfen === 0) melde('schwach: Der schwache Spieler hat nie «Lösung zeigen» benutzt, der Test beweist nichts');
    await pruefeBreite(seite, `${art} Ende`);
    if (art === 'stark') {
      await seite.screenshot({ path: path.join(BILDER, '20-auftrag-fertig.png'), fullPage: true });
      await drueck(seite, t.schrankOeffnen);
      await seite.screenshot({ path: path.join(BILDER, '21-einsatzschrank.png'), fullPage: true });
      await drueck(seite, t.schrankKopieren);
      await seite.waitForTimeout(200);
      const kopiert = await seite.evaluate(() => navigator.clipboard.readText());
      if (kopiert !== auftraege[0].schrank.vorlage) melde('Einsatzschrank: kopierter Text stimmt nicht');
      if (!(await seite.locator('main').innerText()).includes(t.schrankKopiert)) melde('Einsatzschrank: keine Meldung «Kopiert»');
      await pruefeBreite(seite, 'Einsatzschrank 390');
      // Weitere Ansichten und Breiten
      await drueck(seite, t.zurueck);
      for (const [breite, hoehe] of [[320, 640], [768, 1024], [1280, 900]]) {
        await seite.setViewportSize({ width: breite, height: hoehe });
        await pruefeBreite(seite, `Zentrale ${breite}`);
        await seite.screenshot({ path: path.join(BILDER, `30-zentrale-${breite}.png`), fullPage: true });
      }
      await seite.setViewportSize({ width: 390, height: 844 });
      await drueck(seite, t.lexikonKnopf.replace('{anzahl}', String((await lies('de/lexikon.json')) && Object.keys(await lies('de/lexikon.json')).length)));
      await seite.screenshot({ path: path.join(BILDER, '31-lexikon.png'), fullPage: true });
      await pruefeBreite(seite, 'Lexikon');
      await drueck(seite, t.zurueck);
      await drueck(seite, t.einstellungenKnopf);
      await seite.screenshot({ path: path.join(BILDER, '32-einstellungen.png'), fullPage: true });
      await pruefeBreite(seite, 'Einstellungen');
      // Dunkles Erscheinungsbild
      await seite.emulateMedia({ colorScheme: 'dark' });
      await drueck(seite, t.zurueck);
      await seite.screenshot({ path: path.join(BILDER, '33-zentrale-dunkel.png'), fullPage: true });
    }
    await kontext.close();
  }
} finally {
  await browser.close();
  server.kill();
}
console.log(probleme.length === 0 ? 'Durchspiel im Browser: alles in Ordnung.' : `Durchspiel im Browser: ${probleme.length} Probleme.`);
process.exit(probleme.length === 0 ? 0 : 1);
