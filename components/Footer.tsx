import { FaGithub } from 'react-icons/fa'

export default function Footer() {
  return (
    <div>
      <footer className="flex h-16 w-full items-center justify-between rounded-lg bg-white p-4 shadow md:p-6 dark:bg-gray-800">
        <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2024 Grade Melon™</span>
        <span className="text-sm text-white sm:text-center">
          <a target="blank" href="https://github.com/Jshap06/GradeMelon2/tree/APIVersion">
            <FaGithub size={'1.3rem'} />
          </a>
        </span>
      </footer>
    </div>
  )
}
