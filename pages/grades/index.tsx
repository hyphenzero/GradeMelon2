import { motion } from 'framer-motion'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { BsGearWideConnected } from 'react-icons/bs'
import { HiArrowCircleLeft, HiArrowCircleRight } from 'react-icons/hi'
import { TbMathSymbols, TbRefresh } from 'react-icons/tb'
import StudentVue from 'studentvue'
import clsx from 'clsx'
import { Badge } from '../../components/badge'
import { Button } from '../../components/button'
import CustomAd from '../../components/customAd'
import { Divider } from '../../components/divider'
import { Heading, Subheading } from '../../components/heading'
import { PageShell } from '../../components/page-shell'
import { Select } from '../../components/select'
import SettingsModal from '../../components/settingsModal'
import { Stat } from '../../components/stat'
import { Switch } from '../../components/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/table'
import { Strong, Text } from '../../components/text'
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
}: GradesProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(!Boolean(grades))

  const [defaultView, setDefaultView] = useState('card')
  //const [period, setMP] = useState<number>();
  const [gpaModal, setGpaModal] = useState(false)
  const view = (router.query.view as string) || defaultView

  //@ts-ignore
  const mcps = client?.district == 'https://md-mcps-psv.edupoint.com/Service/PXPCommunication.asmx'
  const isMediumOrLarger = width >= 768

  useEffect(() => {
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
    } catch {
      if (localStorage.getItem('remember') === 'false') {
        console.log('womp womp')
      }
    }
  }, [client])

  function update(p: number, getFresh = false) {
    console.log(p)
    //@ts-expect-error
    if (client.guest) {
      const m = structuredClone(grades)
      m[p] = sample[p] ?? m[p]
      setGrades(m)
      setMP(p)

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

  const changeWeights = (checked: boolean, i: number) => {
    //@ts-ignore
    const clone = structuredClone(grades)
    clone[mp] = updateGPA(clone[mp], i, checked)
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

  const getCourseGrades = (settings) => {
    let semesterGrade
    let semesterLabel = 'Semester'
    let finalGrade

    if (!settings?.finals?.isSemester) {
      finalGrade = settings?.finals?.show ? calcFinal(settings.finals.categories, grades) : undefined
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
      semesterLabel = indexX != -1 ? `${ordinalSuffix(indexX + 1)} Semester` : 'Semester'
    } else {
      finalGrade = undefined
      indexX = settings.finals.semesters.findIndex((semester) => semester != undefined)
      const semester = settings?.finals?.semesters[indexX]
      const isNow = semester.categories.some((category) => interimWiseComparison(category, { mp: mp }))
      semesterGrade = isNow ? calcFinal(semester.categories, grades) : undefined
    }

    return { finalGrade, semesterGrade, semesterLabel }
  }

  const formatGrade = (gradeValue, rounding = undefined) => {
    if (!gradeValue) return 'N/A'

    const raw = Number(gradeValue.raw)
    if (Number.isNaN(raw)) {
      return gradeValue.letter
    }

    const percent = rounding?.percent ? raw.toFixed(rounding.percentPlaces) : gradeValue.raw
    return `${gradeValue.letter} (${percent}%)`
  }

  const gradeTone = (gradeValue): React.ComponentProps<typeof Badge>['color'] => {
    const raw = Number(gradeValue?.raw)

    if (Number.isNaN(raw)) return 'zinc'
    if (raw >= 90) return 'emerald'
    if (raw >= 80) return 'sky'
    if (raw >= 70) return 'amber'
    if (raw >= 60) return 'orange'
    return 'red'
  }

  const gradeTextClass = (gradeValue) =>
    clsx({
      'text-zinc-700 dark:text-zinc-300': gradeTone(gradeValue) === 'zinc',
      'text-emerald-700 dark:text-emerald-300': gradeTone(gradeValue) === 'emerald',
      'text-sky-700 dark:text-sky-300': gradeTone(gradeValue) === 'sky',
      'text-amber-700 dark:text-amber-300': gradeTone(gradeValue) === 'amber',
      'text-orange-700 dark:text-orange-300': gradeTone(gradeValue) === 'orange',
      'text-red-700 dark:text-red-300': gradeTone(gradeValue) === 'red',
    })

  const rawGrades = grades?.[mp]?.courses
    .map((course) => Number(course.grade.raw))
    .filter((raw) => !Number.isNaN(raw))
  const averageGrade =
    rawGrades?.length > 0 ? `${(rawGrades.reduce((total, raw) => total + raw, 0) / rawGrades.length).toFixed(1)}%` : 'N/A'
  const currentPeriod = grades?.[mp]?.periods.find((period) => period.index === mp) ?? grades?.[mp]?.periods[mp]
  const detailBasePath = router.pathname.includes('/guest') ? '/guest' : '/grades'

  return (
    <PageShell>
      <motion.div>
        <Head>
          <title>Gradebook - Grade Melon</title>
        </Head>
        {
          <Modal show={gpaModal} onClose={() => setGpaModal(false)}>
            <Modal.Header>GPA Calculator</Modal.Header>
            <Modal.Body>
              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-zinc-950/10 p-3 dark:border-white/10">
                  <Text>GPA</Text>
                  <Strong className="text-2xl">{grades?.[mp]?.gpa.toFixed(2)}</Strong>
                </div>
                <div className="rounded-lg border border-zinc-950/10 p-3 dark:border-white/10">
                  <Text>WGPA</Text>
                  <Strong className="text-2xl">{grades?.[mp]?.wgpa.toFixed(2)}</Strong>
                </div>
              </div>

              <Heading level={2} className="mb-3 text-base/7">
                Weighted courses
              </Heading>
              {grades?.[mp]?.courses.map((course, i) => (
                <div
                  className="flex items-center justify-between gap-4 border-t border-zinc-950/5 py-3 first:border-t-0 dark:border-white/10"
                  key={i}
                >
                  <Text className="text-zinc-900 dark:text-white">{course?.name}</Text>
                  <Switch checked={course?.weighted} onChange={(checked) => changeWeights(checked, i)} />
                </div>
              ))}
            </Modal.Body>
            <Modal.Footer>
              <div className="flex gap-2">
                <Button type="button" onClick={() => setGpaModal(false)} outline>
                  Close
                </Button>
              </div>
            </Modal.Footer>
          </Modal>
        }

        {loading ? (
          <div className="flex justify-center">
            <Spinner size="xl" color="pink" />
          </div>
        ) : (
          <>
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

            <Heading>Gradebook</Heading>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <Subheading>Overview</Subheading>
              <Select id="periods" onChange={(e) => update(parseInt(e.target.value))} value={mp} className="sm:w-80">
                {grades[mp]?.periods.map((period) => (
                  <option value={period.index} key={period.index}>
                    {`${period.name} (${parseDate(period.date)})`}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
              <Stat title="Courses" value={`${grades?.[mp]?.courses.length ?? 0}`} change="Current" />
              <Stat title="GPA" value={grades?.[mp]?.gpa !== undefined ? grades[mp].gpa.toFixed(2) : 'N/A'} />
              <Stat title="Weighted GPA" value={grades?.[mp]?.wgpa !== undefined ? grades[mp].wgpa.toFixed(2) : 'N/A'} />
              <Stat title="Average grade" value={averageGrade} />
            </div>

            <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Subheading>Courses</Subheading>
                {currentPeriod && <Text className="mt-1">{currentPeriod.name}</Text>}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => update(mp, true)} outline>
                  <TbRefresh data-slot="icon" />
                  Refresh
                </Button>
                <Button type="button" onClick={() => setGpaModal(true)} outline>
                  <TbMathSymbols data-slot="icon" />
                  GPA
                </Button>
                {view === 'card' ? (
                  <Button href="?view=card">Cards</Button>
                ) : (
                  <Button href="?view=card" outline>
                    Cards
                  </Button>
                )}
                {view === 'table' ? (
                  <Button href="?view=table">Table</Button>
                ) : (
                  <Button href="?view=table" outline>
                    Table
                  </Button>
                )}
                {!isMediumOrLarger && (
                  <Button
                    type="button"
                    outline
                    onClick={() => {
                      setSettingsModal(true)
                      setModalBg(true)
                    }}
                  >
                    <BsGearWideConnected data-slot="icon" />
                    Settings
                  </Button>
                )}
              </div>
            </div>

              {!loading && schoolsList && (
                <div className="mt-6 flex w-full items-center justify-between gap-3 rounded-lg bg-zinc-950/2.5 p-2 dark:bg-white/5">
                  <Button
                    type="button"
                    disabled={schoolIndex == 0}
                    outline
                    className="size-10"
                    onClick={() => switchSchool(-1)}
                  >
                    <HiArrowCircleLeft size={25} />
                  </Button>
                  <Strong className="truncate text-center">
                    {schoolsList[schoolIndex].name}
                  </Strong>
                  <Button
                    type="button"
                    disabled={schoolIndex == schoolsList.length - 1}
                    outline
                    className="size-10"
                    onClick={() => switchSchool(1)}
                  >
                    <HiArrowCircleRight size={25} />
                  </Button>
                </div>
              )}

              {view === 'card' && (
                <div
                  className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3"
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
                          <div key={i} className="flex max-h-64 shrink justify-center rounded-lg border border-zinc-200/80 bg-white/90 p-4 dark:border-white/10 dark:bg-zinc-900/80">
                            <CustomAd timestamp={timestamp} setTime={setTime} ad={ad} setAd={setAd} />
                          </div>
                        )
                      }
                      const { finalGrade, semesterGrade, semesterLabel } = getCourseGrades(settings)

                      return (
                        <motion.div
                          layout="preserve-aspect"
                          layoutId={`card-${layoutID}`}
                          className="flex min-h-56 flex-col justify-between rounded-lg border border-zinc-200/80 bg-white p-5 shadow-sm shadow-zinc-950/5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-zinc-950/10 dark:border-white/10 dark:bg-zinc-900/80 dark:shadow-black/20"
                          key={i}
                        >
                          <div>
                            <div className="mb-4 flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <Badge color="zinc">Period {period}</Badge>
                                <Heading level={2} className="mt-3 text-xl/7 sm:text-xl/7">
                                  <motion.span layout layoutId={`name-${layoutID}`}>
                                    {name}
                                  </motion.span>
                                </Heading>
                                <motion.div layoutId={`teacher-${layoutID}`} layout>
                                  <Text className="mt-1">{teacher.name}</Text>
                                </motion.div>
                              </div>
                              <Badge color={gradeTone(grade)}>{grade.letter}</Badge>
                            </div>
                            <Divider soft />
                            <div className="mt-4 grid gap-3">
                              <div>
                                <Text>Current grade</Text>
                                <motion.div
                                  layoutId={`grade-${layoutID}`}
                                  layout="preserve-aspect"
                                  className={clsx('text-3xl/9 font-semibold', gradeTextClass(grade))}
                                >
                                  {formatGrade(grade, settings?.rounding)}
                                </motion.div>
                              </div>
                              {settings.finals?.show && finalGrade && (
                                <motion.div layoutId={`final-${layoutID}`} layout="preserve-aspect">
                                  <Text>Final</Text>
                                  <Strong className={gradeTextClass(finalGrade)}>
                                    {formatGrade(finalGrade, settings.rounding)}
                                  </Strong>
                                </motion.div>
                              )}
                              {semesterGrade && (
                                <motion.div layoutId={`semester-${layoutID}`} layout="preserve-aspect">
                                  <Text>{semesterLabel}</Text>
                                  <Strong className={gradeTextClass(semesterGrade)}>
                                    {formatGrade(semesterGrade, settings.rounding)}
                                  </Strong>
                                </motion.div>
                              )}
                            </div>
                          </div>

                          <Button href={`${detailBasePath}/${layoutID}`} className="mt-5 w-full">
                            View details
                          </Button>
                        </motion.div>
                      )
                    })
                  })()}
                </div>
              )}
              {view === 'table' && (
                <div className="mt-4">
                  <Table className="[--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
                    <TableHead>
                      <TableRow>
                        <TableHeader>
                          Period
                        </TableHeader>
                        <TableHeader>
                          Course Name
                        </TableHeader>
                        <TableHeader>
                          Teacher
                        </TableHeader>
                        <TableHeader>
                          Grade
                        </TableHeader>
                        {hasFinals && (
                          <TableHeader>
                            Final
                          </TableHeader>
                        )}
                        {hasSemester && (
                          <TableHeader>
                            Semester
                          </TableHeader>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {grades?.[mp]?.courses.map(({ name, period, grade, teacher, settings, layoutID }, i) => {
                        const { finalGrade, semesterGrade } = getCourseGrades(settings)

                        return (
                          <TableRow
                            href={`${detailBasePath}/${layoutID}`}
                            title={`Open ${name}`}
                            key={i}
                          >
                            <TableCell className="font-medium">
                              {period}
                            </TableCell>
                            <TableCell>
                              <Strong>{name}</Strong>
                            </TableCell>
                            <TableCell>{teacher.name}</TableCell>
                            <TableCell>
                              <Badge color={gradeTone(grade)}>{formatGrade(grade, settings?.rounding)}</Badge>
                            </TableCell>
                            {hasFinals && (
                              <TableCell>
                                {finalGrade ? (
                                  <Badge color={gradeTone(finalGrade)}>{formatGrade(finalGrade, settings.rounding)}</Badge>
                                ) : (
                                  <Text>N/A</Text>
                                )}
                              </TableCell>
                            )}
                            {hasSemester && (
                              <TableCell>
                                {semesterGrade ? (
                                  <Badge color={gradeTone(semesterGrade)}>{formatGrade(semesterGrade, settings.rounding)}</Badge>
                                ) : (
                                  <Text>N/A</Text>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
          </>
        )}
      </motion.div>
    </PageShell>
  )
}
