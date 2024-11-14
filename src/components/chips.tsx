import classNames from 'classnames'

interface Chip {
  name: string
  colorClasses?: string
}

export default function Chips({ chips }: { chips: Chip[] }) {
  return (
    <ul className="flex flex-row flex-wrap gap-2">
      {chips.map((chip) => (
        <li key={chip.name}>
          <span
            className={classNames(
              'px-2.5 py-1 text-xs sm:text-sm rounded-full font-mono',
              chip.colorClasses || 'bg-white text-gray-800'
            )}
          >
            {chip.name}
          </span>
        </li>
      ))}
    </ul>
  )
}
