import assert from "node:assert/strict";
import test from "node:test";
import {
  LP_SCENARIOS,
  NETWORK_SCENARIOS,
  SIMULATION_SCENARIOS,
  FORECAST_SCENARIOS,
  solveTwoVariableLp,
  lpSensitivity,
  evaluateNetworkScenario,
  seededRandom,
  simulateOperatingRisk,
  calculateForecastComparison,
} from "../public/bus-3150/shared/lab-core.mjs";

test("LP scenarios solve to feasible binding-resource optima", () => {
  const expected = {
    "trail-mix": [30, 40, 2460],
    "assembly-cell": [28, 36, 2880],
    "clinic-sessions": [20, 30, 4400],
  };

  for (const scenario of LP_SCENARIOS) {
    const solution = solveTwoVariableLp(scenario);
    const [x, y, value] = expected[scenario.id];
    assert.ok(Math.abs(solution.x - x) < 1e-8, `${scenario.id} x`);
    assert.ok(Math.abs(solution.y - y) < 1e-8, `${scenario.id} y`);
    assert.ok(Math.abs(solution.value - value) < 1e-8, `${scenario.id} objective`);
    assert.ok(solution.constraints.every((constraint) => constraint.binding));
    assert.ok(lpSensitivity(scenario).every((row) => Number.isFinite(row.localValue) && row.localValue > 0));
  }
});

test("network recommendation is the least-cost feasible binary pattern", () => {
  for (const scenario of NETWORK_SCENARIOS) {
    const result = evaluateNetworkScenario(scenario);
    assert.equal(result.recommended.id, scenario.correctId);
    assert.equal(result.recommended.unserved, 0);
    assert.ok(result.recommended.feasible);
    assert.ok(
      result.candidates
        .filter((candidate) => candidate.feasible)
        .every((candidate) => candidate.cost >= result.recommended.cost),
    );
  }
});

test("seeded random stream and simulation first run are reproducible", () => {
  const first = seededRandom(3150);
  const second = seededRandom(3150);
  assert.deepEqual(
    Array.from({ length: 8 }, () => first()),
    Array.from({ length: 8 }, () => second()),
  );

  for (const scenario of SIMULATION_SCENARIOS) {
    const firstRun = simulateOperatingRisk(scenario);
    const repeatedRun = simulateOperatingRisk(scenario);
    assert.deepEqual(firstRun, repeatedRun);
    assert.equal(firstRun.recommended.id, scenario.correctPlan);
    assert.ok(firstRun.recommended.withinRiskLimit);
  }
});

test("optional deterministic reruns change the sample without changing the governing recommendation", () => {
  for (const scenario of SIMULATION_SCENARIOS) {
    const firstRun = simulateOperatingRisk(scenario, 0);
    const alternateRun = simulateOperatingRisk(scenario, 7);
    assert.notDeepEqual(firstRun.observations, alternateRun.observations);
    assert.equal(alternateRun.recommended.id, scenario.correctPlan);
  }
});

test("forecast scenarios select the intended pattern-sensitive method", () => {
  for (const scenario of FORECAST_SCENARIOS) {
    const result = calculateForecastComparison(scenario);
    assert.equal(result.best.id, scenario.expectedBest, scenario.id);
    assert.ok(Number.isFinite(result.best.nextForecast));
    assert.ok(Number.isFinite(result.best.mae));
    assert.ok(result.recommendedInventory > result.best.nextForecast);
    assert.equal(result.rows.length, 5);
  }
});
