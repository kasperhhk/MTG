"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommands = exports.InspectTargets = void 0;
var gametypes_1 = require("./gametypes");
var InspectTargets;
(function (InspectTargets) {
    InspectTargets[InspectTargets["Board"] = 0] = "Board";
    InspectTargets[InspectTargets["Object"] = 1] = "Object";
})(InspectTargets || (exports.InspectTargets = InspectTargets = {}));
function inspect(gamestate, player, target, id) {
    if (target === InspectTargets.Board) {
        var allObjects = gamestate.board.getAllObjects();
        var ostr = allObjects.map(function (o) { return "".concat(o.id, ": ").concat(o.name, " [").concat(o.type, "]"); });
        console.log("Objects on the board:\n\t".concat(ostr.join('\n\t'), "\n"));
    }
    else if (target === InspectTargets.Object) {
        if (!id && id !== 0) {
            console.log('Unknown object with id ' + id);
            return;
        }
        var obj = gamestate.board.getObject(id);
        if (obj instanceof gametypes_1.Player) {
            console.log("Player ".concat(obj.name, " has ").concat(obj.life, " life"));
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
function createInspectCommand(gamestate, player) {
    return function (id) {
        var idnum = id ? parseInt(id) : null;
        var target = id ? InspectTargets.Object : InspectTargets.Board;
        inspect(gamestate, player, target, idnum);
    };
}
function getCommands(gamestate, player) {
    return {
        inspect: createInspectCommand(gamestate, player),
        pass: function () {
            gamestate.passPriority();
            console.log("".concat(player.name, " passes priority"));
            return true;
        }
    };
}
exports.getCommands = getCommands;
