import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import {
  Cache,
  calcFinal,
  Category,
  genTable,
  letterGrade,
  letterGradeColor,
  ordinalSuffix,
  simplifyWeights,
  solveSystemMinSum,
} from '../utils/grades'
import ExamField from './ExamField'
import QuarterField from './QuarterField'
import Modal from './ui/Modal'

interface OptimizeProps {
  [key: string]: number
}

interface ModalProps {
  showModal: boolean
  setShowModal: any
  mp: number
  index: number
  cache: Cache
  createError: (message: string) => void
  isMediumOrLarger: boolean
}

//i still wanna make it try to navigate to same course on mp change

interface Score {
  raw: number
  letter: string
  color: string
}

const animationPropsHome = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 },
  transition: { duration: 0.1 },
}

const animationPropsPage = animationPropsHome //for now

export default function OptimizationModal({
  showModal,
  setShowModal,
  mp,
  index,
  cache,
  createError,
  isMediumOrLarger,
}: ModalProps) {
  const [cacheCopy, setCacheCopy] = useState(structuredClone(cache))
  const course = cacheCopy[mp].courses[index]
  const [optimizeProps, setOptimizeProps] = useState<OptimizeProps>({ desiredGrade: undefined })
  const [solutions, setSolutions] = useState<[number[], number][]>([])
  const [viewStack, setViewStack] = useState(['finals'])
  const [kill, setKill] = useState(undefined)
  const [virtual, setVirtual] = useState(structuredClone(course))

  const interimWiseComparison = (cat1: Category, cat2: Category) => {
    cat1 = structuredClone(cat1)
    cat2 = structuredClone(cat2)
    if (cache[0].periods[cat1.mp].name.toLowerCase().includes('interim')) {
      cat1.mp += 1
    }
    if (cache[0].periods[cat2.mp].name.toLowerCase().includes('interim')) {
      cat2.mp += 1
    }
    return [cat1.mp == cat2.mp, cat1.mp >= cat2.mp, cat1.mp <= cat2.mp]
  }
  const currentSemesterIndex = course.settings.finals.semesters.findIndex((semester) =>
    semester.categories.some(
      (category) => interimWiseComparison(category, { mp: mp, courseIndex: index, weight: 0, type: 'course' })[0]
    )
  )

  function reset() {
    setOptimizeProps({ desiredGrade: undefined })
    setVirtual(structuredClone(course))
    setCacheCopy(structuredClone(cache))
  }

  useEffect(() => {
    setCacheCopy(structuredClone(cache))
  }, [cache])

  //what should this even do if finals is disabled chat lmoa

  const finalGrade: Score = !course?.settings?.finals.isSemester
    ? calcFinal(course?.settings.finals.categories, cacheCopy)
    : undefined

  //like. you DO NOT want users going into settings if you can avoid it.
  /*to provide CLARITY | HOW DO I PROVIDE CLARITY ON THIS? how would a user know
    that the exams in the settings tab are to be independent of a quarter, as where the other one is for if it 
    affects the quarter grade in and of itself. I assume at MCPS it'll be the latter, so we'll just
    DISABLE the semester settings for the time being for mcps. for the freaks at fcps 
    i'll leave it enabled. */

  const semesterGrades: Score[] = course?.settings.finals.semesters.map((semester) =>
    semester ? calcFinal(semester.categories, cacheCopy) : undefined
  )

  //so this won't ever for mcps users then actually fucking matter or make a difference. whatever.
  const all = (course?.settings.finals.show ? course?.settings.finals.categories : []).concat(
    course?.settings.finals.semesters.map((semester) => (semester?.show ? semester.categories : [])).flat()
  )

  //this is so so so so dumb
  function wasIncluded(cat) {
    if (cache[0].settings.mode == 'mcps') {
      return course.settings.finals.semesters[currentSemesterIndex]?.categories.some(
        (category) => interimWiseComparison(category, cat)[0]
      )
    } else {
      return true
    }
  }

  //not actually using this for the weights, but it will return the unique marking periods. so. swag.
  const uniqueCats = simplifyWeights(all).filter((cat) => wasIncluded(cat))

  function optimize() {
    let tempProps = {}
    tempProps['desiredGrade'] = course.settings.letterScale[0][1][0]
    course.categories.forEach((cat) => {
      tempProps[cat.name] = cat.weight * 100
    })
    setOptimizeProps(tempProps)
    setShowModal(true)
  }

  /*
so we're after a system of equations really


[



]


*/

  /*
TODO:
 -test decimals feature

*/
  function solveFinal() {
    //we gotta build the matrix
    const rows = []
    const targetVector = []
    if (optimizeProps.desiredGrade) {
      // or maybe i'll use NaN or something
      console.log("i'm peppa pig", optimizeProps)
      const row = Array(uniqueCats.length)
      let target = optimizeProps.desiredGrade
      let known = 0
      for (let [i, cat] of uniqueCats.entries()) {
        const catIndex = course?.settings.finals.categories.findIndex(
          (category) => category.courseIndex == cat.courseIndex && category.mp == cat.mp && cat.type == category.type
        )
        if (catIndex == -1) {
          row[i] = 0
        } else {
          //@ts-ignore
          if (
            !Number.isNaN(cacheCopy[cat.mp].courses[cat.courseIndex].grade.raw) &&
            !(cacheCopy[cat.mp].courses[cat.courseIndex].grade as any).custom
          ) {
            ;(cat as any).raw =
              course?.settings.finals.categories[catIndex].weight * cacheCopy[cat.mp].courses[cat.courseIndex].grade.raw
            known += (cat as any).raw
            row[i] = 0
          } else {
            row[i] = course?.settings.finals.categories[catIndex].weight
          }
        }
      }
      console.log(target, known, 'kill me')
      target -= known //i love floating point math it's awful
      rows.push(row)
      targetVector.push(target)
    }
    for (let [j, semester] of course?.settings.finals.semesters.entries()) {
      if (semester == undefined) {
        continue
      }
      const monicker = 'desiredGrade' + ordinalSuffix(j + 1)
      if (optimizeProps?.[monicker]) {
        // or maybe i'll use NaN or something
        const row = Array(uniqueCats.length)
        let target = optimizeProps?.[monicker]
        let known = 0
        for (let [i, cat] of uniqueCats.entries()) {
          const catIndex = semester.categories.findIndex(
            (category) => category.courseIndex == cat.courseIndex && category.mp == cat.mp && cat.type == category.type
          )
          if (catIndex == -1) {
            row[i] = 0 //if it doesn't belong to this semester, it's weight is 0
          } else {
            //@ts-ignore
            //if it has a real value, and it's not from the custom bs from a sovled one, then and only then, add it
            if (
              !Number.isNaN(cacheCopy[cat.mp].courses[cat.courseIndex].grade.raw) &&
              !(cacheCopy[cat.mp].courses[cat.courseIndex].grade as any).custom &&
                !interimWiseComparison(cat, { courseIndex: index, mp: mp, weight: 0, type: 'course' })[1]
            ) {
              ;(cat as any).raw =
                semester.categories[catIndex].weight * cacheCopy[cat.mp].courses[cat.courseIndex].grade.raw
              known += (cat as any).raw
              row[i] = 0
            } else {
              row[i] = semester.categories[catIndex].weight
            }
          }
        }
        target -= known //i love floating point math it's awful
        rows.push(row)
        targetVector.push(target)
      } // no else branch cuz if there's no target val we just don't add that row to the matrix
    }

    const parms = { A: rows, targets: targetVector, decimalPlaces: Number(course?.settings.rounding.percentPlaces) }
    console.log('parms', parms)
    const solutionVector = solveSystemMinSum(parms)
    if (solutionVector != null) {
      console.log('jesus christ', solutionVector, parms)
      implementSolutionVirtual(solutionVector)
    } else {
      createError('No Solution')
      return
    }
  }

  function implementSolutionVirtual(solutionVector) {
    const temp = structuredClone(cacheCopy)
    for (let [i, cat] of uniqueCats.entries()) {
      if (cat.type == 'exam') {
        continue //god fucking knows how we'll handle exams
      }
      const newGrade = {
        raw: solutionVector[i],
        letter: letterGrade(solutionVector[i], course?.settings),
        color: '#FF13F0',
        custom: true,
      }
      if (!Number.isNaN(cat.courseIndex)) {
        const existing = cacheCopy[cat.mp].courses[cat.courseIndex].grade
        //@ts-ignore
        if (
          Number.isNaN(existing.raw) ||
          (existing as any).custom ||
          interimWiseComparison(cat, { courseIndex: index, mp: mp, weight: 0, type: 'course' })[1]
        ) {
          temp[cat.mp].courses[cat.courseIndex].grade = newGrade
        }
      } else {
        //virtual course
        temp[cat.mp].courses[99 + i] = {
          grade: newGrade,
          name: '',
          period: NaN,
          courseID: course.courseID,
          layoutID: NaN,
          room: '',
          weighted: course.weighted,
          identifier: course.identifier,
          settings: course.settings,
          teacher: { name: '', email: '' },
          categories: course.categories,
          assignments: [],
        }

        //insert virtual course into copy's runtime settings
        const dex = course.settings.finals.categories.findIndex(
          (cat) => isNaN(cat.courseIndex) && cat.mp == cat.mp && cat.type == cat.type
        )
        if (dex != -1) {
          course.settings.finals.categories[dex].courseIndex = 99 + i
        }
        for (let semester of course.settings.finals.semesters) {
          const dex = semester.categories.findIndex(
            (cat) => Number.isNaN(cat.courseIndex) && cat.mp == cat.mp && cat.type == cat.type
          )
          if (dex == -1) {
            continue
          }
          semester.categories[dex].courseIndex = 99 + i
        }
        temp[mp].courses[index] = course
      }
    }
    setCacheCopy(temp)
  }

  function updateOptimize(val: string, field: string) {
    setOptimizeProps((prev) => {
      return { ...prev, [field]: parseFloat(val) }
    })
  }

  function optimizeGrades() {
    const temp = structuredClone(course)
    if (optimizeProps['Quarter Exam']) {
      //modify real cat weights to reflect what we're shoe-horning in
      for (let category of temp.categories) {
        category.weight *= 1 - optimizeProps['Quarter Exam'] / 100
      }
      temp.categories.push({
        name: 'Quarter Exam',
        weight: optimizeProps['Quarter Exam'] / 100,
        grade: { letter: 'N/A', color: 'gray', raw: 0 },
        points: { earned: 0, possible: 100 },
      })
    }

    const points = temp.categories.map((category) =>
      category.name != 'Quarter Exam' ? optimizeProps[category.name] : 100
    )
    let results = genTable(temp, optimizeProps?.desiredGradeQ ?? course.settings.letterScale[0][1][0], points)
    setVirtual(temp)
    setSolutions(results)
  }

  return (
    <Modal
      show={showModal}
      onClose={() => {
        setShowModal(false)
      }}
      className={`${!isMediumOrLarger && 'bg-transparent'}`}
    >
      <Modal.Header className="text-xl font-medium text-gray-900 dark:text-white">Optimize Grade</Modal.Header>
      <Modal.Body style={{ maxHeight: 400, minHeight: 400 }} className="overflow-y-auto">
        <div className="mx-auto mb-2 flex w-[80%] justify-center gap-6">
          <button
            style={{ borderWidth: 1, padding: 5, borderRadius: 12 }}
            className={`-ml-3 flex-1 border-neutral-200 text-lg font-semibold dark:border-gray-500 ${
              viewStack.at(-1) === 'quarter'
                ? 'cursor-not-allowed bg-neutral-300 text-gray-500 dark:bg-gray-800 dark:text-white'
                : 'bg-neutral-50 hover:bg-neutral-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-800'
            }`}
            onClick={() => setViewStack(['quarter'])}
            disabled={viewStack.at(-1) === 'quarter'}
          >
            <div className="flex items-center">
              <p>Quarter</p>
            </div>
          </button>

          <button
            style={{ borderWidth: 1, padding: 5, borderRadius: 12 }}
            className={`-ml-3 flex-1 border-neutral-200 text-lg font-semibold dark:border-gray-500 ${
              viewStack.at(-1) === 'finals'
                ? 'cursor-not-allowed bg-neutral-300 text-gray-500 dark:bg-gray-800 dark:text-white'
                : 'bg-neutral-50 hover:bg-neutral-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-800'
            }`}
            onClick={() => setViewStack(['finals'])}
            disabled={viewStack.at(-1) === 'finals'}
          >
            <div className="flex items-center">
              <p>{course?.settings.finals?.show ? 'Finals' : 'Semester'}</p>
            </div>
          </button>
        </div>

        <AnimatePresence mode="wait" key="killMePlease" initial={true}>
          {
            //quarter page

            /*
                                  <button
                        style={{borderWidth:1,padding:5,borderRadius:12}}
                        className="-ml-3 dark:text-white font-semibold border-neutral-200 dark:border-gray-500 text-lg bg-neutral-50 hover:bg-neutral-100 dark:hover:bg-gray-800 dark:bg-[#2d3847]"
                        onClick={()=>{setViewStack(["default"])}}
                      >
                        <div
                          className="flex items-center"
                        >
                          <HiArrowCircleLeft/>
                          <p>Back</p>
                        </div>
                      </button>
            */

            viewStack.at(-1) == 'quarter' && (
              <div {...animationPropsPage} key="quarterPage" className="">
                <React.Fragment key="quarterPageDeep">
                  <div className="flex flex-col gap-3">
                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                        Desired Grade (1-100)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={optimizeProps?.desiredGradeQ ?? course.settings.letterScale[0][1][0]}
                          onChange={(e) => updateOptimize(e.target.value, 'desiredGradeQ')}
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-zinc-900 focus:ring-zinc-900 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-zinc-700 dark:focus:ring-zinc-700"
                          placeholder={String(course.settings.letterScale[0][1][0])}
                        />
                      </div>
                    </div>
                    {course?.categories.map(({ name }, i) => (
                      <div key={i}>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                          Points Left ({name})
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={optimizeProps[name]}
                            onChange={(e) => updateOptimize(e.target.value, name)}
                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-zinc-900 focus:ring-zinc-900 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-zinc-700 dark:focus:ring-zinc-700"
                            placeholder="50"
                          />
                        </div>
                      </div>
                    ))}
                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                        Quarter-Exam Weight (only use if not already included)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          onFocus={(e) => {
                            setKill(e.target.value.replaceAll('%', ''))
                          }}
                          onChange={(e) => {
                            const weight = e.target.value.replaceAll('%', '')
                            setKill(weight)
                          }}
                          value={kill != undefined ? kill : optimizeProps['Quarter Exam'] || 0 + '%'}
                          onBlur={(e) => {
                            setKill(undefined)
                            updateOptimize(String(parseFloat(e.target.value.replaceAll('%', '')) || 0), 'Quarter Exam')
                          }}
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-zinc-900 focus:ring-zinc-900 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-zinc-700 dark:focus:ring-zinc-700"
                          placeholder="50"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 overflow-x-auto rounded-lg border border-gray-300 shadow-md dark:border-gray-600">
                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                          {(virtual || course)?.categories.map(({ name }, i) => (
                            <th scope="col" className="py-3 pl-6" key={i + 'swagy'}>
                              {name}
                            </th>
                          ))}
                          <th scope="col" className="px-6 py-3">
                            Grade
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {solutions.map((sol, i) => (
                          <tr
                            className={`bg-${i % 2 == 0 ? 'white' : 'gray-50'} border-b dark:bg-gray-${
                              i % 2 == 0 ? 900 : 800
                            } dark:border-gray-700`}
                            key={i + 'swiggy'}
                          >
                            {(virtual || course)?.categories.map((cat, k) => (
                              <td scope="col" className="py-3 pl-6" key={k + 'swecky' + i}>
                                {sol[0][k]} / {optimizeProps[cat.name]}
                              </td>
                            ))}
                            <td
                              scope="row"
                              className="whitespace-nowrap py-4 pl-6 font-medium text-gray-900 dark:text-white"
                            >
                              {sol[1].toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                        {!solutions.length && (
                          <tr className="font-bold text-red-600">
                            <td className="align-center py-3 text-center" colSpan={course?.categories.length + 1}>
                              No Solutions Found!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {false && (
                    <button
                      onClick={optimizeGrades}
                      className="ml-2 mt-4 rounded-lg bg-zinc-700 px-2 py-2 text-center text-xs font-medium text-white hover:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-300 sm:text-sm dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800"
                    >
                      Optimize
                    </button>
                  )}
                </React.Fragment>
              </div>
            )
          }

          {
            //final page

            viewStack.at(-1) == 'finals' && (
              <motion.div {...animationPropsPage} key="finalsPage" className="">
                <React.Fragment key="finalsPageDeep">
                  <div
                    // className="mt-8 flex justify-evenly mx-4"
                    className="mx-4 mt-6"
                    style={
                      !isMediumOrLarger
                        ? {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            rowGap: 10,
                          }
                        : {
                            display: 'flex',
                            justifyContent: 'space-evenly',
                          }
                    }
                  >
                    {uniqueCats.map((category, i) => {
                      //fuck me is it ever null? that's dumb

                      const grade = !Number.isNaN(category.courseIndex)
                        ? cacheCopy[category.mp].courses[category.courseIndex].grade
                        : { letter: 'N/A', color: 'gray', raw: NaN }

                      return (
                        <div key={i + 'damn'} className="justify-top flex flex-col items-center">
                          {category.type == 'course' && (
                            <>
                              <p className="dark:text-white">{cacheCopy[0].periods[category.mp].name}</p>

                              <QuarterField
                                onChange={(e) => {
                                  const val = Math.abs(parseFloat(e.target.value))

                                  const newGrade = {
                                    raw: val,
                                    letter: letterGrade(val, course?.settings),
                                    color: letterGradeColor(letterGrade(val, course?.settings)),
                                  }
                                  const temp = structuredClone(cacheCopy)
                                  if (!Number.isNaN(category.courseIndex)) {
                                    temp[category.mp].courses[category.courseIndex].grade = newGrade
                                  } else {
                                    //virtual course
                                    temp[category.mp].courses[99 + i] = {
                                      grade: newGrade,
                                      name: '',
                                      period: NaN,
                                      courseID: course.courseID,
                                      layoutID: NaN,
                                      room: '',
                                      weighted: course.weighted,
                                      identifier: course.identifier,
                                      settings: course.settings,
                                      teacher: { name: '', email: '' },
                                      categories: course.categories,
                                      assignments: [],
                                    }

                                    //insert virtual course into copy's runtime settings
                                    const dex = course.settings.finals.categories.findIndex(
                                      (cat) =>
                                        isNaN(cat.courseIndex) && cat.mp == category.mp && category.type == cat.type
                                    )
                                    if (dex != -1) {
                                      course.settings.finals.categories[dex].courseIndex = 99 + i
                                    }
                                    for (let semester of course.settings.finals.semesters) {
                                      const dex = semester.categories.findIndex(
                                        (cat) =>
                                          Number.isNaN(cat.courseIndex) &&
                                          cat.mp == category.mp &&
                                          cat.type == category.type
                                      )
                                      if (dex == -1) {
                                        continue
                                      }
                                      semester.categories[dex].courseIndex = 99 + i
                                    }
                                    temp[mp].courses[index] = course
                                  }

                                  setCacheCopy(temp)
                                }}
                                cache={cacheCopy}
                                mp={category.mp}
                                courseIndex={category.courseIndex}
                              />
                            </>
                          )}

                          {category.type == 'exam' && (
                            <>
                              <p className="dark:text-white">{cacheCopy[0].periods[category.mp].name + ' Exam'}</p>

                              <ExamField
                                onChange={(e) => {
                                  const val = Math.abs(parseFloat(e.target.value))

                                  const newGrade = {
                                    raw: val,
                                    letter: letterGrade(val, course?.settings),
                                    color: letterGradeColor(letterGrade(val, course?.settings)),
                                  }
                                  const clone = structuredClone(cacheCopy)
                                  const catIndex = cacheCopy[mp].courses[index].settings.finals.categories.findIndex(
                                    (cat) =>
                                      (cat.courseIndex == category.courseIndex ||
                                        (Number.isNaN(cat.courseIndex) && Number.isNaN(category.courseIndex))) &&
                                      cat.mp == category.mp &&
                                      cat.type == category.type &&
                                      cat.weight == category.weight
                                  )
                                  if (catIndex == -1) {
                                    createError("i didn't even like coding this feature.")
                                    return
                                  }
                                  //@ts-ignore
                                  clone[mp].courses[index].settings.finals.categories[catIndex].grade = newGrade
                                  setCacheCopy(clone)
                                }}
                                val={(category as any).grade || { raw: NaN, letter: 'N/A', color: 'gray' }}
                              />
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="mx-4 flex flex-col items-center justify-center">
                    {course?.settings.finals.show && finalGrade && !course?.settings.finals.isSemester && (
                      <div className="mt-7 w-full rounded-full bg-gray-300 dark:bg-gray-800">
                        <div
                          className={`bg-${finalGrade.color}-400 h-6 rounded-full p-0.5 pl-2 text-left text-xs font-semibold leading-none md:text-sm`}
                          style={{
                            width: `${finalGrade.raw < 100 ? finalGrade.raw : 100}%`,
                            backgroundColor: finalGrade.color.includes('#') && `${finalGrade.color}`,
                          }}
                        >
                          <p className="absolute text-sm">
                            Final {!Number.isNaN(finalGrade.raw) && ` (${finalGrade.raw})%`}
                          </p>
                        </div>
                      </div>
                    )}

                    {semesterGrades.map((grade, i) => {
                      if (grade == undefined || i != currentSemesterIndex) {
                        return null
                      }
                      return (
                        <React.Fragment key={i}>
                          {
                            <div className="mt-5 w-full rounded-full bg-gray-300 dark:bg-gray-800">
                              <div
                                className={`bg-${grade.color}-400 h-6 rounded-full p-0.5 pl-2 text-left text-xs font-semibold leading-none md:text-sm`}
                                style={{
                                  width: `${grade.raw < 100 ? grade.raw : 100}%`,
                                  backgroundColor: grade.color.includes('#') && `${grade.color}`,
                                }}
                              >
                                <p className="absolute text-sm">
                                  {ordinalSuffix(i + 1)} Semester{' '}
                                  {!Number.isNaN(grade.raw) ? ` (${grade.raw})%` : `(N/A)%`}
                                </p>
                              </div>
                            </div>
                          }
                        </React.Fragment>
                      )
                    })}

                    {course?.settings.finals.show && (
                      <div className="mb-1 mt-4 w-full">
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                          Desired Final Grade (1-100)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={optimizeProps?.desiredGrade ?? ''}
                            onChange={(e) => updateOptimize(e.target.value, 'desiredGrade')}
                            className="hide-spinner w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-zinc-900 focus:ring-zinc-900 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-zinc-700 dark:focus:ring-zinc-700"
                            placeholder={String(course.settings.letterScale[0][1][0])}
                          />
                        </div>
                      </div>
                    )}

                    {semesterGrades.map((grade, i) => {
                      const monicker = 'desiredGrade' + ordinalSuffix(i + 1)
                      if (grade == undefined || i != currentSemesterIndex) {
                        return null
                      }
                      return (
                        <div className="mb-1 mt-4 w-full" key={i}>
                          <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Desired {ordinalSuffix(i + 1)} Semester Grade (1-100)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={optimizeProps?.[monicker] ?? ''}
                              onChange={(e) => updateOptimize(e.target.value, monicker)}
                              className="hide-spinner w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-zinc-900 focus:ring-zinc-900 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-zinc-700 dark:focus:ring-zinc-700"
                              placeholder={String(course.settings.letterScale[0][1][0])}
                            />
                          </div>
                        </div>
                      )
                    })}

                    <button
                      onClick={reset}
                      className="mr-auto mt-2 rounded-lg bg-zinc-900 p-0.5 text-sm text-white hover:bg-zinc-800 active:bg-zinc-800"
                    >
                      Reset
                    </button>
                  </div>
                </React.Fragment>
              </motion.div>
            )
          }
        </AnimatePresence>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(false)}
            className="rounded-lg bg-gray-500 px-2.5 py-2.5 text-center text-xs font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 sm:text-sm dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
          >
            Close
          </button>
          <button
            onClick={viewStack.at(-1) == 'finals' ? solveFinal : optimizeGrades}
            className="rounded-lg bg-zinc-700 px-2.5 py-2.5 text-center text-xs font-medium text-white hover:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-300 sm:text-sm dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800"
          >
            Optimize
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}
