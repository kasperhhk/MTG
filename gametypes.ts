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
    this.life = 21;
    this.id = nextId();
  }
}

export class GameState {
  public board: Board;
  public gameover: boolean;
  public history: any[];

  public currentPlayer: number;

  constructor(public players: Player[]) {
    this.board = new Board(players);
    this.gameover = false;
    this.currentPlayer = 0;
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