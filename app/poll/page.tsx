'use client'
import { useRouter } from 'next/navigation'
import { usePollStore } from "../store"

export default function Poll() {
    const router = useRouter()
    const poll = usePollStore()
	

	return (
		<main className='bg-gray-400 text-gray-700 min-h-screen flex justify-center py-8'>
			<section className='w-[80dvw] max-w-[400px] rounded-3xl bg-gray-100 p-4 flex flex-col gap-4'>
				<header className='flex justify-center'>
					<p className='text-lg font-black text-black'>Polls</p>
				</header>
					<div
						className='w-full bg-white rounded-3xl p-4 flex flex-col gap-3'
					>
						<div>
							<h2 className='text-lg font-semibold text-black'>
								{poll.question}
							</h2>

							{poll.description && (
								<p className='text-sm text-gray-500 mt-1'>{poll.description}</p>
							)}
						</div>

						<div className='flex flex-col gap-2'>
							{poll.options.map((option, index) => (
								<button
									key={index}
									className='w-full h-12 rounded-2xl border border-gray-300 text-left px-4 hover:border-green-500 hover:text-green-500 transition'
								>
									{option}
								</button>
							))}
						</div>
					</div>
			
				<button
					className='flex items-center justify-center py-2 px-4 font-medium rounded-3xl bg-green-300 text-gray-100 active:bg-green-400 active:scale-95'
					onClick={() => router.push('/')}
				>
					Create Poll
				</button>
			</section>
		</main>
	)
}
