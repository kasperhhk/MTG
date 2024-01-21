import { GameState, Player } from './gametypes';

export enum InspectTargets {
  Board,
  Object
}

function inspect(gamestate: GameState, player: Player, target: InspectTargets, id?: number) {
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
      console.log(`Player ${obj.name} has ${obj.life} life`)
      if (obj === player) {
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

function createInspectCommand(gamestate: GameState, player: Player) {
  return (id) => {
    const idnum = id ? parseInt(id) : null;
    const target = id ? InspectTargets.Object : InspectTargets.Board;
    inspect(gamestate, player, target, idnum);
  };
}

export function getCommands(gamestate: GameState, player: Player) {
  return {
    inspect: createInspectCommand(gamestate, player),
    pass: () => {
      gamestate.passPriority();
      console.log(`${player.name} passes priority`);
      return true;
    }
  };
}