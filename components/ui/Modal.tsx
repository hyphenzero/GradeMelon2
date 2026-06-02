import React from 'react'

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  show: boolean
  onClose?: () => void
  children: React.ReactNode
}

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function ModalRoot({ show, onClose, children, className = '', ...rest }: ModalProps) {
  if (!show) return null

  return (
    <div className="z-80 fixed inset-0 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/35 backdrop-blur-[1px]" onClick={onClose} />
      <div
        className={`relative w-full max-w-2xl rounded-3xl border border-zinc-200/80 bg-white/95 p-0 shadow-2xl shadow-zinc-950/10 dark:border-white/10 dark:bg-zinc-900/95 ${className}`}
        {...rest}
      >
        {children}
      </div>
    </div>
  )
}

function Header({ children, className = '', ...rest }: SectionProps) {
  return (
    <div
      className={`flex items-center justify-between border-b border-zinc-950/5 px-6 py-4 text-lg font-semibold text-zinc-900 dark:border-white/10 dark:text-zinc-100 ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

function Body({ children, className = '', ...rest }: SectionProps) {
  return (
    <div className={`px-6 py-4 text-zinc-700 dark:text-zinc-200 ${className}`} {...rest}>
      {children}
    </div>
  )
}

function Footer({ children, className = '', ...rest }: SectionProps) {
  return (
    <div className={`border-t border-zinc-950/5 px-6 py-4 dark:border-white/10 ${className}`} {...rest}>
      {children}
    </div>
  )
}

const Modal = Object.assign(ModalRoot, {
  Header,
  Body,
  Footer,
})

export default Modal
