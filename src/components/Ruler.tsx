interface Props {
  direction: 'horizontal' | 'vertical'
}

const TICK_SPACING = 72 // 1 inch at 72 PPI
const TICK_COUNT = 60

export default function Ruler({ direction }: Props) {
  const isH = direction === 'horizontal'

  return (
    <div
      className={
        isH
          ? 'h-6 flex items-end bg-gray-800 border-b border-gray-700 pl-6 overflow-hidden'
          : 'w-6 flex flex-col items-end bg-gray-800 border-r border-gray-700 pt-0 overflow-hidden'
      }
    >
      {Array.from({ length: TICK_COUNT }, (_, i) => (
        <div
          key={i}
          className={
            isH
              ? 'flex-shrink-0 border-l border-gray-600 text-[9px] text-gray-500 pl-0.5 leading-none'
              : 'flex-shrink-0 border-t border-gray-600 text-[9px] text-gray-500 pt-0.5 pr-0.5 text-right leading-none'
          }
          style={isH ? { width: TICK_SPACING, height: '100%' } : { height: TICK_SPACING, width: '100%' }}
        >
          {i}
        </div>
      ))}
    </div>
  )
}
