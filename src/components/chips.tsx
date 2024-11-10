interface Chip {
  name: string
}

export default function Chips({ chips }: { chips: Chip[] }) {
  return (
    <ul className="flex flex-row flex-wrap gap-2">
      {chips.map((chip) => (
        <li key={chip.name}>
          <span className="px-2.5 py-1 text-sm bg-white text-gray-800 rounded-full font-mono">
            {chip.name}
          </span>
        </li>
      ))}
    </ul>
  )
}
