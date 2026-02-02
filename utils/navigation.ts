"use client";

import { usePathname, useRouter as useAppRouter, useSearchParams } from "next/navigation";

export function useRouter() {
  const router = useAppRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return {
    ...router,
    pathname,
    query: Object.fromEntries(searchParams.entries()),
    events: {
      on: () => {},
      off: () => {},
    },
    push: (href: string) => router.push(href),
    replace: (href: string) => router.replace(href),
  };
}
