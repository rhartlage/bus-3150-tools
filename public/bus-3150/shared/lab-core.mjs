export const LAB_ORDER = ["lp", "network", "simulation", "forecast"];

export const LAB_META = {
  lp: {
    route: "/bus-3150/lp-formulation-sensitivity/",
    nav: "LP & sensitivity",
    chapters: "Chapters 1–4",
    title: "LP Formulation & Sensitivity",
    eyebrow: "Model the decision before opening Solver",
    question: "Can your pair translate the story correctly—and explain what one more unit of a binding resource is worth?",
    appDate: "August 26",
    excelDate: "August 28",
    duration: "25–30 minutes in pairs",
    check: "Engagement Check 1",
    excelCase: "BUS3150_LP_Sensitivity_FollowThrough.xlsx",
    handoffPrompt: "A resource RHS rises by one unit while the current basis remains valid. Identify the evidence that tells you whether the objective should rise, fall, or remain unchanged.",
  },
  network: {
    route: "/bus-3150/network-integer-decisions/",
    nav: "Network & integer",
    chapters: "Chapters 6–8",
    title: "Network & Integer Decisions",
    eyebrow: "Feasible first; cheapest second",
    question: "Which binary facility pattern meets every service rule at the lowest total cost?",
    appDate: "September 30",
    excelDate: "October 2",
    duration: "25–30 minutes in pairs",
    check: "Engagement Check 4",
    excelCase: "BUS3150_Network_Integer_FollowThrough.xlsx",
    handoffPrompt: "Given three binary opening decisions and a tightened service rule, choose the best feasible design and name the constraint that eliminates the tempting cheaper option.",
  },
  simulation: {
    route: "/bus-3150/simulation-operating-risk/",
    nav: "Simulation & risk",
    chapters: "Chapter 12",
    title: "Simulation & Operating Risk",
    eyebrow: "Averages can hide the operating day that hurts",
    question: "Which capacity plan balances expected operating cost with an explicit shortage-risk limit?",
    appDate: "November 4",
    excelDate: "November 6",
    duration: "25–30 minutes in pairs",
    check: "Engagement Check 9",
    excelCase: "BUS3150_Simulation_Risk_FollowThrough.xlsx",
    handoffPrompt: "Choose a capacity recommendation from a simulation summary, then distinguish expected cost from the probability of any shortage.",
  },
  forecast: {
    route: "/bus-3150/forecast-to-decision/",
    nav: "Forecast to decision",
    chapters: "Chapters 10 & 15",
    title: "Forecast-to-Decision",
    eyebrow: "Accuracy matters because the forecast drives a real commitment",
    question: "Which method earns the decision—and how much inventory buffer should uncertainty justify?",
    appDate: "December 2",
    excelDate: "December 4",
    duration: "25–30 minutes in pairs",
    check: "Engagement Check 12",
    excelCase: "BUS3150_Forecast_Inventory_Capstone.xlsx",
    handoffPrompt: "Select a forecasting method from common-window accuracy evidence and explain how forecast uncertainty should change the inventory recommendation.",
  },
};

