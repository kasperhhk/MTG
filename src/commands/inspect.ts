import { GameState, Player } from '../gametypes';
import { list, write } from '../output/util';

const inspectCommands = {
  help: (gamestate: GameState, player: Player) => inspectHelp(),
  board: (gametate: GameState, player: Player) => inspectBoard(gametate),
  hand: (gamestate: GameState, player: Player) => inspectHand(player),
  stack: (gamestate: GameState, player: Player) => inspectStack(gamestate),
  graveyard: (gamestate: GameState, player: Player, id: string) => inspectGraveyard(gamestate, player, id)
};

const inspectHelpStrings = {
  help: 'help\t\t\t\tview usage help',
  board: 'board\t\t\t\tlist all objects on the board, including players',
  hand: 'hand\t\t\t\tlist all cards in your hand',
  stack: 'stack\t\t\t\tlist all spells on the stack from top to bottom',
  graveyard: 'graveyard [me|opponent|id]\tlist all cards in given graveyard, id refers to the player id'
};

function inspectHelp() {  
  write('Usage:');
  write('inspect {id}\tinspect object with given id');
  write('inspect {command} [args]');
  list(`Commands:`, Object.values(inspectHelpStrings));
}

function inspectObject(gamestate: GameState, player: Player, id: string) {
  const fromHand = player.hand.cards.find(_ => _.id === id);
  const fromBoard = gamestate.board.getObject(id);
  const fromStack = gamestate.stack.find(_ => _.id === id);
  const cardFromStack = gamestate.stack.find(_ => _.card.id === id)?.card;
  const fromMyGraveyard = player.graveyard.cards.find(_ => _.id === id);
  const fromOppGraveyard = gamestate.getOpponent(player).graveyard.cards.find(_ => _.id === id);
  
  const obj = fromHand ?? fromBoard ?? fromStack ?? cardFromStack ?? fromMyGraveyard ?? fromOppGraveyard;

  if (obj)
    obj.inspect(gamestate, player);
  else
    write(`Could not find object with id ${id}`);
}

function inspectGraveyard(gamestate: GameState, player: Player, id?: string) {
  if (id === 'me') {
    const cards = player.graveyard.cards;
    list('cards in your graveyard:', cards.map(_ => _.toLongString()));
  }
  else if (id === 'opponent') {
    const cards = gamestate.getOpponent(player).graveyard.cards;
    list('cards in your opponent\'s graveyard:', cards.map(_ => _.toLongString()));
  }
  else if (id !== undefined) {
    const player = gamestate.players.find(_ => _.id === id);
    if (player) {
      list(`cards in graveyard of ${player.toShortString()}:`, player.graveyard.cards.map(_ => _.toLongString()));
    }
    else {
      write(`player with id ${id} not found`);
    }
  }
  else {
    write(inspectHelpStrings.graveyard);
  }
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
  return (arg?: string, ...args: string[]) => {
    if (Object.keys(inspectCommands).includes(arg)) {
      const applyargs = [gamestate, player, ...args];
      inspectCommands[arg].apply(this, applyargs);
    }
    else if (arg === undefined) {
      inspectHelp();
    }
    else {
      inspectObject(gamestate, player, arg);
    }
  };
}