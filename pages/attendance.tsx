import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { Heading } from '../components/heading'
import { PageShell, PageSurface } from '../components/page-shell'
import { Text } from '../components/text'
import Spinner from '../components/ui/Spinner'
import { Attendance as AttendanceType, chartOptions, parseBarData, parsePeriods, preSort } from '../utils/attendance'

ChartJS.register(CategoryScale, LinearScale, BarElement, Legend, Title, Tooltip)

interface AttendanceProps {
  client: any
  createError: (message: string) => void
}

export default function Attendance({ client, createError }: AttendanceProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AttendanceType>()
  const [barData, setBarData] = useState<any>()

  useEffect(() => {
    try {
      if (!client.loadedAttendance) {
        client
          .attendance()
          .then(([res]) => {
            res.absences = preSort(res.absences)
            setData(res)
            setLoading(false)
            let temp = parseBarData(res?.absences)
            setBarData(temp)
            client.loadedAttendance = [res, temp]
            console.log(temp)
          })
          .catch((error) => {
            createError(error.message)
          })
      } else {
        setData(client.loadedAttendance[0])
        setBarData(client.loadedAttendance[1])
        setLoading(false)
      }
    } catch {
      if (localStorage.getItem('remember') === 'false') {
        console.log('womp womp')
      }
    }
  }, [client])

  return (
    <PageShell>
      <Head>
        <title>Attendance - Grade Melon</title>
      </Head>
      {loading ? (
        <div className="flex justify-center">
          <Spinner size="xl" color="pink" />
        </div>
      ) : (
        <PageSurface>
          <Heading level={1} className="mb-2">
            Attendance
          </Heading>
          <Text className="mb-6">A quick look at absences and period-level attendance history.</Text>
          <div className="w-full">
            <div className="md:w-2/3 xl:w-1/2">
              <Bar options={chartOptions} data={barData} />
            </div>
            <div className="mt-5 max-w-max overflow-x-auto rounded-lg border border-gray-200 shadow-md dark:border-gray-700">
              <table className="text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="py-3 pl-6">
                      Date
                    </th>
                    {parsePeriods(data?.absences).map((period, i) => (
                      <th key={i} scope="col" className="px-6 py-3">
                        {period}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data?.absences.map((absence, i) => (
                    <tr
                      key={i}
                      className={`bg-${i % 2 == 0 ? 'white' : 'gray-50'} border-b dark:bg-gray-${
                        i % 2 == 0 ? 900 : 800
                      } dark:border-gray-700`}
                    >
                      <th scope="row" className="whitespace-nowrap py-4 pl-6 font-medium text-gray-900 dark:text-white">
                        {absence.date.toLocaleDateString()}
                      </th>

                      {parsePeriods(data?.absences).map((period, x) => (
                        <td
                          key={x}
                          scope="col"
                          className="px-6 py-3"
                          style={{
                            color: barData?.datasets.find(
                              (x) => x.label === absence.periods.find((p) => p.period === parseInt(period))?.name
                            )?.backgroundColor,
                          }}
                        >
                          {absence.periods.find((p) => p.period === parseInt(period))?.name}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </PageSurface>
      )}
    </PageShell>
  )
}
