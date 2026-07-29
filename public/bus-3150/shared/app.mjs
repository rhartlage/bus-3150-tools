import {
  LAB_META,
  LAB_ORDER,
  LP_SCENARIOS,
  NETWORK_SCENARIOS,
  SIMULATION_SCENARIOS,
  FORECAST_SCENARIOS,
  FORECAST_METHODS,
  solveTwoVariableLp,
  lpSensitivity,
  evaluateNetworkScenario,
  simulateOperatingRisk,
  calculateForecastComparison,
  round,
} from "./lab-core.mjs";

const labKey = document.body.dataset.lab;
const root = document.getElementById("lab-root");

if (!LAB_META[labKey] || !root) {
  throw new Error("The requested BUS-3150 lab is not configured.");
}

const scenarioSets = {
  lp: LP_SCENARIOS,
  network: NETWORK_SCENARIOS,
  simulation: SIMULATION_SCENARIOS,
  forecast: FORECAST_SCENARIOS,
};

let runIndex = 0;

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function currentScenario() {
  const set = scenarioSets[labKey];
  return set[runIndex % set.length];
}

function navigation() {
  return LAB_ORDER.map((key) => {
    const item = LAB_META[key];
    const current = key === labKey ? ' aria-current="page"' : "";
    return `<a href="${item.route}"${current}>${item.nav}</a>`;
  }).join("");
}

function renderPage() {
  const meta = LAB_META[labKey];
  const scenario = currentScenario();
  const runNumber = runIndex + 1;

  root.innerHTML = `
    <div class="site-shell">
      <header class="lab-header">
        <div class="masthead">
          <a class="brand" href="/bus-3150/" aria-label="BUS-3150 Decision Labs home">
            <span class="brand-mark" aria-hidden="true">3150</span>
            <span><strong>Decision Labs</strong><small>Operations Analysis</small></span>
          </a>
          <nav class="lab-nav" aria-label="BUS-3150 lab routes">${navigation()}</nav>
        </div>
        <div class="hero">
          <div>
            <p class="eyebrow">${meta.chapters} · ${meta.eyebrow}</p>
            <h1>${meta.title}</h1>
            <p class="hero-question">${meta.question}</p>
          </div>
          <dl class="session-facts">
            <div><dt>Pair lab</dt><dd>${meta.appDate}</dd></div>
            <div><dt>Excel follow-through</dt><dd>${meta.excelDate}</dd></div>
            <div><dt>Working time</dt><dd>${meta.duration}</dd></div>
            <div><dt>Run</dt><dd>${runNumber} · ${scenario.runLabel}</dd></div>
          </dl>
        </div>
      </header>

      <div class="method-ribbon" aria-label="Lab sequence">
        <ol>
          <li><span>01</span><strong>Read</strong> Frame the decision</li>
          <li><span>02</span><strong>Commit</strong> Predict or formulate</li>
          <li><span>03</span><strong>Reveal</strong> Reconcile the evidence</li>
          <li><span>04</span><strong>Transfer</strong> Carry it to Excel</li>
        </ol>
      </div>

      <section id="activity" class="activity" aria-labelledby="activity-title">
        <div class="section-intro">
          <p class="eyebrow">Pair exploration</p>
          <h2 id="activity-title">${scenario.runLabel}</h2>
          <p>${scenario.story}</p>
        </div>
        ${activityMarkup(scenario)}
      </section>

      <section id="feedback-panel" class="feedback-panel" aria-labelledby="feedback-title" hidden>
        <div id="feedback-content" aria-live="polite"></div>
      </section>

      <section id="reveal-panel" class="reveal-panel" aria-labelledby="reveal-title" hidden>
        <div id="reveal-content"></div>
      </section>

      <section class="transfer-panel" aria-labelledby="transfer-title">
        <div>
          <p class="eyebrow">Excel follow-through</p>
          <h2 id="transfer-title">Rebuild the evidence, not just the answer.</h2>
          <p>On ${meta.excelDate}, open <strong>${meta.excelCase}</strong>. Recreate the model, audit formulas with your partner, and explain one decision implication before submitting your individual Canvas check.</p>
        </div>
        <ol>
          <li><strong>Structure:</strong> label inputs, decisions, formulas, and outputs.</li>
          <li><strong>Validate:</strong> reproduce one app result and test one changed assumption.</li>
          <li><strong>Decide:</strong> state the recommendation, uncertainty, and stakeholder consequence.</li>
        </ol>
      </section>

      <section id="individual-check" class="check-handoff" aria-labelledby="check-title">
        <div>
          <p class="eyebrow">Five-minute individual handoff</p>
          <h2 id="check-title">Move from pair reasoning to your own answer.</h2>
          <p>When your instructor calls time, stop partner discussion and select the button below. The app will show the handoff prompt; record your response in <strong>${meta.check}</strong> in Canvas.</p>
        </div>
        <button class="button button-light" id="open-check" type="button">I am ready for the individual check</button>
        <div id="check-panel" class="check-panel" hidden>
          <h3 id="check-prompt-title" tabindex="-1">Work independently for five minutes</h3>
          <p>${meta.handoffPrompt}</p>
          <ul>
            <li>Use your own reasoning; no partner or AI support.</li>
            <li>Show the model evidence that supports your choice.</li>
            <li>Submit in Canvas before leaving the check.</li>
          </ul>
        </div>
      </section>

      <aside class="access-note" aria-label="Access, privacy, and outage contingency">
        <strong>No account. No retained responses.</strong>
        <span>This lab runs only in this browser tab and transmits no student data. If it is unavailable, use the prepared Excel case named above.</span>
      </aside>

      <footer>
        <span>BUS-3150 · Concept → Model → Decision</span>
        <a href="/bus-3150/">Return to all labs</a>
      </footer>
      <p id="live-status" class="sr-only" aria-live="polite"></p>
    </div>
  `;

  bindInteractions();
}

