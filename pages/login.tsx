import Cookies from 'js-cookie'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { BiSearchAlt } from 'react-icons/bi'
import StudentVue from 'studentvue'
import { AuthLayout } from '../components/auth-layout'
import { Button } from '../components/button'
import { Checkbox, CheckboxField } from '../components/checkbox'
import { Field, Label } from '../components/fieldset'
import { Heading } from '../components/heading'
import { Input } from '../components/input'
import { Select } from '../components/select'
import { Strong, Text, TextLink } from '../components/text'
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
      <form onSubmit={handleSubmit} className="grid w-full max-w-sm grid-cols-1 gap-8">
        <div className="flex items-center gap-3">
          <img src="/assets/logo.png" className="size-8" alt="Grade Melon" />
          <Strong className="text-lg">Grade Melon</Strong>
        </div>
        <div>
          <Heading>Sign in to your account</Heading>
          <Text className="mt-2">Use your StudentVue credentials to load your classes, grades, and attendance.</Text>
        </div>
        <Field>
          <Label>Username</Label>
          <Input
            type="text"
            name="username"
            value={username}
            disabled={districtUnavailable}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Field>
        <Field>
          <Label>Password</Label>
          <Input
            type="password"
            name="password"
            disabled={districtUnavailable}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <div className="flex items-center justify-between gap-4">
          <CheckboxField>
            <Checkbox checked={checkbox} onChange={setCheckbox} name="remember" />
            <Label>Remember me</Label>
          </CheckboxField>
          <Text>
            <TextLink href={districtURL + '/PXP2_Password_Help.aspx'} target="blank">
              <Strong>Forgot password?</Strong>
            </TextLink>
          </Text>
        </div>
        <Button disabled={loading} type="button" onClick={() => setShowModal(true)} outline className="w-full">
          {districts[districts.findIndex((d) => d.parentVueUrl === districtURL)]?.name}
        </Button>
        <Button disabled={loading || districtUnavailable} type="submit" className="w-full">
          {username == '' && password == '' ? 'Sign in as guest' : 'Sign in'}
          {loading && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-50" />
          )}
        </Button>
        {trouble && (
          <Text>
            Having trouble? Confirm you can sign in at{' '}
            <TextLink target="blank" href={districtURL}>
              <Strong>StudentVue</Strong>
            </TextLink>
            .
          </Text>
        )}
      </form>
    </AuthLayout>
  )
}
