import { motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { BsGearWideConnected } from 'react-icons/bs'
import { HiArrowCircleLeft, HiArrowCircleRight } from 'react-icons/hi'
import { TbMathSymbols, TbRefresh } from 'react-icons/tb'
import StudentVue from 'studentvue'
import CustomAd from '../../components/customAd'
import GuestModal from '../../components/guestModal'
import SettingsModal from '../../components/settingsModal'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import {
  Cache,
  calcFinal,
  calculateGPA,
  ordinalSuffix,
  parseDate,
  parseGrades,
  SchoolsListType,
  updateGPA,
} from '../../utils/grades'
import { grades as sample } from '../../utils/sample'

interface GradesProps {
  client: Awaited<ReturnType<typeof StudentVue.login>>['client']
  grades: Cache
  setGrades: (grades: Cache) => void
  mp: number
  setMP: (period: number) => void
  createError: (message: string) => void
  ad: any
  setAd: (ad: any) => void
  setTime: (time: number) => void
  timestamp: number
  width: any
  modalBg: boolean
  setModalBg: (b: boolean) => void
  settingsModal: boolean
  setSettingsModal: (b: boolean) => void
  schoolsList: SchoolsListType[]
  setSchoolsList: any
  schoolIndex: number
  setSchoolIndex: any
  guestLogin: () => void
}

export default function Grades({
  client,
  grades,
  setGrades,
  mp,
  setMP,
  createError,
  ad,
  setAd,
  setTime,
  timestamp,
  width,
  modalBg,
  setModalBg,
  setSettingsModal,
  settingsModal,
  schoolsList,
  setSchoolsList,
  schoolIndex,
  setSchoolIndex,
  guestLogin,
}: GradesProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(!Boolean(grades))

  const [showGuestModal, setShowGuestModal] = useState(false)
  const [defaultView, setDefaultView] = useState('card')
  //const [period, setMP] = useState<number>();
  const [gpaModal, setGpaModal] = useState(false)
  const view = (router.query.view as string) || defaultView

  //@ts-ignore
  const mcps = client?.district == 'https://md-mcps-psv.edupoint.com/Service/PXPCommunication.asmx'
  const isMediumOrLarger = width >= 768

  useEffect(() => {
    setModalBg(true)
  }, [showGuestModal])

  useEffect(() => {
    if (localStorage.getItem('guestModal') != 'true') {
      setShowGuestModal(true)
    }

    if (localStorage.getItem('defaultView') !== null) {
      setDefaultView(localStorage.getItem('defaultView'))
    }
  }, [])

  useEffect(() => {
    if (router.query.view !== undefined) {
      setDefaultView(router.query.view as string)
      localStorage.setItem('defaultView', router.query.view as string)
    }
  }, [router.query.view])

  useEffect(() => {
    try {
      if (client == undefined) {
        guestLogin()
      }
    } catch {
      if (localStorage.getItem('remember') === 'false') {
        console.log('womp womp')
      }
    }
  }, [client])

  function update(p: number, getFresh = false) {
    console.log(p)

    if (true) {
      const m = structuredClone(grades)
      m[mp] = sample[mp]
      setGrades(m)

      return
    }
    setLoading(true)

    if (getFresh) {
      if (grades[0].periods[p].name.toLowerCase().includes('interim') && mcps) {
        var second
        var secondIndex
        client
          .gradebook(p + 1, schoolsList ? schoolsList[schoolIndex].gu : null)
          .then(([res, extra]) => {
            res.gradingScale = extra?.gradingScale
            const parsed = parseGrades(res, grades[0].settings)
            second = parsed
            secondIndex = p + 1
            part2()
          })
          .catch((err) => {
            console.log(err)
            createError(err.message)
            setLoading(false)
          })
      } else {
        client
          .gradebook(p - 1, schoolsList ? schoolsList[schoolIndex].gu : null)
          .then(([res, extra]) => {
            res.gradingScale = extra?.gradingScale
            const parsed = parseGrades(res, grades[0].settings)
            second = parsed
            secondIndex = p - 1
            part2()
          })
          .catch((err) => {
            console.log(err)
            createError(err.message)
            setLoading(false)
          })
      }

      const part2 = () =>
        client
          .gradebook(p, schoolsList ? schoolsList[schoolIndex].gu : null)
          .then(([res, extra]) => {
            res.gradingScale = extra?.gradingScale
            console.log(res)
            const parsed = parseGrades(res, grades[0].settings)
            const temp = structuredClone(grades)
            temp[p] = parsed
            //not rlly done, are we...
            console.log('bazinga', temp[p].courses, grades[p].courses)
            for (let i = 0; i < temp[p].courses.length; i++) {
              temp[p].courses[i].settings = grades[p].courses[i].settings
            }

            if (second) {
              temp[secondIndex] = second
              for (let i = 0; i < temp[secondIndex].courses.length; i++) {
                temp[secondIndex].courses[i].settings = grades[secondIndex].courses[i].settings
              }
            }
            setGrades(temp)
            setMP(p)
            setLoading(false)
          })
          .catch((err) => {
            console.log(err)
            createError(err.message)
            setLoading(false)
          })
    } else {
      setMP(p)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (gpaModal) {
      //@ts-ignore
      const clone = structuredClone(grades)
      clone[mp] = calculateGPA(grades?.[mp])
      setGrades(clone)
    }
  }, [gpaModal])

  const changeWeights = (e, i: number) => {
    //@ts-ignore
    const clone = structuredClone(grades)
    clone[mp] = updateGPA(clone[mp], i, e.target.checked)
    setGrades(clone)
  }

  useEffect(() => {
    //	console.log("surely there is a better way to force re-renders on changes to ad")
  }, [ad])

  const interimWiseComparison = (cat1, cat2) => {
    cat1 = structuredClone(cat1)
    cat2 = structuredClone(cat2)
    if (grades[0].periods[cat1.mp].name.toLowerCase().includes('interim')) {
      cat1.mp += 1
    }
    if (grades[0].periods[cat2.mp].name.toLowerCase().includes('interim')) {
      cat2.mp += 1
    }
    return cat1.mp == cat2.mp
  }

  const hasFinals = grades?.[mp]?.courses.some((course) => course.settings.finals.show)

  const hasSemester = grades?.[mp]?.courses.some(({ settings }) => {
    if (!settings?.finals?.isSemester) {
      const semesters = settings?.finals?.semesters
      const semCats = semesters.map((semester) => semester.categories)
      var indexX = semCats.findIndex((categories) =>
        categories.some((category) => interimWiseComparison(category, { mp: mp }))
      )
      return indexX != -1
    }
  })

  function switchSchool(increment) {
    if ((schoolIndex == 0 && increment < 0) || (schoolIndex == schoolsList.length - 1 && increment > 0)) {
      return
    } else {
      const index = schoolIndex + increment
      const school = schoolsList[index]
      const listCopy = structuredClone(schoolsList)
      listCopy[schoolIndex].cache = structuredClone(grades)
      listCopy[schoolIndex].mp = mp
      setSchoolsList(listCopy)
      setGrades(school.cache)
      setMP(school.mp)
      setSchoolIndex(index)
    }
  }

  return (
    <motion.div className="p-5 md:flex-1 md:p-10">
      <Head>
        <title>Gradebook - Grade Melon</title>
      </Head>
      <GuestModal showModal={showGuestModal} setShowModal={setShowGuestModal} />
      {
        <Modal show={gpaModal} onClose={() => setGpaModal(false)}>
          <Modal.Header>GPA Calculator</Modal.Header>
          <Modal.Body>
            <p className="text-xl font-bold dark:text-white">GPA: {grades?.[mp]?.gpa.toFixed(2)}</p>
            <p className="pb-5 text-xl font-bold dark:text-white">WGPA: {grades?.[mp]?.wgpa.toFixed(2)}</p>

            <p className="text-xl font-bold dark:text-white">Weighted?</p>
            {grades?.[mp]?.courses.map((course, i) => (
              <div className="flex items-center gap-2 pt-2" key={i}>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={course?.weighted}
                    className="peer sr-only"
                    onChange={(e) => changeWeights(e, i)}
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-zinc-900 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-zinc-300 dark:border-gray-600 dark:bg-gray-600 dark:peer-focus:ring-zinc-800"></div>
                </label>
                <p className="text-md md:text-lg dark:text-white">{course?.name}</p>
              </div>
            ))}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-2">
              <button
                onClick={() => setGpaModal(false)}
                className="rounded-lg bg-gray-500 px-2.5 py-2.5 text-center text-xs font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 sm:text-sm dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
              >
                Close
              </button>
            </div>
          </Modal.Footer>
        </Modal>
      }

      {loading ? (
        <div className="flex justify-center">
          <Spinner size="xl" color="pink" />
        </div>
      ) : (
        <div className="md:max-w-max">
          <SettingsModal
            client={client}
            index={-1}
            showModal={settingsModal}
            setShowModal={(bool) => {
              setSettingsModal(bool)
              setModalBg(bool)
            }}
            grades={grades}
            setGrades={setGrades}
            mp={mp}
            createError={createError}
            isMediumOrLarger={isMediumOrLarger}
          />

          {!loading && schoolsList && (
            <div className="flex w-full flex-shrink justify-between pb-3 md:-mt-9">
              <button
                disabled={schoolIndex == 0}
                className="text-lg disabled:opacity-50 dark:text-white disabled:dark:opacity-50"
                onClick={() => switchSchool(-1)}
              >
                <HiArrowCircleLeft size={25} />
              </button>
              <p className="truncate text-ellipsis px-2 font-semibold dark:text-white">
                {schoolsList[schoolIndex].name}
              </p>
              <button
                disabled={schoolIndex == schoolsList.length - 1}
                className="text-lg disabled:opacity-50 dark:text-white disabled:dark:opacity-50"
                onClick={() => switchSchool(1)}
              >
                <HiArrowCircleRight size={25} />
              </button>
            </div>
          )}

          <div style={{}} className="mb-5 flex gap-2">
            <button
              type="button"
              onClick={() => update(mp, true)}
              className="rounded-lg border border-gray-300 bg-white p-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
            >
              <TbRefresh size={'1.3rem'} />
            </button>
            <select
              id="periods"
              onChange={(e) => update(parseInt(e.target.value))}
              value={mp}
              className="block w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 focus:border-zinc-700 focus:ring-zinc-700 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-zinc-700 dark:focus:ring-zinc-700"
            >
              {grades[mp]?.periods.map((period) => {
                console.log('wtf', period)
                return (
                  <option
                    value={period.index}
                    key={period.index} //
                  >
                    {`${period.name} (${parseDate(period.date)})`}
                  </option>
                )
              })}
            </select>

            <button
              type="button"
              onClick={() => setGpaModal(true)}
              style={{ alignSelf: 'center' }}
              className="max-h-min rounded-lg border border-zinc-700 bg-zinc-700 px-2.5 py-2 font-medium text-white hover:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:ring-zinc-500"
            >
              <TbMathSymbols size={'1.3rem'} />
            </button>

            {!isMediumOrLarger && (
              <button
                onClick={() => {
                  setSettingsModal(true)
                  setModalBg(true)
                }}
              >
                <BsGearWideConnected
                  className="text-gray-600 hover:text-gray-400 md:text-3xl dark:text-gray-200 dark:hover:text-gray-400"
                  size={30}
                />
              </button>
            )}
          </div>
          {view === 'card' && (
            <div
              className="2col:grid-cols-2 3col:grid-cols-3 4col:grid-cols-4 mx-1 grid justify-items-center gap-5" //so if u decide the margin is fugly, just get rid of mx-1 and put back items-stretch and w-full
              //style={{ gridTemplateColumns: "repeat(auto-fit, 384px)" }}
            >
              {(() => {
                const temp = structuredClone(grades)
                if (temp?.[mp]?.courses && ad && client.username != '10016976' && !isMediumOrLarger) {
                  //disalbe for [name redacted] cuz i aint buildin a subscription service rn gang
                  console.log('is my life real?')
                  //@ts-ignore
                  temp?.[mp].courses.splice(Math.floor(temp?.[mp].courses.length / 2), 0, { name: 'ad goes here' })
                }

                return temp?.[mp]?.courses.map(({ name, period, grade, teacher, settings, layoutID }, i) => {
                  if (name == 'ad goes here') {
                    return (
                      <div key={i} className="flex max-h-64 shrink justify-center">
                        <CustomAd timestamp={timestamp} setTime={setTime} ad={ad} setAd={setAd} />
                      </div>
                    )
                  }
                  var semesterGrade
                  if (!settings?.finals?.isSemester) {
                    var finalGrade = settings?.finals?.show ? calcFinal(settings.finals.categories, grades) : undefined
                    const semesters = settings?.finals?.semesters
                    const semCats = semesters.map((semester) => semester.categories)
                    var indexX = semCats.findIndex((categories) =>
                      categories.some((category) => interimWiseComparison(category, { mp: mp }))
                    )
                    semesterGrade =
                      indexX != -1
                        ? settings?.finals?.semesters[indexX].show
                          ? calcFinal(settings?.finals?.semesters[indexX].categories, grades)
                          : undefined
                        : undefined
                  } else {
                    finalGrade = undefined
                    indexX = settings.finals.semesters.findIndex((semester) => semester != undefined)
                    const semester = settings?.finals?.semesters[indexX]
                    const isNow = semester.categories.some((category) => interimWiseComparison(category, { mp: mp }))
                    semesterGrade = isNow ? calcFinal(semester.categories, grades) : undefined
                  }

                  return (
                    <div className="mx-2 flex w-full justify-center md:w-96" key={i}>
                      <motion.div
                        layout="preserve-aspect"
                        layoutId={`card-${layoutID}`}
                        className="flex h-full w-full max-w-sm flex-col justify-between gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-md sm:p-6 md:gap-5 dark:border-gray-700 dark:bg-gray-800"
                      >
                        <div className="">
                          <Link href={`/guest/${layoutID}`} legacyBehavior>
                            <div className="hover:cursor-pointer">
                              <h5 className="font-semibold tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                <p className="font-bold">
                                  {period} -{' '}
                                  <motion.span layout layoutId={`name-${layoutID}`} className="font-semibold">
                                    {name}
                                  </motion.span>
                                </p>
                              </h5>
                              <motion.p
                                layoutId={`teacher-${layoutID}`}
                                layout
                                className="text-md tracking-tight text-gray-900 dark:text-white"
                              >
                                {teacher.name}
                              </motion.p>
                            </div>
                          </Link>
                        </div>
                        <div className="">
                          <div className="flex items-center justify-between">
                            <div className="flex-col">
                              <motion.span
                                layoutId={`grade-${layoutID}`}
                                layout="preserve-aspect"
                                style={{ color: grade.color.includes('#') && grade.color }}
                                className={`text-xl font-bold md:text-3xl text-${grade.color}-400`}
                              >
                                {grade.letter}
                                {settings
                                  ? !isNaN(grade.raw) && ` (${grade.raw}%)`
                                  : !isNaN(grade.raw)
                                    ? `${grade.raw}%`
                                    : ''}
                              </motion.span>
                              {settings.finals?.show && finalGrade && (
                                <motion.div
                                  layoutId={`final-${layoutID}`}
                                  layout="preserve-aspect"
                                  style={{ color: finalGrade.color.includes('#') && finalGrade.color }}
                                  className={`text-md font-bold md:text-xl text-${finalGrade.color}-400`}
                                >
                                  Final, {finalGrade.letter}{' '}
                                  {!isNaN(finalGrade.raw)
                                    ? `(${settings.rounding.percent ? finalGrade.raw.toFixed(settings.rounding.percentPlaces) : finalGrade.raw}%)`
                                    : ''}
                                </motion.div>
                              )}
                              {semesterGrade && (
                                <motion.div
                                  layoutId={`semester-${layoutID}`}
                                  layout="preserve-aspect"
                                  style={{ color: semesterGrade.color.includes('#') && semesterGrade.color }}
                                  className={`text-md font-bold md:text-xl text-${semesterGrade.color}-400`}
                                >
                                  {!settings?.finals?.isSemester && ordinalSuffix(indexX + 1)} Semester,{' '}
                                  {semesterGrade.letter}{' '}
                                  {!isNaN(semesterGrade.raw)
                                    ? `(${settings.rounding.percent ? semesterGrade.raw.toFixed(settings.rounding.percentPlaces) : semesterGrade.raw}%)`
                                    : ''}
                                </motion.div>
                              )}
                            </div>

                            <Link href={`/guest/${layoutID}`} legacyBehavior>
                              <button className="rounded-lg bg-zinc-700 px-5 py-2.5 text-center text-xs font-medium text-white hover:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-300 sm:text-sm dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800">
                                View
                              </button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )
                })
              })()}
            </div>
          )}
          {view === 'table' && (
            <div className="-md max-w-max overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
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
                      Teacher
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Grade
                    </th>
                    {hasFinals && (
                      <th scope="col" className="px-6 py-3">
                        Final
                      </th>
                    )}
                    {hasSemester && (
                      <th scope="col" className="px-6 py-3">
                        Semester
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {grades?.[mp]?.courses.map(({ name, period, grade, teacher, settings }, i) => {
                    var semesterGrade
                    if (!settings?.finals?.isSemester) {
                      var finalGrade = settings?.finals?.show
                        ? calcFinal(settings.finals.categories, grades)
                        : undefined
                      const semesters = settings?.finals?.semesters
                      const semCats = semesters.map((semester) => semester.categories)
                      var indexX = semCats.findIndex((categories) =>
                        categories.some((category) => interimWiseComparison(category, { mp: mp }))
                      )
                      semesterGrade =
                        indexX != -1
                          ? settings?.finals?.semesters[indexX].show || true
                            ? calcFinal(settings?.finals?.semesters[indexX].categories, grades)
                            : undefined
                          : undefined
                    } else {
                      finalGrade = undefined
                      indexX = settings.finals.semesters.findIndex((semester) => semester != undefined)
                      const semester = settings?.finals?.semesters[indexX]
                      const isNow = semester.categories.some((category) => interimWiseComparison(category, { mp: mp }))
                      semesterGrade = isNow ? calcFinal(semester.categories, grades) : undefined
                    }

                    return (
                      <tr
                        className={`bg-${i % 2 == 0 ? 'white' : 'gray-50'} border-b dark:bg-gray-${
                          i % 2 == 0 ? 900 : 800
                        } dark:border-gray-700`}
                        key={i}
                      >
                        <td
                          scope="row"
                          className="whitespace-nowrap py-4 pl-6 font-medium text-gray-900 dark:text-white"
                        >
                          {period}
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/guest/${i}`} legacyBehavior>
                            {name}
                          </Link>
                        </td>
                        <td className="px-6 py-4">{teacher.name}</td>
                        <td className="px-6 py-4">
                          <span
                            style={{ color: grade.color.includes('#') && grade.color }}
                            className={`font-bold text-${grade.color}-400`}
                          >
                            {grade.letter}
                            {!isNaN(grade.raw) && ` (${grade.raw}%)`}
                          </span>
                        </td>
                        {hasFinals && (
                          <td className="px-6 py-4">
                            {finalGrade ? (
                              <span
                                style={{ color: finalGrade.color.includes('#') && finalGrade.color }}
                                className={`font-bold text-${finalGrade.color}-400`}
                              >
                                {finalGrade.letter}
                                {!isNaN(finalGrade.raw) && ` (${finalGrade.raw}%)`}
                              </span>
                            ) : (
                              <p>N/A</p>
                            )}
                          </td>
                        )}
                        {hasSemester && (
                          <td className="px-6 py-4">
                            {semesterGrade ? (
                              <span
                                style={{ color: semesterGrade.color.includes('#') && semesterGrade.color }}
                                className={`font-bold text-${semesterGrade.color}-400`}
                              >
                                {semesterGrade.letter}
                                {!isNaN(semesterGrade.raw) && ` (${semesterGrade.raw}%)`}
                              </span>
                            ) : (
                              <p>N/A</p>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
