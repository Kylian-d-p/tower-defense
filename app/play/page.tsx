export default function Play() {
  return (
    <main className="bg-[url('/images/space_bg.png')] bg-cover bg-center h-screen flex items-center justify-center pt-16">
      <div className="p-5 w-full h-full">
        <div className="grid grid-cols-[2fr,1fr] gap-4 h-full w-full">
          <div className="bg-background/30 backdrop-blur-lg rounded-lg"></div>
          <div className="bg-background/30 backdrop-blur-lg rounded-lg"></div>
        </div>
      </div>
    </main>
  )
}