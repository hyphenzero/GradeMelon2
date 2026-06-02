import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Heading } from '../components/heading'
import { PageShell, PageSurface } from '../components/page-shell'
import { Text } from '../components/text'
import Spinner from '../components/ui/Spinner'

interface ScheduleProps {
  client: any
  createError: (message: string) => void
}

export default function Schedule({ client, createError }: ScheduleProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [schedule, setSchedule] = useState<any>()
  const [term, setTerm] = useState<any>()
  const [today, setToday] = useState<boolean>(true)

  function update(e) {
    if (client.guest) {
      if (e.target.value == 'today') {
        setToday(true)
        setTerm('today')
      } else {
        setToday(false)
        setTerm(parseInt(e.target.value))
      }
      return
    }

    console.log(e.target.value)
    if (e.target.value == 'today') {
      setToday(true)
      setTerm('today')
    } else {
      delete client.loadedSchedule
      setToday(false)
      setTerm(parseInt(e.target.value))
    }
  }
  useEffect(() => {
    try {
      if (!client.loadedSchedule && term != 'today') {
        setLoading(true)
        client
          .schedule(term)
          .then(([res]) => {
            client.loadedSchedule = res
            console.log('schedule is here', res)
            setSchedule(res)
            if (res.today === false) {
              setToday(false)
              setTerm(res.termIndex)
            }

            setLoading(false)
          })
          .catch((err) => {
            createError(err.message)
            console.log(err, term, today)
          })
      } else {
        console.log(today, term)
        setSchedule(client.loadedSchedule)
        if (client.loadedSchedule.today === false) {
          setToday(false)
          setTerm(client.loadedSchedule.termIndex)
        } else {
          setToday(true)
        }
        setLoading(false)
      }
    } catch {
      if (localStorage.getItem('remember') === 'false') {
        console.log('womp womp')
      }
    }
  }, [client, term])

  function matchName(todayClass) {
    //wont work for concurrent schools
    const name = todayClass.name
    const period = parseInt(todayClass.period)
    const matchedIndex = schedule.mainClasses.findIndex((course) => parseInt(course.period) == period)
    return matchedIndex != -1 ? schedule.mainClasses[matchedIndex].name : todayClass.name
  }

  return (
    <PageShell>
      <Head>
        <title>Schedule - Grade Melon</title>
      </Head>
      {loading ? (
        <div className="flex justify-center">
          <Spinner size="xl" color="pink" />
        </div>
      ) : (
        <PageSurface>
          <Heading level={1} className="mb-2">
            Schedule
          </Heading>
          <Text className="mb-6">Switch terms and view daily classes or the full marking period schedule.</Text>
          <div className="max-w-max">
            <select
              id="periods"
              value={today ? 'today' : term}
              onChange={(e) => update(e)}
              className="mb-5 block h-11 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 focus:border-zinc-700 focus:ring-zinc-700 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-zinc-700 dark:focus:ring-zinc-700"
            >
              {schedule.today && (
                <option key={0} value={'today'}>
                  Today
                </option>
              )}
              {schedule?.terms.map((term) => (
                <option key={term.termIndex + 1} value={term.termIndex}>
                  {term.termName}
                </option>
              ))}
            </select>
          </div>

          {!schedule.conClasses && !today && (
            <div className="max-w-max overflow-x-auto rounded-lg border border-gray-200 shadow-md dark:border-gray-700">
              <table className="text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="py-3 pl-6">
                      Period
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Course Name
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Room
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Teacher
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.mainClasses.map(({ period, name, room, teacher }, i) => (
                    <tr
                      className={`bg-${i % 2 == 0 ? 'white' : 'gray-50'} border-b dark:bg-gray-${
                        i % 2 == 0 ? 900 : 800
                      } dark:border-gray-700`}
                      key={i}
                    >
                      <th scope="row" className="whitespace-nowrap py-4 pl-6 font-medium text-gray-900 dark:text-white">
                        {period ? period : i}
                      </th>
                      <td className="px-6 py-4">{name}</td>
                      <td className="px-6 py-4">{room}</td>
                      <td className="px-6 py-4">{teacher}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {schedule.conClasses && !today && (
            <div className="max-w-max overflow-x-auto rounded-lg border border-gray-200 shadow-md dark:border-gray-700">
              <table className="text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="py-3 pl-6">
                      Period
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Course Name
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Room
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Teacher
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.mainClasses.map(({ period, name, room, teacher }, i) => (
                    <tr
                      className={`bg-${i % 2 == 0 ? 'white' : 'gray-50'} border-b dark:bg-gray-${
                        i % 2 == 0 ? 900 : 800
                      } dark:border-gray-700`}
                      key={i}
                    >
                      <th scope="row" className="whitespace-nowrap py-4 pl-6 font-medium text-gray-900 dark:text-white">
                        {period ? period : i}
                      </th>
                      <td className="px-6 py-4">{name}</td>
                      <td className="px-6 py-4">{room}</td>
                      <td className="px-6 py-4">{teacher}</td>
                    </tr>
                  ))}
                  <tr>
                    <td
                      className={`bg-${
                        schedule.mainClasses.length % 2 == 0 ? 'white' : 'gray-50'
                      } border-b dark:bg-gray-${
                        schedule.mainClasses.length % 2 == 0 ? 900 : 800
                      } pl-3 text-lg font-bold dark:border-gray-700`}
                      key={schedule.mainClasses.length}
                      colSpan={4}
                    >
                      {schedule.conClasses.conName}:
                    </td>
                  </tr>
                  {schedule.conClasses.map(({ period, name, room, teacher }, i) => {
                    i = i + schedule.mainClasses.length + 1
                    return (
                      <tr
                        className={`bg-${i % 2 == 0 ? 'white' : 'gray-50'} border-b dark:bg-gray-${
                          i % 2 == 0 ? 900 : 800
                        } dark:border-gray-700`}
                        key={i}
                      >
                        <th
                          scope="row"
                          className="whitespace-nowrap py-4 pl-6 font-medium text-gray-900 dark:text-white"
                        >
                          {period ? period : i}
                        </th>
                        <td className="px-6 py-4">{name}</td>
                        <td className="px-6 py-4">{room}</td>
                        <td className="px-6 py-4">{teacher}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {today && (
            <div className="max-w-max overflow-x-auto rounded-lg border border-gray-200 shadow-md dark:border-gray-700">
              <table className="flex-1 text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Time
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Period
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Course Name
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Room
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Teacher
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.today.main.map(({ start, end, period, name, room, teacher }, i) => (
                    <tr
                      className={`bg-${i % 2 == 0 ? 'white' : 'gray-50'} border-b dark:bg-gray-${
                        i % 2 == 0 ? 900 : 800
                      } dark:border-gray-700`}
                      key={i}
                    >
                      <th scope="row" className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {start + ' - ' + end}
                      </th>
                      <td className="px-6 py-4">{period ? period : i}</td>
                      <td className="px-6 py-4">{matchName(schedule.today.main[i])}</td>
                      <td className="px-6 py-4">{room}</td>
                      <td className="px-6 py-4">{teacher}</td>
                    </tr>
                  ))}
                  {schedule.today.con && (
                    <tr>
                      <td
                        className={`bg-${
                          schedule.today.main.length % 2 == 0 ? 'white' : 'gray-50'
                        } border-b dark:bg-gray-${
                          schedule.today.main.length % 2 == 0 ? 900 : 800
                        } pl-3 text-lg font-bold dark:border-gray-700`}
                        key={schedule.today.main.length}
                        colSpan={5}
                      >
                        {schedule.conClasses.conName}:
                      </td>
                    </tr>
                  )}

                  {schedule.today.con &&
                    schedule.today.con.map(({ start, end, period, name, room, teacher }, i) => {
                      i = i + schedule.today.main.length + 1
                      return (
                        <tr
                          className={`bg-${i % 2 == 0 ? 'white' : 'gray-50'} border-b dark:bg-gray-${
                            i % 2 == 0 ? 900 : 800
                          } dark:border-gray-700`}
                          key={i}
                        >
                          <th
                            scope="row"
                            className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
                          >
                            {start + ' - ' + end}
                          </th>
                          <td className="px-6 py-4">{period ? period : i}</td>
                          <td className="px-6 py-4">{name}</td>
                          <td className="px-6 py-4">{room}</td>
                          <td className="px-6 py-4">{teacher}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          )}
        </PageSurface>
      )}
    </PageShell>
  )
}
