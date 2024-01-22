import { GameState, Player } from '../gametypes';
import { write } from '../output/util';

export function createPassCommand(gamestate: GameState, player: Player) {
  return () => {
    gamestate.passPriority();
    write(`${player.name} passes priority`);
    return true;
  };
}