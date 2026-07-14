const trustFacts = [
  { label: "AUTHENTICITY", value: "100% genuine devices" },
  { label: "RETURNS", value: "30-day return window" },
  { label: "DELIVERY", value: "15-day standard delivery" },
  { label: "WARRANTY", value: "1-year manufacturer warranty" },
]

export function Hero() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 py-20 md:flex-row md:py-28">
      <div className="flex-1">
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-semibold tracking-tight text-zinc-950 md:text-5xl">
          Phones and laptops,
          <br />
          picked with intent.
        </h1>
        <p className="mt-5 max-w-md text-base text-zinc-600">
          Every device on Apex Gadgets comes with real specs, honest pricing, and support
          that actually answers your questions, not a script.
        </p>
        <div className="mt-8 flex gap-3">
          <a
            href="#phones"
            className="rounded-lg bg-indigo-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-800"
          >
            Shop phones
          </a>
          <a
            href="#laptops"
            className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
          >
            Shop laptops
          </a>
        </div>
      </div>

      <div className="w-full flex-1 md:max-w-sm">
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-5 py-3">
            <span className="font-[family-name:var(--font-mono)] text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Why Apex Gadgets
            </span>
          </div>
          <dl className="divide-y divide-zinc-100">
            {trustFacts.map((fact) => (
              <div key={fact.label} className="flex items-center justify-between px-5 py-3">
                <dt className="font-[family-name:var(--font-mono)] text-xs text-zinc-400">
                  {fact.label}
                </dt>
                <dd className="text-sm font-medium text-zinc-900">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
