import { AnimatePresence, motion } from 'framer-motion'
import { IconType } from 'react-icons'
import { FiCheck, FiLoader, FiX } from 'react-icons/fi'

type Props = {
  status: 'neutral' | 'loading' | 'error' | 'success'
  onClick: () => void
  children: React.ReactNode
}
const ButtonWithLoadAndError = ({ status: variant, onClick, children }: Props) => {
  const classNames =
    variant === 'neutral'
      ? 'bg-primary-600 text-white hover:bg-primary-500 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)] active:bg-primary-700 active:shadow-[0px_2px_6px_0px_rgba(0,0,0,0.05)]'
      : variant === 'error'
      ? 'bg-red-500'
      : variant === 'success'
      ? 'bg-green-500'
      : 'bg-primary-400 pointer-events-none'

  return (
    <motion.button
      disabled={variant !== 'neutral'}
      onClick={onClick}
      className={`relative rounded-md px-4 py-2 font-medium text-white transition-all ${classNames}`}
    >
      <motion.span
        animate={{
          y: variant === 'neutral' ? 0 : 6,
          opacity: variant === 'neutral' ? 1 : 0
        }}
        className="inline-block"
      >
        {children}
      </motion.span>
      <IconOverlay Icon={FiLoader} visible={variant === 'loading'} spin />
      <IconOverlay Icon={FiX} visible={variant === 'error'} />
      <IconOverlay Icon={FiCheck} visible={variant === 'success'} />
    </motion.button>
  )
}

const IconOverlay = ({ Icon, visible, spin = false }: { Icon: IconType; visible: boolean; spin?: boolean }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{
            y: -12,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          exit={{
            y: 12,
            opacity: 0
          }}
          className="absolute inset-0 grid place-content-center"
        >
          <Icon className={`text-xl duration-300 ${spin && 'animate-spin'}`} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ButtonWithLoadAndError
