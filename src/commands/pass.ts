import { GameState, Player } from '../gametypes';

export function createPassCommand(gamestate: GameState, player: Player) {
  return () => {
    gamestate.passPriority();
    console.log(`${player.name} passes priority`);
    return true;
  };
}