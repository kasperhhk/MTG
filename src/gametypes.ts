import { list, write } from './output/util';

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
  Spell = 'Spell',
  Creature = 'Creature'
}

export enum CardType {
  Instant = 'Instant',
  Creature = 'Creature'
}

export interface GameObject extends Inspectable {
  id: string,
  name: string,
  type: ObjectType,
}

export interface BoardObject extends GameObject {
  controller: Player;
}

export interface Inspectable {
  inspect(gamestate: GameState, player: Player): void;
  toLongString(): string;
  toShortString(): string;
}

function defaultLongString(obj: GameObject) {
  return `${obj.id}: ${obj.name} [${obj.type}]`;
}

function defaultShortString(obj: GameObject) {
  return `${obj.name}(${obj.id})`;
}

export abstract class Card implements GameObject {
  public id: string;
  public type = ObjectType.Card;
  public owner: Player;

  constructor(public name: string, public cardType: CardType, public targetinginfo: TargetingInfo[]) {
    this.id = nextId();
  }

  inspect(gamestate: GameState, player: Player): void {
    write(`${this.name} [${this.cardType}]: ${this.getDescription()}`);
    if (player.hand.cards.find(_ => _ === this)) {
      write(`This is your card, it is in your hand`);
    }
  }

  abstract getDescription(): string;

  toLongString(): string {
    return defaultLongString(this);
  }

  toShortString(): string {
    return defaultShortString(this);
  }
}

export abstract class NonPermanentCard extends Card {
  abstract resolve(castingState: Spell, gamestate: GameState): void;
}

export abstract class InstantCard extends NonPermanentCard {
  constructor(name: string, targetinginfo: TargetingInfo[]) {
    super(name, CardType.Instant, targetinginfo);
  }
}

export abstract class PermanentCard extends Card {
}

export abstract class CreatureCard extends PermanentCard {
  constructor(name: string, public power: number, public toughness: number) {
    super(name, CardType.Creature, []);
  }
}

export class CreatureObject implements BoardObject {
  public id: string;
  public get name() { return this.card.name; }
  public type = ObjectType.Creature;

  public damage: number;

  constructor(public card: CreatureCard, public controller: Player) {
    this.id = nextId();
    this.damage = 0;
  }

  inspect(gamestate: GameState, player: Player): void {
    write(`${this.card.power}/${this.card.toughness} ${this.name} under the control of ${this.controller.toShortString()}`);
    write(`it has ${this.damage} damage marked on it`);
  }

  toLongString(): string {
    return defaultLongString(this) + ` ${this.controller.toShortString()}`;
  }
  toShortString(): string {
    return defaultShortString(this);
  }
}

// I dont want to deal with auras right now, they are a bit weird lol
export abstract class AuraCard extends PermanentCard {
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

  getDescription(): string {
    return 'Deal 3 damage to any taget';
  }

  resolve(castingState: Spell, gamestate: GameState): void {
    const target = castingState.targets[0].selected[0] as Player;
    if (!target) throw 'invalid target';

    target.life -= 3;
    write(`${castingState.controller.name} casts ${this.name} at ${target.name} for 3 damage`);
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

  getDescription(): string {
    return 'Deal 1 damage to any target. Then deal 5 damage to up to two targets';
  }

  resolve(castingState: Spell, gamestate: GameState): void {
    const [first, second] = castingState.targets;
    
    if (first.selected[0] instanceof Player) {
      first.selected[0].life -= 1;
    }
    else if (first.selected[0] instanceof CreatureObject) {
      first.selected[0].damage += 1;
    }
    else {
      throw 'invalid target type';
    }
    write(`${this.name} deals 1 damage to ${first.selected[0].toShortString()}`);

    for (let secondtarget of second.selected) {
      if (secondtarget instanceof Player) {
        secondtarget.life -= 5;
      }
      else if (secondtarget instanceof CreatureObject) {
        secondtarget.damage += 5;
      }
      write(`${this.name} deals 5 damage to ${secondtarget.toShortString()}`);
    }
  }
}

export class GrizzlyBear extends CreatureCard {
  constructor() {
    super('Grizzly Bear', 2, 2);
  }

