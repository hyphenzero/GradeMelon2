import Cookies from 'js-cookie'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { BiSearchAlt } from 'react-icons/bi'
import StudentVue from 'studentvue'
import { AuthLayout } from '../components/auth-layout'
import { Button } from '../components/button'
import { Heading } from '../components/heading'
import { Input } from '../components/input'
import { Select } from '../components/select'
import { Text } from '../components/text'
import Modal from '../components/ui/Modal'

interface LoginProps {
  districtURL: string
  setDistrictURL: any
  client: any
  login: (username: string, password: string, save: boolean) => any
  guestLogin: () => void
  setToasts: any
  loading: boolean
  createError: (message: string) => void
  setDistricts: any
  districts: {
    address: string
    name: string
    parentVueUrl: string
    zipcode?: string
  }[]
}

export default function Login({
  login,
  client,
  districtURL,
  setDistrictURL,
  setToasts,
  loading,
  createError,
  setDistricts,
  districts,
  guestLogin,
}: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [checkbox, setCheckbox] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [zipCode, setZipCode] = useState('')
  const [trouble, setTrouble] = useState(false)

  const districtUnavailable =
    districts[districts.findIndex((d) => d.parentVueUrl === districtURL)]?.address?.includes(' GA ')

  useEffect(() => {
    if (districtUnavailable) {
      createError('Grademelon is unavailable in Georgia')
    }

    if (districtURL != 'https://md-mcps-psv.edupoint.com' && districtURL != undefined) {
      // window.location.assign("https://old.grademelon.org");
    }
  }, [districtURL])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (username == '' && password == '') {
      guestLogin()
      return
    }

    let success = await login(username, password, checkbox)
    if (!success) {
      setTrouble(true)
    }
    await setPassword('')
    if (success) {
      await setUsername('')
    }
  }

  useEffect(() => {
    if (localStorage.getItem('remember') === 'true') {
      setCheckbox(true)
    }
    if (Cookies.get('username') != undefined) {
      setUsername(Cookies.get('username'))
    }
  }, [])

  const findDistricts = async () => {
    StudentVue.findDistricts(zipCode)
      .then((res) => {
        if (res.length === 0) {
          createError('No districts found for that zip code')
          return
        } else {
          setDistricts(res)
          setDistrictURL(res[0].parentVueUrl)
        }
      })
      .catch((err) => {
        console.log(err)
        createError(err.message)
      })
  }

  return (
    <AuthLayout>
      <Head>
        <title>Login</title>
      </Head>
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>Choose School District</Modal.Header>
        <Modal.Body>
          <div>
            <div>
              <label htmlFor="zipcode" className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Zip Code
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="flex-1"
                  placeholder="20901"
                  required
                />
                <Button onClick={findDistricts} className="shrink-0">
                  <BiSearchAlt size="1.2rem" />
                </Button>
              </div>
              <div>
                <label htmlFor="districts" className="my-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  School Districts
                </label>
                <Select
                  id="districts"
                  value={districtURL}
                  onChange={(e) => {
                    setDistrictURL(e.target.value)
                  }}
                  className="w-full"
                >
                  {districts.map((district, i) => (
                    <option key={i} value={district.parentVueUrl}>
                      {district.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowModal(false)} outline>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="mx-auto flex max-w-md flex-col items-center py-10 md:pt-24">
        <div className="w-full rounded-3xl border border-zinc-200/80 bg-white/90 p-8 shadow-sm shadow-zinc-950/5 dark:border-white/10 dark:bg-zinc-900/80">
          <Heading level={1} className="mb-3 text-3xl tracking-tight">
            Sign in
          </Heading>
          <Text className="mb-6 max-w-sm">
            Use your StudentVue credentials to load your schedule, grades, and attendance.
          </Text>
          <form className="space-y-5">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Username
              </label>
              <Input
                type="text"
                value={username}
                disabled={districtUnavailable}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full"
                placeholder="123456"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Password
              </label>
              <Input
                type="password"
                disabled={districtUnavailable}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="remember"
                    aria-describedby="remember"
                    type="checkbox"
                    checked={checkbox}
                    onChange={(e) => setCheckbox(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 bg-zinc-50 text-zinc-900 focus:ring-zinc-500"
                    required
                  />
                </div>

                <div className="ml-3 text-sm">
                  <label htmlFor="remember" className="text-zinc-600 dark:text-zinc-400">
                    Remember me
                  </label>
                </div>
              </div>
            </div>
            <Button disabled={loading} type="button" onClick={() => setShowModal(true)} outline className="w-full">
              {districts[districts.findIndex((d) => d.parentVueUrl === districtURL)]?.name}
            </Button>
            <Button onClick={handleSubmit} disabled={loading || districtUnavailable} type="submit" className="w-full">
              {username == '' && password == '' ? 'Sign in as Guest' : 'Sign in'}
              {loading && (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-50" />
              )}
            </Button>
            {trouble && (
              <div className="space-y-2">
                <p className="text-center text-sm text-zinc-700 dark:text-zinc-300">
                  Having trouble logging in? Make sure you can login{' '}
                  <a target="blank" href={districtURL} className="font-medium text-zinc-900 underline">
                    here
                  </a>
                </p>

                <p className="text-center text-sm text-zinc-700 dark:text-zinc-300">
                  {"Still won't work? Try re-setting your password "}
                  <a
                    target="blank"
                    href={districtURL + '/PXP2_Password_Help.aspx'}
                    className="font-medium text-zinc-900 underline"
                  >
                    here
                  </a>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </AuthLayout>
  )
}
