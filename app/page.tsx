import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-[url('/images/space_bg.png')] bg-cover bg-center h-screen flex items-center justify-center pt-16">
      <Link href="/play">
        <Button className="text-3xl font-bold p-10">Jouer</Button>
      </Link>
    </main>
  );
}
