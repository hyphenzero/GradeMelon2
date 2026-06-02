interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  className?: string
}

const sizeMap: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-7 w-7 border-[3px]',
  xl: 'h-10 w-10 border-4',
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-200 ${sizeMap[size]} ${className}`}
      aria-label="Loading"
      role="status"
    />
  )
}
