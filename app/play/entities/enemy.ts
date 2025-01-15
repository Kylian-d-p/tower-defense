import { randint } from "@/lib/utils";
import { DefenseType } from "./defense";

export type EnemyType = FastEnemy | TankEnemy | BossEnemy | Healer;
type positionType = { x: number; y: number; lane: number }; // x: 0-100%, y: 0-100%, lane: 0-2

export class Enemy {
  private _damages: number;
  private _health: number;
  private _maxHealth: number;
  private _shield: number;
  private _speed: number;
  private _name: string;
  private _description: string;
  private _position: positionType;

  constructor(damages: number, health: number, shield: number, speed: number, name: string, description: string, position: positionType) {
    this._damages = damages;
    this._health = health;
    this._maxHealth = health;
    this._shield = shield;
    this._speed = speed;
    this._name = name;
    this._description = description;
    this._position = position;
  }

  get damages() {
    return this._damages;
  }

  get speed() {
    return this._speed;
  }

  get position() {
    return {
      x: this._position.x,
      y: this._position.y,
    };
  }

  get lane() {
    return this._position.lane;
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
}

export class FastEnemy extends Enemy {
  constructor(lane: number) {
    super(10, 100, 0, 0.8, "Fast enemy", "This enemy is fast.", { x: 0, y: randint(0, 100), lane });
  }

  tick(enemies: EnemyType[], defenses: DefenseType[]) {
    this.move(this.speed, 0);
  }
}

export class TankEnemy extends Enemy {
  constructor(lane: number) {
    super(2, 700, 0, 0.3, "Tank enemy", "This enemy has a lot of health.", { x: 0, y: randint(0, 100), lane });
  }
}

export class BossEnemy extends Enemy {
  constructor(lane: number) {
    super(15, 1000, 0, 0.4, "Boss enemy", "This enemy is the boss.", { x: 0, y: randint(0, 100), lane });
  }
}

export class Healer extends Enemy {
  constructor(lane: number) {
    super(1, 90, 0, 0.5, "Healer", "This enemy heals other enemies by adding shield.", { x: 0, y: randint(0, 100), lane });
  }
}