export const LP_SCENARIOS = [
  {
    id: "trail-mix",
    runLabel: "Trail Mix Launch",
    story: "A campus food venture makes Summit Bars (x) and Trail Bites (y). Weekly machine and packing capacity are limited.",
    xName: "Summit Bars (x)",
    yName: "Trail Bites (y)",
    objectiveLabel: "Contribution margin",
    objective: [42, 30],
    constraints: [
      { label: "Machine hours", coefficients: [2, 1], rhs: 100 },
      { label: "Packing hours", coefficients: [1, 1.5], rhs: 90 },
    ],
    bindingAnswer: "both",
    sourceTable: [
      ["Contribution per batch", "$42", "$30", "—"],
      ["Machine hours", "2", "1", "100 available"],
      ["Packing hours", "1", "1.5", "90 available"],
    ],
    decisionNote: "Interpret a local resource value only while the current optimal corner remains valid.",
  },
  {
    id: "assembly-cell",
    runLabel: "Assembly Cell Mix",
    story: "A small manufacturer schedules Precision Kits (x) and Field Kits (y) through machining and final assembly.",
    xName: "Precision Kits (x)",
    yName: "Field Kits (y)",
    objectiveLabel: "Contribution margin",
    objective: [54, 38],
    constraints: [
      { label: "Machining hours", coefficients: [3, 1], rhs: 120 },
      { label: "Assembly hours", coefficients: [1, 2], rhs: 100 },
    ],
    bindingAnswer: "both",
    sourceTable: [
      ["Contribution per kit", "$54", "$38", "—"],
      ["Machining hours", "3", "1", "120 available"],
      ["Assembly hours", "1", "2", "100 available"],
    ],
    decisionNote: "A positive local resource value supports expansion only after the cost of that extra capacity is considered.",
  },
  {
    id: "clinic-sessions",
    runLabel: "Clinic Session Mix",
    story: "A clinic allocates weekly capacity between Standard Sessions (x) and Extended Sessions (y).",
    xName: "Standard Sessions (x)",
    yName: "Extended Sessions (y)",
    objectiveLabel: "Weekly benefit score",
    objective: [70, 100],
    constraints: [
      { label: "Nurse blocks", coefficients: [1, 2], rhs: 80 },
      { label: "Room blocks", coefficients: [1, 1], rhs: 50 },
    ],
    bindingAnswer: "both",
    sourceTable: [
      ["Benefit per session", "70", "100", "—"],
      ["Nurse blocks", "1", "2", "80 available"],
      ["Room blocks", "1", "1", "50 available"],
    ],
    decisionNote: "A model recommendation still requires a fairness and stakeholder-capacity check before implementation.",
  },
];

export const NETWORK_SCENARIOS = [
  {
    id: "relief-depots",
    runLabel: "Regional Relief Depots",
    story: "Select depots A, B, and C. Every neighborhood must be assigned, and the farthest assignment may not exceed 15 minutes.",
    serviceTarget: "Zero unserved neighborhoods; maximum assignment time ≤ 15 minutes",
    binaryCount: 3,
    correctId: "BC",
    candidates: [
      { id: "A", facilities: "A", vector: "1, 0, 0", cost: 88, maxTime: 22, unserved: 2 },
      { id: "B", facilities: "B", vector: "0, 1, 0", cost: 82, maxTime: 25, unserved: 3 },
      { id: "AB", facilities: "A + B", vector: "1, 1, 0", cost: 118, maxTime: 12, unserved: 0 },
      { id: "AC", facilities: "A + C", vector: "1, 0, 1", cost: 116, maxTime: 13, unserved: 0 },
      { id: "BC", facilities: "B + C", vector: "0, 1, 1", cost: 112, maxTime: 15, unserved: 0 },
    ],
    stakeholder: "The lowest sticker price is not acceptable if neighborhoods are left without service.",
  },
  {
    id: "service-hubs",
    runLabel: "Mobile Service Hubs",
    story: "Choose hubs North, Central, and South. All demand zones need coverage, and the maximum response time is 14 minutes.",
    serviceTarget: "Zero unserved zones; maximum response time ≤ 14 minutes",
    binaryCount: 3,
    correctId: "NS",
    candidates: [
      { id: "N", facilities: "North", vector: "1, 0, 0", cost: 73, maxTime: 24, unserved: 3 },
      { id: "C", facilities: "Central", vector: "0, 1, 0", cost: 79, maxTime: 20, unserved: 2 },
      { id: "NC", facilities: "North + Central", vector: "1, 1, 0", cost: 121, maxTime: 13, unserved: 0 },
      { id: "NS", facilities: "North + South", vector: "1, 0, 1", cost: 115, maxTime: 14, unserved: 0 },
      { id: "CS", facilities: "Central + South", vector: "0, 1, 1", cost: 119, maxTime: 12, unserved: 0 },
    ],
    stakeholder: "A transparent feasibility screen prevents a cost-only recommendation from hiding service gaps.",
  },
  {
    id: "pickup-lockers",
    runLabel: "Community Pickup Lockers",
    story: "Choose locker banks East, Midtown, and West. Every census block must be covered within a 10-minute walk.",
    serviceTarget: "Zero uncovered blocks; maximum walk time ≤ 10 minutes",
    binaryCount: 3,
    correctId: "EM",
    candidates: [
      { id: "E", facilities: "East", vector: "1, 0, 0", cost: 58, maxTime: 18, unserved: 4 },
      { id: "M", facilities: "Midtown", vector: "0, 1, 0", cost: 61, maxTime: 16, unserved: 2 },
      { id: "EM", facilities: "East + Midtown", vector: "1, 1, 0", cost: 99, maxTime: 10, unserved: 0 },
      { id: "EW", facilities: "East + West", vector: "1, 0, 1", cost: 104, maxTime: 9, unserved: 0 },
      { id: "MW", facilities: "Midtown + West", vector: "0, 1, 1", cost: 102, maxTime: 10, unserved: 0 },
    ],
    stakeholder: "Fair access belongs in the constraints, not in a footnote after optimization.",
  },
];

