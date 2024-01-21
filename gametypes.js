"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Board = exports.GameState = exports.Player = exports.ObjectType = void 0;
var nextId = (function () {
    var idgen = 0;
    return function () {
        return idgen++;
    };
})();
var ObjectType;
(function (ObjectType) {
    ObjectType["Player"] = "Player";
})(ObjectType || (exports.ObjectType = ObjectType = {}));
var Player = /** @class */ (function () {
    function Player(name) {
        this.name = name;
        this.type = ObjectType.Player;
        this.life = 20;
        this.id = nextId();
    }
    return Player;
}());
exports.Player = Player;
var GameState = /** @class */ (function () {
    function GameState(players) {
        this.players = players;
        this.board = new Board(players);
        this.gameover = false;
        this.history = [];
        this.currentPlayer = 0;
        this.hasPriority = 0;
        this.turn = [1, 0];
    }
    GameState.prototype.nextTurn = function () {
        this.currentPlayer ^= 1;
        this.hasPriority = this.currentPlayer;
        this.turn[this.currentPlayer]++;
        this.history.push('turn');
    };
    GameState.prototype.passPriority = function () {
        this.hasPriority ^= 1;
        this.history.push('pass');
    };
    return GameState;
}());
exports.GameState = GameState;
var Board = /** @class */ (function () {
    function Board(players) {
        this.objectMap = {};
        this.objectMap[players[0].id] = players[0];
        this.objectMap[players[1].id] = players[1];
    }
    Board.prototype.getAllObjects = function () {
        return Object.values(this.objectMap);
    };
    Board.prototype.getObject = function (id) {
        return this.objectMap[id];
    };
    return Board;
}());
exports.Board = Board;
