const nextId = (() => {
  let idgen = 0;
  return () => {
    const next = idgen++;
    return next.toString();
  };
})();

export enum ObjectType {
  Player = 'Player',
  Card = 'Card'
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

export class Card implements GameObject {
  public id: string;

  public type = ObjectType.Card;

  constructor(public name: string, public cardType: CardType) {
    this.id = nextId();
  }

  inspect(gamestate: GameState, player: Player): void {
    console.log(`${this.name} [${this.cardType}]: Deal 3 damage to the opponents face`);
    
    if (player.hand.cards.find(_ => _ === this)) {
      console.log(`This is your card, it is in your hand`);
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
  static default() { return new Hand(new Array(3).fill(0).map(_ => new Card('bolt', CardType.Instant))); }

  constructor(public cards: Card[]) {}

  removeCard(card: Card) {
    this.cards = this.cards.filter(_ => _ !== card);
  }
}

export class GameState {
  public board: Board;
  public gameover: boolean;
  public history: string[];
  public turn: [number, number];
  public stack: { card: Card, caster: Player, target: Player }[];

  public casting?: any;

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

  putonstack(card: Card, caster: Player, target: Player) {
    this.stack.push({ card, caster, target });
  }

  resolvestack() {
    const topofstack = this.stack.pop();
    if (topofstack === undefined) throw 'resolved empty stack';

    if (topofstack.card.name === 'bolt') {
      console.log(`${topofstack.caster.name} Lightning Bolts ${topofstack.target.name} for 3 damage`);
      topofstack.target.life -= 3;
      this.history.push('bolt');
    }
    else {
      throw 'unknown stack card';
    }
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