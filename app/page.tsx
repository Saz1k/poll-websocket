'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePollStore } from './store'

export default function Page() {
	const [options, setOptions] = useState([''])
	const [question, setQuestion] = useState('')
	const [description, setDesсription] = useState('')
	const router = useRouter()
	const poll = usePollStore(state => state)

	function handleChange(index : number, value : string){
		const newOptions = [...options]
		newOptions[index] = value

		if (value && index === options.length - 1) {
			newOptions.push('')
		}
		setOptions(newOptions)
	}
	function loggs(question:string,description:string,options:string[]){
		const cleanOptions = options.filter(e => e != '')
		poll.setPoll({question, description, options:cleanOptions})
		
	}
	return (
		<main className='bg-gray-400 text-gray-700 min-h-screen flex justify-center flex-col items-center gap-2'>
			<div className='rounded-3xl overflow-hidden'>
				<section className=' h-[90dvh] w-[80dvw] max-w-[400px] rounded-3xl bg-gray-100 flex flex-col items-center gap-2 py-2 px-4 overflow-y-auto '>
					<header className='w-full flex justify-between items-center bg-gray-100 relative'>
						<button className='w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center hover:bg-gray-200 active:scale-95 transition relative '>
							<div className='absolute w-0.5 h-4.5 bg-gray-500 rounded-lg rotate-45'></div>
							<div className='absolute w-0.5 h-4.5 bg-gray-500 rounded-lg -rotate-45'></div>
						</button>
						<p className='text-lg font-[500] font-black text-black absolute left-1/2 -translate-x-1/2'>
							New Poll
						</p>
						<button
							className='flex items-center justify-center py-2 px-4 font-medium rounded-3xl bg-green-300 text-gray-100 '
							onClick={() => loggs(question, description, options)}
						>
							Send
						</button>
					</header>

					<section className='flex justify-left flex-col w-full'>
						<div className='text-sm font-[600] text-gray-500 mx-4 my-2'>
							Question
						</div>

						<div className='w-full bg-white rounded-3xl p-4 flex flex-col gap-2'>
							<input
								type='text'
								className=' w-full h-12 bg-white text-black rounded-2xl border border-gray-300 focus:border-green-500
    focus:outline-none focus:border-2 caret-green-500 px-4 hover:border-green-500 text-gray-500 hover:text-green-500 transition-all duration-100'
								placeholder='Ask a Question'
								onChange={e => setQuestion(e.target.value)}
							/>
							<input
								type='text'
								className=' w-full h-12 bg-white text-black rounded-2xl border border-gray-300 focus:border-green-500
    focus:outline-none focus:border-2 caret-green-500 px-4 hover:border-green-500 text-gray-500 hover:text-green-500 transition-all duration-100'
								onChange={e => setDesсription(e.target.value)}
								placeholder='Description (optional)'
							/>
						</div>
					</section>

					<section className='flex justify-left flex-col w-full '>
						<div className='text-sm font-[600] text-gray-500 mx-4 my-2'>
							Options
						</div>
						<div className='w-full bg-white rounded-3xl pr-4 pl-2 py-4 flex flex-col gap-3'>
							{options.map((value, index) => (
								<div key={index} className='flex justify-center items-center '>
									{value === '' ? (
										<button className='w-8 h-8 rounded-full flex items-center justify-center mr-2 relative'>
											<div className='absolute w-0.5 h-4.5 bg-gray-500 rounded-lg'></div>
											<div className='absolute w-0.5 h-4.5 bg-gray-500 rounded-lg rotate-90'></div>
										</button>
									) : (
										<button
											className='w-8 h-8 rounded-full flex items-center justify-center mr-2 gap-[3px] rotate-90'
											id='drag'
										>
											<div className=' w-0.5 h-5 bg-gray-400 rounded-lg '></div>
											<div className=' w-0.5 h-5 bg-gray-400 rounded-lg '></div>
											<div className=' w-0.5 h-5 bg-gray-400 rounded-lg '></div>
										</button>
									)}
									<input
										type='text'
										className=' flex-1 h-12 bg-white text-black rounded-2xl  border border-gray-300 focus:border-green-500
    focus:outline-none focus:border-2 caret-green-500 px-4 hover:border-green-500 text-gray-600 transition-all duration-100'
										onChange={e => {
											handleChange(index, e.target.value)
										}}
										placeholder='Add an Option'
									/>
									{value && (
										<button
											className='shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-95 transition ml-2 relative '
											type='button'
											onClick={() => {
												const newOptions = options.filter((_, i) => i !== index)

												if (
													newOptions.length === 0 ||
													newOptions[newOptions.length - 1] !== ''
												) {
													newOptions.push('')
												}

												setOptions(newOptions)
											}}
										>
											<div className='absolute w-0.5 h-4.5 bg-gray-500 rounded-lg rotate-45'></div>
											<div className='absolute w-0.5 h-4.5 bg-gray-500 rounded-lg -rotate-45'></div>
										</button>
									)}
								</div>
							))}
						</div>
					</section>
					<div>
						<button 
						className='flex items-center justify-center py-2 px-4 font-medium rounded-3xl bg-green-300 text-gray-100 active:bg-green-400 active:scale-95'
						onClick={()=>router.push('/poll')}
						>
							Other Polls
						</button>
					</div>
				</section>
			</div>
		</main>
	)
}
