import { GameState, Player, TargetSelection } from '../gametypes';
import { list, write } from '../output/util';

export function createTargetCommand(gamestate: GameState, player: Player) {
  return (id?: string) => {
    if (id) {
      if (id === 'confirm') {
        return confirm(gamestate);
      }
      else if (id === 'undo') {
        return undo(gamestate);
      }
      else {
        return targetobj(gamestate, id);
      }
    }
    else {
      return overview(gamestate);
    }
  };
}

function overview(gamestate: GameState) {
  write(`You are casting ${gamestate.casting.card.name}`);

  if (gamestate.casting.card.targetinginfo.length === 0) {
    write(`It needs no targets`);
    return;
  }

  for (let [targeting, isCurrent] of gamestate.casting.targets.map((t, i) => [t, i === gamestate.casting.targets.length - 1] as [TargetSelection, boolean])) {
    const selectionstr = isCurrent ? `currently selecting ${targeting.info.min} to ${targeting.info.max}` : `selected ${targeting.selected.length}`;
    list(`${selectionstr} targets of type ${targeting.info.type}:`, targeting.selected.map(_ => _.toLongString()));
  }

  write('target [id|confirm|undo]');
}

function targetobj(gamestate: GameState, id: string) {
  const current = gamestate.casting.getCurrentSelection();
  if (current === null) {
    write('spell does not need targets');
    return;
  }

  const target = gamestate.board.getObject(id);
  if (!target) {
    write(`could not find valid target with id ${id}`);
    return;
  }
  
  const exists = current.selected.indexOf(target) !== -1;
  if (exists) {
    current.selected = current.selected.filter(_ => _ !== target);
    write(`you untarget ${target.toLongString()}`);
  }
  else if (current.selected.length >= current.info.max) {
    write(`cannot target ${target.toLongString()}, because you already target the maximum allowed targets for this selection`);
  }
  else {
    if (gamestate.casting.canTarget(current, target)) {
      current.selected.push(target);
      write(`now targeting ${target.toLongString()}`);
    }
    else {
      write(`cannot target ${target.toLongString()}, because it is the wrong type`);
    }
  }
}

function confirm(gamestate: GameState) {
  if (gamestate.casting.confirmCurrentSelection()) {
    write(`selection confirmed`);
  }
  else {
    write(`not enough targets selected`);
  }
}

function undo(gamestate: GameState) {
  gamestate.casting.undoTargets();
  write('removed last group of selections');
}