import { randint } from "@/lib/utils";
import { DefenseType } from "./defense";
import { Game } from "./game";

export type EnemyType = FastEnemy | TankEnemy | BossEnemy | HealerEnemy;
type positionType = { x: number; y: number; lane: number }; // x: 0-100%, y: 0-100%, lane: 0-2
export type EnemyStringType = "FastEnemy" | "TankEnemy" | "HealerEnemy" | "BossEnemy";

export class Enemy {
  private _damages: number;
  private _health: number;
  private _maxHealth: number;
  private _shield: number;
  private _speed: number;
  private _name: string;
  private _description: string;
  private _position: positionType;
  private _id: string;
  private _reward: number;
  private _range: number;

  constructor(
    damages: number,
    health: number,
    shield: number,
    speed: number,
    name: string,
    description: string,
    position: positionType,
    reward: number,
    range: number
  ) {
    this._damages = damages;
    this._health = health;
    this._maxHealth = health;
    this._shield = shield;
    this._speed = speed;
    this._name = name;
    this._description = description;
    this._position = position;
    this._id = Math.random().toString(36).substring(7);
    this._reward = reward;
    this._range = range;
  }

  get damages() {
    return this._damages;
  }

  get speed() {
    return this._speed;
  }

  get position() {
    return this._position;
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get description() {
    return this._description;
  }

  get health() {
    return this._health;
  }

  get maxHealth() {
    return this._maxHealth;
  }

  get reward() {
    return this._reward;
  }

  get shield() {
    return this._shield;
  }

  move(xIncrement: number, yIncrement: number) {
    if (this._position.x + xIncrement > 100) {
      xIncrement = 100 - this._position.x;
    }
    if (this._position.x + xIncrement < 0) {
      xIncrement = -this._position.x;
    }
    if (this._position.y + yIncrement > 100) {
      yIncrement = 100 - this._position.y;
    }
    if (this._position.y + yIncrement < 0) {
      yIncrement = -this._position.y;
    }
    this._position.x += xIncrement;
    this._position.y += yIncrement;
  }

  attack(attacked: DefenseType) {
    attacked.takeDamages(this.damages);
  }

  addShield(shield: number) {
    this._shield += shield;
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

  tick(defenses: DefenseType[], game: Game) {
    const sortedTargetableDefensesByDistance = defenses
      .filter((defense) => defense.targetable)
      .filter((defense) => defense.positionning.position.lane === this.position.lane)
      .sort((a, b) => {
        if (a.positionning.type !== b.positionning.type) {
          return a.positionning.type === "onLane" ? -1 : 1;
        }
        if (a.positionning.type === "onLane" && b.positionning.type === "onLane") {
          return Math.abs(a.positionning.position.x - this.position.x) - Math.abs(b.positionning.position.x - this.position.x);
        }
        if (a.positionning.type === "onSpot" && b.positionning.type === "onSpot") {
          return b.positionning.position.spot - a.positionning.position.spot;
        }
        return 0;
      });
    if (sortedTargetableDefensesByDistance[0]) {
      const nearestTargetableDefense = sortedTargetableDefensesByDistance[0];
      if (nearestTargetableDefense.positionning.type === "onLane") {
        const dx = nearestTargetableDefense.positionning.position.x - this.position.x;
        const dy = nearestTargetableDefense.positionning.position.y - this.position.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= this._range) {
          this.attack(nearestTargetableDefense);
          return;
        }

        const scale = this.speed / distance;

        this.move(dx * scale, dy * scale);
      } else if (nearestTargetableDefense.positionning.type === "onSpot") {
        if (this.position.x < 100 - this._range) {
          this.move(this.speed, 0);
        } else {
          this.attack(nearestTargetableDefense);
        }
      }
    } else {
      if (this.position.x < 100 - this._range) {
        this.move(this.speed, 0);
      } else {
        game.takeDamages(this.damages / Game.TICKRATE);
      }
    }
  }
}

export class FastEnemy extends Enemy {
  constructor(lane: number, shield: number) {
    super(.5, 100, shield, 0.8, "Fast Enemy", "This enemy is fast.", { x: 0, y: randint(15, 85), lane }, 15, 5);
  }
}

export class TankEnemy extends Enemy {
  constructor(lane: number, shield: number) {
    super(.1, 700, shield, 0.3, "Tank Enemy", "This enemy has a lot of health.", { x: 0, y: randint(15, 85), lane }, 50, 1);
  }
}

export class BossEnemy extends Enemy {
  constructor(lane: number, shield: number) {
    super(3, 1500, shield, 0.4, "Boss Enemy", "This enemy is the boss.", { x: 0, y: randint(15, 85), lane }, 150, 2);
  }
}

export class HealerEnemy extends Enemy {
  constructor(lane: number, shield: number) {
    super(.05, 90, shield, 0.5, "Healer Enemy", "This enemy heals other enemies by adding shield.", { x: 0, y: randint(15, 85), lane }, 75, 6);
  }

  tick(defenses: DefenseType[], game: Game, enemies?: EnemyType[]) {
    super.tick(defenses, game);
    if (enemies) {
      enemies.forEach((enemy) => {
        if (enemy.position.lane === this.position.lane && enemy.id !== this.id) {
          enemy.addShield(.4);
        }
      });
    }
  }
}