function activityMarkup(scenario) {
  if (labKey === "lp") return lpActivity(scenario);
  if (labKey === "network") return networkActivity(scenario);
  if (labKey === "simulation") return simulationActivity(scenario);
  return forecastActivity(scenario);
}

function lpActivity(scenario) {
  const [first, second] = scenario.constraints;
  return `
    <div class="activity-grid">
      <article class="evidence-card">
        <div class="card-heading"><span class="step-label">Given</span><h3>Translate the operating facts</h3></div>
        <div class="table-wrap">
          <table>
            <caption>Per-batch contribution and resource requirements</caption>
            <thead><tr><th scope="col">Measure</th><th scope="col">${scenario.xName}</th><th scope="col">${scenario.yName}</th><th scope="col">Capacity</th></tr></thead>
            <tbody>${scenario.sourceTable.map((row) => `<tr>${row.map((cell, index) => `<${index === 0 ? 'th scope="row"' : "td"}>${cell}</${index === 0 ? "th" : "td"}>`).join("")}</tr>`).join("")}</tbody>
          </table>
        </div>
        <p class="model-note"><strong>Decision variables:</strong> weekly batches of ${scenario.xName} and ${scenario.yName}; both are nonnegative.</p>
      </article>
      <form id="commitment-form" class="commit-card">
        <div class="card-heading"><span class="step-label">Commit</span><h3>Enter the model before reveal</h3></div>
        <fieldset>
          <legend>Objective: maximize c<sub>x</sub>x + c<sub>y</sub>y</legend>
          <div class="field-row">
            ${numericField("objective-x", "cₓ", "Coefficient on x")}
            ${numericField("objective-y", "cᵧ", "Coefficient on y")}
          </div>
        </fieldset>
        <fieldset>
          <legend>${first.label}: a<sub>x</sub>x + a<sub>y</sub>y ≤ RHS</legend>
          <div class="field-row">
            ${numericField("constraint-1-x", "aₓ", "Coefficient on x")}
            ${numericField("constraint-1-y", "aᵧ", "Coefficient on y")}
            ${numericField("constraint-1-rhs", "RHS", "Available capacity")}
          </div>
        </fieldset>
        <fieldset>
          <legend>${second.label}: b<sub>x</sub>x + b<sub>y</sub>y ≤ RHS</legend>
          <div class="field-row">
            ${numericField("constraint-2-x", "bₓ", "Coefficient on x")}
            ${numericField("constraint-2-y", "bᵧ", "Coefficient on y")}
            ${numericField("constraint-2-rhs", "RHS", "Available capacity")}
          </div>
        </fieldset>
        <label for="binding-prediction">Before solving, which resources do you predict will bind?</label>
        <select id="binding-prediction" name="binding-prediction" required>
          <option value="">Choose a prediction</option>
          <option value="first">${first.label} only</option>
          <option value="second">${second.label} only</option>
          <option value="both">Both resources</option>
          <option value="neither">Neither resource</option>
        </select>
        ${commitButton()}
      </form>
    </div>
  `;
}

