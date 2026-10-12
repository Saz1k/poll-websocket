import { createServer } from 'node:http'
import { WebSocket, WebSocketServer } from 'ws'

const PORT = Number(process.env.PORT ?? 3001)
const SECRET = process.env.WS_SECRET

if (!SECRET) throw new Error('WS_SECRET is required')

type OptionResult = { id: number; votes: number }

// pollId -> сокеты, которые смотрят этот опрос
const subscribers = new Map<number, Set<WebSocket>>()
const socketPolls = new Map<WebSocket, Set<number>>()

function removeSocket(ws: WebSocket) {
	for (const pollId of socketPolls.get(ws) ?? []) {
		const sockets = subscribers.get(pollId)
		sockets?.delete(ws)
		if (sockets?.size === 0) subscribers.delete(pollId)
	}
	socketPolls.delete(ws)
}

function subscribe(ws: WebSocket, pollIds: number[]) {
	removeSocket(ws)
	for (const pollId of pollIds) {
		const sockets = subscribers.get(pollId) ?? new Set<WebSocket>()
		sockets.add(ws)
		subscribers.set(pollId, sockets)
	}
	socketPolls.set(ws, new Set(pollIds))
}

function broadcast(pollId: number, options: OptionResult[]) {
	const payload = JSON.stringify({ type: 'results', pollId, options })
	for (const ws of subscribers.get(pollId) ?? []) {
		if (ws.readyState === WebSocket.OPEN) ws.send(payload)
	}
}

function isOptions(value: unknown): value is OptionResult[] {
	return (
		Array.isArray(value) &&
		value.every(
			item =>
				typeof item === 'object' &&
				item !== null &&
				typeof (item as OptionResult).id === 'number' &&
				typeof (item as OptionResult).votes === 'number'
		)
	)
}

const server = createServer((req, res) => {
	// Публикация результатов: только сервер Next.js, который знает секрет.
	if (req.method === 'POST' && req.url === '/publish') {
		if (req.headers['x-secret'] !== SECRET) {
			res.writeHead(401).end()
			return
		}

		let body = ''
		req.on('data', chunk => {
			body += chunk
			if (body.length > 100_000) req.destroy()
		})
		req.on('end', () => {
			try {
				const data: unknown = JSON.parse(body)
				const { pollId, options } = data as {
					pollId: unknown
					options: unknown
				}
				if (typeof pollId !== 'number' || !isOptions(options)) {
					res.writeHead(400).end()
					return
				}
				broadcast(pollId, options)
				res.writeHead(200).end('ok')
			} catch {
				res.writeHead(400).end()
			}
		})
		return
	}

	res.writeHead(404).end()
})

const wss = new WebSocketServer({ server, maxPayload: 8 * 1024 })

wss.on('connection', ws => {
	console.log('Client connected')

	ws.on('message', data => {
		// Клиент может только подписаться на опросы. Результаты от клиента не принимаются.
		try {
			const message = JSON.parse(data.toString()) as {
				type?: unknown
				pollIds?: unknown
			}
			if (message.type !== 'subscribe' || !Array.isArray(message.pollIds))
				return
			const ids = message.pollIds.filter(
				(id): id is number => Number.isInteger(id) && id > 0
			)
			subscribe(ws, ids.slice(0, 100))
		} catch {
			// игнорируем мусор
		}
	})

	ws.on('close', () => {
		removeSocket(ws)
		console.log('Client disconnected')
	})
	ws.on('error', error => console.error('socket error:', error))
})

server.listen(PORT, () => {
	console.log(`WebSocket server started on port ${PORT}`)
})