  getDescription(): string {
    return `${this.power}/${this.toughness} ${this.name}`;
  }
}

export class Graveyard {
  public cards: Card[];

  constructor(public player: Player) {
    this.cards = [];
  }
}

export class Player implements GameObject {
  public life: number;
  public id: string;

  public type = ObjectType.Player;
  public graveyard: Graveyard;

  constructor(public name: string, public hand: Hand) {
    this.life = 20;
    this.id = nextId();
    this.graveyard = new Graveyard(this);

    for (let hcard of hand.cards) {
      hcard.owner = this;
    }
  }

  inspect(gamestate: GameState, player: Player): void {
    write(`Player ${this.name} has ${this.life} life`)
    if (this === player) {
      write('This is you');
    }
    else {
      write('This is your opponent');
    }
  }

  toLongString(): string {
    return defaultLongString(this);
  }

  toShortString(): string {
    return defaultShortString(this);
  }
}

export class Hand {
  static default() { return new Hand([new LightningBolt(), new LightningBolt(), new GrizzlyBear()]); }

  constructor(public cards: Card[]) {}

  removeCard(card: Card) {
    this.cards = this.cards.filter(_ => _ !== card);
  }
}

export enum Zone {
  Player,
  Board,
  Hand,
  Graveyard,
  Stack,
  Exile
}

// TODO: MAKE INTO CLASS
export interface Target {
  id: string;
  zone: Zone;
}

// TODO: MAKE INTO CLASS
export interface TargetSelection {
  info: TargetingInfo;
  selected: Target[];
}

function isValidTargetSelection(targets: TargetSelection, gamestate: GameState) {
  if (targets.selected.length < targets.info.min)
    return false;

  if (targets.selected.length > targets.info.max)
    return false;

  return targets.selected.every(_ => isValidTarget(_, targets.info, gamestate));
}

function isValidTarget(target: Target, targetingInfo: TargetingInfo, gamestate: GameState) {
  const [obj, zone] = gamestate.getObject(target.id);
  if (!obj)
    return false;

  if (zone !== target.zone)
    return false;

  return isValidType(obj, targetingInfo.type);
}

function isValidType(obj: GameObject, type: TargetingType) {
  if (type === TargetingType.Any)
    return obj instanceof Player || obj instanceof CreatureObject;
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
    if (!isValidTargetSelection(current))
      return false;

    if (this.targets.length < this.card.targetinginfo.length) {
      this.targets.push({ info: this.card.targetinginfo[this.targets.length], selected: [] });
      return true;
    }

    return true;
  }

  target(obj: GameObject) {
    const current = this.getCurrentSelection();

    if (isValidType(obj, current.info.type) && current.selected.length < current.info.max) {
      current.selected.push({ id: obj.id, zone: Zone.hmmm });
      return true;
    }

    return false;
  }

  isValid() {
    return this.targets.length === this.card.targetinginfo.length && this.targets.every(_ => isValidTargetSelection(_));
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

  constructor(public card: Card, public controller: Player, public targets: TargetSelection[]) {
    this.id = nextId();
  }

  inspect(gamestate: GameState, player: Player): void {
    write(`${this.toLongString()} cast by ${this.controller.toShortString()}`);
    if (this.targets.length) {
      list(`it has the following targets:`, this.targets.flatMap(_ => _.selected.map(__ => __.toLongString())));
    }
  }

  toLongString(): string {
    return defaultLongString(this);
  }

  toShortString(): string {
    return defaultShortString(this);
  }

  isValid(gamestate: GameState): boolean {
    return this.targets.every(_ => _.selected.every(t => isValidTarget(t, _.info, gamestate)));
  }
}

export interface GameOverState {
  winner?: Player;
  loser?: Player;
  draw?: boolean;
}

export class GameState {
  public board: Board;
  public gameover: GameOverState | false;
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

