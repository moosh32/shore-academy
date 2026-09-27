import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_RISK_PCT,
  MAX_HEAT,
  actualRLong,
  expectancy,
  losingStreak,
  positionSize,
  recovery,
  recoveryNeeded,
  riskReward,
} from "./calc";

describe("defaults", () => {
  it("uses Moshe's canonical risk and heat", () => {
    assert.equal(DEFAULT_RISK_PCT, 0.003);
    assert.equal(MAX_HEAT, 0.015);
  });
});

describe("positionSize", () => {
  it("computes risk money and floored shares", () => {
    const result = positionSize({
      equity: 100_000,
      riskPct: 0.003,
      entry: 50,
      stop: 48,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(Math.abs(result.data.riskMoney - 300) < 1e-9);
    assert.equal(result.data.stopDistance, 2);
    assert.equal(result.data.shares, 150);
    assert.ok(Math.abs(result.data.actualRisk - 300) < 1e-9);
    assert.equal(result.data.warnings.length, 0);
  });

  it("floors shares and reports the cash actually at risk", () => {
    const result = positionSize({
      equity: 100_000,
      riskPct: 0.003,
      entry: 100,
      stop: 93,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.data.shares, 42);
    assert.ok(Math.abs(result.data.actualRisk - 294) < 1e-9);
    assert.ok(Math.abs(result.data.unusedRisk - 6) < 1e-9);
  });

  it("returns zero shares when the stop is too far for the risk budget", () => {
    const result = positionSize({
      equity: 1_000,
      riskPct: 0.003,
      entry: 500,
      stop: 100,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.data.shares, 0);
    assert.equal(result.data.actualRisk, 0);
  });

  it("warns above 0.3% risk and above 1.5% heat", () => {
    const result = positionSize({
      equity: 100_000,
      riskPct: 0.01,
      entry: 50,
      stop: 48,
      openHeatPct: 0.01,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.data.warnings.length, 2);
    assert.ok(Math.abs(result.data.heatAfter - 0.02) < 1e-9);
  });

  it("rejects a stop sitting on the entry", () => {
    const result = positionSize({
      equity: 100_000,
      riskPct: 0.003,
      entry: 50,
      stop: 50,
    });
    assert.equal(result.ok, false);
  });
});

describe("expectancy", () => {
  it("matches EV = WR*avgWin - (1-WR)*avgLoss", () => {
    const result = expectancy({ winRate: 0.4, avgWinR: 2, avgLossR: 1 });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(Math.abs(result.data.ev - 0.2) < 1e-12);
  });

  it("allows a low win rate to stay positive", () => {
    const result = expectancy({ winRate: 0.35, avgWinR: 3, avgLossR: 1 });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(Math.abs(result.data.ev - 0.4) < 1e-12);
  });

  it("rejects a negative loss magnitude", () => {
    const result = expectancy({ winRate: 0.5, avgWinR: 1, avgLossR: -1 });
    assert.equal(result.ok, false);
  });
});

describe("recovery", () => {
  it("needs 1/9 more after a 10% drawdown", () => {
    assert.ok(Math.abs(recoveryNeeded(0.1) - 0.1 / 0.9) < 1e-12);
    const result = recovery(0.1);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(Math.abs(result.data.needed - 1 / 9) < 1e-12);
  });

  it("needs 100% after a 50% drawdown", () => {
    assert.equal(recoveryNeeded(0.5), 1);
  });

  it("rejects 0 and 100 percent", () => {
    assert.equal(recovery(0).ok, false);
    assert.equal(recovery(1).ok, false);
  });
});

describe("riskReward", () => {
  it("computes planned R for a long", () => {
    const result = riskReward({ entry: 100, stop: 96, target: 108 });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.data.riskDist, 4);
    assert.equal(result.data.rewardDist, 8);
    assert.equal(result.data.ratio, 2);
    assert.equal(result.data.isLong, true);
    assert.equal(result.data.directionOk, true);
  });

  it("flags a target on the wrong side", () => {
    const result = riskReward({ entry: 100, stop: 96, target: 98 });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.data.directionOk, false);
  });
});

describe("losingStreak", () => {
  it("raises the loss rate to the streak length", () => {
    const result = losingStreak({ lossRate: 0.6, length: 3, riskPct: 0.003 });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(Math.abs(result.data.probability - 0.6 ** 3) < 1e-12);
    assert.ok(Math.abs(result.data.equityLeft - 0.997 ** 3) < 1e-12);
  });
});

describe("actualRLong", () => {
  it("matches the lesson example", () => {
    assert.equal(actualRLong(100, 96, 108), 2);
    assert.equal(actualRLong(40, 38.5, 43), 2);
  });
});
