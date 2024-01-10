import clsx from 'clsx'

export default function TransactionId({ className }: { className: string }) {
  return (
    <div className={clsx('text-xs md:text-sm font-normal font-inter leading-tight', className)}>
      <span className="text-slate-600">Transaction ID: </span>
      <span className="text-gray-900">OYL0nXU8UrQm9ekQB7vgXFuvM3LcVDsaSQfQ7-p7u7U</span>
    </div>
  )
}
