import { motion } from 'framer-motion'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useRef, useState } from 'react'
import CategoryField from '../../components/CategoryField'
import GradeField from '../../components/GradeField'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import {
  abbreviate,
  addAssignment,
  Cache,
  calcFinal,
  delAssignment,
  parseDate,
  parseGrades,
  SchoolsListType,
  updateCategory,
  updateCourse,
} from '../../utils/grades'

//icons
import { BsGearWideConnected, BsGraphUp } from 'react-icons/bs'
import { HiOutlineDocumentAdd, HiOutlineTrash } from 'react-icons/hi'
import { TbRefresh } from 'react-icons/tb'
import CustomAd from '../../components/customAd'
import OptimizationModal from '../../components/optimizationModal'
import SettingsModal from '../../components/settingsModal'
import { grades as sample } from '../../utils/sample'

interface GradesProps {
  client: any
  grades: Cache
  setGrades: React.Dispatch<React.SetStateAction<Cache | undefined>>
  mp: number
  setMP: (period: number) => void
  isMediumOrLarger: boolean
  createError: (message: string) => void
  ad: any
  setAd: (ad: any) => void
  setTime: (time: number) => void
  timestamp: number
  width: any
  courseSettings: any
  setCourseSettings: any
  markingPeriod: number
  setMarkingPeriod: (p: number) => void
  modalBg: boolean
  setModalBg: (b: boolean) => void
  setSettingsModal: (b: boolean) => void
  settingsModal: boolean
  schoolsList: SchoolsListType[]
  schoolIndex: number
  guestLogin: () => void
}

/*
Inconsistencies:
the finals settings update live but the gradeScale settings only change after u hit save

the grades type shit should prob just also be stored in gradesCache, or at least moved into gradesCache when changes
are made


*/

