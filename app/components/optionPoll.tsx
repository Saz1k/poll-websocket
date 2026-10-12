'use client'

type Props = {
	id: number
	text: string
	votes: number
	percent: number
	locked: boolean
	selectedIds: number[]
	setSelectedIds: (ids: number[]) => void
}

export default function OptionPoll({
	id,
	text,
	votes,
	percent,
	locked,
	selectedIds,
	setSelectedIds,
}: Props) {
	const isActive = selectedIds.includes(id)

	return (
		<button
			type='button'
			disabled={locked}
			aria-pressed={isActive}
			className={`relative w-full h-12 overflow-hidden rounded-2xl border text-left px-4 flex justify-between items-center transition-colors ${
				isActive ? 'border-green-500' : 'border-gray-300'
			} ${locked ? 'cursor-default' : 'cursor-pointer'}`}
			onClick={() => {
				if (isActive) {
					setSelectedIds(selectedIds.filter(selectedId => selectedId !== id))
				} else {
					setSelectedIds([...selectedIds, id])
				}
			}}
		>
			{/* Полоса: ширина = процент, плавно как в Telegram */}
			<div
				aria-hidden
				className={`absolute inset-y-0 left-0 transition-[width] duration-500 ease-out ${
					isActive ? 'bg-green-200' : 'bg-gray-200'
				}`}
				style={{ width: `${percent}%` }}
			/>

			<span className='relative z-10 truncate'>{text}</span>

			<div className='relative z-10 flex items-center gap-2 shrink-0 pl-2'>
				<span className='text-xs text-gray-500'>{votes}</span>
				<span className='w-10 text-right text-sm font-semibold tabular-nums'>
					{Math.round(percent)}%
				</span>
				<div
					className={`w-5 h-5 rounded-xl border-2 transition ${
						isActive ? 'bg-green-500 border-green-500' : 'border-gray-300'
					}`}
				/>
			</div>
		</button>
	)
}
