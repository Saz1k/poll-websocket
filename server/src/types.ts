export type OptionResult = { id: number; votes: number }

export type PollView = {
	id: number
	question: string
	description: string | null
	options: { id: number; poll_id: number; text: string; votes: number }[]
}

export type VoteResult =
	| { ok: true; options: OptionResult[] }
	| { ok: false; error: 'invalid_input' | 'invalid_options' }
