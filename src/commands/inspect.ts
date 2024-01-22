import { GameState, Player } from '../gametypes';
import { list, write } from '../output/util';

const inspectCommands = {
  help: (gamestate: GameState, player: Player) => inspectHelp(),
  board: (gametate: GameState, player: Player) => inspectBoard(gametate),
  hand: (gamestate: GameState, player: Player) => inspectHand(player),
  stack: (gamestate: GameState, player: Player) => inspectStack(gamestate)
};

function inspectHelp() {  
  write(`Usage:\ninspect {id}\ninspect {command}`);
  list(`Commands:`, Object.keys(inspectCommands));
}

function inspectObject(gamestate: GameState, player: Player, id: string) {
  const fromHand = player.hand.cards.find(_ => _.id === id);
  const fromBoard = gamestate.board.getObject(id);
  const fromStack = gamestate.stack.find(_ => _.id === id);
  const cardFromStack = gamestate.stack.find(_ => _.card.id === id)?.card;
  
  const obj = fromHand ?? fromBoard ?? fromStack ?? cardFromStack;

  if (obj)
    obj.inspect(gamestate, player);
  else
    write(`Could not find object with id ${id}`);
}

function inspectBoard(gamestate: GameState) {
  const allObjects = gamestate.board.getAllObjects();
  list(`Objects on the board:`, allObjects.map(o => o.toLongString()));
}

function inspectHand(player: Player) {
  const cards = player.hand.cards.map(c => c.toLongString());
  list(`Cards in hand:`, cards);
}

function inspectStack(gamestate: GameState) {
  if (gamestate.stack.length) {
    const stack = gamestate.stack.map(_ => _.toLongString()).reverse();
    list(`Stack (from top to bottom):`, stack);
  }
  else {
    write('The stack is empty');
  }
}

export function createInspectCommand(gamestate: GameState, player: Player) {
  return (arg?: string) => {
    if (Object.keys(inspectCommands).includes(arg)) {
      inspectCommands[arg](gamestate, player);
    }
    else if (arg === undefined) {
      inspectHelp();
    }
    else {
      inspectObject(gamestate, player, arg);
    }
  };
}