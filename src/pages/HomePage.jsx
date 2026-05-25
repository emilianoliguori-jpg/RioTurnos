// Landing temporal del root "/". Mientras no haya un directorio de negocios,
// solo muestra una bienvenida y aclaración de uso.

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="font-serif text-teal text-5xl sm:text-6xl md:text-7xl font-light tracking-tight">
          Río Turnos
        </h1>
        <p className="font-sans text-ink text-base sm:text-lg mt-4">
          Tecnología que fluye con tu negocio
        </p>
        <p className="font-sans text-ink/50 text-sm mt-8">
          Esta es la home pública. Para reservar, accedé al link del negocio
          (ej: <code className="text-ink/70">/estudio-bilardo</code>).
        </p>
      </div>
    </main>
  )
}
