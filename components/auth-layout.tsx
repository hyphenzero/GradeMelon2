import type React from 'react'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(24,24,27,0.08),transparent_34%),radial-gradient(circle_at_top_right,rgba(24,24,27,0.05),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent_24%)]" />
      <div className="relative flex grow items-center justify-center p-4 sm:p-6 lg:p-10">{children}</div>
    </main>
  )
}