export default function Grades({
  client,
  grades,
  setGrades,
  mp,
  setMP,
  isMediumOrLarger,
  createError,
  ad,
  setAd,
  setTime,
  timestamp,
  width,
  markingPeriod,
  setMarkingPeriod,
  modalBg,
  setModalBg,
  settingsModal,
  setSettingsModal,
  schoolsList,
  schoolIndex,
  guestLogin,
}: GradesProps) {
  const router = useRouter()
  const [index, setIndex] = useState(parseInt(String(router.query.index))) //you could've just parseInt'd it here but u didnt' and now i'm too lazy to refactor i hate u
  const course = grades?.[mp]?.courses[index]
  const [loading, setLoading] = useState(grades ? false : true)
  const [assignmentsModal, setAssignmentsModal] = useState(false)
  const [optimizationModal, setOptimizationModal] = useState(false)
  const [modalDetails, setModalDetails] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(undefined)
  const assignmentTitle = useRef(null)
  const mcps = client?.district == 'https://md-mcps-psv.edupoint.com/Service/PXPCommunication.asmx'

  console.log(course, 'joshua')

  useEffect(() => {
    console.log('FUCK CHRIST', optimizationModal)
  }, [optimizationModal])

  const finalGrade = course != undefined ? calcFinal(course?.settings.finals.categories, grades) : undefined
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
  const semesterIndex = course?.settings.finals.semesters.findIndex((semester) =>
    semester?.categories.some((category) => interimWiseComparison(category, { mp: mp }))
  )
  const semesterGrade =
    semesterIndex != -1 && course != undefined
      ? calcFinal(course?.settings.finals.semesters[semesterIndex].categories, grades)
      : undefined

  useEffect(() => {
    try {
      if (!grades && !client && ad !== undefined) {
        guestLogin()
      }
    } catch {
      if (localStorage.getItem('remember') === 'false') {
        console.log('womp womp')
      }
    }
  }, [client])

  useEffect(() => {
    const deleteLast = (event) => {
      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault() // Prevent default undo behavior if needed
        let temp = grades?.[mp]?.courses[index]

        if (temp.assignments[0].custom == true) {
          del(0)
        }
      }
    }

    if (grades?.[mp]?.courses[index]?.assignments?.length > 1) {
      window.addEventListener('keydown', deleteLast)
    }
    return () => {
      window.removeEventListener('keydown', deleteLast)
    }
  }, [grades])

  const updateGrade = (val: string, assignmentId: number, update: string) => {
    let tempCache = structuredClone(grades)
    let temp = tempCache?.[mp]
    temp.courses[index] = updateCourse(temp.courses[index], assignmentId, update, parseFloat(val))

    const assignment = temp.courses[index].assignments[assignmentId]
    //this was once simple, but now because of the way we operate accross MP's, we're maintaing parity between interims and standard MP's. or at least we're giving it a shot.
    var adjustedId

    if (tempCache[mp].period.name.toLowerCase().includes('interim') && mcps) {
      adjustedId = tempCache[mp + 1].courses[index].assignments.findIndex(
        (ass) => ass.GradebookID == assignment.GradebookID
      )
      if (adjustedId != -1) {
        tempCache[mp + 1].courses[index] = updateCourse(
          tempCache[mp + 1].courses[index],
          adjustedId,
          update,
          parseFloat(val)
        )
      }
    } else if (mcps && Number(tempCache[0].periods[mp - 1].date.end) > Date.now()) {
      adjustedId = tempCache[mp - 1].courses[index].assignments.findIndex(
        (ass) => ass.GradebookID == assignment.GradebookID
      )

      if (adjustedId != -1) {
        tempCache[mp - 1].courses[index] = updateCourse(
          tempCache[mp - 1].courses[index],
          adjustedId,
          update,
          parseFloat(val)
        )
      }
    }
    setGrades(tempCache)
  }

  const handleChange = (e) => setTitle(e.target.value)

  const handleTitleChange = () => {
    const newTitle = assignmentTitle.current.value == '' ? 'New Assignment' : assignmentTitle.current.value
    let tempCache: Cache = structuredClone(grades)
    let temp = tempCache?.[mp]
    temp.courses[index].assignments[modalDetails].name = newTitle
    setGrades(tempCache)

    setIsEditing(false)
  }

  const add = () => {
    let tempCache = structuredClone(grades)
    let temp = tempCache?.[mp]
    temp.courses[index] = addAssignment(temp.courses[index])

    const uuid = temp.courses[index].assignments.at(0).GradebookID

    if (tempCache[mp].period.name.toLowerCase().includes('interim') && mcps) {
      tempCache[mp + 1].courses[index] = addAssignment(tempCache[mp + 1].courses[index], uuid)
    } else if (mcps) {
      if (Number(tempCache[0].periods[mp - 1].date.end) > Date.now()) {
        tempCache[mp - 1].courses[index] = addAssignment(tempCache[mp - 1].courses[index], uuid)
      }
    }
    setGrades(tempCache) //yeah that works too I guess. I like structuredClone better though. that way no mutations.
  }

  const del = (id: number) => {
    let tempCache = structuredClone(grades)
    const original = structuredClone(tempCache?.[mp].courses[index])
    let temp = tempCache?.[mp]
    const assignment = temp.courses[index].assignments[id]
    temp.courses[index] = delAssignment(temp.courses[index], id)
    //this was once simple, but now because of the way we operate accross MP's, we're maintaing parity between interims and standard MP's. or at least we're giving it a shot.
    let adjustedId
    console.log(
      'is the flag blue',
      mcps,
      tempCache[mp + 1].courses[index].assignments.length,
      original.assignments.length,
      id
    )
    if (tempCache[mp].period.name.toLowerCase().includes('interim') && mcps) {
      adjustedId = tempCache[mp + 1].courses[index].assignments.findIndex(
        (ass) => ass.GradebookID == assignment.GradebookID
      )
      console.log(adjustedId, 'anora russia')
      if (adjustedId != -1) {
        //so if it's an assignment that ain't there in the future, ignore?
        tempCache[mp + 1].courses[index] = delAssignment(tempCache[mp + 1].courses[index], adjustedId)
      }
      console.log('what the fuck is going on', tempCache)
    } else if (mcps) {
      adjustedId = tempCache[mp - 1].courses[index].assignments.findIndex(
        (ass) => ass.GradebookID == assignment.GradebookID
      )

      if ((adjustedId = !-1)) {
        tempCache[mp - 1].courses[index] = delAssignment(tempCache[mp - 1].courses[index], adjustedId)
      }
    }
    setGrades(tempCache)
  }

  const updateCat = (val: string, assignmentId: number) => {
    let tempCache = structuredClone(grades)
    let temp = tempCache?.[mp]
    const assignment = temp.courses[index].assignments[assignmentId]
    temp.courses[index] = updateCategory(temp.courses[index], assignmentId, val)
    //sigh
    var adjustedId
    if (tempCache[mp].period.name.toLowerCase().includes('interim') && mcps) {
      adjustedId = tempCache[mp + 1].courses[index].assignments.findIndex(
        (ass) => ass.GradebookID == assignment.GradebookID
      )

      if (adjustedId == -1) {
        return
      }
      tempCache[mp + 1].courses[index] = updateCategory(tempCache[mp + 1].courses[index], adjustedId, val)
    } else if (mcps && Number(tempCache[0].periods[mp - 1].date.end) > Date.now()) {
      adjustedId = tempCache[mp - 1].courses[index].assignments.findIndex(
        (ass) => ass.GradebookID == assignment.GradebookID
      )

      if (adjustedId == -1) {
        return
      }
      tempCache[mp - 1].courses[index] = updateCategory(tempCache[mp - 1].courses[index], adjustedId, val)
    }

    setGrades(tempCache)
  }

  const OpenModal = (assignmnetId: number) => {
    setModalDetails(assignmnetId)
    setTitle(course?.assignments[assignmnetId]?.name)
    setAssignmentsModal(true)
    setModalBg(true)
  }

  function update(p: number, getFresh = false) {
    if (client.guest) {
      const m = structuredClone(grades)
      m[p] = sample[p]
      setGrades(m)
      setMP(p)
      return
    }
    setLoading(true)
    const identifier = course.identifier
    console.log(p)
    setLoading(true)
    if (getFresh) {
      if (grades[p].periods[p].name.toLowerCase().includes('interim') && mcps) {
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
            createError(err.message)
            setLoading(false)
          })
      }

      const part2 = () =>
        client
          .gradebook(p, schoolsList ? schoolsList[schoolIndex].gu : null)
          .then(([res, extra]) => {
            res.gradingScale = extra?.gradingScale

            const parsed = parseGrades(res, grades[0].settings)
            const temp = structuredClone(grades)
            temp[p] = parsed

            //not rlly done, are we...
            for (let i = 0; i < temp[p].courses.length; i++) {
              temp[p].courses[i].settings = grades[p].courses[i].settings
            }
            if (second) {
              console.log('ayy shawty')
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
            createError(err.message)
            setLoading(false)
          })
    } else {
      setMP(p)
      setLoading(false)
    }

    const newIndex = grades[p].courses.findIndex((c) => c.identifier == course?.identifier)
    console.log('reality is often cruel', newIndex)
    if (newIndex != -1) {
      //		setIndex(newIndex) leads to an animation error rn, will re-enable when fixed
    } else {
    }

    //this whole thing could prob be a useEffect. the temp Cache sets could also be a useEffect tbh
  }

  const editTitle = () => {
    setIsEditing(true)
  }

  const handleFocus = () => {
    if (title == 'New Assignment') {
      setTitle('')
    }
  }

  function toggleSettings(bool) {
    setSettingsModal(bool)
    setModalBg(bool)
  }

  function toggleOptimization(bool) {
    setOptimizationModal(bool)
    setModalBg(bool)
  }

  return (
    <>
      {' '}
      {!loading && (
        <>
          <Modal
            show={assignmentsModal}
            onClose={() => {
              setAssignmentsModal(false)
              setModalBg(false)
            }}
            className={!isMediumOrLarger && `bg-transparent`}
          >
            <Modal.Header className="text-xl font-medium text-gray-900 dark:text-white">
              {isEditing ? (
                <input
                  onFocus={handleFocus}
                  className="border-none bg-transparent p-0 text-xl font-medium focus:outline-none focus:ring-0"
                  type="text"
                  onChange={handleChange}
                  ref={assignmentTitle}
                  autoFocus
                  onBlur={handleTitleChange}
                  value={title}
                ></input>
              ) : (
                <p onClick={course?.assignments[modalDetails]?.custom ? editTitle : () => {}}>{title}</p>
              )}
            </Modal.Header>
            <Modal.Body>
              <div id="assignment-details">
                <p className="font-bold text-black dark:text-white">Grade</p>
                <p
                  style={{
                    color:
                      course?.assignments[modalDetails]?.grade.color.includes('#') &&
                      course?.assignments[modalDetails]?.grade.color,
                  }}
                  className={
                    `text-base leading-relaxed` + ` text-${course?.assignments[modalDetails]?.grade.color}-400`
                  }
                >
                  {course?.assignments[modalDetails]?.grade.letter}
                  {!isNaN(course?.assignments[modalDetails]?.grade.raw) &&
                    ` (${course?.assignments[modalDetails]?.grade.raw}%)`}
                </p>
                <p className="font-bold text-black dark:text-white">Points</p>
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                  {!isNaN(course?.assignments[modalDetails]?.points.earned)
                    ? course?.assignments[modalDetails]?.points.earned
                    : 'NG'}
                  /{course?.assignments[modalDetails]?.points.possible}
                </p>
                <p className="font-bold text-black dark:text-white">Date Due</p>
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                  {course?.assignments[modalDetails]?.date.due.toLocaleDateString()}{' '}
                </p>
                {Boolean(course?.assignments[modalDetails]?.notes) && (
                  <>
                    <p className="font-bold text-black dark:text-white">Notes</p>
                    <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                      {course?.assignments[modalDetails]?.notes}{' '}
                    </p>
                  </>
                )}
                <p className="font-bold text-black dark:text-white">Category</p>
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                  {course?.assignments[modalDetails]?.category}
                </p>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAssignmentsModal(false)
                    setModalBg(false)
                  }}
                  className="rounded-lg bg-gray-500 px-2.5 py-2.5 text-center text-xs font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 sm:text-sm dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    del(modalDetails)
                    setAssignmentsModal(false)
                    setModalBg(false)
                  }}
                  className="rounded-lg bg-zinc-700 px-2.5 py-2.5 text-center text-xs font-medium text-white hover:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-300 sm:text-sm dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800"
                >
                  <div className="flex items-center gap-1">
                    <HiOutlineTrash size={'1.2rem'} />
                    Delete
                  </div>
                </button>
              </div>
            </Modal.Footer>
          </Modal>

          <SettingsModal
            client={client}
            grades={grades}
            mp={mp}
            setGrades={setGrades}
            index={index}
            createError={createError}
            showModal={settingsModal}
            setShowModal={(bool) => {
              setSettingsModal(bool)
              setModalBg(bool)
            }}
            isMediumOrLarger={isMediumOrLarger}
          />

          <OptimizationModal
            createError={createError}
            cache={grades}
            mp={mp}
            index={index}
            setShowModal={(bool) => {
              setOptimizationModal(bool)
              setModalBg(bool)
            }}
            showModal={optimizationModal}
            isMediumOrLarger={isMediumOrLarger}
          />
        </>
      )}
      <motion.div className="h-screen flex-1 p-5 md:p-10">
        <Head>
          <title>{course ? `${course?.name} - Grade Melon` : 'Grade Melon'}</title>
        </Head>

        {loading ? (
          <div className="flex justify-center">
            <Spinner size="xl" color="pink" />
          </div>
        ) : (
          <motion.div className="max-w-max" layout layoutId={`card-${course?.layoutID}`}>
            <motion.h1
              layoutId={`name-${course?.layoutID}`}
              layout
              className="mb-1 flex flex-wrap justify-between text-xl font-bold text-gray-900 md:text-3xl dark:text-white"
            >
              {course?.name}
              {!isMediumOrLarger && (
                <BsGearWideConnected
                  className="text-gray-600 hover:text-gray-400 dark:text-gray-200 dark:hover:text-gray-400"
                  style={{ alignSelf: 'end' }}
                  size={30}
                  onClick={() => toggleSettings(true)}
                />
              )}
            </motion.h1>
            <div className=""></div>

            <motion.p
              layoutId={`teacher-${course?.layoutID}`}
              layout
              className="text-md mb-2.5 tracking-tight text-gray-900 dark:text-white"
            >
              {course?.teacher.name}
            </motion.p>
            <motion.div
              layoutId={`grade-${course.layoutID}`}
              layout="preserve-aspect"
              className="mb-2.5 text-xl md:text-xl dark:text-white"
            >
              {course?.grade.letter} {!isNaN(course?.grade.raw) && `(${course?.grade.raw}%)`}
            </motion.div>
            <div className="mt-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`bg-${course?.grade.color}-400 h-5 rounded-full p-0.5 pl-2 text-left text-xs font-semibold leading-none md:h-6 md:text-sm`}
                style={{
                  width: `${course?.grade.raw < 100 ? course?.grade.raw : 100}%`,
                  backgroundColor: course?.grade.color.includes('#') && `${course?.grade.color}`,
                }}
              >
                <p>Total</p>
              </div>
            </div>

            {course.settings.finals.show && (
              <div className="relative mb-2.5 mt-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`bg-${finalGrade.color}-400 h-5 rounded-full p-0.5 pl-2 text-left text-xs font-semibold leading-none md:h-6 md:text-sm`}
                  style={{
                    width: `${finalGrade.raw < 100 ? finalGrade.raw : 100}%`,
                    backgroundColor: finalGrade.color.includes('#') && `${finalGrade.color}`,
                  }}
                >
                  <p className="absolute">
                    Final Grade (
                    {!isNaN(finalGrade.raw)
                      ? `${course.settings.rounding.percent ? finalGrade.raw.toFixed(course.settings.rounding.percentPlaces) : finalGrade.raw}%`
                      : 'N/A'}
                    )
                  </p>
                </div>
              </div>
            )}

            {semesterIndex != -1 && (
              <div className="relative mb-4 mt-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`bg-${semesterGrade.color}-400 h-5 rounded-full p-0.5 pl-2 text-left text-xs font-semibold leading-none md:h-6 md:text-sm`}
                  style={{
                    width: `${semesterGrade.raw < 100 ? semesterGrade.raw : 100}%`,
                    backgroundColor: semesterGrade.color.includes('#') && `${semesterGrade.color}`,
                  }}
                >
                  <p className="absolute">
                    Semester Grade (
                    {!isNaN(semesterGrade.raw)
                      ? `${course.settings.rounding.percent ? semesterGrade.raw.toFixed(course.settings.rounding.percentPlaces) : semesterGrade.raw}%`
                      : 'N/A'}
                    )
                  </p>
                </div>
              </div>
            )}

            {course?.categories.map(({ name, grade, points }, i) => (
              <div key={i} className="relative mt-2 w-full rounded-full bg-gray-200 md:mt-3 dark:bg-gray-700">
                <div
                  className={
                    `bg-${grade.color}-400` +
                    ` h-4 rounded-full p-0.5 pl-2 text-left text-xs font-medium leading-none md:h-6 md:text-sm`
                  }
                  style={{
                    width: `${grade.raw < 100 ? grade.raw : 100}%`,
                    backgroundColor: grade.color.includes('#') && grade.color,
                  }}
                >
                  <p className="absolute">
                    {name} ({!isNaN(grade.raw) ? `${grade.raw}%` : 'N/A'}) - {Math.floor(points.earned * 100) / 100}/
                    {Math.floor(points.possible * 100) / 100}
                  </p>
                </div>
              </div>
            ))}

            <div className="mt-5 flex w-full gap-2">
              <button
                type="button"
                onClick={() => update(mp, true)}
                className="rounded-lg border border-gray-300 bg-white p-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
              >
                <TbRefresh size={'1.3rem'} />
              </button>
              <select
                id="periods"
                value={mp}
                onChange={(e) => update(parseInt(e.target.value))}
                className="block w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 focus:border-zinc-700 focus:ring-zinc-700 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-zinc-700 dark:focus:ring-zinc-700"
              >
                {grades?.[mp]?.periods.map((period) => (
                  <option value={period.index} key={period.index}>
                    {`${period.name} (${parseDate(period.date)})`}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => toggleOptimization(true)}
                className="rounded-lg border border-zinc-700 bg-zinc-700 p-2.5 text-sm font-medium text-white hover:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:ring-zinc-500"
              >
                <BsGraphUp size={'1.3rem'} />
              </button>
              <button
                type="button"
                onClick={add}
                className="rounded-lg border border-gray-300 bg-white p-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
              >
                <HiOutlineDocumentAdd size={'1.3rem'} />
              </button>
            </div>
            <div className="m-5" />
            <div className="flex">
              <div className="mx-auto max-w-max overflow-x-auto rounded-lg border border-gray-200 shadow-md dark:border-gray-700">
                <table className="text-left text-sm text-gray-500 dark:text-gray-400">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="py-3 text-center md:pl-6 md:text-left">
                        Date
                      </th>
                      <th scope="col" className="py-3 text-center md:px-6 md:text-left">
                        Assignment
                      </th>
                      <th scope="col" className="py-3 pr-3 text-center md:px-6 md:text-left">
                        Score
                      </th>
                      <th scope="col" className="py-3 pr-3 md:px-6">
                        Category
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      var stopBreakingTheIndexSystems
                      let temp = structuredClone(grades?.[mp].courses[index])
                      if (temp?.assignments && ad && client.username != '10016976' && width < 1280 && false) {
                        stopBreakingTheIndexSystems = true //disabled for [name-redacted]
                        temp.assignments.splice(Math.floor(temp.assignments.length / 2), 0, {
                          name: 'this is where the ad should go',
                          date: { due: new Date(), assigned: new Date() },
                          category: course.categories[0].name,
                          points: { earned: 0, possible: 0 },
                          grade: { letter: '', color: '', raw: NaN },
                          custom: false,
                          included: false,
                          notes: '',
                          GradebookID: crypto.randomUUID(),
                        })
                      } else {
                        stopBreakingTheIndexSystems = false
                      }

                      return temp?.assignments.map(({ name, date, grade, category, points, custom, included }, i) => {
                        var trueIndex: number
                        if (
                          i > Math.floor(course.assignments.length / 2) &&
                          ad &&
                          client.username != '10016976' &&
                          width < 1280 &&
                          stopBreakingTheIndexSystems
                        ) {
                          trueIndex = i - 1
                        } else {
                          trueIndex = i
                        }
                        if (name == 'this is where the ad should go') {
                          return (
                            <tr
                              className={`bg-${i % 2 == 0 ? 'white' : 'gray-50'} border-b dark:bg-gray-${
                                i % 2 == 0 ? 900 : 800
                              } dark:border-gray-700`}
                              key={i}
                            >
                              <td className="p-3" colSpan={4}>
                                <div className="flex max-h-64 shrink justify-center">
                                  <CustomAd timestamp={timestamp} setTime={setTime} ad={ad} setAd={setAd} />
                                </div>
                              </td>
                            </tr>
                          )
                        }

                        return (
                          <tr
                            className={`bg-${i % 2 == 0 ? 'white' : 'gray-50'} border-b dark:bg-gray-${
                              i % 2 == 0 ? 900 : 800
                            } dark:border-gray-700`}
                            key={i}
                          >
                            <td className="py-4 pl-2 text-center md:pl-6 md:text-left">
                              {date.due.toLocaleDateString()}
                            </td>
                            <td
                              className={`px-3 py-4 text-center md:px-6 ${Boolean(custom) && 'text-zinc-700'} ${!included && 'text-[#4d462d]'} md:text-left hover:text-${included ? 'black' : 'gray'} dark:hover:text-${included ? 'white' : 'gray'} cursor-pointer`}
                              onClick={() => OpenModal(trueIndex)}
                            >
                              {name}
                            </td>
                            <td className="py-4 pl-3 pr-2 text-center md:px-6 md:text-left">
                              <div
                                style={{ color: included && grade.color.includes('#') && grade.color }}
                                className={`flex items-center gap-2 ${included ? `text-${grade.color}-400` : 'text-[#4d462d]'}`}
                              >
                                <GradeField
                                  onChange={(e) => updateGrade(e.target.value, trueIndex, 'earned')}
                                  value={points.earned}
                                />
                                <p className="">/</p>
                                <GradeField
                                  onChange={(e) => updateGrade(e.target.value, trueIndex, 'possible')}
                                  value={points.possible}
                                />
                              </div>
                            </td>
                            <td className="py-4 pr-1 text-center md:px-6 md:text-left">
                              <CategoryField
                                value={course?.categories.findIndex((c) => category === c.name)}
                                onChange={(e) => updateCat(e.target.value, trueIndex)}
                                name={isMediumOrLarger ? category : abbreviate(category)}
                              >
                                {course?.categories.map((category, x) => (
                                  <option value={x} key={x}>
                                    {category.name}
                                  </option>
                                ))}
                              </CategoryField>
                            </td>
                          </tr>
                        )
                      })
                    })()}
                  </tbody>
                </table>
              </div>
              {false && (
                <div className="hidden shrink lg:block">
                  <CustomAd timestamp={timestamp} setTime={setTime} ad={ad} setAd={setAd} />{' '}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </>
  )
}
