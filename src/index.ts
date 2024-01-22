import * as readlineSync from 'readline-sync';
import { GameState, Hand, Player } from './gametypes';
import { getCommands } from './playercommands';
import { write } from './output/util';

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

write(`${players[0].name} is on the play with ${players[0].life} life`);
write(`${players[1].name} is on the draw with ${players[1].life} life`);

const gamestate = new GameState(players);

function mainloop() {
  while (!gamestate.gameover) {
    const turnPlayer = gamestate.players[gamestate.currentPlayer];
    write(`\n${turnPlayer.name} turn ${gamestate.turn[gamestate.currentPlayer]}`);

    while (gamestate.history.length < 2 
      || !(gamestate.history[gamestate.history.length-1] === 'pass' 
      && gamestate.history[gamestate.history.length-2] === 'pass' && gamestate.stack.length === 0)) {

        const priorityPlayer = gamestate.players[gamestate.hasPriority];

        if (!gamestate.casting && gamestate.history[gamestate.history.length - 1] !== 'cast') {
          write(`about to give priority to ${priorityPlayer.name}, doing state-based actions`);
          gamestate.doStateBasedActions();

          if (gamestate.gameover) {
            return;
          }

          write(`${priorityPlayer.name} has priority`);
        }
        else if (!gamestate.casting) {
          write(`${priorityPlayer.name} held priority after casting a spell`);
        }

        readlineSync.promptCLLoop(getCommands(gamestate, priorityPlayer));

        if (gamestate.stack.length 
          && gamestate.history.length >= 2
          && gamestate.history[gamestate.history.length-1] === 'pass' 
          && gamestate.history[gamestate.history.length-2] === 'pass') {

          gamestate.resolvestack();
          gamestate.resetPriority();
        }
    }

    write(`both players pass on empty stack, ending turn`);
    gamestate.nextTurn();
  }
}

mainloop();

if (gamestate.gameover) {
  if (gamestate.gameover.draw) {
    write(`both players lost, it's a draw!`);
  }
  else {
    write(`${gamestate.gameover.winner.name} won!`);
    write(`${gamestate.gameover.loser.name} lost...`);
  }
}
else {
  write(`game ended without any winner, loser or draw :|`);
}