import type React from 'react'

export function PageShell({ className, children, ...props }: React.ComponentPropsWithoutRef<'main'>) {
  return (
    <main
      {...props}
      className={`relative min-h-svh overflow-hidden bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white ${className ?? ''}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(24,24,27,0.08),transparent_34%),radial-gradient(circle_at_top_right,rgba(24,24,27,0.05),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent_24%)]" />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
    </main>
  )
}

export function PageSurface({ className, children, ...props }: React.ComponentPropsWithoutRef<'section'>) {
  return (
    <section
      {...props}
      className={`rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm shadow-zinc-950/5 backdrop-blur sm:p-8 dark:border-white/10 dark:bg-zinc-900/80 dark:shadow-black/20 ${className ?? ''}`}
    >
      {children}
    </section>
  )
}
