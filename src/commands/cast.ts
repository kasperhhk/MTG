import { GameState, Player } from '../gametypes';

export function createCastCommand(gamestate: GameState, player: Player) {
  return (cardId: string) => {
    const card = player.hand.cards.find(_ => _.id === cardId);
    if (!card) {
      console.log(`can't find card with id ${cardId} in hand`);
      return;
    }

    console.log(`you begin casting ${card.name}, you must now choose targets using the 'target' command`);
    gamestate.casting = { card, targets: [] };
    return true;
  };
}

export function createConfirmCastCommand(gamestate: GameState, player: Player) {
  return () => {
    const card = gamestate.casting.card;
    const targets = gamestate.casting.targets;

    if (targets.length !== 1) {
      console.log(`you need to have 1 target, you have ${targets.length}`);
      return;
    }

    player.hand.removeCard(card);
    gamestate.putonstack(card, player, targets[0])
    gamestate.history.push('cast');
    gamestate.casting = null;
    console.log(`you cast ${card.name} targeting (${targets[0].id})${targets[0].name}, it is now on the stack`);
    return true;
  };
}

export function createCancelCastCommand(gamestate: GameState, player: Player) {
  return () => {
    const card = gamestate.casting.card;
    gamestate.casting = null;
    console.log(`you cancel casting ${card.name}`);
    return true;
  };
}