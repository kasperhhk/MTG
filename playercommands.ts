import { GameState, Player } from './gametypes';

export enum InspectTargets {
  Board,
  Object
}

function inspect(source: Player, gamestate: GameState, target: InspectTargets, id?: number) {
  if (target === InspectTargets.Board) {
    const allObjects = gamestate.board.getAllObjects();
    const ostr = allObjects.map(o => `${o.id}: ${o.name} [${o.type}]`);
    console.log(`Objects on the board:\n\t${ostr.join('\n\t')}\n`);
  }
  else if (target === InspectTargets.Object) {
    if (!id && id !== 0) {
      console.log('Unknown object with id ' + id);
      return;
    }

    const obj = gamestate.board.getObject(id);
    if (obj instanceof Player) {
      console.log(`Player ${obj.name} has ${obj.life}`)
      if (obj === source) {
        console.log('This is you');
      }
      else {
        console.log('This is your opponent');
      }
    }
    else {
      console.log('Unknown object type ' + obj.type);
    }
  }
}

export const commands = {
  inspect
};