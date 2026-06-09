import { useRouter } from 'next/router'
import React from 'react'

export default function NotFound() {
  const router = useRouter()

  React.useEffect(() => {
    if (window) {
      console.log(window.location.pathname)
      router.push(window.location.pathname)
    }
  }, [])

  return (
    <div className="p-5 md:p-10">
      <h1 className="text-4xl font-bold dark:text-white">404: Found Not Found</h1>
    </div>
  )
}
