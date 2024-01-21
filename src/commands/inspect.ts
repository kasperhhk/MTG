import { GameState, Player } from '../gametypes';

const inspectCommands = {
  help: (gamestate: GameState, player: Player) => inspectHelp(),
  board: (gametate: GameState, player: Player) => inspectBoard(gametate),
  hand: (gamestate: GameState, player: Player) => inspectHand(player),
  stack: (gamestate: GameState, player: Player) => inspectStack(gamestate)
};

function inspectHelp() {  
  console.log(`Usage:\ninspect {id}\ninspect {command}`);
  console.log(`Commands:\n\t${Object.keys(inspectCommands).join('\n\t')}\n`);
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
    console.log(`Could not find object with id ${id}`);
}

function inspectBoard(gamestate: GameState) {
  const allObjects = gamestate.board.getAllObjects();
  const ostr = allObjects.map(o => `${o.id}: ${o.name} [${o.type}]`);
  console.log(`Objects on the board:\n\t${ostr.join('\n\t')}\n`);
}

function inspectHand(player: Player) {
  const cstr = player.hand.cards.map(c => `${c.id}: ${c.name} [${c.type}]`);
  console.log(`Cards in hand:\n\t${cstr.join('\n\t')}\n`);
}

function inspectStack(gamestate: GameState) {
  if (gamestate.stack.length) {
    const sstr = gamestate.stack.map(_ => `${_.id}: ${_.name} [${_.type}]`).reverse();
    console.log(`Stack (from top to bottom):\n\t${sstr.join('\n\t')}\n`);
  }
  else {
    console.log('The stack is empty');
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