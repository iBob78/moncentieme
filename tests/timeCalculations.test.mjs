import test from 'node:test';
import assert from 'node:assert/strict';
import { timeToCentesimal, centesimalToSexagesimal, formatCentesimalTime, calculateDuration, parseTimeOfDay, parseDurationInput, parseNonNegativeDecimal, calculateNetHours, generateMinuteConversionTable, parseCumulStartTime, formatCumulStartTime, calculateCumulWorkHours, calculateEntryEnd, reorderEntries, formatCumulDecimal, scheduleCumulEntries, normalizeCumulStart, calculateCumulPauseDeduction, decimalHoursToMinutes } from '../src/utils/timeCalculations.ts';

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

test('horaire de chaque activité : Harmo 2,70 h, équivalence et minuit', () => {
  const duration = parseDurationInput('2.70', 'c');
  assert.equal(duration, 2.7);
  const start = parseCumulStartTime('07:30', 'h');
  assert.equal(start, parseCumulStartTime('7,50', 'c'));
  const end = calculateEntryEnd(start, duration);
  assert.equal(formatCumulStartTime(end.seconds, 'h'), '10:12');
  assert.equal(formatCumulStartTime(end.seconds, 'c'), '10,20');
  assert.equal(end.daysLater, 0);
  assert.deepEqual(calculateEntryEnd(parseCumulStartTime('23:30', 'h'), duration), { seconds: 7920, daysLater: 1 });
  assert.deepEqual(calculateEntryEnd(0, 0), { seconds: 0, daysLater: 0 });
  assert.equal(calculateEntryEnd(27000, -1), null);
  assert.equal(calculateEntryEnd(-1, 2.7), null);
  assert.equal(calculateEntryEnd(27000, Infinity), null);
  assert.equal(calculateNetHours(0, [duration], []), 2.7);
});

test('réorganisation du cumul : déplacer une pause avant ou après une activité', () => {
  const harmo = { id: 'h', value: 2.7, startRaw: '07:30', isBreak: false };
  const pause = { id: 'p', value: 0.5, startRaw: '10:12', isBreak: true };
  const reunion = { id: 'r', value: 1.5, startRaw: '10:42', isBreak: false };
  const original = [harmo, pause, reunion];
  const before = reorderEntries(original, 1, 0);
  assert.deepEqual(before, [pause, harmo, reunion]);
  assert.deepEqual(reorderEntries(before, 0, 2), [harmo, reunion, pause]);
  assert.deepEqual(original, [harmo, pause, reunion]);
  assert.strictEqual(before[0], pause);
  assert.strictEqual(reorderEntries(original, 0, -1), original);
  assert.strictEqual(reorderEntries(original, 2, 3), original);
  assert.strictEqual(reorderEntries(original, 1, 1), original);
  const total = entries => calculateNetHours(0, entries.filter(e => !e.isBreak).map(e => e.value), entries.filter(e => e.isBreak).map(e => e.value));
  assert.equal(total(before), total(original));
});

test('découpage Harmo : pause de 11:30 à 12:00, reprise et durée conservée', () => {
  const entries = [{id:'h',start:33600,duration:2.7},{id:'p',start:41400,duration:0.5,isBreak:true}];
  const slots = scheduleCumulEntries(entries);
  assert.deepEqual(slots.get('h'), [{start:33600,end:41400},{start:43200,end:45120}]);
  assert.deepEqual(slots.get('p'), [{start:41400,end:43200}]);
  assert.equal(slots.get('h').reduce((n,s)=>n+s.end-s.start,0),9720);
  assert.equal(calculateCumulPauseDeduction(entries,null,null),0);
  assert.equal(calculateNetHours(0,[2.7],[calculateCumulPauseDeduction(entries,null,null)]),2.7);
  assert.equal(calculateCumulPauseDeduction(entries,9*3600,13*60),0.5);
  assert.equal(formatCumulDecimal(9+20/60),'9,33');
  assert.equal(formatCumulDecimal(12+32/60),'12,53');
  assert.deepEqual(scheduleCumulEntries([entries[0]]).get('h'),[{start:33600,end:43320}]);
});
test('conflits entre activités, pauses chevauchantes et passage de minuit', () => {
  const a = {id:'a',start:9*3600,duration:3};
  const b = {id:'b',start:10*3600,duration:1};
  const p = {id:'p',start:10.5*3600,duration:0.5,isBreak:true};
  const q = {id:'q',start:10.75*3600,duration:0.5,isBreak:true};
  const s = scheduleCumulEntries([a,b,p,q]);
  assert.deepEqual(s.get('b'),[{start:36000,end:37800},{start:40500,end:42300}]);
  assert.deepEqual(s.get('a'),[{start:32400,end:36000},{start:42300,end:49500}]);
  assert.equal(calculateCumulPauseDeduction([a,b,p,q],9*3600,13*60),0.75);
  const overnight = [{id:'n',start:23*3600,duration:2},{id:'p',start:normalizeCumulStart(0,23*3600,2*60),duration:0.5,isBreak:true}];
  assert.deepEqual(scheduleCumulEntries(overnight).get('n'),[{start:82800,end:86400},{start:88200,end:91800}]);
  const equal = scheduleCumulEntries([{id:'first',start:0,duration:1},{id:'second',start:0,duration:1}]);
  assert.deepEqual(equal.get('second'),[{start:3600,end:7200}]);
  assert.equal(calculateCumulPauseDeduction([{id:'p',start:null,duration:0.5,isBreak:true}],null,null),0.5);
});

test('affichage du cumul à deux décimales fixes', () => {
  assert.equal(formatCumulDecimal(2.7), '2,70');
  assert.equal(formatCumulDecimal(12), '12,00');
  assert.equal(formatCumulDecimal(11.5), '11,50');
  assert.equal(formatCumulDecimal(0), '0,00');
});

test('convertisseur compact : arrondi à la minute et retenue', () => {
  assert.deepEqual(decimalHoursToMinutes(2.7), { hours: 2, minutes: 42 });
  assert.deepEqual(decimalHoursToMinutes(9.33), { hours: 9, minutes: 20 });
  assert.deepEqual(decimalHoursToMinutes(1.99), { hours: 1, minutes: 59 });
  assert.deepEqual(decimalHoursToMinutes(1.999), { hours: 2, minutes: 0 });
  assert.deepEqual(decimalHoursToMinutes(0.0083), { hours: 0, minutes: 0 });
  assert.deepEqual(decimalHoursToMinutes(0.01), { hours: 0, minutes: 1 });
  assert.deepEqual(decimalHoursToMinutes(35.5), { hours: 35, minutes: 30 });
});
