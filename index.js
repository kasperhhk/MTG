var readlineSync = require('readline-sync');

let playerid = 0;

class PlayerDefinition {
  constructor(name) {
    this.name = name;
    this.id = playerid++;
  }
}

class GameObject {
  constructor(definition, owner) {
    this.definition = definition;
    this.owner = owner;
  }
}

class PlayerObject extends GameObject {
  constructor(playerDefinition, hand, deck) {
    super(playerDefinition, playerDefinition);

    this.life = 20;
    this.hand = hand;
    this.deck = deck;
  }
}

class Hand {
  constructor(cardobjects) {
    this.cards = cardobjects;
  }
}

class Deck {
  constructor(cardobjects) {
    this.cards = cardobjects;
  }
}

class CardDefinition {
  constructor(name) {
    this.name = name;
  }

  resolve(cardobject, gamestate) {
    throw 'not implemented';
  }
}

class CardObject extends GameObject {
  constructor(cardDefinition, owner) {
    super(cardDefinition, owner);
  }

  resolve(gamestate) {
    this.card.resolve(this, gamestate);
  }
}

class LightningBolt extends CardDefinition {
  resolve(cardobject, gamestate) {
    const targets = resolveTarget(gamestate, cardobject, TargetType.Any, 1, 1);
    damage(cardobject, targets[0], 3);
  }
}

function damage(source, target, amount) {
  if (target instanceof PlayerObject) {
    target.life -= amount;
  }
}

const TargetType = {
  Any: 'Any'
};

const TargetResolutionStrategies = {
};

function resolveTarget(gamestate, source, targetType, minTargets, maxTargets) {
  return TargetResolutionStrategies[source.owner.id].resolveTarget(gamestate, source, targetType, minTargets, maxTargets);
}

class ConsoleInputTargetResolutionStrategy {
  resolveTarget(gamestate, source, targetType, minTargets, maxTargets) {
    const alltargets = gamestate.getAllTargetable();
    const selected = alltargets.map(_ => false);
    let confirmed = false;

    while (!confirmed) {
      const targetsStr = alltargets.map((t, i) => `${i}[${selected[i] ? 'x' : '_'}] ${t.definition.name}`).join('\n\t');
      let question = `Selected targets for ${source.definition.name}:\n\t${targetsStr}\n`;
      const numSelected = selected.filter(_ => _ === true).length;

      if (numSelected <= maxTargets) {
        question += `Selected ${numSelected} of ${maxTargets} targets`;
        if (numSelected < minTargets) {
          question += `, you need at least ${minTargets - numSelected} more target${(minTargets - numSelected > 1 ? 's' : '')}`;
        }
      }
      if (numSelected >= minTargets) {
        question += 'Write "confirm" to confirm choices';
      }

      const answer = readlineSync.question(question);
      if (answer === 'confirm') {
        if (numSelected >= minTargets && numSelected <= maxTargets) {
          confirmed = true;
        }
      }
      else {
        const idx = parseInt(answer);
        if (idx >= 0 && idx < selected.length) {
          const v = selected[idx];
          if (v === false && numSelected < maxTargets) {
            selected[idx] = true;
          }
          else if (v === true) {
            selected[idx] = false;
          }
        }
      }
    }

    return alltargets.filter((t, i) => selected[i]);
  }
}

class GameState {
  constructor(players) {
    this.players = players;
    this.turn = 0;
    this.currentPlayer = null;
  }

  start(player) {
    this.turn = 1;
    this.currentPlayer = player;
    this.gameover = false;

    while (!this.gameover) {
      PlayerStrategies[this.currentPlayer.definition.id].turn(this, this.currentPlayer);
      
      if () {
        
      }
    }
  }
}

const cardDefinitions = {
  lightningBolt: new LightningBolt('Lightning Bolt')
};

const player1 = new PlayerDefinition('amy');
const player1obj = new PlayerObject(
  player1, 
  new Hand(new Array(7).fill(0).map(_ => new CardObject(cardDefinitions.lightningBolt, player1))),
  new Deck(new Array(60).fill(0).map(_ => new CardObject(cardDefinitions.lightningBolt, player1)))
);

const player2 = new PlayerDefinition('nick');
const player2obj = new PlayerObject(
  player2, 
  new Hand(new Array(7).fill(0).map(_ => new CardObject(cardDefinitions.lightningBolt, player2))),
  new Deck(new Array(60).fill(0).map(_ => new CardObject(cardDefinitions.lightningBolt, player2)))
);