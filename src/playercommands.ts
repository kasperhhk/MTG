import { createCastCommand, createCastingCommand } from './commands/cast';
import { createInspectCommand } from './commands/inspect';
import { createPassCommand } from './commands/pass';
import { createTargetCommand } from './commands/target';
import { GameState, Player } from './gametypes';
import { list, write } from './output/util';

function createHelpCommand(commands: Object) {
  const available = Object.keys(commands);
  return () => {
    list(`Available commands:`, available);
  };
}

export function getCommands(gamestate: GameState, player: Player) {
  const defaultCommands = {
    inspect: createInspectCommand(gamestate, player)
  };

  let commands = defaultCommands;
  if (gamestate.casting) {
    commands['target'] = createTargetCommand(gamestate, player);
    commands['cast'] = createCastingCommand(gamestate, player);
  }
  else {
    commands['cast'] = createCastCommand(gamestate, player);
    commands['pass'] = createPassCommand(gamestate, player);
  }

  commands['help'] = createHelpCommand(commands);

  return commands;
}