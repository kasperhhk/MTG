import { GameState, Player } from '../gametypes';

export function createTargetCommand(gamestate: GameState, player: Player) {
  return (id?: string) => {
    if (id) {
      const target = gamestate.board.getObject(id);
      if (!target) {
        console.log(`could not find valid target with id ${id}`);
        return;
      }

      const exists = gamestate.casting.targets.indexOf(target) !== -1;
      if (exists) {
        gamestate.casting.targets = gamestate.casting.targets.filter(_ => _ !== target);
        console.log(`you untarget ${target.id}: ${target.name} [${target.type}]`);
      }
      else if (gamestate.casting.targets.length >= 1) {
        console.log(`cannot target ${target.id}: ${target.name} [${target.type}], because you already target the maximum allowed targets`);
      }
      else {
        gamestate.casting.targets.push(target);
        console.log(`now targeting ${target.id}: ${target.name} [${target.type}]`);
      }
    }
    else {
      console.log(`You are casting ${gamestate.casting.card.name}`);
      console.log(`You have targeted ${gamestate.casting.targets.length} out of 1 targets required to cast this spell`);
      console.log(`Targets:\n\t${gamestate.casting.targets.map(_ => `${_.id}: ${_.name} [${_.type}]`).join('\n\t')}\n`);
    }
  };
}