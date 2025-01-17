"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import clsx from "clsx";
import { CircleDollarSign, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BomberDefense, TurretDefense } from "./entities/defense";
import { Game } from "./entities/game";

export default function PlayGame() {
  const [game] = useState(
    new Game([new TurretDefense({ lane: 0, spot: 1 }), new TurretDefense({ lane: 1, spot: 1 }), new TurretDefense({ lane: 2, spot: 1 })], [])
  );
  const [, forceUpdate] = useState(0); // Utilisé pour forcer le re-render

  useEffect(() => {
    game.run();
  }, [game]);

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((prev) => prev + 1); // Forcer un re-render
    }, 1000 / 30);

    return () => clearInterval(interval);
  }, [game]);

  return (
    <>
      <div className="grid grid-rows-3 gap-2 p-2 rounded-lg bg-background/30 backdrop-blur-lg h-full w-full">
        {[0, 1, 2].map((lane) => (
          <div key={lane} className="grid grid-cols-[1fr,_100px] gap-4">
            <div className="relative bg-background/60 h-full rounded-lg overflow-hidden">
              {game.enemies
                .filter((enemy) => enemy.position.lane === lane)
                .map((enemy) => (
                  <div
                    className="absolute -translate-x-full -translate-y-1/2"
                    key={enemy.id}
                    style={{ top: `${enemy.position.y}%`, left: `${enemy.position.x}%` }}
                    onClick={() => {
                      enemy.takeDamages(15);
                    }}
                  >
                    <Image src={`/images/spaceships/${enemy.name}.png`} width={50} height={50} alt="Vaisseau" className="w-10 min-w-10 h-10" />
                    <div
                      className="absolute -bottom-2 z-10 left-0 h-1 bg-green-400"
                      style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                    ></div>
                    <div className="absolute -bottom-2 -z-10 left-0 w-full h-1 bg-background"></div>
                  </div>
                ))}
            </div>
            <div className="bg-background/60 rounded-lg grid grid-rows-3 gap-2 p-2">
              {[0, 1, 2].map((spot) => {
                const defense = game.defenses.find(
                  (defense) =>
                    defense.positionning.type === "onSpot" &&
                    defense.positionning.position.spot === spot &&
                    defense.positionning.position.lane === lane
                );

                return (
                  <div
                    key={spot}
                    className={clsx("rounded-lg cursor-pointer transition-colors hover:bg-foreground/10", !defense && "bg-foreground/30")}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-full h-full flex items-center justify-center relative">
                        {!defense ? (
                          <Plus />
                        ) : (
                          <>
                            <Image
                              src={`/images/defenses/${defense.type}.png`}
                              width={50}
                              height={50}
                              alt="Tourelle"
                              className="w-10 min-w-10 h-10"
                            />
                            <div
                              className="absolute rounded-full bottom-0 z-10 left-0 h-1 bg-green-400"
                              style={{ width: `${(defense.health / defense.maxHealth) * 100}%` }}
                            />
                            <div className="absolute rounded-full bottom-0 -z-10 left-0 w-full h-1 bg-background" />
                            <div className="absolute rounded-full top-0 right-0 bg-background w-6 h-6 flex items-center justify-center">
                              {defense.level + 1}
                            </div>
                          </>
                        )}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="*:cursor-pointer *:*:w-full flex flex-col">
                        {!defense ? (
                          <>
                            <DropdownMenuItem
                              disabled={game.money < TurretDefense.prices[0]}
                              onClick={() => {
                                game.addTurret(lane, spot);
                              }}
                            >
                              Ajouter une tourelle (${TurretDefense.prices[0]})
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={game.money < BomberDefense.prices[0]}
                              onClick={() => {
                                game.addBomberDefense(lane, spot);
                              }}
                            >
                              Ajouter un bombardier (${BomberDefense.prices[0]})
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem
                              disabled={game.money < defense.levelUpPrice}
                              onClick={() => {
                                defense.levelUp(game);
                              }}
                            >
                              Améliorer (${defense.levelUpPrice})
                            </DropdownMenuItem>
                            <DropdownMenuItem>Supprimer</DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-background/30 backdrop-blur-lg rounded-lg flex flex-col gap-2 p-5">
        <p>Vague n°{game.wave}</p>
        <p className="flex items-center gap-1">
          Votre argent : {game.money}
          <CircleDollarSign className="w-5 h-5" />
        </p>
      </div>
      <div className=" rounded-full bg-background absolute bottom-0 h-2 w-full" />
      <div className=" rounded-full bg-green-400 absolute bottom-0 h-2" style={{ width: `${(game.health / game.maxHealth) * 100}%` }} />
    </>
  );
}
