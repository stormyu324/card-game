import test from 'node:test';
import assert from 'node:assert/strict';
import {createDeck, total, blackjack, outcome} from './engine.js';
const hand = (...ranks) => ranks.map(rank => ({rank,suit:'♠'}));
test('deck contains 52 unique cards', () => {
  const deck = createDeck();
  assert.equal(deck.length,52);
  assert.equal(new Set(deck.map(c => `${c.suit}${c.rank}`)).size,52);
});
test('aces become 1 to avoid bust, including multiple aces', () => {
  assert.equal(total(hand(1,6)),17);
  assert.equal(total(hand(1,1,9)),21);
  assert.equal(total(hand(1,1,9,10)),21);
  assert.equal(total(hand(1,13,5)),16);
});
test('face cards and blackjack', () => {
  assert.equal(total(hand(11,12,13)),30);
  assert.equal(blackjack(hand(1,13)),true);
  assert.equal(blackjack(hand(7,7,7)),false);
});
test('outcomes cover busts, ties and natural blackjack priority', () => {
  assert.equal(outcome(hand(10,10,5),hand(10,7)),'lose');
  assert.equal(outcome(hand(10,8),hand(10,7,9)),'win');
  assert.equal(outcome(hand(10,8),hand(9,9)),'push');
  assert.equal(outcome(hand(1,10),hand(7,7,7)),'win');
  assert.equal(outcome(hand(7,7,7),hand(1,10)),'lose');
  assert.equal(outcome(hand(1,10),hand(1,13)),'push');
});
