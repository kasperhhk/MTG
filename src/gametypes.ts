const nextId = (() => {
  let idgen = 0;
  return () => {
    const next = idgen++;
    return next.toString();
  };
})();

export enum ObjectType {
  Player = 'Player',
  Card = 'Card',
  Spell = "Spell"
}

export enum CardType {
  Instant = "Instant"
}

export interface GameObject extends Inspectable {
  id: string,
  name: string,
  type: ObjectType
}

export interface Inspectable {
  inspect(gamestate: GameState, player: Player): void;
}

export abstract class Card implements GameObject {
  public id: string;

  public type = ObjectType.Card;

  constructor(public name: string, public cardType: CardType) {
    this.id = nextId();
  }

  abstract inspect(gamestate: GameState, player: Player): void;

  abstract resolve(castingState: CastingState, gamestate: GameState): void;
}

export class LightningBolt extends Card {
  constructor() {
    super('Lightning Bolt', CardType.Instant);
  }

  inspect(gamestate: GameState, player: Player): void {
    console.log(`${this.name} [${this.cardType}]: Deal 3 damage to any taget`);
    
    if (player.hand.cards.find(_ => _ === this)) {
      console.log(`This is your card, it is in your hand`);
    }
  }

  resolve(castingState: CastingState, gamestate: GameState): void {
    const target = castingState.targets[0] as Player;
    if (!target) throw 'invalid target';

    target.life -= 3;
    console.log(`${castingState.caster.name} casts ${this.name} at ${target.name} for 3 damage`);
  }
}

export class Player implements GameObject {
  public life: number;
  public id: string;

  public type = ObjectType.Player;

  constructor(public name: string, public hand: Hand) {
    this.life = 20;
    this.id = nextId();
  }

  inspect(gamestate: GameState, player: Player): void {
    console.log(`Player ${this.name} has ${this.life} life`)
    if (this === player) {
      console.log('This is you');
    }
    else {
      console.log('This is your opponent');
    }
  }
}

export class Hand {
  static default() { return new Hand(new Array(3).fill(0).map(_ => new LightningBolt())); }

  constructor(public cards: Card[]) {}

  removeCard(card: Card) {
    this.cards = this.cards.filter(_ => _ !== card);
  }
}

export class CastingState implements GameObject {
  public targets: GameObject[];
  public id: string;
  public get name(): string { return this.card.name; }
  public type = ObjectType.Spell;

  constructor(public card: Card, public caster: Player) {
    this.targets = [];
    this.id = nextId();
  }

  inspect(gamestate: GameState, player: Player): void {
    console.log(`${this.card.id}: ${this.card.name} [${this.card.type}] cast by (${this.caster.id})${this.caster.name}`);
    if (this.targets.length) {
      console.log(`it has the following targets:\n\t${this.targets.map(_ => `${_.id}: ${_.name} [${_.type}]`).join('\n\t')}\n`);
    }
  }
}

export class GameState {
  public board: Board;
  public gameover: boolean;
  public history: string[];
  public turn: [number, number];
  public stack: CastingState[];

  public casting?: CastingState;

  public currentPlayer: number;
  public hasPriority: number;

  constructor(public players: Player[]) {
    this.board = new Board(players);
    this.gameover = false;
    this.history = [];
    this.currentPlayer = 0;
    this.hasPriority = 0;
    this.turn = [1, 0];
    this.stack = [];
    this.casting = null;
  }

  getOpponent(player: Player): Player {
    return this.players.find(_ => _ !== player)
  }

  nextTurn() {
    this.currentPlayer ^= 1;
    this.hasPriority = this.currentPlayer;
    this.turn[this.currentPlayer]++;
    this.history.push('turn');
  }

  passPriority() {
    this.hasPriority ^= 1;
    this.history.push('pass');
  }

  resetPriority() {
    this.hasPriority = this.currentPlayer;
  }

  cancelCasting() {
    console.log(`${this.casting.caster} cancels casting ${this.casting.card.name}`);
    this.casting = null;
  }

  castSpell() {
    console.log(`${this.casting.caster.name} casts ${this.casting.card.name} targeting (${this.casting.targets[0].id})${this.casting.targets[0].name}, it is now on the stack`);
    this.casting.caster.hand.removeCard(this.casting.card);
    this.stack.push(this.casting);
    this.casting = null;
    this.history.push('cast');
  }

  resolvestack() {
    const topofstack = this.stack.pop();
    if (topofstack === undefined) throw 'resolved empty stack';

    topofstack.card.resolve(topofstack, this);
    this.history.push(topofstack.card.name);
  }
}

export class Board {
  private objectMap: { [key: string]: GameObject };

  constructor(players: Player[]) {
    this.objectMap = {};
    this.objectMap[players[0].id] = players[0];
    this.objectMap[players[1].id] = players[1];
  }

  getAllObjects(): GameObject[] {
    return Object.values(this.objectMap);
  }

  getObject(id: string): GameObject | undefined {
    return this.objectMap[id];
  }
}