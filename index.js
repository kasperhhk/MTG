"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var readlineSync = require("readline-sync");
var gametypes_1 = require("./gametypes");
var player1name = readlineSync.question('Name of player1? ');
if (player1name == '')
    throw 'invalid name';
var player2name = readlineSync.question('Name of player2? ');
if (player2name == '')
    throw 'invalid name';
var player1 = new gametypes_1.Player(player1name);
var player2 = new gametypes_1.Player(player2name);
function GetPlayerOrder(player1, player2) {
    var startingPlayer = readlineSync.keyInSelect([player1name, player2name], 'Who will start?', { cancel: false });
    if (startingPlayer === 0) {
        return [player1, player2];
    }
    if (startingPlayer === 1) {
        return [player2, player1];
    }
    throw 'unknown starting player';
}
var players = GetPlayerOrder(player1, player2);
console.log("".concat(players[0].name, " is on the play with ").concat(players[0].life, " life"));
console.log("".concat(players[1].name, " is on the draw with ").concat(players[1].life, " life"));
var gamestate = new gametypes_1.GameState(players);
/*
while (!gamestate.gameover) {

}*/ 
