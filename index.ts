import * as readlineSync from 'readline-sync';
import { GameState, Player } from './gametypes';

const player1name = readlineSync.question('Name of player1? ');
if (player1name == '')
  throw 'invalid name';

const player2name = readlineSync.question('Name of player2? ');
if (player2name == '')
  throw 'invalid name';

const player1 = new Player(player1name);
const player2 = new Player(player2name);

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

/*
while (!gamestate.gameover) {

}*/