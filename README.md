# BUS-3150 Decision Labs

Local, dependency-free source for four browser-based BUS-3150 learning labs:

- `/bus-3150/lp-formulation-sensitivity/`
- `/bus-3150/network-integer-decisions/`
- `/bus-3150/simulation-operating-risk/`
- `/bus-3150/forecast-to-decision/`

Each lab follows the same sequence: read the decision, predict or formulate with a partner, commit before reveal, reconcile immediate diagnostic feedback, transfer the method to Excel, and complete a five-minute individual Canvas check.

## Local preview

```powershell
npm run build
npm run preview
```

Open:

```text
http://127.0.0.1:4173/bus-3150/
```

The preview server uses `dist/` after a build and otherwise serves `public/`. Set `PORT` before `npm run preview` if port 4173 is unavailable.

## Validation

```powershell
npm run check
npm test
```

`npm test` creates a clean `dist/` bundle, verifies all four stable routes and canonical URLs, checks the privacy/accessibility contract, and tests the LP, network, simulation, and forecasting calculations. The simulation tests prove that the first run is reproducible and that optional seeded reruns change the sample without changing the governing recommendation.

## Source shape

```text
public/
  bus-3150/
    index.html
    shared/
      app.mjs
      lab-core.mjs
      styles.css
    lp-formulation-sensitivity/index.html
    network-integer-decisions/index.html
    simulation-operating-risk/index.html
    forecast-to-decision/index.html
scripts/
  build.mjs
  static-server.mjs
tests/
```

The four route pages are intentionally thin. They identify the lab and load one shared accessible shell. `lab-core.mjs` owns deterministic scenarios and transparent calculations; `app.mjs` owns the common interaction, feedback, rerun, Excel-handoff, and individual-check flow.

## Public-hub composition handoff

This package is shaped for the existing exact-commit composition model at `tools.benhartlage.com`. After a future source-repository and release approval, the hub can pin:

1. one shared-assets entry from `public/bus-3150/shared` to `bus-3150/shared`, allowlisting `styles.css`, `app.mjs`, and `lab-core.mjs`; and
2. four route entries from each `public/bus-3150/<slug>` folder to the matching `bus-3150/<slug>`, allowlisting `index.html`.

No build framework, database, account system, analytics, external font, API, browser storage, credential, or provider configuration is required. Student entries exist only in the active tab and are never transmitted or retained.

## Boundaries

This directory is local source only. It does not create a GitHub repository, modify the public hub, or deploy anything.
