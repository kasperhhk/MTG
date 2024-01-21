import { CastingState, GameState, Player } from '../gametypes';

export function createCastCommand(gamestate: GameState, player: Player) {
  return (cardId: string) => {
    const card = player.hand.cards.find(_ => _.id === cardId);
    if (!card) {
      console.log(`can't find card with id ${cardId} in hand`);
      return;
    }

    console.log(`you begin casting ${card.name}, you must now choose targets using the 'target' command`);
    gamestate.casting = new CastingState(card, player);
    return true;
  };
}

export function createCastingCommand(gamestate: GameState, player: Player) {
  return (command: string) => {
    if (command === 'confirm') {
      if (!gamestate.casting.isValid()) {
        console.log('you are not done selecting targets');
        return;
      }
  
      gamestate.castSpell();
      
      return true;
    }
    else if (command === 'cancel') {
      gamestate.cancelCasting();
    
      return true;
    }
    else {
      console.log('cast [confirm|cancel]');
    }
  };
}