// Einsatzschrank: welche Bauteile der Spieler schon freigeschaltet hat (E-003, E-016).
// Reine Funktion: kennt weder Browser noch Oberfläche.
// Ein Bauteil gehört zu einem Auftrag (Feld «schrank») und ist frei, sobald der Auftrag erledigt ist.
// So braucht der Spielstand kein neues Feld, und alte Stände funktionieren unverändert.

export function schrankInhalt(stand, auftraege) {
  const erledigt = new Set(stand?.erledigt ?? []);
  return (auftraege ?? [])
    .filter((auftrag) => erledigt.has(auftrag.id) && auftrag.schrank)
    .map((auftrag) => ({
      auftrag: auftrag.id,
      titel: auftrag.schrank.titel,
      vorlage: auftrag.schrank.vorlage,
      wo: auftrag.schrank.wo,
    }));
}
