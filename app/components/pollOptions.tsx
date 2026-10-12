'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { OptionResult, PollView, VoteResult } from '@/server/src/types'
import OptionPoll from './optionPoll'
import UpdateOptionButton from './updateOptionButton'

type Options = PollView['options']

const WS_URL = process.env.NEXT_PUBLIC_WS_URL

const sum = (options: { votes: number }[]) =>
	options.reduce((total, option) => total + option.votes, 0)

// Обновляем голоса, не трогая текст. Новый массив, без мутаций.
function mergeResults(options: Options, results: OptionResult[]): Options {
	const votes = new Map(results.map(result => [result.id, result.votes]))
	// Голоса только растут: устаревший снимок отбрасываем.
	if (sum(results) < sum(options)) return options
	return options.map(option => ({
		...option,
		votes: votes.get(option.id) ?? option.votes,
	}))
}

export default function PollOptions({ poll }: { poll: PollView }) {
	const router = useRouter()
	const [options, setOptions] = useState<Options>(poll.options)
	const [selectedIds, setSelectedIds] = useState<number[]>([])
	const [votedIds, setVotedIds] = useState<number[]>([])
	const [error, setError] = useState<string | null>(null)

	// WebSocket: получаем свежие результаты только по этому pollId
	useEffect(() => {
		if (!WS_URL) return

		let socket: WebSocket | null = null
		let timer: ReturnType<typeof setTimeout> | undefined
		let attempt = 0
		let disposed = false
		let wasClosed = false

		const connect = () => {
			const ws = new WebSocket(WS_URL)
			socket = ws

			ws.onopen = () => {
				attempt = 0
				ws.send(JSON.stringify({ type: 'subscribe', pollIds: [poll.id] }))
				// Пока связи не было, мы могли пропустить обновления: перечитываем с сервера.
				if (wasClosed) router.refresh()
			}

			ws.onmessage = event => {
				try {
					const data = JSON.parse(String(event.data)) as {
						type?: string
						pollId?: number
						options?: OptionResult[]
					}
					if (
						data.type === 'results' &&
						data.pollId === poll.id &&
						Array.isArray(data.options)
					) {
						const results = data.options
						setOptions(prev => mergeResults(prev, results))
					}
				} catch {
					// игнорируем некорректные сообщения
				}
			}

			ws.onerror = () => ws.close()

			ws.onclose = () => {
				if (disposed) return
				wasClosed = true
				const delay = Math.min(15_000, 500 * 2 ** attempt)
				attempt += 1
				timer = setTimeout(connect, delay)
			}
		}

		connect()

		return () => {
			disposed = true
			clearTimeout(timer)
			socket?.close()
		}
	}, [poll.id, router])

	// После router.refresh() приходят свежие данные с сервера
	useEffect(() => {
		setOptions(prev => mergeResults(prev, poll.options))
	}, [poll.options])

	const handleResult = (result: VoteResult) => {
		if (result.ok) {
			setOptions(prev => mergeResults(prev, result.options))
			setVotedIds(selectedIds)
			setSelectedIds([])
			setError(null)
		} else {
			setError(
				result.error === 'invalid_options'
					? 'Опрос изменился, обнови страницу'
					: 'Некорректный запрос'
			)
		}
	}

	const hasVoted = votedIds.length > 0
	const totalVotes = sum(options)

	return (
		<div>
			<div className='flex flex-col gap-2'>
				{options.map(option => (
					<OptionPoll
						key={option.id}
						id={option.id}
						text={option.text}
						votes={option.votes}
						percent={totalVotes === 0 ? 0 : (option.votes / totalVotes) * 100}
						locked={hasVoted}
						selectedIds={hasVoted ? votedIds : selectedIds}
						setSelectedIds={setSelectedIds}
					/>
				))}
			</div>

			{error && <p className='text-sm text-red-500 mt-2'>{error}</p>}

			<UpdateOptionButton
				optionIds={selectedIds}
				pollId={poll.id}
				locked={hasVoted}
				onResult={handleResult}
				onError={() => setError('Не удалось отправить голос, попробуй ещё раз')}
			/>
		</div>
	)
}