function networkActivity(scenario) {
  return `
    <div class="activity-grid">
      <article class="evidence-card">
        <div class="card-heading"><span class="step-label">Given</span><h3>Screen candidate binary designs</h3></div>
        <p><strong>Service rule:</strong> ${scenario.serviceTarget}.</p>
        <div class="table-wrap">
          <table>
            <caption>Candidate facility patterns before feasibility screening</caption>
            <thead><tr><th scope="col">Candidate</th><th scope="col">Open vector</th><th scope="col">Total cost</th><th scope="col">Max time</th><th scope="col">Unserved</th></tr></thead>
            <tbody>${scenario.candidates.map((candidate) => `
              <tr><th scope="row">${candidate.facilities}</th><td>${candidate.vector}</td><td>${money.format(candidate.cost)}k</td><td>${candidate.maxTime} min</td><td>${candidate.unserved}</td></tr>
            `).join("")}</tbody>
          </table>
        </div>
        <p class="model-note"><strong>Model spine:</strong> minimize fixed plus assignment cost; assign each zone once; enforce capacity and service; y<sub>j</sub> ∈ {0,1}.</p>
      </article>
      <form id="commitment-form" class="commit-card">
        <div class="card-heading"><span class="step-label">Commit</span><h3>Choose after feasibility, not before it</h3></div>
        <label for="network-choice">Which candidate should the model recommend?</label>
        <select id="network-choice" name="network-choice" required>
          <option value="">Choose a candidate</option>
          ${scenario.candidates.map((candidate) => `<option value="${candidate.id}">${candidate.facilities}</option>`).join("")}
        </select>
        <label for="network-reason">What is the governing decision rule?</label>
        <select id="network-reason" name="network-reason" required>
          <option value="">Choose a reason</option>
          <option value="cheapest">Choose the lowest listed cost</option>
          <option value="fastest">Choose the shortest maximum time</option>
          <option value="feasible-cost">Choose the lowest-cost candidate among those meeting every constraint</option>
          <option value="most-sites">Choose the candidate opening the most sites</option>
        </select>
        ${numericField("binary-count", "How many binary opening variables?", "Count one binary variable per potential site")}
        ${commitButton()}
      </form>
    </div>
  `;
}

function simulationActivity(scenario) {
  return `
    <div class="activity-grid">
      <article class="evidence-card">
        <div class="card-heading"><span class="step-label">Given</span><h3>Define demand and operating choices</h3></div>
        <div class="table-wrap compact-table">
          <table>
            <caption>Daily demand distribution</caption>
            <thead><tr><th scope="col">Demand</th>${scenario.demandValues.map((value) => `<th scope="col">${value}</th>`).join("")}</tr></thead>
            <tbody><tr><th scope="row">Probability</th>${scenario.probabilities.map((value) => `<td>${Math.round(value * 100)}%</td>`).join("")}</tr></tbody>
          </table>
        </div>
        <div class="table-wrap">
          <table>
            <caption>Capacity plans and fixed daily cost</caption>
            <thead><tr><th scope="col">Plan</th><th scope="col">Capacity</th><th scope="col">Base cost</th></tr></thead>
            <tbody>${scenario.plans.map((plan) => `<tr><th scope="row">${plan.name}</th><td>${plan.capacity}</td><td>${money.format(plan.baseCost)}</td></tr>`).join("")}</tbody>
          </table>
        </div>
        <p class="model-note">Shortage penalty: ${money.format(scenario.shortagePenalty)} per unit. Idle-capacity cost: ${money.format(scenario.idleCost)} per unit. Risk limit: at most ${Math.round(scenario.riskLimit * 100)}% of days with any shortage.</p>
      </article>
      <form id="commitment-form" class="commit-card">
        <div class="card-heading"><span class="step-label">Commit</span><h3>Predict before the 2,000-day run</h3></div>
        <label for="simulation-choice">Which plan will best balance eligible risk and expected cost?</label>
        <select id="simulation-choice" name="simulation-choice" required>
          <option value="">Choose a plan</option>
          ${scenario.plans.map((plan) => `<option value="${plan.id}">${plan.name}</option>`).join("")}
        </select>
        <label for="middle-risk">Will the middle plan experience any shortage on more than 25% of simulated days?</label>
        <select id="middle-risk" name="middle-risk" required>
          <option value="">Choose a prediction</option>
          <option value="yes">Yes, more than 25%</option>
          <option value="no">No, 25% or less</option>
        </select>
        ${numericField("high-shortage", "Middle-plan shortage when demand is highest", "Demand minus middle-plan capacity")}
        ${commitButton()}
      </form>
    </div>
  `;
}

