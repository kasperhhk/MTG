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

export interface GameObject {
  id: string,
  name: string,
  type: ObjectType
}

export class Card implements GameObject {
  public id: string;

  public type = ObjectType.Card;

  constructor(public name: string, public cardType: CardType) {
    this.id = nextId();
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
}

export class Hand {
  static default() { return new Hand(new Array(3).fill(0).map(_ => new Card('bolt', CardType.Instant))); }

  constructor(public cards: Card[]) {}
}

export class GameState {
  public board: Board;
  public gameover: boolean;
  public history: string[];
  public turn: [number, number];
  public stack: { card: Card, caster: Player, target: Player }[];

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