import { GameState, Player, TargetSelection } from '../gametypes';

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
  console.log(`You are casting ${gamestate.casting.card.name}`);

  if (gamestate.casting.card.targetinginfo.length === 0) {
    console.log(`It needs no targets`);
    return;
  }

  for (let [targeting, isCurrent] of gamestate.casting.targets.map((t, i) => [t, i === gamestate.casting.targets.length - 1] as [TargetSelection, boolean])) {
    console.log(`${isCurrent ? `currently selecting ${targeting.info.min} to ${targeting.info.max}` : `selected ${targeting.selected.length}`} targets of type ${targeting.info.type}:\n\t${targeting.selected.map(_ => `${_.id}: ${_.name} [${_.type}]`).join('\n\t')}\n`);
  }

  console.log('target [id|confirm|undo]');
}

function targetobj(gamestate: GameState, id: string) {
  const current = gamestate.casting.getCurrentSelection();
  if (current === null) {
    console.log('spell does not need targets');
    return;
  }

  const target = gamestate.board.getObject(id);
  if (!target) {
    console.log(`could not find valid target with id ${id}`);
    return;
  }
  
  const exists = current.selected.indexOf(target) !== -1;
  if (exists) {
    current.selected = current.selected.filter(_ => _ !== target);
    console.log(`you untarget ${target.id}: ${target.name} [${target.type}]`);
  }
  else if (current.selected.length >= current.info.max) {
    console.log(`cannot target ${target.id}: ${target.name} [${target.type}], because you already target the maximum allowed targets for this selection`);
  }
  else {
    if (gamestate.casting.canTarget(current, target)) {
      current.selected.push(target);
      console.log(`now targeting ${target.id}: ${target.name} [${target.type}]`);
    }
    else {
      console.log(`cannot target ${target.id}: ${target.name} [${target.type}], because it is the wrong type`);
    }
  }
}

function confirm(gamestate: GameState) {
  if (gamestate.casting.confirmCurrentSelection()) {
    console.log(`selection confirmed`);
  }
  else {
    console.log(`not enough targets selected`);
  }
}

function undo(gamestate: GameState) {
  gamestate.casting.undoTargets();
  console.log('removed last group of selections');
}