function forecastActivity(scenario) {
  return `
    <div class="activity-grid">
      <article class="evidence-card">
        <div class="card-heading"><span class="step-label">Given</span><h3>Read the demand pattern</h3></div>
        <div class="table-wrap compact-table">
          <table>
            <caption>Observed demand by period</caption>
            <thead><tr>${scenario.periods.map((period) => `<th scope="col">${period}</th>`).join("")}</tr></thead>
            <tbody><tr>${scenario.demand.map((value) => `<td>${value}</td>`).join("")}</tr></tbody>
          </table>
        </div>
        <p class="model-note">Compare every method on periods 5–8 so no method receives an easier accuracy window. Use MAE as the primary screen and RMSE as the tie-breaker.</p>
      </article>
      <form id="commitment-form" class="commit-card">
        <div class="card-heading"><span class="step-label">Commit</span><h3>Select a method and decision rule</h3></div>
        <label for="forecast-method">Which method do you expect to have the lowest common-window MAE?</label>
        <select id="forecast-method" name="forecast-method" required>
          <option value="">Choose a method</option>
          ${Object.entries(FORECAST_METHODS).map(([id, label]) => `<option value="${id}">${label}</option>`).join("")}
        </select>
        ${numericField("next-forecast", "Your next-period forecast from that method", "Enter units; answers within one unit are accepted")}
        <label for="uncertainty-rule">How should forecast uncertainty affect the inventory decision?</label>
        <select id="uncertainty-rule" name="uncertainty-rule" required>
          <option value="">Choose a decision rule</option>
          <option value="ignore">Ignore error after choosing the best method</option>
          <option value="latest">Always stock exactly the latest actual demand</option>
          <option value="buffer">Add a transparent buffer tied to observed forecast error and service needs</option>
          <option value="largest">Use the largest historical demand as the forecast</option>
        </select>
        ${commitButton()}
      </form>
    </div>
  `;
}

function numericField(id, label, hint) {
  return `
    <label for="${id}">
      <span>${label}</span>
      <input id="${id}" name="${id}" type="number" step="any" inputmode="decimal" required aria-describedby="${id}-hint">
      <small id="${id}-hint">${hint}</small>
    </label>
  `;
}

function commitButton() {
  return `
    <div class="commit-actions">
      <button class="button button-primary" type="submit">Commit and reveal evidence</button>
      <p>Your entries remain only in this tab and are cleared when you leave or start another run.</p>
    </div>
  `;
}

function bindInteractions() {
  document.getElementById("commitment-form")?.addEventListener("submit", handleCommitment);
  document.getElementById("open-check")?.addEventListener("click", () => {
    const panel = document.getElementById("check-panel");
    const heading = document.getElementById("check-prompt-title");
    panel.hidden = false;
    heading.focus();
    announce("The five-minute individual check handoff is open.");
  });
}

