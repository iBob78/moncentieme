import test from 'node:test';
import assert from 'node:assert/strict';
import { timeToCentesimal, centesimalToSexagesimal, formatCentesimalTime, calculateDuration, parseTimeOfDay, parseDurationInput, parseNonNegativeDecimal, calculateNetHours, generateMinuteConversionTable } from '../src/utils/timeCalculations.ts';

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
