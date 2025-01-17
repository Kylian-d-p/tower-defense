"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import clsx from "clsx";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Game } from "./entities/game";

export default function PlayGame() {
  const [game] = useState(new Game([], []));
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
                      <DropdownMenuTrigger className="w-full h-full flex items-center justify-center">
                        {!defense ? (
                          <Plus />
                        ) : (
                          <Image src={`/images/defenses/${defense.type}.png`} width={50} height={50} alt="Tourelle" className="w-10 min-w-10 h-10" />
                        )}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="*:cursor-pointer *:*:w-full flex flex-col">
                        {!defense ? (
                          <>
                            <DropdownMenuItem
                              onClick={() => {
                                game.addTurret(lane, spot);
                              }}
                            >
                              Ajouter une tourelle
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                game.addBomberDefense(lane, spot);
                              }}
                            >
                              Ajouter un bombardier
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <></>
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
      <div className="bg-background/30 backdrop-blur-lg rounded-lg"></div>
    </>
  );
}
