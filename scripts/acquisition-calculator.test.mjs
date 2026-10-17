import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateAcquisition } from '../assets/acquisition-calculator.mjs';

test('Exemple : 500 € investis, 20 demandes et 5 clients', () => {
  assert.deepEqual(calculateAcquisition({ budget: 500, leads: 20, customers: 5, basket: 1000, margin: 40 }), {
    costPerLead: 25, costPerCustomer: 100, conversion: 0.25,
    revenue: 5000, grossMargin: 2000, contribution: 1500,
  });
});

test('Aucun client : pas de division par zéro, coût et perte conservés', () => {
  const metrics = calculateAcquisition({ budget: 500, leads: 0, customers: 0, basket: 1000, margin: 40 });
  assert.equal(metrics.costPerLead, null);
  assert.equal(metrics.costPerCustomer, null);
  assert.equal(metrics.conversion, null);
  assert.equal(metrics.contribution, -500);
});

test('Refus des données incohérentes ou non finies', () => {
  const input = { budget: 500, leads: 20, customers: 5, basket: 1000, margin: 40 };
  for (const values of [{ customers: 21 }, { leads: 1.5 }, { margin: 101 }, { budget: -1 }, { basket: NaN }, { budget: Infinity }]) {
    assert.throws(() => calculateAcquisition({ ...input, ...values }), RangeError);
  }
});
