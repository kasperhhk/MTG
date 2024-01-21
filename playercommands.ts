import { GameState, Player } from './gametypes';

export enum InspectType {
  Help,
  Board,
  Hand
}

function inspect(gamestate: GameState, player: Player, type: InspectType, target?: string) {
  if (type === InspectType.Board && !target) {
    const allObjects = gamestate.board.getAllObjects();
    const ostr = allObjects.map(o => `${o.id}: ${o.name} [${o.type}]`);
    console.log(`Objects on the board:\n\t${ostr.join('\n\t')}\n`);
  }
  else if (type == InspectType.Board && target) {
    const obj = gamestate.board.getObject(target);
    if (!obj) {
      console.log('Unknown object with id ' + target);
      return;
    }

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
  else if (type === InspectType.Hand) {
    if (target) {
      const card = player.hand.cards.find(_ => _.id);
      if (!card) {
        console.log(`can't find card with id ${target} in hand`);
        return;
      }

      if (card.name === 'bolt') {
        console.log(`${card.name} will bolt the opponent in the face for 3 damage`);
      }
      else {
        console.log(`${card.name} is a ${card.type} card in your hand`);
      }
    }
    else {
      const cstr = player.hand.cards.map(c => `${c.id}: ${c.name} [${c.type}]`);
      console.log(`Cards in hand:\n\t${cstr.join('\n\t')}\n`);
    }
  }
  else if (type === InspectType.Help) {
    console.log(`Available inspect targets:\n\tboard\n\thand\n`);
  }
}

function createInspectCommand(gamestate: GameState, player: Player) {
  return (type: string | undefined, target: string | undefined) => {
    let inspectType: InspectType;
    if (type === 'board') {
      inspectType = InspectType.Board;
    }
    else if (type === 'hand') {
      inspectType = InspectType.Hand;
    }
    else {
      inspectType = InspectType.Help;
    }

    inspect(gamestate, player, inspectType, target);
  };
}

function createCastCommand(gamestate: GameState, player: Player) {
  return (cardId: string) => {
    const card = player.hand.cards.find(_ => _.id === cardId);
    if (!card) {
      console.log(`can't find card with id ${cardId} in hand`);
      return;
    }

    console.log(`you cast ${card.name}`);
    player.hand.cards = player.hand.cards.filter(_ => _ !== card);
    gamestate.putonstack(card, player, gamestate.players.find(_ => _ !== player));
    gamestate.history.push('cast');
  };
}

export function getCommands(gamestate: GameState, player: Player) {
  return {
    inspect: createInspectCommand(gamestate, player),
    cast: createCastCommand(gamestate, player),
    pass: () => {
      gamestate.passPriority();
      console.log(`${player.name} passes priority`);
      return true;
    }
  };
}