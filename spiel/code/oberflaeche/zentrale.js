// Die Zentrale: Startbildschirm mit Auftrag, Meisterschaft und Auftragswand.
import { el, fuelle, knopf, echoFigur, punkte } from './bausteine.js';
import { schrankInhalt } from '../logik/schrank.js';
import { starteAuftrag } from '../logik/ablauf.js';
import { gespartText } from './runde.js';
import { erfolge, neuerFortschritt } from '../logik/meisterschaft.js';
import { einrichtungKarte, umfrageKarte } from './extras.js';

function rundenName(runde, texte) {
  return runde.konzept ? texte.konzepte[runde.konzept].name : runde.titel;
}

export function zeigeZentrale(wurzel, app, nav, daten) {
  const { texte, regeln, auftraege } = app.inhalte;
  const t = texte.app;
  const { stand } = app;
  const auftrag = app.auftrag(); // laufender oder nächster Auftrag, null wenn alle erledigt sind
  const laeuft = Boolean(stand.lauf);
  const noetig = regeln.erfolgeFuerMeisterschaft;

  let gruss = t.echoNeu;
  if (!auftrag) gruss = t.echoFertig;
  else if (laeuft) gruss = t.echoLaeuft;
  else if (stand.erledigt.length > 0) gruss = t.echoNaechster;
  // Eine Ansicht kann Echo etwas mitgeben, zum Beispiel nach einem Sprung.
  if (daten?.gruss) gruss = daten.gruss;

  // --- Auftrag ---
  const auftragKarte = el('section', { klasse: 'karte auftrag' },
    el('p', { klasse: 'etikett', text: t.auftragEtikett }));

  if (!auftrag) {
    auftragKarte.append(el('p', { text: t.mehrFolgt }));
  } else {
    const aktuelle = laeuft ? stand.lauf.runde : -1;
    // Knöpfe, die es gerade nicht gibt (null), werden ausgelassen. Sonst stünde «null» auf der Seite.
    auftragKarte.append(...[
      el('h2', { text: auftrag.kunde }),
      el('p', { klasse: 'wunsch', text: `«${auftrag.wunsch}»` }),
      el('ol', { klasse: 'runden' }, auftrag.runden.map((runde, index) => el('li', {
        klasse: index < aktuelle ? 'geschafft' : index === aktuelle ? 'aktuell' : null,
        'aria-current': index === aktuelle ? 'step' : null,
        text: rundenName(runde, texte),
      }))),
      knopf(laeuft ? t.weiterBauen : t.auftragAnnehmen, () => {
        if (!laeuft) app.setze(starteAuftrag(app.stand, auftrag, regeln, auftraege));
        nav.zu('runde');
      }, 'los'),
      // Wer Vorwissen hat, kann vor dem Start abkürzen.
      !laeuft && auftrag.runden.some((runde) => runde.konzept)
        ? knopf(t.schnelltestKnopf, () => nav.zu('schnelltest'), 'knopf-zweit')
        : null,
      // Ganz am Anfang: Wer schon weiter war (anderes Gerät, Stand verloren), findet hier das Springen (E-043).
      !laeuft && stand.erledigt.length === 0
        ? knopf(t.sprungHinweis, () => nav.zu('einstellungen', { springen: true }), 'knopf-leise')
        : null,
    ].filter(Boolean));
  }

  // --- Meisterschaft: alle Konzepte, die schon vorgekommen sind oder gerade dran sind ---
  const sichtbar = auftraege.filter((a) => stand.erledigt.includes(a.id) || a === auftrag);
  const konzepte = sichtbar.flatMap((a) => a.runden).filter((runde) => runde.konzept);
  const meisterschaft = el('section', { klasse: 'karte' },
    el('p', { klasse: 'etikett', text: t.meisterschaftEtikett }),
    el('ul', { klasse: 'meister-liste' }, konzepte.map((runde) => {
      const anzahl = Math.min(noetig, erfolge(stand.fortschritt[runde.konzept] ?? neuerFortschritt()));
      return el('li', {}, el('span', { text: texte.konzepte[runde.konzept].name }), punkte(anzahl, noetig, t.punkteLabel));
    })));

  // --- Auftragswand ---
  const fertige = auftraege.filter((a) => stand.erledigt.includes(a.id));
  const wand = el('section', { klasse: 'karte' },
    el('p', { klasse: 'etikett', text: t.wandEtikett }),
    fertige.length === 0
      ? el('p', { klasse: 'klein', text: t.wandLeer })
      : fertige.map((a) => el('div', { klasse: 'wand-eintrag' },
        el('strong', { text: a.kunde }),
        el('p', { text: `«${a.kundenstimme}»` }),
        a.tokenBudget ? el('p', { klasse: 'klein', text: gespartText(t, stand.gespart?.[a.id]) }) : null)));

  // Die Zentrale als kleines Bild: Der Raum wächst mit dem Kapitel, gekaufte Zierde steht mit drin.
  const kapitelText = texte.kapitel[(auftrag ?? auftraege.at(-1)).kapitel ?? 1];
  const zierde = (stand.einrichtung ?? []).map((id) => t.einrichtung[id]);
  const zeichen = [...(kapitelText.deko ?? '').split(' '), ...zierde.map((name) => name.split(' ')[0])].filter(Boolean);
  const zentraleBild = el('div', {
    klasse: 'zentrale-bild',
    role: 'img',
    'aria-label': fuelle(t.zentraleBild, { dinge: [kapitelText.ort ?? t.zentraleName, ...zierde.map((name) => name.split(' ').slice(1).join(' '))].join(', ') }),
  }, zeichen.map((einzel) => el('span', { 'aria-hidden': 'true', text: einzel })));

  // Karten, die es gerade nicht gibt (null), werden ausgelassen.
  wurzel.append(...[
    el('header', { klasse: 'kopf' },
      el('h1', { text: t.titel }),
      el('p', { text: texte.kapitel[(auftrag ?? auftraege.at(-1)).kapitel ?? 1].ort ?? t.zentraleName })),
    zentraleBild,
    el('div', { klasse: 'echo-zeile' }, echoFigur(t.echoName, !auftrag), el('p', { klasse: 'sprechblase', text: gruss })),
    auftragKarte,
    umfrageKarte(app, nav),
    meisterschaft,
    einrichtungKarte(app, nav),
    wand,
    el('div', { klasse: 'knopf-reihe' },
      knopf(fuelle(t.schrankKnopf, { anzahl: schrankInhalt(stand, auftraege).length }), () => nav.zu('schrank'), 'knopf-zweit'),
      knopf(fuelle(t.lexikonKnopf, { anzahl: stand.lexikon.length }), () => nav.zu('lexikon'), 'knopf-zweit'),
      knopf(t.einstellungenKnopf, () => nav.zu('einstellungen'), 'knopf-zweit')),
    el('footer', { klasse: 'fuss', text: t.fuss }),
  ].filter(Boolean));
}
