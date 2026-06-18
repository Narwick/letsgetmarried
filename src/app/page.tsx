import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-6 text-center">
      <h1 className="max-w-2xl text-4xl font-light tracking-wide text-stone-800 sm:text-5xl">
        O site do seu casamento, do jeito que vocês sonharam
      </h1>
      <p className="mt-5 max-w-xl text-stone-600">
        Conte a história de vocês, divulgue o save the date, monte a lista de presentes e
        receba contribuições para a lua de mel — tudo em uma página linda para compartilhar
        com os convidados.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-pink-600 px-6 py-3 font-medium text-white hover:bg-pink-700"
        >
          Criar meu site
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-stone-300 px-6 py-3 font-medium text-stone-700 hover:bg-white"
        >
          Já tenho conta
        </Link>
      </div>
      <p className="mt-10 text-sm text-stone-400">
        Pague uma vez, seu site fica no ar por 1 ano.
      </p>
    </main>
  );
}
