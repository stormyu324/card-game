export const SUITS = ['♠', '♥', '♣', '♦'];
export function createDeck(random = Math.random) {
  const deck = SUITS.flatMap(suit => Array.from({length:13}, (_, i) => ({suit, rank:i + 1})));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
export function total(hand) {
  let value = hand.reduce((sum, card) => sum + (card.rank === 1 ? 11 : Math.min(card.rank, 10)), 0);
  let aces = hand.filter(card => card.rank === 1).length;
  while (value > 21 && aces > 0) { value -= 10; aces--; }
  return value;
}
export function blackjack(hand) { return hand.length === 2 && total(hand) === 21; }
export function outcome(player, dealer) {
  const p = total(player), d = total(dealer);
  if (p > 21) return 'lose';
  if (d > 21) return 'win';
  if (blackjack(player) !== blackjack(dealer)) return blackjack(player) ? 'win' : 'lose';
  return p === d ? 'push' : p > d ? 'win' : 'lose';
}
