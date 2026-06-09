import { useRef, useState } from 'react'

interface CategoryFieldProps {
  children: any
  value: number
  name: string
  onChange: any
}

export default function CategoryField({ children, value, name, onChange }: CategoryFieldProps) {
  const [focus, setFocus] = useState(false)
  const ref = useRef(null)

  const onFocus = async () => {
    await setFocus(true)
    await ref.current.focus()
  }

  return (
    <div onClick={() => onFocus()} onBlur={() => setFocus(false)} className="cursor-pointer">
      {!focus ? (
        name
      ) : (
        <select
          ref={ref}
          onChange={onChange}
          value={value}
          className="block w-48 rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-zinc-700 focus:ring-zinc-700 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-zinc-700 dark:focus:ring-zinc-700"
        >
          {children}
        </select>
      )}
    </div>
  )
}
