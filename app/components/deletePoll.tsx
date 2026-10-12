'use client'
import { deletePoll } from "@/server/src"

type Props ={
    pollId:number
}
export default function DeletePollButton({pollId}:Props){
    const deleteAction = deletePoll.bind(null, pollId)
    return (
			<form action={deleteAction}>
				<button
					className='shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-95 transition ml-2 relative '
					type='submit'
				>
					<div className='absolute w-0.5 h-4.5 bg-gray-500 rounded-lg rotate-45'></div>
					<div className='absolute w-0.5 h-4.5 bg-gray-500 rounded-lg -rotate-45'></div>
				</button>
			</form>
		)
}