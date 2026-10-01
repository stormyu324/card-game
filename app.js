import {createDeck, total, blackjack, outcome} from './engine.js';
const $ = id => document.getElementById(id);
let deck = [], player = [], dealer = [], active = false;
let stats = {score:100, rounds:0, wins:0};
try {
  const saved = JSON.parse(localStorage.getItem('little-card-club'));
  if (saved && Number.isInteger(saved.score) && Number.isInteger(saved.rounds) && saved.rounds >= 0 && Number.isInteger(saved.wins) && saved.wins >= 0 && saved.wins <= saved.rounds) stats = saved;
} catch {}
function save() { try {localStorage.setItem('little-card-club', JSON.stringify(stats));} catch {} }
function cardElement(card, hidden = false) {
  const el = document.createElement('div');
  el.className = 'card' + (hidden ? ' back' : ['♥','♦'].includes(card.suit) ? ' red' : '');
  if (hidden) {el.setAttribute('aria-label', '庄家的暗牌'); return el;}
  const rank = ({1:'A',11:'J',12:'Q',13:'K'})[card.rank] || card.rank;
  el.setAttribute('aria-label', `${card.suit} ${rank}`);
  el.innerHTML = `<span class="corner">${rank}<small>${card.suit}</small></span><span class="suit" aria-hidden="true">${card.suit}</span><span class="corner bottom" aria-hidden="true">${rank}<small>${card.suit}</small></span>`;
  return el;
}
function render() {
  for (const [id, hand] of [['player-cards',player],['dealer-cards',dealer]]) {
    $(id).replaceChildren(...hand.map((c,i) => cardElement(c, id === 'dealer-cards' && active && i === 1)));
    if (!hand.length) $(id).innerHTML = '<div class="placeholder" aria-hidden="true">♠</div><div class="placeholder" aria-hidden="true">♣</div>';
  }
  $('player-value').textContent = player.length ? `${total(player)} 点` : '—';
  $('dealer-value').textContent = dealer.length ? active ? `${total([dealer[0]])} + ?` : `${total(dealer)} 点` : '—';
  $('hit').disabled = $('stand').disabled = !active;
  $('deal').disabled = active;
  $('reset').disabled = active;
  $('deal').innerHTML = stats.rounds ? '再来一局 <span>↗</span>' : '开始发牌 <span>↗</span>';
  for (const key of ['score','rounds','wins']) $(key).textContent = stats[key];
}
function finish() {
  active = false;
  const result = outcome(player, dealer);
  stats.rounds++;
  if (result === 'win') {stats.score += 10; stats.wins++;}
  if (result === 'lose') stats.score -= 10;
  const reason = total(player) > 21 ? '你爆牌了' : total(dealer) > 21 ? '庄家爆牌了' : blackjack(player) && !blackjack(dealer) ? 'Blackjack！' : '本局结束';
  $('status').textContent = `${reason} · ${result === 'win' ? '你赢了，+10 分 ✨' : result === 'lose' ? '庄家获胜，−10 分' : '平局，积分不变'}。`;
  save(); render();
}
function deal() {
  if (active) return;
  deck = createDeck(); player = [deck.pop(),deck.pop()]; dealer = [deck.pop(),deck.pop()]; active = true;
  $('status').textContent = '轮到你了。要再来一张，还是现在停牌？';
  if (blackjack(player) || blackjack(dealer)) finish(); else render();
}
function stand() {
  if (!active) return;
  while (total(dealer) < 17) dealer.push(deck.pop());
  finish();
}
function hit() {
  if (!active) return;
  player.push(deck.pop());
  if (total(player) > 21) finish(); else if (total(player) === 21) stand(); else render();
}
$('deal').addEventListener('click', deal);
$('hit').addEventListener('click', hit);
$('stand').addEventListener('click', stand);
$('reset').addEventListener('click', () => {if (active) return; stats = {score:100,rounds:0,wins:0}; player=[];dealer=[];save();$('status').textContent='记录已重置。来开启新的一局吧。';render();});
$('rules-open').addEventListener('click', () => $('rules').showModal());
$('rules-close').addEventListener('click', () => $('rules').close());
document.addEventListener('keydown', e => {
  if ($('rules').open || e.repeat || e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA|SELECT|BUTTON|A/.test(e.target.tagName)) return;
  if (e.key.toLowerCase() === 'h') hit();
  if (e.key.toLowerCase() === 's') stand();
  if (e.key === 'Enter') {e.preventDefault();deal();}
});
render();
