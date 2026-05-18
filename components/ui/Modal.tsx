import React from "react";

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  show: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function ModalRoot({ show, onClose, children, className = "", ...rest }: ModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/20" onClick={onClose} />
      <div className={`relative w-full max-w-2xl rounded-2xl bg-white p-0 shadow-xl dark:bg-zinc-900 ${className}`} {...rest}>
        {children}
      </div>
    </div>
  );
}

function Header({ children, className = "", ...rest }: SectionProps) {
  return (
    <div className={`flex items-center justify-between px-6 py-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100 ${className}`} {...rest}>
      {children}
    </div>
  );
}

function Body({ children, className = "", ...rest }: SectionProps) {
  return <div className={`px-6 py-4 text-zinc-700 dark:text-zinc-200 ${className}`} {...rest}>{children}</div>;
}

function Footer({ children, className = "", ...rest }: SectionProps) {
  return <div className={`px-6 py-4 ${className}`} {...rest}>{children}</div>;
}

const Modal = Object.assign(ModalRoot, {
  Header,
  Body,
  Footer,
});

export default Modal;
