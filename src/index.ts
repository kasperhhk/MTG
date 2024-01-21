import * as readlineSync from 'readline-sync';
import { GameState, Hand, Player } from './gametypes';
import { getCommands } from './playercommands';

const player1name = readlineSync.question('Name of player1? ');
if (player1name == '')
  throw 'invalid name';

const player2name = readlineSync.question('Name of player2? ');
if (player2name == '')
  throw 'invalid name';

const player1 = new Player(player1name, Hand.default());
const player2 = new Player(player2name, Hand.default());

function GetPlayerOrder(player1: Player, player2: Player) {
  const startingPlayer = readlineSync.keyInSelect([player1name, player2name], 'Who will start?', { cancel: false });
  if (startingPlayer === 0) {
    return [player1, player2];
  }
  if (startingPlayer === 1) {
    return [player2, player1];
  }

  throw 'unknown starting player';
}

const players = GetPlayerOrder(player1, player2);

console.log(`${players[0].name} is on the play with ${players[0].life} life`);
console.log(`${players[1].name} is on the draw with ${players[1].life} life`);

const gamestate = new GameState(players);
const maxrounds = 20;

while (!gamestate.gameover && gamestate.turn[0] < maxrounds) {
  const turnPlayer = gamestate.players[gamestate.currentPlayer];
  console.log(`\n${turnPlayer.name} turn ${gamestate.turn[gamestate.currentPlayer]}`);

  while (gamestate.history.length < 2 
    || !(gamestate.history[gamestate.history.length-1] === 'pass' 
    && gamestate.history[gamestate.history.length-2] === 'pass' && gamestate.stack.length === 0)) {

      const priorityPlayer = gamestate.players[gamestate.hasPriority];
      console.log(`${priorityPlayer.name} has priority`);
      readlineSync.promptCLLoop(getCommands(gamestate, priorityPlayer));

      if (gamestate.stack.length 
        && gamestate.history.length >= 2
        && gamestate.history[gamestate.history.length-1] === 'pass' 
        && gamestate.history[gamestate.history.length-2] === 'pass') {

        gamestate.resolvestack();
        gamestate.resetPriority();
      }
  }

  console.log(`both players pass on empty stack, ending turn`);
  gamestate.nextTurn();
}