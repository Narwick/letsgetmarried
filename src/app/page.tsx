import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <p className="mb-4 text-sm uppercase tracking-[0.3em] text-accent">Nosso Casamento</p>
      <h1 className="max-w-3xl font-serif text-5xl font-medium leading-tight text-foreground sm:text-6xl">
        O site do seu casamento, do jeito que vocês sonharam
      </h1>
      <p className="mt-6 max-w-xl text-muted">
        Conte a história de vocês, divulgue o save the date, monte a lista de presentes e
        receba contribuições para a lua de mel — tudo em uma página linda para compartilhar
        com os convidados.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-4">
        <Link
          href="/login"
          className="rounded-full bg-accent px-7 py-3 font-medium text-white shadow-sm transition hover:bg-accent-hover"
        >
          Criar meu site
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-border bg-surface px-7 py-3 font-medium text-foreground transition hover:border-accent"
        >
          Já tenho conta
        </Link>
      </div>
      <p className="mt-10 text-sm text-muted">
        Pague uma vez, seu site fica no ar por 1 ano.
      </p>
    </main>
  );
}
