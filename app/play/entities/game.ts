import { DefenseType } from "./defense";

export class Game {
  defenses: DefenseType[];

  constructor(defenses: DefenseType[]) {
    this.defenses = defenses;
  }
}
