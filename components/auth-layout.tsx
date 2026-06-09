import type React from 'react'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col bg-zinc-50 p-2 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <div className="flex grow items-center justify-center p-6 lg:rounded-lg lg:bg-white lg:p-10 lg:shadow-sm lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
        {children}
      </div>
    </main>
  )
}