export const SIMULATION_SCENARIOS = [
  {
    id: "fulfillment",
    runLabel: "Campus Fulfillment Desk",
    story: "Daily order demand is discrete. Compare three staffed-capacity plans over 2,000 reproducible days.",
    seed: 31501200,
    trials: 2000,
    riskLimit: 0.4,
    demandValues: [70, 85, 100, 120, 140],
    probabilities: [0.1, 0.25, 0.3, 0.25, 0.1],
    shortagePenalty: 30,
    idleCost: 2,
    plans: [
      { id: "lean", name: "Lean 90", capacity: 90, baseCost: 800 },
      { id: "balanced", name: "Balanced 110", capacity: 110, baseCost: 1050 },
      { id: "buffered", name: "Buffered 130", capacity: 130, baseCost: 1350 },
    ],
    correctPlan: "balanced",
    middlePlan: "balanced",
    middleShortageAtHigh: 30,
    stewardship: "Recommend from both cost and service evidence; do not describe a low average cost as risk-free.",
  },
  {
    id: "call-center",
    runLabel: "Service Call Desk",
    story: "Daily call demand varies sharply. Compare three staffed-capacity plans over 2,000 reproducible days.",
    seed: 31501220,
    trials: 2000,
    riskLimit: 0.35,
    demandValues: [60, 80, 100, 125, 150],
    probabilities: [0.12, 0.23, 0.32, 0.23, 0.1],
    shortagePenalty: 28,
    idleCost: 1.5,
    plans: [
      { id: "lean", name: "Lean 85", capacity: 85, baseCost: 760 },
      { id: "balanced", name: "Balanced 115", capacity: 115, baseCost: 1040 },
      { id: "buffered", name: "Buffered 140", capacity: 140, baseCost: 1325 },
    ],
    correctPlan: "balanced",
    middlePlan: "balanced",
    middleShortageAtHigh: 35,
    stewardship: "A staffing plan changes customer waiting and employee strain, not merely a cost cell.",
  },
  {
    id: "clinic-arrivals",
    runLabel: "Walk-In Clinic Capacity",
    story: "Daily arrivals follow a discrete distribution. Compare three service-capacity plans over 2,000 reproducible days.",
    seed: 31501240,
    trials: 2000,
    riskLimit: 0.33,
    demandValues: [45, 60, 75, 95, 115],
    probabilities: [0.15, 0.25, 0.3, 0.2, 0.1],
    shortagePenalty: 42,
    idleCost: 2,
    plans: [
      { id: "lean", name: "Lean 65", capacity: 65, baseCost: 690 },
      { id: "balanced", name: "Balanced 90", capacity: 90, baseCost: 980 },
      { id: "buffered", name: "Buffered 110", capacity: 110, baseCost: 1280 },
    ],
    correctPlan: "balanced",
    middlePlan: "balanced",
    middleShortageAtHigh: 25,
    stewardship: "Capacity decisions affect patients and staff; show the tail risk honestly.",
  },
];

export const FORECAST_SCENARIOS = [
  {
    id: "steady-growth",
    runLabel: "Reusable Bottle Demand",
    story: "Eight periods show steady growth. Compare methods on the same four-period validation window before setting the next inventory target.",
    periods: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"],
    demand: [120, 126, 129, 136, 142, 148, 151, 158],
    expectedBest: "trend",
    alpha: 0.4,
    seasonLength: 4,
    safetyFactor: 1.28,
    decisionRule: "Use the selected next-period forecast plus a buffer tied to common-window forecast error.",
  },
  {
    id: "seasonal-cycle",
    runLabel: "Campus Print Orders",
    story: "Eight periods repeat a four-period cycle with modest growth. Compare methods on the same four-period validation window.",
    periods: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"],
    demand: [90, 112, 100, 126, 96, 118, 106, 132],
    expectedBest: "seasonal",
    alpha: 0.4,
    seasonLength: 4,
    safetyFactor: 1.28,
    decisionRule: "Preserve the seasonal pattern, then add a buffer that reflects the method’s observed errors.",
  },
  {
    id: "stable-level",
    runLabel: "Replacement Part Demand",
    story: "Eight periods fluctuate around a stable level. Compare methods on a common validation window before stocking the next period.",
    periods: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"],
    demand: [102, 97, 104, 99, 101, 100, 98, 102],
    expectedBest: "smoothing",
    alpha: 0.4,
    seasonLength: 4,
    safetyFactor: 1.28,
    decisionRule: "Use accuracy evidence, not the most recent observation alone, and keep the buffer proportional to uncertainty.",
  },
];