function handleCommitment(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const scenario = currentScenario();
  const diagnostics = evaluateCommitment(form, scenario);
  const correctCount = diagnostics.filter((item) => item.correct).length;
  const feedbackPanel = document.getElementById("feedback-panel");
  const feedbackContent = document.getElementById("feedback-content");
  const revealPanel = document.getElementById("reveal-panel");
  const revealContent = document.getElementById("reveal-content");

  feedbackContent.innerHTML = `
    <div class="section-intro">
      <p class="eyebrow">Immediate diagnostic</p>
      <h2 id="feedback-title" tabindex="-1">${correctCount} of ${diagnostics.length} commitments are aligned.</h2>
      <p>The evidence is now open. Reconcile every “Revisit” item with your partner before moving to Excel.</p>
    </div>
    <ul class="diagnostic-list">
      ${diagnostics.map((item) => `
        <li class="${item.correct ? "is-correct" : "needs-revisit"}">
          <strong>${item.correct ? "Aligned" : "Revisit"}: ${item.label}</strong>
          <span>${item.note}</span>
        </li>
      `).join("")}
    </ul>
  `;
  feedbackPanel.hidden = false;

  revealContent.innerHTML = revealMarkup(scenario);
  revealPanel.hidden = false;
  document.getElementById("next-run")?.addEventListener("click", () => {
    runIndex += 1;
    renderPage();
    root.focus();
    announce(`Alternate run ${runIndex + 1} is ready. Commit again before revealing evidence.`);
  });

  document.getElementById("feedback-title").focus();
  announce(`Diagnostic complete. ${correctCount} of ${diagnostics.length} commitments aligned. Evidence revealed.`);
}

function evaluateCommitment(form, scenario) {
  if (labKey === "lp") {
    const values = [
      Number(form.get("objective-x")),
      Number(form.get("objective-y")),
      Number(form.get("constraint-1-x")),
      Number(form.get("constraint-1-y")),
      Number(form.get("constraint-1-rhs")),
      Number(form.get("constraint-2-x")),
      Number(form.get("constraint-2-y")),
      Number(form.get("constraint-2-rhs")),
    ];
    const answers = [
      ...scenario.objective,
      ...scenario.constraints[0].coefficients,
      scenario.constraints[0].rhs,
      ...scenario.constraints[1].coefficients,
      scenario.constraints[1].rhs,
    ];
    const formulationCorrect = values.every((value, index) => Math.abs(value - answers[index]) < 1e-8);
    const bindingCorrect = form.get("binding-prediction") === scenario.bindingAnswer;
    return [
      {
        label: "LP coefficients and right-hand sides",
        correct: formulationCorrect,
        note: formulationCorrect ? "The story has been translated without changing units." : "Match each table row to its objective or constraint position; keep one unit system throughout.",
      },
      {
        label: "Binding-resource prediction",
        correct: bindingCorrect,
        note: bindingCorrect ? "Your prediction matches the optimal-corner evidence." : "A binding resource has zero slack at the recommended solution.",
      },
    ];
  }

  if (labKey === "network") {
    return [
      {
        label: "Recommended binary pattern",
        correct: form.get("network-choice") === scenario.correctId,
        note: form.get("network-choice") === scenario.correctId ? "The selected pattern is the least costly feasible design." : "Eliminate every design that violates coverage or response time before comparing costs.",
      },
      {
        label: "Decision rule",
        correct: form.get("network-reason") === "feasible-cost",
        note: form.get("network-reason") === "feasible-cost" ? "Feasibility precedes objective comparison." : "Optimization means best among feasible choices, not simply the smallest visible number.",
      },
      {
        label: "Binary-variable count",
        correct: Number(form.get("binary-count")) === scenario.binaryCount,
        note: Number(form.get("binary-count")) === scenario.binaryCount ? "There is one opening variable for each candidate site." : "Count the yes/no site-opening decisions, not the candidate rows.",
      },
    ];
  }

  if (labKey === "simulation") {
    const results = simulateOperatingRisk(scenario, runIndex);
    const middle = results.plans.find((plan) => plan.id === scenario.middlePlan);
    const middleRiskAnswer = middle.shortageProbability > 0.25 ? "yes" : "no";
    return [
      {
        label: "Capacity-plan prediction",
        correct: form.get("simulation-choice") === results.recommended.id,
        note: form.get("simulation-choice") === results.recommended.id ? "Your plan satisfies the risk screen and has the lowest expected cost among eligible plans." : "First enforce the shortage-risk limit, then compare expected costs among eligible plans.",
      },
      {
        label: "Middle-plan shortage-risk prediction",
        correct: form.get("middle-risk") === middleRiskAnswer,
        note: form.get("middle-risk") === middleRiskAnswer ? "The simulated shortage frequency supports your direction." : "Count days with any shortage; do not confuse that probability with average shortage units.",
      },
      {
        label: "High-demand shortage calculation",
        correct: Math.abs(Number(form.get("high-shortage")) - scenario.middleShortageAtHigh) < 1e-8,
        note: Math.abs(Number(form.get("high-shortage")) - scenario.middleShortageAtHigh) < 1e-8 ? "Shortage is demand minus available capacity when demand is larger." : "Use max(0, demand − capacity) for the high-demand outcome.",
      },
    ];
  }

  const comparison = calculateForecastComparison(scenario);
  return [
    {
      label: "Forecast-method prediction",
      correct: form.get("forecast-method") === comparison.best.id,
      note: form.get("forecast-method") === comparison.best.id ? "Your method has the lowest MAE on the common validation window." : "Compare methods on periods 5–8; avoid judging from fit to the full history.",
    },
    {
      label: "Next-period forecast",
      correct: Math.abs(Number(form.get("next-forecast")) - comparison.best.nextForecast) <= 1,
      note: Math.abs(Number(form.get("next-forecast")) - comparison.best.nextForecast) <= 1 ? "Your forecast is within one unit of the selected method’s result." : "Recalculate the next forecast using the winning method, not the latest actual by default.",
    },
    {
      label: "Uncertainty-to-inventory rule",
      correct: form.get("uncertainty-rule") === "buffer",
      note: form.get("uncertainty-rule") === "buffer" ? "The rule makes uncertainty visible in the decision." : "Forecast error does not disappear when a method wins; carry it into a transparent service buffer.",
    },
  ];
}

