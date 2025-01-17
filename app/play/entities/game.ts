import { randint } from "@/lib/utils";
import { BomberDefense, DefenseType, ProximityMineDefense, TurretDefense, WallDefense } from "./defense";
import { BossEnemy, EnemyStringType, EnemyType, FastEnemy, HealerEnemy, TankEnemy } from "./enemy";

type WaveEnemy = {
  type: EnemyStringType;
  amount: number;
  shield: number;
};

export class Game {
  static TICKRATE = 1000 / 30;
  static waveRates: { enemies: WaveEnemy[]; money: number; duration: number }[] = Array.from({ length: 50 }, (_, i) => ({
    enemies: [
      { type: "FastEnemy", amount: Math.round(10 + i * 4), shield: Math.round(i * 5) },  
      { type: "TankEnemy", amount: i >= 2 ? Math.round(i * 1.5) : 0, shield: Math.round(i * 10) },
      { type: "HealerEnemy", amount: i >= 3 ? i : 0, shield: Math.round(i * 15) },
      { type: "BossEnemy", amount: i >= 6 ? Math.round(i / 3) : 0, shield: Math.round(i * 20) },
    ],
    money: 100 + i * 50,
    duration: 10 + i * 5,
  }));
  private _defenses: DefenseType[];
  private _enemies: EnemyType[];
  private _money: number;
  private _running = true;
  private _wave: number;
  private _remainingEnemiesInWave: { type: EnemyStringType; spawnTickNumber: number, shield: number }[] = [];
  private _ticknumber = 0;
  private _health = 100;
  private _maxHealth = 100;

  constructor(defenses: DefenseType[], enemies: EnemyType[], money = 100, wave = 1) {
    this._defenses = defenses;
    this._enemies = enemies;
    this._money = money;
    this._wave = wave;
    this.setRemainingEnemiesInWave();
  }

  get wave() {
    return this._wave;
  }

  get defenses() {
    return this._defenses;
  }

  get enemies() {
    return this._enemies;
  }

  get money() {
    return this._money;
  }

  get health() {
    return this._health;
  }

  get maxHealth() {
    return this._maxHealth;
  }

  removeDefense(defense: DefenseType) {
    for (const def of this._defenses) {
      if (def === defense) {
        this._defenses.splice(this._defenses.indexOf(def), 1);
        break;
      }
    }
  }

  removeMoney(amount: number) {
    if (amount > 0) {
      this._money -= amount;
    }
  }

  takeDamages(damages: number) {
    damages /= 2;
    this._health -= damages;
    if (this._health <= 0) {
      this._health = 0;
      this._running = false;
    }
  }

  private setRemainingEnemiesInWave() {
    this._remainingEnemiesInWave = Game.waveRates[this._wave - 1].enemies
      .map((enemy) =>
        Array.from({ length: enemy.amount }).map(() => ({
          type: enemy.type,
          spawnTickNumber: randint(0, Game.waveRates[this._wave - 1].duration * 30),
          shield: enemy.shield,
        }))
      )
      .flat();
  }

  run() {
    setInterval(() => {
      if (this._running) {
        this._ticknumber++;
        if (this._remainingEnemiesInWave.length === 0 && this._ticknumber >= Game.waveRates[this._wave - 1].duration * 30) {
          this._ticknumber = 0;
          this._wave++;
          this.setRemainingEnemiesInWave();
          this._money += Game.waveRates[this._wave - 1].money;
        }

        this._remainingEnemiesInWave.forEach((enemy, i) => {
          if (enemy.spawnTickNumber <= this._ticknumber) {
            switch (enemy.type) {
              case "FastEnemy":
                this.addEnemy(new FastEnemy(randint(0, 2), enemy.shield));
                break;
              case "TankEnemy":
                this.addEnemy(new TankEnemy(randint(0, 2), enemy.shield));
                break;
              case "HealerEnemy":
                this.addEnemy(new HealerEnemy(randint(0, 2), enemy.shield));
                break;
              case "BossEnemy":
                this.addEnemy(new BossEnemy(randint(0, 2), enemy.shield));
                break;
            }
            this._remainingEnemiesInWave.splice(i, 1);
          }
        });

        this._enemies.forEach((enemy) => {
          enemy.tick(this._defenses, this, this._enemies);
          if (enemy.health <= 0) {
            this._money += enemy.reward;
            this._enemies.splice(this._enemies.indexOf(enemy), 1);
          }
        });
        this._defenses.forEach((defense) => {
          defense.tick(this._enemies);
          if (!defense.alive) {
            this._defenses.splice(this._defenses.indexOf(defense), 1);
          }
        });
      }
    }, Game.TICKRATE);
  }

  addEnemy(enemy: EnemyType) {
    this._enemies.push(enemy);
  }

  addTurret(lane: number, spot: number) {
    if (
      this._defenses.some(
        (defense) =>
          defense.positionning.type === "onSpot" && defense.positionning.position.spot === spot && defense.positionning.position.lane === lane
      )
    ) {
      throw new Error("A defense is already on this spot.");
    }
    if (this.money >= TurretDefense.prices[0]) {
      this._defenses.push(new TurretDefense({ lane, spot }));
      this._money -= TurretDefense.prices[0];
    }
  }

  addBomberDefense(lane: number, spot: number) {
    if (
      this._defenses.some(
        (defense) =>
          defense.positionning.type === "onSpot" && defense.positionning.position.spot === spot && defense.positionning.position.lane === lane
      )
    ) {
      throw new Error("A defense is already on this spot.");
    }
    if (this.money >= BomberDefense.prices[0]) {
      this._defenses.push(new BomberDefense({ lane, spot }));
      this._money -= BomberDefense.prices[0];
    }
  }

  addWallDefense(lane: number, x: number, y: number) {
    if (this.money >= WallDefense.prices[0]) {
      this._defenses.push(new WallDefense({ lane, x, y}));
      this._money -= WallDefense.prices[0];
    }
  }

  addProximityMineDefense(lane: number, x: number, y: number) {
    if (this.money >= ProximityMineDefense.prices[0]) {
      this._defenses.push(new ProximityMineDefense({ lane, x, y}));
      this._money -= ProximityMineDefense.prices[0];
    }
  }
}
