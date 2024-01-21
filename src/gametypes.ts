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

  ;

  constructor(public name: string, public cardType: CardType, public targetinginfo: TargetingInfo[]) {
    this.id = nextId();
  }

  inspect(gamestate: GameState, player: Player): void {
    if (player.hand.cards.find(_ => _ === this)) {
      console.log(`This is your card, it is in your hand`);
    }
  }

  abstract resolve(castingState: Spell, gamestate: GameState): void;
}

export enum TargetingType {
  Any = "Any"
}

export interface TargetingInfo {
  type: TargetingType;
  min: number;
  max: number;
}

export class LightningBolt extends Card {
  constructor() {
    super('Lightning Bolt', CardType.Instant, [{
      type: TargetingType.Any,
      min: 1,
      max: 1
    }]);
  }

  inspect(gamestate: GameState, player: Player): void {
    console.log(`${this.name} [${this.cardType}]: Deal 3 damage to any taget`);
    super.inspect(gamestate, player);
  }

  resolve(castingState: Spell, gamestate: GameState): void {
    const target = castingState.targets[0].selected[0] as Player;
    if (!target) throw 'invalid target';

    target.life -= 3;
    console.log(`${castingState.caster.name} casts ${this.name} at ${target.name} for 3 damage`);
  }
}

export class WeirdBolt extends Card {
  constructor() {
    super('Weird Bolt', CardType.Instant, [{
      type: TargetingType.Any,
      min: 1,
      max: 1
    }, {
      type: TargetingType.Any,
      min: 0,
      max: 2
    }]);
  }

  inspect(gamestate: GameState, player: Player): void {
    console.log(`${this.name} [${this.cardType}]: Deal 1 damage to any target. Then deal 5 damage to up to two targets.`);
    super.inspect(gamestate, player);
  }

  resolve(castingState: Spell, gamestate: GameState): void {
    const [first, second] = castingState.targets;
    
    const firstplayer = first.selected[0] as Player;
    firstplayer.life -= 1;
    console.log(`${this.name} deals 1 damage to ${firstplayer.name}`);

    for (let st of second.selected) {
      const sp = st as Player;
      sp.life -= 5;
      console.log(`${this.name} deals 5 damage to ${sp.name}`);
    }
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
  static default() { return new Hand(new Array(3).fill(0).map(_ => new WeirdBolt())); }

  constructor(public cards: Card[]) {}

  removeCard(card: Card) {
    this.cards = this.cards.filter(_ => _ !== card);
  }
}

export interface TargetSelection {
  info: TargetingInfo;
  selected: GameObject[];
}

function isValidTargets(targets: TargetSelection) {
  if (targets.selected.length < targets.info.min)
    return false;

  if (targets.selected.length > targets.info.max)
    return false;

  return targets.selected.every(_ => isValidType(_, targets.info.type));
}

function isValidType(obj: GameObject, type: TargetingType) {
  if (type === TargetingType.Any)
    return obj instanceof Player;
}

export class CastingState {
  public targets: TargetSelection[];

  constructor(public card: Card, public caster: Player) {
    this.targets = card.targetinginfo.length ? [{ info: card.targetinginfo[0], selected: [] }] : [];
  }

  getCurrentSelection() {
    if (this.card.targetinginfo.length)
      return this.targets[this.targets.length - 1];
    return null;
  }

  confirmCurrentSelection() {
    if (this.card.targetinginfo.length === 0)
      return true;

    const current = this.getCurrentSelection();
    if (!isValidTargets(current))
      return false;

    if (this.targets.length < this.card.targetinginfo.length) {
      this.targets.push({ info: this.card.targetinginfo[this.targets.length], selected: [] });
      return true;
    }

    return true;
  }

  isValid() {
    return this.targets.every(_ => isValidTargets(_));
  }

  canTarget(selection: TargetSelection, target: GameObject) {
    return isValidType(target, selection.info.type);
  }

  undoTargets() {
    if (this.targets.length === 1) {
      this.targets[0].selected = [];
    }
    else {
      this.targets.pop();
    }
  }
}

export class Spell implements GameObject {
  public id: string;
  public get name(): string { return this.card.name; }
  public type = ObjectType.Spell;

  constructor(public card: Card, public caster: Player, public targets: TargetSelection[]) {
    this.id = nextId();
  }

  inspect(gamestate: GameState, player: Player): void {
    console.log(`${this.card.id}: ${this.card.name} [${this.card.type}] cast by (${this.caster.id})${this.caster.name}`);
    if (this.targets.length) {
      console.log(`it has the following targets:\n\t${this.targets.flatMap(_ => _.selected).map(_ => `${_.id}: ${_.name} [${_.type}]`).join('\n\t')}\n`);
    }
  }
}

export class GameState {
  public board: Board;
  public gameover: boolean;
  public history: string[];
  public turn: [number, number];
  public stack: Spell[];

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
    console.log(`${this.casting.caster.name} cancels casting ${this.casting.card.name}`);
    this.casting = null;
  }

  castSpell() {
    console.log(`${this.casting.caster.name} casts ${this.casting.card.name} targeting:\n\t${this.casting.targets.flatMap(_ => _.selected).map(_ => `${_.id}: ${_.name} [${_.type}]`).join('\n\t')}\n`);
    this.casting.caster.hand.removeCard(this.casting.card);
    this.stack.push(new Spell(this.casting.card, this.casting.caster, this.casting.targets));
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