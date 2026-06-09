import Link from 'next/link'
import { useRouter } from 'next/router'
import { AiOutlineBook, AiOutlineCalendar, AiOutlineOrderedList } from 'react-icons/ai'
import { IoDocumentTextOutline } from 'react-icons/io5'

export default function MobileBar({ client }: any) {
  const router = useRouter()

  const item = (active: boolean) =>
    `flex w-full justify-center p-4 text-zinc-600 dark:text-zinc-300 ${
      active ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100' : ''
    }`

  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white/90 shadow-sm shadow-zinc-950/5 dark:border-white/10 dark:bg-zinc-900/90">
      <label htmlFor="tabs" className="sr-only">
        Select Page
      </label>
      <ul className="flex w-full text-center text-sm font-medium">
        <li className="w-full">
          <Link
            href="/schedule"
            className={`${item(router.pathname === '/schedule')} rounded-l-2xl`}
            aria-current="page"
          >
            <AiOutlineOrderedList className="h-full" size="1.2rem" />
          </Link>
        </li>
        <li className="w-full">
          <Link
            href={client.guest ? '/guest' : '/grades'}
            className={item(router.pathname.includes('/grades') || router.pathname.includes('/guest'))}
          >
            <AiOutlineBook className="h-full" size="1.2rem" />
          </Link>
        </li>
        <li className="w-full">
          <Link href="/attendance" className={item(router.pathname === '/attendance')}>
            <AiOutlineCalendar className="h-full" size="1.2rem" />
          </Link>
        </li>
        <li className="w-full">
          <Link href="/documents" className={`${item(router.pathname === '/documents')} rounded-r-2xl`}>
            <IoDocumentTextOutline className="h-full" size="1.2rem" />
          </Link>
        </li>
      </ul>
    </div>
  )
}
