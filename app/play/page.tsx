import PlayGame from "./game";

export default function Play() {
  return (
    <main className="bg-[url('/images/space_bg.png')] bg-cover bg-center h-screen flex items-center justify-center pt-16">
      <div className="p-5 w-full h-full">
        <div className="grid grid-cols-[2fr,1fr] gap-4 h-full w-full max-w-5xl mx-auto">
          <PlayGame />
        </div>
      </div>
    </main>
  );
}
