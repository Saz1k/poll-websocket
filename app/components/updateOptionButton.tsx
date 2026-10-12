'use client'

import { useState } from 'react'
import { voteOptions } from '@/server/src'
import type { VoteResult } from '@/server/src/types'

export default function UpdateOptionButton(props: {
	optionIds: number[]
	pollId: number
	locked: boolean
	onResult: (result: VoteResult) => void
	onError: () => void
}) {
	const [pending, setPending] = useState(false)
	const disabled = props.locked || pending || props.optionIds.length === 0

	return (
		<button
			disabled={disabled}
			className={
				disabled
					? ' my-2 font-semibold m-auto py-2 w-full rounded-3xl cursor-not-allowed disabled:opacity-50 text-green-200'
					: ' my-2 font-semibold m-auto py-2 w-full rounded-3xl cursor-pointer text-green-500 hover:bg-green-100'
			}
			onClick={async () => {
				setPending(true)
				try {
					props.onResult(await voteOptions(props.optionIds, props.pollId))
				} catch {
					props.onError()
				} finally {
					setPending(false)
				}
			}}
		>
			{props.locked
				? 'Voted'
				: pending
				? 'Sending…'
				: `Vote (${props.optionIds.length})`}
		</button>
	)
}
