import { motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import { AiOutlineOrderedList } from 'react-icons/ai'
import { BiCalendar, BiEditAlt, BiFile } from 'react-icons/bi'
import { FaGithub } from 'react-icons/fa'
import { FiMoon, FiTrendingUp } from 'react-icons/fi'
import { HiOutlineMail } from 'react-icons/hi'
import { Button } from '../components/button'

interface HomeProps {
  client: any
}

export default function Home({ client }: HomeProps) {
  const features = [
    {
      name: 'Edit your Grades',
      icon: <BiEditAlt size={22} />,
      description: 'Edit your grades and see how it affects your overall class grade.',
    },
    {
      name: 'Grade Optimizer',
      icon: <FiTrendingUp size={22} />,
      description: 'See the possible ways that you could earn your desired grade in a class.',
    },
    {
      name: 'View your Schedule',
      icon: <BiCalendar size={22} />,
      description: 'View your schedule for all the terms in a year.',
    },
    {
      name: 'Check your Attendance',
      icon: <AiOutlineOrderedList size={22} />,
      description: 'Check if you were tardy or absent and view totals per period in a bar graph.',
    },
    {
      name: 'View Documents',
      icon: <BiFile size={22} />,
      description: 'Look at and download transcripts, report cards, and other documents.',
    },
    {
      name: 'Dark Mode',
      icon: <FiMoon size={22} />,
      description: 'Dark mode is available for all pages. It can be toggled on the Top Bar.',
    },
  ]

  return (
    <div className="relative min-h-svh overflow-hidden bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(24,24,27,0.08),transparent_34%),radial-gradient(circle_at_top_right,rgba(24,24,27,0.05),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent_24%)]" />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Head>
          <title>Grade Melon</title>
        </Head>

        <div className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm shadow-zinc-950/5 backdrop-blur sm:p-8 dark:border-white/10 dark:bg-zinc-900/80 dark:shadow-black/20">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <motion.h1
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-4 text-5xl font-semibold tracking-tight text-zinc-950 md:text-6xl dark:text-white"
              >
                Grade Melon
              </motion.h1>
              <motion.p
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="mb-4 text-2xl font-medium text-zinc-700 md:text-3xl dark:text-zinc-300"
              >
                Stay in control of your grades.
              </motion.p>
              <motion.p
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-8 max-w-2xl text-base text-zinc-600 md:text-lg dark:text-zinc-400"
              >
                Grade Melon is an all new third party alternative to help you stay in control of your grades. It allows
                any student using StudentVue to login to check their schedule and calculate their grades.
              </motion.p>

              <motion.div
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-wrap gap-3"
              >
                <Button href="/login">Get Started</Button>
                <Button href="https://github.com/Themightypotato/GradeMelon2/" target="blank" outline>
                  <div className="flex items-center gap-2">
                    <FaGithub size={'1rem'} /> Source
                  </div>
                </Button>
              </motion.div>
            </div>
            <div className="hidden lg:col-span-5 lg:block">
              <motion.img
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="h-96 w-full rounded-2xl border border-zinc-200 bg-zinc-100 p-8 dark:border-white/10 dark:bg-zinc-900"
                src="/assets/herolight.svg"
                alt="mockup"
              />
            </div>
          </div>

          <div className="py-12">
            <motion.h2
              initial={{ x: 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-8 text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl dark:text-white"
            >
              Features
            </motion.h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map(({ name, icon, description }, i) => (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.5 + i * 0.1,
                    duration: 0.5,
                  }}
                  key={i}
                  className="rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm shadow-zinc-950/5 dark:border-white/10 dark:bg-zinc-900/80"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                    {icon}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">{name}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="mt-4 rounded-2xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm shadow-zinc-950/5 md:mt-0 dark:border-white/10 dark:bg-zinc-900/80">
              <motion.h2
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="mb-3 text-2xl font-semibold text-zinc-900 dark:text-white"
              >
                Open Source
              </motion.h2>
              <motion.p
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="mb-4 text-zinc-600 dark:text-zinc-400"
              >
                Grade Melon is almost completely open source! You can find the source code on our Github. We are
                commited to maintain transparency with our users.
              </motion.p>
              <motion.div
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.5 }}
              >
                <Button href="https://github.com/Themightypotato/GradeMelon2/" target="blank">
                  <div className="flex items-center gap-2">
                    <FaGithub size={'1.3rem'} /> Github Repository
                  </div>
                </Button>
              </motion.div>
            </div>
            <motion.img
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="hidden h-80 w-full rounded-2xl border border-zinc-200 bg-zinc-100 p-8 md:block dark:border-white/10 dark:bg-zinc-900"
              src="/assets/opensourcelight.svg"
              alt="Open Source"
            />
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm shadow-zinc-950/5 dark:border-white/10 dark:bg-zinc-900/80">
              <motion.h2
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                className="text-2xl font-semibold text-zinc-900 dark:text-white"
              >
                Advertising
              </motion.h2>
              <motion.p
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="py-3 text-zinc-600 dark:text-zinc-400"
              >
                Want to advertise on Grademelon? Visit <a>https://adverts.grademelon.org</a> to learn more
              </motion.p>
              <motion.div
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.5 }}
              >
                <Button href="https://adverts.grademelon.org/" outline>
                  Ads
                </Button>
              </motion.div>
            </div>
            <div className="rounded-2xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm shadow-zinc-950/5 dark:border-white/10 dark:bg-zinc-900/80">
              <motion.h2
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                className="text-2xl font-semibold text-zinc-900 dark:text-white"
              >
                FAQ
              </motion.h2>
              <motion.p
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="py-3 text-zinc-600 dark:text-zinc-400"
              >
                Have questions? Check out our FAQ page for answers to common questions.
              </motion.p>
              <motion.div
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.5 }}
              >
                <Button href="/faq" outline>
                  FAQ
                </Button>
              </motion.div>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm shadow-zinc-950/5 dark:border-white/10 dark:bg-zinc-900/80">
            <motion.h2
              initial={{ x: 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.7, duration: 0.5 }}
              className="text-2xl font-semibold text-zinc-900 dark:text-white"
            >
              Contact
            </motion.h2>
            <motion.p
              initial={{ x: 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.5 }}
              className="pt-3 text-zinc-600 dark:text-zinc-400"
            >
              If you have bug reports/suggestions, feel free to contact us by sending an email!
            </motion.p>
            <Link href="mailto:support@grademelon.org">
              <motion.p
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.9, duration: 0.5 }}
                className="flex items-center gap-2 py-3 font-semibold text-zinc-800 dark:text-zinc-200"
              >
                <HiOutlineMail size="1.3rem" /> support@grademelon.org
              </motion.p>
            </Link>
            <Link href="/grades?guest=true" style={{ display: 'none' }}>
              Login As Guest
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
