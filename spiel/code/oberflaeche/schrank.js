// Einsatzschrank: gebaute Bauteile ansehen und für echtes Claude kopieren («In Claude ausprobieren»).
// Das Spiel schickt dabei nichts weg. Der Spieler fügt den Text selbst bei Claude ein.
import { el, fuelle, knopf, leiste } from './bausteine.js';
import { schrankInhalt } from '../logik/schrank.js';

export function zeigeSchrank(wurzel, app, nav) {
  const t = app.inhalte.texte.app;
  const eintraege = schrankInhalt(app.stand, app.inhalte.auftraege);

  wurzel.append(
    leiste(t, nav, t.schrankTitel),
    el('p', { klasse: 'karte', text: t.schrankInfo }),
  );
  if (eintraege.length === 0) {
    wurzel.append(el('p', { klasse: 'karte', text: t.schrankLeer }));
    return;
  }

  for (const eintrag of eintraege) {
    const feldId = `schrank-${eintrag.auftrag}`;
    const feld = el('textarea', { id: feldId, klasse: 'schrank-text', readonly: true, rows: 9 });
    feld.value = eintrag.vorlage;
    // Meldet laut für Vorlesehilfen, ob das Kopieren geklappt hat.
    const status = el('p', { klasse: 'status', role: 'status', 'aria-live': 'polite' });

    const kopieren = knopf(t.schrankKopieren, async () => {
      try {
        // Die Zwischenablage gibt es nur auf sicheren Adressen und mit Erlaubnis des Browsers.
        await navigator.clipboard.writeText(eintrag.vorlage);
        status.textContent = t.schrankKopiert;
      } catch {
        // Ersatz: Text markieren, damit man ihn von Hand kopieren kann.
        feld.focus();
        feld.select();
        status.textContent = t.schrankKopierenNicht;
      }
    }, 'los');

    wurzel.append(el('section', { klasse: 'karte' },
      el('h2', { text: eintrag.titel }),
      el('label', { for: feldId, klasse: 'etikett', text: t.schrankVorlage }),
      feld,
      el('p', {}, el('strong', { text: `${t.schrankWo} ` }), el('span', { text: eintrag.wo })),
      kopieren,
      status,
    ));
  }
}

// Kurze Zeile für das Ende eines Auftrags: Was ist neu im Einsatzschrank?
export function schrankNeuText(t, auftrag) {
  return auftrag?.schrank ? fuelle(t.schrankNeu, { titel: auftrag.schrank.titel }) : null;
}
