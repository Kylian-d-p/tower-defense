type positionningType = "onLane" | "onSpot";

export type DefenseType = Turret | ProximityMines | ImprovedMines | Wall;

export class Defense {
  private _positionning: positionningType;
  private _damages: number[];
  private _health: number;
  private _maxHealth: number[];
  private _shield: number;
  private _description: string;
  private _name: string;
  private _targetable: boolean;
  private _price: number;
  private _level: number;
  private _levelUpPrice: number[];

  constructor(
    positionning: positionningType,
    damages: number[],
    maxHealth: number[],
    shield: number,
    name: string,
    description: string,
    targetable: boolean,
    price: number,
    level: number,
    levelUpPrice: number[]
  ) {
    if (level > damages.length || level > maxHealth.length) {
      throw new Error(`Level is higher than the number of levels available for this defense. (Defense name : ${name})`);
    }

    this._positionning = positionning;
    this._damages = damages;
    this._health = maxHealth[level];
    this._maxHealth = maxHealth;
    this._shield = shield;
    this._name = name;
    this._description = description;
    this._targetable = targetable;
    this._price = price;
    this._level = level;
    this._levelUpPrice = levelUpPrice;
  }

  get targetable() {
    return this._targetable;
  }

  takeDamages(damages: number) {
    if (this._shield > 0) {
      this._shield -= damages;
      if (this._shield < 0) {
        this._health += this._shield;
        this._shield = 0;
      }
    } else {
      this._health -= damages;
    }
  }

  levelUp() {
    if (this._level >= this._maxHealth.length - 1 || this._level >= this._damages.length - 1) {
      throw new Error(`Defense is already at max level. (Defense name : ${this._name})`);
    }

    this._level++;
    this._health = this._maxHealth[this._level];
  }
}

export class Turret extends Defense {
  constructor() {
    super(
      "onSpot",
      [10, 20, 35, 50, 80],
      [100, 125, 150, 200, 300],
      0,
      "Tourelle",
      "Cible les ennemis présents sur la voie assignée.",
      true,
      100,
      0,
      [150, 200, 300, 400, 500]
    );
  }
}

export class ProximityMines extends Defense {
  constructor() {
    super(
      "onSpot",
      [25, 35, 50, 85, 125],
      [50, 75, 115, 150, 225],
      0,
      "Mines de proximité",
      "Inflige des dégâts de zones aux ennemis proches du vaisseau.",
      true,
      50,
      0,
      [100, 150, 200, 250, 300]
    );
  }
}

export class ImprovedMines extends Defense {
  private _position: { x: number; y: number };
  constructor(position: { x: number; y: number }) {
    super(
      "onLane",
      [20, 30, 40, 75, 110],
      [60, 95, 135, 185, 250],
      0,
      "Mines améliorées",
      "Inflige des dégâts de zones aux ennemis proches.",
      true,
      100,
      0,
      [150, 200, 250, 300, 350]
    );
    this._position = position;
  }

  get position() {
    return this._position;
  }
}

export class Wall extends Defense {
  private _position: { x: number; y: number };
  constructor(position: { x: number; y: number }) {
    super(
      "onLane",
      [0, 0, 0, 0, 0],
      [1000, 1500, 1900, 2500, 3000],
      50,
      "Mur",
      "Bloque la progression des ennemis sur la voie.",
      false,
      50,
      0,
      [100, 150, 200, 250, 300]
    );
    this._position = position;
  }

  get position() {
    return this._position;
  }
}
