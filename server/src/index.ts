'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
	addPolls,
	addVotes,
	deletePoll as dbDeletePoll,
	getPollResults,
} from './prisma-db'
import type { OptionResult, VoteResult } from './types'

const idSchema = z.number().int().positive()

const voteSchema = z.object({
	pollId: idSchema,
	optionIds: z.array(idSchema).min(1).max(50),
})

const createPollSchema = z.object({
	question: z.string().trim().min(1).max(300),
	description: z.string().trim().max(1000).nullable(),
	options: z
		.array(z.object({ text: z.string().trim().min(1).max(200) }))
		.min(2)
		.max(20),
})

// Отправляем свежие данные из БД на WS-сервер. Секрет знает только сервер.
async function publishResults(pollId: number, options: OptionResult[]) {
	const url = process.env.WS_PUBLISH_URL
	if (!url) return
	try {
		await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-secret': process.env.WS_SECRET ?? '',
			},
			body: JSON.stringify({ pollId, options }),
			signal: AbortSignal.timeout(2000),
		})
	} catch (error) {
		// Голос уже сохранён, поэтому падение WS не должно ломать голосование.
		console.error('publish failed:', error)
	}
}

export async function createPoll(
	question: string,
	description: string | null,
	options: { text: string }[]
) {
	const parsed = createPollSchema.safeParse({ question, description, options })
	if (!parsed.success) throw new Error('Invalid poll data')

	const poll = await addPolls(
		parsed.data.question,
		parsed.data.description,
		parsed.data.options
	)
	revalidatePath('/poll')
	return { id: poll.id }
}

export async function deletePoll(pollId: number) {
	const parsed = idSchema.safeParse(pollId)
	if (!parsed.success) throw new Error('Invalid poll id')

	await dbDeletePoll(parsed.data)
	revalidatePath('/poll')
}

export async function voteOptions(
	optionIds: number[],
	pollId: number
): Promise<VoteResult> {
	const parsed = voteSchema.safeParse({ pollId, optionIds })
	if (!parsed.success) return { ok: false, error: 'invalid_input' }

	const ids = [...new Set(parsed.data.optionIds)]

	// 1. Сначала сохраняем в БД
	const saved = await addVotes(parsed.data.pollId, ids)
	if (!saved) return { ok: false, error: 'invalid_options' }

	// 2. Читаем актуальные результаты из БД
	const options = await getPollResults(parsed.data.pollId)

	// 3. Только потом рассылаем всем
	await publishResults(parsed.data.pollId, options)

	return { ok: true, options }
}
