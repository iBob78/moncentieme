import test from 'node:test';
import assert from 'node:assert/strict';
import { timeToCentesimal, centesimalToSexagesimal, formatCentesimalTime, calculateDuration, parseTimeOfDay, parseDurationInput, parseNonNegativeDecimal, calculateNetHours, generateMinuteConversionTable, parseCumulStartTime, formatCumulStartTime, calculateCumulWorkHours } from '../src/utils/timeCalculations.ts';

test('conversion et arrondi', () => {
  assert.equal(timeToCentesimal(13, 30), 13.5);
  assert.equal(timeToCentesimal(0, 0, 36), 0.01);
  assert.deepEqual(centesimalToSexagesimal(7.6), { hours: 7, minutes: 36, seconds: 0, milliseconds: 0 });
  assert.equal(formatCentesimalTime(7.5, 2, ','), '7,50');
  assert.equal(centesimalToSexagesimal(1.99999).hours, 2);
  assert.equal(generateMinuteConversionTable().length, 60);
});
test('horaires et minuit', () => {
  assert.equal(calculateDuration('22:30', '06:15').minutesTotal, 465);
  assert.equal(calculateDuration('08:00', '08:00').minutesTotal, 0);
  assert.equal(calculateDuration('08:00', '24:00').minutesTotal, 960);
  for (const v of ['24:01', '12:60', '-1:30', '12:', '8:30:50', 'x']) assert.equal(parseTimeOfDay(v), null);
  assert.equal(calculateDuration('12:60', '18:00').minutesTotal, 0);
  assert.equal(parseTimeOfDay('7h30'), 450);
});
test('validation des durées et du taux', () => {
  assert.equal(parseDurationInput('0,50', 'c'), 0.5);
  assert.equal(parseDurationInput('1:30', 'h'), 1.5);
  assert.equal(parseDurationInput('1h30:36', 'h'), 1.51);
  for (const v of ['-1', '1abc', 'Infinity', '1e3', '', '1:60', '1:30:60', '1:30:00:1']) assert.equal(parseDurationInput(v, 'h'), null);
  assert.equal(parseNonNegativeDecimal('25,50'), 25.5);
});
test('cumul et arrondi final', () => {
  assert.equal(calculateNetHours(10, [0.5], [1]), 9.5);
  assert.equal(calculateNetHours(10, [parseDurationInput('1:30', 'h')], [1]), 10.5);
  assert.equal(calculateNetHours(1, [], [2]), 0);
  assert.equal(formatCentesimalTime(calculateNetHours(0, [1/60,1/60,1/60], [])), '0.05');
});

test('début du cumul en heure normale ou décimale', () => {
  assert.equal(parseCumulStartTime('07:30', 'h'), 27000);
  assert.equal(parseCumulStartTime('7,50', 'c'), 27000);
  assert.equal(parseCumulStartTime('7.50', 'c'), 27000);
  assert.equal(formatCumulStartTime(27000, 'c'), '7,50');
  assert.equal(formatCumulStartTime(27000, 'h'), '07:30');
  assert.equal(formatCumulStartTime(parseCumulStartTime('7,33', 'c'), 'h'), '07:19:48');
  for (const v of ['24,01', '-1', '25', '7abc', '07:30', '']) assert.equal(parseCumulStartTime(v, 'c'), null);
  for (const v of ['24:00:01', '07:60', '07:30:60', '7.50']) assert.equal(parseCumulStartTime(v, 'h'), null);
  assert.equal(parseCumulStartTime('24:00', 'h'), 86400);
  assert.equal(parseCumulStartTime('24,00', 'c'), 86400);
});
test('changement d’unité sans perte de seconde', () => {
  for (let s = 0; s <= 86400; s++) {
    assert.equal(parseCumulStartTime(formatCumulStartTime(s, 'c'), 'c'), s);
    assert.equal(parseCumulStartTime(formatCumulStartTime(s, 'h'), 'h'), s);
  }
});
test('durée brute avec départ décimal, minuit et pauses', () => {
  assert.equal(calculateCumulWorkHours(parseCumulStartTime('7,50', 'c'), 16 * 60), 8.5);
  assert.equal(calculateNetHours(calculateCumulWorkHours(parseCumulStartTime('7,50', 'c'), 16 * 60), [], [0.5]), 8);
  assert.equal(calculateCumulWorkHours(parseCumulStartTime('22,50', 'c'), 6 * 60), 7.5);
  assert.equal(calculateCumulWorkHours(parseCumulStartTime('7,33', 'c'), 8 * 60), 0.67);
  assert.equal(calculateCumulWorkHours(null, 16 * 60), 0);
  assert.equal(calculateCumulWorkHours(27000, null), 0);
});
