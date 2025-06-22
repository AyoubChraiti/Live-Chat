const Fastify = require('fastify')
const WebSocket = require('ws')
const http = require('http')

const fastify = Fastify()
const server = http.createServer(fastify.server) // Reuse same HTTP server

// Serve a simple health check route (optional)
fastify.get('/ping', async (request, reply) => {
  return { pong: true }
})

// Store connected users
const clients = new Map()

// Attach WebSocket server
const wss = new WebSocket.Server({ noServer: true, path: '/ws' })

wss.on('connection', (ws, request, user) => {
  clients.set(user, ws)
  console.log(`${user} connected`)

  ws.on('message', (msg) => {
    try {
      const { to, content } = JSON.parse(msg)
      const receiver = clients.get(to)
      if (receiver && receiver.readyState === WebSocket.OPEN) {
        receiver.send(JSON.stringify({ from: user, content }))
      }
    } catch (err) {
      console.error('Invalid message', err)
    }
  })

  ws.on('close', () => {
    clients.delete(user)
    console.log(`${user} disconnected`)
  })
})

// Handle protocol upgrade for WebSocket handshake
server.on('upgrade', (req, socket, head) => {
  const params = new URLSearchParams(req.url.split('?')[1])
  const user = params.get('user')


  if (!user) {
    socket.destroy()
    return
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req, user)
  })
})

// Start Fastify server
server.listen(3000, () => {
  console.log('🚀 Fastify WebSocket server listening on port 3000')
})
