# Code Review — Street Lifting Tracker

Review menée sur `app.jsx` avant déploiement. Bugs **critiques** corrigés directement dans le code.

## Bugs critiques corrigés

### 1. Fuseaux horaires — `today()` retournait une date UTC
Le prompt original utilisait `new Date().toISOString().slice(0, 10)`. Ça renvoie la date **UTC**, donc à 23h heure française un mardi, on avait déjà la date du mercredi. Conséquence : le programme du jour, le bouton "démarrer la séance" et tout le tracking GTG se référaient au mauvais jour le soir.
**Fix** : `today()` utilise désormais `getFullYear/getMonth/getDate` locaux.

### 2. Parsing de date — `new Date('2026-03-01')` est UTC
`new Date(s)` sur une string ISO sans heure parse en UTC midnight, puis l'affichage local peut décaler d'un jour. Visible avec `fmtDate('2026-03-01')` qui pouvait afficher "29 fév" en Europe le soir, ou similaires sur autres timezones.
**Fix** : helper `parseDate(s)` qui split YYYY-MM-DD en composants et construit `new Date(y, m-1, d)` local. Utilisé partout (`fmtDate`, `fmtDateFull`, `daysBetween`, agrégations stats).

### 3. `daysBetween` cassé sur les changements d'heure (DST)
`Math.floor((b - a) / 86400000)` retourne 0 ou 2 jours quand il y a un passage à l'heure d'été/hiver entre les deux dates (jour de 23h ou 25h).
**Fix** : `Math.round(...)` qui tolère le décalage horaire de ±1h.

### 4. Calendrier hebdomadaire GTG — clés de date UTC
Même bug : `d.toISOString().slice(0, 10)` dans la grille de 7 jours produisait des clés UTC qui ne matchaient pas celles enregistrées via `today()` local. Résultat : barres GTG vides même quand le jour avait des sets.
**Fix** : construction de la clé en local avec padding manuel.

### 5. Stats — bucket par semaine en UTC
Idem dans `weekVolume` et `gtgWeekly` : `toISOString().slice(0,10)` sur le début de semaine.
**Fix** : utilise `parseDate` + format local cohérent.

### 6. Validation `gtg` au chargement
Si quelqu'un avait par accident un array sérialisé en `st-gtg`, `typeof g === 'object'` retournait `true` (les arrays sont des objets) et l'app cassait au premier `Object.entries`.
**Fix** : ajout de `!Array.isArray(g)`.

### 7. Import JSON — pas de validation, XSS implicite
Le code original faisait `JSON.parse` puis acceptait n'importe quoi. Si l'utilisateur importait un fichier malformé/malveillant, ça pouvait corrompre le storage ou planter l'app au prochain reload.
**Fix** : validation de structure (date string + numéro programId pour sessions, weight numérique pour body, gtg = objet non-array), limite de taille 5 MB, reset de l'input file après lecture, gestion `reader.onerror`.

### 8. Parsing numérique — espaces ignorés
`parseFloat("  ")` ou `parseInt("  ")` retourne NaN, mais `parseFloat("5 ")` retourne 5 (OK). En revanche, `value === ''` ne matche pas un input avec espaces. Risque : reps fantômes.
**Fix** : `.trim()` avant la check de string vide.

### 9. Accessibilité — boutons icônes sans label
Les boutons +/- de GTG, le bouton de suppression d'entrée corps, les onglets de la nav, les boutons de jour J1-J5 étaient tous des cibles tap mobile sans `aria-label` ou `aria-pressed`/`aria-current`.
**Fix** : ajout des attributs ARIA appropriés. Tailles tap déjà ≥44px (w-14 h-14 sur les +/-, py-3 sur la nav).

## Nits non critiques (non corrigés)

- **Reps négatives acceptées** : `parseInt("-5")` = -5 est stocké. `filled` = false donc visuellement non comptabilisé. Conséquence quasi nulle, l'utilisateur s'en aperçoit immédiatement.
- **`String(parseFloat("5.0"))` = "5"** : après blur, "5.0" devient "5" dans l'input. Cosmétique.
- **MacrosCard re-render à chaque mount** : pas de memo, mais c'est un composant trivial.
- **Pas de stratégie network-first dans le SW** : le cache-first sur `app.jsx` veut dire qu'une mise à jour du code nécessite changement de `CACHE` version pour invalider. Acceptable pour une PWA single-user où on contrôle les déploiements.
- **`setSessions` capture `logs` du closure** : potentielle race si deux blurs simultanés, mais analyse montre que les events de blur sont sérialisés et React re-render entre eux. Pas un vrai bug en pratique.
- **Pas de prop-types** : le script est chargé mais non utilisé. Acceptable pour un MVP.

## Sécurité

- ✅ Aucun `dangerouslySetInnerHTML`.
- ✅ Toutes les données utilisateur passent par React (échappement auto).
- ✅ Aucun `eval`, aucune injection HTML.
- ✅ Import JSON validé en structure et taille.
- ✅ CSP-friendly modulo Babel standalone et CDN scripts.

## Performance

- Composants Recharts montés conditionnellement (`history.length > 1`, `weekVolume.length > 0`) — pas d'overhead inutile.
- `useMemo` sur `current`, `lastSession`, `weekVolume`, `gtgWeekly` — évite recalculs.
- Pas de listes longues à virtualiser.
