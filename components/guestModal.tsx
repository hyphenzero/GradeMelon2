export default function GuestModal({ showModal, setShowModal }) {
  function closeModal() {
    localStorage.setItem('guestModal', 'true')
    setShowModal(false)
  }

  if (!showModal) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={closeModal} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-lg p-4">
            <p className="p-1 dark:text-white">Welcome to Guest Mode!</p>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="-mt-4 p-4">
            <div>
              <p className="text-md dark:text-white">
                In guest mode, you can manually input your scores and categories to help figure out your grade!
              </p>
            </div>

            <button
              onClick={closeModal}
              className="mt-5 w-full rounded-lg bg-zinc-700 p-1 text-white hover:bg-zinc-900 active:bg-zinc-800"
            >
              {"Great, let's go!"}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