function revealMarkup(scenario) {
  if (labKey === "lp") return lpReveal(scenario);
  if (labKey === "network") return networkReveal(scenario);
  if (labKey === "simulation") return simulationReveal(scenario);
  return forecastReveal(scenario);
}

function revealHeader(title, copy) {
  return `
    <div class="reveal-heading">
      <div>
        <p class="eyebrow">Evidence revealed</p>
        <h2 id="reveal-title">${title}</h2>
        <p>${copy}</p>
      </div>
      <button class="button button-secondary" id="next-run" type="button">Try an alternate run</button>
    </div>
  `;
}

function lpReveal(scenario) {
  const solution = solveTwoVariableLp(scenario);
  const sensitivity = lpSensitivity(scenario);
  return `
    ${revealHeader("The optimal corner uses both scarce resources.", "Read the solution and local resource values together; neither one is a complete recommendation by itself.")}
    <div class="result-metrics">
      <div><span>${scenario.xName}</span><strong>${round(solution.x, 2)}</strong></div>
      <div><span>${scenario.yName}</span><strong>${round(solution.y, 2)}</strong></div>
      <div><span>${scenario.objectiveLabel}</span><strong>${money.format(solution.value)}</strong></div>
    </div>
    <div class="table-wrap">
      <table>
        <caption>Resource use and one-unit local sensitivity</caption>
        <thead><tr><th scope="col">Resource</th><th scope="col">Used</th><th scope="col">Available</th><th scope="col">Slack</th><th scope="col">Status</th><th scope="col">Objective change if RHS +1</th></tr></thead>
        <tbody>${sensitivity.map((row, index) => `
          <tr><th scope="row">${row.label}</th><td>${round(solution.constraints[index].used, 2)}</td><td>${round(solution.constraints[index].rhs, 2)}</td><td>${round(row.slack, 2)}</td><td>${row.binding ? "Binding" : "Not binding"}</td><td>${money.format(row.localValue)}</td></tr>
        `).join("")}</tbody>
      </table>
    </div>
    <aside class="decision-callout"><strong>Decision interpretation</strong><p>${scenario.decisionNote} The one-unit value is local evidence, not permission to buy unlimited capacity.</p></aside>
  `;
}

