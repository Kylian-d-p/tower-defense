import { randint } from "@/lib/utils";
import { BomberDefense, DefenseType, TurretDefense } from "./defense";
import { BossEnemy, EnemyStringType, EnemyType, FastEnemy, HealerEnemy, TankEnemy } from "./enemy";

type WaveEnemy = {
  type: EnemyStringType;
  amount: number;
};

export class Game {
  static TICKRATE = 1000 / 30;
  static waveRates: { enemies: WaveEnemy[]; money: number; duration: number }[] = Array.from({ length: 15 }, (_, i) => ({
    enemies: [
      { type: "FastEnemy", amount: Math.round(10 + i * 4) },
      { type: "TankEnemy", amount: i >= 2 ? Math.round(i / 2) : 0 },
      { type: "HealerEnemy", amount: i >= 3 ? Math.round(i / 2) : 0 },
      { type: "BossEnemy", amount: i >= 6 ? Math.round(i / 3) : 0 },
    ],
    money: 100 + i * 50,
    duration: 20 + i * 10,
  }));
  defenses: DefenseType[];
  enemies: EnemyType[];
  money: number;
  running = true;
  wave: number;
  remainingEnemiesInWave: { type: EnemyStringType; spawnTickNumber: number }[] = [];
  ticknumber = 0;

  constructor(defenses: DefenseType[], enemies: EnemyType[], money = 100, wave = 1) {
    this.defenses = defenses;
    this.enemies = enemies;
    this.money = money;
    this.wave = wave;
    this.setRemainingEnemiesInWave();
  }

  private setRemainingEnemiesInWave() {
    this.remainingEnemiesInWave = Game.waveRates[this.wave - 1].enemies
      .map((enemy) =>
        Array.from({ length: enemy.amount }).map(() => ({
          type: enemy.type,
          spawnTickNumber: randint(0, Game.waveRates[this.wave - 1].duration * 30),
        }))
      )
      .flat();
  }

  run() {
    setInterval(() => {
      if (this.running) {
        this.ticknumber++;
        if (this.remainingEnemiesInWave.length === 0 && this.ticknumber >= Game.waveRates[this.wave - 1].duration * 30) {
          this.ticknumber = 0;
          this.wave++;
          this.setRemainingEnemiesInWave();
          this.money += Game.waveRates[this.wave - 1].money;
        }

        this.remainingEnemiesInWave.forEach((enemy, i) => {
          if (enemy.spawnTickNumber <= this.ticknumber) {
            switch (enemy.type) {
              case "FastEnemy":
                this.addEnemy(new FastEnemy(randint(0, 2)));
                break;
              case "TankEnemy":
                this.addEnemy(new TankEnemy(randint(0, 2)));
                break;
              case "HealerEnemy":
                this.addEnemy(new HealerEnemy(randint(0, 2)));
                break;
              case "BossEnemy":
                this.addEnemy(new BossEnemy(randint(0, 2)));
                break;
            }
            this.remainingEnemiesInWave.splice(i, 1);
          }
        });

        this.enemies.forEach((enemy) => {
          enemy.tick(this.defenses);
          if (enemy.health <= 0) {
            this.enemies.splice(this.enemies.indexOf(enemy), 1);
          }
        });
        this.defenses.forEach((defense) => {
          defense.tick(this.enemies);
        });
      }
    }, Game.TICKRATE);
  }

  addEnemy(enemy: EnemyType) {
    this.enemies.push(enemy);
  }

  addTurret(lane: number, spot: number) {
    if (
      this.defenses.some(
        (defense) =>
          defense.positionning.type === "onSpot" && defense.positionning.position.spot === spot && defense.positionning.position.lane === lane
      )
    ) {
      throw new Error("A defense is already on this spot.");
    }
    this.defenses.push(new TurretDefense({ lane, spot }));
  }

  addBomberDefense(lane: number, spot: number) {
    if (
      this.defenses.some(
        (defense) =>
          defense.positionning.type === "onSpot" && defense.positionning.position.spot === spot && defense.positionning.position.lane === lane
      )
    ) {
      throw new Error("A defense is already on this spot.");
    }
    this.defenses.push(new BomberDefense({ lane, spot }));
  }
}
