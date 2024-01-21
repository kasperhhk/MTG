"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commands = exports.InspectTargets = void 0;
var gametypes_1 = require("./gametypes");
var InspectTargets;
(function (InspectTargets) {
    InspectTargets[InspectTargets["Board"] = 0] = "Board";
    InspectTargets[InspectTargets["Object"] = 1] = "Object";
})(InspectTargets || (exports.InspectTargets = InspectTargets = {}));
function inspect(source, gamestate, target, id) {
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
            console.log("Player ".concat(obj.name, " has ").concat(obj.life));
            if (obj === source) {
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
exports.commands = {
    inspect: inspect
};