const EPSILON = 1e-8;

export function solveTwoVariableLp(scenario) {
  const candidates = [{ x: 0, y: 0, source: "origin" }];

  for (const constraint of scenario.constraints) {
    const [a, b] = constraint.coefficients;
    if (Math.abs(a) > EPSILON) candidates.push({ x: constraint.rhs / a, y: 0, source: constraint.label });
    if (Math.abs(b) > EPSILON) candidates.push({ x: 0, y: constraint.rhs / b, source: constraint.label });
  }

  for (let i = 0; i < scenario.constraints.length; i += 1) {
    for (let j = i + 1; j < scenario.constraints.length; j += 1) {
      const first = scenario.constraints[i];
      const second = scenario.constraints[j];
      const [a1, b1] = first.coefficients;
      const [a2, b2] = second.coefficients;
      const determinant = a1 * b2 - a2 * b1;
      if (Math.abs(determinant) <= EPSILON) continue;
      candidates.push({
        x: (first.rhs * b2 - second.rhs * b1) / determinant,
        y: (a1 * second.rhs - a2 * first.rhs) / determinant,
        source: `${first.label} + ${second.label}`,
      });
    }
  }

  const feasible = candidates
    .filter(({ x, y }) => x >= -EPSILON && y >= -EPSILON)
    .filter(({ x, y }) => scenario.constraints.every((constraint) => {
      const [a, b] = constraint.coefficients;
      return a * x + b * y <= constraint.rhs + EPSILON;
    }))
    .map((candidate) => ({
      ...candidate,
      x: Math.max(0, candidate.x),
      y: Math.max(0, candidate.y),
      value: scenario.objective[0] * candidate.x + scenario.objective[1] * candidate.y,
    }))
    .sort((a, b) => b.value - a.value);

  const best = feasible[0];
  const constraints = scenario.constraints.map((constraint) => {
    const used = constraint.coefficients[0] * best.x + constraint.coefficients[1] * best.y;
    return {
      label: constraint.label,
      used,
      rhs: constraint.rhs,
      slack: constraint.rhs - used,
      binding: Math.abs(constraint.rhs - used) <= 1e-6,
    };
  });

  return { ...best, constraints, feasible };
}

export function lpSensitivity(scenario) {
  const base = solveTwoVariableLp(scenario);
  return scenario.constraints.map((constraint, index) => {
    const changed = {
      ...scenario,
      constraints: scenario.constraints.map((item, itemIndex) => ({
        ...item,
        coefficients: [...item.coefficients],
        rhs: item.rhs + (itemIndex === index ? 1 : 0),
      })),
    };
    const next = solveTwoVariableLp(changed);
    return {
      label: constraint.label,
      binding: base.constraints[index].binding,
      slack: base.constraints[index].slack,
      localValue: next.value - base.value,
    };
  });
}

export function evaluateNetworkScenario(scenario) {
  const evaluated = scenario.candidates.map((candidate) => ({
    ...candidate,
    feasible: candidate.unserved === 0 && candidate.maxTime <= Number(scenario.serviceTarget.match(/≤\s*(\d+)/)?.[1] ?? Infinity),
  }));
  const recommended = evaluated.filter((candidate) => candidate.feasible).sort((a, b) => a.cost - b.cost)[0];
  return { candidates: evaluated, recommended };
}