  getObject(id: string, player?: Player): [GameObject, zone: Zone] | [null, null] {
    const fromHand = this.players.map(p => p.hand.cards.find(_ => _.id === id)).find(_ => _);
    if (fromHand && (!player || fromHand.owner === player)) {
      return [fromHand, Zone.Hand];
    }

    const fromBoard = this.board.getObject(id);
    if (fromBoard) {
      return [fromBoard, Zone.Board];
    }

    const fromStack = this.stack.find(_ => _.id === id);
    const cardFromStack = this.stack.find(_ => _.card.id === id)?.card;
    if (fromStack ?? cardFromStack) {
      return [fromStack ?? cardFromStack, Zone.Stack];
    }

    const fromGraveyard = this.players.map(p => p.graveyard.cards.find(_ => _.id === id)).find(_ => _);
    if (fromGraveyard) {
      return [fromGraveyard, Zone.Graveyard];
    }

    const fromPlayers = this.players.find(_ => _.id === id);
    if (fromPlayers) {
      return [fromPlayers, Zone.Player];
    }

    return [null, null];
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
    write(`${this.casting.caster.name} cancels casting ${this.casting.card.name}`);
    this.casting = null;
  }

  castSpell() {
    list(`${this.casting.caster.name} casts ${this.casting.card.name} targeting:`, this.casting.targets.flatMap(_ => _.selected.map(__ => __.toLongString())));
    this.casting.caster.hand.removeCard(this.casting.card);
    this.stack.push(new Spell(this.casting.card, this.casting.caster, this.casting.targets));
    this.casting = null;
    this.history.push('cast');
  }

  resolvestack() {
    const topofstack = this.stack.pop();
    if (topofstack === undefined) throw 'resolved empty stack';

    if (topofstack.)

    if (topofstack.card instanceof NonPermanentCard) {
      topofstack.card.resolve(topofstack, this);
      this.history.push('resolve ' + topofstack.name);

      topofstack.controller.graveyard.cards.push(topofstack.card);
      this.history.push('graveyard ' + topofstack.card.name);
    }
    else if (topofstack.card instanceof PermanentCard) {
      const boardObject = this.board.placeCard(topofstack);
      this.history.push('resolve ' + topofstack.name);
      write(`placed ${boardObject.toLongString()} on the board under the control of ${boardObject.controller.toShortString()}`);
    }
    else {
      throw 'card is neither permanent nor non-permanent???';
    }
  }

  doStateBasedActions() {
    if (this.players.some(_ => _.life <= 0)) {
      write('one or more players have lost due to life <= 0');
      this.gameover = {
        winner: this.players.find(_ => _.life > 0),
        loser: this.players.find(_ => _.life <= 0),
        draw: this.players.every(_ => _.life <= 0)
      };
    }

    const creatures = this.board.getAllObjects().filter(_ => _ instanceof CreatureObject).map(_ => _ as CreatureObject);
    for (let creature of creatures) {
      if (creature.damage >= creature.card.toughness) {
        this.board.remove(creature);
        creature.card.owner.graveyard.cards.push(creature.card);
        write(`${creature.card.toShortString()} dies from damage and is moved to the graveyard of ${creature.card.owner.toShortString()}`);
      }
    }
  }
}

export class Board {
  private objectMap: { [key: string]: BoardObject };
  private objects: BoardObject[];

  constructor(players: Player[]) {
    this.objectMap = {};
    this.objects = [];
  }

  getAllObjects(): BoardObject[] {
    return this.objects.map(_ => _);
  }

  getObject(id: string): BoardObject | undefined {
    return this.objectMap[id];
  }

  placeCard(spell: Spell): BoardObject {
    if (spell.card instanceof CreatureCard) {
      const creatureObject = new CreatureObject(spell.card, spell.controller);
      this.objects.push(creatureObject);
      this.objectMap[creatureObject.id] = creatureObject;
      return creatureObject;
    }
    else {
      throw 'invalid cardtype, can\'t place ' + spell.card.cardType + ' on the board';
    }
  }

  remove(object: BoardObject) {
    delete this.objectMap[object.id];
    this.objects = this.objects.filter(_ => _ !== object);
  }
}