const nextId = (() => {
  let idgen = 0;
  return () => {
    return idgen++;
  };
})();

export enum ObjectType {
  Player = 'Player'
}

export interface GameObject {
  id: number,
  name: string,
  type: ObjectType
}

export class Player implements GameObject {
  public life: number;
  public id: number;

  public type = ObjectType.Player;

  constructor(public name: string) {
    this.life = 20;
    this.id = nextId();
  }
}

export class GameState {
  public board: Board;
  public gameover: boolean;
  public history: any[];
  public turn: [number, number];

  public currentPlayer: number;
  public hasPriority: number;

  constructor(public players: Player[]) {
    this.board = new Board(players);
    this.gameover = false;
    this.history = [];
    this.currentPlayer = 0;
    this.hasPriority = 0;
    this.turn = [1, 0];
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
}

export class Board {
  private objectMap: { [key: number]: GameObject };

  constructor(players: Player[]) {
    this.objectMap = {};
    this.objectMap[players[0].id] = players[0];
    this.objectMap[players[1].id] = players[1];
  }

  getAllObjects(): GameObject[] {
    return Object.values(this.objectMap);
  }

  getObject(id: number) {
    return this.objectMap[id];
  }
}