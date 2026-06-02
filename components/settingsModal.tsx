import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { HiArrowCircleDown, HiArrowCircleLeft, HiArrowCircleRight, HiOutlineTrash } from 'react-icons/hi'
import StudentVue from 'studentvue'
import {
  Cache,
  Course,
  CourseSettings,
  Finals,
  initalizeFinals2,
  letterGradeColor,
  ordinalSuffix,
  reCalculateCourse,
  Settings,
  simplifyWeights,
  templateFinals,
} from '../utils/grades'
import { colorShit } from './colors'
import Modal from './ui/Modal'

interface props {
  client: Awaited<ReturnType<typeof StudentVue.login>>['client']
  index: number
  showModal: boolean
  setShowModal: (boolean: boolean) => void
  grades: Cache
  setGrades: (grades: Cache) => void
  createError: (message: string) => void
  mp: number
  finals?: any
  setFinals?: any
  isMediumOrLarger: boolean
}

export default function SettingsModal({
  client,
  index,
  showModal,
  setShowModal,
  grades,
  setGrades,
  createError,
  mp: period,
  isMediumOrLarger,
}: props) {
  const settings = grades?.[0]?.settings
  const course =
    index == -1
      ? { courseID: 'default', settings: settings.default, name: '', identifier: 'default' }
      : grades?.[period]?.courses[index]
  const courseSettings = course.settings
  const [letterScale, setLetterScale] = useState<CourseSettings['letterScale']>(
    index != -1 ? grades?.[period]?.courses[index].settings?.letterScale || undefined : settings.default.letterScale
  )
  const [rounding, setRounding] = useState<CourseSettings['rounding']>(
    index != -1 ? grades?.[period]?.courses[index].settings?.rounding || undefined : settings.default.rounding
  )
  const [active, setActive] = useState<[string, string]>(['', ''])
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [decimalPlaces, setDecimalPlaces] = useState(undefined)
  const [finals, setFinals] = useState<Finals>(course.settings.finals)
  const [modify, setModify] = useState(false)
  const [kill, setKill] = useState([undefined, undefined])
  const mcps = client?.district == 'https://md-mcps-psv.edupoint.com/Service/PXPCommunication.asmx'
  //new stack based view version
  const [viewStack, setViewStack] = useState(['home'])
  const currentView = viewStack.at(-1)

  const animationPropsHome = {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
    transition: { duration: 0.15 },
  }

  const animationPropsPage = animationPropsHome //for now

  useEffect(() => {
    console.log("where's your head at?")
    setLetterScale(
      index != -1 ? grades?.[period]?.courses[index].settings?.letterScale || undefined : settings.default.letterScale
    )
    setRounding(
      index != -1 ? grades?.[period]?.courses[index].settings?.rounding || undefined : settings.default.rounding
    )
    setFinals(course.settings.finals)
  }, [period])

  /*
yet to implement:
  semester grades support

  absoltely nothing right now for supporitng optimization, the MOST
  important and MOST useful feature is right now left hanging to dry



  Users will CRAVE a way to quickly and easily check this shit. optimizaiton modal 
  needs a HUGE overhaul. We gotta FINISH this settings shit up. UI doesn't need to be compltely perfect, tho 
  i've basically done most of that already tho. 

  then we go STRAIGHT to brainstorming this whole 
  sudo optimization, secondary grades page for full final type shit tpye thing, viewing it all
  all over

  all over at once. everwhere. everywhere all the time. all at once. forever. everywhere.


  we'll want to 


*/

  function mutate(e, letter, bound) {
    setLetterScale((prev) => {
      let temp = structuredClone(prev)
      temp[letter][bound] = e.target.value
      return temp
    })
  }

  //lazy
  function mutate2(e, letter, bound) {
    console.log(e, letter, bound, letterScale)
    setLetterScale((prev) => {
      let temp = structuredClone(prev)
      temp[letter][1][bound] = parseFloat(e.target.value)
      console.log('i hate u', temp)
      return temp
    })
  }

  function deleteLetter(letter) {
    let temp = structuredClone(letterScale)
    temp = temp.slice(0, letter).concat(temp.slice(letter + 1))
    setLetterScale(temp)
  }

  function addLetter() {
    let temp = structuredClone(letterScale)
    temp = temp.concat([['X', [0, 0]]])
    setLetterScale(temp)
  }

  function addFinalCategory() {
    let temp = structuredClone(finals)

    temp.categories.unshift({
      mp: grades?.[period]?.period.index,
      courseIndex: index != -1 ? index : NaN,
      weight: 0,
      type: 'exam',
    })
    setFinals(temp)
  }

  function addSemesterCategory(semesterIndex) {
    let temp = structuredClone(finals)

    temp.semesters[semesterIndex].categories.unshift({
      mp: grades?.[period]?.period.index,
      courseIndex: index != -1 ? index : NaN,
      weight: 0,
      type: 'exam',
    })
    setFinals(temp)
  }

  function deleteSemester(semesterIndex) {
    let temp = structuredClone(finals)
    temp.semesters.splice(semesterIndex, 1)
    setFinals(temp)
  }

  function addSemester() {
    let temp = structuredClone(finals)
    temp.semesters.push({ show: false, categories: [] })
    setFinals(temp)
  }

  function deleteFinalCategory(index) {
    let temp = structuredClone(finals)
    temp.categories.splice(index, 1)
    setFinals(temp)
  }

  function deleteSemesterCategory(semesterIndex, categoryIndex) {
    let temp = structuredClone(finals)
    temp.semesters[semesterIndex].categories.splice(categoryIndex, 1)
    setFinals(temp)
  }

  //endpoints
  const endpointUrl = 'https://studentvuelib.up.railway.app'

  async function getSettings(url, userHash) {
    const result = await (
      await fetch(endpointUrl + '/getSettings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url, userHash: userHash }),
      })
    ).json()

    return result
  }

  async function setSettings(url, userHash, encrypted, passHash, settings) {
    const result = await (
      await fetch(endpointUrl + '/setSettings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url,
          userHash: userHash,
          encrypted: encrypted,
          passHash: passHash,
          settings: settings,
        }),
      })
    ).json()
    return result
  }

  async function saveAndApply(tempSettings) {
    console.log('these are our theortetical temp settings', tempSettings)
    //@ts-expect-error
    if (!client.guest) {
      var result = await setSettings(client.district, client.username, client.encrypted, client.password, tempSettings)
    } else {
      result = { status: true }
    }
    if (result.status) {
      const tempGrades = structuredClone(grades)
      //oh boy. new runtime settings!!! basically need to recalculate and parse everything.

      for (let key in tempSettings) {
        if (key == 'default' || key == 'mode') {
          continue
        } else {
          for (let prop in tempSettings[key]) {
            if (tempSettings[key][prop] == false) {
              tempSettings[key][prop] = tempSettings.default[prop] //fallback to default if a class's settings props are set to false
            }
          }
        }
        tempSettings[key] = initalizeFinals2(grades, tempSettings, key)
      }
      console.log(tempSettings, 'sigh a million sighs', tempGrades, grades)
      for (let grade of tempGrades) {
        grade.settings = tempSettings
        for (let ncourse of grade.courses) {
          //our settings obj isn't raw here so we actually have much less processing to do
          if (!tempSettings[ncourse.identifier]) {
            //fuck your manual mode, for now
            ncourse.settings = initalizeFinals2(grades, tempSettings, ncourse.identifier)
          } else {
            ncourse.settings = tempSettings[ncourse.identifier]
          } //fuck ur manual mode

          ncourse = reCalculateCourse(ncourse)
        }
      }

      setGrades(tempGrades)
      return tempGrades
    } else {
      return false
    }
  }

  async function saveNew() {
    if (validate()) {
      const newScale: CourseSettings | any = {
        finals: { ...finals, categories: simplifyWeights(finals.categories).sort((a, b) => a.mp - b.mp) },
        rounding: rounding,
        letterScale: [...letterScale].sort((a, b) => a[1][1] - b[1][1]).reverse(), //need to ad shi for the new shi type shi
      }

      const tempSettings = structuredClone(settings)

      //now we examine, did shi really change? is shi rlly diff?

      if (index != -1) {
        //finals
        let flag = true

        if (JSON.stringify(courseSettings.finals) != JSON.stringify(newScale.finals)) {
          flag = false
        }

        if (flag) {
          newScale.finals = false
        }

        //letterScale
        if (JSON.stringify(tempSettings.default.letterScale) == JSON.stringify(newScale.letterScale)) {
          newScale.letterScale = false //fuck off mate
        }

        //rounding
        if (JSON.stringify(rounding) == JSON.stringify(tempSettings.default.rounding)) {
          newScale.rounding = false
        }
      }

      tempSettings[course.identifier] = newScale //cause fuck ur manual mode

      const tempGrades = await saveAndApply(tempSettings)
      if (tempGrades) {
        const ham = index != -1 ? tempGrades[period].courses[index].settings : tempSettings.default
        localStorage.removeItem('xmlCache')
        setLetterScale(ham.letterScale)
        setRounding(ham.rounding)
        setFinals(ham.finals)
        setGrades(tempGrades)
        setShowModal(false)
      } else {
        createError('Failed to sync settings with server, try again?')
      }
    } else {
      createError('Malformed Grading Scale')
    }
  }

  async function resetAllClasses() {
    const tempSettings: Settings = { mode: settings.mode, default: settings.default } as Settings
    const tempGrades = await saveAndApply(tempSettings)
    if (tempGrades) {
      setShowModal(false)
    } else {
      createError('Failed to Sync Changes with Server')
    }
  }

  type field = 'finals' | 'letter' | 'rounding' | 'semester'

  async function showDefaults(field) {
    if (index != -1) {
      //@ts-ignore
      let hoopDreams = initalizeFinals2(
        grades,
        { mode: settings.mode, default: settings.default },
        course.identifier
      ).finals
      const template = { ...settings.default, finals: hoopDreams }
      if (field == 'finals') {
        console.log(template['finals'], 'rock lobster')
        setFinals(template['finals'])
      } else if (field == 'letter') {
        setLetterScale(template['letterScale'])
      } else if (field == 'rounding') {
        setRounding(template['rounding'])
      } else {
        const temp = structuredClone(finals)
        //@ts-ignore
        const defSem = initalizeFinals2(grades, { mode: settings.mode, default: settings.default }, course.identifier)
          .finals.semesters
        temp.semesters = defSem
        setFinals(temp)
      }
    } else {
      //template finals

      const result = await getSettings(client.district, 'pleaseGodLetNobodySomehowMagicallyHashToThisHashOrItBreaks')
      if (!result.status) {
        createError('Failed to fetch Default Settings')
      } else {
        const countyDefault = result.settings.default
        if (field == 'letter') {
          setLetterScale(countyDefault['letterScale'])
        } else if (field == 'rounding') {
          setRounding(countyDefault['rounding'])
        } else if (field == 'finals') {
          //this CANNOT happen. and will not happen. wait. yes it can. NOOOOOOO
          setFinals(templateFinals(settings.mode, grades[0].periods))
        }
      }
    }
  }

  function validate() {
    console.log('spongebob my boy what the fuck is up')
    let temp = structuredClone(letterScale)
    for (var i = 0; i < temp.length; i++) {
      temp[i][1].sort()
    }

    //consisteny of order
    const raw = temp
      .map((letter) => letter[1])
      .flat()
      .sort((a, b) => a - b)
    for (var i = raw.length - 1; i > 1; i -= 2) {
      if (
        temp.findIndex((letter) => letter[1].includes(raw[i])) !=
        temp.findIndex((letter) => letter[1].includes(raw[i - 1]))
      ) {
        console.log(
          'failed consitency of order',
          i,
          raw,
          temp.findIndex((letter) => letter[1].includes(raw[i])),
          temp.findIndex((letter) => letter[1].includes(raw[i - 1]))
        )

        return false
      }
    }

    //duplicate check
    if (hasDuplicatesSorted(raw)) {
      console.log('failed duplicate check')
      return false
    }

    return true
  }

  //helper function, most efficient
  function hasDuplicatesSorted(arr) {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] === arr[i - 1]) return true
    }
    return false
  }

  function addGradesCategory() {
    const courseCats = structuredClone((course as Course).categories)
    courseCats.push({
      name: 'Category ' + (courseCats.length + 1),
      weight: 0,
      grade: { letter: 'N/A', raw: NaN, color: 'gray' },
      points: { earned: 0, possible: 0 },
    })
    const copy = structuredClone(grades)
    copy[period].courses[index].categories = courseCats
    setGrades(copy)
  }

  function deleteCourseCategory(i) {
    const x = structuredClone(grades)
    const z = x[period].courses[index]
    ;(z as Course).assignments = (z as Course).assignments.filter(
      (assignment) => assignment.category != (z as Course).categories[i].name
    )
    ;(z as Course).categories.splice(i, 1)
    setGrades(x)
  }

  return (
    <div>
      {letterScale != undefined ? (
        <Modal show={showModal} onClose={() => setShowModal(false)} className={!isMediumOrLarger && `bg-transparent`}>
          <Modal.Header className="dark:bg-gray-700">
            <p className="text-2xl">
              Grade Calculation Settings{' '}
              <span style={{ textOverflow: 'ellipsis' }} className="text-sm">
                {course.name}
              </span>
            </p>
            {index == -1 && <p className="text-sm">Changes here will be the default for all your classes!</p>}
          </Modal.Header>

          <Modal.Body style={{ maxHeight: isMediumOrLarger ? 400 : 500, minHeight: 400 }} className="overflow-y-auto">
            {
              //Settings Select Page

              true && (
                <>
                  <AnimatePresence mode="wait" initial={false} key="urMom">
                    {currentView == 'home' && (
                      <motion.div key="home" className="flex flex-col gap-4">
                        <React.Fragment key="dont fw me twin">
                          <motion.button
                            {...animationPropsHome}
                            key="letter"
                            style={{ borderWidth: 1 }}
                            onClick={() => {
                              setViewStack(['letter'])
                            }}
                            className="w-full rounded-lg border-gray-400 bg-neutral-50 p-2 text-left text-lg font-semibold hover:bg-neutral-100 dark:border-gray-500 dark:bg-[#2d3847] dark:text-white dark:hover:bg-gray-800"
                          >
                            <div className="flex items-center justify-between">
                              Letter Scale
                              <HiArrowCircleRight />
                            </div>
                          </motion.button>

                          {!mcps && (
                            <motion.button
                              {...animationPropsHome}
                              key="finals"
                              onClick={() => {
                                setViewStack(['finals'])
                              }}
                              style={{ borderWidth: 1 }}
                              className="w-full rounded-lg border-gray-400 bg-neutral-50 p-2 text-left text-lg font-semibold hover:bg-neutral-100 dark:border-gray-500 dark:bg-[#2d3847] dark:text-white dark:hover:bg-gray-800"
                            >
                              <div className="flex items-center justify-between">
                                Final Grade
                                <HiArrowCircleRight />
                              </div>
                            </motion.button>
                          )}

                          {mcps && (
                            <motion.button
                              {...animationPropsHome}
                              key="semester"
                              style={{ borderWidth: 1 }}
                              onClick={() => {
                                setViewStack(['semester'])
                              }}
                              className="w-full rounded-lg border-gray-400 bg-neutral-50 p-2 text-left text-lg font-semibold hover:bg-neutral-100 dark:border-gray-500 dark:bg-[#2d3847] dark:text-white dark:hover:bg-gray-800"
                            >
                              <div className="flex items-center justify-between">
                                Semester Grade
                                <HiArrowCircleRight />
                              </div>
                            </motion.button>
                          )}

                          {
                            //@ts-expect-error
                            client.guest && index != -1 && (
                              <motion.button
                                {...animationPropsHome}
                                key="cats"
                                onClick={() => {
                                  setViewStack(['cats'])
                                }}
                                style={{ borderWidth: 1 }}
                                className="w-full rounded-lg border-gray-400 bg-neutral-50 p-2 text-left text-lg font-semibold hover:bg-neutral-100 dark:border-gray-500 dark:bg-[#2d3847] dark:text-white dark:hover:bg-gray-800"
                              >
                                <div className="flex items-center justify-between">
                                  Categories
                                  <HiArrowCircleRight />
                                </div>
                              </motion.button>
                            )
                          }
                        </React.Fragment>
                      </motion.div>
                    )}

                    {
                      //Letter Scale Page
                      currentView == 'letter' && (
                        <motion.div {...animationPropsPage} key="letterPage">
                          <React.Fragment key="splat">
                            <div className="mb-3 flex items-center justify-between">
                              <button
                                style={{ borderWidth: 1, padding: 5, borderRadius: 12 }}
                                className="-ml-3 border-neutral-200 bg-neutral-50 text-lg font-semibold hover:bg-neutral-100 dark:border-gray-500 dark:bg-[#2d3847] dark:text-white dark:hover:bg-gray-800"
                                onClick={() => {
                                  setViewStack(['home'])
                                }}
                              >
                                <div className="flex items-center">
                                  <HiArrowCircleLeft />
                                  <p>Back</p>
                                </div>
                              </button>
                              {!isMediumOrLarger && <p className="text-xl font-bold dark:text-white">Letter Scale</p>}
                            </div>

                            {isMediumOrLarger && (
                              <p className="mb-2 text-lg font-semibold dark:text-white">Letter Scale</p>
                            )}

                            <div
                              style={{ maxHeight: 350 }}
                              className="flex w-full justify-center overflow-x-auto overflow-y-auto rounded-lg border border-gray-600"
                            >
                              <table className="mx-auto min-w-max flex-1 text-left">
                                {/* ── header ─────────────────────────────────────────── */}
                                <thead>
                                  <tr className="text-white md:text-xl dark:bg-slate-700">
                                    <th className="px-4 py-2 font-semibold text-black dark:text-white">Letter</th>
                                    <th className="px-4 py-2 font-semibold text-black dark:text-white">Lower</th>
                                    <th className="px-4 py-2 font-semibold text-black dark:text-white">Upper</th>

                                    {
                                      /* empty heading to keep the delete column aligned */
                                      isMediumOrLarger && <th className="px-4 py-2" />
                                    }
                                  </tr>
                                </thead>

                                {/* ── body ───────────────────────────────────────────── */}
                                <tbody>
                                  {letterScale.map((letter, i) => (
                                    <React.Fragment key={`${i}--23`}>
                                      <tr
                                        className={i % 2 === 0 ? 'bg-neutral-100 dark:bg-gray-900' : 'dark:bg-gray-800'}
                                      >
                                        {/* letter cell */}
                                        <td className="px-4 py-2">
                                          <div style={{ alignItems: 'center' }} className="-ml-2 -mt-1 flex">
                                            <input
                                              type="text"
                                              key={`${i}-0`}
                                              value={active[0] == `${i}-0` ? active[1] : letter[0]}
                                              onChange={(e) => {
                                                setActive([`${i}-0`, e.target.value])
                                              }}
                                              onBlur={(e) => {
                                                setActive(['', ''])
                                                mutate(e, i, 0)
                                              }}
                                              style={{
                                                borderRadius: 10,
                                                marginRight: 5,
                                                padding: 0,
                                                textOverflow: 'ellipsis',
                                              }}
                                              className="w-12 rounded-lg bg-transparent text-center font-bold focus:border-zinc-700 focus:ring-zinc-700 md:text-lg dark:text-white dark:focus:border-zinc-700 dark:focus:ring-zinc-700"
                                            ></input>
                                            <input
                                              className="w-6 bg-transparent"
                                              type="color"
                                              key={`${i}-0.5`}
                                              value={
                                                active[0] == `${i}-0.5`
                                                  ? active[1]
                                                  : letter[2] || colorShit[letterGradeColor(letter[0])]
                                              }
                                              onChange={(e) => {
                                                setActive([`${i}-0.5`, e.target.value])
                                              }}
                                              onBlur={(e) => {
                                                setActive(['', ''])
                                                mutate(e, i, 2)
                                              }}
                                            ></input>
                                          </div>
                                        </td>

                                        {/* upper‑bound input */}
                                        <td className="px-4 py-2">
                                          <input
                                            type="number"
                                            key={`${i}-1`}
                                            value={active[0] == `${i}-1` ? active[1] : letter[1][0]}
                                            onBlur={(e) => {
                                              setActive(['', ''])
                                              mutate2(e, i, 0)
                                            }}
                                            onChange={(e) => {
                                              setActive([`${i}-1`, e.target.value])
                                            }}
                                            className="w-16 rounded-lg border border-gray-300 bg-transparent p-1.5 text-right font-bold outline-none focus:border-zinc-900 focus:ring-zinc-900 md:w-24 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:border-zinc-700 dark:focus:ring-zinc-700"
                                          />
                                        </td>

                                        {/* lower‑bound input */}
                                        <td className="px-4 py-2">
                                          <input
                                            type="number"
                                            value={active[0] == `${i}-2` ? active[1] : letter[1][1]}
                                            key={`${i}-2`}
                                            onBlur={(e) => {
                                              setActive(['', ''])
                                              mutate2(e, i, 1)
                                            }}
                                            onChange={(e) => {
                                              setActive([`${i}-2`, e.target.value])
                                            }}
                                            className="w-16 rounded-lg border border-gray-300 bg-transparent p-1.5 text-right font-bold outline-none focus:border-zinc-900 focus:ring-zinc-900 md:w-24 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:border-zinc-700 dark:focus:ring-zinc-700"
                                          />
                                        </td>

                                        {
                                          /* delete button */
                                          isMediumOrLarger && (
                                            <td className="px-4 py-2">
                                              <button
                                                onClick={() => {
                                                  deleteLetter(i)
                                                }}
                                                className="my-1 flex items-center gap-1 rounded-lg bg-zinc-700 px-2 py-2 text-xs font-medium text-white hover:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-300 sm:text-sm dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800"
                                              >
                                                <HiOutlineTrash size="1.2rem" />
                                              </button>
                                            </td>
                                          )
                                        }
                                      </tr>
                                      {!isMediumOrLarger && (
                                        <tr
                                          className={
                                            i % 2 === 0 ? 'bg-neutral-100 dark:bg-gray-900' : 'dark:bg-gray-800'
                                          }
                                        >
                                          <td colSpan={4}>
                                            <button
                                              onClick={() => {
                                                deleteLetter(i)
                                              }}
                                              className="-mt-3 mb-2 ml-2 flex items-center gap-1 rounded-lg bg-zinc-700 px-1 text-xs font-medium text-white hover:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-300 sm:text-sm dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800"
                                            >
                                              <p className="dark:text-white">Delete</p>
                                            </button>
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="mt-2 flex justify-between">
                              <button
                                className="md:text- rounded-lg bg-zinc-700 p-2 px-2 text-sm text-white hover:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-300 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800"
                                onClick={addLetter}
                              >
                                Add+
                              </button>
                              <button
                                type="button"
                                className="md:text- rounded-lg bg-zinc-900 p-2 text-sm text-white hover:bg-zinc-800 active:bg-zinc-700"
                                style={{}}
                                onClick={() => {
                                  showDefaults('letter')
                                }}
                              >
                                {'Show Defaults'}
                              </button>
                            </div>

                            {
                              //advanced letter scale
                            }
                            <details className="hideCarat" onToggle={() => setAdvancedOpen(!advancedOpen)}>
                              <summary className="mt-2 flex items-center dark:text-white">
                                {advancedOpen ? <HiArrowCircleDown size={20} /> : <HiArrowCircleRight size={20} />}
                                <p className="text-lg dark:text-white">Advanced</p>
                              </summary>

                              <div className="ml-7 flex-col md:flex-row">
                                <div style={{ alignItems: 'center' }} className="flex gap-2">
                                  <p className="dark:text-white">Rounding Enabled</p>
                                  <input
                                    type="checkbox"
                                    onChange={(e) => {
                                      setRounding((prev) => {
                                        let temp = structuredClone(prev)
                                        temp.percent = !temp.percent
                                        return temp
                                      })
                                    }}
                                    checked={rounding.percent}
                                  ></input>
                                </div>
                                <div style={{ alignItems: 'center' }} className="mt-3 flex gap-2">
                                  <p className="dark:text-white">Round up to:</p>
                                  <input
                                    className="hide-spinner h-5 w-10 rounded-lg bg-neutral-100 dark:bg-gray-600 dark:text-white"
                                    step="1"
                                    type="number"
                                    onBlur={(e) =>
                                      setRounding((prev) => {
                                        let temp = structuredClone(prev)
                                        temp.percentPlaces = decimalPlaces
                                        return temp
                                      })
                                    }
                                    onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}
                                    value={decimalPlaces ?? rounding.percentPlaces}
                                  />
                                  <p className="dark:text-white">decimal places</p>
                                </div>
                                {/*  <div style={{alignItems:"center"}} className="mt-3 flex gap-3  justify-center -ml-7">
        <div  style={{alignItems:"center"}} className="flex gap-2"> <p className="dark:text-white text-sm">Round Up</p> <input   type="radio"></input></div>
        <div style={{alignItems:"center"}} className="flex gap-2"> <p className="dark:text-white text-sm">Round Down</p> <input   type="radio"></input></div>
    </div> */}

                                <button
                                  type="button"
                                  className="mt-2 rounded-lg bg-zinc-900 px-2 py-1 text-sm text-white hover:bg-zinc-800 active:bg-zinc-700"
                                  style={{}}
                                  onClick={() => {
                                    showDefaults('rounding')
                                  }}
                                >
                                  Reset
                                </button>
                              </div>
                            </details>
                          </React.Fragment>
                        </motion.div>
                      )
                    }

                    {
                      //Final Grade Page finals page
                      currentView == 'finals' && (
                        <motion.div {...animationPropsPage} key="finalsPage">
                          <React.Fragment key="finals say what?">
                            <div className="mb-3 flex items-center justify-between">
                              <button
                                style={{ borderWidth: 1, padding: 5, borderRadius: 12 }}
                                className="-ml-3 border-neutral-200 bg-neutral-50 text-lg font-semibold hover:bg-neutral-100 dark:border-gray-500 dark:bg-[#2d3847] dark:text-white dark:hover:bg-gray-800"
                                onClick={() => {
                                  setViewStack(['home'])
                                }}
                              >
                                <div className="flex items-center">
                                  <HiArrowCircleLeft />
                                  <p>Back</p>
                                </div>
                              </button>
                              {!isMediumOrLarger && (
                                <p className="text-xl font-bold dark:text-white">Final Grade Categories</p>
                              )}
                            </div>

                            {isMediumOrLarger && (
                              <p className="mb-2 text-lg font-semibold dark:text-white">Final Grade Categories</p>
                            )}

                            <div style={{ alignItems: 'center' }} className="flex gap-2">
                              <p className="dark:text-white">Show Final Grade</p>
                              <input
                                type="checkbox"
                                onChange={(e) => {
                                  let temp = structuredClone(finals)
                                  temp.show = !temp.show
                                  setFinals(temp)
                                }}
                                checked={finals.show}
                                disabled={finals.isSemester}
                              ></input>
                            </div>

                            <div
                              style={{ maxHeight: 350 }}
                              className="-ml-2 mt-2 overflow-x-auto overflow-y-auto rounded-lg border border-gray-600"
                            >
                              <table className="w-full">
                                <thead>
                                  <tr className="dark:bg-slate-700">
                                    <th style={{ textAlign: 'center' }} className="py-2 dark:text-white">
                                      Type
                                    </th>
                                    <th style={{ textAlign: 'center' }} className="py-2 dark:text-white">
                                      Marking Period
                                    </th>
                                    {(settings.mode != 'mcps' || modify) && (
                                      <th style={{ textAlign: 'center' }} className="py-2 dark:text-white">
                                        Course
                                      </th>
                                    )}
                                    <th style={{ textAlign: 'center' }} className="py-2 pr-4 md:pr-0 dark:text-white">
                                      Weight
                                    </th>
                                    {isMediumOrLarger && (
                                      <th style={{ textAlign: 'center' }} className="py-2 dark:text-white"></th>
                                    )}
                                  </tr>
                                </thead>

                                <tbody>
                                  {finals.categories.map((f, i) => (
                                    <React.Fragment key={i}>
                                      <tr
                                        className={i % 2 === 0 ? 'bg-neutral-100 dark:bg-gray-900' : 'dark:bg-gray-800'}
                                      >
                                        <td style={{ textAlign: 'center' }}>
                                          {
                                            //temporarily doing this really stupidly
                                          }
                                          <select
                                            disabled={finals.isSemester}
                                            value={f.type}
                                            onChange={(e) => {
                                              let temp = structuredClone(finals)
                                              //@ts-ignore
                                              temp.categories[i].type = e.target.value
                                              setFinals(temp)
                                            }}
                                            className="border-0 bg-transparent focus:outline-none focus:ring-0 dark:text-white"
                                          >
                                            <option className="bg-gray-600" value="course">
                                              Course
                                            </option>
                                            <option className="bg-gray-600" value="exam">
                                              Exam
                                            </option>
                                          </select>
                                        </td>

                                        <td style={{ textAlign: 'center' }}>
                                          <select
                                            value={f.mp}
                                            disabled={finals.isSemester}
                                            onChange={(e) => {
                                              let temp = structuredClone(finals)
                                              temp.categories[i].mp = parseInt(e.target.value)
                                              const index = grades[parseInt(e.target.value)].courses.findIndex(
                                                (c) => c.identifier == course.identifier
                                              )
                                              temp.categories[i].courseIndex = index != -1 ? index : NaN
                                              let t = temp.categories[i]
                                              setFinals(temp)
                                            }}
                                            className="text-elipses border-0 bg-transparent focus:outline-none focus:ring-0 dark:text-white"
                                          >
                                            {grades?.[period]?.periods.map((p) => (
                                              <option className="bg-gray-600" key={p.index} value={p.index}>
                                                {p.name}
                                              </option>
                                            ))}
                                          </select>
                                        </td>

                                        {(settings.mode != 'mcps' || modify) && (
                                          <td style={{ textAlign: 'center' }}>
                                            <select
                                              value={f.courseIndex}
                                              //     disabled={settings.mode=="automatic"} why have it at all if we disabling it tbh
                                              className={`bg-transparent ${true ? 'text-gray-500' : 'dark:text-white'} border-0 focus:outline-none focus:ring-0`}
                                              onChange={(e) => {
                                                let temp = structuredClone(finals)
                                                temp.categories[i].courseIndex = parseInt(e.target.value)
                                                let t = temp.categories[i]
                                                setFinals(temp)
                                              }}
                                            >
                                              <option className="bg-gray-600" value={NaN}>
                                                Auto/Unknown
                                              </option>
                                              {grades[f.mp].courses.map((c, j) => (
                                                <option className="bg-gray-600" key={j} value={j}>
                                                  {c.name.trim()}
                                                </option>
                                              ))}
                                            </select>
                                          </td>
                                        )}

                                        <td style={{ textAlign: 'center' }}>
                                          <div className="mt-2 flex items-center text-center md:ml-5 dark:text-white">
                                            <input
                                              type="text"
                                              disabled={finals.isSemester}
                                              className={`w-12 bg-transparent ${finals.isSemester ? 'text-gray-400' : 'dark:text-white'} rounded-lg border-none p-0 focus:outline-none focus:ring-1 focus:ring-zinc-700 md:ml-5`}
                                              onFocus={(e) => setKill([i, e.target.value.replaceAll('%', '')])}
                                              onChange={(e) => {
                                                setKill([i, e.target.value.replaceAll('%', '')])
                                              }}
                                              onBlur={(e) => {
                                                let temp = structuredClone(finals)
                                                temp.categories[i].weight =
                                                  parseFloat(e.target.value.replaceAll('%', '')) / 100
                                                setFinals(temp)
                                                setKill([NaN, ''])
                                              }}
                                              value={kill[0] == i ? kill[1] : Number((f.weight * 100).toFixed(4)) + '%'}
                                            />
                                          </div>
                                        </td>

                                        {isMediumOrLarger && (
                                          <td>
                                            <button
                                              disabled={finals.isSemester}
                                              onClick={() => {
                                                deleteFinalCategory(i)
                                              }}
                                              className={`my-1 flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium hover:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-300 ${finals.isSemester ? 'bg-zinc-800 text-gray-400' : 'bg-zinc-700 text-white dark:bg-zinc-900'} sm:text-sm dark:hover:bg-zinc-800 dark:focus:ring-zinc-800`}
                                            >
                                              <HiOutlineTrash size="1.2rem" />
                                            </button>
                                          </td>
                                        )}
                                      </tr>

                                      {!isMediumOrLarger && (
                                        <tr
                                          className={
                                            i % 2 === 0 ? 'bg-neutral-100 dark:bg-gray-900' : 'dark:bg-gray-800'
                                          }
                                        >
                                          <td colSpan={settings.mode != 'mcps' || modify ? 3 : 4}>
                                            <button
                                              onClick={() => {
                                                deleteFinalCategory(i)
                                              }}
                                              disabled={finals.isSemester}
                                              className={`-mt-1 mb-1 ml-2 flex items-center gap-1 rounded-lg px-1 text-xs font-medium text-white hover:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-300 ${finals.isSemester ? 'bg-zinc-800' : 'bg-zinc-700 dark:bg-zinc-900'} sm:text-sm dark:hover:bg-zinc-800 dark:focus:ring-zinc-800`}
                                            >
                                              <p
                                                className={`${finals.isSemester ? 'text-gray-400' : 'dark:text-white'}`}
                                              >
                                                Delete
                                              </p>
                                            </button>
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="flex justify-between">
                              <button
                                className={`-ml-2 mt-2 p-2 px-2 ${finals.isSemester ? 'bg-zinc-900 text-gray-400' : 'bg-zinc-700 text-white'} rounded-lg text-sm hover:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800`}
                                disabled={finals.isSemester}
                                onClick={() => {
                                  addFinalCategory()
                                }}
                              >
                                Add+
                              </button>

                              <button
                                disabled={finals.isSemester}
                                className={`-ml-2 mt-2 p-2 px-2 ${finals.isSemester ? 'bg-zinc-900 text-gray-400' : 'bg-zinc-700 text-white'} rounded-lg text-sm hover:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800`}
                                onClick={() => {
                                  showDefaults('finals')
                                }}
                              >
                                Show Defaults
                              </button>
                            </div>
                          </React.Fragment>
                        </motion.div>
                      )
                    }

                    {
                      //Semester Grades page
                      currentView == 'semester' && (
                        <motion.div {...animationPropsPage} key="semesterPage">
                          <React.Fragment key="semester says what?">
                            <div className="mb-3 flex items-center justify-between">
                              <button
                                style={{ borderWidth: 1, padding: 5, borderRadius: 12 }}
                                className="-ml-3 border-neutral-200 bg-neutral-50 text-lg font-semibold hover:bg-neutral-100 dark:border-gray-500 dark:bg-[#2d3847] dark:text-white dark:hover:bg-gray-800"
                                onClick={() => {
                                  setViewStack(['home'])
                                }}
                              >
                                <div className="flex items-center">
                                  <HiArrowCircleLeft />
                                  <p>Back</p>
                                </div>
                              </button>
                              {!isMediumOrLarger && <p className="text-xl font-bold dark:text-white">Semesters</p>}
                            </div>

                            {isMediumOrLarger && (
                              <p className="mb-2 text-lg font-semibold dark:text-white">Semesters</p>
                            )}

                            {finals.semesters.map((semester, j) => {
                              if (semester == null) {
                                return null
                              }
                              return (
                                <div className="mb-8" key={j}>
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-semibold dark:text-white">
                                        {ordinalSuffix(j + 1) + ' Semester'}
                                      </p>
                                      <div style={{ alignItems: 'center' }} className="flex gap-2">
                                        <p className="text-sm dark:text-white">Show Semester Grade</p>
                                        <input
                                          type="checkbox"
                                          onChange={(e) => {
                                            let temp = structuredClone(finals)
                                            temp.semesters[j].show = !semester.show
                                            setFinals(temp)
                                          }}
                                          checked={semester.show}
                                        ></input>
                                      </div>
                                    </div>
                                  </div>

                                  <div
                                    style={{ maxHeight: 350 }}
                                    className="-ml-2 mt-2 overflow-x-auto overflow-y-auto rounded-lg border border-gray-600"
                                  >
                                    <table className="w-full">
                                      <thead>
                                        <tr className="dark:bg-slate-700">
                                          <th style={{ textAlign: 'center' }} className="py-2 dark:text-white">
                                            Type
                                          </th>
                                          <th style={{ textAlign: 'center' }} className="py-2 dark:text-white">
                                            Marking Period
                                          </th>
                                          {(settings.mode != 'mcps' || modify) && (
                                            <th style={{ textAlign: 'center' }} className="py-2 dark:text-white">
                                              Course
                                            </th>
                                          )}
                                          <th
                                            style={{ textAlign: 'center' }}
                                            className="py-2 pr-4 md:pr-0 dark:text-white"
                                          >
                                            Weight
                                          </th>
                                          {isMediumOrLarger && (
                                            <th style={{ textAlign: 'center' }} className="py-2 dark:text-white"></th>
                                          )}
                                        </tr>
                                      </thead>

                                      <tbody>
                                        {semester.categories.map((f, i) => (
                                          <React.Fragment key={i}>
                                            <tr
                                              className={
                                                i % 2 === 0 ? 'bg-neutral-100 dark:bg-gray-900' : 'dark:bg-gray-800'
                                              }
                                            >
                                              <td style={{ textAlign: 'center' }}>
                                                {
                                                  //temporarily doing this really stupidly
                                                }
                                                <select
                                                  value={f.type}
                                                  onChange={(e) => {
                                                    let temp = structuredClone(finals)
                                                    //@ts-ignore
                                                    temp.semesters[j].categories[i].type = e.target.value
                                                    setFinals(temp)
                                                  }}
                                                  className="border-0 bg-transparent focus:outline-none focus:ring-0 dark:text-white"
                                                >
                                                  <option className="bg-gray-600" value="course">
                                                    Course
                                                  </option>
                                                  <option className="bg-gray-600" value="exam">
                                                    Exam
                                                  </option>
                                                </select>
                                              </td>

                                              <td style={{ textAlign: 'center' }}>
                                                <select
                                                  value={f.mp}
                                                  onChange={(e) => {
                                                    let temp = structuredClone(finals)
                                                    temp.semesters[j].categories[i].mp = parseInt(e.target.value)
                                                    const index = grades[parseInt(e.target.value)].courses.findIndex(
                                                      (c) => c.identifier == course.identifier
                                                    )
                                                    temp.semesters[j].categories[i].courseIndex =
                                                      index != -1 ? index : NaN
                                                    setFinals(temp)
                                                  }}
                                                  className="text-elipses border-0 bg-transparent focus:outline-none focus:ring-0 dark:text-white"
                                                >
                                                  {grades?.[period]?.periods.map((p) => (
                                                    <option className="bg-gray-600" key={p.index} value={p.index}>
                                                      {p.name}
                                                    </option>
                                                  ))}
                                                </select>
                                              </td>

                                              {(settings.mode != 'mcps' || modify) && (
                                                <td style={{ textAlign: 'center' }}>
                                                  <select
                                                    value={f.courseIndex}
                                                    //     disabled={settings.mode=="automatic"} why have it at all if we disabling it tbh
                                                    className={`bg-transparent ${true ? 'text-gray-500' : 'dark:text-white'} border-0 focus:outline-none focus:ring-0`}
                                                    onChange={(e) => {
                                                      let temp = structuredClone(finals)
                                                      temp.semesters[j].categories[i].courseIndex = parseInt(
                                                        e.target.value
                                                      )
                                                      setFinals(temp)
                                                    }}
                                                  >
                                                    <option className="bg-gray-600" value={NaN}>
                                                      Auto/Unknown
                                                    </option>
                                                    {grades[f.mp].courses.map((c, k) => (
                                                      <option className="bg-gray-600" key={k} value={k}>
                                                        {c.name.trim()}
                                                      </option>
                                                    ))}
                                                  </select>
                                                </td>
                                              )}

                                              <td style={{ textAlign: 'center' }}>
                                                <div className="mt-2 flex items-center text-center md:ml-5 dark:text-white">
                                                  <input
                                                    className="w-12 rounded-lg border-none bg-transparent p-0 focus:outline-none focus:ring-1 focus:ring-zinc-700 md:ml-5 dark:text-white"
                                                    type="text"
                                                    onFocus={(e) => setKill([i, e.target.value.replaceAll('%', '')])}
                                                    onChange={(e) => {
                                                      setKill([i, e.target.value.replaceAll('%', '')])
                                                    }}
                                                    onBlur={(e) => {
                                                      let temp = structuredClone(finals)
                                                      temp.semesters[j].categories[i].weight =
                                                        parseFloat(e.target.value.replaceAll('%', '')) / 100
                                                      setFinals(temp)
                                                      setKill([NaN, ''])
                                                    }}
                                                    value={
                                                      kill[0] == i ? kill[1] : Number((f.weight * 100).toFixed(4)) + '%'
                                                    }
                                                  />
                                                </div>
                                              </td>

                                              {isMediumOrLarger && (
                                                <td>
                                                  <button
                                                    onClick={() => {
                                                      deleteSemesterCategory(j, i)
                                                    }}
                                                    className="my-1 flex items-center gap-1 rounded-lg bg-zinc-700 px-2 py-2 text-xs font-medium text-white hover:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-300 sm:text-sm dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800"
                                                  >
                                                    <HiOutlineTrash size="1.2rem" />
                                                  </button>
                                                </td>
                                              )}
                                            </tr>

                                            {!isMediumOrLarger && (
                                              <tr
                                                className={
                                                  i % 2 === 0 ? 'bg-neutral-100 dark:bg-gray-900' : 'dark:bg-gray-800'
                                                }
                                              >
                                                <td colSpan={settings.mode != 'mcps' ? 3 : 4}>
                                                  <button
                                                    onClick={() => {
                                                      deleteSemesterCategory(j, i)
                                                    }}
                                                    className="-mt-1 mb-1 ml-2 flex items-center gap-1 rounded-lg bg-zinc-700 px-1 text-xs font-medium text-white hover:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-300 sm:text-sm dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800"
                                                  >
                                                    <p className="dark:text-white">Delete</p>
                                                  </button>
                                                </td>
                                              </tr>
                                            )}
                                          </React.Fragment>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  <div className="flex justify-between">
                                    <button
                                      className="-ml-2 mt-2 rounded-lg bg-zinc-700 p-2 px-2 text-sm text-white hover:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800"
                                      onClick={() => {
                                        addSemesterCategory(j)
                                      }}
                                    >
                                      Add+
                                    </button>

                                    <button
                                      className="-ml-2 mt-2 rounded-lg bg-zinc-700 p-2 px-2 text-sm text-white hover:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800"
                                      onClick={() => {
                                        showDefaults('semester')
                                      }}
                                    >
                                      Show Defaults
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </React.Fragment>
                        </motion.div>
                      )
                    }

                    {
                      //Categories Page
                      currentView == 'cats' && index != -1 && (
                        <>
                          <motion.div {...animationPropsPage} key="catsPage">
                            <div className="mb-3 flex items-center justify-between">
                              <button
                                style={{ borderWidth: 1, padding: 5, borderRadius: 12 }}
                                className="-ml-3 border-neutral-200 bg-neutral-50 text-lg font-semibold hover:bg-neutral-100 dark:border-gray-500 dark:bg-[#2d3847] dark:text-white dark:hover:bg-gray-800"
                                onClick={() => {
                                  setViewStack(['home'])
                                }}
                              >
                                <div className="flex items-center">
                                  <HiArrowCircleLeft />
                                  <p>Back</p>
                                </div>
                              </button>
                              {false && <p className="text-xl font-bold dark:text-white">Categories</p>}
                            </div>

                            {true && <p className="mb-2 text-lg font-semibold dark:text-white">Categories</p>}

                            <div className="relative flex w-fit flex-col gap-1">
                              <p className="text-sm dark:text-white">Marking Period</p>
                              <select
                                value={period}
                                className="ring-0! -ml-1.5 w-fit rounded-lg border bg-transparent text-sm outline-none focus:border-zinc-700 dark:text-white"
                              >
                                {grades[0].periods.map((mp, k) => {
                                  return (
                                    <option className="bg-gray-600" key={k} value={mp.index}>
                                      {mp.name}
                                    </option>
                                  )
                                })}
                              </select>
                            </div>

                            <div
                              style={{ maxHeight: 350 }}
                              className="-ml-2 mt-2 overflow-x-auto overflow-y-auto rounded-lg border border-gray-600"
                            >
                              <table className="w-full">
                                <thead>
                                  <tr className="dark:bg-slate-700">
                                    <th style={{ textAlign: 'center' }} className="py-2 dark:text-white">
                                      Name
                                    </th>
                                    <th style={{ textAlign: 'center' }} className="py-2 pr-4 md:pr-0 dark:text-white">
                                      Weight
                                    </th>
                                    {true && <th style={{ textAlign: 'center' }} className="py-2 dark:text-white"></th>}
                                  </tr>
                                </thead>

                                <tbody>
                                  {
                                    //@ts-ignore idk why it's going off here, the index!=-1 ensures that it would be fine
                                    course.categories.map((f, i) => (
                                      <React.Fragment key={i}>
                                        <tr
                                          className={
                                            i % 2 === 0 ? 'bg-neutral-100 dark:bg-gray-900' : 'dark:bg-gray-800'
                                          }
                                        >
                                          <td style={{ textAlign: 'center', textOverflow: 'elipsis' }}>
                                            <p className="dark:text-white">{f.name}</p>
                                          </td>

                                          <td style={{ textAlign: 'center' }}>
                                            <div className="mt-2 flex items-center text-center dark:text-white">
                                              <input
                                                type="text"
                                                style={{ marginLeft: 155 }}
                                                className="w-12 rounded-lg border-none bg-transparent p-0 focus:outline-none focus:ring-1 focus:ring-zinc-700 dark:text-white"
                                                onFocus={(e) => setKill([i, e.target.value.replaceAll('%', '')])}
                                                onChange={(e) => {
                                                  setKill([i, e.target.value.replaceAll('%', '')])
                                                }}
                                                onBlur={(e) => {
                                                  //this is being re-worked to only serve the Guest page so womp womp it was deprecated before anyway
                                                  let temp = structuredClone(finals)
                                                  temp.categories[i].weight =
                                                    parseFloat(e.target.value.replaceAll('%', '')) / 100
                                                  setFinals(temp)

                                                  const fuck = structuredClone(grades)

                                                  fuck[period].courses[index].categories[i].weight =
                                                    parseFloat(e.target.value.replaceAll('%', '')) / 100
                                                  fuck[period].courses[index] = reCalculateCourse(
                                                    fuck[period].courses[index]
                                                  )
                                                  setGrades(fuck)
                                                  setKill([NaN, ''])
                                                }}
                                                value={
                                                  kill[0] == i ? kill[1] : Number((f.weight * 100).toFixed(4)) + '%'
                                                }
                                              />
                                            </div>
                                          </td>

                                          {true && (
                                            <td>
                                              <button
                                                onClick={() => {
                                                  deleteCourseCategory(i)
                                                }}
                                                className="my-1 flex items-center gap-1 rounded-lg bg-zinc-700 px-2 py-2 text-xs font-medium text-white hover:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-300 sm:text-sm dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800"
                                              >
                                                <HiOutlineTrash size="1.2rem" />
                                              </button>
                                            </td>
                                          )}
                                        </tr>

                                        {!isMediumOrLarger && (
                                          <tr
                                            className={
                                              i % 2 === 0 ? 'bg-neutral-100 dark:bg-gray-900' : 'dark:bg-gray-800'
                                            }
                                          >
                                            <td colSpan={settings.mode != 'mcps' ? 3 : 4}>
                                              <button
                                                onClick={() => {
                                                  deleteFinalCategory(i)
                                                }}
                                                className="-mt-1 mb-1 ml-2 flex items-center gap-1 rounded-lg bg-zinc-700 px-1 text-xs font-medium text-white hover:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-300 sm:text-sm dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800"
                                              >
                                                <p className="dark:text-white">Delete</p>
                                              </button>
                                            </td>
                                          </tr>
                                        )}
                                      </React.Fragment>
                                    ))
                                  }
                                </tbody>
                              </table>
                            </div>
                            <button
                              className="-ml-1.5 mt-2 rounded-lg bg-zinc-700 p-2 px-2 text-sm text-white hover:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-300 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800"
                              onClick={addGradesCategory}
                            >
                              Add+
                            </button>
                          </motion.div>
                        </>
                      )
                    }
                  </AnimatePresence>
                </>
              )
            }
          </Modal.Body>

          <Modal.Footer>
            <div className="-ml-2 flex w-full justify-start gap-5">
              <button
                className="rounded-lg bg-zinc-700 p-2 px-3 text-sm text-white hover:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-300 md:text-base dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800"
                onClick={() => {
                  saveNew()
                }}
              >
                Save
              </button>

              <button
                className="rounded-lg bg-gray-500 p-2 px-3 text-sm text-white hover:bg-gray-700 md:text-base dark:bg-gray-800 dark:hover:bg-gray-900"
                type="button"
                style={{ userSelect: 'none' }}
                onClick={() => {
                  //not yet cuz the structure doesn't match yet, but, setLetterGrade(course.gradingScale)
                  setShowModal(false)
                }}
              >
                Cancel
              </button>

              {index == -1 && (
                <button
                  type="button"
                  className="-mr-2 ml-auto rounded-lg bg-zinc-900 px-2 text-sm text-white hover:bg-zinc-800 active:bg-zinc-700 md:text-base"
                  style={{}}
                  onClick={() => {
                    resetAllClasses()
                  }}
                >
                  Reset Classes
                </button>
              )}
            </div>
          </Modal.Footer>
        </Modal>
      ) : (
        <></>
      )}
    </div>
  )
}
