export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
        <span className="font-[family-name:var(--font-space-grotesk)] font-semibold text-zinc-700">
          Apex Gadgets
        </span>
        <p>Standard delivery in 15 days. Free shipping on orders over $2,500.</p>
        <p>&copy; {new Date().getFullYear()} Apex Gadgets. All rights reserved.</p>
      </div>
    </footer>
  )
}
