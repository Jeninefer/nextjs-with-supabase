import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getRiskIndicator,
  getRiskLevel,
  RISK_INDICATOR_HIGH,
  RISK_INDICATOR_LOW,
  RISK_INDICATOR_MEDIUM,
} from '../lib/risk-indicators';

test('getRiskIndicator returns expected emoji per threshold', () => {
  assert.equal(getRiskIndicator(0), RISK_INDICATOR_LOW);
  assert.equal(getRiskIndicator(29.9), RISK_INDICATOR_LOW);
  assert.equal(getRiskIndicator(30), RISK_INDICATOR_MEDIUM);
  assert.equal(getRiskIndicator(59.9), RISK_INDICATOR_MEDIUM);
  assert.equal(getRiskIndicator(60), RISK_INDICATOR_HIGH);
});

test('getRiskLevel returns textual classification per threshold', () => {
  assert.equal(getRiskLevel(5), 'low');
  assert.equal(getRiskLevel(45), 'medium');
  assert.equal(getRiskLevel(75), 'high');
});
