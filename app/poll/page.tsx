import { getPolls } from '@/server/src/prisma-db'
import DeletePollButton from '../components/deletePoll'
import PollOptions from '../components/pollOptions'

export const dynamic = 'force-dynamic'

export default async function PollPage() {
	const polls = await getPolls()

	return (
		<main className='bg-gray-400 text-gray-700 min-h-screen flex justify-center py-8'>
			<section className='w-[80dvw] max-w-[400px] rounded-3xl bg-gray-100 p-4 flex flex-col gap-4'>
				<header className='flex justify-center'>
					<p className='text-lg font-black text-black'>Polls</p>
				</header>

				{polls.map(poll => (
					<div
						className='w-full bg-white rounded-3xl p-4 flex flex-col gap-3'
						key={poll.id}
					>
						<div>
							<div className='flex justify-between'>
								<h2 className='text-lg font-semibold text-black'>
									{poll.question}
								</h2>
								<DeletePollButton pollId={poll.id} />
							</div>

							{poll.description && (
								<p className='text-sm text-gray-500 mt-1'>{poll.description}</p>
							)}
						</div>

						<PollOptions poll={poll} />
					</div>
				))}

				<button className='flex items-center justify-center py-2 px-4 font-medium rounded-3xl bg-green-300 text-gray-100 active:bg-green-400 active:scale-95'>
					Create Poll
				</button>
			</section>
		</main>
	)
}
