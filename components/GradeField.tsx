import { useRef, useState } from 'react'

interface GradeFieldProps {
  value: number
  onChange: any
  onBlur?: any
}

export default function GradeField({ value, onChange, onBlur = () => {} }: GradeFieldProps) {
  const [focus, setFocus] = useState(false)
  const [valasString, setValasString] = useState(value.toString())
  const ref = useRef(null)

  const onFocus = async () => {
    console.log('am I even being clicked gang?')
    setValasString(value.toString())
    await setFocus(true)
    await ref.current.focus()
  }

  const onUpdate = async (e) => {
    setValasString(e.target.value)
    await onChange(e)
  }

  async function onBlurFunc(e) {
    await onBlur(e)
  }

  return (
    <div
      onClick={onFocus}
      onBlur={() => {
        setTimeout(() => {
          setFocus(false)
        }, 100)
      }}
      className="cursor-pointer"
    >
      {!focus ? (
        <p className="w-auto p-2 text-center md:w-12">{!isNaN(value) ? value : 'NG'}</p>
      ) : (
        <input
          ref={ref}
          type="number"
          value={valasString}
          onChange={onUpdate}
          onBlur={(e) => onBlurFunc(e)}
          className="inline-block w-12 rounded-lg border-none bg-gray-50 bg-transparent p-2 text-lg text-gray-900 focus:border-zinc-700 focus:ring-zinc-700 sm:text-xs md:p-1 dark:text-white dark:focus:border-zinc-700 dark:focus:ring-zinc-700"
        />
      )}
    </div>
  )
}
