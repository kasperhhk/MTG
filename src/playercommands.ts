import { createCancelCastCommand, createCastCommand, createConfirmCastCommand } from './commands/cast';
import { createInspectCommand } from './commands/inspect';
import { createPassCommand } from './commands/pass';
import { createTargetCommand } from './commands/target';
import { GameState, Player } from './gametypes';

function createHelpCommand(commands: Object) {
  const available = Object.keys(commands);
  return () => {
    console.log(`Available commands:\n\t${available.join('\n\t')}\n`);
  };
}

export function getCommands(gamestate: GameState, player: Player) {
  const defaultCommands = {
    inspect: createInspectCommand(gamestate, player)
  };

  let commands = defaultCommands;
  if (gamestate.casting) {
    commands['target'] = createTargetCommand(gamestate, player);
    commands['cancelcast'] = createCancelCastCommand(gamestate, player);
    commands['confirmcast'] = createConfirmCastCommand(gamestate, player);
  }
  else {
    commands['cast'] = createCastCommand(gamestate, player);
    commands['pass'] = createPassCommand(gamestate, player);
  }

  commands['help'] = createHelpCommand(commands);

  return commands;
}