# Street Lifting Tracker

PWA de suivi d'entraînement street lifting + tracking du cut.

🔗 **Live** : https://terzz.github.io/street-lifting-tracker/

## Features

- Programme push/pull/legs sur 5 jours
- Logging séances avec dernière perf affichée
- Tracking PRs (dips lestés, tractions, belt squat, muscle-up...)
- Composition corporelle + objectif cut
- Compteur Grease the Groove avec heatmap 7j
- Macros training/off auto-sélectionnées
- Stats hebdo (séances + GTG)
- Export/import JSON
- 100% offline (service worker)
- Installable comme app sur iOS/Android

## Stack

- HTML/JSX transpilé en runtime via Babel standalone
- React 18 + Recharts + Tailwind via CDN
- localStorage pour la persistance
- Service worker cache-first

## Tests

```bash
node tests.mjs
```
