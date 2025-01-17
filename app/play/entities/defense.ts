import { EnemyType } from "./enemy";
import { Game } from "./game";

type SpotPositionType = { lane: number; spot: number };
type LanePositionType = { x: number; y: number; lane: number };
type PositionningType = { type: "onLane"; position: LanePositionType } | { type: "onSpot"; position: SpotPositionType };
type TargetingMode = "single" | "multiple";

export type DefenseType = TurretDefense | BomberDefense | ProximityMineDefense | WallDefense;
export type DefenseStringType = "TurretDefense" | "BomberDefense" | "ProximityMineDefense" | "WallDefense";

export class Defense {
  static prices = [100, 200, 300, 400, 500];
  static description = "Description";
  private _positionning: PositionningType;
  private _damages: number[];
  private _health: number;
  private _maxHealth: number[];
  private _prices = Defense.prices;
  private _name: string;
  private _targetable: boolean;
  private _level: number;
  private _type: DefenseStringType;
  private _range: number;
  private _targetingMode: TargetingMode;
  private _alive = true;
  private _id = Math.random().toString(36).substring(7);

  constructor(
    positionning: PositionningType,
    damages: number[],
    maxHealth: number[],
    prices: number[],
    name: string,
    targetable: boolean,
    level: number,
    type: DefenseStringType,
    range: number,
    targetingMode: TargetingMode
  ) {
    if (damages.length !== maxHealth.length || maxHealth.length !== prices.length) {
      throw new Error(`The number of levels is different for damages, health and prices. (Defense name : ${name})`);
    }

    if (level > prices.length - 1) {
      throw new Error(`Level is higher than the number of levels available for this defense. (Defense name : ${name})`);
    }


    this._positionning = positionning;
    this._damages = damages;
    this._health = maxHealth[level];
    this._maxHealth = maxHealth;
    this._prices = prices;
    this._name = name;
    this._targetable = targetable;
    this._level = level;
    this._type = type;
    this._range = range;
    this._targetingMode = targetingMode;
  }

  get id() {
    return this._id;
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

  get health() {
    return this._health;
  }

  get maxHealth() {
    return this._maxHealth[this._level];
  }

  get alive() {
    return this._alive;
  }

  get level() {
    return this._level;
  }

  get levelUpPrice() {
    return this._prices[this._level + 1];
  }  

  get restoreHealthPrice() {
    return Math.round(this._maxHealth[this._level] - this._health);
  }

  get maxLevel() {
    return this._prices.length - 1;
  }

  restoreHealth(game: Game) {
    if (game.money >= this.restoreHealthPrice) {
      game.removeMoney(this.restoreHealthPrice);
      this._health = this._maxHealth[this._level];
    }
  }

  takeDamages(damages: number) {
    this._health -= damages;
    if (this._health <= 0) {
      this.levelDown();
    }
  }

  levelDown() {
    if (this._level <= 0) {
      this._alive = false;
      return;
    }
    this._level--;
    this._health = this._maxHealth[this._level];
  }

  levelUp(game: Game) {
    if (this._level >= this._maxHealth.length - 1 || this._level >= this._damages.length - 1) {
      throw new Error(`Defense is already at max level. (Defense name : ${this._name})`);
    }

    if (game.money >= this._prices[this._level + 1]) {
      this._level++;
      this._health = this._maxHealth[this._level];
      game.removeMoney(this._prices[this._level]);
    }
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
  static prices = [75, 200, 300, 400, 500];
  static description = "Cible les ennemis présents sur la voie assignée.";
  constructor(position: SpotPositionType) {
    super(
      { type: "onSpot", position },
      [1, 1.2, 1.5, 2, 2.6],
      [100, 200, 300, 500, 650],
      TurretDefense.prices,
      "Tourelle",
      true,
      0,
      "TurretDefense",
      100,
      "single"
    );
  }
}

export class BomberDefense extends Defense {
  static prices = [50, 150, 200, 250, 300];
  static description = "Inflige des dégâts à tous les ennemis proches de la base.";
  constructor(position: SpotPositionType) {
    super(
      { type: "onSpot", position },
      [2.5, 3, 3.6, 4, 5],
      [85, 150, 250, 400, 550],
      BomberDefense.prices,
      "Bombardier",
      true,
      0,
      "BomberDefense",
      15,
      "multiple"
    );
  }
}

export class ProximityMineDefense extends Defense {
  static prices = [250];
  static description = "Inflige des dégâts aux ennemis proches.";
  constructor(position: LanePositionType) {
    super(
      { type: "onLane", position },
      [4],
      [250],
      ProximityMineDefense.prices,
      "Mine de proximité",
      false,
      0,
      "ProximityMineDefense",
      30,
      "multiple"
    );
  }
}

export class WallDefense extends Defense {
  static prices = [250];
  static description = "Bloque la progression des ennemis sur la voie.";
  constructor(position: LanePositionType) {
    super(
      { type: "onLane", position },
      [0],
      [1000],
      WallDefense.prices,
      "Mur",
      true,
      0,
      "WallDefense",
      0,
      "single"
    );
  }
}
