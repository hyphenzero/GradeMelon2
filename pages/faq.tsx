import { useRouter } from 'next/router'
import { Heading } from '../components/heading'
import { PageShell, PageSurface } from '../components/page-shell'
import { Text } from '../components/text'

export default function FAQ() {
  const router = useRouter()
  const view = router.query.refer as string

  return (
    <PageShell>
      <PageSurface>
        <Heading level={1} className="pb-2 text-center text-3xl">
          FAQ & Info
        </Heading>
        <Text className="pb-6 text-center">Find the most common setup and support answers here.</Text>
        <div className="space-y-4">
          <details className="group [&_summary::-webkit-details-marker]:hidden" open={view === 'app'}>
            <summary className="flex cursor-pointer items-center justify-between rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <h2 className="font-medium">Is Grade Melon an App?</h2>

              <svg
                className="ml-1.5 h-5 w-5 shrink-0 transition duration-300 group-open:-rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>

            <p className="mt-4 px-4 leading-relaxed dark:text-white">
              Yes, Grade Melon is a PWA (Progessive Web App). <br />
              To Add Grade Melon to your Home Screen, follow these steps:
            </p>
            <p className="mt-4 px-4 leading-relaxed dark:text-white">
              <span className="flex items-center gap-2">
                Apple iPhone/iPad
                <img className="inline-block h-4" src="/assets/apple.png" />
              </span>
            </p>
            <ul className="list-disc pl-10 dark:text-white">
              <li>Open Grade Melon in Safari</li>
              <li>Click on the Share button in the bottom bar</li>
              <li>Click on &quot;Add to Home Screen&quot;</li>
            </ul>
            <p className="mt-4 px-4 leading-relaxed dark:text-white">
              <span className="flex items-center gap-2">
                Android
                <img className="inline-block h-4" src="/assets/android.png" />
              </span>
            </p>
            <ul className="ml-10 list-disc dark:text-white">
              <li>Open Grade Melon in Chrome</li>
              <li>Click on the 3 dots in the top right corner</li>
              <li>Click on &quot;Add to Home Screen&quot;</li>
            </ul>

            <p className="mt-4 px-4 leading-relaxed dark:text-white">
              <span className="flex items-center gap-2">
                Personal Computer
                <img className="inline-block h-4" src="/assets/pc.png" />
              </span>
            </p>
            <ul className="ml-10 list-disc dark:text-white">
              <li>Open Grade Melon in Chrome</li>
              <li>Click on the 3 dots in the top right corner</li>
              <li>Click on &quot;Install Grade Melon&quot;</li>
            </ul>
          </details>

          <details className="group [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <h2 className="font-medium">How do I send feedback regarding Grade Melon?</h2>

              <svg
                className="ml-1.5 h-5 w-5 shrink-0 transition duration-300 group-open:-rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>

            <p className="mt-4 px-4 leading-relaxed dark:text-white">
              To send feedback regarding Grade Melon, please email{' '}
              <a href="mailto:support@grademelon.org" className="text-zinc-700">
                support@grademelon.org
              </a>
              .
            </p>
            <p className="mt-4 px-4 leading-relaxed dark:text-white">
              Or, feel free to join our{' '}
              <a href="https://discord.gg/nwRs8WcQGc" className="text-zinc-700">
                Discord
              </a>
              !
            </p>
          </details>
          <details className="group [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <h2 className="font-medium">Who&#39;s behind Grade Melon?</h2>

              <svg
                className="ml-1.5 h-5 w-5 shrink-0 transition duration-300 group-open:-rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>

            <p className="mt-4 px-4 leading-relaxed dark:text-white">
              Grade Melon was originally created by Tinu Vanapamula, but in spring of 2024, Synergy made changes that
              broke Grade Melon. As a graduating senior, Tinu had other priorities.
              <br></br>
              My name is Jonathan Shapiro. I was a student at Whitman, and in summer 2024, I took it upon myself to
              restore the project. By September, I had things working again, and I&#39;ve been working on expanding and
              improving it ever since.
              <br></br>
              <br></br>
              You can contact me{' '}
              <a className="text-zinc-700" href="https://instagram.com/j.shap06/">
                @J.shap06
              </a>{' '}
              on my personal insta, or reach out through the Grade Melon discord, insta, etc.
            </p>
          </details>
        </div>
      </PageSurface>
    </PageShell>
  )
}
