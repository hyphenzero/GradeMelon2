import { useEffect, useState } from 'react'
import GuestModal from '../../components/guestModal'
import Grades from '../grades'

export default function GuestGrades(props) {
  const [showGuestModal, setShowGuestModal] = useState(false)
  const { client, guestLogin, setModalBg } = props

  useEffect(() => {
    if (client == undefined) {
      guestLogin()
    }
  }, [client, guestLogin])

  useEffect(() => {
    if (localStorage.getItem('guestModal') != 'true') {
      setShowGuestModal(true)
    }
  }, [])

  useEffect(() => {
    setModalBg(showGuestModal)
  }, [setModalBg, showGuestModal])

  return (
    <>
      <GuestModal showModal={showGuestModal} setShowModal={setShowGuestModal} />
      <Grades {...props} />
    </>
  )
}
