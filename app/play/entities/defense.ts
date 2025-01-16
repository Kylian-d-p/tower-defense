import { EnemyType } from "./enemy";

type SpotPositionType = { lane: number; spot: number };
type LanePositionType = { x: number; y: number; lane: number };
type PositionningType = { type: "onLane"; position: LanePositionType } | { type: "onSpot"; position: SpotPositionType };
type TargetingMode = "single" | "multiple";

export type DefenseType = TurretDefense | BomberDefense | ProximityMineDefense | WallDefense;
export type DefenseStringType = "TurretDefense" | "BomberDefense" | "ProximityMineDefense" | "WallDefense";

export class Defense {
  private _positionning: PositionningType;
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
  private _type: DefenseStringType;
  private _range: number;
  private _targetingMode: TargetingMode;

  constructor(
    positionning: PositionningType,
    damages: number[],
    maxHealth: number[],
    shield: number,
    name: string,
    description: string,
    targetable: boolean,
    price: number,
    level: number,
    levelUpPrice: number[],
    type: DefenseStringType,
    range: number,
    targetingMode: TargetingMode
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
    this._type = type;
    this._range = range;
    this._targetingMode = targetingMode;
  }

  get targetable() {
    return this._targetable;
  }

  get positionning() {
    return this._positionning;
  }

  get type() {
    return this._type;
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

  attack(target: EnemyType) {
    target.takeDamages(this._damages[this._level]);
  }

  tick(enemies: EnemyType[]) {
    const targets = enemies
      .filter((enemy) => {
        return enemy.position.lane === this.positionning.position.lane;
      })
      .sort((a, b) => {
        if (this.positionning.type === "onLane") {
          return (
            Math.sqrt((a.position.x - this.positionning.position.x) ** 2 + (a.position.y - this.positionning.position.y) ** 2) -
            Math.sqrt((b.position.x - this.positionning.position.x) ** 2 + (b.position.y - this.positionning.position.y) ** 2)
          );
        } else {
          return b.position.x - a.position.x;
        }
      })
      .filter((enemy, i) => {
        if (this._targetingMode === "single") {
          return i === 0;
        } else {
          if (this.positionning.type === "onLane") {
            return (
              Math.sqrt((enemy.position.x - this.positionning.position.x) ** 2 + (enemy.position.y - this.positionning.position.y) ** 2) <=
              this._range
            );
          } else {
            return this._range + enemy.position.x >= 100;
          }
        }
      });

    if (targets) {
      targets.forEach((target) => {
        this.attack(target);
      });
    }
  }
}

export class TurretDefense extends Defense {
  static description = "Cible les ennemis présents sur la voie assignée.";
  constructor(position: SpotPositionType) {
    super(
      { type: "onSpot", position },
      [1, 2, 3.5, 5, 8],
      [100, 125, 150, 200, 300],
      0,
      "Tourelle",
      TurretDefense.description,
      true,
      100,
      0,
      [150, 200, 300, 400, 500],
      "TurretDefense",
      100,
      "single"
    );
  }
}

export class BomberDefense extends Defense {
  static description = "Inflige des dégâts à tous les ennemis proches de la base.";
  constructor(position: SpotPositionType) {
    super(
      { type: "onSpot", position },
      [2.5, 3.5, 5, 8.5, 12.5],
      [50, 75, 115, 150, 225],
      0,
      "Bombardier",
      BomberDefense.description,
      true,
      50,
      0,
      [100, 150, 200, 250, 300],
      "BomberDefense",
      15,
      "multiple"
    );
  }
}

export class ProximityMineDefense extends Defense {
  static description = "Inflige des dégâts aux ennemis proches.";
  constructor(position: LanePositionType) {
    super(
      { type: "onLane", position },
      [20, 30, 40, 75, 110],
      [60, 95, 135, 185, 250],
      0,
      "Mine de proximité",
      ProximityMineDefense.description,
      true,
      100,
      0,
      [150, 200, 250, 300, 350],
      "ProximityMineDefense",
      7,
      "multiple"
    );
  }
}

export class WallDefense extends Defense {
  static description = "Bloque la progression des ennemis sur la voie.";
  constructor(position: LanePositionType) {
    super(
      { type: "onLane", position },
      [0, 0, 0, 0, 0],
      [1000, 1500, 1900, 2500, 3000],
      50,
      "Mur",
      WallDefense.description,
      false,
      50,
      0,
      [100, 150, 200, 250, 300],
      "WallDefense",
      0,
      "single"
    );
  }
}