export function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function simulateOperatingRisk(scenario, seedOffset = 0) {
  const random = seededRandom(scenario.seed + seedOffset);
  const observations = [];
  for (let trial = 0; trial < scenario.trials; trial += 1) {
    const draw = random();
    let cumulative = 0;
    let demand = scenario.demandValues.at(-1);
    for (let index = 0; index < scenario.demandValues.length; index += 1) {
      cumulative += scenario.probabilities[index];
      if (draw <= cumulative + EPSILON) {
        demand = scenario.demandValues[index];
        break;
      }
    }
    observations.push(demand);
  }

  const plans = scenario.plans.map((plan) => {
    let shortageDays = 0;
    let shortageUnits = 0;
    let idleUnits = 0;
    for (const demand of observations) {
      const shortage = Math.max(0, demand - plan.capacity);
      const idle = Math.max(0, plan.capacity - demand);
      if (shortage > 0) shortageDays += 1;
      shortageUnits += shortage;
      idleUnits += idle;
    }
    const shortageProbability = shortageDays / observations.length;
    const averageShortage = shortageUnits / observations.length;
    const averageIdle = idleUnits / observations.length;
    const expectedCost = plan.baseCost
      + scenario.shortagePenalty * averageShortage
      + scenario.idleCost * averageIdle;
    return {
      ...plan,
      shortageProbability,
      averageShortage,
      averageIdle,
      expectedCost,
      withinRiskLimit: shortageProbability <= scenario.riskLimit,
    };
  });

  const eligible = plans.filter((plan) => plan.withinRiskLimit);
  const recommended = (eligible.length ? eligible : plans).sort((a, b) => a.expectedCost - b.expectedCost)[0];
  return { seed: scenario.seed + seedOffset, plans, recommended, observations };
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function fitLinearTrend(values) {
  const xMean = (values.length - 1) / 2;
  const yMean = mean(values);
  let numerator = 0;
  let denominator = 0;
  values.forEach((value, index) => {
    numerator += (index - xMean) * (value - yMean);
    denominator += (index - xMean) ** 2;
  });
  const slope = denominator === 0 ? 0 : numerator / denominator;
  return { intercept: yMean - slope * xMean, slope };
}

export const FORECAST_METHODS = {
  naive: "Naive",
  moving: "Three-period moving average",
  smoothing: "Exponential smoothing (α = 0.40)",
  trend: "Rolling linear trend",
  seasonal: "Seasonal naive (lag 4)",
};

export function calculateForecastComparison(scenario) {
  const data = scenario.demand;
  const forecasts = Object.fromEntries(Object.keys(FORECAST_METHODS).map((method) => [method, Array(data.length).fill(null)]));
  let level = data[0];

  for (let index = 1; index < data.length; index += 1) {
    forecasts.naive[index] = data[index - 1];
    if (index >= 3) forecasts.moving[index] = mean(data.slice(index - 3, index));
    forecasts.smoothing[index] = level;
    level = scenario.alpha * data[index] + (1 - scenario.alpha) * level;
    if (index >= 2) {
      const trend = fitLinearTrend(data.slice(0, index));
      forecasts.trend[index] = trend.intercept + trend.slope * index;
    }
    if (index >= scenario.seasonLength) forecasts.seasonal[index] = data[index - scenario.seasonLength];
  }

  const next = {
    naive: data.at(-1),
    moving: mean(data.slice(-3)),
    smoothing: level,
    trend: (() => {
      const model = fitLinearTrend(data);
      return model.intercept + model.slope * data.length;
    })(),
    seasonal: data[data.length - scenario.seasonLength],
  };

  const validationStart = scenario.seasonLength;
  const rows = Object.keys(FORECAST_METHODS).map((method) => {
    const errors = data.slice(validationStart).map((actual, offset) => {
      const forecast = forecasts[method][validationStart + offset];
      return actual - forecast;
    });
    const mae = mean(errors.map((error) => Math.abs(error)));
    const rmse = Math.sqrt(mean(errors.map((error) => error ** 2)));
    return {
      id: method,
      label: FORECAST_METHODS[method],
      mae,
      rmse,
      nextForecast: next[method],
      errors,
    };
  }).sort((a, b) => a.mae - b.mae || a.rmse - b.rmse);

  const best = rows[0];
  const residualScale = Math.max(1, best.rmse);
  return {
    rows,
    best,
    validationStart,
    recommendedInventory: Math.ceil(best.nextForecast + scenario.safetyFactor * residualScale),
  };
}

export function round(value, digits = 1) {
  const scale = 10 ** digits;
  return Math.round((value + Number.EPSILON) * scale) / scale;
}