function networkReveal(scenario) {
  const result = evaluateNetworkScenario(scenario);
  return `
    ${revealHeader(`${result.recommended.facilities} is the least-cost feasible design.`, "The cheaper single-site patterns fail service constraints; they are not legitimate competitors in the objective comparison.")}
    <div class="result-metrics">
      <div><span>Recommended vector</span><strong>${result.recommended.vector}</strong></div>
      <div><span>Total cost</span><strong>${money.format(result.recommended.cost)}k</strong></div>
      <div><span>Maximum time</span><strong>${result.recommended.maxTime} min</strong></div>
    </div>
    <div class="table-wrap">
      <table>
        <caption>Feasibility screen and objective comparison</caption>
        <thead><tr><th scope="col">Candidate</th><th scope="col">Coverage</th><th scope="col">Time rule</th><th scope="col">Feasible?</th><th scope="col">Cost rank among feasible</th></tr></thead>
        <tbody>${result.candidates.map((candidate) => {
          const feasible = result.candidates.filter((item) => item.feasible).sort((a, b) => a.cost - b.cost);
          const rank = candidate.feasible ? feasible.findIndex((item) => item.id === candidate.id) + 1 : "—";
          return `<tr><th scope="row">${candidate.facilities}</th><td>${candidate.unserved === 0 ? "All served" : `${candidate.unserved} unserved`}</td><td>${candidate.maxTime} min</td><td>${candidate.feasible ? "Yes" : "No"}</td><td>${rank}</td></tr>`;
        }).join("")}</tbody>
      </table>
    </div>
    <aside class="decision-callout"><strong>Stakeholder check</strong><p>${scenario.stakeholder}</p></aside>
  `;
}

function simulationReveal(scenario) {
  const result = simulateOperatingRisk(scenario, runIndex);
  return `
    ${revealHeader(`${result.recommended.name} is the lowest-cost plan that passes the risk screen.`, `The first run uses seed ${result.seed}; every pair receives the same 2,000-day evidence. Alternate runs use a documented next seed.`)}
    <div class="result-metrics">
      <div><span>Deterministic seed</span><strong>${result.seed}</strong></div>
      <div><span>Simulated days</span><strong>${scenario.trials.toLocaleString()}</strong></div>
      <div><span>Risk limit</span><strong>${Math.round(scenario.riskLimit * 100)}%</strong></div>
    </div>
    <div class="table-wrap">
      <table>
        <caption>Reproducible simulation summary by capacity plan</caption>
        <thead><tr><th scope="col">Plan</th><th scope="col">Shortage days</th><th scope="col">Average shortage</th><th scope="col">Average idle</th><th scope="col">Expected cost</th><th scope="col">Risk eligible?</th></tr></thead>
        <tbody>${result.plans.map((plan) => `
          <tr><th scope="row">${plan.name}</th><td>${(plan.shortageProbability * 100).toFixed(1)}%</td><td>${plan.averageShortage.toFixed(1)}</td><td>${plan.averageIdle.toFixed(1)}</td><td>${money.format(plan.expectedCost)}</td><td>${plan.withinRiskLimit ? "Yes" : "No"}</td></tr>
        `).join("")}</tbody>
      </table>
    </div>
    <aside class="decision-callout"><strong>Operating-risk interpretation</strong><p>${scenario.stewardship}</p></aside>
  `;
}

function forecastReveal(scenario) {
  const result = calculateForecastComparison(scenario);
  return `
    ${revealHeader(`${result.best.label} has the strongest common-window evidence.`, "Accuracy is compared over the same periods for every method. The inventory recommendation then adds a transparent error-based buffer.")}
    <div class="result-metrics">
      <div><span>Next forecast</span><strong>${round(result.best.nextForecast, 1)}</strong></div>
      <div><span>Validation MAE</span><strong>${round(result.best.mae, 1)}</strong></div>
      <div><span>Buffered inventory</span><strong>${result.recommendedInventory}</strong></div>
    </div>
    <div class="table-wrap">
      <table>
        <caption>Forecast accuracy on periods 5–8 and next-period projection</caption>
        <thead><tr><th scope="col">Method</th><th scope="col">MAE</th><th scope="col">RMSE</th><th scope="col">Next forecast</th><th scope="col">Primary rank</th></tr></thead>
        <tbody>${result.rows.map((row, index) => `
          <tr><th scope="row">${row.label}</th><td>${round(row.mae, 2)}</td><td>${round(row.rmse, 2)}</td><td>${round(row.nextForecast, 1)}</td><td>${index + 1}</td></tr>
        `).join("")}</tbody>
      </table>
    </div>
    <aside class="decision-callout"><strong>Forecast-to-inventory rule</strong><p>${scenario.decisionRule} The displayed buffer uses 1.28 × validation RMSE as a compact service-risk proxy.</p></aside>
  `;
}

function announce(message) {
  const live = document.getElementById("live-status");
  if (live) live.textContent = message;
}

renderPage();
