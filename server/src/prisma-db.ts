import { PrismaClient } from '@/app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import type { OptionResult } from './types'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient() {
	const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
	return new PrismaClient({ adapter })
}

const prisma = globalForPrisma.prisma ?? createClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function getPolls() {
	return prisma.polls.findMany({
		orderBy: { id: 'asc' },
		include: { options: { orderBy: { id: 'asc' } } },
	})
}

export async function addPolls(
	question: string,
	description: string | null,
	options: { text: string }[]
) {
	return prisma.polls.create({
		data: {
			question,
			description,
			options: { create: options.map(option => ({ text: option.text })) },
		},
	})
}

export async function deletePoll(pollId: number) {
	return prisma.polls.delete({ where: { id: pollId } })
}

export async function getPollResults(pollId: number): Promise<OptionResult[]> {
	return prisma.options.findMany({
		where: { poll_id: pollId },
		select: { id: true, votes: true },
		orderBy: { id: 'asc' },
	})
}

// Возвращает false, если какие-то варианты не принадлежат опросу.
export async function addVotes(
	pollId: number,
	optionIds: number[]
): Promise<boolean> {
	return prisma.$transaction(async tx => {
		const count = await tx.options.count({
			where: { poll_id: pollId, id: { in: optionIds } },
		})
		if (count !== optionIds.length) return false

		// Инкремент делает сама БД (votes = votes + 1), параллельные голоса не теряются.
		await tx.options.updateMany({
			where: { poll_id: pollId, id: { in: optionIds } },
			data: { votes: { increment: 1 } },
		})
		return true
	})
}
