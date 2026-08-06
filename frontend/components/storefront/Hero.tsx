const trustFacts = [
  { label: "AUTHENTICITY", value: "100% genuine devices" },
  { label: "RETURNS", value: "30-day return window" },
  { label: "DELIVERY", value: "15-day standard delivery" },
  { label: "WARRANTY", value: "1-year manufacturer warranty" },
]

export function Hero() {
  return (
    <section className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 overflow-hidden px-6 py-20 md:flex-row md:py-28">
      <div
        className="pointer-events-none absolute -right-40 -top-32 -z-10 h-[480px] w-[480px] rounded-full opacity-70 blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(67,56,202,0.12) 0%, rgba(6,182,212,0.07) 45%, transparent 70%)",
        }}
      />

      <div className="flex-1">
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 font-[family-name:var(--font-mono)] text-[11px] font-semibold tracking-wide text-indigo-700">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_0_3px_rgba(6,182,212,0.2)]" />
          SUPPORT POWERED BY AI, ACTUALLY HELPFUL
        </div>

        <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold tracking-tight text-zinc-950 md:text-5xl">
          Phones and laptops,
          <br />
          <span className="bg-gradient-to-br from-indigo-700 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
            picked with intent.
          </span>
        </h1>
        <p className="mt-5 max-w-md text-base text-zinc-600">
          Every device on Apex Gadgets comes with real specs, honest pricing, and support
          that actually answers your questions, not a script.
        </p>
        <div className="mt-8 flex gap-3">
          <a
            href="#phones"
            className="rounded-xl bg-gradient-to-br from-indigo-700 to-indigo-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_-4px_rgba(67,56,202,0.4)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-4px_rgba(67,56,202,0.5)]"
          >
            Shop phones
          </a>
          <a
            href="#laptops"
            className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
          >
            Shop laptops
          </a>
        </div>
      </div>

      <div className="w-full flex-1 md:max-w-sm">
        <div className="rounded-2xl border border-zinc-100 bg-white shadow-[0_20px_50px_-12px_rgba(24,24,27,0.12),0_2px_6px_rgba(24,24,27,0.04)]">
          <div className="rounded-t-2xl border-b border-zinc-100 bg-gradient-to-br from-zinc-50 to-zinc-100 px-5 py-3">
            <span className="font-[family-name:var(--font-mono)] text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Why Apex Gadgets
            </span>
          </div>
          <dl className="divide-y divide-zinc-100">
            {trustFacts.map((fact) => (
              <div key={fact.label} className="flex items-center justify-between px-5 py-3.5">
                <dt className="font-[family-name:var(--font-mono)] text-xs text-zinc-400">
                  {fact.label}
                </dt>
                <dd className="text-sm font-semibold text-zinc-900">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
